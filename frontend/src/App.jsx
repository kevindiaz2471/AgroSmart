import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  authService,
  placeService,
  zoneService,
  historyService,
  alertService,
  checkBackendHealth,
  computeNextSchedule
} from './services/api';

import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import MoistureGauge from './components/MoistureGauge';
import PumpControl from './components/PumpControl';
import TelemetryChart from './components/TelemetryChart';
import SimulationLab from './components/SimulationLab';
import ConfigTabs from './components/ConfigTabs';
import HistoryTable from './components/HistoryTable';
import PlaceModal from './components/PlaceModal';
import ZoneModal from './components/ZoneModal';
import UserManualModal from './components/UserManualModal';
import SectionModal from './components/SectionModal';
import LandingPage from './components/LandingPage';

import {
  Layers,
  Plus,
  Clock,
  Hand,
  Cpu,
  MapPin,
  BookOpen,
  Sprout,
  Waves,
  ShieldCheck,
  CalendarClock,
  FlaskConical,
  Edit3,
  Trash2,
  Bell,
  Sliders
} from 'lucide-react';

export default function App() {
  // Session & Theme State (Default: Light Agricultural Mode)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('agrosmart_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Session parse error:', e);
      }
    }
    return null;
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('agrosmart_theme_v2') || 'light');
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // null | 'schedules' | 'history' | 'alerts' | 'config' | 'simulation'
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'landing'

  // Places & Zones
  const [places, setPlaces] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState('');
  const [zones, setZones] = useState([]);
  const [currentZoneId, setCurrentZoneId] = useState('');

  // History & Alerts
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Modals
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [confirmDeleteZoneId, setConfirmDeleteZoneId] = useState(null);

  // Simulation Lab State
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [simulateLeakAnomaly, setSimulateLeakAnomaly] = useState(false);
  const autoSimRef = useRef(null);
  const zonesRef = useRef(zones);
  const telemetrySeqRef = useRef(0);

  useEffect(() => {
    zonesRef.current = zones;
  }, [zones]);

  // Apply Light (default) / Dark Agricultural Theme Class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('agrosmart_theme_v2', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load zones for a place
  const loadZones = useCallback(async (placeId, preserveZoneId = true) => {
    try {
      const zList = await zoneService.getAll(placeId);
      zonesRef.current = zList;
      setZones(zList);
      setCurrentZoneId((prevId) => {
        if (preserveZoneId && prevId && zList.some((z) => z.id === prevId)) {
          return prevId;
        }
        return zList.length > 0 ? zList[0].id : '';
      });
    } catch (err) {
      console.error('Error fetching zones:', err);
    }
  }, []);

  const refreshHistoryAndAlerts = useCallback(async () => {
    try {
      const [hist, alts] = await Promise.all([
        historyService.getAll(),
        alertService.getAll()
      ]);
      setHistory(hist);
      setAlerts(alts);
    } catch (e) {
      console.error('Error refreshing history/alerts:', e);
    }
  }, []);

  // Initial load & Periodic Sync
  useEffect(() => {
    const checkHealth = async () => {
      const res = await checkBackendHealth();
      setIsBackendOnline(res.online);
    };
    checkHealth();
    const healthInterval = setInterval(checkHealth, 8000);
    return () => clearInterval(healthInterval);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const loadInitial = async () => {
      try {
        const fetchedPlaces = await placeService.getAll();
        setPlaces(fetchedPlaces);
        if (fetchedPlaces.length > 0) {
          const firstPlaceId = fetchedPlaces[0].id;
          setCurrentPlaceId(firstPlaceId);
          await loadZones(firstPlaceId, false);
        }
        await refreshHistoryAndAlerts();
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    loadInitial();
  }, [currentUser, loadZones, refreshHistoryAndAlerts]);

  // Periodic real-time data synchronization between frontend and backend
  useEffect(() => {
    if (!currentUser || !currentPlaceId) return;
    const syncTimer = setInterval(async () => {
      await loadZones(currentPlaceId, true);
      await refreshHistoryAndAlerts();
    }, 5000);
    return () => clearInterval(syncTimer);
  }, [currentUser, currentPlaceId, loadZones, refreshHistoryAndAlerts]);

  const handleSelectPlace = (placeId) => {
    setCurrentPlaceId(placeId);
    loadZones(placeId, false);
  };

  const currentZone = zones.find((z) => z.id === currentZoneId) || zones[0];
  const currentPlace = places.find((p) => p.id === currentPlaceId);

  // Auth Handlers
  const handleLogin = async (email, password) => {
    const user = await authService.login(email, password);
    localStorage.setItem('agrosmart_session', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleRegister = async (name, email, password, role) => {
    const user = await authService.register(name, email, password, role);
    localStorage.setItem('agrosmart_session', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    if (autoSimRef.current) {
      clearInterval(autoSimRef.current);
      autoSimRef.current = null;
    }
    setIsAutoSimulating(false);
    localStorage.removeItem('agrosmart_session');
    setCurrentUser(null);
  };

  // Cleanup simulation interval on unmount
  useEffect(() => {
    return () => {
      if (autoSimRef.current) {
        clearInterval(autoSimRef.current);
      }
    };
  }, []);

  // Pump Control
  const handleTogglePump = useCallback(
    async (state, reason = '', targetZoneId = null, triggerType = null, plannedDurationMin = null) => {
      const zId = targetZoneId || currentZone?.id;
      if (!zId) return;
      const updatedZone = await zoneService.setPump(zId, state, reason, triggerType, plannedDurationMin);
      if (updatedZone) {
        zonesRef.current = zonesRef.current.map((z) => (z.id === zId ? { ...z, ...updatedZone } : z));
        setZones(zonesRef.current);
      }
      await refreshHistoryAndAlerts();
    },
    [currentZone?.id, refreshHistoryAndAlerts]
  );

  // Watchdog Timer, Individual Schedule Duration & Anomaly Evaluator
  useEffect(() => {
    if (!currentUser || zones.length === 0) return;

    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const normalizeStr = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

    const safetyAndScheduleLoop = setInterval(async () => {
      const now = new Date();
      const currentDayNorm = normalizeStr(dayNames[now.getDay()]);
      const pad = (n) => String(n).padStart(2, '0');
      const currentHHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const triggerKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${currentHHMM}`;

      for (const z of zones) {
        // Priority 0: In AUTO mode, if moisture >= maxMoisture while pump is ON, stop immediately
        if (z.mode === 'AUTO' && z.pumpState && Number(z.currentMoisture) >= Number(z.maxMoisture)) {
          await handleTogglePump(
            false,
            `Umbral máximo alcanzado (${z.currentMoisture}% >= ${z.maxMoisture}%)`,
            z.id,
            'AUTO'
          );
          continue;
        }

        if (z.pumpState && z.pumpStartTime) {
          const elapsedMs = Date.now() - z.pumpStartTime;
          const elapsedMin = elapsedMs / 60000;

          // 1. Check individual schedule duration
          if (z.plannedDurationMin && z.plannedDurationMin > 0 && elapsedMin >= z.plannedDurationMin) {
            await handleTogglePump(
              false,
              `Turno programado completado (${z.plannedDurationMin} min)`,
              z.id,
              'SCHEDULED'
            );
            continue;
          }

          // 2. Check Watchdog max duration
          if (z.maxDurationMin > 0 && elapsedMin >= z.maxDurationMin) {
            await alertService.create({
              zoneId: z.id,
              type: 'CRITICAL',
              priority: 'ALTA',
              code: 'WATCHDOG_TIMEOUT',
              message: `Tiempo máximo de riego excedido (Watchdog: ${z.maxDurationMin} min) en ${z.name}.`,
              recommendation: 'Inspeccione posibles fugas en la línea o revise la respuesta del sensor de humedad.'
            });
            await handleTogglePump(false, `Watchdog Timer excedido (${z.maxDurationMin} min)`, z.id);
            continue;
          }

          // 3. Check consumption / infiltration anomaly (running >= 30s with leak anomaly or >= 90s without moisture gain)
          const anomalyWaitMs = simulateLeakAnomaly ? 12000 : 90000;
          if (
            elapsedMs >= anomalyWaitMs &&
            z.pumpStartMoisture !== null &&
            z.pumpStartMoisture !== undefined &&
            z.currentMoisture <= z.pumpStartMoisture
          ) {
            await alertService.create({
              zoneId: z.id,
              type: 'WARNING',
              priority: 'ALTA',
              code: 'CONSUMPTION_ANOMALY',
              message: `Anomalía en consumo estimado en ${z.name}: La bomba lleva ${Math.round(elapsedMs / 1000)}s activa pero la humedad no incrementa (${z.currentMoisture}%).`,
              recommendation: 'Desactive la simulación de fuga o verifique la hidratación del suelo en el Laboratorio de Simulación.'
            });
            await refreshHistoryAndAlerts();
          }
        }

        // 4. Scheduled Mode Trigger
        if (z.mode === 'SCHEDULED' && !z.pumpState && z.tankOk && z.schedules?.length > 0) {
          for (const s of z.schedules) {
            if (!s.active || s.time !== currentHHMM) continue;
            if (s.lastTriggeredKey === triggerKey) continue;

            const daysNorm = normalizeStr(s.days);
            if (daysNorm.includes('DIARIO') || daysNorm.includes(currentDayNorm)) {
              await zoneService.updateSchedule(z.id, s.id, { ...s, lastTriggeredKey: triggerKey });
              await handleTogglePump(
                true,
                `Programación horaria ${s.time} (${s.duration} min)`,
                z.id,
                'SCHEDULED',
                s.duration
              );
              break;
            }
          }
        }
      }
    }, 4000);

    return () => clearInterval(safetyAndScheduleLoop);
  }, [currentUser, zones, simulateLeakAnomaly, handleTogglePump, refreshHistoryAndAlerts]);

  // Zone Mode change
  const handleModeChange = async (newMode) => {
    if (!currentZone) return;
    try {
      const updated = await zoneService.setMode(currentZone.id, newMode);
      setZones((prev) =>
        prev.map((z) => (z.id === currentZone.id ? { ...z, ...(updated || { mode: newMode }) } : z))
      );
      await refreshHistoryAndAlerts();
    } catch (err) {
      console.error('Error updating zone mode:', err);
    }
  };

  // Moisture Telemetry Update (Deterministic & Race-Condition Free)
  const handleMoistureChange = useCallback(
    async (newVal, targetZoneId = null) => {
      const currentList = zonesRef.current;
      const targetZone = targetZoneId
        ? currentList.find((z) => z.id === targetZoneId)
        : currentList.find((z) => z.id === currentZoneId) || currentList[0];
      if (!targetZone) return;

      const moisture = Math.min(100, Math.max(0, Number(newVal)));
      const seq = ++telemetrySeqRef.current;

      // Immediate optimistic UI update including strict hysteresis cutoff/activation
      let nextPumpState = targetZone.pumpState;
      if (targetZone.mode === 'AUTO') {
        if (moisture >= Number(targetZone.maxMoisture)) {
          nextPumpState = false;
        } else if (moisture <= Number(targetZone.minMoisture) && targetZone.tankOk && targetZone.sensorOk) {
          const cdSec = Number(targetZone.cooldownSec) || 0;
          const cdOk = !targetZone.lastPumpStopTime || cdSec <= 0 || Date.now() - Number(targetZone.lastPumpStopTime) >= cdSec * 1000;
          if (cdOk) nextPumpState = true;
        }
      }

      // Synchronously update zonesRef.current to prevent race conditions in auto-simulation loops
      zonesRef.current = zonesRef.current.map((z) =>
        z.id === targetZone.id ? { ...z, currentMoisture: moisture, pumpState: nextPumpState } : z
      );
      setZones(zonesRef.current);

      try {
        const updatedZone = await zoneService.sendTelemetry(targetZone.id, { moisture });
        if (updatedZone && seq === telemetrySeqRef.current) {
          zonesRef.current = zonesRef.current.map((z) =>
            z.id === targetZone.id ? { ...z, ...updatedZone } : z
          );
          setZones(zonesRef.current);
          await refreshHistoryAndAlerts();
        }
      } catch (err) {
        console.error('Error sending moisture telemetry:', err);
      }
    },
    [currentZoneId, refreshHistoryAndAlerts]
  );

  // Dynamic Continuous Simulation Loop (Evaporation when pump OFF, Hydration when pump ON)
  useEffect(() => {
    if (!isAutoSimulating || !currentZoneId) {
      if (autoSimRef.current) {
        clearInterval(autoSimRef.current);
        autoSimRef.current = null;
      }
      return;
    }

    autoSimRef.current = setInterval(() => {
      const active = zonesRef.current.find((z) => z.id === currentZoneId);
      if (!active || !active.sensorOk) return;

      let nextVal = Number(active.currentMoisture);
      if (active.pumpState) {
        // If leak anomaly is active, moisture stays flat even while pumping
        nextVal = simulateLeakAnomaly ? nextVal : nextVal + 4;
      } else {
        nextVal = nextVal - 2;
      }
      nextVal = Math.max(0, Math.min(100, nextVal));

      handleMoistureChange(nextVal, active.id);
    }, 1800);

    return () => {
      if (autoSimRef.current) {
        clearInterval(autoSimRef.current);
        autoSimRef.current = null;
      }
    };
  }, [isAutoSimulating, currentZoneId, simulateLeakAnomaly, handleMoistureChange]);

  // Tank Level Toggle (Simulation Lab)
  const handleToggleTank = async () => {
    if (!currentZone) return;
    const newTankState = !currentZone.tankOk;
    try {
      const updatedZone = await zoneService.sendTelemetry(currentZone.id, { tankOk: newTankState });
      setZones((prev) =>
        prev.map((z) =>
          z.id === currentZone.id ? { ...z, ...(updatedZone || { tankOk: newTankState }) } : z
        )
      );
      await refreshHistoryAndAlerts();
    } catch (err) {
      console.error('Error toggling tank level:', err);
    }
  };

  // Sensor Connection Toggle (Simulation Lab)
  const handleToggleSensor = async () => {
    if (!currentZone) return;
    const newSensorState = !currentZone.sensorOk;
    try {
      const updatedZone = await zoneService.sendTelemetry(currentZone.id, { sensorOk: newSensorState });
      setZones((prev) =>
        prev.map((z) =>
          z.id === currentZone.id ? { ...z, ...(updatedZone || { sensorOk: newSensorState }) } : z
        )
      );
      await refreshHistoryAndAlerts();
    } catch (err) {
      console.error('Error toggling sensor state:', err);
    }
  };

  // Reset Zone Simulation to Optimal Defaults
  const handleResetZoneDefaults = async () => {
    if (!currentZone) return;
    setIsAutoSimulating(false);
    setSimulateLeakAnomaly(false);
    const optimalM = Math.round((currentZone.minMoisture + currentZone.maxMoisture) / 2);
    const updatedZone = await zoneService.sendTelemetry(currentZone.id, {
      tankOk: true,
      sensorOk: true,
      moisture: optimalM
    });
    if (updatedZone) {
      setZones((prev) =>
        prev.map((z) => (z.id === currentZone.id ? { ...z, ...updatedZone } : z))
      );
    }
    await refreshHistoryAndAlerts();
  };

  // Config & Schedules Handlers
  const handleUpdateConfig = async (config) => {
    if (!currentZone) return;
    try {
      const updated = await zoneService.updateConfig(currentZone.id, config);
      setZones((prev) =>
        prev.map((z) => (z.id === currentZone.id ? { ...z, ...(updated || config) } : z))
      );
    } catch (err) {
      console.error('Error updating config:', err);
    }
  };

  const handleAddSchedule = async (schedule) => {
    if (!currentZone) return;
    try {
      const added = await zoneService.addSchedule(currentZone.id, schedule);
      setZones((prev) =>
        prev.map((z) =>
          z.id === currentZone.id ? { ...z, schedules: [...(z.schedules || []), added] } : z
        )
      );
    } catch (err) {
      console.error('Error adding schedule:', err);
    }
  };

  const handleUpdateSchedule = async (scheduleId, updatedSchedule) => {
    if (!currentZone) return;
    try {
      const saved = await zoneService.updateSchedule(currentZone.id, scheduleId, updatedSchedule);
      setZones((prev) =>
        prev.map((z) => {
          if (z.id === currentZone.id) {
            return {
              ...z,
              schedules: (z.schedules || []).map((s) => (s.id === scheduleId ? saved || updatedSchedule : s))
            };
          }
          return z;
        })
      );
    } catch (err) {
      console.error('Error updating schedule:', err);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!currentZone) return;
    try {
      await zoneService.deleteSchedule(currentZone.id, scheduleId);
      setZones((prev) =>
        prev.map((z) =>
          z.id === currentZone.id
            ? { ...z, schedules: (z.schedules || []).filter((s) => s.id !== scheduleId) }
            : z
        )
      );
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  // Alerts & History Handlers
  const handleResolveAlert = async (alertId) => {
    await alertService.resolve(alertId);
    await refreshHistoryAndAlerts();
  };

  const handleResolveAllAlerts = async () => {
    await alertService.resolveAll();
    await refreshHistoryAndAlerts();
  };

  const handleClearResolvedAlerts = async () => {
    await alertService.clearResolved();
    await refreshHistoryAndAlerts();
  };

  const handleClearHistory = async () => {
    await historyService.clear();
    setHistory([]);
  };

  // Place & Zone CRUD
  const handleSavePlace = async (placeData) => {
    try {
      const saved = await placeService.save(placeData);
      setPlaces((prev) => {
        const exists = prev.some((p) => p.id === saved.id);
        return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
      });
      setCurrentPlaceId(saved.id);
      loadZones(saved.id, false);
    } catch (err) {
      console.error('Error saving place:', err);
    }
  };

  const handleSaveZone = async (newZone) => {
    try {
      const saved = await zoneService.create(newZone);
      setZones((prev) => [...prev, saved]);
      setCurrentZoneId(saved.id);
    } catch (err) {
      console.error('Error saving zone:', err);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    try {
      await zoneService.delete(zoneId);
      const remaining = zones.filter((z) => z.id !== zoneId);
      setZones(remaining);
      if (currentZoneId === zoneId) {
        setCurrentZoneId(remaining.length > 0 ? remaining[0].id : '');
      }
      setConfirmDeleteZoneId(null);
    } catch (err) {
      console.error('Error deleting zone:', err);
    }
  };

  // Computed Executive Summary Metrics
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);
  const nextScheduled = computeNextSchedule(zones);
  const latestEventDatePrefix = (history[0]?.startTime || '').slice(0, 10);
  const todayWaterLiters = Math.round(
    history
      .filter((h) => latestEventDatePrefix && (h.startTime || '').startsWith(latestEventDatePrefix))
      .reduce((acc, h) => acc + (Number(h.waterUsedLiters) || ((h.durationSec || 0) / 60) * 12), 0) * 10
  ) / 10;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {!currentUser && <AuthModal onLogin={handleLogin} onRegister={handleRegister} />}

      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        places={places}
        currentPlaceId={currentPlaceId}
        onSelectPlace={handleSelectPlace}
        onNewPlace={() => {
          setEditingPlace(null);
          setShowPlaceModal(true);
        }}
        onOpenManual={() => setShowManualModal(true)}
        isBackendOnline={isBackendOnline}
        activeModal={activeModal}
        onOpenModal={(modalId) => setActiveModal(modalId)}
        onCloseModal={() => setActiveModal(null)}
        isHistoryModalOpen={activeModal === 'history'}
        onOpenHistoryModal={() => setActiveModal('history')}
        activeSection={activeModal || 'control'}
        onSelectSection={(sec) => {
          if (sec === 'control' || sec === 'dashboard') {
            setActiveModal(null);
          } else {
            setActiveModal(sec);
          }
        }}
        unresolvedAlertsCount={unresolvedAlerts.length}
        isAutoSimulating={isAutoSimulating}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isLandingView={viewMode === 'landing'}
        onToggleLanding={() => setViewMode((prev) => (prev === 'landing' ? 'dashboard' : 'landing'))}
      />

      {viewMode === 'landing' ? (
        <LandingPage onGoToDashboard={() => setViewMode('dashboard')} />
      ) : (
      <main className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 space-y-6">
        {/* Executive KPI Summary Cards Bar */}
        {currentZone && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Soil Moisture */}
            <div
              className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center justify-between border-l-4"
              style={{ borderLeftColor: '#6A994E' }}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Humedad de Zona Activa
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                  {currentZone.sensorOk ? `${currentZone.currentMoisture}%` : 'SIN SEÑAL'}
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Rango ideal: {currentZone.minMoisture}% – {currentZone.maxMoisture}%
                </span>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0"
                style={{
                  backgroundColor: 'rgba(106, 153, 78, 0.14)',
                  borderColor: 'rgba(106, 153, 78, 0.35)',
                  color: '#6A994E'
                }}
              >
                <Sprout className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2: Pump & Operation Mode */}
            <div
              className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center justify-between border-l-4"
              style={{ borderLeftColor: '#2A9D8F' }}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Estado de Bomba y Modo
                </span>
                <div className="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
                  <span style={{ color: currentZone.pumpState ? '#2A9D8F' : undefined }}>
                    {currentZone.pumpState ? 'REGANDO' : 'EN ESPERA'}
                  </span>
                  <span
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-bold"
                    style={{
                      backgroundColor: 'rgba(106, 153, 78, 0.14)',
                      borderColor: 'rgba(106, 153, 78, 0.35)',
                      color: '#6A994E'
                    }}
                  >
                    {currentZone.mode}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Máx: {currentZone.maxDurationMin} min · Espera: {currentZone.cooldownSec || 30}s
                </span>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0"
                style={{
                  backgroundColor: 'rgba(42, 157, 143, 0.14)',
                  borderColor: 'rgba(42, 157, 143, 0.35)',
                  color: '#2A9D8F'
                }}
              >
                <Waves className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3: Tank & Sensor Health */}
            <div
              className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center justify-between border-l-4"
              style={{
                borderLeftColor: currentZone.tankOk && currentZone.sensorOk ? '#A7C957' : '#D9534F'
              }}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Seguridad y Sensores
                </span>
                <div className="text-sm sm:text-base font-extrabold mt-1 flex items-center gap-2">
                  <span style={{ color: currentZone.tankOk ? '#6A994E' : '#D9534F' }}>
                    Tanque: {currentZone.tankOk ? 'OK' : 'BAJO'}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span style={{ color: currentZone.sensorOk ? '#6A994E' : '#D9534F' }}>
                    Sensor: {currentZone.sensorOk ? 'OK' : 'FALLO'}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono block mt-0.5">
                  Lectura: {currentZone.lastTelemetryTime ? currentZone.lastTelemetryTime.slice(11) : 'Ahora'}
                </span>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0"
                style={
                  currentZone.tankOk && currentZone.sensorOk
                    ? {
                        backgroundColor: 'rgba(167, 201, 87, 0.18)',
                        borderColor: 'rgba(106, 153, 78, 0.4)',
                        color: '#6A994E'
                      }
                    : {
                        backgroundColor: 'rgba(217, 83, 79, 0.14)',
                        borderColor: 'rgba(217, 83, 79, 0.4)',
                        color: '#D9534F'
                      }
                }
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 4: Simulated Water Usage & Next Schedule */}
            <div
              className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center justify-between border-l-4"
              style={{ borderLeftColor: '#B87543' }}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Agua Estimada y Próximo Riego
                </span>
                <div className="text-lg sm:text-xl font-black font-mono mt-1" style={{ color: '#B87543' }}>
                  {todayWaterLiters} L <span className="text-xs font-normal text-slate-400">(Simulado)</span>
                </div>
                <span className="text-xs text-slate-300 font-mono truncate block max-w-[205px]">
                  {nextScheduled
                    ? `Próx: ${nextScheduled.dayLabel} ${nextScheduled.time}`
                    : 'Sin turnos pendientes'}
                </span>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0"
                style={{
                  backgroundColor: 'rgba(184, 117, 67, 0.14)',
                  borderColor: 'rgba(184, 117, 67, 0.38)',
                  color: '#B87543'
                }}
              >
                <CalendarClock className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Quick Zone Selector Pill Bar */}
        {zones.length > 0 && (
          <div className="lg:hidden overflow-x-auto scrollbar-none flex items-center gap-2 pb-1">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Zonas:
            </span>
            {zones.map((zone) => {
              const isSelected = zone.id === currentZoneId;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setCurrentZoneId(zone.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm keep-white'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      zone.pumpState ? 'bg-cyan-300 animate-ping' : isSelected ? 'bg-white' : 'bg-emerald-500'
                    }`}
                  ></span>
                  <span>{zone.name}</span>
                  <span className="font-mono text-[11px] opacity-85">{zone.currentMoisture}%</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Operational Column (8 cols on desktop) */}
          <section className="order-1 lg:order-2 lg:col-span-8 space-y-6">
            {currentZone ? (
              <>
                {/* Active Zone Header & Mode Selector */}
                <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {currentZone.name}
                      </h2>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: 'rgba(184, 117, 67, 0.14)',
                          borderColor: 'rgba(184, 117, 67, 0.38)',
                          color: '#B87543'
                        }}
                      >
                        Cultivo: {currentZone.cropType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Rango de riego: activa {'<'} {currentZone.minMoisture}% · detiene {'≥'} {currentZone.maxMoisture}% · Caudal: {currentZone.flowRateLpm || 12} L/min
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleModeChange('AUTO')}
                      className="px-2.5 sm:px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all text-[11px] sm:text-xs"
                      style={
                        currentZone.mode === 'AUTO'
                          ? { backgroundColor: '#6A994E', color: '#FFFFFF' }
                          : undefined
                      }
                    >
                      <Cpu className="w-3.5 h-3.5 shrink-0" />
                      <span>Automático</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModeChange('MANUAL')}
                      className="px-2.5 sm:px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all text-[11px] sm:text-xs"
                      style={
                        currentZone.mode === 'MANUAL'
                          ? { backgroundColor: '#E9A23B', color: '#FFFFFF' }
                          : undefined
                      }
                    >
                      <Hand className="w-3.5 h-3.5 shrink-0" />
                      <span>Manual</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModeChange('SCHEDULED')}
                      className="px-2.5 sm:px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all text-[11px] sm:text-xs"
                      style={
                        currentZone.mode === 'SCHEDULED'
                          ? { backgroundColor: '#244C36', color: '#FFFFFF' }
                          : undefined
                      }
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Programado</span>
                    </button>
                  </div>
                </div>

                {/* Monitoreo y Control: Panel Operativo Permanente (Humedad, Bomba y Curva de Telemetría) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <MoistureGauge
                    moisture={currentZone.currentMoisture}
                    minMoisture={currentZone.minMoisture}
                    maxMoisture={currentZone.maxMoisture}
                    sensorOk={currentZone.sensorOk}
                    lastTelemetryTime={currentZone.lastTelemetryTime}
                    onOpenSimLab={() => setActiveModal('simulation')}
                  />

                  <PumpControl
                    zone={currentZone}
                    pumpState={currentZone.pumpState}
                    onTogglePump={handleTogglePump}
                    maxDurationMin={currentZone.maxDurationMin}
                    tankOk={currentZone.tankOk}
                  />
                </div>

                <TelemetryChart zone={currentZone} />
              </>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                <p>Selecciona o crea una zona en la barra lateral para comenzar el monitoreo.</p>
              </div>
            )}
          </section>

          {/* Left Sidebar: Zones List, Place Details & Quick Simulation Access (4 cols on desktop) */}
          <aside className="order-2 lg:order-1 lg:col-span-4 space-y-6">
            {/* Zones List Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Zonas de Cultivo
                </h2>
                <button
                  type="button"
                  onClick={() => setShowZoneModal(true)}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer transition-all keep-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Zona</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {zones.map((zone) => {
                  const isSelected = zone.id === currentZoneId;
                  return (
                    <div
                      key={zone.id}
                      onClick={() => setCurrentZoneId(zone.id)}
                      className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              !zone.tankOk || !zone.sensorOk
                                ? 'bg-rose-500'
                                : zone.pumpState
                                ? 'bg-cyan-400 animate-ping'
                                : 'bg-emerald-500'
                            }`}
                          ></span>
                          {zone.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                              zone.mode === 'AUTO'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : zone.mode === 'SCHEDULED'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {zone.mode}
                          </span>
                          {zones.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteZoneId(zone.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                              title="Eliminar zona"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          Cultivo: <strong className="text-slate-300">{zone.cropType}</strong>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {zone.sensorOk ? `${zone.currentMoisture}%` : 'OFFLINE'}
                        </span>
                      </div>

                      {confirmDeleteZoneId === zone.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between text-[11px]"
                        >
                          <span className="text-rose-400 font-medium">¿Eliminar zona?</span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteZone(zone.id)}
                              className="px-2 py-0.5 bg-rose-600 text-white rounded font-semibold cursor-pointer keep-white"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteZoneId(null)}
                              className="px-2 py-0.5 bg-slate-700 text-slate-200 rounded cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {zones.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No hay zonas registradas. Pulsa en "+ Nueva Zona" para comenzar.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Simulation Lab Shortcut Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-emerald-500/25 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  <span>Simulación y Diagnóstico</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isAutoSimulating
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isAutoSimulating ? 'CICLO ACTIVO' : 'MANUAL'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Prueba los umbrales de histéresis, corte por nivel bajo de tanque, desconexión de sensor y anomalías desde el laboratorio aislado.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('simulation')}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-center cursor-pointer transition-colors keep-white"
                >
                  Abrir Laboratorio
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoSimulating((prev) => !prev)}
                  className={`py-2 px-3 rounded-xl font-semibold border cursor-pointer transition-colors ${
                    isAutoSimulating
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isAutoSimulating ? 'Pausar Ciclo' : 'Auto Simular'}
                </button>
              </div>
            </div>

            {/* Active Place Metadata Card */}
            {currentPlace && (
              <div className="glass-panel rounded-2xl p-4 sm:p-5 text-xs text-slate-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{currentPlace.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlace(currentPlace);
                      setShowPlaceModal(true);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </button>
                </div>
                <p className="text-slate-400 leading-relaxed">{currentPlace.description}</p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono truncate max-w-[150px]">{currentPlace.location}</span>
                  <span className="text-emerald-400 font-mono">GPS: {currentPlace.coords}</span>
                </div>
              </div>
            )}

            {/* User Manual Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border-emerald-500/20 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Documentación y Manual</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Consulta el funcionamiento del algoritmo de histéresis, tiempos de seguridad (Watchdog y Cooldown) y guía operativa.
              </p>
              <button
                type="button"
                onClick={() => setShowManualModal(true)}
                className="w-full mt-2 py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold cursor-pointer transition-colors"
              >
                Abrir Manual del Sistema
              </button>
            </div>
          </aside>
        </div>
      </main>
      )}

      {/* Modals */}
      <PlaceModal
        key={editingPlace?.id || 'new-place'}
        isOpen={showPlaceModal}
        onClose={() => {
          setShowPlaceModal(false);
          setEditingPlace(null);
        }}
        onSave={handleSavePlace}
        editingPlace={editingPlace}
      />

      <ZoneModal
        isOpen={showZoneModal}
        onClose={() => setShowZoneModal(false)}
        onSave={handleSaveZone}
        placeId={currentPlaceId}
      />

      <UserManualModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
      />

      {/* 1. Modal: Programación de Riego */}
      <SectionModal
        isOpen={activeModal === 'schedules'}
        onClose={() => setActiveModal(null)}
        title="Programación de Riego"
        subtitle={`Turnos automáticos y horarios de riego programados para ${currentZone?.name || 'la zona activa'}`}
        icon={CalendarClock}
        iconColor="#2A9D8F"
        iconBg="rgba(42, 157, 143, 0.16)"
        iconBorder="rgba(42, 157, 143, 0.4)"
        badge={
          currentZone?.schedules?.length > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {currentZone.schedules.length} turnos
            </span>
          ) : null
        }
      >
        {currentZone && (
          <ConfigTabs
            key={`modal-sch-${currentZone.id}`}
            zone={currentZone}
            zones={zones}
            standaloneTab="schedules"
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}
      </SectionModal>

      {/* 2. Modal: Historial y Estadísticas */}
      <HistoryTable
        isOpen={activeModal === 'history'}
        onClose={() => setActiveModal(null)}
        history={history}
        zones={zones}
        onClearHistory={handleClearHistory}
      />

      {/* 3. Modal: Centro de Alertas y Notificaciones */}
      <SectionModal
        isOpen={activeModal === 'alerts'}
        onClose={() => setActiveModal(null)}
        title="Centro de Alertas y Notificaciones"
        subtitle={`Supervisión de eventos de seguridad, nivel de tanque y fallos de sensores en ${currentZone?.name || 'el sistema'}`}
        icon={Bell}
        iconColor="#D9534F"
        iconBg="rgba(217, 83, 79, 0.14)"
        iconBorder="rgba(217, 83, 79, 0.4)"
        badge={
          unresolvedAlerts.length > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {unresolvedAlerts.length} activas
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Sistema Seguro
            </span>
          )
        }
      >
        <ConfigTabs
          key={`modal-alt-${currentZone?.id || 'all'}`}
          zone={currentZone}
          zones={zones}
          standaloneTab="alerts"
          alerts={alerts}
          onResolveAlert={handleResolveAlert}
          onResolveAllAlerts={handleResolveAllAlerts}
          onClearResolvedAlerts={handleClearResolvedAlerts}
        />
      </SectionModal>

      {/* 4. Modal: Configuración de Zona y Parámetros Operativos */}
      <SectionModal
        isOpen={activeModal === 'config'}
        onClose={() => setActiveModal(null)}
        title="Configuración de Zona y Parámetros de Riego"
        subtitle={`Umbrales de humedad de histéresis, tiempos de seguridad Watchdog y Cooldown para ${currentZone?.name || 'la zona activa'}`}
        icon={Sliders}
        iconColor="#6A994E"
        iconBg="rgba(106, 153, 78, 0.16)"
        iconBorder="rgba(106, 153, 78, 0.4)"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {currentZone?.cropType}
          </span>
        }
      >
        {currentZone && (
          <ConfigTabs
            key={`modal-cfg-${currentZone.id}`}
            zone={currentZone}
            zones={zones}
            standaloneTab="config"
            onUpdateConfig={handleUpdateConfig}
          />
        )}
      </SectionModal>

      {/* 5. Modal: Simulación y Diagnóstico */}
      <SectionModal
        isOpen={activeModal === 'simulation'}
        onClose={() => setActiveModal(null)}
        title="Laboratorio de Simulación y Diagnóstico"
        subtitle={`Controles de prueba aislados del panel operativo para evaluar histéresis y protecciones en ${currentZone?.name || 'la zona activa'}`}
        icon={FlaskConical}
        iconColor="#E9A23B"
        iconBg="rgba(233, 162, 59, 0.16)"
        iconBorder="rgba(233, 162, 59, 0.4)"
        badge={
          isAutoSimulating ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Ciclo Continuo Activo
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Modo Pruebas
            </span>
          )
        }
      >
        {currentZone && (
          <SimulationLab
            zone={currentZone}
            onMoistureChange={handleMoistureChange}
            isAutoSimulating={isAutoSimulating}
            onToggleAutoSim={() => setIsAutoSimulating((prev) => !prev)}
            simulateLeakAnomaly={simulateLeakAnomaly}
            onToggleLeakAnomaly={() => setSimulateLeakAnomaly((prev) => !prev)}
            onToggleTank={handleToggleTank}
            onToggleSensor={handleToggleSensor}
            onResetZoneDefaults={handleResetZoneDefaults}
          />
        )}
      </SectionModal>
    </div>
  );
}
