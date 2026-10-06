import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { ValidationIssue, ValidationSeverity } from '../../types';

interface RecentValidationIssuesTableProps {
  issues: ValidationIssue[];
  onSelectIssue: (issue: ValidationIssue) => void;
  onFixData: (issue: ValidationIssue) => void;
}

export const RecentValidationIssuesTable: React.FC<RecentValidationIssuesTableProps> = ({
  issues,
  onSelectIssue,
  onFixData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = issue.issueDescription.toLowerCase().includes(q);
        const matchesCode = issue.errorCode.toLowerCase().includes(q);
        const matchesDataset = issue.datasetLabel.toLowerCase().includes(q);
        const matchesField = issue.field.toLowerCase().includes(q);
        const matchesRecords = issue.affectedRecordIds.some((id) => id.toLowerCase().includes(q));
        if (!matchesDesc && !matchesCode && !matchesDataset && !matchesField && !matchesRecords) {
          return false;
        }
      }

      // Dataset Filter
      if (selectedDataset !== 'All' && issue.datasetLabel !== selectedDataset) {
        return false;
      }

      // Severity Filter
      if (selectedSeverity !== 'All' && issue.severity !== selectedSeverity) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== 'All' && issue.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [issues, searchQuery, selectedDataset, selectedSeverity, selectedStatus]);

  const renderSeverityBadge = (severity: 'ERROR' | 'WARNING' | 'CRITICAL') => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-800 text-white border border-red-900">
            <XCircle className="w-3 h-3" />
            <span>CRITICAL</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>ERROR</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>WARNING</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: 'Open' | 'Resolved' | 'Ignored') => {
    switch (status) {
      case 'Open':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
            Open
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            ✓ Resolved
          </span>
        );
      case 'Ignored':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 italic">
            Ignored
          </span>
        );
    }
  };

  const datasetOptions = [
    'All',
    'Land Details',
    'Affected Families',
    'Compensation',
    'Approvals',
    'Legal Disputes',
    'Documents',
    'R&R',
    'Possession',
    'Stakeholders',
  ];

  return (
    <div
      id="recent-validation-issues-card"
      className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#0B3520]" />
            <span>Recent Validation Issues</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Latest errors and warnings found in your project data requiring remediation or review.
          </p>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          <span>Showing </span>
          <strong className="text-gray-900">{filteredIssues.length}</strong>
          <span> of {issues.length} Issues</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-200">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-validation-issues"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search validation issues, record ID (e.g. FAM-021), dataset, field..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3520]/20 focus:border-[#0B3520]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-gray-400 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dataset */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs">
            <span className="text-gray-500 font-medium">Dataset:</span>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              {datasetOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs">
            <span className="text-gray-500 font-medium">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs">
            <span className="text-gray-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
              <option value="Ignored">Ignored</option>
            </select>
          </div>

          {(searchQuery || selectedDataset !== 'All' || selectedSeverity !== 'All' || selectedStatus !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDataset('All');
                setSelectedSeverity('All');
                setSelectedStatus('All');
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Issues Table */}
      {filteredIssues.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-gray-900">No Validation Issues Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No errors or warnings match your current filter and search criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3">Severity</th>
                <th className="p-3">Issue Description</th>
                <th className="p-3">Dataset</th>
                <th className="p-3 text-center">Records Affected</th>
                <th className="p-3">First Occurrence</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIssues.map((issue) => (
                <tr
                  key={issue.id}
                  className={`hover:bg-gray-50/80 transition-colors ${
                    issue.status === 'Ignored' ? 'opacity-60 bg-gray-50/40' : ''
                  }`}
                >
                  <td className="p-3 whitespace-nowrap">
                    {renderSeverityBadge(issue.severity)}
                  </td>

                  <td className="p-3 font-semibold text-gray-900 max-w-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-gray-400 font-normal">
                        [{issue.errorCode}]
                      </span>
                      <span>{issue.issueDescription}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-normal line-clamp-1 mt-0.5">
                      Field: <span className="font-mono text-gray-700">{issue.field}</span>
                    </div>
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-medium text-[11px]">
                      {issue.datasetLabel}
                    </span>
                  </td>

                  <td className="p-3 text-center font-mono font-bold text-gray-900 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        issue.severity === 'ERROR'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {issue.recordsAffected}
                    </span>
                  </td>

                  <td className="p-3 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                    {issue.firstOccurrence}
                  </td>

                  <td className="p-3 text-center whitespace-nowrap">
                    {renderStatusBadge(issue.status)}
                  </td>

                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectIssue(issue)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0B3520] hover:bg-[#0B3520]/10 border border-[#0B3520]/30 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>

                      {issue.status !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => onFixData(issue)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Fix</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
