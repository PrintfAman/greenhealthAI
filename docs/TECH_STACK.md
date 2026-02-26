# Tech Stack Documentation

This document explains the core technologies used in GreenHealth AI and why they were selected.

## Backend

### FastAPI

- Purpose: HTTP API layer for metrics, alerts, sustainability score, health checks, and copilot.
- Why: async-friendly, strong performance, clear OpenAPI docs generation.
- Key usage:
  - REST endpoints: `/metrics`, `/alerts`, `/sustainability-score`, `/copilot-query`
  - Health probes: `/livez`, `/healthz`
  - WebSocket stream: `/ws/metrics`

### Pathway

- Purpose: real-time streaming engine for telemetry ingestion and incremental processing.
- Why: native streaming abstractions, windowing, reducers, and connector ecosystem.
- Key usage:
  - Custom connector via `pw.io.python.ConnectorSubject`
  - Sliding windows via `pw.temporal.sliding`
  - Aggregations via `pw.reducers.avg` and `pw.reducers.sum`
  - Runtime execution via `pw.run()`

### Pathway xPack LLM

- Purpose: retrieval-augmented generation (RAG) and vector search.
- Why: integrated RAG tooling aligned with Pathway streaming architecture.
- Key usage:
  - `embedders.SentenceTransformerEmbedder`
  - `parsers.Utf8Parser`
  - `splitters.TokenCountSplitter`
  - `VectorStoreServer`
  - `BaseRAGQuestionAnswerer` / `RAGClient`

### LiteLLM + Groq API

- Purpose: OpenAI-compatible LLM calls for copilot responses.
- Why: provider abstraction plus simple model routing.
- Key usage:
  - Primary inference endpoint through Groq-compatible base URL.

## Frontend

### React + TypeScript

- Purpose: SPA UI for dashboard and copilot workflows.
- Why: component-based architecture and type-safe UI logic.

### Vite

- Purpose: frontend build and dev tooling.
- Why: fast local dev server and optimized production builds.

### Recharts

- Purpose: real-time line charts for energy and medical waste trends.
- Why: lightweight React charting with responsive containers.

### Framer Motion

- Purpose: landing/dashboard animation effects.
- Why: declarative animation API for React.

## Infrastructure

### Docker / Docker Compose

- Purpose: reproducible local runtime for backend + frontend.
- Why: environment parity and single-command startup.

### Render (Backend)

- Purpose: container-based hosting for FastAPI + Pathway runtime.
- Why: simple Docker deploy flow with managed HTTPS and health checks.

### Vercel (Frontend)

- Purpose: static hosting and CDN for the React app.
- Why: fast deploys for Vite frontend with environment variable support.

## Data and Runtime Model

- Streaming telemetry source: simulated hospital department metrics.
- Incremental transformations: rolling window metrics and anomaly heuristics.
- In-memory state bridge: exposes streaming outputs to API and WebSocket consumers.
- RAG data source: documents under `backend/data/documents`.

## Security and Configuration

- Secrets stored in deployment providers (Render/Vercel env vars), not in git.
- `.env` files are ignored by `.gitignore`.
- CORS controlled with `GREENHEALTH_ALLOWED_ORIGINS`.
