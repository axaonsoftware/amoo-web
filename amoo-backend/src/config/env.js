require("dotenv").config();

function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === null || v === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

const env = {
  port: Number(required("PORT", 4000)),
  nodeEnv: required("NODE_ENV", "development"),
  isProd: required("NODE_ENV", "development") === "production",
  // Number of reverse proxies in front of the API (nginx, then optionally
  // Cloudflare). express-rate-limit and audit logging key on req.ip, which only
  // resolves to the real client IP when trust proxy counts every hop. Set
  // TRUST_PROXY=2 when Cloudflare sits in front of nginx.
  trustProxy: Number(required("TRUST_PROXY", process.env.NODE_ENV === "production" ? "1" : "0")),

  db: {
    host: required("DB_HOST", "127.0.0.1"),
    port: Number(required("DB_PORT", 5432)),
    user: required("DB_USER", "root"),
    password: required("DB_PASSWORD", ""),
    database: required("DB_NAME", "amoo_db"),
    url: process.env.DATABASE_URL || "",
    // Set DB_SSL=true (or pass sslmode=require in DATABASE_URL) when the
    // database requires TLS — e.g. any managed cloud Postgres.
    ssl: required("DB_SSL", "false") === "true",
  },

  jwt: {
    secret: required("JWT_SECRET", "dev_secret_change_me"),
    expiresIn: required("JWT_EXPIRES_IN", "2h"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev_refresh_secret_change_me"),
    refreshExpiresIn: required("JWT_REFRESH_EXPIRES_IN", "30d"),
    resetExpiresMin: Number(required("RESET_TOKEN_EXPIRES_MIN", "15")),
  },

  clientOrigin: required("CLIENT_ORIGIN", "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  rateLimit: {
    windowMs: Number(required("RATE_LIMIT_WINDOW_MS", "900000")),
    max: Number(required("RATE_LIMIT_MAX", "200")),
    // Auth-sensitive endpoints get a stricter per-IP budget. Configurable so a
    // deploy can tune it without a code change; defaults are the production
    // policy (deliberately conservative against credential stuffing).
    authWindowMs: Number(required("RATE_LIMIT_AUTH_WINDOW_MS", "900000")),
    authMax: Number(required("RATE_LIMIT_AUTH_MAX", "30")),
    // Registration spam / enumeration guard gets its own per-IP budget.
    registerWindowMs: Number(required("RATE_LIMIT_REGISTER_WINDOW_MS", "3600000")),
    registerMax: Number(required("RATE_LIMIT_REGISTER_MAX", "10")),
  },

  lockout: {
    maxAttempts: Number(required("LOCKOUT_MAX_ATTEMPTS", "5")),
    durationMin: Number(required("LOCKOUT_DURATION_MIN", "15")),
  },

  otp: {
    maxAttempts: Number(required("OTP_MAX_ATTEMPTS", "5")),
    length: Number(required("OTP_LENGTH", "6")),
  },

  maxFileSize: Number(required("MAX_FILE_SIZE", "5242880")),

  // WebSocket limits
  wsMaxConnectionsPerUser: Number(required("WS_MAX_CONNECTIONS_PER_USER", "3")),
  wsMaxMessagesPerSecond: Number(required("WS_MAX_MESSAGES_PER_SECOND", "10")),
  // When true, OTPs and verification tokens are returned in API responses for
  // debugging. Never enable this in production or on any internet-facing host
  // (a production guard below refuses to boot with it on).
  devDebugTokens: process.env.DEV_DEBUG_TOKENS === "true",

  logLevel: required("LOG_LEVEL", "info"),

  // Serve the Swagger UI (GET /api/docs) outside development. Off by default;
  // API docs are an attack-surface / information leak in production.
  enableSwagger: required("ENABLE_SWAGGER", "false") === "true",

  // Public base URL of this API (webhook callbacks, absolute asset URLs).
  appUrl: required("APP_URL", `http://localhost:${required("PORT", 4000)}`),

  // Public base URL of the Next.js frontend. Every link a human clicks in an
  // email must point here, NOT at appUrl: pages like /verify-email and
  // /user-dashboard are served by the frontend, so building them on the API
  // origin produced a 404 for every recipient. Required in production so that
  // email links never fall back to localhost in a deployed environment.
  clientUrl: (() => {
    const url = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
    if ((process.env.NODE_ENV || "").includes("prod") && !process.env.CLIENT_URL) {
      throw new Error("CLIENT_URL is required in production — set it to the public frontend origin");
    }
    return url;
  })(),

  // Object storage (S3-compatible). When configured, uploads go here instead
  // of the local disk and files are served via signed URLs.
  storage: {
    enabled: required("S3_ENABLED", "false") === "true",
    bucket: required("S3_BUCKET", ""),
    region: required("S3_REGION", ""),
    accessKey: required("S3_ACCESS_KEY", ""),
    secretKey: required("S3_SECRET_KEY", ""),
    endpoint: required("S3_ENDPOINT", ""),
    publicBase: required("S3_PUBLIC_BASE", ""),
  },

  // Email provider (used for OTP + verification emails in production).
  email: {
    enabled: required("EMAIL_ENABLED", "false") === "true",
    host: required("EMAIL_HOST", ""),
    port: Number(required("EMAIL_PORT", "587")),
    user: required("EMAIL_USER", ""),
    pass: required("EMAIL_PASS", ""),
    from: required("EMAIL_FROM", "no-reply@amooguru.com"),
  },

  // Payment gateway (Razorpay). Webhook signature verification is mandatory in
  // production. 'mock' is dev-only; 'stripe' is rejected in production because
  // the frontend checkout and webhook verification are Razorpay-only.
  payments: {
    gateway: required("PAYMENT_GATEWAY", "mock"), // mock | razorpay
    key: required("PAYMENT_KEY", ""),
    secret: required("PAYMENT_SECRET", ""),
    webhookSecret: required("PAYMENT_WEBHOOK_SECRET", ""),
    // Razorpay-specific keys (required when PAYMENT_GATEWAY=razorpay)
    razorpayKeyId: required("RAZORPAY_KEY_ID", ""),
    razorpayKeySecret: required("RAZORPAY_KEY_SECRET", ""),
  },

  // OpenTelemetry tracing. Set OTEL_EXPORTER_OTLP_ENDPOINT in production
  // to export traces to a collector (e.g. Jaeger, Grafana Tempo, Datadog).
  otel: {
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
  },
};

const INSECURE_JWT_SECRETS = new Set([
  "dev_secret_change_me",
  "dev_refresh_secret_change_me",
  "sQuHt6d1PANfzlc7nSX9KCpZLbmVE2WakOT45jrRgw0Me8hGFoyIiBJv3DqYxU",
  "SopOQskKMlwTRBn80qXtyAfv2VY3cdZzuJ9ENGIbr5x1jUD7imLPeh6HaCF4Wg",
  "change_me_dev_env_only_not_for_production",
  "change_me_dev_refresh_not_for_production",
]);

if (env.isProd && (INSECURE_JWT_SECRETS.has(env.jwt.secret) || INSECURE_JWT_SECRETS.has(env.jwt.refreshSecret))) {
  throw new Error(
    "JWT secrets must be replaced with strong values in production. " +
    "Run: openssl rand -base64 48"
  );
}

// Enforce minimum secret length even in development to prevent accidentally
// shipping weak secrets to production.
if (env.jwt.secret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters. Run: openssl rand -base64 48");
}
if (env.jwt.refreshSecret.length < 32) {
  throw new Error("JWT_REFRESH_SECRET must be at least 32 characters. Run: openssl rand -base64 48");
}

if (env.isProd && env.clientOrigin.includes("*")) {
  throw new Error("CLIENT_ORIGIN must not be '*' in production. Set specific origins.");
}

if (env.isProd && !process.env.DATABASE_URL && env.db.host === "127.0.0.1" && env.db.database === "amoo_db") {
  throw new Error(
    "DATABASE_URL is required in production (or set DB_HOST, DB_NAME, DB_USER explicitly — do not rely on defaults)"
  );
}

if (env.isProd && env.storage.enabled && !env.storage.bucket) {
  throw new Error("S3_BUCKET is required when S3_ENABLED=true in production");
}

// The webhook skips signature verification when the gateway is 'mock' or no
// secret is set — which would leave an unauthenticated endpoint that can mark
// bookings paid. 'mock' is the default, so a deploy that forgets to change it
// must fail loudly at boot rather than silently expose that endpoint.
if (env.isProd && env.payments.gateway === "mock") {
  throw new Error(
    "PAYMENT_GATEWAY must not be 'mock' in production. Set a real gateway (razorpay | stripe)."
  );
}

if (env.isProd && env.payments.gateway === "stripe") {
  throw new Error(
    "PAYMENT_GATEWAY=stripe is not supported by this build — the frontend checkout and webhook are Razorpay-only. Set PAYMENT_GATEWAY=razorpay."
  );
}

if (env.isProd && !env.payments.webhookSecret) {
  throw new Error("PAYMENT_WEBHOOK_SECRET is required in production");
}

if (env.isProd && env.devDebugTokens) {
  throw new Error(
    "DEV_DEBUG_TOKENS must be disabled in production — it returns OTPs and verification tokens in API responses."
  );
}

// Email backs the forgot-password OTP and verify-email flows, both of which
// 500 in production when email is unconfigured. Require it at boot so a deploy
// that forgets SMTP fails loudly instead of breaking those flows for users.
if (env.isProd && !env.email.enabled) {
  throw new Error("EMAIL_ENABLED must be true in production — forgot-password and verify-email depend on SMTP.");
}

if (env.isProd && env.email.enabled && !env.email.host) {
  throw new Error("EMAIL_HOST is required when EMAIL_ENABLED=true in production.");
}

// Email links are built on clientUrl. A localhost value in production means
// every verification and password link mailed to a real user is dead.
if (env.isProd && /localhost|127\.0\.0\.1/.test(env.clientUrl)) {
  throw new Error(
    "CLIENT_URL (or the first CLIENT_ORIGIN entry) must be the public frontend URL in production, not localhost"
  );
}

module.exports = env;
