const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { HttpError } = require("../utils/helpers");
const { logAudit } = require("../utils/audit");
const { pool } = require("../config/db");

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

function extractToken(req, fromCookie = false) {
  if (fromCookie && req.cookies && req.cookies.refresh_token) return req.cookies.refresh_token;
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

// Verify the token's embedded tokenVersion still matches the DB (revocation).
async function checkTokenVersion(user) {
  if (user.tokenVersion === undefined) return true; // legacy tokens: trust
  const table = user.kind === "admin" ? "admins" : "users";
  const [rows] = await pool.query(`SELECT token_version FROM ${table} WHERE id = ?`, [user.id]);
  if (!rows.length) throw new HttpError(401, "Account no longer exists");
  if (rows[0].token_version !== user.tokenVersion) {
    throw new HttpError(401, "Session revoked. Please login again.");
  }
  return true;
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
  adminRequired,
  withAudit,
};
