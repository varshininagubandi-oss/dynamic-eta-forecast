import time
import math
import json
import threading
from datetime import datetime, timedelta

class LiveTrainSimulator:
    def __init__(self, db_conn_func=None):
        self.db_conn_func = db_conn_func
        self.is_running = True
        self.simulation_speed = 1.0 # 1x realtime multiplier (speed up for demo)
        self.lock = threading.Lock()
        
        # Hardcoded Station Coordinates Map for fast lookup
        self.station_map = {
            "NDLS": {"name": "New Delhi", "lat": 28.6431, "lng": 77.2197},
            "AGC": {"name": "Agra Cantt", "lat": 27.1577, "lng": 77.9908},
            "VGLJ": {"name": "VGL Jhansi", "lat": 25.4484, "lng": 78.5685},
            "BPL": {"name": "Bhopal Junction", "lat": 23.2599, "lng": 77.4126},
            "NGP": {"name": "Nagpur Junction", "lat": 21.1458, "lng": 79.0882},
            "BPQ": {"name": "Balharshah Junction", "lat": 19.8541, "lng": 79.3578},
            "KZJ": {"name": "Kazipet Junction", "lat": 17.9784, "lng": 79.5218},
            "SC": {"name": "Secunderabad Junction", "lat": 17.4399, "lng": 78.5017},
            "HYB": {"name": "Hyderabad Deccan", "lat": 17.3930, "lng": 78.4730},
            "BZA": {"name": "Vijayawada Junction", "lat": 16.5062, "lng": 80.6480},
            "OGL": {"name": "Ongole", "lat": 15.5057, "lng": 80.0499},
            "NLR": {"name": "Nellore", "lat": 14.4426, "lng": 79.9865},
            "MAS": {"name": "Chennai Central", "lat": 13.0827, "lng": 80.2707},
            "MMCT": {"name": "Mumbai Central", "lat": 18.9696, "lng": 72.8193},
            "ST": {"name": "Surat", "lat": 21.2035, "lng": 72.8392},
            "BRC": {"name": "Vadodara Junction", "lat": 22.3072, "lng": 73.1812},
            "RTM": {"name": "Ratlam Junction", "lat": 23.3341, "lng": 75.0376},
            "KTA": {"name": "Kota Junction", "lat": 25.2138, "lng": 75.8648},
            "SBC": {"name": "KSR Bengaluru", "lat": 12.9781, "lng": 77.5697},
            "ERS": {"name": "Ernakulam Junction", "lat": 9.9675, "lng": 76.2898}
        }

        # Train Active Simulated States
        self.train_states = {
            "12701": {
                "train_number": "12701",
                "train_name": "Hyderabad Rajdhani Express",
                "route": ["NDLS", "AGC", "VGLJ", "BPL", "NGP", "BPQ", "KZJ", "SC", "HYB"],
                "segment_index": 6, # Currently between KZJ and SC
                "progress": 0.42,   # 42% along segment
                "latitude": 17.7500,
                "longitude": 79.1000,
                "current_speed_kmh": 92.5,
                "current_delay": 18.0,
                "delay_trend": 0.5,
                "status": "RUNNING",
                "dwell_remaining_sec": 0
            },
            "12702": {
                "train_number": "12702",
                "train_name": "Telangana Express",
                "route": ["HYB", "SC", "KZJ", "BPQ", "NGP", "BPL", "VGLJ", "AGC", "NDLS"],
                "segment_index": 2, # Between KZJ and BPQ
                "progress": 0.15,
                "latitude": 18.2500,
                "longitude": 79.4800,
                "current_speed_kmh": 85.0,
                "current_delay": 5.0,
                "delay_trend": 0.0,
                "status": "RUNNING",
                "dwell_remaining_sec": 0
            },
            "12759": {
                "train_number": "12759",
                "train_name": "Charminar Express",
                "route": ["HYB", "SC", "KZJ", "BZA", "OGL", "NLR", "MAS"],
                "segment_index": 3, # Between BZA and OGL
                "progress": 0.70,
                "latitude": 15.8000,
                "longitude": 80.2000,
                "current_speed_kmh": 76.0,
                "current_delay": 12.0,
                "delay_trend": 1.0,
                "status": "RUNNING",
                "dwell_remaining_sec": 0
            },
            "12951": {
                "train_number": "12951",
                "train_name": "Mumbai Rajdhani Express",
                "route": ["MMCT", "ST", "BRC", "RTM", "KTA", "AGC", "NDLS"],
                "segment_index": 2, # Between BRC and RTM
                "progress": 0.55,
                "latitude": 22.8000,
                "longitude": 74.1000,
                "current_speed_kmh": 105.0,
                "current_delay": 0.0,
                "delay_trend": -0.2,
                "status": "RUNNING",
                "dwell_remaining_sec": 0
            },
            "12626": {
                "train_number": "12626",
                "train_name": "Kerala Express",
                "route": ["NDLS", "AGC", "VGLJ", "BPL", "NGP", "BZA", "MAS", "SBC", "ERS"],
                "segment_index": 4, # Between NGP and BZA
                "progress": 0.35,
                "latitude": 19.2000,
                "longitude": 79.8000,
                "current_speed_kmh": 68.0,
                "current_delay": 25.0,
                "delay_trend": 2.0,
                "status": "RUNNING",
                "dwell_remaining_sec": 0
            }
        }

    def set_simulation_speed(self, multiplier):
        with self.lock:
            self.simulation_speed = max(0.1, min(20.0, multiplier))

    def set_pause(self, paused):
        with self.lock:
            self.is_running = not paused

    def inject_delay(self, train_number, delay_minutes):
        with self.lock:
            if train_number in self.train_states:
                self.train_states[train_number]["current_delay"] += float(delay_minutes)
                self.train_states[train_number]["delay_trend"] += 1.5

    def step(self, delta_time_sec=2.0):
        with self.lock:
            if not self.is_running:
                return

            effective_dt = delta_time_sec * self.simulation_speed

            for t_no, t_state in self.train_states.items():
                route = t_state["route"]
                seg_idx = t_state["segment_index"]

                if seg_idx >= len(route) - 1:
                    # Train reached final station, reset to start
                    t_state["segment_index"] = 0
                    t_state["progress"] = 0.0
                    t_state["current_delay"] = max(0.0, round(t_state["current_delay"] * 0.3, 1))
                    seg_idx = 0

                prev_code = route[seg_idx]
                next_code = route[seg_idx + 1]

                prev_stn = self.station_map.get(prev_code)
                next_stn = self.station_map.get(next_code)

                if not prev_stn or not next_stn:
                    continue

                if t_state["dwell_remaining_sec"] > 0:
                    t_state["dwell_remaining_sec"] -= effective_dt
                    t_state["current_speed_kmh"] = 0.0
                    t_state["status"] = "AT_STATION"
                    t_state["latitude"] = prev_stn["lat"]
                    t_state["longitude"] = prev_stn["lng"]
                    if t_state["dwell_remaining_sec"] <= 0:
                        t_state["dwell_remaining_sec"] = 0
                        t_state["status"] = "RUNNING"
                    continue

                # Move train forward along line
                dist_lat = next_stn["lat"] - prev_stn["lat"]
                dist_lng = next_stn["lng"] - prev_stn["lng"]
                total_deg = math.sqrt(dist_lat**2 + dist_lng**2)

                speed_kmh = t_state["current_speed_kmh"]
                # Convert km/h to approximate degrees per second (~111km per deg)
                deg_per_sec = (speed_kmh / 3600.0) / 111.0

                progress_inc = (deg_per_sec * effective_dt) / max(0.001, total_deg)
                t_state["progress"] += progress_inc

                if t_state["progress"] >= 1.0:
                    # Reached next station!
                    t_state["progress"] = 0.0
                    t_state["segment_index"] += 1
                    t_state["dwell_remaining_sec"] = 45 # 45 sec dwell in sim
                    t_state["latitude"] = next_stn["lat"]
                    t_state["longitude"] = next_stn["lng"]
                    t_state["status"] = "AT_STATION"
                else:
                    t_state["latitude"] = prev_stn["lat"] + (dist_lat * t_state["progress"])
                    t_state["longitude"] = prev_stn["lng"] + (dist_lng * t_state["progress"])
                    t_state["status"] = "IN_TRANSIT"

                # Dynamic Speed & Delay Fluctuations
                if t_state["status"] == "IN_TRANSIT":
                    t_state["current_speed_kmh"] = round(max(40.0, min(125.0, speed_kmh + math.sin(time.time() / 10) * 3)), 1)
                    # Slight delay drift
                    if math.sin(time.time() / 15) > 0.8:
                        t_state["current_delay"] = round(t_state["current_delay"] + 0.1, 1)

    def get_telemetry(self, train_number):
        with self.lock:
            t_state = self.train_states.get(str(train_number))
            if not t_state:
                return None

            route = t_state["route"]
            seg_idx = min(t_state["segment_index"], len(route) - 2)
            prev_code = route[seg_idx]
            next_code = route[seg_idx + 1]

            prev_stn = self.station_map.get(prev_code, {})
            next_stn = self.station_map.get(next_code, {})

            # Approx distance calculation
            lat1, lng1 = t_state["latitude"], t_state["longitude"]
            lat2, lng2 = next_stn.get("lat", lat1), next_stn.get("lng", lng1)
            dist_to_next = round(math.sqrt((lat2 - lat1)**2 + (lng2 - lng1)**2) * 111.0, 1)

            return {
                "train_number": t_state["train_number"],
                "train_name": t_state["train_name"],
                "latitude": round(t_state["latitude"], 4),
                "longitude": round(t_state["longitude"], 4),
                "current_speed_kmh": t_state["current_speed_kmh"],
                "current_delay": t_state["current_delay"],
                "delay_trend": t_state["delay_trend"],
                "previous_station": prev_stn.get("name", prev_code),
                "previous_station_code": prev_code,
                "current_station": prev_stn.get("name", prev_code) if t_state["status"] == "AT_STATION" else "In Transit",
                "next_station": next_stn.get("name", next_code),
                "next_station_code": next_code,
                "distance_to_next_km": dist_to_next,
                "total_segment_distance_km": 140.0,
                "status": t_state["status"],
                "timestamp": datetime.now().strftime("%Y-%m-%d %I:%M:%S %p"),
                "route": route
            }

    def get_all_telemetry(self):
        result = []
        with self.lock:
            keys = list(self.train_states.keys())
        for k in keys:
            tel = self.get_telemetry(k)
            if tel:
                result.append(tel)
        return result
