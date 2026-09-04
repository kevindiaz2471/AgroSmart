/* ==========================================================================
   AgroSmart IoT - Core Application, Authentication & Control Engine
   ========================================================================== */

// Mock Database & Session State
const appState = {
    // Current Authenticated User Session
    currentUser: null,

    currentPlaceId: "place-1",
    currentZoneId: "zone-1",

    users: [
        {
            id: "usr-1",
            email: "admin@agrosmart.io",
            password: "admin123",
            name: "Ing. Kevin Díaz",
            role: "Administrador Agrícola"
        },
        {
            id: "usr-2",
            email: "operador@upec.edu.ec",
            password: "user123",
            name: "Carlos Mendoza",
            role: "Operador de Riego"
        }
    ],

    places: [
        {
            id: "place-1",
            userId: "usr-1",
            name: "Finca El Paraíso - Invernaderos",
            location: "Sector La Cocha, Parcela 12",
            coords: "4.6097, -74.0817",
            description: "Invernaderos de cultivo de hortalizas con riego por goteo."
        },
        {
            id: "place-2",
            userId: "usr-1",
            name: "Huerto Experimental Sur",
            location: "Valle Central, Campo B",
            coords: "3.4516, -76.5320",
            description: "Zona de prueba de cultivos de maíz y frutales."
        }
    ],

    zones: [
        {
            id: "zone-1",
            placeId: "place-1",
            name: "Zona 1 - Tomates Cherry",
            cropType: "Tomate Cherry",
            mode: "AUTO", // AUTO, MANUAL, SCHEDULED
            minMoisture: 30,
            maxMoisture: 70,
            maxDurationMin: 15,
            intervalSec: 15,
            currentMoisture: 42,
            pumpState: false, // true = ON, false = OFF
            tankOk: true,
            sensorOk: true,
            pumpStartTime: null,
            schedules: [
                { id: "sch-1", days: "LUN, MIÉ, VIE", time: "06:00", duration: 10, active: true },
                { id: "sch-2", days: "MAR, JUE", time: "18:00", duration: 15, active: false }
            ]
        },
        {
            id: "zone-2",
            placeId: "place-1",
            name: "Zona 2 - Pimientos",
            cropType: "Pimiento Morrón",
            mode: "AUTO",
            minMoisture: 35,
            maxMoisture: 75,
            maxDurationMin: 20,
            intervalSec: 30,
            currentMoisture: 58,
            pumpState: false,
            tankOk: true,
            sensorOk: true,
            pumpStartTime: null,
            schedules: []
        },
        {
            id: "zone-3",
            placeId: "place-2",
            name: "Zona 1 - Maíz Dulce",
            cropType: "Maíz",
            mode: "SCHEDULED",
            minMoisture: 25,
            maxMoisture: 65,
            maxDurationMin: 30,
            intervalSec: 60,
            currentMoisture: 22,
            pumpState: false,
            tankOk: true,
            sensorOk: true,
            pumpStartTime: null,
            schedules: [
                { id: "sch-3", days: "DIARIO", time: "07:00", duration: 20, active: true }
            ]
        }
    ],

    history: [
        {
            id: "h-1",
            zoneId: "zone-1",
            startTime: "2026-09-03 14:30:00",
            endTime: "2026-09-03 14:38:15",
            durationSec: 495,
            initialMoisture: 28,
            finalMoisture: 72,
            triggerType: "AUTO",
            status: "COMPLETADO"
        },
        {
            id: "h-2",
            zoneId: "zone-1",
            startTime: "2026-09-02 06:00:00",
            endTime: "2026-09-02 06:10:00",
            durationSec: 600,
            initialMoisture: 40,
            finalMoisture: 68,
            triggerType: "SCHEDULED",
            status: "COMPLETADO"
        }
    ],

    alerts: [],
    autoDrySimulation: false
};

