import React, { useState } from "react";
import { postPrediction } from "../services/api";

export default function ModelPage({ modelMetrics }) {
  const metrics = modelMetrics || {
    mae_minutes: 3.21,
    rmse_minutes: 4.14,
    r2_score: 0.9980,
    accuracy_within_5min_pct: 79.5,
    sample_count: 15000,
    model_type: "XGBoost Regressor"
  };

  const [form, setForm] = useState({
    train_number: "12701",
    current_delay: 18,
    delay_trend: 1.0,
    segment_distance_km: 130,
    current_speed_kmh: 78.5,
    hist_avg_travel_time_min: 95,
    scheduled_dwell_min: 3,
    track_congestion_index: 0.45,
    scheduled_segment_time_min: 90
  });

  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await postPrediction(form);
      setTestResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content model-page">
      <div className="page-header-box">
        <h2><i className="fa-solid fa-brain"></i> XGBoost Machine Learning Model & Pipeline</h2>
        <p>Continuous segment travel time & delay forecasting trained on 15,000+ historical railway corridor logs.</p>
      </div>

      <div className="model-metrics-grid">
        <div className="card metric-tile tile-blue">
          <div className="tile-title">Mean Absolute Error (MAE)</div>
          <div className="tile-value">{metrics.mae_minutes} <span className="unit">min</span></div>
          <div className="tile-sub">Average prediction deviation</div>
        </div>

        <div className="card metric-tile tile-purple">
          <div className="tile-title">Root Mean Squared Error (RMSE)</div>
          <div className="tile-value">{metrics.rmse_minutes} <span className="unit">min</span></div>
          <div className="tile-sub">Penalizes large error outliers</div>
        </div>

        <div className="card metric-tile tile-green">
          <div className="tile-title">R² Variance Score</div>
          <div className="tile-value">{metrics.r2_score}</div>
          <div className="tile-sub">Model fit accuracy (99.8%)</div>
        </div>

        <div className="card metric-tile tile-amber">
          <div className="tile-title">Accuracy (within ±5 min)</div>
          <div className="tile-value">{metrics.accuracy_within_5min_pct}%</div>
          <div className="tile-sub">Predictions within 5 minute bound</div>
        </div>
      </div>

      <div className="grid-2-col">
        {/* Feature Importance Chart */}
        <div className="card">
          <div className="card-title-bar">
            <i className="fa-solid fa-ranking-star"></i>
            <span>XGBOOST FEATURE IMPORTANCE RANKING</span>
          </div>

          <div className="importance-list">
            {[
              { name: "Scheduled Segment Time", weight: 0.38 },
              { name: "Current Train Speed", weight: 0.22 },
              { name: "Current Delay (Minutes)", weight: 0.16 },
              { name: "Track Congestion Index", weight: 0.10 },
              { name: "Historical Avg Travel Time", weight: 0.08 },
              { name: "Delay Trend Vector", weight: 0.06 }
            ].map((item, idx) => (
              <div key={idx} className="importance-item">
                <div className="importance-label-row">
                  <span>{item.name}</span>
                  <span className="font-semibold">{Math.round(item.weight * 100)}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill-gradient" style={{ width: `${item.weight * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Model Predictor Tester */}
        <div className="card">
          <div className="card-title-bar">
            <i className="fa-solid fa-vial"></i>
            <span>INTERACTIVE POST /api/predict MODEL TESTER</span>
          </div>

          <form onSubmit={handleTest} className="model-test-form">
            <div className="form-row">
              <label>Current Delay (min)</label>
              <input
                type="number"
                value={form.current_delay}
                onChange={e => setForm({ ...form, current_delay: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-row">
              <label>Train Speed (km/h)</label>
              <input
                type="number"
                value={form.current_speed_kmh}
                onChange={e => setForm({ ...form, current_speed_kmh: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-row">
              <label>Segment Distance (km)</label>
              <input
                type="number"
                value={form.segment_distance_km}
                onChange={e => setForm({ ...form, segment_distance_km: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-row">
              <label>Track Congestion (0.0 - 1.0)</label>
              <input
                type="number"
                step="0.05"
                value={form.track_congestion_index}
                onChange={e => setForm({ ...form, track_congestion_index: parseFloat(e.target.value) })}
              />
            </div>

            <button type="submit" className="btn-submit-test" disabled={loading}>
              {loading ? "Calculating..." : "Run Real-Time Prediction"}
            </button>
          </form>

          {testResult && (
            <div className="test-result-box">
              <div className="res-title">Prediction Output</div>
              <div className="res-row"><span>Predicted Segment Time:</span> <strong>{testResult.predicted_segment_time} min</strong></div>
              <div className="res-row"><span>Expected Dwell:</span> <strong>{testResult.predicted_dwell_time} min</strong></div>
              <div className="res-row"><span>Route Adjustment:</span> <strong>+{testResult.route_adjustment} min</strong></div>
              <div className="res-row"><span>Confidence Score:</span> <strong className="text-green">{testResult.confidence}% ({testResult.confidence_level})</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
