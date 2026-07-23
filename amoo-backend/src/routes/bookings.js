const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, verifiedRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, genBookingRef, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, fail, assertFound, parsePagination } = require("../utils/response");

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
    // The admin bookings table has a search box that sent `?search=` to an
    // endpoint that never parsed it, so it silently did nothing.
    if (req.query.search) {
      const term = `%${req.query.search}%`;
      where += where ? " AND" : "WHERE";
      where += " (b.booking_ref LIKE ? OR u.name LIKE ? OR s.name LIKE ?)";
      params.push(term, term, term);
    }
    // The count must use the same joins as LIST_SELECT: `search` and
    // `expert_name` filters reference the joined tables.
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       LEFT JOIN experts e ON e.id = b.expert_id
       JOIN services s ON s.id = b.service_id ${where}`,
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
      return fail(res, 403, "Forbidden");
    }
    ok(res, rows[0]);
  })
);

// POST /api/bookings (create booking + payment + reserve slot, all in a transaction)
router.post(
  "/",
  authRequired,
  verifiedRequired,
  validate("booking"),
  asyncHandler(async (req, res) => {
    const { service_id, expert_id, slot_id, date, time, mode, amount, notes } = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Server-side price enforcement: never trust the client-supplied amount.
      // The booking always stores the real service price; the client `amount` is
      // only cross-checked so a stale UI price surfaces as a 400 rather than
      // silently charging something else. 0 means "pay later".
      const [[svc]] = await conn.query("SELECT id, price FROM services WHERE id = ? AND deleted_at IS NULL", [service_id]);
      if (!svc) throw new HttpError(404, "Service not found");
      const expected = Number(svc.price);
      if (Number(amount) !== 0 && Math.abs(Number(amount) - expected) > 0.01) {
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
      // SECURITY: bookings are ALWAYS created unpaid. This route never inserts a
      // payments row — only /api/payments/verify (signature-checked) and the
      // gateway webhook may mark a booking Paid. Anything else lets a client
      // conjure a confirmed booking without money moving.
      const [result] = await conn.query(
        `INSERT INTO bookings (booking_ref, user_id, expert_id, service_id, slot_id, date, time, mode, amount, payment, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'pending-payment', ?)`,
        [ref, req.user.id, expert_id || null, service_id, slot_id || null, date, time, mode || null, expected, notes || null]
      );
      const bookingId = result.insertId;

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
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // FOR UPDATE so a double-clicked Cancel cannot run the slot release twice.
      const [rows] = await conn.query(
        "SELECT id, user_id, slot_id, status, payment, amount FROM bookings WHERE id = ? FOR UPDATE",
        [req.params.id]
      );
      const booking = rows[0];
      if (!booking) {
        await conn.rollback();
        return fail(res, 404, "Resource not found");
      }
      if (req.user.kind !== "admin" && booking.user_id !== req.user.id) {
        await conn.rollback();
        return fail(res, 403, "Forbidden");
      }

      // Cancelling an already-cancelled booking used to re-run the slot release,
      // which could free a slot that had since been re-booked by someone else.
      if (booking.status === "cancelled") {
        await conn.rollback();
        return ok(res, { id: booking.id, cancelled: true, already_cancelled: true });
      }
      // A delivered consultation is not cancellable — that is a refund decision,
      // which is admin-only and goes through POST /api/payments/:id/refund.
      if (booking.status === "completed") {
        await conn.rollback();
        return fail(res, 409, "A completed booking cannot be cancelled. Request a refund instead.");
      }

      if (booking.slot_id) {
        // Only release a slot this booking actually holds. Without the status
        // guard, cancelling could free a slot another booking now owns.
        await conn.query(
          "UPDATE slots SET status = 'available' WHERE id = ? AND status = 'booked'",
          [booking.slot_id]
        );
      }
      await conn.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [booking.id]);
      await conn.commit();

      req.audit("cancel", "booking", booking.id, {
        was_paid: booking.payment === "Paid",
        amount: booking.amount,
      });

      // A paid booking still owes the customer money. Refunds move real funds
      // through the gateway and are admin-only, so this cannot settle itself —
      // it flags the obligation instead of silently dropping it.
      const refundDue = booking.payment === "Paid";
      ok(res, {
        id: booking.id,
        cancelled: true,
        refund_due: refundDue,
        message: refundDue
          ? "Booking cancelled. A refund is due and will be processed by our team."
          : "Booking cancelled.",
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
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
