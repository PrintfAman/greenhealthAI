from fastapi import APIRouter

from app.api import schemas
from app.services.metrics_service import get_current_metrics, get_sustainability_score
from app.services.alerts_service import get_active_alerts
from app.services.copilot_service import CopilotQueryRequest, run_copilot_query


router = APIRouter(prefix="", tags=["greenhealth"])


@router.get("/metrics", response_model=schemas.MetricsResponse)
async def read_metrics():
    return await get_current_metrics()


@router.get("/alerts", response_model=schemas.AlertsResponse)
async def read_alerts():
    return await get_active_alerts()


@router.get("/sustainability-score", response_model=schemas.SustainabilityScoreResponse)
async def read_sustainability_score():
    return await get_sustainability_score()


@router.post("/copilot-query", response_model=schemas.CopilotResponse)
async def copilot_query(req: CopilotQueryRequest):
    return await run_copilot_query(req)

