-- Migration 006: correct the chat participant model.
--
-- `npm run migrate` applies this idempotently (see the chat block in
-- src/migrate.js). This file is the standalone equivalent, matching the
-- convention of migrations 003/004/005.
--
-- WHY
-- The original tables modelled a conversation as two *users*:
--
--   conversations.user_a INT -> users(id)
--   conversations.user_b INT -> users(id)
--   messages.sender_id   INT -> users(id)
--
-- but POST /api/chat/conversations requires `participant_id` to be a row in
-- `experts`, and `experts.id` is a separate auto-increment sequence from
-- `users.id`. So every attempt to open a conversation either:
--   * failed with error code 23503 (foreign_key_violation), or
--   * silently succeeded against a completely unrelated user who happened to
--     share the numeric id — routing a private conversation to the wrong person.
--
-- The same defect applied to messages.sender_id, so an expert could never reply.
--
-- SHAPE
-- A conversation is now explicitly (customer, expert), which is the only kind
-- the route has ever permitted. Messages carry sender_type alongside sender_id
-- because the sender may live in `users`, `experts` or `admins` — a single FK
-- cannot express that, so the pair is validated in the application layer.

-- Old table could never hold correct rows; recreate rather than migrate them.
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

CREATE TABLE conversations (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL,
  expert_id        INTEGER NOT NULL,
  last_message_at  TIMESTAMP,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
  -- One thread per (customer, expert). Makes "start or resume" idempotent
  -- without an application-level lock.
  UNIQUE (user_id, expert_id)
);

CREATE TABLE messages (
  id               SERIAL PRIMARY KEY,
  conversation_id  INTEGER NOT NULL,
  sender_type      VARCHAR(20) NOT NULL CHECK (sender_type IN ('user','expert','admin')),
  sender_id        INTEGER NOT NULL,
  content          TEXT NOT NULL,
  is_read          BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
