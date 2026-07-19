// Wrap an async route handler so thrown errors/rejections reach the error middleware.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Generate a unique, collision-resistant booking reference.
// Format: BOOK-<base36 timestamp>-<random> e.g. BOOK-LZ8X2-3F9K
function genBookingRef() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `BOOK-${t}-${r}`;
}

// Generate a cryptographically-secure numeric OTP (default 6 digits).
// Uses crypto.randomInt so OTPs are not predictable (unlike Math.random).
function genOtp(length = 6) {
  const max = Math.pow(10, length);
  return String(crypto.randomInt(0, max)).padStart(length, "0");
}

// Build a parameterized UPDATE SET clause from a whitelist of allowed fields.
// Returns { setClause, values }. Throws if no allowed fields present.
function buildUpdate(fields, allowed, startingValues = []) {
  const keys = Object.keys(fields).filter((k) => allowed.includes(k));
  if (!keys.length) throw new HttpError(400, "No valid fields to update");
  const setClause = keys.map((k) => `\`${k}\` = ?`).join(", ");
  const values = [...keys.map((k) => fields[k]), ...startingValues];
  return { setClause, values, keys };
}

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

module.exports = { asyncHandler, genBookingRef, genOtp, buildUpdate, HttpError };
