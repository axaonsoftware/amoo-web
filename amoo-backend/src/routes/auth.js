const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  authRequired,
} = require("../middleware/auth");
const { asyncHandler, HttpError, genOtp, timingSafeEqualStr } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");
const { ok, created, raw, fail } = require("../utils/response");
const env = require("../config/env");
const { sendMail } = require("../config/email");
const {
  authCookieOptions,
  clearCookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} = require("../utils/cookies");

// The access token travels as an httpOnly cookie so the browser attaches it
// automatically and JavaScript can never read it. It is still returned in the
// response body for non-browser API clients, which send it as a Bearer header.
function setAuthCookies(res, access, refresh) {
  res.cookie("access_token", access, authCookieOptions(ACCESS_TOKEN_MAX_AGE));
  res.cookie("refresh_token", refresh, authCookieOptions(REFRESH_TOKEN_MAX_AGE));
}

function clearAuthCookies(res) {
  res.clearCookie("access_token", clearCookieOptions());
  res.clearCookie("refresh_token", clearCookieOptions());
}

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    role: u.role,
    status: u.status,
    verified: !!u.verified,
    created_at: u.created_at,
  };
}

function publicExpert(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    role_title: u.role_title,
    specialties: u.specialties,
    verified: !!u.verified,
    created_at: u.created_at,
  };
}

function issueTokens(user) {
  const payload = { id: user.id, kind: "user", tokenVersion: user.token_version || 0 };
  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);
  return { access, refresh };
}

function issueExpertTokens(expert) {
  const payload = { id: expert.id, kind: "expert", tokenVersion: expert.token_version || 0 };
  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);
  return { access, refresh };
}

async function checkLockout(table, id) {
  const [rows] = await pool.query(
    `SELECT failed_attempts, locked_until FROM ${table} WHERE id = ?`,
    [id]
  );
  if (!rows.length) return;
  const row = rows[0];
  if (row.locked_until && new Date(row.locked_until) > new Date()) {
    const remaining = Math.ceil((new Date(row.locked_until) - new Date()) / 60000);
    throw new HttpError(423, `Account locked. Try again in ${remaining} minute(s).`);
  }
  // Lock has expired — reset so the next attempt can succeed
  if (row.locked_until && new Date(row.locked_until) <= new Date()) {
    await pool.query(
      `UPDATE ${table} SET failed_attempts = 0, locked_until = NULL WHERE id = ?`,
      [id]
    );
  }
}

async function recordFailedAttempt(table, id) {
  const [rows] = await pool.query(
    `SELECT failed_attempts FROM ${table} WHERE id = ?`,
    [id]
  );
  if (!rows.length) return;
  const attempts = (rows[0].failed_attempts || 0) + 1;
  if (attempts >= env.lockout.maxAttempts) {
    const lockedUntil = new Date(Date.now() + env.lockout.durationMin * 60000);
    await pool.query(
      `UPDATE ${table} SET failed_attempts = ?, locked_until = ? WHERE id = ?`,
      [attempts, lockedUntil, id]
    );
  } else {
    await pool.query(
      `UPDATE ${table} SET failed_attempts = ? WHERE id = ?`,
      [attempts, id]
    );
  }
}

async function resetFailedAttempts(table, id) {
  await pool.query(
    `UPDATE ${table} SET failed_attempts = 0, locked_until = NULL WHERE id = ?`,
    [id]
  );
}

// POST /api/auth/register
router.post(
  "/register",
  validate("register"),
  asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      // Return generic success to prevent user enumeration.
      return ok(res, { message: "Registration successful. Please check your email to verify your account." });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, 'active')",
      [name, email, phone || null, hash]
    );
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
    const { access, refresh } = issueTokens(rows[0]);
    setAuthCookies(res, access, refresh);
    raw(res, 201, { token: access, user: publicUser(rows[0]) });
  })
);
router.post(
  "/login",
  validate("userLogin"),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? AND deleted_at IS NULL", [email]);
    const user = rows[0];
    if (!user || !user.password_hash) throw new HttpError(401, "Invalid credentials");
    if (user.status === "blocked") throw new HttpError(403, "Account is blocked");

    await checkLockout("users", user.id);
    const okPw = await bcrypt.compare(password, user.password_hash);
    if (!okPw) {
      await recordFailedAttempt("users", user.id);
      throw new HttpError(401, "Invalid credentials");
    }
    await resetFailedAttempts("users", user.id);

    const { access, refresh } = issueTokens(user);
    setAuthCookies(res, access, refresh);
    raw(res, 200, { token: access, user: publicUser(user) });
  })
);

// POST /api/auth/admin/login
router.post(
  "/admin/login",
  validate("adminLogin"),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);
    const admin = rows[0];
    if (!admin) throw new HttpError(401, "Invalid credentials");

    await checkLockout("admins", admin.id);
    const okPw = await bcrypt.compare(password, admin.password_hash);
    if (!okPw) {
      await recordFailedAttempt("admins", admin.id);
      throw new HttpError(401, "Invalid credentials");
    }
    await resetFailedAttempts("admins", admin.id);

    const payload = { id: admin.id, kind: "admin", tokenVersion: admin.token_version || 0 };
    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);
    setAuthCookies(res, access, refresh);
    raw(res, 200, {
      token: access,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  })
);

