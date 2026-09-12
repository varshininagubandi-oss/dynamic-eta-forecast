import React, { useState } from "react";
import { controlSimulator } from "../services/api";

export default function SimulationControls({ selectedTrain }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [msg, setMsg] = useState("");

  const handlePlayPause = async () => {
    try {
      const nextState = !isPlaying;
      setIsPlaying(nextState);
      await controlSimulator(nextState ? "play" : "pause");
      setMsg(nextState ? "Simulation Resumed" : "Simulation Paused");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpeedChange = async (spd) => {
    try {
      setSpeedMultiplier(spd);
      await controlSimulator("speed", spd);
      setMsg(`Simulation Speed: ${spd}x`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInjectDelay = async () => {
    try {
      await controlSimulator("inject_delay", speedMultiplier, selectedTrain, 15.0);
      setMsg(`+15 min delay injected into Train ${selectedTrain}! Watch ETA update.`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="card sim-controls-card">
      <div className="sim-title">
        <i className="fa-solid fa-gamepad"></i>
        <span>REAL-TIME LIVE TELEMETRY SIMULATOR CONTROLS</span>
      </div>

      <div className="sim-buttons-group">
        <button className={`btn-sim ${isPlaying ? "btn-pause" : "btn-play"}`} onClick={handlePlayPause}>
          <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
          {isPlaying ? "Pause Simulator" : "Play Simulator"}
        </button>

        <div className="speed-selector">
          <span className="speed-label">Speed:</span>
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              className={`speed-btn ${speedMultiplier === s ? "active" : ""}`}
              onClick={() => handleSpeedChange(s)}
            >
              {s}x
            </button>
          ))}
        </div>

        <button className="btn-sim btn-inject" onClick={handleInjectDelay}>
          <i className="fa-solid fa-bolt"></i>
          Inject +15 Min Delay (Test AI)
        </button>
      </div>

      {msg && <div className="sim-status-msg">{msg}</div>}
    </div>
  );
}
