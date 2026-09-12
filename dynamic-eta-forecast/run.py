import os
import sys
import webbrowser
import uvicorn

def main():
    print("=" * 60)
    print("  DYNAMIC ETA FORECAST FOR COACHING TRAINS")
    print("  AI-Powered Real-Time Arrival Prediction Platform")
    print("=" * 60)

    # 1. Ensure Model & Synthetic Dataset exists
    if not os.path.exists("model/xgboost_model.pkl"):
        print("\n[Step 1/2] Training XGBoost ML Model on synthetic historical dataset...")
        from model.train_model import train_and_save_model
        train_and_save_model()
    else:
        print("\n[Step 1/2] XGBoost model loaded (model/xgboost_model.pkl).")

    # 2. Launch FastAPI Server
    print("\n[Step 2/2] Starting FastAPI Backend & Live Telemetry Simulator...")
    print("Server running at: http://127.0.0.1:8000")
    print("API Documentation: http://127.0.0.1:8000/docs")

    # Try opening browser after a short delay
    try:
        webbrowser.open("http://127.0.0.1:8000")
    except Exception:
        pass

    from backend.main import app
    uvicorn.run(app, host="127.0.0.1", port=8000)

if __name__ == "__main__":
    main()
