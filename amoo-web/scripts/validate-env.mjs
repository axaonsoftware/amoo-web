const REQUIRED_PROD = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "NEXT_PUBLIC_SITE_NAME",
  "NEXT_PUBLIC_CONTACT_EMAIL",
  "JWT_SECRET",
];

const missing = REQUIRED_PROD.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`ERROR: Missing required environment variables:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

console.log("All required env vars are set.");
