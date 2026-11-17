import axios from 'axios';

// Base Axios instance pointing to the Spring Boot REST Backend
const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || '/api',
  timeout: 2500,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Track whether Spring Boot backend is currently reachable to avoid 2s+ TCP timeouts in local simulation mode
let isBackendReachable = false;

// Axios Live Request/Response Activity Log
const axiosActivityLogs = [];

const recordAxiosLog = (entry) => {
  axiosActivityLogs.unshift({
    id: 'req-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
    timestamp: new Date().toTimeString().slice(0, 8),
    ...entry
  });
  while (axiosActivityLogs.length > 20) {
    axiosActivityLogs.pop();
  }
};

export const getAxiosLogs = () => [...axiosActivityLogs];

// Request interceptor: attach bearer token & start timer
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    const session = localStorage.getItem('agrosmart_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('Error reading session token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: log HTTP status & latency
api.interceptors.response.use(
  (response) => {
    const durationMs = response.config?.metadata?.startTime
      ? Date.now() - response.config.metadata.startTime
      : 0;
    recordAxiosLog({
      method: (response.config?.method || 'GET').toUpperCase(),
      url: response.config?.url || '/api',
      status: response.status,
      mode: 'REST API',
      durationMs
    });
    return response;
  },
  (error) => {
    const durationMs = error.config?.metadata?.startTime
      ? Date.now() - error.config.metadata.startTime
      : 0;
    recordAxiosLog({
      method: (error.config?.method || 'GET').toUpperCase(),
      url: error.config?.url || '/api',
      status: error.response?.status || 'LOCAL',
      mode: 'Fallback Local',
      durationMs
    });
    return Promise.reject(error);
  }
);

const STORAGE_KEY = 'agrosmart_local_store_v2';

const formatNow = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatTimeOnly = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const buildSeedSeries = (values) => {
  const now = Date.now();
  return values.map((val, idx) => {
    const t = new Date(now - (values.length - 1 - idx) * 5 * 60000);
    return {
      time: formatTimeOnly(t),
      moisture: val,
      pumpState: idx >= 6 && idx <= 9,
    };
  });
};

const createInitialStore = () => {
  const now = new Date();
  const nowStr = formatNow(now);
  const hoursAgo = (h, addMin = 0) => formatNow(new Date(now.getTime() - h * 3600000 + addMin * 60000));
  const daysAgo = (d, hour = 6, min = 0) => {
    const dt = new Date(now.getTime() - d * 86400000);
    dt.setHours(hour, min, 0, 0);
    return formatNow(dt);
  };

  return {
    users: [
      { id: 'usr-1', email: 'admin@agrosmart.io', password: 'admin123', name: 'Ing. Kevin Díaz', role: 'Administrador Agrícola' },
      { id: 'usr-2', email: 'operador@upec.edu.ec', password: 'user123', name: 'Carlos Mendoza', role: 'Operador de Riego' },
    ],
    places: [
      {
        id: 'place-1',
        userId: 'usr-1',
        name: 'Finca El Paraíso - Invernaderos',
        location: 'Sector La Cocha, Parcela 12',
        coords: '0.8123, -77.7145',
        description: 'Invernaderos de cultivo de hortalizas con riego por goteo automatizado (Simulado).'
      },
      {
        id: 'place-2',
        userId: 'usr-1',
        name: 'Huerto Experimental UPEC Sur',
        location: 'Campus Universitario, Parcela B',
        coords: '0.8245, -77.7210',
        description: 'Zona experimental de cultivos de maíz y frutales de clima frío.'
      },
    ],
    zones: [
      {
        id: 'zone-1',
        placeId: 'place-1',
        name: 'Zona 1 - Tomates Cherry',
        cropType: 'Tomate Cherry',
        mode: 'AUTO',
        minMoisture: 30,
        maxMoisture: 70,
        maxDurationMin: 15,
        intervalSec: 15,
        cooldownSec: 30,
        flowRateLpm: 12.0,
        currentMoisture: 44,
        pumpState: false,
        tankOk: true,
        sensorOk: true,
        pumpStartTime: null,
        pumpStartTimeFormatted: null,
        pumpStartMoisture: null,
        activeTriggerType: null,
        plannedDurationMin: null,
        lastPumpStopTime: null,
        lastTelemetryTime: nowStr,
        moistureHistory: buildSeedSeries([52, 49, 46, 42, 38, 34, 29, 45, 62, 71, 66, 58, 51, 47, 44]),
        schedules: [
          { id: 'sch-1', days: 'LUN, MIÉ, VIE', time: '06:00', duration: 10, active: true, lastTriggeredKey: null },
          { id: 'sch-2', days: 'MAR, JUE', time: '18:00', duration: 15, active: true, lastTriggeredKey: null }
        ]
      },
      {
        id: 'zone-2',
        placeId: 'place-1',
        name: 'Zona 2 - Pimientos Morrón',
        cropType: 'Pimiento Morrón',
        mode: 'AUTO',
        minMoisture: 35,
        maxMoisture: 75,
        maxDurationMin: 20,
        intervalSec: 30,
        cooldownSec: 45,
        flowRateLpm: 15.0,
        currentMoisture: 58,
        pumpState: false,
        tankOk: true,
        sensorOk: true,
        pumpStartTime: null,
        pumpStartTimeFormatted: null,
        pumpStartMoisture: null,
        activeTriggerType: null,
        plannedDurationMin: null,
        lastPumpStopTime: null,
        lastTelemetryTime: nowStr,
        moistureHistory: buildSeedSeries([64, 62, 60, 57, 54, 50, 46, 41, 37, 34, 52, 68, 76, 65, 58]),
        schedules: [
          { id: 'sch-4', days: 'LUN, JUE', time: '07:30', duration: 12, active: true, lastTriggeredKey: null }
        ]
      },
      {
        id: 'zone-3',
        placeId: 'place-2',
        name: 'Zona 1 - Maíz Forrajero',
        cropType: 'Maíz Forrajero',
        mode: 'SCHEDULED',
        minMoisture: 25,
        maxMoisture: 65,
        maxDurationMin: 30,
        intervalSec: 60,
        cooldownSec: 60,
        flowRateLpm: 18.0,
        currentMoisture: 36,
        pumpState: false,
        tankOk: true,
        sensorOk: true,
        pumpStartTime: null,
        pumpStartTimeFormatted: null,
        pumpStartMoisture: null,
        activeTriggerType: null,
        plannedDurationMin: null,
        lastPumpStopTime: null,
        lastTelemetryTime: nowStr,
        moistureHistory: buildSeedSeries([48, 45, 42, 39, 35, 31, 28, 44, 59, 64, 56, 49, 43, 39, 36]),
        schedules: [
          { id: 'sch-3', days: 'DIARIO', time: '07:00', duration: 20, active: true, lastTriggeredKey: null }
        ]
      }
    ],
    history: [
      {
        id: 'h-1',
        zoneId: 'zone-1',
        zoneName: 'Zona 1 - Tomates Cherry',
        startTime: hoursAgo(3, 0),
        endTime: hoursAgo(3, 8),
        durationSec: 480,
        initialMoisture: 28,
        finalMoisture: 71,
        triggerType: 'AUTO',
        status: 'COMPLETADO',
        waterUsedLiters: 96.0
      },
      {
        id: 'h-2',
        zoneId: 'zone-2',
        zoneName: 'Zona 2 - Pimientos Morrón',
        startTime: hoursAgo(6, 0),
        endTime: hoursAgo(6, 10),
        durationSec: 600,
        initialMoisture: 33,
        finalMoisture: 75,
        triggerType: 'AUTO',
        status: 'COMPLETADO',
        waterUsedLiters: 150.0
      },
      {
        id: 'h-3',
        zoneId: 'zone-1',
        zoneName: 'Zona 1 - Tomates Cherry',
        startTime: daysAgo(1, 6, 0),
        endTime: daysAgo(1, 6, 10),
        durationSec: 600,
        initialMoisture: 38,
        finalMoisture: 69,
        triggerType: 'SCHEDULED',
        status: 'COMPLETADO',
        waterUsedLiters: 120.0
      },
      {
        id: 'h-4',
        zoneId: 'zone-3',
        zoneName: 'Zona 1 - Maíz Forrajero',
        startTime: daysAgo(2, 7, 0),
        endTime: daysAgo(2, 7, 15),
        durationSec: 900,
        initialMoisture: 24,
        finalMoisture: 65,
        triggerType: 'SCHEDULED',
        status: 'COMPLETADO',
        waterUsedLiters: 270.0
      },
      {
        id: 'h-5',
        zoneId: 'zone-2',
        zoneName: 'Zona 2 - Pimientos Morrón',
        startTime: daysAgo(4, 16, 20),
        endTime: daysAgo(4, 16, 26),
        durationSec: 360,
        initialMoisture: 41,
        finalMoisture: 72,
        triggerType: 'MANUAL',
        status: 'COMPLETADO',
        waterUsedLiters: 90.0
      },
      {
        id: 'h-6',
        zoneId: 'zone-1',
        zoneName: 'Zona 1 - Tomates Cherry',
        startTime: daysAgo(12, 14, 10),
        endTime: daysAgo(12, 14, 19),
        durationSec: 540,
        initialMoisture: 29,
        finalMoisture: 70,
        triggerType: 'AUTO',
        status: 'COMPLETADO',
        waterUsedLiters: 108.0
      }
    ],
    alerts: [
      {
        id: 'alt-1',
        zoneId: 'zone-1',
        zoneName: 'Zona 1 - Tomates Cherry',
        type: 'INFO',
        priority: 'BAJA',
        code: 'SYSTEM_START',
        message: 'Motor de simulación y automatización AgroSmart IoT activo y sincronizado.',
        recommendation: 'Supervise las variables en tiempo real o utilice el Laboratorio de Simulación para evaluar escenarios.',
        timestamp: nowStr,
        resolved: true
      }
    ]
  };
};

const loadLocalStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.zones) && parsed.zones.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading local store:', e);
  }
  const initial = createInitialStore();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const mockDb = loadLocalStore();

