from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Annotation, Scan, User
from ...models.audit_log import ACTION_ANNOTATION_CREATE
from ...schemas import AnnotationCreate, AnnotationResponse, AnnotationUpdate
from ...services.audit_service import write_log
from ..deps import get_current_user, require_doctor

router = APIRouter(prefix="/scans")


@router.get("/{scan_id}/annotations", response_model=list[AnnotationResponse])
async def get_annotations(
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

    return db.query(Annotation).filter(Annotation.scan_id == scan_id).all()


@router.post("/{scan_id}/annotations", response_model=AnnotationResponse, status_code=status.HTTP_201_CREATED)
async def create_annotation(
    scan_id: int,
    data: AnnotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

    annotation = Annotation(
        scan_id=scan_id,
        slice_number=data.slice_number,
        created_by_id=current_user.id,
        label=data.label,
        x1=data.x1,
        y1=data.y1,
        x2=data.x2,
        y2=data.y2,
    )
    db.add(annotation)
    db.commit()
    db.refresh(annotation)
    write_log(db, current_user.id, ACTION_ANNOTATION_CREATE, resource_type="scan",
              resource_id=scan_id, details=f"annotation_id={annotation.id}, slice={data.slice_number}")
    return annotation


@router.put("/{scan_id}/annotations/{annotation_id}", response_model=AnnotationResponse)
async def update_annotation(
    scan_id: int,
    annotation_id: int,
    data: AnnotationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    annotation = (
        db.query(Annotation)
        .filter(
            Annotation.id == annotation_id,
            Annotation.scan_id == scan_id,
            Annotation.created_by_id == current_user.id,
        )
        .first()
    )
    if not annotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Annotation not found")

    annotation.label = data.label
    db.commit()
    db.refresh(annotation)
    return annotation


@router.delete("/{scan_id}/annotations/{annotation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_annotation(
    scan_id: int,
    annotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    annotation = (
        db.query(Annotation)
        .filter(
            Annotation.id == annotation_id,
            Annotation.scan_id == scan_id,
            Annotation.created_by_id == current_user.id,
        )
        .first()
    )
    if not annotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Annotation not found")

    db.delete(annotation)
    db.commit()
