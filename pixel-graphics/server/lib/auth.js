'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SECRET_PATH = path.join(__dirname, '..', 'data', '.session-secret');
const SESSION_COOKIE = 'admin_session';
const CSRF_COOKIE = 'csrf_token';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function loadOrCreateSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  try {
    return fs.readFileSync(SECRET_PATH, 'utf8').trim();
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    const secret = crypto.randomBytes(32).toString('hex');
    fs.mkdirSync(path.dirname(SECRET_PATH), { recursive: true });
    fs.writeFileSync(SECRET_PATH, secret, { mode: 0o600 });
    return secret;
  }
}

const SECRET = loadOrCreateSecret();

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('base64url');
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// --- Session cookie: stateless, signed, self-expiring -----------------------

function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString(
    'base64url'
  );
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  if (!timingSafeEqual(sign(payload), signature)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}

function cookieOptions(req) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.protocol === 'https' || req.get('x-forwarded-proto') === 'https',
    maxAge: SESSION_TTL_MS,
    path: '/'
  };
}

function requireAdmin(req, res, next) {
  const token = req.cookies && req.cookies[SESSION_COOKIE];
  if (!verifySessionToken(token)) {
    return res.status(401).json({ success: false, message: 'Not signed in.' });
  }
  next();
}

// --- CSRF: double-submit cookie ---------------------------------------------

function ensureCsrfCookie(req, res) {
  let token = req.cookies && req.cookies[CSRF_COOKIE];
  if (!token) {
    token = crypto.randomBytes(24).toString('base64url');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: req.protocol === 'https' || req.get('x-forwarded-proto') === 'https',
      path: '/'
    });
  }
  return token;
}

function requireCsrf(req, res, next) {
  const cookieToken = req.cookies && req.cookies[CSRF_COOKIE];
  const headerToken = req.get('x-csrf-token');
  if (!cookieToken || !headerToken || !timingSafeEqual(cookieToken, headerToken)) {
    return res.status(403).json({ success: false, message: 'Invalid or missing CSRF token.' });
  }
  next();
}

// --- Simple in-memory login rate limiter ------------------------------------

const attempts = new Map(); // ip -> { count, resetAt }
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}

module.exports = {
  SESSION_COOKIE,
  CSRF_COOKIE,
  createSessionToken,
  verifySessionToken,
  cookieOptions,
  requireAdmin,
  ensureCsrfCookie,
  requireCsrf,
  checkRateLimit
};
