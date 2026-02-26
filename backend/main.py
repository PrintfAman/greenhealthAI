import asyncio
import logging
import os
import time
import threading
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load local env files for non-Docker runs without overriding already exported vars.
_BACKEND_DIR = Path(__file__).resolve().parent
for _candidate in (_BACKEND_DIR / ".env", _BACKEND_DIR.parent / ".env"):
    if _candidate.exists():
        load_dotenv(_candidate, override=False)

from app.api.routes import router as api_router
from app.services.copilot_service import get_copilot_runtime_status
from ingestion.rag_server import get_rag_status
from transforms.state import metrics_state
from ingestion.runner import main as run_stream_engine


logger = logging.getLogger(__name__)
_stream_thread: Optional[threading.Thread] = None
_stream_thread_lock = threading.Lock()
_stream_started_at: Optional[float] = None
_stream_error: Optional[str] = None


def _parse_allowed_origins(raw_value: Optional[str]) -> list[str]:
    if not raw_value:
        return ["*"]
    origins = [item.strip() for item in raw_value.split(",") if item.strip()]
    return origins or ["*"]


def _run_stream_engine_with_guard() -> None:
    global _stream_error
    try:
        run_stream_engine()
    except Exception as exc:  # pragma: no cover - process-level guard
        _stream_error = str(exc)
        logger.exception("Stream engine stopped unexpectedly.")


def _ensure_stream_engine_running() -> None:
    """
    Launch the Pathway streaming pipeline inside the API process so the
    in-memory state feeding the endpoints/websocket stays in sync.
    """
    global _stream_thread, _stream_started_at, _stream_error
    with _stream_thread_lock:
        if _stream_thread is not None and _stream_thread.is_alive():
            return

        thread = threading.Thread(
            target=_run_stream_engine_with_guard, name="stream-engine", daemon=True
        )
        thread.start()
        _stream_thread = thread
        _stream_started_at = time.time()
        _stream_error = None


def create_app() -> FastAPI:
    allowed_origins = _parse_allowed_origins(os.getenv("GREENHEALTH_ALLOWED_ORIGINS"))
    allow_credentials = os.getenv("GREENHEALTH_ALLOW_CREDENTIALS", "false").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
    if "*" in allowed_origins:
        # Browsers reject credentials with wildcard origins.
        allow_credentials = False

    startup_grace_seconds = int(
        os.getenv("GREENHEALTH_HEALTH_STARTUP_GRACE_SECONDS", "120")
    )

    app = FastAPI(
        title="GreenHealth AI Backend",
        version="0.1.0",
        description="Streaming sustainability analytics and AI copilot for healthcare.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    @app.on_event("startup")
    async def start_stream_engine():
        _ensure_stream_engine_running()

    @app.get("/livez")
    async def liveness_check():
        return {"status": "alive"}

    @app.get("/healthz")
    async def health_check():
        stream_thread_alive = _stream_thread is not None and _stream_thread.is_alive()
        metrics_count = len(metrics_state.get_latest_snapshot())
        uptime_seconds = (
            int(time.time() - _stream_started_at) if _stream_started_at is not None else 0
        )
        startup_grace_elapsed = uptime_seconds >= startup_grace_seconds

        rag_status = get_rag_status()
        copilot_status = get_copilot_runtime_status()
        rag_required = bool(copilot_status.get("rag_required"))

        issues = []
        if _stream_error:
            issues.append(f"stream_error: {_stream_error}")
        if not stream_thread_alive:
            issues.append("stream_engine_not_running")
        if (
            stream_thread_alive
            and _stream_started_at is not None
            and startup_grace_elapsed
            and metrics_count == 0
        ):
            issues.append("stream_engine_has_not_emitted_metrics")

        if rag_required and not bool(rag_status.get("enabled")):
            issues.append("rag_required_but_disabled")

        if (
            rag_required
            and bool(rag_status.get("enabled"))
            and not bool(rag_status.get("ready"))
            and startup_grace_elapsed
        ):
            rag_error = rag_status.get("error") or "unknown_rag_error"
            issues.append(f"rag_not_ready: {rag_error}")

        if (
            rag_required
            and not bool(copilot_status.get("rag_client_ready"))
            and startup_grace_elapsed
        ):
            copilot_error = copilot_status.get("startup_error") or "rag_client_init_failed"
            issues.append(f"copilot_rag_client_not_ready: {copilot_error}")

        payload = {
            "status": "ok" if not issues else "degraded",
            "stream": {
                "alive": stream_thread_alive,
                "metrics_count": metrics_count,
                "uptime_seconds": uptime_seconds,
            },
            "rag": rag_status,
            "copilot": copilot_status,
            "startup_grace_seconds": startup_grace_seconds,
            "issues": issues,
        }
        status_code = 200 if not issues else 503
        return JSONResponse(status_code=status_code, content=payload)

    return app


app = create_app()


@app.websocket("/ws/metrics")
async def metrics_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            snapshot = metrics_state.get_latest_snapshot()
            await websocket.send_json({"metrics": snapshot})
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        pass

