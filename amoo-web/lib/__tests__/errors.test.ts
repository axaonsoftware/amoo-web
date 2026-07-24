/**
 * Tests for lib/errors.ts — the helpers that replaced ~40 `catch (e: any)` sites
 * reading `e.message`. The point of these is that they behave sanely when the
 * thrown value is NOT an Error, which the old `e.message` access did not.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  errorMessage,
  errorStatus,
  validationDetails,
  isUserCancellation,
  isApiError,
} from "../errors.ts";

describe("errorMessage", () => {
  test("reads an Error's message", () => {
    assert.equal(errorMessage(new Error("boom")), "boom");
  });

  test("uses a thrown string", () => {
    assert.equal(errorMessage("plain string error"), "plain string error");
  });

  test("reads a message off a plain object (e.g. a rejected fetch shape)", () => {
    assert.equal(errorMessage({ message: "object error" }), "object error");
  });

  test("returns the fallback — never '' or 'undefined' — for valueless throws", () => {
    // The old `e.message` produced `undefined` here, which rendered a blank
    // error box in the UI.
    assert.equal(errorMessage(new Error("")), "Something went wrong");
    assert.equal(errorMessage(null), "Something went wrong");
    assert.equal(errorMessage(undefined), "Something went wrong");
    assert.equal(errorMessage({}), "Something went wrong");
    assert.equal(errorMessage(42), "Something went wrong");
  });

  test("honours a custom fallback", () => {
    assert.equal(errorMessage(null, "Save failed"), "Save failed");
  });
});

describe("errorStatus", () => {
  test("reads the status the API client attaches", () => {
    const e = Object.assign(new Error("nope"), { status: 403 });
    assert.equal(errorStatus(e), 403);
  });

  test("is undefined when there is no status", () => {
    assert.equal(errorStatus(new Error("x")), undefined);
    assert.equal(errorStatus("string"), undefined);
    assert.equal(errorStatus(null), undefined);
  });
});

describe("validationDetails", () => {
  test("extracts the Joi details array", () => {
    const e = Object.assign(new Error("Validation failed"), {
      details: ['"email" is required', '"password" too short'],
    });
    assert.deepEqual(validationDetails(e), ['"email" is required', '"password" too short']);
  });

  test("filters non-strings and returns [] when absent", () => {
    assert.deepEqual(validationDetails(new Error("x")), []);
    const e = Object.assign(new Error("x"), { details: [1, "ok", null] });
    assert.deepEqual(validationDetails(e), ["ok"]);
  });
});

describe("isUserCancellation / isApiError", () => {
  test("recognises the Razorpay dismiss message", () => {
    assert.equal(isUserCancellation(new Error("Payment cancelled by user")), true);
    assert.equal(isUserCancellation(new Error("Network error")), false);
  });

  test("isApiError narrows to Error instances", () => {
    assert.equal(isApiError(new Error("x")), true);
    assert.equal(isApiError("x"), false);
    assert.equal(isApiError(null), false);
  });
});
