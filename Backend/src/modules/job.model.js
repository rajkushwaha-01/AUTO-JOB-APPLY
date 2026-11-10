const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    source: { type: String, required: true }, // "greenhouse" | "lever" | "adzuna"
    externalId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    description: { type: String },
    location: { type: String, trim: true },
    applyUrl: { type: String },
    contentHash: { type: String },
    embedding: { type: [Number], default: [] },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

jobSchema.index({ source: 1, externalId: 1 }, { unique: true });
jobSchema.index({ fetchedAt: -1 });

module.exports = mongoose.model("Job", jobSchema);