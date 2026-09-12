import React from "react";
import EtaForecastTable from "../components/EtaForecastTable";
import EtaBreakdown from "../components/EtaBreakdown";

export default function EtaForecastPage({ currentEta, selectedTrain }) {
  return (
    <div className="page-content eta-forecast-page">
      <div className="page-header-box">
        <h2><i className="fa-solid fa-clock"></i> Continuous Real-Time ETA Forecast</h2>
        <p>Station-by-station expected arrival time predictions recalculating dynamically on telemetry arrival.</p>
      </div>

      <EtaBreakdown currentEta={currentEta} />
      <EtaForecastTable currentEta={currentEta} selectedTrain={selectedTrain} />
    </div>
  );
}
