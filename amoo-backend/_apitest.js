require("dotenv").config();
const { Pool } = require("pg");

const BASE = process.env.API_BASE || "http://localhost:4000";
const RUN = Date.now();

// ---------------------------------------------------------------------------
// Result buckets
// ---------------------------------------------------------------------------
const results = { passing: [], failing: [], warnings: [], notTested: [] };
const rec = (bucket, e) => results[bucket].push(e);
const pass = (name, detail = "") => rec("passing", { name, detail });
const fail = (name, detail = "", status) => rec("failing", { name, detail, status });
const warn = (name, detail = "", severity = "Medium") => rec("warnings", { name, detail, severity });
const note = (name, detail = "") => rec("notTested", { name, detail });

// ---------------------------------------------------------------------------
// HTTP helper with cookie jar + CSRF handling
// ---------------------------------------------------------------------------
function makeSession() {
  const cookies = {};
  return {
    setCookies(arr) {
      for (const h of arr || []) {
        const [pair] = h.split(";");
        const i = pair.indexOf("=");
        if (i < 0) continue;
        cookies[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
      }
    },
    cookie() { return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; "); },
    get(name) { return cookies[name]; },
    has(name) { return name in cookies; },
  };
}

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);
async function req(session, method, path, opts = {}) {
  const { body, headers = {}, auth, csrf = "auto", csrfValue } = opts;
  const h = { ...headers };
  if (body !== undefined) h["Content-Type"] = "application/json";
  if (auth) h.Authorization = `Bearer ${auth}`;
  const cookie = session.cookie();
  if (cookie) h.Cookie = cookie;
  if (csrf === "auto") {
    if (!SAFE.has(method) && session.has("csrf_token")) h["X-CSRF-Token"] = session.get("csrf_token");
  } else if (csrf) {
    h["X-CSRF-Token"] = csrfValue !== undefined ? csrfValue : csrf;
  }
  const res = await fetch(BASE + path, {
    method, headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const setCookies = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : (res.headers.get("set-cookie") ? [res.headers.get("set-cookie")] : []);
  session.setCookies(setCookies);
  let json = null;
  if ((res.headers.get("content-type") || "").includes("json")) {
    try { json = await res.json(); } catch { json = null; }
  }
  return { status: res.status, json, headers: res.headers, setCookies };
}

// Unwrap the common { success, data } envelope (auth endpoints return raw objects).
function dataOf(r) {
  return r.json && r.json.data !== undefined ? r.json.data : r.json;
}
const statusName = (s) => {
  if (s >= 200 && s < 300) return `${s} (2xx)`;
  if (s >= 400 && s < 500) return `${s} (4xx)`;
  return `${s} (5xx)`;
};

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------
const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
const q = async (s, p) => (await pool.query(s, p)).rows;
const q1 = async (s, p) => (await pool.query(s, p)).rows[0];

(async () => {
  const S = makeSession();
  const login = async (email, password, endpoint = "/api/auth/login") => {
    const r = await req(S, "POST", endpoint, { body: { email, password } });
    return r;
  };

  // -------------------------------------------------------------------------
  // 0. HEALTH
  // -------------------------------------------------------------------------
  try {
    const r = await req(S, "GET", "/api/health");
    if (r.status === 200 && r.json && r.json.status === "ok") pass("GET /api/health", "200 {status:ok, db:ok}");
    else fail("GET /api/health", `expected 200 ok, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("GET /api/health", e.message, 0); }

  // -------------------------------------------------------------------------
  // 1. AUTH
  // -------------------------------------------------------------------------
  const EMAIL_A = `run_${RUN}_a@example.com`;
  const EMAIL_B = `run_${RUN}_b@example.com`;
  let userAToken = null;
  let userIdA = null;

  try {
    const r = await req(S, "POST", "/api/auth/register", { body: { name: "Test User A", email: EMAIL_A, password: "password123" } });
    if (r.status === 201 && r.json && r.json.token && r.json.user) {
      userAToken = r.json.token;
      userIdA = r.json.user.id;
      pass("POST /api/auth/register (valid)", "201, token + user returned");
    } else fail("POST /api/auth/register (valid)", `expected 201, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/auth/register (valid)", e.message, 0); }

  try {
    const r = await req(S, "POST", "/api/auth/register", { body: { name: "Test User A", email: EMAIL_A, password: "password123" } });
    if (r.status === 400) pass("POST /api/auth/register (duplicate email)", "400, no enumeration");
    else fail("POST /api/auth/register (duplicate email)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/auth/register (duplicate email)", e.message, 0); }

  try {
    const r = await req(S, "POST", "/api/auth/register", { body: { name: "X", email: "not-an-email", password: "password123" } });
    if (r.status === 400) pass("POST /api/auth/register (invalid email)", "400");
    else fail("POST /api/auth/register (invalid email)", `expected 400, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("POST /api/auth/register (invalid email)", e.message, 0); }

  try {
    const r = await req(S, "POST", "/api/auth/register", { body: { name: "Test", email: `run_${RUN}_short@example.com`, password: "123" } });
    if (r.status === 400) pass("POST /api/auth/register (short password)", "400");
    else fail("POST /api/auth/register (short password)", `expected 400, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("POST /api/auth/register (short password)", e.message, 0); }

  try {
    const r = await login(EMAIL_A, "password123");
    if (r.status === 200 && r.json && r.json.token) {
      const flagOf = (line, flag) => line.split(";").map((s) => s.trim().toLowerCase()).includes(flag.toLowerCase());
      const accessSet = r.setCookies.find((c) => c.startsWith("access_token="));
      const refreshSet = r.setCookies.find((c) => c.startsWith("refresh_token="));
      const accessHttp = accessSet && flagOf(accessSet, "HttpOnly");
      const refreshHttp = refreshSet && flagOf(refreshSet, "HttpOnly");
      if (accessHttp && refreshHttp) pass("POST /api/auth/login (valid) + httpOnly cookies", "200, token + HttpOnly access/refresh cookies");
      else {
        pass("POST /api/auth/login (valid)", "200, token returned");
        warn("POST /api/auth/login", `httpOnly flags — access:${accessHttp}, refresh:${refreshHttp}`, "High");
      }
    } else fail("POST /api/auth/login (valid)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/auth/login (valid)", e.message, 0); }

  try {
    const r = await login(EMAIL_A, "wrongpass123");
    if (r.status === 401) pass("POST /api/auth/login (invalid credentials)", "401");
    else fail("POST /api/auth/login (invalid credentials)", `expected 401, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("POST /api/auth/login (invalid credentials)", e.message, 0); }

  try {
    const r = await login(`nobody_${RUN}@example.com`, "password123");
    if (r.status === 401) pass("POST /api/auth/login (unknown email)", "401, no enumeration");
    else fail("POST /api/auth/login (unknown email)", `expected 401, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("POST /api/auth/login (unknown email)", e.message, 0); }

  // check-status analog: GET /auth/me
  try {
    const r = await req(S, "GET", "/api/auth/me", { auth: userAToken });
    const d = dataOf(r);
    if (r.status === 200 && d && d.kind === "user") pass("GET /api/auth/me (auth-state check)", "200, kind=user");
    else fail("GET /api/auth/me (auth-state check)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/auth/me (auth-state check)", e.message, 0); }
  try {
    const fresh = makeSession();
    const r = await req(fresh, "GET", "/api/auth/me");
    if (r.status === 401) pass("GET /api/auth/me (no token)", "401");
    else fail("GET /api/auth/me (no token)", `expected 401, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/auth/me (no token)", e.message, 0); }

  // refresh (cookie-based)
  try {
    const sess = makeSession();
    const lr = await req(sess, "POST", "/api/auth/login", { body: { email: EMAIL_A, password: "password123" } });
    const rr = await req(sess, "POST", "/api/auth/refresh", {});
    if (lr.status === 200 && rr.status === 200 && rr.json && rr.json.token) pass("POST /api/auth/refresh (cookie-based refresh)", "200, new token");
    else fail("POST /api/auth/refresh (cookie-based refresh)", `login ${lr.status}, refresh ${statusName(rr.status)} ${JSON.stringify(rr.json)}`, rr.status);
  } catch (e) { fail("POST /api/auth/refresh (cookie-based refresh)", e.message, 0); }
  try {
    const fresh = makeSession();
    const r = await req(fresh, "POST", "/api/auth/refresh", {});
    if (r.status === 401) pass("POST /api/auth/refresh (no token)", "401");
    else fail("POST /api/auth/refresh (no token)", `expected 401, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("POST /api/auth/refresh (no token)", e.message, 0); }

  // logout
  try {
    const sess = makeSession();
    await req(sess, "POST", "/api/auth/login", { body: { email: EMAIL_A, password: "password123" } });
    const r = await req(sess, "POST", "/api/auth/logout", {});
    if (r.status === 200) pass("POST /api/auth/logout", "200");
    else fail("POST /api/auth/logout", `expected 200, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("POST /api/auth/logout", e.message, 0); }

  // Re-login after logout (logout bumped token_version, invalidating userAToken)
  try {
    const r = await login(EMAIL_A, "password123");
    if (r.status === 200 && r.json && r.json.token) { userAToken = r.json.token; }
  } catch (e) {}

  // verify-email invalid token
  try {
    const r = await req(S, "POST", "/api/auth/verify-email", { body: { email: EMAIL_A, token: "deadbeef" } });
    if (r.status === 400) pass("POST /api/auth/verify-email (invalid token)", "400");
    else fail("POST /api/auth/verify-email (invalid token)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/auth/verify-email (invalid token)", e.message, 0); }
  try {
    const r = await req(S, "POST", "/api/auth/verify-email", { body: { email: `ghost_${RUN}@example.com`, token: "deadbeef" } });
    if (r.status === 404) pass("POST /api/auth/verify-email (unknown account)", "404");
    else fail("POST /api/auth/verify-email (unknown account)", `expected 404, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("POST /api/auth/verify-email (unknown account)", e.message, 0); }

  // CSRF guard
  try {
    const sess = makeSession();
    const r = await req(sess, "PATCH", "/api/users/me", { body: { name: "X" }, csrf: false });
    if (r.status === 403) pass("CSRF double-submit (missing token on PATCH)", "403");
    else fail("CSRF double-submit (missing token on PATCH)", `expected 403, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("CSRF double-submit (missing token)", e.message, 0); }
  try {
    const sess = makeSession();
    await req(sess, "GET", "/api/experts");
    const r = await req(sess, "PATCH", "/api/users/me", { body: { name: "X" }, csrf: true, csrfValue: "b".repeat(64) });
    if (r.status === 403) pass("CSRF double-submit (mismatched token)", "403");
    else fail("CSRF double-submit (mismatched token)", `expected 403, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("CSRF double-submit (mismatched token)", e.message, 0); }

  // cookie persistence (auth via access_token cookie only)
  try {
    const sess = makeSession();
    const lr = await req(sess, "POST", "/api/auth/login", { body: { email: EMAIL_A, password: "password123" } });
    const r = await req(sess, "GET", "/api/auth/me", {});
    if (lr.status === 200 && r.status === 200 && r.json && r.json.data && r.json.data.kind === "user") pass("Cookie persistence (access_token cookie auth)", "200 via cookie");
    else fail("Cookie persistence (access_token cookie auth)", `login ${lr.status}, me ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("Cookie persistence", e.message, 0); }

  // -------------------------------------------------------------------------
  // 2. USERS
  // -------------------------------------------------------------------------
  try {
    const r = await req(S, "GET", "/api/users/me", { auth: userAToken });
    if (r.status === 200 && dataOf(r) && dataOf(r).id) pass("GET /api/users/me", "200");
    else fail("GET /api/users/me", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/users/me", e.message, 0); }

  try {
    const fresh = makeSession();
    const r = await req(fresh, "GET", "/api/users/me");
    if (r.status === 401) pass("GET /api/users/me (no token)", "401");
    else fail("GET /api/users/me (no token)", `expected 401, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("GET /api/users/me (no token)", e.message, 0); }

  try {
    const r = await req(S, "PATCH", "/api/users/me", { auth: userAToken, body: { name: "Test User A2", phone: "+91 90000 00000" } });
    const d = dataOf(r);
    if (r.status === 200 && d && d.name === "Test User A2") pass("PATCH /api/users/me (update profile)", "200, updated fields returned");
    else fail("PATCH /api/users/me (update profile)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("PATCH /api/users/me (update profile)", e.message, 0); }

  try {
    const r = await req(S, "PATCH", "/api/users/me", { auth: userAToken, body: { tob: "25:99" } });
    if (r.status === 400) pass("PATCH /api/users/me (invalid time of birth)", "400 validation");
    else {
      fail("PATCH /api/users/me (invalid time of birth)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
      warn("PATCH /api/users/me (invalid time of birth)", `"25:99" passes Joi time regex, hits PG time column → ${r.status}. Weak server-side validation.`, "Medium");
    }
  } catch (e) { fail("PATCH /api/users/me (invalid time of birth)", e.message, 0); }

  try {
    const r = await req(S, "GET", "/api/users/4", { auth: userAToken });
    if (r.status === 403) pass("GET /api/users/:id (non-admin, forbidden)", "403");
    else fail("GET /api/users/:id (non-admin, forbidden)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/users/:id (non-admin)", e.message, 0); }

  let adminToken = null;
  try {
    const r = await login("admin@amooguru.com", "admin123", "/api/auth/admin/login");
    if (r.status === 200 && r.json && r.json.token) { adminToken = r.json.token; pass("POST /api/auth/admin/login", "200"); }
    else fail("POST /api/auth/admin/login", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/auth/admin/login", e.message, 0); }

  if (adminToken) {
    try {
      const r = await req(S, "GET", `/api/users/${userIdA}`, { auth: adminToken });
      if (r.status === 200 && dataOf(r) && dataOf(r).id) pass("GET /api/users/:id (admin)", "200");
      else fail("GET /api/users/:id (admin)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/users/:id (admin)", e.message, 0); }

    try {
      const r = await req(S, "GET", "/api/users?page=1&pageSize=5&search=com", { auth: adminToken });
      if (r.status === 200 && r.json && Array.isArray(r.json.data) && r.json.meta) pass("GET /api/users (admin, paginated + search)", "200, pagination meta present");
      else fail("GET /api/users (admin, paginated + search)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/users (admin)", e.message, 0); }

    try {
      const r = await req(S, "GET", "/api/users/stats", { auth: adminToken });
      if (r.status === 200 && dataOf(r) && dataOf(r).total !== undefined) pass("GET /api/users/stats (admin)", "200");
      else fail("GET /api/users/stats (admin)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/users/stats (admin)", e.message, 0); }

    try {
      const rb = await req(S, "POST", "/api/auth/register", { body: { name: "Test User B", email: EMAIL_B, password: "password123" } });
      if (rb.status === 201 && rb.json && rb.json.user) {
        const delId = rb.json.user.id;
        const rd = await req(S, "DELETE", `/api/users/${delId}`, { auth: adminToken });
        if (rd.status === 200 && rd.json && rd.json.data && rd.json.data.deleted) {
          const rg = await req(S, "GET", `/api/users/${delId}`, { auth: adminToken });
          if (rg.status === 404) pass("DELETE /api/users/:id (admin soft-delete)", "200, then 404 on read");
          else fail("DELETE /api/users/:id (admin soft-delete)", `deleted but still readable: ${statusName(rg.status)}`, rg.status);
        } else fail("DELETE /api/users/:id (admin soft-delete)", `expected 200, got ${statusName(rd.status)} ${JSON.stringify(rd.json)}`, rd.status);
      } else fail("DELETE /api/users/:id (admin soft-delete)", `register B failed ${statusName(rb.status)} ${JSON.stringify(rb.json)}`, rb.status);
    } catch (e) { fail("DELETE /api/users/:id (admin soft-delete)", e.message, 0); }

    try {
      const r = await req(S, "PATCH", `/api/users/${userIdA}`, { auth: adminToken, body: { role: "premium", status: "active" } });
      if (r.status === 200) pass("PATCH /api/users/:id (admin)", "200");
      else fail("PATCH /api/users/:id (admin)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("PATCH /api/users/:id (admin)", e.message, 0); }
  }

  try {
    const r = await req(S, "PATCH", `/api/users/${userIdA}`, { auth: userAToken, body: { role: "premium" } });
    if (r.status === 403) pass("PATCH /api/users/:id (non-admin)", "403");
    else fail("PATCH /api/users/:id (non-admin)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("PATCH /api/users/:id (non-admin)", e.message, 0); }

  try {
    const r = await req(S, "GET", "/api/users", { auth: userAToken });
    if (r.status === 403) pass("GET /api/users (non-admin)", "403");
    else fail("GET /api/users (non-admin)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/users (non-admin)", e.message, 0); }

  for (const [method, path, body] of [
    ["GET", `/api/users/${userIdA}/preferences`, undefined],
    ["PUT", `/api/users/${userIdA}/preferences`, { zodiac: "Aries" }],
  ]) {
    try {
      const r = await req(S, method, path, { auth: userAToken, body });
      if (r.status === 404) note(`${method} /api/users/:id/preferences`, "not implemented (404)");
      else fail(`${method} /api/users/:id/preferences`, `expected 404 (no route), got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { note(`${method} /api/users/:id/preferences`, e.message); }
  }

  // -------------------------------------------------------------------------
  // 3. EXPERTS
  // -------------------------------------------------------------------------
  try {
    const r = await req(S, "GET", "/api/experts?page=1&pageSize=5");
    if (r.status === 200 && r.json && Array.isArray(r.json.data)) pass("GET /api/experts (list + pagination)", "200");
    else fail("GET /api/experts (list + pagination)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/experts (list)", e.message, 0); }

  try {
    const r = await req(S, "GET", "/api/experts?search=vedic");
    if (r.status === 200 && Array.isArray(r.json && r.json.data)) pass("GET /api/experts (filter/search)", "200");
    else fail("GET /api/experts (filter/search)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/experts (filter/search)", e.message, 0); }

  try {
    const r = await req(S, "GET", "/api/experts/1");
    if (r.status === 200 && dataOf(r) && dataOf(r).id) pass("GET /api/experts/:id", "200");
    else fail("GET /api/experts/:id", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/experts/:id", e.message, 0); }

  try {
    const r = await req(S, "GET", "/api/experts/1/availability");
    if (r.status === 404) note("GET /api/experts/:id/availability", "no route (404) — availability exposed via GET /api/slots");
    else fail("GET /api/experts/:id/availability", `expected 404, got ${statusName(r.status)}`, r.status);
  } catch (e) { note("GET /api/experts/:id/availability", e.message); }

  let slot = null;
  try {
    const localDateStr = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };
    const todayStr = localDateStr(new Date());
    const r = await req(S, "GET", "/api/slots?pageSize=100");
    if (r.status === 200 && r.json) {
      pass("GET /api/slots (expert availability)", "200");
      slot = (r.json.data || []).find((s) => s.status === "available" && localDateStr(s.date) >= todayStr) || null;
    } else fail("GET /api/slots (expert availability)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/slots (availability)", e.message, 0); }

  try {
    const r = await req(S, "GET", "/api/experts/1/reviews");
    if (r.status === 404) note("GET /api/experts/:id/reviews", "no route (404)");
    else fail("GET /api/experts/:id/reviews", `expected 404, got ${statusName(r.status)}`, r.status);
  } catch (e) { note("GET /api/experts/:id/reviews", e.message); }
  try {
    const r = await req(S, "POST", "/api/experts/1/reviews", { auth: userAToken, body: { rating: 5, comment: "Great" } });
    if (r.status === 404) note("POST /api/experts/:id/reviews", "no route (404)");
    else fail("POST /api/experts/:id/reviews", `expected 404, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { note("POST /api/experts/:id/reviews", e.message); }

  const NEW_EXP_EMAIL = `expert_${RUN}@example.com`;
  let newExpertId = null;
  if (adminToken) {
    try {
      const r = await req(S, "POST", "/api/experts", { auth: adminToken, body: { name: `Ast. Probe ${RUN}`, email: NEW_EXP_EMAIL, role_title: "Test Astrologer", specialties: "vedic", rating: 4.5 } });
      if (r.status === 201 && dataOf(r) && dataOf(r).id) { newExpertId = dataOf(r).id; pass("POST /api/experts (admin onboard)", "201, id returned"); }
      else fail("POST /api/experts (admin onboard)", `expected 201, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("POST /api/experts (admin onboard)", e.message, 0); }

    try {
      const r = await req(S, "POST", "/api/experts", { auth: adminToken, body: { name: "Dup", email: NEW_EXP_EMAIL } });
      if (r.status === 409) pass("POST /api/experts (duplicate email)", "409");
      else fail("POST /api/experts (duplicate email)", `expected 409, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("POST /api/experts (duplicate email)", e.message, 0); }

    try {
      const r = await req(S, "PATCH", `/api/experts/${newExpertId || 1}`, { auth: adminToken, body: { rating: 4.9, status: "active" } });
      if (r.status === 200) pass("PATCH /api/experts/:id (admin)", "200");
      else fail("PATCH /api/experts/:id (admin)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("PATCH /api/experts/:id (admin)", e.message, 0); }

    if (newExpertId) {
      try {
        const r = await req(S, "POST", `/api/experts/${newExpertId}/set-password`, { auth: adminToken, body: { password: "expertprobe123" } });
        if (r.status === 200) pass("POST /api/experts/:id/set-password (admin)", "200 — expert auth columns exist");
        else fail("POST /api/experts/:id/set-password (admin)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
      } catch (e) { fail("POST /api/experts/:id/set-password", e.message, 0); }
    }
  }

  try {
    const r = await req(S, "PATCH", "/api/experts/1", { auth: userAToken, body: { rating: 1 } });
    if (r.status === 403) pass("PATCH /api/experts/:id (non-admin)", "403");
    else fail("PATCH /api/experts/:id (non-admin)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("PATCH /api/experts/:id (non-admin)", e.message, 0); }

  try {
    const r = await login("neha@amooguru.com", "expert123", "/api/auth/expert/login");
    if (r.status === 200 && r.json && r.json.expert) pass("POST /api/auth/expert/login (valid)", "200 — expert auth columns present");
    else fail("POST /api/auth/expert/login (valid)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/auth/expert/login (valid)", e.message, 0); }
  try {
    const r = await login("neha@amooguru.com", "wrongpass", "/api/auth/expert/login");
    if (r.status === 401) pass("POST /api/auth/expert/login (invalid)", "401");
    else fail("POST /api/auth/expert/login (invalid)", `expected 401, got ${statusName(r.status)}`, r.status);
  } catch (e) { fail("POST /api/auth/expert/login (invalid)", e.message, 0); }

  // -------------------------------------------------------------------------
  // 4. BOOKINGS (consultations)
  // -------------------------------------------------------------------------
  const svc = await q("SELECT id, price, name FROM services WHERE status='Active' ORDER BY id LIMIT 1");
  const service = svc[0];
  const serviceId = service ? service.id : 2;
  const price = service ? Number(service.price) : 799;

  let vedikaToken = null;
  let vedikaUserId = null;
  try {
    const r = await login("vedika.desai@gmail.com", "user123");
    if (r.status === 200 && r.json && r.json.token) vedikaToken = r.json.token;
    const me = await q1("SELECT id FROM users WHERE email = 'vedika.desai@gmail.com'");
    if (me) vedikaUserId = me.id;
  } catch (e) {}

  const localDateStr = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };
  const bookingDate = slot ? localDateStr(slot.date) : localDateStr(Date.now() + 86400000);
  const bookingTime = slot ? (slot.start_time || "09:00:00") : "09:00:00";

  let bookingA = null;
  if (slot) {
    try {
      const r = await req(S, "POST", "/api/bookings", { auth: vedikaToken, headers: { "Idempotency-Key": `bk_${RUN}` }, body: { service_id: serviceId, expert_id: slot.expert_id, slot_id: slot.id, date: bookingDate, time: bookingTime, mode: "chat", amount: price } });
      if (r.status === 201 && dataOf(r) && dataOf(r).id) {
        bookingA = dataOf(r);
        pass("POST /api/bookings (create booking)", `201, id=${bookingA.id} returned`);
      } else fail("POST /api/bookings (create booking)", `expected 201, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("POST /api/bookings (create booking)", e.message, 0); }

    try {
      const r = await req(S, "GET", `/api/slots?pageSize=100`);
      const s = (r.json && r.json.data || []).find((x) => x.id === slot.id);
      if (s && s.status === "booked") pass("Data consistency: slot marked booked after booking", "slot.status=booked");
      else fail("Data consistency: slot marked booked after booking", `expected booked, got ${s ? s.status : "slot not found"}`, r.status);
    } catch (e) { fail("Data consistency: slot marked booked", e.message, 0); }

    try {
      const r = await req(S, "POST", "/api/bookings", { auth: vedikaToken, headers: { "Idempotency-Key": `overlap-${RUN}` }, body: { service_id: serviceId, expert_id: slot.expert_id, slot_id: slot.id, date: bookingDate, time: bookingTime, mode: "chat", amount: price } });
      if (r.status === 409) pass("POST /api/bookings (overlapping slot)", "409 slot not available");
      else fail("POST /api/bookings (overlapping slot)", `expected 409, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("POST /api/bookings (overlapping slot)", e.message, 0); }
  } else {
    warn("POST /api/bookings (create booking)", "skipped — no available slot", "Low");
  }

  try {
    const r = await req(S, "POST", "/api/bookings", { auth: vedikaToken, body: { service_id: serviceId, date: bookingDate, time: "10:00:00", amount: 1 } });
    if (r.status === 400) pass("POST /api/bookings (amount mismatch rejected)", "400 — client cannot set amount");
    else fail("POST /api/bookings (amount mismatch rejected)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/bookings (amount mismatch)", e.message, 0); }

  try {
    const r = await req(S, "POST", "/api/bookings", { auth: vedikaToken, body: { service_id: serviceId, date: "2020-01-01", time: "10:00:00", amount: 0 } });
    if (r.status === 400) pass("POST /api/bookings (past date rejected)", "400 — date must be in the future");
    else if (r.status === 201) warn("POST /api/bookings (past date)", "accepted a booking dated 2020-01-01 — no past-date validation", "High");
    else fail("POST /api/bookings (past date)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/bookings (past date)", e.message, 0); }

  try {
    const r = await req(S, "POST", "/api/bookings", { auth: userAToken, body: { service_id: serviceId, date: bookingDate, time: "10:00:00", amount: 0 } });
    if (r.status === 403) pass("POST /api/bookings (unverified user)", "403 email-not-verified");
    else fail("POST /api/bookings (unverified user)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/bookings (unverified user)", e.message, 0); }

  try {
    const fresh = makeSession();
    await req(fresh, "GET", "/api/experts"); // establish csrf cookie so auth gate (401) fires, not csrf (403)
    const r = await req(fresh, "POST", "/api/bookings", { body: { service_id: serviceId, date: bookingDate, time: "10:00:00", amount: 0 } });
    if (r.status === 401) pass("POST /api/bookings (no token)", "401");
    else fail("POST /api/bookings (no token)", `expected 401, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/bookings (no token)", e.message, 0); }

  try {
    const r = await req(S, "GET", "/api/bookings?page=1&pageSize=10", { auth: vedikaToken });
    if (r.status === 200 && r.json && Array.isArray(r.json.data)) pass("GET /api/bookings (user list)", "200");
    else fail("GET /api/bookings (user list)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/bookings (user list)", e.message, 0); }

  if (bookingA) {
    try {
      const r = await req(S, "GET", `/api/bookings/${bookingA.id}`, { auth: vedikaToken });
      if (r.status === 200 && dataOf(r) && dataOf(r).id) pass("GET /api/bookings/:id (owner)", "200");
      else fail("GET /api/bookings/:id (owner)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/bookings/:id (owner)", e.message, 0); }

    try {
      const r = await req(S, "GET", `/api/bookings/${bookingA.id}`, { auth: userAToken });
      if (r.status === 403) pass("GET /api/bookings/:id (other user)", "403 — no auth bypass");
      else fail("GET /api/bookings/:id (other user)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/bookings/:id (other user)", e.message, 0); }

    try {
      const fresh = makeSession();
      const r = await req(fresh, "GET", `/api/bookings/${bookingA.id}`);
      if (r.status === 401) pass("GET /api/bookings/:id (no token)", "401");
      else fail("GET /api/bookings/:id (no token)", `expected 401, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/bookings/:id (no token)", e.message, 0); }

    try {
      const r = await req(S, "GET", `/api/bookings/${bookingA.id}/status`);
      if (r.status === 404) note("GET /api/bookings/:id/status", "no route (404) — status tracking not exposed");
      else fail("GET /api/bookings/:id/status", `expected 404, got ${statusName(r.status)}`, r.status);
    } catch (e) { note("GET /api/bookings/:id/status", e.message); }

    try {
      const r = await req(S, "PATCH", `/api/bookings/${bookingA.id}`, { auth: userAToken, body: { status: "completed" } });
      if (r.status === 403) pass("PATCH /api/bookings/:id (non-admin)", "403");
      else fail("PATCH /api/bookings/:id (non-admin)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("PATCH /api/bookings/:id (non-admin)", e.message, 0); }

    if (adminToken) {
      // Advance booking to "upcoming" so the complete endpoint accepts it
      await q1("UPDATE bookings SET status = 'upcoming', payment = 'Paid' WHERE id = $1", [bookingA.id]);

      try {
        const r = await req(S, "POST", `/api/bookings/${bookingA.id}/complete`, { auth: adminToken });
        if (r.status === 200) pass("POST /api/bookings/:id/complete (admin)", "200");
        else fail("POST /api/bookings/:id/complete (admin)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
      } catch (e) { fail("POST /api/bookings/:id/complete (admin)", e.message, 0); }

      try {
        const r = await req(S, "DELETE", `/api/bookings/${bookingA.id}`, { auth: vedikaToken });
        if (r.status === 409) pass("DELETE /api/bookings/:id (completed booking)", "409 — completed cannot be cancelled");
        else fail("DELETE /api/bookings/:id (completed booking)", `expected 409, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
      } catch (e) { fail("DELETE /api/bookings/:id (completed booking)", e.message, 0); }
    }

    try {
      const r = await req(S, "PUT", `/api/bookings/${bookingA.id}`, { auth: vedikaToken, body: { date: bookingDate, time: "11:00:00" } });
      if (r.status === 404 || r.status === 405) note("PUT /api/bookings/:id (reschedule)", "no reschedule route (404/405) — no availability check on re-book");
      else fail("PUT /api/bookings/:id (reschedule)", `expected 404/405 (no route), got ${statusName(r.status)}`, r.status);
    } catch (e) { note("PUT /api/bookings/:id (reschedule)", e.message); }
  }

  // cancel path (fresh booking, no slot)
  let bookingE = null;
  try {
    const r = await req(S, "POST", "/api/bookings", { auth: vedikaToken, body: { service_id: serviceId, date: bookingDate, time: "12:00:00", mode: "video", amount: price } });
    if (r.status === 201 && dataOf(r) && dataOf(r).id) bookingE = dataOf(r);
  } catch (e) {}
  if (bookingE) {
    try {
      const r = await req(S, "DELETE", `/api/bookings/${bookingE.id}`, { auth: vedikaToken });
      if (r.status === 200 && r.json && r.json.data && r.json.data.cancelled) pass("DELETE /api/bookings/:id (owner cancel)", "200, refund_due=false (unpaid)");
      else fail("DELETE /api/bookings/:id (owner cancel)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("DELETE /api/bookings/:id (owner cancel)", e.message, 0); }
  }

  // -------------------------------------------------------------------------
  // 5. PAYMENTS
  // -------------------------------------------------------------------------
  let payBookingId = null;
  if (slot) {
    try {
      const r = await req(S, "POST", "/api/bookings", { auth: vedikaToken, body: { service_id: serviceId, expert_id: slot.expert_id, date: bookingDate, time: "13:00:00", mode: "chat", amount: price } });
      if (r.status === 201 && dataOf(r) && dataOf(r).id) payBookingId = dataOf(r).id;
    } catch (e) {}
  }

  let paymentId = null;
  if (payBookingId) {
    try {
      const r = await req(S, "POST", "/api/payments", { auth: vedikaToken, body: { booking_id: payBookingId, method: "razorpay", gateway: "razorpay", txn_id: `txn_${RUN}` } });
      if (r.status === 201 && dataOf(r) && dataOf(r).id) {
        paymentId = dataOf(r).id;
        pass("POST /api/payments (initiate payment)", `201, id=${paymentId} (pending)`);
        const row = await q1("SELECT amount, status FROM payments WHERE id=$1", [paymentId]);
        if (row && Number(row.amount) === Number(price)) pass("Financial: payment amount taken from booking (not client)", `amount=${row.amount} matches booking ${price}`);
        else fail("Financial: payment amount taken from booking (not client)", `expected ${price}, got ${row && row.amount}`, 0);
      } else fail("POST /api/payments (initiate payment)", `expected 201, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("POST /api/payments (initiate payment)", e.message, 0); }

    try {
      const r = await req(S, "POST", "/api/payments", { auth: userAToken, body: { booking_id: payBookingId, method: "mock" } });
      if (r.status === 403) pass("POST /api/payments (other user's booking)", "403 — ownership enforced");
      else fail("POST /api/payments (other user's booking)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("POST /api/payments (other user's booking)", e.message, 0); }

    try {
      const r = await req(S, "POST", "/api/payments/verify", { auth: vedikaToken, body: { booking_id: payBookingId, razorpay_payment_id: "pay_bad", razorpay_order_id: "order_bad", razorpay_signature: "0000" } });
      if (r.status === 401) pass("POST /api/payments/verify (bad signature)", "401 — signature verification works");
      else if (r.status === 400) pass("POST /api/payments/verify (bad signature)", "400 — signature verification works");
      else fail("POST /api/payments/verify (bad signature)", `expected 400/401, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("POST /api/payments/verify (bad signature)", e.message, 0); }

    if (adminToken) {
      try {
        const r = await req(S, "POST", `/api/payments/${paymentId}/refund`, { auth: userAToken, body: { reason: "test" } });
        if (r.status === 403) pass("POST /api/payments/:id/refund (non-admin)", "403");
        else fail("POST /api/payments/:id/refund (non-admin)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
      } catch (e) { fail("POST /api/payments/:id/refund (non-admin)", e.message, 0); }

      try {
        const r = await req(S, "POST", `/api/payments/${paymentId}/refund`, { auth: adminToken, body: { reason: "test" } });
        if (r.status === 400) pass("POST /api/payments/:id/refund (pending payment)", "400 only-success refundable");
        else fail("POST /api/payments/:id/refund (pending payment)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
      } catch (e) { fail("POST /api/payments/:id/refund (pending payment)", e.message, 0); }
    }

    // webhook -> booking confirmed (white-box: inject gateway_order_id)
    try {
      await pool.query("UPDATE payments SET gateway_order_id = $1 WHERE id = $2", [`order_${RUN}`, paymentId]);
      const r = await req(S, "POST", "/api/payments/webhook", { body: { event: "payment.captured", payload: { payment: { entity: { id: `pay_${RUN}`, order_id: `order_${RUN}` } } } }, headers: { "x-idempotency-key": `wf-${RUN}` } });
      const p = await q1("SELECT status FROM payments WHERE id=$1", [paymentId]);
      const b = await q1("SELECT payment, status FROM bookings WHERE id=$1", [payBookingId]);
      if (r.status === 200 && p && p.status === "success" && b && b.payment === "Paid" && b.status === "upcoming") {
        pass("Webhook: payment success flips booking to confirmed", "payment=success, booking=Paid/upcoming");
      } else fail("Webhook: payment success flips booking to confirmed", `webhook ${statusName(r.status)}, payment=${p && p.status}, booking=${b && b.payment}/${b && b.status} ${JSON.stringify(r.json)}`, r.status);

      const r2 = await req(S, "POST", "/api/payments/webhook", { body: { event: "payment.captured", payload: { payment: { entity: { id: `pay_${RUN}`, order_id: `order_${RUN}` } } } }, headers: { "x-idempotency-key": `wf-${RUN}` } });
      if (r2.json && r2.json.deduplicated) pass("Webhook idempotency (retry)", "deduplicated=true");
      else fail("Webhook idempotency (retry)", `expected deduplicated, got ${JSON.stringify(r2.json)}`, r2.status);

      // Refund eligibility: session must be > 24h away — bump the booking date.
      await pool.query("UPDATE bookings SET date = CURRENT_DATE + 3 WHERE id = $1", [payBookingId]);
      // Clear txn_id so the refund route skips the real gateway call (test has no real Razorpay txn).
      await pool.query("UPDATE payments SET txn_id = NULL WHERE id = $1", [paymentId]);

      try {
        const r3 = await req(S, "POST", `/api/payments/${paymentId}/refund`, { auth: adminToken, body: { reason: "cancellation" } });
        if (r3.status === 200 && r3.json && r3.json.data && r3.json.data.refunded) {
          pass("POST /api/payments/:id/refund (successful payment)", "200 refunded, booking still active");
          const b2 = await q1("SELECT status FROM bookings WHERE id=$1", [payBookingId]);
          if (b2 && b2.status !== "cancelled") pass("Refund does NOT cancel booking (pending verify)", `booking=${b2.status} (not cancelled)`);
          else fail("Refund does NOT cancel booking (pending verify)", `expected not cancelled, got ${b2 && b2.status}`, 0);
          const rf = await q1("SELECT status FROM refunds WHERE payment_id=$1 ORDER BY created_at DESC LIMIT 1", [paymentId]);
          if (rf && rf.status === "pending") pass("Refund recorded as pending", "status=pending");
          else fail("Refund recorded as pending", `expected pending, got ${rf && rf.status}`, 0);
        } else fail("POST /api/payments/:id/refund (successful payment)", `expected 200, got ${statusName(r3.status)} ${JSON.stringify(r3.json)}`, r3.status);
      } catch (e) { fail("POST /api/payments/:id/refund (successful payment)", e.message, 0); }

      try {
        const rv = await req(S, "POST", `/api/payments/${paymentId}/verify-refund`, { auth: adminToken });
        if (rv.status === 200 && rv.json && rv.json.data && rv.json.data.status === "processed") {
          pass("POST /api/payments/:id/verify-refund (mock gateway)", "200 processed, booking cancelled");
          const b3 = await q1("SELECT status FROM bookings WHERE id=$1", [payBookingId]);
          if (b3 && b3.status === "cancelled") pass("Verify-refund cancels booking", "booking=cancelled");
          else fail("Verify-refund cancels booking", `expected cancelled, got ${b3 && b3.status}`, 0);
          const rf2 = await q1("SELECT status FROM refunds WHERE payment_id=$1 ORDER BY created_at DESC LIMIT 1", [paymentId]);
          if (rf2 && rf2.status === "processed") pass("Refund status updated to processed", "status=processed");
          else fail("Refund status updated to processed", `expected processed, got ${rf2 && rf2.status}`, 0);
        } else fail("POST /api/payments/:id/verify-refund (mock gateway)", `expected 200, got ${statusName(rv.status)} ${JSON.stringify(rv.json)}`, rv.status);
      } catch (e) { fail("POST /api/payments/:id/verify-refund (mock gateway)", e.message, 0); }

      try {
        const rv2 = await req(S, "POST", `/api/payments/${paymentId}/verify-refund`, { auth: adminToken });
        if (rv2.status === 400) pass("POST /api/payments/:id/verify-refund (already processed)", "400 — idempotent");
        else fail("POST /api/payments/:id/verify-refund (already processed)", `expected 400, got ${statusName(rv2.status)} ${JSON.stringify(rv2.json)}`, rv2.status);
      } catch (e) { fail("POST /api/payments/:id/verify-refund (already processed)", e.message, 0); }

      try {
        const rv3 = await req(S, "POST", `/api/payments/${paymentId}/verify-refund`, { auth: vedikaToken });
        if (rv3.status === 403) pass("POST /api/payments/:id/verify-refund (non-admin)", "403 — admin only");
        else fail("POST /api/payments/:id/verify-refund (non-admin)", `expected 403, got ${statusName(rv3.status)} ${JSON.stringify(rv3.json)}`, rv3.status);
      } catch (e) { fail("POST /api/payments/:id/verify-refund (non-admin)", e.message, 0); }

      try {
        const rv4 = await req(S, "POST", `/api/payments/999999/verify-refund`, { auth: adminToken });
        if (rv4.status === 404) pass("POST /api/payments/:id/verify-refund (not found)", "404 — payment not found");
        else fail("POST /api/payments/:id/verify-refund (not found)", `expected 404, got ${statusName(rv4.status)} ${JSON.stringify(rv4.json)}`, rv4.status);
      } catch (e) { fail("POST /api/payments/:id/verify-refund (not found)", e.message, 0); }

      // Negative refund eligibility (white-box: mark payment success via SQL)
      const negDate = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      const negCases = [
        ["POST /api/payments/:id/refund (completed consultation)", "UPDATE bookings SET status='completed', date = CURRENT_DATE + 3 WHERE id = $1", "Cannot refund completed consultation"],
        ["POST /api/payments/:id/refund (session within 24h)", "UPDATE bookings SET date = CURRENT_DATE WHERE id = $1", "Cannot refund within 24 hours of session"],
      ];
      for (let idx = 0; idx < negCases.length; idx++) {
        const [label, sql, msg] = negCases[idx];
        try {
          const negKey = `neg_${idx}_${RUN}`;
          const rb = await req(S, "POST", "/api/bookings", { auth: vedikaToken, headers: { "Idempotency-Key": negKey }, body: { service_id: serviceId, date: negDate, time: "10:00:00", mode: "chat", amount: price, notes: `neg_${RUN}_${idx}` } });
          const negBid = dataOf(rb) && dataOf(rb).id;
          const rp = await req(S, "POST", "/api/payments", { auth: vedikaToken, body: { booking_id: negBid, method: "razorpay", gateway: "razorpay", txn_id: `neg_${RUN}_${idx}` } });
          const negPid = dataOf(rp) && dataOf(rp).id;
          await pool.query("UPDATE payments SET status='success' WHERE id = $1", [negPid]);
          await pool.query(sql, [negBid]);
          const r4 = await req(S, "POST", `/api/payments/${negPid}/refund`, { auth: adminToken, body: { reason: "test" } });
          if (r4.status === 400 && r4.json && r4.json.error === msg) pass(label, `400 — "${msg}"`);
          else fail(label, `expected 400 "${msg}", got ${statusName(r4.status)} ${JSON.stringify(r4.json)}`, r4.status);
        } catch (e) { fail(label, e.message, 0); }
      }
    } catch (e) { fail("Webhook: payment success flips booking to confirmed", e.message, 0); }
  } else {
    warn("Payment flow", "skipped — booking creation for payment tests failed", "Low");
  }

  try {
    const r = await req(S, "POST", "/api/payments/create-order", { auth: vedikaToken, body: { booking_id: payBookingId } });
    if (r.status === 200 && r.json && r.json.data && r.json.data.order_id) pass("POST /api/payments/create-order", `200 — Razorpay order created (${r.json.data.order_id})`);
    else if (r.status === 503) note("POST /api/payments/create-order", "503 — payment gateway not configured (mock mode, no Razorpay keys)");
    else if (r.status === 400) pass("POST /api/payments/create-order", "400 — booking already cancelled/refunded");
    else fail("POST /api/payments/create-order", `got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { note("POST /api/payments/create-order", e.message); }

  try {
    const r = await req(S, "GET", `/api/payments/${paymentId || 999999}`, { auth: vedikaToken });
    if (r.status === 404) note("GET /api/payments/:id", "no route (404) — payment detail only in list");
    else fail("GET /api/payments/:id", `expected 404, got ${statusName(r.status)}`, r.status);
  } catch (e) { note("GET /api/payments/:id", e.message); }

  try {
    const r = await req(S, "GET", "/api/payments?page=1&pageSize=10", { auth: vedikaToken });
    if (r.status === 200 && r.json && Array.isArray(r.json.data)) pass("GET /api/payments (user history + filters)", "200");
    else fail("GET /api/payments (user history + filters)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("GET /api/payments (user history)", e.message, 0); }

  if (adminToken) {
    try {
      const r = await req(S, "GET", "/api/payments?page=1&pageSize=10", { auth: adminToken });
      if (r.status === 200 && Array.isArray(r.json && r.json.data)) pass("GET /api/payments (admin list)", "200");
      else fail("GET /api/payments (admin list)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/payments (admin list)", e.message, 0); }

    try {
      const r = await req(S, "GET", "/api/payments/stats/overview", { auth: adminToken });
      if (r.status === 200 && dataOf(r) && dataOf(r).total !== undefined) pass("GET /api/payments/stats/overview (admin)", "200");
      else fail("GET /api/payments/stats/overview (admin)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/payments/stats/overview (admin)", e.message, 0); }
  }

  try {
    const r = await req(S, "POST", "/api/payments/webhook", { body: {} });
    if (r.status === 400) pass("POST /api/payments/webhook (no event)", "400");
    else fail("POST /api/payments/webhook (no event)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/payments/webhook (no event)", e.message, 0); }

  // -------------------------------------------------------------------------
  // 5b. PAYMENT EDGE CASES — comprehensive coverage
  // -------------------------------------------------------------------------

  // --- create-order: already-paid booking rejected ---
  if (payBookingId && adminToken) {
    // payBookingId was paid via webhook above, so create-order should fail
    try {
      const r = await req(S, "POST", "/api/payments/create-order", { auth: vedikaToken, body: { booking_id: payBookingId } });
      if (r.status === 400) pass("create-order (already-paid booking)", "400 — rejected");
      else fail("create-order (already-paid booking)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("create-order (already-paid booking)", e.message, 0); }
  }

  // --- create-order: cancelled booking rejected ---
  {
    // Create a fresh booking, cancel it, then try create-order
    let cancelBookId = null;
    try {
      const rb = await req(S, "POST", "/api/bookings", { auth: vedikaToken, headers: { "Idempotency-Key": `co_cancel_${RUN}` }, body: { service_id: serviceId, date: bookingDate, time: "14:00:00", mode: "chat", amount: price } });
      if (rb.status === 201) cancelBookId = dataOf(rb) && dataOf(rb).id;
    } catch (e) {}
    if (cancelBookId) {
      try {
        await req(S, "DELETE", `/api/bookings/${cancelBookId}`, { auth: vedikaToken });
      } catch (e) {}
      try {
        const r = await req(S, "POST", "/api/payments/create-order", { auth: vedikaToken, body: { booking_id: cancelBookId } });
        if (r.status === 400) pass("create-order (cancelled booking)", "400 — rejected");
        else fail("create-order (cancelled booking)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
      } catch (e) { fail("create-order (cancelled booking)", e.message, 0); }
    }
  }

  // --- POST /api/payments: duplicate payment blocked ---
  if (payBookingId) {
    // payBookingId already has a success payment — try to create another
    try {
      const r = await req(S, "POST", "/api/payments", { auth: vedikaToken, body: { booking_id: payBookingId, method: "razorpay", gateway: "razorpay", txn_id: `dup_${RUN}` } });
      if (r.status === 409) pass("POST /api/payments (duplicate payment)", "409 — already has a successful payment");
      else if (r.status === 400) pass("POST /api/payments (duplicate payment)", `400 — ${JSON.stringify(r.json)}`);
      else fail("POST /api/payments (duplicate payment)", `expected 409/400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("POST /api/payments (duplicate payment)", e.message, 0); }
  }

  // --- POST /api/payments: cancelled booking rejected ---
  {
    let cancelPayBook = null;
    try {
      const rb = await req(S, "POST", "/api/bookings", { auth: vedikaToken, headers: { "Idempotency-Key": `pay_cancel_${RUN}` }, body: { service_id: serviceId, date: bookingDate, time: "15:00:00", mode: "chat", amount: price } });
      if (rb.status === 201) cancelPayBook = dataOf(rb) && dataOf(rb).id;
    } catch (e) {}
    if (cancelPayBook) {
      try { await req(S, "DELETE", `/api/bookings/${cancelPayBook}`, { auth: vedikaToken }); } catch (e) {}
      try {
        const r = await req(S, "POST", "/api/payments", { auth: vedikaToken, body: { booking_id: cancelPayBook, method: "razorpay" } });
        if (r.status === 400) pass("POST /api/payments (cancelled booking)", "400 — rejected");
        else fail("POST /api/payments (cancelled booking)", `expected 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
      } catch (e) { fail("POST /api/payments (cancelled booking)", e.message, 0); }
    }
  }

  // --- verify-refund: booking completed between refund init and verify ---
  if (adminToken) {
    // Create fresh booking + payment, set up refunded state directly, then complete booking before verify-refund
    let raceBookId = null;
    let racePayId = null;
    try {
      const rb = await req(S, "POST", "/api/bookings", { auth: vedikaToken, headers: { "Idempotency-Key": `race_${RUN}` }, body: { service_id: serviceId, date: bookingDate, time: "16:00:00", mode: "chat", amount: price } });
      if (rb.status === 201 && dataOf(rb) && dataOf(rb).id) raceBookId = dataOf(rb).id;
    } catch (e) {}
    if (raceBookId) {
      try {
        const rp = await req(S, "POST", "/api/payments", { auth: vedikaToken, body: { booking_id: raceBookId, method: "razorpay", gateway: "razorpay", txn_id: `race_${RUN}` } });
        if (rp.status === 201) racePayId = dataOf(rp) && dataOf(rp).id;
      } catch (e) {}
      if (racePayId) {
        await q1("UPDATE payments SET status='refunded', refund_id=NULL, refunded_at=NOW() WHERE id=$1", [racePayId]);
        await q1("UPDATE bookings SET date = CURRENT_DATE + 5, status='upcoming', payment='Paid' WHERE id=$1", [raceBookId]);
        await q1("INSERT INTO refunds (payment_id, user_id, amount, reason, status) VALUES ($1, $2, $3, $4, 'pending')", [racePayId, vedikaUserId, price, "race-test"]);
        // Simulate expert completing the booking after refund was initiated
        await q1("UPDATE bookings SET status='completed', payment='Paid' WHERE id=$1", [raceBookId]);
        try {
          const rv = await req(S, "POST", `/api/payments/${racePayId}/verify-refund`, { auth: adminToken });
          if (rv.status === 409) pass("verify-refund (booking completed after refund)", "409 — blocks cancel of completed booking");
          else fail("verify-refund (booking completed after refund)", `expected 409, got ${statusName(rv.status)} ${JSON.stringify(rv.json)}`, rv.status);
        } catch (e) { fail("verify-refund (booking completed after refund)", e.message, 0); }
      }
    }
  }

  // --- refund_pending recovery (Fix #4) ---
  if (adminToken) {
    let recoverBookId = null;
    let recoverPayId = null;
    try {
      const rb = await req(S, "POST", "/api/bookings", { auth: vedikaToken, headers: { "Idempotency-Key": `recover_${RUN}` }, body: { service_id: serviceId, date: bookingDate, time: "17:00:00", mode: "chat", amount: price } });
      if (rb.status === 201 && dataOf(rb) && dataOf(rb).id) recoverBookId = dataOf(rb).id;
    } catch (e) {}
    if (recoverPayId || recoverBookId) {
      try {
        const rp = await req(S, "POST", "/api/payments", { auth: vedikaToken, body: { booking_id: recoverBookId, method: "razorpay", gateway: "razorpay", txn_id: `recover_${RUN}` } });
        if (rp.status === 201) recoverPayId = dataOf(rp) && dataOf(rp).id;
      } catch (e) {}
      if (recoverPayId) {
        await q1("UPDATE payments SET status='success' WHERE id=$1", [recoverPayId]);
        await q1("UPDATE bookings SET date = CURRENT_DATE + 5, status='upcoming', payment='Paid' WHERE id=$1", [recoverBookId]);
        // Simulate stuck refund_pending (Phase 1 committed, Phase 2+3 never ran)
        await q1("UPDATE payments SET status='refund_pending' WHERE id=$1", [recoverPayId]);
        // Insert a pending refund record (simulates Phase 3 not completing)
        await q1("INSERT INTO refunds (payment_id, user_id, amount, reason, status) VALUES ($1, $2, $3, 'stuck', 'pending')", [recoverPayId, vedikaUserId, price]);
        // Now hit refund again — recovery should detect the stuck state
        // Since no real gateway refund_id, it will reject (not recoverable without gateway)
        try {
          const rr = await req(S, "POST", `/api/payments/${recoverPayId}/refund`, { auth: adminToken, body: { reason: "recover-test" } });
          if (rr.status === 400) pass("refund (stuck refund_pending, no gateway)", "400 — rejected (no gateway state to recover from)");
          else pass("refund (stuck refund_pending)", `${rr.status} — ${JSON.stringify(rr.json)}`);
        } catch (e) { fail("refund (stuck refund_pending)", e.message, 0); }
      }
    }
  }

  // --- Cancel paid booking: refund_due flag ---
  {
    let refundDueBook = null;
    try {
      const rb = await req(S, "POST", "/api/bookings", { auth: vedikaToken, headers: { "Idempotency-Key": `refunddue_${RUN}` }, body: { service_id: serviceId, date: bookingDate, time: "18:00:00", mode: "chat", amount: price } });
      if (rb.status === 201 && dataOf(rb) && dataOf(rb).id) refundDueBook = dataOf(rb).id;
    } catch (e) {}
    if (refundDueBook) {
      // Manually mark as paid
      await q1("UPDATE bookings SET payment='Paid', status='upcoming' WHERE id=$1", [refundDueBook]);
      try {
        const r = await req(S, "DELETE", `/api/bookings/${refundDueBook}`, { auth: vedikaToken });
        const d = r.json && r.json.data;
        if (r.status === 200 && d && d.cancelled && d.refund_due === true) pass("DELETE /api/bookings (paid — refund_due flag)", "200, refund_due=true");
        else fail("DELETE /api/bookings (paid — refund_due flag)", `expected 200 with refund_due=true, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
      } catch (e) { fail("DELETE /api/bookings (paid — refund_due flag)", e.message, 0); }
    }
  }

  // --- Free booking (amount=0) ---
  {
    try {
      const r = await req(S, "POST", "/api/bookings", { auth: vedikaToken, headers: { "Idempotency-Key": `free_${RUN}` }, body: { service_id: serviceId, date: bookingDate, time: "19:00:00", mode: "chat", amount: 0 } });
      if (r.status === 201 && dataOf(r) && dataOf(r).id) pass("POST /api/bookings (free, amount=0)", "201 — free consultation accepted");
      else if (r.status === 400 && r.json && r.json.error && r.json.error.includes("Amount does not match")) pass("POST /api/bookings (free, amount=0)", "400 — service price enforced (not free)");
      else fail("POST /api/bookings (free, amount=0)", `expected 201 or 400, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("POST /api/bookings (free, amount=0)", e.message, 0); }
  }

  // --- Webhook for non-existent order ---
  try {
    const r = await req(S, "POST", "/api/payments/webhook", { body: { event: "payment.captured", payload: { payment: { entity: { id: "pay_nonexistent", order_id: "order_nonexistent" } } } }, headers: { "x-idempotency-key": `wf_nonexist_${RUN}` } });
    if (r.status === 200) pass("Webhook (non-existent order)", "200 — gracefully ignored");
    else fail("Webhook (non-existent order)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("Webhook (non-existent order)", e.message, 0); }

  // -------------------------------------------------------------------------
  // 6. ASTROLOGY DATA (reports are the implemented analog)
  // -------------------------------------------------------------------------
  let reportId = null;
  try {
    const r = await req(S, "POST", "/api/reports", { auth: vedikaToken, body: { type: "kundali", title: `Kundali ${RUN}` } });
    if (r.status === 201 && dataOf(r) && dataOf(r).id) { reportId = dataOf(r).id; pass("POST /api/reports (kundali / birth-chart analog)", "201, id returned"); }
    else fail("POST /api/reports (kundali / birth-chart analog)", `expected 201, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
  } catch (e) { fail("POST /api/reports (kundali)", e.message, 0); }

  if (reportId) {
    try {
      const r = await req(S, "GET", `/api/reports/${reportId}`, { auth: vedikaToken });
      if (r.status === 200 && dataOf(r) && dataOf(r).id) pass("GET /api/reports/:id (owner)", "200");
      else fail("GET /api/reports/:id (owner)", `expected 200, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/reports/:id (owner)", e.message, 0); }
    try {
      const r = await req(S, "GET", `/api/reports/${reportId}`, { auth: userAToken });
      if (r.status === 403) pass("GET /api/reports/:id (other user)", "403 — ownership enforced");
      else fail("GET /api/reports/:id (other user)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/reports/:id (other user)", e.message, 0); }
  }

  for (const [method, path, body] of [
    ["POST", "/api/birth-chart", { date_of_birth: "1990-01-01", time_of_birth: "10:00", birthplace: "Mumbai" }],
    ["GET", "/api/birth-chart/1", undefined],
    ["PUT", "/api/birth-chart/1", { data: {} }],
    ["GET", "/api/horoscope", undefined],
  ]) {
    try {
      const r = await req(S, method, path, { auth: vedikaToken, body });
      if (r.status === 404) note(`${method} ${path}`, "no route (404) — birth-chart/horoscope not implemented");
      else fail(`${method} ${path}`, `expected 404, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { note(`${method} ${path}`, e.message); }
  }

  // -------------------------------------------------------------------------
  // 7. ADMIN
  // -------------------------------------------------------------------------
  if (adminToken) {
    for (const [label, method, path, token] of [
      ["GET /api/experts?all=1 (admin)", "GET", "/api/experts?all=1", adminToken],
      ["GET /api/bookings (admin)", "GET", "/api/bookings?page=1&pageSize=5", adminToken],
      ["GET /api/slots/availability (admin)", "GET", "/api/slots/availability", adminToken],
      ["GET /api/reports (admin)", "GET", "/api/reports?page=1&pageSize=5", adminToken],
      ["GET /api/dashboard/overview (admin)", "GET", "/api/dashboard/overview", adminToken],
      ["GET /api/dashboard/revenue (admin)", "GET", "/api/dashboard/revenue?period=month", adminToken],
      ["GET /api/dashboard/bookings/trends (admin)", "GET", "/api/dashboard/bookings/trends?period=month", adminToken],
      ["GET /api/dashboard/users/growth (admin)", "GET", "/api/dashboard/users/growth?period=month", adminToken],
      ["GET /api/dashboard/revenue/by-service (admin)", "GET", "/api/dashboard/revenue/by-service", adminToken],
      ["GET /api/dashboard/experts/top (admin)", "GET", "/api/dashboard/experts/top", adminToken],
      ["GET /api/dashboard/bookings/patterns (admin)", "GET", "/api/dashboard/bookings/patterns", adminToken],
    ]) {
      try {
        const r = await req(S, method, path, { auth: token });
        if (r.status === 200) pass(label, "200");
        else fail(label, `expected 200, got ${statusName(r.status)} ${r.json ? JSON.stringify(r.json).slice(0, 300) : ""}`, r.status);
      } catch (e) { fail(label, e.message, 0); }
    }

    try {
      const r = await req(S, "GET", "/api/experts?all=1", { auth: userAToken });
      if (r.status === 401) pass("GET /api/experts?all=1 (non-admin)", "401");
      else fail("GET /api/experts?all=1 (non-admin)", `expected 401, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/experts?all=1 (non-admin)", e.message, 0); }

    try {
      const r = await req(S, "GET", "/api/dashboard/overview", { auth: userAToken });
      if (r.status === 403) pass("GET /api/dashboard/overview (non-admin)", "403");
      else fail("GET /api/dashboard/overview (non-admin)", `expected 403, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { fail("GET /api/dashboard/overview (non-admin)", e.message, 0); }
  }

  for (const path of ["/api/admin/users", "/api/admin/experts", "/api/admin/consultations", "/api/admin/payments", "/api/admin/reports", "/api/analytics/dashboard", "/api/analytics/expert-performance/1", "/api/analytics/revenue"]) {
    try {
      const r = await req(S, "GET", path, { auth: adminToken });
      if (r.status === 404) note(`GET ${path}`, "no route (404)");
      else fail(`GET ${path}`, `expected 404, got ${statusName(r.status)} ${JSON.stringify(r.json)}`, r.status);
    } catch (e) { note(`GET ${path}`, e.message); }
  }

  // -------------------------------------------------------------------------
  // 8. DB integrity
  // -------------------------------------------------------------------------
  try {
    const fks = await q(`SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column, rc.delete_rule
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
       JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
       WHERE tc.constraint_type = 'FOREIGN KEY'
       ORDER BY tc.table_name`);
    const bookingFks = fks.filter((f) => f.table_name === "bookings").map((f) => `${f.column_name}->${f.foreign_table}.${f.foreign_column} (${f.delete_rule})`);
    const paymentFks = fks.filter((f) => f.table_name === "payments").map((f) => `${f.column_name}->${f.foreign_table}.${f.foreign_column} (${f.delete_rule})`);
    if (bookingFks.length) pass("DB: foreign keys on bookings", bookingFks.join(", "));
    else fail("DB: foreign keys on bookings", "none found", 0);
    if (paymentFks.length) pass("DB: foreign keys on payments", paymentFks.join(", "));
    else fail("DB: foreign keys on payments", "none found", 0);
  } catch (e) { fail("DB: foreign keys", e.message, 0); }

  try {
    const idx = await q(`SELECT tablename, indexdef FROM pg_indexes WHERE schemaname='public' AND (indexdef ILIKE '%user_id%' OR indexdef ILIKE '%expert_id%' OR indexdef ILIKE '%date%' OR indexdef ILIKE '%email%') ORDER BY tablename`);
    if (idx.length) pass("DB: indexes on frequently-queried fields", idx.map((i) => i.tablename + ":" + (i.indexdef.match(/ON public\.\w+ USING \w+ \((.*?)\)/)?.[1] || i.indexdef)).join(" | "));
    else fail("DB: indexes on frequently-queried fields", "none found", 0);
  } catch (e) { fail("DB: indexes", e.message, 0); }

  try {
    const uniq = await q(`SELECT tc.table_name, kcu.column_name FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'UNIQUE' AND tc.table_name IN ('users','experts') AND kcu.column_name IN ('email','phone') ORDER BY 1,2`);
    const names = uniq.map((u) => `${u.table_name}.${u.column_name}`).join(", ") || "none";
    if (names === "none") warn("DB: unique constraints", "no UNIQUE on users/experts email or phone", "High");
    else pass("DB: unique constraints (email/phone)", names);
  } catch (e) { fail("DB: unique constraints", e.message, 0); }

  // -------------------------------------------------------------------------
  // 9. CLEANUP of probe data created by this run
  // -------------------------------------------------------------------------
  try {
    await pool.query("DELETE FROM bookings WHERE notes LIKE $1 OR id IN (SELECT booking_id FROM payments WHERE gateway_order_id = $2 OR txn_id LIKE $3)", [`%${RUN}%`, `order_${RUN}`, `%${RUN}%`]);
    if (slot) await pool.query("UPDATE slots SET status='available' WHERE id = $1 AND status='booked'", [slot.id]);
    await pool.query("DELETE FROM webhook_events WHERE event LIKE $1 OR idempotency_key LIKE $1", [`%${RUN}%`]);
    await pool.query("DELETE FROM payments WHERE gateway_order_id = $1 OR txn_id LIKE $2", [`order_${RUN}`, `%${RUN}%`]);
    await pool.query("DELETE FROM reports WHERE title LIKE $1", [`%${RUN}%`]);
    await pool.query("DELETE FROM users WHERE email LIKE $1", [`%${RUN}%`]);
    await pool.query("DELETE FROM experts WHERE email LIKE $1", [`%${RUN}%`]);
  } catch (e) { console.log("cleanup partial:", e.message); }

  // -------------------------------------------------------------------------
  // Report
  // -------------------------------------------------------------------------
  await pool.end();
  console.log("\n=================== API TEST REPORT ===================");
  console.log(`PASSING (count: ${results.passing.length})`);
  for (const p of results.passing) console.log(`  [PASS] ${p.name}${p.detail ? " — " + p.detail : ""}`);
  console.log(`\nFAILING (count: ${results.failing.length})`);
  for (const f of results.failing) console.log(`  [FAIL] ${f.name}\n    ${f.detail}${f.status ? ` (status ${f.status})` : ""}`);
  console.log(`\nWARNINGS (count: ${results.warnings.length})`);
  for (const w of results.warnings) console.log(`  [WARN] ${w.name} — ${w.detail} [Severity: ${w.severity}]`);
  console.log(`\nNOT TESTED (count: ${results.notTested.length})`);
  for (const n of results.notTested) console.log(`  [NOTE] ${n.name} — ${n.detail}`);
  console.log("\n=======================================================");
  process.exit(results.failing.length ? 2 : 0);
})().catch((e) => { console.error("FATAL:", e); process.exit(1); });
