from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Report, Scan, User
from ...schemas import AnalysisResult
from ...services import AnalysisService
from ..deps import get_current_user

router = APIRouter(prefix="/scans")


@router.post("/{scan_id}/analyze", response_model=AnalysisResult)
async def start_analysis(
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

        if scan.report:
            db.delete(scan.report)
            db.commit()

        try:
            result = AnalysisService.run_analysis(scan.file_id)
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Study archive not found",
            )
        except ConnectionError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model service is not available. Please try again later.",
            )
        except TimeoutError:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Model analysis timed out. Please try again.",
            )

        report = Report(
            scan_id=scan.id,
            verdict=result["verdict"],
            probability=result["confidence"],
        )
        db.add(report)

        scan.status = "completed"
        db.commit()
        db.refresh(report)

        return AnalysisResult(
            status="completed",
            verdict=report.verdict,
            probability=report.probability,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {e!s}",
        )
