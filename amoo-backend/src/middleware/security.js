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
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  // The frontend reads the current CSRF token off the response; document.cookie
  // can't see a cookie set by this (different) origin.
  exposedHeaders: ["X-CSRF-Token", "X-Request-Id"],
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
  windowMs: env.rateLimit.authWindowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many attempts, please try again later." },
});

// Registration is its own target: prevents account/email spam & enumeration floods.
const registerLimiter = rateLimit({
  windowMs: env.rateLimit.registerWindowMs, // 1 hour by default
  max: env.rateLimit.registerMax, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many registrations from this address, please try later." },
});

// Stricter limit for chat message sending via HTTP fallback (should be rare;
// most messages flow through WebSocket which has its own rate limiter).
const chatLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 30, // 30 messages per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many messages, please slow down." },
});

module.exports = { corsOptions, helmetConfig, limiter, authLimiter, registerLimiter, chatLimiter };
