const crypto = require("crypto");
const env = require("../config/env");

const TOKEN_BYTES = 32;

function generateCsrfToken(req, res, next) {
  const existing = req.cookies?.csrf_token;
  if (existing && /^[a-f0-9]{64}$/.test(existing)) {
    return next();
  }
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  res.cookie("csrf_token", token, {
    httpOnly: false,
    sameSite: "strict",
    secure: env.isProd,
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
  next();
}

function csrfProtection(req, res, next) {
  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.csrf_token;

  if (!headerToken || !cookieToken) {
    return res.status(403).json({
      success: false,
      error: "Missing CSRF token",
    });
  }

  try {
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
  } catch {
    return res.status(403).json({
      success: false,
      error: "Invalid CSRF token",
    });
  }

  next();
}

module.exports = { generateCsrfToken, csrfProtection };
