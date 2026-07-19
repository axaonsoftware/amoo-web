// Centralized, consistent API response helpers.
// Every route should respond through these so the client gets a uniform shape.

function ok(res, data, meta) {
  const body = { success: true, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(200).json(body);
}

function created(res, data) {
  return res.status(201).json({ success: true, data });
}

function noContent(res) {
  return res.status(204).end();
}

function paginated(res, rows, { page, pageSize, total }) {
  return res.status(200).json({
    success: true,
    data: rows,
    meta: {
      page: Number(page),
      pageSize: Number(pageSize),
      total: Number(total),
      totalPages: Math.max(1, Math.ceil(Number(total) / Number(pageSize))),
    },
  });
}

// Send an unwrapped object (used by auth endpoints to preserve the
// { token, user } contract the frontend expects).
function raw(res, status, obj) {
  return res.status(status).json(obj);
}

function fail(res, status, message, details) {
  const body = { success: false, error: message };
  if (details !== undefined) body.details = details;
  return res.status(status).json(body);
}

// Assert a row exists, otherwise 404. Returns true if handled (response sent).
function assertFound(res, row) {
  if (!row) {
    fail(res, 404, "Resource not found");
    return true;
  }
  return false;
}

// Parse ?page & ?limit (or ?pageSize) query params into safe integers.
function parsePagination(query = {}) {
  let page = parseInt(query.page, 10);
  let pageSize = parseInt(query.limit || query.pageSize, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 20;
  if (pageSize > 100) pageSize = 100; // hard cap
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

module.exports = {
  ok,
  created,
  noContent,
  paginated,
  raw,
  fail,
  assertFound,
  parsePagination,
};
