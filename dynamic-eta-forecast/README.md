# Dynamic ETA Forecast for Coaching Trains 🚆🤖

> **AI-Powered Real-Time Arrival Prediction Platform for Railway Operations**

[![Python 3.14](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-1.7+-orange.svg)](https://xgboost.readthedocs.io/)
[![React](https://img.shields.io/badge/React-18.0-61dafb.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Project Overview

**Dynamic ETA Forecast for Coaching Trains** is a full-stack AI-driven railway operation system designed to continuously calculate and update the **Expected Arrival Time (ETA)** of passenger/coaching trains at upcoming stations.

Traditional timetable displays only show static scheduled arrival times, which quickly become inaccurate due to speed variations, signal holds, track congestion, weather factors, and station dwell time overruns.

This application dynamically forecasts arrival times using the formula:

$$\text{Dynamic ETA} = \text{Current Delay} + \text{Predicted Segment Travel Time} + \text{Station Dwell Time} + \text{Route Conditions}$$

---

## 2. Main System Architecture

```text
[ LIVE TELEMETRY SIMULATOR / RAILWAY API ]
                     │
                     ▼
             [ DATA CLEANING ]
  (Validation, Speed Capping, GPS Filtering)
                     │
                     ▼
          [ FEATURE ENGINEERING ]
    (16 Spatial-Temporal Feature Vectors)
                     │
                     ▼
           [ XGBOOST ETA MODEL ]
(Segment Time & Dwell Regression Predictions)
                     │
                     ▼
           [ CONFIDENCE CHECK ]
   (Data Quality, Signal Bounds, Errors)
                     │
                     ▼
            [ REACT GIS DASHBOARD ]
  (Leaflet Map, Live ETA Timetable, Charts)
```

---

## 3. Technology Stack

* **Frontend**: React 18, JavaScript, HTML5/CSS3, Leaflet GIS, OpenStreetMap tiles, FontAwesome 6, Google Fonts (Outfit, Inter, JetBrains Mono).
* **Backend**: Python 3.14, FastAPI, Uvicorn, WebSockets, REST APIs.
* **Machine Learning**: XGBoost (`XGBRegressor`), Pandas, NumPy, Scikit-learn, Joblib.
* **Database**: SQLite (`backend/database/railway.db`) with modular structure for PostgreSQL migration.

---

## 4. Key Features

1. **Continuous Real-Time ETA Recalculation**: Automatically updates predictions every telemetry frame without page reloads.
2. **Built-in Live Train Simulator**: Telemetry simulator moving trains along realistic Indian Railway coaching corridors (12701 Rajdhani, 12702 Telangana, 12759 Charminar, 12951 Mumbai Rajdhani, 12626 Kerala Express).
3. **Interactive Simulation Controls**: Play, Pause, Speed adjustment (1x, 2x, 5x, 10x), and **Inject +15 Min Delay** button to evaluate AI adaptation live.
4. **Interactive GIS Route Map**: Leaflet map featuring moving train markers, polyline route highlights, and clickable station pins showing scheduled vs predicted times.
5. **Data Cleaning & Quality Pipeline**: Automated verification of GPS bounds, speed cap enforcement, and anomaly resolution stats.
6. **Confidence Audit Score**: Dynamic score (High 85-100%, Medium 60-84%, Low <60%) flagging data quality issues or high error variance.
7. **ML Model Performance Dashboard**: Live reporting of MAE, RMSE, R² score, accuracy within ±5 mins, and feature importances.

---

## 5. Machine Learning Methodology & Dataset

* **Dataset**: 15,000 synthetic historical journey segment logs generated in `data/historical_trains.csv`.
* **Model**: XGBoost Regressor (`n_estimators=180, max_depth=6, learning_rate=0.07`).
* **Target Variable**: `actual_segment_travel_time_min`.
* **Model Evaluation**:
  * **Mean Absolute Error (MAE)**: ~3.21 minutes
  * **Root Mean Squared Error (RMSE)**: ~4.14 minutes
  * **R² Score**: 0.9980
  * **Accuracy (within ±5 min)**: ~79.5%

---

## 6. Installation & How to Run Locally

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/dynamic-eta-forecast.git
cd dynamic-eta-forecast
```

### Step 2: Install Python Dependencies
```bash
python -m pip install -r requirements.txt
```

### Step 3: Run the Application
Run the root startup launcher:
```bash
python run.py
```
This script will automatically:
1. Generate synthetic dataset in `data/historical_trains.csv` (if not present).
2. Train and serialize the XGBoost model to `model/xgboost_model.pkl`.
3. Seed the SQLite database `backend/database/railway.db`.
4. Launch the FastAPI backend server on `http://127.0.0.1:8000`.
5. Open your default web browser to view the interactive dashboard.

---

## 7. How Live Simulation Works

The system includes a **Live Train Simulator** (`backend/services/simulator.py`) that simulates real physics for 5 passenger trains:
* Moves train coordinates along station polylines.
* Fluctuates speed realistically between 40 km/h and 125 km/h.
* Simulates station stoppage dwell countdowns.
* Generates signal hold delay variations.
* Broadcasts telemetry frames to connected clients every 2 seconds.

A **`DEMO LIVE DATA`** label is visibly displayed so operators know movement is simulated. A real railway API endpoint can replace the simulator by sending JSON telemetry to `POST /api/predict` or updating `live_telemetry`.

---

## 8. Backend API Documentation

### REST Endpoints
* `GET /api/trains` - List all active monitored trains.
* `GET /api/trains/{train_number}` - Details for specific train.
* `GET /api/trains/{train_number}/live` - Telemetry & data cleaning status.
* `GET /api/trains/{train_number}/eta` - Full station-by-station ETA forecast table & formula breakdown.
* `GET /api/trains/{train_number}/route` - Coordinates and station nodes for GIS map.
* `GET /api/model/status` & `GET /api/model/metrics` - Model health, MAE, RMSE, R² score.
* `POST /api/predict` - Real-time ETA prediction endpoint.
* `POST /api/simulator/control` - Simulator controls (`play`, `pause`, `speed`, `inject_delay`).

### Sample Prediction Request
`POST /api/predict`
```json
{
  "train_number": "12701",
  "current_delay": 18.0,
  "delay_trend": 1.0,
  "segment_distance_km": 130.0,
  "current_speed_kmh": 78.5,
  "hist_avg_travel_time_min": 95.0,
  "scheduled_dwell_min": 3.0,
  "track_congestion_index": 0.45,
  "scheduled_segment_time_min": 90.0
}
```

---

## 9. Project Directory Structure

```text
dynamic-eta-forecast/
│
├── frontend/                  # React Frontend Application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # UI Cards, Search, Tables, Charts
│   │   ├── maps/              # GIS Leaflet Map Component
│   │   ├── pages/             # Dashboard, Live Trains, Model, About
│   │   ├── services/          # REST API & WebSocket service
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── backend/                   # FastAPI Backend
│   ├── api/                   # REST Routes & WebSockets
│   ├── database/              # SQLite Database Schema & Seeder
│   ├── services/              # Data Cleaning, Features, Confidence, Simulator
│   ├── ml/                    # XGBoost ML Service Wrapper
│   └── main.py
│
├── model/                     # Machine Learning Pipeline
│   ├── generate_synthetic_data.py
│   ├── train_model.py         # XGBoost Training Script
│   ├── predict.py             # Model Predictor Engine
│   └── xgboost_model.pkl      # Serialized ML Model
│
├── data/
│   ├── historical_trains.csv  # 15,000 Journey Segment Dataset
│   └── stations.csv           # Indian Railway Station Coordinates
│
├── index.html                 # Root Web Dashboard Application
├── run.py                     # One-click Launcher
├── README.md
└── requirements.txt
```

---

## 10. Future Scope

* Integration with real-time Indian Railway NTES / National Train Enquiry API feeds.
* Weather API integration (OpenWeatherMap) for real-time storm & fog speed reduction factors.
* Driver behaviour & loco class acceleration profiling.
* Migration of SQLite database to PostgreSQL / PostGIS for enterprise scale.

---

## 11. License

This project is open-source under the **MIT License**.
