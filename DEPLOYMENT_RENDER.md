# Render Single-Domain Fullstack Deployment Guide

This project is configured to deploy both the **Express Backend** and the **React + Vite Frontend** on the **same single domain** using a unified Render Web Service.

---

## Architecture Overview

```
                        [ User / Browser ]
                                │
                                ▼
                   https://your-app.onrender.com
                                │
       ┌────────────────────────┴────────────────────────┐
       ▼                                                 ▼
[ /api/* routes ]                              [ All Other Routes /* ]
Express REST API                               Static React SPA Files
- /api/auth                                    - / (Dashboard / Home)
- /api/jobs                                    - /jobs (Find Jobs)
- /api/match/me                                - /matched-jobs (AI Match)
- /api/autofill/me                             - /profile (Resume)
- /health (Render Health Check)                - /applications (Kanban)
```

### Benefits of Same-Domain Architecture
1. **Zero CORS Issues:** API calls use relative paths (`/api/...`), completely eliminating CORS preflight overhead.
2. **First-Party Cookies & JWT:** HttpOnly cookies and authorization headers work seamlessly across all subroutes without cross-site third-party cookie blocking.
3. **Cost Effective:** Runs on a single Render Web Service (Free Tier compatible).
4. **Zero-Downtime:** The `/health` endpoint allows Render to verify the service before routing traffic.

---

## Deployment Option 1: Automatic Blueprint (Recommended)

Render will automatically configure the entire service using the included [`render.yaml`](./render.yaml).

1. Push your repository to **GitHub** or **GitLab**:
   ```bash
   git add .
   git commit -m "chore: configure single-domain render deployment"
   git push origin main
   ```
2. Log into the [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** in the top right and select **Blueprint**.
4. Connect your GitHub/GitLab repository (`AUTO-JOB-APPLY`).
5. Render will detect `render.yaml` and prompt you for the required environment variables:
   * **`MONGO_URI`**: Your MongoDB Atlas connection string.
   * **`GEMINI_API_KEY`**: Your Google Gemini API Key.
   * *(Note: `JWT_SECRET` is auto-generated securely by Render).*
6. Click **Apply**. Render will run `npm run build`, build the frontend and backend, and deploy!

---

## Deployment Option 2: Manual Web Service Setup

If you prefer to configure the Web Service manually via Render's Web UI:

1. In Render Dashboard, click **New +** > **Web Service**.
2. Select your repository.
3. Configure the following settings:
   * **Name**: `auto-job-apply` (or your choice)
   * **Language / Runtime**: `Node`
   * **Region**: Oregon (or your preferred region)
   * **Branch**: `main`
   * **Root Directory**: *(Leave blank)*
   * **Build Command**:
     ```bash
     npm run build
     ```
   * **Start Command**:
     ```bash
     npm start
     ```
   * **Plan Type**: `Free`

4. Click **Advanced** and set:
   * **Health Check Path**: `/health`

5. In the **Environment Variables** section, add:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode |
   | `PUPPETEER_SKIP_DOWNLOAD` | `true` | Skips heavy Chromium download |
   | `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
   | `JWT_SECRET` | *(At least 32 characters)* | Secret key for JWT tokens |
   | `GEMINI_API_KEY` | *(Your Gemini API Key)* | API key for Gemini embeddings |

6. Click **Create Web Service**.

---

## Local Verification Commands

To test the unified production build locally:

```bash
# 1. Build frontend and install dependencies
npm run build

# 2. Start the unified production server
npm start
```
Then visit `http://localhost:3000` to verify:
* Frontend loads at `http://localhost:3000/`
* SPA client routing works at `http://localhost:3000/matched-jobs` and `http://localhost:3000/jobs`
* Health check responds at `http://localhost:3000/health`
* Backend API responds at `http://localhost:3000/api/jobs`

