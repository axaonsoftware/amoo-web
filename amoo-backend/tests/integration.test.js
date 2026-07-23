// Integration tests — uses monkey-patched DB pool (no experimental flags needed)
// Run with: node --test tests/integration.test.js
process.env.NODE_ENV = "test";
const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert");

// ---------------------------------------------------------------------------
// Monkey‑patch the real pool BEFORE routes load
// ---------------------------------------------------------------------------
const { createMockPool, createMockConnection } = require("./setup");

const mockHandlers = [];

function mockResolvedValue(rows) {
  mockHandlers.push(() => Promise.resolve([rows]));
}

function mockReject(err) {
  mockHandlers.push(() => Promise.reject(err));
}

/** Consume one handler per query call */
function makeQuery() {
  return (...args) => {
    const h = mockHandlers.shift();
    if (!h) throw new Error(`No mock for query: ${String(args[0]).slice(0, 120)}...`);
    return h();
  };
}

const mockConn = createMockConnection();
mockConn.query = makeQuery();

const mockPool = createMockPool();
mockPool.query = makeQuery();
mockPool.getConnection = () => Promise.resolve(mockConn);

// Patch the real db module
const db = require("../src/config/db");
db.pool = mockPool;
db.testConnection = () => Promise.resolve(true);

// ---------------------------------------------------------------------------
// Load the app
// ---------------------------------------------------------------------------
const app = require("../src/server");
const { signAccessToken } = require("../src/middleware/auth");

const userToken = signAccessToken({ id: 1, kind: "user", tokenVersion: 0 });
const user2Token = signAccessToken({ id: 2, kind: "user", tokenVersion: 0 });
const adminToken = signAccessToken({ id: 1, kind: "admin", tokenVersion: 0 });

function resetMocks() {
  mockHandlers.length = 0;
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

async function api(method, path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...opts.headers };
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
    mockResolvedValue({ insertId: 2 });                             // 1: INSERT user
    mockResolvedValue([{                                            // 2: SELECT created
      id: 2, name: "Alice", email: "alice@test.com",
      password_hash: "$2a$12$x", role: "free", status: "active",
      verified: 0, token_version: 0, failed_attempts: 0, locked_until: null,
      deleted_at: null, phone: null, avatar: null,
      created_at: "2025-01-01T00:00:00.000Z", updated_at: "2025-01-01T00:00:00.000Z",
    }]);
    mockResolvedValue([{ token_version: 0 }]);                      // 3: checkTokenVersion

    const res = await api("POST", "/api/auth/register", {
      body: { name: "Alice", email: "alice@test.com", password: "password123" },
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, "alice@test.com");
  });

  it("rejects duplicate email", async () => {
    mockResolvedValue([{ id: 1 }]);                                 // SELECT existing → found

    const res = await api("POST", "/api/auth/register", {
      body: { name: "Alice", email: "dup@test.com", password: "password123" },
    });
    assert.strictEqual(res.status, 409);
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
    mockResolvedValue({});                                          // 2: resetFailedAttempts
    mockResolvedValue([{ token_version: 0 }]);                      // 3: checkTokenVersion

    const res = await api("POST", "/api/auth/login", {
      body: { email: "test@example.com", password: "password123" },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
  });

  it("rejects wrong password", async () => {
    mockResolvedValue([userRow]);                                   // SELECT user
    mockResolvedValue([{ failed_attempts: 0, locked_until: null }]);// checkLockout
    mockResolvedValue({});                                          // recordFailedAttempt

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

  it("creates a paid booking with slot reservation", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // 0: checkTokenVersion
    mockResolvedValue([{ id: 1, price: 100 }]);                    // 1: SELECT service price
    mockResolvedValue([{ id: 1, expert_id: 1, status: "available" }]);// 2: SELECT slot FOR UPDATE
    mockResolvedValue({});                                          // 3: UPDATE slot → booked
    mockResolvedValue({ insertId: 1 });                             // 4: INSERT booking
    mockResolvedValue({});                                          // 5: INSERT payment
    mockResolvedValue({});                                          // 6: UPDATE bookings count
    mockResolvedValue([{                                            // 7: SELECT created booking
      id: 1, booking_ref: "BOOK-T", user_id: 1, service_id: 1,
      date: "2025-06-15", time: "10:00", amount: 100,
      payment: "Paid", status: "upcoming",
    }]);

    const res = await api("POST", "/api/bookings", {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { service_id: 1, slot_id: 1, date: "2025-06-15", time: "10:00",
              amount: 100, payment: "Paid", method: "card" },
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.success);
  });

  it("rejects amount mismatch with service price", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // 0: checkTokenVersion
    mockResolvedValue([{ id: 1, price: 100 }]);                    // 1: SELECT service (price=100)
    mockResolvedValue({});                                          // 2: rollback

    const res = await api("POST", "/api/bookings", {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { service_id: 1, date: "2025-06-15", time: "10:00",
              amount: 999, payment: "Paid" },
    });
    assert.strictEqual(res.status, 400);
  });

  it("rejects unauthenticated requests", async () => {
    const res = await api("POST", "/api/bookings", {
      body: { service_id: 1, date: "2025-06-15", time: "10:00", amount: 0 },
    });
    assert.strictEqual(res.status, 401);
  });
});

describe("GET /api/bookings/:id — cross-user security", () => {
  beforeEach(resetMocks);

  it("user can see own booking", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // checkTokenVersion
    mockResolvedValue([{                                            // SELECT booking
      id: 1, user_id: 1, service_id: 1, date: "2025-06-15",
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
      id: 1, user_id: 1, service_id: 1, date: "2025-06-15",
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
      id: 1, user_id: 1, service_id: 1, date: "2025-06-15",
      time: "10:00", amount: 100, payment: "Paid", status: "upcoming",
      user_name: "Test", expert_name: null, service_name: "Svc",
    }]);

    const res = await api("GET", "/api/bookings/1", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
  });
});

describe("Admin-only routes reject regular users", () => {
  beforeEach(resetMocks);

  it("POST /api/bookings/:id/complete returns 403 for user token", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // adminRequired

    const res = await api("POST", "/api/bookings/1/complete", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  it("admin can complete a booking", async () => {
    mockResolvedValue([{ token_version: 0 }]);                     // adminRequired
    mockResolvedValue([{ id: 1 }]);                                // booking exists
    mockResolvedValue({});                                          // UPDATE status

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
});
