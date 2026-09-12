from datetime import datetime

class DataCleaner:
    def __init__(self):
        self.stats = {
            "received_count": 0,
            "validated_count": 0,
            "anomalies_rectified": 0,
            "ready_count": 0,
            "status": "Ready"
        }

    def clean_telemetry(self, raw_data):
        """
        Validates and cleans incoming raw train telemetry frame.
        """
        self.stats["received_count"] += 1
        anomalies = []

        train_number = str(raw_data.get("train_number", "UNKNOWN"))
        lat = raw_data.get("latitude")
        lng = raw_data.get("longitude")
        speed = raw_data.get("current_speed_kmh", 0)
        delay = raw_data.get("current_delay", 0)
        timestamp = raw_data.get("timestamp", datetime.now().isoformat())

        # 1. GPS Bounds Validation (India Region: Lat 8-37, Lng 68-97)
        clean_lat = lat
        clean_lng = lng
        if lat is None or not (6.0 <= lat <= 38.0):
            clean_lat = 17.4399 # default fallback to SC
            anomalies.append("Invalid Latitude")
        if lng is None or not (68.0 <= lng <= 98.0):
            clean_lng = 78.5017 # default fallback to SC
            anomalies.append("Invalid Longitude")

        # 2. Speed Sanity Check (Max speed for Indian coaching trains: 160 km/h)
        clean_speed = speed
        if speed is None or speed < 0:
            clean_speed = 0.0
            anomalies.append("Negative Speed Reset")
        elif speed > 160.0:
            clean_speed = 110.0
            anomalies.append("Extreme Speed Capped")

        # 3. Sudden Delay Spike Filtering
        clean_delay = delay
        if delay is None or delay < 0:
            clean_delay = 0.0
            anomalies.append("Negative Delay Reset")
        elif delay > 720.0: # Cap delay at 12 hours
            clean_delay = 720.0
            anomalies.append("Extreme Delay Capped")

        if anomalies:
            self.stats["anomalies_rectified"] += 1

        self.stats["validated_count"] += 1
        self.stats["ready_count"] += 1

        return {
            "train_number": train_number,
            "train_name": raw_data.get("train_name", "Coaching Express"),
            "latitude": round(clean_lat, 4),
            "longitude": round(clean_lng, 4),
            "current_speed_kmh": round(clean_speed, 1),
            "current_delay": round(clean_delay, 1),
            "delay_trend": round(raw_data.get("delay_trend", 0.0), 1),
            "previous_station": raw_data.get("previous_station", "ORIG"),
            "current_station": raw_data.get("current_station", "IN_TRANSIT"),
            "next_station": raw_data.get("next_station", "DEST"),
            "distance_to_next_km": round(raw_data.get("distance_to_next_km", 50.0), 1),
            "total_segment_distance_km": round(raw_data.get("total_segment_distance_km", 120.0), 1),
            "timestamp": timestamp,
            "cleaned": True,
            "anomalies_detected": anomalies,
            "cleaning_status": "Cleaned & Validated" if not anomalies else f"Cleaned ({len(anomalies)} anomalies fixed)"
        }

    def get_stats(self):
        return self.stats
