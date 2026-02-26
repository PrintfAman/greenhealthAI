# Pathway Hackathon Checklist

This file maps GreenHealth AI implementation details to common Pathway hackathon evaluation requirements.

## 1) Pathway Usage

Status: **Satisfied**

- Dependency present: `backend/requirements.txt` includes `pathway==0.28.0`.
- Pathway graph runner: `backend/ingestion/runner.py` calls `pw.run()`.
- Streaming graph: `backend/transforms/pipeline.py` builds Pathway tables and reducers.

## 2) Live / Simulated Streaming Ingestion

Status: **Satisfied**

- Custom Pathway connector implemented in `backend/ingestion/simulated_feeds.py`.
- Uses `pw.io.python.ConnectorSubject` and `pw.io.python.read(...)`.
- Continuous event emission via connector `run()` loop.

## 3) Streaming Transformations

Status: **Satisfied**

- Windowing: `windowby(..., pw.temporal.sliding(...))` in `backend/transforms/pipeline.py`.
- Aggregations: `pw.reducers.avg`, `pw.reducers.sum`.
- Incremental updates consumed with `pw.io.subscribe`.

## 4) Event-driven Architecture

Status: **Satisfied**

- Live score updates: `score_state.update(...)` in streaming callbacks.
- Alert generation: threshold-based anomaly alerts in `_update_alerts(...)`.
- WebSocket push endpoint for near-real-time UI updates: `/ws/metrics` in `backend/main.py`.

## 5) Pathway LLM xPack Integration

Status: **Satisfied**

- Imports from `pathway.xpacks.llm` in `backend/ingestion/rag_server.py`.
- Uses `embedders`, `parsers`, `splitters`, `question_answering`.
- Builds `VectorStoreServer` and RAG QA server.

## 6) Real-time RAG

Status: **Satisfied**

- Document streaming from filesystem with `pw.io.fs.read(..., mode="streaming")`.
- `RAGClient` integration in `backend/agents/copilot.py`.
- Copilot combines live telemetry context + retrieved document context.

## 7) Modular Architecture

Status: **Satisfied**

- `ingestion/`, `transforms/`, `agents/`, `app/api/`, and `app/services/` are separated.
- API layer is decoupled from streaming graph construction.

## 8) Docker Deployment

Status: **Satisfied**

- Backend Dockerfile: `backend/Dockerfile`.
- Compose setup for full stack: `docker-compose.yml`.
- Render Docker deployment descriptor: `render.yaml`.

## 9) Operational Readiness

Status: **Partially satisfied**

- Health endpoints: `/livez`, `/healthz`.
- Startup readiness checks for stream + RAG health.
- Runbook documented in `docs/RUNBOOK.md`.
- Improvement opportunity: add automated tests and CI coverage metrics.

## 10) Suggested Final Submission Notes

Include these links in hackathon submission:

1. Live frontend URL (Vercel)
2. Live backend URL (Render `/healthz`)
3. Repo URL
4. 2–3 minute demo video showing:
   - live metric updates
   - alert triggering
   - copilot response with sourced context
