from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv(".env")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

PORT = int(os.getenv("PLANT_PORT", 3002))
SERV = os.getenv("SERV")
MONGO = os.getenv("MONGODB_URL")

def get_client():
    """Create MongoDB connection."""
    return MongoClient(MONGO)

def check_auth():
    """Check API key."""
    return request.headers.get("serv") == SERV

@app.route("/cron")
def cron():
    """Simple cron check for uptime services."""
    try:
        with get_client() as c:
            dbs = c.list_database_names()
        print(f"[CRON] OK {dbs}")
        return jsonify({
            "cron": "ok",
            "dbs": dbs,
            "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/plant", methods=["GET"])
def get_plant_data():
    """Fetch only AI and image data for all plants."""
    if not check_auth():
        return jsonify({"error": "Unauthorized"}), 401

    try:
        with get_client() as client:
            db = client["Sensor"]

            # Projection: include only Plant_1–Plant_5
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

            # Return only plants that exist (skip missing ones)
            plant_data = {
                key: value for key, value in record.items() if key.startswith("Plant_")
            }

            print(f"[PLANT] Sent {len(plant_data)} plant records with images")
            return jsonify(plant_data)

    except Exception as e:
        print(f"[ERROR:/api/plant] {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
