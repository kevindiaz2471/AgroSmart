import React, { useState, useEffect } from 'react';
import {
  Waves,
  Power,
  ShieldAlert,
  CheckCircle,
  AlertOctagon,
  Droplet,
  Gauge
} from 'lucide-react';

export default function PumpControl({
  zone,
  pumpState,
  onTogglePump,
  maxDurationMin,
  tankOk
}) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    const updateTimers = () => {
      if (pumpState && zone?.pumpStartTime) {
        const sec = Math.max(0, Math.floor((Date.now() - zone.pumpStartTime) / 1000));
        setElapsedSec(sec);
      } else {
        setElapsedSec(0);
      }

      if (!pumpState && zone?.lastPumpStopTime && (zone?.cooldownSec || 30) > 0) {
        const cdTotal = zone.cooldownSec || 30;
        const passed = Math.floor((Date.now() - zone.lastPumpStopTime) / 1000);
        setCooldownRemainingSec(Math.max(0, cdTotal - passed));
      } else {
        setCooldownRemainingSec(0);
      }
    };

    updateTimers();
    const timer = setInterval(updateTimers, 1000);
    return () => clearInterval(timer);
  }, [pumpState, zone?.pumpStartTime, zone?.lastPumpStopTime, zone?.cooldownSec]);

  const formatMMSS = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const flowLpm = zone?.flowRateLpm || 12.0;
  const liveLiters = ((elapsedSec / 60) * flowLpm).toFixed(1);

  const handleManualAction = async (targetState) => {
    setFeedbackMsg('');
    if (targetState && !tankOk) {
      setFeedbackMsg('Acción bloqueada: El tanque de agua tiene nivel bajo.');
      return;
    }
    try {
      const reason = targetState ? 'Activación manual por operador' : 'Detención manual por operador';
      await onTogglePump(targetState, reason, null, 'MANUAL');
    } catch (err) {
      setFeedbackMsg(err.message || 'No se pudo accionar la bomba.');
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Waves className="w-4 h-4 shrink-0" style={{ color: '#2A9D8F' }} />
          <span>Control de Bomba y Riego</span>
        </h3>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0"
          style={
            !tankOk
              ? {
                  backgroundColor: 'rgba(217, 83, 79, 0.14)',
                  borderColor: 'rgba(217, 83, 79, 0.45)',
                  color: '#D9534F'
                }
              : pumpState
              ? {
                  backgroundColor: 'rgba(42, 157, 143, 0.15)',
                  borderColor: 'rgba(42, 157, 143, 0.45)',
                  color: '#218377'
                }
              : cooldownRemainingSec > 0
              ? {
                  backgroundColor: 'rgba(233, 162, 59, 0.16)',
                  borderColor: 'rgba(233, 162, 59, 0.5)',
                  color: '#B87543'
                }
              : {
                  backgroundColor: 'rgba(82, 96, 82, 0.12)',
                  borderColor: 'rgba(82, 96, 82, 0.3)',
                  color: '#526052'
                }
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${pumpState ? 'animate-ping' : ''}`}
            style={{
              backgroundColor: !tankOk
                ? '#D9534F'
                : pumpState
                ? '#2A9D8F'
                : cooldownRemainingSec > 0
                ? '#E9A23B'
                : '#6A994E'
            }}
          ></span>
          <span>
            {!tankOk
              ? 'TANQUE BAJO'
              : pumpState
              ? `REGANDO (${formatMMSS(elapsedSec)})`
              : cooldownRemainingSec > 0
              ? `ESPERA (${cooldownRemainingSec}s)`
              : 'EN ESPERA'}
          </span>
        </span>
      </div>

      {/* Visualizer Circle */}
      <div
        className="relative w-40 h-40 sm:w-44 sm:h-44 mx-auto my-2 rounded-full border-4 overflow-hidden shadow-inner flex flex-col items-center justify-center"
        style={{
          borderColor: pumpState ? '#2A9D8F' : 'var(--border-panel)',
          backgroundColor: pumpState ? '#1D4E48' : 'var(--bg-subpanel)'
        }}
      >
        {pumpState ? (
          <>
            <div
              className="absolute bottom-0 left-0 right-0 h-28 opacity-70 rounded-[40%] water-wave-1"
              style={{ background: 'linear-gradient(180deg, #2A9D8F 0%, #244C36 100%)' }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-28 opacity-55 rounded-[45%] water-wave-2"
              style={{ background: 'linear-gradient(180deg, #6A994E 0%, #2A9D8F 100%)' }}
            />

            <div className="relative z-10 flex flex-col items-center keep-white">
              <Droplet className="w-8 h-8 animate-bounce mb-0.5 keep-white" />
              <span className="text-xl font-black font-mono tracking-tight keep-white">
                {formatMMSS(elapsedSec)}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider keep-white">
                ~{liveLiters} L aplicados
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <Power className="w-10 h-10 mb-1 stroke-1" style={{ color: '#6A994E' }} />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
              Bomba Detenida
            </span>
            {cooldownRemainingSec > 0 && (
              <span className="text-[11px] font-mono font-semibold mt-1" style={{ color: '#B87543' }}>
                Enfriamiento: {cooldownRemainingSec}s
              </span>
            )}
          </div>
        )}
      </div>

      {/* Validation Banner */}
      {feedbackMsg && (
        <div
          className="mb-2 px-3 py-1.5 rounded-xl border text-xs font-semibold text-center"
          style={{
            backgroundColor: 'rgba(217, 83, 79, 0.12)',
            borderColor: 'rgba(217, 83, 79, 0.35)',
            color: '#D9534F'
          }}
        >
          {feedbackMsg}
        </div>
      )}

      {/* Manual Control Action Buttons */}
      <div className="grid grid-cols-2 gap-3 my-2">
        <button
          type="button"
          onClick={() => handleManualAction(true)}
          disabled={pumpState || !tankOk}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            pumpState || !tankOk
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'shadow-md active:scale-[0.98] keep-white'
          }`}
          style={
            pumpState || !tankOk
              ? undefined
              : { backgroundColor: '#6A994E', color: '#FFFFFF' }
          }
        >
          <Power className="w-4 h-4 shrink-0" />
          <span>Encender Riego</span>
        </button>

        <button
          type="button"
          onClick={() => handleManualAction(false)}
          disabled={!pumpState}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            !pumpState
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'shadow-md active:scale-[0.98] keep-white'
          }`}
          style={!pumpState ? undefined : { backgroundColor: '#D9534F', color: '#FFFFFF' }}
        >
          <Power className="w-4 h-4 shrink-0" />
          <span>Detener Riego</span>
        </button>
      </div>

      {/* Safety & Operational Telemetry Footer */}
      <div className="mt-2 pt-3 border-t border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" style={{ color: '#E9A23B' }} />
            Tiempo Máximo Seguro:
          </span>
          <span className="font-mono font-bold" style={{ color: '#B87543' }}>
            {zone?.plannedDurationMin ? `${zone.plannedDurationMin} min (Turno)` : `${maxDurationMin} min`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Gauge className="w-3.5 h-3.5" style={{ color: '#2A9D8F' }} />
            Caudal / Espera:
          </span>
          <span className="font-mono font-semibold text-slate-300">
            {flowLpm} L/min · {zone?.cooldownSec || 30}s espera
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            {tankOk ? (
              <CheckCircle className="w-3.5 h-3.5" style={{ color: '#6A994E' }} />
            ) : (
              <AlertOctagon className="w-3.5 h-3.5" style={{ color: '#D9534F' }} />
            )}
            Reserva del Tanque:
          </span>
          <span
            className="font-bold"
            style={{ color: tankOk ? '#6A994E' : '#D9534F' }}
          >
            {tankOk ? 'Disponible (Normal)' : 'Nivel Bajo (Corte Activo)'}
          </span>
        </div>
      </div>
    </div>
  );
}
