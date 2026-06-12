from datetime import datetime

from pydantic import BaseModel


class AuditLogEntry(BaseModel):
    id: int
    user_id: int | None
    user_email: str | None
    action: str
    resource_type: str | None
    resource_id: int | None
    details: str | None
    created_at: datetime


class PaginatedAuditLogResponse(BaseModel):
    items: list[AuditLogEntry]
    total: int
    page: int
    size: int
    pages: int
