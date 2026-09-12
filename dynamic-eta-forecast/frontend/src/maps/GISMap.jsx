import React, { useEffect, useRef } from "react";

export default function GISMap({ currentTel, routeData, currentEta }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const trainMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const stationMarkersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!window.L) return;

    const L = window.L;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // India center
        zoom: 6,
        zoomControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(leafletMap.current);
    }

    const map = leafletMap.current;

    // Clear old station markers
    stationMarkersRef.current.forEach(m => map.removeLayer(m));
    stationMarkersRef.current = [];

    // Render Route Polylines & Station Pins
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
      }

      routePolylineRef.current = L.polyline(routeData.coordinates, {
        color: "#3b82f6",
        weight: 5,
        opacity: 0.8,
        dashArray: "8, 4"
      }).addTo(map);

      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });

      // Add station markers
      const forecastTable = currentEta?.eta_prediction?.forecast_table || [];
      routeData.stations.forEach((stn, idx) => {
        const fc = forecastTable.find(f => f.station_code === stn.code) || {};
        
        const stationIcon = L.divIcon({
          className: "custom-station-pin",
          html: `<div className="pin-dot"></div><div className="pin-code">${stn.code}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div class="map-popup">
            <div class="popup-title">${stn.name} (${stn.code})</div>
            <div class="popup-row"><span>Scheduled Arrival:</span> <strong>${fc.scheduled_eta || "21:30"}</strong></div>
            <div class="popup-row"><span>Predicted ETA:</span> <strong style="color:#60a5fa">${fc.predicted_eta || "21:42"}</strong></div>
            <div class="popup-row"><span>Delay:</span> <strong style="color:#f87171">${fc.delay_formatted || "+12 min"}</strong></div>
            <div class="popup-row"><span>Confidence:</span> <strong style="color:#34d399">${fc.confidence_pct || 91}%</strong></div>
          </div>
        `;

        const marker = L.marker([stn.lat, stn.lng], { icon: stationIcon })
          .bindPopup(popupContent)
          .addTo(map);

        stationMarkersRef.current.push(marker);
      });
    }

    // Moving Train Marker
    if (currentTel && currentTel.latitude && currentTel.longitude) {
      const trainIcon = L.divIcon({
        className: "custom-train-marker",
        html: `<div className="train-icon-pulse"><i class="fa-solid fa-train"></i></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      if (!trainMarkerRef.current) {
        trainMarkerRef.current = L.marker([currentTel.latitude, currentTel.longitude], { icon: trainIcon })
          .bindPopup(`
            <div class="map-popup">
              <div class="popup-title">${currentTel.train_number} - ${currentTel.train_name}</div>
              <div class="popup-row"><span>Speed:</span> <strong>${currentTel.current_speed_kmh} km/h</strong></div>
              <div class="popup-row"><span>Delay:</span> <strong>+${currentTel.current_delay} min</strong></div>
              <div class="popup-row"><span>Next Stop:</span> <strong>${currentTel.next_station}</strong></div>
            </div>
          `)
          .addTo(map);
      } else {
        trainMarkerRef.current.setLatLng([currentTel.latitude, currentTel.longitude]);
      }
    }

  }, [currentTel, routeData, currentEta]);

  return (
    <div className="card map-card">
      <div className="card-title-bar flex-between">
        <div>
          <i className="fa-solid fa-map-location-dot"></i>
          <span>GIS REAL-TIME LIVE TRAIN TRACKING MAP</span>
        </div>
        <div className="map-badge">
          <span className="live-pulse"></span>
          Live Positioning Active
        </div>
      </div>
      <div ref={mapRef} className="leaflet-container-box"></div>
    </div>
  );
}
