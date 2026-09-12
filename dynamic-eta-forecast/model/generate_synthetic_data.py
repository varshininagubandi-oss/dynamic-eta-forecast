import os
import random
import numpy as np
import pandas as pd

def generate_historical_dataset(num_records=15000, output_path="data/historical_trains.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    np.random.seed(42)
    random.seed(42)

    routes = [
        {"train_no": "12701", "name": "Rajdhani Express", "stations": ["NDLS", "AGC", "VGLJ", "BPL", "NGP", "BPQ", "KZJ", "SC", "HYB"]},
        {"train_no": "12702", "name": "Telangana Express", "stations": ["HYB", "SC", "KZJ", "BPQ", "NGP", "BPL", "VGLJ", "AGC", "NDLS"]},
        {"train_no": "12759", "name": "Charminar Express", "stations": ["HYB", "SC", "KZJ", "BZA", "OGL", "NLR", "MAS"]},
        {"train_no": "12951", "name": "Mumbai Rajdhani", "stations": ["MMCT", "ST", "BRC", "RTM", "KTA", "AGC", "NDLS"]},
        {"train_no": "12626", "name": "Kerala Express", "stations": ["NDLS", "AGC", "VGLJ", "BPL", "NGP", "BZA", "MAS", "SBC", "ERS"]}
    ]

    station_distances = {
        ("NDLS", "AGC"): 195, ("AGC", "VGLJ"): 215, ("VGLJ", "BPL"): 290, ("BPL", "NGP"): 390,
        ("NGP", "BPQ"): 210, ("BPQ", "KZJ"): 235, ("KZJ", "SC"): 130, ("SC", "HYB"): 10,
        ("HYB", "SC"): 10, ("SC", "KZJ"): 130, ("KZJ", "BPQ"): 235, ("BPQ", "NGP"): 210,
        ("NGP", "BPL"): 390, ("BPL", "VGLJ"): 290, ("VGLJ", "AGC"): 215, ("AGC", "NDLS"): 195,
        ("KZJ", "BZA"): 210, ("BZA", "OGL"): 140, ("OGL", "NLR"): 115, ("NLR", "MAS"): 175,
        ("MMCT", "ST"): 263, ("ST", "BRC"): 130, ("BRC", "RTM"): 260, ("RTM", "KTA"): 266,
        ("KTA", "AGC"): 468, ("BZA", "MAS"): 430, ("MAS", "SBC"): 360, ("SBC", "ERS"): 580
    }

    records = []

    for i in range(num_records):
        route = random.choice(routes)
        t_no = route["train_no"]
        t_name = route["name"]
        stns = route["stations"]

        idx = random.randint(0, len(stns) - 2)
        from_stn = stns[idx]
        to_stn = stns[idx + 1]

        dist = station_distances.get((from_stn, to_stn), random.randint(100, 300))
        base_speed = random.uniform(65, 110) # km/h
        sched_time_min = round((dist / base_speed) * 60)
        sched_dwell_min = random.choice([2, 3, 5, 8, 10])

        current_delay = max(0, round(np.random.exponential(scale=18.0) - 4))
        delay_trend = float(np.random.choice([-1.5, -0.5, 0.0, 1.0, 2.5, 5.0], p=[0.1, 0.2, 0.4, 0.15, 0.1, 0.05]))
        accumulated_delay = max(0, current_delay + round(random.uniform(-5, 15)))

        actual_speed = max(30, min(140, base_speed + random.uniform(-15, 10)))

        hour = random.randint(0, 23)
        day_of_week = random.randint(0, 6)
        is_weekend = 1 if day_of_week in [5, 6] else 0
        is_peak = 1 if hour in [7, 8, 9, 17, 18, 19, 20] else 0

        num_inter_stns = max(1, round(dist / random.uniform(25, 45)))
        congestion_idx = round(random.uniform(0.1, 0.95), 2)
        weather_factor = round(random.uniform(0.0, 0.8), 2)

        hist_avg_time = sched_time_min + random.randint(2, 12)
        hist_median_time = hist_avg_time + random.randint(-2, 3)

        # Dynamic travel time simulation with realistic physical relations:
        # Travel time increases with congestion, weather, delay trend, distance/speed ratio
        delay_factor = 0.15 * current_delay + 0.8 * delay_trend
        congestion_delay = congestion_idx * 15.0
        weather_delay = weather_factor * 12.0
        speed_diff_delay = ((1.0 / (actual_speed / 100.0)) - 1.0) * (dist / 100.0) * 10.0

        noise = np.random.normal(0, 3.5)

        predicted_segment_travel_time = (
            sched_time_min 
            + delay_factor 
            + congestion_delay 
            + weather_delay 
            + speed_diff_delay 
            + noise
        )
        actual_segment_travel_time = round(max(sched_time_min * 0.8, predicted_segment_travel_time), 1)

        dwell_noise = max(0, round(np.random.normal(1.2, 1.5), 1))
        if congestion_idx > 0.7:
            dwell_noise += random.uniform(1.5, 4.0)
        actual_dwell = round(sched_dwell_min + dwell_noise, 1)

        delay_increment = round(actual_segment_travel_time - sched_time_min + (actual_dwell - sched_dwell_min), 1)

        records.append({
            "train_number": t_no,
            "train_name": t_name,
            "from_station": from_stn,
            "to_station": to_stn,
            "current_delay": current_delay,
            "delay_trend": delay_trend,
            "accumulated_delay": accumulated_delay,
            "segment_distance_km": dist,
            "current_speed_kmh": round(actual_speed, 1),
            "hist_avg_travel_time_min": hist_avg_time,
            "hist_median_travel_time_min": hist_median_time,
            "scheduled_dwell_min": sched_dwell_min,
            "num_intermediate_stations": num_inter_stns,
            "track_congestion_index": congestion_idx,
            "weather_impact_factor": weather_factor,
            "hour_of_day": hour,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "is_peak_hour": is_peak,
            "scheduled_segment_time_min": sched_time_min,
            "actual_dwell_min": actual_dwell,
            "actual_segment_travel_time_min": actual_segment_travel_time,
            "delay_increment_min": delay_increment
        })

    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic historical train records at: {output_path}")
    return df

if __name__ == "__main__":
    generate_historical_dataset()
