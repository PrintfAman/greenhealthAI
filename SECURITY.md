# Security Policy

## Supported Versions

This project is actively maintained on the latest `main` branch.

## Reporting a Vulnerability

If you find a security issue:

1. Do not open a public issue with exploit details.
2. Share a private report with:
   - impact summary
   - affected files/endpoints
   - reproduction steps
   - proposed mitigation (if known)
3. Rotate any leaked keys immediately.

## Secrets Handling

- Never commit real API keys or credentials.
- `.env`, `backend/.env`, and `frontend/.env` are gitignored.
- Use hosted secret managers:
  - Render environment variables for backend secrets
  - Vercel environment variables for frontend public config

## Operational Safety Controls

- Health probes available at `/livez` and `/healthz`.
- `GREENHEALTH_REQUIRE_RAG=true` enables fail-closed copilot behavior.
- CORS is controlled via `GREENHEALTH_ALLOWED_ORIGINS`.
