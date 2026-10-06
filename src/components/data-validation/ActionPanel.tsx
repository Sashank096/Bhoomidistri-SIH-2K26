import React from 'react';
import {
  Wrench,
  AlertTriangle,
  RotateCw,
  TrendingUp,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ActionPanelProps {
  errorsCount: number;
  warningsCount: number;
  mlReady: boolean;
  onFixData: () => void;
  onIgnoreAllWarnings: () => void;
  onRevalidate: () => void;
  onProceedToMl: () => void;
  isRevalidating?: boolean;
  canEdit: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  errorsCount,
  warningsCount,
  mlReady,
  onFixData,
  onIgnoreAllWarnings,
  onRevalidate,
  onProceedToMl,
  isRevalidating = false,
  canEdit,
}) => {
  return (
    <div
      id="validation-action-panel"
      className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0B3520]" />
            <span>Validation Remediation &amp; Actions</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Take corrective action on dataset or unlock ML processing pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {errorsCount > 0 ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>ML Pipeline Locked ({errorsCount} Errors)</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>ML Pipeline Ready</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left Secondary Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              type="button"
              id="btn-action-fix-data"
              onClick={onFixData}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Wrench className="w-3.5 h-3.5 text-gray-700" />
              <span>Fix Data (Go to Input)</span>
            </button>
          )}

          {canEdit && warningsCount > 0 && (
            <button
              type="button"
              id="btn-action-ignore-warnings"
              onClick={onIgnoreAllWarnings}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Ignore Warnings ({warningsCount})</span>
            </button>
          )}

          {canEdit && (
            <button
              type="button"
              id="btn-action-revalidate"
              onClick={onRevalidate}
              disabled={isRevalidating}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B3520] bg-[#0B3520]/10 hover:bg-[#0B3520]/20 border border-[#0B3520]/30 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#0B3520] ${isRevalidating ? 'animate-spin' : ''}`} />
              <span>{isRevalidating ? 'Running Validation...' : '↻ Revalidate'}</span>
            </button>
          )}
        </div>

        {/* Right Primary Action */}
        <div>
          {mlReady ? (
            <button
              type="button"
              id="btn-action-proceed-to-ml"
              onClick={onProceedToMl}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <span className="text-[#EAB308]">✓</span>
              <span>Proceed to ML Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                title="Resolve all blocking validation errors to unlock ML pipeline"
                className="px-6 py-3 rounded-xl text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Proceed to ML Pipeline (Locked)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
