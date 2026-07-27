// Unified file storage: local disk (default) or S3-compatible (when configured).
// Uploads route uses `saveFile(buffer, filename, mimetype)` and `deleteFile(key)`.
const fs = require("fs").promises;
const path = require("path");
const env = require("./env");

const localDir = path.join(__dirname, "..", "..", "uploads");

async function saveLocal(buffer, filename, mimetype) {
  await fs.mkdir(localDir, { recursive: true });
  const filePath = path.join(localDir, filename);
  await fs.writeFile(filePath, buffer);
  return { key: filename, url: `/uploads/${filename}`, provider: "local" };
}

async function deleteLocal(key) {
  const filePath = path.join(localDir, path.basename(key));
  try { await fs.unlink(filePath); } catch (e) { if (e.code !== "ENOENT") throw e; }
}

// Lazy S3 client (only required when storage is enabled).
let s3 = null;
function getS3() {
  if (s3) return s3;
  if (!env.storage.enabled) return null;
  // eslint-disable-next-line global-require
  const { S3Client } = require("@aws-sdk/client-s3");
  s3 = new S3Client({
    region: env.storage.region,
    endpoint: env.storage.endpoint || undefined,
    credentials: { accessKeyId: env.storage.accessKey, secretAccessKey: env.storage.secretKey },
    forcePathStyle: !!env.storage.endpoint, // needed for MinIO / S3-compatible
  });
  return s3;
}

async function saveS3(buffer, filename, mimetype) {
  // eslint-disable-next-line global-require
  const { PutObjectCommand } = require("@aws-sdk/client-s3");
  const Key = `uploads/${filename}`;
  await getS3().send(
    new PutObjectCommand({ Bucket: env.storage.bucket, Key, Body: buffer, ContentType: mimetype })
  );
  const base = env.storage.publicBase || `https://${env.storage.bucket}.s3.${env.storage.region}.amazonaws.com`;
  return { key: Key, url: `${base.replace(/\/$/, "")}/${Key}`, provider: "s3" };
}

async function deleteS3(key) {
  // eslint-disable-next-line global-require
  const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
  await getS3().send(new DeleteObjectCommand({ Bucket: env.storage.bucket, Key: key }));
}

async function saveFile(buffer, filename, mimetype) {
  return env.storage.enabled ? saveS3(buffer, filename, mimetype) : saveLocal(buffer, filename, mimetype);
}

async function deleteFile(key) {
  if (!key) return;
  return env.storage.enabled ? deleteS3(key) : deleteLocal(key);
}

module.exports = { saveFile, deleteFile, localDir };
