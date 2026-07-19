const Joi = require("joi");

// Reusable schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow("").max(20),
    password: Joi.string().min(6).required(),
  }),
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  booking: Joi.object({
    service_id: Joi.number().integer().required(),
    expert_id: Joi.number().integer().allow(null),
    date: Joi.date().iso().required(),
    time: Joi.string().required(),
    mode: Joi.string().allow(""),
    amount: Joi.number().min(0),
    payment: Joi.string().valid("Paid", "Pending"),
    method: Joi.string().allow(""),
  }),
  payment: Joi.object({
    booking_id: Joi.number().integer().allow(null),
    amount: Joi.number().min(0).required(),
    method: Joi.string().allow(""),
    status: Joi.string().valid("success", "pending", "failed", "refunded"),
    txn_id: Joi.string().allow(""),
  }),
  service: Joi.object({
    name: Joi.string().required(),
    sub: Joi.string().allow(""),
    img: Joi.string().allow(""),
    category: Joi.string().valid("Numerology", "Tarot", "Astrology", "Healing", "Vastu", "AI Services", "Spiritual").required(),
    type: Joi.string().valid("Report", "Consultation", "Chat").required(),
    price: Joi.number().min(0).required(),
    duration: Joi.string().allow(""),
    status: Joi.string().valid("Active", "Inactive"),
  }),
  contact: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow("").max(20),
    subject: Joi.string().allow("").max(200),
    message: Joi.string().min(5).required(),
  }),
  report: Joi.object({
    service_id: Joi.number().integer().allow(null),
    type: Joi.string().allow(""),
    title: Joi.string().required(),
    content: Joi.string().allow(""),
    file_url: Joi.string().allow(""),
  }),
  package: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(""),
    price: Joi.number().min(0).required(),
    duration_days: Joi.number().integer().allow(null),
    status: Joi.string().valid("Active", "Inactive"),
  }),
  slot: Joi.object({
    expert_id: Joi.number().integer().required(),
    date: Joi.date().iso().required(),
    start_time: Joi.string().required(),
    end_time: Joi.string().allow(""),
    status: Joi.string().valid("available", "booked", "blocked"),
  }),
  testimonial: Joi.object({
    name: Joi.string().allow(""),
    comment: Joi.string().min(2).required(),
    rating: Joi.number().min(1).max(5),
    user_id: Joi.number().integer().allow(null),
    avatar: Joi.string().allow(""),
  }),
};

function validate(bodySchema) {
  return (req, res, next) => {
    const { error, value } = bodySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }
    req.body = value;
    next();
  };
}

module.exports = { schemas, validate };
