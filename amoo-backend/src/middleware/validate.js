const Joi = require("joi");

// Allow empty-string-or-absent helper
const optionalString = Joi.string().allow("").allow(null);
const optionalNumber = Joi.number().allow(null);

// A stored file reference: either an "/uploads/<name>" path produced by
// config/storage.js, or an absolute http(s) URL when S3 is enabled.
//
// SECURITY: reports.file_url is written straight into the download handler's
// path resolution. utils/paths.js refuses anything that escapes the uploads
// directory, but rejecting traversal at the edge as well means a bad value
// never reaches the database in the first place. No "..", no backslashes, no
// nested directories — filenames here are always flat and server-generated.
const fileRef = Joi.alternatives()
  .try(
    Joi.string().pattern(/^\/uploads\/[A-Za-z0-9][A-Za-z0-9._-]{0,250}$/),
    Joi.string().uri({ scheme: ["http", "https"] }).max(512)
  )
  .allow("")
  .allow(null)
  .messages({
    "alternatives.match":
      "file_url must be an /uploads/<filename> path or an http(s) URL",
  });

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().required(),
    phone: optionalString.max(20),
    password: Joi.string().min(8).max(128).required(),
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  adminLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  expertLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refresh: Joi.object({
    refresh_token: optionalString,
  }),

  chatConversation: Joi.object({
    participant_id: Joi.number().integer().positive().required(),
  }),

  chatMessage: Joi.object({
    content: Joi.string().min(1).max(5000).required(),
  }),

  couponValidate: Joi.object({
    code: Joi.string().min(3).max(30).required(),
    amount: optionalNumber.min(0),
  }),

  couponApply: Joi.object({
    code: Joi.string().min(3).max(30).required(),
    // Accepted for backwards compatibility but ignored: /apply discounts the
    // booking's own stored amount, never a client-supplied figure.
    amount: optionalNumber.min(0),
    booking_id: Joi.number().integer().positive().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    password: Joi.string().min(8).max(128).required(),
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    password: Joi.string().min(8).max(128).required(),
  }),

  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
  }),

  // NOTE: `email` is deliberately absent. Changing the address that identifies
  // the account must go through a re-verification flow, not a profile PATCH.
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(120),
    phone: optionalString.max(20),
    avatar: optionalString.max(512),
    dob: Joi.date().iso(),
    tob: Joi.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    birthplace: optionalString.max(255),
    gender: optionalString.max(20),
    language: optionalString.max(40),
    country: optionalString.max(80),
    state: optionalString.max(80),
    city: optionalString.max(80),
    address: optionalString.max(255),
  }),

  // SECURITY: `payment` is deliberately NOT accepted here. A booking always
  // starts unpaid; only /api/payments/verify and the gateway webhook may mark
  // one Paid. A client-supplied `payment` key is silently stripped.
  booking: Joi.object({
    service_id: Joi.number().integer().positive().required(),
    expert_id: optionalNumber.integer().positive(),
    slot_id: optionalNumber.integer().positive(),
    date: Joi.date().iso().required(),
    time: Joi.string().required(),
    mode: Joi.string().valid("chat", "video", "in-person", "").allow(null),
    amount: Joi.number().min(0).required(),
    method: optionalString.max(40),
    notes: optionalString.max(2000),
  }),

  bookingUpdate: Joi.object({
    status: Joi.string().valid("upcoming", "completed", "cancelled", "pending-payment"),
    payment: Joi.string().valid("Paid", "Pending"),
    expert_id: optionalNumber.integer().positive(),
    notes: optionalString.max(2000),
  }),

  payment: Joi.object({
    booking_id: optionalNumber.integer().positive(),
    subscription_id: optionalNumber.integer().positive(),
    amount: Joi.number().min(0),
    method: optionalString.max(40),
    status: Joi.string().valid("success", "pending", "failed", "refunded").default("pending"),
    txn_id: optionalString.max(120),
    gateway: optionalString.max(40),
  }),

  refund: Joi.object({
    reason: optionalString.max(255),
  }),

  service: Joi.object({
    name: Joi.string().max(160).required(),
    sub: optionalString.max(255),
    img: optionalString.max(512),
    category: Joi.string()
      .valid("Numerology", "Tarot", "Astrology", "Healing", "Vastu", "AI Services", "Spiritual")
      .required(),
    type: Joi.string().valid("Report", "Consultation", "Chat").required(),
    price: Joi.number().min(0).required(),
    duration: optionalString.max(40),
    status: Joi.string().valid("Active", "Inactive"),
  }),

  // PATCH variant — see expertUpdate.
  serviceUpdate: Joi.object({
    name: Joi.string().max(160),
    sub: optionalString.max(255),
    img: optionalString.max(512),
    category: Joi.string().valid(
      "Numerology", "Tarot", "Astrology", "Healing", "Vastu", "AI Services", "Spiritual"
    ),
    type: Joi.string().valid("Report", "Consultation", "Chat"),
    price: Joi.number().min(0),
    duration: optionalString.max(40),
    status: Joi.string().valid("Active", "Inactive"),
  }),

  setExpertPassword: Joi.object({
    password: Joi.string().min(8).max(128).required(),
  }),

  expert: Joi.object({
    name: Joi.string().max(120).required(),
    email: Joi.string().email().required(),
    phone: optionalString.max(20),
    avatar: optionalString.max(512),
    role_title: optionalString.max(120),
    bio: optionalString.max(4000),
    specialties: optionalString.max(255),
    rating: Joi.number().min(0).max(5),
    status: Joi.string().valid("active", "inactive"),
  }),

  // PATCH variant — nothing required, so a partial update does not have to
  // resend name+email. Without this the route ran with NO validation at all:
  // buildUpdate() whitelists column names (so it was never injectable) but
  // nothing checked types, lengths or enum membership, so a PATCH could push a
  // 10 MB string at a VARCHAR(120) or set rating to 999.
  expertUpdate: Joi.object({
    name: Joi.string().max(120),
    email: Joi.string().email(),
    phone: optionalString.max(20),
    avatar: optionalString.max(512),
    role_title: optionalString.max(120),
    bio: optionalString.max(4000),
    specialties: optionalString.max(255),
    rating: Joi.number().min(0).max(5),
    status: Joi.string().valid("active", "inactive"),
  }),

  slot: Joi.object({
    expert_id: Joi.number().integer().positive().required(),
    date: Joi.date().iso().required(),
    start_time: Joi.string().required(),
    end_time: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
      .allow("")
      .allow(null)
      .messages({ "string.pattern.base": "end_time must be a valid time (HH:MM or HH:MM:SS)" }),
    status: Joi.string().valid("available", "booked", "blocked").default("available"),
  }),

  package: Joi.object({
    name: Joi.string().max(160).required(),
    description: optionalString.max(2000),
    price: Joi.number().min(0).required(),
    duration_days: optionalNumber.integer().positive(),
    status: Joi.string().valid("Active", "Inactive"),
  }),

  // PATCH variant — see expertUpdate.
  packageUpdate: Joi.object({
    name: Joi.string().max(160),
    description: optionalString.max(2000),
    price: Joi.number().min(0),
    duration_days: optionalNumber.integer().positive(),
    status: Joi.string().valid("Active", "Inactive"),
  }),

  // `auto_renew` was read by the POST /api/subscriptions handler but was NOT
  // declared here, and validate() runs with stripUnknown:true — so Joi deleted
  // the key before the handler saw it and the column was always stored as 0.
  // A user could never enable auto-renew.
  subscription: Joi.object({
    package_id: optionalNumber.integer().positive(),
    plan_name: optionalString.max(120),
    duration_days: optionalNumber.integer().positive(),
    auto_renew: Joi.boolean().default(false),
  }),

  // Admin PATCH on a subscription. `expires_at` is an ISO datetime; `status`
  // must match the ENUM exactly or MySQL silently coerces it to ''.
  subscriptionUpdate: Joi.object({
    status: Joi.string().valid("active", "expired", "cancelled", "pending-payment"),
    auto_renew: Joi.boolean(),
    plan_name: Joi.string().max(120),
    expires_at: Joi.date().iso(),
  }),

  slotUpdate: Joi.object({
    status: Joi.string().valid("available", "booked", "blocked").required(),
  }),

  testimonialUpdate: Joi.object({
    status: Joi.string().valid("Active", "Inactive"),
    comment: Joi.string().min(2).max(2000),
    rating: Joi.number().integer().min(1).max(5),
    name: Joi.string().max(120),
  }),

  report: Joi.object({
    // Optional here because two routes share this schema: POST /api/reports
    // ignores it and uses the caller's own id, while POST /api/reports/admin
    // requires it. Without the key, stripUnknown deleted it before the admin
    // handler could ever see it, so that route could only ever return 400.
    user_id: optionalNumber.integer().positive(),
    service_id: optionalNumber.integer().positive(),
    type: optionalString.max(60),
    title: Joi.string().max(200).required(),
    content: Joi.string().max(65535).allow("").allow(null),
    file_url: fileRef,
  }),

  reportUpdate: Joi.object({
    status: Joi.string().valid("pending", "ready", "rejected"),
    title: Joi.string().max(200),
    content: Joi.string().max(65535).allow("").allow(null),
    file_url: fileRef,
  }),

  contact: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().required(),
    phone: optionalString.max(20),
    subject: optionalString.max(200),
    message: Joi.string().min(5).max(4000).required(),
  }),

  contactUpdate: Joi.object({
    status: Joi.string().valid("new", "replied", "closed"),
    reply: optionalString.max(4000),
  }),

  // SECURITY: `user_id`, `name` and `avatar` are deliberately NOT accepted.
  // They are read from the authenticated account in the handler — otherwise a
  // testimonial could be attributed to any real user.
  testimonial: Joi.object({
    comment: Joi.string().min(2).max(2000).required(),
    rating: Joi.number().min(1).max(5).default(5),
  }),

  notification: Joi.object({
    user_id: optionalNumber.integer().positive(),
    title: Joi.string().max(200).required(),
    message: Joi.string().max(2000).required(),
    type: optionalString.max(40).default("info"),
  }),

  walletTxn: Joi.object({
    user_id: optionalNumber.integer().positive(),
    amount: Joi.number().positive().required(),
    reason: optionalString.max(120),
    ref: optionalString.max(64),
  }),

  walletTransfer: Joi.object({
    to_user_id: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().required(),
    note: optionalString.max(120),
  }),

  walletAdjust: Joi.object({
    user_id: Joi.number().integer().positive().required(),
    amount: Joi.number().required(),
    reason: optionalString.max(120),
  }),

  blog: Joi.object({
    slug: Joi.string().max(255).required(),
    title: Joi.string().max(500).required(),
    excerpt: Joi.string().max(4000).allow("").allow(null),
    content: Joi.string().max(65535).allow("").allow(null),
    category: optionalString.max(100),
    image: optionalString.max(500),
    author: optionalString.max(255),
    author_avatar: optionalString.max(500),
    read_time: optionalString.max(50),
    status: Joi.string().valid("draft", "published"),
  }),

  // PATCH variant: nothing required, and no defaults — a default would silently
  // rewrite a field the caller never mentioned.
  blogUpdate: Joi.object({
    slug: Joi.string().max(255),
    title: Joi.string().max(500),
    excerpt: Joi.string().max(4000).allow("").allow(null),
    content: Joi.string().max(65535).allow("").allow(null),
    category: optionalString.max(100),
    image: optionalString.max(500),
    author: optionalString.max(255),
    author_avatar: optionalString.max(500),
    read_time: optionalString.max(50),
    status: Joi.string().valid("draft", "published"),
  }),

  faq: Joi.object({
    question: Joi.string().max(500).required(),
    answer: Joi.string().required(),
    category: Joi.string().max(100).default("General"),
    sort_order: Joi.number().integer().min(0).default(0),
    active: Joi.boolean().default(true),
  }),

  // PATCH variant — see blogUpdate above.
  faqUpdate: Joi.object({
    question: Joi.string().max(500),
    answer: Joi.string(),
    category: Joi.string().max(100),
    sort_order: Joi.number().integer().min(0),
    active: Joi.boolean(),
  }),

  userUpdateAdmin: Joi.object({
    name: Joi.string().min(2).max(120),
    email: Joi.string().email(),
    phone: optionalString.max(20),
    role: Joi.string().valid("free", "premium", "consultant"),
    status: Joi.string().valid("active", "blocked", "pending"),
    verified: Joi.boolean(),
  }),

  // Frontend activity beacon. This route had no validation at all, which
  // mattered little while every call was being rejected by the CSRF guard — but
  // now that it actually receives traffic, an unbounded `action_details` object
  // would be serialised straight into audit_log.meta (a JSON column) on every
  // page view. `action` is capped to the column width (VARCHAR(60)).
  activityLog: Joi.object({
    action: Joi.string().min(1).max(60).required(),
    action_details: Joi.object().max(30).unknown(true).default({}),
    page_or_route: optionalString.max(255),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    pageSize: Joi.number().integer().min(1).max(100),
    search: optionalString.max(120),
    status: optionalString.max(40),
    type: optionalString.max(60),
    category: optionalString.max(60),
    date_from: optionalString.max(40),
    date_to: optionalString.max(40),
    expert_id: optionalNumber.integer().positive(),
    user_id: optionalNumber.integer().positive(),
    method: optionalString.max(40),
    role: optionalString.max(20),
    service_id: optionalNumber.integer().positive(),
    // Slots
    date: optionalString.max(20),
    // Dashboard
    period: Joi.string().valid("day", "week", "month", "year"),
    from: optionalString.max(40),
    to: optionalString.max(40),
    // Wallet
    threshold: optionalNumber.min(0),
    // Audit
    actor_id: optionalNumber.integer().positive(),
    actor_type: optionalString.max(20),
    action: optionalString.max(60),
    entity: optionalString.max(60),
    // Coupons
    active: Joi.boolean(),
  }),
};

// Validate req.body with a named schema (or pass a Joi schema directly).
// Strips unknown keys.
function validate(schemaOrName, _unused, inlineSchema) {
  const schema = inlineSchema || schemas[schemaOrName];
  if (!schema) throw new Error(`Unknown validation schema: ${schemaOrName}`);
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }
    req.body = value;
    next();
  };
}

// Validate query string (does not strip, just checks).
function validateQuery(req, res, next) {
  const { error, value } = schemas.query.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid query parameters",
      details: error.details.map((d) => d.message),
    });
  }
  req.query = value;
  next();
}

module.exports = { schemas, validate, validateQuery };
