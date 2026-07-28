const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { validate, validateQuery } = require("../middleware/validate");
const { ok, paginated, created, assertFound, parsePagination, fail } = require("../utils/response");
const env = require("../config/env");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const { getGenerator } = require("../report-generators/index");
const { resolveStoredFile } = require("../utils/paths");

const REPORT_UPDATE_ALLOWED = ["status", "title", "content", "file_url"];

const toPg = (sql) => { let i = 0; return sql.replace(/\?/g, () => `$${++i}`); };

// GET /api/reports (user: own, admin: all, with filters)
router.get(
  "/",
  authRequired,
  validateQuery,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = req.user.kind === "admin" ? "WHERE 1=1" : "WHERE user_id = ? AND deleted_at IS NULL";
    if (req.user.kind !== "admin") params.push(req.user.id);
    if (req.query.type) { where += " AND type = ?"; params.push(req.query.type); }
    if (req.query.status) { where += " AND status = ?"; params.push(req.query.status); }
    if (req.query.user_id && req.user.kind === "admin") { where += " AND user_id = ?"; params.push(req.query.user_id); }
    const { rows: [{ total }] } = await pool.query(toPg(`SELECT COUNT(*) AS total FROM reports ${where}`), params);
    const { rows } = await pool.query(
      toPg(`SELECT * FROM reports ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`),
      [...params, pageSize, offset]
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// GET /api/reports/stats (user's own stats by type)
router.get(
  "/stats",
  authRequired,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { rows: [stats] } = await pool.query(
      `SELECT
        SUM(CASE WHEN LOWER(type) LIKE '%tarot%' THEN 1 ELSE 0 END) AS tarot_total,
        SUM(CASE WHEN LOWER(type) LIKE '%tarot%' AND is_favorite = true THEN 1 ELSE 0 END) AS tarot_favorites,
        SUM(CASE WHEN LOWER(type) LIKE '%tarot%' AND downloaded = true THEN 1 ELSE 0 END) AS tarot_downloaded,
        SUM(CASE WHEN LOWER(type) LIKE '%tarot%' AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()) THEN 1 ELSE 0 END) AS tarot_this_month,
        SUM(CASE WHEN LOWER(type) LIKE '%numerology%' THEN 1 ELSE 0 END) AS numerology_total,
        SUM(CASE WHEN LOWER(type) LIKE '%numerology%' AND is_favorite = true THEN 1 ELSE 0 END) AS numerology_favorites,
        SUM(CASE WHEN LOWER(type) LIKE '%numerology%' AND downloaded = true THEN 1 ELSE 0 END) AS numerology_downloaded,
        SUM(CASE WHEN LOWER(type) LIKE '%numerology%' AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()) THEN 1 ELSE 0 END) AS numerology_this_year,
        SUM(CASE WHEN LOWER(type) LIKE '%kundli%' OR LOWER(type) LIKE '%kundali%' THEN 1 ELSE 0 END) AS kundali_total,
        SUM(CASE WHEN (LOWER(type) LIKE '%kundli%' OR LOWER(type) LIKE '%kundali%') AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()) THEN 1 ELSE 0 END) AS kundali_this_year,
        SUM(CASE WHEN (LOWER(type) LIKE '%kundli%' OR LOWER(type) LIKE '%kundali%') AND LOWER(type) LIKE '%compatibility%' THEN 1 ELSE 0 END) AS kundali_compatibility,
        SUM(CASE WHEN (LOWER(type) LIKE '%kundli%' OR LOWER(type) LIKE '%kundali%') AND downloaded = true THEN 1 ELSE 0 END) AS kundali_downloaded,
        SUM(CASE WHEN LOWER(type) LIKE '%reiki%' AND chakra_data IS NOT NULL THEN 1 ELSE 0 END) AS reiki_has_chakra_data
       FROM reports WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    ok(res, stats);
  })
);

// GET /api/reports/:id
router.get(
  "/:id",
  authRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM reports WHERE id = $1 AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
      return fail(res, 403, "Forbidden");
    }
    ok(res, rows[0]);
  })
);

// user create
router.post(
  "/",
  authRequired,
  validate("report"),
  asyncHandler(async (req, res) => {
    const { service_id, type, title, content, file_url } = req.body;

    // SECURITY: `file_url` is echoed back by GET /api/reports/:id/download, which
    // streams the file to whoever owns the *report*. Without this check a user
    // could point a report of their own at someone else's "/uploads/<name>" and
    // read it — sidestepping the ownership check on /api/uploads/:id/download.
    // The Joi `fileRef` rule already blocks traversal; this blocks borrowing.
    if (file_url) {
      const { rows: owned } = await pool.query(
        "SELECT id FROM uploads WHERE path = $1 AND user_id = $2 LIMIT 1",
        [file_url, req.user.id]
      );
      if (!owned.length) throw new HttpError(403, "file_url must reference a file you uploaded");
    }

    const result = await pool.query(
      "INSERT INTO reports (user_id, service_id, type, title, content, file_url, status) VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING id",
      [req.user.id, service_id || null, type || null, title, content || null, file_url || null]
    );
    const reportId = result.rows[0].id;

    // Auto-generate content when none is provided and a generator exists
    if (!content) {
      const generator = getGenerator(type);
      if (generator) {
        // Do NOT await inside the critical path — fire and forget so the
        // response returns immediately.  The report status stays "pending"
        // until generation completes; the frontend polls or refreshes.
        (async () => {
          try {
            // Merge saved birth details from DB as fallback for generators
            const { rows: [userRow] } = await pool.query(
              "SELECT name, dob, tob, birthplace FROM users WHERE id = $1",
              [req.user.id]
            );
            const extras = {
              ...(userRow || {}),
              ...req.body,
            };
            const generated = await generator.generate({
              userId: req.user.id,
              serviceId: service_id,
              userName: userRow?.name || null,
              extras,
            });
            await pool.query(
              "UPDATE reports SET title = COALESCE(NULLIF($1, ''), title), content = $2, file_url = COALESCE(NULLIF($3, ''), file_url), chakra_data = $4, status = 'ready' WHERE id = $5",
              [
                generated.title || null,
                generated.content || null,
                generated.file_url || null,
                generated.chakra_data ? JSON.stringify(generated.chakra_data) : null,
                reportId,
              ]
            );
          } catch (genErr) {
            logger.warn("[reports] auto-generation failed for report", reportId, genErr.message);
          }
        })();
      }
    }

    req.audit("create", "report", reportId, { title });
    created(res, { id: reportId });
  })
);

// admin create for any user
router.post(
  "/admin",
  adminRequired,
  validate("report"),
  asyncHandler(async (req, res) => {
    const { user_id, service_id, type, title, content, file_url } = req.body;
    if (!user_id) throw new HttpError(400, "user_id required");
    const result = await pool.query(
      "INSERT INTO reports (user_id, service_id, type, title, content, file_url, status) VALUES ($1,$2,$3,$4,$5,$6,'ready') RETURNING id",
      [user_id, service_id || null, type || null, title, content || null, file_url || null]
    );
    const reportId = result.rows[0].id;

    // Auto-generate content when none is provided and a generator exists
    if (!content) {
      const generator = getGenerator(type);
      if (generator) {
        const { rows: [userRow] } = await pool.query(
          "SELECT name, dob, tob, birthplace FROM users WHERE id = $1",
          [user_id]
        );
        (async () => {
          try {
            // Merge saved birth details from DB as fallback
            const extras = {
              ...(userRow || {}),
              ...req.body,
            };
            const generated = await generator.generate({
              userId: user_id,
              serviceId: service_id,
              userName: userRow?.name || null,
              extras,
            });
            await pool.query(
              "UPDATE reports SET title = COALESCE(NULLIF($1, ''), title), content = $2, file_url = COALESCE(NULLIF($3, ''), file_url), chakra_data = $4, status = 'ready' WHERE id = $5",
              [
                generated.title || null,
                generated.content || null,
                generated.file_url || null,
                generated.chakra_data ? JSON.stringify(generated.chakra_data) : null,
                reportId,
              ]
            );
          } catch (genErr) {
            logger.warn("[reports] admin auto-generation failed for report", reportId, genErr.message);
          }
        })();
      }
    }

    req.audit("create", "report", reportId, { title });
    created(res, { id: reportId });
  })
);

// admin update (status/title/content/file)
router.patch(
  "/:id",
  adminRequired,
  validate("reportUpdate"),
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, REPORT_UPDATE_ALLOWED);
    values.push(req.params.id);
    await pool.query(`UPDATE reports SET ${setClause} WHERE id = $${values.length}`, values);
    req.audit("update", "report", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// admin soft-delete
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT id FROM reports WHERE id = $1 AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("UPDATE reports SET deleted_at = NOW() WHERE id = $1", [req.params.id]);
    req.audit("delete", "report", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

// GET /api/reports/:id/download  (serve the linked file)
router.get(
  "/:id/download",
  authRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM reports WHERE id = $1 AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
      return fail(res, 403, "Forbidden");
    }
    const fileUrl = rows[0].file_url;
    if (!fileUrl) return fail(res, 404, "No file attached to this report");

    // S3 / object storage: redirect to the public/signed URL.
    if (env.storage.enabled && /^https?:\/\//i.test(fileUrl)) {
      await pool.query("UPDATE reports SET downloaded = true WHERE id = $1", [req.params.id]);
      return res.redirect(fileUrl);
    }

    // Local disk. `file_url` is client-supplied (POST /api/reports accepts it),
    // so it must be resolved inside the uploads directory and rejected if it
    // escapes — otherwise "../../.env" would hand out the JWT secrets.
    const filePath = resolveStoredFile(fileUrl);
    if (!filePath) return fail(res, 400, "Invalid file reference");
    if (!fs.existsSync(filePath)) return fail(res, 404, "File not found on disk");

    await pool.query("UPDATE reports SET downloaded = true WHERE id = $1", [req.params.id]);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.download(filePath, path.basename(filePath));
  })
);

module.exports = router;
