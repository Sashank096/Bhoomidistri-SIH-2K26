import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  XCircle,
  AlertOctagon,
  Search,
  Filter,
  Eye,
  Wrench,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ValidationIssue, DataSectionId, UserRole } from '../../types';

interface ValidationIssuesListProps {
  issues: ValidationIssue[];
  userRole: UserRole;
  onSelectIssue: (issue: ValidationIssue) => void;
  onFixData: (dataset: DataSectionId | string, issue: ValidationIssue) => void;
}

export const ValidationIssuesList: React.FC<ValidationIssuesListProps> = ({
  issues,
  userRole,
  onSelectIssue,
  onFixData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAllRows, setShowAllRows] = useState(false);

  const canEdit = userRole === 'Administrator' || userRole === 'Officer';

  const datasetsList = [
    { id: 'all', label: 'All Datasets' },
    { id: 'land', label: 'Land Details' },
    { id: 'families', label: 'Affected Families' },
    { id: 'compensation', label: 'Compensation' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'legal', label: 'Legal Disputes' },
    { id: 'documents', label: 'Documents' },
    { id: 'rr', label: 'R&R' },
    { id: 'possession', label: 'Possession' },
    { id: 'stakeholders', label: 'Stakeholders' },
  ];

  // Filtering
  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      // Search matches
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        iss.issueDescription.toLowerCase().includes(q) ||
        iss.errorCode.toLowerCase().includes(q) ||
        iss.datasetLabel.toLowerCase().includes(q) ||
        iss.field.toLowerCase().includes(q) ||
        iss.affectedRecordIds.some((id) => id.toLowerCase().includes(q));

      // Dataset match
      const matchesDataset = selectedDataset === 'all' || iss.dataset === selectedDataset;

      // Severity match
      const matchesSeverity =
        selectedSeverity === 'all' || iss.severity.toLowerCase() === selectedSeverity.toLowerCase();

      // Status match
      const matchesStatus =
        selectedStatus === 'all' || iss.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesDataset && matchesSeverity && matchesStatus;
    });
  }, [issues, searchQuery, selectedDataset, selectedSeverity, selectedStatus]);

  const displayedIssues = showAllRows ? filteredIssues : filteredIssues.slice(0, 5);

  const renderSeverityBadge = (severity: 'ERROR' | 'WARNING' | 'CRITICAL') => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-800 text-white shadow-2xs">
            <AlertOctagon className="w-3 h-3" />
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden space-y-4">
      {/* Card Top Title & Filters */}
      <div className="p-5 border-b border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#0B3520]" />
              <span>Recent Validation Issues</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest errors and warnings found in your project data.
            </p>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{filteredIssues.length}</strong> of {issues.length} issues
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2">
          {/* Search Box (6 cols) */}
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by issue, Record ID (e.g. FAM-021), field, code..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3520] focus:bg-white text-gray-800 font-medium"
            />
          </div>

          {/* Dataset Filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full py-2 px-3 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3520] text-gray-800 font-medium cursor-pointer"
            >
              {datasetsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter (2 cols) */}
          <div className="sm:col-span-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full py-2 px-3 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3520] text-gray-800 font-medium cursor-pointer"
            >
              <option value="all">All Severity</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Status Filter (2 cols) */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3520] text-gray-800 font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto px-5 pb-3">
        {displayedIssues.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">No Validation Issues Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No errors or warnings match your search and filter criteria.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Issue Description</th>
                <th className="py-3 px-3">Dataset</th>
                <th className="py-3 px-3 text-center">Records Affected</th>
                <th className="py-3 px-3">First Occurrence</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedIssues.map((iss) => (
                <tr
                  key={iss.id}
                  className={`hover:bg-gray-50/80 transition-colors cursor-pointer group ${
                    iss.status === 'Ignored' ? 'opacity-60 bg-gray-50/40' : ''
                  }`}
                  onClick={() => onSelectIssue(iss)}
                >
                  {/* Severity */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {renderSeverityBadge(iss.severity)}
                      {iss.status === 'Ignored' && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          Ignored
                        </span>
                      )}
                      {iss.status === 'Resolved' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Resolved
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Description & Code */}
                  <td className="py-3.5 px-3 max-w-xs sm:max-w-md">
                    <div className="font-bold text-gray-900 group-hover:text-[#0B3520] transition-colors">
                      {iss.issueDescription}
                    </div>
                    <div className="font-mono text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                      <span>{iss.errorCode}</span>
                      <span>•</span>
                      <span>Field: {iss.field}</span>
                    </div>
                  </td>

                  {/* Dataset */}
                  <td className="py-3.5 px-3 whitespace-nowrap font-medium text-gray-700">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-800 text-[11px]">
                      {iss.datasetLabel}
                    </span>
                  </td>

                  {/* Records Affected */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap font-mono">
                    <span className="px-2 py-0.5 rounded font-bold text-gray-900 bg-gray-100">
                      {iss.recordsAffected}
                    </span>
                  </td>

                  {/* First Occurrence */}
                  <td className="py-3.5 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                    {iss.firstOccurrence}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectIssue(iss)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onFixData(iss.dataset, iss)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5 text-[#EAB308]" />
                          <span>Fix Data</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Card Footer with "View All Issues" toggle */}
      {filteredIssues.length > 5 && (
        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {displayedIssues.length} of {filteredIssues.length} matching issues
          </span>

          <button
            type="button"
            onClick={() => setShowAllRows(!showAllRows)}
            className="text-xs font-bold text-[#0B3520] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showAllRows ? 'Show Less' : 'View All Issues →'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
