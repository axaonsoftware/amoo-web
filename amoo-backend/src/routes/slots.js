const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired, verifiedRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

const toPg = (sql) => { let i = 0; return sql.replace(/\?/g, () => `$${++i}`); };

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
    const { rows: [{ total }] } = await pool.query(toPg(`SELECT COUNT(*) AS total FROM slots ${where}`), params);
    const { rows } = await pool.query(
      toPg(`SELECT * FROM slots ${where} ORDER BY date, start_time LIMIT ? OFFSET ?`),
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/slots/availability (admin: per-expert slot utilisation)
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
      slotWhere = "AND s.date >= CURRENT_DATE";
    }

    const searchParams = [];
    let expertWhere = "WHERE e.deleted_at IS NULL";
    if (req.query.status) { expertWhere += " AND e.status = ?"; searchParams.push(req.query.status); }
    if (req.query.search) {
      expertWhere += " AND (e.name ILIKE ? OR e.specialties ILIKE ?)";
      searchParams.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    const { rows } = await pool.query(
      toPg(
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
         GROUP BY
  e.id,
  e.name,
  e.avatar,
  e.specialties,
  e.status,
  e.rating
ORDER BY booked_slots DESC, e.name ASC`
      ),
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
          utilisation_pct: total > 0 ? Math.round((booked / total) * 100) : 0,
        };
      })
    );
  })
);

// admin create slot (with overlap detection)
router.post(
  "/",
  adminRequired,
  validate("slot"),
  asyncHandler(async (req, res) => {
    const { expert_id, date, start_time, end_time, status } = req.body;
    const startHour = Number(start_time.slice(0, 2));
    const effectiveEnd = end_time || `${String(Math.min(startHour + 1, 23)).padStart(2, "0")}${start_time.slice(2)}`;
    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM slots
        WHERE expert_id = $1 AND date = $2
          AND start_time < $3 AND COALESCE(end_time, (start_time + INTERVAL '1 hour')) > $4`,
      [expert_id, date, effectiveEnd, start_time]
    );
    if (count > 0) {
      throw new HttpError(409, "Slot overlaps with an existing slot for this expert on this date");
    }
    const result = await pool.query(
      "INSERT INTO slots (expert_id, date, start_time, end_time, status) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [expert_id, date, start_time, end_time || null, status || "available"]
    );
    const id = result.rows[0].id;
    req.audit("create", "slot", id, { expert_id });
    created(res, { id });
  })
);

// admin book/block/unblock slot
router.patch(
  "/:id",
  adminRequired,
  validate("slotUpdate"),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const result = await pool.query("UPDATE slots SET status = $1 WHERE id = $2", [status, req.params.id]);
    if (result.rowCount === 0) throw new HttpError(404, "Slot not found");
    req.audit("update", "slot", Number(req.params.id), { status });
    ok(res, { id: Number(req.params.id), status });
  })
);

// admin delete slot (refuse if booked)
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query("SELECT id, status FROM slots WHERE id = $1 FOR UPDATE", [req.params.id]);
      if (!rows.length) { await client.query("ROLLBACK"); throw new HttpError(404, "Slot not found"); }
      if (rows[0].status === "booked") { await client.query("ROLLBACK"); throw new HttpError(409, "Cannot delete a slot that has a booking. Cancel the booking first."); }
      await client.query("DELETE FROM slots WHERE id = $1", [req.params.id]);
      await client.query("COMMIT");
      req.audit("delete", "slot", Number(req.params.id));
      ok(res, { id: Number(req.params.id), deleted: true });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => { });
      throw err;
    } finally {
      client.release();
    }
  })
);

module.exports = router;
