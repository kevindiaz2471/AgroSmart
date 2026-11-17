import React, { useState } from 'react';
import { Activity, Pause, Play, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TelemetryChart({ zone }) {
  const [paused, setPaused] = useState(false);
  const [frozenPoints, setFrozenPoints] = useState(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const rawPoints =
    Array.isArray(zone?.moistureHistory) && zone.moistureHistory.length > 0
      ? zone.moistureHistory
      : [{ time: 'Actual', moisture: zone?.currentMoisture ?? 45, pumpState: zone?.pumpState ?? false }];

  const points = paused && frozenPoints ? frozenPoints : rawPoints;

  const handleTogglePause = () => {
    if (!paused) {
      setFrozenPoints([...rawPoints]);
      setPaused(true);
    } else {
      setFrozenPoints(null);
      setPaused(false);
    }
  };

  const minThreshold = zone?.minMoisture ?? 30;
  const maxThreshold = zone?.maxMoisture ?? 70;

  const values = points.map((p) => Number(p.moisture) || 0);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const avgVal = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const delta = values.length > 1 ? values[values.length - 1] - values[0] : 0;

  const width = 640;
  const height = 215;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (idx) => {
    if (points.length <= 1) return padLeft + plotW / 2;
    return padLeft + (idx / (points.length - 1)) * plotW;
  };

  const getY = (val) => {
    const clamped = Math.max(0, Math.min(100, val));
    return padTop + plotH - (clamped / 100) * plotH;
  };

  const lineCoords = points.map((p, i) => `${getX(i).toFixed(1)},${getY(p.moisture).toFixed(1)}`).join(' ');
  const areaPath =
    points.length > 1
      ? `M ${getX(0).toFixed(1)},${(padTop + plotH).toFixed(1)} L ${points
          .map((p, i) => `${getX(i).toFixed(1)},${getY(p.moisture).toFixed(1)}`)
          .join(' L ')} L ${getX(points.length - 1).toFixed(1)},${(padTop + plotH).toFixed(1)} Z`
      : '';

  const yMinThresh = getY(minThreshold);
  const yMaxThresh = getY(maxThreshold);

  const activePoint = hoverIdx !== null && points[hoverIdx] ? points[hoverIdx] : points[points.length - 1];

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: '#6A994E' }} />
            <span>Curva de Humedad del Cultivo en Tiempo Real</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo continuo ({zone?.name}) — Rango óptimo de cultivo: {minThreshold}% a {maxThreshold}%
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center gap-2">
            <span className="text-slate-400">Valor:</span>
            <span className="font-bold" style={{ color: '#6A994E' }}>{activePoint?.moisture}%</span>
            <span className="text-slate-400">({activePoint?.time})</span>
          </div>

          <button
            type="button"
            onClick={handleTogglePause}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors"
            style={
              paused
                ? {
                    backgroundColor: 'rgba(233, 162, 59, 0.2)',
                    borderColor: '#E9A23B',
                    color: '#B87543'
                  }
                : {
                    backgroundColor: 'var(--bg-subpanel)',
                    borderColor: 'var(--border-panel)',
                    color: 'var(--text-main)'
                  }
            }
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{paused ? 'Reanudar' : 'Pausar'}</span>
          </button>
        </div>
      </div>

      {/* SVG Area Chart */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950/70 border border-slate-800 p-2.5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 select-none"
          role="img"
          aria-label={`Gráfico de evolución de humedad para ${zone?.name}`}
        >
          <defs>
            <linearGradient id="agroAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6A994E" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#A7C957" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(82, 96, 82, 0.16)"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#526052"
                  className="text-[10px] font-mono font-semibold"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Optimal Hysteresis Band Highlight */}
          <rect
            x={padLeft}
            y={yMaxThresh}
            width={plotW}
            height={Math.max(2, yMinThresh - yMaxThresh)}
            fill="rgba(167, 201, 87, 0.12)"
          />

          {/* Max Threshold Line */}
          <line
            x1={padLeft}
            y1={yMaxThresh}
            x2={width - padRight}
            y2={yMaxThresh}
            stroke="#2A9D8F"
            strokeWidth="1.4"
            strokeDasharray="5 4"
          />
          <text
            x={width - padRight - 4}
            y={yMaxThresh - 4}
            textAnchor="end"
            fill="#2A9D8F"
            className="text-[9px] font-mono font-bold"
          >
            Hmáx {maxThreshold}%
          </text>

          {/* Min Threshold Line */}
          <line
            x1={padLeft}
            y1={yMinThresh}
            x2={width - padRight}
            y2={yMinThresh}
            stroke="#D9534F"
            strokeWidth="1.4"
            strokeDasharray="5 4"
          />
          <text
            x={width - padRight - 4}
            y={yMinThresh + 11}
            textAnchor="end"
            fill="#D9534F"
            className="text-[9px] font-mono font-bold"
          >
            Hmín {minThreshold}%
          </text>

          {/* Area & Line */}
          {areaPath && <path d={areaPath} fill="url(#agroAreaGrad)" />}

          {points.length > 1 && (
            <polyline
              fill="none"
              stroke="#6A994E"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={lineCoords}
            />
          )}

          {/* Points */}
          {points.map((pt, idx) => {
            const cx = getX(idx);
            const cy = getY(pt.moisture);
            const isLow = pt.moisture < minThreshold;
            const isHigh = pt.moisture > maxThreshold;
            const dotColor = isLow ? '#D9534F' : isHigh ? '#2A9D8F' : '#6A994E';

            return (
              <g
                key={`${pt.time}-${idx}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={hoverIdx === idx ? 5.5 : 3.8}
                  fill={dotColor}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                {(idx === 0 || idx === points.length - 1 || idx % 4 === 0) && (
                  <text
                    x={cx}
                    y={height - 7}
                    textAnchor="middle"
                    fill="#526052"
                    className="text-[9px] font-mono font-medium"
                  >
                    {pt.time.slice(0, 5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 font-medium">Mínimo:</span>
          <span className="font-mono font-bold" style={{ color: '#D9534F' }}>{minVal}%</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 font-medium">Máximo:</span>
          <span className="font-mono font-bold" style={{ color: '#2A9D8F' }}>{maxVal}%</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 font-medium">Promedio:</span>
          <span className="font-mono font-bold" style={{ color: '#6A994E' }}>{avgVal}%</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 font-medium">Variación:</span>
          <span
            className="font-mono font-bold flex items-center gap-1"
            style={{ color: delta > 0 ? '#6A994E' : delta < 0 ? '#B87543' : '#526052' }}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : delta < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            {delta > 0 ? `+${delta}%` : `${delta}%`}
          </span>
        </div>
      </div>
    </div>
  );
}
