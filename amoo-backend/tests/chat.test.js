// Chat integration tests — uses monkey-patched DB pool
// Run with: node --test tests/chat.test.js
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_1234567890abcdefgh";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_1234567890_abcdefgh";
process.env.LOG_LEVEL = "silent";
process.env.RATE_LIMIT_WINDOW_MS = "60000";
process.env.RATE_LIMIT_MAX = "10000";
process.env.MAX_FILE_SIZE = "1024";
const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert");

const { createMockPool, createMockConnection } = require("./setup");

const mockHandlers = [];
const queryLog = [];

function mockResolvedValue(rows) {
  mockHandlers.push(() => Promise.resolve({ rows, rowCount: rows?.length || 0 }));
}

function mockReject(err) {
  mockHandlers.push(() => Promise.reject(err));
}

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

const db = require("../src/config/db");
db.pool = mockPool;
db.testConnection = () => Promise.resolve(true);

const app = require("../src/server");
const { signAccessToken, clearTokenVersionCache } = require("../src/middleware/auth");

const userToken = signAccessToken({ id: 1, kind: "user", tokenVersion: 0 });
const expertToken = signAccessToken({ id: 10, kind: "expert", tokenVersion: 0 });
const adminToken = signAccessToken({ id: 1, kind: "admin", tokenVersion: 0 });
const user2Token = signAccessToken({ id: 2, kind: "user", tokenVersion: 0 });

function resetMocks() {
  mockHandlers.length = 0;
  queryLog.length = 0;
  clearTokenVersionCache();
}

let server, baseUrl;
before(() => new Promise((ok) => {
  server = app.listen(0, () => {
    baseUrl = `http://localhost:${server.address().port}`;
    ok();
  });
}));
after(() => new Promise((ok) => server.close(ok)));

const CSRF_TOKEN = "a".repeat(64);

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

// Helper: push checkTokenVersion mock (must be the first query for every
// authenticated request, because authRequired fires before route logic).
function mockTokenVersion(table) {
  mockResolvedValue([{ token_version: 0 }]);
}

