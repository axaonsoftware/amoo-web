function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function genBookingRef() {
  const n = 2000 + Math.floor(Math.random() * 8000);
  return `BOOK-${n}`;
}

module.exports = { asyncHandler, genBookingRef };
