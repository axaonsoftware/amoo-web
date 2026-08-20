const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

// POST /api/contact (public enquiry)
router.post(
  "/",
  (req, res, next) => {
    // Honeypot: silently accept (but don't store) if a bot filled the hidden field.
    // Must run BEFORE validate() which strips unknown keys.
    if (req.body && req.body.honeypot) return created(res, { id: 0, message: "Message received" });
    next();
  },
  validate("contact"),
  asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    const result = await pool.query(
      "INSERT INTO contacts (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, phone || null, subject || null, message]
    );
    created(res, { id: result.rows[0].id, message: "Message received" });
  })
);

// admin: list (+ filters)
router.get(
  "/",
  adminRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE 1=1";
    let paramIndex = 0;
    if (req.query.status) { where += ` AND status = $${++paramIndex}`; params.push(req.query.status); }
    if (req.query.search) { where += ` AND (name LIKE $${++paramIndex} OR email LIKE $${++paramIndex} OR subject LIKE $${++paramIndex})`; params.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`); }
    if (req.query.date_from) { where += ` AND created_at >= $${++paramIndex}`; params.push(req.query.date_from); }
    if (req.query.date_to) { where += ` AND created_at <= $${++paramIndex}`; params.push(req.query.date_to + " 23:59:59"); }
    const { rows: [{ total }] } = await pool.query(`SELECT COUNT(*) AS total FROM contacts ${where}`, params);
    const { rows } = await pool.query(
      `SELECT * FROM contacts ${where} ORDER BY created_at DESC LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// admin: get one
router.get(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM contacts WHERE id = $1", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    ok(res, rows[0]);
  })
);

// admin: update status (or reply note)
router.patch(
  "/:id",
  adminRequired,
  validate("contactUpdate"),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (status && !["new", "replied", "closed"].includes(status)) {
      throw new HttpError(400, "Invalid status");
    }
    const { setClause, values } = buildUpdate(req.body, ["status", "reply"], [req.params.id]);
    let paramIdx = 0;
    const pgSetClause = setClause.replace(/\?/g, () => `$${++paramIdx}`);
    const result = await pool.query(`UPDATE contacts SET ${pgSetClause} WHERE id = $${values.length}`, values);
    if (result.rowCount === 0) throw new HttpError(404, "Contact not found");
    req.audit("update", "contact", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// admin: delete
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT id FROM contacts WHERE id = $1", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("DELETE FROM contacts WHERE id = $1", [req.params.id]);
    req.audit("delete", "contact", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;
