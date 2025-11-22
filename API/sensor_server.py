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

# Environment configuration
PORT = int(os.getenv("SENSOR_PORT", 3001))
SERV = os.getenv("SERV")
MONGO = os.getenv("MONGODB_URL")

# ------------------ Utility Functions ------------------

def get_client():
    """Create a new MongoDB client connection."""
    return MongoClient(MONGO)

def check_auth():
    """Check if the provided 'serv' key matches the secret key."""
    return request.headers.get("serv") == SERV

# ------------------ Routes ------------------

@app.route("/cron")
def cron():
    """Simple cron route to check MongoDB connection."""
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

@app.route("/api/data", methods=["GET"])
def get_sensor_data():
    """Fetch all sensor values excluding heavy plant/image fields."""
    if not check_auth():
        return jsonify({"error": "Unauthorized"}), 401

    try:
        with get_client() as client:
            db = client["Sensor"]

            # Projection: exclude all plant fields for performance
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

# ------------------ Run Server ------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
