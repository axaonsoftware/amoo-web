# 006 — Upload filter bypass, CSV formula injection, and wrong-table verified check

- **Category**: Security / Bug Fix
- **Severity**: High
- **File(s) affected**:
  - `amoo-backend/src/middleware/upload.js`
  - `amoo-backend/src/routes/dashboard.js`
  - `amoo-backend/src/middleware/auth.js`

Three independent hardening fixes, grouped because each is small and they share
the "input trusted more than it should be" shape.

---

## 6a. Upload type filter was trivially bypassable

### Problem

```js
const ALLOWED = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
const fileFilter = (req, file, cb) => {
  const ok = ALLOWED.test(file.mimetype) || ALLOWED.test(path.extname(file.originalname).toLowerCase());
  if (ok) cb(null, true);
  else cb(new HttpError(400, "Unsupported file type"), false);
};
```

Two separate weaknesses:

1. **`||` instead of `&&`.** Either half alone admitted the file. `Content-Type`
   is set by the client, so `evil.exe` declared as `image/png` passed on the
   MIME half; a file named `payload.pdf` containing anything at all passed on the
   extension half.
2. **Unanchored substring matching.** The pattern has no anchors or delimiters,
   so `application/x-doc-evil` matched on `doc` and `text/jpeg-whatever` matched
   on `jpeg`. Any attacker-chosen MIME string containing one of eight short
   substrings was accepted.

Uploads are no longer served statically (a previous hardening step), and
downloads go through `res.download` with `nosniff`, so this is not directly RCE.
It remains a real hole: it lets arbitrary content be stored under a
plausible-looking name and handed to an admin or another user later, and it
means the `mime` column recorded in the database is not trustworthy.

### Solution

An explicit `Map` of exact MIME types to the extensions each may carry, with
**both** required to agree. Also added `limits.files: 1` — the route only ever
reads `req.file`, so accepting more was pure memory cost (multer uses
`memoryStorage`, so every accepted file is buffered in RAM).

### Before / After

```diff
-const ALLOWED = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
-const ok = ALLOWED.test(file.mimetype) || ALLOWED.test(ext);
+const ALLOWED_TYPES = new Map([
+  ["image/jpeg", [".jpg", ".jpeg"]],
+  ["image/png",  [".png"]],
+  ["image/gif",  [".gif"]],
+  ["image/webp", [".webp"]],
+  ["application/pdf", [".pdf"]],
+  ["application/msword", [".doc"]],
+  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", [".docx"]],
+]);
+
+const allowedExts = ALLOWED_TYPES.get(mime);
+if (!allowedExts) return cb(new HttpError(400, `Unsupported file type: ${mime || "unknown"}`), false);
+if (!allowedExts.includes(ext)) {
+  return cb(new HttpError(400, `File extension "${ext || "(none)"}" does not match its type ${mime}`), false);
+}
```

```diff
-limits: { fileSize: env.maxFileSize },
+limits: { fileSize: env.maxFileSize, files: 1 },
```

### Testing notes

```bash
# spoofed MIME, wrong extension -> rejected
curl -X POST $API/api/uploads -H "$AUTH" -H "$CSRF" \
     -F 'file=@evil.exe;type=image/png'
# => 400 File extension ".exe" does not match its type image/png

# substring match no longer works
curl -X POST $API/api/uploads -H "$AUTH" -H "$CSRF" \
     -F 'file=@x.bin;type=application/x-doc-evil'
# => 400 Unsupported file type: application/x-doc-evil

# genuine files still work
curl -X POST $API/api/uploads -H "$AUTH" -H "$CSRF" -F 'file=@chart.pdf;type=application/pdf'   # => 201
curl -X POST $API/api/uploads -H "$AUTH" -H "$CSRF" -F 'file=@photo.jpeg;type=image/jpeg'       # => 201
```

### Risk / impact

Stricter than before, so previously-accepted odd combinations now fail. In
particular a `.jpg` file sent with `Content-Type: image/jpg` (a non-standard
type some old clients emit) is now rejected — the standard type is `image/jpeg`.
If real traffic hits this, add `["image/jpg", [".jpg", ".jpeg"]]` to the map.
Browsers and the `fetch`/`FormData` path used by `lib/api.ts` all send
`image/jpeg` correctly.

---

## 6b. CSV export was vulnerable to spreadsheet formula injection

### Problem

`GET /api/dashboard/export/:type` (admin) escaped CSV syntax but not spreadsheet
semantics:

```js
const esc = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
```

Excel, LibreOffice Calc and Google Sheets **execute** any cell whose text starts
with `=`, `+`, `-` or `@`. The exported columns include `users.name`,
`users.email`, `services.name` and `payments.txn_id` — all user-controlled.

A user who registers with the name

```
=cmd|'/c powershell -enc <base64>'!A1
```

