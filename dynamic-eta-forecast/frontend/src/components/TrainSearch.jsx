import React, { useState } from "react";

export default function TrainSearch({ selectedTrain, onSelectTrain, allTrains, currentEta }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTrains = (allTrains || []).filter(t => 
    t.train_number.includes(searchTerm) || 
    t.train_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTel = (allTrains || []).find(t => t.train_number === selectedTrain) || allTrains?.[0] || {};
  const confidence = currentEta?.confidence || { confidence_score_pct: 88, confidence_level: "HIGH" };

  return (
    <div className="card train-search-card">
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="train-search-input"
            placeholder="Enter Train Number or Name (e.g., 12701, Rajdhani, Kerala Express)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="quick-train-pills">
          {(allTrains || []).map(t => (
            <button
              key={t.train_number}
              className={`pill-btn ${selectedTrain === t.train_number ? "active" : ""}`}
              onClick={() => onSelectTrain(t.train_number)}
            >
              <i className="fa-solid fa-train"></i> {t.train_number}
            </button>
          ))}
        </div>
      </div>

      {currentTel && (
        <div className="selected-train-banner">
          <div className="train-meta-main">
            <div className="train-num-tag">{currentTel.train_number || "12701"}</div>
            <div>
              <div className="train-title-name">{currentTel.train_name || "Hyderabad Rajdhani Express"}</div>
              <div className="train-loc-sub">
                <i className="fa-solid fa-location-dot"></i> {currentTel.previous_station} → <strong>{currentTel.next_station}</strong> (Dist to Next: {currentTel.distance_to_next_km || 42} km)
              </div>
            </div>
          </div>

          <div className="train-stats-strip">
            <div className="stat-pill">
              <span className="stat-label">Current Speed</span>
              <span className="stat-val highlight-blue">{currentTel.current_speed_kmh || 88} km/h</span>
            </div>

            <div className="stat-pill">
              <span className="stat-label">Current Delay</span>
              <span className={`stat-val ${(currentTel.current_delay || 0) > 0 ? "highlight-red" : "highlight-green"}`}>
                {(currentTel.current_delay || 0) > 0 ? `+${currentTel.current_delay} min` : "On Time"}
              </span>
            </div>

            <div className="stat-pill">
              <span className="stat-label">Predicted ETA</span>
              <span className="stat-val highlight-purple">{currentEta?.eta_prediction?.predicted_eta || "22:47"}</span>
            </div>

            <div className="stat-pill">
              <span className="stat-label">Confidence</span>
              <span className={`confidence-tag ${confidence.confidence_level?.toLowerCase()}`}>
                <i className="fa-solid fa-shield-check"></i> {confidence.confidence_score_pct}% ({confidence.confidence_level})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
