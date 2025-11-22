from flask import Flask, jsonify, request
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv(".env")

app = Flask(__name__)

# ------------------ Configuration ------------------
PORT = int(os.getenv("PLANT_PORT", ))
SERV = os.getenv("SERV")
MONGO = os.getenv("MONGODB_URL")

# ------------------ Helpers ------------------
def get_client():
    """Create MongoDB connection."""
    return MongoClient(MONGO)

def check_auth():
    """Verify API key."""
    return request.headers.get("serv") == SERV

# ------------------ Routes ------------------

@app.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")}), 200


@app.route("/api/plant", methods=["GET"])
def get_plant_data():
    """Fetch all AI plant data and images."""
    if not check_auth():
        return jsonify({"error": "Unauthorized"}), 401

    try:
        with get_client() as client:
            db = client["Sensor"]

            # Projection to fetch only plant fields
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

            # Filter only available plants
            plant_data = {
                key: value for key, value in record.items() if key.startswith("Plant_")
            }

            print(f"[PLANT] Returned {len(plant_data)} plant records with images")
            return jsonify(plant_data)
    except Exception as e:
        print(f"[ERROR:/api/plant] {e}")
        return jsonify({"error": "Internal Server Error"}), 500


# ------------------ Main ------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
