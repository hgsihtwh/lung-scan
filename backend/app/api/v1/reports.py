from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Feedback, Scan, User
from ...services import DicomService, ReportService
from ..deps import get_current_user

router = APIRouter(prefix="/scans")

PROCESSED_DIR = Path("data/processed")


@router.get("/{scan_id}/report")
async def download_scan_report(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
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

        if not scan.report:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Analysis not completed. Please run analysis first.",
            )

        feedback = db.query(Feedback).filter(Feedback.scan_id == scan_id).first()

        scan_dir = PROCESSED_DIR / scan.file_id
        slice_numbers = DicomService.get_slice_numbers(scan_dir)
        actual_slice_count = len(slice_numbers) if slice_numbers else scan.slice_count

        if feedback and feedback.is_accurate:
            feedback_status = "Accurate"
        elif feedback and feedback.is_accurate is False:
            feedback_status = "Inaccurate"
        else:
            feedback_status = "Not provided"

        user_comment = (
            feedback.user_comment
            if feedback and feedback.user_comment
            else "No comment"
        )

        output = ReportService.generate_excel_report(
            patient_name=scan.patient_name,
            created_at=scan.created_at,
            slice_count=actual_slice_count,
            verdict=scan.report.verdict,
            probability=scan.report.probability,
            feedback_status=feedback_status,
            user_comment=user_comment,
        )

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=scan_report_{scan.patient_name or scan_id}.xlsx"
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating report: {e!s}",
        )
