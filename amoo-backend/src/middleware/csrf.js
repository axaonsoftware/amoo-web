const crypto = require("crypto");
const { csrfCookieOptions } = require("../utils/cookies");

const TOKEN_BYTES = 32;
const TOKEN_RE = /^[a-f0-9]{64}$/;

// Methods that cannot change state, so they need no CSRF token.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Endpoints that must work before the client can possibly hold a CSRF cookie
// (the credential-establishing calls), plus the payment webhook — a
// server-to-server caller that sends no cookies and is HMAC-verified instead.
// None of these act on an existing session, so there is no session to ride.
const EXEMPT_PATHS = new Set([
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/admin/login",
  "/api/auth/expert/login",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/payments/webhook",
]);

function generateCsrfToken(req, res, next) {
  let token = req.cookies?.csrf_token;
  if (!token || !TOKEN_RE.test(token)) {
    token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
    res.cookie("csrf_token", token, csrfCookieOptions());
    // Make the fresh token visible to the current request too, so a guard later
    // in this same chain compares against the value the client just received.
    req.cookies = { ...(req.cookies || {}), csrf_token: token };
  }
  // document.cookie is origin-scoped, so a frontend on a different origin than
  // this API cannot read the cookie above. Echo the token in a CORS-exposed
  // response header as well. The browser still sends the cookie itself, so the
  // double-submit comparison is unchanged — this only tells the client what to
  // put in the header.
  res.setHeader("X-CSRF-Token", token);
  next();
}

function csrfProtection(req, res, next) {
  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.csrf_token;

  // A repeated header arrives as an array; only a single string is acceptable.
  if (typeof headerToken !== "string" || typeof cookieToken !== "string") {
    return res.status(403).json({
      success: false,
      error: "Missing CSRF token",
    });
  }

  // Compare fixed-length buffers — timingSafeEqual throws on a length mismatch.
  if (!TOKEN_RE.test(headerToken) || !TOKEN_RE.test(cookieToken)) {
    return res.status(403).json({
      success: false,
      error: "Invalid CSRF token",
    });
  }

  const valid = crypto.timingSafeEqual(
    Buffer.from(headerToken),
    Buffer.from(cookieToken)
  );
  if (!valid) {
    return res.status(403).json({
      success: false,
      error: "Invalid CSRF token",
    });
  }

  next();
}

// Application-level guard: enforce the double-submit check on every
// state-changing request except the exempt bootstrap endpoints above.
function csrfGuard(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (EXEMPT_PATHS.has(req.path)) return next();
  return csrfProtection(req, res, next);
}

module.exports = { generateCsrfToken, csrfProtection, csrfGuard, EXEMPT_PATHS };
