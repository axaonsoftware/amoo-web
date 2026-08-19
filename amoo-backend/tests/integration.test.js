// Integration tests — uses monkey-patched DB pool (no experimental flags needed)
// Run with: node --test tests/integration.test.js
process.env.NODE_ENV = "test";
const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");

// ---------------------------------------------------------------------------
// Monkey‑patch the real pool BEFORE routes load
// ---------------------------------------------------------------------------
const { createMockPool, createMockConnection } = require("./setup");

const mockHandlers = [];

function mockResolvedValue(rows) {
  mockHandlers.push(() => Promise.resolve({ rows, rowCount: rows?.length || 0 }));
}

function mockReject(err) {
  mockHandlers.push(() => Promise.reject(err));
}

/** Every SQL statement the app issued, so tests can assert on what ran. */
const queryLog = [];

/** Consume one handler per query call */
function makeQuery() {
  return (...args) => {
    queryLog.push(String(args[0]));
    const h = mockHandlers.shift();
    if (!h) throw new Error(`No mock for query: ${String(args[0]).slice(0, 120)}...`);
    return h();
  };
}

const mockConn = createMockConnection();
mockConn.query = makeQuery();

const mockPool = createMockPool();
mockPool.query = makeQuery();
mockPool.connect = () => Promise.resolve(mockConn);

// Patch the real db module
const db = require("../src/config/db");
db.pool = mockPool;
db.testConnection = () => Promise.resolve(true);

// ---------------------------------------------------------------------------
// Load the app
// ---------------------------------------------------------------------------
const app = require("../src/server");
const { signAccessToken, clearTokenVersionCache } = require("../src/middleware/auth");

const userToken = signAccessToken({ id: 1, kind: "user", tokenVersion: 0 });
const user2Token = signAccessToken({ id: 2, kind: "user", tokenVersion: 0 });
const adminToken = signAccessToken({ id: 1, kind: "admin", tokenVersion: 0 });

function resetMocks() {
  mockHandlers.length = 0;
  queryLog.length = 0;
  clearTokenVersionCache();
}

// ---------------------------------------------------------------------------
// Start server on random port
// ---------------------------------------------------------------------------
let server, baseUrl;
before(() => new Promise((ok) => {
  server = app.listen(0, () => {
    baseUrl = `http://localhost:${server.address().port}`;
    ok();
  });
}));
after(() => new Promise((ok) => server.close(ok)));

// A valid double-submit pair: the same token in the cookie and the header.
// State-changing routes are CSRF-protected, so requests carry it by default;
// pass `csrf: false` (or an explicit `csrf` value) to exercise the guard.
const CSRF_TOKEN = "a".repeat(64);

// Booking dates must satisfy the booking schema's future-date rule
// (Joi .min("now")), so always derive them relative to "now" rather than
// hardcoding a calendar year that drifts into the past.
const FUTURE_DATE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