const saveLocalStore = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDb));
  } catch (e) {
    console.error('Error saving local store:', e);
  }
};

// Local Alert Deduplication & Resolution Helper
const addOrUpdateLocalAlert = (zoneId, type, priority, code, message, recommendation) => {
  const zone = mockDb.zones.find((z) => z.id === zoneId);
  const zoneName = zone ? zone.name : 'Sistema General';
  const nowStr = formatNow();

  if (code) {
    const existing = mockDb.alerts.find(
      (a) => !a.resolved && a.zoneId === zoneId && a.code === code
    );
    if (existing) {
      existing.timestamp = nowStr;
      existing.message = message;
      existing.recommendation = recommendation;
      saveLocalStore();
      return existing;
    }
  }

  const alert = {
    id: 'alt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    zoneId,
    zoneName,
    type,
    priority,
    code: code || 'GENERAL',
    message,
    recommendation,
    timestamp: nowStr,
    resolved: false
  };
  mockDb.alerts.unshift(alert);
  saveLocalStore();
  return alert;
};

const resolveLocalAlertsByCode = (zoneId, code) => {
  let changed = false;
  mockDb.alerts.forEach((a) => {
    if (!a.resolved && a.zoneId === zoneId && a.code === code) {
      a.resolved = true;
      changed = true;
    }
  });
  if (changed) saveLocalStore();
};

