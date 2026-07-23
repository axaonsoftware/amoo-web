-- Migration 006: correct the chat participant model.
--
-- `npm run migrate` applies this idempotently (see the chat block in
-- src/migrate.js). This file is the standalone equivalent, matching the
-- convention of migrations 003/004/005. Re-running it errors.
--
-- ── Why ───────────────────────────────────────────────────────────────────
-- The original tables modelled a conversation as two *users*:
--
--   conversations.user_a INT -> users(id)
--   conversations.user_b INT -> users(id)
--   messages.sender_id   INT -> users(id)
--
-- but POST /api/chat/conversations requires `participant_id` to be a row in
-- `experts`, and `experts.id` is a separate auto-increment sequence from
-- `users.id`. So every attempt to open a conversation either:
--   * failed with ER_NO_REFERENCED_ROW_2 (no users row with that id), or
--   * silently succeeded against a COMPLETELY UNRELATED user who happened to
--     share the numeric id — routing a private conversation to the wrong person.
--
-- The same defect applied to messages.sender_id, so an expert could never reply.
--
-- ── Shape ─────────────────────────────────────────────────────────────────
-- A conversation is now explicitly (customer, expert), which is the only kind
-- the route has ever permitted. Messages carry sender_type alongside sender_id
-- because the sender may live in `users`, `experts` or `admins` — a single FK
-- cannot express that, so the pair is validated in the application layer.

-- Old table could never hold correct rows; recreate rather than migrate them.
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

CREATE TABLE conversations (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  expert_id        INT NOT NULL,
  last_message_at  DATETIME,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
  -- One thread per (customer, expert). Makes "start or resume" idempotent
  -- without an application-level lock.
  UNIQUE KEY uniq_conversation_pair (user_id, expert_id),
  INDEX idx_conversations_user (user_id),
  INDEX idx_conversations_expert (expert_id),
  INDEX idx_conversations_last_message (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE messages (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id  INT NOT NULL,
  sender_type      ENUM('user','expert','admin') NOT NULL,
  sender_id        INT NOT NULL,
  content          TEXT NOT NULL,
  is_read          TINYINT(1) NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation (conversation_id, created_at),
  -- Backs the unread-count query: unread messages in a thread not sent by me.
  INDEX idx_messages_unread (conversation_id, is_read, sender_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
