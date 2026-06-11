from agent.mcp_tools import (
    get_transaction_count,
    get_alert_count,
    get_recent_transactions
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from agent.mcp_insights import generate_insights
from agent.gemini_agent import analyze_transaction
from agent.risk_engine import calculate_risk
from agent.action_engine import take_action
from agent.alert_engine import generate_alert
import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY")
)
model=genai.GenerativeModel("models/gemini-flash-lite-latest")
from database import (
    transactions_collection,
    alerts_collection
)
from email_service import send_fraud_alert_email

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home Route
@app.get("/")
def home():
    return {
        "message": "FinGuard-Agent Running Successfully"
    }

# Get All Transactions
@app.get("/transactions")
async def get_transactions():

    transactions = list(
        transactions_collection.find().sort("timestamp", -1)
    )

    for t in transactions:

        # Convert MongoDB ObjectId
        t["_id"] = str(t["_id"])

        # Convert alert ObjectId if exists
        if "alert" in t and isinstance(t["alert"], dict):

            if "_id" in t["alert"]:
                t["alert"]["_id"] = str(t["alert"]["_id"])

    return transactions

# Get All Alerts
@app.get("/alerts")
async def get_alerts():

    alerts = list(
        alerts_collection.find().sort("_id", -1)
    )

    for a in alerts:
        a["_id"] = str(a["_id"])

    return alerts

# Dashboard Statistics
@app.get("/dashboard-stats")
async def dashboard_stats():

    total_transactions = transactions_collection.count_documents({})

    total_alerts = alerts_collection.count_documents({})

    high_risk_transactions = (
        transactions_collection.count_documents({
            "risk_analysis.risk_level": "HIGH"
        })
    )

    blocked_transactions = (
        transactions_collection.count_documents({
            "action.action": "BLOCK_TRANSACTION"
        })
    )

    return {
        "total_transactions": total_transactions,
        "total_alerts": total_alerts,
        "high_risk_transactions": high_risk_transactions,
        "blocked_transactions": blocked_transactions
    }
@app.get("/agent-insights")
async def agent_insights():

    try:

        insights = generate_insights()

        return {
            "success": True,
            "insights": insights
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }
# Main AI Analysis Route
@app.post("/analyze")
async def analyze(data: dict):

    # Step 1 - Risk Analysis
    risk_result = calculate_risk(data)

    # Step 2 - Autonomous Action
    action_result = take_action(risk_result)

    # Step 3 - Gemini AI Analysis
    ai_result = analyze_transaction(data)

    # Step 4 - Alert Generation
    alert_result = generate_alert(risk_result, data)

    # Store Alert if Generated
    if alert_result["alert"]:

        alert_insert = alerts_collection.insert_one({
            **alert_result,
            "timestamp": datetime.utcnow()
        })

        safe_alert = {
            "_id": str(alert_insert.inserted_id),
            "alert": alert_result["alert"],
            "severity": alert_result["severity"],
            "message": alert_result["message"],
            "timestamp": datetime.utcnow()
        }
        await send_fraud_alert_email(
            subject="🚨 FinGuard Fraud Alert",
            body=f"""
                High Risk Fraud Transaction Detected!

                Amount: ₹{data.get('amount')}
                Location: {data.get('location')}
                Device: {data.get('device')}

                Risk Level: {risk_result.get('risk_level')}
                Recommended Action: {action_result.get('action')}
                            """,
                            recipient=os.getenv("MAIL_USERNAME")
                        )

    else:

        safe_alert = {
            "alert": False
        }

    # Complete Transaction Data
    transaction_data = {
        "transaction": data,
        "risk_analysis": risk_result,
        "ai_analysis": ai_result,
        "action_taken": action_result,
        "alert": safe_alert,
        "timestamp": datetime.utcnow()
    }

    # Store Transaction
    transaction_insert = (
        transactions_collection.insert_one(transaction_data)
    )

    # Final Safe Response
    return {
        "success": True,
        "transaction_id": str(transaction_insert.inserted_id),
        "risk_analysis": risk_result,
        "ai_analysis": ai_result,
        "action_taken": action_result,
        "alert": safe_alert,
        "timestamp": datetime.utcnow()
    }

@app.post("/chat")
async def chat(data: dict):

    try:

        user_message = data.get("message", "").lower()

        # MCP Tool: Alert Count

        if "alert" in user_message:

            count = get_alert_count()

            return {
                "response":
                f"🚨 Current Alert Count: {count}"
            }

        # MCP Tool: Transaction Count

        if "transaction" in user_message:

            count = get_transaction_count()

            return {
                "response":
                f"📊 Total Transactions: {count}"
            }

        # MCP Tool: High Risk Transactions

        if "risk" in user_message:

            transactions = get_recent_transactions()

            high_risk = 0

            for tx in transactions:

                if (
                    tx.get("risk_analysis", {})
                    .get("risk_level")
                    == "HIGH"
                ):
                    high_risk += 1

            return {
                "response":
                f"🚨 High Risk Transactions: {high_risk}"
            }

        # MCP Tool: Generate Security Report

        if "report" in user_message:

            report = generate_insights()

            return {
                "response": report
            }

        # Gemini Fallback

        prompt = f"""
        You are FinGuard AI,
        an intelligent banking fraud detection assistant.

        User Question:
        {user_message}

        Give short and clear answers.
        """

        response = model.generate_content(prompt)

        return {
            "response": response.text
        }

    except Exception as e:

        print("CHAT ERROR:", e)

        return {
            "response":
            "AI assistant temporarily unavailable."
        }