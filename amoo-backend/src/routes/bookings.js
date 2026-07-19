const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, genBookingRef, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

const BOOKING_UPDATE_ALLOWED = ["status", "payment", "expert_id", "notes"];

const LIST_SELECT = `
  SELECT b.*, u.name AS user_name, e.name AS expert_name, s.name AS service_name
  FROM bookings b
  JOIN users u ON u.id = b.user_id
  LEFT JOIN experts e ON e.id = b.expert_id
  JOIN services s ON s.id = b.service_id`;

// GET /api/bookings -> user sees own, admin sees all (paginated, filters)
router.get(
  "/",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "";
    if (req.user.kind !== "admin") {
      where = "WHERE b.user_id = ?";
      params.push(req.user.id);
    }
    const add = (clause, val) => {
      where += where ? " AND" : "WHERE";
      where += clause;
      params.push(val);
    };
    if (req.query.status) add(" b.status = ?", req.query.status);
    if (req.query.expert_id) add(" b.expert_id = ?", req.query.expert_id);
    if (req.query.service_id) add(" b.service_id = ?", req.query.service_id);
    if (req.query.user_id && req.user.kind === "admin") add(" b.user_id = ?", req.query.user_id);
    if (req.query.date_from) add(" b.date >= ?", req.query.date_from);
    if (req.query.date_to) add(" b.date <= ?", req.query.date_to);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM bookings b ${where}`,
      params
    );
    const [rows] = await pool.query(
      `${LIST_SELECT} ${where} ORDER BY b.date DESC, b.time DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/bookings/:id
router.get(
  "/:id",
  authRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`${LIST_SELECT} WHERE b.id = ?`, [req.params.id]);
    if (assertFound(res, rows[0])) return;
    if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    ok(res, rows[0]);
  })
);

// POST /api/bookings (create booking + payment + reserve slot, all in a transaction)
router.post(
  "/",
  authRequired,
  validate("booking"),
  asyncHandler(async (req, res) => {
    const { service_id, expert_id, slot_id, date, time, mode, amount, payment, method, notes } = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Server-side price enforcement: never trust the client-supplied amount.
      const [[svc]] = await conn.query("SELECT id, price FROM services WHERE id = ? AND deleted_at IS NULL", [service_id]);
      if (!svc) throw new HttpError(404, "Service not found");
      const expected = Number(svc.price);
      // Paid bookings must match the real service price exactly; pending-payment
      // bookings (pay later) are allowed to carry a 0 amount.
      const isPending = payment !== "Paid";
      if (isPending) {
        if (Number(amount) !== 0) throw new HttpError(400, "Pending bookings must have amount 0");
      } else if (Math.abs(Number(amount) - expected) > 0.01) {
        throw new HttpError(400, "Amount does not match the service price");
      }

      // Reserve slot if provided
      if (slot_id) {
        const [slots] = await conn.query("SELECT * FROM slots WHERE id = ? FOR UPDATE", [slot_id]);
        if (!slots.length) throw new HttpError(404, "Slot not found");
        if (slots[0].status !== "available") throw new HttpError(409, "Slot not available");
        await conn.query("UPDATE slots SET status = 'booked' WHERE id = ?", [slot_id]);
      }

      const ref = genBookingRef();
      const status = payment === "Paid" ? "upcoming" : "pending-payment";
      const [result] = await conn.query(
        `INSERT INTO bookings (booking_ref, user_id, expert_id, service_id, slot_id, date, time, mode, amount, payment, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ref, req.user.id, expert_id || null, service_id, slot_id || null, date, time, mode || null, amount, payment, status, notes || null]
      );
      const bookingId = result.insertId;

      if (payment === "Paid") {
        await conn.query(
          "INSERT INTO payments (booking_id, user_id, amount, method, status) VALUES (?, ?, ?, ?, 'success')",
          [bookingId, req.user.id, amount, method || "card"]
        );
        await conn.query("UPDATE services SET bookings = bookings + 1 WHERE id = ?", [service_id]);
      }

      await conn.commit();
      const [rows] = await conn.query("SELECT * FROM bookings WHERE id = ?", [bookingId]);
      req.audit("create", "booking", bookingId, { booking_ref: ref });
      created(res, rows[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  })
);

// admin update status/payment
router.patch(
  "/:id",
  adminRequired,
  validate("bookingUpdate"),
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, BOOKING_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE bookings SET ${setClause} WHERE id = ?`, values);
    req.audit("update", "booking", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// cancel (owner or admin)
router.delete(
  "/:id",
  authRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT user_id, slot_id FROM bookings WHERE id = ?", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    // Release the slot if one was reserved
    if (rows[0].slot_id) {
      await pool.query("UPDATE slots SET status = 'available' WHERE id = ?", [rows[0].slot_id]);
    }
    await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    req.audit("cancel", "booking", Number(req.params.id));
    ok(res, { id: Number(req.params.id), cancelled: true });
  })
);

// POST /api/bookings/:id/complete  (admin marks a booking completed)
router.post(
  "/:id/complete",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id FROM bookings WHERE id = ?", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("UPDATE bookings SET status = 'completed' WHERE id = ?", [req.params.id]);
    req.audit("complete", "booking", Number(req.params.id));
    ok(res, { id: Number(req.params.id), status: "completed" });
  })
);

module.exports = router;