const appendLocalMoisturePoint = (zone, moisture) => {
  if (!Array.isArray(zone.moistureHistory)) {
    zone.moistureHistory = [];
  }
  zone.moistureHistory.push({
    time: formatTimeOnly(),
    moisture: Number(moisture),
    pumpState: Boolean(zone.pumpState)
  });
  while (zone.moistureHistory.length > 30) {
    zone.moistureHistory.shift();
  }
};

const isLocalCooldownElapsed = (zone) => {
  const cdSec = Number(zone.cooldownSec) || 0;
  if (!zone.lastPumpStopTime || cdSec <= 0) return true;
  return Date.now() - Number(zone.lastPumpStopTime) >= cdSec * 1000;
};

/**
 * Atomic, synchronous local state transition for pump ON/OFF.
 * Never performs network requests, eliminating nested HTTP timeouts and race conditions.
 */
const applyLocalPumpTransition = (zone, targetState, reason = '', triggerType = null, plannedDurationMin = null) => {
  if (!zone) return false;
  const state = Boolean(targetState);

  // Safety checks when attempting to turn pump ON
  if (state) {
    if (!zone.tankOk) {
      addOrUpdateLocalAlert(
        zone.id,
        'CRITICAL',
        'ALTA',
        'TANK_EMPTY',
        `Encendido bloqueado en ${zone.name}: Nivel bajo en el tanque simulado.`,
        'Restablezca el nivel del tanque en el módulo de Simulación y Diagnóstico.'
      );
      throw new Error('Operación bloqueada: El tanque simulado tiene nivel bajo.');
    }
    if (!zone.sensorOk && zone.mode === 'AUTO' && (!triggerType || triggerType === 'AUTO')) {
      addOrUpdateLocalAlert(
        zone.id,
        'CRITICAL',
        'ALTA',
        'SENSOR_OFFLINE',
        `Riego automático bloqueado en ${zone.name}: Sensor simulado desconectado.`,
        'Reconecte el sensor en el módulo de Simulación o cambie a Modo Manual.'
      );
      throw new Error('Riego automático bloqueado: Sensor desconectado.');
    }
  }

  // Prevent turning ON in AUTO mode if moisture is above minMoisture
  const currentM = Number(zone.currentMoisture);
  const minM = Number(zone.minMoisture);
  const maxM = Number(zone.maxMoisture);
  if (state && zone.mode === 'AUTO' && (!triggerType || triggerType === 'AUTO')) {
    if (currentM > minM) {
      zone.pumpState = false;
      return false;
    }
  }

  // Prevent turning ON in any mode if moisture is already at or above maxMoisture
  if (state && zone.mode === 'AUTO' && currentM >= maxM) {
    zone.pumpState = false;
    return false;
  }

  const previousState = Boolean(zone.pumpState);
  if (state === previousState) {
    return false;
  }

  zone.pumpState = state;
  const nowStr = formatNow();

  if (state) {
    zone.pumpStartTime = Date.now();
    zone.pumpStartTimeFormatted = nowStr;
    zone.pumpStartMoisture = currentM;
    zone.activeTriggerType = triggerType || zone.mode;
    zone.plannedDurationMin = plannedDurationMin;

    addOrUpdateLocalAlert(
      zone.id,
      'INFO',
      'BAJA',
      'PUMP_START_' + Date.now(),
      reason
        ? `Riego iniciado en ${zone.name} (${reason}). Humedad inicial: ${currentM}%.`
        : `Riego iniciado en ${zone.name} (Modo: ${zone.activeTriggerType}). Humedad inicial: ${currentM}%.`,
      'Monitoree el incremento de humedad hasta alcanzar el umbral máximo configurado.'
    );
  } else {
    const startMs = zone.pumpStartTime || Date.now() - 60000;
    const durationSec = Math.max(5, Math.round((Date.now() - startMs) / 1000));
    const startFormatted = zone.pumpStartTimeFormatted || formatNow(new Date(startMs));
    const initialM =
      zone.pumpStartMoisture !== null && zone.pumpStartMoisture !== undefined
        ? Number(zone.pumpStartMoisture)
        : currentM;
    const finalM = currentM;
    const triggerUsed = zone.activeTriggerType || zone.mode;
    const flowLpm = Number(zone.flowRateLpm) > 0 ? Number(zone.flowRateLpm) : 12.0;
    const waterUsedLiters = Math.round((durationSec / 60) * flowLpm * 10) / 10;

    zone.pumpStartTime = null;
    zone.pumpStartTimeFormatted = null;
    zone.pumpStartMoisture = null;
    zone.activeTriggerType = null;
    zone.plannedDurationMin = null;
    zone.lastPumpStopTime = Date.now();

    const statusLabel = reason ? `CORTE (${reason})` : 'COMPLETADO';

    mockDb.history.unshift({
      id: 'h-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      zoneId: zone.id,
      zoneName: zone.name,
      startTime: startFormatted,
      endTime: nowStr,
      durationSec,
      initialMoisture: initialM,
      finalMoisture: finalM,
      triggerType: triggerUsed,
      status: statusLabel,
      waterUsedLiters
    });

    const isAbnormal = Boolean(
      reason &&
        !reason.toLowerCase().includes('umbral') &&
        !reason.toLowerCase().includes('programado') &&
        !reason.toLowerCase().includes('manual')
    );

    addOrUpdateLocalAlert(
      zone.id,
      isAbnormal ? 'WARNING' : 'SUCCESS',
      isAbnormal ? 'MEDIA' : 'BAJA',
      isAbnormal ? 'PUMP_CUTOFF' : 'PUMP_DONE_' + Date.now(),
      reason
        ? `Riego finalizado en ${zone.name} (${reason}). Consumo simulado: ${waterUsedLiters} L.`
        : `Riego completado en ${zone.name} (${durationSec}s, ${initialM}% → ${finalM}%). Consumo simulado: ${waterUsedLiters} L.`,
      isAbnormal
        ? 'Revise las condiciones operativas de la zona y el estado de los sensores simulados.'
        : 'Ciclo registrado correctamente en el historial estadístico.'
    );
  }

  saveLocalStore();
  return true;
};

