from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    slice_number = Column(Integer, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    label = Column(String, nullable=True)
    x1 = Column(Float, nullable=False)
    y1 = Column(Float, nullable=False)
    x2 = Column(Float, nullable=False)
    y2 = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="annotations")
    created_by = relationship("User")
