# Deployment Guide

## Targets

- Backend: Render (Docker web service)
- Frontend: Vercel (Vite static app)

## 1) Prerequisites

- A GitHub repo with this code pushed to `main`
- A Render account
- A Vercel account
- A valid `GROQ_API_KEY`

## 2) Deploy Backend on Render

Create a new **Web Service** from the GitHub repo with Docker runtime.

Use these service settings:

- Docker Build Context Directory: `.`
- Dockerfile Path: `backend/Dockerfile`
- Docker Command: `sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000} --log-level info"`
- Health Check Path: `/livez` (use `/healthz` after RAG is healthy)

Required environment variables:

```env
PORT=10000
UVICORN_HOST=0.0.0.0
UVICORN_PORT=10000
LOG_LEVEL=info

GREENHEALTH_ENABLE_RAG=true
GREENHEALTH_REQUIRE_RAG=true
GREENHEALTH_DOCS_DIR=/app/data/documents
GREENHEALTH_DOC_PATTERN=*.txt
GREENHEALTH_RAG_HOST=127.0.0.1
GREENHEALTH_RAG_PORT=8765
GREENHEALTH_RAG_URL=http://127.0.0.1:8765
GREENHEALTH_EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
GREENHEALTH_HEALTH_STARTUP_GRACE_SECONDS=180

GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=<secret>
```

Verify:

```bash
curl https://<render-service>.onrender.com/livez
curl https://<render-service>.onrender.com/healthz
```

## 3) Deploy Frontend on Vercel

Create a new Vercel project from the same GitHub repo.

Project settings:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Frontend env var:

```env
VITE_API_BASE_URL=https://<render-service>.onrender.com
```

## 4) Configure CORS on Backend

In Render backend environment variables, set:

```env
GREENHEALTH_ALLOWED_ORIGINS=https://<your-vercel-project>.vercel.app
```

Use no trailing slash.

## 5) Final Verification

- Open Vercel URL and check dashboard data.
- Send a copilot question and confirm response.
- Recheck backend health endpoint.

## 6) Common Deployment Issues

- **No open ports detected**: verify Docker command and `PORT=10000`.
- **CORS errors in browser**: verify `GREENHEALTH_ALLOWED_ORIGINS`.
- **Copilot unavailable**: confirm `GROQ_API_KEY` and RAG env values.