// ---------------------------------------------------------------------------
// POST /api/chat/conversations (open conversation)
// ---------------------------------------------------------------------------
describe("POST /api/chat/conversations", () => {
  beforeEach(resetMocks);

  it("opens a conversation with an active expert", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockResolvedValue([{ id: 10 }]);                                  // 1: expert exists
    mockResolvedValue([]);                                             // 2: INSERT ON CONFLICT
    mockResolvedValue([{                                               // 3: SELECT conversation
      id: 1, user_id: 1, expert_id: 10, last_message_at: null,
    }]);

    const res = await api("POST", "/api/chat/conversations", {
      body: { participant_id: 10 },
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.id, 1);
  });

  it("rejects non-user callers", async () => {
    mockTokenVersion("experts");                                      // 0: checkTokenVersion

    const res = await api("POST", "/api/chat/conversations", {
      body: { participant_id: 10 },
      headers: { Authorization: `Bearer ${expertToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  it("rejects inactive expert", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockResolvedValue([]);                                             // 1: expert not found (inactive)

    const res = await api("POST", "/api/chat/conversations", {
      body: { participant_id: 999 },
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  it("requires authentication", async () => {
    const res = await api("POST", "/api/chat/conversations", {
      body: { participant_id: 10 },
      csrf: false,
    });
    assert.strictEqual(res.status, 403);
  });
});

// ---------------------------------------------------------------------------
// GET /api/chat/conversations (list)
// ---------------------------------------------------------------------------
describe("GET /api/chat/conversations", () => {
  beforeEach(resetMocks);

  it("returns conversations for a user", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockResolvedValue([{ total: 1 }]);                                // 1: COUNT
    mockResolvedValue([{                                               // 2: SELECT conversations
      id: 1, user_id: 1, expert_id: 10, last_message_at: null,
      user_name: "Alice", user_avatar: null,
      expert_name: "Ravi", expert_avatar: null,
      unread_count: 2,
    }]);

    const res = await api("GET", "/api/chat/conversations", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.strictEqual(res.body.data.length, 1);
    assert.strictEqual(res.body.data[0].unread_count, 2);
  });

  it("returns conversations for an expert", async () => {
    mockTokenVersion("experts");                                      // 0: checkTokenVersion
    mockResolvedValue([{ total: 1 }]);                                // 1: COUNT
    mockResolvedValue([{                                               // 2: SELECT conversations
      id: 1, user_id: 1, expert_id: 10, last_message_at: null,
      user_name: "Alice", user_avatar: null,
      expert_name: "Ravi", expert_avatar: null,
      unread_count: 0,
    }]);

    const res = await api("GET", "/api/chat/conversations", {
      headers: { Authorization: `Bearer ${expertToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it("returns all conversations for admin", async () => {
    mockTokenVersion("admins");                                       // 0: checkTokenVersion
    mockResolvedValue([{ total: 2 }]);                                // 1: COUNT
    mockResolvedValue([                                                // 2: SELECT conversations
      {
        id: 1, user_id: 1, expert_id: 10, last_message_at: null,
        user_name: "Alice", user_avatar: null,
        expert_name: "Ravi", expert_avatar: null,
        unread_count: 0,
      },
      {
        id: 2, user_id: 2, expert_id: 10, last_message_at: null,
        user_name: "Bob", user_avatar: null,
        expert_name: "Ravi", expert_avatar: null,
        unread_count: 1,
      },
    ]);

    const res = await api("GET", "/api/chat/conversations", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 2);
  });
});

// ---------------------------------------------------------------------------
// GET /api/chat/conversations/:id/messages
// ---------------------------------------------------------------------------
describe("GET /api/chat/conversations/:id/messages", () => {
  beforeEach(resetMocks);

  it("returns messages for a participant", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockResolvedValue([{                                               // 1: loadParticipantConversation
      id: 1, user_id: 1, expert_id: 10,
    }]);
    mockResolvedValue([{ total: 2 }]);                                // 2: COUNT
    mockResolvedValue([                                                // 3: SELECT messages
      { id: 101, conversation_id: 1, sender_type: "user", sender_id: 1, content: "Hi", is_read: true, created_at: "2025-01-01T10:00:00Z" },
      { id: 102, conversation_id: 1, sender_type: "expert", sender_id: 10, content: "Hello!", is_read: false, created_at: "2025-01-01T10:01:00Z" },
    ]);

    const res = await api("GET", "/api/chat/conversations/1/messages", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.strictEqual(res.body.data.length, 2);
  });

  it("rejects non-participant", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockResolvedValue([{                                               // 1: loadParticipantConversation
      id: 1, user_id: 1, expert_id: 10,
    }]);

    const res = await api("GET", "/api/chat/conversations/1/messages", {
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    assert.strictEqual(res.status, 403);
  });

  it("returns 404 for non-existent conversation", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockResolvedValue([]);                                             // 1: not found

    const res = await api("GET", "/api/chat/conversations/999/messages", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/chat/conversations/:id/messages (HTTP fallback)
// ---------------------------------------------------------------------------
describe("POST /api/chat/conversations/:id/messages", () => {
  beforeEach(resetMocks);

  it("sends a message via HTTP fallback", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockConn.query = makeQuery();
    // BEGIN
    mockResolvedValue(undefined);                                     // 1
    // loadParticipantConversation
    mockResolvedValue([{ id: 1, user_id: 1, expert_id: 10 }]);      // 2
    // INSERT message
    mockResolvedValue([{ id: 201 }]);                                 // 3
    // UPDATE last_message_at
    mockResolvedValue(undefined);                                     // 4
    // COMMIT
    mockResolvedValue(undefined);                                     // 5

    const res = await api("POST", "/api/chat/conversations/1/messages", {
      body: { content: "Hello from HTTP!" },
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.content, "Hello from HTTP!");
  });

  it("rejects messages over 5000 characters", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion

    const res = await api("POST", "/api/chat/conversations/1/messages", {
      body: { content: "x".repeat(5001) },
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 400);
  });

  it("rejects empty content", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion

    const res = await api("POST", "/api/chat/conversations/1/messages", {
      body: { content: "" },
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 400);
  });

  it("rejects non-participant", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockConn.query = makeQuery();
    mockResolvedValue(undefined);                                     // 1: BEGIN
    mockResolvedValue([]);                                            // 2: not found or not participant
    mockResolvedValue(undefined);                                     // 3: ROLLBACK

    const res = await api("POST", "/api/chat/conversations/1/messages", {
      body: { content: "test" },
      headers: { Authorization: `Bearer ${user2Token}` },
    });
    assert.strictEqual(res.status, 404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/chat/conversations/:id/read
// ---------------------------------------------------------------------------
describe("POST /api/chat/conversations/:id/read", () => {
  beforeEach(resetMocks);

  it("marks messages as read", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockResolvedValue([{ id: 1, user_id: 1, expert_id: 10 }]);      // 1: load conversation
    mockHandlers.push(() => Promise.resolve({ rows: [], rowCount: 3 })); // 2: UPDATE read

    const res = await api("POST", "/api/chat/conversations/1/read", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.marked, 3);
  });
});

// ---------------------------------------------------------------------------
// GET /api/chat/unread-count
// ---------------------------------------------------------------------------
describe("GET /api/chat/unread-count", () => {
  beforeEach(resetMocks);

  it("returns unread count for user", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockResolvedValue([{ count: 5 }]);                               // 1: COUNT

    const res = await api("GET", "/api/chat/unread-count", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.count, 5);
  });

  it("returns unread count for expert", async () => {
    mockTokenVersion("experts");                                      // 0: checkTokenVersion
    mockResolvedValue([{ count: 2 }]);                               // 1: COUNT

    const res = await api("GET", "/api/chat/unread-count", {
      headers: { Authorization: `Bearer ${expertToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.count, 2);
  });

  it("returns 0 when no unread messages", async () => {
    mockTokenVersion("users");                                        // 0: checkTokenVersion
    mockResolvedValue([{ count: 0 }]);                               // 1: COUNT

    const res = await api("GET", "/api/chat/unread-count", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.count, 0);
  });
});

// ---------------------------------------------------------------------------
// Security: authentication required
// ---------------------------------------------------------------------------
describe("Chat authentication", () => {
  beforeEach(resetMocks);

  it("rejects unauthenticated conversation list (GET)", async () => {
    const res = await api("GET", "/api/chat/conversations", { csrf: false });
    assert.strictEqual(res.status, 401);
  });

  it("rejects unauthenticated message send (POST without CSRF)", async () => {
    const res = await api("POST", "/api/chat/conversations/1/messages", {
      body: { content: "test" },
      csrf: false,
    });
    assert.strictEqual(res.status, 403);
  });

  it("rejects unauthenticated unread count (GET)", async () => {
    const res = await api("GET", "/api/chat/unread-count", { csrf: false });
    assert.strictEqual(res.status, 401);
  });
});
