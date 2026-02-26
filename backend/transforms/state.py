from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock
from typing import Dict, List


@dataclass
class MetricsState:
    _rows: List[Dict] = field(default_factory=list)
    _lock: Lock = field(default_factory=Lock)

    def update(self, rows: List[Dict]) -> None:
        with self._lock:
            self._rows = rows

    def get_latest_snapshot(self) -> List[Dict]:
        with self._lock:
            return list(self._rows)


@dataclass
class ScoreState:
    _score: Dict = field(default_factory=dict)
    _lock: Lock = field(default_factory=Lock)

    def update(self, score: Dict) -> None:
        with self._lock:
            self._score = score

    def get_latest_score(self) -> Dict:
        with self._lock:
            return dict(self._score)


@dataclass
class AlertsState:
    _alerts: List[Dict] = field(default_factory=list)
    _lock: Lock = field(default_factory=Lock)

    def replace_alerts(self, alerts: List[Dict]) -> None:
        with self._lock:
            self._alerts = alerts

    def get_active_alerts(self) -> List[Dict]:
        with self._lock:
            return list(self._alerts)


metrics_state = MetricsState()
score_state = ScoreState()
alerts_state = AlertsState()

