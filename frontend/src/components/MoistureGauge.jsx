import React from 'react';
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Clock,
  FlaskConical,
  Sprout
} from 'lucide-react';

export default function MoistureGauge({
  moisture,
  minMoisture,
  maxMoisture,
  sensorOk = true,
  lastTelemetryTime,
  onOpenSimLab
}) {
  // Soil moisture states per AgTech visual specification:
  // Low -> Orange/Red (#D9534F / #E9A23B), Optimal -> Leaf/Crop Green (#6A994E), High -> Teal (#2A9D8F)
  let statusText = 'Humedad Óptima';
  let badgeStyle = {
    backgroundColor: 'rgba(106, 153, 78, 0.15)',
    borderColor: 'rgba(106, 153, 78, 0.45)',
    color: '#48742C'
  };
  let strokeColor = 'url(#agroOptimalGradient)';
  let StatusIcon = CheckCircle2;

  if (!sensorOk) {
    statusText = 'Sensor Sin Señal';
    badgeStyle = {
      backgroundColor: 'rgba(217, 83, 79, 0.14)',
      borderColor: 'rgba(217, 83, 79, 0.45)',
      color: '#D9534F'
    };
    strokeColor = '#D9534F';
    StatusIcon = WifiOff;
  } else if (moisture < minMoisture) {
    statusText = 'Nivel Bajo (Requiere Riego)';
    badgeStyle = {
      backgroundColor: 'rgba(217, 83, 79, 0.14)',
      borderColor: 'rgba(233, 162, 59, 0.55)',
      color: '#C9443F'
    };
    strokeColor = 'url(#agroLowGradient)';
    StatusIcon = AlertTriangle;
  } else if (moisture > maxMoisture) {
    statusText = 'Nivel Alto (Saturación)';
    badgeStyle = {
      backgroundColor: 'rgba(42, 157, 143, 0.14)',
      borderColor: 'rgba(42, 157, 143, 0.45)',
      color: '#218377'
    };
    strokeColor = 'url(#agroHighGradient)';
    StatusIcon = Droplets;
  }

  const arcLength = 188.4;
  const clampedMoisture = Math.min(100, Math.max(0, moisture || 0));
  const strokeOffset = arcLength - (arcLength * clampedMoisture) / 100;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sprout className="w-4 h-4 shrink-0" style={{ color: '#6A994E' }} />
          <span>Humedad del Suelo</span>
        </h3>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0"
          style={badgeStyle}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusText}</span>
        </span>
      </div>

      {/* Circular SVG Gauge */}
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto my-2 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <path
            d="M 15,80 A 40,40 0 1,1 85,80"
            fill="none"
            stroke="rgba(82, 96, 82, 0.16)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 15,80 A 40,40 0 1,1 85,80"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="agroLowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D9534F" />
              <stop offset="100%" stopColor="#E9A23B" />
            </linearGradient>
            <linearGradient id="agroOptimalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6A994E" />
              <stop offset="100%" stopColor="#A7C957" />
            </linearGradient>
            <linearGradient id="agroHighGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6A994E" />
              <stop offset="100%" stopColor="#2A9D8F" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="flex items-baseline">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
              {sensorOk ? clampedMoisture : '--'}
            </span>
            <span className="text-xl font-bold text-slate-400 ml-1">%</span>
          </div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">
            Suelo Agrícola
          </span>
        </div>
      </div>

      {/* Progress / Hysteresis Band Bar */}
      <div className="my-3 space-y-1.5">
        <div className="flex justify-between text-xs font-mono font-semibold">
          <span style={{ color: '#D9534F' }}>Mín: {minMoisture}%</span>
          <span className="text-slate-400">Rango Ideal de Cultivo</span>
          <span style={{ color: '#2A9D8F' }}>Máx: {maxMoisture}%</span>
        </div>
        <div className="relative h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: `${minMoisture}%`,
              width: `${Math.max(2, maxMoisture - minMoisture)}%`,
              backgroundColor: 'rgba(167, 201, 87, 0.35)',
              borderLeft: '2px solid #D9534F',
              borderRight: '2px solid #2A9D8F'
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-2.5 rounded-full shadow transition-all duration-300"
            style={{
              left: `calc(${clampedMoisture}% - 5px)`,
              backgroundColor: '#244C36'
            }}
          />
        </div>
      </div>

      {/* Sensor Status & Last Update Footer */}
      <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            {sensorOk ? (
              <Wifi className="w-3.5 h-3.5" style={{ color: '#6A994E' }} />
            ) : (
              <WifiOff className="w-3.5 h-3.5" style={{ color: '#D9534F' }} />
            )}
            Estado del Sensor:
          </span>
          <span
            className="font-bold"
            style={{ color: sensorOk ? '#6A994E' : '#D9534F' }}
          >
            {sensorOk ? 'Conectado (Simulado)' : 'Desconectado'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5" style={{ color: '#B87543' }} />
            Última lectura:
          </span>
          <span className="font-mono text-[11px] text-slate-300 font-semibold">
            {lastTelemetryTime || 'Sincronizando...'}
          </span>
        </div>

        {onOpenSimLab && (
          <button
            type="button"
            onClick={onOpenSimLab}
            className="w-full mt-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" style={{ color: '#6A994E' }} />
            <span>Simular Lectura de Humedad</span>
          </button>
        )}
      </div>
    </div>
  );
}
