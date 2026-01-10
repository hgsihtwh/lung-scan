from datetime import datetime

from pydantic import BaseModel


class ReportResponse(BaseModel):
    id: int
    scan_id: int
    verdict: str
    probability: float
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisResult(BaseModel):
    status: str
    verdict: str | None = None
    probability: float | None = None
