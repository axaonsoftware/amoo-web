# 007 — Add request validation to six unvalidated admin PATCH routes

- **Category**: Security / Bug Fix
- **Severity**: High
- **File(s) affected**:
  - `amoo-backend/src/middleware/validate.js`
  - `amoo-backend/src/routes/experts.js`
  - `amoo-backend/src/routes/services.js`
  - `amoo-backend/src/routes/packages.js`
  - `amoo-backend/src/routes/testimonials.js`
  - `amoo-backend/src/routes/subscriptions.js`
  - `amoo-backend/src/routes/slots.js`

## Problem

Six admin PATCH endpoints ran with **no `validate()` middleware at all**:

| Route | Handler |
|---|---|
| `PATCH /api/experts/:id` | `adminRequired` → `buildUpdate` |
| `PATCH /api/services/:id` | `adminRequired` → `buildUpdate` |
| `PATCH /api/packages/:id` | `adminRequired` → `buildUpdate` |
| `PATCH /api/testimonials/:id` | `adminRequired` → `buildUpdate` |
| `PATCH /api/subscriptions/:id` | `adminRequired` → `buildUpdate` |
| `PATCH /api/slots/:id` | `adminRequired` → inline `includes()` check |

Each went straight from the auth check into `buildUpdate(req.body, ALLOWED, …)`.

`buildUpdate` whitelists **column names**, so this was never SQL-injectable —
that part was sound. What it does not do is check anything about the **values**:

