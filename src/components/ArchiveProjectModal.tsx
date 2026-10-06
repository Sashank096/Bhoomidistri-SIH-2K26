import React from 'react';
import { Archive, AlertTriangle, X } from 'lucide-react';
import { ProjectRecord } from '../types';

interface ArchiveProjectModalProps {
  project: ProjectRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmArchive: (projectId: string) => void;
}

export const ArchiveProjectModal: React.FC<ArchiveProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirmArchive,
}) => {
  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-modal-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 animate-scaleUp">
        {/* Modal Top Bar */}
        <div className="bg-[#0B3520] text-white px-5 py-4 flex items-center justify-between border-b border-[#EAB308]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center text-red-300">
              <Archive className="w-4 h-4" />
            </div>
            <h3 id="archive-modal-title" className="text-base font-bold text-white">
              Archive Project?
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600 font-medium">
            Are you sure you want to archive:
          </p>

          {/* Project Box */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <div className="font-mono text-xs font-bold text-[#0B3520] tracking-wide">
              {project.id}
            </div>
            <div className="text-sm font-bold text-gray-900 leading-snug">
              {project.name}
            </div>
            <div className="text-[11px] text-gray-500">
              {project.location}, {project.state}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Archived projects are removed from the active project list but remain available according to your administrative permissions.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmArchive(project.id)}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};
