import React from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { ValidationCheck } from '../../types';

interface ValidationChecksTableProps {
  checks: ValidationCheck[];
  onSelectCheck: (check: ValidationCheck) => void;
}

export const ValidationChecksTable: React.FC<ValidationChecksTableProps> = ({
  checks,
  onSelectCheck,
}) => {
  const renderStatusBadge = (status: 'PASSED' | 'WARNING' | 'FAILED') => {
    switch (status) {
      case 'PASSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>PASSED</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-700" />
            <span>WARNING</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 text-red-700" />
            <span>FAILED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      {/* Card Header */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0B3520]" />
            <span>Validation Checks Summary</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Summary of all validation checks performed on the project data.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-mono font-semibold text-gray-700">{checks.length} Rules Checked</span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="py-3.5 px-4">Validation Check</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Records Affected</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {checks.map((chk) => (
              <tr
                key={chk.id}
                className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                onClick={() => onSelectCheck(chk)}
              >
                <td className="py-3.5 px-4">
                  <div className="font-bold text-gray-900">{chk.name}</div>
                  <div className="font-mono text-[10px] text-gray-400 mt-0.5">{chk.errorCode} • {chk.category}</div>
                </td>

                <td className="py-3.5 px-4 text-gray-600 max-w-xs sm:max-w-md">
                  <p className="line-clamp-2 leading-relaxed">{chk.description}</p>
                </td>

                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  {renderStatusBadge(chk.status)}
                </td>

                <td className="py-3.5 px-4 text-center font-mono">
                  {chk.recordsAffected > 0 ? (
                    <span
                      className={`font-bold ${
                        chk.status === 'FAILED'
                          ? 'text-red-700 bg-red-50 px-2 py-0.5 rounded'
                          : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded'
                      }`}
                    >
                      {chk.recordsAffected}
                    </span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCheck(chk);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                      chk.status === 'FAILED'
                        ? 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                        : chk.status === 'WARNING'
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span>{chk.recordsAffected > 0 ? 'View Issue' : 'View Details'}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
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
