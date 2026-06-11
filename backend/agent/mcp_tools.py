from database import (
    transactions_collection,
    alerts_collection
)
from database import transactions_collection, alerts_collection

def get_transaction_count():
    return transactions_collection.count_documents({})

def get_alert_count():
    return alerts_collection.count_documents({})

def get_high_risk_transactions():

    return list(
        transactions_collection.find(
            {
                "risk_analysis.risk_level": "HIGH"
            }
        )
    )

def get_recent_transactions(limit=5):

    return list(
        transactions_collection.find()
        .sort("timestamp", -1)
        .limit(limit)
    )

def get_latest_alerts(limit=5):

    return list(
        alerts_collection.find()
        .sort("timestamp", -1)
        .limit(limit)
    )