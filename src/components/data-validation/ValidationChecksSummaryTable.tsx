import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Layers } from 'lucide-react';
import { ValidationCheck, ValidationCheckStatus } from '../../types';

interface ValidationChecksSummaryTableProps {
  checks: ValidationCheck[];
  onSelectCheck: (check: ValidationCheck) => void;
}

export const ValidationChecksSummaryTable: React.FC<ValidationChecksSummaryTableProps> = ({
  checks,
  onSelectCheck,
}) => {
  const renderStatusBadge = (status: ValidationCheckStatus) => {
    switch (status) {
      case 'PASSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>✓ PASSED</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>⚠ WARNING</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>✕ FAILED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id="validation-checks-summary-card"
      className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0B3520]" />
            <span>Validation Checks Summary</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Summary of all automated validation checks performed on the project data.
          </p>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          <span>Total Checks: </span>
          <strong className="text-gray-900">{checks.length} Rules Enforced</strong>
        </div>
      </div>

      {/* Checks Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="p-3">Validation Check</th>
              <th className="p-3">Description</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Records Affected</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {checks.map((check) => (
              <tr
                key={check.id}
                className={`hover:bg-gray-50/80 transition-colors ${
                  check.status === 'FAILED' ? 'bg-red-50/20' : check.status === 'WARNING' ? 'bg-amber-50/20' : ''
                }`}
              >
                <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-gray-400 font-normal">[{check.errorCode}]</span>
                    <span>{check.name}</span>
                  </div>
                </td>

                <td className="p-3 text-gray-600 max-w-md">
                  <span className="line-clamp-1">{check.description}</span>
                </td>

                <td className="p-3 whitespace-nowrap">
                  {renderStatusBadge(check.status)}
                </td>

                <td className="p-3 text-center font-mono font-bold text-gray-900">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      check.recordsAffected > 0
                        ? check.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {check.recordsAffected}
                  </span>
                </td>

                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onSelectCheck(check)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                      check.status === 'FAILED'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        : check.status === 'WARNING'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <span>{check.status === 'PASSED' ? 'View Details' : 'View Issue'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
