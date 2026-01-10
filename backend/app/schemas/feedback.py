from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    is_accurate: bool
    user_comment: str | None = None


class FeedbackResponse(BaseModel):
    id: int
    scan_id: int
    is_accurate: bool | None
    user_comment: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    comment: str = Field(..., max_length=5000)
