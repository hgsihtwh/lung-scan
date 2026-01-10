from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, unique=True, index=True, nullable=False)
    file_hash = Column(String, index=True, nullable=True)
    study_instance_uid = Column(String, index=True, nullable=True)
    patient_name = Column(String, nullable=True)
    status = Column(String, default="uploaded")
    slice_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="scans")
    report = relationship(
        "Report", back_populates="scan", uselist=False, cascade="all, delete-orphan"
    )
    feedback = relationship(
        "Feedback", back_populates="scan", uselist=False, cascade="all, delete-orphan"
    )
