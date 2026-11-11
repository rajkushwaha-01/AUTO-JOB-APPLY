// add to src/routes/autofill.routes.js (replace Puppeteer version)
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const User = require("../modules/user.model");

// GET /api/autofill/me — returns flat profile data for the extension to use
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user?.resume) {
      return res.status(400).json({ message: "No resume found" });
    }

    const r = user.resume;
    res.json({
      firstName: r.fullName?.split(" ")[0] || "",
      lastName: r.fullName?.split(" ").slice(1).join(" ") || "",
      email: r.email || user.email,
      phone: r.phone || "",
      linkedin: r.linkedin || "",
      github: r.github || "",
      location: r.location || "",
      skills: r.skills || [],
      education: r.education?.[0] || {},
      latestExperience: r.experience?.[0] || {},
      summary: r.summary || ""
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;