from flask import Flask, jsonify, request
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv(".env")

app = Flask(__name__)

# ------------------ Configuration ------------------
PORT = int(os.getenv("SENSOR_PORT"))
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


@app.route("/api/data", methods=["GET"])
def get_sensor_data():
    """Fetch all sensor values excluding plant/image fields."""
    if not check_auth():
        return jsonify({"error": "Unauthorized"}), 401

    try:
        with get_client() as client:
            db = client["Sensor"]

            # Projection: exclude plant data for performance
            projection = {
                "_id": 0,
                "Plant_1": 0,
                "Plant_2": 0,
                "Plant_3": 0,
                "Plant_4": 0,
                "Plant_5": 0
            }

            data = db["Data"].find_one({}, projection)
            if not data:
                return jsonify({"error": "No data found"}), 404

            print(f"[SENSOR] Data fetched successfully at {datetime.now()}")
            return jsonify(data)

    except Exception as e:
        print(f"[ERROR:/api/data] {e}")
        return jsonify({"error": "Internal Server Error"}), 500


# ------------------ Main ------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
