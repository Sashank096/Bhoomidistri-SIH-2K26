import React from 'react';
import { ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ValidationGateBlockedBannerProps {
  projectId: string;
  onNavigateToDataValidation: () => void;
}

export const ValidationGateBlockedBanner: React.FC<ValidationGateBlockedBannerProps> = ({
  projectId,
  onNavigateToDataValidation,
}) => {
  return (
    <div className="bg-red-50 rounded-2xl border-2 border-red-300 p-6 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-red-950">
              ⚠ ML Prediction Pipeline Blocked by Data Validation Gating
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">
              GATING ENFORCED
            </span>
          </div>
          <p className="text-xs text-red-900 leading-relaxed">
            Project <strong>{projectId}</strong> currently contains unresolved blocking schema violations, missing statutory documents, or cadastral boundary discrepancies in the Data Validation engine. Under Ministry guidelines, the Machine Learning prediction model cannot be executed on unverified or corrupted datasets.
          </p>
        </div>
      </div>

      <div className="bg-white/80 p-4 rounded-xl border border-red-200 text-xs text-gray-800 space-y-2">
        <div className="font-bold text-gray-900 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Required Actions to Unlock ML Pipeline:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-[11px] pl-1 font-medium">
          <li>Resolve all critical data schema violations in affected family &amp; land survey tables.</li>
          <li>Ensure 100% of cadastral parcels pass DoLR state GIS node cross-referencing.</li>
          <li>Run an automated data revalidation cycle until <strong>0 Errors</strong> remain.</li>
        </ul>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-red-800 font-medium">
          Once data validation passes with zero critical errors, ML forecasting will automatically unlock.
        </span>

        <button
          type="button"
          onClick={onNavigateToDataValidation}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>Go to Data Validation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
