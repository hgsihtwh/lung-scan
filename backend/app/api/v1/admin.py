from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import User
from ...schemas import UpdateRoleRequest, UserResponse
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


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    body: UpdateRoleRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = body.role
    db.commit()
    db.refresh(user)
    return user
