const { pool } = require("../config/db");

// Best-effort audit log write. Never throws to the caller.
async function logAudit({ actor_id, actor_type, action, entity, entity_id, meta }) {
  try {
    await pool.query(
      "INSERT INTO audit_log (actor_id, actor_type, action, entity, entity_id, meta) VALUES (?, ?, ?, ?, ?, ?)",
      [
        actor_id ?? null,
        actor_type ?? "system",
        action,
        entity ?? null,
        entity_id ?? null,
        meta ? JSON.stringify(meta) : null,
      ]
    );
  } catch (e) {
    // audit failures should not break the main flow
    console.warn("[audit] write failed:", e.message);
  }
}

module.exports = { logAudit };
