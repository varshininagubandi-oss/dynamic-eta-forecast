import json
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

router = APIRouter(prefix="/api")

class PredictionRequest(BaseModel):
    train_number: str = Field("12701", example="12701")
    current_delay: float = Field(18.0, example=18.0)
    delay_trend: float = Field(1.0, example=1.0)
    segment_distance_km: float = Field(130.0, example=130.0)
    current_speed_kmh: float = Field(78.5, example=78.5)
    hist_avg_travel_time_min: float = Field(95.0, example=95.0)
    scheduled_dwell_min: float = Field(3.0, example=3.0)
    track_congestion_index: float = Field(0.45, example=0.45)
    scheduled_segment_time_min: float = Field(90.0, example=90.0)

class SimulatorControlRequest(BaseModel):
    action: str = Field("play", example="play/pause/speed/inject_delay")
    speed_multiplier: Optional[float] = Field(1.0, example=2.0)
    train_number: Optional[str] = Field("12701", example="12701")
    delay_minutes: Optional[float] = Field(15.0, example=15.0)

def get_services(request: Request):
    return request.app.state.services

@router.get("/trains")
def list_trains(services=Depends(get_services)):
    simulator = services["simulator"]
    telemetry_list = simulator.get_all_telemetry()
    return {
        "count": len(telemetry_list),
        "trains": telemetry_list
    }

@router.get("/trains/{train_number}")
def get_train_details(train_number: str, services=Depends(get_services)):
    simulator = services["simulator"]
    telemetry = simulator.get_telemetry(train_number)
    if not telemetry:
        raise HTTPException(status_code=404, detail=f"Train {train_number} not found")
    return telemetry

@router.get("/trains/{train_number}/live")
def get_train_live(train_number: str, services=Depends(get_services)):
    simulator = services["simulator"]
    cleaner = services["cleaner"]
    confidence_eval = services["confidence"]
    
    raw = simulator.get_telemetry(train_number)
    if not raw:
        raise HTTPException(status_code=404, detail=f"Train {train_number} not found")
    
    cleaned = cleaner.clean_telemetry(raw)
    return {
        "raw_telemetry": raw,
        "cleaned_telemetry": cleaned,
        "cleaning_stats": cleaner.get_stats()
    }

@router.get("/trains/{train_number}/eta")
def get_train_eta(train_number: str, services=Depends(get_services)):
    simulator = services["simulator"]
    cleaner = services["cleaner"]
    feature_eng = services["feature_eng"]
    xgb_service = services["xgb_service"]
    confidence_eval = services["confidence"]

    raw = simulator.get_telemetry(train_number)
    if not raw:
        raise HTTPException(status_code=404, detail=f"Train {train_number} not found")

    cleaned = cleaner.clean_telemetry(raw)
    features = feature_eng.extract_features(cleaned)

    route_codes = raw.get("route", ["NDLS", "SC", "HYB"])
    station_map = simulator.station_map
    route_stations = []
    for code in route_codes:
        stn = station_map.get(code, {"name": code})
        route_stations.append({
            "station_code": code,
            "station_name": stn.get("name", code),
            "station_type": stn.get("station_type", "Junction")
        })

    eta_breakdown = xgb_service.predict_train_route_eta(cleaned, features, route_stations)
    pred_res = {
        "predicted_segment_travel_time_min": eta_breakdown["predicted_segment_time"],
        "scheduled_segment_time_min": features.get("scheduled_segment_time_min", 45)
    }
    confidence_res = confidence_eval.evaluate_confidence(cleaned, pred_res)

    return {
        "train_number": train_number,
        "train_name": raw.get("train_name"),
        "current_location": f"{cleaned['previous_station']} -> {cleaned['next_station']}",
        "current_delay": cleaned["current_delay"],
        "current_speed_kmh": cleaned["current_speed_kmh"],
        "pipeline_status": {
            "live_data": "Received",
            "data_cleaning": cleaned["cleaning_status"],
            "feature_engineering": "Extracted (16 features)",
            "model_execution": "XGBoost Regressor Executed",
            "confidence_audit": f"{confidence_res['confidence_level']} ({confidence_res['confidence_score_pct']}%)"
        },
        "eta_prediction": eta_breakdown,
        "confidence": confidence_res,
        "features": features
    }

@router.get("/trains/{train_number}/route")
def get_train_route(train_number: str, services=Depends(get_services)):
    simulator = services["simulator"]
    raw = simulator.get_telemetry(train_number)
    if not raw:
        raise HTTPException(status_code=404, detail=f"Train {train_number} not found")
    
    route_codes = raw.get("route", [])
    coords = []
    stations = []
    for code in route_codes:
        stn = simulator.station_map.get(code)
        if stn:
            coords.append([stn["lat"], stn["lng"]])
            stations.append({"code": code, "name": stn["name"], "lat": stn["lat"], "lng": stn["lng"]})
            
    return {
        "train_number": train_number,
        "route_codes": route_codes,
        "coordinates": coords,
        "stations": stations
    }

@router.get("/stations/{station_id}")
def get_station(station_id: str, services=Depends(get_services)):
    simulator = services["simulator"]
    stn = simulator.station_map.get(station_id.upper())
    if not stn:
        raise HTTPException(status_code=404, detail=f"Station {station_id} not found")
    return {"code": station_id.upper(), "details": stn}

@router.get("/model/status")
def get_model_status(services=Depends(get_services)):
    return services["xgb_service"].get_status()

@router.get("/model/metrics")
def get_model_metrics(services=Depends(get_services)):
    status = services["xgb_service"].get_status()
    return status.get("metrics", {})

@router.post("/predict")
def post_predict(req: PredictionRequest, services=Depends(get_services)):
    xgb_service = services["xgb_service"]
    confidence_eval = services["confidence"]

    feature_dict = req.dict()
    pred = xgb_service.predictor.predict_segment(feature_dict)

    mock_cleaned = {
        "current_speed_kmh": req.current_speed_kmh,
        "anomalies_detected": []
    }
    conf = confidence_eval.evaluate_confidence(mock_cleaned, pred)

    return {
        "train_number": req.train_number,
        "current_delay": req.current_delay,
        "predicted_segment_time": pred["predicted_segment_travel_time_min"],
        "predicted_dwell_time": pred["predicted_dwell_time_min"],
        "route_adjustment": pred["route_adjustment_min"],
        "predicted_eta": f"{int(pred['predicted_segment_travel_time_min'] + req.current_delay)} min from now",
        "confidence": conf["confidence_score_pct"],
        "confidence_level": conf["confidence_level"]
    }

@router.post("/simulator/control")
def control_simulator(req: SimulatorControlRequest, services=Depends(get_services)):
    simulator = services["simulator"]
    if req.action == "play":
        simulator.set_pause(False)
    elif req.action == "pause":
        simulator.set_pause(True)
    elif req.action == "speed" and req.speed_multiplier:
        simulator.set_simulation_speed(req.speed_multiplier)
    elif req.action == "inject_delay" and req.train_number and req.delay_minutes:
        simulator.inject_delay(req.train_number, req.delay_minutes)
    else:
        raise HTTPException(status_code=400, detail="Invalid simulator control action")

    return {
        "status": "SUCCESS",
        "is_running": simulator.is_running,
        "simulation_speed": simulator.simulation_speed
    }
