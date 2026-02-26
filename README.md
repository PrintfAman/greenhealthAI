# GreenHealth AI

GreenHealth AI is a real-time healthcare sustainability platform built with FastAPI, Pathway, and React.
It streams departmental telemetry, computes live sustainability insights, raises alerts, and serves an AI copilot with Pathway RAG.

## Highlights

- Real-time streaming pipeline powered by Pathway (`pw.io`, `windowby`, reducers, subscriptions, `pw.run()`).
- Live dashboard with REST + WebSocket updates (`/metrics`, `/alerts`, `/sustainability-score`, `/ws/metrics`).
- Pathway xPack LLM integration for retrieval-augmented copilot answers.
- Containerized local runtime via Docker Compose.
- Production deployment templates for Render (backend) and Vercel (frontend).

## Tech Stack

- Backend: FastAPI, Pathway, Pathway xPack LLM, LiteLLM
- Frontend: React, TypeScript, Vite, Recharts, Framer Motion
- Infrastructure: Docker, Docker Compose, Render, Vercel

## Project Structure

```text
backend/
  main.py                    # FastAPI app + health endpoints + websocket
  app/api/                   # Route + schema layer
  app/services/              # Business services
  ingestion/                 # Pathway connectors + stream runner + RAG server
  transforms/                # Streaming transformations + state stores
  agents/                    # Copilot client wrapper
frontend/
  src/pages/                 # Landing and dashboard pages
  src/components/            # UI components
  vercel.json                # SPA rewrite config
docker-compose.yml
render.yaml
```

## Quick Start (Docker)

From repo root:

```bash
docker compose up --build -d
docker compose ps
curl.exe http://localhost:8000/healthz
```

App URLs:

- Frontend: `http://localhost`
- Backend OpenAPI: `http://localhost:8000/docs`
- Health: `http://localhost:8000/healthz`

## Configuration

1) Copy env template:

```bash
copy .env.example .env
```

2) Set at minimum:

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `GROQ_BASE_URL`
- `GREENHEALTH_ENABLE_RAG`
- `GREENHEALTH_REQUIRE_RAG`
- `GREENHEALTH_DOCS_DIR`
- `GREENHEALTH_DOC_PATTERN`
- `GREENHEALTH_RAG_HOST`
- `GREENHEALTH_RAG_PORT`
- `GREENHEALTH_RAG_URL`

`GREENHEALTH_REQUIRE_RAG=true` forces copilot to fail closed if RAG is unavailable.

## Local Development (Without Docker)

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

- Backend on Render: use `render.yaml`
- Frontend on Vercel: root directory `frontend` and `VITE_API_BASE_URL` set to Render URL

Detailed guides:

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DEPLOYMENT.md`
- `docs/RUNBOOK.md`

## Security Notes

- Never commit real API keys.
- `.env` files are ignored by git.
- Rotate keys immediately if exposed in logs/screenshots/chats.