// DOM Elements Selection
const el = {
    // Auth elements
    authOverlay: document.getElementById('authOverlay'),
    mainAppContainer: document.getElementById('mainAppContainer'),
    btnTabLogin: document.getElementById('btnTabLogin'),
    btnTabRegister: document.getElementById('btnTabRegister'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    toggleLoginPassword: document.getElementById('toggleLoginPassword'),
    btnQuickDemo: document.getElementById('btnQuickDemo'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    userRoleDisplay: document.getElementById('userRoleDisplay'),
    userAvatar: document.getElementById('userAvatar'),
    btnLogout: document.getElementById('btnLogout'),
    
    // Main UI
    locationSelect: document.getElementById('locationSelect'),
    btnNewPlace: document.getElementById('btnNewPlace'),
    btnEditPlace: document.getElementById('btnEditPlace'),
    placeDescription: document.getElementById('placeDescription'),
    placeCoords: document.getElementById('placeCoords'),
    
    zonesList: document.getElementById('zonesList'),
    btnNewZone: document.getElementById('btnNewZone'),
    
    currentZoneName: document.getElementById('currentZoneName'),
    currentZoneCrop: document.getElementById('currentZoneCrop'),
    
    modeButtons: document.querySelectorAll('.btn-mode'),
    
    moistureValue: document.getElementById('moistureValue'),
    moistureStatusLabel: document.getElementById('moistureStatusLabel'),
    gaugeFill: document.getElementById('gaugeFill'),
    dispMinThreshold: document.getElementById('dispMinThreshold'),
    dispMaxThreshold: document.getElementById('dispMaxThreshold'),
    
    simMoistureRange: document.getElementById('simMoistureRange'),
    btnToggleAutoDry: document.getElementById('btnToggleAutoDry'),
    simPlayIcon: document.getElementById('simPlayIcon'),
    
    pumpVisual: document.getElementById('pumpVisual'),
    pumpStateText: document.getElementById('pumpStateText'),
    pumpStateSub: document.getElementById('pumpStateSub'),
    btnPumpOn: document.getElementById('btnPumpOn'),
    btnPumpOff: document.getElementById('btnPumpOff'),
    
    dispMaxDuration: document.getElementById('dispMaxDuration'),
    dispTankLevel: document.getElementById('dispTankLevel'),
    btnToggleTank: document.getElementById('btnToggleTank'),
    
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    configForm: document.getElementById('configForm'),
    inputMinMoisture: document.getElementById('inputMinMoisture'),
    inputMaxMoisture: document.getElementById('inputMaxMoisture'),
    inputMaxDuration: document.getElementById('inputMaxDuration'),
    inputInterval: document.getElementById('inputInterval'),
    
    schedulesList: document.getElementById('schedulesList'),
    btnAddSchedule: document.getElementById('btnAddSchedule'),
    
    alertsList: document.getElementById('alertsList'),
    alertCount: document.getElementById('alertCount'),
    
    historyTableBody: document.getElementById('historyTableBody'),
    btnClearHistory: document.getElementById('btnClearHistory'),
    
    // Modals
    modalPlace: document.getElementById('modalPlace'),
    btnCloseModalPlace: document.getElementById('btnCloseModalPlace'),
    btnCancelPlace: document.getElementById('btnCancelPlace'),
    placeForm: document.getElementById('placeForm'),
    
    modalZone: document.getElementById('modalZone'),
    btnCloseModalZone: document.getElementById('btnCloseModalZone'),
    btnCancelZone: document.getElementById('btnCancelZone'),
    zoneForm: document.getElementById('zoneForm')
};

// Initialize Application
function initApp() {
    setupAuthListeners();
    checkSavedSession();
    setupEventListeners();
    startControlLoop();
}

// Check saved user session in localStorage
function checkSavedSession() {
    const savedUser = localStorage.getItem('agrosmart_session');
    if (savedUser) {
        try {
            appState.currentUser = JSON.parse(savedUser);
            showDashboard();
        } catch (e) {
            showLogin();
        }
    } else {
        showLogin();
    }
}

// Show Authentication Overlay
function showLogin() {
    el.authOverlay.classList.add('active');
}

// Show Main Dashboard when authenticated
function showDashboard() {
    if (!appState.currentUser) return;

    el.authOverlay.classList.remove('active');
    
    // Update Header User Widget
    el.userNameDisplay.textContent = appState.currentUser.name;
    el.userRoleDisplay.textContent = appState.currentUser.role;
    
    // Initials for avatar
    const initials = appState.currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    el.userAvatar.textContent = initials || "US";

    renderPlacesDropdown();
    renderZonesList();
    loadZoneData(appState.currentZoneId);
}

// Setup Authentication Event Listeners
function setupAuthListeners() {
    // Auth Tab Switcher
    el.btnTabLogin.addEventListener('click', () => {
        el.btnTabLogin.classList.add('active');
        el.btnTabRegister.classList.remove('active');
        el.loginForm.classList.add('active');
        el.registerForm.classList.remove('active');
    });

    el.btnTabRegister.addEventListener('click', () => {
        el.btnTabRegister.classList.add('active');
        el.btnTabLogin.classList.remove('active');
        el.registerForm.classList.add('active');
        el.loginForm.classList.remove('active');
    });

    // Password Visibility Toggle
    el.toggleLoginPassword.addEventListener('click', () => {
        const type = el.loginPassword.type === 'password' ? 'text' : 'password';
        el.loginPassword.type = type;
        el.toggleLoginPassword.innerHTML = type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    });

    // Quick Fill Demo Credentials
    el.btnQuickDemo.addEventListener('click', () => {
        el.loginEmail.value = "admin@agrosmart.io";
        el.loginPassword.value = "admin123";
    });

    // Login Form Submit
    el.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = el.loginEmail.value.trim();
        const pw = el.loginPassword.value;

        const user = appState.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pw);

        if (user) {
            appState.currentUser = user;
            if (document.getElementById('rememberMe').checked) {
                localStorage.setItem('agrosmart_session', JSON.stringify(user));
            }
            showDashboard();
        } else {
            alert("Credenciales incorrectas. Intenta con admin@agrosmart.io / admin123");
        }
    });

    // Register Form Submit
    el.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUser = {
            id: `usr-${Date.now()}`,
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            role: document.getElementById('regRole').value
        };

        appState.users.push(newUser);
        appState.currentUser = newUser;
        localStorage.setItem('agrosmart_session', JSON.stringify(newUser));
        showDashboard();
    });

    // Logout
    el.btnLogout.addEventListener('click', () => {
        appState.currentUser = null;
        localStorage.removeItem('agrosmart_session');
        showLogin();
    });
}

