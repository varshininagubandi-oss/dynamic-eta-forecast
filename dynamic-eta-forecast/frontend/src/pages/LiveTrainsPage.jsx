import React from "react";

export default function LiveTrainsPage({ allTrains, onSelectTrain }) {
  return (
    <div className="page-content live-trains-page">
      <div className="page-header-box">
        <h2><i className="fa-solid fa-train"></i> Monitored Live Coaching Trains</h2>
        <p>Real-time telemetry feeds for active passenger corridor trains.</p>
      </div>

      <div className="trains-grid">
        {(allTrains || []).map((t) => (
          <div key={t.train_number} className="card train-card-item">
            <div className="train-card-top">
              <span className="train-num-tag">{t.train_number}</span>
              <span className={`status-pill pill-${t.status?.toLowerCase() || "running"}`}>
                {t.status || "RUNNING"}
              </span>
            </div>

            <div className="train-name-heading">{t.train_name}</div>
            
            <div className="train-route-flow">
              <i className="fa-solid fa-location-dot text-blue"></i>
              <span>{t.previous_station}</span>
              <i className="fa-solid fa-arrow-right text-dim"></i>
              <strong className="text-highlight">{t.next_station}</strong>
            </div>

            <div className="train-metrics-row">
              <div className="metric">
                <span className="label">Current Speed</span>
                <span className="val">{t.current_speed_kmh} km/h</span>
              </div>
              <div className="metric">
                <span className="label">Current Delay</span>
                <span className={`val ${t.current_delay > 0 ? "text-red" : "text-green"}`}>
                  {t.current_delay > 0 ? `+${t.current_delay} min` : "On Time"}
                </span>
              </div>
              <div className="metric">
                <span className="label">Next Dist</span>
                <span className="val">{t.distance_to_next_km} km</span>
              </div>
            </div>

            <button className="btn-select-train" onClick={() => onSelectTrain(t.train_number)}>
              Inspect Live Forecast <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
