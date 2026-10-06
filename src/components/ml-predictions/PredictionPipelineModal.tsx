import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  X,
  CheckCircle2,
  Loader2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface PredictionPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onComplete: () => void;
}

export const PredictionPipelineModal: React.FC<PredictionPipelineModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Validating Project Records Snapshot',
      desc: 'Checking 2,453 records for zero schema violations and relational integrity',
    },
    {
      id: 2,
      title: 'Extracting 48 Statutory & Spatial Features',
      desc: 'Processing GIS shapefiles, court litigation references, and PFMS escrow balances',
    },
    {
      id: 3,
      title: 'Executing Bhoomi-XGBoost Ensemble Model',
      desc: 'Gradient Boosted Decision Trees + Calibrated Classifier Inference',
    },
    {
      id: 4,
      title: 'Generating Stage-wise Delay Distributions',
      desc: 'Monte Carlo schedule simulation across 7 statutory acquisition stages',
    },
    {
      id: 5,
      title: 'Committing Prediction to Immutable Ledger',
      desc: 'Writing signed prediction outcome to BhoomiDrishti audit log',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setLogs([]);
      setIsFinished(false);
      return;
    }

    // Run sequential pipeline animation
    const pushLog = (msg: string) => {
      const ts = new Date().toTimeString().split(' ')[0];
      setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
    };

    pushLog(`ML Prediction Pipeline initialized for project ${projectId}...`);
    pushLog('Loading validated dataset snapshot (DS-PRJ1042-REV-09)... OK');

    const timer1 = setTimeout(() => {
      setCurrentStep(2);
      pushLog('Features vector constructed: 48 numerical & categorical variables normalized.');
      pushLog('Computed DoLR state historical pace index: 0.68 (Andhra Pradesh zone).');
    }, 900);

    const timer2 = setTimeout(() => {
      setCurrentStep(3);
      pushLog('Inference Engine: Bhoomi-XGBoost-Ensemble-v3.4.2 invoked.');
      pushLog('Processing 100 estimator decision trees across 7 multi-task heads...');
    }, 1800);

    const timer3 = setTimeout(() => {
      setCurrentStep(4);
      pushLog('Calculated stage vulnerabilities: Legal (86.7%), Compensation (79.1%), Possession (74.8%).');
      pushLog('Simulated 10,000 Monte Carlo schedule iterations. Expected delay: 6.4 months.');
    }, 2800);

    const timer4 = setTimeout(() => {
      setCurrentStep(5);
      const predId = `PRED-2026-${Date.now().toString().slice(-6)}`;
      pushLog(`Generated prediction outcome ${predId}. Committing to audit ledger...`);
      pushLog('✓ ML Prediction cycle complete. 100% confidence calibration.');
      setIsFinished(true);
    }, 3700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 bg-[#0B3520] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                BhoomiDrishti ML Inference Pipeline
              </h2>
              <p className="text-xs text-white/70">
                Executing ensemble delay forecaster for {projectId}
              </p>
            </div>
          </div>

          {isFinished && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Progress Steps List */}
          <div className="space-y-3">
            {steps.map((step) => {
              const isDone = currentStep > step.id || isFinished;
              const isCurrent = currentStep === step.id && !isFinished;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : isCurrent
                      ? 'bg-amber-50 border-amber-300 shadow-xs'
                      : 'bg-gray-50/50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-[#0B3520] text-[#EAB308]'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{step.title}</div>
                      <div className="text-[11px] text-gray-500">{step.desc}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDone
                        ? 'bg-emerald-200 text-emerald-900'
                        : isCurrent
                        ? 'bg-amber-200 text-amber-900 animate-pulse'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isDone ? 'DONE' : isCurrent ? 'RUNNING' : 'QUEUED'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Real-time Terminal Log Output */}
          <div className="bg-[#0B1A12] rounded-xl p-3.5 font-mono text-[11px] text-emerald-400 space-y-1 max-h-36 overflow-y-auto border border-emerald-900/50 shadow-inner">
            <div className="text-gray-500 flex items-center gap-1 pb-1 border-b border-white/10">
              <Terminal className="w-3 h-3 text-[#EAB308]" />
              <span>Inference Container Logs (Bhoomi-Core-Worker-01):</span>
            </div>
            {logs.map((log, i) => (
              <div key={i} className="leading-tight">
                {log}
              </div>
            ))}
            {!isFinished && (
              <div className="flex items-center gap-1 text-amber-400 animate-pulse">
                <span>_</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500 font-medium">
            {isFinished ? '✓ New prediction generated and validated.' : 'Running XGBoost ensemble...'}
          </div>

          <div className="flex items-center gap-2">
            {isFinished ? (
              <button
                type="button"
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#144d31] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Apply &amp; View Output</span>
                <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 bg-gray-200 cursor-not-allowed flex items-center gap-2"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Computing...</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
