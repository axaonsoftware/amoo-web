const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");
const { validate } = require("../middleware/validate");
const { logAudit } = require("../utils/audit");
const { ok, paginated, parsePagination } = require("../utils/response");

// POST /api/activity/log — fire-and-forget activity logging from the frontend.
// Accepts: { action, action_details (JSON object), page_or_route }
// Automatically captures actor from JWT, plus ip and user-agent.
router.post(
  "/log",
  authRequired,
  validate("activityLog"),
  asyncHandler(async (req, res) => {
    const { action, action_details, page_or_route } = req.body;
    // Fire-and-forget: don't await — never slow down the UI
    logAudit({
      actor_id: req.user.id,
      actor_type: req.user.kind || "user",
      action,
      entity: "activity",
      meta: action_details || {},
      ip_address: req.ip,
      user_agent: req.headers["user-agent"] || null,
      page_or_route: page_or_route || null,
    });
    ok(res, { logged: true });
  })
);

// GET /api/activity/mine — get the current user's own activity (paginated).
router.get(
  "/mine",
  authRequired,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const userId = req.user.id;
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM audit_log WHERE actor_id = ? AND actor_type = ?",
      [userId, "user"]
    );
    const [rows] = await pool.query(
      "SELECT id, action, meta AS action_details, page_or_route, ip_address, created_at FROM audit_log WHERE actor_id = ? AND actor_type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [userId, "user", pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

module.exports = router;
