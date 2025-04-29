from flask import Flask
from pymongo import MongoClient
import json
import requests
import time
from threading import Thread

app = Flask(__name__)

# MongoDB connection string (full credentials)
MONGO_URI = "mongodb+srv://AdminClint0001:uTYZ4fPph7whTpXC@cluster0.eifjnhd.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client['Sensor']
collection = db['Data']

# ESP32 URLs
ESP32_ENV_URL   = "http://192.168.164.179/"  # Temperature/Humidity/CO2/FlowRate
ESP32_WATER_URL = "http://192.168.164.68/"   # Distance_cm / TDS_ppm (new)

RETRY_DELAY = 1  # seconds between polls

def fetch_json(url):
    """GET JSON from an ESP32 endpoint, or return None on failure."""
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except requests.RequestException:
        pass
    return None

def update_data():
    sensor_status = "Offline"

    while True:
        # Fetch from both devices
        env   = fetch_json(ESP32_ENV_URL)
        water = fetch_json(ESP32_WATER_URL)

        # If either fails, mark Offline, skip update
        if not env or not water:
            if sensor_status != "Offline":
                collection.update_one({}, {"$set": {"Sensor": "Offline"}}, upsert=True)
                sensor_status = "Offline"
            print("One or both ESP32s offline → Sensor marked Offline")
            time.sleep(RETRY_DELAY)
            continue

        # Map JSON to our fields
        payload = {
            "Temperature": env["Temperature"],
            "Humidity":    env["Humidity"],
            "CO2":         env["CO2"],
            "FlowRate":    env["FlowRate"],
            "Level":       water["Distance_cm"],   # new
            "TDS":         water["TDS_ppm"],       # new
        }

        # Determine if sensors are “Online” or “Offline” by env data
        if any(payload[k] == -1 for k in ("Temperature","Humidity","CO2","FlowRate")):
            new_status = "Offline"
        else:
            new_status = "Online"

        # Update sensor status if changed
        if new_status != sensor_status:
            collection.update_one({}, {"$set": {"Sensor": new_status}}, upsert=True)
            sensor_status = new_status

        # Fetch the existing document
        current = collection.find_one({})
        if not current:
            print("No existing document found—skipping update")
            time.sleep(RETRY_DELAY)
            continue

        # Helper: update a 7-day rolling average list stored as "v:DD/Mon,..." 
        def rolling_avg(field, new_val):
            entries = current[field].split(',')
            today_tag = time.strftime("%d/%b")
            entry_str = f"{new_val:.1f}:{today_tag}"
            if current['LastUpdate']['Date'] != time.strftime("%d/%m"):
                # new day: prepend, drop oldest
                entries = [entry_str] + entries[:6]
            else:
                # same day: replace today's value
                entries[0] = entry_str
            return ','.join(entries)

        # Build update document
        update_doc = {
            **payload,
            "LastUpdate": {
                "Time": time.strftime("%H:%M"),
                "Date": time.strftime("%d/%m"),
            },
            "Avg_Temp":     rolling_avg('Avg_Temp',     payload['Temperature']),
            "Avg_Humid":    rolling_avg('Avg_Humid',    payload['Humidity']),
            "Avg_CO2":      rolling_avg('Avg_CO2',      payload['CO2']),
            "Avg_FlowRate": rolling_avg('Avg_FlowRate', payload['FlowRate']),
            "Avg_Level":    rolling_avg('Avg_Level',    payload['Level']),
            "Avg_TDS":      rolling_avg('Avg_TDS',      payload['TDS']),
        }

        # Perform the update
        collection.update_one({}, {"$set": update_doc})
        print(f"UPDATED: {update_doc}")
        time.sleep(RETRY_DELAY)

# Start background thread
update_thread = Thread(target=update_data, daemon=True)
update_thread.start()

@app.route("/")
def home():
    return "Farming Data Server is Running"

if __name__ == "__main__":
    # Allow external connections
    app.run(host="0.0.0.0", port=5000)
