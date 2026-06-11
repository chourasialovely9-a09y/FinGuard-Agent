from email_service import send_fraud_alert_email
import os
from dotenv import load_dotenv

load_dotenv()


def generate_alert(risk_result, transaction):

    risk_level = risk_result["risk_level"]

    if risk_level == "HIGH":

        return {
            "alert": True,
            "severity": "CRITICAL",
            "message": "Potential fraud transaction detected",
            "transaction": transaction
        }

    elif risk_level == "MEDIUM":

        return {
            "alert": True,
            "severity": "WARNING",
            "message": "Suspicious transaction detected",
            "transaction": transaction
        }

    else:

        return {
            "alert": False,
            "severity": "LOW",
            "message": "Transaction safe"
        }


async def send_alert_email(alert_data):

    print("Alert Data:", alert_data)  # Debug

    if not alert_data.get("alert", False):
        return

    subject = f"🚨 FinGuard-Agent {alert_data['severity']} Alert"

    body = f"""
{alert_data['message']}

Severity: {alert_data['severity']}

Transaction Details:
{alert_data.get('transaction')}
"""

    await send_fraud_alert_email(
        subject=subject,
        body=body,
        recipient=os.getenv("MAIL_USERNAME")
    )