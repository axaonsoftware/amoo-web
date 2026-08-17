const { WebSocketServer } = require("ws");
const { checkTokenVersion } = require("./middleware/auth");
const { pool } = require("./config/db");
const logger = require("./utils/logger");

// Attach a WebSocket server to the existing HTTP server so that
// ws connections share the same port as the Express API.
// Clients connect with ws://host:port/chat and pass the access token
// in the URL query string (?token=<jwt>) or as a cookie (the
// browser automatically sends httpOnly cookies).
function attachChat(server) {
  const wss = new WebSocketServer({
    server,
    path: "/chat",
    clientTracking: true,
  });

  // Map: ws._id -> { ws, userId, kind, convId }
  const clients = new Map();

  wss.on("connection", async (ws, req) => {
    // Try to authenticate the connection. Accept either:
    //   1. A Bearer token in the URL query string (?token=...)
    //   2. The access_token cookie (browser sends it automatically).
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token") || req.headers.cookie?.match(/access_token=([^;]+)/)?.[1];

    if (!token) {
      ws.close(4001, "Authentication required");
      return;
    }

    try {
      const jwt = require("jsonwebtoken");
      const env = require("./config/env");
      const decoded = jwt.verify(token, env.jwt.secret, { algorithms: ["HS256"] });
      await checkTokenVersion(decoded);
      ws._userId = decoded.id;
      ws._kind = decoded.kind;
    } catch {
      ws.close(4001, "Invalid or expired token");
      return;
    }

    ws._id = `${ws._kind}:${ws._userId}`;
    clients.set(ws._id, ws);
    logger.info("[ws] client connected:", ws._id);

    ws.on("message", async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
        return;
      }

      if (msg.type === "message") {
        const { conversationId, content } = msg;
        if (!conversationId || !content) {
          ws.send(JSON.stringify({ type: "error", error: "conversationId and content are required" }));
          return;
        }
        if (typeof content !== "string" || content.length > 5000) {
          ws.send(JSON.stringify({ type: "error", error: "content must be a string up to 5000 characters" }));
          return;
        }

        // SECURITY: the sender must be a participant of this conversation
        // (or an admin). Previously the insert ran against any conversationId
        // the client named, so any authenticated caller could write into a
        // thread they did not belong to.
        const conv = await loadConversation(conversationId);
        if (!conv || !isParticipant(ws, conv)) {
          ws.send(JSON.stringify({ type: "error", error: "Forbidden" }));
          return;
        }

        // Persist to database then broadcast to conversation participants.
        try {
          const result = await pool.query(
            "INSERT INTO messages (conversation_id, sender_type, sender_id, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
            [conversationId, ws._kind, ws._userId, content]
          );
          const row = result.rows[0];
          // Mark the conversation's last_message_at.
          await pool.query(
            "UPDATE conversations SET last_message_at = NOW() WHERE id = $1",
            [conversationId]
          );
          const broadcast = JSON.stringify({
            type: "message",
            id: row.id,
            conversationId,
            senderType: ws._kind,
            senderId: ws._userId,
            content,
            isRead: false,
            createdAt: row.created_at.toISOString(),
          });
          broadcastToConversation(clients, conv, broadcast, ws._id);
        } catch (e) {
          logger.warn("[ws] message persist failed:", e.message);
          ws.send(JSON.stringify({ type: "error", error: "Failed to save message" }));
        }
      } else if (msg.type === "read") {
        const { conversationId } = msg;
        if (!conversationId) return;
        // SECURITY: only a participant may mark a conversation read.
        const conv = await loadConversation(conversationId);
        if (!conv || !isParticipant(ws, conv)) {
          ws.send(JSON.stringify({ type: "error", error: "Forbidden" }));
          return;
        }
        const viewerType = ws._kind === "expert" ? "expert" : "user";
        try {
          await pool.query(
            "UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_type <> $2 AND is_read = false",
            [conversationId, viewerType]
          );
          broadcastToConversation(
            clients,
            conv,
            JSON.stringify({ type: "read", conversationId }),
            ws._id
          );
        } catch (e) {
          logger.warn("[ws] read receipt failed:", e.message);
        }
      } else if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    });

    ws.on("close", () => {
      clients.delete(ws._id);
      logger.info("[ws] client disconnected:", ws._id);
    });

    ws.on("error", (err) => {
      logger.warn("[ws] error:", ws._id, err.message);
    });
  });

  logger.info("[ws] chat WebSocket server attached on /chat");
}

async function loadConversation(conversationId) {
  const { rows } = await pool.query(
    "SELECT id, user_id, expert_id FROM conversations WHERE id = $1",
    [conversationId]
  );
  return rows[0] || null;
}

// Membership rule, shared by message/read handlers and the broadcast fan-out.
// Admins may observe any thread; a user only their own; an expert only their own.
function isParticipant(ws, conv) {
  if (!ws || !conv) return false;
  if (ws._kind === "admin") return true;
  if (ws._kind === "user") return conv.user_id === ws._userId;
  if (ws._kind === "expert") return conv.expert_id === ws._userId;
  return false;
}

// Send a message to every connected client that belongs to THIS conversation,
// excluding the sender. Previously every connected client received every
// message regardless of which conversation they were in — a cross-conversation
// leak. The fan-out is now bounded by the conversation's participants.
function broadcastToConversation(clients, conv, data, senderId) {
  for (const [id, ws] of clients) {
    if (id === senderId) continue;
    if (ws.readyState !== 1) continue; // OPEN
    if (!isParticipant(ws, conv)) continue;
    try {
      ws.send(data);
    } catch {
      // ignore broken connections
    }
  }
}

module.exports = { attachChat, isParticipant, broadcastToConversation };