// POST /api/auth/expert/login
router.post(
  "/expert/login",
  validate("expertLogin"),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM experts WHERE email = ? AND deleted_at IS NULL", [email]);
    const expert = rows[0];
    if (!expert || !expert.password_hash) throw new HttpError(401, "Invalid credentials");
    if (expert.status !== "active") throw new HttpError(403, "Account is not active");

    await checkLockout("experts", expert.id);
    const okPw = await bcrypt.compare(password, expert.password_hash);
    if (!okPw) {
      await recordFailedAttempt("experts", expert.id);
      throw new HttpError(401, "Invalid credentials");
    }
    await resetFailedAttempts("experts", expert.id);

    const { access, refresh } = issueExpertTokens(expert);
    setAuthCookies(res, access, refresh);
    raw(res, 200, { token: access, expert: publicExpert(expert) });
  })
);

// POST /api/auth/refresh  (rotate refresh -> new access+refresh)
router.post(
  "/refresh",
  validate("refresh"),
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refresh_token || req.body?.refresh_token;
    if (!token) throw new HttpError(401, "No refresh token");
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (e) {
      throw new HttpError(401, "Invalid or expired refresh token");
    }
    const table = payload.kind === "admin" ? "admins" : payload.kind === "expert" ? "experts" : "users";
    const [rows] = await pool.query(`SELECT id, token_version FROM ${table} WHERE id = ?`, [payload.id]);
    if (!rows.length) throw new HttpError(401, "Account no longer exists");
    if (rows[0].token_version !== payload.tokenVersion) {
      throw new HttpError(401, "Session revoked. Please login again.");
    }

    const newPayload = { id: payload.id, kind: payload.kind, tokenVersion: rows[0].token_version || 0 };
    const access = signAccessToken(newPayload);
    const refresh = signRefreshToken(newPayload);
    setAuthCookies(res, access, refresh);
    raw(res, 200, { token: access });
  })
);

// POST /api/auth/logout
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    clearAuthCookies(res);
    ok(res, { message: "Logged out" });
  })
);

// POST /api/auth/logout-all  (revoke every session by bumping token_version)
router.post(
  "/logout-all",
  authRequired,
  asyncHandler(async (req, res) => {
    const table = req.user.kind === "admin" ? "admins" : req.user.kind === "expert" ? "experts" : "users";
    await pool.query(`UPDATE ${table} SET token_version = token_version + 1 WHERE id = ?`, [req.user.id]);
    clearAuthCookies(res);
    req.audit("logout-all", req.user.kind, req.user.id);
    ok(res, { message: "Logged out of all sessions" });
  })
);

// POST /api/auth/change-password  (authenticated user)
router.post(
  "/change-password",
  authRequired,
  validate("changePassword"),
  asyncHandler(async (req, res) => {
    const { current_password, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    const user = rows[0];
    if (!user || !user.password_hash) throw new HttpError(401, "Account not found");
    const okPw = await bcrypt.compare(current_password, user.password_hash);
    if (!okPw) throw new HttpError(400, "Current password is incorrect");
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      "UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?",
      [hash, user.id]
    );
    clearAuthCookies(res);
    req.audit("change-password", "user", user.id);
    ok(res, { message: "Password updated. Please login again." });
  })
);

// POST /api/auth/verify-email  (complete email verification)
router.post(
  "/verify-email",
  validate("verifyEmail"),
  asyncHandler(async (req, res) => {
    const { email, token } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) throw new HttpError(404, "Account not found");
    if (user.verified) return ok(res, { verified: true, message: "Already verified" });
    if (!user.verify_token || !timingSafeEqualStr(user.verify_token, token)) {
      throw new HttpError(400, "Invalid verification token");
    }
    if (user.verify_token_expires && new Date(user.verify_token_expires) < new Date()) {
      throw new HttpError(400, "Verification token expired");
    }
    await pool.query("UPDATE users SET verified = 1, verify_token = NULL, verify_token_expires = NULL WHERE id = ?", [user.id]);
    req.audit("verify-email", "user", user.id);
    ok(res, { verified: true, message: "Email verified" });
  })
);

