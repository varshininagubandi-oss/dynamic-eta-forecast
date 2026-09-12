import React from "react";

export default function EtaForecastTable({ currentEta, selectedTrain }) {
  const forecastList = currentEta?.eta_prediction?.forecast_table || [
    { station_code: "SC", station_name: "Secunderabad Junction", scheduled_eta: "21:30", predicted_eta: "21:42", delay_formatted: "+12 min", dwell_time_min: 3, confidence_pct: 91, status: "NEXT" },
    { station_code: "BZA", station_name: "Vijayawada Junction", scheduled_eta: "23:50", predicted_eta: "00:07", delay_formatted: "+17 min", dwell_time_min: 5, confidence_pct: 87, status: "UPCOMING" },
    { station_code: "MAS", station_name: "Chennai Central", scheduled_eta: "06:30", predicted_eta: "06:48", delay_formatted: "+18 min", dwell_time_min: 4, confidence_pct: 82, status: "UPCOMING" }
  ];

  return (
    <div className="card forecast-table-card">
      <div className="card-title-bar">
        <i className="fa-solid fa-list-check"></i>
        <span>UPCOMING STATIONS ETA FORECAST TABLE - TRAIN {selectedTrain || "12701"}</span>
      </div>

      <div className="table-responsive">
        <table className="forecast-table">
          <thead>
            <tr>
              <th>Station Code</th>
              <th>Station Name</th>
              <th>Type</th>
              <th>Scheduled</th>
              <th>Predicted ETA</th>
              <th>Delay</th>
              <th>Est Dwell</th>
              <th>Confidence</th>
              <th>Route Status</th>
            </tr>
          </thead>
          <tbody>
            {forecastList.map((row, idx) => (
              <tr key={idx} className={`row-status-${row.status?.toLowerCase()}`}>
                <td><span className="station-code-badge">{row.station_code}</span></td>
                <td className="font-semibold">{row.station_name}</td>
                <td><span className="type-tag">{row.station_type || "Junction"}</span></td>
                <td className="text-dim">{row.scheduled_eta}</td>
                <td className="text-predicted">{row.predicted_eta}</td>
                <td>
                  <span className={`delay-badge ${row.delay_minutes > 0 ? "delayed" : "ontime"}`}>
                    {row.delay_formatted}
                  </span>
                </td>
                <td>{row.dwell_time_min} min</td>
                <td>
                  <div className="confidence-mini-bar">
                    <div className="bar-fill" style={{ width: `${row.confidence_pct}%` }}></div>
                    <span>{row.confidence_pct}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-pill pill-${row.status?.toLowerCase()}`}>
                    {row.status === "NEXT" ? "⚡ Next Stop" : row.status === "PASSED" ? "✓ Passed" : "Upcoming"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
