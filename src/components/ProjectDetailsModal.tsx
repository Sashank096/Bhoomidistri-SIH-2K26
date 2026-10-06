import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  Building2,
  FileCheck,
  TrendingDown,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ProjectSummaryRow } from './ProjectRiskTable';

interface ProjectDetailsModalProps {
  project: ProjectSummaryRow | null;
  onClose: () => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  onClose,
}) => {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="bg-[#0B3520] text-white p-5 flex items-center justify-between border-b border-[#EAB308]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#EAB308] font-bold">
                  {project.id}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/80">{project.location}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {project.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] text-gray-500 font-medium block">
                Acquisition Stage
              </span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block">
                {project.stage}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] text-gray-500 font-medium block">
                Risk Classification
              </span>
              <span
                className={`text-sm font-bold mt-0.5 block ${
                  project.riskLevel === 'CRITICAL'
                    ? 'text-red-600'
                    : project.riskLevel === 'HIGH'
                    ? 'text-orange-600'
                    : project.riskLevel === 'MEDIUM'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {project.riskLevel}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] text-gray-500 font-medium block">
                Predicted Delay
              </span>
              <span className="text-sm font-bold font-mono text-red-600 mt-0.5 block">
                +{project.delayDays} Days
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] text-gray-500 font-medium block">
                Estimated Outlay
              </span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block font-mono">
                ₹{project.budgetCr} Cr
              </span>
            </div>
          </div>

          {/* Parcel Progress Bar */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[#0B3520]">
                Land Parcel Acquisition Progress
              </span>
              <span className="font-mono font-bold text-[#0B3520]">
                {project.acquiredParcels} / {project.totalParcels} Parcels (
                {Math.round((project.acquiredParcels / project.totalParcels) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0B3520] rounded-full transition-all duration-500"
                style={{
                  width: `${(project.acquiredParcels / project.totalParcels) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* AI Risk Assessment Details */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Predictive Intelligence Summary</span>
            </div>
            <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
              BhoomiDrishti AI detected 42 unresolved mutation claims under Section 19(1) of RFCTLARR Act 2013. Expedited disbursement through e-Bhoomi direct portal can compress critical delay by 45 days.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0B3520] hover:bg-[#082818] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Open Project in GIS Corridor Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
