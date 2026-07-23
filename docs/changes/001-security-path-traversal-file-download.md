# 001 — Fix path traversal and cross-user file access in report/upload downloads

- **Category**: Security
- **Severity**: Critical
- **File(s) affected**:
  - `amoo-backend/src/utils/paths.js` *(new)*
  - `amoo-backend/src/routes/reports.js`
  - `amoo-backend/src/routes/uploads.js`
  - `amoo-backend/src/middleware/validate.js`

## Problem

`GET /api/reports/:id/download` built a filesystem path by concatenating a
database column straight onto the application root:

```js
const filePath = path.join(__dirname, "..", "..", fileUrl);
res.download(filePath, path.basename(filePath));
```

`reports.file_url` is **client-supplied**. `POST /api/reports` accepted it via
the `report` Joi schema as `optionalString.max(512)` — any string up to 512
characters. `path.join()` normalises `..` segments, so a traversal payload
resolved cleanly *outside* the app root.

Any authenticated user could therefore run:

```http
POST /api/reports        { "title": "x", "file_url": "../../.env" }
GET  /api/reports/<id>/download
```

and receive the backend's `.env` file — `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`DB_PASSWORD`, and the Razorpay keys. With the JWT secrets an attacker can mint
a valid `kind: "admin"` token and take over the platform. `/etc/passwd`,
`package-lock.json`, and any other file readable by the Node process were
equally reachable.

`GET /api/uploads/:id/download` had the same `path.join` shape. Its input
(`uploads.path`) is server-generated rather than client-supplied, so it was not
directly exploitable, but it carried no containment check either.

A second, quieter flaw sat alongside it: even a *well-formed* `/uploads/<name>`
value let a user attach **another user's** upload to their own report and
download it, bypassing the ownership check that `/api/uploads/:id/download`
performs.

This mattered for production because it is a pre-auth-escalation, full-secret
disclosure reachable by any account that can register — which is anyone.

## Solution

Three independent layers, so no single mistake re-opens the hole.

**1. A containment helper (`utils/paths.js`).** Resolution happens first, then
the result is checked against the root with `path.relative()`. Checking the raw
string for `".."` before resolution is the common broken version — it misses
encoded and mixed-separator variants; checking `startsWith(root)` after
resolution is also wrong, because it accepts a sibling directory such as
`/app/uploads-evil`. `path.relative()` returns a `..`-prefixed value for
anything outside the root, which is the reliable test.

Absolute paths, Windows drive letters, URL schemes and NUL bytes are rejected
outright.

**2. Edge validation (`middleware/validate.js`).** A new `fileRef` Joi rule
constrains `file_url` to either a flat `/uploads/<filename>` path or an
`http(s)` URL, so a traversal value never reaches the database at all.

**3. Ownership check (`routes/reports.js`).** When a non-admin supplies
`file_url`, it must match a row in `uploads` owned by that user.

The download handlers now also set `X-Content-Type-Options: nosniff`, and the
`downloaded = 1` write moved *after* the path check so a rejected request no
longer marks the report as downloaded.

## Before / After

**Before** — `routes/reports.js`
```js
const fileUrl = rows[0].file_url;
if (!fileUrl) return fail(res, 404, "No file attached to this report");

await pool.query("UPDATE reports SET downloaded = 1 WHERE id = ?", [req.params.id]);

if (env.storage.enabled && fileUrl.startsWith("http")) {
  return res.redirect(fileUrl);
}
const filePath = path.join(__dirname, "..", "..", fileUrl);   // ← traversal
if (!fs.existsSync(filePath)) return fail(res, 404, "File not found on disk");
res.download(filePath, path.basename(filePath));
```

**After** — `routes/reports.js`
```js
const fileUrl = rows[0].file_url;
if (!fileUrl) return fail(res, 404, "No file attached to this report");

if (env.storage.enabled && /^https?:\/\//i.test(fileUrl)) {
  await pool.query("UPDATE reports SET downloaded = 1 WHERE id = ?", [req.params.id]);
  return res.redirect(fileUrl);
}

const filePath = resolveStoredFile(fileUrl);                  // ← contained
if (!filePath) return fail(res, 400, "Invalid file reference");
if (!fs.existsSync(filePath)) return fail(res, 404, "File not found on disk");

await pool.query("UPDATE reports SET downloaded = 1 WHERE id = ?", [req.params.id]);
res.setHeader("X-Content-Type-Options", "nosniff");
res.download(filePath, path.basename(filePath));
```

**New** — `utils/paths.js` (core of the check)
```js
const rel = path.relative(resolvedRoot, resolved);
if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) return null;
return resolved;
```

**New** — ownership check in `POST /api/reports`
```js
if (file_url) {
  const [owned] = await pool.query(
    "SELECT id FROM uploads WHERE path = ? AND user_id = ? LIMIT 1",
    [file_url, req.user.id]
  );
  if (!owned.length) throw new HttpError(403, "file_url must reference a file you uploaded");
}
```

## Testing notes

Unit tests were added in `amoo-backend/tests/paths.test.js` covering the
traversal, absolute-path, scheme, NUL-byte, sibling-directory and happy-path
cases. Run with `npm test` in `amoo-backend`.

Manual verification against a running API:

```bash
# 1. Traversal is rejected at validation time (400, never reaches the DB)
curl -X POST $API/api/reports -H "$AUTH" -H "$CSRF" \
     -d '{"title":"x","file_url":"../../.env"}'
# => 400 Validation failed: file_url must be an /uploads/<filename> path or an http(s) URL

# 2. Borrowing another user's upload is rejected (403)
curl -X POST $API/api/reports -H "$AUTH_USER_B" -H "$CSRF" \
     -d '{"title":"x","file_url":"/uploads/<file-owned-by-user-A>"}'
# => 403 file_url must reference a file you uploaded

# 3. A legitimate own-upload download still works (200 + file bytes)
curl -X POST $API/api/uploads -H "$AUTH" -H "$CSRF" -F file=@chart.pdf   # → { url: "/uploads/…" }
curl -X POST $API/api/reports -H "$AUTH" -H "$CSRF" -d '{"title":"x","file_url":"/uploads/…"}'
curl -L $API/api/reports/<id>/download -H "$AUTH" -o out.pdf
```

Also confirm a directly-hand-edited DB row (`UPDATE reports SET file_url =
'../../.env'`) now returns `400 Invalid file reference` rather than the file —
this is the layer that protects rows written before this change.

## Risk / impact

- **Existing rows**: any `reports.file_url` written before this change that is
  not a flat `/uploads/<name>` path or an http(s) URL will now fail the download
  with `400 Invalid file reference` instead of serving a file. Audit with:
  `SELECT id, file_url FROM reports WHERE file_url IS NOT NULL AND file_url NOT REGEXP '^(/uploads/[A-Za-z0-9._-]+|https?://)';`
- **S3 mode unchanged**: when `S3_ENABLED=true` and the value is an absolute
  URL, behaviour is identical (redirect). The regex is now anchored to
  `https?://` rather than `startsWith("http")`, which previously also matched a
  file literally named `http-something`.
- **Report generators**: `report-generators/*` currently return no `file_url`,
  so they are unaffected. If one is later given a real PDF writer, it must emit
  a flat `/uploads/<name>` path.
- **Double-check**: rotate `JWT_SECRET`, `JWT_REFRESH_SECRET` and
  `DB_PASSWORD` if this backend has ever been exposed to untrusted users, since
  the vulnerability allowed reading them. See the manual-steps section of
  `docs/PRODUCTION_READINESS_REPORT.md`.