/**
 * Deterministic Hysteresis & Safety Evaluator for a Zone.
 * - Stop priority: if moisture >= maxMoisture in AUTO mode, immediately turns pump OFF.
 * - Start condition: if moisture <= minMoisture in AUTO mode, turns pump ON if safety & cooldown allow.
 * - Intermediate band (minMoisture < moisture < maxMoisture): preserves previous pump state.
 */
const evaluateLocalZoneAutomation = (zone) => {
  if (!zone) return;

  const moisture = Number(zone.currentMoisture);
  const minM = Number(zone.minMoisture);
  const maxM = Number(zone.maxMoisture);

  // 1. Safety overrides have highest priority
  if (!zone.tankOk && zone.pumpState) {
    applyLocalPumpTransition(zone, false, 'Seguridad: Nivel bajo del tanque', zone.mode);
    return;
  }

  if (!zone.sensorOk && zone.pumpState && zone.mode === 'AUTO') {
    applyLocalPumpTransition(zone, false, 'Seguridad: Sensor desconectado', 'AUTO');
    return;
  }

  // 2. Hysteresis control in AUTO mode
  if (zone.mode === 'AUTO') {
    // STOP CONDITION (Priority): moisture >= maxMoisture -> immediately turn OFF pump
    if (moisture >= maxM) {
      if (zone.pumpState) {
        applyLocalPumpTransition(
          zone,
          false,
          `Umbral máximo alcanzado (${moisture}% >= ${maxM}%)`,
          'AUTO'
        );
      }
      return;
    }

    // START CONDITION: moisture <= minMoisture -> turn ON pump if safe & cooldown elapsed
    if (moisture <= minM && !zone.pumpState) {
      if (zone.tankOk && zone.sensorOk && isLocalCooldownElapsed(zone)) {
        try {
          applyLocalPumpTransition(
            zone,
            true,
            `Histéresis: Humedad en o bajo umbral mínimo (${moisture}% <= ${minM}%)`,
            'AUTO'
          );
        } catch {
          // Blocked by safety condition
        }
      }
    }
    // INTERMEDIATE BAND (minM < moisture < maxM): preserve current zone.pumpState
  }
};

