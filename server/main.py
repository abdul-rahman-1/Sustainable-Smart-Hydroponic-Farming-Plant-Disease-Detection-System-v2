from flask import Flask
from pymongo import MongoClient
import requests
import time
from threading import Thread

app = Flask(_name_)

# MongoDB connection
MONGO_URI = "mongodb+srv://AdminClint0001:uTYZ4fPph7whTpXC@cluster0.eifjnhd.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client['Sensor']
collection = db['Data']

# ESP32 URLs
ESP32_ENV_URL = "http://172.25.60.213/"    # Temp, Humidity, CO2, FlowRate, Lux
ESP32_WATER_URL = "http://172.25.161.53/"  # Distance, TDS, pH_Value

RETRY_DELAY = 1  # seconds

def fetch_json(url):
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()
    except:
        return None
    return None

def ensure_base_document():
    # Ensures at least one document exists in the collection
    if collection.count_documents({}) == 0:
        base_doc = {
            "Sensor": "Initializing",
            "LastUpdate": {"Time": "", "Date": ""},
            "Avg_Temp": "", "Avg_Humid": "", "Avg_CO2": "", "Avg_FlowRate": "",
            "Avg_Level": "", "Avg_TDS": "", "Avg_pH": "", "Avg_Lux": "",
        }
        collection.insert_one(base_doc)
        print("📄 Base MongoDB document created.")

def update_data():
    ensure_base_document()
    sensor_status = "Initializing"

    while True:
        env_data = fetch_json(ESP32_ENV_URL)
        water_data = fetch_json(ESP32_WATER_URL)

        # Get current doc
        current = collection.find_one()
        if not current:
            print("⚠ Unexpected error: No document found.")
            time.sleep(RETRY_DELAY)
            continue

        # If one of the ESP32s is unreachable
        if not env_data or not water_data:
            collection.update_one({}, {"$set": {"Sensor": "Error_Offline"}}, upsert=True)
            print("⚠ ESP32 connection error. Status set to Error_Offline.")
            time.sleep(RETRY_DELAY)
            continue

        # Combined payload from both ESP32s
        payload = {
            "Temperature": env_data.get("Temperature", -1),
            "Humidity":    env_data.get("Humidity", -1),
            "CO2":         env_data.get("CO2", -1),
            "FlowRate":    env_data.get("FlowRate", -1),
            "Lux":         env_data.get("Lux", -1),  # Lux sensor
            "Level":       water_data.get("Distance", -1),
            "TDS":         water_data.get("TDS", -1),
            "pH":          water_data.get("pH_Value", -1),
        }

        # Validate
        is_valid = all(v != -1 for v in payload.values())
        new_status = "Online" if is_valid else "Error_Offline"

        # Always update sensor status
        collection.update_one({}, {"$set": {"Sensor": new_status}}, upsert=True)

        if new_status == "Error_Offline":
            print("⚠ Invalid values in data. Status set to Error_Offline.")
            time.sleep(RETRY_DELAY)
            continue

        # Rolling average logic
        def rolling_avg(field, new_val):
            entries = current.get(field, "").split(",")
            today = time.strftime("%d/%b")
            new_entry = f"{new_val:.1f}:{today}"

            if current.get("LastUpdate", {}).get("Date") != time.strftime("%d/%m"):
                entries = [new_entry] + entries[:6]
            else:
                if entries:
                    entries[0] = new_entry
                else:
                    entries = [new_entry]

            return ",".join(entries)

        update_doc = {
            **payload,
            "LastUpdate": {
                "Time": time.strftime("%H:%M"),
                "Date": time.strftime("%d/%m"),
            },
            "Avg_Temp":     rolling_avg("Avg_Temp",     payload["Temperature"]),
            "Avg_Humid":    rolling_avg("Avg_Humid",    payload["Humidity"]),
            "Avg_CO2":      rolling_avg("Avg_CO2",      payload["CO2"]),
            "Avg_FlowRate": rolling_avg("Avg_FlowRate", payload["FlowRate"]),
            "Avg_Level":    rolling_avg("Avg_Level",    payload["Level"]),
            "Avg_TDS":      rolling_avg("Avg_TDS",      payload["TDS"]),
            "Avg_pH":       rolling_avg("Avg_pH",       payload["pH"]),
            "Avg_Lux":      rolling_avg("Avg_Lux",      payload["Lux"]),
        }

        collection.update_one({}, {"$set": update_doc})
        print("✅ MongoDB updated and sensor is ONLINE.")
        time.sleep(RETRY_DELAY)

# Background thread
Thread(target=update_data, daemon=True).start()

@app.route("/")
def home():
    return "🌿 Sensor Server Running"

if _name_ == "_main_":
    app.run(host="0.0.0.0", port=5000)