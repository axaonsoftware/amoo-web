const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, parsePagination } = require("../utils/response");

const TESTIMONIAL_UPDATE_ALLOWED = ["status", "comment", "rating", "name"];

// GET /api/testimonials (public active)
router.get(
  "/",
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE status = 'Active' AND deleted_at IS NULL";
    if (req.query.search) { where += " AND comment LIKE ?"; params.push(`%${req.query.search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM testimonials ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM testimonials ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// admin: all (incl inactive)
router.get(
  "/all",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    let where = "WHERE deleted_at IS NULL";
    const params = [];
    if (req.query.status) { where += " AND status = ?"; params.push(req.query.status); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM testimonials ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM testimonials ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// public submit
router.post(
  "/",
  validate("testimonial"),
  asyncHandler(async (req, res) => {
    const { name, comment, rating, user_id, avatar } = req.body;
    const [result] = await pool.query(
      "INSERT INTO testimonials (user_id, name, avatar, comment, rating, status) VALUES (?,?,?,?,?,'Active')",
      [user_id || null, name || null, avatar || null, comment, rating || 5]
    );
    created(res, { id: result.insertId });
  })
);

// admin update
router.patch(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, TESTIMONIAL_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE testimonials SET ${setClause} WHERE id = ?`, values);
    req.audit("update", "testimonial", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// admin soft-delete
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id FROM testimonials WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (!rows.length) return ok(res, { id: Number(req.params.id), deleted: true });
    await pool.query("UPDATE testimonials SET deleted_at = NOW(), status = 'Inactive' WHERE id = ?", [req.params.id]);
    req.audit("delete", "testimonial", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;
