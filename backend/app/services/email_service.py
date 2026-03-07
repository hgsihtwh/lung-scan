import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from ..core.config import settings


class EmailService:

    @staticmethod
    def send_email(
            to_email: str,
            subject: str,
            html_content: str,
    ) -> bool:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = to_email

            html_part = MIMEText(html_content, "html")
            msg.attach(html_part)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

            print(f"[EMAIL] Successfully sent to {to_email}")
            return True

        except Exception as e:
            print(f"[EMAIL] Failed to send to {to_email}: {e}")
            return False

    @staticmethod
    def send_verification_code(to_email: str, code: str) -> bool:
        subject = "Your Verification Code - Chest Scan"

        html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #233970;">Verification Code</h2>

                    <p>Thank you for registering with Chest Scan!</p>

                    <p>Please use the following code to complete your registration:</p>

                    <div style="margin: 30px 0; padding: 20px; background-color: #f5f3ea; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: #666;">Your verification code:</p>
                        <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #233970; letter-spacing: 8px;">
                            {code}
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #999;">This code will expire in 5 minutes</p>
                    </div>

                    <p>If you didn't request this code, please ignore this email.</p>

                    <p>Best regards,<br>
                    <strong>Chest Scan Team</strong></p>

                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                    <p style="font-size: 12px; color: #666;">
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </body>
            </html>
            """

        return EmailService.send_email(to_email, subject, html_content)

    @staticmethod
    def send_welcome_email(to_email: str, user_name: str) -> bool:
        subject = "Welcome to Chest Scan!"

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #233970;">Welcome to Chest Scan!</h2>

                <p>Hi {user_name or 'there'},</p>

                <p>Thank you for registering with Chest Scan. Your account has been successfully created.</p>

                <p>Our AI-powered chest CT analysis service is now ready to help you identify normal anatomy in CT scans.</p>

                <div style="margin: 30px 0; padding: 20px; background-color: #f5f3ea; border-left: 4px solid #233970;">
                    <p style="margin: 0;"><strong>Getting Started:</strong></p>
                    <ol style="margin: 10px 0;">
                        <li>Upload your DICOM archive (.zip)</li>
                        <li>Review CT slices in our viewer</li>
                        <li>Run AI analysis</li>
                        <li>Download detailed reports</li>
                    </ol>
                </div>

                <p>Best regards,<br>
                <strong>Chest Scan Team</strong></p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="font-size: 12px; color: #666;">
                    This is a research prototype. Results should be verified by qualified medical professionals.
                </p>
            </div>
        </body>
        </html>
        """

        return EmailService.send_email(to_email, subject, html_content)
