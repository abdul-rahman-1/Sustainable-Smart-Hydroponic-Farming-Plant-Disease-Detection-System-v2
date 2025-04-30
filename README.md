# Smart Hydroponic Farming & AI-Based Plant Disease Detection System

A fully integrated, solar-powered smart hydroponic farming system enhanced with real-time IoT monitoring, automated water and nutrient control, and AI-driven plant health diagnostics. This end-to-end system is designed to optimize plant growth in controlled environments while reducing manual intervention and maximizing yield.

---

## 🚀 Key Features

### ✅ Real-Time Environmental Monitoring

- **Temperature & Humidity**: Captured using DHT sensors on ESP32.
- **CO₂ Levels**: Monitored to ensure air quality using MQ or NDIR sensors.
- **Water Flow & Tank Levels**: Flow meters and ultrasonic sensors determine water circulation and volume.
- **TDS & pH Measurement**: Real-time data on nutrient concentration and acidity for nutrient optimization.
- **Light Intensity**: Optional sensor support for managing lighting cycles.

### ⚙ Sensor Network

- **ESP32 Module 1**:
  - Temperature & Humidity
  - CO₂ Sensor
  - Water Flow Sensor
- **ESP32 Module 2**:
  - Ultrasonic Sensor (Water Level)
  - TDS Sensor
- **NodeMCU**:
  - Controls 2 relays:
    - Waste water pump
    - Nutrient delivery pump
- **Raspberry Pi 5**:
  - Data aggregator
  - MongoDB interface
  - Pi-Camera for plant image capture

### ⌛ Automated Data Logging

- Python scripts on the Raspberry Pi:
  - Pull data from ESP32 devices via HTTP (JSON format)
  - Parse and log data to MongoDB
  - Perform sanity checks and formatting
  - Schedule data pulls at defined intervals

### 🚪 IoT Infrastructure

- Sensor modules send data over Wi-Fi to defined local IPs.
- Raspberry Pi scrapes this data from the `/json` endpoint hosted by ESP modules.
- MongoDB provides historical data tracking and analytics support.

---

## 📦 API & Web Dashboard

### Backend

- **Built With:** Node.js + Express
- **Hosted On:** [Railway.app](https://railway.app)
- **Endpoints Include:**
  - `/api/sensors` - Get current sensor readings
  - `/api/history` - Time-series sensor data
  - `/api/image-analysis` - Trigger plant image diagnosis

### Frontend

- **Built With:** React.js
- **Hosted On:** [Netlify](https://rk-iot.netlify.app)
- **UI Components:**
  - Real-time charts for TDS, temperature, water level, etc.
  - Disease status with diagnostic images
  - Alert system for threshold breach (low water, high pH, etc.)

---

## 🧠 AI-Based Plant Disease Detection

### Overview

- **Goal:** Automatically detect plant disease symptoms using leaf images.
- **Edge Device:** Google Coral TPU (USB Accelerator)
- **Input:** High-resolution image from Pi Camera
- **Preprocessing:**
  - Resize & normalize
  - Color histogram equalization
- **Model:** TensorFlow Lite CNN (custom trained)
- **Labels:**
  - Healthy
  - Early Blight
  - Late Blight
  - Nutrient Deficiency
- **Output:** JSON with prediction class and confidence

---

## 🌋 Solar-Powered System

### Power Control

- **Input:** 12V or 24V Solar Panels
- **Battery:** Li-ion or LiFePO4 with charge controller
- **Monitoring:** Optional voltage/current sensor (INA219)
- **Safety:** Relay-based emergency cutoff controlled by NodeMCU

---

## 🌎 Tech Stack

- **Microcontrollers:** ESP32, NodeMCU
- **SBC:** Raspberry Pi 5
- **Languages:** Python, JavaScript, C++ (Arduino)
- **Backend:** Node.js, Express.js
- **Frontend:** React.js, Chart.js
- **Database:** MongoDB (Cloud or Local)
- **ML Framework:** TensorFlow Lite + OpenCV
- **Cloud:** Railway (API), Netlify (Frontend)

---

## 📁 Directory Structure

```bash
Smart-Hydroponic-Farming-Plant-Disease-Detection-System/
├── client/                   # React frontend
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       └── utils/
│
├── sensor code/             # ESP32 & NodeMCU firmware
│   └── farming/
│       ├── esp32_1.ino
│       ├── esp32_2.ino
│       └── nodemcu_relay.ino
│
├── server/                  # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
│
├── ml/                      # Machine learning pipeline
│   ├── model/
│   └── scripts/
│       ├── preprocess.py
│       ├── train.py
│       └── tflite_converter.py
│
├── docs/
│   ├── Smart_Hydroponic_Farming.md
│   └── API_Documentation.md
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔧 Installation

### Clone the Repository

```bash
git clone https://github.com/abdul-rahman-1/Smart-Hydroponic-Farming-Plant-Disease-Detection-System.git
cd Smart-Hydroponic-Farming-Plant-Disease-Detection-System
```

### Backend Setup

```bash
cd server
cp .env.example .env
npm install
npm start
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Microcontroller Firmware

- Open `.ino` files in Arduino IDE
- Update Wi-Fi credentials
- Upload to ESP32/NodeMCU boards

### Machine Learning (Optional)

```bash
cd ml
pip install -r requirements.txt
python scripts/train.py
```

---

## 🌐 Live Demo

- **Web App**: [rk-iot.netlify.app](https://rk-iot.netlify.app)
- **API**: [rk-server.up.railway.app](https://rk-server.up.railway.app)

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

🌟 **Empowering smart agriculture with AI and IoT.** 🌟

