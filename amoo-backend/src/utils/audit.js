const logger = require("./logger");
const { pool } = require("../config/db");

// Best-effort audit log write. Never throws to the caller.
async function logAudit({ actor_id, actor_type, action, entity, entity_id, meta, ip_address, user_agent, page_or_route }) {
  try {
    await pool.query(
      "INSERT INTO audit_log (actor_id, actor_type, action, entity, entity_id, meta, ip_address, user_agent, page_or_route) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        actor_id ?? null,
        actor_type ?? "system",
        action,
        entity ?? null,
        entity_id ?? null,
        meta ? JSON.stringify(meta) : null,
        ip_address ?? null,
        user_agent ?? null,
        page_or_route ?? null,
      ]
    );
  } catch (e) {
    // audit failures should not break the main flow
    logger.warn("[audit] write failed:", e.message);
  }
}

module.exports = { logAudit };
