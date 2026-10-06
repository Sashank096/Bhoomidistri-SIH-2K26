import React from 'react';
import { Database, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ValidationKpiCardsProps {
  totalRecords: number;
  validRecords: number;
  errorsCount: number;
  warningsCount: number;
}

export const ValidationKpiCards: React.FC<ValidationKpiCardsProps> = ({
  totalRecords,
  validRecords,
  errorsCount,
  warningsCount,
}) => {
  const safeTotal = totalRecords > 0 ? totalRecords : 1;
  const validPct = ((validRecords / safeTotal) * 100).toFixed(2);
  const errorsPct = ((errorsCount / safeTotal) * 100).toFixed(2);
  const warningsPct = ((warningsCount / safeTotal) * 100).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Records */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-3 relative overflow-hidden transition-all hover:shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Records
          </span>
          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono tracking-tight">
            {totalRecords.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">Total records submitted</p>
        </div>

        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gray-600 w-full" />
        </div>
      </div>

      {/* 2. Valid Records */}
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xs p-5 space-y-3 relative overflow-hidden transition-all hover:shadow-xs bg-gradient-to-br from-white to-emerald-50/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Valid Records
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono tracking-tight">
            {validRecords.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-700 mt-1 font-semibold">
            {validPct}% of total records
          </p>
        </div>

        <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, parseFloat(validPct)))}%` }}
          />
        </div>
      </div>

      {/* 3. Errors Found */}
      <div
        className={`bg-white rounded-2xl border shadow-2xs p-5 space-y-3 relative overflow-hidden transition-all hover:shadow-xs ${
          errorsCount > 0
            ? 'border-red-200 bg-gradient-to-br from-white to-red-50/30'
            : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              errorsCount > 0 ? 'text-red-700' : 'text-gray-500'
            }`}
          >
            Errors Found
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              errorsCount > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <XCircle className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              errorsCount > 0 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {errorsCount.toLocaleString()}
          </div>
          <p
            className={`text-xs mt-1 font-semibold ${
              errorsCount > 0 ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {errorsPct}% of total records
          </p>
        </div>

        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, parseFloat(errorsPct)))}%` }}
          />
        </div>
      </div>

      {/* 4. Warnings */}
      <div
        className={`bg-white rounded-2xl border shadow-2xs p-5 space-y-3 relative overflow-hidden transition-all hover:shadow-xs ${
          warningsCount > 0
            ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/30'
            : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              warningsCount > 0 ? 'text-amber-800' : 'text-gray-500'
            }`}
          >
            Warnings
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              warningsCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              warningsCount > 0 ? 'text-amber-700' : 'text-gray-900'
            }`}
          >
            {warningsCount.toLocaleString()}
          </div>
          <p
            className={`text-xs mt-1 font-semibold ${
              warningsCount > 0 ? 'text-amber-700' : 'text-gray-500'
            }`}
          >
            {warningsPct}% of total records
          </p>
        </div>

        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, parseFloat(warningsPct)))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
