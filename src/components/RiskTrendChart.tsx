import React, { useState } from 'react';
import { TrendingUp, LineChart as LineIcon } from 'lucide-react';

export interface TrendDataPoint {
  date: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

interface RiskTrendChartProps {
  dates?: TrendDataPoint[];
}

export const RiskTrendChart: React.FC<RiskTrendChartProps> = ({
  dates = [],
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 400;
  const height = 180;
  const padLeft = 35;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const maxVal = Math.max(
    5,
    ...dates.map((d) => Math.max(d.low, d.medium, d.high, d.critical, 0))
  );

  const getX = (idx: number) =>
    dates.length > 1 ? padLeft + (idx / (dates.length - 1)) * chartW : padLeft + chartW / 2;
  const getY = (val: number) => padTop + chartH - (val / maxVal) * chartH;

  const series = [
    { key: 'low' as const, color: '#22C55E', label: 'Low' },
    { key: 'medium' as const, color: '#EAB308', label: 'Medium' },
    { key: 'high' as const, color: '#F97316', label: 'High' },
    { key: 'critical' as const, color: '#DC2626', label: 'Critical' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[300px]">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            Risk Trend (Last 30 Days)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Trend of project risk levels over the last 30 days
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-gray-600 font-medium text-[11px]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="my-auto py-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-2.5 shadow-2xs">
            <LineIcon className="w-6 h-6 stroke-[1.6]" />
          </div>
          <p className="text-xs font-bold text-gray-700">No Historical Trend Data</p>
          <p className="text-[11px] text-gray-400 max-w-xs mt-0.5">
            Historical progression and temporal risk shifts will display once periodic snapshots are logged.
          </p>
        </div>
      ) : (
        /* SVG Chart Container */
        <div className="relative my-2 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            {[0, 2, 4, 6, 8].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#F3F4F6"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-gray-400 font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {dates.map((d, i) => (
              <text
                key={d.date}
                x={getX(i)}
                y={height - 8}
                textAnchor="middle"
                className="text-[9px] fill-gray-400 font-medium"
              >
                {d.date}
              </text>
            ))}

            {series.map((s) => (
              <g key={s.key}>
                <path
                  d={dates
                    .map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(d[s.key])}`)
                    .join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {dates.map((d, i) => (
                  <circle
                    key={`${s.key}-${i}`}
                    cx={getX(i)}
                    cy={getY(d[s.key])}
                    r={hoveredIndex === i ? 4.5 : 3}
                    fill={s.color}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                ))}
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1 text-emerald-600 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time continuous model evaluation</span>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">
          Updated: Live
        </span>
      </div>
    </div>
  );
};
