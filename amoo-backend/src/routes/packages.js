const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

const PACKAGE_UPDATE_ALLOWED = ["name", "description", "price", "duration_days", "status"];

// GET /api/packages (public active)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM packages WHERE status = 'Active' AND deleted_at IS NULL ORDER BY price");
    ok(res, rows);
  })
);

// admin all (with filters)
router.get(
  "/all",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE deleted_at IS NULL";
    if (req.query.status) { where += " AND status = ?"; params.push(req.query.status); }
    if (req.query.search) { where += " AND name LIKE ?"; params.push(`%${req.query.search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM packages ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM packages ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// admin create
router.post(
  "/",
  adminRequired,
  validate("package"),
  asyncHandler(async (req, res) => {
    const { name, description, price, duration_days, status } = req.body;
    const [result] = await pool.query(
      "INSERT INTO packages (name, description, price, duration_days, status) VALUES (?,?,?,?,?)",
      [name, description || null, price, duration_days || null, status || "Active"]
    );
    req.audit("create", "package", result.insertId, { name });
    created(res, { id: result.insertId });
  })
);

router.patch(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, PACKAGE_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE packages SET ${setClause} WHERE id = ?`, values);
    req.audit("update", "package", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id FROM packages WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("UPDATE packages SET deleted_at = NOW(), status = 'Inactive' WHERE id = ?", [req.params.id]);
    req.audit("delete", "package", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;
