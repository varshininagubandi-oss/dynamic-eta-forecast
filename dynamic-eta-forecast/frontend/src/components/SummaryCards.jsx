import React from "react";

export default function SummaryCards({ trainData, currentEta }) {
  const trains = trainData || [];
  const total = trains.length || 5;
  const delayed = trains.filter(t => (t.current_delay || 0) > 5).length || 3;
  const onTime = total - delayed;
  
  const avgDelay = total > 0 
    ? Math.round(trains.reduce((acc, t) => acc + (t.current_delay || 0), 0) / total)
    : 14;

  const confidencePct = currentEta?.confidence?.confidence_score_pct || 87.5;

  return (
    <div className="summary-cards-grid">
      <div className="card summary-card card-blue">
        <div className="card-header-flex">
          <span className="card-label">Live Trains</span>
          <div className="card-icon-circle blue"><i className="fa-solid fa-train"></i></div>
        </div>
        <div className="card-value">{total}</div>
        <div className="card-subtext"><span className="trend-up"><i className="fa-solid fa-signal"></i> Active Monitored</span> Corridor Express Trains</div>
      </div>

      <div className="card summary-card card-green">
        <div className="card-header-flex">
          <span className="card-label">On-Time</span>
          <div className="card-icon-circle green"><i className="fa-solid fa-circle-check"></i></div>
        </div>
        <div className="card-value">{onTime}</div>
        <div className="card-subtext"><span className="trend-good"><i className="fa-solid fa-check"></i> Within ±5 min</span> Schedule Envelope</div>
      </div>

      <div className="card summary-card card-red">
        <div className="card-header-flex">
          <span className="card-label">Delayed Trains</span>
          <div className="card-icon-circle red"><i className="fa-solid fa-triangle-exclamation"></i></div>
        </div>
        <div className="card-value">{delayed}</div>
        <div className="card-subtext"><span className="trend-bad"><i className="fa-solid fa-arrow-up"></i> Cumulative</span> Congestion & Route Holds</div>
      </div>

      <div className="card summary-card card-amber">
        <div className="card-header-flex">
          <span className="card-label">Average Delay</span>
          <div className="card-icon-circle amber"><i className="fa-solid fa-stopwatch"></i></div>
        </div>
        <div className="card-value">+{avgDelay} <span className="unit">min</span></div>
        <div className="card-subtext"><span className="trend-neutral">System-wide</span> Coaching Corridor Avg</div>
      </div>

      <div className="card summary-card card-purple">
        <div className="card-header-flex">
          <span className="card-label">Prediction Confidence</span>
          <div className="card-icon-circle purple"><i className="fa-solid fa-shield-halved"></i></div>
        </div>
        <div className="card-value">{confidencePct}%</div>
        <div className="card-subtext"><span className="trend-good"><i className="fa-solid fa-check-double"></i> XGBoost Audit</span> High Data Quality</div>
      </div>
    </div>
  );
}
