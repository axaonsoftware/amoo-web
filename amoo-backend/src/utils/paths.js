const path = require("path");

// Everything the app is allowed to serve from disk lives under this root.
// Report `file_url` values and upload `path` values are both stored relative to
// it, in the form "/uploads/<filename>".
const APP_ROOT = path.join(__dirname, "..", "..");
const UPLOADS_ROOT = path.join(APP_ROOT, "uploads");

// config/storage.js writes every local file as a flat, server-generated name:
//   Date.now() + "-" + random + ext        e.g. "1712345678-123456789.pdf"
// So a legitimate stored reference is always ONE path segment — never nested,
// never containing a separator. Requiring that is both simpler and stricter
// than trying to enumerate the ways `..` can be spelled.
const FLAT_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,250}$/;

/**
 * Resolve a stored, relative file reference to an absolute path, refusing
 * anything that escapes `root`.
 *
 * `reports.file_url` is client-supplied (POST /api/reports accepts it), so a
 * value like "../../.env" would otherwise let any signed-in user read the
 * backend's JWT secrets and DB password through GET /api/reports/:id/download.
 * path.join() normalises those `..` segments away from the root, so a raw
 * string check is not enough — the guard is structural instead: strip the known
 * "/uploads/" prefix, demand a single flat segment, then verify containment
 * against the resolved root as a final backstop.
 *
 * @param {string} storedPath  value from the DB (e.g. "/uploads/abc.pdf")
 * @param {string} [root]      directory the result must stay inside
 * @returns {string|null}      absolute path, or null if unsafe/empty
 */
function resolveStoredFile(storedPath, root = UPLOADS_ROOT) {
  if (typeof storedPath !== "string") return null;

  const raw = storedPath.trim();
  if (!raw) return null;
  // NUL bytes truncate paths in some syscalls.
  if (raw.includes("\0")) return null;
  // A URL is handled by the caller's S3 branch, not here.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) return null;
  // Windows drive letters and UNC paths are never valid stored values.
  if (/^[a-zA-Z]:/.test(raw) || raw.startsWith("\\\\")) return null;

  // Stored values are rooted at the app ("/uploads/x.pdf"). Strip the leading
  // separator and an optional "uploads/" prefix so what remains is the filename.
  const name = raw.replace(/^[/\\]+/, "").replace(/^uploads[/\\]+/i, "");

  // One flat segment only. This is what rejects "../../.env", "etc/passwd",
  // and every encoded or mixed-separator variant of them in a single step.
  if (!FLAT_NAME.test(name)) return null;

  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, name);

  // Backstop. path.relative() gives "" for the root itself and a ".."-prefixed
  // value for anything outside it. Comparing string prefixes instead would
  // wrongly accept a sibling directory such as "/app/uploads-evil".
  const rel = path.relative(resolvedRoot, resolved);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) return null;

  return resolved;
}

module.exports = { resolveStoredFile, APP_ROOT, UPLOADS_ROOT, FLAT_NAME };
