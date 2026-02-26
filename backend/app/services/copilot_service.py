from dataclasses import dataclass
from typing import Optional
import os

from app.api.schemas import CopilotResponse
from agents.copilot import SustainabilityCopilot
from transforms.state import alerts_state, metrics_state, score_state


@dataclass
class CopilotQueryRequest:
    question: str
    department: Optional[str] = None


_copilot = SustainabilityCopilot(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
)


def get_copilot_runtime_status() -> dict:
    return _copilot.get_runtime_status()


def _metric_value(row: dict, average_key: str, raw_key: str) -> float:
    value = row.get(average_key)
    if value is None:
        value = row.get(raw_key, 0.0)
    return float(value)


def _build_live_context(department: Optional[str]) -> str:
    rows = metrics_state.get_latest_snapshot()
    alerts = alerts_state.get_active_alerts()
    score = score_state.get_latest_score()

    if department:
        rows = [row for row in rows if row.get("department") == department]
        alerts = [row for row in alerts if row.get("department") == department]

    lines = []

    overall_score = score.get("overall_score")
    if isinstance(overall_score, (int, float)):
        lines.append(f"Current sustainability score: {overall_score:.2f}/100")

    if rows:
        avg_energy = (
            sum(_metric_value(row, "energy_kwh_avg", "energy_kwh") for row in rows)
            / len(rows)
        )
        avg_waste = (
            sum(
                _metric_value(row, "medical_waste_kg_avg", "medical_waste_kg")
                for row in rows
            )
            / len(rows)
        )
        avg_paper = (
            sum(_metric_value(row, "paper_kg_avg", "paper_kg") for row in rows) / len(rows)
        )
        lines.append(
            "Average live usage "
            f"(energy={avg_energy:.2f} kWh, waste={avg_waste:.2f} kg, paper={avg_paper:.2f} kg)."
        )
        for row in rows[:4]:
            lines.append(
                f"{row.get('department')}: "
                f"energy={_metric_value(row, 'energy_kwh_avg', 'energy_kwh'):.2f} kWh, "
                f"waste={_metric_value(row, 'medical_waste_kg_avg', 'medical_waste_kg'):.2f} kg, "
                f"paper={_metric_value(row, 'paper_kg_avg', 'paper_kg'):.2f} kg."
            )
    else:
        lines.append("No live metrics snapshot available yet.")

    if alerts:
        lines.append("Current alerts:")
        for alert in alerts[:4]:
            lines.append(
                f"- [{alert.get('severity')}] {alert.get('department')}: {alert.get('message')}"
            )
    else:
        lines.append("No active sustainability alerts.")

    return "\n".join(lines)


async def run_copilot_query(req: CopilotQueryRequest) -> CopilotResponse:
    live_context = _build_live_context(req.department)
    answer, sources = await _copilot.answer_question(
        question=req.question,
        department=req.department,
        live_context=live_context,
    )
    return CopilotResponse(answer=answer, sources=sources)

