const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

const SERVICE_UPDATE_ALLOWED = ["name", "sub", "img", "category", "type", "price", "duration", "status"];

// GET /api/services (public active)
router.get(
  "/",
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE status = 'Active' AND deleted_at IS NULL";
    if (req.query.category) { where += " AND category = ?"; params.push(req.query.category); }
    if (req.query.type) { where += " AND type = ?"; params.push(req.query.type); }
    if (req.query.search) { where += " AND (name LIKE ? OR sub LIKE ?)"; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM services ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM services ${where} ORDER BY category, name LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// admin: all (incl inactive) with filters
router.get(
  "/all",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE deleted_at IS NULL";
    if (req.query.status) { where += " AND status = ?"; params.push(req.query.status); }
    if (req.query.category) { where += " AND category = ?"; params.push(req.query.category); }
    if (req.query.type) { where += " AND type = ?"; params.push(req.query.type); }
    if (req.query.search) { where += " AND (name LIKE ? OR sub LIKE ?)"; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM services ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM services ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/services/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM services WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    ok(res, rows[0]);
  })
);

// admin create
router.post(
  "/",
  adminRequired,
  validate("service"),
  asyncHandler(async (req, res) => {
    const { name, sub, img, category, type, price, duration, status } = req.body;
    const [result] = await pool.query(
      "INSERT INTO services (name, sub, img, category, type, price, duration, status) VALUES (?,?,?,?,?,?,?,?)",
      [name, sub || null, img || null, category, type, price, duration || null, status || "Active"]
    );
    req.audit("create", "service", result.insertId, { name });
    created(res, { id: result.insertId });
  })
);

// admin update
router.patch(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, SERVICE_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE services SET ${setClause} WHERE id = ?`, values);
    req.audit("update", "service", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// admin soft-delete
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id FROM services WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("UPDATE services SET deleted_at = NOW(), status = 'Inactive' WHERE id = ?", [req.params.id]);
    req.audit("delete", "service", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;
