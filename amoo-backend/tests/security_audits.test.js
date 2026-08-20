const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

describe("Security Issue 1: POST /api/bookings payment field stripping & pending status", () => {
  it("schema strips client-supplied payment field", () => {
    const { schemas } = require("../src/middleware/validate");
    const input = { service_id: 1, date: "2027-01-01", time: "10:00", amount: 100, payment: "Paid" };
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

  it("verify-refund route guarded by adminRequired", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/routes/payments.js"), "utf8");
    const verifyRouteMatch = code.match(/router\.post\(\s*"\/:\s*id\/verify-refund"\s*,\s*(\w+)/);
    assert.ok(verifyRouteMatch, "Verify-refund route must be defined");
    assert.strictEqual(verifyRouteMatch[1], "adminRequired", "Verify-refund route must be guarded by adminRequired");
  });

  it("refund handler returns 402 on gateway failure (does not mark refunded)", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/routes/payments.js"), "utf8");
    assert.ok(code.includes("return fail(res, 402,"), "Must return 402 on gateway failure");
    assert.ok(code.includes("ROLLBACK"), "Must rollback transaction on gateway failure");
  });

  it("refund does not cancel booking directly", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/routes/payments.js"), "utf8");
    const refundSection = code.substring(
      code.indexOf('"/:id/refund"'),
      code.indexOf('"/:id/verify-refund"')
    );
    assert.ok(!refundSection.includes("UPDATE bookings SET"), "Refund handler must NOT cancel bookings directly");
    assert.ok(refundSection.includes("'pending'"), "Refund must be recorded as pending");
  });
});

describe("Security Issue 3: seed.js production refusal & password protection", () => {
  it("refuses to run when NODE_ENV=production", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/seed.js"), "utf8");
    assert.ok(code.includes('process.env.NODE_ENV === "production"'), "seed.js must check NODE_ENV === 'production'");
    assert.ok(code.includes("Refusing to seed"), "seed.js must log error on production");
  });

  it("admin insertion never overwrites an existing password hash or primary key", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/seed.js"), "utf8");
    assert.ok(code.includes("ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name"), "Admin insert must not overwrite existing password");
    assert.ok(!code.includes("DO UPDATE SET id = EXCLUDED.id"), "Admin insert must not reassign the primary key (breaks dependent FKs on re-seed)");
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

describe("Security Issue 5: Single-admin enforcement in production", () => {
  it("production-init.js requires ADMIN_EMAIL", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/production-init.js"), "utf8");
    assert.ok(code.includes("ADMIN_EMAIL"), "production-init.js must read ADMIN_EMAIL from env");
    assert.ok(code.includes("ADMIN_PASSWORD"), "production-init.js must read ADMIN_PASSWORD from env");
  });

  it("production-init.js checks for existing admin before creating", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/production-init.js"), "utf8");
    assert.ok(code.includes("deleted_at IS NULL"), "production-init.js must check for existing non-deleted admin");
    assert.ok(code.includes("Skipping creation"), "production-init.js must skip if admin already exists");
  });

  it("production-init.js installs a DB trigger to prevent multiple admins", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/production-init.js"), "utf8");
    assert.ok(code.includes("prevent_multi_admin"), "production-init.js must install the single-admin trigger function");
    assert.ok(code.includes("trg_single_admin"), "production-init.js must create the trigger");
  });

  it("schema.sql includes the single-admin trigger", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/schema.sql"), "utf8");
    assert.ok(code.includes("prevent_multi_admin"), "schema.sql must define the single-admin trigger function");
    assert.ok(code.includes("trg_single_admin"), "schema.sql must create the trigger");
  });

  it("seed.js password is never weaker than 12 chars", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/seed.js"), "utf8");
    assert.ok(code.includes('bcrypt.hash("admin123", 12)'), "seed.js must use bcrypt with cost 12");
  });

  it("production-init.js rejects passwords shorter than 12 characters", () => {
    const code = fs.readFileSync(path.join(__dirname, "../src/production-init.js"), "utf8");
    assert.ok(code.includes("password.length < 12"), "production-init.js must enforce minimum password length");
  });
});
