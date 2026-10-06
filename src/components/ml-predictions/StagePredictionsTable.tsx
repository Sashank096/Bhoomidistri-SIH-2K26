import React, { useState } from 'react';
import {
  Table,
  ArrowUpDown,
  Search,
  Filter,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  FileCheck,
  IndianRupee,
  Scale,
  Users2,
  MapPin,
} from 'lucide-react';
import { StagePredictionItem, StageName } from '../../types';

interface StagePredictionsTableProps {
  stages: StagePredictionItem[];
  selectedStage?: StageName | null;
  onSelectStage: (stage: StagePredictionItem) => void;
}

export const StagePredictionsTable: React.FC<StagePredictionsTableProps> = ({
  stages,
  selectedStage,
  onSelectStage,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'stageNumber' | 'delayProbability' | 'riskScore' | 'expectedDelayMonths'>('stageNumber');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const getStageIcon = (stage: StageName) => {
    switch (stage) {
      case 'Notification':
        return BellRing;
      case 'Verification':
        return CheckCircle2;
      case 'Approval':
        return FileCheck;
      case 'Compensation':
        return IndianRupee;
      case 'Legal':
        return Scale;
      case 'R&R':
        return Users2;
      case 'Possession':
        return MapPin;
      default:
        return FileCheck;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border border-red-300 font-extrabold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-900 border border-orange-300 font-bold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold';
    }
  };

  const filteredStages = stages
    .filter((s) => (filterRisk === 'ALL' ? true : s.riskLevel === filterRisk))
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>Stage-wise Delay &amp; Risk Predictions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono font-medium">
              {stages.length} Stages
            </span>
          </h2>
          <p className="text-xs text-gray-500">
            Predicted delay and risk scores across individual acquisition milestones
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Filter Risk:</span>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-hidden focus:border-[#0B3520]"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <th
                onClick={() => handleSort('stageNumber')}
                className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stage</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('delayProbability')}
                className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Delay Probability</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('riskScore')}
                className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('expectedDelayMonths')}
                className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Expected Delay</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredStages.map((stg) => {
              const Icon = getStageIcon(stg.stage);
              const isSelected = selectedStage === stg.stage;

              return (
                <tr
                  key={stg.stage}
                  onClick={() => onSelectStage(stg)}
                  className={`hover:bg-emerald-50/40 transition-colors cursor-pointer ${
                    isSelected ? 'bg-emerald-50/70 font-semibold' : ''
                  }`}
                >
                  {/* 1. Stage */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-mono text-xs font-bold shrink-0">
                        0{stg.stageNumber}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-gray-600" />
                          <span>{stg.stage}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{stg.stageCode}</span>
                      </div>
                    </div>
                  </td>

                  {/* 2. Delay Probability */}
                  <td className="py-3 px-4">
                    <div className="space-y-1 max-w-[120px]">
                      <div className="flex justify-between font-mono font-bold text-gray-900 text-[11px]">
                        <span>{stg.delayProbability.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stg.delayProbability >= 70
                              ? 'bg-red-600'
                              : stg.delayProbability >= 45
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(100, stg.delayProbability)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 3. Risk Score */}
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    {stg.riskScore.toFixed(2)}{' '}
                    <span className="text-[10px] text-gray-400 font-normal">/ 1.00</span>
                  </td>

                  {/* 4. Expected Delay */}
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-gray-900">
                      +{stg.expectedDelayMonths.toFixed(1)} mo
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      (~{stg.expectedDelayDays} days)
                    </div>
                  </td>

                  {/* 5. Risk Level */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${getRiskBadge(
                        stg.riskLevel
                      )}`}
                    >
                      {stg.riskLevel}
                    </span>
                  </td>

                  {/* 6. Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        stg.status === 'Critical Delay'
                          ? 'text-red-700'
                          : stg.status === 'Moderate Risk'
                          ? 'text-amber-700'
                          : 'text-emerald-800'
                      }`}
                    >
                      {stg.status === 'Critical Delay' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>{stg.status}</span>
                    </span>
                  </td>

                  {/* 7. Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStage(stg);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0B3520] hover:bg-emerald-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
