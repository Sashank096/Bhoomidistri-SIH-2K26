import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface ValidationStatusBannerProps {
  errorsCount: number;
  warningsCount: number;
  onViewCriticalIssues: () => void;
  onProceedToMl: () => void;
  mlReady: boolean;
}

export const ValidationStatusBanner: React.FC<ValidationStatusBannerProps> = ({
  errorsCount,
  warningsCount,
  onViewCriticalIssues,
  onProceedToMl,
  mlReady,
}) => {
  if (errorsCount > 0 || !mlReady) {
    return (
      <div
        id="validation-status-banner-attention"
        className="bg-amber-50/90 border-2 border-amber-400/80 rounded-2xl p-5 shadow-sm transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                  Status Alert
                </span>
                <h3 className="text-base font-black text-amber-950 tracking-tight">
                  DATA REQUIRES ATTENTION
                </h3>
              </div>
              <p className="text-xs text-amber-900/90 mt-1 max-w-2xl leading-relaxed">
                <strong className="font-bold text-red-700">{errorsCount} critical validation {errorsCount === 1 ? 'error was' : 'errors were'} found</strong>. 
                Resolve the errors before the dataset can be processed by the BhoomiDrishti ML delay risk prediction engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-view-critical-issues"
              onClick={onViewCriticalIssues}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-400/90 border border-amber-400 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>View Critical Issues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="validation-status-banner-ready"
      className="bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-sm transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0B3520] text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">
                Pipeline Gate: Passed
              </span>
              <h3 className="text-base font-black text-emerald-950 tracking-tight">
                DATA READY FOR ML PROCESSING
              </h3>
            </div>
            <p className="text-xs text-emerald-800 mt-1 max-w-2xl leading-relaxed">
              All critical validation checks have passed successfully. The dataset is fully verified and authorized for ML predictive delay risk modeling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-proceed-to-ml"
            onClick={onProceedToMl}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="text-[#EAB308]">✓</span>
            <span>Proceed to ML Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
