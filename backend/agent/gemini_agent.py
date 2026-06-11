import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("models/gemini-flash-lite-latest")


def analyze_transaction(data):

    try:

        prompt = f"""
        You are an AI banking fraud detection agent.

        Analyze this transaction:

        {data}

        Return ONLY valid JSON in this format:

        {{
            "risk_score": number,
            "fraud_probability": "Low/Medium/High",
            "recommended_action": "Allow/Review/Block",
            "freeze_account": true_or_false,
            "reason": "short explanation"
        }}
        """

        response = model.generate_content(prompt)

        cleaned = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        parsed = json.loads(cleaned)

        return parsed

    except Exception as e:

        return {
            "error": str(e)
        }