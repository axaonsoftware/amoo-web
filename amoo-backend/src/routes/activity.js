const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");
const { validate } = require("../middleware/validate");
const { logAudit } = require("../utils/audit");
const { ok, paginated, parsePagination } = require("../utils/response");

// POST /api/activity/log — fire-and-forget activity logging from the frontend.
// Accepts: { action, action_details, entity, entity_id, page_or_route }
// Automatically captures actor from JWT, plus ip and user-agent.
router.post(
  "/log",
  authRequired,
  validate("activityLog"),
  asyncHandler(async (req, res) => {
    const { action, action_details, entity, entity_id, page_or_route } = req.body;
    // Fire-and-forget: don't await — never slow down the UI
    logAudit({
      actor_id: req.user.id,
      actor_type: req.user.kind || "user",
      action,
      entity: entity || "activity",
      entity_id: entity_id ?? null,
      meta: action_details || {},
      ip_address: req.ip,
      user_agent: req.headers["user-agent"] || null,
      page_or_route: page_or_route || null,
    });
    ok(res, { logged: true });
  })
);

// GET /api/activity/mine — get the current user's own activity (paginated).
// Works for all actor types (user, admin, expert).
router.get(
  "/mine",
  authRequired,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const userId = req.user.id;
    const actorType = req.user.kind || "user";
    const resultCount = await pool.query(
      "SELECT COUNT(*) AS total FROM audit_log WHERE actor_id = $1 AND actor_type = $2",
      [userId, actorType]
    );
    const total = Number(resultCount.rows[0].total);
    const result = await pool.query(
      "SELECT id, action, entity, entity_id, meta AS action_details, page_or_route, ip_address, created_at FROM audit_log WHERE actor_id = $1 AND actor_type = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
      [userId, actorType, pageSize, offset]
    );
    paginated(res, result.rows, { page, pageSize, total });
  })
);

module.exports = router;
