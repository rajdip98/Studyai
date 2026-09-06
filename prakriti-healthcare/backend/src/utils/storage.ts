import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env";
import { logger } from "../config/logger";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const STORAGE_BUCKET = "site-assets";

/**
 * Detects the real image format from its magic bytes rather than trusting
 * the client-supplied filename or Content-Type — both are attacker
 * controlled and a classic way to smuggle an executable past an extension
 * allowlist (e.g. a ".php" file relabeled "image/png"). Only formats
 * detected here are ever accepted or written to Supabase Storage/disk.
 */
const MAGIC_BYTE_CHECKS: Array<{ ext: string; mime: string; check: (buf: Buffer) => boolean }> = [
  {
    ext: "png",
    mime: "image/png",
    check: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    ext: "jpg",
    mime: "image/jpeg",
    check: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "webp",
    mime: "image/webp",
    check: (b) => b.length > 12 && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
];

export function detectImageType(buffer: Buffer): { ext: string; mime: string } | null {
  for (const candidate of MAGIC_BYTE_CHECKS) {
    if (candidate.check(buffer)) return { ext: candidate.ext, mime: candidate.mime };
  }
  return null;
}

export interface UploadResult {
  url: string;
  key: string;
}

function supabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Uploads via Supabase Storage's REST API using the service_role key, which
 * bypasses Row Level Security by design — appropriate here because this
 * endpoint is already gated by our own admin auth, CSRF, and magic-byte
 * validation before a single byte reaches this function. Plain `fetch` is
 * used deliberately instead of the @supabase/supabase-js SDK to avoid
 * pulling in another dependency with its own module-format surprises (see
 * the sanitize-html/htmlparser2 ESM incident this project already hit).
 */
async function uploadToSupabase(filename: string, buffer: Buffer, mime: string): Promise<UploadResult> {
  const key = filename;
  const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
      "Content-Type": mime,
      "x-upsert": "false",
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, text }, "Supabase Storage upload failed");
    throw new Error("Storage upload failed");
  }

  // The bucket is public (created with public: true — see the migration
  // notes in docs/DEPLOYMENT.md), so this URL is fetchable with no auth.
  const url = `${env.SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${key}`;
  return { url, key };
}

async function deleteFromSupabase(key: string): Promise<void> {
  const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${key}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
    },
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    logger.error({ status: res.status, text }, "Supabase Storage delete failed");
  }
}

/**
 * Persists an already-validated image buffer and returns its public URL.
 * Uses Supabase Storage (+ optional CDN in front of it) when configured;
 * otherwise falls back to local disk, served statically by Express (see
 * app.ts) — suitable for local development only, since container
 * filesystems are ephemeral in production (see docs/DEPLOYMENT.md).
 */
export async function saveUpload(buffer: Buffer, ext: string, mime: string): Promise<UploadResult> {
  const filename = `${randomUUID()}.${ext}`;

  if (supabaseConfigured()) {
    return uploadToSupabase(filename, buffer, mime);
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  // `filename` is always a server-generated randomUUID + a magic-byte-derived
  // extension (see detectImageType above) — never derived from client input —
  // so this path cannot be used for traversal.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return { url: `/uploads/${filename}`, key: filename };
}

export async function deleteUpload(key: string): Promise<void> {
  if (supabaseConfigured()) {
    await deleteFromSupabase(key);
    return;
  }
  await fs.rm(path.join(UPLOAD_DIR, path.basename(key)), { force: true });
}

export { UPLOAD_DIR };
