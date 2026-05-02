from ..celery_app import celery_app
from ..database import SessionLocal
from ..models import Report, Scan
from ..services import AnalysisService


@celery_app.task(bind=True, max_retries=0)
def run_analysis(self, scan_id: int) -> dict:
    db = SessionLocal()
    scan = None
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return {"status": "failed", "error": "Scan not found"}

        scan.status = "processing"
        db.commit()

        result = AnalysisService.run_analysis(scan.file_id)

        if scan.report:
            db.delete(scan.report)
            db.flush()

        report = Report(
            scan_id=scan.id,
            verdict=result["verdict"],
            probability=result["confidence"],
        )
        db.add(report)
        scan.status = "completed"
        db.commit()

        return {"status": "completed", "verdict": result["verdict"], "confidence": result["confidence"]}

    except Exception as e:
        db.rollback()
        if scan:
            scan.status = "failed"
            db.commit()
        return {"status": "failed", "error": str(e)}

    finally:
        db.close()
