const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { buildExtractionPrompt } = require('../Prompt/aiExtract');

const extractResumeData = async (resumeText) => {
  if (typeof resumeText !== 'string' || !resumeText.trim()) {
    throw new TypeError('Resume text must be a non-empty string.');
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Set GOOGLE_API_KEY or GEMINI_API_KEY to use Gemini.');
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    temperature: 0,
    json: true,
  });
  const result = await model.invoke(buildExtractionPrompt(resumeText));
  const rawText =
    typeof result.content === 'string'
      ? result.content
      : Array.isArray(result.content)
        ? result.content
            .map((part) =>
              typeof part === 'string'
                ? part
                : typeof part.text === 'string'
                  ? part.text
                  : ''
            )
            .join('')
        : '';

  if (!rawText.trim()) {
    throw new Error('Gemini returned an empty response.');
  }
  let parsedData;
  try {
    parsedData = JSON.parse(rawText);
  } catch (error) {
    throw new Error('Gemini returned invalid JSON.', { cause: error });
  }

  if (!parsedData || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
    throw new Error('Gemini returned JSON in an unexpected format.');
  }

  return parsedData;
};

module.exports = { extractResumeData };