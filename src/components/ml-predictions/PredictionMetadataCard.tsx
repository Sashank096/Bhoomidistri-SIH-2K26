import React, { useState } from 'react';
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  FileCode,
  Layers,
  Database,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { PredictionMetadata } from '../../types';

interface PredictionMetadataCardProps {
  metadata: PredictionMetadata;
}

export const PredictionMetadataCard: React.FC<PredictionMetadataCardProps> = ({
  metadata,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <span>ML Model &amp; Prediction Provenance Metadata</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                {metadata.modelVersion}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Traceability parameters, training architecture, and algorithmic audit identifiers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#0B3520]">
          <span>{isExpanded ? 'Hide Details' : 'View Model Details'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Grid */}
      {isExpanded && (
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4 animate-fadeIn text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Model Version */}
            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Model Version
              </span>
              <div className="font-mono font-bold text-[#0B3520] text-xs">
                {metadata.modelVersion}
              </div>
              <p className="text-[10px] text-gray-500">Official DoLR ML Release</p>
            </div>

            {/* 2. Prediction ID */}
            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Prediction UUID
              </span>
              <div className="font-mono font-bold text-gray-900 text-xs">
                {metadata.predictionId}
              </div>
              <p className="text-[10px] text-gray-500">Immutable Ledger Hash</p>
            </div>

            {/* 3. Dataset Snapshot */}
            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Dataset Snapshot
              </span>
              <div className="font-mono font-bold text-gray-900 text-xs">
                {metadata.datasetVersion}
              </div>
              <p className="text-[10px] text-gray-500">Validated 2,453 records</p>
            </div>

            {/* 4. Timestamp */}
            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Inference Timestamp
              </span>
              <div className="font-mono font-bold text-gray-900 text-xs">
                {metadata.predictionTimestamp}
              </div>
              <p className="text-[10px] text-gray-500">IST (UTC+05:30)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Architecture Details */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-1.5 md:col-span-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Algorithmic Pipeline &amp; Features
              </span>
              <div className="font-semibold text-gray-900 text-xs">
                {metadata.modelType}
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                <strong>Feature Set:</strong> {metadata.featureSetVersion} comprising cadastral boundary geometry, compensation escrow balance ratios, court stay history, and DoLR state historical pace.
              </p>
              <div className="text-[10px] text-gray-500 font-mono">
                Training Scope: {metadata.trainingDataScope}
              </div>
            </div>

            {/* Statistical Performance */}
            <div className="p-3.5 bg-white rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>Statistical Validation</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-600">Model Accuracy:</span>
                <span className="font-mono font-bold text-emerald-900">{metadata.accuracyScore}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">AUC-ROC Metric:</span>
                <span className="font-mono font-bold text-emerald-900">{metadata.aucRoc}</span>
              </div>
              <div className="text-[10px] text-gray-500 font-mono pt-1">
                {metadata.confidenceInterval}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
