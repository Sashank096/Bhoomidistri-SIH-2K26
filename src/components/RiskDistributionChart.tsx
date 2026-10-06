import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';

interface RiskDistributionChartProps {
  lowCount?: number;
  mediumCount?: number;
  highCount?: number;
  criticalCount?: number;
  onSelectCategory?: (category: 'Low' | 'Medium' | 'High' | 'Critical') => void;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  lowCount = 0,
  mediumCount = 0,
  highCount = 0,
  criticalCount = 0,
  onSelectCategory,
}) => {
  const total = lowCount + mediumCount + highCount + criticalCount;

  const lowPct = total > 0 ? (lowCount / total) * 100 : 0;
  const medPct = total > 0 ? (mediumCount / total) * 100 : 0;
  const highPct = total > 0 ? (highCount / total) * 100 : 0;
  const critPct = total > 0 ? (criticalCount / total) * 100 : 0;

  const data = [
    { label: 'Low', count: lowCount, percent: `${lowPct.toFixed(1)}%`, color: '#22C55E', note: 'Normal progress' },
    { label: 'Medium', count: mediumCount, percent: `${medPct.toFixed(1)}%`, color: '#EAB308', note: 'Requires monitoring' },
    { label: 'High', count: highCount, percent: `${highPct.toFixed(1)}%`, color: '#F97316', note: 'Requires intervention' },
    { label: 'Critical', count: criticalCount, percent: `${critPct.toFixed(1)}%`, color: '#DC2626', note: 'Immediate attention' },
  ];

  const circumference = 377;
  const lowDash = (lowPct / 100) * circumference;
  const medDash = (medPct / 100) * circumference;
  const highDash = (highPct / 100) * circumference;
  const critDash = (critPct / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[300px]">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-gray-900 leading-tight">
          Risk Distribution
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Current risk classification across active projects
        </p>
      </div>

      {total === 0 ? (
        <div className="my-auto py-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-2.5 shadow-2xs">
            <PieIcon className="w-6 h-6 stroke-[1.6]" />
          </div>
          <p className="text-xs font-bold text-gray-700">No Projects to Classify</p>
          <p className="text-[11px] text-gray-400 max-w-xs mt-0.5">
            Risk tiers will populate automatically as soon as projects are created and evaluated by the ML model.
          </p>
        </div>
      ) : (
        /* Middle Section: Donut + Right-aligned legend */
        <div className="my-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Donut Chart with Center Text */}
          <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#F3F4F6"
                strokeWidth="20"
              />
              {lowCount > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#22C55E"
                  strokeWidth="20"
                  strokeDasharray={`${lowDash} ${circumference - lowDash}`}
                  strokeDashoffset="0"
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => onSelectCategory?.('Low')}
                />
              )}
              {mediumCount > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#EAB308"
                  strokeWidth="20"
                  strokeDasharray={`${medDash} ${circumference - medDash}`}
                  strokeDashoffset={`-${lowDash}`}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => onSelectCategory?.('Medium')}
                />
              )}
              {highCount > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#F97316"
                  strokeWidth="20"
                  strokeDasharray={`${highDash} ${circumference - highDash}`}
                  strokeDashoffset={`-${lowDash + medDash}`}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => onSelectCategory?.('High')}
                />
              )}
              {criticalCount > 0 && (
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#DC2626"
                  strokeWidth="20"
                  strokeDasharray={`${critDash} ${circumference - critDash}`}
                  strokeDashoffset={`-${lowDash + medDash + highDash}`}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => onSelectCategory?.('Critical')}
                />
              )}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-gray-900 leading-none">
                {total}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">
                Projects
              </span>
            </div>
          </div>

          {/* Right Side Stat Bars / Legend */}
          <div className="flex-1 w-full space-y-2.5">
            {data.map((item) => (
              <div
                key={item.label}
                onClick={() => onSelectCategory?.(item.label as any)}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800 leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {item.note}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-gray-900 block leading-tight">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {item.percent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Target: 0% Critical Risk Projects</span>
        <span className="font-semibold text-[#0B3520]">
          Total Evaluated: {total}
        </span>
      </div>
    </div>
  );
};
