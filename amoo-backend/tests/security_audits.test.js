const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

describe("Security Issue 1: POST /api/bookings payment field stripping & pending status", () => {
  it("schema strips client-supplied payment field", () => {
    const { schemas } = require("../src/middleware/validate");
    const input = { service_id: 1, date: "2026-08-01", time: "10:00", amount: 100, payment: "Paid" };
    const { value } = schemas.booking.validate(input, { stripUnknown: true });
    assert.strictEqual(value.payment, undefined);
  });

  it("bookings.js inserts status = 'pending-payment' and payment = 'Pending'", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/routes/bookings.js"), "utf8");
    assert.ok(code.includes("'Pending', 'pending-payment'"), "Booking insertion must set payment='Pending' and status='pending-payment'");
  });
});

describe("Security Issue 2: POST /api/payments/:id/refund authorization guard", () => {
  it("guarded by adminRequired", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/routes/payments.js"), "utf8");
    const refundRouteMatch = code.match(/router\.post\(\s*"\/:\s*id\/refund"\s*,\s*(\w+)/);
    assert.ok(refundRouteMatch, "Refund route must be defined");
    assert.strictEqual(refundRouteMatch[1], "adminRequired", "Refund route must be guarded by adminRequired");
  });
});

describe("Security Issue 3: seed.js production refusal & password protection", () => {
  it("refuses to run when NODE_ENV=production", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/seed.js"), "utf8");
    assert.ok(code.includes('process.env.NODE_ENV === "production"'), "seed.js must check NODE_ENV === 'production'");
    assert.ok(code.includes("Refusing to seed"), "seed.js must log error on production");
  });

  it("admin insertion uses ON DUPLICATE KEY UPDATE id = id", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/seed.js"), "utf8");
    assert.ok(code.includes("ON DUPLICATE KEY UPDATE id = id"), "Admin insert must not overwrite existing password");
  });
});

describe("Security Issue 4: Production refusal for PAYMENT_GATEWAY === 'mock'", () => {
  it("env.js checks PAYMENT_GATEWAY in production", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/config/env.js"), "utf8");
    assert.ok(code.includes('env.isProd && env.payments.gateway === "mock"'), "env.js must reject mock gateway in production");
  });

  it("payments.js webhook checks signature verification configuration in production", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/routes/payments.js"), "utf8");
    assert.ok(code.includes("!canVerify && env.isProd"), "payments.js webhook must return 503 if verification not configured in prod");
  });
});
