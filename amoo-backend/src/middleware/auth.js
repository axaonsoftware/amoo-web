const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { HttpError } = require("../utils/helpers");
const { logAudit } = require("../utils/audit");
const { pool } = require("../config/db");

const USER_TABLES = { admin: "admins", user: "users" };

function resolveTable(kind) {
  const table = USER_TABLES[kind];
  if (!table) throw new HttpError(500, "Invalid user kind");
  return table;
}

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.secret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

// Browsers authenticate via the httpOnly `access_token` cookie; non-browser API
// clients still send an Authorization header, which takes precedence so an
// explicit header always wins over a stale cookie.
function extractToken(req, fromCookie = false) {
  if (fromCookie && req.cookies && req.cookies.refresh_token) return req.cookies.refresh_token;
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies && req.cookies.access_token) return req.cookies.access_token;
  return null;
}

// Verify the token's embedded tokenVersion still matches the DB (revocation).
async function checkTokenVersion(user) {
  if (user.tokenVersion === undefined) return true; // legacy tokens: trust
  const table = resolveTable(user.kind);
  const [rows] = await pool.query(`SELECT token_version FROM ${table} WHERE id = ?`, [user.id]);
  if (!rows.length) throw new HttpError(401, "Account no longer exists");
  if (rows[0].token_version !== user.tokenVersion) {
    throw new HttpError(401, "Session revoked. Please login again.");
  }
  return true;
}

// Require that the authenticated user's email is verified.
// Must be placed after authRequired so req.user exists.
function verifiedRequired(req, res, next) {
  if (req.user.kind === "admin") return next(); // admins always pass
  const finish = (row) => {
    if (!row || !row.verified) return next(new HttpError(403, "Email not verified. Please verify your email first."));
    next();
  };
  if (req._verifiedUser) return finish(req._verifiedUser);
  pool.query("SELECT verified FROM users WHERE id = ?", [req.user.id])
    .then(([rows]) => {
      req._verifiedUser = rows[0] || null;
      finish(req._verifiedUser);
    })
    .catch((e) => next(e));
}

// Generic require-auth; sets req.user from a verified access token.
function authRequired(req, res, next) {
  const token = extractToken(req);
  if (!token) return next(new HttpError(401, "No token provided"));
  try {
    const decoded = verifyAccessToken(token);
    checkTokenVersion(decoded)
      .then(() => { req.user = decoded; next(); })
      .catch((e) => next(e));
  } catch (e) {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

// Require admin-kind token. Self-verifies if a previous authRequired didn't run.
function adminRequired(req, res, next) {
  const finish = (decoded) => {
    if (decoded.kind !== "admin") return next(new HttpError(403, "Admin access required"));
    req.user = decoded;
    next();
  };
  if (req.user) return finish(req.user);
  const token = extractToken(req);
  if (!token) return next(new HttpError(401, "No token provided"));
  try {
    const decoded = verifyAccessToken(token);
    checkTokenVersion(decoded)
      .then(() => finish(decoded))
      .catch((e) => next(e));
  } catch (e) {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

// Attaches a `req.audit(action, entity, entityId, meta)` helper so route
// handlers can record audit-log entries with the acting user filled in.
function withAudit(req, res, next) {
  req.audit = (action, entity, entityId, meta) => {
    const actor = req.user || {};
    return logAudit({
      actor_id: actor.id || null,
      actor_type: actor.kind || "system",
      action,
      entity,
      entity_id: entityId ?? null,
      meta,
    });
  };
  next();
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractToken,
  authRequired,
  verifiedRequired,
  adminRequired,
  withAudit,
};
