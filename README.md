# Auto Job Apply Platform (YC Edition)

> An AI-powered job discovery, semantic resume matching, and automated job application engine built with a minimalist, high-density Y Combinator design system.

[![Node.js](https://img.shields.io/badge/Node.js-20.x_LTS-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-Embeddings-orange.svg)](https://ai.google.dev/)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Companion-red.svg)](https://github.com/rajkushwaha-01/Auto-Job-Apply-chrome-extension)

---

## ⚡ Companion Chrome Extension (Required for Auto-Apply)

> [!IMPORTANT]
> To use the **one-click auto-fill and auto-apply** capabilities on live ATS platforms (Greenhouse, Lever, Workday, etc.), you must install the official companion extension:
>
> 🔗 **[Auto-Job-Apply Chrome Extension Repository](https://github.com/rajkushwaha-01/Auto-Job-Apply-chrome-extension)**

### How the Extension Works:
1. When you navigate to an official job application form (such as Greenhouse or Lever), the extension activates.
2. It securely communicates with the backend endpoint (`GET /api/autofill/me`) using your authenticated session.
3. It automatically parses and pre-fills your contact details, resume links, categorized technical skills, and work history directly into the ATS input fields.
4. Leaves the form ready for your final 1-click review and submission.

---

## 🚀 Key Features

* **AI Compatibility Matching (`/matched-jobs`):**
  Uses Google Gemini semantic vector embeddings (`text-embedding-004`) + keyword cosine similarity to score and rank your profile against open positions, highlighting your top 10 best-fit engineering opportunities.
* **Open Job Discovery (`/jobs`):**
  Explore indexed tech jobs across Greenhouse, Lever, and Adzuna with real-time filters:
  * **1-Click Role Filters:** Backend, Frontend, Full-Stack, AI / ML, DevOps / SRE, Security, and Engineering Lead.
  * **Genuine Location Hubs:** SF Bay Area, NYC, Seattle, London, Europe, India, Canada, APAC, and Remote.
  * Full ATS HTML description rendering with clean typography.
* **Intelligent Resume Profiler (`/profile`):**
  Upload your resume PDF to extract structured career data:
  * Categorized Technical Skills (Languages, Frameworks, Cloud, Databases).
  * Work experience bullet points and impact statements.
  * Education, Projects, and Certifications.
  * Embedded PDF previewer.
* **Application Tracker Pipeline (`/applications`):**
  Kanban-style tracking board across 4 stages: `Saved`, `Applied`, `Interviewing`, and `Offer`.
* **Single-Domain Production Architecture:**
  Express backend and React + Vite frontend packaged to run on the **exact same domain** with zero CORS complexity, first-party cookie security, and zero-downtime health checking (`/health`).

---

## 🏗️ System Architecture

```
                       [ Candidate / Browser ]
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
   [ Web App UI ]                               [ Chrome Extension ]
React 18 + Vite + Tailwind               (https://github.com/rajkushwaha-01/
   (localhost:5173 /                               Auto-Job-Apply-
https://app.onrender.com)                         chrome-extension)
         │                                                 │
         │             ┌───────────────────────────────────┘
         ▼             ▼ (Bearer / Cookie Auth)
    [ Express API Backend ] (Port 3000 / Render $PORT)
    ├── /api/auth       -> Authentication & JWT session
    ├── /api/jobs       -> Job indexing & search
    ├── /api/match/me   -> Gemini AI semantic compatibility scoring
    ├── /api/autofill/me-> Form data payload for Chrome Extension
    ├── /health         -> Production uptime check
    └── /*              -> React SPA fallback (Single-Domain)
         │
    ┌────┴──────────────────────────┐
    ▼                               ▼
[ MongoDB Atlas ]          [ Google Gemini AI ]
Jobs, Resumes, Users       Vector Embeddings & Match Scoring
```

---

## 🛠️ Tech Stack

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Axios.
* **Backend:** Node.js (v20 LTS), Express 5, Mongoose / MongoDB Atlas, JWT, Cookie-Parser, Multer.
* **AI & Embeddings:** Google Generative AI (`@google/generative-ai`), LangChain Core.
* **Automation:** Chrome Extension (Manifest V3), Content Scripts, Private Network Access (PNA).

---

## 📦 Getting Started (Local Development)

### Prerequisites
* **Node.js:** v18.0.0 or v20.x LTS installed (`node -v`)
* **MongoDB Atlas:** Free cluster connection URI
* **Google Gemini API Key:** From [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/rajkushwaha-01/AUTO-JOB-APPLY.git
cd AUTO-JOB-APPLY
```

### 2. Configure Environment Variables
Create a `.env` file in the `Backend/` directory:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_at_least_32_characters
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install Dependencies & Build
From the repository root:
```bash
# Build both frontend and backend dependencies
npm run build
```

### 4. Run Development Servers
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd Backend
npm run dev
# Running on http://localhost:3000
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm run dev
# Running on http://localhost:5173
```

---

## 🔌 Installing the Chrome Extension

1. Clone or download the extension repository:
   ```bash
   git clone https://github.com/rajkushwaha-01/Auto-Job-Apply-chrome-extension.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the extension folder.
5. Log into your Auto-Job-Apply account in the web app or extension popup.
6. Open any Greenhouse or Lever job application form — the extension will auto-fill your profile details!

---

## 🌐 Deploying to Render (Single-Domain)

This repository includes a [`render.yaml`](./render.yaml) blueprint for 1-click deployment.

1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** > **Blueprint**.
3. Select your `AUTO-JOB-APPLY` repository.
4. Provide your environment variables:
   * `MONGO_URI`: Your MongoDB Atlas connection URI.
   * `GEMINI_API_KEY`: Your Google Gemini API Key.
5. Click **Apply**. Render will automatically build the frontend, start the backend, and host both on your single `.onrender.com` domain.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).

