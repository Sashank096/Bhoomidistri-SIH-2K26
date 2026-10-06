import React from 'react';
import { PieChart, AlertOctagon, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';
import { StagePredictionItem, ProjectRiskLevel } from '../../types';

interface RiskDistributionSummaryProps {
  stages: StagePredictionItem[];
  overallRisk: ProjectRiskLevel;
}

export const RiskDistributionSummary: React.FC<RiskDistributionSummaryProps> = ({
  stages,
  overallRisk,
}) => {
  const criticalCount = stages.filter((s) => s.riskLevel === 'CRITICAL').length;
  const highCount = stages.filter((s) => s.riskLevel === 'HIGH').length;
  const mediumCount = stages.filter((s) => s.riskLevel === 'MEDIUM').length;
  const lowCount = stages.filter((s) => s.riskLevel === 'LOW').length;

  const total = stages.length;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 flex flex-col justify-between">
      <div>
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#0B3520]" />
          <span>Stage Risk Category Distribution</span>
        </h2>
        <p className="text-xs text-gray-500">
          Distribution of {total} statutory acquisition stages across risk classifications
        </p>
      </div>

      {/* Stacked Risk Proportion Meter */}
      <div className="space-y-2">
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-gray-100 shadow-inner">
          {criticalCount > 0 && (
            <div
              className="bg-red-600 h-full transition-all"
              style={{ width: `${(criticalCount / total) * 100}%` }}
              title={`Critical: ${criticalCount} stages`}
            />
          )}
          {highCount > 0 && (
            <div
              className="bg-orange-500 h-full transition-all"
              style={{ width: `${(highCount / total) * 100}%` }}
              title={`High: ${highCount} stages`}
            />
          )}
          {mediumCount > 0 && (
            <div
              className="bg-amber-400 h-full transition-all"
              style={{ width: `${(mediumCount / total) * 100}%` }}
              title={`Medium: ${mediumCount} stages`}
            />
          )}
          {lowCount > 0 && (
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${(lowCount / total) * 100}%` }}
              title={`Low: ${lowCount} stages`}
            />
          )}
        </div>

        {/* 4 Category Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase text-red-800 tracking-wider">
              Critical
            </span>
            <span className="text-xl font-black font-mono text-red-900 mt-0.5">
              {criticalCount}
            </span>
            <span className="text-[10px] text-red-600 font-medium">
              {((criticalCount / total) * 100).toFixed(0)}% of stages
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase text-orange-800 tracking-wider">
              High
            </span>
            <span className="text-xl font-black font-mono text-orange-900 mt-0.5">
              {highCount}
            </span>
            <span className="text-[10px] text-orange-600 font-medium">
              {((highCount / total) * 100).toFixed(0)}% of stages
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">
              Medium
            </span>
            <span className="text-xl font-black font-mono text-amber-900 mt-0.5">
              {mediumCount}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">
              {((mediumCount / total) * 100).toFixed(0)}% of stages
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
              Low
            </span>
            <span className="text-xl font-black font-mono text-emerald-900 mt-0.5">
              {lowCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">
              {((lowCount / total) * 100).toFixed(0)}% of stages
            </span>
          </div>
        </div>
      </div>

      {/* Summary Note */}
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <span className="text-[11px] leading-relaxed">
          <strong>Key Takeaway:</strong> 4 out of 7 stages ({criticalCount + highCount} stages) exhibit elevated timeline vulnerability. Prioritize SLAO tribunal fast-tracking and DBT compensation reconciliation.
        </span>
      </div>
    </div>
  );
};
