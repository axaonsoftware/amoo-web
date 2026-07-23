# 002 — Revoke all sessions on password reset; constant-time OTP/token comparison

- **Category**: Security
- **Severity**: Critical
- **File(s) affected**:
  - `amoo-backend/src/routes/auth.js`
  - `amoo-backend/src/utils/helpers.js`

## Problem

**1. A password reset did not end existing sessions.**

`POST /api/auth/reset-password` rewrote `password_hash` and cleared the OTP, but
left `token_version` untouched:

```js
await pool.query(
  "UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE id = ?",
  [hash, user.id]
);
```

`middleware/auth.js` revokes sessions by comparing the JWT's embedded
`tokenVersion` against the database column. Leaving it unchanged means every
token issued before the reset stays valid.

Password reset is *the* recovery path after an account compromise. An attacker
holding a stolen `refresh_token` keeps it for the full `JWT_REFRESH_EXPIRES_IN`
window — **30 days by default** — and simply calls `POST /api/auth/refresh` to
mint fresh access tokens. The reset locked the legitimate owner into a new
password while leaving the attacker's access completely intact. It actively
misled the user into believing they had recovered the account.

`POST /api/auth/change-password` already did the bump correctly, which makes
the omission clearly an oversight rather than a design decision.

**2. A locked-out user stayed locked out after resetting.**

`failed_attempts` and `locked_until` were not cleared. The most common reason a
user resets their password is that they failed to log in repeatedly and got
locked — and after a successful reset they still could not sign in until the
lockout expired.

**3. Secret comparisons were not constant-time.**

Both the reset OTP and the email verification token used `!==`:

```js
if (!user || !user.reset_otp || user.reset_otp !== otp) throw new HttpError(400, "Invalid OTP");
if (!user.verify_token || user.verify_token !== token) throw new HttpError(400, "Invalid verification token");
```

JavaScript string comparison short-circuits at the first differing character, so
response time correlates with how many leading characters are correct. A 6-digit
OTP is a small enough space that this meaningfully assists a remote attacker,
especially combined with the fact that `/reset-password` is rate-limited per IP
rather than per account.

**4. A null expiry was treated as valid.** `new Date(null) < new Date()`
evaluates to `true` (null coerces to epoch 0), so the expiry check happened to
work — but only by accident. An explicit null check is clearer and not
dependent on coercion behaviour.

## Solution

Bump `token_version`, clear the lockout counters, clear the auth cookies, and
write an audit entry — matching what `/change-password` already does. The
response message changes to "Please login again." so the client knows the
session is gone.

For the timing issue, a `timingSafeEqualStr` helper hashes both operands to a
fixed 32-byte digest and compares with `crypto.timingSafeEqual`. Hashing first
matters: `timingSafeEqual` throws a `RangeError` on a length mismatch, and
catching that to return `false` would itself leak the secret's length. Hashing
normalises the width so the comparison is uniform for any input.

## Before / After

**Before** — `routes/auth.js`
```js
if (!user || !user.reset_otp || user.reset_otp !== otp) throw new HttpError(400, "Invalid OTP");
if (new Date(user.reset_otp_expires) < new Date()) throw new HttpError(400, "OTP expired");

const hash = await bcrypt.hash(password, 12);
await pool.query(
  "UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE id = ?",
  [hash, user.id]
);
ok(res, { message: "Password updated" });
```

**After** — `routes/auth.js`
```js
if (!user || !user.reset_otp || !timingSafeEqualStr(user.reset_otp, otp)) {
  throw new HttpError(400, "Invalid OTP");
}
if (!user.reset_otp_expires || new Date(user.reset_otp_expires) < new Date()) {
  throw new HttpError(400, "OTP expired");
}

const hash = await bcrypt.hash(password, 12);
await pool.query(
  `UPDATE users
      SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL,
          token_version = token_version + 1,
          failed_attempts = 0, locked_until = NULL
    WHERE id = ?`,
  [hash, user.id]
);
clearAuthCookies(res);
req.audit("reset-password", "user", user.id);
ok(res, { message: "Password updated. Please login again." });
```

**New** — `utils/helpers.js`
```js
function timingSafeEqualStr(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}
```

Also applied to `POST /api/auth/verify-email`, which compared `verify_token`
the same way.

## Testing notes

Integration coverage added in `amoo-backend/tests/integration.test.js`
(`POST /api/auth/reset-password` suite) asserting that the UPDATE statement
contains `token_version = token_version + 1`. Run `npm test` in `amoo-backend`.

Manual end-to-end check:

```bash
# 1. Log in and keep the refresh cookie
curl -c jar.txt -X POST $API/api/auth/login -d '{"email":"u@x.com","password":"old-pass"}'

# 2. Reset the password in a separate session
curl -X POST $API/api/auth/forgot-password -d '{"email":"u@x.com"}'   # dev returns dev_otp
curl -X POST $API/api/auth/reset-password  -d '{"email":"u@x.com","otp":"<otp>","password":"new-pass"}'

# 3. The pre-reset session must now be dead
curl -b jar.txt -X POST $API/api/auth/refresh
# => 401 "Session revoked. Please login again."     (was: 200 + a fresh access token)
```

Also verify a locked account recovers: fail login 5 times (→ `423 Account
locked`), reset the password, then log in immediately — it should succeed
rather than continue to report the lockout.

## Risk / impact

- **All users are logged out of the account they reset.** This is the intended
  behaviour and matches `/change-password`, but it is a user-visible change: the
  frontend must send them to the login screen. `amoo-web/app/reset-password/ResetPasswordForm.tsx`
  already redirects to `/user-login` on success, so no frontend change was needed.
- **Admins and experts are unaffected** — `/reset-password` only ever operated on
  the `users` table. Password recovery for those roles still has no self-service
  route (admins are seeded, expert passwords are set by an admin via
  `POST /api/experts/:id/set-password`). Noted as a gap in the final report.
- **`timingSafeEqualStr` adds two SHA-256 hashes per call** — negligible next to
  the bcrypt work already on these routes.
- **Double-check**: if any user reset their password during the window this bug
  was live, consider forcing a global revocation with
  `UPDATE users SET token_version = token_version + 1;` — cheap, and it costs
  nothing but a single re-login for everyone.
