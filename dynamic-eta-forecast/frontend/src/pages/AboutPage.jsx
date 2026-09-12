import React from "react";

export default function AboutPage() {
  return (
    <div className="page-content about-page">
      <div className="card about-card">
        <h2><i className="fa-solid fa-circle-info"></i> About Dynamic ETA Forecast for Coaching Trains</h2>
        
        <div className="about-section">
          <h3><i className="fa-solid fa-triangle-exclamation text-amber"></i> The Problem</h3>
          <p>
            Scheduled railway timetables are static and do not reflect real-world train arrival times. 
            Passenger coaching trains experience variable speed restrictions, signal holds, station dwell overruns, 
            track congestion, and compounding delays along busy passenger corridors.
          </p>
        </div>

        <div className="about-section">
          <h3><i className="fa-solid fa-lightbulb text-green"></i> The Solution</h3>
          <p>
            This system continuously ingests live train GPS telemetry, cleans data anomalies, extracts 16 spatial-temporal 
            feature vectors, and applies a trained <strong>XGBoost Gradient Boosted Regression Model</strong> to dynamically 
            predict expected arrival times at all upcoming stations.
          </p>
        </div>

        <div className="about-section innovation-highlight-box">
          <h3><i className="fa-solid fa-wand-magic-sparkles text-purple"></i> Key Innovation & Dynamic ETA Formula</h3>
          <div className="formula-display">
            Dynamic ETA = Current Delay + Predicted Segment Travel Time + Station Dwell + Route Features
          </div>
          <p>
            Rather than displaying fixed static timetables, the system recalculates arrival times in real-time whenever 
            new live movement data arrives, providing passengers and railway dispatchers with accurate, actionable forecasts.
          </p>
        </div>

        <div className="about-section">
          <h3><i className="fa-solid fa-layer-group text-blue"></i> System Architecture</h3>
          <ul className="arch-bullets">
            <li><strong>Frontend:</strong> Modern React SPA with interactive Leaflet GIS mapping, SVG chart visualizers, status pipeline indicators, and responsive dashboard controls.</li>
            <li><strong>Backend:</strong> Python FastAPI REST API with WebSockets for real-time telemetry streaming and background physics simulator engine.</li>
            <li><strong>Machine Learning:</strong> XGBoost Regressor trained on 15,000+ segment travel logs with MAE of 3.2 minutes and 99.8% R² accuracy score.</li>
            <li><strong>Data Quality:</strong> Automated cleaning pipeline for GPS bounds checking, speed cap validation, delay spike suppression, and confidence auditing.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
