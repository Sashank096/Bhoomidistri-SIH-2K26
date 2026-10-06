import React from 'react';
import {
  Wrench,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Cpu,
  TrendingUp,
  FileCheck2,
  FileInput,
  HelpCircle,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NextStepsAndActionPanelProps {
  errorsCount: number;
  warningsCount: number;
  isMlReady: boolean;
  userRole: UserRole;
  onFixData: () => void;
  onIgnoreAllWarnings: () => void;
  onRevalidate: () => void;
  onProceedToMl: () => void;
  onViewAuditTrail: () => void;
}

export const NextStepsAndActionPanel: React.FC<NextStepsAndActionPanelProps> = ({
  errorsCount,
  warningsCount,
  isMlReady,
  userRole,
  onFixData,
  onIgnoreAllWarnings,
  onRevalidate,
  onProceedToMl,
  onViewAuditTrail,
}) => {
  const canEdit = userRole === 'Administrator' || userRole === 'Officer';
  const hasErrors = errorsCount > 0;

  // Active step calculation
  const currentStep: number = hasErrors ? 1 : warningsCount > 0 ? 2 : 4;

  const workflowSteps = [
    { label: 'Data Input', done: true },
    { label: 'Data Validation', current: true },
    { label: 'ML Engine', upcoming: true },
    { label: 'Prediction', upcoming: true },
    { label: 'Risk Level', upcoming: true },
    { label: 'Stage-wise Analysis', upcoming: true },
    { label: 'Explainable AI', upcoming: true },
    { label: 'Root Cause', upcoming: true },
    { label: 'AI Recommendation', upcoming: true },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Next Steps Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B3520]" />
            <span>Recommended Next Steps</span>
          </h2>
          <button
            type="button"
            onClick={onViewAuditTrail}
            className="text-xs font-bold text-[#0B3520] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View Validation Audit Trail</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1: Fix Errors */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              hasErrors
                ? 'bg-red-50/70 border-red-200 ring-2 ring-red-400'
                : 'bg-emerald-50/40 border-emerald-200 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Step 1</span>
              {hasErrors ? (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  !
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  ✓
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-xs mt-2">1. Fix the errors</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-normal">
              {hasErrors
                ? `Resolve ${errorsCount} critical blocking issues in the data tables.`
                : 'All critical errors resolved.'}
            </p>
          </div>

          {/* Step 2: Review Warnings */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              !hasErrors && warningsCount > 0
                ? 'bg-amber-50/70 border-amber-200 ring-2 ring-amber-400'
                : warningsCount === 0
                ? 'bg-emerald-50/40 border-emerald-200 opacity-80'
                : 'bg-gray-50 border-gray-200 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Step 2</span>
              {warningsCount > 0 ? (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  ⚠
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  ✓
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-xs mt-2">2. Review warnings</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-normal">
              {warningsCount > 0
                ? `Decide whether ${warningsCount} warnings require correction or ignore.`
                : 'No pending warnings.'}
            </p>
          </div>

          {/* Step 3: Revalidate Data */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              currentStep === 3
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Step 3</span>
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center justify-center">
                ↻
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-xs mt-2">3. Revalidate data</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-normal">
              Run automated validation checks to ensure dataset integrity.
            </p>
          </div>

          {/* Step 4: Proceed to ML Pipeline */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isMlReady && !hasErrors
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-300 ring-2 ring-[#0B3520]'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Step 4</span>
              {isMlReady && !hasErrors ? (
                <span className="w-5 h-5 rounded-full bg-[#0B3520] text-white text-[10px] font-bold flex items-center justify-center">
                  →
                </span>
              ) : (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-xs mt-2">4. Proceed to ML Pipeline</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-normal">
              {isMlReady && !hasErrors
                ? 'Dataset unlocked for delay risk modeling.'
                : 'Locked until all critical errors are resolved.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Action Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Pipeline Control &amp; Actions
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            Execute remediation workflows, revalidate schemas, or proceed to predictive ML engine.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Fix Data Button */}
          {canEdit && (
            <button
              type="button"
              onClick={onFixData}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-[#0B3520]" />
              <span>Fix Data</span>
            </button>
          )}

          {/* Ignore Warnings Button */}
          {canEdit && warningsCount > 0 && (
            <button
              type="button"
              onClick={onIgnoreAllWarnings}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Ignore Warnings</span>
            </button>
          )}

          {/* Revalidate Button */}
          {canEdit && (
            <button
              type="button"
              onClick={onRevalidate}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B3520] hover:text-[#0B3520] bg-white hover:bg-emerald-50 border-2 border-[#0B3520] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Revalidate</span>
            </button>
          )}

          {/* Proceed to ML Pipeline Button */}
          <button
            type="button"
            onClick={onProceedToMl}
            disabled={hasErrors || !isMlReady}
            title={hasErrors ? 'Cannot proceed with open critical errors' : 'Proceed to ML risk prediction'}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer ${
              hasErrors || !isMlReady
                ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-75'
                : 'bg-[#0B3520] hover:bg-[#0B3520]/90 text-white active:scale-95'
            }`}
          >
            <span>Proceed to ML Pipeline</span>
            {hasErrors || !isMlReady ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-4 h-4 text-[#EAB308]" />
            )}
          </button>
        </div>
      </div>

      {/* 3. System Workflow Status Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 overflow-x-auto">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
          BhoomiDrishti End-to-End System Workflow:
        </div>
        <div className="flex items-center min-w-max text-[11px]">
          {workflowSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 ${
                  step.current
                    ? 'bg-[#0B3520] text-white shadow-xs'
                    : step.done
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {step.done && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                {step.current && <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping" />}
                <span>{step.label}</span>
              </div>

              {idx < workflowSteps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-1 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
