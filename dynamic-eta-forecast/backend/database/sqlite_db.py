import os
import sqlite3
import json
from datetime import datetime

DB_PATH = "backend/database/railway.db"

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS stations (
        station_id TEXT PRIMARY KEY,
        station_code TEXT UNIQUE,
        station_name TEXT,
        latitude REAL,
        longitude REAL,
        zone TEXT,
        state TEXT,
        station_type TEXT
    );

    CREATE TABLE IF NOT EXISTS trains (
        train_number TEXT PRIMARY KEY,
        train_name TEXT,
        origin_code TEXT,
        destination_code TEXT,
        total_distance_km REAL,
        route_json TEXT
    );

    CREATE TABLE IF NOT EXISTS live_telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        train_number TEXT,
        latitude REAL,
        longitude REAL,
        current_speed_kmh REAL,
        current_delay_min REAL,
        current_station_code TEXT,
        next_station_code TEXT,
        previous_station_code TEXT,
        timestamp TEXT,
        status TEXT,
        cleaned BOOLEAN
    );

    CREATE TABLE IF NOT EXISTS eta_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        train_number TEXT,
        next_station_code TEXT,
        predicted_eta TEXT,
        current_delay_min REAL,
        predicted_segment_time_min REAL,
        predicted_dwell_time_min REAL,
        route_adjustment_min REAL,
        confidence_pct REAL,
        confidence_level TEXT,
        timestamp TEXT
    );
    """)

    conn.commit()

    # Seed stations if empty
    cursor.execute("SELECT COUNT(*) FROM stations")
    if cursor.fetchone()[0] == 0:
        stations_csv = "data/stations.csv"
        if os.path.exists(stations_csv):
            import pandas as pd
            df = pd.read_csv(stations_csv)
            for _, r in df.iterrows():
                cursor.execute("""
                INSERT OR REPLACE INTO stations (station_id, station_code, station_name, latitude, longitude, zone, state, station_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (r["station_id"], r["station_code"], r["station_name"], r["latitude"], r["longitude"], r["zone"], r["state"], r["station_type"]))
            conn.commit()

    # Seed trains if empty
    cursor.execute("SELECT COUNT(*) FROM trains")
    if cursor.fetchone()[0] == 0:
        trains_data = [
            ("12701", "Hyderabad Rajdhani Express", "NDLS", "HYB", 1680.0, ["NDLS", "AGC", "VGLJ", "BPL", "NGP", "BPQ", "KZJ", "SC", "HYB"]),
            ("12702", "Telangana Express", "HYB", "NDLS", 1680.0, ["HYB", "SC", "KZJ", "BPQ", "NGP", "BPL", "VGLJ", "AGC", "NDLS"]),
            ("12759", "Charminar Express", "HYB", "MAS", 790.0, ["HYB", "SC", "KZJ", "BZA", "OGL", "NLR", "MAS"]),
            ("12951", "Mumbai Rajdhani Express", "MMCT", "NDLS", 1384.0, ["MMCT", "ST", "BRC", "RTM", "KTA", "AGC", "NDLS"]),
            ("12626", "Kerala Express", "NDLS", "ERS", 2800.0, ["NDLS", "AGC", "VGLJ", "BPL", "NGP", "BZA", "MAS", "SBC", "ERS"])
        ]
        for t_no, t_name, orig, dest, dist, route in trains_data:
            cursor.execute("""
            INSERT OR REPLACE INTO trains (train_number, train_name, origin_code, destination_code, total_distance_km, route_json)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (t_no, t_name, orig, dest, dist, json.dumps(route)))
        conn.commit()

    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
