from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
import requests

load_dotenv()
app = Flask(__name__)

API_KEY = os.getenv("GEMINI_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

def call_gemini(user_message: str) -> str:
    try:
        headers = {"Content-Type": "application/json"}
        params  = {"key": API_KEY}
        payload = {
            "contents": [
                {"parts": [{"text": f"You are a friendly agriculture assistant for farmers.\nUser: {user_message}"}]}
            ]
        }
        resp = requests.post(API_URL, headers=headers, params=params, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"Sorry, I couldn’t fetch a live answer ({e})"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    msg = request.json.get("message", "")
    return jsonify({"reply": call_gemini(msg)})

if __name__ == "__main__":
    app.run(debug=True,port=5004)
