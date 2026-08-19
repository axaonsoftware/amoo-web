const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

(async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS service_expert_pricing (
      id SERIAL PRIMARY KEY,
      service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      expert_id INTEGER NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
      price NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(service_id, expert_id)
    )`);
  } catch (_) {}
})();

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

// GET /api/services/:id/pricing — list expert prices for a service
router.get(
  "/:id/pricing",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT sep.id, sep.service_id, sep.expert_id, sep.price, sep.created_at,
              e.name AS expert_name, e.avatar AS expert_avatar
       FROM service_expert_pricing sep
       JOIN experts e ON e.id = sep.expert_id
       WHERE sep.service_id = $1`,
      [req.params.id]
    );
    ok(res, rows);
  })
);

// POST /api/services/:id/pricing — set expert price (upsert)
router.post(
  "/:id/pricing",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { expert_id, price } = req.body;
    if (!expert_id || price === undefined || price === null) {
      throw new (require("../utils/helpers").HttpError)(400, "expert_id and price are required");
    }
    const { rows: service } = await pool.query(
      "SELECT id FROM services WHERE id = $1 AND deleted_at IS NULL",
      [req.params.id]
    );
    if (assertFound(res, service[0])) return;
    const { rows: expert } = await pool.query(
      "SELECT id FROM experts WHERE id = $1 AND deleted_at IS NULL",
      [expert_id]
    );
    if (assertFound(res, expert[0])) return;
    const { rows } = await pool.query(
      `INSERT INTO service_expert_pricing (service_id, expert_id, price)
       VALUES ($1, $2, $3)
       ON CONFLICT (service_id, expert_id)
       DO UPDATE SET price = EXCLUDED.price
       RETURNING id, service_id, expert_id, price`,
      [req.params.id, expert_id, price]
    );
    ok(res, rows[0]);
  })
);

// DELETE /api/services/:id/pricing/:expertId — remove expert price
router.delete(
  "/:id/pricing/:expertId",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      "DELETE FROM service_expert_pricing WHERE service_id = $1 AND expert_id = $2 RETURNING id",
      [req.params.id, req.params.expertId]
    );
    if (assertFound(res, rows[0])) return;
    ok(res, { deleted: true });
  })
);

module.exports = router;