```js
const keys = Object.keys(fields).filter((k) => allowed.includes(k));
const setClause = keys.map((k) => `\`${k}\` = ?`).join(", ");
const values = [...keys.map((k) => fields[k]), ...startingValues];
```

Consequences, all reachable by any admin account (or anything that compromises
one):

- **Silent truncation / 500s.** A 10 MB string sent to `experts.name`
  (`VARCHAR(120)`) either truncates to 120 characters in MySQL's default
  non-strict mode or throws `ER_DATA_TOO_LONG` and surfaces as an opaque 500.
- **ENUM corruption.** `services.status` is `ENUM('Active','Inactive')`.
  Writing `"active"` (lowercase) or `"Archived"` in non-strict mode stores the
  **empty string** — the row then matches neither `status='Active'` nor
  `status='Inactive'`, so the service vanishes from both the public list and the
  admin list with no error anywhere. Same hazard on
  `subscriptions.status`, `testimonials.status`, `slots.status`.
- **Out-of-range values.** `experts.rating` is `DECIMAL(2,1)`; `rating: 999`
  overflows. `packages.price` accepted negative numbers, which flow into
  `subscriptions` pricing and then into Razorpay order creation.
- **Type confusion.** `{"name": {"$ne": null}}` or `{"name": ["a","b"]}` reached
  `pool.query` as an object/array; mysql2 serialises those in ways nobody
  intended.
- **`PATCH /api/slots/:id` returned 200 for a nonexistent slot** — the UI showed
  a successful save against a row that was never touched.

The pattern was clearly an oversight rather than a decision: the *sibling*
routes (`POST /api/experts`, `POST /api/services`, `PATCH /api/blogs/:id`,
`PATCH /api/faqs/:id`, `PATCH /api/reports/:id`) all validate correctly. These
six were simply missed.

## Solution

Added dedicated PATCH schemas alongside the existing POST ones. They are
separate objects rather than `.fork()`ed variants of the create schemas for the
same reason `blogUpdate` already exists separately: a PATCH must have **nothing
required** (so a partial update need not resend every field) and **no
defaults** (a default would silently rewrite a field the caller never mentioned).

Also added, while in these files:

- `PATCH /api/experts/:id` now pre-checks the `UNIQUE` email constraint and
  returns `409` instead of letting `ER_DUP_ENTRY` become a 500.
- `PATCH /api/slots/:id` now returns `404` when `affectedRows === 0`.

## Before / After

**Before** — `routes/services.js`
```js
router.patch(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, SERVICE_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE services SET ${setClause} WHERE id = ?`, values);
```

**After** — `routes/services.js`
```js
router.patch(
  "/:id",
  adminRequired,
  validate("serviceUpdate"),          // ← added
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, SERVICE_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE services SET ${setClause} WHERE id = ?`, values);
```

**New schemas** — `middleware/validate.js` (one shown; five more follow the same shape)
```js
serviceUpdate: Joi.object({
  name: Joi.string().max(160),
  sub: optionalString.max(255),
  img: optionalString.max(512),
  category: Joi.string().valid(
    "Numerology", "Tarot", "Astrology", "Healing", "Vastu", "AI Services", "Spiritual"
  ),
  type: Joi.string().valid("Report", "Consultation", "Chat"),
  price: Joi.number().min(0),
  duration: optionalString.max(40),
  status: Joi.string().valid("Active", "Inactive"),
}),
```

**New** — expert email collision check
```js
if (req.body.email) {
  const [clash] = await pool.query(
    "SELECT id FROM experts WHERE email = ? AND id <> ?",
    [req.body.email, req.params.id]
  );
  if (clash.length) throw new HttpError(409, "Expert email already exists");
}
```

**Before / After** — `routes/slots.js`
```diff
 router.patch(
   "/:id",
   adminRequired,
+  validate("slotUpdate"),
   asyncHandler(async (req, res) => {
     const { status } = req.body;
-    if (!["available", "booked", "blocked"].includes(status)) throw new HttpError(400, "Invalid status");
-    await pool.query("UPDATE slots SET status = ? WHERE id = ?", [status, req.params.id]);
+    const [result] = await pool.query("UPDATE slots SET status = ? WHERE id = ?", [status, req.params.id]);
+    if (result.affectedRows === 0) throw new HttpError(404, "Slot not found");
```

## Testing notes

Backend `npm test` — 73/73 pass (46 unit + 27 integration), confirming no
regression in the existing admin flows.

Per-route manual checks:

```bash
# ENUM corruption is now rejected instead of storing ''
curl -X PATCH $API/api/services/1 -H "$ADMIN_AUTH" -H "$CSRF" -d '{"status":"Archived"}'
# => 400 Validation failed: ["status" must be one of [Active, Inactive]]

# over-long value rejected at the edge
curl -X PATCH $API/api/experts/1 -H "$ADMIN_AUTH" -H "$CSRF" \
     -d "{\"name\":\"$(head -c 500 /dev/zero | tr '\0' 'a')\"}"
# => 400 Validation failed: ["name" length must be less than or equal to 120 characters long]

# rating range enforced
curl -X PATCH $API/api/experts/1 -H "$ADMIN_AUTH" -H "$CSRF" -d '{"rating":999}'
# => 400 Validation failed: ["rating" must be less than or equal to 5]

# duplicate email is a clean 409, not a 500
curl -X PATCH $API/api/experts/2 -H "$ADMIN_AUTH" -H "$CSRF" -d '{"email":"neha@amooguru.com"}'
# => 409 Expert email already exists

# nonexistent slot
curl -X PATCH $API/api/slots/999999 -H "$ADMIN_AUTH" -H "$CSRF" -d '{"status":"blocked"}'
# => 404 Slot not found       (was: 200 {"id":999999,"status":"blocked"})

# ordinary partial updates still work
curl -X PATCH $API/api/services/1 -H "$ADMIN_AUTH" -H "$CSRF" -d '{"price":1499}'   # => 200
```

## Risk / impact

- **Stricter input** — an admin client sending a value that was previously
  accepted-and-corrupted now gets a 400. The admin UI panels send values drawn
  from fixed `<select>` option lists that match these enums, so no legitimate
  frontend call is affected. Verified against `ServicesPanel.tsx`,
  `ExpertPanel.tsx`, `PackagesPanel.tsx` and `AvailabilityTable.tsx`.
- **`validate()` uses `stripUnknown: true`.** Any key not in the schema is now
  silently dropped rather than passed to `buildUpdate`. Since `buildUpdate` also
  filtered against its own allow-list, the net effect is unchanged — but if a
  column is added to a `*_UPDATE_ALLOWED` array in future, **the schema must be
  updated too** or the field will be stripped before it reaches the query. This
  is the same footgun that caused the `auto_renew` bug (change 008).
- **Existing corrupted rows are not repaired.** If any row already has an empty
  ENUM from before this fix, find them with e.g.
  `SELECT id, status FROM services WHERE status NOT IN ('Active','Inactive');`
  and correct them manually.
