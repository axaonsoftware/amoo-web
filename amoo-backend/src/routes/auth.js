const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  authRequired,
} = require("../middleware/auth");
const { asyncHandler, HttpError, genOtp } = require("../utils/helpers");
const { validate, schemas } = require("../middleware/validate");
const { ok, created, raw, fail } = require("../utils/response");
const env = require("../config/env");
const { sendMail } = require("../config/email");

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

function issueTokens(user) {
  const payload = { id: user.id, kind: "user", tokenVersion: user.token_version || 0 };
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
    if (existing.length) throw new HttpError(409, "Email already registered");

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, 'active')",
      [name, email, phone || null, hash]
    );
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
    const { access, refresh } = issueTokens(rows[0]);
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProd,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
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
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProd,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
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
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProd,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    raw(res, 200, {
      token: access,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
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
    const table = payload.kind === "admin" ? "admins" : "users";
    const [rows] = await pool.query(`SELECT id, token_version FROM ${table} WHERE id = ?`, [payload.id]);
    if (!rows.length) throw new HttpError(401, "Account no longer exists");
    if (rows[0].token_version !== payload.tokenVersion) {
      throw new HttpError(401, "Session revoked. Please login again.");
    }

    const newPayload = { id: payload.id, kind: payload.kind, tokenVersion: rows[0].token_version || 0 };
    const access = signAccessToken(newPayload);
    const refresh = signRefreshToken(newPayload);
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProd,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    raw(res, 200, { token: access });
  })
);

// POST /api/auth/logout
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    res.clearCookie("refresh_token");
    ok(res, { message: "Logged out" });
  })
);

// POST /api/auth/logout-all  (revoke every session by bumping token_version)
router.post(
  "/logout-all",
  authRequired,
  asyncHandler(async (req, res) => {
    const table = req.user.kind === "admin" ? "admins" : "users";
    await pool.query(`UPDATE ${table} SET token_version = token_version + 1 WHERE id = ?`, [req.user.id]);
    res.clearCookie("refresh_token");
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
    res.clearCookie("refresh_token");
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
    if (!user.verify_token || user.verify_token !== token) throw new HttpError(400, "Invalid verification token");
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
    const token = genOtp(32);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      "UPDATE users SET verify_token = ?, verify_token_expires = ? WHERE id = ?",
      [token, expires, req.user.id]
    );
    const link = `${env.appUrl}/verify-email?email=${encodeURIComponent(req.user.email)}&token=${token}`;
    await sendMail({
      to: req.user.email,
      subject: "Amoo Guru — Verify your email",
      text: `Click to verify your email: ${link}`,
      html: `<p>Click to verify your email:</p><p><a href="${link}">${link}</a></p>`,
    });
    if (!env.isProd) return ok(res, { message: "Verification token generated", dev_token: token });
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
      const otp = genOtp(6);
      const expires = new Date(Date.now() + env.jwt.resetExpiresMin * 60000);
      await pool.query(
        "UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE id = ?",
        [otp, expires, rows[0].id]
      );
      await sendMail({
        to: rows[0].email,
        subject: "Amoo Guru — Password reset OTP",
        text: `Your password reset OTP is ${otp}. It expires in ${env.jwt.resetExpiresMin} minutes.`,
      });
      // NOTE: real deployment sends the OTP via email/SMS. We return it here for dev only.
      if (!env.isProd) return ok(res, { message: "OTP generated", dev_otp: otp });
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
    if (!user || !user.reset_otp || user.reset_otp !== otp) throw new HttpError(400, "Invalid OTP");
    if (new Date(user.reset_otp_expires) < new Date()) throw new HttpError(400, "OTP expired");

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      "UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE id = ?",
      [hash, user.id]
    );
    ok(res, { message: "Password updated" });
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
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) throw new HttpError(404, "User not found");
    ok(res, { kind: "user", data: publicUser(rows[0]) });
  })
);

module.exports = router;
