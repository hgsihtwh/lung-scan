from datetime import datetime

from pydantic import BaseModel


class ScanResponse(BaseModel):
    id: int
    file_id: str
    patient_name: str | None
    status: str
    slice_count: int
    created_at: datetime
    verdict: str | None = None
    probability: float | None = None

    class Config:
        from_attributes = True


class ScanDetailResponse(ScanResponse):
    has_feedback: bool = False
    is_accurate: bool | None = None
    user_comment: str | None = None

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    status: str
    scan_id: int
    message: str
    slice_count: int
