# Deployment Guide

## 1) Push to GitHub

From repo root:

```bash
git status
git add .
git commit -m "production-ready docs and deployment setup"
git push -u origin main
```

## 2) Backend on Render

This repo includes `render.yaml` for Blueprint deploy.

### Recommended

1. In Render, create a new Blueprint and point it to this repository.
2. Confirm it uses:
   - Dockerfile: `backend/Dockerfile`
   - Docker context: `.`
   - Health check: `/healthz`
3. Set secret env var:
   - `GROQ_API_KEY`

### Important Backend Env Vars

- `GREENHEALTH_ENABLE_RAG=true`
- `GREENHEALTH_REQUIRE_RAG=true`
- `GREENHEALTH_DOCS_DIR=/app/data/documents`
- `GREENHEALTH_RAG_URL=http://127.0.0.1:8765`
- `UVICORN_PORT=10000`
- `PORT=10000`

## 3) Frontend on Vercel

1. Import the same GitHub repo into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set env var:
   - `VITE_API_BASE_URL=https://<render-service>.onrender.com`
4. Deploy.

`frontend/vercel.json` already configures SPA rewrites.

## 4) Post-Deploy Verification

### Backend

```bash
curl https://<render-service>.onrender.com/healthz
```

Expect:

- `"status":"ok"`
- `"rag":{"enabled":true,"ready":true,...}`

### Frontend

- Open Vercel URL
- confirm dashboard metrics load
- confirm copilot query returns answer

## 5) Production Checklist

- `.env` files are not committed
- `GROQ_API_KEY` is set only in secret stores
- `GREENHEALTH_ALLOWED_ORIGINS` includes your Vercel domain
- backend health endpoint is green
- copilot returns sources from documents directory
