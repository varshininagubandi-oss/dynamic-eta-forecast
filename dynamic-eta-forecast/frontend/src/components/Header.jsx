import React from "react";

export default function Header({ activeTab, setActiveTab, lastUpdated, wsConnected }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "fa-gauge" },
    { id: "live_trains", label: "Live Trains", icon: "fa-train" },
    { id: "eta_forecast", label: "ETA Forecast", icon: "fa-clock" },
    { id: "map", label: "Route Map", icon: "fa-map-location-dot" },
    { id: "model", label: "XGBoost Model", icon: "fa-brain" },
    { id: "about", label: "About", icon: "fa-circle-info" }
  ];

  return (
    <header className="app-header">
      <div className="header-top-bar">
        <div className="brand-title">
          <div className="brand-logo">
            <i className="fa-solid fa-train-subway logo-icon"></i>
          </div>
          <div>
            <div className="header-title">DYNAMIC ETA FORECAST</div>
            <div className="header-subtitle">AI-Powered Real-Time Arrival Prediction for Coaching Trains</div>
          </div>
        </div>

        <div className="header-actions">
          <span className="demo-badge">
            <span className="live-dot"></span>
            DEMO LIVE DATA
          </span>

          <span className={`ws-badge ${wsConnected ? "connected" : "polling"}`}>
            <i className={`fa-solid ${wsConnected ? "fa-wifi" : "fa-arrows-rotate fa-spin"}`}></i>
            {wsConnected ? "WebSocket Live" : "Telemetry Active"}
          </span>

          <div className="last-updated-box">
            <i className="fa-regular fa-clock"></i>
            <span>Updated: {lastUpdated || "Live"}</span>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
