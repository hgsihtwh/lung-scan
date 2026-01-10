from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Feedback, Scan, User
from ...schemas import CommentCreate, FeedbackCreate, FeedbackResponse
from ..deps import get_current_user

router = APIRouter(prefix="/scans")


@router.post("/{scan_id}/comments")
async def save_comments(
    scan_id: int,
    data: CommentCreate,
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

        feedback = db.query(Feedback).filter(Feedback.scan_id == scan_id).first()

        if feedback:
            feedback.user_comment = data.comment
        else:
            feedback = Feedback(scan_id=scan_id, user_comment=data.comment)
            db.add(feedback)

        db.commit()

        return {"status": "success", "message": "Comment saved"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving comment: {e!s}",
        )


@router.post("/{scan_id}/feedback", response_model=FeedbackResponse)
async def save_feedback(
    scan_id: int,
    feedback_data: FeedbackCreate,
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
                detail="Cannot provide feedback without analysis results",
            )

        feedback = db.query(Feedback).filter(Feedback.scan_id == scan_id).first()

        if feedback:
            feedback.is_accurate = feedback_data.is_accurate
            if feedback_data.user_comment:
                feedback.user_comment = feedback_data.user_comment
        else:
            feedback = Feedback(
                scan_id=scan_id,
                is_accurate=feedback_data.is_accurate,
                user_comment=feedback_data.user_comment,
            )
            db.add(feedback)

        db.commit()
        db.refresh(feedback)

        return feedback

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving feedback: {e!s}",
        )
