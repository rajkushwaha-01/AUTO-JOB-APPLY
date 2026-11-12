// src/services/match.service.js
const crypto = require("crypto");
const User = require("../modules/user.model");
const Job = require("../modules/job.model");
const { generateEmbedding } = require("./embedding.service");

const hashText = (text) => crypto.createHash("sha256").update(text).digest("hex");

const cosineSimilarity = (a, b) => {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const buildResumeMatchText = (resume) => {
  const skills = resume.skills?.join(", ") || "";
  const projectText = resume.projects?.map((p) => `${p.name}: ${p.description}`).join(". ") || "";
  const expText = resume.experience?.map((e) => `${e.title} at ${e.company}: ${e.bullets?.join(". ")}`).join(". ") || "";
  return `${resume.summary || ""}. Skills: ${skills}. ${expText}. ${projectText}`;
};

// Patterns that signal non-technical / non-engineering positions
const NON_ENGINEERING_TITLE_PATTERNS = [
  "account executive",
  "business development",
  "sales representative",
  "recruiter",
  "human resources",
  "benefits analyst",
  "talent acquisition",
];

const isLikelyRelevantTitle = (jobTitle) => {
  const title = (jobTitle || "").toLowerCase();
  return !NON_ENGINEERING_TITLE_PATTERNS.some((pattern) => title.includes(pattern));
};

const keywordBoost = (resumeSkills, jobTitle, jobDescription) => {
  if (!resumeSkills?.length) return 0;
  const text = (jobTitle + " " + (jobDescription || "")).toLowerCase();
  const matched = resumeSkills.filter((skill) => text.includes(skill.toLowerCase()));
  const relevantSkillCount = Math.min(resumeSkills.length, 8);
  return Math.min(matched.length / relevantSkillCount, 1);
};

const findMatchesForUser = async (userId, limit = 10) => {
  const user = await User.findById(userId);
  if (!user || !user.resume) {
    throw new Error("No resume found for this user");
  }

  const matchText = buildResumeMatchText(user.resume);
  const textHash = hashText(matchText);

  let resumeEmbedding = user.resume.embedding;

  if (!resumeEmbedding?.length || user.resume.embeddingHash !== textHash) {
    resumeEmbedding = await generateEmbedding(matchText);
    user.resume.embedding = resumeEmbedding;
    user.resume.embeddingHash = textHash;
    user.markModified("resume");
    await user.save();
  }

  const openJobs = await Job.find({ status: "open", embedding: { $ne: [] } });

  if (!openJobs.length) {
    return [];
  }

  // Filter out irrelevant titles, but fallback to all jobs if pool is too small
  const filteredJobs = openJobs.filter((job) => isLikelyRelevantTitle(job.title));
  const candidatePool = filteredJobs.length >= limit ? filteredJobs : openJobs;

  const scored = candidatePool
    .map((job) => {
      const embedScore = cosineSimilarity(resumeEmbedding, job.embedding);
      const kwScore = keywordBoost(user.resume.skills, job.title, job.description);
      const finalScore = embedScore * 0.5 + kwScore * 0.5;
      return { job, embedScore, keywordScore: kwScore, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);

  return scored.map(({ job, embedScore, keywordScore, finalScore }) => ({
    jobId: job._id,
    title: job.title,
    company: job.company,
    location: job.location,
    applyUrl: job.applyUrl,
    description: job.description,
    source: job.source,
    fetchedAt: job.fetchedAt,
    createdAt: job.createdAt,
    score: Math.round(finalScore * 100) / 100,
    embedScore: Math.round(embedScore * 100) / 100,
    keywordScore: Math.round(keywordScore * 100) / 100,
  }));
};

module.exports = { findMatchesForUser };
