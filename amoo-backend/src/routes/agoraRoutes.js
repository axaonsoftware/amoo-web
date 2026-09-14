const express = require("express");

const { generateToken } = require("../controllers/agoraController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.post("/token", authRequired, generateToken);

module.exports = router;