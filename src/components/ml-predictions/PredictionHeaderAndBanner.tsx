import React from 'react';
import {
  BrainCircuit,
  RefreshCw,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  History,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ProjectPredictionStatus, UserRole } from '../../types';

interface PredictionHeaderAndBannerProps {
  projectId: string;
  projectName: string;
  location: string;
  status: ProjectPredictionStatus;
  isDataFresh: boolean;
  predictionTimestamp: string;
  dataChangesSincePrediction?: number;
  userRole: UserRole;
  isGenerating: boolean;
  onRefreshPrediction: () => void;
  onOpenSimulation: () => void;
  onOpenHistory: () => void;
  onNavigateToValidation: () => void;
  onNavigateToRiskAnalysis: () => void;
}

export const PredictionHeaderAndBanner: React.FC<PredictionHeaderAndBannerProps> = ({
  projectId,
  projectName,
  location,
  status,
  isDataFresh,
  predictionTimestamp,
  dataChangesSincePrediction = 0,
  userRole,
  isGenerating,
  onRefreshPrediction,
  onOpenSimulation,
  onOpenHistory,
  onNavigateToValidation,
  onNavigateToRiskAnalysis,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>AVAILABLE</span>
          </span>
        );
      case 'OUTDATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>OUTDATED</span>
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
            <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
            <span>VALIDATION BLOCKED</span>
          </span>
        );
      case 'GENERATING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <RefreshCw className="w-3.5 h-3.5 text-blue-700 animate-spin" />
            <span>GENERATING INFERENCE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300">
            <span>NOT GENERATED</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Government Breadcrumbs & Context */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <span className="hover:text-gray-900 cursor-pointer">Projects</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-mono font-bold text-[#0B3520] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {projectId}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-bold">ML Prediction</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-gray-600" />
            <span>Prediction History</span>
          </button>

          <button
            type="button"
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0B3520] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 shadow-2xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0B3520]" />
            <span>What-If Scenario Simulation</span>
          </button>
        </div>
      </div>

      {/* 2. Main Title, Subtitle, & Primary Action Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B3520] text-[#EAB308] flex items-center justify-center shadow-xs">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                ML Prediction
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                Machine learning-based forecast of project delay and risk
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-gray-600">
            <span className="font-semibold text-gray-900">Project:</span>
            <span className="font-bold text-[#0B3520]">{projectId} — {projectName}</span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold text-gray-900">Location:</span>
            <span className="text-gray-700">{location}</span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold text-gray-900">Last Prediction:</span>
            <span className="font-mono text-gray-700">{predictionTimestamp}</span>
          </div>
        </div>

        {/* Status Pill & Re-predict CTA */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {getStatusBadge()}

          {userRole !== 'Viewer' && (
            <button
              type="button"
              onClick={onRefreshPrediction}
              disabled={isGenerating || status === 'BLOCKED'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#144d31] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-[#EAB308] ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Running Inference...' : 'Generate / Refresh Prediction'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Freshness / Outdated / Alert Dynamic Banner */}
      {status === 'OUTDATED' ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">⚠ Prediction Outdated</div>
              <div className="text-xs text-amber-800">
                Project data has changed ({dataChangesSincePrediction} records modified) since the last ML inference run.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefreshPrediction}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Generate New Prediction
          </button>
        </div>
      ) : isDataFresh && status === 'AVAILABLE' ? (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>
              ✓ <strong>Prediction Valid:</strong> Generated from the latest validated project dataset snapshot with 100% relational integrity.
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateToRiskAnalysis}
            className="text-xs font-bold text-[#0B3520] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explainable AI &amp; Root Causes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
};