// Render Places Dropdown
function renderPlacesDropdown() {
    el.locationSelect.innerHTML = appState.places.map(p => 
        `<option value="${p.id}" ${p.id === appState.currentPlaceId ? 'selected' : ''}>${p.name}</option>`
    ).join('');

    const currentPlace = appState.places.find(p => p.id === appState.currentPlaceId);
    if (currentPlace) {
        el.placeDescription.textContent = currentPlace.description;
        el.placeCoords.textContent = currentPlace.coords;
    }
}

// Render Zones List for Selected Place
function renderZonesList() {
    const filteredZones = appState.zones.filter(z => z.placeId === appState.currentPlaceId);
    el.zonesList.innerHTML = filteredZones.map(z => `
        <div class="zone-item ${z.id === appState.currentZoneId ? 'active' : ''}" onclick="selectZone('${z.id}')">
            <div class="info">
                <h4>${z.name}</h4>
                <p><i class="fa-solid fa-seedling"></i> ${z.cropType} | <i class="fa-solid fa-droplet"></i> ${z.currentMoisture}%</p>
            </div>
            <div class="status-indicator" style="background-color: ${z.pumpState ? 'var(--secondary)' : 'var(--primary)'}"></div>
        </div>
    `).join('');
}

// Select Zone
function selectZone(zoneId) {
    appState.currentZoneId = zoneId;
    renderZonesList();
    loadZoneData(zoneId);
}

