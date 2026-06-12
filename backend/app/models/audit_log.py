from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base

ACTION_LOGIN = "login"
ACTION_SCAN_UPLOAD = "scan_upload"
ACTION_SCAN_VIEW = "scan_view"
ACTION_SCAN_ANALYZE = "scan_analyze"
ACTION_REPORT_DOWNLOAD = "report_download"
ACTION_SCAN_DELETE = "scan_delete"
ACTION_ANNOTATION_CREATE = "annotation_create"
ACTION_USER_ROLE_CHANGE = "user_role_change"
ACTION_USER_DELETE = "user_delete"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=True)
    resource_id = Column(Integer, nullable=True)
    details = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User")
