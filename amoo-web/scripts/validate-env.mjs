// Load env files the same way Next.js does (project root only, closest to
// process.env priority: real env vars > .env.production > .env.local > .env)
// so `npm run build` works out of the box with .env.local present. This script
// runs BEFORE `next build`, which is when Next.js would normally load them.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  const content = readFileSync(file, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue; // real env wins
    process.env[key] = line.slice(eq + 1).trim();
  }
}

const nodeEnv = process.env.NODE_ENV || "development";
const cwd = process.cwd();
if (nodeEnv !== "production") loadEnvFile(path.join(cwd, ".env"));
loadEnvFile(path.join(cwd, ".env.local"));
if (nodeEnv === "production") loadEnvFile(path.join(cwd, ".env.production"));

// Vars that MUST be set for the build to succeed.
// NEXT_PUBLIC_* vars with fallbacks in lib/constants.ts are excluded — the code
// handles missing values gracefully.
const REQUIRED_PROD = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "NEXT_PUBLIC_CONTACT_EMAIL",
];

const missing = REQUIRED_PROD.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`ERROR: Missing required environment variables:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

console.log("All required env vars are set.");
