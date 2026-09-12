# AI Disaster Resource Mapper

> **Tagline:** *"Mapping Resources. Connecting People. Saving Lives."*

AI Disaster Resource Mapper is a modern, enterprise-grade, real-time disaster management platform. Inspired by **Google Crisis Response**, **Google Maps**, **Apple**, **Vercel**, and **Stripe Dashboard**, this application delivers interactive situation awareness, Gemini AI report verification, automated resource matching, volunteer dispatching, and executive analytics.

---

## 🌟 Key Features

1. **Interactive Situation Awareness Map**
   - Dual Map Engine: OpenStreetMap / Leaflet + Google Maps / Satellite mode.
   - Live Incident Pins: Floods, Earthquakes, Wildfires, Tsunamis, Building Collapses, Water Shortages.
   - Severity Color Coding: Red (Critical), Orange (High), Blue (Relief Node), Green (Safe Shelter), Purple (Volunteer Team).

2. **Gemini AI Incident Verification Engine**
   - Multimodal analysis pipeline checking confidence score (%), fake report detection, duplicate removal, auto-tagging, and recommended dispatch actions.

3. **Smart Resource Allocation & Route Dispatch**
   - AI distance matrix calculating nearest hospitals, food camps, rescue boats, and trauma centers with ETA and capacity meters.

4. **SOS Emergency Siren & Sound Alarm**
   - One-click floating SOS trigger emitting audible dual-tone emergency siren alarm (via Web Audio API) and auto-broadcasting GPS coordinates.

5. **AI Multilingual & Voice Assistant Chatbot**
   - Powered by simulated Gemini API with voice recognition (`webkitSpeechRecognition`) and text-to-speech output (`speechSynthesis`).

6. **Role-Based Portals**
   - Instant role switching between **Citizen**, **Volunteer**, **Hospital**, **Government Authority**, **NGO Partner**, and **System Administrator**.

7. **Real-Time Analytics & Command Dashboards**
   - Interactive Chart.js graphs for disaster trends, 24-hour response rates, ICU capacity tracking, and audit logs.

8. **Export Data Engine**
   - Instant JSON (`disaster_system_data.json`) and CSV (`disaster_incidents.csv`) exports.

9. **Progressive Web App (PWA) Offline Support**
   - Service worker `sw.js` caching app shell for emergency offline availability.

---

## 🚀 Quick Start Guide

### Option 1: Run with Python HTTP Server
```bash
python -m http.server 8080 --bind 0.0.0.0
```
Or use the npm alias:
```bash
npm run start-public
```
Open your browser locally at `http://localhost:8080` or from another device on your network at `http://<host-ip>:8080`

To find your Windows host IP address for another device on the same LAN, run in PowerShell:
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*'} | Select-Object -ExpandProperty IPAddress
```

### Option 2: Run with Docker & Docker Compose
```bash
docker-compose up -d
```
Access the containerized app locally at `http://localhost:8080` or from another device on your network at `http://<host-ip>:8080`

> Note: Docker port mapping already exposes the app on the host network interface. If other devices still cannot reach it, check your host firewall settings and ensure port `8080` is allowed.

---

## 📂 Project Architecture

```
projects/
├── index.html           # Main HTML application layout & UI structure
├── styles.css           # Custom Glassmorphism design system & CSS variables
├── app.js               # Core state management, Leaflet map, AI engine, Audio Synth
├── sw.js                # Service Worker for PWA offline support
├── manifest.json        # PWA metadata manifest
├── package.json         # Project setup & scripts
├── Dockerfile           # Nginx production container build
├── docker-compose.yml   # Multi-container orchestration
├── .env.example         # API keys & environment variable specs
└── README.md            # Enterprise documentation
```

---

## 🛡️ License
Distributed under the **MIT License**.
