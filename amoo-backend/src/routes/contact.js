const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { validate, schemas } = require("../middleware/validate");
const { asyncHandler } = require("../utils/helpers");

// POST /api/contact  (public enquiry)
router.post("/", validate(schemas.contact), asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const [result] = await pool.query(
    "INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone, subject, message]
  );
  res.status(201).json({ id: result.insertId, message: "Message received" });
}));

// admin: list
router.get("/", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM contacts ORDER BY created_at DESC");
  res.json(rows);
}));

// admin: update status
router.patch("/:id", asyncHandler(async (req, res) => {
  const { status } = req.body;
  await pool.query("UPDATE contacts SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
