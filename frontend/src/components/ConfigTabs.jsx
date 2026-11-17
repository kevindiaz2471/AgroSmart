import React, { useState } from 'react';
import {
  Sliders,
  Calendar,
  Bell,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Info,
  Clock,
  Save,
  Edit3,
  Power,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Terminal
} from 'lucide-react';
import { computeNextSchedule, getAxiosLogs } from '../services/api';

const DAYS_LIST = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export default function ConfigTabs({
  zone,
  zones = [],
  initialTab = 'config',
  onUpdateConfig,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  alerts = [],
  onResolveAlert,
  onResolveAllAlerts,
  onClearResolvedAlerts,
  standaloneTab = null
}) {
  const [internalTab, setInternalTab] = useState(initialTab);
  const activeTab = standaloneTab || internalTab;

  // Threshold & Safety Config State
  const [minMoisture, setMinMoisture] = useState(zone?.minMoisture ?? 30);
  const [maxMoisture, setMaxMoisture] = useState(zone?.maxMoisture ?? 70);
  const [maxDurationMin, setMaxDurationMin] = useState(zone?.maxDurationMin ?? 15);
  const [cooldownSec, setCooldownSec] = useState(zone?.cooldownSec ?? 30);
  const [intervalSec, setIntervalSec] = useState(zone?.intervalSec ?? 15);
  const [flowRateLpm, setFlowRateLpm] = useState(zone?.flowRateLpm ?? 12.0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [configError, setConfigError] = useState('');

  // Schedule Form State (Create & Edit)
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [selectedDays, setSelectedDays] = useState(['LUN', 'MIÉ', 'VIE']);
  const [isDaily, setIsDaily] = useState(false);
  const [schedTime, setSchedTime] = useState('06:00');
  const [schedDuration, setSchedDuration] = useState(15);
  const [schedError, setSchedError] = useState('');

  // Alert Filter State
  const [alertFilter, setAlertFilter] = useState('ACTIVE'); // 'ACTIVE' | 'RESOLVED' | 'ALL'

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    const minVal = Number(minMoisture);
    const maxVal = Number(maxMoisture);
    if (minVal >= maxVal) {
      setConfigError('La humedad mínima debe ser estrictamente menor que la humedad máxima para garantizar la histéresis.');
      setSaveSuccess(false);
      return;
    }
    if (maxVal - minVal < 5) {
      setConfigError('Se recomienda una banda de histéresis de al menos 5% entre el umbral mínimo y máximo.');
      setSaveSuccess(false);
      return;
    }
    setConfigError('');
    await onUpdateConfig({
      minMoisture: minVal,
      maxMoisture: maxVal,
      maxDurationMin: Number(maxDurationMin),
      cooldownSec: Number(cooldownSec),
      intervalSec: Number(intervalSec),
      flowRateLpm: Number(flowRateLpm)
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const toggleDaySelection = (day) => {
    setIsDaily(false);
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSelectDaily = () => {
    setIsDaily((prev) => {
      const next = !prev;
      if (next) setSelectedDays([...DAYS_LIST]);
      return next;
    });
  };

  const openNewScheduleForm = () => {
    setEditingScheduleId(null);
    setSelectedDays(['LUN', 'MIÉ', 'VIE']);
    setIsDaily(false);
    setSchedTime('06:00');
    setSchedDuration(12);
    setSchedError('');
    setShowScheduleForm(true);
  };

  const openEditScheduleForm = (sch) => {
    setEditingScheduleId(sch.id);
    const raw = (sch.days || '').toUpperCase();
    if (raw.includes('DIARIO') || raw.split(',').length === 7) {
      setIsDaily(true);
      setSelectedDays([...DAYS_LIST]);
    } else {
      setIsDaily(false);
      const parsed = DAYS_LIST.filter((d) => raw.includes(d));
      setSelectedDays(parsed.length > 0 ? parsed : ['LUN']);
    }
    setSchedTime(sch.time || '06:00');
    setSchedDuration(sch.duration || 10);
    setSchedError('');
    setShowScheduleForm(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!isDaily && selectedDays.length === 0) {
      setSchedError('Selecciona al menos un día de la semana o marca "Diario".');
      return;
    }
    setSchedError('');
    const daysString = isDaily || selectedDays.length === 7 ? 'DIARIO' : selectedDays.join(', ');

    if (editingScheduleId && onUpdateSchedule) {
      await onUpdateSchedule(editingScheduleId, {
        days: daysString,
        time: schedTime,
        duration: Number(schedDuration),
        active: true
      });
    } else {
      await onAddSchedule({
        days: daysString,
        time: schedTime,
        duration: Number(schedDuration),
        active: true
      });
    }
    setShowScheduleForm(false);
    setEditingScheduleId(null);
  };

  const handleToggleScheduleActive = async (sch) => {
    if (!onUpdateSchedule) return;
    await onUpdateSchedule(sch.id, {
      ...sch,
      active: !sch.active
    });
  };

  const nextSchedule = computeNextSchedule(zone ? [zone] : zones);
  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  const filteredAlerts = alerts.filter((a) => {
    if (alertFilter === 'ACTIVE') return !a.resolved;
    if (alertFilter === 'RESOLVED') return a.resolved;
    return true;
  });

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Tabs Header - solo se muestra cuando opera en modo multi-pestaña */}
      {!standaloneTab && (
        <div className="flex border-b border-slate-800 bg-slate-900/70 p-1.5 gap-1.5 overflow-x-auto scrollbar-none flex-nowrap">
          <button
            type="button"
            onClick={() => setInternalTab('config')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
              activeTab === 'config'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 keep-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>Umbrales y Seguridad</span>
          </button>

          <button
            type="button"
            onClick={() => setInternalTab('schedules')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
              activeTab === 'schedules'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 keep-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Programación Horaria</span>
            {zone?.schedules?.length > 0 && (
              <span className="bg-slate-950/60 text-emerald-300 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                {zone.schedules.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setInternalTab('alerts')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
              activeTab === 'alerts'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 keep-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>Alertas Inteligentes</span>
            {unresolvedCount > 0 && (
              <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-mono keep-white">
                {unresolvedCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* TAB 1: CONFIG & SAFETY THRESHOLDS */}
      {activeTab === 'config' && (
        <form onSubmit={handleConfigSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Humedad Mínima de Activación (%)
              </label>
              <input
                type="number"
                min="5"
                max="90"
                value={minMoisture}
                onChange={(e) => setMinMoisture(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Activa el riego en modo AUTO cuando la lectura cae por debajo de este límite.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Humedad Máxima de Corte (%)
              </label>
              <input
                type="number"
                min="10"
                max="99"
                value={maxMoisture}
                onChange={(e) => setMaxMoisture(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Detiene el riego al alcanzar la humedad óptima (banda de histéresis).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tiempo Máximo Watchdog (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={maxDurationMin}
                onChange={(e) => setMaxDurationMin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Apagado forzado de seguridad para evitar riegos indefinidos.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Espera Anti-Rebote / Cooldown (segundos)
              </label>
              <input
                type="number"
                min="0"
                max="600"
                value={cooldownSec}
                onChange={(e) => setCooldownSec(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Pausa mínima obligatoria tras apagar la bomba para evitar ciclos cortos.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Caudal Estimado Simulado (L/min)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="200"
                value={flowRateLpm}
                onChange={(e) => setFlowRateLpm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Usado para calcular el consumo estimado de agua (simulado) por riego.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Frecuencia de Actualización (segundos)
              </label>
              <input
                type="number"
                min="5"
                max="3600"
                value={intervalSec}
                onChange={(e) => setIntervalSec(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Intervalo de muestreo del sensor simulado para la zona.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-800">
            {configError && (
              <span className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {configError}
              </span>
            )}
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4" /> Parámetros actualizados y persistidos correctamente.
              </span>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/20 keep-white"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Parámetros de Zona</span>
            </button>
          </div>

          {/* Consola Técnica Administrativa (Oculta por defecto, para Soporte / Desarrolladores) */}
          <details className="mt-8 rounded-2xl bg-slate-950/60 border border-slate-800/80 overflow-hidden text-xs group">
            <summary className="p-3.5 px-4 cursor-pointer font-bold text-slate-400 hover:text-slate-200 flex items-center justify-between select-none transition-colors">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Consola de Diagnóstico Técnico y Telemetría de Red (Uso Administrativo / Soporte)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700/60">
                Axios + JWT
              </span>
            </summary>
            <div className="p-4 pt-2 border-t border-slate-800/60 space-y-2.5 bg-slate-950/90">
              <p className="text-[11px] text-slate-400">
                Herramienta de diagnóstico de conectividad interna para verificar respuestas REST y comunicación con el backend Spring Boot.
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                {getAxiosLogs().length > 0 ? (
                  getAxiosLogs().slice(0, 10).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-2 py-1 border-b border-slate-800/50 last:border-none"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500">{log.timestamp}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            log.method === 'POST'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : log.method === 'PUT'
                              ? 'bg-amber-500/20 text-amber-300'
                              : log.method === 'DELETE'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {log.method}
                        </span>
                        <span className="text-slate-300 truncate">{log.url}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded ${
                            log.mode === 'REST API'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-amber-300 bg-amber-500/10'
                          }`}
                        >
                          {log.mode} ({log.status})
                        </span>
                        <span className="text-slate-500">{log.durationMs}ms</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-2">
                    No se han registrado peticiones HTTP recientes en la sesión.
                  </div>
                )}
              </div>
            </div>
          </details>
        </form>
      )}

      {/* TAB 2: SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Turnos de Riego Programados</h4>
              <p className="text-xs text-slate-400">
                Configura horarios por días y duración individual. El sistema evita ejecuciones duplicadas en el mismo minuto.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewScheduleForm}
              className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-600/20 keep-white"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Programación</span>
            </button>
          </div>

          {/* Next Scheduled Activity Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">
                Próxima actividad programada en <strong>{zone?.name}</strong>:
              </span>
            </div>
            {nextSchedule ? (
              <span className="font-mono font-bold text-emerald-400">
                {nextSchedule.dayLabel} a las {nextSchedule.time} ({nextSchedule.duration} min)
              </span>
            ) : (
              <span className="text-slate-400 italic">Sin horarios activos registrados</span>
            )}
          </div>

          {/* Create / Edit Schedule Form */}
          {showScheduleForm && (
            <form
              onSubmit={handleSaveSchedule}
              className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {editingScheduleId ? 'Editar Programación Horaria' : 'Nueva Programación Horaria'}
                </h5>
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancelar ✕
                </button>
              </div>

              {/* Day selector pills */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-2">
                  Selecciona los Días de Riego:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectDaily}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                      isDaily
                        ? 'bg-emerald-600 text-white border-emerald-500 keep-white'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    DIARIO (Todos)
                  </button>
                  {DAYS_LIST.map((day) => {
                    const active = isDaily || selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDaySelection(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer transition-all ${
                          active
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Hora de Inicio (24h)
                  </label>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Duración del Turno (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={schedDuration}
                    onChange={(e) => setSchedDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              {schedError && (
                <div className="text-xs text-rose-400 font-medium">{schedError}</div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer keep-white"
                >
                  {editingScheduleId ? 'Guardar Cambios' : 'Crear Turno'}
                </button>
              </div>
            </form>
          )}

          {/* Schedules List */}
          <div className="space-y-2.5">
            {zone?.schedules?.length > 0 ? (
              zone.schedules.map((s) => (
                <div
                  key={s.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                    s.active
                      ? 'bg-slate-900/70 border-slate-800'
                      : 'bg-slate-900/30 border-slate-800/50 opacity-65'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        s.active
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex flex-wrap items-center gap-2">
                        <span>{s.days}</span>
                        <span className="text-[11px] bg-slate-950 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono border border-slate-800">
                          {s.time}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            s.active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {s.active ? 'ACTIVO' : 'PAUSADO'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Duración individual: <strong className="text-slate-200 font-mono">{s.duration} min</strong> · Agua est. simulada:{' '}
                        <strong className="text-cyan-400 font-mono">
                          {Math.round(s.duration * (zone?.flowRateLpm || 12))} L
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleScheduleActive(s)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1 cursor-pointer transition-colors ${
                        s.active
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                      title={s.active ? 'Pausar programación' : 'Activar programación'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{s.active ? 'Pausar' : 'Activar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditScheduleForm(s)}
                      className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                      title="Editar programación"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteSchedule(s.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                      title="Eliminar programación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay turnos programados en esta zona. Pulsa en "Agregar Programación" para crear uno.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INTELLIGENT ALERTS */}
      {activeTab === 'alerts' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {['ACTIVE', 'RESOLVED', 'ALL'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setAlertFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    alertFilter === f
                      ? 'bg-emerald-600 text-white keep-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {f === 'ACTIVE'
                    ? `Activas (${unresolvedCount})`
                    : f === 'RESOLVED'
                    ? 'Resueltas'
                    : `Todas (${alerts.length})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {unresolvedCount > 0 && onResolveAllAlerts && (
                <button
                  type="button"
                  onClick={onResolveAllAlerts}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Marcar Todas Resueltas
                </button>
              )}
              {alerts.some((a) => a.resolved) && onClearResolvedAlerts && (
                <button
                  type="button"
                  onClick={onClearResolvedAlerts}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Limpiar Resueltas
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alt) => {
                const isCritical = alt.type === 'CRITICAL' || alt.type === 'DANGER' || alt.priority === 'ALTA';
                const isWarning = alt.type === 'WARNING' || alt.priority === 'MEDIA';

                return (
                  <div
                    key={alt.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      alt.resolved
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                        : isCritical
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {isCritical ? (
                          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                isCritical
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : isWarning
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              Prioridad {alt.priority || (isCritical ? 'ALTA' : isWarning ? 'MEDIA' : 'BAJA')}
                            </span>
                            {alt.zoneName && (
                              <span className="text-[11px] font-semibold text-emerald-400">
                                {alt.zoneName}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400">
                              {alt.timestamp}
                            </span>
                          </div>

                          <p className="text-slate-100 font-semibold">{alt.message}</p>

                          {alt.recommendation && (
                            <p className="text-[11px] text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                              <strong className="text-emerald-400">Acción sugerida:</strong> {alt.recommendation}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                        {alt.resolved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resuelta
                          </span>
                        ) : (
                          onResolveAlert && (
                            <button
                              type="button"
                              onClick={() => onResolveAlert(alt.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer transition-colors"
                            >
                              Resolver
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay alertas en esta categoría. El sistema opera dentro de los parámetros seguros.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
