import React from 'react';
import {
  TrendingUp,
  AlertOctagon,
  CalendarClock,
  ShieldCheck,
  Zap,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { MlPredictionOverall, ProjectRiskLevel } from '../../types';

interface PredictionKpiCardsProps {
  overall: MlPredictionOverall;
  isLoading?: boolean;
}

export const PredictionKpiCards: React.FC<PredictionKpiCardsProps> = ({
  overall,
  isLoading = false,
}) => {
  const {
    delayProbability,
    riskScore,
    expectedDelayMonths,
    expectedDelayDays,
    confidence,
    riskLevel,
    modelConfidenceGrade,
  } = overall;

  const getRiskColor = (level: ProjectRiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50',
          text: 'text-red-800',
          border: 'border-red-200',
          badge: 'bg-red-600 text-white',
          bar: 'bg-red-600',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-900',
          border: 'border-orange-200',
          badge: 'bg-orange-600 text-white',
          bar: 'bg-orange-600',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-900',
          border: 'border-amber-200',
          badge: 'bg-amber-600 text-white',
          bar: 'bg-amber-500',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-900',
          border: 'border-emerald-200',
          badge: 'bg-emerald-700 text-white',
          bar: 'bg-emerald-600',
        };
    }
  };

  const riskStyles = getRiskColor(riskLevel);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    );
  }

  // Circular gauge calculations for Delay Probability
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (delayProbability / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Delay Probability Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Delay Probability
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                  {delayProbability.toFixed(1)}
                </span>
                <span className="text-lg font-bold text-gray-500 font-mono">%</span>
              </div>
            </div>

            {/* Circular Gauge Graphic */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 70 70">
                <circle
                  cx="35"
                  cy="35"
                  r={radius}
                  className="stroke-gray-100"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="35"
                  cy="35"
                  r={radius}
                  className={delayProbability >= 70 ? 'stroke-red-600' : delayProbability >= 45 ? 'stroke-amber-500' : 'stroke-emerald-600'}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <TrendingUp className={`w-4 h-4 absolute ${delayProbability >= 70 ? 'text-red-600' : delayProbability >= 45 ? 'text-amber-500' : 'text-emerald-600'}`} />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 font-medium">
              Probability of project schedule delay
            </p>
            <div className="mt-1.5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${riskStyles.bar}`}
                style={{ width: `${Math.min(100, delayProbability)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Risk Score Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Risk Score
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                  {riskScore.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-gray-400 font-mono">/ 1.00</span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500 font-medium">Normalized Index:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${riskStyles.badge}`}>
                {riskLevel} RISK
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex">
              <div className="w-[35%] bg-emerald-400" />
              <div className="w-[30%] bg-amber-400" />
              <div className="w-[35%] bg-red-500" />
            </div>
          </div>
        </div>

        {/* 3. Expected Delay Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Expected Delay
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black text-[#0B3520] font-mono tracking-tight">
                  {expectedDelayMonths.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-gray-600">months</span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0B3520]">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">Equivalent Horizon:</span>
            <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              +{expectedDelayDays} Days
            </span>
          </div>
        </div>

        {/* 4. Prediction Confidence Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Prediction Confidence
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                  {confidence.toFixed(1)}
                </span>
                <span className="text-lg font-bold text-gray-500 font-mono">%</span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">Confidence Grade:</span>
            <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {modelConfidenceGrade} Statistical Fit
            </span>
          </div>
        </div>
      </div>

      {/* 5. Overall Risk Summary Bar */}
      <div className={`p-4 rounded-2xl border ${riskStyles.border} ${riskStyles.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${riskStyles.badge}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Overall Project Risk Level:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide ${riskStyles.badge}`}>
                {riskLevel}
              </span>
            </div>
            <p className="text-xs text-gray-700 mt-0.5">
              Ensemble classifier flags high likelihood of timeline slippage beyond statutory RFCTLARR gazette benchmarks without proactive administrative intervention.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs font-semibold text-gray-700">
          <span>Threshold Category:</span>
          <span className="font-mono font-bold text-gray-900">
            {riskLevel === 'CRITICAL' ? 'P > 75%' : riskLevel === 'HIGH' ? '55% ≤ P < 75%' : riskLevel === 'MEDIUM' ? '35% ≤ P < 55%' : 'P < 35%'}
          </span>
        </div>
      </div>
    </div>
  );
};
