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

// GET /api/slots/availability  (admin: per-expert slot utilisation)
//
// The admin availability table needs one row per expert with total/booked/
// available counts. GET /api/slots returns individual slot ROWS, so the table
// looked for `total_slots` / `booked_slots` fields that no endpoint has ever
// returned and fell back to `|| 24` and `Math.floor(total * 0.6)` — showing a
// fabricated "24 slots, 60% booked" for every astrologer. Doing the aggregation
// here keeps it one query instead of one request per expert.
router.get(
  "/availability",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const params = [];
    let slotWhere = "";
    if (req.query.date) {
      slotWhere = "AND s.date = ?";
      params.push(req.query.date);
    } else if (req.query.date_from || req.query.date_to) {
      if (req.query.date_from) { slotWhere += " AND s.date >= ?"; params.push(req.query.date_from); }
      if (req.query.date_to) { slotWhere += " AND s.date <= ?"; params.push(req.query.date_to); }
    } else {
      // Default window: today onward. Past slots are not "availability".
      slotWhere = "AND s.date >= CURDATE()";
    }

    const searchParams = [];
    let expertWhere = "WHERE e.deleted_at IS NULL";
    if (req.query.status) { expertWhere += " AND e.status = ?"; searchParams.push(req.query.status); }
    if (req.query.search) {
      expertWhere += " AND (e.name LIKE ? OR e.specialties LIKE ?)";
      searchParams.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    // LEFT JOIN so an expert with no slots appears with zeroes rather than
    // vanishing from the table.
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.avatar, e.specialties, e.status, e.rating,
              COUNT(s.id) AS total_slots,
              SUM(CASE WHEN s.status = 'booked'    THEN 1 ELSE 0 END) AS booked_slots,
              SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) AS available_slots,
              SUM(CASE WHEN s.status = 'blocked'   THEN 1 ELSE 0 END) AS blocked_slots,
              MIN(s.date) AS first_slot_date,
              MAX(s.date) AS last_slot_date
         FROM experts e
         LEFT JOIN slots s ON s.expert_id = e.id ${slotWhere}
         ${expertWhere}
        GROUP BY e.id
        ORDER BY booked_slots DESC, e.name ASC`,
      [...params, ...searchParams]
    );

    ok(
      res,
      rows.map((r) => {
        const total = Number(r.total_slots) || 0;
        const booked = Number(r.booked_slots) || 0;
        return {
          ...r,
          total_slots: total,
          booked_slots: booked,
          available_slots: Number(r.available_slots) || 0,
          blocked_slots: Number(r.blocked_slots) || 0,
          // Computed server-side so every consumer shows the same number.
          utilisation_pct: total > 0 ? Math.round((booked / total) * 100) : 0,
        };
      })
    );
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
  validate("slotUpdate"),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const [result] = await pool.query("UPDATE slots SET status = ? WHERE id = ?", [status, req.params.id]);
    // Reporting 200 for a slot that does not exist made the admin UI show a
    // successful save against a row it had never loaded.
    if (result.affectedRows === 0) throw new HttpError(404, "Slot not found");
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
