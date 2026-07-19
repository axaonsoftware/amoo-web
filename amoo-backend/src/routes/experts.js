const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
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
    const isAdmin = req.headers.authorization && req.query.all === "1";
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
  asyncHandler(async (req, res) => {
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

module.exports = router;
