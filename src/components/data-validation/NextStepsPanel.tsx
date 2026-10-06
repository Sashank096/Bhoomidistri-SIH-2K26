import React from 'react';
import {
  Wrench,
  AlertTriangle,
  RotateCw,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface NextStepsPanelProps {
  errorsCount: number;
  warningsCount: number;
  mlReady: boolean;
  onFixData: () => void;
  onRevalidate: () => void;
  onProceedToMl: () => void;
  canEdit: boolean;
}

export const NextStepsPanel: React.FC<NextStepsPanelProps> = ({
  errorsCount,
  warningsCount,
  mlReady,
  onFixData,
  onRevalidate,
  onProceedToMl,
  canEdit,
}) => {
  // Determine current active step (1: Fix Errors, 2: Review Warnings, 3: Revalidate, 4: Proceed to ML)
  const currentStep: number = errorsCount > 0 ? 1 : warningsCount > 0 ? 2 : 4;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Next Steps Workflow Card (6 cols) */}
      <div
        id="next-steps-card"
        className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4"
      >
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B3520]" />
            <span>Validation Action Steps</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Prescribed sequential path to unlock the Machine Learning risk prediction pipeline.
          </p>
        </div>

        <div className="space-y-3">
          {/* Step 1: Fix Errors */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
              currentStep === 1
                ? 'bg-red-50/60 border-red-300 shadow-xs'
                : errorsCount === 0
                ? 'bg-gray-50/50 border-gray-200 opacity-80'
                : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                errorsCount === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentStep === 1
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {errorsCount === 0 ? '✓' : '1'}
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900">1. Fix the errors</h3>
                {errorsCount > 0 && (
                  <span className="text-[10px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    {errorsCount} Blocking Errors
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-600">
                Resolve all critical schema, financial, and required field validation issues in Data Input.
              </p>
            </div>
          </div>

          {/* Step 2: Review Warnings */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
              currentStep === 2
                ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                : warningsCount === 0
                ? 'bg-gray-50/50 border-gray-200 opacity-80'
                : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                warningsCount === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentStep === 2
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {warningsCount === 0 ? '✓' : '2'}
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900">2. Review warnings</h3>
                {warningsCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {warningsCount} Non-blocking
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-600">
                Decide whether non-blocking warnings (missing scans, R&R options) require correction or can be ignored.
              </p>
            </div>
          </div>

          {/* Step 3: Revalidate */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
              currentStep === 3
                ? 'bg-blue-50/60 border-blue-300 shadow-xs'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#0B3520]/10 text-[#0B3520] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1 space-y-0.5">
              <h3 className="text-xs font-bold text-gray-900">3. Revalidate data</h3>
              <p className="text-[11px] text-gray-600">
                Run the multi-point validation engine again to confirm all schema rules and constraints pass.
              </p>
            </div>
          </div>

          {/* Step 4: Proceed to ML Pipeline */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
              mlReady
                ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                : 'bg-gray-50/40 border-gray-200 opacity-60'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                mlReady ? 'bg-[#0B3520] text-emerald-400' : 'bg-gray-200 text-gray-400'
              }`}
            >
              4
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900">4. Proceed to ML Pipeline</h3>
                {mlReady && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Unlocked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-600">
                Available only when blocking errors are resolved. Passes verified dataset to XGBoost &amp; Random Forest models.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. System Pipeline Workflow Indicator (6 cols) */}
      <div
        id="system-workflow-card"
        className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4 flex flex-col justify-between"
      >
        <div className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#0B3520]" />
              <span>BhoomiDrishti System Pipeline</span>
            </h2>
            <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Phase 2: Validation Gate
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            End-to-end architectural flow from raw cadastral ingest to AI recommendations.
          </p>
        </div>

        {/* Pipeline Stage Badges Flow */}
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-3 gap-2 text-center font-semibold text-[11px]">
            <div className="p-2 rounded-xl bg-gray-100 text-gray-700 border border-gray-200">
              1. Data Input ✓
            </div>
            <div className="p-2 rounded-xl bg-[#0B3520] text-white border border-[#0B3520] font-bold shadow-xs flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>2. Validation (Active)</span>
            </div>
            <div className={`p-2 rounded-xl border ${mlReady ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
              3. ML Engine
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-semibold text-[11px]">
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-100">
              4. Prediction
            </div>
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-100">
              5. Risk Level
            </div>
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-100">
              6. Stage-wise
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-semibold text-[11px]">
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-100">
              7. Explainable AI
            </div>
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-100">
              8. Root Cause
            </div>
            <div className="p-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-100">
              9. AI Action
            </div>
          </div>
        </div>

        {/* Security / Quality Gate Callout */}
        <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-xs text-gray-700 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#0B3520] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Strict ML Integrity Rule:</strong> Machine learning algorithms reject datasets with unverified schemas or broken relational keys to prevent biased delay estimates.
          </p>
        </div>
      </div>
    </div>
  );
};
