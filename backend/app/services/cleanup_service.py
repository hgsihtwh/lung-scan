import logging
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
        """Удаляет файлы конкретного скана."""
        deleted = False

        raw_file = UPLOAD_DIR / f"{file_id}.zip"
        if raw_file.exists():
            raw_file.unlink()
            logger.info(f"Удалён raw файл: {raw_file}")
            deleted = True

        processed_dir = PROCESSED_DIR / file_id
        if processed_dir.exists():
            import shutil
            shutil.rmtree(processed_dir)
            logger.info(f"Удалена processed папка: {processed_dir}")
            deleted = True

        return deleted

    @staticmethod
    def cleanup_old_files(db: Session, days: int = 30) -> dict:
        """Удаляет файлы сканов старше N дней."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        old_scans = (
            db.query(Scan)
            .filter(Scan.created_at < cutoff_date)
            .all()
        )

        deleted_count = 0
        errors = []

        for scan in old_scans:
            try:
                CleanupService.delete_scan_files(scan.file_id)
                deleted_count += 1
            except Exception as e:
                errors.append(f"Scan {scan.id}: {e!s}")
                logger.error(f"Ошибка при удалении файлов скана {scan.id}: {e!s}")

        logger.info(
            f"Очистка завершена: удалено {deleted_count} файлов, "
            f"ошибок: {len(errors)}"
        )

        return {
            "deleted": deleted_count,
            "errors": errors,
            "checked": len(old_scans),
        }

    @staticmethod
    def cleanup_orphaned_files(db: Session) -> dict:
        """Удаляет файлы которых нет в БД."""
        db_file_ids = {scan.file_id for scan in db.query(Scan.file_id).all()}

        deleted_count = 0

        for processed_dir in PROCESSED_DIR.iterdir():
            if processed_dir.is_dir() and processed_dir.name not in db_file_ids:
                import shutil
                shutil.rmtree(processed_dir)
                deleted_count += 1
                logger.info(f"Удалена осиротевшая папка: {processed_dir}")

        for raw_file in UPLOAD_DIR.glob("*.zip"):
            file_id = raw_file.stem
            if file_id not in db_file_ids:
                raw_file.unlink()
                deleted_count += 1
                logger.info(f"Удалён осиротевший файл: {raw_file}")

        return {"deleted_orphaned": deleted_count}
