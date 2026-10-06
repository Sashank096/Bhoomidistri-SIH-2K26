import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2, ShieldCheck, Database, Layers } from 'lucide-react';

interface ValidationRevalidateModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const ValidationRevalidateModal: React.FC<ValidationRevalidateModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    { label: 'Required fields (Survey No, Family ID, Compensation)', key: 'required' },
    { label: 'Data types and coordinate boundaries', key: 'datatypes' },
    { label: 'Logical consistency & Financial balance (PFMS)', key: 'logic' },
    { label: 'Duplicate records & Aadhaar token uniqueness', key: 'duplicates' },
    { label: 'Reference integrity with DoLR State Land Registry', key: 'registry' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return steps.length;
        }
        return prev + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, onComplete, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="bg-[#0B3520] text-white p-5 border-b border-[#EAB308]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RotateCw className="w-5 h-5 text-[#EAB308] animate-spin" />
            <h3 className="text-base font-bold">Running Data Validation Engine</h3>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-bold">
            DoLR Gateway
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-gray-700">
          <div className="text-center space-y-1">
            <p className="font-semibold text-gray-900 text-sm">
              Executing multi-point schema and relational checks...
            </p>
            <p className="text-gray-500 text-xs">
              Verifying 2,453 submitted records against BhoomiDrishti data constraints.
            </p>
          </div>

          {/* Progressive Checklist */}
          <div className="space-y-2.5 bg-gray-50 p-4 rounded-xl border border-gray-200">
            {steps.map((step, idx) => {
              const isPassed = currentStep > idx;
              const isCurrent = currentStep === idx;

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-2.5 text-xs transition-colors ${
                    isPassed
                      ? 'text-emerald-900 font-semibold'
                      : isCurrent
                      ? 'text-[#0B3520] font-bold'
                      : 'text-gray-400'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[#0B3520] animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>

          <div className="text-center font-mono text-[11px] text-gray-400">
            Validation Rule Suite: v2.4 (RFCTLARR Act Compliance)
          </div>
        </div>
      </div>
    </div>
  );
};
