const { WebSocketServer } = require("ws");
const { checkTokenVersion } = require("./middleware/auth");
const { pool } = require("./config/db");
const logger = require("./utils/logger");
const env = require("./config/env");

// Attach a WebSocket server to the existing HTTP server so that
// ws connections share the same port as the Express API.
// Clients connect with ws://host:port/chat and authenticate via:
//   1. The Sec-WebSocket-Protocol header (token passed as subprotocol)
//   2. The access_token cookie (browser sends it automatically on same-origin)
// JWT in URL query strings is no longer accepted — it leaks tokens in
// server logs, browser history, and Referer headers.
function attachChat(server) {
  const wss = new WebSocketServer({
    server,
    path: "/chat",
    clientTracking: true,
  });

  // Map: ws._id -> Set<WebSocket>
  const clients = new Map();
  // Map: ws._id -> number[] (timestamps of recent messages)
  const messageRateLimit = new Map();

  wss.on("connection", async (ws, req) => {
    // Try to authenticate the connection. Accept either:
    //   1. A token passed via the Sec-WebSocket-Protocol header
    //   2. The access_token cookie (browser sends it automatically)
    // JWT in URL query strings is rejected — they leak in logs and Referer.
    const protoHeader = req.headers["sec-websocket-protocol"] || "";
    const protocols = protoHeader.split(",").map((p) => p.trim());
    const token = protocols[0] || req.headers.cookie?.match(/access_token=([^;]+)/)?.[1];

    if (!token) {
      ws.close(4001, "Authentication required");
      return;
    }

    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, env.jwt.secret, { algorithms: ["HS256"] });
      await checkTokenVersion(decoded);
      ws._userId = Number(decoded.id);
      ws._kind = decoded.kind;
    } catch {
      ws.close(4001, "Invalid or expired token");
      return;
    }

    ws._id = `${ws._kind}:${ws._userId}`;
    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    const userConnections = clients.get(ws._id) || new Set();
    if (userConnections.size >= env.wsMaxConnectionsPerUser) {
      ws.send(JSON.stringify({
        type: "error",
        message: "Too many concurrent connections",
      }));
      ws.close(1008, "Policy Violation: Connection limit exceeded");
      return;
    }
    userConnections.add(ws);
    clients.set(ws._id, userConnections);
    logger.info("[ws] client connected:", ws._id);

    ws.on("message", async (raw) => {
      logger.info("[ws] RAW MESSAGE RECEIVED:", raw.toString());
      const now = Date.now();
      const timestamps = messageRateLimit.get(ws._id) || [];
      const recent = timestamps.filter((t) => now - t < 1000);
      if (recent.length >= env.wsMaxMessagesPerSecond) {
        ws.send(JSON.stringify({ type: "error", message: "Rate limit exceeded" }));
        return;
      }
      recent.push(now);
      messageRateLimit.set(ws._id, recent);

      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
        return;
      }

      if (msg.type === "message") {
        const { conversationId, content, client_id } = msg;
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
        // Uses a dedicated client + transaction so the INSERT and the
        // last_message_at UPDATE are atomic — matching the HTTP flow in
        // routes/chat.js.
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const result = await client.query(
            "INSERT INTO messages (conversation_id, sender_type, sender_id, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
            [conversationId, ws._kind, ws._userId, content]
          );
          const row = result.rows[0];
          // Written in the same transaction as the insert so the ordering
          // used by the conversation list can never disagree with the
          // messages themselves.
          await client.query("UPDATE conversations SET last_message_at = NOW() WHERE id = $1", [conversationId]);
          await client.query("COMMIT");

          const broadcast = JSON.stringify({
            type: "message",
            id: row.id,
            conversationId,
            senderType: ws._kind,
            senderId: ws._userId,
            content,
            client_id,
            isRead: false,
            createdAt: row.created_at.toISOString(),
          });
          broadcastToConversation(clients, conv, broadcast, ws);
        } catch (e) {
          await client.query("ROLLBACK");
          logger.error("[ws] message persist failed:", e.message);
          ws.send(JSON.stringify({
            type: "error",
            message: "Failed to save message - please resend",
          }));
        } finally {
          client.release();
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
            ws
          );
        } catch (e) {
          logger.warn("[ws] read receipt failed:", e.message);
        }
      } else if (msg.type === "typing") {
        const { conversationId } = msg;
        if (!conversationId) return;
        const conv = await loadConversation(conversationId);
        if (!conv || !isParticipant(ws, conv)) return;
        broadcastToConversation(
          clients,
          conv,
          JSON.stringify({
            type: "typing",
            conversationId,
            userId: ws._userId,
            userKind: ws._kind,
          }),
          ws
        );
      } else if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    });

    ws.on("close", () => {
      const userConnections = clients.get(ws._id);
      if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
          clients.delete(ws._id);
          messageRateLimit.delete(ws._id);
        }
      }
      logger.info("[ws] client disconnected:", ws._id);
    });

    ws.on("error", (err) => {
      logger.warn("[ws] error:", ws._id, err.message);
    });
  });

  // Heartbeat: terminate connections that don't respond to pings.
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        logger.info("[ws] terminating dead connection:", ws._id);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));

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

  const userId = Number(ws._userId);
  const userKind = String(ws._kind);

  const userIdMatch =
    userKind === "user" && Number(conv.user_id) === userId;

  const expertIdMatch =
    userKind === "expert" && Number(conv.expert_id) === userId;

  logger.info("[ws] participant check:", {
    kind: userKind,
    wsUserId: ws._userId,
    normalizedUserId: userId,
    conversationId: conv.id,
    conversationUserId: conv.user_id,
    conversationExpertId: conv.expert_id,
    userIdMatch,
    expertIdMatch,
  });

  return userIdMatch || expertIdMatch;
}

// Send a message to every connected client that belongs to THIS conversation,
// excluding the sender. Previously every connected client received every
// message regardless of which conversation they were in — a cross-conversation
// leak. The fan-out is now bounded by the conversation's participants.
function broadcastToConversation(clients, conv, data, senderWs) {
  for (const [, connections] of clients) {
    for (const ws of connections) {
      if (ws === senderWs) continue;
      if (ws.readyState !== 1) continue; // OPEN
      if (!isParticipant(ws, conv)) continue;
      try {
        ws.send(data);
      } catch {
        // ignore broken connections
      }
    }
  }
}

module.exports = { attachChat, isParticipant, broadcastToConversation };
