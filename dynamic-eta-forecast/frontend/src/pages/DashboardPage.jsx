import React from "react";
import SummaryCards from "../components/SummaryCards";
import PipelineStatus from "../components/PipelineStatus";
import TrainSearch from "../components/TrainSearch";
import EtaBreakdown from "../components/EtaBreakdown";
import EtaForecastTable from "../components/EtaForecastTable";
import SimulationControls from "../components/SimulationControls";
import DynamicCharts from "../components/DynamicCharts";
import GISMap from "../maps/GISMap";

export default function DashboardPage({
  allTrains,
  selectedTrain,
  onSelectTrain,
  currentTel,
  routeData,
  currentEta,
  modelMetrics
}) {
  return (
    <div className="page-content dashboard-page">
      <SummaryCards trainData={allTrains} currentEta={currentEta} />

      <PipelineStatus currentEta={currentEta} />

      <SimulationControls selectedTrain={selectedTrain} />

      <TrainSearch
        selectedTrain={selectedTrain}
        onSelectTrain={onSelectTrain}
        allTrains={allTrains}
        currentEta={currentEta}
      />

      <div className="grid-2-col">
        <EtaBreakdown currentEta={currentEta} />
        <GISMap currentTel={currentTel} routeData={routeData} currentEta={currentEta} />
      </div>

      <EtaForecastTable currentEta={currentEta} selectedTrain={selectedTrain} />

      <DynamicCharts currentEta={currentEta} metrics={modelMetrics} />
    </div>
  );
}
