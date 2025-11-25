# CamView — Final Plant API Documentation (Frontend + Backend Integration)

## **Purpose**

This document summarizes the final architecture, logic, and behavior of the **CamView** component and its backend `/api/plant/*` API integration for the **LeafGuard IoT Hydroponic System**. The CamView interface visualizes real-time AI plant data fetched sequentially from the backend and displays each plant's details progressively.

---

## **Backend Overview**

**Base URL:** `https://api-server-0f64.onrender.com/`

**API Endpoints Used:**

```
/api/plant/1
/api/plant/2
/api/plant/3
/api/plant/4
/api/plant/5
```

Each endpoint serves data for a specific plant. The backend is built using **Flask** and **MongoDB Atlas** as the database. It returns structured plant data documents with images stored as Base64-encoded strings.

### **Authentication**

All routes require the custom request header:

```
serv: <secret_key>
```

The key value is defined in both frontend `.env` (`VITE_REACT_KEY`) and backend `.env` (`SERV`).

### **CORS Policy**

Backend uses the following configuration to enable frontend communication:

```python
from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": "*"}})
```

This ensures all routes include the header:

```
Access-Control-Allow-Origin: *
```

allowing requests from any domain.

---

## **Database Structure (MongoDB Atlas)**

**Database Name:** `Sensor`

**Collections:**

```
Plant_1
Plant_2
Plant_3
Plant_4
Plant_5
```

Each `Plant_n` collection holds a single document (latest AI detection and sensor analysis for that plant).

**Document Schema Example:**

```json
{
  "_id": "ObjectId(...)",
  "image": "<base64-encoded-image>",
  "label": "Healthy",
  "confidence": 0.9825,
  "signal": "green",
  "height_cm": 14.7,
  "predicted_height_cm": 15.8,
  "timestamp": "2025-11-25 10:30:22",
  "LastUpdated": "2025-11-25 10:31:00"
}
```

### **Data Field Descriptions:**

| Field                 | Type            | Description                                                         |
| --------------------- | --------------- | ------------------------------------------------------------------- |
| `image`               | string (Base64) | Captured plant image (side or top view).                            |
| `label`               | string          | AI classification result (e.g., Healthy, Blight, Deficiency).       |
| `confidence`          | float           | Prediction confidence (0.0 - 1.0).                                  |
| `signal`              | string          | Status color (`green`, `yellow`, or `red`) indicating plant health. |
| `height_cm`           | float           | Measured height of the plant in centimeters.                        |
| `predicted_height_cm` | float           | AI-predicted next height based on trend data.                       |
| `timestamp`           | string          | Capture timestamp from Raspberry Pi.                                |
| `LastUpdated`         | string          | MongoDB document update timestamp.                                  |

---

## **Frontend Component Behavior (CamView.jsx)**

**Framework:** React (Vite.js)

### **Key Functional Flow:**

1. When the user navigates to `/CamView`, the component automatically starts fetching plant data sequentially from `/api/plant/1` → `/api/plant/5`.
2. Each fetch call is made with the header `{ serv: VITE_REACT_KEY }` for authorization.
3. As each plant's response is received:

   * The corresponding plant card is **instantly rendered** in the grid.
   * The progress bar increases by **20% per plant**.
4. Once all five plants are fetched:

   * Fetching stops completely (no auto-refresh).
   * The progress bar and status message disappear.
   * A final message appears: **“All plant data loaded. Click Refresh for latest data.”**
   * A **Refresh Data** button appears to rerun the fetch sequence.

---

## **Frontend Data Handling**

Each response from `/api/plant/{id}` is normalized into the following structure:

```json
{
  "id": 1,
  "image": "<base64>",
  "label": "Healthy",
  "confidence": 0.97,
  "signal": "green",
  "height_cm": 15.2,
  "predicted_height_cm": 16.1,
  "timestamp": "2025-11-25 10:30:22",
  "LastUpdated": "2025-11-25 10:31:00"
}
```

If an API call fails or returns empty, a placeholder card is rendered:

```json
{
  "id": 2,
  "error": true
}
```

This ensures UI consistency even when one or more plants are offline or data is missing.

---

## **UI / UX Behavior Summary**

| Phase                   | UI Behavior                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| **Initial Load**        | Shows loading state with progress bar and status message.                                         |
| **Sequential Fetching** | Displays each card immediately upon receiving each plant’s data; progress updates accordingly.    |
| **Completion**          | Progress bar disappears, message appears: “All plant data loaded. Click Refresh for latest data.” |
| **Manual Refresh**      | Button restarts fetching process (resets cards and progress).                                     |

**Visual Indicators:**

* **Green badge** → Plant healthy / normal.
* **Yellow badge** → Warning / moderate stress.
* **Red badge** → Critical / disease detected.

---

## **Environment Variables (.env)**

Frontend (`.env`):

```
VITE_REACT_KEY=<your_secret_key>
VITE_API_BASE=https://api-server-0f64.onrender.com
```

Backend (`.env`):

```
SERV=<your_secret_key>
MONGODB_URL=<your_mongodb_connection_uri>
PORT=3000
```

Ensure both values for `SERV` and `VITE_REACT_KEY` match.

Restart both frontend (`npm run dev`) and backend (`python server.py`) after updating `.env`.

---

## **Performance & Optimization Suggestions**

* Compress Base64 images before sending from Raspberry Pi (use Pillow or OpenCV).
* Store thumbnail versions in MongoDB for dashboard visualization.
* Keep full-resolution versions in separate S3 bucket or cloud storage.
* If API latency is high, enable parallel fetch mode (Promise.all) in React.
* Cache recent responses in `localStorage` or via Service Worker for offline fallback.

---

## **Troubleshooting**

| Issue                 | Likely Cause                       | Fix                                                            |
| --------------------- | ---------------------------------- | -------------------------------------------------------------- |
| **CORS Error**        | Backend missing CORS headers       | Ensure `flask_cors` is imported and initialized.               |
| **401 Unauthorized**  | Incorrect `serv` header            | Verify `SERV` and `VITE_REACT_KEY` match in both `.env` files. |
| **Image not showing** | Invalid Base64 data                | Confirm backend is sending valid encoded image.                |
| **Slow loading**      | Large image size or Render latency | Reduce Base64 payload size or use CDN.                         |

---

## **Deployment Notes**

* **Frontend Host:** Netlify (`https://rk-iot.netlify.app`)
* **Backend Host:** Render (`https://api-server-0f64.onrender.com`)
* **Database:** MongoDB Atlas (Cluster: `Sensor`)

`CamView` works independently from other dashboard components. It only depends on `/api/plant/*` routes and does not require any additional API connections.

---

## **System Integration Summary**

**Hardware Source:** Raspberry Pi 5 + ESP32 Modules
**Backend Stack:** Flask + PyMongo + CORS + Render Hosting
**Frontend Stack:** React (Vite) + Bootstrap + Environment Config
**Data Flow:**

```
ESP32 → Raspberry Pi (Python AI + Capture) → MongoDB Atlas → Flask API → React Frontend
```

The CamView route visually connects the AI system’s output with the user dashboard, showing both growth analysis and disease prediction directly from MongoDB in real-time.

---

**Developed by:** Abdul Rahman & Mohammed Qambar Syed
**Supervised by:** Dr. Sheeba Praveen
**Project:** LeafGuard — Smart IoT-Based Hydroponic Plant Monitoring & AI Disease Detection

> Empowering Hydroponics with IoT and Edge AI — *Let plants speak, we listen.*
