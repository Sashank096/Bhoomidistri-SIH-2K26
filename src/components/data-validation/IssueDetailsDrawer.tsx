import React from 'react';
import {
  X,
  AlertTriangle,
  XCircle,
  AlertOctagon,
  Wrench,
  CheckCircle2,
  FileText,
  Layers,
  ArrowRight,
  ShieldCheck,
  Ban,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { ValidationIssue, DataSectionId, UserRole } from '../../types';

interface IssueDetailsDrawerProps {
  issue: ValidationIssue | null;
  userRole: UserRole;
  onClose: () => void;
  onFixData: (dataset: DataSectionId | string, issue: ValidationIssue) => void;
  onIgnoreWarningPrompt: (issue: ValidationIssue) => void;
  onResolveIssue: (issueId: string) => void;
}

export const IssueDetailsDrawer: React.FC<IssueDetailsDrawerProps> = ({
  issue,
  userRole,
  onClose,
  onFixData,
  onIgnoreWarningPrompt,
  onResolveIssue,
}) => {
  if (!issue) return null;

  const canEdit = userRole === 'Administrator' || userRole === 'Officer';

  const renderSeverityBadge = (severity: 'ERROR' | 'WARNING' | 'CRITICAL') => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-800 text-white shadow-xs">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>CRITICAL BLOCKING ERROR</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>VALIDATION ERROR (BLOCKING)</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>NON-BLOCKING WARNING</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Sliding Drawer Container */}
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-200 animate-slideLeft">
        {/* Top Header */}
        <div className="p-5 bg-[#0B3520] text-white border-b border-[#EAB308]/40 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#EAB308] font-bold tracking-wider">
                {issue.errorCode}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-white/80 font-medium">{issue.datasetLabel} Dataset</span>
            </div>
            <h2 className="text-base font-bold text-white line-clamp-1">{issue.issueDescription}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-700">
          {/* Severity & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <span className="text-gray-500 font-medium block text-[10px] uppercase">Severity</span>
              <div className="mt-1">{renderSeverityBadge(issue.severity)}</div>
            </div>

            <div>
              <span className="text-gray-500 font-medium block text-[10px] uppercase">Resolution Status</span>
              <span
                className={`mt-1 inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  issue.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : issue.status === 'Ignored'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                ● {issue.status}
              </span>
            </div>

            <div>
              <span className="text-gray-500 font-medium block text-[10px] uppercase">Records Affected</span>
              <span className="mt-1 inline-block font-mono font-bold text-gray-900 text-sm">
                {issue.recordsAffected}
              </span>
            </div>
          </div>

          {/* Detailed Root Cause Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0B3520]" />
              <span>Issue Description &amp; Regulatory Impact</span>
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 text-gray-700 leading-relaxed font-sans">
              {issue.detailedExplanation}
            </div>
          </div>

          {/* Problematic Fields */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1">
            <span className="font-bold text-amber-900">Target Schema Field:</span>
            <div className="font-mono text-amber-950 font-bold bg-white/80 p-2 rounded border border-amber-200 text-[11px]">
              {issue.field}
            </div>
          </div>

          {/* Affected Records Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0B3520]" />
                <span>Affected Records ({issue.affectedRecordIds.length})</span>
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">Click to inspect</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-44 overflow-y-auto">
              <div className="flex flex-wrap gap-1.5">
                {issue.affectedRecordIds.map((recId, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 font-mono text-[11px] font-bold text-gray-800 shadow-2xs hover:border-[#0B3520] hover:text-[#0B3520] transition-colors"
                  >
                    {recId}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ignored info if previously ignored */}
          {issue.status === 'Ignored' && (
            <div className="p-3 bg-gray-100 rounded-xl border border-gray-300 text-gray-700 space-y-1">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>Warning Ignored</span>
              </div>
              <p className="text-[11px] text-gray-600">
                Ignored by <strong>{issue.ignoredBy || 'Administrator'}</strong> on{' '}
                {issue.ignoredAt || '28 Aug 2026'}. Reason: &quot;{issue.ignoredReason || 'Field review in progress'}&quot;.
              </p>
            </div>
          )}

          {/* Remediation Note */}
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Recommended Resolution Pathway</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Click <strong>&quot;Fix Data&quot;</strong> below to open the corresponding <strong>{issue.datasetLabel}</strong> table in the Data Input module with the relevant fields highlighted.
            </p>
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Close
            </button>

            {canEdit && issue.severity === 'WARNING' && issue.status !== 'Ignored' && (
              <button
                type="button"
                onClick={() => onIgnoreWarningPrompt(issue)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Ignore Warning</span>
              </button>
            )}

            {canEdit && issue.status !== 'Resolved' && (
              <button
                type="button"
                onClick={() => onResolveIssue(issue.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            )}
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => onFixData(issue.dataset, issue)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Wrench className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>Fix Data in {issue.datasetLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
