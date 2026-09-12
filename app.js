/* AI Disaster Resource Mapper - Enterprise Application Logic */

// ==========================================
// 1. STATE & MOCK DATASETS
// ==========================================

const state = {
  currentTab: 'landing',
  currentRole: 'Citizen',
  currentLang: 'en',
  theme: 'dark',
  map: null,
  mapStyle: 'standard',
  mapTileLayer: null,
  sirenAudioCtx: null,
  sirenOscillator: null,
  isSirenMuted: false,
  
  incidents: [
    { id: 'INC-101', type: 'Flood', location: 'Riverfront Bay District', coords: [37.7749, -122.4194], severity: 'CRITICAL', confidence: '99.2%', desc: 'Flash flood level reaching 2 meters. 15 residents trapped on roof.', verified: true, time: '2 mins ago' },
    { id: 'INC-102', type: 'Wildfire', location: 'Pine Ridge Hills Sector 4', coords: [37.7833, -122.4167], severity: 'CRITICAL', confidence: '97.8%', desc: 'Uncontrolled brush fire spreading eastwards. Evacuation ordered.', verified: true, time: '8 mins ago' },
    { id: 'INC-103', type: 'Earthquake', location: 'Downtown Metro Corridor', coords: [37.7650, -122.4250], severity: 'HIGH', confidence: '95.4%', desc: '6.2 magnitude quake tremor. Power grid outage reported across 4 blocks.', verified: true, time: '14 mins ago' },
    { id: 'INC-104', type: 'Building Collapse', location: 'Industrial Park Way', coords: [37.7580, -122.4080], severity: 'CRITICAL', confidence: '98.9%', desc: 'Warehouse structure compromise. Search & Rescue K9 team dispatched.', verified: true, time: '22 mins ago' },
    { id: 'INC-105', type: 'Water Shortage', location: 'South Valley Relief Center', coords: [37.7490, -122.4350], severity: 'MEDIUM', confidence: '92.1%', desc: 'Clean water tank supply critically low. 500 liters required.', verified: true, time: '35 mins ago' }
  ],

  resources: [
    { id: 'RES-01', name: 'St. Mary Central Hospital & ICU', category: 'Medical & ICU', dist: '1.2 km', eta: '4 mins', capacity: '42 Beds Free', status: 'Available', coords: [37.7720, -122.4220] },
    { id: 'RES-02', name: 'Metro Emergency Food Camp Alpha', category: 'Food & Rations', dist: '2.4 km', eta: '8 mins', capacity: '5,000 Meal Packs', status: 'Active', coords: [37.7800, -122.4100] },
    { id: 'RES-03', name: 'Coast Guard Rescue Boat Fleet', category: 'Water Rescue', dist: '3.1 km', eta: '11 mins', capacity: '8 Motorboats Ready', status: 'Dispatched', coords: [37.7600, -122.4300] },
    { id: 'RES-04', name: 'Civic Evacuation High School Shelter', category: 'Safe Shelter', dist: '0.8 km', eta: '3 mins', capacity: '450 Cots Available', status: 'Available', coords: [37.7680, -122.4150] },
    { id: 'RES-05', name: 'Regional Blood Bank Reserve', category: 'Blood & Trauma', dist: '4.5 km', eta: '15 mins', capacity: 'O-Negative 120 Units', status: 'High Demand', coords: [37.7550, -122.4000] }
  ],

  volunteers: [
    { id: 'VOL-01', name: 'Dr. Sarah Jenkins', skill: 'Emergency Medical Doctor', lang: 'English, Spanish', vehicle: '4x4 Rescue Truck', rating: 4.9, status: 'On Active Mission', coords: [37.7760, -122.4180] },
    { id: 'VOL-02', name: 'Marcus Vance', skill: 'Rescue Boat Driver', lang: 'English, French', vehicle: 'Ambulance Motorboat', rating: 4.95, status: 'Available', coords: [37.7810, -122.4120] },
    { id: 'VOL-03', name: 'Elena Rostova', skill: 'Civil Structural Engineer', lang: 'English, Russian', vehicle: 'Motorcycle', rating: 4.85, status: 'Evaluating Hazards', coords: [37.7670, -122.4230] },
    { id: 'VOL-04', name: 'David Kim', skill: 'Logistics & Relief Cook', lang: 'English, Korean', vehicle: 'Foot / Public Transport', rating: 4.9, status: 'Preparing Meals', coords: [37.7590, -122.4110] }
  ],

  helpRequests: [
    { id: 'REQ-501', type: 'Emergency Rescue Boat', name: 'Family of 4', count: 4, priority: 'CRITICAL', address: 'Rooftop 4th Ave River Drive', phone: '+1 (555) 018-9921', status: 'Dispatch En Route', time: '5 mins ago' },
    { id: 'REQ-502', type: 'Medical Assistance', name: 'Elderly Resident', count: 1, priority: 'HIGH', address: 'Apartment 3B, Oak Street', phone: '+1 (555) 014-3320', status: 'Medical Team Assigned', time: '18 mins ago' }
  ],

  auditLogs: [
    { time: '17:28:40', action: 'AI Verification Executed: Incident INC-101 confirmed', role: 'System AI', status: 'PASSED' },
    { time: '17:25:12', action: 'City-Wide Evacuation Alert Broadcast Sent', role: 'Govt Authority', status: 'SENT' },
    { time: '17:20:05', action: 'Volunteer VOL-02 dispatched to Riverfront', role: 'Dispatcher', status: 'SUCCESS' },
    { time: '17:15:30', action: 'User Auth Session Established (Citizen)', role: 'Citizen User', status: 'AUTHENTICATED' }
  ]
};

