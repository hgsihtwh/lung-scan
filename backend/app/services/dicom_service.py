import hashlib
import os
import shutil
import uuid
import zipfile
from collections import defaultdict
from pathlib import Path

import pydicom

UPLOAD_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


class DicomService:
    @staticmethod
    def calculate_hash(content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    def save_and_extract_zip(content: bytes, batch_id: str) -> Path:
        temp_zip = UPLOAD_DIR / f"{batch_id}.zip"
        extract_dir = PROCESSED_DIR / batch_id

        with open(temp_zip, "wb") as buffer:
            buffer.write(content)

        try:
            with zipfile.ZipFile(temp_zip, "r") as z:
                z.extractall(extract_dir)
        except Exception as e:
            temp_zip.unlink(missing_ok=True)
            raise ValueError(f"Invalid ZIP archive: {e!s}")

        return extract_dir

    @staticmethod
    def parse_dicom_files(extract_dir: Path) -> dict:
        patient_groups = defaultdict(lambda: {"indices": set(), "paths": []})
        study_instance_uid = None

        for root, _, files in os.walk(extract_dir):
            for f in files:
                if f.startswith("."):
                    continue

                file_path = Path(root) / f

                try:
                    ds = pydicom.dcmread(file_path, stop_before_pixels=True)

                    if "PatientName" not in ds:
                        continue

                    patient_name = str(ds.PatientName)

                    if study_instance_uid is None and "StudyInstanceUID" in ds:
                        study_instance_uid = str(ds.StudyInstanceUID)

                    instance_number = (
                        int(ds.InstanceNumber) if "InstanceNumber" in ds else 0
                    )

                    patient_groups[patient_name]["indices"].add(instance_number)
                    patient_groups[patient_name]["paths"].append(file_path)

                except Exception as e:
                    shutil.rmtree(extract_dir, ignore_errors=True)
                    zip_path = UPLOAD_DIR / f"{extract_dir.name}.zip"
                    zip_path.unlink(missing_ok=True)
                    raise ValueError(f"Invalid DICOM file found: {f} - {e!s}")

        if not patient_groups:
            shutil.rmtree(extract_dir, ignore_errors=True)
            zip_path = UPLOAD_DIR / f"{extract_dir.name}.zip"
            zip_path.unlink(missing_ok=True)
            raise ValueError("No valid DICOM files found in archive")

        patient_name = list(patient_groups.keys())[0]
        unique_slice_count = len(patient_groups[patient_name]["indices"])

        return {
            "patient_name": patient_name,
            "slice_count": unique_slice_count,
            "study_instance_uid": study_instance_uid,
        }

    @staticmethod
    def get_slice_numbers(scan_dir: Path) -> list[int]:
        slice_numbers = set()

        if not scan_dir.exists():
            return []

        for root, _, files in os.walk(scan_dir):
            for f in files:
                if f.startswith("."):
                    continue

                file_path = Path(root) / f
                try:
                    ds = pydicom.dcmread(file_path, stop_before_pixels=True)
                    if "InstanceNumber" in ds:
                        slice_numbers.add(int(ds.InstanceNumber))
                except Exception:
                    continue

        return sorted(slice_numbers)

    @staticmethod
    def get_slice_file(scan_dir: Path, slice_number: int) -> Path | None:
        if not scan_dir.exists():
            return None

        for root, _, files in os.walk(scan_dir):
            for f in files:
                if f.startswith("."):
                    continue

                file_path = Path(root) / f
                try:
                    ds = pydicom.dcmread(file_path, stop_before_pixels=True)
                    if (
                        "InstanceNumber" in ds
                        and int(ds.InstanceNumber) == slice_number
                    ):
                        return file_path
                except Exception:
                    continue

        return None

    @staticmethod
    def generate_batch_id() -> str:
        return str(uuid.uuid4())
