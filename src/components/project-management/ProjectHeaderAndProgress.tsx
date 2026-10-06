import React from 'react';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Save,
  PlusCircle,
  UploadCloud,
  Edit3,
  ShieldCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { ProjectRecord, DataValidationStatus, DataEntryMode } from '../../types';

interface ProjectHeaderAndProgressProps {
  selectedProject: ProjectRecord;
  allProjects: ProjectRecord[];
  onSelectProject: (project: ProjectRecord) => void;
  dataValidationStatus: DataValidationStatus;
  lastSavedTime: string;
  completionPercentage: number;
  completedSectionsCount: number;
  totalSectionsCount: number;
  currentMode: DataEntryMode | 'create_project';
  onSelectMode: (mode: DataEntryMode | 'create_project') => void;
  onSaveDraft: () => void;
  isSaving: boolean;
  canEdit: boolean;
}

export const ProjectHeaderAndProgress: React.FC<ProjectHeaderAndProgressProps> = ({
  selectedProject,
  allProjects,
  onSelectProject,
  dataValidationStatus,
  lastSavedTime,
  completionPercentage,
  completedSectionsCount,
  totalSectionsCount,
  currentMode,
  onSelectMode,
  onSaveDraft,
  isSaving,
  canEdit,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const getStatusBadge = () => {
    switch (dataValidationStatus) {
      case 'VALIDATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            VALIDATED
          </span>
        );
      case 'VALIDATION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            VALIDATION REQUIRED
          </span>
        );
      case 'READY_FOR_PREDICTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            READY FOR PREDICTION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            DRAFT DATA
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 md:p-6 space-y-5">
      {/* Top Header with Project Info & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-[#0B3520]/10 text-[#0B3520]">
              Active Land Acquisition
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-medium">Department of Land Resources</span>
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-[#0B3520] font-mono">{selectedProject.id}</span>
                <span className="text-gray-300 font-normal">|</span>
                <span>{selectedProject.name}</span>
              </h1>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Switch Active Project"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-gray-500" />
                  <span>Switch Project</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-1 max-h-60 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      Select Project Portfolio
                    </div>
                    {allProjects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectProject(p);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          p.id === selectedProject.id ? 'bg-[#0B3520]/5 text-[#0B3520] font-bold' : 'text-gray-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono font-semibold">{p.id}</span> — {p.name}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {p.state}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-1 flex items-center gap-3 flex-wrap">
              <span>
                <strong>Location:</strong> {selectedProject.location || `${selectedProject.district}, ${selectedProject.state}`}
              </span>
              <span className="text-gray-300">•</span>
              <span>
                <strong>Department:</strong> {selectedProject.department}
              </span>
              <span className="text-gray-300">•</span>
              <span>
                <strong>Status:</strong> <span className="text-emerald-700 font-semibold">{selectedProject.status.toUpperCase()}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Right Status & Save Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500">Data Status</div>
            <div className="mt-0.5">{getStatusBadge()}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Last Saved: {lastSavedTime}</div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Save className={`w-3.5 h-3.5 text-gray-600 ${isSaving ? 'animate-spin' : ''}`} />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Project Data Completion Indicator */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <Layers className="w-4 h-4 text-[#0B3520]" />
            <span>Project Data Completion Indicator</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <span className="font-bold text-[#0B3520]">{completedSectionsCount} of {totalSectionsCount}</span> sections completed
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              completionPercentage >= 90
                ? 'bg-emerald-600'
                : completionPercentage >= 50
                ? 'bg-[#0B3520]'
                : 'bg-amber-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> In Progress
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-3 h-3 text-red-500" /> Attention Required
            </span>
          </div>
          <span className="italic text-gray-400">
            *Completion reflects data presence; formal verification occurs in Data Validation module.
          </span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => onSelectMode('manual')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              currentMode === 'manual'
                ? 'bg-[#0B3520] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
            {currentMode === 'manual' && <span className="text-[10px] text-emerald-300">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('upload')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              currentMode === 'upload'
                ? 'bg-[#0B3520] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Data (CSV / Excel)</span>
            {currentMode === 'upload' && <span className="text-[10px] text-emerald-300">✓</span>}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelectMode('create_project')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            currentMode === 'create_project'
              ? 'bg-[#EAB308] text-gray-900 shadow-xs'
              : 'bg-[#0B3520]/10 text-[#0B3520] hover:bg-[#0B3520]/20'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Create New Project Profile</span>
        </button>
      </div>
    </div>
  );
};
