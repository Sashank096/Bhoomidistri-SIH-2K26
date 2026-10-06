import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, FileText, CheckCircle2 } from 'lucide-react';
import { ValidationIssue } from '../../types';

interface IgnoreWarningModalProps {
  issue: ValidationIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmIgnore: (issueId: string, justification: string) => void;
}

export const IgnoreWarningModal: React.FC<IgnoreWarningModalProps> = ({
  issue,
  isOpen,
  onClose,
  onConfirmIgnore,
}) => {
  const [justification, setJustification] = useState(
    'Field verification scheduled with District Revenue Officer / Tahsildar prior to final award notification.'
  );

  if (!isOpen || !issue) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) return;
    onConfirmIgnore(issue.id, justification.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Ignore Non-Blocking Warning</h2>
              <p className="text-xs text-white/90 font-mono">{issue.errorCode} • {issue.datasetLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-gray-700">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
            <div className="font-bold">{issue.issueDescription}</div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This warning does not violate critical database schema integrity, but ignoring it may affect precision in downstream delay risk forecasts.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-900">
              Administrative Justification / Audit Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="State why this warning is being bypassed..."
              required
              className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3520] text-xs text-gray-800"
            />
            <span className="text-[10px] text-gray-400">
              This reason is permanently logged to the official BhoomiDrishti Audit Trail.
            </span>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!justification.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              Confirm Ignore &amp; Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
