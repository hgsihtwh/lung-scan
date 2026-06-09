from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...services.cleanup_service import CleanupService
from ..deps import get_current_user
from ...models import User

router = APIRouter(prefix="/admin")


@router.post("/cleanup/old-files")
async def cleanup_old_files(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удалить файлы сканов старше N дней."""
    result = CleanupService.cleanup_old_files(db, days=days)
    return {
        "status": "success",
        "message": f"Очистка завершена",
        **result,
    }


@router.post("/cleanup/orphaned-files")
async def cleanup_orphaned_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удалить файлы которых нет в БД."""
    result = CleanupService.cleanup_orphaned_files(db)
    return {
        "status": "success",
        "message": "Очистка осиротевших файлов завершена",
        **result,
    }
