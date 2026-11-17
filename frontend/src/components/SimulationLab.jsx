import React from 'react';
import {
  FlaskConical,
  Sliders,
  Play,
  Pause,
  Droplets,
  Wifi,
  WifiOff,
  AlertOctagon,
  CheckCircle2,
  Zap,
  ShieldAlert,
  RotateCcw,
  Sprout,
  Leaf,
  Activity,
  Gauge
} from 'lucide-react';

export default function SimulationLab({
  zone,
  onMoistureChange,
  isAutoSimulating,
  onToggleAutoSim,
  simulateLeakAnomaly,
  onToggleLeakAnomaly,
  onToggleTank,
  onToggleSensor,
  onResetZoneDefaults
}) {
  if (!zone) return null;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-emerald-500/30 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Laboratorio de Simulación y Diagnóstico
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Entorno Simulado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Controles de prueba aislados del panel operativo para inyectar telemetría, evaluar histéresis y verificar protecciones en <strong>{zone.name}</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetZoneDefaults}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Restablecer Condiciones Óptimas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Moisture Simulator & Presets */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              1. Simulador de Humedad del Suelo
            </span>
            <span className="font-mono text-sm font-black text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {zone.currentMoisture}%
            </span>
          </div>

          <div>
            <input
              type="range"
              min="0"
              max="100"
              value={zone.currentMoisture}
              onChange={(e) => onMoistureChange(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              aria-label="Deslizador de humedad simulada"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>0% (Seco Extremo)</span>
              <span className="text-rose-400">Hmín: {zone.minMoisture}%</span>
              <span className="text-cyan-400">Hmáx: {zone.maxMoisture}%</span>
              <span>100% (Saturado)</span>
            </div>
          </div>

          {/* Preset Scenarios */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 block">Escenarios rápidos de prueba:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onMoistureChange(Math.max(5, zone.minMoisture - 8))}
                className="py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Suelo Seco ({Math.max(5, zone.minMoisture - 8)}%)
              </button>
              <button
                type="button"
                onClick={() => onMoistureChange(Math.round((zone.minMoisture + zone.maxMoisture) / 2))}
                className="py-2 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Nivel Óptimo ({Math.round((zone.minMoisture + zone.maxMoisture) / 2)}%)
              </button>
              <button
                type="button"
                onClick={() => onMoistureChange(Math.min(98, zone.maxMoisture + 6))}
                className="py-2 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Saturación ({Math.min(98, zone.maxMoisture + 6)}%)
              </button>
            </div>
          </div>

          {/* Dynamic Simulation Loop Controls */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Ciclo Dinámico Continuo (Evaporación / Riego)
              </div>
              <p className="text-[11px] text-slate-400">
                Baja la humedad cuando la bomba está apagada y la incrementa cuando riega.
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleAutoSim}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all ${
                isAutoSimulating
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 keep-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 keep-white'
              }`}
            >
              {isAutoSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isAutoSimulating ? 'Detener Simulación Continua' : 'Iniciar Simulación Continua'}</span>
            </button>
          </div>
        </div>

        {/* 2. Fault & Safety Injection Panel */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            2. Inyección de Fallos y Seguridad
          </span>

          {/* Tank Level Fault */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
            <div className="text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                {zone.tankOk ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                )}
                <span>Nivel de Tanque Simulado</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Estado: <strong className={zone.tankOk ? 'text-emerald-400' : 'text-rose-400'}>
                  {zone.tankOk ? 'Óptimo (Con Agua)' : 'Crítico (Tanque Vacío)'}
                </strong>
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTank}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer shrink-0 transition-colors ${
                zone.tankOk
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {zone.tankOk ? 'Simular Tanque Vacío' : 'Rellenar Tanque'}
            </button>
          </div>

          {/* Sensor Connection Fault */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
            <div className="text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                {zone.sensorOk ? (
                  <Wifi className="w-4 h-4 text-emerald-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-rose-400" />
                )}
                <span>Sensor de Humedad Simulado</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Estado: <strong className={zone.sensorOk ? 'text-emerald-400' : 'text-rose-400'}>
                  {zone.sensorOk ? 'En Línea (Conectado)' : 'Desconectado (Fallo)'}
                </strong>
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleSensor}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer shrink-0 transition-colors ${
                zone.sensorOk
                  ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {zone.sensorOk ? 'Desconectar Sensor' : 'Reconectar Sensor'}
            </button>
          </div>

          {/* Water Consumption Anomaly / Leak Simulation */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
            <div className="text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Droplets className={`w-4 h-4 ${simulateLeakAnomaly ? 'text-amber-400' : 'text-cyan-400'}`} />
                <span>Anomalía de Infiltración / Fuga</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {simulateLeakAnomaly
                  ? 'Activa: La bomba consume agua sin subir humedad.'
                  : 'Normal: El riego hidrata el suelo normalmente.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleLeakAnomaly}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer shrink-0 transition-colors ${
                simulateLeakAnomaly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {simulateLeakAnomaly ? 'Desactivar Fuga' : 'Simular Fuga'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Resumen Agronómico del Suelo y Estado Hídrico para el Agricultor */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-emerald-400" />
            3. Diagnóstico Agronómico del Suelo y Recomendación de Campo
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border self-start sm:self-auto ${
              zone.currentMoisture < zone.minMoisture
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : zone.currentMoisture >= zone.maxMoisture
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {zone.currentMoisture < zone.minMoisture
              ? 'Déficit Hídrico (Riego Requerido)'
              : zone.currentMoisture >= zone.maxMoisture
              ? 'Capacidad de Campo Alcanzada'
              : 'Humedad en Rango Óptimo'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Condición del Cultivo</span>
            </div>
            <p className="text-xs font-bold text-slate-200 mt-1 truncate">
              {zone.cropType || 'Horticultura General'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {zone.currentMoisture < zone.minMoisture
                ? 'Las raíces requieren hidratación para evitar estrés hídrico.'
                : zone.currentMoisture >= zone.maxMoisture
                ? 'Humedad óptima alcanzada. Se previene saturación y asfixia radicular.'
                : 'Nivel adecuado de agua disponible en el perfil del suelo.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Estado de Automatización</span>
            </div>
            <p className="text-xs font-bold text-slate-200 mt-1 truncate">
              {zone.mode === 'AUTO'
                ? zone.pumpState
                  ? 'Riego Automático Activo'
                  : 'Modo Auto en Vigilancia'
                : `Modo: ${zone.mode}`}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {zone.mode === 'AUTO'
                ? `Ciclo regulado entre ${zone.minMoisture}% (inicio) y ${zone.maxMoisture}% (parada).`
                : 'Operación sujeta a horarios programados o intervención manual.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>Eficiencia y Caudal Calibrado</span>
            </div>
            <p className="text-xs font-bold text-slate-200 mt-1 font-mono">
              {zone.flowRateLpm || 12.0} L/min · Máx {zone.maxDurationMin || 15}m
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Caudal por goteo calibrado con protección Watchdog anti-desperdicio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
