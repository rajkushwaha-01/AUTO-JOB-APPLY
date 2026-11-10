// src/routes/ingestRoutes.js
const express = require("express");
const router = express.Router();
const { ingestFromGreenhouse } = require("../services/ingest.service");

router.post("/run", async (req, res, next) => {
  try {
    const jobsPerCompany = req.body?.jobsPerCompany; // optional override, e.g. { "jobsPerCompany": 20 }
    const result = await ingestFromGreenhouse(jobsPerCompany);
    res.json({ message: "Ingestion complete", ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;