import React from "react";

export default function EtaBreakdown({ currentEta }) {
  const eta = currentEta?.eta_prediction || {
    current_delay: 18,
    predicted_segment_time: 42,
    predicted_dwell_time: 3,
    route_adjustment: 4,
    predicted_eta: "22:47"
  };

  const confidence = currentEta?.confidence || {
    confidence_score_pct: 87,
    confidence_level: "HIGH",
    confidence_message: "High Confidence - Telemetry consistent with historical patterns."
  };

  const totalMin = (eta.current_delay || 0) + (eta.predicted_segment_time || 40) + (eta.predicted_dwell_time || 3) + (eta.route_adjustment || 4);

  return (
    <div className="card breakdown-card">
      <div className="card-title-bar">
        <i className="fa-solid fa-calculator"></i>
        <span>DYNAMIC ETA FORMULA & BREAKDOWN</span>
      </div>

      <div className="formula-headline">
        <span className="formula-tag">Dynamic ETA</span> = Current Delay + Segment Travel Time + Station Dwell + Route Adjustments
      </div>

      <div className="breakdown-grid">
        <div className="breakdown-box box-amber">
          <div className="box-header">
            <i className="fa-solid fa-clock-rotate-left"></i> Current Delay
          </div>
          <div className="box-val">+{eta.current_delay || 0} <span className="unit">min</span></div>
          <div className="box-sub">Accumulated from past stations</div>
        </div>

        <div className="operator-sign">+</div>

        <div className="breakdown-box box-blue">
          <div className="box-header">
            <i className="fa-solid fa-route"></i> Segment Travel Time
          </div>
          <div className="box-val">{eta.predicted_segment_time || 42} <span className="unit">min</span></div>
          <div className="box-sub">XGBoost segment prediction</div>
        </div>

        <div className="operator-sign">+</div>

        <div className="breakdown-box box-teal">
          <div className="box-header">
            <i className="fa-solid fa-train-stop"></i> Station Dwell
          </div>
          <div className="box-val">{eta.predicted_dwell_time || 3} <span className="unit">min</span></div>
          <div className="box-sub">Platform stoppage estimate</div>
        </div>

        <div className="operator-sign">+</div>

        <div className="breakdown-box box-orange">
          <div className="box-header">
            <i className="fa-solid fa-cloud-sun-rain"></i> Route Adjustments
          </div>
          <div className="box-val">+{eta.route_adjustment || 4} <span className="unit">min</span></div>
          <div className="box-sub">Congestion & track factors</div>
        </div>

        <div className="operator-sign font-equals">=</div>

        <div className="breakdown-box box-result">
          <div className="box-header">
            <i className="fa-solid fa-flag-checkered"></i> Predicted Arrival
          </div>
          <div className="box-val result-time">{eta.predicted_eta || "22:47"}</div>
          <div className="box-sub">Total Journey Adjust: +{totalMin} min</div>
        </div>
      </div>

      <div className="confidence-notice-banner">
        <div className={`notice-badge ${confidence.confidence_level?.toLowerCase()}`}>
          <i className="fa-solid fa-shield-cat"></i> Confidence Audit: {confidence.confidence_score_pct}% ({confidence.confidence_level})
        </div>
        <div className="notice-msg">
          {confidence.confidence_message}
        </div>
      </div>
    </div>
  );
}
