from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Report, Scan, User
from ...models.user import ROLE_DOCTOR
from ...services import DicomService
from ...services.cleanup_service import CleanupService
from ..deps import get_current_user
from ...schemas import PaginatedScansResponse, ScanDetailResponse, ScanHistoryResponse, ScanResponse

router = APIRouter(prefix="/scans")

PROCESSED_DIR = Path("data/processed")


@router.get("/", response_model=PaginatedScansResponse)
async def get_scans(
    search: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    verdict: str | None = Query(None),
    sort_order: Literal["asc", "desc"] = Query("desc"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Scan)
        .outerjoin(Scan.report)
        .filter(Scan.user_id == current_user.id)
    )

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


@router.get("/history", response_model=ScanHistoryResponse)
async def get_scan_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scans = (
        db.query(Scan)
        .outerjoin(Scan.report)
        .filter(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.asc())
        .all()
    )
    items = [
        {
            "id": scan.id,
            "created_at": scan.created_at,
            "verdict": scan.report.verdict if scan.report else None,
            "probability": scan.report.probability if scan.report else None,
            "slice_count": scan.slice_count,
        }
        for scan in scans
    ]
    return ScanHistoryResponse(items=items)


@router.get("/{scan_id}", response_model=ScanDetailResponse)
async def get_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = (
        db.query(Scan)
        .filter(
            Scan.id == scan_id,
            or_(Scan.user_id == current_user.id, Scan.uploaded_by_id == current_user.id),
        )
        .first()
    )

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found",
        )

    return ScanDetailResponse(
        id=scan.id,
        file_id=scan.file_id,
        patient_name=scan.patient_name,
        status=scan.status,
        slice_count=scan.slice_count,
        created_at=scan.created_at,
        verdict=scan.report.verdict if scan.report else None,
        probability=scan.report.probability if scan.report else None,
        has_feedback=scan.feedback is not None,
        is_accurate=scan.feedback.is_accurate if scan.feedback else None,
        user_comment=scan.feedback.user_comment if scan.feedback else None,
    )


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = (
        db.query(Scan)
        .filter(Scan.id == scan_id, Scan.uploaded_by_id == current_user.id)
        .first()
    )

    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

    CleanupService.delete_scan_files(scan.file_id)
    db.delete(scan)
    db.commit()


@router.get("/{scan_id}/slices")
async def get_slices(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = (
        db.query(Scan)
        .filter(
            Scan.id == scan_id,
            or_(Scan.user_id == current_user.id, Scan.uploaded_by_id == current_user.id),
        )
        .first()
    )

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found",
        )

    scan_dir = PROCESSED_DIR / scan.file_id
    slice_numbers = DicomService.get_slice_numbers(scan_dir)

    return {"slices": slice_numbers}


@router.get("/{scan_id}/slices/{slice_number}")
async def get_slice(
    scan_id: int,
    slice_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = (
        db.query(Scan)
        .filter(
            Scan.id == scan_id,
            or_(Scan.user_id == current_user.id, Scan.uploaded_by_id == current_user.id),
        )
        .first()
    )

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found",
        )

    scan_dir = PROCESSED_DIR / scan.file_id
    slice_file = DicomService.get_slice_file(scan_dir, slice_number)

    if not slice_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Slice {slice_number} not found",
        )

    return FileResponse(
        slice_file,
        media_type="application/dicom",
        filename=f"slice_{slice_number}.dcm",
    )
