# 008 — Chat was structurally broken: conversations keyed users where experts were meant

- **Category**: Bug Fix / Security
- **Severity**: Critical
- **File(s) affected**:
  - `amoo-backend/src/schema.sql`
  - `amoo-backend/src/migrations/006_fix_chat_participants.sql` *(new)*
  - `amoo-backend/src/migrate.js`
  - `amoo-backend/src/routes/chat.js`

## Problem

The schema modelled a conversation as two **users**:

```sql
CREATE TABLE conversations (
  user_a INT NOT NULL,
  user_b INT NOT NULL,
  FOREIGN KEY (user_a) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_b) REFERENCES users(id) ON DELETE CASCADE,
  ...
);
CREATE TABLE messages (
  sender_id INT NOT NULL,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  ...
);
```

But the route required the second participant to be an **expert**:

```js
const [expert] = await pool.query(
  "SELECT id FROM experts WHERE id = ? AND status = 'active' AND deleted_at IS NULL",
  [participant_id]
);
if (!expert.length) return fail(res, 403, "You can only start a conversation with an expert");
// ...
await conn.query("INSERT INTO conversations (user_a, user_b) VALUES (?, ?)", [userA, userB]);
```

`users.id` and `experts.id` are **independent AUTO_INCREMENT sequences**. So
`INSERT INTO conversations (user_a, user_b) VALUES (<userId>, <expertId>)`
produced one of two outcomes, both wrong:

1. **No `users` row with that id** → `ER_NO_REFERENCED_ROW_2`, surfaced as an
   opaque 500. Chat simply did not work.
2. **A `users` row *does* exist with that id** — which is likely, since both
   sequences start at 1 — → the insert succeeds and creates a private
   conversation attached to **a completely unrelated customer**. The expert
   never sees the thread; a random third party does. Any message the customer
   sends about their personal situation is delivered to a stranger.

Outcome 2 is a confidentiality breach that fails silently and looks like a
working feature.

`messages.sender_id → users(id)` had the identical defect in the reply
direction: an expert posting a message would fail the FK, or be recorded as
whichever user shares their id.

Three supporting problems:

- **`ensureConversation` used `SELECT ... FOR UPDATE` with no transaction.**
  `pool.getConnection()` was called but `beginTransaction()` never was, so the
  row lock was released the instant the statement returned. Two simultaneous
  requests could both find nothing and both insert — duplicate threads.
- **`last_message_at` was updated outside any transaction**, so the ordering key
  used by the conversation list could disagree with the messages table.
- **Unread counts were unimplementable.** `UPDATE messages SET is_read = 1 WHERE
  conversation_id = ? AND sender_id != ?` compares ids across two different
  tables — an expert with `id = 5` and a user with `id = 5` are indistinguishable.

## Solution

Model the relationship as what it actually is: `(user_id, expert_id)`, each with
a foreign key to the correct table, plus a `UNIQUE` key on the pair.

`messages` gains a `sender_type ENUM('user','expert','admin')` and drops the
`sender_id` foreign key — a sender may live in any of three tables, which a
single FK cannot express, so the `(sender_type, sender_id)` pair is validated in
the route instead. All read/unread logic keys on `sender_type`, which is
unambiguous.

"Start or resume" becomes `INSERT ... ON DUPLICATE KEY UPDATE id = id` against
the unique pair — atomic at the database level, so the broken advisory lock is
no longer needed.

The message insert and the `last_message_at` bump now share one transaction.

Two behavioural additions that follow from having a correct model:
- Only a customer (`kind === "user"`) may *open* a thread. An expert replies
  within an existing one; letting them open threads would permit cold-messaging
  the customer base.
- `GET /api/chat/unread-count` was added for the chat badge, alongside a
  per-conversation `unread_count` computed in the list query (avoiding an N+1).

### Migration safety

Legacy rows are **never** remapped: by construction they either do not exist or
point at the wrong person, so "preserving" them would preserve a privacy
incident. `migrate.js` rebuilds the tables only when they are empty; if any rows
are present it **stops with a clear message** and asks for a human decision
rather than dropping data unattended.

## Before / After

**Schema — before**
```sql
user_a INT NOT NULL,  FOREIGN KEY (user_a) REFERENCES users(id),
user_b INT NOT NULL,  FOREIGN KEY (user_b) REFERENCES users(id),   -- an expert id lands here
```

**Schema — after**
```sql
user_id   INT NOT NULL,  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
expert_id INT NOT NULL,  FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
UNIQUE KEY uniq_conversation_pair (user_id, expert_id),
```
```sql
-- messages
sender_type ENUM('user','expert','admin') NOT NULL,
sender_id   INT NOT NULL,          -- no FK: three possible parent tables
INDEX idx_messages_unread (conversation_id, is_read, sender_type),
```

