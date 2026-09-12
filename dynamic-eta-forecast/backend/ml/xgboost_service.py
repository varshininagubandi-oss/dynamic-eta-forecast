import os
import json
from datetime import datetime, timedelta
from model.predict import ETAPredictor

class XGBoostETAService:
    def __init__(self):
        self.predictor = ETAPredictor()

    def get_status(self):
        return {
            "status": "LOADED" if self.predictor.model else "ERROR",
            "model_type": "XGBoost Regressor",
            "feature_count": len(self.predictor.feature_columns),
            "metrics": self.predictor.metrics
        }

    def predict_train_route_eta(self, cleaned_telemetry, feature_vector, route_stations):
        """
        Calculates predicted ETA and breakdown for all upcoming stations on the train's route.
        """
        curr_delay = cleaned_telemetry.get("current_delay", 0.0)
        curr_speed = cleaned_telemetry.get("current_speed_kmh", 80.0)
        next_code = cleaned_telemetry.get("next_station_code")

        # Run XGBoost model on current segment features
        pred = self.predictor.predict_segment(feature_vector)
        
        pred_segment_time = pred["predicted_segment_travel_time_min"]
        pred_dwell_time = pred["predicted_dwell_time_min"]
        route_adjustment = pred["route_adjustment_min"]
        total_delay = pred["predicted_total_delay_min"]

        now = datetime.now()
        accumulated_minutes = 0
        forecast_list = []

        is_upcoming = False

        for idx, stn in enumerate(route_stations):
            code = stn["station_code"]
            name = stn["station_name"]

            if code == next_code:
                is_upcoming = True

            # Calculate scheduled time offset for simulation
            sched_offset_min = (idx + 1) * 75
            sched_dt = now + timedelta(minutes=sched_offset_min)
            
            if is_upcoming:
                accumulated_minutes += pred_segment_time + pred_dwell_time
                pred_dt = now + timedelta(minutes=accumulated_minutes + (curr_delay * 0.5))
                stn_delay = round(curr_delay + (accumulated_minutes * 0.1), 1)
                stn_confidence = max(55.0, round(92.0 - (idx * 2.5), 1))
            else:
                pred_dt = sched_dt
                stn_delay = 0.0
                stn_confidence = 95.0

            forecast_list.append({
                "station_code": code,
                "station_name": name,
                "station_type": stn.get("station_type", "Junction"),
                "scheduled_eta": sched_dt.strftime("%H:%M"),
                "predicted_eta": pred_dt.strftime("%H:%M"),
                "delay_minutes": stn_delay,
                "delay_formatted": f"+{int(stn_delay)} min" if stn_delay > 0 else "On Time",
                "dwell_time_min": int(pred_dwell_time if is_upcoming else 3),
                "confidence_pct": stn_confidence,
                "status": "PASSED" if not is_upcoming else ("NEXT" if code == next_code else "UPCOMING")
            })

        predicted_arrival_dt = now + timedelta(minutes=int(pred_segment_time + curr_delay))

        return {
            "train_number": cleaned_telemetry.get("train_number"),
            "current_delay": curr_delay,
            "predicted_segment_time": pred_segment_time,
            "predicted_dwell_time": pred_dwell_time,
            "route_adjustment": route_adjustment,
            "total_predicted_delay": total_delay,
            "predicted_eta": predicted_arrival_dt.strftime("%H:%M"),
            "forecast_table": forecast_list
        }
