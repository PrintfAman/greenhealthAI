from datetime import datetime
from typing import Dict

from app.api.schemas import MetricsResponse, DepartmentMetric, SustainabilityScoreResponse
from transforms.state import metrics_state, score_state


async def get_current_metrics() -> MetricsResponse:
    """Return latest metrics snapshot from the streaming engine state."""
    rows = metrics_state.get_latest_snapshot()
    metrics = [
        DepartmentMetric(
            department=row["department"],
            energy_kwh=row.get("energy_kwh", row.get("energy_kwh_avg", 0.0)),
            medical_waste_kg=row.get(
                "medical_waste_kg", row.get("medical_waste_kg_avg", 0.0)
            ),
            paper_kg=row.get("paper_kg", row.get("paper_kg_avg", 0.0)),
            timestamp=str(
                row.get("timestamp", row.get("window_end", datetime.utcnow().isoformat()))
            ),
        )
        for row in rows
    ]
    return MetricsResponse(metrics=metrics)


async def get_sustainability_score() -> SustainabilityScoreResponse:
    score: Dict = score_state.get_latest_score()
    return SustainabilityScoreResponse(
        overall_score=score.get("overall_score", 0.0),
        breakdown=score.get("breakdown", {}),
    )