**Route — before** (`ensureConversation`, lock without a transaction)
```js
async function ensureConversation(conn, userA, userB) {
  const [existing] = await conn.query(
    "SELECT * FROM conversations WHERE (user_a = ? AND user_b = ?) OR (user_a = ? AND user_b = ?) FOR UPDATE",
    [userA, userB, userB, userA]
  );
  if (existing.length) return existing[0];
  const [result] = await conn.query("INSERT INTO conversations (user_a, user_b) VALUES (?, ?)", [userA, userB]);
  ...
}
const conn = await pool.getConnection();
try {
  const conv = await ensureConversation(conn, req.user.id, participant_id);   // no beginTransaction()
  ok(res, conv);
} finally { conn.release(); }
```

**Route — after**
```js
if (req.user.kind !== "user") {
  return fail(res, 403, "Only customers can start a conversation");
}
// ... verify the expert is active ...
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
```

**Authorisation — before / after**
```diff
-if (c.user_a !== req.user.id && c.user_b !== req.user.id && req.user.kind !== "admin") {
-  return fail(res, 403, "Forbidden");
-}
+const allowed =
+  (user.kind === "user"   && conv.user_id   === user.id) ||
+  (user.kind === "expert" && conv.expert_id === user.id);
```
The old check compared `req.user.id` against both columns without regard to
`kind`, so an **expert** whose id matched a `user_a` value could read that
customer's thread with a different expert.

**Read receipts — before / after**
```diff
-"UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?"
+"UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_type <> ? AND is_read = 0"
```

## Testing notes

```bash
npm run migrate        # rebuilds the empty legacy tables, logs "Chat tables rebuilt."
npm run seed
```

Then, with a seeded customer and a seeded expert (`neha@amooguru.com`, id 1):

```bash
# customer opens a thread with expert 1
curl -X POST $API/api/chat/conversations -H "$USER_AUTH" -H "$CSRF" -d '{"participant_id":1}'
# => 200 { id: 1, user_id: <uid>, expert_id: 1 }        (previously: 500 FK violation)

# idempotent — a second call returns the SAME id, not a duplicate
curl -X POST $API/api/chat/conversations -H "$USER_AUTH" -H "$CSRF" -d '{"participant_id":1}'

# an expert cannot open one
curl -X POST $API/api/chat/conversations -H "$EXPERT_AUTH" -H "$CSRF" -d '{"participant_id":1}'
# => 403 Only customers can start a conversation

# both sides can post, and the expert reply now succeeds
curl -X POST $API/api/chat/conversations/1/messages -H "$USER_AUTH"   -H "$CSRF" -d '{"content":"hello"}'
curl -X POST $API/api/chat/conversations/1/messages -H "$EXPERT_AUTH" -H "$CSRF" -d '{"content":"hi there"}'

# unread counts are per-side and correct
curl $API/api/chat/unread-count -H "$USER_AUTH"     # => { count: 1 }  (the expert's reply)
curl $API/api/chat/unread-count -H "$EXPERT_AUTH"   # => { count: 1 }  (the customer's message)
curl -X POST $API/api/chat/conversations/1/read -H "$USER_AUTH" -H "$CSRF"
curl $API/api/chat/unread-count -H "$USER_AUTH"     # => { count: 0 }

# a third party is refused
curl $API/api/chat/conversations/1/messages -H "$OTHER_USER_AUTH"   # => 403 Forbidden
```

Migration guard — insert a legacy row before migrating and confirm it refuses:
```
Refusing to rebuild 'conversations': 3 legacy row(s) present. ...
```

Backend `npm test` 73/73 pass.

## Risk / impact

- **`DROP TABLE messages; DROP TABLE conversations;`** runs on databases whose
  chat tables are empty. That is safe by construction here (the old shape could
  not hold correct rows), but **take a backup before running `npm run migrate`
  against any database you care about** — this is the only destructive step in
  the migration.
- **If your database *does* have legacy conversation rows**, the migration stops
  and requires you to inspect and drop them manually. Those rows are almost
  certainly mis-addressed; treat them as a privacy incident to review, not data
  to keep. Check with:
  `SELECT c.id, c.user_a, c.user_b, u.email FROM conversations c LEFT JOIN users u ON u.id = c.user_b;`
- **No frontend consumes chat yet** (there is no chat UI — see the final
  report's orphaned-endpoint list), so no client code needed updating. Any UI
  built later must send `sender_type` in its rendering logic rather than
  comparing `sender_id` to the current user id.
- **`messages.sender_id` no longer has a foreign key**, so deleting a user or
  expert leaves their messages with a dangling id. Deleting the *conversation*
  cascades correctly, and both `users` and `experts` use soft deletes
  (`deleted_at`), so rows are not actually removed in normal operation.
