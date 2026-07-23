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

// authenticated submit — queued for admin approval
//
// SECURITY: signed-in users only, and the author is taken from the token, never
// the request body, so a testimonial cannot be attributed to another account.
// New submissions land as 'Inactive' and only appear on the public site once an
// admin flips them to 'Active' via PATCH /api/testimonials/:id.
router.post(
  "/",
  authRequired,
  validate("testimonial"),
  asyncHandler(async (req, res) => {
    const { comment, rating } = req.body;
    const [[user]] = await pool.query(
      "SELECT name, avatar FROM users WHERE id = ? AND deleted_at IS NULL",
      [req.user.id]
    );
    if (!user) throw new HttpError(404, "User not found");
    const [result] = await pool.query(
      "INSERT INTO testimonials (user_id, name, avatar, comment, rating, status) VALUES (?,?,?,?,?,'Inactive')",
      [req.user.id, user.name || null, user.avatar || null, comment, rating || 5]
    );
    req.audit("create", "testimonial", result.insertId, { rating });
    created(res, { id: result.insertId, status: "Inactive" });
  })
);

// admin update
router.patch(
  "/:id",
  adminRequired,
  validate("testimonialUpdate"),
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
