const express = require("express");
const router = express.Router();
const { register, login, logout, getMe } = require("../controllers/authController");
const verifyToken = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerValidator, loginValidator } = require("../validators/authValidators");

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);

module.exports = router; 