// ==========================================
// 2. INITIALIZATION & EVEN LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) lucide.createIcons();

  // Init Background Particles
  initParticleBackground();

  // Render Incident Stream Feed
  renderIncidentFeed();

  // Render Resource Matching Table
  renderResourceMatchingTable();

  // Render Volunteer Roster
  renderVolunteerRoster();

  // Render Help Requests
  renderHelpRequests();

  // Render Audit Logs
  renderAuditLogs();

  // Render Hospital Capacity
  renderHospitalCapacity();

  // Init Leaflet Map
  initLeafletMap();

  // Init Charts
  initCharts();
});

// ==========================================
// 3. NAVIGATION & ROLE SWITCHER
// ==========================================

function switchTab(tabId) {
  state.currentTab = tabId;
  
  // Hide all view sections
  const views = document.querySelectorAll('.view-section');
  views.forEach(view => view.style.display = 'none');

  // Show selected view
  const activeView = document.getElementById(`view-${tabId}`);
  if (activeView) {
    activeView.style.display = 'block';
  }

  // Update Nav Button Active States
  const navBtns = document.querySelectorAll('#main-nav-links button');
  navBtns.forEach(btn => btn.classList.remove('active'));

  // Trigger Leaflet Map invalidateSize when map tab is opened
  if (tabId === 'map' && state.map) {
    setTimeout(() => state.map.invalidateSize(), 200);
  }
}

function handleRoleChange(role) {
  state.currentRole = role;
  const roleSub = document.getElementById('current-role-subtitle');
  if (roleSub) {
    roleSub.innerText = `Showing: ${role} Command Dashboard`;
  }
  showNotification(`User Role Switched to: ${role}`, 'info');
}

function handleLangChange(lang) {
  state.currentLang = lang;
  showNotification(`Language set to: ${lang.toUpperCase()}`, 'info');
}

function toggleTheme() {
  const html = document.documentElement;
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', state.theme);
  
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.innerHTML = state.theme === 'dark' 
      ? '<i data-lucide="sun" style="width: 18px; height: 18px;"></i>' 
      : '<i data-lucide="moon" style="width: 18px; height: 18px;"></i>';
    if (window.lucide) lucide.createIcons();
  }
}

