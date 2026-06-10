import logging
import shutil
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy.orm import Session

from ..models import Scan

logger = logging.getLogger("lungscan")

UPLOAD_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")


class CleanupService:
    @staticmethod
    def delete_scan_files(file_id: str) -> bool:
        deleted = False

        raw_file = UPLOAD_DIR / f"{file_id}.zip"
        if raw_file.exists():
            raw_file.unlink()
            logger.info(f"Deleted raw file: {raw_file}")
            deleted = True

        processed_dir = PROCESSED_DIR / file_id
        if processed_dir.exists():
            shutil.rmtree(processed_dir)
            logger.info(f"Deleted processed directory: {processed_dir}")
            deleted = True

        return deleted

    @staticmethod
    def cleanup_old_files(db: Session, days: int = 30) -> dict:
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        old_scans = db.query(Scan).filter(Scan.created_at < cutoff_date).all()

        deleted_count = 0
        errors = []

        for scan in old_scans:
            try:
                CleanupService.delete_scan_files(scan.file_id)
                scan.status = "files_deleted"
                deleted_count += 1
            except Exception as e:
                errors.append(f"Scan {scan.id}: {e!s}")
                logger.error(f"Failed to delete files for scan {scan.id}: {e!s}")

        if deleted_count:
            db.commit()

        logger.info(f"Old files cleanup: {deleted_count} deleted, {len(errors)} errors")

        return {"deleted": deleted_count, "errors": errors, "checked": len(old_scans)}

    @staticmethod
    def cleanup_orphaned_files(db: Session) -> dict:
        db_file_ids = {scan.file_id for scan in db.query(Scan.file_id).all()}

        deleted_count = 0

        if PROCESSED_DIR.exists():
            for entry in PROCESSED_DIR.iterdir():
                if entry.is_dir() and entry.name not in db_file_ids:
                    shutil.rmtree(entry)
                    deleted_count += 1
                    logger.info(f"Deleted orphaned directory: {entry}")

        if UPLOAD_DIR.exists():
            for raw_file in UPLOAD_DIR.glob("*.zip"):
                if raw_file.stem not in db_file_ids:
                    raw_file.unlink()
                    deleted_count += 1
                    logger.info(f"Deleted orphaned file: {raw_file}")

        return {"deleted_orphaned": deleted_count}
