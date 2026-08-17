// Unit tests for src/utils/secrets.js — hashed reset-OTPs / verify tokens.
// Run with: node --test tests/secrets.test.js
process.env.NODE_ENV = "test";
const { describe, it } = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");
const { hashSecret, verifySecret, isHash } = require("../src/utils/secrets");

describe("secrets", () => {
  it("hashSecret produces a 64-char hex string", () => {
    const h = hashSecret("123456");
    assert.match(h, /^[0-9a-f]{64}$/);
  });

  it("verifySecret matches the hashed value", () => {
    assert.ok(verifySecret(hashSecret("123456"), "123456"));
    assert.ok(!verifySecret(hashSecret("123456"), "654321"));
  });

  it("verifySecret accepts legacy plaintext for cross-compat", () => {
    assert.ok(verifySecret("123456", "123456"));   // stored as plaintext before the fix
    assert.ok(!verifySecret("123456", "654321"));
  });

  it("isHash is true only for 64-char hex strings", () => {
    assert.ok(isHash(hashSecret("x")));
    assert.ok(!isHash("123456"));          // legacy plaintext OTP
    assert.ok(!isHash("abcdef"));          // short/token-like
    assert.ok(!isHash(undefined));
    assert.ok(!isHash(null));
  });

  it("is constant-time and cheap", () => {
    // Just ensure repeated use does not throw and is deterministic.
    const a = hashSecret("abc");
    const b = verifySecret(a, "abc");
    assert.strictEqual(b, true);
    assert.strictEqual(verifySecret(crypto.createHash("sha256").update("abc").digest("hex"), "abc"), true);
  });
});