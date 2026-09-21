// --- OpenTelemetry (must be imported before anything else) ---
// Never throws: tracing degrades to a no-op if the packages are absent or the
// exporter cannot start, rather than preventing the API from booting.
const { shutdownTelemetry } = require("./config/telemetry");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const sentry = require("./config/sentry");
sentry.init();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const { testConnection } = require("./config/db");
const env = require("./config/env");
const logger = require("./utils/logger");
const { helmetConfig, corsOptions, limiter, authLimiter, registerLimiter, chatLimiter } = require("./middleware/security");
const { HttpError } = require("./utils/helpers");
const { fail } = require("./utils/response");
const { withAudit, authRequired } = require("./middleware/auth");
const { generateCsrfToken, csrfGuard } = require("./middleware/csrf");

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
const { router: subscriptionRoutes, expireSubscriptions } = require("./routes/subscriptions");
const notificationRoutes = require("./routes/notifications");
const contactRoutes = require("./routes/contact");
const uploadRoutes = require("./routes/uploads");
const chatRoutes = require("./routes/chat");
const couponRoutes = require("./routes/coupons");
const auditRoutes = require("./routes/audit");
const activityRoutes = require("./routes/activity");
const blogRoutes = require("./routes/blogs");
const faqRoutes = require("./routes/faqs");
const settingsRoutes = require("./routes/settings");
const contentRoutes = require("./routes/content");
const agoraRoutes = require("./routes/agoraRoutes");
let setupSwagger;
try {
  ({ setupSwagger } = require("./config/swagger"));
} catch {
  // swagger-jsdoc or swagger-ui-express missing — skip API docs setup.
  // In production this is fine (Swagger is disabled by default).
  setupSwagger = null;
}

const app = express();
const PORT = env.port;

// Trust the configured number of upstream proxies (nginx, optionally
// Cloudflare). Required for rate-limiting + IP logging to use the real client IP.
app.set("trust proxy", env.trustProxy);

