const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");
const { validateQuery } = require("../middleware/validate");
const { ok, paginated, parsePagination } = require("../utils/response");

// GET /api/audit (admin, paginated + filters)
router.get(
  "/",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE 1=1";
    let p = 0;
    if (req.query.actor_id) { where += ` AND actor_id = $${++p}`; params.push(req.query.actor_id); }
    if (req.query.actor_type) { where += ` AND actor_type = $${++p}`; params.push(req.query.actor_type); }
    if (req.query.action) { where += ` AND action LIKE $${++p}`; params.push(`%${req.query.action}%`); }
    if (req.query.entity) { where += ` AND entity = $${++p}`; params.push(req.query.entity); }
    if (req.query.date_from) { where += ` AND created_at >= $${++p}`; params.push(req.query.date_from); }
    if (req.query.date_to) { where += ` AND created_at <= $${++p}`; params.push(req.query.date_to + " 23:59:59"); }
    const resultCount = await pool.query(`SELECT COUNT(*) AS total FROM audit_log ${where}`, params);
    const total = Number(resultCount.rows[0].total);
    params.push(pageSize, offset);
    const result = await pool.query(
      `SELECT id, actor_id, actor_type, action, entity, entity_id, meta AS action_details, ip_address, user_agent, page_or_route, created_at FROM audit_log ${where} ORDER BY created_at DESC LIMIT $${++p} OFFSET $${++p}`,
      params
    );
    paginated(res, result.rows, { page, pageSize, total });
  })
);

module.exports = router;
