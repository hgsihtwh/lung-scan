from datetime import datetime

from pydantic import BaseModel, Field


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
    probability: float | None = Field(None, ge=0.0, le=1.0)
