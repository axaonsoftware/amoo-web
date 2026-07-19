const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

// GET /api/slots?expert_id=1&date=2025-05-18 (public + filters)
router.get(
  "/",
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE 1=1";
    if (req.query.expert_id) { where += " AND expert_id = ?"; params.push(req.query.expert_id); }
    if (req.query.date) { where += " AND date = ?"; params.push(req.query.date); }
    if (req.query.status) { where += " AND status = ?"; params.push(req.query.status); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM slots ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM slots ${where} ORDER BY date, start_time LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// admin create slot
router.post(
  "/",
  adminRequired,
  validate("slot"),
  asyncHandler(async (req, res) => {
    const { expert_id, date, start_time, end_time, status } = req.body;
    const [result] = await pool.query(
      "INSERT INTO slots (expert_id, date, start_time, end_time, status) VALUES (?,?,?,?,?)",
      [expert_id, date, start_time, end_time || null, status || "available"]
    );
    req.audit("create", "slot", result.insertId, { expert_id });
    created(res, { id: result.insertId });
  })
);

// admin book/block/unblock slot
router.patch(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!["available", "booked", "blocked"].includes(status)) throw new HttpError(400, "Invalid status");
    await pool.query("UPDATE slots SET status = ? WHERE id = ?", [status, req.params.id]);
    req.audit("update", "slot", Number(req.params.id), { status });
    ok(res, { id: Number(req.params.id), status });
  })
);

// admin delete slot
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id FROM slots WHERE id = ?", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("DELETE FROM slots WHERE id = ?", [req.params.id]);
    req.audit("delete", "slot", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;
