# 009 — Schema completeness, missing indexes, and race-free webhook idempotency

- **Category**: Bug Fix / Performance / Config
- **Severity**: Medium–High
- **File(s) affected**:
  - `amoo-backend/src/schema.sql`
  - `amoo-backend/src/routes/payments.js`

## 9a. `schema.sql` alone produced a broken database

### Problem

The file's header said:

```sql
--  Run once:  mysql -u root -p < src/schema.sql
```

but the schema was missing **every column added since the initial version**.
Those columns existed only in `src/migrate.js`'s `columnAdds` array (and in the
standalone `migrations/003–005` files), so a database created by following the
documented instruction was missing:

| Table | Missing columns | Code that writes them | Failure |
|---|---|---|---|
| `experts` | `password_hash`, `token_version`, `verified`, `verify_token`, `verify_token_expires`, `failed_attempts`, `locked_until` | `routes/auth.js` expert login, `routes/experts.js` set-password | Expert login 500s — `Unknown column 'password_hash'` |
| `users` | `dob`, `tob`, `birthplace` | `routes/users.js` `USER_SELECT`, report generators | `GET /api/users/me` 500s |
| `payments` | `refund_id`, `refunded_at` | `routes/payments.js` refund | Refunds 500 *after* calling the gateway — money moves, DB does not record it |
| `audit_log` | `ip_address`, `user_agent`, `page_or_route` | `utils/audit.js` (every audited action) | Every audit write fails |

`utils/audit.js` swallows its own errors (`logger.warn` and continue), so the
audit failures were completely invisible: the system appeared healthy while
recording nothing.

The refund case is the worst: `POST /api/payments/:id/refund` calls the Razorpay
API **first**, then writes `refund_id`/`refunded_at`. On a schema-only database
the gateway refund succeeds, the UPDATE throws, the transaction rolls back — the
customer is refunded and the platform has no record of it.

### Solution

Made `schema.sql` self-sufficient for a fresh install by adding every column the
code writes, and rewrote the header to state plainly that **`npm run migrate` is
the supported path** (it handles both new and existing databases; the raw `.sql`
only handles new ones, because `CREATE TABLE IF NOT EXISTS` cannot alter an
existing table).

### Before / After

```diff
 CREATE TABLE IF NOT EXISTS experts (
   ...
   avatar        VARCHAR(512),
+  password_hash VARCHAR(255),
+  token_version INT NOT NULL DEFAULT 0,
+  verified      TINYINT(1) NOT NULL DEFAULT 0,
+  verify_token  VARCHAR(64),
+  verify_token_expires DATETIME,
+  failed_attempts INT NOT NULL DEFAULT 0,
+  locked_until  DATETIME,
   role_title    VARCHAR(120),
```
```diff
 CREATE TABLE IF NOT EXISTS users (
   ...
+  dob             DATE,
+  tob             TIME,
+  birthplace      VARCHAR(255),
   gender          VARCHAR(20),
```
```diff
 CREATE TABLE IF NOT EXISTS payments (
   gateway_order_id VARCHAR(255),
+  refund_id     VARCHAR(255),
+  refunded_at   DATETIME,
```
```diff
 CREATE TABLE IF NOT EXISTS audit_log (
   meta        JSON,
+  ip_address  VARCHAR(45),
+  user_agent  VARCHAR(512),
+  page_or_route VARCHAR(255),
```

---

## 9b. Missing index on the payment settlement lookup

### Problem

Both `POST /api/payments/verify` and the gateway webhook find the payment row by
`gateway_order_id`:

```sql
SELECT ... FROM payments WHERE gateway_order_id = ?
```

`schema.sql` had indexes on `booking_id`, `user_id`, `status` and `txn_id` — but
not `gateway_order_id`. Every single payment settlement was a full table scan of
`payments`, on the hottest and most latency-sensitive path in the application,
growing linearly with transaction volume. (`migrate.js` did create
`idx_payments_gateway_order`, so a migrated database was fine; a
`schema.sql`-only database was not.)

### Solution

```diff
   INDEX idx_payments_txn_id (txn_id),
+  INDEX idx_payments_gateway_order (gateway_order_id)
```

---

## 9c. Webhook idempotency was a full scan *and* a race

### Problem

```js
const idempotencyKey = req.headers["x-idempotency-key"] || `${event}:${req.body.txn_id || req.body.id || "none"}`;
if (idempotencyKey) {
  const [existing] = await pool.query(
    "SELECT id FROM audit_log WHERE meta->>'$.idempotency_key' = ? AND action = 'webhook-received'",
    [idempotencyKey]
  );
  if (existing.length) return res.json({ success: true, received: true, deduplicated: true });
}
```

Two defects:

1. **Unindexable.** `meta->>'$.idempotency_key'` is a JSON path expression. MySQL
   cannot use an index for it without a generated column, and none exists — so
   this is a full scan of `audit_log`, a table that grows with *every* audited
   action forever. On the payment webhook path, retried aggressively by the
   gateway.

