import { test, expect, type Page } from "@playwright/test";

// E2E for the primary user sign-in path: route protection redirect, a
// successful login through the real UI, and a rejected login for bad
// credentials. Requires the backend (default http://localhost:4000) and a
// seeded dev database — the playwright webServer only boots the frontend.
//
// The suite registers ONE throwaway account in beforeAll and reuses it across
// all tests. Registration endpoints are rate-limited per-IP (registerLimiter,
// 10/hour) and login is throttled too (authLimiter, 30/15min) — registering
// per-test would legitimately trip those production protections on repeated
// local runs. Playwright's per-test isolation still resets cookies, so each
// test starts unauthenticated against the shared account.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function uniqueEmail(): string {
  return `e2e_login_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe("user login", () => {
  let email = "";
  const password = "E2e-t3st-pass!";

  test.beforeAll(async ({ request }) => {
    email = uniqueEmail();
    const res = await request.post(`${API_URL}/api/auth/register`, {
      data: { name: "E2E User", email, phone: "+91 98765 00000", password },
    });
    // A fresh unique email must register first try; anything else is a real bug.
    expect(res.status(), `register failed: ${await res.text()}`).toBe(201);
  });

  test("unauthenticated /user-dashboard redirects to /user-login with callbackUrl", async ({
    page,
  }) => {
    await page.goto("/user-dashboard");
    await page.waitForURL((url) => url.pathname === "/user-login");
    const url = new URL(page.url());
    expect(url.searchParams.get("callbackUrl")).toBe("/user-dashboard");
  });

  test("logs in through the UI", async ({ page }) => {
    await page.goto("/user-login");
    await page.getByLabel("Email Address").fill(email);
    await page.locator("#login-password").fill(password);
    await page.getByRole("button", { name: "Login", exact: true }).click();

    // Login success is both announced in the UI and followed by a redirect
    // to the home page (default callbackUrl "/").
    await expect(
      page.getByRole("alert").filter({ hasText: "Login successful!" }),
    ).toBeVisible();
    await page.waitForURL((url) => url.pathname === "/");
  });

  test("rejects a wrong password with a visible error", async ({ page }) => {
    await page.goto("/user-login");
    await page.getByLabel("Email Address").fill(email);
    await page.locator("#login-password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Login", exact: true }).click();

    // The user stays on the login page and the error is surfaced.
    await expect(page).toHaveURL(/\/user-login$/);
    await expect(
      page.getByRole("alert").filter({ hasText: "Invalid credentials" }),
    ).toBeVisible();
  });

  test("protected route stays accessible after login and the token is honored", async ({
    page,
  }) => {
    await page.goto("/user-dashboard");
    await page.waitForURL((url) => url.pathname === "/user-login");
    await page.getByLabel("Email Address").fill(email);
    await page.locator("#login-password").fill(password);
    await page.getByRole("button", { name: "Login", exact: true }).click();

    // Login redirects to the callbackUrl the proxy attached, so we land back
    // on the dashboard — exercising the proxy verify + the JWT cookie round-trip.
    // The h1 renders the name returned by GET /api/auth/me, proving the token
    // is honored end-to-end.
    await page.waitForURL((url) => url.pathname === "/user-dashboard");
    await expect(
      page.getByRole("heading", { name: "E2E User" }),
    ).toBeVisible();
  });
});