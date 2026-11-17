import React, { useState } from 'react';
import { Layers, X, Plus } from 'lucide-react';

export default function ZoneModal({ isOpen, onClose, onSave, placeId }) {
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('Tomate Cherry');
  const [mode, setMode] = useState('AUTO');
  const [minMoisture, setMinMoisture] = useState(30);
  const [maxMoisture, setMaxMoisture] = useState(70);
  const [maxDurationMin, setMaxDurationMin] = useState(15);
  const [cooldownSec, setCooldownSec] = useState(30);
  const [flowRateLpm, setFlowRateLpm] = useState(12.0);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(minMoisture) >= Number(maxMoisture)) {
      setErrorMsg('La humedad mínima debe ser menor que la humedad máxima.');
      return;
    }
    setErrorMsg('');
    onSave({
      placeId,
      name,
      cropType,
      mode,
      minMoisture: Number(minMoisture),
      maxMoisture: Number(maxMoisture),
      maxDurationMin: Number(maxDurationMin),
      cooldownSec: Number(cooldownSec),
      flowRateLpm: Number(flowRateLpm),
      intervalSec: 15,
      currentMoisture: 45,
      pumpState: false,
      tankOk: true,
      sensorOk: true,
      schedules: []
    });
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-emerald-400" />
          Registrar Nueva Zona de Riego
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Nombre de la Zona</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Zona 4 - Fresas Hidropónicas"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Tipo de Cultivo</label>
              <input
                type="text"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                placeholder="Ej: Lechuga, Maíz..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Modo Inicial</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="AUTO">Automático</option>
                <option value="MANUAL">Manual</option>
                <option value="SCHEDULED">Programado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Humedad Mínima (%)</label>
              <input
                type="number"
                min="5"
                max="90"
                value={minMoisture}
                onChange={(e) => setMinMoisture(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Humedad Máxima (%)</label>
              <input
                type="number"
                min="10"
                max="99"
                value={maxMoisture}
                onChange={(e) => setMaxMoisture(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Watchdog (min)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={maxDurationMin}
                onChange={(e) => setMaxDurationMin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Espera (s)</label>
              <input
                type="number"
                min="0"
                max="300"
                value={cooldownSec}
                onChange={(e) => setCooldownSec(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Caudal (L/m)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="200"
                value={flowRateLpm}
                onChange={(e) => setFlowRateLpm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer keep-white"
            >
              <Plus className="w-4 h-4" /> Crear Zona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
