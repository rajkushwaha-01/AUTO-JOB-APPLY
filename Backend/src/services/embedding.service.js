// src/services/embeddingService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateEmbedding = async (text, retries = 3) => {
  if (!text || !text.trim()) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const truncated = text.slice(0, 8000);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.embedContent(truncated);
      return result.embedding.values;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes("quota");
      if (isRateLimit && attempt < retries) {
        const waitTime = attempt * 15000;
        console.log(`Rate limited, retrying in ${waitTime / 1000}s (attempt ${attempt}/${retries})`);
        await sleep(waitTime);
        continue;
      }
      throw err;
    }
  }
};

module.exports = { generateEmbedding };