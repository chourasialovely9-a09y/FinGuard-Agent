# backend/agent/risk_engine.py

def calculate_risk(transaction):
    score = 0
    reasons = []

    amount = transaction.get("amount", 0)

    # High amount transaction
    if amount > 50000:
        score += 30
        reasons.append("Large transaction amount")

    # New device detection
    if transaction.get("new_device"):
        score += 20
        reasons.append("New device login detected")

    # Foreign location
    if transaction.get("foreign_transaction"):
        score += 25
        reasons.append("Foreign transaction detected")

    # Failed login attempts
    failed_attempts = transaction.get("failed_attempts", 0)

    if failed_attempts > 3:
        score += 15
        reasons.append("Multiple failed login attempts")

    # Odd hour activity
    if transaction.get("odd_hour"):
        score += 10
        reasons.append("Transaction at unusual hours")

    # Final Risk Level
    if score >= 70:
        risk_level = "HIGH"

    elif score >= 40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "reasons": reasons
    }