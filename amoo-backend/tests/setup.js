// Test environment setup — runs before every test suite.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_1234567890_abcdefgh";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_1234567890_abcdefgh";
process.env.LOG_LEVEL = "silent";
process.env.RATE_LIMIT_WINDOW_MS = "60000";
process.env.RATE_LIMIT_MAX = "10000";
process.env.MAX_FILE_SIZE = "1024";

// Helper to create a mock pg pool.
function createMockPool() {
  const query = (...args) => {
    throw new Error(
      "No mock query handler registered. Use mockPool.query.mockImplementation or mockResolvedValue."
    );
  };
  const connect = () =>
    Promise.resolve(createMockConnection());
  return { query, connect };
}

function createMockConnection() {
  return {
    query: () => Promise.resolve({ rows: [[]], rowCount: 1 }),
    release: () => {},
  };
}

module.exports = { createMockPool, createMockConnection };
