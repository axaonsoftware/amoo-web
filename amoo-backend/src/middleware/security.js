const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const env = require("../config/env");

// CORS — restrict to configured client origins. "*" only if explicitly set.
const corsOptions = {
  origin(origin, cb) {
    // Allow non-browser clients / same-origin requests (no Origin header)
    if (!origin) return cb(null, true);
    if (env.clientOrigin.includes("*") || env.clientOrigin.includes(origin)) return cb(null, true);
    return cb(new Error("CORS origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

const helmetConfig = helmet({
  contentSecurityPolicy: false, // static uploads / Next.js frontend handles CSP
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow /uploads to be embedded
});

const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." },
});

// Stricter limit for auth/security-sensitive endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many attempts, please try again later." },
});

module.exports = { corsOptions, helmetConfig, limiter, authLimiter };