// GET /api/auth/verify-email/send  (request a verification token, dev returns it)
router.post(
  "/verify-email/send",
  authRequired,
  asyncHandler(async (req, res) => {
    // The JWT carries only { id, kind, tokenVersion } — there is no email on
    // it. Read the address from the row we're about to stamp the token onto.
    const [rows] = await pool.query(
      "SELECT id, email, verified FROM users WHERE id = ? AND deleted_at IS NULL",
      [req.user.id]
    );
    const user = rows[0];
    if (!user) throw new HttpError(404, "User not found");
    if (user.verified) return ok(res, { verified: true, message: "Already verified" });

    // A link token, not an OTP: genOtp(32) would compute 10^32 and blow past
    // MAX_SAFE_INTEGER, which makes crypto.randomInt throw. 48 hex chars fits
    // users.verify_token VARCHAR(64).
    const token = crypto.randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      "UPDATE users SET verify_token = ?, verify_token_expires = ? WHERE id = ?",
      [token, expires, user.id]
    );
    // The /verify-email page is served by the Next.js frontend, not this API.
    // Building it on env.appUrl produced a link to the API origin, where the
    // path does not exist — every verification email was a dead 404.
    const link = `${env.clientUrl}/verify-email?email=${encodeURIComponent(user.email)}&token=${token}`;
    const mailResult = await sendMail({
      to: user.email,
      subject: "Amoo Guru — Verify your email",
      text: `Click to verify your email: ${link}`,
      html: `<p>Click to verify your email:</p><p><a href="${link}">${link}</a></p>`,
    });
    if (env.devDebugTokens) return ok(res, { message: "Verification token generated", dev_token: token });
    if (!mailResult.sent && env.isProd) throw new HttpError(500, "Failed to send verification email. Please try again.");
    ok(res, { message: "Verification email sent" });
  })
);

// POST /api/auth/forgot-password  (generates OTP)
router.post(
  "/forgot-password",
  validate("forgotPassword"),
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const [rows] = await pool.query("SELECT id, name, email FROM users WHERE email = ? AND deleted_at IS NULL", [email]);
    // Always respond 200 to avoid user enumeration; only act if user exists.
    if (rows.length) {
      const otp = genOtp(env.otp.length || 6);
      const expires = new Date(Date.now() + env.jwt.resetExpiresMin * 60000);
      await pool.query(
        "UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE id = ?",
        [otp, expires, rows[0].id]
      );
      const mailResult = await sendMail({
        to: rows[0].email,
        subject: "Amoo Guru — Password reset OTP",
        text: `Your password reset OTP is ${otp}. It expires in ${env.jwt.resetExpiresMin} minutes.`,
      });
      if (env.devDebugTokens) return ok(res, { message: "OTP generated", dev_otp: otp });
      if (!mailResult.sent && env.isProd) {
        throw new HttpError(500, "Failed to send reset email. Please try again.");
      }
    }
    ok(res, { message: "If the account exists, a reset OTP has been sent." });
  })
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  validate("resetPassword"),
  asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? AND deleted_at IS NULL", [email]);
    const user = rows[0];

    if (!user || !user.reset_otp) {
      throw new HttpError(400, "Invalid OTP");
    }

    // Per-account brute-force protection: invalidate OTP after N failed attempts.
    if ((user.reset_otp_attempts || 0) >= env.otp.maxAttempts) {
      throw new HttpError(400, "Invalid OTP");
    }

    // Constant-time comparison so response duration can't leak the OTP digit by digit.
    if (!timingSafeEqualStr(user.reset_otp, otp)) {
      const attempts = (user.reset_otp_attempts || 0) + 1;
      if (attempts >= env.otp.maxAttempts) {
        await pool.query(
          "UPDATE users SET reset_otp = NULL, reset_otp_expires = NULL, reset_otp_attempts = 0 WHERE id = ?",
          [user.id]
        );
      } else {
        await pool.query(
          "UPDATE users SET reset_otp_attempts = ? WHERE id = ?",
          [attempts, user.id]
        );
      }
      throw new HttpError(400, "Invalid OTP");
    }

    if (!user.reset_otp_expires || new Date(user.reset_otp_expires) < new Date()) {
      throw new HttpError(400, "OTP expired");
    }

    const hash = await bcrypt.hash(password, 12);
    // A reset is the recovery path after a compromise, so every existing
    // session must die with it. Without the token_version bump the attacker's
    // refresh token stays valid for its full 30-day lifetime and they simply
    // mint a new access token — the reset would lock out the owner, not the
    // attacker. /change-password already did this; /reset-password did not.
    // failed_attempts/locked_until are cleared too, so a user who reset
    // *because* they were locked out can actually log back in.
    await pool.query(
      `UPDATE users
          SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL,
              reset_otp_attempts = 0,
              token_version = token_version + 1,
              failed_attempts = 0, locked_until = NULL
        WHERE id = ?`,
      [hash, user.id]
    );
    clearAuthCookies(res);
    req.audit("reset-password", "user", user.id);
    ok(res, { message: "Password updated. Please login again." });
  })
);

// GET /api/auth/me
router.get(
  "/me",
  authRequired,
  asyncHandler(async (req, res) => {
    if (req.user.kind === "admin") {
      const [rows] = await pool.query("SELECT id, name, email, role FROM admins WHERE id = ?", [req.user.id]);
      if (!rows.length) throw new HttpError(404, "Admin not found");
      return ok(res, { kind: "admin", data: rows[0] });
    }
    if (req.user.kind === "expert") {
      const [rows] = await pool.query("SELECT * FROM experts WHERE id = ? AND deleted_at IS NULL", [req.user.id]);
      if (!rows.length) throw new HttpError(404, "Expert not found");
      return ok(res, { kind: "expert", data: publicExpert(rows[0]) });
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) throw new HttpError(404, "User not found");
    ok(res, { kind: "user", data: publicUser(rows[0]) });
  })
);

module.exports = router;
