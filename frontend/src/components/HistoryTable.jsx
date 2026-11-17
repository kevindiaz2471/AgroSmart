import React, { useState, useMemo, useEffect } from 'react';
import {
  History,
  Trash2,
  CheckCircle2,
  Cpu,
  Calendar,
  Hand,
  ArrowRight,
  Clock,
  Droplets,
  Filter,
  BarChart3,
  Download,
  AlertTriangle,
  X
} from 'lucide-react';

export default function HistoryTable({
  isOpen = false,
  onClose,
  history = [],
  zones = [],
  onClearHistory
}) {
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [referenceTs] = useState(() => Date.now());

  // Lock background scroll and allow closing with Escape key
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const getZoneName = React.useCallback((event) => {
    if (event.zoneName) return event.zoneName;
    const found = zones.find((z) => z.id === event.zoneId);
    return found ? found.name : event.zoneId || 'Zona General';
  }, [zones]);

  const getWaterLiters = React.useCallback((event) => {
    if (typeof event.waterUsedLiters === 'number' && event.waterUsedLiters > 0) {
      return event.waterUsedLiters;
    }
    const found = zones.find((z) => z.id === event.zoneId);
    const flow = found?.flowRateLpm || 12.0;
    return Math.round(((event.durationSec || 0) / 60) * flow * 10) / 10;
  }, [zones]);

  // Filtered events
  const filteredHistory = useMemo(() => {
    const startOfToday = referenceTs - (referenceTs % 86400000);
    const weekAgo = referenceTs - 7 * 86400000;
    const monthAgo = referenceTs - 30 * 86400000;

    return (history || []).filter((h) => {
      if (zoneFilter !== 'ALL' && h.zoneId !== zoneFilter) return false;
      if (modeFilter !== 'ALL' && h.triggerType !== modeFilter) return false;

      const parsedDate = h.startTime ? Date.parse(h.startTime.replace(' ', 'T')) : NaN;
      const ts = !Number.isNaN(parsedDate) ? parsedDate : null;

      if (ts !== null) {
        if (periodFilter === 'TODAY' && ts < startOfToday) return false;
        if (periodFilter === 'WEEK' && ts < weekAgo) return false;
        if (periodFilter === 'MONTH' && ts < monthAgo) return false;

        if (dateFrom) {
          const fromTs = Date.parse(`${dateFrom}T00:00:00`);
          if (!Number.isNaN(fromTs) && ts < fromTs) return false;
        }
        if (dateTo) {
          const toTs = Date.parse(`${dateTo}T23:59:59`);
          if (!Number.isNaN(toTs) && ts > toTs) return false;
        }
      }

      return true;
    });
  }, [history, periodFilter, zoneFilter, modeFilter, dateFrom, dateTo, referenceTs]);

  // Aggregated Statistics (Daily, Weekly, Monthly, Filtered)
  const stats = useMemo(() => {
    const count = filteredHistory.length;
    let totalDurationSec = 0;
    let totalLiters = 0;
    let totalDeltaMoisture = 0;
    const byMode = { AUTO: 0, SCHEDULED: 0, MANUAL: 0 };
    const byZone = {};

    filteredHistory.forEach((h) => {
      const dur = Number(h.durationSec) || 0;
      const liters = getWaterLiters(h);
      const delta = Math.max(0, (Number(h.finalMoisture) || 0) - (Number(h.initialMoisture) || 0));
      const zName = getZoneName(h);

      totalDurationSec += dur;
      totalLiters += liters;
      totalDeltaMoisture += delta;

      const modeKey = h.triggerType || 'MANUAL';
      byMode[modeKey] = (byMode[modeKey] || 0) + 1;

      if (!byZone[zName]) {
        byZone[zName] = { events: 0, liters: 0, durationSec: 0 };
      }
      byZone[zName].events += 1;
      byZone[zName].liters = Math.round((byZone[zName].liters + liters) * 10) / 10;
      byZone[zName].durationSec += dur;
    });

    return {
      count,
      totalDurationSec,
      totalLiters: Math.round(totalLiters * 10) / 10,
      avgDeltaMoisture: count > 0 ? Math.round(totalDeltaMoisture / count) : 0,
      byMode,
      byZone: Object.entries(byZone)
    };
  }, [filteredHistory, getWaterLiters, getZoneName]);

  const getTriggerBadge = (type) => {
    switch (type) {
      case 'AUTO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Cpu className="w-3 h-3" /> Auto
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Calendar className="w-3 h-3" /> Programado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Hand className="w-3 h-3" /> Manual
          </span>
        );
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s > 0 ? s + 's' : ''}`;
  };

  const splitDateTime = (str) => {
    if (!str) return { date: '--', time: '--' };
    const parts = str.split(' ');
    return { date: parts[0] || str, time: parts[1] || '' };
  };

  const handleExportCsv = () => {
    if (filteredHistory.length === 0) return;
    const headers = [
      'Fecha',
      'Hora Inicio',
      'Hora Fin',
      'Zona',
      'Modo',
      'Duracion (s)',
      'Humedad Inicial (%)',
      'Humedad Final (%)',
      'Consumo Simulado (L)',
      'Estado'
    ];
    const rows = filteredHistory.map((h) => {
      const start = splitDateTime(h.startTime);
      const end = splitDateTime(h.endTime);
      return [
        start.date,
        start.time,
        end.time || start.time,
        `"${getZoneName(h)}"`,
        h.triggerType,
        h.durationSec,
        h.initialMoisture,
        h.finalMoisture,
        getWaterLiters(h),
        `"${h.status || 'COMPLETADO'}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agrosmart_historial_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] sm:w-[90vw] h-[90vh] max-w-7xl rounded-2xl sm:rounded-3xl shadow-2xl border flex flex-col overflow-hidden relative"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border-panel)'
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-4 border-b shrink-0"
          style={{
            backgroundColor: 'var(--bg-subpanel)',
            borderColor: 'var(--border-panel)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(106, 153, 78, 0.16)',
                border: '1px solid rgba(106, 153, 78, 0.4)',
                color: '#6A994E'
              }}
            >
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="history-modal-title" className="text-base sm:text-lg font-extrabold text-white">
                Historial y Estadísticas
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Estadísticas de Riego, Consumo Hídrico (Simulado) y Registro Auditable de Eventos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border text-slate-400 hover:text-white cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--bg-panel)',
              borderColor: 'var(--border-panel)'
            }}
            aria-label="Cerrar Historial y Estadísticas"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Independent Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-6"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
        >
          {/* Statistical Summary Panel (Daily, Weekly, Monthly) */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Estadísticas de Riego y Consumo Hídrico (Simulado)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Resumen analítico por periodo temporal y distribución por zona de cultivo
            </p>
          </div>

          {/* Period Selector Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'TODAY', label: 'Diario (Hoy)' },
              { id: 'WEEK', label: 'Semanal (7d)' },
              { id: 'MONTH', label: 'Mensual (30d)' },
              { id: 'ALL', label: 'Histórico Total' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodFilter(p.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  periodFilter === p.id
                    ? 'bg-emerald-600 text-white shadow-sm keep-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Ciclos Ejecutados</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{stats.count}</div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">
              Auto: {stats.byMode.AUTO || 0} · Prog: {stats.byMode.SCHEDULED || 0} · Man: {stats.byMode.MANUAL || 0}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Consumo Agua (Simulado)</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
              {stats.totalLiters} <span className="text-xs font-normal text-slate-400">L</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Estimación según caudal por zona
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Tiempo Total Activo</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {formatDuration(stats.totalDurationSec)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Promedio: {stats.count > 0 ? formatDuration(Math.round(stats.totalDurationSec / stats.count)) : '0s'} / ciclo
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Ganancia Media Humedad</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              +{stats.avgDeltaMoisture}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Incremento medio por evento
            </div>
          </div>
        </div>

        {/* Consumption Breakdown by Zone */}
        {stats.byZone.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Distribución de Consumo Estimado por Zona (Simulado)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stats.byZone.map(([zName, zData]) => {
                const pct = stats.totalLiters > 0 ? Math.min(100, Math.round((zData.liters / stats.totalLiters) * 100)) : 0;
                return (
                  <div key={zName} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200 truncate">{zName}</span>
                      <span className="font-mono text-cyan-400">{zData.liters} L ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                      <span>{zData.events} eventos</span>
                      <span>{formatDuration(zData.durationSec)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* History Log Table & Filters */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Registro Auditable de Eventos de Riego ({filteredHistory.length})</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {filteredHistory.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar CSV</span>
              </button>
            )}

            {history?.length > 0 && !confirmClear && (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-rose-500/15 hover:text-rose-300 text-slate-400 rounded-xl border border-slate-700/80 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar Historial</span>
              </button>
            )}

            {confirmClear && (
              <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/40 px-2.5 py-1 rounded-xl text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-200 font-medium">¿Vaciar registros?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="px-2 py-0.5 bg-rose-600 text-white rounded-lg font-bold cursor-pointer keep-white"
                >
                  Sí, borrar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-400" /> Filtrar por Zona:
            </label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
            >
              <option value="ALL">Todas las Zonas</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Modo de Operación:
            </label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
            >
              <option value="ALL">Todos los Modos</option>
              <option value="AUTO">Automático (AUTO)</option>
              <option value="SCHEDULED">Programado (SCHEDULED)</option>
              <option value="MANUAL">Manual (MANUAL)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Desde Fecha:
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Hasta Fecha:
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono outline-none"
            />
          </div>
        </div>

        {/* Mobile Card View (< sm) */}
        <div className="block sm:hidden space-y-2.5">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((h) => {
              const start = splitDateTime(h.startTime);
              const end = splitDateTime(h.endTime);
              const liters = getWaterLiters(h);
              return (
                <div
                  key={h.id}
                  className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{getZoneName(h)}</span>
                    {getTriggerBadge(h.triggerType)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {start.date} ({start.time} → {end.time || start.time})
                    </span>
                    <span className="text-cyan-400 font-bold">{formatDuration(h.durationSec)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-400">{h.initialMoisture}%</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-emerald-400 font-bold">{h.finalMoisture}%</span>
                    </div>
                    <span className="text-cyan-300 flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> {liters} L (Sim.)
                    </span>
                    <span className="text-emerald-400 text-[10px] font-sans font-semibold">
                      {h.status || 'COMPLETADO'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No se encontraron eventos de riego con los filtros seleccionados.
            </div>
          )}
        </div>

        {/* Desktop Table View (>= sm) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Inicio → Fin</th>
                <th className="py-3 px-3">Zona</th>
                <th className="py-3 px-3">Modo</th>
                <th className="py-3 px-3">Duración</th>
                <th className="py-3 px-3">Humedad (Ini → Fin)</th>
                <th className="py-3 px-3">Consumo (Sim.)</th>
                <th className="py-3 px-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((h) => {
                  const start = splitDateTime(h.startTime);
                  const end = splitDateTime(h.endTime);
                  const liters = getWaterLiters(h);
                  const isCut = (h.status || '').toUpperCase().includes('CORTE');

                  return (
                    <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-200">{start.date}</td>
                      <td className="py-3 px-3 text-slate-300">
                        {start.time} <span className="text-slate-500">→</span> {end.time || start.time}
                      </td>
                      <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                        {getZoneName(h)}
                      </td>
                      <td className="py-3 px-3 font-sans">{getTriggerBadge(h.triggerType)}</td>
                      <td className="py-3 px-3 text-cyan-400 font-semibold">
                        {formatDuration(h.durationSec)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-rose-400">{h.initialMoisture}%</span>
                        <span className="text-slate-500 mx-1.5">→</span>
                        <span className="text-emerald-400 font-bold">{h.finalMoisture}%</span>
                      </td>
                      <td className="py-3 px-3 text-cyan-300 font-semibold">
                        {liters} L
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            isCut ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {h.status || 'COMPLETADO'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-sans">
                    No se encontraron eventos de riego para los criterios actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
