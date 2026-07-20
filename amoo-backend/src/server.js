const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const { testConnection } = require("./config/db");
const env = require("./config/env");
const logger = require("./utils/logger");
const { helmetConfig, corsOptions, limiter, authLimiter, registerLimiter } = require("./middleware/security");
const { HttpError } = require("./utils/helpers");
const { fail } = require("./utils/response");
const { withAudit, authRequired } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const expertRoutes = require("./routes/experts");
const serviceRoutes = require("./routes/services");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");
const slotRoutes = require("./routes/slots");
const reportRoutes = require("./routes/reports");
const packageRoutes = require("./routes/packages");
const testimonialRoutes = require("./routes/testimonials");
const dashboardRoutes = require("./routes/dashboard");
const walletRoutes = require("./routes/wallet");
const subscriptionRoutes = require("./routes/subscriptions");
const notificationRoutes = require("./routes/notifications");
const contactRoutes = require("./routes/contact");
const uploadRoutes = require("./routes/uploads");
const chatRoutes = require("./routes/chat");
const couponRoutes = require("./routes/coupons");
const auditRoutes = require("./routes/audit");

const app = express();
const PORT = env.port;

// Trust the first upstream proxy when behind a reverse proxy (Railway, Nginx, Cloudflare).
// Required for rate-limiting + IP logging to use the real client IP.
app.set("trust proxy", env.isProd ? 1 : 0);

// --- Core middleware ---
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
// Capture the raw body for the payment webhook so signature HMAC is reliable.
app.use("/api/payments/webhook", express.json({
  limit: "1mb",
  verify: (req, res, buf) => { req.rawBody = buf.toString("utf8"); },
}));
app.use(cookieParser());

// Request correlation id (traced in logs / errors)
app.use((req, res, next) => {
  req.id = require("crypto").randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// Request logging (skip in test)
if (env.nodeEnv !== "test") {
  app.use(morgan(env.isProd ? "combined" : "dev", {
    skip: (req) => req.path === "/api/health",
  }));
}

// Rate limiters (skipped in test mode to avoid false test failures)
if (env.nodeEnv !== "test") {
  app.use("/api", limiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/admin/login", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
  app.use("/api/auth/register", registerLimiter);
}

// NOTE: uploaded files are NO LONGER served statically. They are accessed
// only via the authenticated /api/uploads/:id/download route (owner or admin),
// which prevents unauthenticated access to (potentially private) user files.

// Health check (includes DB probe — only reports detail in non-production)
app.get("/api/health", async (req, res) => {
  let db = "ok";
  try {
    await require("./config/db").testConnection();
  } catch (e) {
    db = "unavailable";
  }
  const body = { status: db === "ok" ? "ok" : "degraded", time: new Date().toISOString() };
  if (!env.isProd) body.db = db; // hide internal state in production
  res.json(body);
});

// Attach audit helper to every request
app.use(withAudit);

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/experts", expertRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/audit", auditRoutes);

// 404
app.use((req, res) => fail(res, 404, "Not found"));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return fail(res, err.status, err.message, err.details);
  }
  if (err.type === "entity.too.large") {
    return fail(res, 413, "Payload too large");
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return fail(res, 413, "File too large");
  }
  // Log with request context (no request body — may contain sensitive data)
  logger.error(
    "Unhandled error:",
    JSON.stringify({
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id ?? null,
      ip: req.ip,
    }),
    err.message,
    err.stack
  );
  // Never leak internal paths / stack traces — strip everything after the first line
  const safeMsg = (err.message || "").split("\n")[0].trim() || "Internal server error";
  fail(res, err.status || 500, env.isProd ? "Internal server error" : safeMsg);
});

// Process-level safety net: log + exit on truly unhandled errors
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT_EXCEPTION:", err.message, err.stack);
  // Exit uncleanly — process is in unknown state
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.error("UNHANDLED_REJECTION:", typeof reason === "object" ? reason.message : reason, reason?.stack ?? "");
});

// Graceful shutdown: stop accepting requests, drain in-flight, then close DB
if (require.main === module) {
  let server;
  function shutdown(signal) {
    logger.info(`Received ${signal}, shutting down...`);
    if (!server) process.exit(0);
    server.close(() => {
      logger.info("HTTP server closed, closing DB pool...");
      const { pool } = require("./config/db");
      pool.end().then(() => {
        logger.info("DB pool closed, exiting.");
        process.exit(0);
      });
    });
    // Hard exit if graceful shutdown takes > 10 seconds
    setTimeout(() => {
      logger.error("Forced exit after shutdown timeout");
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }, 10000).unref();
  }
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  testConnection().then((okDb) => {
    server = app.listen(PORT, () => {
      logger.info(`[server] API listening on http://localhost:${PORT} (db: ${okDb ? "connected" : "UNAVAILABLE"})`);
    });
  });
}

module.exports = app;
