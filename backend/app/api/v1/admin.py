from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import User
from ...services.cleanup_service import CleanupService
from ..deps import require_admin

router = APIRouter(prefix="/admin")


@router.post("/cleanup/old-files")
async def cleanup_old_files(
    days: int = Query(default=30, ge=1),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = CleanupService.cleanup_old_files(db, days=days)
    return {"message": f"Cleanup complete: removed files older than {days} days", **result}


@router.post("/cleanup/orphaned-files")
async def cleanup_orphaned_files(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = CleanupService.cleanup_orphaned_files(db)
    return {"message": "Orphaned file cleanup complete", **result}
