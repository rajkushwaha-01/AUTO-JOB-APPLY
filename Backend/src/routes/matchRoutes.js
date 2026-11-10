// src/routes/matchRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { findMatchesForUser } = require("../services/ingest.service");

router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const matches = await findMatchesForUser(req.userId);
    res.json({ count: matches.length, matches });
  } catch (err) {
    next(err);
  }
});

module.exports = router;