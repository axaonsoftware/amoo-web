// E2E config. The webServer below boots ONLY the Next.js frontend — the specs
// exercise real API calls against a live backend, so start amoo-backend first:
//
//   cd amoo-backend && npm run dev     # http://localhost:4000 (see backend .env)
//   cd amoo-web && npm run test:e2e
//
// Your local Postgres must be migrated + seeded (amoo-backend: npm run migrate
// && npm run seed). The auth/register rate limiters are per-IP; the specs
// register one account per suite in beforeAll to stay well under those budgets.
import { defineConfig, devices } from "@playwright/test";

const PORT = parseInt(process.env.PORT || "3000", 10);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 1,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
