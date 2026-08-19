const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { adminRequired } = require("../middleware/auth");
const { asyncHandler, HttpError, buildUpdate } = require("../utils/helpers");
const { ok, created, paginated, parsePagination } = require("../utils/response");

// ── Create tables idempotently at load time ─────────────────────────────────
pool.query(`
  CREATE TABLE IF NOT EXISTS horoscopes (
    id SERIAL PRIMARY KEY,
    zodiac_sign VARCHAR(30) NOT NULL,
    horoscope_type VARCHAR(20) NOT NULL CHECK (horoscope_type IN ('daily', 'weekly', 'monthly')),
    content TEXT NOT NULL,
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).catch(() => {});

pool.query(`
  CREATE TABLE IF NOT EXISTS zodiac_signs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    symbol VARCHAR(10),
    date_range VARCHAR(50),
    element VARCHAR(20),
    ruling_planet VARCHAR(30),
    description TEXT,
    image_url VARCHAR(512),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).catch(() => {});

// ── Seed zodiac signs if empty ───────────────────────────────────────────────
(async () => {
  try {
    const { rows: [{ count }] } = await pool.query("SELECT COUNT(*) AS count FROM zodiac_signs");
    if (Number(count) === 0) {
      const signs = [
        ['Aries', '♈', 'Mar 21 – Apr 19', 'Fire', 'Mars', 'Bold and ambitious, Aries dives headfirst into new challenges.'],
        ['Taurus', '♉', 'Apr 20 – May 20', 'Earth', 'Venus', 'Practical and grounded, Taurus enjoys the finer things in life.'],
        ['Gemini', '♊', 'May 21 – Jun 20', 'Air', 'Mercury', 'Curious and adaptable, Gemini thrives on communication and variety.'],
        ['Cancer', '♋', 'Jun 21 – Jul 22', 'Water', 'Moon', 'Nurturing and intuitive, Cancer values home and family.'],
        ['Leo', '♌', 'Jul 23 – Aug 22', 'Fire', 'Sun', 'Creative and generous, Leo loves to lead and be in the spotlight.'],
        ['Virgo', '♍', 'Aug 23 – Sep 22', 'Earth', 'Mercury', 'Analytical and meticulous, Virgo strives for perfection.'],
        ['Libra', '♎', 'Sep 23 – Oct 22', 'Air', 'Venus', 'Diplomatic and fair, Libra seeks balance and harmony.'],
        ['Scorpio', '♏', 'Oct 23 – Nov 21', 'Water', 'Pluto', 'Passionate and resourceful, Scorpio is deeply intuitive.'],
        ['Sagittarius', '♐', 'Nov 22 – Dec 21', 'Fire', 'Jupiter', 'Adventurous and optimistic, Sagittarius loves freedom and truth.'],
        ['Capricorn', '♑', 'Dec 22 – Jan 19', 'Earth', 'Saturn', 'Disciplined and ambitious, Capricorn is the master of self-control.'],
        ['Aquarius', '♒', 'Jan 20 – Feb 18', 'Air', 'Uranus', 'Innovative and independent, Aquarius is a forward-thinking humanitarian.'],
        ['Pisces', '♓', 'Feb 19 – Mar 20', 'Water', 'Neptune', 'Compassionate and artistic, Pisces is deeply connected to the spiritual realm.'],
      ];
      for (const [name, symbol, dateRange, element, planet, desc] of signs) {
        await pool.query(
          "INSERT INTO zodiac_signs (name, symbol, date_range, element, ruling_planet, description) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING",
          [name, symbol, dateRange, element, planet, desc]
        );
      }
    }
  } catch (_) {}
})();

const HOROSCOPE_UPDATE_ALLOWED = ["zodiac_sign", "horoscope_type", "content", "publish_date", "status"];
const ZODIAC_FULL_UPDATE_ALLOWED = ["name", "symbol", "date_range", "element", "ruling_planet", "description", "image_url", "active"];
const ZODIAC_PARTIAL_UPDATE_ALLOWED = ["description", "image_url", "active"];

// ── Horoscopes ──────────────────────────────────────────────────────────────

