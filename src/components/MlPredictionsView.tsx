import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  MlPredictionResult,
  PredictionHistoryItem,
  StageName,
  StagePredictionItem,
  UserRole,
} from '../types';
import {
  mlPredictionService,
  PredictionSimulationOptions,
} from '../services/mlPredictionService';
import { PredictionHeaderAndBanner } from './ml-predictions/PredictionHeaderAndBanner';
import { PredictionKpiCards } from './ml-predictions/PredictionKpiCards';
import { StageLifecycleFlow } from './ml-predictions/StageLifecycleFlow';
import { StagePredictionsTable } from './ml-predictions/StagePredictionsTable';
import { StageDelayBarChart } from './ml-predictions/StageDelayBarChart';
import { RiskDistributionSummary } from './ml-predictions/RiskDistributionSummary';
import { PredictionExplanationCard } from './ml-predictions/PredictionExplanationCard';
import { PredictionMetadataCard } from './ml-predictions/PredictionMetadataCard';
import { PredictionPipelineModal } from './ml-predictions/PredictionPipelineModal';
import { PredictionHistoryModal } from './ml-predictions/PredictionHistoryModal';
import { ScenarioSimulationModal } from './ml-predictions/ScenarioSimulationModal';
import { ValidationGateBlockedBanner } from './ml-predictions/ValidationGateBlockedBanner';

interface MlPredictionsViewProps {
  userRole?: UserRole;
  projectId?: string;
  projectName?: string;
  location?: string;
  isValidationBlocked?: boolean;
  onNavigateToValidation: () => void;
  onNavigateToRiskAnalysis: () => void;
}

export const MlPredictionsView: React.FC<MlPredictionsViewProps> = ({
  userRole = 'Administrator',
  projectId = 'PRJ-1042',
  projectName = 'NH-216 Land Acquisition',
  location = 'Andhra Pradesh',
  isValidationBlocked = false,
  onNavigateToValidation,
  onNavigateToRiskAnalysis,
}) => {
  const [prediction, setPrediction] = useState<MlPredictionResult | null>(null);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<StageName | null>(null);

  // Modals
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    const loadPredictionData = async () => {
      setIsLoading(true);
      try {
        const pred = await mlPredictionService.getLatestPrediction(
          projectId,
          isValidationBlocked
        );
        const hist = await mlPredictionService.getPredictionHistory(projectId);
        setPrediction(pred);
        setHistory(hist);
      } catch (err) {
        console.error('Failed to load ML prediction:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPredictionData();
  }, [projectId, isValidationBlocked]);

  // Handlers
  const handleTriggerPrediction = () => {
    if (isValidationBlocked || prediction?.status === 'BLOCKED') {
      showToast('Cannot run prediction: Project has unresolved validation errors.');
      return;
    }
    setIsPipelineModalOpen(true);
  };

  const handleCompletePipelineRun = async () => {
    setIsGenerating(true);
    try {
      const updated = await mlPredictionService.executePredictionPipeline(
        projectId,
        (userRole || 'Administrator') as UserRole
      );
      const updatedHist = await mlPredictionService.getPredictionHistory(projectId);
      setPrediction(updated);
      setHistory(updatedHist);
      showToast('✓ ML Inference Complete: Delay probability & stage scores updated.');
    } catch (err) {
      console.error('Pipeline failed:', err);
      showToast('Failed to generate prediction.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySimulation = async (options: PredictionSimulationOptions) => {
    setIsGenerating(true);
    try {
      const simulated = await mlPredictionService.executePredictionPipeline(
        projectId,
        (userRole || 'Administrator') as UserRole,
        options
      );
      const updatedHist = await mlPredictionService.getPredictionHistory(projectId);
      setPrediction(simulated);
      setHistory(updatedHist);
      showToast('✓ Policy scenario simulated: Timeline schedule updated!');
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectStageItem = (stageItem: StagePredictionItem) => {
    setSelectedStage(stageItem.stage);
    showToast(`Filtered details for stage: ${stageItem.stage}`);
  };

  if (isLoading || !prediction) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-8 animate-fadeIn">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0B3520]" />
          <span className="text-sm font-semibold">
            Loading ML prediction models and verified telemetry for {projectId}...
          </span>
        </div>
      </div>
    );
  }

  const isBlocked = isValidationBlocked || prediction.status === 'BLOCKED';

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 bg-[#0B3520] text-emerald-200 border-2 border-[#EAB308] px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-[#EAB308]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Dynamic Status Banner */}
      <PredictionHeaderAndBanner
        projectId={projectId}
        projectName={projectName}
        location={location}
        status={prediction.status}
        isDataFresh={prediction.isDataFresh}
        predictionTimestamp={prediction.metadata.predictionTimestamp}
        dataChangesSincePrediction={prediction.dataChangesSincePrediction}
        userRole={userRole}
        isGenerating={isGenerating}
        onRefreshPrediction={handleTriggerPrediction}
        onOpenSimulation={() => setIsSimulationModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onNavigateToValidation={onNavigateToValidation}
        onNavigateToRiskAnalysis={onNavigateToRiskAnalysis}
      />

      {/* 2. Validation Gating Enforcement Banner */}
      {isBlocked ? (
        <ValidationGateBlockedBanner
          projectId={projectId}
          onNavigateToDataValidation={onNavigateToValidation}
        />
      ) : (
        <>
          {/* 3. Main Prediction Summary KPI Cards */}
          <PredictionKpiCards overall={prediction.overall} />

          {/* 4. Project Lifecycle Horizontal Flow */}
          <StageLifecycleFlow
            stages={prediction.stages}
            selectedStage={selectedStage}
            onSelectStage={(stg) => setSelectedStage(stg)}
          />

          {/* 5. Stage Prediction Table + Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Table (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <StagePredictionsTable
                stages={prediction.stages}
                selectedStage={selectedStage}
                onSelectStage={handleSelectStageItem}
              />
            </div>

            {/* Charts & Distribution (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <StageDelayBarChart
                stages={prediction.stages}
                selectedStage={selectedStage}
                onSelectStage={(stg) => setSelectedStage(stg)}
              />
              <RiskDistributionSummary
                stages={prediction.stages}
                overallRisk={prediction.overall.riskLevel}
              />
            </div>
          </div>

          {/* 6. Diagnostic Explanation & Narrative Synthesis */}
          <PredictionExplanationCard
            prediction={prediction}
            onProceedToRiskAnalysis={onNavigateToRiskAnalysis}
            onNavigateToDataValidation={onNavigateToValidation}
          />

          {/* 7. Provenance & Model Metadata Accordion */}
          <PredictionMetadataCard metadata={prediction.metadata} />
        </>
      )}

      {/* Pipeline Execution Simulator Modal */}
      <PredictionPipelineModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        projectId={projectId}
        onComplete={handleCompletePipelineRun}
      />

      {/* History Modal */}
      <PredictionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        currentPredictionId={prediction.metadata.predictionId}
      />

      {/* What-If Scenario Policy Simulation Modal */}
      <ScenarioSimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        onApplySimulation={handleApplySimulation}
      />
    </div>
  );
};
