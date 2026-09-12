import React from "react";

export default function PipelineStatus({ currentEta }) {
  const pipeline = currentEta?.pipeline_status || {
    live_data: "Received (2s tick)",
    data_cleaning: "Validated (0 Anomalies)",
    feature_engineering: "16 Features Engineered",
    model_execution: "XGBoost Model Active",
    confidence_audit: "High Confidence (87.5%)"
  };

  const steps = [
    { title: "Live Data Layer", desc: pipeline.live_data, icon: "fa-satellite-dish" },
    { title: "Data Cleaning", desc: pipeline.data_cleaning, icon: "fa-filter" },
    { title: "Feature Engineering", desc: pipeline.feature_engineering, icon: "fa-gears" },
    { title: "XGBoost ETA Model", desc: pipeline.model_execution, icon: "fa-brain" },
    { title: "Confidence Check", desc: pipeline.confidence_audit, icon: "fa-shield-heart" },
    { title: "Live ETA Display", desc: "Updated on Dashboard", icon: "fa-display" }
  ];

  return (
    <div className="card pipeline-card">
      <div className="card-title-bar">
        <i className="fa-solid fa-diagram-project"></i>
        <span>DYNAMIC ETA PREDICTION PIPELINE FLOW</span>
      </div>

      <div className="pipeline-steps-grid">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="pipeline-step-item">
              <div className="step-badge-num">{idx + 1}</div>
              <div className="step-icon-box">
                <i className={`fa-solid ${step.icon}`}></i>
              </div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="pipeline-arrow">
                <i className="fa-solid fa-angle-right"></i>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
