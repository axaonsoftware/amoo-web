const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, fail, parsePagination } = require("../utils/response");
const { sendNotificationEmail } = require("../services/email");

// GET /api/notifications (own + broadcast)
router.get(
  "/",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM notifications WHERE (user_id = ? OR user_id IS NULL)",
      [req.user.id]
    );
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE (user_id = ? OR user_id IS NULL) ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [req.user.id, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/notifications/unread-count
router.get(
  "/unread-count",
  authRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0",
      [req.user.id]
    );
    ok(res, rows[0]);
  })
);

// POST /api/notifications/:id/read (ownership-checked)
router.post(
  "/:id/read",
  authRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM notifications WHERE id = ?", [req.params.id]);
    if (rows.length && rows[0].user_id && rows[0].user_id !== req.user.id) {
      return fail(res, 403, "Forbidden");
    }
    await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [req.params.id]);
    ok(res, { id: Number(req.params.id), read: true });
  })
);

// POST /api/notifications/read-all (mark all own+broadcast as read)
router.post(
  "/read-all",
  authRequired,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0",
      [req.user.id]
    );
    ok(res, { marked: result.affectedRows });
  })
);

// DELETE /api/notifications/:id (own or admin)
// Broadcast notifications (user_id IS NULL) may be READ by any user, but only
// an admin may delete them (otherwise any user could delete global notices).
router.delete(
  "/:id",
  authRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM notifications WHERE id = ?", [req.params.id]);
    if (!rows.length) return ok(res, { id: Number(req.params.id), deleted: true });
    const n = rows[0];
    if (n.user_id && n.user_id !== req.user.id && req.user.kind !== "admin") {
      return fail(res, 403, "Forbidden");
    }
    if (!n.user_id && req.user.kind !== "admin") {
      return fail(res, 403, "Forbidden");
    }
    await pool.query("DELETE FROM notifications WHERE id = ?", [req.params.id]);
    req.audit("delete", "notification", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

// admin: create for a user (or broadcast with user_id null)
router.post(
  "/",
  adminRequired,
  validate("notification"),
  asyncHandler(async (req, res) => {
    const { user_id, title, message, type } = req.body;
    const [result] = await pool.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [user_id || null, title, message, type || "info"]
    );
    req.audit("create", "notification", result.insertId, { user_id });

    // Fire-and-forget: send email notification
    (async () => {
      try {
        const emails = [];
        if (user_id) {
          // Targeted — fetch that user's email
          const [[u]] = await pool.query(
            "SELECT email FROM users WHERE id = ? AND deleted_at IS NULL",
            [user_id]
          );
          if (u?.email) emails.push(u.email);
        } else {
          // Broadcast — send to all verified users
          const [rows] = await pool.query(
            "SELECT email FROM users WHERE verified = 1 AND deleted_at IS NULL AND email IS NOT NULL AND email != ''"
          );
          for (const r of rows) {
            if (r.email) emails.push(r.email);
          }
        }
        if (emails.length) {
          await sendNotificationEmail(emails.join(","), title, message);
        }
      } catch (err) {
        // Email failure must never break the API response
      }
    })();

    created(res, { id: result.insertId });
  })
);

// admin: all
router.get(
  "/all",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM notifications");
    const [rows] = await pool.query(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

module.exports = router;
