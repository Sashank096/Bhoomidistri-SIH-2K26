import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  Database,
  Building2,
  Calendar,
  MapPin,
  FileCheck2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AdminUser,
  ValidationCheck,
  ValidationIssue,
  ValidationSummaryResult,
  UserRole,
} from '../../types';
import {
  INITIAL_VALIDATION_RESULT,
  INITIAL_VALIDATION_CHECKS,
  INITIAL_VALIDATION_ISSUES,
} from '../../data/validationData';
import { ValidationStatusBanner } from './ValidationStatusBanner';
import { ValidationKpiCards } from './ValidationKpiCards';
import { ValidationChecksSummaryTable } from './ValidationChecksSummaryTable';
import { ValidationOverviewChart } from './ValidationOverviewChart';
import { RecentValidationIssuesTable } from './RecentValidationIssuesTable';
import { IssueDetailsDrawer } from './IssueDetailsDrawer';
import { NextStepsPanel } from './NextStepsPanel';
import { ActionPanel } from './ActionPanel';
import { ValidationRevalidateModal } from './ValidationRevalidateModal';
import { IgnoreWarningModal } from './IgnoreWarningModal';

interface DataValidationDashboardProps {
  userRole?: UserRole;
  onNavigateToDataInput: (dataset?: string) => void;
  onNavigateToPredictions: () => void;
  onNavigateToProjects?: () => void;
}

