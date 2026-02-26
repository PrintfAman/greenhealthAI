# Contributing

Thanks for contributing to GreenHealth AI.

## Development Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Branch Strategy

- `main`: production-ready branch
- Feature branches: `feature/<short-description>`
- Fix branches: `fix/<short-description>`

## Commit Convention

Use clear, scoped commit messages:

- `feat(frontend): add copilot suggestion chips`
- `fix(backend): harden health readiness checks`
- `docs: add deployment runbook`

## Pull Request Checklist

- [ ] No secrets included (`.env` files not committed)
- [ ] README/docs updated if behavior changed
- [ ] Frontend build passes (`npm run build`)
- [ ] Backend starts and `/healthz` is reachable
- [ ] Changes are scoped and include rationale

## Code Style

- Keep modules small and single-purpose.
- Prefer explicit naming over short ambiguous names.
- Add comments only where intent is non-obvious.
- Avoid mixing backend/API changes with UI-only changes in one PR.
