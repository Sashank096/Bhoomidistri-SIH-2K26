import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ValidationCheck,
  ValidationIssue,
  ProjectDataAuditLog,
  DataSectionId,
  UserRole,
} from '../types';
import {
  INITIAL_VALIDATION_CHECKS,
  INITIAL_VALIDATION_ISSUES,
  INITIAL_VALIDATION_AUDIT_TRAIL,
} from '../data/validationData';
import { ValidationHeaderAndBanner } from './data-validation/ValidationHeaderAndBanner';
import { ValidationKpiCards } from './data-validation/ValidationKpiCards';
import { ValidationChecksTable } from './data-validation/ValidationChecksTable';
import { ValidationOverviewChart } from './data-validation/ValidationOverviewChart';
import { ValidationIssuesList } from './data-validation/ValidationIssuesList';
import { IssueDetailsDrawer } from './data-validation/IssueDetailsDrawer';
import { NextStepsAndActionPanel } from './data-validation/NextStepsAndActionPanel';
import { RevalidationModal } from './data-validation/RevalidationModal';
import { IgnoreWarningModal } from './data-validation/IgnoreWarningModal';
import { ValidationAuditLogModal } from './data-validation/ValidationAuditLogModal';

interface DataValidationViewProps {
  userRole?: UserRole;
  projectId?: string;
  projectName?: string;
  location?: string;
  onNavigateToDataInput: (dataset?: DataSectionId | string) => void;
  onProceedToMlPipeline: () => void;
}

