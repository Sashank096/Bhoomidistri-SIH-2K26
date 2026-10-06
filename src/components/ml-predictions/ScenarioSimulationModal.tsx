import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  Sparkles,
  Scale,
  IndianRupee,
  Building2,
  Users2,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { PredictionSimulationOptions } from '../../services/mlPredictionService';

interface ScenarioSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySimulation: (options: PredictionSimulationOptions) => void;
}

export const ScenarioSimulationModal: React.FC<ScenarioSimulationModalProps> = ({
  isOpen,
  onClose,
  onApplySimulation,
}) => {
  const [compensationPace, setCompensationPace] = useState(75);
  const [disputeFastTrack, setDisputeFastTrack] = useState(true);
  const [tahsildarCamp, setTahsildarCamp] = useState(true);
  const [rrConsensus, setRrConsensus] = useState(80);

  if (!isOpen) return null;

  // Real-time simulated impact preview
  const estimatedSavingsDays =
    (disputeFastTrack ? 54 : 0) +
    Math.round((compensationPace - 54) * 0.8) +
    (tahsildarCamp ? 24 : 0) +
    Math.round((rrConsensus - 62) * 0.5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplySimulation({
      compensationPacePercent: compensationPace,
      disputeFastTrack,
      tahsildarKhataCampActive: tahsildarCamp,
      rrPackageConsensusPercent: rrConsensus,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 bg-[#0B3520] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                What-If Scenario &amp; Policy Simulation
              </h2>
              <p className="text-xs text-white/70">
                Simulate targeted administrative interventions to compress acquisition delay
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700">
          {/* Estimated Schedule Compression Indicator */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                Simulated Schedule Compression:
              </span>
              <div className="text-xl font-black text-[#0B3520] font-mono">
                -{estimatedSavingsDays} Days (~{(estimatedSavingsDays / 30).toFixed(1)} Months Saved)
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          {/* Variable 1: PFMS DBT Compensation Pace */}
          <div className="space-y-2 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#0B3520]" />
                <span className="font-bold text-gray-900">
                  Direct Benefit Transfer (DBT) Disbursement Target:
                </span>
              </div>
              <span className="font-mono font-bold text-[#0B3520] text-sm">{compensationPace}%</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Increase digital disbursement velocity through SLAO fast-track escrow windows.
            </p>
            <input
              type="range"
              min="40"
              max="100"
              value={compensationPace}
              onChange={(e) => setCompensationPace(Number(e.target.value))}
              className="w-full accent-[#0B3520] cursor-pointer"
            />
          </div>

          {/* Variable 2: Revenue Court Tribunal Bench */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#0B3520]" />
                <span className="font-bold text-gray-900">
                  Dedicated Revenue Court Tribunal Special Bench
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Constitute daily hearings for Section 64 reference disputes and stay vacatur.
              </p>
            </div>
            <input
              type="checkbox"
              checked={disputeFastTrack}
              onChange={(e) => setDisputeFastTrack(e.target.checked)}
              className="w-5 h-5 accent-[#0B3520] cursor-pointer shrink-0 mt-1"
            />
          </div>

          {/* Variable 3: Special Tahsildar Camps */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0B3520]" />
                <span className="font-bold text-gray-900">
                  On-Spot Village Khatedar Succession Verification Camps
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Deploy mobile revenue teams to clear 38 pending joint succession certifications.
              </p>
            </div>
            <input
              type="checkbox"
              checked={tahsildarCamp}
              onChange={(e) => setTahsildarCamp(e.target.checked)}
              className="w-5 h-5 accent-[#0B3520] cursor-pointer shrink-0 mt-1"
            />
          </div>

          {/* Variable 4: R&R Gram Sabha Alignment */}
          <div className="space-y-2 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-[#0B3520]" />
                <span className="font-bold text-gray-900">
                  Gram Sabha Resettlement Consensus Level:
                </span>
              </div>
              <span className="font-mono font-bold text-[#0B3520] text-sm">{rrConsensus}%</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Enhanced upfront resettlement annuities to achieve unanimous village resolutions.
            </p>
            <input
              type="range"
              min="50"
              max="100"
              value={rrConsensus}
              onChange={(e) => setRrConsensus(Number(e.target.value))}
              className="w-full accent-[#0B3520] cursor-pointer"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#144d31] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>Re-run ML Prediction With Policy Parameters</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
