const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired } = require("../middleware/auth");
const { asyncHandler, HttpError } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, fail, assertFound, parsePagination } = require("../utils/response");

// A conversation is always (customer, expert). `conversations` used to store
// both sides as users.id while the route supplied an experts.id, so every
// insert either violated the foreign key or attached the thread to an unrelated
// user with the same numeric id. See migrations/006_fix_chat_participants.sql.

/**
 * Load a conversation and decide whether the caller may see it.
 * Admins may read any thread; otherwise the caller must be the customer
 * (kind "user") or the expert (kind "expert") named on it.
 */
async function loadParticipantConversation(conn, id, user) {
  const [rows] = await conn.query("SELECT * FROM conversations WHERE id = ?", [id]);
  const conv = rows[0];
  if (!conv) return { conv: null, allowed: false };
  if (user.kind === "admin") return { conv, allowed: true };
  const allowed =
    (user.kind === "user" && conv.user_id === user.id) ||
    (user.kind === "expert" && conv.expert_id === user.id);
  return { conv, allowed };
}

// POST /api/chat/conversations  (start or resume a conversation)
// SECURITY: a customer may only open a conversation with an active EXPERT,
// never with another customer or an admin. This prevents unsolicited DMs.
router.post(
  "/conversations",
  authRequired,
  validate("chatConversation"),
  asyncHandler(async (req, res) => {
    const { participant_id } = req.body;

    // Only customers initiate. An expert replies inside an existing thread;
    // letting them open one would allow cold-messaging the customer base.
    if (req.user.kind !== "user") {
      return fail(res, 403, "Only customers can start a conversation");
    }

    const [expert] = await pool.query(
      "SELECT id FROM experts WHERE id = ? AND status = 'active' AND deleted_at IS NULL",
      [participant_id]
    );
    if (!expert.length) {
      return fail(res, 403, "You can only start a conversation with an active expert");
    }

    // INSERT ... ON DUPLICATE KEY relies on uniq_conversation_pair to make
    // "start or resume" atomic. The previous helper did SELECT ... FOR UPDATE
    // outside any transaction, so the lock was released immediately and two
    // simultaneous requests could both insert.
    await pool.query(
      `INSERT INTO conversations (user_id, expert_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE id = id`,
      [req.user.id, participant_id]
    );
    const [rows] = await pool.query(
      "SELECT * FROM conversations WHERE user_id = ? AND expert_id = ?",
      [req.user.id, participant_id]
    );
    ok(res, rows[0]);
  })
);

// GET /api/chat/conversations  (mine, or all for admin)
router.get(
  "/conversations",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);

    // Each caller sees the counterparty's name/avatar, plus their own unread
    // count — resolved in SQL so the client does not issue one request per row.
    const base = `
      SELECT c.*,
             u.name   AS user_name,   u.avatar AS user_avatar,
             e.name   AS expert_name, e.avatar AS expert_avatar,
             (SELECT COUNT(*) FROM messages m
               WHERE m.conversation_id = c.id AND m.is_read = 0 AND m.sender_type <> ?
             ) AS unread_count
      FROM conversations c
      JOIN users   u ON u.id = c.user_id
      JOIN experts e ON e.id = c.expert_id`;

    const viewerType = req.user.kind === "expert" ? "expert" : "user";

    let where = "";
    const params = [viewerType];
    if (req.user.kind === "user") {
      where = "WHERE c.user_id = ?";
      params.push(req.user.id);
    } else if (req.user.kind === "expert") {
      where = "WHERE c.expert_id = ?";
      params.push(req.user.id);
    }

    const countParams = params.slice(1);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM conversations c ${where}`,
      countParams
    );
    const [rows] = await pool.query(
      `${base} ${where} ORDER BY c.last_message_at IS NULL, c.last_message_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// POST /api/chat/conversations/:id/read
router.post(
  "/conversations/:id/read",
  authRequired,
  asyncHandler(async (req, res) => {
    const { conv, allowed } = await loadParticipantConversation(pool, req.params.id, req.user);
    if (assertFound(res, conv)) return;
    if (!allowed) return fail(res, 403, "Forbidden");

    // Mark everything the *other* side sent as read. Keyed on sender_type, not
    // sender_id: ids are only unique within their own table, so comparing them
    // across users/experts would mark the wrong messages.
    const viewerType = req.user.kind === "expert" ? "expert" : "user";
    const [result] = await pool.query(
      "UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_type <> ? AND is_read = 0",
      [conv.id, viewerType]
    );
    ok(res, { id: conv.id, read: true, marked: result.affectedRows });
  })
);

// GET /api/chat/conversations/:id/messages
router.get(
  "/conversations/:id/messages",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const { conv, allowed } = await loadParticipantConversation(pool, req.params.id, req.user);
    if (assertFound(res, conv)) return;
    if (!allowed) return fail(res, 403, "Forbidden");

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM messages WHERE conversation_id = ?",
      [conv.id]
    );
    const [rows] = await pool.query(
      "SELECT id, conversation_id, sender_type, sender_id, content, is_read, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC LIMIT ? OFFSET ?",
      [conv.id, pageSize, offset]
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
      await conn.beginTransaction();
      const { conv, allowed } = await loadParticipantConversation(conn, req.params.id, req.user);
      if (!conv) {
        await conn.rollback();
        return fail(res, 404, "Resource not found");
      }
      if (!allowed) {
        await conn.rollback();
        return fail(res, 403, "Forbidden");
      }

      const [result] = await conn.query(
        "INSERT INTO messages (conversation_id, sender_type, sender_id, content) VALUES (?, ?, ?, ?)",
        [conv.id, req.user.kind, req.user.id, content]
      );
      // Written in the same transaction as the insert so the ordering used by
      // the conversation list can never disagree with the messages themselves.
      await conn.query("UPDATE conversations SET last_message_at = NOW() WHERE id = ?", [conv.id]);
      await conn.commit();

      req.audit("chat-message", "conversation", conv.id, { message_id: result.insertId });
      created(res, {
        id: result.insertId,
        conversation_id: conv.id,
        sender_type: req.user.kind,
        sender_id: req.user.id,
        content,
      });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  })
);

// GET /api/chat/unread-count  (badge for the chat icon)
router.get(
  "/unread-count",
  authRequired,
  asyncHandler(async (req, res) => {
    const viewerType = req.user.kind === "expert" ? "expert" : "user";
    const column = req.user.kind === "expert" ? "expert_id" : "user_id";
    const [[row]] = await pool.query(
      `SELECT COUNT(*) AS count
         FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
        WHERE c.${column} = ? AND m.is_read = 0 AND m.sender_type <> ?`,
      [req.user.id, viewerType]
    );
    ok(res, { count: Number(row.count) || 0 });
  })
);

module.exports = router;
