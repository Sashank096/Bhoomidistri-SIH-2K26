import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Send,
  Save,
  Lock,
  Sparkles,
  HelpCircle,
  FileCheck2,
  X,
} from 'lucide-react';
import { DataSectionId, SectionCompletionStatus, DataValidationStatus, UserRole } from '../../types';

interface DataStatusAndSubmitPanelProps {
  sectionStatuses: Record<DataSectionId, { status: SectionCompletionStatus; count: number }>;
  dataValidationStatus: DataValidationStatus;
  lastSavedTime: string;
  onSaveDraft: () => void;
  onSubmitForValidation: () => void;
  canSubmit: boolean;
  userRole: UserRole;
}

export const DataStatusAndSubmitPanel: React.FC<DataStatusAndSubmitPanelProps> = ({
  sectionStatuses,
  dataValidationStatus,
  lastSavedTime,
  onSaveDraft,
  onSubmitForValidation,
  canSubmit,
  userRole,
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const sectionsList: { id: DataSectionId; label: string }[] = [
    { id: 'land', label: 'Land Records' },
    { id: 'families', label: 'Family Records' },
    { id: 'compensation', label: 'Compensation' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'legal', label: 'Legal Disputes' },
    { id: 'documents', label: 'Documents' },
    { id: 'rr', label: 'R&R' },
    { id: 'possession', label: 'Possession' },
    { id: 'stakeholders', label: 'Stakeholders' },
  ];

  const renderMiniStatus = (status: SectionCompletionStatus) => {
    switch (status) {
      case 'completed':
        return <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Complete</span>;
      case 'in_progress':
        return <span className="text-amber-700 font-semibold flex items-center gap-1">● In Progress</span>;
      case 'requires_attention':
        return <span className="text-red-600 font-bold flex items-center gap-1">⚠ Incomplete</span>;
      case 'not_started':
      default:
        return <span className="text-gray-400 font-normal">○ Not Added</span>;
    }
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
      onSubmitForValidation();
      setIsSuccessModalOpen(true);
    }, 600);
  };

  return (
    <div className="space-y-4">
      {/* Persistent Data Status Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0B3520]" />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Project Data Status Overview
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Pipeline Stage:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] bg-[#0B3520]/10 text-[#0B3520]">
              {dataValidationStatus}
            </span>
          </div>
        </div>

        {/* 9 Section Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {sectionsList.map((sec) => {
            const statusInfo = sectionStatuses[sec.id] || { status: 'not_started', count: 0 };
            return (
              <div key={sec.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <div className="text-[11px] font-semibold text-gray-700 truncate">{sec.label}</div>
                <div className="text-[11px] font-mono">{renderMiniStatus(statusInfo.status)}</div>
              </div>
            );
          })}
        </div>

        {/* Informative Pipeline Note */}
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">BhoomiDrishti AI Quality Gate:</span> Data entered here is stored as a Draft dataset. Submitting sends it to the <strong>Data Validation</strong> pipeline for relational and schema integrity verification before being made available for ML delay risk prediction.
          </div>
        </div>

        {/* Bottom Submission Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <span>Last Saved: </span>
            <span className="font-mono font-medium text-gray-700">{lastSavedTime}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {canSubmit && (
              <>
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-gray-600" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                >
                  <FileCheck2 className="w-4 h-4 text-[#EAB308]" />
                  <span>Submit for Validation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200">
            <div className="bg-[#0B3520] text-white p-5 border-b border-[#EAB308] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-[#EAB308]" />
                <h3 className="text-base font-bold">Submit Data for Validation?</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-gray-700">
              <p className="leading-relaxed">
                Your project data will be formally frozen in Draft status and submitted to the <strong>Data Validation</strong> engine for cross-table integrity, boundary constraint, and gazette notice reconciliation.
              </p>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Ready for Quality Pipeline
                </div>
                <div className="text-[11px] text-emerald-800">
                  After validation passes, the dataset is unlocked for AI predictive delay risk scoring.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting Dataset...' : 'Submit for Validation'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">Data Submitted Successfully</h3>
              <p className="text-xs text-gray-600 mt-1">
                Project status updated to <strong>Validation Pending</strong>. The dataset is queued for automated validation tests and compliance audits.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs space-y-1">
              <div><strong>Project ID:</strong> PRJ-1042</div>
              <div><strong>Status:</strong> <span className="text-amber-700 font-bold">Validation Pending</span></div>
              <div><strong>Next Step:</strong> Data Validation Module</div>
            </div>

            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all cursor-pointer"
            >
              Continue Reviewing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
