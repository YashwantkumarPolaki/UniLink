import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_otp_email(to_email: str, otp: str):
    smtp_email = os.getenv("SMTP_EMAIL", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if not smtp_email or not smtp_password:
        raise Exception("SMTP_EMAIL and SMTP_PASSWORD must be set in .env")

    msg = MIMEMultipart()
    msg["From"] = smtp_email
    msg["To"] = to_email
    msg["Subject"] = "UniLink - Password Reset OTP"

    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0d0820; color: white; padding: 40px; border-radius: 16px; border: 1px solid rgba(167,139,250,0.2);">
      <h2 style="font-size: 24px; margin-bottom: 8px; color: #a78bfa;">UniLink Password Reset</h2>
      <p style="color: rgba(255,255,255,0.6); margin-bottom: 32px;">Someone requested a password reset for your account.</p>
      <div style="background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase;">Your OTP</p>
        <p style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #a78bfa;">{otp}</p>
      </div>
      <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0;">Valid for <strong style="color: white;">10 minutes</strong>. Do not share this with anyone.</p>
      <p style="color: rgba(255,255,255,0.25); font-size: 12px; margin-top: 24px;">If you did not request this, please ignore this email.</p>
    </div>
    """

    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, to_email, msg.as_string())
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        raise Exception(f"Failed to send email: {str(e)}")
