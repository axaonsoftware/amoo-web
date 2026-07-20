const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination } = require("../utils/response");

// Ensure a conversation exists between a user and an expert (or support).
async function ensureConversation(conn, userA, userB) {
  const [existing] = await conn.query(
    "SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?)",
    [userA, userB, userB, userA]
  );
  if (existing.length) return existing[0];
  const [result] = await conn.query(
    "INSERT INTO conversations (user_a, user_b) VALUES (?, ?)",
    [userA, userB]
  );
  const [created] = await conn.query("SELECT * FROM conversations WHERE id = ?", [result.insertId]);
  return created[0];
}

// POST /api/chat/conversations  (start or resume a conversation)
// SECURITY: a user may only open a conversation with an EXPERT (or support),
// never directly with arbitrary other users / admins. This prevents
// unsolicited DMs / spam between members.
router.post(
  "/conversations",
  authRequired,
  validate("chatConversation"),
  asyncHandler(async (req, res) => {
    const { participant_id } = req.body;
    if (participant_id === req.user.id) {
      return res.status(400).json({ success: false, error: "Cannot chat with yourself" });
    }
    const [expert] = await pool.query(
      "SELECT id FROM experts WHERE id = ? AND status = 'active' AND deleted_at IS NULL",
      [participant_id]
    );
    if (!expert.length) {
      return res.status(403).json({ success: false, error: "You can only start a conversation with an expert" });
    }
    const conn = await pool.getConnection();
    try {
      const conv = await ensureConversation(conn, req.user.id, participant_id);
      ok(res, conv);
    } finally {
      conn.release();
    }
  })
);

// GET /api/chat/conversations  (my conversations, or all for admin)
router.get(
  "/conversations",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    if (req.user.kind === "admin") {
      const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM conversations");
      const [rows] = await pool.query(
        "SELECT * FROM conversations ORDER BY last_message_at DESC LIMIT ? OFFSET ?",
        [pageSize, offset]
      );
      paginated(res, rows, { page, pageSize, total });
      return;
    }
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM conversations WHERE user_a = ? OR user_b = ?",
      [req.user.id, req.user.id]
    );
    const [rows] = await pool.query(
      `SELECT c.*,
              CASE WHEN c.user_a = ? THEN c.user_b ELSE c.user_a END AS other_id
       FROM conversations c
       WHERE c.user_a = ? OR c.user_b = ?
       ORDER BY c.last_message_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, req.user.id, req.user.id, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// POST /api/chat/conversations/:id/read  (mark all messages in conversation read for this user)
router.post(
  "/conversations/:id/read",
  authRequired,
  asyncHandler(async (req, res) => {
    const [conv] = await pool.query("SELECT * FROM conversations WHERE id = ?", [req.params.id]);
    if (assertFound(res, conv[0])) return;
    const c = conv[0];
    if (c.user_a !== req.user.id && c.user_b !== req.user.id && req.user.kind !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    await pool.query(
      "UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?",
      [c.id, req.user.id]
    );
    ok(res, { id: c.id, read: true });
  })
);

// GET /api/chat/conversations/:id/messages
router.get(
  "/conversations/:id/messages",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const [conv] = await pool.query("SELECT * FROM conversations WHERE id = ?", [req.params.id]);
    if (assertFound(res, conv[0])) return;
    const c = conv[0];
    if (c.user_a !== req.user.id && c.user_b !== req.user.id && req.user.kind !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM messages WHERE conversation_id = ?",
      [req.params.id]
    );
    const [rows] = await pool.query(
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?",
      [req.params.id, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// POST /api/chat/conversations/:id/messages
router.post(
  "/conversations/:id/messages",
  authRequired,
  validate("chatMessage"),
  asyncHandler(async (req, res) => {
    const { content } = req.body;
    const conn = await pool.getConnection();
    try {
      const [conv] = await conn.query("SELECT * FROM conversations WHERE id = ?", [req.params.id]);
      if (assertFound(res, conv[0])) return;
      const c = conv[0];
      const isParticipant = c.user_a === req.user.id || c.user_b === req.user.id || req.user.kind === "admin";
      if (!isParticipant) return res.status(403).json({ success: false, error: "Forbidden" });
      const [result] = await conn.query(
        "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
        [c.id, req.user.id, content]
      );
      await conn.query("UPDATE conversations SET last_message_at = NOW() WHERE id = ?", [c.id]);
      req.audit("chat-message", "conversation", c.id, { message_id: result.insertId });
      created(res, { id: result.insertId });
    } finally {
      conn.release();
    }
  })
);

module.exports = router;
