# Architecture

## System Overview

GreenHealth AI has two runtime planes:

1. **Streaming + API plane (backend)**  
   FastAPI hosts REST/WS APIs while a Pathway streaming graph runs in-process.
2. **Presentation plane (frontend)**  
   React dashboard and copilot UI consume REST and WebSocket endpoints.

## Backend Architecture

### Entry Point

- `backend/main.py`
  - boots FastAPI
  - starts Pathway engine thread on startup
  - serves `/livez`, `/healthz`, and `/ws/metrics`

### Streaming Ingestion

- `backend/ingestion/simulated_feeds.py`
  - custom Pathway connector (`pw.io.python.ConnectorSubject`)
  - emits department metrics continuously

### Streaming Transformations

- `backend/transforms/pipeline.py`
  - builds Pathway graph
  - rolling window: 15 minutes, hop 5 minutes (`pw.temporal.sliding`)
  - per-department reductions (`avg`, `sum`)
  - pushes updates to in-memory state for API/WebSocket consumers

### State and Services

- `backend/transforms/state.py`
  - thread-safe in-memory stores for metrics, score, alerts
- `backend/app/services/*.py`
  - maps state to API response schemas

### Copilot + RAG

- `backend/ingestion/rag_server.py`
  - builds Pathway vector store from files in `GREENHEALTH_DOCS_DIR`
  - uses Pathway xPack components (embedders, parser, splitter, QA)
- `backend/agents/copilot.py`
  - queries RAG server (`RAGClient`)
  - returns answer + source files

## Frontend Architecture

- `frontend/src/pages/LandingPage.tsx` - public landing route `/`
- `frontend/src/pages/DashboardPage.tsx` - dashboard route `/dashboard`
- dashboard polls REST and subscribes to `ws://.../ws/metrics`
- copilot sends POST requests to `/copilot-query`

## Runtime Data Flow

```text
Simulated connector -> Pathway table -> window + aggregate -> score/alerts
       -> in-memory state -> REST + WebSocket -> React dashboard

Documents -> Pathway vector store -> RAG server
User question + live context -> Copilot service -> RAG client -> answer + sources
```

## Health Model

- `/livez`: process liveness
- `/healthz`: readiness and dependency checks
  - stream thread health
  - metrics emission after startup grace
  - RAG readiness when RAG is required
