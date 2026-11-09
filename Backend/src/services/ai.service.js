const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

const getGeminiModel = () => {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Set GOOGLE_API_KEY or GEMINI_API_KEY to use Gemini.');
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  });
};

const generateAIResponse = async (prompt) => {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new TypeError('Prompt must be a non-empty string.');
  }

  const response = await getGeminiModel().invoke(prompt);
  return response.content;
};

module.exports = { getGeminiModel, generateAIResponse };