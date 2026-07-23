// Containment tests for utils/paths.js — the guard that stops a client-supplied
// `reports.file_url` from escaping the uploads directory.
const { describe, it } = require("node:test");
const assert = require("node:assert");
const path = require("path");

const { resolveStoredFile, UPLOADS_ROOT } = require("../src/utils/paths");

describe("resolveStoredFile — rejects escapes", () => {
  const escapes = [
    "../../.env",
    "../../../etc/passwd",
    "/uploads/../../.env",
    "uploads/../../package.json",
    "..\\..\\.env",
    "/uploads/..%2f..%2f.env/..",
    "....//....//.env",
  ];

  for (const value of escapes) {
    it(`rejects ${JSON.stringify(value)}`, () => {
      assert.strictEqual(resolveStoredFile(value), null);
    });
  }

  it("rejects an absolute POSIX path", () => {
    assert.strictEqual(resolveStoredFile("/etc/passwd"), null);
  });

  it("rejects a Windows drive letter", () => {
    assert.strictEqual(resolveStoredFile("C:\\Windows\\win.ini"), null);
  });

  it("rejects a URL scheme (handled by the S3 branch, not the disk branch)", () => {
    assert.strictEqual(resolveStoredFile("https://evil.test/x.pdf"), null);
    assert.strictEqual(resolveStoredFile("file:///etc/passwd"), null);
  });

  it("rejects a NUL byte", () => {
    assert.strictEqual(resolveStoredFile("ok.pdf\0.png"), null);
  });

  it("rejects empty / non-string input", () => {
    assert.strictEqual(resolveStoredFile(""), null);
    assert.strictEqual(resolveStoredFile("   "), null);
    assert.strictEqual(resolveStoredFile(null), null);
    assert.strictEqual(resolveStoredFile(undefined), null);
    assert.strictEqual(resolveStoredFile(42), null);
  });

  it("rejects the root directory itself", () => {
    assert.strictEqual(resolveStoredFile("/uploads/"), null);
  });

  // A prefix comparison (resolved.startsWith(root)) would wrongly accept this.
  it("rejects a sibling directory that shares the root's prefix", () => {
    const sibling = path.join(UPLOADS_ROOT + "-evil", "secret.txt");
    const relative = path.relative(UPLOADS_ROOT, sibling);
    assert.strictEqual(resolveStoredFile(relative), null);
  });

  // Stored names are always flat, so any nesting is a sign of a crafted value.
  it("rejects a nested path even when it stays inside the root", () => {
    assert.strictEqual(resolveStoredFile("sub/dir/file.pdf"), null);
    assert.strictEqual(resolveStoredFile("/etc/passwd"), null);
  });

  it("rejects a leading dot (dotfiles are never generated)", () => {
    assert.strictEqual(resolveStoredFile(".env"), null);
  });
});

describe("resolveStoredFile — accepts legitimate stored values", () => {
  it("resolves an /uploads/<name> path inside the uploads root", () => {
    const resolved = resolveStoredFile("/uploads/1712345678-123456789.pdf");
    assert.ok(resolved, "expected a resolved path");
    assert.strictEqual(
      resolved,
      path.join(UPLOADS_ROOT, "1712345678-123456789.pdf")
    );
  });

  it("resolves a bare filename the same way", () => {
    assert.strictEqual(
      resolveStoredFile("chart.png"),
      path.join(UPLOADS_ROOT, "chart.png")
    );
  });

  it("tolerates a duplicated uploads/ prefix", () => {
    assert.strictEqual(
      resolveStoredFile("uploads/chart.png"),
      path.join(UPLOADS_ROOT, "chart.png")
    );
  });
});
