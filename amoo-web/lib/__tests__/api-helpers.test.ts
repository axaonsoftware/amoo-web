/**
 * Tests for the response-envelope helpers in lib/api.ts.
 *
 * `unwrapList`/`unwrapMeta` exist because the backend has two response shapes —
 * `ok()` returns a bare value, `paginated()` returns `{ data, meta }` — and
 * several components called `.filter()` straight on the envelope and crashed.
 * These lock in the both-shapes contract. `qs` builds query strings and is the
 * fix for a bug where an omitted leading "?" produced "/api/userspage=1".
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { unwrapList, unwrapMeta, qs } from "../api";

describe("unwrapList", () => {
  test("returns a bare array unchanged (ok() with an array)", () => {
    assert.deepEqual(unwrapList([1, 2, 3]), [1, 2, 3]);
  });

  test("unwraps the paginated envelope", () => {
    assert.deepEqual(unwrapList({ data: ["a", "b"], meta: { total: 2 } }), ["a", "b"]);
  });

  test("returns [] rather than throwing for non-list shapes", () => {
    // The crash this prevents: a component doing `.filter()` on one of these.
    assert.deepEqual(unwrapList(null), []);
    assert.deepEqual(unwrapList(undefined), []);
    assert.deepEqual(unwrapList({ data: "not an array" }), []);
    assert.deepEqual(unwrapList({ nope: true }), []);
    assert.deepEqual(unwrapList(42), []);
  });
});

describe("unwrapMeta", () => {
  test("returns the meta when present and well-formed", () => {
    const meta = { page: 1, pageSize: 20, total: 57, totalPages: 3 };
    assert.deepEqual(unwrapMeta({ data: [], meta }), meta);
  });

  test("returns null for an unpaginated (bare array) response", () => {
    assert.equal(unwrapMeta([1, 2, 3]), null);
    assert.equal(unwrapMeta({ data: [] }), null);
    assert.equal(unwrapMeta(null), null);
  });

  test("rejects a meta object without a numeric total", () => {
    assert.equal(unwrapMeta({ meta: { page: 1 } }), null);
  });
});

describe("qs", () => {
  test("emits a leading '?' — the fix for '/api/userspage=1'", () => {
    assert.equal(qs({ page: 1 }), "?page=1");
  });

  test("drops empty / null / undefined values", () => {
    assert.equal(qs({ page: 1, search: "", status: null, role: undefined }), "?page=1");
  });

  test("returns '' when everything is empty, so the path is left untouched", () => {
    assert.equal(qs({ search: "", status: null }), "");
    assert.equal(qs({}), "");
  });

  test("serialises multiple params and encodes them", () => {
    const out = qs({ search: "a b", page: 2 });
    assert.ok(out.startsWith("?"));
    assert.ok(out.includes("search=a+b") || out.includes("search=a%20b"));
    assert.ok(out.includes("page=2"));
  });

  test("keeps the number 0 (falsy but meaningful)", () => {
    assert.equal(qs({ offset: 0 }), "?offset=0");
  });
});
