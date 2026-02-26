from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, List
import uuid

import pathway as pw

from ingestion.simulated_feeds import read_simulated_metrics
from transforms.state import alerts_state, metrics_state, score_state


def build_streaming_graph() -> None:
    """
    Build the Pathway streaming graph:
    - ingest simulated metrics
    - compute rolling window aggregations
    - derive sustainability score
    - detect anomalies and generate alerts

    Side effects are pushed into in-memory state objects consumed by the FastAPI layer.
    """
    metrics_stream = read_simulated_metrics()

    # Rolling 15-minute window, updated every 5 minutes, per department.
    windowed = metrics_stream.windowby(
        metrics_stream.timestamp,
        window=pw.temporal.sliding(
            hop=timedelta(minutes=5), duration=timedelta(minutes=15)
        ),
        instance=metrics_stream.department,
    ).reduce(
        department=pw.this._pw_instance,
        energy_kwh_avg=pw.reducers.avg(pw.this.energy_kwh),
        energy_kwh_sum=pw.reducers.sum(pw.this.energy_kwh),
        medical_waste_kg_avg=pw.reducers.avg(pw.this.medical_waste_kg),
        medical_waste_kg_sum=pw.reducers.sum(pw.this.medical_waste_kg),
        paper_kg_avg=pw.reducers.avg(pw.this.paper_kg),
        paper_kg_sum=pw.reducers.sum(pw.this.paper_kg),
        window_start=pw.this._pw_window_start,
        window_end=pw.this._pw_window_end,
    )

    _wire_python_sinks(windowed=windowed, raw_metrics=metrics_stream)


def _wire_python_sinks(windowed: pw.Table, raw_metrics: pw.Table) -> None:
    """
    Subscribe to both raw and aggregated tables.

    Raw events keep dashboard charts populated immediately. Windowed rows become
    the preferred source for scores and alerting once available.
    """
    latest_raw_by_department: Dict[str, Dict] = {}
    latest_windowed_by_department: Dict[str, Dict] = {}

    def _rows_for_scoring() -> List[Dict]:
        if latest_windowed_by_department:
            return list(latest_windowed_by_department.values())
        return list(latest_raw_by_department.values())

    def on_change_raw(key: pw.Pointer, row: Dict, time: int, is_addition: bool) -> None:
        dept = row["department"]
        if is_addition:
            latest_raw_by_department[dept] = row
        else:
            latest_raw_by_department.pop(dept, None)

        metrics_state.update(list(latest_raw_by_department.values()))
        source_rows = _rows_for_scoring()
        _update_metrics_and_score(source_rows)
        _update_alerts(source_rows)

    def on_change_windowed(
        key: pw.Pointer, row: Dict, time: int, is_addition: bool
    ) -> None:
        dept = row["department"]
        if is_addition:
            latest_windowed_by_department[dept] = row
        else:
            latest_windowed_by_department.pop(dept, None)

        source_rows = _rows_for_scoring()
        _update_metrics_and_score(source_rows)
        _update_alerts(source_rows)

    def on_end() -> None:
        latest_raw_by_department.clear()
        latest_windowed_by_department.clear()
        metrics_state.update([])
        score_state.update({"overall_score": 0.0, "breakdown": {}})
        alerts_state.replace_alerts([])

    pw.io.subscribe(raw_metrics, on_change=on_change_raw, on_end=on_end)
    pw.io.subscribe(windowed, on_change=on_change_windowed, on_end=on_end)


def _metric_value(row: Dict, average_key: str, raw_key: str) -> float:
    value = row.get(average_key)
    if value is None:
        value = row.get(raw_key, 0.0)
    return float(value)


def _update_metrics_and_score(rows: List[Dict]) -> None:
    # Simple scoring heuristic: 100 minus penalties from normalized usage.
    if not rows:
        score_state.update({"overall_score": 0.0, "breakdown": {}})
        return

    breakdown = {}
    overall = 0.0

    for row in rows:
        dept = row["department"]
        energy = _metric_value(row, "energy_kwh_avg", "energy_kwh")
        waste = _metric_value(row, "medical_waste_kg_avg", "medical_waste_kg")
        paper = _metric_value(row, "paper_kg_avg", "paper_kg")

        energy_score = max(0.0, 100.0 - (energy / 10.0))
        waste_score = max(0.0, 100.0 - (waste * 2.0))
        paper_score = max(0.0, 100.0 - (paper * 1.5))

        dept_score = (energy_score * 0.4) + (waste_score * 0.35) + (paper_score * 0.25)
        breakdown[dept] = {
            "energy_score": energy_score,
            "waste_score": waste_score,
            "paper_score": paper_score,
            "department_score": dept_score,
        }
        overall += dept_score

    overall_score = overall / max(1, len(rows))
    score_state.update({"overall_score": overall_score, "breakdown": breakdown})


def _update_alerts(rows: List[Dict]) -> None:
    alerts = []
    for row in rows:
        dept = row["department"]
        energy = _metric_value(row, "energy_kwh_avg", "energy_kwh")
        waste = _metric_value(row, "medical_waste_kg_avg", "medical_waste_kg")
        paper = _metric_value(row, "paper_kg_avg", "paper_kg")

        # Very simple anomaly heuristics using static thresholds.
        if energy > 200:
            alerts.append(
                _build_alert(
                    dept,
                    "energy_anomaly",
                    "high",
                    f"Unusually high energy usage detected in {dept} (avg {energy:.1f} kWh).",
                )
            )
        if waste > 40:
            alerts.append(
                _build_alert(
                    dept,
                    "waste_anomaly",
                    "medium",
                    f"Elevated medical waste generation in {dept} (avg {waste:.1f} kg).",
                )
            )
        if paper > 30:
            alerts.append(
                _build_alert(
                    dept,
                    "paper_anomaly",
                    "low",
                    f"Paper consumption is above target in {dept} (avg {paper:.1f} kg).",
                )
            )

    alerts_state.replace_alerts(alerts)


def _build_alert(department: str, type_: str, severity: str, message: str) -> Dict:
    return {
        "id": str(uuid.uuid4()),
        "department": department,
        "type": type_,
        "severity": severity,
        "message": message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
