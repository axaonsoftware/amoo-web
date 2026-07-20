const { describe, it } = require("node:test");
const assert = require("node:assert");
const { HttpError, genBookingRef, genOtp, buildUpdate } = require("../src/utils/helpers");
const { parsePagination } = require("../src/utils/response");

describe("HttpError", () => {
  it("creates an error with status, message, and details", () => {
    const e = new HttpError(404, "Not found", { id: 1 });
    assert(e instanceof Error);
    assert.strictEqual(e.status, 404);
    assert.strictEqual(e.message, "Not found");
    assert.deepStrictEqual(e.details, { id: 1 });
  });

  it("defaults details to undefined", () => {
    const e = new HttpError(400, "Bad request");
    assert.strictEqual(e.details, undefined);
  });
});

describe("genBookingRef", () => {
  it("returns a string matching the BOOK-XXXX-XXXX pattern", () => {
    assert.match(genBookingRef(), /^BOOK-[0-9A-Z]+-[0-9A-Z]+$/);
  });

  it("generates unique values on successive calls", () => {
    assert.notStrictEqual(genBookingRef(), genBookingRef());
  });
});

describe("genOtp", () => {
  it("returns a numeric string of the specified length", () => {
    assert.match(genOtp(6), /^\d{6}$/);
    assert.match(genOtp(4), /^\d{4}$/);
  });

  it("defaults to 6 digits", () => {
    assert.match(genOtp(), /^\d{6}$/);
  });
});

describe("buildUpdate", () => {
  const allowed = ["name", "email", "status"];

  it("builds SET clause from allowed fields only", () => {
    const { setClause, values, keys } = buildUpdate(
      { name: "Alice", email: "a@b.com", status: "active", injected: "evil" },
      allowed,
      [42]
    );
    assert.strictEqual(setClause, "`name` = ?, `email` = ?, `status` = ?");
    assert.deepStrictEqual(values, ["Alice", "a@b.com", "active", 42]);
    assert.deepStrictEqual(keys, ["name", "email", "status"]);
  });

  it("throws HttpError if no allowed fields present", () => {
    assert.throws(
      () => buildUpdate({ injected: "evil" }, allowed, [1]),
      (e) => e.status === 400
    );
  });
});

describe("parsePagination", () => {
  it("returns defaults when no query provided", () => {
    assert.deepStrictEqual(parsePagination({}), { page: 1, pageSize: 20, offset: 0 });
  });

  it("respects page and limit params", () => {
    assert.deepStrictEqual(parsePagination({ page: "3", limit: "10" }), {
      page: 3, pageSize: 10, offset: 20,
    });
  });

  it("caps pageSize at 100", () => {
    assert.deepStrictEqual(parsePagination({ page: "1", limit: "999" }), {
      page: 1, pageSize: 100, offset: 0,
    });
  });

  it("handles negative/NaN gracefully", () => {
    assert.deepStrictEqual(parsePagination({ page: "-2", limit: "abc" }), {
      page: 1, pageSize: 20, offset: 0,
    });
  });
});
