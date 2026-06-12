from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from ..database import Base

ROLE_PATIENT = "patient"
ROLE_DOCTOR = "doctor"
ROLE_ADMIN = "admin"

doctor_patients = Table(
    "doctor_patients",
    Base.metadata,
    Column("doctor_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("patient_id", Integer, ForeignKey("users.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default=ROLE_PATIENT, server_default=ROLE_PATIENT)
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("Scan", foreign_keys="[Scan.user_id]", back_populates="owner", cascade="all, delete-orphan")
    uploaded_scans = relationship("Scan", foreign_keys="[Scan.uploaded_by_id]", back_populates="uploader")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

    assigned_patients = relationship(
        "User",
        secondary=doctor_patients,
        primaryjoin="User.id == doctor_patients.c.doctor_id",
        secondaryjoin="User.id == doctor_patients.c.patient_id",
        backref="assigned_doctors",
    )
