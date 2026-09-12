import React from "react";
import GISMap from "../maps/GISMap";
import TrainSearch from "../components/TrainSearch";

export default function MapPage({ currentTel, routeData, currentEta, selectedTrain, onSelectTrain, allTrains }) {
  return (
    <div className="page-content map-page">
      <TrainSearch
        selectedTrain={selectedTrain}
        onSelectTrain={onSelectTrain}
        allTrains={allTrains}
        currentEta={currentEta}
      />
      <GISMap currentTel={currentTel} routeData={routeData} currentEta={currentEta} />
    </div>
  );
}
