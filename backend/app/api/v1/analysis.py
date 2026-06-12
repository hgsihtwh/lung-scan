from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Scan, User
from ...schemas import AnalysisResult
from ...models.audit_log import ACTION_SCAN_ANALYZE
from ...services.audit_service import write_log
from ...tasks.analysis import run_analysis
from ..deps import get_current_user

router = APIRouter(prefix="/scans")


@router.post("/{scan_id}/analyze", response_model=AnalysisResult)
async def start_analysis(
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

    scan.status = "processing"
    db.commit()
    write_log(db, current_user.id, ACTION_SCAN_ANALYZE, resource_type="scan", resource_id=scan_id)

    run_analysis.delay(scan_id)

    return AnalysisResult(status="processing")


@router.get("/{scan_id}/status", response_model=AnalysisResult)
async def get_analysis_status(
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

    if scan.status == "completed" and scan.report:
        return AnalysisResult(
            status="completed",
            verdict=scan.report.verdict,
            probability=scan.report.probability,
        )

    if scan.status == "failed":
        return AnalysisResult(status="failed")

    return AnalysisResult(status=scan.status)
