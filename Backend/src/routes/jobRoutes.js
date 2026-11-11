const express = require("express");
const router = express.Router();
const Job = require("../modules/job.model");

// GET /api/jobs
// Returns all open jobs from MongoDB with optional search, company, location, pagination
router.get("/", async (req, res, next) => {
  try {
    const { search, company, location, limit = 200, page = 1 } = req.query;
    const query = { status: "open" };

    if (company && company !== "all") {
      query.company = new RegExp(company, "i");
    }

    if (location && location !== "all") {
      query.location = new RegExp(location, "i");
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { company: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
      ];
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 200, 500);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select("-embedding -contentHash -__v")
        .sort({ createdAt: -1, fetchedAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Job.countDocuments(query),
    ]);

    const formattedJobs = jobs.map((job) => ({
      jobId: String(job._id),
      title: job.title,
      company: job.company,
      location: job.location,
      applyUrl: job.applyUrl,
      description: job.description,
      source: job.source,
      fetchedAt: job.fetchedAt,
      createdAt: job.createdAt,
    }));

    res.json({
      total,
      count: formattedJobs.length,
      page: parsedPage,
      jobs: formattedJobs,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .select("-embedding -contentHash -__v")
      .lean();
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json({
      job: {
        jobId: String(job._id),
        ...job,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

