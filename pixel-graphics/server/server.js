'use strict';
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const { JsonFileStore } = require('./lib/store');
const {
  SESSION_COOKIE,
  createSessionToken,
  cookieOptions,
  requireAdmin,
  ensureCsrfCookie,
  requireCsrf,
  checkRateLimit
} = require('./lib/auth');

const SITE_ROOT = path.join(__dirname, '..');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const adminStore = new JsonFileStore(path.join(__dirname, 'data', 'admin.json'), {
  passwordHash: null,
  updatedAt: null
});
const portfolioStore = new JsonFileStore(path.join(__dirname, 'data', 'portfolio.json'), []);

const CATEGORIES = ['banners', 'cards', 'merch', 'vinyl', 'other'];

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'application/postscript': '.eps',
  'image/vnd.adobe.photoshop': '.psd',
  'application/x-photoshop': '.psd',
  'application/illustrator': '.ai',
  'application/zip': '.zip'
};
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname).slice(0, 10);
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
    }
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      return cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  }
});

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

app.get('/api/csrf-token', (req, res) => {
  const token = ensureCsrfCookie(req, res);
  res.json({ token });
});

app.get('/api/portfolio', async (req, res) => {
  const items = await portfolioStore.read();
  res.json({ items: [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

// -----------------------------------------------------------------------
// Admin auth
// -----------------------------------------------------------------------

app.post('/api/admin/login', requireCsrf, async (req, res) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ success: false, message: 'Too many attempts. Try again later.' });
  }

  const { password } = req.body || {};
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  const admin = await adminStore.read();
  const ok = admin.passwordHash && bcrypt.compareSync(password, admin.passwordHash);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Incorrect password.' });
  }

  res.cookie(SESSION_COOKIE, createSessionToken(), cookieOptions(req));
  res.json({ success: true });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ success: true });
});

app.get('/api/admin/session', requireAdmin, (req, res) => {
  res.json({ success: true });
});

app.post('/api/admin/change-password', requireAdmin, requireCsrf, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
  }

  const admin = await adminStore.read();
  if (!admin.passwordHash || !bcrypt.compareSync(currentPassword, admin.passwordHash)) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  await adminStore.update(() => ({
    passwordHash: bcrypt.hashSync(newPassword, 12),
    updatedAt: new Date().toISOString()
  }));

  res.json({ success: true, message: 'Password updated.' });
});

// -----------------------------------------------------------------------
// Admin portfolio management
// -----------------------------------------------------------------------

app.post('/api/admin/portfolio', requireAdmin, requireCsrf, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const title = (req.body.title || '').toString().trim().slice(0, 120) || req.file.originalname;
    const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'other';
    const description = (req.body.description || '').toString().trim().slice(0, 500);

    const item = {
      id: crypto.randomUUID(),
      title,
      category,
      description,
      fileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      isImage: req.file.mimetype.startsWith('image/'),
      size: req.file.size,
      createdAt: new Date().toISOString()
    };

    const items = await portfolioStore.update((current) => [...current, item]);
    res.json({ success: true, item, count: items.length });
  });
});

app.delete('/api/admin/portfolio/:id', requireAdmin, requireCsrf, async (req, res) => {
  let removed = null;
  await portfolioStore.update((current) => {
    removed = current.find((i) => i.id === req.params.id) || null;
    return current.filter((i) => i.id !== req.params.id);
  });

  if (!removed) {
    return res.status(404).json({ success: false, message: 'Item not found.' });
  }

  fs.unlink(path.join(UPLOAD_DIR, removed.storedFileName), () => {});
  res.json({ success: true });
});

// -----------------------------------------------------------------------
// Static site
// -----------------------------------------------------------------------

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));
app.use('/docs', express.static(path.join(SITE_ROOT, 'docs')));

// The server's own code/data lives inside SITE_ROOT (pixel-graphics/server/) —
// never let the static site handler below reach it (admin.json holds the
// password hash, .session-secret signs sessions).
app.use('/server', (req, res) => res.status(404).end());

app.use(express.static(SITE_ROOT, { extensions: ['html'] }));

app.use((req, res) => {
  res.status(404).sendFile(path.join(SITE_ROOT, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pixel Graphics server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});
