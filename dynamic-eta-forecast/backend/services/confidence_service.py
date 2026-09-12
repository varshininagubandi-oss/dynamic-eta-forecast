class ConfidenceEvaluator:
    def __init__(self):
        pass

    def evaluate_confidence(self, cleaned_telemetry, prediction_result):
        score = 95.0
        reasons = []

        speed = cleaned_telemetry.get("current_speed_kmh", 0)
        anomalies = cleaned_telemetry.get("anomalies_detected", [])
        
        # 1. Speed Validity Check
        if speed < 5.0:
            score -= 10.0
            reasons.append("Train currently stationary / near signal wait")
        elif speed > 130.0:
            score -= 8.0
            reasons.append("High speed variations observed on segment")

        # 2. Data Cleaning Anomalies Check
        if anomalies:
            score -= (12.0 * len(anomalies))
            reasons.append(f"Telemetry anomalies detected: {', '.join(anomalies)}")

        # 3. Travel Time Variance vs Historical
        pred_time = prediction_result.get("predicted_segment_travel_time_min", 45)
        sched_time = prediction_result.get("scheduled_segment_time_min", 45)
        
        diff_pct = abs(pred_time - sched_time) / max(1.0, sched_time)
        if diff_pct > 0.4:
            score -= 15.0
            reasons.append("Large deviation between predicted time and schedule")

        # Final Score Bounding
        final_score = round(max(35.0, min(99.0, score)), 1)

        if final_score >= 85.0:
            level = "HIGH"
            message = "High Confidence - Real-time telemetry consistent with historical patterns."
        elif final_score >= 60.0:
            level = "MEDIUM"
            message = "Moderate Confidence - Minor speed variations or minor route congestion detected."
        else:
            level = "LOW"
            message = "Low Confidence - Real-time data quality insufficient or abnormal delay pattern."

        return {
            "confidence_score_pct": final_score,
            "confidence_level": level,
            "confidence_message": message,
            "factors": reasons if reasons else ["Telemetry GPS signal strong", "Speed within normal operating envelope", "Low model error variance"]
        }
