import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

interface RevalidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteRevalidation: (autoFix: boolean) => void;
}

export const RevalidationModal: React.FC<RevalidationModalProps> = ({
  isOpen,
  onClose,
  onCompleteRevalidation,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [autoFixSelected, setAutoFixSelected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const verificationStages = [
    { name: 'Schema & Required Fields Ingestion', description: 'Checking 2,453 records for missing mandatory fields' },
    { name: 'Range Limits & Numeric Bounds', description: 'Validating parcel area, solatium multipliers, and compensation' },
    { name: 'Cross-table Relational Integrity', description: 'Verifying family IDs against cadastral parcels and DoLR GIS nodes' },
    { name: 'Duplicate & Uniqueness Auditing', description: 'Scanning for duplicate survey numbers, Aadhaar hashes, and Khasras' },
    { name: 'Statutory Gazettes & Date Chronology', description: 'Checking Section 4(1)/19 notices, award determinations, and possession dates' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setProgress(0);
      setActiveStep(0);
      setLogs([]);
    }
  }, [isOpen]);

  const handleStartValidation = (withAutoFix = false) => {
    setAutoFixSelected(withAutoFix);
    setIsRunning(true);
    setProgress(5);
    setActiveStep(0);
    setLogs([
      `[${new Date().toLocaleTimeString()}] Initializing BhoomiDrishti Automated Integrity Engine v4.2...`,
      `[${new Date().toLocaleTimeString()}] Ingesting active project snapshot (PRJ-1042)...`,
    ]);

    // Step 1
    setTimeout(() => {
      setProgress(25);
      setActiveStep(1);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Schema Check: Evaluated 2,453 entries across 9 data sections.`,
        withAutoFix
          ? `[${new Date().toLocaleTimeString()}] [AUTO-FIX] Populated missing compensation schedules and baseline parcel bounds.`
          : `[${new Date().toLocaleTimeString()}] Found 8 unpopulated compensation fields in Kathipudi & Gollaprolu.`,
      ]);
    }, 700);

    // Step 2
    setTimeout(() => {
      setProgress(50);
      setActiveStep(2);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Range & Numeric: Computed solatium formulas and area bounds.`,
        withAutoFix
          ? `[${new Date().toLocaleTimeString()}] [AUTO-FIX] Normalized 3 zero-area cadastral records to surveyed acreage.`
          : `[${new Date().toLocaleTimeString()}] Flagged 3 parcel area records with 0.00 Acres.`,
      ]);
    }, 1400);

    // Step 3
    setTimeout(() => {
      setProgress(75);
      setActiveStep(3);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Relational Checks: Cadastral parcel IDs reconciled with state DoLR master database.`,
        `[${new Date().toLocaleTimeString()}] Uniqueness: 0 duplicate survey numbers found.`,
      ]);
    }, 2100);

    // Step 4 & Complete
    setTimeout(() => {
      setProgress(100);
      setActiveStep(4);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Date Chronology & Statutory Documents audited.`,
        withAutoFix
          ? `[${new Date().toLocaleTimeString()}] ✓ REVALIDATION COMPLETE: 0 Critical Errors, 0 Warnings. Dataset READY for ML Pipeline.`
          : `[${new Date().toLocaleTimeString()}] ⚠ REVALIDATION COMPLETE: 3 Critical Issues persist. ML Pipeline Gating active.`,
      ]);

      setTimeout(() => {
        setIsRunning(false);
        onCompleteRevalidation(withAutoFix);
      }, 900);
    }, 2800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="p-5 bg-[#0B3520] text-white border-b border-[#EAB308]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]">
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Automated Data Revalidation Engine</h2>
              <p className="text-xs text-white/70">
                Execute comprehensive integrity, schema, and relational verification checks.
              </p>
            </div>
          </div>

          {!isRunning && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-gray-700">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Overall Engine Verification Progress</span>
              <span className="font-mono text-[#0B3520]">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0B3520] transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 5 Stages List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Verification Checkpoints
            </h3>

            <div className="space-y-2">
              {verificationStages.map((stage, idx) => {
                const isPassed = activeStep > idx || progress === 100;
                const isCurrent = activeStep === idx && isRunning;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                      isPassed
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isCurrent
                        ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{stage.name}</div>
                        <div className="text-[11px] text-gray-500">{stage.description}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCurrent
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isPassed ? 'PASSED' : isCurrent ? 'RUNNING' : 'QUEUED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Engine Console Output */}
          {logs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Live Engine Execution Logs
              </span>
              <div className="p-3 bg-gray-950 text-emerald-400 font-mono text-[11px] rounded-xl border border-gray-800 max-h-32 overflow-y-auto space-y-1">
                {logs.map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStartValidation(true)}
              disabled={isRunning}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Fixes all mock invalid records and completes validation"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Revalidate &amp; Auto-Fix</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartValidation(false)}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running Checks...' : 'Run Standard Revalidation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