// Check if Spring Boot backend is reachable
export const checkBackendHealth = async () => {
  try {
    const res = await api.get('/auth/users', { timeout: 1500 });
    isBackendReachable = true;
    return { online: true, data: res.data };
  } catch (err) {
    isBackendReachable = false;
    return { online: false, error: err.message };
  }
};

// Calculate Next Scheduled Irrigation across zones
export const computeNextSchedule = (zones = []) => {
  const dayOrder = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const normalizeDay = (d) => d.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const normalizedOrder = dayOrder.map(normalizeDay);

  const now = new Date();
  const currentDayIdx = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let bestCandidate = null;

  zones.forEach((zone) => {
    (zone.schedules || []).forEach((sch) => {
      if (!sch.active || !sch.time) return;
      const [hh, mm] = sch.time.split(':').map(Number);
      if (Number.isNaN(hh) || Number.isNaN(mm)) return;
      const schedMinutes = hh * 60 + mm;
      const rawDays = normalizeDay(sch.days || '');
      const isDaily = rawDays.includes('DIARIO') || rawDays.includes('TODOS');

      for (let offset = 0; offset < 7; offset++) {
        const checkDayIdx = (currentDayIdx + offset) % 7;
        const dayCodeNorm = normalizedOrder[checkDayIdx];
        const dayCodeDisplay = dayOrder[checkDayIdx];

        const matchesDay = isDaily || rawDays.includes(dayCodeNorm);
        if (!matchesDay) continue;

        if (offset === 0 && schedMinutes <= currentMinutes) {
          continue;
        }

        const totalMinutesAway = offset * 1440 + (schedMinutes - currentMinutes);
        if (!bestCandidate || totalMinutesAway < bestCandidate.totalMinutesAway) {
          bestCandidate = {
            zoneId: zone.id,
            zoneName: zone.name,
            zoneMode: zone.mode,
            time: sch.time,
            duration: sch.duration,
            dayLabel: offset === 0 ? 'Hoy' : offset === 1 ? `Mañana (${dayCodeDisplay})` : dayCodeDisplay,
            totalMinutesAway
          };
        }
        break;
      }
    });
  });

  return bestCandidate;
};

