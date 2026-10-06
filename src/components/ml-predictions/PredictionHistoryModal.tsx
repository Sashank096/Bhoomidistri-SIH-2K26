import React from 'react';
import { History, X, CheckCircle2, Clock, FileText, Download, ArrowUpRight } from 'lucide-react';
import { PredictionHistoryItem } from '../../types';

interface PredictionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PredictionHistoryItem[];
  currentPredictionId?: string;
  onSelectHistoricalRun?: (item: PredictionHistoryItem) => void;
}

export const PredictionHistoryModal: React.FC<PredictionHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  currentPredictionId,
  onSelectHistoricalRun,
}) => {
  if (!isOpen) return null;

  const handleExportHistory = () => {
    const jsonStr = JSON.stringify(history, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BhoomiDrishti_Prediction_History_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 bg-[#0B3520] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Prediction Version History &amp; Audit Trail</h2>
              <p className="text-xs text-white/70">
                Comparative timeline of previous ML model inference snapshots
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-700">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-gray-500 font-medium">
              Showing {history.length} historical inference runs
            </span>
            <button
              type="button"
              onClick={handleExportHistory}
              className="text-xs font-bold text-[#0B3520] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Prediction History JSON</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <th className="py-3 px-3.5">Prediction ID</th>
                  <th className="py-3 px-3.5">Generated At</th>
                  <th className="py-3 px-3.5">Model / Dataset</th>
                  <th className="py-3 px-3.5">Risk Level</th>
                  <th className="py-3 px-3.5">Delay Prob</th>
                  <th className="py-3 px-3.5">Expected Delay</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Triggered By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item) => {
                  const isCurrent = item.id === currentPredictionId;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isCurrent ? 'bg-emerald-50/70 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="font-mono font-bold text-[#0B3520] flex items-center gap-1.5">
                          <span>{item.id}</span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-gray-600">{item.generatedAt}</td>
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-gray-900">{item.modelVersion}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{item.datasetVersion}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.riskLevel === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : item.riskLevel === 'HIGH'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-gray-900">
                        {item.delayProbability.toFixed(1)}%
                      </td>
                      <td className="py-3 px-3.5 font-mono text-gray-900">
                        +{item.expectedDelayMonths} mo
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'AVAILABLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-gray-600 text-[11px]">{item.triggeredBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
