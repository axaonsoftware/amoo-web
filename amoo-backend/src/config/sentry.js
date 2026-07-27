// Sentry error tracking for the backend.
// Graceful degradation: if @sentry/node is not installed, all calls are no-ops.
const env = require("./env");

let Sentry = null;
try {
  Sentry = require("@sentry/node");
} catch (_) {
  // not installed — skip
}

let enabled = false;

function init() {
  if (!Sentry || !process.env.SENTRY_DSN) return;
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: env.nodeEnv,
      release: process.env.npm_package_version || "1.0.0",
      tracesSampleRate: env.isProd ? 0.1 : 1.0,
    });
    enabled = true;
  } catch (_) {
    // silence init failures
  }
}

function error(err, req) {
  if (!enabled || !Sentry) return;
  Sentry.withScope((scope) => {
    if (req) {
      scope.setExtra("requestId", req.id);
      scope.setExtra("method", req.method);
      scope.setExtra("url", req.originalUrl || req.url);
      scope.setUser(req.user ? { id: req.user.id, kind: req.user.kind } : null);
    }
    Sentry.captureException(err);
  });
}

async function flush() {
  if (!enabled || !Sentry) return;
  await Sentry.flush(2000);
}

module.exports = { init, error, flush, enabled };

