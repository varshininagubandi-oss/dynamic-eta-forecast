from datetime import datetime

class FeatureEngineer:
    def __init__(self):
        pass

    def extract_features(self, cleaned_telemetry):
        now = datetime.now()

        hour = now.hour
        day_of_week = now.weekday()
        is_weekend = 1 if day_of_week in [5, 6] else 0
        is_peak = 1 if hour in [7, 8, 9, 17, 18, 19, 20] else 0

        dist = cleaned_telemetry.get("total_segment_distance_km", 120.0)
        speed = max(30.0, cleaned_telemetry.get("current_speed_kmh", 75.0))
        sched_time = round((dist / max(60.0, speed)) * 60)

        congestion = 0.4 if is_peak else 0.2
        weather = 0.1

        num_inter = max(1, round(dist / 35.0))

        return {
            "train_number": cleaned_telemetry.get("train_number"),
            "current_delay": cleaned_telemetry.get("current_delay", 0.0),
            "delay_trend": cleaned_telemetry.get("delay_trend", 0.0),
            "accumulated_delay": max(0, cleaned_telemetry.get("current_delay", 0.0) + 2.0),
            "segment_distance_km": dist,
            "current_speed_kmh": speed,
            "hist_avg_travel_time_min": sched_time + 5,
            "hist_median_travel_time_min": sched_time + 4,
            "scheduled_dwell_min": 3,
            "num_intermediate_stations": num_inter,
            "track_congestion_index": congestion,
            "weather_impact_factor": weather,
            "hour_of_day": hour,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "is_peak_hour": is_peak,
            "scheduled_segment_time_min": sched_time
        }
