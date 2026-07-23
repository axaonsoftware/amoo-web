const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");
const { adminRequired, verifyAccessToken, extractToken } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, fail, assertFound, parsePagination } = require("../utils/response");

const EXPERT_UPDATE_ALLOWED = [
  "name", "email", "phone", "avatar", "role_title", "bio", "specialties", "rating", "status",
];
const EXPERT_SELECT = "id, name, email, phone, avatar, role_title, bio, specialties, rating, status, created_at";

// GET /api/experts (public, active only) + admin sees all via ?all=1
router.get(
  "/",
  validateQuery,
  asyncHandler(async (req, res) => {
    // ?all=1 reveals inactive experts and their PII — admins only.
    //
    // This used to read `req.headers.authorization` directly, which meant it
    // only ever worked for a Bearer client. The browser authenticates with the
    // httpOnly `access_token` cookie, so the admin expert-management page always
    // got 401 here and could never list inactive experts. extractToken() checks
    // the header first and falls back to the cookie, which is exactly the
    // precedence the rest of the middleware uses.
    let isAdmin = false;
    if (req.query.all === "1") {
      const token = extractToken(req);
      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          isAdmin = decoded.kind === "admin";
        } catch (_) { /* token invalid or expired — not admin */ }
      }
      if (!isAdmin) {
        return fail(res, 401, "Admin authentication required");
      }
    }
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = isAdmin ? "WHERE deleted_at IS NULL" : "WHERE status = 'active' AND deleted_at IS NULL";
    if (req.query.status) { where += " AND status = ?"; params.push(req.query.status); }
    if (req.query.search) { where += " AND (name LIKE ? OR specialties LIKE ?)"; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM experts ${where}`, params);
    const [rows] = await pool.query(
      `SELECT ${EXPERT_SELECT} FROM experts ${where} ORDER BY rating DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/experts/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`SELECT ${EXPERT_SELECT} FROM experts WHERE id = ? AND deleted_at IS NULL`, [req.params.id]);
    if (assertFound(res, rows[0])) return;
    ok(res, rows[0]);
  })
);

// POST /api/experts (admin)
router.post(
  "/",
  adminRequired,
  validate("expert"),
  asyncHandler(async (req, res) => {
    const { name, email, phone, avatar, role_title, bio, specialties, rating } = req.body;
    const [existing] = await pool.query("SELECT id FROM experts WHERE email = ?", [email]);
    if (existing.length) throw new HttpError(409, "Expert email already exists");
    const [result] = await pool.query(
      "INSERT INTO experts (name, email, phone, avatar, role_title, bio, specialties, rating) VALUES (?,?,?,?,?,?,?,?)",
      [name, email, phone || null, avatar || null, role_title || null, bio || null, specialties || null, rating || 0]
    );
    req.audit("create", "expert", result.insertId, { name });
    created(res, { id: result.insertId });
  })
);

// PATCH /api/experts/:id (admin)
router.patch(
  "/:id",
  adminRequired,
  validate("expertUpdate"),
  asyncHandler(async (req, res) => {
    // experts.email is UNIQUE — without this pre-check a collision surfaces as
    // an unhandled ER_DUP_ENTRY and a 500 instead of a usable 409.
    if (req.body.email) {
      const [clash] = await pool.query(
        "SELECT id FROM experts WHERE email = ? AND id <> ?",
        [req.body.email, req.params.id]
      );
      if (clash.length) throw new HttpError(409, "Expert email already exists");
    }
    const { setClause, values } = buildUpdate(req.body, EXPERT_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE experts SET ${setClause} WHERE id = ?`, values);
    req.audit("update", "expert", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// Soft-delete /api/experts/:id (admin)
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id FROM experts WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("UPDATE experts SET deleted_at = NOW(), status = 'inactive' WHERE id = ?", [req.params.id]);
    req.audit("delete", "expert", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

// POST /api/experts/:id/set-password (admin sets or resets an expert's password)
router.post(
  "/:id/set-password",
  adminRequired,
  validate("setExpertPassword"),
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    const [rows] = await pool.query("SELECT id FROM experts WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      "UPDATE experts SET password_hash = ?, token_version = token_version + 1, verified = 1 WHERE id = ?",
      [hash, req.params.id]
    );
    req.audit("set-password", "expert", Number(req.params.id));
    ok(res, { id: Number(req.params.id), password_set: true });
  })
);

module.exports = router;
