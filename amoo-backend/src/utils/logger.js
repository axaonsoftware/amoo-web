// Minimal leveled logger that writes to stdout/stderr.
// In production you'd swap this for pino/winston; kept dependency-free on purpose.
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const current = LEVELS[process.env.LOG_LEVEL || "info"] ?? 2;

function ts() {
  return new Date().toISOString();
}

function emit(level, args) {
  if (LEVELS[level] > current) return;
  const line = args
    .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
    .join(" ");
  const out = `[${ts()}] ${level.toUpperCase()} ${line}`;
  if (level === "error" || level === "warn") console.error(out);
  else console.log(out);
}

module.exports = {
  error: (...a) => emit("error", a),
  warn: (...a) => emit("warn", a),
  info: (...a) => emit("info", a),
  debug: (...a) => emit("debug", a),
};
