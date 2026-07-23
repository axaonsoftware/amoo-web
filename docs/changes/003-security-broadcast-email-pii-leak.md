# 003 — Stop broadcast notification emails disclosing every user's address

- **Category**: Security
- **Severity**: Critical
- **File(s) affected**:
  - `amoo-backend/src/services/email.js`
  - `amoo-backend/src/routes/notifications.js`

## Problem

`POST /api/notifications` with no `user_id` is the admin "broadcast" path. It
collected every verified user's email and passed them as one comma-joined
string:

```js
const [rows] = await pool.query(
  "SELECT email FROM users WHERE verified = 1 AND deleted_at IS NULL AND email IS NOT NULL AND email != ''"
);
for (const r of rows) { if (r.email) emails.push(r.email); }
if (emails.length) {
  await sendNotificationEmail(emails.join(","), title, message);   // ← To: header
}
```

`services/email.js` passed that straight into nodemailer's `to` field, so the
entire customer email list landed in the **To:** header of a message delivered
to every one of those customers. The first broadcast would disclose the
platform's complete user list to the platform's complete user list.

For an astrology/spiritual-consultation service this is worse than a generic
address leak — membership in the list is itself sensitive, and under India's
DPDP Act (and GDPR for any EU user) it is a reportable personal-data breach.
There is no way to recall it once sent.

Two further problems rode along:

- **Provider limits.** A single message with thousands of recipients is
  rejected outright by every major SMTP provider (SES caps at 50 recipients per
  message, Gmail at 100, SendGrid at 1000). So past a small user count the
  broadcast silently failed *and* leaked, because the failure was swallowed by
  the empty `catch {}`.
- **Addresses in the logs.** `logger.info(\`[email] Sent to ${to}\`)` wrote the
  full recipient list into stdout, which ships to whatever log aggregator is
  configured — spreading the same personal data further.

## Solution

A `sendBulk()` helper puts recipients in **Bcc**, addresses the visible `To:` to
the platform's own `EMAIL_FROM`, deduplicates, and chunks at 50 per message to
stay under provider caps. `sendNotificationEmail` now dispatches through it
whenever it receives an array, so the call site expresses intent
(`sendNotificationEmail(emails, …)`) rather than pre-formatting a header.

Recipient addresses are redacted in logs (`a***@example.com`), and bulk sends
log only a count. The swallowed exception now logs a warning so a failed
broadcast is visible.

## Before / After

**Before** — `routes/notifications.js`
```js
const emails = [];
// ... collect ...
if (emails.length) {
  await sendNotificationEmail(emails.join(","), title, message);
}
```
Resulting header: `To: alice@x.com, bob@y.com, carol@z.com, …` — visible to all.

**After** — `routes/notifications.js`
```js
const emails = rows.map((r) => r.email).filter(Boolean);
if (emails.length) {
  const result = await sendNotificationEmail(emails, title, message);
  logger.info(
    `[notifications] broadcast ${result?.sent ?? 0} recipient(s) in ${result?.batches ?? 0} batch(es)`
  );
}
```

**New** — `services/email.js`
```js
async function sendBulk({ recipients, subject, html, text, chunkSize = 50 }) {
  const unique = [...new Set((recipients || []).map((r) => String(r).trim()).filter(Boolean))];
  if (!unique.length) return { sent: 0, batches: 0 };

  let batches = 0;
  for (let i = 0; i < unique.length; i += chunkSize) {
    await send({ bcc: unique.slice(i, i + chunkSize), subject, html, text });
    batches++;
  }
  return { sent: unique.length, batches };
}
```

```js
// send() — envelope now addressed to ourselves when bcc is present
to: bcc ? env.email.from : to,
bcc: bcc || undefined,
```

Log redaction:
```js
const label = bcc ? `${countRecipients(bcc)} bcc recipient(s)` : redact(to);
// "alice@example.com" -> "a***@example.com"
```

## Testing notes

With `EMAIL_ENABLED=false` (the dev default) nothing is sent; the log line
confirms the shape:

```
[email] Skipped send to 50 bcc recipient(s) (EMAIL_ENABLED=false)
[notifications] broadcast 137 recipient(s) in 3 batch(es)
```

For a real check, point `EMAIL_*` at a capture service (MailHog, Mailtrap, or
`smtp://localhost:1025`) and:

```bash
curl -X POST $API/api/notifications -H "$ADMIN_AUTH" -H "$CSRF" \
     -d '{"title":"Test broadcast","message":"hello"}'
```

Then inspect the captured message headers. Assert:
- `To:` equals `EMAIL_FROM` — **not** a recipient list
- `Bcc:` is present with at most 50 addresses
- with >50 verified users, more than one message is captured

Targeted sends are unchanged — `POST /api/notifications {"user_id": 7, …}`
should still produce a single message with that user's address in `To:`.

## Risk / impact

- **Deliverability**: some spam filters score Bcc-only mail slightly higher.
  For production volume, use a transactional provider's bulk API (SES
  `SendBulkEmail`, SendGrid personalizations) rather than SMTP Bcc; `sendBulk`
  is the seam where that swap happens. Noted in the final report's manual steps.
- **Broadcast is now slower** — one SMTP round-trip per 50 recipients instead of
  one total. It already runs fire-and-forget outside the request path, so the
  API response time is unchanged, but a very large user base will take a while
  to drain. A queue (BullMQ/Redis) is the right long-term answer; flagged as a
  recommendation, not implemented.
- **No unsubscribe link.** `sendNotificationEmail` supports
  `opts.unsubscribeHref` but nothing passes it. Bulk marketing mail legally
  requires one in most jurisdictions; these are currently transactional-ish
  service notices, but if broadcasts become promotional this must be wired up.
  Flagged in the final report.
- **`chunkSize` default of 50** is the most conservative common cap (SES). Raise
  it if your provider allows more.