// Request correlation id — set before body parsing and CSRF so even rejected
// requests (bad JSON, missing CSRF token) carry an id in logs.
app.use((req, res, next) => {
  req.id = require("crypto").randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// --- Core middleware ---
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(compression());

// Request timeout: return 503 if a request takes longer than 30 seconds.
// Must be placed after body parsers so slow bodies don't count against the
// timeout, but before routes so it covers every handler.
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(503).json({ error: "Request timed out" });
    }
  });
  next();
});
// JSON parser: use the standard parser for all routes EXCEPT the payment webhook
// (which needs the raw body for HMAC signature verification).
const jsonParser = express.json({ limit: "1mb" });
const webhookJsonParser = express.json({
  limit: "1mb",
  verify: (req, res, buf) => { req.rawBody = buf.toString("utf8"); },
});
app.use((req, res, next) => {
  if (req.path === "/api/payments/webhook") return webhookJsonParser(req, res, next);
  jsonParser(req, res, next);
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Swagger API Docs (before CSRF — static assets need no token) ---
// Off by default in production (ENABLE_SWAGGER=true to expose); API docs are
// an information-leak surface that production traffic does not need.
if (setupSwagger && (!env.isProd || env.enableSwagger)) {
  setupSwagger(app);
}

// --- CSRF (double-submit cookie) ---
// SameSite=Lax prevents cookies from being sent on cross-site requests, but
// CSRF is still needed as defense-in-depth: a malicious page can trigger
// top-level navigations and HTML form POSTs that carry cookies. The
// double-submit pattern issues a readable csrf_token cookie; the frontend
// echoes it in the X-CSRF-Token header on every mutating call, and csrfGuard
// enforces the match.
app.use(generateCsrfToken);
app.use(csrfGuard);

// Request correlation id is set at the top of the chain (see above) so morgan
// and the error handler can always rely on req.id.
morgan.token("req-id", (req) => req.id || "-");
if (env.nodeEnv !== "test") {
  app.use(morgan(
    env.isProd
      ? ":req-id :remote-addr :remote-user :method :url :status :res[content-length] :response-time ms"
      : "dev",
    { skip: (req) => req.path === "/api/health" }
  ));
}

// Rate limiters (skipped in test mode to avoid false test failures)
if (env.nodeEnv !== "test") {
  app.use("/api", limiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/admin/login", authLimiter);
  app.use("/api/auth/expert/login", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
  app.use("/api/auth/reset-password", authLimiter);
  app.use("/api/auth/register", registerLimiter);
  app.use("/api/auth/verify-email", authLimiter);
}

// NOTE: uploaded files are NO LONGER served statically. They are accessed
// only via the authenticated /api/uploads/:id/download route (owner or admin),
// which prevents unauthenticated access to (potentially private) user files.

app.use(generateCsrfToken);
app.use(csrfGuard);

const { localDir } = require("./config/storage");
app.use("/uploads", express.static(localDir));

morgan.token("req-id", (req) => req.id || "-");

// Health check (includes DB probe — only reports detail in non-production)
app.get("/api/health", async (req, res) => {
  let db = "ok";
  try {
    await testConnection();
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
app.use("/api/chat/conversations/:id/messages", chatLimiter);
app.use("/api/chat", chatRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/content", contentRoutes);

app.use("/api/agora", agoraRoutes);

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
  // Send to Sentry (non-HTTP errors only — 4xx are expected)
  if (err.status >= 500 || !err.status) sentry.error(err, req);

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
  // Exit uncleanly — process is in unknown state (same as uncaughtException)
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});

// Graceful shutdown: stop accepting requests, drain in-flight, then close DB
if (require.main === module) {
  let server;
  function shutdown(signal) {
    logger.info(`Received ${signal}, shutting down...`);
    if (!server) {
      // Server never started (DB retry still in progress) — close pool and exit.
      shutdownTelemetry().then(() => sentry.flush()).then(() => {
        const { pool } = require("./config/db");
        return pool.end().catch(() => { });
      }).finally(() => process.exit(0));
      return;
    }
    server.close(async () => {
      logger.info("HTTP server closed, flushing telemetry and closing DB pool...");
      // Flush buffered spans before exit, or the traces for the last requests
      // before a deploy are lost. No-op when tracing never started.
      await shutdownTelemetry();
      await sentry.flush();
      const { pool } = require("./config/db");
      try {
        await pool.end();
        logger.info("DB pool closed, exiting.");
      } catch (e) {
        logger.error("Error closing DB pool:", e.message);
      }
      process.exit(0);
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

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("SOCKET CONNECTED:", socket.id);
    socket.on("join:user", (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });

    socket.on("join:expert", (expertId) => {
      if (!expertId) return;
      socket.join(`expert:${expertId}`);
    });

    socket.on("chat:join", async (data) => {
      const conversationId = Number(data?.conversationId);
      if (!conversationId) return;
      socket.join(`chat:${conversationId}`);
    });
    socket.on("chat:leave", async (data) => {
      const conversationId = Number(data?.conversationId);
      if (!conversationId) return;
      socket.leave(`chat:${conversationId}`);
    });

    socket.on("call:start", async (data) => {
      console.log("🔥 CALL START RECEIVED:", data);
      try {
        const { pool } = require("./config/db");

        const {
          bookingId,
          callerRole,
          callerId,
        } = data || {};

        if (!bookingId || !callerRole || !callerId) {
          socket.emit("call:error", {
            message: "Invalid call details.",
          });
          return;
        }

        const result = await pool.query(
          `
          SELECT
            id,
            user_id,
            expert_id,
            mode,
            payment,
            status
          FROM bookings
          WHERE id = $1
          LIMIT 1
          `,
          [bookingId]
        );

        const booking = result.rows[0];

        if (!booking) {
          socket.emit("call:error", {
            message: "Booking not found.",
          });
          return;
        }

        if (booking.payment !== "Paid") {
          socket.emit("call:error", {
            message: "Payment is not completed.",
          });
          return;
        }

        if (booking.status !== "upcoming") {
          socket.emit("call:error", {
            message: "This consultation is not available.",
          });
          return;
        }

        const callerIsUser =
          callerRole === "user" &&
          Number(callerId) === Number(booking.user_id);

        const callerIsExpert =
          callerRole === "expert" &&
          Number(callerId) === Number(booking.expert_id);

        if (!callerIsUser && !callerIsExpert) {
          socket.emit("call:error", {
            message: "You are not part of this consultation.",
          });
          return;
        }

        const targetRoom = callerIsUser
          ? `expert:${booking.expert_id}`
          : `user:${booking.user_id}`;

        io.to(targetRoom).emit("incoming-call", {
          bookingId: booking.id,
          mode: booking.mode,
          callerRole,
          callerId,
        });
      } catch (error) {
        console.error("call:start error:", error);

        socket.emit("call:error", {
          message: "Unable to start call.",
        });
      }
    });

    socket.on("call:accept", async (data) => {
      try {
        const { pool } = require("./config/db");

        const {
          bookingId,
          receiverRole,
          receiverId,
        } = data || {};

        const result = await pool.query(
          `
          SELECT
            id,
            user_id,
            expert_id,
            mode,
            payment,
            status
          FROM bookings
          WHERE id = $1
          LIMIT 1
          `,
          [bookingId]
        );

        const booking = result.rows[0];

        if (!booking) {
          socket.emit("call:error", {
            message: "Booking not found.",
          });
          return;
        }

        const receiverIsUser =
          receiverRole === "user" &&
          Number(receiverId) === Number(booking.user_id);

        const receiverIsExpert =
          receiverRole === "expert" &&
          Number(receiverId) === Number(booking.expert_id);

        if (!receiverIsUser && !receiverIsExpert) {
          socket.emit("call:error", {
            message: "You are not part of this consultation.",
          });
          return;
        }

        const callerRoom = receiverIsUser
          ? `expert:${booking.expert_id}`
          : `user:${booking.user_id}`;

        const callData = {
          bookingId: booking.id,
          mode: booking.mode,
        };

        io.to(callerRoom).emit("call:accepted", callData);
        socket.emit("call:accepted", callData);
      } catch (error) {
        console.error("call:accept error:", error);

        socket.emit("call:error", {
          message: "Unable to accept call.",
        });
      }
    });

    socket.on("call:reject", async (data) => {
      try {
        const { pool } = require("./config/db");

        const {
          bookingId,
          receiverRole,
        } = data || {};

        const result = await pool.query(
          `
          SELECT
            id,
            user_id,
            expert_id
          FROM bookings
          WHERE id = $1
          LIMIT 1
          `,
          [bookingId]
        );

        const booking = result.rows[0];

        if (!booking) return;

        const callerRoom =
          receiverRole === "user"
            ? `expert:${booking.expert_id}`
            : `user:${booking.user_id}`;

        io.to(callerRoom).emit("call:rejected", {
          bookingId: booking.id,
        });
      } catch (error) {
        console.error("call:reject error:", error);
      }
    });

    socket.on("call:end", async (data) => {
      try {
        const { pool } = require("./config/db");

        const {
          bookingId,
          callerRole,
        } = data || {};

        const result = await pool.query(
          `
          SELECT
            id,
            user_id,
            expert_id
          FROM bookings
          WHERE id = $1
          LIMIT 1
          `,
          [bookingId]
        );

        const booking = result.rows[0];

        if (!booking) return;

        const targetRoom =
          callerRole === "user"
            ? `expert:${booking.expert_id}`
            : `user:${booking.user_id}`;

        io.to(targetRoom).emit("call:ended", {
          bookingId: booking.id,
        });
      } catch (error) {
        console.error("call:end error:", error);
      }
    });
  });

  testConnection().then((okDb) => {
    // server = app.listen(PORT, () => {
    server = httpServer.listen(PORT, () => {
      logger.info(`[server] API listening on http://localhost:${PORT} (db: ${okDb ? "connected" : "UNAVAILABLE"})`);
      const { startCron } = require("./cron/index");
      startCron([
        {
          name: "expire-subscriptions",
          schedule: process.env.CRON_SCHEDULE || "0 2 * * *",
          task: expireSubscriptions,
        },
      ]);
      // WebSocket server for real-time chat.
      // Clients connect to ws://host:port/chat and authenticate via
      // Sec-WebSocket-Protocol header or the access_token cookie.
      // JWT in URL query strings is rejected — they leak in logs and Referer.
      const { attachChat } = require("./websocket");
      attachChat(server);
    });
  });
}

module.exports = app;
