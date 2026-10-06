import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2,
  Lock,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '../../types';

interface ValidationHeaderAndBannerProps {
  projectId: string;
  projectName: string;
  location: string;
  validatedOn: string;
  errorsCount: number;
  warningsCount: number;
  isMlReady: boolean;
  isValidating: boolean;
  userRole: UserRole;
  onRevalidate: () => void;
  onViewCriticalIssues: () => void;
  onProceedToMl: () => void;
  onQuickFixAllErrors?: () => void;
}

export const ValidationHeaderAndBanner: React.FC<ValidationHeaderAndBannerProps> = ({
  projectId,
  projectName,
  location,
  validatedOn,
  errorsCount,
  warningsCount,
  isMlReady,
  isValidating,
  userRole,
  onRevalidate,
  onViewCriticalIssues,
  onProceedToMl,
  onQuickFixAllErrors,
}) => {
  const canEdit = userRole === 'Administrator' || userRole === 'Officer';

  return (
    <div className="space-y-4">
      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <span>Projects</span>
        <span>&gt;</span>
        <span className="font-mono text-gray-700 font-bold">{projectId}</span>
        <span>&gt;</span>
        <span className="text-[#0B3520] font-bold">Data Validation</span>
      </nav>

      {/* 2. Page Header & Project Info Strip */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B3520]/10 flex items-center justify-center text-[#0B3520]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>Data Validation Results</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Validation results for project data before Machine Learning pipeline processing.
              </p>
            </div>
          </div>

          {/* Project Details Strip */}
          <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-600 border-t border-gray-100 pt-3">
            <div>
              <span className="text-gray-400 font-medium">Project: </span>
              <span className="font-bold text-gray-900">
                {projectId} — {projectName}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Location: </span>
              <span className="font-semibold text-gray-800">{location}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Validated On: </span>
              <span className="font-mono font-medium text-gray-800">{validatedOn}</span>
            </div>
          </div>
        </div>

        {/* Right side revalidate button */}
        <div className="flex items-center gap-2.5 self-start lg:self-center">
          {canEdit && (
            <button
              type="button"
              onClick={onRevalidate}
              disabled={isValidating}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B3520] hover:text-[#0B3520] bg-white hover:bg-emerald-50/50 border-2 border-[#0B3520] transition-all flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
              <span>{isValidating ? 'Validating Dataset...' : '↻ Revalidate'}</span>
            </button>
          )}

          {userRole === 'Viewer' && (
            <div className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium flex items-center gap-1.5 border border-gray-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Read-Only Viewer Access</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Validation Status Banner (Dynamic) */}
      {!isMlReady || errorsCount > 0 ? (
        /* Critical Errors Banner */
        <div className="bg-gradient-to-r from-red-50 via-amber-50/40 to-white rounded-2xl border-2 border-red-300 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 shadow-2xs border border-red-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-600 text-white">
                  ⚠ DATA REQUIRES ATTENTION
                </span>
                <span className="text-xs font-mono font-bold text-red-900">
                  {errorsCount} Critical {errorsCount === 1 ? 'Error' : 'Errors'} Found
                </span>
                {warningsCount > 0 && (
                  <span className="text-xs font-mono text-amber-800">
                    • {warningsCount} {warningsCount === 1 ? 'Warning' : 'Warnings'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 font-medium leading-relaxed max-w-2xl">
                Critical validation errors were found. Under DoLR RFCTLARR compliance rules, <strong>the ML prediction pipeline is strictly blocked</strong> until all blocking errors are resolved.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={onViewCriticalIssues}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-red-900 bg-red-100 hover:bg-red-200 border border-red-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>View Critical Issues</span>
            </button>

            {canEdit && onQuickFixAllErrors && (
              <button
                type="button"
                onClick={onQuickFixAllErrors}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                title="Automatically fix missing mock values for testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>Auto-Fix Errors</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Passed / Ready for ML Pipeline Banner */
        <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-white rounded-2xl border-2 border-emerald-400 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-700 text-white">
                  ✓ DATA READY FOR ML PROCESSING
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900">
                  0 Blocking Errors
                </span>
                {warningsCount > 0 && (
                  <span className="text-xs font-mono text-amber-800">
                    • {warningsCount} Non-blocking {warningsCount === 1 ? 'Warning' : 'Warnings'} Allowed
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 font-medium leading-relaxed max-w-2xl">
                All critical validation checks have passed. Dataset schema integrity and relational constraints are verified. Ready for predictive delay risk analysis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={onProceedToMl}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <span>Proceed to ML Pipeline</span>
              <ArrowRight className="w-4 h-4 text-[#EAB308]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
