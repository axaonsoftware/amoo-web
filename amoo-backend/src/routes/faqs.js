const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, created, paginated, parsePagination } = require("../utils/response");

// GET /api/faqs — public, returns active FAQs ordered by sort_order
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT id, question, answer, category, sort_order FROM faqs WHERE active = true ORDER BY category ASC, sort_order ASC`
    );
    ok(res, result.rows);
  })
);

// GET /api/faqs/all — admin, returns all FAQs (including inactive)
router.get(
  "/all",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE 1=1";
    let p = 0;
    if (req.query.category) { where += ` AND category = $${++p}`; params.push(req.query.category); }
    if (req.query.active !== undefined && req.query.active !== null) { where += ` AND active = $${++p}`; params.push(req.query.active ? true : false); }
    if (req.query.search) { where += ` AND (question LIKE $${++p} OR answer LIKE $${++p})`; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
    const resultCount = await pool.query(`SELECT COUNT(*) AS total FROM faqs ${where}`, params);
    const total = Number(resultCount.rows[0].total);
    params.push(pageSize, offset);
    const result = await pool.query(
      `SELECT * FROM faqs ${where} ORDER BY category ASC, sort_order ASC LIMIT $${++p} OFFSET $${++p}`,
      params
    );
    paginated(res, result.rows, { page, pageSize, total });
  })
);

// POST /api/faqs — admin create
router.post(
  "/",
  adminRequired,
  validate("faq"),
  asyncHandler(async (req, res) => {
    const { question, answer, category, sort_order, active } = req.body;
    const result = await pool.query(
      `INSERT INTO faqs (question, answer, category, sort_order, active) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [question, answer, category || "General", sort_order || 0, active !== undefined ? (active ? true : false) : true]
    );
    const insertId = result.rows[0].id;
    req.audit("create", "faq", insertId, { question: question.substring(0, 100) });
    created(res, { id: insertId });
  })
);

// PATCH /api/faqs/:id — admin update
router.patch(
  "/:id",
  adminRequired,
  validate("faqUpdate"),
  asyncHandler(async (req, res) => {
    const fields = { ...req.body };
    if (fields.active !== undefined) fields.active = fields.active ? true : false;
    const { setClause, values } = buildUpdate(fields, ["question", "answer", "category", "sort_order", "active"], [req.params.id]);
    const result = await pool.query(`UPDATE faqs SET ${setClause} WHERE id = $${values.length}`, values);
    if (result.rowCount === 0) throw new HttpError(404, "FAQ not found");
    req.audit("update", "faq", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// DELETE /api/faqs/:id — admin soft-delete (sets active=false)
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const result = await pool.query("UPDATE faqs SET active = false WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) throw new HttpError(404, "FAQ not found");
    req.audit("delete", "faq", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;
