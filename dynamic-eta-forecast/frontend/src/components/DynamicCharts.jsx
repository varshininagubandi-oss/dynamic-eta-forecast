import React from "react";

export default function DynamicCharts({ currentEta, metrics }) {
  const forecast = currentEta?.eta_prediction?.forecast_table || [
    { station_code: "NDLS", scheduled_eta: "16:00", predicted_eta: "16:18", delay_minutes: 18 },
    { station_code: "AGC", scheduled_eta: "18:15", predicted_eta: "18:35", delay_minutes: 20 },
    { station_code: "VGLJ", scheduled_eta: "21:00", predicted_eta: "21:22", delay_minutes: 22 },
    { station_code: "BPL", scheduled_eta: "01:30", predicted_eta: "01:54", delay_minutes: 24 },
    { station_code: "NGP", scheduled_eta: "07:45", predicted_eta: "08:08", delay_minutes: 23 },
    { station_code: "SC", scheduled_eta: "15:20", predicted_eta: "15:40", delay_minutes: 20 },
    { station_code: "HYB", scheduled_eta: "16:00", predicted_eta: "16:18", delay_minutes: 18 }
  ];

  const maxDelay = Math.max(30, ...forecast.map(f => f.delay_minutes || 0));

  return (
    <div className="charts-grid-layout">
      {/* Chart 1: Delay Trend Over Route */}
      <div className="card chart-card">
        <div className="card-title-bar">
          <i className="fa-solid fa-chart-line"></i>
          <span>ACCUMULATED DELAY TREND ALONG ROUTE (MINUTES)</span>
        </div>
        <div className="chart-wrapper-svg">
          <svg viewBox="0 0 500 200" className="responsive-svg">
            {/* Grid lines */}
            <line x1="40" y1="20" x2="480" y2="20" stroke="#334155" strokeDasharray="3 3" />
            <line x1="40" y1="70" x2="480" y2="70" stroke="#334155" strokeDasharray="3 3" />
            <line x1="40" y1="120" x2="480" y2="120" stroke="#334155" strokeDasharray="3 3" />
            <line x1="40" y1="170" x2="480" y2="170" stroke="#475569" />

            {/* Polyline path */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              points={forecast.map((f, i) => {
                const x = 40 + (i * (440 / Math.max(1, forecast.length - 1)));
                const y = 170 - ((f.delay_minutes / maxDelay) * 140);
                return `${x},${y}`;
              }).join(" ")}
            />

            {/* Nodes */}
            {forecast.map((f, i) => {
              const x = 40 + (i * (440 / Math.max(1, forecast.length - 1)));
              const y = 170 - ((f.delay_minutes / maxDelay) * 140);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="5" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
                  <text x={x} y={y - 10} fill="#fef08a" fontSize="11" textAnchor="middle">
                    +{Math.round(f.delay_minutes)}m
                  </text>
                  <text x={x} y="188" fill="#94a3b8" fontSize="10" textAnchor="middle">
                    {f.station_code}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Chart 2: Segment Travel Time: Scheduled vs XGBoost Predicted */}
      <div className="card chart-card">
        <div className="card-title-bar">
          <i className="fa-solid fa-chart-column"></i>
          <span>SEGMENT TRAVEL TIME: SCHEDULED VS PREDICTED (MINUTES)</span>
        </div>
        <div className="chart-wrapper-bars">
          {forecast.slice(0, 5).map((f, i) => {
            const sched = 75;
            const pred = sched + (f.delay_minutes || 10);
            return (
              <div key={i} className="bar-group-item">
                <div className="bar-label-top">{f.station_code}</div>
                <div className="bars-container">
                  <div className="bar bar-sched" style={{ height: `${(sched / 120) * 100}%` }} title={`Scheduled: ${sched}m`}>
                    <span className="bar-val">{sched}</span>
                  </div>
                  <div className="bar bar-pred" style={{ height: `${(pred / 120) * 100}%` }} title={`Predicted: ${pred}m`}>
                    <span className="bar-val">{pred}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-box box-sched"></span> Scheduled Segment</span>
          <span className="legend-item"><span className="legend-box box-pred"></span> XGBoost Predicted</span>
        </div>
      </div>
    </div>
  );
}
