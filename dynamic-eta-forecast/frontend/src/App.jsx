import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import LiveTrainsPage from "./pages/LiveTrainsPage";
import EtaForecastPage from "./pages/EtaForecastPage";
import MapPage from "./pages/MapPage";
import ModelPage from "./pages/ModelPage";
import AboutPage from "./pages/AboutPage";
import {
  fetchTrains,
  fetchTrainDetails,
  fetchTrainETA,
  fetchTrainRoute,
  fetchModelMetrics,
  connectWebSocket
} from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTrain, setSelectedTrain] = useState("12701");
  const [allTrains, setAllTrains] = useState([]);
  const [currentTel, setCurrentTel] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [currentEta, setCurrentEta] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [wsConnected, setWsConnected] = useState(false);

  // Initial Load & Polling Loop
  const loadData = async () => {
    try {
      const trainRes = await fetchTrains();
      setAllTrains(trainRes.trains || []);

      const etaRes = await fetchTrainETA(selectedTrain);
      setCurrentEta(etaRes);

      const routeRes = await fetchTrainRoute(selectedTrain);
      setRouteData(routeRes);

      const telRes = await fetchTrainDetails(selectedTrain);
      setCurrentTel(telRes);

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());
    } catch (err) {
      console.error("Error loading live railway data", err);
    }
  };

  useEffect(() => {
    fetchModelMetrics().then(setModelMetrics).catch(console.error);
    loadData();

    // Set up polling interval every 3 seconds for continuous updates
    const interval = setInterval(loadData, 3000);

    // Try WebSocket connection
    const ws = connectWebSocket(
      (msg) => {
        setWsConnected(true);
        if (msg.type === "TELEMETRY_UPDATE") {
          loadData();
        }
      },
      () => setWsConnected(false)
    );

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [selectedTrain]);

  const handleSelectTrain = (tNo) => {
    setSelectedTrain(tNo);
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lastUpdated={lastUpdated}
        wsConnected={wsConnected}
      />

      <main className="main-viewport">
        {activeTab === "dashboard" && (
          <DashboardPage
            allTrains={allTrains}
            selectedTrain={selectedTrain}
            onSelectTrain={handleSelectTrain}
            currentTel={currentTel}
            routeData={routeData}
            currentEta={currentEta}
            modelMetrics={modelMetrics}
          />
        )}

        {activeTab === "live_trains" && (
          <LiveTrainsPage
            allTrains={allTrains}
            onSelectTrain={(tNo) => {
              handleSelectTrain(tNo);
              setActiveTab("dashboard");
            }}
          />
        )}

        {activeTab === "eta_forecast" && (
          <EtaForecastPage
            currentEta={currentEta}
            selectedTrain={selectedTrain}
          />
        )}

        {activeTab === "map" && (
          <MapPage
            currentTel={currentTel}
            routeData={routeData}
            currentEta={currentEta}
            selectedTrain={selectedTrain}
            onSelectTrain={handleSelectTrain}
            allTrains={allTrains}
          />
        )}

        {activeTab === "model" && (
          <ModelPage modelMetrics={modelMetrics} />
        )}

        {activeTab === "about" && (
          <AboutPage />
        )}
      </main>
    </div>
  );
}
