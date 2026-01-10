from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Scan, User
from ...schemas import UploadResponse
from ...services import DicomService
from ..deps import get_current_user

router = APIRouter(prefix="/scans")


@router.post(
    "/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED
)
async def upload_dicom(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if not file.filename or not file.filename.endswith(".zip"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only ZIP archives are supported",
            )

        file_content = await file.read()
        file_hash = DicomService.calculate_hash(file_content)
        print(f"[DEBUG] File hash: {file_hash}")

        existing_scan = (
            db.query(Scan)
            .filter(Scan.file_hash == file_hash, Scan.user_id == current_user.id)
            .first()
        )

        if existing_scan:
            print(f"[DEBUG] Found existing scan by hash with ID: {existing_scan.id}")
            return UploadResponse(
                status="exists",
                scan_id=existing_scan.id,
                message="This study already exists in your history",
                slice_count=existing_scan.slice_count,
            )

        batch_id = DicomService.generate_batch_id()

        try:
            extract_dir = DicomService.save_and_extract_zip(file_content, batch_id)
            dicom_data = DicomService.parse_dicom_files(extract_dir)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )

        print(f"[DEBUG] Patient: {dicom_data['patient_name']}")
        print(f"[DEBUG] Unique slices: {dicom_data['slice_count']}")

        new_scan = Scan(
            file_id=batch_id,
            file_hash=file_hash,
            study_instance_uid=dicom_data["study_instance_uid"],
            patient_name=dicom_data["patient_name"],
            status="completed",
            slice_count=dicom_data["slice_count"],
            user_id=current_user.id,
        )

        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)

        print(f"[DEBUG] Created new scan with ID: {new_scan.id}")

        return UploadResponse(
            status="success",
            scan_id=new_scan.id,
            message=f"Successfully uploaded {dicom_data['slice_count']} slices",
            slice_count=dicom_data["slice_count"],
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {e!s}",
        )