2. **A read-then-write race that does not actually deduplicate.** The marker is
   written by `req.audit(...)`, which is **fire-and-forget** — `utils/audit.js`
   is `async` and the call site never awaits it. So the write lands some
   milliseconds after the response. Razorpay retries on any non-2xx and sends
   concurrent deliveries; two retries arriving together both ran the SELECT,
   both found nothing, and both settled the payment — double-activating a
   subscription and granting `role = 'premium'` twice.

Worse, the marker was only written **inside the `if (p)` branch**, so an event
that arrived before its payment row existed left no marker at all and was
reprocessed on every retry.

### Solution

A dedicated `webhook_events` table with `UNIQUE KEY uniq_webhook_idempotency`.
The claim is made by an INSERT, so it is atomic: the first caller inserts and
proceeds, every concurrent duplicate gets `ER_DUP_ENTRY` and returns
`deduplicated: true`. No read-then-write window, and the lookup is a unique index
hit rather than a scan.

The claim now happens **before** the payment lookup, so it covers the
payment-not-found case too.

### Before / After

**Before**
```js
const [existing] = await pool.query(
  "SELECT id FROM audit_log WHERE meta->>'$.idempotency_key' = ? AND action = 'webhook-received'",
  [idempotencyKey]
);
if (existing.length) return res.json({ success: true, received: true, deduplicated: true });
```

**After**
```js
const idempotencyKey = String(
  req.headers["x-idempotency-key"] || `${event}:${req.body.txn_id || req.body.id || "none"}`
).slice(0, 255);
try {
  await pool.query(
    "INSERT INTO webhook_events (idempotency_key, event) VALUES (?, ?)",
    [idempotencyKey, String(event).slice(0, 120)]
  );
} catch (e) {
  if (e.code === "ER_DUP_ENTRY") {
    return res.json({ success: true, received: true, deduplicated: true });
  }
  throw e;
}
```

**New table**
```sql
CREATE TABLE IF NOT EXISTS webhook_events (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  idempotency_key VARCHAR(255) NOT NULL,
  event           VARCHAR(120),
  payment_id      INT,
  received_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_webhook_idempotency (idempotency_key),
  INDEX idx_webhook_received (received_at)
);
```

The ledger row is back-filled with `payment_id` after a successful settlement,
so reconciliation can join gateway events to payments.

## Testing notes

```bash
npm run migrate     # creates webhook_events + the new columns/index
```

Verify the schema is complete on a **fresh** database built the documented way:
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS amoo_test; " && mysql -u root -p < src/schema.sql
mysql -u root -p amoo_db -e "SHOW COLUMNS FROM experts   LIKE 'password_hash';"   # 1 row
mysql -u root -p amoo_db -e "SHOW COLUMNS FROM users     LIKE 'dob';"             # 1 row
mysql -u root -p amoo_db -e "SHOW COLUMNS FROM payments  LIKE 'refund%';"         # 2 rows
mysql -u root -p amoo_db -e "SHOW COLUMNS FROM audit_log LIKE 'ip_address';"      # 1 row
mysql -u root -p amoo_db -e "SHOW INDEX FROM payments WHERE Key_name='idx_payments_gateway_order';"
```

Index is used (was `type: ALL`, rows = table size):
```sql
EXPLAIN SELECT id FROM payments WHERE gateway_order_id = 'order_test';
-- key: idx_payments_gateway_order, type: ref, rows: 1
```

Idempotency, including the concurrent case the old code failed:
```bash
# same event twice, sequentially
curl -X POST $API/api/payments/webhook -H 'x-idempotency-key: evt_1' -d "$EVENT"  # {"received":true}
curl -X POST $API/api/payments/webhook -H 'x-idempotency-key: evt_1' -d "$EVENT"  # {"deduplicated":true}

# same event twice, concurrently — previously BOTH settled
seq 2 | xargs -P2 -I{} curl -s -X POST $API/api/payments/webhook -H 'x-idempotency-key: evt_2' -d "$EVENT"
# => exactly one settlement; SELECT COUNT(*) FROM webhook_events WHERE idempotency_key='evt_2' => 1
```

Backend `npm test` 73/73 pass; `server.js` loads cleanly.

## Risk / impact

- **`webhook_events` grows unbounded.** Add a retention job, e.g.
  `DELETE FROM webhook_events WHERE received_at < NOW() - INTERVAL 90 DAY;`
  Gateways retry for at most ~24h, so 90 days is generous. Listed in the manual
  steps of the final report; not added to `cron/index.js` because the retention
  period is a business decision.
- **The idempotency key falls back to `${event}:none`** when the payload carries
  no `txn_id` or `id` and the gateway sends no `x-idempotency-key` header. Two
  genuinely distinct such events would now collide and the second would be
  dropped. Razorpay always sends `payload.payment.entity.id`, so this only
  affects hand-crafted test posts. Configure the webhook to send an idempotency
  header if your gateway supports one.
- **`schema.sql` and `migrate.js` now overlap.** Both are idempotent and
  `migrate.js` skips columns that already exist, so running either or both is
  safe. They must be kept in sync when a column is added — noted at the top of
  `schema.sql`.
- **Existing databases are unaffected by 9a** — `migrate.js` had already added
  those columns. This only fixes the fresh-install path.
