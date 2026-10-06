import React, { useState } from 'react';
import { PieChart, Info, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ValidationOverviewChartProps {
  totalRecords: number;
  validRecords: number;
  errorsCount: number;
  warningsCount: number;
}

export const ValidationOverviewChart: React.FC<ValidationOverviewChartProps> = ({
  totalRecords,
  validRecords,
  errorsCount,
  warningsCount,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const safeTotal = totalRecords > 0 ? totalRecords : 1;
  const validPct = ((validRecords / safeTotal) * 100);
  const errorsPct = ((errorsCount / safeTotal) * 100);
  const warningsPct = ((warningsCount / safeTotal) * 100);

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  // Stroke offsets
  const validLength = (validPct / 100) * circumference;
  const errorsLength = (errorsPct / 100) * circumference;
  const warningsLength = (warningsPct / 100) * circumference;

  const validOffset = 0;
  const errorsOffset = -validLength;
  const warningsOffset = -(validLength + errorsLength);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-5 flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#0B3520]" />
          <h2 className="text-base font-bold text-gray-900">Validation Overview</h2>
        </div>
        <span className="text-[11px] font-mono text-gray-400">Dataset Distribution</span>
      </div>

      {/* Donut Visualizer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-gray-100"
              strokeWidth="18"
              stroke="currentColor"
              fill="transparent"
            />

            {/* Valid Records Arc */}
            {validLength > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#10B981"
                strokeWidth={hoveredSegment === 'valid' ? '22' : '18'}
                strokeDasharray={`${validLength} ${circumference}`}
                strokeDashoffset={validOffset}
                fill="transparent"
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('valid')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            )}

            {/* Errors Arc */}
            {errorsLength > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#EF4444"
                strokeWidth={hoveredSegment === 'errors' ? '22' : '18'}
                strokeDasharray={`${errorsLength} ${circumference}`}
                strokeDashoffset={errorsOffset}
                fill="transparent"
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('errors')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            )}

            {/* Warnings Arc */}
            {warningsLength > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#F59E0B"
                strokeWidth={hoveredSegment === 'warnings' ? '22' : '18'}
                strokeDasharray={`${warningsLength} ${circumference}`}
                strokeDashoffset={warningsOffset}
                fill="transparent"
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('warnings')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            )}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight leading-none">
              {hoveredSegment === 'valid'
                ? validRecords.toLocaleString()
                : hoveredSegment === 'errors'
                ? errorsCount.toLocaleString()
                : hoveredSegment === 'warnings'
                ? warningsCount.toLocaleString()
                : totalRecords.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">
              {hoveredSegment === 'valid'
                ? 'Valid Records'
                : hoveredSegment === 'errors'
                ? 'Errors'
                : hoveredSegment === 'warnings'
                ? 'Warnings'
                : 'Total Records'}
            </span>
          </div>
        </div>

        {/* Legend with exact count and percentages */}
        <div className="space-y-2.5 w-full sm:w-auto text-xs">
          {/* Valid */}
          <div
            onMouseEnter={() => setHoveredSegment('valid')}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`p-2 rounded-xl transition-all border flex items-center justify-between gap-4 cursor-pointer ${
              hoveredSegment === 'valid' ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50/70 border-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold text-gray-800">Valid Records</span>
            </div>
            <div className="text-right font-mono">
              <span className="font-bold text-gray-900">{validRecords.toLocaleString()}</span>
              <span className="text-gray-500 text-[11px] ml-1.5">({validPct.toFixed(2)}%)</span>
            </div>
          </div>

          {/* Errors */}
          <div
            onMouseEnter={() => setHoveredSegment('errors')}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`p-2 rounded-xl transition-all border flex items-center justify-between gap-4 cursor-pointer ${
              hoveredSegment === 'errors' ? 'bg-red-50 border-red-300' : 'bg-gray-50/70 border-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <span className="font-bold text-gray-800">Errors</span>
            </div>
            <div className="text-right font-mono">
              <span className="font-bold text-red-600">{errorsCount.toLocaleString()}</span>
              <span className="text-gray-500 text-[11px] ml-1.5">({errorsPct.toFixed(2)}%)</span>
            </div>
          </div>

          {/* Warnings */}
          <div
            onMouseEnter={() => setHoveredSegment('warnings')}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`p-2 rounded-xl transition-all border flex items-center justify-between gap-4 cursor-pointer ${
              hoveredSegment === 'warnings' ? 'bg-amber-50 border-amber-300' : 'bg-gray-50/70 border-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span className="font-bold text-gray-800">Warnings</span>
            </div>
            <div className="text-right font-mono">
              <span className="font-bold text-amber-700">{warningsCount.toLocaleString()}</span>
              <span className="text-gray-500 text-[11px] ml-1.5">({warningsPct.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Compliance Callout */}
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 flex items-center justify-between">
        <span className="font-medium">ML Processing Threshold:</span>
        <span className={`font-mono font-bold ${errorsCount === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {errorsCount === 0 ? '✓ Ready (0 Blocking Errors)' : '✕ Blocked (Errors > 0)'}
        </span>
      </div>
    </div>
  );
};
