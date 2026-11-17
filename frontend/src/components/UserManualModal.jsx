import React from 'react';
import {
  BookOpen,
  X,
  Server,
  Layers,
  ShieldCheck,
  Droplets,
  CheckCircle2,
  FlaskConical,
  BarChart3
} from 'lucide-react';

export default function UserManualModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-bold text-white">
                Manual Técnico y Operativo — AgroSmart IoT
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Guía de Automatización, Seguridad, Estadísticas y Laboratorio de Simulación
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
            aria-label="Cerrar manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Algoritmo de Control por Histéresis y Cooldown */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4" /> 1. Algoritmo de Control por Histéresis y Anti-Rebote (Cooldown)
            </h4>
            <p className="mb-2">
              Para evitar encendidos y apagados frecuentes de la bomba simulada ante pequeñas variaciones de lectura, el motor de automatización opera con tres parámetros clave:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-[11px]">
              <li>
                <strong>Humedad Mínima (Hmín):</strong> Cuando la humedad simulada cae por debajo de este límite en modo <code>AUTO</code>, la bomba se enciende automáticamente (siempre que el tanque y el sensor estén operativos).
              </li>
              <li>
                <strong>Humedad Máxima (Hmáx):</strong> Al alcanzar o superar este nivel, el riego se detiene automáticamente y registra el ciclo real en el historial.
              </li>
              <li>
                <strong>Espera de Seguridad (Cooldown):</strong> Tras apagar la bomba, se aplica un tiempo mínimo de enfriamiento configurable (ej. 30 s) antes de permitir un nuevo arranque automático.
              </li>
            </ul>
          </div>

          {/* Section 2: Modos de Operación sin Conflictos */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4" /> 2. Modos de Operación y Prevención de Conflictos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-emerald-400 block mb-1">Automático (AUTO)</strong>
                Evalúa continuamente la humedad frente a los umbrales Hmín y Hmáx con prioridad de seguridad.
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-amber-400 block mb-1">Manual (MANUAL)</strong>
                Permite al operador encender o detener la bomba directamente. Si se fuerza manualmente en contra del umbral activo, conmuta a modo Manual para evitar conflictos.
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-blue-400 block mb-1">Programado (SCHEDULED)</strong>
                Ejecuta turnos por días y hora respetando la duración individual de cada programación sin duplicar ejecuciones.
              </div>
            </div>
          </div>

          {/* Section 3: Seguridad Operativa y Alertas */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" /> 3. Protecciones de Seguridad y Alertas Inteligentes
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Protección por Nivel Bajo de Tanque:</strong> Bloquea el encendido de la bomba o detiene inmediatamente cualquier riego en curso si el depósito simulado se queda sin agua.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Detección de Sensor Desconectado:</strong> Genera una alerta crítica y detiene el riego automático si el sensor simulado pierde señal.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Watchdog Timer y Anomalías de Consumo:</strong> Corta el bombeo si se supera el tiempo máximo permitido y alerta si la bomba está activa sin que incremente la humedad del suelo.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 4: Laboratorio de Simulación y Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-1.5">
                <FlaskConical className="w-4 h-4" /> 4. Laboratorio de Simulación
              </h4>
              <p className="text-[11px] text-slate-300">
                Ubicado en la pestaña <strong>Simulación y Diagnóstico</strong>, permite variar la humedad (0–100%), activar el ciclo continuo de evaporación/hidratación e inyectar fallos de tanque, sensor o fugas sin mezclar controles de prueba con la operación normal.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-1.5">
                <BarChart3 className="w-4 h-4" /> 5. Historial y Persistencia
              </h4>
              <p className="text-[11px] text-slate-300">
                Cada ciclo registra fecha, hora de inicio/fin, humedad inicial/final real, duración y consumo estimado en litros (simulado). Todos los datos se persisten automáticamente en disco (<code>backend/data/agrosmart-store.json</code>) y en almacenamiento local.
              </p>
            </div>
          </div>

          {/* Section 5: Ejecución */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 font-mono text-[11px]">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2 font-sans">
              <Server className="w-4 h-4" /> 6. Comandos de Ejecución del Proyecto
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-slate-400 font-sans mb-1">1. Iniciar Frontend (React 19 + Vite):</p>
                <code className="block bg-slate-900 p-2.5 rounded-lg text-emerald-400">
                  npm run frontend
                </code>
              </div>
              <div>
                <p className="text-slate-400 font-sans mb-1">2. Iniciar Backend (Spring Boot 3.3):</p>
                <code className="block bg-slate-900 p-2.5 rounded-lg text-cyan-400">
                  npm run backend
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow cursor-pointer transition-all keep-white"
          >
            Entendido, Cerrar Manual
          </button>
        </div>
      </div>
    </div>
  );
}
