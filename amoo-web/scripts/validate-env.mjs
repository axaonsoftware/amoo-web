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