async function api(method, path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...opts.headers };
  const csrf = opts.csrf === undefined ? CSRF_TOKEN : opts.csrf;
  if (csrf !== false) {
    headers["X-CSRF-Token"] = csrf;
    headers.Cookie = [headers.Cookie, `csrf_token=${CSRF_TOKEN}`].filter(Boolean).join("; ");
  }
  const res = await fetch(baseUrl + path, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const body = res.headers.get("content-type")?.includes("json")
    ? await res.json()
    : await res.text();
  return { status: res.status, headers: res.headers, body };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
describe("POST /api/auth/register", () => {
  beforeEach(resetMocks);

  it("creates a user and returns access token", async () => {
    mockResolvedValue([]);                                          // 0: SELECT existing — none
    mockResolvedValue([{ id: 2 }]);                                 // 1: INSERT user RETURNING id
    mockResolvedValue([{                                            // 2: SELECT created
      id: 2, name: "Alice", email: "alice@test.com",
      password_hash: "$2a$12$x", role: "free", status: "active",
      verified: 0, token_version: 0, failed_attempts: 0, locked_until: null,
      deleted_at: null, phone: null, avatar: null,
      created_at: "2025-01-01T00:00:00.000Z", updated_at: "2025-01-01T00:00:00.000Z",
    }]);
    mockResolvedValue([]);                                          // 3: UPDATE refresh_jti
    mockResolvedValue([{ token_version: 0 }]);                      // 4: checkTokenVersion

    const res = await api("POST", "/api/auth/register", {
      body: { name: "Alice", email: "alice@test.com", password: "password123" },
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, "alice@test.com");
  });

  it("rejects duplicate email (generic error, no enumeration)", async () => {
    mockResolvedValue([{ id: 1 }]);                                 // SELECT existing → found

    const res = await api("POST", "/api/auth/register", {
      body: { name: "Alice", email: "dup@test.com", password: "password123" },
    });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /Registration failed/i);
  });

  it("rejects missing required fields", async () => {
    const res = await api("POST", "/api/auth/register", {
      body: { email: "a@b.com" },
    });
    assert.strictEqual(res.status, 400);
  });
});

describe("POST /api/auth/login", () => {
  // bcrypt hash of "password123" — generated fresh to ensure correctness
const hash = "$2a$12$WY2Yo.FGEW6NVvLhOJlSHuv4KoSKz0xqEPUiWx152PLiZbTvjs4C2";
  const userRow = {
    id: 1, name: "Test", email: "test@example.com", password_hash: hash,
    role: "free", status: "active", verified: 1, token_version: 0,
    failed_attempts: 0, locked_until: null, deleted_at: null, phone: null,
    avatar: null, created_at: "2025-01-01T00:00:00.000Z", updated_at: "2025-01-01T00:00:00.000Z",
  };

  beforeEach(resetMocks);

  it("logs in with valid credentials", async () => {
    mockResolvedValue([userRow]);                                   // 0: SELECT user
    mockResolvedValue([{ failed_attempts: 0, locked_until: null }]);// 1: checkLockout
    mockResolvedValue([]);                                          // 2: resetFailedAttempts
    mockResolvedValue([]);                                          // 3: UPDATE refresh_jti
    mockResolvedValue([{ token_version: 0 }]);                      // 4: checkTokenVersion

    const res = await api("POST", "/api/auth/login", {
      body: { email: "test@example.com", password: "password123" },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
  });

  it("rejects wrong password", async () => {
    mockResolvedValue([userRow]);                                   // SELECT user
    mockResolvedValue([{ failed_attempts: 0, locked_until: null }]);// checkLockout
    mockResolvedValue([]);                                          // recordFailedAttempt (SELECT inside returns no rows → early return)

    const res = await api("POST", "/api/auth/login", {
      body: { email: "test@example.com", password: "wrongpass" },
    });
    assert.strictEqual(res.status, 401);
  });

  it("rejects blocked account", async () => {
    mockResolvedValue([{ ...userRow, status: "blocked" }]);         // SELECT user

    const res = await api("POST", "/api/auth/login", {
      body: { email: "test@example.com", password: "password123" },
    });
    assert.strictEqual(res.status, 403);
  });
});

describe("GET /api/auth/me", () => {
  beforeEach(resetMocks);

  it("returns 401 without token", async () => {
    const res = await api("GET", "/api/auth/me");
    assert.strictEqual(res.status, 401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await api("GET", "/api/auth/me", {
      headers: { Authorization: "Bearer invalid" },
    });
    assert.strictEqual(res.status, 401);
  });

  it("returns user data with valid token", async () => {
    mockResolvedValue([{ token_version: 0 }]);                      // checkTokenVersion
    mockResolvedValue([{                                            // SELECT user
      id: 1, name: "Test", email: "t@t.com", role: "free",
      status: "active", verified: 1, phone: null, avatar: null,
      created_at: "2025-01-01T00:00:00.000Z",
    }]);

    const res = await api("GET", "/api/auth/me", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body?.data?.data?.email, "t@t.com");
  });
});

// ---------------------------------------------------------------------------
// Bookings — happy path + security
// ---------------------------------------------------------------------------
describe("POST /api/bookings", () => {
  beforeEach(resetMocks);

  /** The exact query sequence a successful create now makes. */
  function mockCreateBooking() {
    mockResolvedValue([{ token_version: 0 }]);                      // 0: checkTokenVersion (pool.query)
    mockResolvedValue([{ verified: 1 }]);                           // 1: verifiedRequired (pool.query)
    mockResolvedValue([{ }]);                                        // 2: BEGIN (client.query)
    mockResolvedValue([]);                                          // 3: idempotency pre-check -> none
    mockResolvedValue([{ id: 1, price: 100 }]);                     // 4: SELECT service price
    mockResolvedValue([{ id: 1, expert_id: 1, status: "available" }]);// 5: SELECT slot FOR UPDATE
    mockResolvedValue([]);                                          // 6: UPDATE slot → booked
    mockResolvedValue([{ id: 1 }]);                                 // 7: INSERT booking RETURNING id
    mockResolvedValue([{ }]);                                        // 8: COMMIT (client.query)
    mockResolvedValue([{                                          // 9: SELECT created booking
      id: 1, booking_ref: "BOOK-T", user_id: 1, service_id: 1,
      date: FUTURE_DATE, time: "10:00", amount: 100,
      payment: "Pending", status: "pending-payment",
    }]);
  }

  it("creates a pending booking with slot reservation", async () => {
    mockCreateBooking();

    const res = await api("POST", "/api/bookings", {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { service_id: 1, slot_id: 1, date: FUTURE_DATE, time: "10:00",
              amount: 100, method: "card" },
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.success);
    assert.strictEqual(res.body.data.payment, "Pending");
  });

  // S1: POST /api/bookings must never produce a paid booking, whatever the
  // client asks for. The booking is inserted Pending and no payments row is
  // created — only a verified gateway callback may mark money as received.
  it("ignores a client-supplied payment='Paid' and stays pending", async () => {
    mockCreateBooking();

    const res = await api("POST", "/api/bookings", {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { service_id: 1, slot_id: 1, date: FUTURE_DATE, time: "10:00",
              amount: 100, payment: "Paid", method: "card" },
    });
    assert.strictEqual(res.status, 201);

    const insertBooking = queryLog.find((q) => /INSERT INTO bookings/i.test(q));
    assert.ok(insertBooking, "expected a booking insert");
    assert.match(insertBooking, /'Pending', 'pending-payment'/);
    assert.ok(
      !queryLog.some((q) => /INSERT INTO payments/i.test(q)),
      "booking creation must never insert a payments row"
    );
  });

  it("rejects amount mismatch with service price", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // 0: checkTokenVersion
    mockResolvedValue([{ verified: 1 }]);                          // 1: verifiedRequired
    mockResolvedValue([{ }]);                                       // 2: BEGIN
    mockResolvedValue([]);                                          // 3: idempotency pre-check -> none
    mockResolvedValue([{ id: 1, price: 100 }]);                    // 4: SELECT service (price=100)
    mockResolvedValue([{ }]);                                       // 5: ROLLBACK

    const res = await api("POST", "/api/bookings", {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { service_id: 1, date: FUTURE_DATE, time: "10:00", amount: 999 },
    });
    assert.strictEqual(res.status, 400);
  });

  it("rejects unauthenticated requests", async () => {
    const res = await api("POST", "/api/bookings", {
      body: { service_id: 1, date: FUTURE_DATE, time: "10:00", amount: 0 },
    });
    assert.strictEqual(res.status, 401);
  });

  it("returns the original booking when the same Idempotency-Key is replayed", async () => {
    const bookingBody = {
      service_id: 1, slot_id: 1, date: FUTURE_DATE, time: "10:00",
      amount: 100, method: "card",
    };
    const idemHeaders = { "Idempotency-Key": "booking-retry-123" };

    // First attempt: pre-check finds nothing, booking is created.
    mockResolvedValue([{ token_version: 0 }]);                     // checkTokenVersion
    mockResolvedValue([{ verified: 1 }]);                          // verifiedRequired
    mockResolvedValue([{ }]);                                       // BEGIN
    mockResolvedValue([]);                                          // idempotency pre-check -> none
    mockResolvedValue([{ id: 1, price: 100 }]);                     // SELECT service
    mockResolvedValue([{ id: 1, expert_id: 1, status: "available" }]);// SELECT slot FOR UPDATE
    mockResolvedValue([]);                                          // UPDATE slot -> booked
    mockResolvedValue([{ id: 1 }]);                                 // INSERT booking
    mockResolvedValue([{ }]);                                       // COMMIT
    mockResolvedValue([{                                            // SELECT created
      id: 1, booking_ref: "BOOK-T", user_id: 1, service_id: 1,
      date: FUTURE_DATE, time: "10:00", amount: 100,
      payment: "Pending", status: "pending-payment",
    }]);

    const first = await api("POST", "/api/bookings", {
      headers: { Authorization: `Bearer ${userToken}`, ...idemHeaders },
      body: bookingBody,
    });
    assert.strictEqual(first.status, 201);
    assert.strictEqual(first.body.data.payment, "Pending");
    const insertsAfterFirst = queryLog.filter((q) => /INSERT INTO bookings/i.test(q));

    // Retry with the same key: pre-check finds the original and returns it.
    resetMocks();
    mockResolvedValue([{ token_version: 0 }]);                     // checkTokenVersion
    mockResolvedValue([{ verified: 1 }]);                          // verifiedRequired
    mockResolvedValue([{ }]);                                       // BEGIN
    mockResolvedValue([{                                            // idempotency pre-check -> found
      id: 1, user_id: 1, booking_ref: "BOOK-T", service_id: 1,
      date: FUTURE_DATE, time: "10:00", amount: 100,
      payment: "Pending", status: "pending-payment",
    }]);
    mockResolvedValue([{ }]);                                       // COMMIT

    const second = await api("POST", "/api/bookings", {
      headers: { Authorization: `Bearer ${userToken}`, ...idemHeaders },
      body: bookingBody,
    });
    assert.strictEqual(second.status, 200);
    assert.strictEqual(second.body.data.id, 1);
    // Only one INSERT ever ran for this key.
    const insertsAfterSecond = queryLog.filter((q) => /INSERT INTO bookings/i.test(q));
    assert.strictEqual(insertsAfterFirst.length, 1, "the first attempt must insert once");
    assert.strictEqual(insertsAfterSecond.length, 0, "a replayed key must not insert twice");
  });
});

describe("GET /api/bookings/:id — cross-user security", () => {
  beforeEach(resetMocks);

  it("user can see own booking", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // checkTokenVersion
    mockResolvedValue([{                                            // SELECT booking
      id: 1, user_id: 1, service_id: 1, date: FUTURE_DATE,
      time: "10:00", amount: 100, payment: "Paid", status: "upcoming",
      user_name: "Test", expert_name: null, service_name: "Svc",
    }]);

    const res = await api("GET", "/api/bookings/1", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  it("user CANNOT see another user's booking", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // checkTokenVersion
    mockResolvedValue([{                                            // booking owned by user_id=1
      id: 1, user_id: 1, service_id: 1, date: FUTURE_DATE,
      time: "10:00", amount: 100, payment: "Paid", status: "upcoming",
      user_name: "Test", expert_name: null, service_name: "Svc",
    }]);

    const res = await api("GET", "/api/bookings/1", {
      headers: { Authorization: `Bearer ${user2Token}` },          // user2 (id=2)
    });
    assert.strictEqual(res.status, 403);
  });

  it("admin can see any user's booking", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // adminRequired
    mockResolvedValue([{                                            // SELECT booking
      id: 1, user_id: 1, service_id: 1, date: FUTURE_DATE,
      time: "10:00", amount: 100, payment: "Paid", status: "upcoming",
      user_name: "Test", expert_name: null, service_name: "Svc",
    }]);

    const res = await api("GET", "/api/bookings/1", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
  });
});

// ---------------------------------------------------------------------------
// CSRF (double-submit cookie)
// ---------------------------------------------------------------------------
describe("CSRF protection", () => {
  beforeEach(resetMocks);

  it("rejects a state-changing request with no CSRF token", async () => {
    const res = await api("POST", "/api/bookings", {
      csrf: false,
      headers: { Authorization: `Bearer ${userToken}` },
      body: { service_id: 1, date: FUTURE_DATE, time: "10:00", amount: 0 },
    });
    assert.strictEqual(res.status, 403);
    assert.match(res.body.error, /CSRF/);
  });

  it("rejects a header that does not match the cookie", async () => {
    const res = await api("POST", "/api/bookings", {
      csrf: "b".repeat(64), // valid shape, wrong value
      headers: { Authorization: `Bearer ${userToken}` },
      body: { service_id: 1, date: FUTURE_DATE, time: "10:00", amount: 0 },
    });
    assert.strictEqual(res.status, 403);
    assert.match(res.body.error, /CSRF/);
  });

  it("allows GET without a CSRF token", async () => {
    mockResolvedValue([{ token_version: 0 }]);
    mockResolvedValue([{
      id: 1, name: "Test", email: "t@t.com", role: "free",
      status: "active", verified: 1, phone: null, avatar: null,
      created_at: "2025-01-01T00:00:00.000Z",
    }]);

    const res = await api("GET", "/api/auth/me", {
      csrf: false,
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  it("exempts login so a fresh client can authenticate", async () => {
    mockResolvedValue([]); // SELECT user → none, so login fails on credentials
    const res = await api("POST", "/api/auth/login", {
      csrf: false,
      body: { email: "test@example.com", password: "password123" },
    });
    assert.strictEqual(res.status, 401); // reached the handler, not blocked by CSRF
  });

  it("issues a csrf_token cookie and echoes it in a response header", async () => {
    const res = await api("GET", "/api/health", { csrf: false });
    const token = res.headers.get("x-csrf-token");
    assert.match(token, /^[a-f0-9]{64}$/);
    assert.match(res.headers.get("set-cookie") || "", /csrf_token=/);
  });
});

// ---------------------------------------------------------------------------
// Cookie-based auth
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// OTP / Password Reset
// ---------------------------------------------------------------------------
describe("POST /api/auth/forgot-password", () => {
  beforeEach(resetMocks);

  it("generates OTP for existing user and always returns 200", async () => {
    mockResolvedValue([{ id: 1, name: "Test", email: "test@test.com" }]); // SELECT user
    mockResolvedValue([]);                                                   // UPDATE reset_otp

    const res = await api("POST", "/api/auth/forgot-password", {
      body: { email: "test@test.com" },
    });
    assert.strictEqual(res.status, 200);
    // Must not reveal whether the email exists
    assert.match(res.body.data.message, /If the account exists/i);
  });

  it("returns same message for unknown email (no enumeration)", async () => {
    mockResolvedValue([]); // SELECT user — none

    const res = await api("POST", "/api/auth/forgot-password", {
      body: { email: "unknown@test.com" },
    });
    assert.strictEqual(res.status, 200);
    assert.match(res.body.data.message, /If the account exists/i);
  });

  it("rejects missing email", async () => {
    const res = await api("POST", "/api/auth/forgot-password", { body: {} });
    assert.strictEqual(res.status, 400);
  });
});

describe("POST /api/auth/reset-password", () => {
  const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
  const userRow = {
    id: 1, name: "Test", email: "test@test.com", password_hash: "$2a$12$x",
    // reset_otp is now stored hashed (sha256 hex)
    reset_otp: hash("123456"), reset_otp_expires: new Date(Date.now() + 60000).toISOString(),
    reset_otp_attempts: 0,
    role: "free", status: "active", verified: 1, token_version: 0,
    failed_attempts: 0, locked_until: null, deleted_at: null,
  };

  beforeEach(resetMocks);

  it("resets password with valid OTP", async () => {
    mockResolvedValue([userRow]);                                      // 0: SELECT user
    mockResolvedValue([]);                                             // 1: UPDATE password + clear OTP
    // Audit INSERT is fire-and-forget (no mock needed, caught by error handler)

    const res = await api("POST", "/api/auth/reset-password", {
      body: { email: "test@test.com", otp: "123456", password: "NewPass123!" },
    });
    assert.strictEqual(res.status, 200);
    assert.match(res.body.data.message, /Password updated/i);
  });

  it("rejects wrong OTP", async () => {
    mockResolvedValue([userRow]);                                      // 0: SELECT user
    mockResolvedValue([]);                                             // 1: UPDATE increment attempts

    const res = await api("POST", "/api/auth/reset-password", {
      body: { email: "test@test.com", otp: "000000", password: "NewPass123!" },
    });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /Invalid OTP/i);
  });

  it("increments attempt counter on wrong OTP", async () => {
    mockResolvedValue([{ ...userRow, reset_otp_attempts: 0 }]);        // 0: SELECT user
    mockResolvedValue([]);                                             // 1: UPDATE increment attempts

    await api("POST", "/api/auth/reset-password", {
      body: { email: "test@test.com", otp: "000000", password: "NewPass123!" },
    });
    const updateLog = queryLog.filter((q) => /UPDATE[\s\S]*users[\s\S]*reset_otp_attempts/i.test(q));
    assert.ok(updateLog.length > 0, "must increment reset_otp_attempts on failure");
  });

  it("invalidates OTP after max failed attempts", async () => {
    mockResolvedValue([{ ...userRow, reset_otp_attempts: 4 }]);        // 0: SELECT user
    mockResolvedValue([]);                                             // 1: UPDATE null OTP

    const res = await api("POST", "/api/auth/reset-password", {
      body: { email: "test@test.com", otp: "000000", password: "NewPass123!" },
    });
    assert.strictEqual(res.status, 400);
    // OTP should be nulled after last attempt (check query log)
    const clearOtp = queryLog.find((q) =>
      /UPDATE[\s\S]*reset_otp\s*=\s*CASE[\s\S]*THEN\s+NULL[\s\S]*reset_otp_expires\s*=\s*CASE[\s\S]*THEN\s+NULL/i.test(q)
    );
    assert.ok(clearOtp, "OTP must be nulled after max attempts");
  });

  it("rejects expired OTP", async () => {
    const expired = new Date(Date.now() - 60000).toISOString();
    mockResolvedValue([{ ...userRow, reset_otp_expires: expired }]);   // 0: SELECT user

    const res = await api("POST", "/api/auth/reset-password", {
      body: { email: "test@test.com", otp: "123456", password: "NewPass123!" },
    });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /OTP expired/i);
  });

  it("rejects unknown email (no enumeration)", async () => {
    mockResolvedValue([]); // 0: SELECT user — none

    const res = await api("POST", "/api/auth/reset-password", {
      body: { email: "unknown@test.com", otp: "123456", password: "NewPass123!" },
    });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /Invalid OTP/i);
  });
});

// ---------------------------------------------------------------------------
// Email Verification
// ---------------------------------------------------------------------------
describe("POST /api/auth/verify-email", () => {
  // verify_token is now stored hashed (sha256 hex), not plaintext.
  const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
  const VALID_VERIFY_TOKEN = "verify-token-12345";
  const userRow = {
    id: 1, name: "Test", email: "test@test.com",
    verify_token: hash(VALID_VERIFY_TOKEN),
    verify_token_expires: new Date(Date.now() + 86400000).toISOString(),
    verified: 0, role: "free", status: "active", token_version: 0,
    failed_attempts: 0, locked_until: null, deleted_at: null,
  };

  beforeEach(resetMocks);

  it("verifies email with valid token", async () => {
    mockResolvedValue([userRow]);                                      // 0: SELECT user
    mockResolvedValue([]);                                             // 1: UPDATE verified=1
    // audit fire-and-forget (no mock)

    const res = await api("POST", "/api/auth/verify-email", {
      body: { email: "test@test.com", token: VALID_VERIFY_TOKEN },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.verified, true);
  });

  it("rejects invalid token", async () => {
    mockResolvedValue([userRow]);                                      // 0: SELECT user

    const res = await api("POST", "/api/auth/verify-email", {
      body: { email: "test@test.com", token: "invalidtoken" },
    });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /Invalid verification token/i);
  });

  it("rejects expired token", async () => {
    const expired = new Date(Date.now() - 60000).toISOString();
    mockResolvedValue([{ ...userRow, verify_token_expires: expired }]);

    const res = await api("POST", "/api/auth/verify-email", {
      body: { email: "test@test.com", token: VALID_VERIFY_TOKEN },
    });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /Verification token expired/i);
  });

  it("returns already-verified when already verified", async () => {
    mockResolvedValue([{ ...userRow, verified: 1 }]);

    const res = await api("POST", "/api/auth/verify-email", {
      body: { email: "test@test.com", token: VALID_VERIFY_TOKEN },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.verified, true);
    assert.match(res.body.data.message, /Already verified/i);
  });

  it("rejects unknown account with same error as bad token", async () => {
    mockResolvedValue([]); // SELECT user — none

    const res = await api("POST", "/api/auth/verify-email", {
      body: { email: "unknown@test.com", token: "sometoken" },
    });
    assert.strictEqual(res.status, 404);
  });
});

describe("POST /api/auth/verify-email/send", () => {
  beforeEach(resetMocks);

  it("requires authentication", async () => {
    const res = await api("POST", "/api/auth/verify-email/send");
    assert.strictEqual(res.status, 401);
  });

  it("generates token and sends email for unverified user", async () => {
    mockResolvedValue([{ token_version: 0 }]);                        // 0: checkTokenVersion
    mockResolvedValue([{                                               // 1: SELECT user
      id: 1, email: "test@test.com", verified: 0,
    }]);
    mockResolvedValue([]);                                             // 2: UPDATE verify_token
    // sendMail mock — email.js returns { sent: false, dev: true } when disabled

    const res = await api("POST", "/api/auth/verify-email/send", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.match(res.body.data.message, /sent/i);
  });

  it("returns already-verified for verified user", async () => {
    mockResolvedValue([{ token_version: 0 }]);                        // 0: checkTokenVersion
    mockResolvedValue([{                                               // 1: SELECT user
      id: 1, email: "test@test.com", verified: 1,
    }]);

    const res = await api("POST", "/api/auth/verify-email/send", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.verified, true);
  });
});

describe("access_token cookie auth", () => {
  beforeEach(resetMocks);

  it("authenticates from the access_token cookie with no Authorization header", async () => {
    mockResolvedValue([{ token_version: 0 }]);                      // checkTokenVersion
    mockResolvedValue([{                                            // SELECT user
      id: 1, name: "Test", email: "t@t.com", role: "free",
      status: "active", verified: 1, phone: null, avatar: null,
      created_at: "2025-01-01T00:00:00.000Z",
    }]);

    const res = await api("GET", "/api/auth/me", {
      csrf: false,
      headers: { Cookie: `access_token=${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body?.data?.data?.email, "t@t.com");
  });

  it("login sets an httpOnly access_token cookie", async () => {
    const hash = "$2a$12$WY2Yo.FGEW6NVvLhOJlSHuv4KoSKz0xqEPUiWx152PLiZbTvjs4C2";
    mockResolvedValue([{
      id: 1, name: "Test", email: "test@example.com", password_hash: hash,
      role: "free", status: "active", verified: 1, token_version: 0,
      failed_attempts: 0, locked_until: null, deleted_at: null,
    }]);                                                            // 0: SELECT user
    mockResolvedValue([{ failed_attempts: 0, locked_until: null }]);// 1: checkLockout
    mockResolvedValue([]);                                          // 2: resetFailedAttempts
    mockResolvedValue([]);                                          // 3: UPDATE refresh_jti

    const res = await api("POST", "/api/auth/login", {
      body: { email: "test@example.com", password: "password123" },
    });
    assert.strictEqual(res.status, 200);
    const cookies = res.headers.getSetCookie();
    const access = cookies.find((c) => c.startsWith("access_token="));
    assert.ok(access, "expected an access_token cookie");
    assert.match(access, /HttpOnly/i);
    assert.ok(cookies.some((c) => c.startsWith("refresh_token=")), "expected a refresh_token cookie");
  });
});

describe("Admin-only routes reject regular users", () => {
  beforeEach(resetMocks);

  it("POST /api/bookings/:id/complete returns 403 for user token", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // 0: checkTokenVersion
    mockResolvedValue([{                                           // 1: SELECT booking
      id: 1, expert_id: 10, user_id: 1, status: "upcoming",
      slot_id: null, date: "2020-01-01", time: "00:00",
    }]);

    const res = await api("POST", "/api/bookings/1/complete", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  it("admin can complete a booking", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // 0: checkTokenVersion
    mockResolvedValue([{                                           // 1: SELECT booking
      id: 1, expert_id: 10, user_id: 1, status: "upcoming",
      slot_id: null, date: "2020-01-01", time: "00:00",
    }]);                                                           // 2: UPDATE status (uses pool.connect -> client.query)
    mockResolvedValue(undefined);                                  // BEGIN
    mockResolvedValue(undefined);                                  // UPDATE bookings
    mockResolvedValue(undefined);                                  // COMMIT

    const res = await api("POST", "/api/bookings/1/complete", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, "completed");
  });

  it("GET /api/users/stats returns 403 for regular user", async () => {
    mockResolvedValue([{ token_version: 0 }]);

    const res = await api("GET", "/api/users/stats", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // S2: refunds move real money through the gateway. The payment's own owner
  // must not be able to trigger one — 403 before any payment row is read.
  it("POST /api/payments/:id/refund returns 403 for the payment's owner", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // adminRequired

    const res = await api("POST", "/api/payments/1/refund", {
      headers: { Authorization: `Bearer ${userToken}` },           // user 1 owns payment 1
      body: { reason: "changed my mind" },
    });
    assert.strictEqual(res.status, 403);
    assert.ok(
      !queryLog.some((q) => /FROM payments/i.test(q)),
      "must reject before touching the payment record"
    );
  });
});

describe("GET /api/experts?all=1 — admin token must still be valid (not revoked)", () => {
  beforeEach(resetMocks);

  it("returns 401 when the admin token has been revoked (token_version mismatch)", async () => {
    mockResolvedValue([{ token_version: 99 }]);                    // checkTokenVersion -> mismatch

    const res = await api("GET", "/api/experts?all=1", {
      csrf: false,
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 401);
    assert.ok(
      !queryLog.some((q) => /FROM experts/i.test(q)),
      "must not list experts for a revoked admin token"
    );
  });

  it("returns all experts (incl. inactive) for a valid admin token", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // checkTokenVersion -> ok
    mockResolvedValue([{ total: 2 }]);                             // COUNT(*)
    mockResolvedValue([{ id: 1, name: "A" }, { id: 2, name: "B" }]);// SELECT experts

    const res = await api("GET", "/api/experts?all=1", {
      csrf: false,
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 2);
  });

  it("still serves public, non-all listing without any token", async () => {
    mockResolvedValue([{ total: 1 }]);                             // COUNT(*) active only
    mockResolvedValue([{ rows: [1] }]);

    const res = await api("GET", "/api/experts", { csrf: false });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 1);
  });
});
