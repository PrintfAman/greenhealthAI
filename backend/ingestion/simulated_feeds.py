from __future__ import annotations

import random
import time
from datetime import datetime, timezone
from typing import Iterable

import pathway as pw


DEPARTMENTS = ["ER", "ICU", "Oncology", "Pediatrics", "Radiology", "Admin"]


class MetricsSchema(pw.Schema):
    department: str
    energy_kwh: float
    medical_waste_kg: float
    paper_kg: float
    timestamp: pw.DateTimeUtc


class SimulatedMetricsSubject(pw.io.python.ConnectorSubject):
    """
    Simulated streaming source generating sustainability metrics per department.

    This connector continuously pushes events into the Pathway pipeline, mimicking
    a real-time telemetry feed from hospital systems.
    """

    def __init__(self, interval_seconds: float = 2.0):
        super().__init__()
        self.interval_seconds = interval_seconds

    def run(self) -> None:
        while True:
            now = datetime.now(timezone.utc)
            for dept in DEPARTMENTS:
                base_energy = 50.0 if dept in {"Admin", "Radiology"} else 120.0
                base_waste = 10.0 if dept == "Admin" else 25.0
                base_paper = 5.0 if dept in {"ICU", "ER"} else 15.0

                energy = random.gauss(base_energy, base_energy * 0.15)
                waste = random.gauss(base_waste, base_waste * 0.2)
                paper = random.gauss(base_paper, base_paper * 0.25)

                self.next(
                    department=dept,
                    energy_kwh=max(0.0, energy),
                    medical_waste_kg=max(0.0, waste),
                    paper_kg=max(0.0, paper),
                    timestamp=now,
                )

            time.sleep(self.interval_seconds)


def read_simulated_metrics() -> pw.Table:
    """Helper to create a Pathway table from the simulated subject."""
    subject = SimulatedMetricsSubject()
    return pw.io.python.read(subject, schema=MetricsSchema)

