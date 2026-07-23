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
    const [rows] = await pool.query(
      `SELECT id, question, answer, category, sort_order FROM faqs WHERE active = 1 ORDER BY category ASC, sort_order ASC`
    );
    ok(res, rows);
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
    if (req.query.category) { where += " AND category = ?"; params.push(req.query.category); }
    if (req.query.active !== undefined && req.query.active !== null) { where += " AND active = ?"; params.push(req.query.active ? 1 : 0); }
    if (req.query.search) { where += " AND (question LIKE ? OR answer LIKE ?)"; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM faqs ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM faqs ${where} ORDER BY category ASC, sort_order ASC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// POST /api/faqs — admin create
router.post(
  "/",
  adminRequired,
  validate("faq"),
  asyncHandler(async (req, res) => {
    const { question, answer, category, sort_order, active } = req.body;
    const [result] = await pool.query(
      `INSERT INTO faqs (question, answer, category, sort_order, active) VALUES (?, ?, ?, ?, ?)`,
      [question, answer, category || "General", sort_order || 0, active !== undefined ? (active ? 1 : 0) : 1]
    );
    req.audit("create", "faq", result.insertId, { question: question.substring(0, 100) });
    created(res, { id: result.insertId });
  })
);

// PATCH /api/faqs/:id — admin update
router.patch(
  "/:id",
  adminRequired,
  validate("faqUpdate"),
  asyncHandler(async (req, res) => {
    const fields = { ...req.body };
    if (fields.active !== undefined) fields.active = fields.active ? 1 : 0;
    const { setClause, values } = buildUpdate(fields, ["question", "answer", "category", "sort_order", "active"], [req.params.id]);
    const [result] = await pool.query(`UPDATE faqs SET ${setClause} WHERE id = ?`, values);
    if (result.affectedRows === 0) throw new HttpError(404, "FAQ not found");
    req.audit("update", "faq", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// DELETE /api/faqs/:id — admin soft-delete (sets active=0)
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("UPDATE faqs SET active = 0 WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) throw new HttpError(404, "FAQ not found");
    req.audit("delete", "faq", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;
