const multer = require("multer");
const path = require("path");
const env = require("../config/env");
const { HttpError } = require("../utils/helpers");

// Memory storage: file buffer is available for both local disk and S3 writes.
const storage = multer.memoryStorage();

// Exact MIME types, mapped to the extensions each may legitimately carry.
//
// The previous filter was `ALLOWED.test(mimetype) || ALLOWED.test(extension)`
// against /jpeg|jpg|png|gif|webp|pdf|doc|docx/. Two problems:
//   1. OR — either half alone was enough, so `evil.exe` with a spoofed
//      `image/png` header passed, as did any file merely *named* `.pdf`.
//   2. Substring matching — the pattern is unanchored, so `application/
//      x-doc-evil` matched on "doc", and `text/jpeg-ish` matched on "jpeg".
// Both halves must now agree, and both are exact-matched.
const ALLOWED_TYPES = new Map([
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["image/gif", [".gif"]],
  ["image/webp", [".webp"]],
  ["application/pdf", [".pdf"]],
  ["application/msword", [".doc"]],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", [".docx"]],
]);

const fileFilter = (req, file, cb) => {
  const mime = String(file.mimetype || "").toLowerCase().split(";")[0].trim();
  const ext = path.extname(file.originalname || "").toLowerCase();

  const allowedExts = ALLOWED_TYPES.get(mime);
  if (!allowedExts) {
    return cb(new HttpError(400, `Unsupported file type: ${mime || "unknown"}`), false);
  }
  // The declared MIME type is client-controlled, so it is not proof of content;
  // requiring the extension to agree removes the easiest spoof and keeps the
  // name we store consistent with what we claim the bytes are.
  if (!allowedExts.includes(ext)) {
    return cb(
      new HttpError(400, `File extension "${ext || "(none)"}" does not match its type ${mime}`),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  // `files: 1` stops a caller from streaming many files into memory on a route
  // that only ever reads req.file.
  limits: { fileSize: env.maxFileSize, files: 1 },
});

const uploadDir = path.join(__dirname, "..", "..", "uploads");

module.exports = { upload, uploadDir, ALLOWED_TYPES };
