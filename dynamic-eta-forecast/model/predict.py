import os
import json
import joblib
import pandas as pd
import numpy as np

class ETAPredictor:
    def __init__(self, model_path="model/xgboost_model.pkl", metrics_path="model/model_metrics.json"):
        self.model_path = model_path
        self.metrics_path = metrics_path
        self.model = None
        self.metrics = {}
        self.feature_columns = [
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
        self._load()

    def _load(self):
        if not os.path.exists(self.model_path):
            try:
                from model.train_model import train_and_save_model
            except ImportError:
                import sys
                sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                from model.train_model import train_and_save_model
            self.model, self.metrics = train_and_save_model(model_output_path=self.model_path, metrics_output_path=self.metrics_path)
        else:
            self.model = joblib.load(self.model_path)
            if os.path.exists(self.metrics_path):
                with open(self.metrics_path, "r") as f:
                    self.metrics = json.load(f)

    def predict_segment(self, feature_dict):
        """
        Accepts a dict of feature values and predicts expected segment travel time and delay increment.
        """
        input_data = {}
        for col in self.feature_columns:
            input_data[col] = [feature_dict.get(col, 0)]
        
        df = pd.DataFrame(input_data)
        predicted_travel_time = float(self.model.predict(df)[0])
        
        sched_time = feature_dict.get("scheduled_segment_time_min", 45)
        sched_dwell = feature_dict.get("scheduled_dwell_min", 3)
        
        # Estimate dwell time based on congestion & historical pattern
        congestion = feature_dict.get("track_congestion_index", 0.3)
        predicted_dwell_time = round(sched_dwell + (congestion * 2.5), 1)
        
        route_adjustment = round(predicted_travel_time - sched_time, 1)
        
        current_delay = feature_dict.get("current_delay", 0)
        total_delay = round(current_delay + route_adjustment + (predicted_dwell_time - sched_dwell), 1)

        return {
            "predicted_segment_travel_time_min": round(predicted_travel_time, 1),
            "predicted_dwell_time_min": predicted_dwell_time,
            "route_adjustment_min": route_adjustment,
            "predicted_total_delay_min": max(0, total_delay),
            "scheduled_segment_time_min": sched_time,
            "scheduled_dwell_min": sched_dwell
        }

if __name__ == "__main__":
    predictor = ETAPredictor()
    sample_features = {
        "current_delay": 18,
        "delay_trend": 1.0,
        "accumulated_delay": 20,
        "segment_distance_km": 130,
        "current_speed_kmh": 78.5,
        "hist_avg_travel_time_min": 95,
        "hist_median_travel_time_min": 94,
        "scheduled_dwell_min": 3,
        "num_intermediate_stations": 3,
        "track_congestion_index": 0.45,
        "weather_impact_factor": 0.1,
        "hour_of_day": 21,
        "day_of_week": 2,
        "is_weekend": 0,
        "is_peak_hour": 1,
        "scheduled_segment_time_min": 90
    }
    result = predictor.predict_segment(sample_features)
    print("Prediction Result:", json.dumps(result, indent=2))