export const DataValidationDashboard: React.FC<DataValidationDashboardProps> = ({
  userRole = 'Administrator',
  onNavigateToDataInput,
  onNavigateToPredictions,
  onNavigateToProjects,
}) => {
  const isViewer = userRole === 'Viewer';
  const canEdit = !isViewer;

  // Primary State
  const [validationResult, setValidationResult] = useState<ValidationSummaryResult>(INITIAL_VALIDATION_RESULT);
  const [issues, setIssues] = useState<ValidationIssue[]>(INITIAL_VALIDATION_ISSUES);
  const [checks, setChecks] = useState<ValidationCheck[]>(INITIAL_VALIDATION_CHECKS);

  // Selected issue for Drawer
  const [selectedIssue, setSelectedIssue] = useState<ValidationIssue | null>(null);
  
  // Modal states
  const [isRevalidatingModalOpen, setIsRevalidatingModalOpen] = useState(false);
  const [warningToIgnore, setWarningToIgnore] = useState<ValidationIssue | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute live counts and status
  const liveStats = useMemo(() => {
    const openErrors = issues.filter(
      (i) => (i.severity === 'ERROR' || i.severity === 'CRITICAL') && i.status === 'Open'
    );
    const openWarnings = issues.filter(
      (i) => i.severity === 'WARNING' && i.status === 'Open'
    );

    const totalRecords = validationResult.totalRecords;
    const errorsCount = openErrors.length > 0 ? 187 : 0;
    const warningsCount = openWarnings.length > 0 ? (openWarnings.length === issues.filter(i => i.severity === 'WARNING').length ? 82 : openWarnings.length * 15) : 0;
    const validRecords = totalRecords - errorsCount - warningsCount;
    const mlReady = errorsCount === 0;

    return {
      totalRecords,
      validRecords,
      errorsCount,
      warningsCount,
      mlReady,
      openErrorsCount: openErrors.length,
      openWarningsCount: openWarnings.length,
    };
  }, [issues, validationResult.totalRecords]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handler: Revalidate Trigger
  const handleStartRevalidation = () => {
    if (!canEdit) return;
    setIsRevalidatingModalOpen(true);
  };

  const handleRevalidationComplete = () => {
    setIsRevalidatingModalOpen(false);
    const now = new Date();
    const formattedDate = `${now.getDate()} Aug 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    setValidationResult((prev) => ({
      ...prev,
      validatedOn: formattedDate,
      mlReady: liveStats.errorsCount === 0,
    }));

    showToast(`Validation completed successfully. ${liveStats.errorsCount} errors and ${liveStats.warningsCount} warnings found.`);
  };

  // Handler: Fix Data navigation
  const handleFixData = (issue?: ValidationIssue) => {
    if (!canEdit) return;
    const targetDataset = issue ? (typeof issue.dataset === 'string' ? issue.dataset : 'compensation') : 'compensation';
    onNavigateToDataInput(targetDataset);
  };

  // Handler: Ignore Warning flow
  const handlePromptIgnoreWarning = (issue: ValidationIssue) => {
    if (!canEdit) return;
    setWarningToIgnore(issue);
  };

  const handleConfirmIgnoreWarning = (issue: ValidationIssue, reason: string) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === issue.id
          ? {
              ...item,
              status: 'Ignored',
              ignoredBy: userRole,
              ignoredAt: new Date().toLocaleDateString(),
              ignoredReason: reason,
            }
          : item
      )
    );

    // Also update associated check
    setChecks((prev) =>
      prev.map((c) => (c.errorCode === issue.errorCode ? { ...c, status: 'PASSED', recordsAffected: 0 } : c))
    );

    if (selectedIssue && selectedIssue.id === issue.id) {
      setSelectedIssue(null);
    }

    showToast(`Warning [${issue.errorCode}] ignored. Audit log entry recorded.`);
  };

  const handleIgnoreAllWarnings = () => {
    if (!canEdit) return;
    setIssues((prev) =>
      prev.map((item) =>
        item.severity === 'WARNING'
          ? {
              ...item,
              status: 'Ignored',
              ignoredBy: userRole,
              ignoredAt: new Date().toLocaleDateString(),
              ignoredReason: 'Mass acknowledged by project authority',
            }
          : item
      )
    );
    setChecks((prev) =>
      prev.map((c) => (c.status === 'WARNING' ? { ...c, status: 'PASSED', recordsAffected: 0 } : c))
    );
    showToast('All non-blocking warnings acknowledged and logged to NIC audit.');
  };

  // Simulation Toggle: Fix all errors to test "DATA READY FOR ML PROCESSING" state
  const handleSimulateResolveAllErrors = () => {
    if (!canEdit) return;
    const hasOpenErrors = issues.some((i) => i.severity === 'ERROR' && i.status === 'Open');

    if (hasOpenErrors) {
      // Resolve errors
      setIssues((prev) =>
        prev.map((i) => (i.severity === 'ERROR' ? { ...i, status: 'Resolved' } : i))
      );
      setChecks((prev) =>
        prev.map((c) => (c.status === 'FAILED' ? { ...c, status: 'PASSED', recordsAffected: 0 } : c))
      );
      showToast('All blocking errors resolved in Data Input! Revalidating automatically...');
      setTimeout(() => {
        setIsRevalidatingModalOpen(true);
      }, 500);
    } else {
      // Reset back to initial errors
      setIssues(INITIAL_VALIDATION_ISSUES);
      setChecks(INITIAL_VALIDATION_CHECKS);
      showToast('Demo dataset reset to initial state with 187 blocking errors.');
    }
  };

  const scrollToIssuesTable = () => {
    const el = document.getElementById('recent-validation-issues-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 text-xs flex items-center gap-2.5 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-[#EAB308]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-gray-500 font-medium">
        <ol className="flex items-center gap-2">
          <li>
            <button
              type="button"
              onClick={onNavigateToProjects}
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              Projects
            </button>
          </li>
          <li className="text-gray-400">&gt;</li>
          <li className="font-mono text-gray-700 font-semibold">{validationResult.projectId}</li>
          <li className="text-gray-400">&gt;</li>
          <li className="text-[#0B3520] font-bold">Data Validation</li>
        </ol>
      </nav>

      {/* 2. Page Header & Project Info */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-950 tracking-tight font-display">
              Data Validation Results
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
              {validationResult.projectId}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-normal">
            Validation results for project data before ML pipeline processing.
          </p>

          {/* Project Metadata Tags */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              <Building2 className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500">Project:</span>
              <strong className="text-gray-900">{validationResult.projectId} — {validationResult.projectName}</strong>
            </div>

            <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500">Location:</span>
              <strong className="text-gray-900">{validationResult.location}</strong>
            </div>

            <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500">Validated On:</span>
              <strong className="text-gray-900 font-mono">{validationResult.validatedOn}</strong>
            </div>
          </div>
        </div>

        {/* Right Header Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canEdit && (
            <button
              type="button"
              onClick={handleSimulateResolveAllErrors}
              title="Toggle all blocking errors to test both 'Requires Attention' and 'Ready for ML' views"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B3520] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{liveStats.errorsCount > 0 ? 'Fix All Errors (Demo)' : 'Restore Demo Errors'}</span>
            </button>
          )}

          {canEdit && (
            <button
              type="button"
              id="btn-header-revalidate"
              onClick={handleStartRevalidation}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#0B3520] bg-white hover:bg-[#0B3520]/5 border-2 border-[#0B3520] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#0B3520]" />
              <span>↻ Revalidate</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Validation Status Banner */}
      <ValidationStatusBanner
        errorsCount={liveStats.errorsCount}
        warningsCount={liveStats.warningsCount}
        mlReady={liveStats.mlReady}
        onViewCriticalIssues={scrollToIssuesTable}
        onProceedToMl={onNavigateToPredictions}
      />

      {/* 4. Summary KPI Cards */}
      <ValidationKpiCards
        totalRecords={liveStats.totalRecords}
        validRecords={liveStats.validRecords}
        errorsCount={liveStats.errorsCount}
        warningsCount={liveStats.warningsCount}
      />

      {/* 5. Main Grid: Validation Checks Summary (8 cols) & Overview Chart (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ValidationChecksSummaryTable
            checks={checks}
            onSelectCheck={(check) => {
              const matchedIssue = issues.find((i) => i.errorCode === check.errorCode);
              if (matchedIssue) {
                setSelectedIssue(matchedIssue);
              } else {
                showToast(`Rule [${check.errorCode}] — ${check.name} is currently fully satisfied.`);
              }
            }}
          />
        </div>

        <div className="lg:col-span-4">
          <ValidationOverviewChart
            totalRecords={liveStats.totalRecords}
            validRecords={liveStats.validRecords}
            errorsCount={liveStats.errorsCount}
            warningsCount={liveStats.warningsCount}
          />
        </div>
      </div>

      {/* 6. Recent Validation Issues Table */}
      <RecentValidationIssuesTable
        issues={issues}
        onSelectIssue={(issue) => setSelectedIssue(issue)}
        onFixData={(issue) => handleFixData(issue)}
      />

      {/* 7. Next Steps & Workflow Pipeline */}
      <NextStepsPanel
        errorsCount={liveStats.errorsCount}
        warningsCount={liveStats.warningsCount}
        mlReady={liveStats.mlReady}
        onFixData={() => handleFixData()}
        onRevalidate={handleStartRevalidation}
        onProceedToMl={onNavigateToPredictions}
        canEdit={canEdit}
      />

      {/* 8. Action Panel */}
      <ActionPanel
        errorsCount={liveStats.errorsCount}
        warningsCount={liveStats.warningsCount}
        mlReady={liveStats.mlReady}
        onFixData={() => handleFixData()}
        onIgnoreAllWarnings={handleIgnoreAllWarnings}
        onRevalidate={handleStartRevalidation}
        onProceedToMl={onNavigateToPredictions}
        canEdit={canEdit}
      />

      {/* 9. Modals & Drawers */}
      <IssueDetailsDrawer
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onFixData={(issue) => {
          setSelectedIssue(null);
          handleFixData(issue);
        }}
        onPromptIgnoreWarning={(issue) => {
          handlePromptIgnoreWarning(issue);
        }}
        canEdit={canEdit}
      />

      <ValidationRevalidateModal
        isOpen={isRevalidatingModalOpen}
        onComplete={handleRevalidationComplete}
      />

      <IgnoreWarningModal
        issue={warningToIgnore}
        isOpen={!!warningToIgnore}
        onClose={() => setWarningToIgnore(null)}
        onConfirm={handleConfirmIgnoreWarning}
      />
    </div>
  );
};
