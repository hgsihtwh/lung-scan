from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import User
from ...models.user import ROLE_DOCTOR, ROLE_PATIENT
from ...schemas import PaginatedUsersResponse, PaginatedPatientsResponse, UpdateRoleRequest, UserResponse
from ...services.cleanup_service import CleanupService
from ..deps import require_admin

router = APIRouter(prefix="/admin")


@router.post("/cleanup/old-files")
async def cleanup_old_files(
    days: int = Query(default=30, ge=1),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = CleanupService.cleanup_old_files(db, days=days)
    return {"message": f"Cleanup complete: removed files older than {days} days", **result}


@router.post("/cleanup/orphaned-files")
async def cleanup_orphaned_files(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = CleanupService.cleanup_orphaned_files(db)
    return {"message": "Orphaned file cleanup complete", **result}


@router.get("/users", response_model=PaginatedUsersResponse)
async def list_users(
    search: str | None = Query(None),
    role: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    if role:
        query = query.filter(User.role == role)
    total = query.count()
    pages = (total + size - 1) // size
    users = query.order_by(User.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return PaginatedUsersResponse(items=users, total=total, page=page, size=size, pages=pages)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    body: UpdateRoleRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = body.role
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")
    for scan in user.scans:
        CleanupService.delete_scan_files(scan.file_id)
    db.delete(user)
    db.commit()


@router.get("/doctors", response_model=PaginatedUsersResponse)
async def list_doctors(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(User).filter(User.role == ROLE_DOCTOR)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    total = query.count()
    pages = (total + size - 1) // size
    doctors = query.order_by(User.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return PaginatedUsersResponse(items=doctors, total=total, page=page, size=size, pages=pages)


@router.get("/doctors/{doctor_id}/patients", response_model=PaginatedPatientsResponse)
async def list_doctor_patients(
    doctor_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    doctor = db.query(User).filter(User.id == doctor_id, User.role == ROLE_DOCTOR).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    patients = doctor.assigned_patients
    total = len(patients)
    pages = max(1, (total + size - 1) // size)
    offset = (page - 1) * size
    return PaginatedPatientsResponse(items=patients[offset:offset + size], total=total, page=page, size=size, pages=pages)


@router.post("/doctors/{doctor_id}/patients/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def assign_patient(
    doctor_id: int,
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    doctor = db.query(User).filter(User.id == doctor_id, User.role == ROLE_DOCTOR).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    patient = db.query(User).filter(User.id == patient_id, User.role == ROLE_PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if patient not in doctor.assigned_patients:
        doctor.assigned_patients.append(patient)
        db.commit()


@router.delete("/doctors/{doctor_id}/patients/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unassign_patient(
    doctor_id: int,
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    doctor = db.query(User).filter(User.id == doctor_id, User.role == ROLE_DOCTOR).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    patient = db.query(User).filter(User.id == patient_id, User.role == ROLE_PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if patient in doctor.assigned_patients:
        doctor.assigned_patients.remove(patient)
        db.commit()
