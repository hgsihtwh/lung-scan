import io
from datetime import datetime

import pandas as pd


class ReportService:
    @staticmethod
    def generate_excel_report(
        patient_name: str,
        created_at: datetime,
        slice_count: int,
        verdict: str,
        probability: float,
        feedback_status: str,
        user_comment: str,
    ) -> io.BytesIO:
        data = {
            "Field": [
                "Study ID",
                "Date",
                "Slices Count",
                "Verdict",
                "Confidence",
                "User Feedback",
                "User Comment",
            ],
            "Value": [
                patient_name or "N/A",
                created_at.strftime("%Y-%m-%d %H:%M:%S"),
                slice_count,
                verdict,
                f"{probability * 100:.2f}%",
                feedback_status,
                user_comment,
            ],
        }

        df = pd.DataFrame(data)
        output = io.BytesIO()

        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Scan Report")

        output.seek(0)
        return output
