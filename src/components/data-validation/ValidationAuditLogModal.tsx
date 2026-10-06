import React from 'react';
import { ScrollText, X, CheckCircle2, ShieldAlert, Download, FileText } from 'lucide-react';
import { ProjectDataAuditLog } from '../../types';

interface ValidationAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ProjectDataAuditLog[];
}

export const ValidationAuditLogModal: React.FC<ValidationAuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BhoomiDrishti_Validation_Audit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 bg-[#0B3520] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]">
              <ScrollText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Data Validation &amp; Integrity Audit Trail</h2>
              <p className="text-xs text-white/70">
                Immutable chronological log of all integrity checks, overrides, and error resolutions.
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
            <span>Showing {logs.length} logged events</span>
            <button
              type="button"
              onClick={handleExportLogs}
              className="text-xs font-bold text-[#0B3520] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Audit Log</span>
            </button>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0B3520] text-[11px]">{log.id}</span>
                    <span className="text-gray-300">•</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-800">
                      {log.action}
                    </span>
                  </div>

                  <span className="font-mono text-gray-400 text-[11px]">{log.timestamp}</span>
                </div>

                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  {log.details || 'Integrity action recorded.'}
                </p>

                <div className="text-[11px] text-gray-500 flex items-center gap-3 pt-1">
                  <span>User: <strong className="text-gray-700">{log.user}</strong></span>
                  <span>•</span>
                  <span>Scope: <strong className="text-gray-700">{log.dataset}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">Result: {log.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
