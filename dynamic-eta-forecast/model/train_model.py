import os
import json
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

FEATURE_COLUMNS = [
    "current_delay",
    "delay_trend",
    "accumulated_delay",
    "segment_distance_km",
    "current_speed_kmh",
    "hist_avg_travel_time_min",
    "hist_median_travel_time_min",
    "scheduled_dwell_min",
    "num_intermediate_stations",
    "track_congestion_index",
    "weather_impact_factor",
    "hour_of_day",
    "day_of_week",
    "is_weekend",
    "is_peak_hour",
    "scheduled_segment_time_min"
]

TARGET_COLUMN = "actual_segment_travel_time_min"

def train_and_save_model(
    csv_path="data/historical_trains.csv", 
    model_output_path="model/xgboost_model.pkl",
    metrics_output_path="model/model_metrics.json"
):
    if not os.path.exists(csv_path):
        print("Historical dataset not found. Generating synthetic dataset first...")
        try:
            from model.generate_synthetic_data import generate_historical_dataset
        except ImportError:
            import sys
            sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            from model.generate_synthetic_data import generate_historical_dataset
        generate_historical_dataset(num_records=15000, output_path=csv_path)

    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} records from {csv_path}")

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("Training XGBoost Regressor model...")
    model = XGBRegressor(
        n_estimators=180,
        max_depth=6,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))
    within_5_min_acc = float(np.mean(np.abs(y_test - y_pred) <= 5.0) * 100.0)

    # Feature importance
    feature_importances = dict(zip(FEATURE_COLUMNS, [float(x) for x in model.feature_importances_]))

    metrics = {
        "mae_minutes": round(mae, 3),
        "rmse_minutes": round(rmse, 3),
        "r2_score": round(r2, 4),
        "accuracy_within_5min_pct": round(within_5_min_acc, 2),
        "feature_importances": feature_importances,
        "features": FEATURE_COLUMNS,
        "sample_count": len(df),
        "model_type": "XGBoost Regressor (Demo Synthetic Trained)"
    }

    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    joblib.dump(model, model_output_path)
    print(f"Saved trained XGBoost model to: {model_output_path}")

    os.makedirs(os.path.dirname(metrics_output_path), exist_ok=True)
    with open(metrics_output_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved model metrics to: {metrics_output_path}")

    print("\n--- Model Evaluation Results ---")
    print(f"MAE: {mae:.2f} minutes")
    print(f"RMSE: {rmse:.2f} minutes")
    print(f"R² Score: {r2:.4f}")
    print(f"Accuracy (±5 min): {within_5_min_acc:.2f}%")

    return model, metrics

if __name__ == "__main__":
    train_and_save_model()