// Load Active Zone Data into UI
function loadZoneData(zoneId) {
    const zone = getCurrentZone();
    if (!zone) return;

    el.currentZoneName.textContent = zone.name;
    el.currentZoneCrop.innerHTML = `<i class="fa-solid fa-seedling"></i> ${zone.cropType}`;

    // Mode Buttons
    el.modeButtons.forEach(btn => {
        if (btn.dataset.mode === zone.mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Moisture & Gauge
    updateMoistureUI(zone.currentMoisture);
    el.simMoistureRange.value = zone.currentMoisture;
    el.dispMinThreshold.textContent = `${zone.minMoisture}%`;
    el.dispMaxThreshold.textContent = `${zone.maxMoisture}%`;

    // Pump UI
    updatePumpUI(zone.pumpState);
    el.dispMaxDuration.textContent = `${zone.maxDurationMin} min`;
    el.dispTankLevel.textContent = zone.tankOk ? "OK (Lleno)" : "CRÍTICO (Vacío)";
    el.dispTankLevel.style.color = zone.tankOk ? "var(--primary)" : "var(--danger)";

    // Config Form Values
    el.inputMinMoisture.value = zone.minMoisture;
    el.inputMaxMoisture.value = zone.maxMoisture;
    el.inputMaxDuration.value = zone.maxDurationMin;
    el.inputInterval.value = zone.intervalSec;

    // Render Lists
    renderSchedulesList(zone);
    renderAlertsList();
    renderHistoryTable();
}

// Get Current Active Zone
function getCurrentZone() {
    return appState.zones.find(z => z.id === appState.currentZoneId);
}

// Update Moisture Value and SVG Gauge Fill
function updateMoistureUI(moistureVal) {
    el.moistureValue.textContent = Math.round(moistureVal);
    
    // SVG dashoffset range: 0 (100%) to 188.4 (0%)
    const offset = 188.4 - (188.4 * (moistureVal / 100));
    el.gaugeFill.style.strokeDashoffset = offset;

    // Label evaluation
    const zone = getCurrentZone();
    if (!zone) return;

    if (moistureVal < zone.minMoisture) {
        el.moistureStatusLabel.textContent = "¡Demasiado Seco! (Riego Requerido)";
        el.moistureStatusLabel.style.color = "var(--warning)";
    } else if (moistureVal >= zone.maxMoisture) {
        el.moistureStatusLabel.textContent = "Suelo Humedecido (Óptimo)";
        el.moistureStatusLabel.style.color = "var(--primary)";
    } else {
        el.moistureStatusLabel.textContent = "Nivel Normal";
        el.moistureStatusLabel.style.color = "var(--text-muted)";
    }
}

// Update Pump Graphic & Text
function updatePumpUI(isRunning) {
    if (isRunning) {
        el.pumpVisual.classList.add('running');
        el.pumpStateText.textContent = "ENCENDIDA (REGANDO)";
        el.pumpStateText.style.color = "var(--secondary)";
        el.pumpStateSub.textContent = "Flujo de agua activo hacia la zona de cultivo";
    } else {
        el.pumpVisual.classList.remove('running');
        el.pumpStateText.textContent = "APAGADA";
        el.pumpStateText.style.color = "var(--text-muted)";
        el.pumpStateSub.textContent = "Bomba Inactiva - Esperando disparo de control";
    }
}

// Control Loop & Hysteresis Automation Engine
function startControlLoop() {
    setInterval(() => {
        appState.zones.forEach(zone => {
            // Auto Dry simulation logic if enabled
            if (appState.autoDrySimulation && !zone.pumpState && zone.currentMoisture > 5) {
                zone.currentMoisture -= 0.5;
            }

            // Auto Moistening logic when pump is ON
            if (zone.pumpState) {
                zone.currentMoisture += 2.0;
                if (zone.currentMoisture > 100) zone.currentMoisture = 100;
            }

            // CORE AUTOMATION HYSTERESIS RULE
            if (zone.mode === "AUTO") {
                // Rule 1: Activate if moisture < min
                if (zone.currentMoisture < zone.minMoisture && !zone.pumpState) {
                    if (zone.tankOk) {
                        triggerPump(zone, true, "AUTO");
                    } else {
                        addAlert(zone.id, "TANQUE_VACIO", "No se puede iniciar el riego automático: Depósito de agua vacío.");
                    }
                }
                
                // Rule 2: Deactivate if moisture >= max
                else if (zone.currentMoisture >= zone.maxMoisture && zone.pumpState) {
                    triggerPump(zone, false, "AUTO");
                }
            }

            // WATCHDOG TIMER SAFETY CUTOFF
            if (zone.pumpState && zone.pumpStartTime) {
                const elapsedMin = (Date.now() - zone.pumpStartTime) / (1000 * 60);
                if (elapsedMin >= zone.maxDurationMin) {
                    triggerPump(zone, false, "WATCHDOG");
                    addAlert(zone.id, "WATCHDOG_TIMEOUT", `Corte de seguridad: La bomba superó el tiempo máximo permitido de ${zone.maxDurationMin} min.`);
                }
            }

            // Update UI if this is the active zone
            if (zone.id === appState.currentZoneId) {
                updateMoistureUI(zone.currentMoisture);
                el.simMoistureRange.value = zone.currentMoisture;
                updatePumpUI(zone.pumpState);
            }
        });

        if (appState.currentUser) {
            renderZonesList();
        }
    }, 1000);
}

// Trigger Pump State Change
function triggerPump(zone, state, triggerType = "MANUAL") {
    if (zone.pumpState === state) return;

    if (state) {
        // Turning ON
        if (!zone.tankOk) {
            alert("Error: El depósito de agua está vacío. No se puede encender la bomba.");
            return;
        }
        zone.pumpState = true;
        zone.pumpStartTime = Date.now();
        zone.tempInitialMoisture = zone.currentMoisture;
        zone.tempStartTimestamp = new Date().toLocaleString();
    } else {
        // Turning OFF
        zone.pumpState = false;
        const endTime = new Date();
        const durationSec = zone.pumpStartTime ? Math.round((Date.now() - zone.pumpStartTime) / 1000) : 0;
        
        // Log to history
        appState.history.unshift({
            id: `h-${Date.now()}`,
            zoneId: zone.id,
            startTime: zone.tempStartTimestamp || new Date().toLocaleString(),
            endTime: endTime.toLocaleString(),
            durationSec: durationSec,
            initialMoisture: Math.round(zone.tempInitialMoisture || zone.currentMoisture),
            finalMoisture: Math.round(zone.currentMoisture),
            triggerType: triggerType,
            status: "COMPLETADO"
        });

        zone.pumpStartTime = null;
        renderHistoryTable();
    }

    if (zone.id === appState.currentZoneId) {
        updatePumpUI(zone.pumpState);
    }
}

// Add Alert Item
function addAlert(zoneId, type, message) {
    const zone = appState.zones.find(z => z.id === zoneId);
    const alertItem = {
        id: `alt-${Date.now()}`,
        zoneName: zone ? zone.name : "Sistema",
        type: type,
        message: message,
        time: new Date().toLocaleTimeString()
    };
    appState.alerts.unshift(alertItem);
    renderAlertsList();
}

// Render History Table
function renderHistoryTable() {
    const filteredHistory = appState.history.filter(h => h.zoneId === appState.currentZoneId);
    el.historyTableBody.innerHTML = filteredHistory.map(h => `
        <tr>
            <td>${h.startTime}</td>
            <td>${h.durationSec} s (${(h.durationSec / 60).toFixed(1)} min)</td>
            <td><span class="crop-badge">${h.triggerType}</span></td>
            <td>${h.initialMoisture}%</td>
            <td><strong>${h.finalMoisture}%</strong></td>
            <td><span class="status-dot" style="background: var(--primary);"></span> ${h.status}</td>
        </tr>
    `).join('');
}

// Render Alerts List
function renderAlertsList() {
    el.alertCount.textContent = appState.alerts.length;
    if (appState.alerts.length === 0) {
        el.alertsList.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">No hay alertas activas en el sistema.</p>`;
        return;
    }
    el.alertsList.innerHTML = appState.alerts.map(a => `
        <div class="alert-item" style="padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid var(--danger); margin-bottom: 8px; border-radius: 4px;">
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color: var(--danger);">
                <span>[${a.type}] ${a.zoneName}</span>
                <span>${a.time}</span>
            </div>
            <p style="font-size:13px; margin-top: 4px;">${a.message}</p>
        </div>
    `).join('');
}

// Render Schedules List
function renderSchedulesList(zone) {
    if (!zone.schedules || zone.schedules.length === 0) {
        el.schedulesList.innerHTML = `<p style="color: var(--text-muted); font-size: 13px; margin-top: 10px;">No se han configurado horarios programados para esta zona.</p>`;
        return;
    }
    el.schedulesList.innerHTML = zone.schedules.map(s => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px; margin-top:8px;">
            <div>
                <strong>${s.time} hs</strong> (${s.duration} min)
                <div style="font-size:12px; color: var(--text-muted);">${s.days}</div>
            </div>
            <div>
                <span class="crop-badge" style="background: ${s.active ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}">${s.active ? 'ACTIVO' : 'INACTIVO'}</span>
            </div>
        </div>
    `).join('');
}

// Setup Dashboard Event Listeners
function setupEventListeners() {
    // Location picker change
    el.locationSelect.addEventListener('change', (e) => {
        appState.currentPlaceId = e.target.value;
        const firstZone = appState.zones.find(z => z.placeId === appState.currentPlaceId);
        if (firstZone) {
            appState.currentZoneId = firstZone.id;
        }
        renderPlacesDropdown();
        renderZonesList();
        loadZoneData(appState.currentZoneId);
    });

    // Mode Buttons
    el.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const zone = getCurrentZone();
            if (zone) {
                zone.mode = btn.dataset.mode;
                loadZoneData(zone.id);
            }
        });
    });

    // Simulation Moisture Slider Manual Input
    el.simMoistureRange.addEventListener('input', (e) => {
        const zone = getCurrentZone();
        if (zone) {
            zone.currentMoisture = parseFloat(e.target.value);
            updateMoistureUI(zone.currentMoisture);
        }
    });

    // Auto Dry Simulation Toggle Button
    el.btnToggleAutoDry.addEventListener('click', () => {
        appState.autoDrySimulation = !appState.autoDrySimulation;
        if (appState.autoDrySimulation) {
            el.btnToggleAutoDry.classList.add('btn-primary');
            el.simPlayIcon.className = "fa-solid fa-pause";
        } else {
            el.btnToggleAutoDry.classList.remove('btn-primary');
            el.simPlayIcon.className = "fa-solid fa-play";
        }
    });

    // Manual Pump Buttons
    el.btnPumpOn.addEventListener('click', () => {
        const zone = getCurrentZone();
        if (zone) triggerPump(zone, true, "MANUAL");
    });

    el.btnPumpOff.addEventListener('click', () => {
        const zone = getCurrentZone();
        if (zone) triggerPump(zone, false, "MANUAL");
    });

    // Water Tank Toggle
    el.btnToggleTank.addEventListener('click', () => {
        const zone = getCurrentZone();
        if (zone) {
            zone.tankOk = !zone.tankOk;
            el.dispTankLevel.textContent = zone.tankOk ? "OK (Lleno)" : "CRÍTICO (Vacío)";
            el.dispTankLevel.style.color = zone.tankOk ? "var(--primary)" : "var(--danger)";
            if (!zone.tankOk && zone.pumpState) {
                triggerPump(zone, false, "SAFETY");
                addAlert(zone.id, "TANQUE_VACIO", "Bomba detención de emergencia: Depósito sin agua.");
            }
        }
    });

    // Config Form Submit
    el.configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const zone = getCurrentZone();
        if (zone) {
            zone.minMoisture = parseFloat(el.inputMinMoisture.value);
            zone.maxMoisture = parseFloat(el.inputMaxMoisture.value);
            zone.maxDurationMin = parseInt(el.inputMaxDuration.value);
            zone.intervalSec = parseInt(el.inputInterval.value);
            alert("¡Parámetros de riego guardados correctamente!");
            loadZoneData(zone.id);
        }
    });

    // Tabs Switcher
    el.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            el.tabBtns.forEach(b => b.classList.remove('active'));
            el.tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Modals Handlers
    el.btnNewPlace.addEventListener('click', () => el.modalPlace.classList.add('active'));
    el.btnCloseModalPlace.addEventListener('click', () => el.modalPlace.classList.remove('active'));
    el.btnCancelPlace.addEventListener('click', () => el.modalPlace.classList.remove('active'));

    el.placeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPlace = {
            id: `place-${Date.now()}`,
            userId: appState.currentUser ? appState.currentUser.id : "usr-1",
            name: document.getElementById('placeName').value,
            location: document.getElementById('placeLocation').value,
            coords: "4.6000, -74.0000",
            description: document.getElementById('placeDesc').value
        };
        appState.places.push(newPlace);
        appState.currentPlaceId = newPlace.id;
        renderPlacesDropdown();
        el.modalPlace.classList.remove('active');
        el.placeForm.reset();
    });

    el.btnNewZone.addEventListener('click', () => el.modalZone.classList.add('active'));
    el.btnCloseModalZone.addEventListener('click', () => el.modalZone.classList.remove('active'));
    el.btnCancelZone.addEventListener('click', () => el.modalZone.classList.remove('active'));

    el.zoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newZone = {
            id: `zone-${Date.now()}`,
            placeId: appState.currentPlaceId,
            name: document.getElementById('zoneName').value,
            cropType: document.getElementById('zoneCrop').value,
            mode: "AUTO",
            minMoisture: parseFloat(document.getElementById('zoneMin').value),
            maxMoisture: parseFloat(document.getElementById('zoneMax').value),
            maxDurationMin: 15,
            intervalSec: 15,
            currentMoisture: 45,
            pumpState: false,
            tankOk: true,
            sensorOk: true,
            pumpStartTime: null,
            schedules: []
        };
        appState.zones.push(newZone);
        appState.currentZoneId = newZone.id;
        renderZonesList();
        loadZoneData(newZone.id);
        el.modalZone.classList.remove('active');
        el.zoneForm.reset();
    });

    // Clear History Button
    el.btnClearHistory.addEventListener('click', () => {
        appState.history = appState.history.filter(h => h.zoneId !== appState.currentZoneId);
        renderHistoryTable();
    });
}

// Launch application on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
