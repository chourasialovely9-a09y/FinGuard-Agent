def take_action(risk_result):

    risk_level = risk_result["risk_level"]

    if risk_level == "HIGH":
        return {
            "action": "BLOCK_TRANSACTION",
            "message": "Transaction blocked due to high fraud risk"
        }

    elif risk_level == "MEDIUM":
        return {
            "action": "OTP_VERIFICATION",
            "message": "Additional OTP verification required"
        }

    else:
        return {
            "action": "ALLOW_TRANSACTION",
            "message": "Transaction appears safe"
        }