// GET /api/content/horoscopes — admin, list with pagination + filters
router.get(
  "/horoscopes",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = parsePagination(req.query);
    const params = [];
    let where = "WHERE 1=1";
    let p = 0;
    if (req.query.zodiac_sign) { where += ` AND zodiac_sign = $${++p}`; params.push(req.query.zodiac_sign); }
    if (req.query.horoscope_type) { where += ` AND horoscope_type = $${++p}`; params.push(req.query.horoscope_type); }
    if (req.query.status) { where += ` AND status = $${++p}`; params.push(req.query.status); }
    if (req.query.search) { where += ` AND content ILIKE $${++p}`; params.push(`%${req.query.search}%`); }
    const { rows: [{ total }] } = await pool.query(`SELECT COUNT(*) AS total FROM horoscopes ${where}`, params);
    params.push(pageSize, offset);
    const { rows } = await pool.query(
      `SELECT * FROM horoscopes ${where} ORDER BY publish_date DESC, created_at DESC LIMIT $${++p} OFFSET $${++p}`,
      params
    );
    paginated(res, rows, { page, pageSize, total });
  })
);

// POST /api/content/horoscopes — admin create
router.post(
  "/horoscopes",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { zodiac_sign, horoscope_type, content, publish_date, status } = req.body;
    if (!zodiac_sign || !horoscope_type || !content) {
      throw new HttpError(400, "zodiac_sign, horoscope_type, and content are required");
    }
    const result = await pool.query(
      `INSERT INTO horoscopes (zodiac_sign, horoscope_type, content, publish_date, status) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [zodiac_sign, horoscope_type, content, publish_date || new Date().toISOString().slice(0, 10), status || "draft"]
    );
    created(res, { id: result.rows[0].id });
  })
);

// PUT /api/content/horoscopes/:id — admin update
router.put(
  "/horoscopes/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, HOROSCOPE_UPDATE_ALLOWED, [req.params.id]);
    const result = await pool.query(
      `UPDATE horoscopes SET ${setClause}, updated_at = NOW() WHERE id = $${values.length}`,
      values
    );
    if (result.rowCount === 0) throw new HttpError(404, "Horoscope not found");
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// DELETE /api/content/horoscopes/:id — admin delete
router.delete(
  "/horoscopes/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const result = await pool.query("DELETE FROM horoscopes WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) throw new HttpError(404, "Horoscope not found");
    ok(res, { id: Number(req.params.id), deleted: true });
  })
);

// ── Zodiac Signs ────────────────────────────────────────────────────────────

// GET /api/content/zodiac-signs — public, list active signs
router.get(
  "/zodiac-signs",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      "SELECT id, name, symbol, date_range, element, ruling_planet, description, image_url FROM zodiac_signs WHERE active = true ORDER BY id ASC"
    );
    ok(res, rows);
  })
);

// GET /api/content/zodiac-signs/all — admin, list all signs (including inactive)
router.get(
  "/zodiac-signs/all",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM zodiac_signs ORDER BY id ASC");
    ok(res, rows);
  })
);

// PUT /api/content/zodiac-signs/:id — admin full update
router.put(
  "/zodiac-signs/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, ZODIAC_FULL_UPDATE_ALLOWED, [req.params.id]);
    const result = await pool.query(
      `UPDATE zodiac_signs SET ${setClause} WHERE id = $${values.length}`,
      values
    );
    if (result.rowCount === 0) throw new HttpError(404, "Zodiac sign not found");
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

// PATCH /api/content/zodiac-signs/:id — admin partial update (description, image_url, active)
router.patch(
  "/zodiac-signs/:id",
  adminRequired,
  asyncHandler(async (req, res) => {
    const { setClause, values } = buildUpdate(req.body, ZODIAC_PARTIAL_UPDATE_ALLOWED, [req.params.id]);
    const result = await pool.query(
      `UPDATE zodiac_signs SET ${setClause} WHERE id = $${values.length}`,
      values
    );
    if (result.rowCount === 0) throw new HttpError(404, "Zodiac sign not found");
    ok(res, { id: Number(req.params.id), updated: true });
  })
);

module.exports = router;
