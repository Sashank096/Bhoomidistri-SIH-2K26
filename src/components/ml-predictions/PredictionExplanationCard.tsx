import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  Scale,
  IndianRupee,
  Users2,
  Building2,
  FileCheck2,
  Compass,
} from 'lucide-react';
import { MlPredictionResult } from '../../types';

interface PredictionExplanationCardProps {
  prediction: MlPredictionResult;
  onProceedToRiskAnalysis: () => void;
  onNavigateToDataValidation: () => void;
}

export const PredictionExplanationCard: React.FC<PredictionExplanationCardProps> = ({
  prediction,
  onProceedToRiskAnalysis,
  onNavigateToDataValidation,
}) => {
  const { summaryExplanation, topRiskContributors, overall } = prediction;

  const getContributorIcon = (stage: string) => {
    switch (stage) {
      case 'Legal':
        return Scale;
      case 'Compensation':
        return IndianRupee;
      case 'R&R':
        return Users2;
      case 'Verification':
        return Building2;
      default:
        return FileCheck2;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#0B3520]">
            <Sparkles className="w-4 h-4 text-[#EAB308]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Machine Learning Prediction Summary &amp; Diagnostic Insights
            </h2>
            <p className="text-xs text-gray-500">
              Automated narrative synthesis derived from ensemble tree inference gradients
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToRiskAnalysis}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#144d31] transition-all shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <span>Deep-Dive Risk Analysis &amp; XAI</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#EAB308]" />
        </button>
      </div>

      {/* Narrative Summary Box */}
      <div className="p-4 rounded-xl bg-[#F9FBFA] border border-emerald-100 text-xs text-gray-800 leading-relaxed space-y-2">
        <div className="font-bold text-[#0B3520] flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#EAB308]" />
          <span>Model Inference Diagnosis:</span>
        </div>
        <p className="text-gray-700 font-medium">
          {summaryExplanation}
        </p>
      </div>

      {/* Top 4 Contributing Bottlenecks */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold text-gray-900">
          Primary Delay Vulnerability Contributors (Feature Importance Weights):
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topRiskContributors.slice(0, 4).map((item, idx) => {
            const Icon = getContributorIcon(item.stage);

            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-gray-200 bg-white hover:border-[#0B3520]/40 transition-colors space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">{item.factor}</div>
                      <span className="text-[10px] text-gray-500 font-medium">
                        Stage: <strong>{item.stage}</strong>
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 shrink-0">
                    {item.impactPercentage}% Impact
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 leading-snug">
                  {item.description}
                </p>

                {/* Mini Bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full"
                    style={{ width: `${item.impactPercentage * 2}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
