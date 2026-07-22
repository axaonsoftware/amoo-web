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
const { getGenerator } = require("../report-generators/index");

const REPORT_UPDATE_ALLOWED = ["status", "title", "content", "file_url"];

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
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM reports ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM reports ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
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
    const [[stats]] = await pool.query(
      `SELECT
        SUM(CASE WHEN LOWER(type) LIKE '%tarot%' THEN 1 ELSE 0 END) AS tarot_total,
        SUM(CASE WHEN LOWER(type) LIKE '%tarot%' AND is_favorite = 1 THEN 1 ELSE 0 END) AS tarot_favorites,
        SUM(CASE WHEN LOWER(type) LIKE '%tarot%' AND downloaded = 1 THEN 1 ELSE 0 END) AS tarot_downloaded,
        SUM(CASE WHEN LOWER(type) LIKE '%tarot%' AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN 1 ELSE 0 END) AS tarot_this_month,
        SUM(CASE WHEN LOWER(type) LIKE '%numerology%' THEN 1 ELSE 0 END) AS numerology_total,
        SUM(CASE WHEN LOWER(type) LIKE '%numerology%' AND is_favorite = 1 THEN 1 ELSE 0 END) AS numerology_favorites,
        SUM(CASE WHEN LOWER(type) LIKE '%numerology%' AND downloaded = 1 THEN 1 ELSE 0 END) AS numerology_downloaded,
        SUM(CASE WHEN LOWER(type) LIKE '%numerology%' AND YEAR(created_at) = YEAR(NOW()) THEN 1 ELSE 0 END) AS numerology_this_year,
        SUM(CASE WHEN LOWER(type) LIKE '%kundli%' OR LOWER(type) LIKE '%kundali%' THEN 1 ELSE 0 END) AS kundali_total,
        SUM(CASE WHEN (LOWER(type) LIKE '%kundli%' OR LOWER(type) LIKE '%kundali%') AND YEAR(created_at) = YEAR(NOW()) THEN 1 ELSE 0 END) AS kundali_this_year,
        SUM(CASE WHEN (LOWER(type) LIKE '%kundli%' OR LOWER(type) LIKE '%kundali%') AND LOWER(type) LIKE '%compatibility%' THEN 1 ELSE 0 END) AS kundali_compatibility,
        SUM(CASE WHEN (LOWER(type) LIKE '%kundli%' OR LOWER(type) LIKE '%kundali%') AND downloaded = 1 THEN 1 ELSE 0 END) AS kundali_downloaded,
        SUM(CASE WHEN LOWER(type) LIKE '%reiki%' AND chakra_data IS NOT NULL THEN 1 ELSE 0 END) AS reiki_has_chakra_data
       FROM reports WHERE user_id = ? AND deleted_at IS NULL`,
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
    const [rows] = await pool.query("SELECT * FROM reports WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
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
    const [result] = await pool.query(
      "INSERT INTO reports (user_id, service_id, type, title, content, file_url, status) VALUES (?,?,?,?,?,?,'pending')",
      [req.user.id, service_id || null, type || null, title, content || null, file_url || null]
    );
    const reportId = result.insertId;

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
            const [[userRow]] = await pool.query(
              "SELECT name, dob, tob, birthplace FROM users WHERE id = ?",
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
              "UPDATE reports SET title = COALESCE(NULLIF(?, ''), title), content = ?, file_url = COALESCE(NULLIF(?, ''), file_url), chakra_data = ?, status = 'ready' WHERE id = ?",
              [
                generated.title || null,
                generated.content || null,
                generated.file_url || null,
                generated.chakra_data ? JSON.stringify(generated.chakra_data) : null,
                reportId,
              ]
            );
          } catch (genErr) {
            // Generation failed — leave status as "pending" so an admin
            // knows something went wrong and can manually fill content.
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
    const [result] = await pool.query(
      "INSERT INTO reports (user_id, service_id, type, title, content, file_url, status) VALUES (?,?,?,?,?,?,'ready')",
      [user_id, service_id || null, type || null, title, content || null, file_url || null]
    );
    const reportId = result.insertId;

    // Auto-generate content when none is provided and a generator exists
    if (!content) {
      const generator = getGenerator(type);
      if (generator) {
        const [[userRow]] = await pool.query(
          "SELECT name, dob, tob, birthplace FROM users WHERE id = ?",
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
              "UPDATE reports SET title = COALESCE(NULLIF(?, ''), title), content = ?, file_url = COALESCE(NULLIF(?, ''), file_url), chakra_data = ?, status = 'ready' WHERE id = ?",
              [
                generated.title || null,
                generated.content || null,
                generated.file_url || null,
                generated.chakra_data ? JSON.stringify(generated.chakra_data) : null,
                reportId,
              ]
            );
          } catch (genErr) {
            // Generation failed — status stays as inserted ("ready" for admin,
            // "pending" for user).  Admin can manually edit content.
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
    const { setClause, values } = buildUpdate(req.body, REPORT_UPDATE_ALLOWED, [req.params.id]);
    await pool.query(`UPDATE reports SET ${setClause} WHERE id = ?`, values);
    req.audit("update", "report", Number(req.params.id), req.body);
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// admin soft-delete
router.delete(
  "/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT id FROM reports WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    await pool.query("UPDATE reports SET deleted_at = NOW() WHERE id = ?", [req.params.id]);
    req.audit("delete", "report", Number(req.params.id));
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

// GET /api/reports/:id/download  (serve the linked file)
router.get(
  "/:id/download",
  authRequired,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM reports WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (assertFound(res, rows[0])) return;
    if (req.user.kind !== "admin" && rows[0].user_id !== req.user.id) {
      return fail(res, 403, "Forbidden");
    }
    const fileUrl = rows[0].file_url;
    if (!fileUrl) return fail(res, 404, "No file attached to this report");

    // Mark as downloaded
    await pool.query("UPDATE reports SET downloaded = 1 WHERE id = ?", [req.params.id]);

    // S3 / object storage: redirect to the public/signed URL.
    if (env.storage.enabled && fileUrl.startsWith("http")) {
      return res.redirect(fileUrl);
    }
    // Local disk: stream the file.
    const filePath = path.join(__dirname, "..", "..", fileUrl);
    if (!fs.existsSync(filePath)) return fail(res, 404, "File not found on disk");
    res.download(filePath, path.basename(filePath));
  })
);

module.exports = router;
