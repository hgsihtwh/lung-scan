from datetime import datetime

from pydantic import BaseModel


class AnnotationCreate(BaseModel):
    slice_number: int
    label: str | None = None
    x1: float
    y1: float
    x2: float
    y2: float


class AnnotationUpdate(BaseModel):
    label: str | None = None


class AnnotationResponse(BaseModel):
    id: int
    scan_id: int
    slice_number: int
    created_by_id: int
    label: str | None
    x1: float
    y1: float
    x2: float
    y2: float
    created_at: datetime

    class Config:
        from_attributes = True