export const DataValidationView: React.FC<DataValidationViewProps> = ({
  userRole = 'Administrator',
  projectId = 'PRJ-1042',
  projectName = 'NH-216 Land Acquisition',
  location = 'Andhra Pradesh',
  onNavigateToDataInput,
  onProceedToMlPipeline,
}) => {
  const [totalRecords, setTotalRecords] = useState(2453);
  const [checks, setChecks] = useState<ValidationCheck[]>(INITIAL_VALIDATION_CHECKS);
  const [issues, setIssues] = useState<ValidationIssue[]>(INITIAL_VALIDATION_ISSUES);
  const [auditLogs, setAuditLogs] = useState<ProjectDataAuditLog[]>(INITIAL_VALIDATION_AUDIT_TRAIL);

  const [validatedOn, setValidatedOn] = useState('28 Aug 2026, 07:52 PM');
  const [isValidating, setIsValidating] = useState(false);

  // Modals & Drawers state
  const [selectedIssueForDrawer, setSelectedIssueForDrawer] = useState<ValidationIssue | null>(null);
  const [ignoreModalIssue, setIgnoreModalIssue] = useState<ValidationIssue | null>(null);
  const [isRevalidateModalOpen, setIsRevalidateModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Derived counts
  const activeErrorIssues = useMemo(
    () => issues.filter((i) => (i.severity === 'ERROR' || i.severity === 'CRITICAL') && i.status === 'Open'),
    [issues]
  );

  const activeWarningIssues = useMemo(
    () => issues.filter((i) => i.severity === 'WARNING' && i.status === 'Open'),
    [issues]
  );

  const errorsCount = useMemo(() => {
    return activeErrorIssues.reduce((sum, i) => sum + i.recordsAffected, 0);
  }, [activeErrorIssues]);

  const warningsCount = useMemo(() => {
    return activeWarningIssues.reduce((sum, i) => sum + i.recordsAffected, 0);
  }, [activeWarningIssues]);

  const validRecords = useMemo(() => {
    return Math.max(0, totalRecords - errorsCount - warningsCount);
  }, [totalRecords, errorsCount, warningsCount]);

  const isMlReady = errorsCount === 0;

  // Handlers
  const handleSelectCheck = (check: ValidationCheck) => {
    const matchingIssue = issues.find((i) => i.errorCode === check.errorCode);
    if (matchingIssue) {
      setSelectedIssueForDrawer(matchingIssue);
    } else {
      showToast(`Check ${check.name} (${check.errorCode}) is currently ${check.status}.`);
    }
  };

  const handleFixData = (dataset: DataSectionId | string, issue?: ValidationIssue) => {
    if (selectedIssueForDrawer) setSelectedIssueForDrawer(null);
    showToast(`Redirecting to Data Input [${dataset.toUpperCase()}] section...`);
    onNavigateToDataInput(dataset);
  };

  const handleResolveIssue = (issueId: string) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === issueId ? { ...iss, status: 'Resolved' } : iss))
    );

    const target = issues.find((i) => i.id === issueId);
    if (target) {
      // Update check table status
      setChecks((prev) =>
        prev.map((c) =>
          c.errorCode === target.errorCode
            ? { ...c, status: 'PASSED', recordsAffected: 0 }
            : c
        )
      );

      // Add to audit trail
      const newLog: ProjectDataAuditLog = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        user: `${userRole} (Session Active)`,
        action: 'VALIDATION_ERROR_RESOLVED',
        projectId,
        dataset: target.datasetLabel,
        rowsAffected: target.recordsAffected,
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        result: 'SUCCESS',
        details: `Resolved validation issue ${target.errorCode} (${target.issueDescription}).`,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }

    if (selectedIssueForDrawer?.id === issueId) {
      setSelectedIssueForDrawer(null);
    }

    showToast('Issue marked as Resolved. Validation scores updated.');
  };

  const handleConfirmIgnoreWarning = (issueId: string, justification: string) => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              status: 'Ignored',
              ignoredBy: userRole,
              ignoredAt: new Date().toLocaleTimeString(),
              ignoredReason: justification,
            }
          : iss
      )
    );

    const target = issues.find((i) => i.id === issueId);
    if (target) {
      // Add audit log
      const newLog: ProjectDataAuditLog = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        user: `${userRole} (Authorized)`,
        action: 'WARNING_IGNORED',
        projectId,
        dataset: target.datasetLabel,
        rowsAffected: target.recordsAffected,
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        result: 'SUCCESS',
        details: `Warning overridden: ${target.issueDescription}. Justification: "${justification}"`,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }

    setIgnoreModalIssue(null);
    if (selectedIssueForDrawer?.id === issueId) {
      setSelectedIssueForDrawer(null);
    }
    showToast('Warning successfully ignored and logged to audit trail.');
  };

  const handleIgnoreAllWarnings = () => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.severity === 'WARNING'
          ? {
              ...iss,
              status: 'Ignored',
              ignoredBy: userRole,
              ignoredAt: new Date().toLocaleTimeString(),
              ignoredReason: 'Bulk override authorized by administrator for exploratory ML pipeline run.',
            }
          : iss
      )
    );

    const newLog: ProjectDataAuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      user: `${userRole}`,
      action: 'WARNING_IGNORED',
      projectId,
      dataset: 'All Sections',
      timestamp: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      result: 'SUCCESS',
      details: 'All non-blocking warnings bulk-ignored for ML analysis run.',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    showToast('All non-blocking warnings ignored.');
  };

  const handleCompleteRevalidation = (autoFix: boolean) => {
    setIsRevalidateModalOpen(false);
    setValidatedOn(
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    if (autoFix) {
      // Mark all issues as resolved
      setIssues((prev) => prev.map((iss) => ({ ...iss, status: 'Resolved' })));
      setChecks((prev) =>
        prev.map((chk) => ({ ...chk, status: 'PASSED', recordsAffected: 0 }))
      );

      const fixLog: ProjectDataAuditLog = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        user: 'Automated Integrity Engine',
        action: 'DATA_CORRECTED',
        projectId,
        dataset: 'All Modules',
        rowsAffected: 187,
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        result: 'SUCCESS',
        details: 'Auto-repaired all 187 critical schema violations. Gating unlocked.',
      };

      const unlockLog: ProjectDataAuditLog = {
        id: `AUD-${Date.now().toString().slice(-4)}b`,
        user: 'ML Pipeline Gatekeeper',
        action: 'ML_PIPELINE_UNLOCKED',
        projectId,
        dataset: 'ML Gateway',
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        result: 'SUCCESS',
        details: 'All critical checks passed (100% integrity). Proceed to ML unlocked.',
      };

      setAuditLogs((prev) => [fixLog, unlockLog, ...prev]);
      showToast('✓ Auto-correction complete: 0 errors remain. ML pipeline unlocked!');
    } else {
      const revalLog: ProjectDataAuditLog = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        user: `${userRole}`,
        action: 'VALIDATION_RETRIED',
        projectId,
        dataset: 'All Modules',
        timestamp: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        result: 'SUCCESS',
        details: 'Standard revalidation cycle finished.',
      };
      setAuditLogs((prev) => [revalLog, ...prev]);
      showToast('Validation checks refreshed.');
    }
  };

  const handleQuickFixAllErrors = () => {
    handleCompleteRevalidation(true);
  };

  const handleScrollToIssues = () => {
    const el = document.getElementById('recent-issues-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 bg-[#0B3520] text-emerald-200 border-2 border-[#EAB308] px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-[#EAB308]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Breadcrumb & Dynamic Status Banner */}
      <ValidationHeaderAndBanner
        projectId={projectId}
        projectName={projectName}
        location={location}
        validatedOn={validatedOn}
        errorsCount={errorsCount}
        warningsCount={warningsCount}
        isMlReady={isMlReady}
        isValidating={isValidating}
        userRole={userRole}
        onRevalidate={() => setIsRevalidateModalOpen(true)}
        onViewCriticalIssues={handleScrollToIssues}
        onProceedToMl={onProceedToMlPipeline}
        onQuickFixAllErrors={handleQuickFixAllErrors}
      />

      {/* 2. Summary KPI Cards */}
      <ValidationKpiCards
        totalRecords={totalRecords}
        validRecords={validRecords}
        errorsCount={errorsCount}
        warningsCount={warningsCount}
      />

      {/* 3. Middle Section: Validation Checks Table (7 cols) + Overview Donut Chart (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <ValidationChecksTable checks={checks} onSelectCheck={handleSelectCheck} />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <ValidationOverviewChart
            totalRecords={totalRecords}
            validRecords={validRecords}
            errorsCount={errorsCount}
            warningsCount={warningsCount}
          />
        </div>
      </div>

      {/* 4. Recent Validation Issues Table */}
      <div id="recent-issues-section">
        <ValidationIssuesList
          issues={issues}
          userRole={userRole}
          onSelectIssue={(iss) => setSelectedIssueForDrawer(iss)}
          onFixData={handleFixData}
        />
      </div>

      {/* 5. Next Steps Panel, Action Panel, & System Workflow */}
      <NextStepsAndActionPanel
        errorsCount={errorsCount}
        warningsCount={warningsCount}
        isMlReady={isMlReady}
        userRole={userRole}
        onFixData={() => onNavigateToDataInput()}
        onIgnoreAllWarnings={handleIgnoreAllWarnings}
        onRevalidate={() => setIsRevalidateModalOpen(true)}
        onProceedToMl={onProceedToMlPipeline}
        onViewAuditTrail={() => setIsAuditModalOpen(true)}
      />

      {/* Slide-out Drawer for Detailed Issue View */}
      <IssueDetailsDrawer
        issue={selectedIssueForDrawer}
        userRole={userRole}
        onClose={() => setSelectedIssueForDrawer(null)}
        onFixData={handleFixData}
        onIgnoreWarningPrompt={(iss) => setIgnoreModalIssue(iss)}
        onResolveIssue={handleResolveIssue}
      />

      {/* Revalidation Modal Engine */}
      <RevalidationModal
        isOpen={isRevalidateModalOpen}
        onClose={() => setIsRevalidateModalOpen(false)}
        onCompleteRevalidation={handleCompleteRevalidation}
      />

      {/* Ignore Warning Justification Modal */}
      <IgnoreWarningModal
        issue={ignoreModalIssue}
        isOpen={!!ignoreModalIssue}
        onClose={() => setIgnoreModalIssue(null)}
        onConfirmIgnore={handleConfirmIgnoreWarning}
      />

      {/* Validation Audit Log Modal */}
      <ValidationAuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />
    </div>
  );
};
