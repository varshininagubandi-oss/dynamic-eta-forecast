const API_BASE = "http://127.0.0.1:8000/api";
const WS_BASE = "ws://127.0.0.1:8000/ws/live";

export async function fetchTrains() {
  const res = await fetch(`${API_BASE}/trains`);
  if (!res.ok) throw new Error("Failed to fetch trains");
  return await res.json();
}

export async function fetchTrainDetails(trainNumber) {
  const res = await fetch(`${API_BASE}/trains/${trainNumber}`);
  if (!res.ok) throw new Error(`Failed to fetch train ${trainNumber}`);
  return await res.json();
}

export async function fetchTrainETA(trainNumber) {
  const res = await fetch(`${API_BASE}/trains/${trainNumber}/eta`);
  if (!res.ok) throw new Error(`Failed to fetch ETA for ${trainNumber}`);
  return await res.json();
}

export async function fetchTrainRoute(trainNumber) {
  const res = await fetch(`${API_BASE}/trains/${trainNumber}/route`);
  if (!res.ok) throw new Error(`Failed to fetch route for ${trainNumber}`);
  return await res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/model/metrics`);
  if (!res.ok) throw new Error("Failed to fetch model metrics");
  return await res.json();
}

export async function postPrediction(features) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features)
  });
  if (!res.ok) throw new Error("Failed to run prediction");
  return await res.json();
}

export async function controlSimulator(action, speedMultiplier = 1.0, trainNumber = "12701", delayMinutes = 15.0) {
  const res = await fetch(`${API_BASE}/simulator/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      speed_multiplier: speedMultiplier,
      train_number: trainNumber,
      delay_minutes: delayMinutes
    })
  });
  if (!res.ok) throw new Error("Failed to control simulator");
  return await res.json();
}

export function connectWebSocket(onMessage, onError) {
  try {
    const ws = new WebSocket(WS_BASE);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };
    ws.onerror = (err) => {
      if (onError) onError(err);
    };
    return ws;
  } catch (err) {
    if (onError) onError(err);
    return null;
  }
}
