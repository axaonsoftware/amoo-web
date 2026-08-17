const crypto = require("crypto");

// Store a short-lived secret (OTP, email-verification token) as a SHA-256 hash
// so a database read can never hand out a usable token. SHA-256 is sufficient
// here because the inputs are high-entropy (crypto.randomBytes / crypto.randomInt),
// not human-memorized passwords.
function hashSecret(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

// True when the stored value looks like one of our 64-char hex hashes.
function isHash(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

// Compare a user-supplied secret against the stored value. The stored value is
// normally a hex hash (64 chars); a legacy plaintext value (written before this
// feature shipped) is still accepted so pending resets keep working, compared
// in constant time.
function verifySecret(stored, provided) {
  if (typeof stored !== "string" || typeof provided !== "string" || !stored || !provided) return false;
  const candidate = isHash(stored) ? hashSecret(provided) : provided;
  const a = crypto.createHash("sha256").update(stored).digest();
  const b = crypto.createHash("sha256").update(candidate).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = { hashSecret, verifySecret, isHash };
