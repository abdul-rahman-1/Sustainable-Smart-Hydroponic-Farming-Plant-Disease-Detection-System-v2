from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load env vars
load_dotenv(".env")

app = Flask(__name__)

# ✅ Allow access from anywhere (no origin restriction)
CORS(app, resources={r"/*": {"origins": "*"}})

PORT = int(os.getenv("PLANT_PORT"))
SERV = os.getenv("SERV")
MONGO = os.getenv("MONGODB_URL")

# ------------------ Helpers ------------------
def get_client():
    return MongoClient(MONGO)

def check_auth():
    """Allow only if API key matches"""
    key = request.headers.get("serv")
    return key == SERV

# ------------------ Routes ------------------

@app.route("/health", methods=["GET"])
def health_check():
    """Health check route for uptime verification"""
    return jsonify({"status": "ok", "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")}), 200

@app.route("/api/plant", methods=["GET"])
def get_plant_data():
    """Fetch all AI plant data with images"""
    if not check_auth():
        return jsonify({"error": "Unauthorized"}), 401

    try:
        with get_client() as client:
            db = client["Sensor"]
            projection = {
                "_id": 0,
                "Plant_1": 1,
                "Plant_2": 1,
                "Plant_3": 1,
                "Plant_4": 1,
                "Plant_5": 1
            }
            record = db["Data"].find_one({}, projection)
            if not record:
                return jsonify({"error": "No plant data found"}), 404

            return jsonify({k: v for k, v in record.items() if k.startswith("Plant_")})
    except Exception as e:
        print(f"[ERROR:/api/plant] {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
