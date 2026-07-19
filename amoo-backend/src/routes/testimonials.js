const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { asyncHandler } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");

// GET /api/testimonials
router.get("/", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM testimonials WHERE status = 'Active' ORDER BY created_at DESC");
  res.json(rows);
}));

// public submit
router.post("/", validate(schemas.testimonial), asyncHandler(async (req, res) => {
  const { name, comment, rating, user_id, avatar } = req.body;
  const [result] = await pool.query(
    "INSERT INTO testimonials (user_id, name, avatar, comment, rating) VALUES (?,?,?,?,?)",
    [user_id || null, name, avatar, comment, rating || 5]
  );
  res.status(201).json({ id: result.insertId });
}));

// admin
router.patch("/:id", asyncHandler(async (req, res) => {
  const { status } = req.body;
  await pool.query("UPDATE testimonials SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json({ success: true });
}));

module.exports = router;
