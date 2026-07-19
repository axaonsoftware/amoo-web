const multer = require("multer");
const path = require("path");
const env = require("../config/env");
const { HttpError } = require("../utils/helpers");

// Memory storage: file buffer is available for both local disk and S3 writes.
const storage = multer.memoryStorage();

const ALLOWED = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
const fileFilter = (req, file, cb) => {
  const ok = ALLOWED.test(file.mimetype) || ALLOWED.test(path.extname(file.originalname).toLowerCase());
  if (ok) cb(null, true);
  else cb(new HttpError(400, "Unsupported file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSize },
});

const uploadDir = path.join(__dirname, "..", "..", "uploads");

module.exports = { upload, uploadDir };
