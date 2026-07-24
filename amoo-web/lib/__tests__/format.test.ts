/**
 * Tests for lib/format.ts — the display-formatting helpers used across every
 * table, stat tile and receipt. These are pure and were previously untested.
 *
 * Run: npm test   (uses Node's built-in runner with native TS type-stripping)
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  toNumber,
  formatCurrency,
  formatCurrencyExact,
  formatNumber,
  formatCompact,
  formatDate,
  formatTime,
  titleCase,
  initials,
} from "../format.ts";

describe("toNumber", () => {
  test("passes finite numbers through", () => {
    assert.equal(toNumber(42), 42);
    assert.equal(toNumber(0), 0);
    assert.equal(toNumber(-3.5), -3.5);
  });

  test("parses the strings mysql2 returns for DECIMAL columns", () => {
    // This is the whole reason the helper exists: DECIMAL comes back as a string.
    assert.equal(toNumber("999.00"), 999);
    assert.equal(toNumber("1250.50"), 1250.5);
  });

  test("falls back for null / undefined / empty / non-numeric", () => {
    assert.equal(toNumber(null), 0);
    assert.equal(toNumber(undefined), 0);
    assert.equal(toNumber(""), 0);
    assert.equal(toNumber("abc"), 0);
    assert.equal(toNumber(NaN), 0);
    assert.equal(toNumber(Infinity), 0);
  });

  test("honours a custom fallback", () => {
    assert.equal(toNumber(null, -1), -1);
    assert.equal(toNumber("x", 100), 100);
  });
});

describe("formatCurrency", () => {
  test("renders whole rupees with the ₹ symbol", () => {
    assert.equal(formatCurrency(12500), "₹12,500");
  });

  test("accepts a DECIMAL string without NaN", () => {
    assert.equal(formatCurrency("999.00"), "₹999");
  });

  test("never shows NaN for bad input", () => {
    assert.equal(formatCurrency(null), "₹0");
    assert.equal(formatCurrency(undefined), "₹0");
    assert.ok(!formatCurrency("garbage").includes("NaN"));
  });

  test("exact variant keeps paise", () => {
    assert.equal(formatCurrencyExact(1250.5), "₹1,250.50");
  });
});

describe("formatNumber / formatCompact", () => {
  test("groups with Indian digit grouping", () => {
    assert.equal(formatNumber(125000), "1,25,000");
  });

  test("compacts to k / L / Cr", () => {
    assert.equal(formatCompact(1500), "1.5k");
    assert.equal(formatCompact(150000), "1.5L");
    assert.equal(formatCompact(15000000), "1.5Cr");
    assert.equal(formatCompact(500), "500");
  });
});

describe("formatDate / formatTime", () => {
  test("formats an ISO date", () => {
    assert.equal(formatDate("2026-07-23"), "23 Jul 2026");
  });

  test("returns the fallback for junk rather than 'Invalid Date'", () => {
    assert.equal(formatDate(null), "—");
    assert.equal(formatDate("not-a-date"), "—");
    assert.equal(formatDate("", "n/a"), "n/a");
  });

  test("formats a bare HH:MM:SS time column", () => {
    assert.equal(formatTime("14:30:00"), "2:30 PM");
    assert.equal(formatTime("09:05"), "9:05 AM");
    assert.equal(formatTime("00:00:00"), "12:00 AM");
    assert.equal(formatTime("12:00:00"), "12:00 PM");
  });
});

describe("titleCase / initials", () => {
  test("humanises hyphenated enum values", () => {
    assert.equal(titleCase("pending-payment"), "Pending Payment");
    assert.equal(titleCase("razorpay"), "Razorpay");
    assert.equal(titleCase(null), "—");
  });

  test("derives avatar initials", () => {
    assert.equal(initials("Vedika Desai"), "VD");
    assert.equal(initials("Madonna"), "M");
    assert.equal(initials(""), "U");
    assert.equal(initials(null), "U");
  });
});
