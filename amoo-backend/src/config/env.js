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

  db: {
    host: required("DB_HOST", "127.0.0.1"),
    port: Number(required("DB_PORT", 3306)),
    user: required("DB_USER", "root"),
    password: required("DB_PASSWORD", ""),
    database: required("DB_NAME", "amoo_db"),
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
  },

  lockout: {
    maxAttempts: Number(required("LOCKOUT_MAX_ATTEMPTS", "5")),
    durationMin: Number(required("LOCKOUT_DURATION_MIN", "15")),
  },

  maxFileSize: Number(required("MAX_FILE_SIZE", "5242880")),
  logLevel: required("LOG_LEVEL", "info"),

  // Public base URL of this API (webhook callbacks, absolute asset URLs).
  appUrl: required("APP_URL", `http://localhost:${required("PORT", 4000)}`),

  // Public base URL of the Next.js frontend. Every link a human clicks in an
  // email must point here, NOT at appUrl: pages like /verify-email and
  // /user-dashboard are served by the frontend, so building them on the API
  // origin produced a 404 for every recipient. Defaults to the first configured
  // CLIENT_ORIGIN so a correct CORS setup gives a correct link for free.
  clientUrl: (process.env.CLIENT_URL ||
    (required("CLIENT_ORIGIN", "*")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && s !== "*")[0]) ||
    "http://localhost:3000").replace(/\/$/, ""),

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

  // Payment gateway (Razorpay / Stripe). Webhook signature verification
  // should be enabled in production.
  payments: {
    gateway: required("PAYMENT_GATEWAY", "mock"), // mock | razorpay | stripe
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

if (env.isProd && (env.jwt.secret === "dev_secret_change_me" || env.jwt.refreshSecret === "dev_refresh_secret_change_me")) {
  throw new Error("JWT secrets must be set to strong values in production");
}

if (env.isProd && env.clientOrigin.includes("*")) {
  throw new Error("CLIENT_ORIGIN must not be '*' in production. Set specific origins.");
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

if (env.isProd && !env.payments.webhookSecret) {
  throw new Error("PAYMENT_WEBHOOK_SECRET is required in production");
}

// Email links are built on clientUrl. A localhost value in production means
// every verification and password link mailed to a real user is dead.
if (env.isProd && /localhost|127\.0\.0\.1/.test(env.clientUrl)) {
  throw new Error(
    "CLIENT_URL (or the first CLIENT_ORIGIN entry) must be the public frontend URL in production, not localhost"
  );
}

module.exports = env;
