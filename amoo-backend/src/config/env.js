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

  maxFileSize: Number(required("MAX_FILE_SIZE", "5242880")),
  logLevel: required("LOG_LEVEL", "info"),

  // Public base URL of this API (used for links in emails, webhooks, etc.)
  appUrl: required("APP_URL", `http://localhost:${required("PORT", 4000)}`),

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
  },
};

if (env.isProd && (env.jwt.secret === "dev_secret_change_me" || env.jwt.refreshSecret === "dev_refresh_secret_change_me")) {
  throw new Error("JWT secrets must be set to strong values in production");
}

if (env.isProd && env.storage.enabled && !env.storage.bucket) {
  throw new Error("S3_BUCKET is required when S3_ENABLED=true in production");
}

module.exports = env;
