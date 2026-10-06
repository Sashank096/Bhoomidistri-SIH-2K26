import React from 'react';
import {
  X,
  Layers,
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  FileCheck,
  TrendingDown,
  Clock,
  Sparkles,
  Users,
  Compass,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ProjectRecord } from '../types';

interface ProjectWorkspaceModalProps {
  project: ProjectRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenGisModule?: () => void;
  onOpenLocationSelection?: () => void;
}

export const ProjectWorkspaceModal: React.FC<ProjectWorkspaceModalProps> = ({
  project,
  isOpen,
  onClose,
  onOpenGisModule,
  onOpenLocationSelection,
}) => {
  if (!isOpen || !project) return null;

  const getRiskBadge = (risk: ProjectRecord['riskLevel']) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            CRITICAL RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            MEDIUM RISK
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            LOW RISK
          </span>
        );
    }
  };

  const getStatusBadge = (status: ProjectRecord['status']) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">ACTIVE</span>;
      case 'Delayed':
        return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-200">DELAYED</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">COMPLETED</span>;
      case 'Archived':
        return <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-bold border border-gray-300">ARCHIVED</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">UNDER REVIEW</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200">{status.toUpperCase()}</span>;
    }
  };

  const stages = ['Land Survey', 'Documentation', 'Award Inquiry', 'Compensation', 'R&R', 'Possession'];
  const currentStageIndex = stages.findIndex((s) => s.toLowerCase() === (project.stage || '').toLowerCase());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B3520] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#EAB308]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308] border border-white/10">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-[#EAB308] font-bold tracking-wider">
                  {project.id}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/80 font-medium">{project.projectType}</span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/80">{project.state}, {project.district}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5 leading-snug">
                {project.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-[10px] text-gray-500 font-medium block">Project Status</span>
                <div className="mt-0.5">{getStatusBadge(project.status)}</div>
              </div>
              <div className="h-7 w-px bg-gray-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-gray-500 font-medium block">Risk Assessment</span>
                <div className="mt-0.5">{getRiskBadge(project.riskLevel)}</div>
              </div>
              <div className="h-7 w-px bg-gray-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-gray-500 font-medium block">Predicted Delay Probability</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-extrabold text-sm text-red-600">
                    {project.delayProbability}%
                  </span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        project.delayProbability >= 70
                          ? 'bg-red-500'
                          : project.delayProbability >= 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${project.delayProbability}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">(+{project.delayDays}d)</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-500 font-medium block">Assigned Officer</span>
              <span className="font-bold text-gray-800 text-xs mt-0.5 block">{project.assignedOfficer}</span>
            </div>
          </div>

          {/* Key Portfolio Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium block">Estimated Outlay</span>
              <span className="text-base font-bold font-mono text-gray-900 mt-1 block">
                ₹{project.budgetCr} Cr
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium block">Total Land Area</span>
              <span className="text-base font-bold font-mono text-gray-900 mt-1 block">
                {project.totalLandAreaHa || 240} Hectares
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium block">Revenue Villages</span>
              <span className="text-base font-bold font-mono text-gray-900 mt-1 block">
                {project.numberOfVillages || 12} Villages
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium block">Affected Families</span>
              <span className="text-base font-bold font-mono text-gray-900 mt-1 block">
                {project.initialAffectedFamilies || 850} Families
              </span>
            </div>
          </div>

          {/* Acquisition Stage Progression Lifecycle */}
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-xs">
                RFCTLARR Act 2013 Statutory Lifecycle Progression
              </span>
              <span className="text-[11px] font-semibold text-[#0B3520] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Current Stage: {project.stage || 'In Progress'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
              {stages.map((stg, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx || (currentStageIndex === -1 && idx === 0);

                return (
                  <div
                    key={stg}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? 'bg-[#0B3520] text-white border-[#0B3520] font-bold shadow-xs'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono">Stage 0{idx + 1}</div>
                    <div className="text-[11px] mt-0.5 leading-tight">{stg}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Land Parcel Demarcation Progress */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#0B3520]">
                Cadastral Land Parcel Acquisition Status
              </span>
              <span className="font-mono font-bold text-[#0B3520]">
                {project.acquiredParcels} / {project.totalParcels} Parcels Acquired (
                {Math.round((project.acquiredParcels / project.totalParcels) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0B3520] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((project.acquiredParcels / project.totalParcels) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 pt-0.5">
              <span>Disputed Parcels: <strong className="text-red-600 font-mono">{project.disputedParcels}</strong></span>
              <span>Pending Demarcation: <strong className="text-gray-700 font-mono">{project.totalParcels - project.acquiredParcels}</strong></span>
            </div>
          </div>

          {/* Project Details & Alignment Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Administrative Metadata */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
              <h4 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0B3520]" />
                <span>Administrative &amp; Authority Details</span>
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Executing Authority:</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[200px] truncate">{project.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Alignment Corridor:</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[200px] truncate">{project.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Timeline:</span>
                  <span className="font-mono text-gray-700">{project.startDate} to {project.targetCompletionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority Tier:</span>
                  <span className="font-semibold text-gray-800">{project.priority || 'High'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last NIC Sync:</span>
                  <span className="font-mono text-gray-700">{project.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Right: AI Predictive Risk Factor */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
              <h4 className="font-bold text-amber-900 text-xs border-b border-amber-200 pb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>BhoomiDrishti AI Predictive Delay Analysis</span>
              </h4>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {project.description || 'Land acquisition project registered in national DoLR database.'}
              </p>
              <div className="p-2 bg-white/80 rounded-lg border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                Recommendation: Expedite Section 19 award inquiry hearings with the District Collectorate to recover 30+ days of critical timeline delay.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Authorized by Department of Land Resources (DoLR)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            {onOpenLocationSelection && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLocationSelection();
                }}
                className="px-3.5 py-2 text-xs font-semibold text-[#0B3520] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Configure Location (Page 5)</span>
              </button>
            )}
            {onOpenGisModule && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGisModule();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0B3520] hover:bg-[#082818] rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-[#EAB308]" />
                <span>Open in GIS Module</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
