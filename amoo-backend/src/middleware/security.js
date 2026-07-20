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
  contentSecurityPolicy: false, // JSON API; the Next.js frontend sets its own CSP
  crossOriginResourcePolicy: { policy: "same-origin" }, // no public uploads to embed
  referrerPolicy: { policy: "no-referrer" },
  hsts: env.isProd
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false, // only enable HSTS in production
  // Keep the default X-Content-Type-Options: nosniff (anti-MIME-sniffing).
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

// Registration is its own target: prevents account/email spam & enumeration floods.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many registrations from this address, please try later." },
});

module.exports = { corsOptions, helmetConfig, limiter, authLimiter, registerLimiter };
