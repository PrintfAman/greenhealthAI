# Operations Runbook

## Local Runtime Commands

From repo root:

```bash
docker compose up -d
docker compose ps
docker compose logs --tail=120 api
```

Health checks:

```bash

curl.exe http://localhost:8000/healthz
```

## Common Issues

### `rag_required_but_disabled`

Cause:

- `GREENHEALTH_REQUIRE_RAG=true` while RAG graph did not start.

Check:

```bash
docker compose logs --tail=200 api
```

Fix:

- ensure `GROQ_API_KEY` is valid
- ensure `GREENHEALTH_ENABLE_RAG=true`
- ensure docs exist under `backend/data/documents`
- recreate API container:

```bash
docker compose up -d --force-recreate api
```

### `Invalid API Key` / 401 from Groq

Cause:

- expired/revoked/wrong key

Fix:

1. Create a new key in Groq Console.
2. Update `.env` and `backend/.env`.
3. Restart API:

```bash
docker compose up -d --force-recreate api
```

### Empty metrics after startup

Cause:

- stream still warming up or stream thread failed

Check:

- `healthz.stream.alive`
- `healthz.stream.metrics_count`
- API logs for stream errors

### PowerShell `curl` confusion

In PowerShell, `curl` maps to `Invoke-WebRequest`.
Use `curl.exe` for plain curl behavior.

### Incident Response: Key Exposure

1. Revoke leaked key immediately in provider console.
2. Replace key in all local env files and cloud secrets.
3. Restart running services.
4. Validate:
   - `/healthz` returns OK
   - copilot queries succeed
