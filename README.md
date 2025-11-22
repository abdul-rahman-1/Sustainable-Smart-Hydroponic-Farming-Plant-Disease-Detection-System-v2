# 🌱 LeafGuard — Smart IoT-Based Hydroponic Plant Monitoring & AI Disease Detection

A next-generation **IoT + AI-based hydroponic farming system** that intelligently monitors environmental and water parameters, automates irrigation and nutrient balance, and detects plant diseases in real time using AI-powered image processing.

Developed by **Abdul Rahman** & **Mohammed Qambar Syed**
Under the supervision of **Dr. Sheeba Praveen**

---

## 🚀 Project Overview

**LeafGuard** is a cloud-connected, solar-assisted, AI-enhanced hydroponic farming solution.
It integrates **IoT sensor nodes (ESP32)**, a **Raspberry Pi 5 master controller**, and **AI-based plant image analysis** to automate all key stages of hydroponic cultivation — from environmental monitoring and water management to disease detection and growth analytics — visualized in real time on an interactive React.js dashboard.

---

## ⚙️ Hardware Architecture

### 🧩 ESP32 Sensor Network (4 Modules)

Each ESP32 connects via Wi-Fi to the **Raspberry Pi 5**, which acts as the master controller.

#### **ESP32 #1 — Environmental Data**

* **Sensors:** DHT11 (Temperature & Humidity), MH-Z19 (CO₂), TSL2561 (Light Intensity), Flow Sensor (YF-G1)
* **Purpose:** Monitors air conditions, CO₂, and nutrient water flow.

#### **ESP32 #2 — Water Quality**

* **Sensors:** HC-SR04 (Water Level), Analog pH Sensor, Analog TDS Sensor
* **Purpose:** Tracks pH, TDS, and water level for nutrient and purity control.

#### **ESP32 #3 — Power Monitoring**

* **Sensors:** 3 × ACS712 Current Sensors (Battery, Load, Solar Charge)
* **Purpose:** Monitors current and voltage data for energy analytics and solar power chart generation.

#### **ESP32 #4 — Automated Control**

* **Controls:** Dual Relay Module

  * **Relay 1:** Activates base pump to reduce pH value
  * **Relay 2:** Refills water from filter bucket to main bucket
* **Purpose:** Handles water and nutrient flow automation.

---

## 💻 Raspberry Pi 5 — Master Controller

Acts as the **central brain** coordinating all IoT and AI operations.

### Main Functions

* Runs `main.py`, which alternates between:

  1. **`update_sensor.py`** — Collects data from all ESP32 nodes for 10 seconds and updates MongoDB.
  2. **`update_plant.py`** — Executes AI-based plant disease detection and growth measurement.

### AI & Automation Pipeline

1. Turns off artificial light before capturing images.
2. Captures **front** and **side** images using dual cameras.
3. Detects disease and measures height growth vs. previous day.
4. Moves camera using a stepper motor (A4988 Driver + GPIO Control) to take 5 sequential images.
5. Uploads data, images (Base64), and AI results to MongoDB.
6. Waits 10 minutes before restarting the process.

---

## ☁️ Cloud Infrastructure

### **Database: MongoDB Atlas**

* Stores sensor data, AI results, and historical records.
* Maintains rolling 7-day averages.
* Tracks sensor status (Online / Offline / Error).

### **API Servers**

* 🌱 **Plant Data API:** [`https://api-plant.onrender.com`](https://api-plant.onrender.com)
* 💧 **Sensor Data API:** [`https://smart-hydroponic-farming-plant-disease.onrender.com`](https://smart-hydroponic-farming-plant-disease.onrender.com)

Both servers fetch data from MongoDB and expose REST endpoints for the dashboard.

---

## 🖥️ Web Dashboard (UI)

**URL:** [https://rk-iot.netlify.app](https://rk-iot.netlify.app)
**Framework:** React.js + Chart.js

### Key Features

* 📊 Real-time visualization of Temperature, Humidity, CO₂, Light, pH, TDS, Flow Rate, Water Level, and Power Usage.
* 🧠 Displays AI predictions for plant disease type and confidence.
* ⏳ Fallback to 7-day historical averages when sensors are offline.
* ⚠️ Alerts for abnormal readings or communication failures.
* 🌱 Continuous data updates from Render APIs.

---

## 🧠 AI System — Plant Disease Detection & Growth Analysis

* **Input:** Pi Camera images (captured under controlled lighting).
* **Preprocessing:** Resizing → Normalization → Histogram Equalization.
* **Model:** TensorFlow / PyTorch CNN converted to TensorFlow Lite.
* **Classes:**

  * Healthy
  * Early Blight
  * Late Blight
  * Nutrient Deficiency
* **Output:** Predicted class + confidence score.
* **Storage:** MongoDB (Base64 image + AI result + growth metrics).

---

## 🌐 System Architecture

```mermaid
flowchart TD

    subgraph Sensors
        DHT11[DHT11 - Temp & Humidity]
        CO2[MH-Z19 - CO₂]
        Flow[YF-G1 - Flow Rate]
        Light[TSL2561 - Light]
        pH[pH Sensor]
        TDS[TDS Sensor]
        Level[HC-SR04 - Water Level]
        Curr[ACS712 x3 - Power Data]
    end

    subgraph ESP32s
        ESP1[ESP32 #1 - Env Data]
        ESP2[ESP32 #2 - Water Quality]
        ESP3[ESP32 #3 - Power Monitoring]
        ESP4[ESP32 #4 - Relay Control]
    end

    subgraph RPi[📦 Raspberry Pi 5]
        mainpy[main.py]
        sensorpy[update_sensor.py]
        plantpy[update_plant.py]
        Motor[Stepper Motor Driver]
        Cam[Dual Cameras]
        AI[AI Model]
    end

    Mongo[MongoDB Atlas]
    API1[Plant API]
    API2[Sensor API]
    Web[🌐 rk-iot.netlify.app]

    %% Connections
    Sensors --> ESP32s
    ESP32s -->|Wi-Fi JSON| RPi
    Cam --> AI --> RPi
    RPi --> Mongo --> API1 --> Web
    RPi --> Mongo --> API2 --> Web
    RPi --> Motor --> Cam
```

---

📸 **Circuit Diagrams & Screenshots**

| Image                                                   | Description                          |
| ------------------------------------------------------- | ------------------------------------ |
| ![ESP Circuit](https://rk-iot.netlify.app/images/1.jpg) | Sensor Circuit Diagram (ESP1 + ESP2) |
| ![UI](https://rk-iot.netlify.app/images/2.png)          | Dashboard – Sensor View              |
| ![UI](https://rk-iot.netlify.app/images/3.png)          | Dashboard – Averages Graph           |
| ![UI](https://rk-iot.netlify.app/images/4.png)          | Dashboard – pH & TDS                 |
| ![DFD](https://rk-iot.netlify.app/images/5.png)         | Data Flow Diagram                    |
| ![Power](https://rk-iot.netlify.app/images/6.png)       | Power System Diagram                 |

---

## ☀️ Solar Power & Energy Monitoring

* **2 × 20 W 12 V Solar Panels** (Loom) – one powers system, one charges batteries.
* **Battery Bank:** 2 × 12 V 6 Ah Li-ion with 20 A Solar Charge Controller.
* **Power Switching:** 12 V Relay System with auto source logic.
* **Converters:**

  * 5 V 4 A for ESP32 modules.
  * 5 V 4 A for Raspberry Pi.
* **Monitoring:** ESP32 #3 (ACS712) records power draw and solar flow for charts.

---

## 🧱 Tech Stack

| Component        | Stack                             |
| ---------------- | --------------------------------- |
| Microcontrollers | ESP32 × 4                         |
| SBC              | Raspberry Pi 5                    |
| Languages        | Python, C++ (Arduino), JavaScript |
| Frontend         | React.js, Chart.js                |
| Backend          | Flask + Express.js                |
| Database         | MongoDB Atlas                     |
| AI               | TensorFlow Lite, OpenCV           |
| Hosting          | Render (API), Netlify (Frontend)  |

---

## 🗂️ Directory Structure

```bash
LeafGuard/
├── client/                   # React frontend
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       └── utils/
│
├── sensors/                  # ESP32 firmware
│   ├── esp32_1.ino
│   ├── esp32_2.ino
│   ├── esp32_3.ino
│   └── esp32_4.ino
│
├── raspberrypi/              # Python control scripts
│   ├── main.py
│   ├── update_sensor.py
│   ├── update_plant.py
│   └── ai_model/
│       ├── detect.py
│       ├── model.tflite
│       └── utils.py
│
├── server/                   # Flask + Express APIs
│   ├── flask_api/
│   └── express_api/
│
├── docs/
│   ├── LeafGuard_Overview.md
│   └── API_Documentation.md
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/abdul-rahman-1/LeafGuard-Hydroponic-System.git
cd LeafGuard-Hydroponic-System
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
npm start
```

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 4️⃣ Raspberry Pi Setup

```bash
sudo apt update
pip install -r requirements.txt
python main.py
```

### 5️⃣ ESP32 Firmware

* Open `.ino` files in Arduino IDE
* Update Wi-Fi credentials
* Upload to ESP32 boards

---

## 🌐 Live Demo

* **Dashboard:** [https://rk-iot.netlify.app](https://rk-iot.netlify.app)
* **Plant API:** [https://api-plant.onrender.com](https://api-plant.onrender.com)
* **Sensor API:** [https://smart-hydroponic-farming-plant-disease.onrender.com](https://smart-hydroponic-farming-plant-disease.onrender.com)

---

## 📄 License

MIT License — see [`LICENSE`](./LICENSE) for details.

---

## 🙌 Acknowledgments

Supervised by **Dr. Sheeba Praveen**
Developed by **Abdul Rahman** & **Mohammed Qambar Syed**

> 🌿 Empowering hydroponics with IoT and Edge AI — Let plants speak, we listen. 🌿
