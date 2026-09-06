import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Detects the real image format from its magic bytes rather than trusting
 * the client-supplied filename or Content-Type — both are attacker
 * controlled and a classic way to smuggle an executable past an extension
 * allowlist (e.g. a ".php" file relabeled "image/png"). Only formats
 * detected here are ever accepted or written to disk/S3.
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

let s3Client: S3Client | null = null;
function getS3Client(): S3Client | null {
  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) return null;
  if (!s3Client) {
    s3Client = new S3Client({
      region: env.S3_REGION ?? "ap-south-1",
      endpoint: env.S3_ENDPOINT || undefined,
      credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
    });
  }
  return s3Client;
}

/**
 * Persists an already-validated image buffer and returns its public URL.
 * Uses S3 (+ CDN) when configured; otherwise falls back to local disk,
 * served statically by Express (see app.ts) — suitable for local
 * development only, since container filesystems are ephemeral in
 * production (see docs/DEPLOYMENT.md).
 */
export async function saveUpload(buffer: Buffer, ext: string, mime: string): Promise<UploadResult> {
  const filename = `${randomUUID()}.${ext}`;
  const s3 = getS3Client();

  if (s3) {
    const key = `uploads/${filename}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mime,
      }),
    );
    const base = env.CDN_BASE_URL || `${env.S3_ENDPOINT ?? ""}/${env.S3_BUCKET}`;
    return { url: `${base}/${key}`, key };
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
  const s3 = getS3Client();
  if (s3) {
    const fullKey = key.startsWith("uploads/") ? key : `uploads/${key}`;
    await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: fullKey }));
    return;
  }
  await fs.rm(path.join(UPLOAD_DIR, path.basename(key)), { force: true });
}

export { UPLOAD_DIR };
