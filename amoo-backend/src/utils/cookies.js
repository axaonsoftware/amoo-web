const env = require("../config/env");

// In production, nginx proxies both frontend and API under the same origin,
// so the browser treats every request as same-origin. SameSite=Lax is
// sufficient and more secure than None — cookies are sent on same-origin
// navigations and GET requests, while the CSRF double-submit cookie protects
// state-changing POST/PATCH/DELETE calls.
//
// In development, both run on localhost (same site, plain http), where Lax
// works and Secure would block the cookie entirely.
const sameSite = "lax";
const secure = env.isProd;

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // matches JWT_REFRESH_EXPIRES_IN default
const CSRF_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000;

// Turn a jsonwebtoken-style lifetime ("2h", "15m", "7d", "3600") into ms.
function parseDuration(value, fallbackMs) {
  if (typeof value === "number") return value * 1000;
  const match = /^(\d+)\s*([smhd])?$/.exec(String(value ?? "").trim());
  if (!match) return fallbackMs;
  const multiplier = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2] || "s"];
  return Number(match[1]) * multiplier;
}

const ACCESS_TOKEN_MAX_AGE = parseDuration(env.jwt.expiresIn, 2 * 60 * 60 * 1000);

// httpOnly: JavaScript must never be able to read the auth tokens, so an XSS
// bug can't exfiltrate them.
// secure: in production, nginx terminates TLS so the browser always connects
// via HTTPS. In dev (plain http on localhost), secure must be false or the
// browser rejects the cookie.
// sameSite: 'lax' — cookies ride on same-origin requests. Cross-site POSTs
// are protected by the CSRF double-submit token instead.
function authCookieOptions(maxAge) {
  return { httpOnly: true, sameSite, secure, path: "/", maxAge };
}

// Deliberately readable by JavaScript — the double-submit pattern requires the
// frontend to read this cookie and echo it back in the X-CSRF-Token header.
function csrfCookieOptions() {
  return { httpOnly: false, sameSite, secure, path: "/", maxAge: CSRF_TOKEN_MAX_AGE };
}

// clearCookie only matches a cookie when the flags line up with how it was set.
function clearCookieOptions() {
  return { httpOnly: true, sameSite, secure, path: "/" };
}

module.exports = {
  authCookieOptions,
  csrfCookieOptions,
  clearCookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
};