gets that command executed on the workstation of whichever admin opens
`users.csv`. Quoting does not help: `"=cmd|..."` is still evaluated once the
quotes are stripped as CSV syntax. This is a stored attack against the operator,
delivered through a routine admin action.

### Solution

Prefix any value starting with a formula trigger (or a leading tab / carriage
return, which some parsers strip before evaluating) with a single quote, which
spreadsheets treat as "this cell is literal text" and do not display. `\r` was
also added to the quoting test, since a lone CR can split a record.

A UTF-8 BOM was added so Excel decodes the file as UTF-8 rather than the local
ANSI codepage — without it, non-ASCII customer names are mangled in the export.

### Before / After

```diff
 const esc = (v) => {
-  const s = v === null || v === undefined ? "" : String(v);
-  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
+  let s = v === null || v === undefined ? "" : String(v);
+  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
+  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
 };
```

```diff
-res.setHeader("Content-Type", "text/csv");
+res.setHeader("Content-Type", "text/csv; charset=utf-8");
 res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
+res.setHeader("X-Content-Type-Options", "nosniff");
-res.send(csv);
+res.send("﻿" + csv);
```

### Testing notes

```sql
INSERT INTO users (name, email, password_hash)
VALUES ('=1+1', 'formula-test@example.com', '$2a$12$x');
```
```bash
curl -H "$ADMIN_AUTH" $API/api/dashboard/export/users -o users.csv
grep "formula-test" users.csv     # => '=1+1,formula-test@example.com,...
```
Open in Excel: the cell must display the literal text `=1+1`, not `2`. Also
confirm a name containing a comma and a name containing an accented character
both round-trip correctly.

### Risk / impact

Exported cells that legitimately begin with `-` (a negative number formatted as
text) now carry a leading apostrophe. Numeric columns in these three exports
(`amount`, `id`, `size`) are non-negative, so no real value is affected. If a
future export includes negative currency, format it as a number rather than
relying on the escape.

---

## 6c. `verifiedRequired` read the wrong table for experts

### Problem

```js
function verifiedRequired(req, res, next) {
  if (req.user.kind === "admin") return next();
  // ...
  pool.query("SELECT verified FROM users WHERE id = ?", [req.user.id])
```

The table was hardcoded to `users` regardless of `req.user.kind`. Expert tokens
carry an id that indexes the **`experts`** table. So an expert hitting a
`verifiedRequired` route was checked against whichever *user* happened to share
that numeric id — admitted or rejected essentially at random, and leaking a bit
of information about unrelated accounts in the process.

`middleware/auth.js` already had a `resolveTable(kind)` helper (used by
`checkTokenVersion`) doing exactly this mapping; `verifiedRequired` just did not
use it.

A second, smaller bug: the memoisation guard was `if (req._verifiedUser)`, which
is falsy when the previous lookup found no row (`null`). A second
`verifiedRequired` in the same chain would re-query instead of reusing the
cached miss. Changed to `!== undefined`.

### Before / After

```diff
-  if (req._verifiedUser) return finish(req._verifiedUser);
-  pool.query("SELECT verified FROM users WHERE id = ?", [req.user.id])
+  if (req._verifiedUser !== undefined) return finish(req._verifiedUser);
+
+  let table;
+  try {
+    table = resolveTable(req.user.kind);
+  } catch (e) {
+    return next(e);
+  }
+
+  pool.query(`SELECT verified FROM ${table} WHERE id = ?`, [req.user.id])
```

`resolveTable` maps only `admin|user|expert` and throws otherwise, so the
interpolation is not injectable — the value never comes from the request body.

### Testing notes

Set an expert's `verified` to 0 and confirm a `verifiedRequired` route returns
`403 Email not verified`, then set it to 1 and confirm the route succeeds —
independent of what `users` row shares that id:

```sql
UPDATE experts SET verified = 0 WHERE id = 3;
UPDATE users   SET verified = 1 WHERE id = 3;   -- the decoy that used to be read
```
```bash
curl -X POST $API/api/bookings -H "$EXPERT_AUTH" -H "$CSRF" -d "$BODY"
# => 403 Email not verified   (was: 201, because users.id=3 was verified)
```

### Risk / impact

- Experts who were previously admitted by a coincidentally-verified `users` row
  will now be blocked until `experts.verified = 1`. `POST /api/experts/:id/set-password`
  sets `verified = 1` as a side effect, so experts onboarded through the admin UI
  (see change 021) are fine. Existing experts may need a one-off
  `UPDATE experts SET verified = 1 WHERE password_hash IS NOT NULL;`
- `verifiedRequired` currently guards only user-facing routes (`POST /api/bookings`,
  `POST /api/payments`, `POST /api/payments/create-order`), so the practical
  blast radius today is small — but the middleware is exported and would have
  misbehaved the moment it was applied to an expert route.
