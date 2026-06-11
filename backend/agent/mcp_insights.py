from agent.mcp_tools import *
from agent.gemini_agent import model


def generate_insights():

    transaction_count = get_transaction_count()

    alert_count = get_alert_count()

    high_risk = len(
        get_high_risk_transactions()
    )

    recent_transactions = get_recent_transactions()

    recent_summary = []

    for tx in recent_transactions:

        recent_summary.append({
            "amount": tx.get("transaction", {}).get("amount"),
            "risk_level": tx.get("risk_analysis", {}).get("risk_level"),
            "recommended_action":
                tx.get("ai_analysis", {}).get("recommended_action"),
            "alert_severity":
                tx.get("alert", {}).get("severity")
        })

    prompt = f"""
    You are FinGuard-Agent,
    an autonomous banking security AI.

    Analyze the fraud database and generate a concise report.

    Database Statistics:

    Total Transactions:
    {transaction_count}

    Total Alerts:
    {alert_count}

    High Risk Transactions:
    {high_risk}

    Recent Transactions:
    {recent_summary}

    Generate:

    1. Security Summary (2 lines)

    2. Fraud Trends
    (identify patterns)

    3. Risk Level
    (Low / Medium / High / Critical)

    4. Recommended Actions
    (maximum 3 bullet points)

    Keep the response professional and concise.
    """

    response = model.generate_content(prompt)

    return response.text