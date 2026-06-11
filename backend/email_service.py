import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("MAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("MAIL_PASSWORD")


async def send_fraud_alert_email(subject, body, recipient):

    server = None

    try:

        msg = MIMEMultipart()

        msg["From"] = EMAIL_ADDRESS
        msg["To"] = recipient
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)

        server.starttls()

        server.login(
            EMAIL_ADDRESS,
            EMAIL_PASSWORD
        )

        server.sendmail(
            EMAIL_ADDRESS,
            recipient,
            msg.as_string()
        )

        print("✅ Fraud alert email sent successfully")

        return True

    except Exception as e:

        print(f"❌ Email Error: {e}")

        return False

    finally:

        if server:
            server.quit()