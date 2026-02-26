# API Reference

Base URL (local): `http://localhost:8000`

## Health Endpoints

### `GET /livez`

Simple liveness probe.

### `GET /healthz`

Readiness probe for stream + RAG.

- Returns `200` when healthy.
- Returns `503` with `issues` when degraded.

## Dashboard Data Endpoints

### `GET /metrics`

Returns latest department telemetry snapshot.

Response shape:

```json
{
  "metrics": [
    {
      "department": "ICU",
      "energy_kwh": 120.1,
      "medical_waste_kg": 23.4,
      "paper_kg": 9.2,
      "timestamp": "2026-02-26T18:20:00Z"
    }
  ]
}
```

### `GET /alerts`

Returns active anomaly alerts.

### `GET /sustainability-score`

Returns overall score plus per-department breakdown.

## Copilot Endpoint

### `POST /copilot-query`

Request:

```json
{
  "question": "How can ICU reduce medical waste?"
}
```

Response:

```json
{
  "answer": "Actionable guidance...",
  "sources": [
    "/app/data/documents/hospital_sustainability_guidelines.txt"
  ]
}
```

## WebSocket

### `GET /ws/metrics` (WebSocket)

Streams metric snapshots every few seconds:

```json
{
  "metrics": [
    {
      "department": "ER",
      "energy_kwh": 101.2,
      "medical_waste_kg": 20.8,
      "paper_kg": 7.1,
      "timestamp": "..."
    }
  ]
}
```
