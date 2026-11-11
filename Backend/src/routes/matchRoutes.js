// src/routes/matchRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { findMatchesForUser } = require("../services/match.service");

router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const matches = await findMatchesForUser(req.userId, limit);
    res.json({ count: matches.length, matches });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
