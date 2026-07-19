const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("../config/env");
const { HttpError } = require("../utils/helpers");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, unique + ext);
  },
});

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

module.exports = { upload, uploadDir };
