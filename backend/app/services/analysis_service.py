from pathlib import Path

import requests

from ..core.config import settings

UPLOAD_DIR = Path("data/raw")


class AnalysisService:
    @staticmethod
    def run_analysis(file_id: str) -> dict:
        zip_path = UPLOAD_DIR / f"{file_id}.zip"

        if not zip_path.exists():
            raise FileNotFoundError("Study archive not found")

        try:
            with open(zip_path, "rb") as f:
                response = requests.post(
                    settings.MODEL_API_URL,
                    files={"file": (f"{file_id}.zip", f, "application/zip")},
                    timeout=300,
                )

            if response.status_code != 200:
                raise RuntimeError(f"Model API error: {response.text}")

            result = response.json()
            print(f"[DEBUG] Model response: {result}")

            classification = result.get("prediction", "").lower()
            probability = float(result.get("probability", 0.0))

            if classification == "normal":
                verdict = "Normal"
                confidence = 1.0 - probability
            else:
                verdict = "Pathology"
                confidence = probability

            return {
                "verdict": verdict,
                "confidence": round(confidence, 4),
            }

        except requests.exceptions.ConnectionError:
            raise ConnectionError("Model service is not available")
        except requests.exceptions.Timeout:
            raise TimeoutError("Model analysis timed out")
