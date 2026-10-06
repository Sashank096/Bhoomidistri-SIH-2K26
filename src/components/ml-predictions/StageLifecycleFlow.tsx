import React from 'react';
import {
  BellRing,
  CheckCircle2,
  FileCheck,
  IndianRupee,
  Scale,
  Users2,
  MapPin,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { StagePredictionItem, StageName } from '../../types';

interface StageLifecycleFlowProps {
  stages: StagePredictionItem[];
  selectedStage?: StageName | null;
  onSelectStage: (stage: StageName) => void;
}

export const StageLifecycleFlow: React.FC<StageLifecycleFlowProps> = ({
  stages,
  selectedStage,
  onSelectStage,
}) => {
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

  const getRiskBorder = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-50/50 text-red-900 ring-1 ring-red-300';
      case 'HIGH':
        return 'border-orange-500 bg-orange-50/50 text-orange-900 ring-1 ring-orange-300';
      case 'MEDIUM':
        return 'border-amber-500 bg-amber-50/50 text-amber-900 ring-1 ring-amber-300';
      case 'LOW':
      default:
        return 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-300';
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-600 text-white';
      case 'MEDIUM':
        return 'bg-amber-600 text-white';
      case 'LOW':
      default:
        return 'bg-emerald-700 text-white';
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>Project Lifecycle Risk Propagation Flow</span>
          </h2>
          <p className="text-xs text-gray-500">
            End-to-end statutory acquisition stages highlighting predicted timeline bottlenecks
          </p>
        </div>
        <span className="text-[11px] font-medium text-gray-500">
          Click any stage to filter details
        </span>
      </div>

      {/* Horizontal Lifecycle Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
        {stages.map((stg, idx) => {
          const Icon = getStageIcon(stg.stage);
          const isSelected = selectedStage === stg.stage;
          const riskStyle = getRiskBorder(stg.riskLevel);
          const badgeStyle = getBadgeColor(stg.riskLevel);

          return (
            <div
              key={stg.stage}
              onClick={() => onSelectStage(stg.stage)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                isSelected
                  ? 'border-[#0B3520] bg-emerald-50/80 shadow-md ring-2 ring-[#0B3520]'
                  : `hover:border-gray-400 hover:shadow-xs ${riskStyle}`
              }`}
            >
              {/* Top: Stage # & Risk Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-500">
                  0{stg.stageNumber}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${badgeStyle}`}>
                  {stg.riskLevel}
                </span>
              </div>

              {/* Middle: Icon & Stage Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-900">
                  <Icon className="w-4 h-4 text-gray-700 shrink-0" />
                  <span className="text-xs font-bold truncate">{stg.stage}</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-gray-800">
                  {stg.delayProbability.toFixed(0)}% <span className="text-[10px] text-gray-500 font-normal">delay prob</span>
                </div>
              </div>

              {/* Bottom: Expected Delay */}
              <div className="pt-1.5 border-t border-black/5 flex items-center justify-between text-[10px]">
                <span className="text-gray-500 font-medium">Delay:</span>
                <span className="font-mono font-bold text-gray-900">
                  +{stg.expectedDelayMonths}m
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