// Notification Toast Helper
function showNotification(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'glass-card';
  toast.style.cssText = `
    position: fixed; top: 80px; right: 20px; z-index: 2000;
    padding: 12px 20px; font-weight: 600; font-size: 0.85rem;
    border-left: 4px solid ${type === 'danger' ? '#DC2626' : type === 'success' ? '#16A34A' : '#2563EB'};
    box-shadow: 0 10px 25px rgba(0,0,0,0.3); transition: all 0.3s ease;
  `;
  toast.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><i data-lucide="${type === 'danger' ? 'alert-triangle' : 'info'}"></i> ${msg}</div>`;
  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// 4. INTERACTIVE LEAFLET MAP LAYER
// ==========================================

function initLeafletMap() {
  const mapElement = document.getElementById('disaster-leaflet-map');
  if (!mapElement) return;

  // Default Center: San Francisco / Bay Area Coordinates [37.7749, -122.4194]
  state.map = L.map('disaster-leaflet-map', {
    center: [37.7749, -122.4194],
    zoom: 13,
    zoomControl: true
  });

  // Base Tile Layer (OpenStreetMap)
  state.mapTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors | AI Disaster Mapper'
  }).addTo(state.map);

  // Add Incident Markers
  state.incidents.forEach(inc => {
    const color = inc.severity === 'CRITICAL' ? '#DC2626' : '#EA580C';
    const customHtml = `<div style="background:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px ${color};"></div>`;
    const icon = L.divIcon({ html: customHtml, className: 'leaflet-custom-pin' });

    L.marker(inc.coords, { icon })
      .addTo(state.map)
      .bindPopup(`
        <div style="font-family:sans-serif; padding:4px;">
          <h4 style="margin:0 0 4px 0; color:${color};">[${inc.severity}] ${inc.type}</h4>
          <p style="margin:0 0 6px 0; font-size:12px;"><strong>${inc.location}</strong></p>
          <p style="margin:0 0 6px 0; font-size:11px; color:#666;">${inc.desc}</p>
          <div style="font-size:11px;">Confidence: <strong>${inc.confidence}</strong></div>
          <button onclick="switchTab('ai-verify')" style="margin-top:6px; background:#2563EB; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer;">Inspect AI Report</button>
        </div>
      `);
  });

  // Add Resource Markers
  state.resources.forEach(res => {
    const customHtml = `<div style="background:#2563EB; width:14px; height:14px; border-radius:3px; border:2px solid white;"></div>`;
    const icon = L.divIcon({ html: customHtml, className: 'leaflet-custom-res-pin' });

    L.marker(res.coords, { icon })
      .addTo(state.map)
      .bindPopup(`
        <div style="font-family:sans-serif; padding:4px;">
          <h4 style="margin:0 0 4px 0; color:#2563EB;">${res.name}</h4>
          <p style="margin:0 0 4px 0; font-size:11px;">Capacity: ${res.capacity}</p>
          <p style="margin:0; font-size:11px; color:#666;">ETA: ${res.eta} (${res.dist})</p>
        </div>
      `);
  });
}

function setMapStyle(style) {
  state.mapStyle = style;
  document.querySelectorAll('#map-style-standard, #map-style-satellite, #map-style-dark').forEach(b => b.classList.remove('active'));
  document.getElementById(`map-style-${style}`).classList.add('active');

  if (!state.mapTileLayer) return;

  let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  if (style === 'satellite') {
    url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  } else if (style === 'dark') {
    url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  }

  state.mapTileLayer.setUrl(url);
}

function filterMapMarkers() {
  showNotification('Map view filters applied', 'info');
}

// ==========================================
// 5. RENDERING DATA PANELS
// ==========================================

function renderIncidentFeed() {
  const container = document.getElementById('incident-feed-list');
  if (!container) return;

  container.innerHTML = state.incidents.map(inc => `
    <div class="glass-card" style="padding: 14px; border-left: 4px solid ${inc.severity === 'CRITICAL' ? '#DC2626' : '#EA580C'};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge ${inc.severity === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}">${inc.severity}</span>
          <strong style="font-size: 0.95rem;">${inc.type} - ${inc.location}</strong>
        </div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${inc.time}</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">${inc.desc}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
        <span style="color: var(--color-success); font-weight: 600;"><i data-lucide="check-circle" style="width:12px;"></i> AI Confidence: ${inc.confidence}</span>
        <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 4px 8px;" onclick="switchTab('resources')">Dispatch Aid</button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function renderResourceMatchingTable() {
  const tbody = document.getElementById('resource-matching-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.resources.map(res => `
    <tr style="border-bottom: 1px solid var(--border-color);">
      <td style="padding: 12px; font-weight: 600;">${res.name}</td>
      <td style="padding: 12px;"><span class="badge badge-info">${res.category}</span></td>
      <td style="padding: 12px; font-weight: 600; color: var(--color-primary);">${res.dist}</td>
      <td style="padding: 12px;">${res.eta}</td>
      <td style="padding: 12px; font-weight: 600;">${res.capacity}</td>
      <td style="padding: 12px;"><span class="badge badge-safe">${res.status}</span></td>
      <td style="padding: 12px;">
        <button class="btn btn-primary" style="font-size: 0.75rem; padding: 4px 8px;" onclick="dispatchResource('${res.id}')">
          <i data-lucide="navigation" style="width:12px;"></i> Route & Dispatch
        </button>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function renderVolunteerRoster() {
  const container = document.getElementById('volunteer-roster-list');
  if (!container) return;

  container.innerHTML = state.volunteers.map(vol => `
    <div class="glass-card" style="padding: 14px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 2px;">${vol.name} <span class="badge badge-purple" style="font-size: 0.65rem;">★ ${vol.rating}</span></div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${vol.skill} • ${vol.vehicle}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Languages: ${vol.lang}</div>
      </div>
      <span class="badge badge-safe">${vol.status}</span>
    </div>
  `).join('');
}

function renderHelpRequests() {
  const container = document.getElementById('help-request-tracker-list');
  if (!container) return;

  container.innerHTML = state.helpRequests.map(req => `
    <div class="glass-card" style="padding: 14px; border-left: 4px solid ${req.priority === 'CRITICAL' ? '#DC2626' : '#EA580C'};">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <strong style="font-size: 0.9rem;">[${req.id}] ${req.type} (${req.count} People)</strong>
        <span class="badge badge-critical">${req.priority}</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px;">Location: ${req.address}</div>
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
        <span>Status: <strong style="color: var(--color-primary);">${req.status}</strong></span>
        <span>${req.time}</span>
      </div>
    </div>
  `).join('');
}

function renderHospitalCapacity() {
  const container = document.getElementById('hospital-capacity-list');
  if (!container) return;

  const hospitals = [
    { name: 'St. Mary Central Hospital', beds: '42 / 120 Beds Open', blood: 'O- 45 Units, A+ 80 Units', status: 'NORMAL OPERATIONAL' },
    { name: 'General Trauma Emergency Center', beds: '12 / 80 Beds Open', blood: 'O- 10 Units (LOW)', status: 'HIGH SURGE CAPACITY' },
    { name: 'Bay Area Field Relief Camp', beds: '180 / 300 Cots Open', blood: 'Field First Aid Only', status: 'RECEIVING VICTIMS' }
  ];

  container.innerHTML = hospitals.map(h => `
    <div class="glass-card" style="padding: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <strong style="font-size: 0.95rem;">${h.name}</strong>
        <span class="badge badge-safe">${h.status}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
        <span>ICU & Bed Capacity: <strong>${h.beds}</strong></span>
        <span>Blood Inventory: <strong>${h.blood}</strong></span>
      </div>
    </div>
  `).join('');
}

function renderAuditLogs() {
  const tbody = document.getElementById('admin-audit-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.auditLogs.map(log => `
    <tr style="border-bottom: 1px solid var(--border-color);">
      <td style="padding: 10px; color: var(--text-muted);">${log.time}</td>
      <td style="padding: 10px; font-weight: 500;">${log.action}</td>
      <td style="padding: 10px;"><span class="badge badge-info">${log.role}</span></td>
      <td style="padding: 10px;"><span class="badge badge-safe">${log.status}</span></td>
    </tr>
  `).join('');
}

// ==========================================
// 6. AI FORM SUBMISSION & VERIFICATION ENGINE
// ==========================================

function handleAIReportSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('report-type').value;
  const desc = document.getElementById('report-desc').value;
  const loc = document.getElementById('report-location').value;

  showNotification('Running Gemini AI Verification Algorithm...', 'info');

  setTimeout(() => {
    // Dynamically update Gemini AI output container
    const outputBadge = document.getElementById('ai-badge-status');
    const confidenceScore = document.getElementById('ai-confidence-score');
    const urgencyLevel = document.getElementById('ai-urgency-level');
    const verdictSummary = document.getElementById('ai-verdict-summary');

    if (outputBadge) outputBadge.innerHTML = '<i data-lucide="check-circle" style="width:12px;"></i> VERIFIED & AUTHENTIC';
    if (confidenceScore) confidenceScore.innerText = '99.1%';
    if (urgencyLevel) urgencyLevel.innerText = type === 'Medical Emergency' || type === 'Flood' ? 'CRITICAL' : 'HIGH';
    if (verdictSummary) verdictSummary.innerText = `Gemini AI evaluated report "${type}" at ${loc}. Cross-referenced with local telemetry & sensor feed. Authentic report confirmed.`;

    // Add to incidents array
    const newInc = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      type,
      location: loc,
      coords: [37.7749 + (Math.random() - 0.5) * 0.05, -122.4194 + (Math.random() - 0.5) * 0.05],
      severity: 'CRITICAL',
      confidence: '99.1%',
      desc,
      verified: true,
      time: 'Just now'
    };

    state.incidents.unshift(newInc);
    renderIncidentFeed();
    showNotification('Report Successfully Verified & Added to Live Map!', 'success');
  }, 1200);
}

function autoDetectGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const input = document.getElementById('report-location');
      if (input) input.value = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      showNotification('GPS Coordinates auto-detected!', 'success');
    }, () => {
      showNotification('Using default fallback GPS coordinates.', 'info');
    });
  }
}

function autoDispatchAIRecommendation() {
  showNotification('Auto-Dispatch Executed! Rescue Boat Team Bravo dispatched to target coordinates.', 'success');
}

function dispatchResource(id) {
  showNotification(`Navigation route calculated & resource ${id} dispatched!`, 'success');
}

// ==========================================
// 7. VOLUNTEER & AID REQUEST HANDLERS
// ==========================================

function handleVolunteerRegister(e) {
  e.preventDefault();
  const name = document.getElementById('vol-name').value;
  const skill = document.getElementById('vol-skill').value;
  const lang = document.getElementById('vol-languages').value;
  const vehicle = document.getElementById('vol-vehicle').value;

  const newVol = {
    id: `VOL-0${state.volunteers.length + 1}`,
    name,
    skill,
    lang,
    vehicle,
    rating: 5.0,
    status: 'Available',
    coords: [37.7749, -122.4194]
  };

  state.volunteers.unshift(newVol);
  renderVolunteerRoster();
  showNotification(`Welcome ${name}! You are now registered as an Active Responder.`, 'success');
  document.getElementById('volunteer-reg-form').reset();
}

function handleAidRequestSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('aid-type').value;
  const count = document.getElementById('aid-count').value;
  const priority = document.getElementById('aid-priority').value;
  const address = document.getElementById('aid-address').value;
  const phone = document.getElementById('aid-phone').value;

  const newReq = {
    id: `REQ-${Math.floor(500 + Math.random() * 400)}`,
    type,
    name: 'Victim Citizen',
    count,
    priority,
    address,
    phone,
    status: 'Verified & Queued',
    time: 'Just now'
  };

  state.helpRequests.unshift(newReq);
  renderHelpRequests();
  showNotification('Emergency Aid Request Broadcasted to Response Network!', 'danger');
  document.getElementById('aid-request-form').reset();
}

// ==========================================
// 8. SOS SIREN & SOUND SYNTHESIZER
// ==========================================

function triggerSOSModal() {
  const modal = document.getElementById('sos-modal');
  if (modal) modal.classList.add('active');
  playSirenSound();
}

function closeSOSModal() {
  const modal = document.getElementById('sos-modal');
  if (modal) modal.classList.remove('active');
  stopSirenSound();
}

function playSirenSound() {
  if (state.isSirenMuted) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!state.sirenAudioCtx) {
      state.sirenAudioCtx = new AudioContext();
    }

    if (state.sirenOscillator) {
      state.sirenOscillator.stop();
    }

    const osc = state.sirenAudioCtx.createOscillator();
    const gain = state.sirenAudioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, state.sirenAudioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, state.sirenAudioCtx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.3, state.sirenAudioCtx.currentTime);

    osc.connect(gain);
    gain.connect(state.sirenAudioCtx.destination);
    osc.start();

    state.sirenOscillator = osc;
  } catch (err) {
    console.log('Audio Context playback notice:', err);
  }
}

function stopSirenSound() {
  if (state.sirenOscillator) {
    try {
      state.sirenOscillator.stop();
      state.sirenOscillator = null;
    } catch (e) {}
  }
}

function toggleSirenSound() {
  state.isSirenMuted = !state.isSirenMuted;
  const btn = document.getElementById('siren-sound-btn');
  if (state.isSirenMuted) {
    stopSirenSound();
    if (btn) btn.innerHTML = '<i data-lucide="volume-x"></i> Unmute Alarm Siren';
  } else {
    playSirenSound();
    if (btn) btn.innerHTML = '<i data-lucide="volume-2"></i> Mute Alarm Siren';
  }
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 9. GEMINI AI DISASTER CHATBOT & VOICE SYNTH
// ==========================================

function toggleChatbot() {
  const drawer = document.getElementById('chatbot-drawer');
  if (drawer) drawer.classList.toggle('active');
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') submitChatMessage();
}

function sendQuickChat(msg) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = msg;
    submitChatMessage();
  }
}

function submitChatMessage() {
  const input = document.getElementById('chat-input');
  const container = document.getElementById('chat-messages-container');
  if (!input || !input.value.trim() || !container) return;

  const userMsg = input.value.trim();
  input.value = '';

  // Append User Message Bubble
  const userBubble = document.createElement('div');
  userBubble.style.cssText = `
    align-self: flex-end; background: var(--color-primary); color: white;
    padding: 10px 14px; border-radius: 12px; max-width: 85%; font-size: 0.85rem;
  `;
  userBubble.innerText = userMsg;
  container.appendChild(userBubble);

  // Generate Gemini AI Response
  setTimeout(() => {
    let responseText = "I have recorded your request. The nearest emergency shelter is located at Civic Evacuation Center (0.8 km away). Emergency Helpline: 911 / 112.";
    
    if (userMsg.toLowerCase().includes('shelter')) {
      responseText = "The nearest verified safe shelter is Civic Evacuation High School Shelter at 37.7680, -122.4150. Capacity: 450 cots available with food and medical supplies.";
    } else if (userMsg.toLowerCase().includes('first aid') || userMsg.toLowerCase().includes('burn')) {
      responseText = "First Aid Protocol for Burns: 1. Cool the burn immediately with cool running water for 10-15 mins. 2. Remove tight items. 3. Cover loosely with a sterile bandage. Do NOT apply ice directly.";
    } else if (userMsg.toLowerCase().includes('helpline') || userMsg.toLowerCase().includes('contact')) {
      responseText = "National Disaster Helpline: 1-800-DISASTER (1-800-347-2783). Local Command Desk: +1 (555) 019-9000. Ambulance: 911.";
    }

    const aiBubble = document.createElement('div');
    aiBubble.style.cssText = `
      align-self: flex-start; background: var(--bg-card); border: 1px solid var(--border-color);
      padding: 10px 14px; border-radius: 12px; max-width: 85%; font-size: 0.85rem;
    `;
    aiBubble.innerText = responseText;
    container.appendChild(aiBubble);
    container.scrollTop = container.scrollHeight;

    // Optional Speech Synthesis
    speakText(responseText);
  }, 600);
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

function toggleVoiceSpeechInput() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    showNotification('Voice speech recognition API not supported in browser.', 'info');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';

  showNotification('Listening... Speak your emergency question now.', 'info');
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = transcript;
      submitChatMessage();
    }
  };
}

// ==========================================
// 10. SUBDASHBOARD TABS & CHART.JS
// ==========================================

function switchDashboardTab(subId) {
  const panels = document.querySelectorAll('.subdash-panel');
  panels.forEach(p => p.style.display = 'none');

  const selected = document.getElementById(`subdash-${subId}`);
  if (selected) selected.style.display = 'block';

  const btns = document.querySelectorAll('#dashboard-tab-buttons button');
  btns.forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

function broadcastGovtAlert() {
  const msg = document.getElementById('govt-alert-msg').value;
  showNotification(`BROADCAST SENT: "${msg}"`, 'danger');
  const ticker = document.getElementById('live-ticker-text');
  if (ticker) ticker.innerText = `GOVT ALERT: ${msg}`;
}

function initCharts() {
  // Chart 1: Disaster Types Breakdown (Doughnut)
  const ctx1 = document.getElementById('chart-disaster-types');
  if (ctx1) {
    new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Floods', 'Wildfires', 'Earthquakes', 'Building Collapses', 'Storms'],
        datasets: [{
          data: [40, 25, 15, 12, 8],
          backgroundColor: ['#2563EB', '#DC2626', '#EA580C', '#9333EA', '#0284C7'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#9CA3AF', font: { family: 'Inter' } } }
        }
      }
    });
  }

  // Chart 2: 24-Hour Rescue Response Rate (Line Chart)
  const ctx2 = document.getElementById('chart-response-rate');
  if (ctx2) {
    new Chart(ctx2, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [{
          label: 'People Rescued',
          data: [1200, 3400, 6800, 9500, 12400, 14890],
          borderColor: '#16A34A',
          backgroundColor: 'rgba(22, 163, 74, 0.15)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#9CA3AF', font: { family: 'Inter' } } }
        },
        scales: {
          x: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }
}

// ==========================================
// 11. DATA EXPORT UTILITY (JSON & CSV)
// ==========================================

function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "disaster_system_data.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showNotification('Disaster system dataset exported to JSON file.', 'success');
}

function exportDataCSV() {
  let csvContent = "data:text/csv;charset=utf-8,ID,Type,Location,Severity,Confidence,Status\n";
  state.incidents.forEach(inc => {
    csvContent += `${inc.id},${inc.type},"${inc.location}",${inc.severity},${inc.confidence},Verified\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "disaster_incidents.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  showNotification('Incident log exported to CSV file.', 'success');
}

// ==========================================
// 12. ANIMATED BACKGROUND PARTICLES
// ==========================================

function initParticleBackground() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.2
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
