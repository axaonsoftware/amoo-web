import { test, expect, type Page } from "@playwright/test";

// Booking-path E2E. A freshly registered user is UNVERIFIED (register creates
// status 'pending'; no email/SMTP in this harness). The booking funnel is
// walked end-to-end through the real UI and the guard in
// POST /api/bookings — `verifiedRequired` runs BEFORE slot/service validation —
// so an unverified account deterministically gets the 403 "Email not verified"
// message instead of creating a booking. This is exactly the security barrier
// a real customer hits first, and it requires no SMTP or payment gateway.
//
// Requires: backend on NEXT_PUBLIC_API_URL (default :4000) + seeded dev DB.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function uniqueEmail(): string {
  return `e2e_booking_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto("/user-login");
  await page.getByLabel("Email Address").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Login successful!" }),
  ).toBeVisible();
}

test.describe("booking requires a verified email", () => {
  let email = "";
  const password = "E2e-booking-pass!";

  test.beforeAll(async ({ request }) => {
    email = uniqueEmail();
    const res = await request.post(`${API_URL}/api/auth/register`, {
      data: { name: "E2E Booking User", email, phone: "+91 98765 00000", password },
    });
    expect(res.status(), `register failed: ${await res.text()}`).toBe(201);

    // `next dev` compiles route segments on first hit; warm every page the
    // wizard touches so the test never stalls on the "Compiling…" overlay
    // inside its 90s navigation timeout.
    for (const route of [
      "/consultation/select-service",
      "/consultation/consultation-mode",
      "/consultation/select-date-time",
      "/consultation/consultation-booking",
    ]) {
      const warm = await request.get(route);
      // Unauthenticated guests get redirected by the proxy/RequireAuth — any
      // HTTP response (even a redirect) proves the segment compiled.
      expect(
        warm.status(),
        `route compile failed: GET ${route} -> ${warm.status()}`,
      ).toBeLessThan(500);
    }
  });

  test("an unverified user walks the wizard to the booking form and is blocked by the verify-email guard", async ({
    page,
  }) => {
    await loginViaUi(page, email, password);

    // Step 1 — pick a service (Reiki Healing Session exists in the seeded DB).
    await page.goto("/consultation/select-service");
    await page
      .locator("article", { hasText: "Reiki Healing Session" })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Continue with Reiki Healing Session" })
      .click();

    // Step 2 — pick a consultation mode (Chat).
    await page.waitForURL((url) => url.pathname === "/consultation/consultation-mode");
    await page.getByRole("button", { name: "Choose Chat" }).click();
    await page.getByRole("button", { name: "Continue with Chat" }).click();

    // Step 3 — date & time. The picker defaults to tomorrow; click the first
    // available slot and continue.
    await page.waitForURL((url) => url.pathname === "/consultation/select-date-time");
    await page
      .getByRole("button", { name: /^0[6-9]|^1[0-1]:(00|30) (AM|PM)$/ })
      .first()
      .click();
    await page.getByRole("button", { name: "Continue to Details" }).click();

    // Step 4 — booking form. Fill the mandatory fields + confirm checkbox.
    await page.waitForURL((url) => url.pathname === "/consultation/consultation-booking");
    await page.getByLabel("Full Name").fill("E2E Booking User");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Mobile Number").fill("9876512345");
    await page.getByPlaceholder("Write your concern here...").fill("E2E test concern");
    await page
      .locator('input[id="page-setagree-agree-i-confirm"]')
      .check({ force: true });
    await page
      .getByRole("button", { name: "Continue to Booking Summary" })
      .click();

    // The verify-email guard must reject the submission BEFORE any booking is
    // created — the exact message from src/middleware/auth.js.
    await expect(
      page
        .getByText(/Email not verified\. Please verify your email first\./)
        .first(),
    ).toBeVisible({ timeout: 15_000 });
    // We should NOT have advanced to the payment step.
    expect(new URL(page.url()).pathname).toBe(
      "/consultation/consultation-booking",
    );
  });
});