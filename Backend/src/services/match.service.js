// src/services/matchService.js
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

const keywordBoost = (resumeSkills, jobTitle, jobDescription) => {
  if (!resumeSkills?.length) return 0;
  const text = (jobTitle + " " + jobDescription).toLowerCase();
  const matchCount = resumeSkills.filter((skill) =>
    text.includes(skill.toLowerCase())
  ).length;
  return matchCount / resumeSkills.length;
};

const findMatchesForUser = async (userId, limit = 20) => {
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

  const scored = openJobs
    .map((job) => {
      const embedScore = cosineSimilarity(resumeEmbedding, job.embedding);
      const keywordScore = keywordBoost(user.resume.skills, job.title, job.description);
      const finalScore = embedScore * 0.6 + keywordScore * 0.4;
      return { job, embedScore, keywordScore, finalScore };
    })
    .filter((item) => item.finalScore > 0.3)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);

  return scored.map(({ job, embedScore, keywordScore, finalScore }) => ({
    jobId: job._id,
    title: job.title,
    company: job.company,
    location: job.location,
    applyUrl: job.applyUrl,
    score: Math.round(finalScore * 100) / 100,
    embedScore: Math.round(embedScore * 100) / 100,
    keywordScore: Math.round(keywordScore * 100) / 100,
  }));
};

module.exports = { findMatchesForUser };