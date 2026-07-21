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
  validate("contact"),
  asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    const [result] = await pool.query(
      "INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone || null, subject || null, message]
    );
    created(res, { id: result.insertId, message: "Message received" });
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
    if (req.query.status) { where += " AND status = ?"; params.push(req.query.status); }
    if (req.query.search) { where += " AND (name LIKE ? OR email LIKE ? OR subject LIKE ?)"; params.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`); }
    if (req.query.date_from) { where += " AND created_at >= ?"; params.push(req.query.date_from); }
    if (req.query.date_to) { where += " AND created_at <= ?"; params.push(req.query.date_to + " 23:59:59"); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM contacts ${where}`, params);
    const [rows] = await pool.query(
      "SELECT * FROM contacts " + where + " ORDER BY created_at DESC LIMIT ? OFFSET ?",
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
    const [rows] = await pool.query("SELECT * FROM contacts WHERE id = ?", [req.params.id]);
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
    await pool.query(`UPDATE contacts SET ${setClause} WHERE id = ?`, values);
    req.audit("update", "contact", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// admin: delete
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id FROM contacts WHERE id = ?", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("DELETE FROM contacts WHERE id = ?", [req.params.id]);
    req.audit("delete", "contact", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

module.exports = router;
