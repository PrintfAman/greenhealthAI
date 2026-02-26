from app.api.schemas import AlertsResponse, Alert
from transforms.state import alerts_state


async def get_active_alerts() -> AlertsResponse:
    rows = alerts_state.get_active_alerts()
    alerts = [
        Alert(
            id=row["id"],
            type=row["type"],
            department=row["department"],
            severity=row["severity"],
            message=row["message"],
            created_at=row["created_at"],
        )
        for row in rows
    ]
    return AlertsResponse(alerts=alerts)

