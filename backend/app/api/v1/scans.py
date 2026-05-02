from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Report, Scan, User
from ...schemas import ScanDetailResponse, ScanResponse
from ...services import DicomService
from ..deps import get_current_user

router = APIRouter(prefix="/scans")

PROCESSED_DIR = Path("data/processed")


@router.get("/", response_model=list[ScanResponse])
async def get_scans(
    search: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    verdict: str | None = Query(None),
    sort_order: Literal["asc", "desc"] = Query("desc"),
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
    scans = query.order_by(order_col).all()

    result = []
    for scan in scans:
        scan_dict = {
            "id": scan.id,
            "file_id": scan.file_id,
            "patient_name": scan.patient_name,
            "status": scan.status,
            "slice_count": scan.slice_count,
            "created_at": scan.created_at,
            "verdict": scan.report.verdict if scan.report else None,
            "probability": scan.report.probability if scan.report else None,
        }
        result.append(scan_dict)

    return result


@router.get("/{scan_id}", response_model=ScanDetailResponse)
async def get_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = (
        db.query(Scan)
        .filter(Scan.id == scan_id, Scan.user_id == current_user.id)
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


@router.get("/{scan_id}/slices")
async def get_slices(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = (
        db.query(Scan)
        .filter(Scan.id == scan_id, Scan.user_id == current_user.id)
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
        .filter(Scan.id == scan_id, Scan.user_id == current_user.id)
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
