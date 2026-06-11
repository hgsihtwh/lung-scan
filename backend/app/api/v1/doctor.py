from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Report, Scan, User
from ...models.user import ROLE_PATIENT
from ...schemas import PaginatedScansResponse, PaginatedPatientsResponse, ScanResponse, UserResponse
from ..deps import require_doctor

router = APIRouter(prefix="/doctor")


@router.get("/scans", response_model=PaginatedScansResponse)
async def get_doctor_scans(
    search: str | None = Query(None),
    verdict: str | None = Query(None),
    sort_order: Literal["asc", "desc"] = Query("desc"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    query = db.query(Scan).outerjoin(Scan.report).filter(Scan.uploaded_by_id == current_user.id)

    if search:
        query = query.filter(Scan.patient_name.ilike(f"%{search}%"))
    if verdict:
        query = query.filter(Report.verdict == verdict)

    order_col = Scan.created_at.asc() if sort_order == "asc" else Scan.created_at.desc()
    query = query.order_by(order_col)

    total = query.count()
    pages = (total + size - 1) // size
    scans = query.offset((page - 1) * size).limit(size).all()

    items = [
        {
            "id": scan.id,
            "file_id": scan.file_id,
            "patient_name": scan.patient_name,
            "status": scan.status,
            "slice_count": scan.slice_count,
            "created_at": scan.created_at,
            "verdict": scan.report.verdict if scan.report else None,
            "probability": scan.report.probability if scan.report else None,
        }
        for scan in scans
    ]

    return PaginatedScansResponse(items=items, total=total, page=page, size=size, pages=pages)


@router.get("/patients", response_model=PaginatedPatientsResponse)
async def get_patients(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    patients = current_user.assigned_patients
    if search:
        patients = [p for p in patients if search.lower() in p.email.lower()]

    total = len(patients)
    pages = max(1, (total + size - 1) // size)
    offset = (page - 1) * size

    return PaginatedPatientsResponse(
        items=patients[offset:offset + size],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.get("/patients/{patient_id}/scans", response_model=PaginatedScansResponse)
async def get_patient_scans(
    patient_id: int,
    search: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    verdict: str | None = Query(None),
    sort_order: Literal["asc", "desc"] = Query("desc"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_doctor),
):
    patient = db.query(User).filter(User.id == patient_id, User.role == ROLE_PATIENT).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    query = db.query(Scan).outerjoin(Scan.report).filter(Scan.user_id == patient_id)

    if search:
        query = query.filter(Scan.patient_name.ilike(f"%{search}%"))
    if status_filter:
        query = query.filter(Scan.status == status_filter)
    if verdict:
        query = query.filter(Report.verdict == verdict)

    order_col = Scan.created_at.asc() if sort_order == "asc" else Scan.created_at.desc()
    query = query.order_by(order_col)

    total = query.count()
    pages = (total + size - 1) // size
    scans = query.offset((page - 1) * size).limit(size).all()

    items = []
    for scan in scans:
        items.append({
            "id": scan.id,
            "file_id": scan.file_id,
            "patient_name": scan.patient_name,
            "status": scan.status,
            "slice_count": scan.slice_count,
            "created_at": scan.created_at,
            "verdict": scan.report.verdict if scan.report else None,
            "probability": scan.report.probability if scan.report else None,
        })

    return PaginatedScansResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )
