# 🌱 Smart Hydroponic Farming & AI-Based Plant Disease Detection System

A fully integrated, solar-powered smart hydroponic farming system enhanced with real-time IoT monitoring, automated water and nutrient control, and AI-driven plant health diagnostics. This end-to-end system is designed to optimize plant growth in controlled environments while reducing manual intervention and maximizing yield.

---

## 🚀 Key Features

### ✅ Real-Time Environmental Monitoring

* **Temperature & Humidity** – Captured using DHT sensors on ESP32.
* **CO₂ Levels** – Monitored using MH-Z19 (NDIR sensor).
* **Water Flow & Tank Levels** – Measured using flow meters and ultrasonic sensors.
* **TDS & pH Monitoring** – Provides accurate nutrient and acidity levels.
* **Light Intensity** – Measured via TSL2561 light sensor.

### ⚙️ Sensor Network

* **ESP32 Module 1**:

  * DHT11 (Temperature & Humidity)
  * MH-Z19 (CO₂ Sensor)
  * YF-G1 (Water Flow Sensor)
  * TSL2561 (Light Sensor)
* **ESP32 Module 2**:

  * HC-SR04 (Ultrasonic Water Level)
  * Analog TDS Sensor
  * Analog pH Sensor
* **NodeMCU**:

  * 2-Relay Control:

    * Wastewater Pump
    * Nutrient Delivery Pump
* **Raspberry Pi 5**:

  * Python-based data aggregator
  * Pi Camera for plant imaging
  * MongoDB (local/cloud)

---

## 📊 Automated Data Logging & Monitoring

* Python Flask server on Raspberry Pi pulls JSON from both ESP32s.
* MongoDB stores:

  * Latest readings
  * 7-day rolling averages
  * AI image prediction and accuracy
* Fields include: Temperature, Humidity, CO₂, pH, TDS, Lux, Water Level, Flow Rate, LastUpdate, Sensor Status.

---

## 🌐 IoT Architecture

* ESP32s host `/` endpoint returning JSON.
* RPi fetches sensor values and stores them in MongoDB.
* Node.js backend exposes APIs for dashboard frontend.

---

## 🧠 AI-Based Plant Disease Detection

### Pipeline

* **Device:** Raspberry Pi with Pi Camera
* **Preprocessing:** Resizing, Normalization, Color Histogram Equalization
* **Model:** TensorFlow Lite CNN
* **Classes:**

  * Healthy
  * Early Blight
  * Late Blight
  * Nutrient Deficiency
* **Output:** Predicted label + confidence

---

## ☀️ Solar-Powered System

* **Input:** 12V/24V Solar Panel
* **Battery:** Li-ion or LiFePO4
* **Monitoring:** INA219 (optional)
* **Relay Control:** NodeMCU handles auto cut-off and pump control

---

## 🧱 Tech Stack

| Component        | Stack                             |
| ---------------- | --------------------------------- |
| Microcontrollers | ESP32, NodeMCU                    |
| SBC              | Raspberry Pi 5                    |
| Languages        | Python, JavaScript, C++ (Arduino) |
| Frontend         | React.js, Chart.js                |
| Backend          | Node.js + Express.js              |
| Database         | MongoDB (Atlas or Local)          |
| ML               | TensorFlow Lite, OpenCV           |
| Hosting          | Netlify (Frontend), Railway (API) |

---

## 🗂️ Directory Structure

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
├── ml/                      # AI/ML pipeline
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

## ⚙️ Installation & Setup

### 🔀 Clone the Repository

```bash
git clone https://github.com/abdul-rahman-1/Smart-Hydroponic-Farming-Plant-Disease-Detection-System.git
cd Smart-Hydroponic-Farming-Plant-Disease-Detection-System
```

### 🚀 Backend Setup

```bash
cd server
cp .env.example .env
npm install
npm start
```

### 🎯 Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 🧠 ML Setup (Optional)

```bash
cd ml
pip install -r requirements.txt
python scripts/train.py
```

### 📡 Microcontroller Firmware

* Open `.ino` files in Arduino IDE
* Update Wi-Fi credentials
* Upload to respective ESP32 / NodeMCU

---

## 🌐 Live Demo

* **Web App:** [rk-iot.netlify.app](https://rk-iot.netlify.app)
* **API Server:** [rk-server.up.railway.app](https://rk-server.up.railway.app)

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.

---

## 📢 Acknowledgments

Special thanks to the open-source community and contributors who made this project possible.

---

> 🌟 Empowering agriculture with smart IoT and AI-driven plant care. 🌟
