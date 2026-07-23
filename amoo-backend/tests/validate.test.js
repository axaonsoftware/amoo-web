const { describe, it } = require("node:test");
const assert = require("node:assert");
const { schemas } = require("../src/middleware/validate");

function check(schema, data) {
  const { error } = schema.validate(data, { abortEarly: false });
  return error ? error.details.map((d) => d.message) : null;
}

describe("register schema", () => {
  const valid = { name: "Alice", email: "a@b.com", password: "12345678" };

  it("accepts valid input", () => {
    assert.strictEqual(check(schemas.register, valid), null);
  });

  it("rejects short password", () => {
    const errs = check(schemas.register, { ...valid, password: "123" });
    assert.ok(errs.some((m) => /password/i.test(m)));
  });

  it("rejects missing name", () => {
    const errs = check(schemas.register, { email: "a@b.com", password: "12345678" });
    assert.ok(errs.some((m) => /name/i.test(m)));
  });

  it("rejects invalid email", () => {
    const errs = check(schemas.register, { ...valid, email: "notanemail" });
    assert.ok(errs.some((m) => /email/i.test(m)));
  });
});

describe("booking schema", () => {
  const valid = { service_id: 1, date: "2025-06-15", time: "10:00", amount: 0 };

  it("accepts valid input", () => {
    assert.strictEqual(check(schemas.booking, valid), null);
  });

  it("rejects negative service_id", () => {
    const errs = check(schemas.booking, { ...valid, service_id: -5 });
    assert.ok(errs.length > 0);
  });

  // S1: a client must never be able to declare its own booking already paid.
  it("strips a client-supplied payment field", () => {
    const { error, value } = schemas.booking.validate(
      { ...valid, payment: "Paid" },
      { abortEarly: false, stripUnknown: true } // same options the middleware uses
    );
    assert.strictEqual(error, undefined);
    assert.ok(!("payment" in value), "payment must not survive validation");
  });

  it("rejects missing required fields", () => {
    const errs = check(schemas.booking, { amount: 0 });
    assert.notStrictEqual(errs, null);
  });
});

describe("walletTxn schema", () => {
  it("accepts valid input", () => {
    assert.strictEqual(check(schemas.walletTxn, { amount: 100, reason: "test" }), null);
  });

  it("rejects zero amount", () => {
    const errs = check(schemas.walletTxn, { amount: 0 });
    assert.ok(errs.length > 0);
  });
});

describe("walletAdjust schema", () => {
  it("accepts positive and negative amounts", () => {
    assert.strictEqual(check(schemas.walletAdjust, { user_id: 1, amount: 100 }), null);
    assert.strictEqual(check(schemas.walletAdjust, { user_id: 1, amount: -50 }), null);
  });

  it("rejects missing user_id", () => {
    const errs = check(schemas.walletAdjust, { amount: 100 });
    assert.ok(errs.length > 0);
  });
});

describe("query schema (validateQuery)", () => {
  it("accepts valid pagination params", () => {
    assert.strictEqual(check(schemas.query, { page: 1, limit: 50 }), null);
  });

  it("rejects limit over 100", () => {
    const errs = check(schemas.query, { limit: 999 });
    assert.ok(errs.length > 0);
  });

  it("strips unknown params", () => {
    const { value } = schemas.query.validate(
      { page: 2, limit: 10, injected: "hack" },
      { stripUnknown: true }
    );
    assert.deepStrictEqual(value, { page: 2, limit: 10 });
    assert.strictEqual(value.injected, undefined);
  });
});
