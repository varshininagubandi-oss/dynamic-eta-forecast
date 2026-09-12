import os
import sys
import time
import asyncio
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure root path in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.sqlite_db import init_db
from backend.services.data_cleaning import DataCleaner
from backend.services.feature_engineering import FeatureEngineer
from backend.services.confidence_service import ConfidenceEvaluator
from backend.services.simulator import LiveTrainSimulator
from backend.ml.xgboost_service import XGBoostETAService
from backend.api.routes import router as api_router
from backend.api.websocket import ws_router, manager as ws_manager

app = FastAPI(
    title="Dynamic ETA Forecast API",
    description="Real-Time XGBoost ETA Prediction & Telemetry API for Coaching Trains",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
init_db()
cleaner = DataCleaner()
feature_eng = FeatureEngineer()
confidence = ConfidenceEvaluator()
simulator = LiveTrainSimulator()
xgb_service = XGBoostETAService()

app.state.services = {
    "cleaner": cleaner,
    "feature_eng": feature_eng,
    "confidence": confidence,
    "simulator": simulator,
    "xgb_service": xgb_service
}

app.include_router(api_router)
app.include_router(ws_router)

# Background simulation runner thread
def background_simulation_loop():
    while True:
        try:
            simulator.step(delta_time_sec=2.0)
            time.sleep(1.0)
        except Exception as e:
            print(f"Error in simulation loop: {e}")
            time.sleep(1.0)

@app.on_event("startup")
async def startup_event():
    # Start background simulator thread
    t = threading.Thread(target=background_simulation_loop, daemon=True)
    t.start()
    print("Background Live Train Simulator thread started.")

# Serve root index.html dashboard
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_HTML = os.path.join(PROJECT_ROOT, "index.html")

@app.get("/")
async def serve_root_dashboard():
    if os.path.exists(INDEX_HTML):
        return FileResponse(INDEX_HTML)
    return {"message": "Dynamic ETA Forecast API is running"}

frontend_dist = os.path.join(PROJECT_ROOT, "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