// Authentication Services
export const authService = {
  login: async (email, password) => {
    if (isBackendReachable) {
      try {
        const res = await api.post('/auth/login', { email, password });
        return res.data;
      } catch (err) {
        if (err.response?.status === 401) {
          throw new Error(err.response?.data?.message || 'Credenciales inválidas');
        }
        isBackendReachable = false;
      }
    }
    const user = mockDb.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      recordAxiosLog({ method: 'POST', url: '/auth/login', status: 200, mode: 'Local Store', durationMs: 2 });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: 'offline-jwt-' + Date.now(),
        isOfflineMock: true
      };
    }
    throw new Error('Credenciales inválidas');
  },

  register: async (name, email, password, role) => {
    if (isBackendReachable) {
      try {
        const res = await api.post('/auth/register', { name, email, password, role });
        return res.data;
      } catch (err) {
        if (err.response?.status === 409) {
          throw new Error('El correo ya está registrado');
        }
        isBackendReachable = false;
      }
    }
    if (mockDb.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('El correo ya está registrado');
    }
    const newUser = { id: 'usr-' + Date.now(), name, email, password, role };
    mockDb.users.push(newUser);
    saveLocalStore();
    return { ...newUser, token: 'offline-jwt-' + Date.now(), isOfflineMock: true };
  }
};

