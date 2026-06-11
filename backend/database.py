from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv
from datetime import datetime
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client["finguard_agent"]

transactions_collection = db["transactions"]
alerts_collection = db["alert"]


def save_transaction_record(data):

    data["timestamp"] = datetime.utcnow()

    result = transactions_collection.insert_one(data)

    return str(result.inserted_id)