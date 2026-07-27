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
    if (req.query.category) { where += ` AND category = $${params.length + 1}`; params.push(req.query.category); }
    if (req.query.type) { where += ` AND type = $${params.length + 1}`; params.push(req.query.type); }
    if (req.query.search) { where += ` AND (name LIKE $${params.length + 1} OR sub LIKE $${params.length + 2})`; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
    const { rows: [{ total }] } = await pool.query(`SELECT COUNT(*) AS total FROM services ${where}`, params);
    const n = params.length;
    const { rows } = await pool.query(
      `SELECT * FROM services ${where} ORDER BY category, name LIMIT $${n + 1} OFFSET $${n + 2}`,
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
    if (req.query.status) { where += ` AND status = $${params.length + 1}`; params.push(req.query.status); }
    if (req.query.category) { where += ` AND category = $${params.length + 1}`; params.push(req.query.category); }
    if (req.query.type) { where += ` AND type = $${params.length + 1}`; params.push(req.query.type); }
    if (req.query.search) { where += ` AND (name LIKE $${params.length + 1} OR sub LIKE $${params.length + 2})`; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
    const { rows: [{ total }] } = await pool.query(`SELECT COUNT(*) AS total FROM services ${where}`, params);
    const n = params.length;
    const { rows } = await pool.query(
      `SELECT * FROM services ${where} ORDER BY id DESC LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/services/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM services WHERE id = $1 AND deleted_at IS NULL", [req.params.id]);
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
    const result = await pool.query(
      "INSERT INTO services (name, sub, img, category, type, price, duration, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
      [name, sub || null, img || null, category, type, price, duration || null, status || "Active"]
    );
    req.audit("create", "service", result.rows[0].id, { name });
    created(res, { id: result.rows[0].id });
  })
);

// admin update
router.patch(
  "/:id",
  adminRequired,
  validate("serviceUpdate"),
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, SERVICE_UPDATE_ALLOWED);
    await pool.query(`UPDATE services SET ${setClause} WHERE id = $${values.length + 1}`, [...values, req.params.id]);
    req.audit("update", "service", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// admin soft-delete
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT id FROM services WHERE id = $1 AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("UPDATE services SET deleted_at = NOW(), status = 'Inactive' WHERE id = $1", [req.params.id]);
    req.audit("delete", "service", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;