// Places Services
export const placeService = {
  getAll: async () => {
    if (isBackendReachable) {
      try {
        const res = await api.get('/places');
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    return [...mockDb.places];
  },

  save: async (place) => {
    if (isBackendReachable) {
      try {
        const res = place.id
          ? await api.put(`/places/${place.id}`, place)
          : await api.post('/places', place);
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    const copy = { ...place };
    if (!copy.id) copy.id = 'place-' + Date.now();
    const idx = mockDb.places.findIndex((p) => p.id === copy.id);
    if (idx >= 0) mockDb.places[idx] = copy;
    else mockDb.places.push(copy);
    saveLocalStore();
    return copy;
  },

  delete: async (placeId) => {
    if (isBackendReachable) {
      try {
        await api.delete(`/places/${placeId}`);
        return true;
      } catch {
        isBackendReachable = false;
      }
    }
    if (mockDb.places.length <= 1) {
      throw new Error('No se puede eliminar la única finca activa.');
    }
    mockDb.places = mockDb.places.filter((p) => p.id !== placeId);
    mockDb.zones = mockDb.zones.filter((z) => z.placeId !== placeId);
    saveLocalStore();
    return true;
  }
};

// Zones Services
export const zoneService = {
  getAll: async (placeId) => {
    if (isBackendReachable) {
      try {
        const url = placeId ? `/zones?placeId=${placeId}` : '/zones';
        const res = await api.get(url);
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    mockDb.zones.forEach((z) => evaluateLocalZoneAutomation(z));
    if (placeId) return mockDb.zones.filter((z) => z.placeId === placeId).map((z) => ({ ...z }));
    return mockDb.zones.map((z) => ({ ...z }));
  },

  create: async (zone) => {
    if (isBackendReachable) {
      try {
        const res = await api.post('/zones', zone);
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    const nowStr = formatNow();
    const newZone = {
      cooldownSec: 30,
      flowRateLpm: 12.0,
      currentMoisture: 45,
      pumpState: false,
      tankOk: true,
      sensorOk: true,
      lastTelemetryTime: nowStr,
      schedules: [],
      moistureHistory: [{ time: formatTimeOnly(), moisture: zone.currentMoisture ?? 45, pumpState: false }],
      ...zone,
      id: zone.id || 'zone-' + Date.now(),
    };
    evaluateLocalZoneAutomation(newZone);
    mockDb.zones.push(newZone);
    saveLocalStore();
    return { ...newZone };
  },

  delete: async (zoneId) => {
    if (isBackendReachable) {
      try {
        await api.delete(`/zones/${zoneId}`);
        return true;
      } catch {
        isBackendReachable = false;
      }
    }
    mockDb.zones = mockDb.zones.filter((z) => z.id !== zoneId);
    saveLocalStore();
    return true;
  },

  setMode: async (zoneId, mode) => {
    if (isBackendReachable) {
      try {
        const res = await api.put(`/zones/${zoneId}/mode`, { mode });
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    const zone = mockDb.zones.find((z) => z.id === zoneId);
    if (zone) {
      zone.mode = mode;
      evaluateLocalZoneAutomation(zone);
      saveLocalStore();
      recordAxiosLog({ method: 'PUT', url: `/zones/${zoneId}/mode`, status: 200, mode: 'Local Store', durationMs: 1 });
    }
    return zone ? { ...zone } : null;
  },

  updateConfig: async (zoneId, config) => {
    if (isBackendReachable) {
      try {
        const res = await api.put(`/zones/${zoneId}/config`, config);
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    const zone = mockDb.zones.find((z) => z.id === zoneId);
    if (zone) {
      Object.assign(zone, {
        ...config,
        minMoisture: config.minMoisture !== undefined ? Number(config.minMoisture) : zone.minMoisture,
        maxMoisture: config.maxMoisture !== undefined ? Number(config.maxMoisture) : zone.maxMoisture,
        maxDurationMin: config.maxDurationMin !== undefined ? Number(config.maxDurationMin) : zone.maxDurationMin,
        cooldownSec: config.cooldownSec !== undefined ? Number(config.cooldownSec) : zone.cooldownSec,
        intervalSec: config.intervalSec !== undefined ? Number(config.intervalSec) : zone.intervalSec,
        flowRateLpm: config.flowRateLpm !== undefined ? Number(config.flowRateLpm) : zone.flowRateLpm,
      });
      evaluateLocalZoneAutomation(zone);
      saveLocalStore();
      recordAxiosLog({ method: 'PUT', url: `/zones/${zoneId}/config`, status: 200, mode: 'Local Store', durationMs: 2 });
    }
    return zone ? { ...zone } : null;
  },

  setPump: async (zoneId, state, reason = '', triggerType = null, plannedDurationMin = null) => {
    if (isBackendReachable) {
      try {
        const res = await api.post(`/zones/${zoneId}/pump`, {
          state,
          reason,
          triggerType,
          plannedDurationMin
        });
        return res.data;
      } catch (err) {
        if (err.response && err.response.status === 409) {
          throw new Error(err.response.data?.message || 'Operación bloqueada por seguridad');
        }
        isBackendReachable = false;
      }
    }
    const zone = mockDb.zones.find((z) => z.id === zoneId);
    if (!zone) return null;

    applyLocalPumpTransition(zone, state, reason, triggerType, plannedDurationMin);
    appendLocalMoisturePoint(zone, zone.currentMoisture);
    saveLocalStore();
    recordAxiosLog({ method: 'POST', url: `/zones/${zoneId}/pump`, status: 200, mode: 'Local Store', durationMs: 1 });
    return { ...zone };
  },

  sendTelemetry: async (zoneId, telemetry) => {
    if (isBackendReachable) {
      try {
        const res = await api.post(`/zones/${zoneId}/telemetry`, telemetry);
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    const zone = mockDb.zones.find((z) => z.id === zoneId);
    if (!zone) return null;

    if (telemetry.tankOk !== undefined) {
      zone.tankOk = Boolean(telemetry.tankOk);
      if (!zone.tankOk) {
        addOrUpdateLocalAlert(
          zoneId,
          'CRITICAL',
          'ALTA',
          'TANK_EMPTY',
          `Nivel crítico del tanque de agua simulado en ${zone.name}.`,
          'Restablezca el nivel del tanque en el módulo de Simulación y Diagnóstico para permitir el bombeo.'
        );
      } else {
        resolveLocalAlertsByCode(zoneId, 'TANK_EMPTY');
      }
    }

    if (telemetry.sensorOk !== undefined) {
      zone.sensorOk = Boolean(telemetry.sensorOk);
      if (!zone.sensorOk) {
        addOrUpdateLocalAlert(
          zoneId,
          'CRITICAL',
          'ALTA',
          'SENSOR_OFFLINE',
          `Pérdida de señal con el sensor simulado en ${zone.name}.`,
          'Reconecte el sensor simulado en el módulo de Diagnóstico o cambie temporalmente a Modo Manual.'
        );
      } else {
        resolveLocalAlertsByCode(zoneId, 'SENSOR_OFFLINE');
      }
    }

    if (telemetry.moisture !== undefined) {
      const clamped = Math.max(0, Math.min(100, Number(telemetry.moisture)));
      zone.currentMoisture = clamped;
      zone.lastTelemetryTime = formatNow();

      const minM = Number(zone.minMoisture);
      const maxM = Number(zone.maxMoisture);

      if (clamped <= minM) {
        addOrUpdateLocalAlert(
          zoneId,
          'WARNING',
          'MEDIA',
          'LOW_MOISTURE',
          `Humedad baja detectada en ${zone.name} (${clamped}% <= mínimo ${minM}%).`,
          zone.mode === 'AUTO'
            ? 'El sistema automático activará el riego tras validar tanque y tiempo de seguridad.'
            : `La zona está en modo ${zone.mode}. Considere activar el riego manualmente o cambiar a modo Automático.`
        );
        resolveLocalAlertsByCode(zoneId, 'HIGH_MOISTURE');
      } else if (clamped >= maxM) {
        resolveLocalAlertsByCode(zoneId, 'LOW_MOISTURE');
        if (clamped > maxM) {
          addOrUpdateLocalAlert(
            zoneId,
            'WARNING',
            'MEDIA',
            'HIGH_MOISTURE',
            `Humedad superior al umbral máximo en ${zone.name} (${clamped}% > máximo ${maxM}%).`,
            'El riego automático ha sido detenido para evitar saturación radicular.'
          );
        } else {
          resolveLocalAlertsByCode(zoneId, 'HIGH_MOISTURE');
        }
      } else {
        resolveLocalAlertsByCode(zoneId, 'LOW_MOISTURE');
        resolveLocalAlertsByCode(zoneId, 'HIGH_MOISTURE');
      }
    }

    // Evaluate Hysteresis & Safety Rules synchronously (0ms latency, zero nested HTTP timeouts)
    evaluateLocalZoneAutomation(zone);

    if (telemetry.moisture !== undefined) {
      appendLocalMoisturePoint(zone, zone.currentMoisture);
    }

    saveLocalStore();
    recordAxiosLog({ method: 'POST', url: `/zones/${zoneId}/telemetry`, status: 200, mode: 'Local Store', durationMs: 1 });
    return { ...zone };
  },

  addSchedule: async (zoneId, schedule) => {
    if (isBackendReachable) {
      try {
        const res = await api.post(`/zones/${zoneId}/schedules`, schedule);
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    const zone = mockDb.zones.find((z) => z.id === zoneId);
    const copy = { ...schedule, id: schedule.id || 'sch-' + Date.now(), lastTriggeredKey: null };
    if (zone) {
      zone.schedules.push(copy);
      saveLocalStore();
    }
    return copy;
  },

  updateSchedule: async (zoneId, scheduleId, updated) => {
    if (isBackendReachable) {
      try {
        const res = await api.put(`/zones/${zoneId}/schedules/${scheduleId}`, updated);
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    const zone = mockDb.zones.find((z) => z.id === zoneId);
    if (zone) {
      const idx = zone.schedules.findIndex((s) => s.id === scheduleId);
      if (idx >= 0) {
        zone.schedules[idx] = { ...zone.schedules[idx], ...updated };
        saveLocalStore();
        return zone.schedules[idx];
      }
    }
    return null;
  },

  deleteSchedule: async (zoneId, scheduleId) => {
    if (isBackendReachable) {
      try {
        await api.delete(`/zones/${zoneId}/schedules/${scheduleId}`);
        return true;
      } catch {
        isBackendReachable = false;
      }
    }
    const zone = mockDb.zones.find((z) => z.id === zoneId);
    if (zone) {
      zone.schedules = zone.schedules.filter((s) => s.id !== scheduleId);
      saveLocalStore();
    }
    return true;
  }
};

// History Services
export const historyService = {
  getAll: async () => {
    if (isBackendReachable) {
      try {
        const res = await api.get('/history');
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    return [...mockDb.history];
  },

  clear: async () => {
    if (isBackendReachable) {
      try {
        await api.delete('/history');
        return true;
      } catch {
        isBackendReachable = false;
      }
    }
    mockDb.history = [];
    saveLocalStore();
    return true;
  }
};

// Alert Services
export const alertService = {
  getAll: async () => {
    if (isBackendReachable) {
      try {
        const res = await api.get('/alerts');
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    return [...mockDb.alerts];
  },

  create: async (alert) => {
    if (isBackendReachable) {
      try {
        const res = await api.post('/alerts', alert);
        return res.data;
      } catch {
        isBackendReachable = false;
      }
    }
    return addOrUpdateLocalAlert(
      alert.zoneId,
      alert.type || 'INFO',
      alert.priority || 'MEDIA',
      alert.code,
      alert.message,
      alert.recommendation
    );
  },

  resolve: async (alertId) => {
    if (isBackendReachable) {
      try {
        await api.put(`/alerts/${alertId}/resolve`);
        return true;
      } catch {
        isBackendReachable = false;
      }
    }
    const found = mockDb.alerts.find((a) => a.id === alertId);
    if (found) {
      found.resolved = true;
      saveLocalStore();
    }
    return true;
  },

  resolveAll: async () => {
    if (isBackendReachable) {
      try {
        await api.put('/alerts/resolve-all');
        return true;
      } catch {
        isBackendReachable = false;
      }
    }
    mockDb.alerts.forEach((a) => {
      a.resolved = true;
    });
    saveLocalStore();
    return true;
  },

  clearResolved: async () => {
    if (isBackendReachable) {
      try {
        await api.delete('/alerts/resolved');
        return true;
      } catch {
        isBackendReachable = false;
      }
    }
    mockDb.alerts = mockDb.alerts.filter((a) => !a.resolved);
    saveLocalStore();
    return true;
  }
};

export default api;
