const buildExtractionPrompt = (resumeText) => `
You are a resume parsing engine for a job-matching system. You will be given raw resume text extracted from a PDF/DOCX. Your ONLY job is to extract structured data from it.

STRICT RULES:
- Return ONLY valid JSON. No markdown, no code fences, no explanation, no preamble.
- Do not invent, guess, or hallucinate any information not present in the text.
- If a field is missing or unclear, use an empty string "" or empty array [], never make up a value.
- Extract LinkedIn and GitHub URLs only when the actual URL appears in the resume text; never infer a URL from a label or profile name.
- Normalize skill names (e.g. "ReactJS" and "React.js" both become "React").
- Extract ALL technical skills mentioned anywhere in the text — including inside project descriptions and bullet points, not just a "Skills" section if one exists.

OUTPUT JSON SCHEMA (return exactly this shape):
{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "portfolio": "",
  "linkedin": "",
  "github": "",
  "twitter": "",

  "summary": "",
  "objective": "",

  "skills": [],
  "skillsByCategory": {
    "Frontend": [],
    "Backend": [],
    "Database": [],
    "DevOps": [],
    "Tools": [],
    "Languages": [],
    "Other": []
  },

  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "isCurrent": false,
      "bullets": [],
      "description": ""
    }
  ],
  "totalYearsExperience": 0,

  "education": [
    {
      "degree": "",
      "institution": "",
      "location": "",
      "startYear": "",
      "endYear": "",
      "year": "",
      "grade": ""
    }
  ],

  "projects": [
    {
      "name": "",
      "description": "",
      "techUsed": [],
      "liveUrl": "",
      "repoUrl": ""
    }
  ],

  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "credentialUrl": "",
      "credentialId": ""
    }
  ],

  "hackathons": [],

  "languages": [
    {
      "language": "",
      "proficiency": ""
    }
  ],

  "awards": [
    {
      "title": "",
      "issuer": "",
      "date": "",
      "description": ""
    }
  ],

  "volunteer": [
    {
      "role": "",
      "organization": "",
      "duration": "",
      "description": ""
    }
  ],

  "publications": [
    {
      "title": "",
      "publisher": "",
      "date": "",
      "url": ""
    }
  ],

  "interests": []
}

Field guidance:
- "summary": copy the professional summary/profile from the resume exactly as written. If absent, generate one (1-2 sentences) strictly from the content present — no hallucination.
- "objective": copy any separate career objective section. Leave "" if none.
- "location": city/state/country of the candidate (not institutions).
- "portfolio": personal website or portfolio URL — distinct from LinkedIn/GitHub.
- "totalYearsExperience": estimate in years from earliest startDate to latest endDate (or "Present"). Use 0 for students with no experience.
- "skillsByCategory": group the same skills from "skills" into the most appropriate category. Only populate categories that actually have items; leave others as [].
- "experience.isCurrent": true if endDate is "Present" or "Current".
- "experience.bullets": array of individual responsibility/achievement bullet points as separate strings.
- "education.grade": GPA, percentage, CGPA, division — whatever grading format appears in the text.
- "education.startYear" / "endYear": separate years when a range is given (e.g. "2025 - 2029"). Also populate "year" with the full string for backwards compatibility.
- "projects.liveUrl": live/deployed link (Vercel, Netlify, etc.). "repoUrl": GitHub repo link.
- "certifications.credentialUrl": URL to verify the certificate online.
- "hackathons": short descriptions or names of hackathons participated in, as strings.
- "languages": spoken/written human languages (not programming languages).
- "interests": hobbies, personal interests listed in the resume.
- For any array field with no data found, return []. For any string field with no data found, return "".

RESUME TEXT:
"""
${resumeText}
"""

Return the JSON now.
`;

module.exports = { buildExtractionPrompt };
