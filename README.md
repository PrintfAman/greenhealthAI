# GreenHealth AI

GreenHealth AI is a real-time hospital sustainability platform. It combines Pathway streaming pipelines, FastAPI APIs, and a React dashboard to monitor department telemetry, compute live sustainability metrics, trigger alerts, and provide AI copilot recommendations with RAG.

## Why this project

- Stream-first architecture with Pathway (`pw.io.python`, `windowby`, reducers, `pw.io.subscribe`, `pw.run()`).
- Live telemetry dashboard over REST + WebSocket.
- Event-driven alerts for high energy / waste / paper usage.
- Pathway xPack LLM-based RAG copilot grounded in sustainability documents.
- Docker-first deployment with Render + Vercel support.

## Tech Stack

- **Backend**: FastAPI, Pathway, Pathway xPack LLM, LiteLLM
- **Frontend**: React, TypeScript, Vite, Recharts, Framer Motion
- **Infra**: Docker, Docker Compose, Render, Vercel

## Repository Layout

```text
backend/
  main.py                    # FastAPI app, health probes, websocket
  app/api/                   # API routes + schemas
  app/services/              # API service layer
  ingestion/                 # connectors, runner, RAG server
  transforms/                # streaming graph + state stores
  agents/                    # copilot client
frontend/
  src/pages/                 # landing and dashboard pages
  src/components/            # dashboard + copilot components
docs/
  ARCHITECTURE.md
  API.md
  DEPLOYMENT.md
  RUNBOOK.md
  HACKATHON_CHECKLIST.md
render.yaml
docker-compose.yml
```

## Quick Start (Docker)

From repository root:

```bash
docker compose up --build -d
docker compose ps
curl.exe http://localhost:8000/healthz
```

Default URLs:

- Frontend: `http://localhost`
- Backend docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/healthz`

## Configuration

Copy environment template:

```bash
copy .env.example .env
```

Minimum required variables:

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

`GREENHEALTH_REQUIRE_RAG=true` enforces fail-closed copilot behavior when RAG is unavailable.

## Local Development

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

Frontend production build check:

```bash
cd frontend
npm run build
```

## Deployment

- Render backend configuration: `docs/DEPLOYMENT.md`
- Vercel frontend configuration: `docs/DEPLOYMENT.md`

## Documentation Index

- Architecture: `docs/ARCHITECTURE.md`
- API reference: `docs/API.md`
- Tech stack: `docs/TECH_STACK.md`
- Deployment guide: `docs/DEPLOYMENT.md`
- Operations runbook: `docs/RUNBOOK.md`
- Hackathon requirement mapping: `docs/HACKATHON_CHECKLIST.md`
- Contributing guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`

## Security

- Never commit secrets (`.env` files are gitignored).
- Rotate keys immediately if exposed.
- Store production secrets only in Render/Vercel secret managers.

## License

MIT License. See `LICENSE`.
