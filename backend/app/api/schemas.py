from typing import List, Literal, Optional
from pydantic import BaseModel


Department = Literal["ER", "ICU", "Oncology", "Pediatrics", "Radiology", "Admin"]


class DepartmentMetric(BaseModel):
    department: Department
    energy_kwh: float
    medical_waste_kg: float
    paper_kg: float
    timestamp: str


class MetricsResponse(BaseModel):
    metrics: List[DepartmentMetric]


class Alert(BaseModel):
    id: str
    type: Literal["energy_anomaly", "waste_anomaly", "paper_anomaly"]
    department: Department
    severity: Literal["low", "medium", "high"]
    message: str
    created_at: str


class AlertsResponse(BaseModel):
    alerts: List[Alert]


class SustainabilityScoreResponse(BaseModel):
    overall_score: float
    breakdown: dict


class CopilotResponse(BaseModel):
    answer: str
    sources: List[str]

