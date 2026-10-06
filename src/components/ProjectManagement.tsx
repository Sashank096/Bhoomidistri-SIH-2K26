import React, { useState, useMemo } from 'react';
import {
  ProjectRecord,
  UserRole,
  DataSectionId,
  SectionCompletionStatus,
  DataValidationStatus,
  DataEntryMode,
  LandRecordItem,
  AffectedFamilyItem,
  CompensationItem,
  ApprovalItem,
  LegalDisputeItem,
  DocumentItem,
  RrItem,
  PossessionItem,
  StakeholderItem,
  ProjectDataAuditLog,
} from '../types';
import { INITIAL_PROJECTS } from '../data/projectsData';
import { validateProjectDataIntegrity } from '../data/projectIntegrity';
import {
  INITIAL_LAND_RECORDS,
  INITIAL_AFFECTED_FAMILIES,
  INITIAL_COMPENSATION_RECORDS,
  INITIAL_APPROVALS_RECORDS,
  INITIAL_LEGAL_DISPUTES,
  INITIAL_DOCUMENTS,
  INITIAL_RR_RECORDS,
  INITIAL_POSSESSION_RECORDS,
  INITIAL_STAKEHOLDERS,
  INITIAL_DATA_AUDIT_LOGS,
} from '../data/projectDataManagement';
import { ProjectHeaderAndProgress } from './project-management/ProjectHeaderAndProgress';
import { SectionNavSidebar } from './project-management/SectionNavSidebar';
import { ProjectCreationFormSection } from './project-management/ProjectCreationFormSection';
import { DataSectionsViews } from './project-management/DataSectionsViews';
import { DataUploadModule } from './project-management/DataUploadModule';
import { DataStatusAndSubmitPanel } from './project-management/DataStatusAndSubmitPanel';

interface ProjectManagementProps {
  initialProjectId?: string;
  initialSection?: DataSectionId;
  userRole?: UserRole;
  onNavigateToValidation?: () => void;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({
  initialProjectId = 'PRJ-1042',
  initialSection = 'land',
  userRole = 'Administrator',
  onNavigateToValidation,
}) => {
  const defaultProject: ProjectRecord = {
    id: 'PRJ-NEW',
    name: 'New Land Acquisition Project',
    projectType: 'Infrastructure',
    state: 'National',
    district: 'General',
    location: 'National Portal',
    department: 'Department of Land Resources',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: new Date().toISOString().split('T')[0],
    description: 'Draft project created from BhoomiDrishti.',
    status: 'Draft',
    riskLevel: 'LOW',
    delayProbability: 0,
    delayDays: 0,
    totalParcels: 0,
    acquiredParcels: 0,
    disputedParcels: 0,
    budgetCr: 0,
    assignedOfficer: 'Central Nodal Officer',
    officerId: 'Officer-102',
    createdBy: 'System',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    stage: 'Planning',
    priority: 'Medium',
  };

  // All Projects
  const [allProjects, setAllProjects] = useState<ProjectRecord[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);

  const selectedProject: ProjectRecord = useMemo(() => {
    return (
      allProjects.find((p) => p.id === selectedProjectId) ||
      allProjects[0] ||
      defaultProject
    );
  }, [allProjects, selectedProjectId]);

  // Mode: 'manual' | 'upload' | 'create_project'
  const [currentMode, setCurrentMode] = useState<DataEntryMode | 'create_project'>('manual');
  const [activeSection, setActiveSection] = useState<DataSectionId>(initialSection);

  // Draft state & Last saved feedback
  const [dataValidationStatus, setDataValidationStatus] = useState<DataValidationStatus>('DRAFT');
  const [lastSavedTime, setLastSavedTime] = useState<string>('28 Aug 2026, 07:42 PM');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 9 Operational Data Datasets
  const [landRecords, setLandRecords] = useState<LandRecordItem[]>(INITIAL_LAND_RECORDS);
  const [families, setFamilies] = useState<AffectedFamilyItem[]>(INITIAL_AFFECTED_FAMILIES);
  const [compensationRecords, setCompensationRecords] = useState<CompensationItem[]>(INITIAL_COMPENSATION_RECORDS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS_RECORDS);
  const [legalDisputes, setLegalDisputes] = useState<LegalDisputeItem[]>(INITIAL_LEGAL_DISPUTES);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [rrRecords, setRrRecords] = useState<RrItem[]>(INITIAL_RR_RECORDS);
  const [possessionRecords, setPossessionRecords] = useState<PossessionItem[]>(INITIAL_POSSESSION_RECORDS);
  const [stakeholders, setStakeholders] = useState<StakeholderItem[]>(INITIAL_STAKEHOLDERS);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<ProjectDataAuditLog[]>(INITIAL_DATA_AUDIT_LOGS);

  const canEdit = userRole === 'Administrator' || userRole === 'Officer';

  const integritySummary = useMemo(
    () =>
      validateProjectDataIntegrity({
        landRecords,
        families,
        compensationRecords,
        approvals,
        legalDisputes,
        rrRecords,
        possessionRecords,
        stakeholders,
      }),
    [landRecords, families, compensationRecords, approvals, legalDisputes, rrRecords, possessionRecords, stakeholders]
  );

  // Log an audit action
  const handleAuditLog = (action: any, dataset: string, details?: string) => {
    const newLog: ProjectDataAuditLog = {
      id: `AUD-${Math.floor(900 + Math.random() * 99)}`,
      user: userRole === 'Administrator' ? 'Admin-001 (Superintendent Engineer)' : 'Officer-102 (Dr. Rajeshwar Sharma)',
      action,
      projectId: selectedProject.id,
      dataset,
      timestamp: 'Just now',
      result: 'SUCCESS',
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Section status calculation
  const sectionStatuses = useMemo<Record<DataSectionId, { status: SectionCompletionStatus; count: number }>>(() => {
    return {
      land: {
        status:
          landRecords.length >= 3
            ? 'completed'
            : landRecords.length > 0
            ? integritySummary.issues.some((issue) => issue.dataset === 'land' && issue.severity === 'WARNING')
              ? 'requires_attention'
              : 'in_progress'
            : 'not_started',
        count: landRecords.length,
      },
      families: {
        status:
          families.length >= 2
            ? integritySummary.issues.some((issue) => issue.dataset === 'families' && issue.severity === 'ERROR')
              ? 'requires_attention'
              : 'completed'
            : families.length > 0
            ? 'in_progress'
            : 'not_started',
        count: families.length,
      },
      compensation: {
        status:
          compensationRecords.some((c) => c.amountPending > 0) ||
          integritySummary.issues.some((issue) => issue.dataset === 'compensation')
            ? 'requires_attention'
            : 'completed',
        count: compensationRecords.length,
      },
      approvals: {
        status: approvals.some((a) => a.delayDays > 0) ? 'requires_attention' : 'completed',
        count: approvals.length,
      },
      legal: {
        status: legalDisputes.length > 0 ? 'in_progress' : 'not_started',
        count: legalDisputes.length,
      },
      documents: {
        status: documents.some((d) => d.verificationStatus === 'Missing') ? 'requires_attention' : 'completed',
        count: documents.length,
      },
      rr: {
        status: rrRecords.length > 0 ? 'completed' : 'not_started',
        count: rrRecords.length,
      },
      possession: {
        status: possessionRecords.some((p) => p.pendingParcels > 0) ? 'requires_attention' : 'completed',
        count: possessionRecords.length,
      },
      stakeholders: {
        status: stakeholders.length > 0 ? 'completed' : 'not_started',
        count: stakeholders.length,
      },
    };
  }, [
    landRecords,
    families,
    compensationRecords,
    approvals,
    legalDisputes,
    documents,
    rrRecords,
    possessionRecords,
    stakeholders,
    integritySummary,
  ]);

  // Overall Completion percentage
  const { completionPercentage, completedCount, totalCount } = useMemo(() => {
    const total = 9;
    const entries = Object.values(sectionStatuses) as { status: SectionCompletionStatus; count: number }[];
    const completed = entries.filter(
      (s) => s.status === 'completed' || s.status === 'in_progress'
    ).length;
    const pct = Math.round((completed / total) * 100);
    return { completionPercentage: pct, completedCount: completed, totalCount: total };
  }, [sectionStatuses]);

  // Save Draft Action
  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = '28 Aug 2026';
      const formatted = `${dateStr}, ${timeStr}`;
      setLastSavedTime(formatted);
      setIsSaving(false);
      setDataValidationStatus('DRAFT');
      setToastMessage('Project data draft saved successfully. Audit log updated.');
      handleAuditLog('DATA_UPDATED', 'Project Data Master', `Saved draft snapshot for ${selectedProject.id}`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 500);
  };

  // Submit for Validation Action
  const handleSubmitForValidation = () => {
    setDataValidationStatus('VALIDATION_REQUIRED');
    handleAuditLog('DATA_VALIDATION_SUBMITTED', 'Pipeline Gateway', `Submitted ${selectedProject.id} dataset to Validation Engine`);
    if (onNavigateToValidation) {
      onNavigateToValidation();
    }
  };

  // New Project Created from Form
  const handleCreateNewProject = (newProj: ProjectRecord, isDraft = false) => {
    setAllProjects([newProj, ...allProjects]);
    setSelectedProjectId(newProj.id);
    setCurrentMode('manual');
    handleAuditLog('DATA_CREATED', 'Project Registration', `Registered new project ${newProj.id}: ${newProj.name}`);
    setToastMessage(`Project ${newProj.id} created successfully.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle CSV/Excel Import
  const handleImportData = (category: DataSectionId, rows: any[]) => {
    if (category === 'land') {
      const imported: LandRecordItem[] = rows.map((r, idx) => ({
        id: `LND-${String(landRecords.length + idx + 1).padStart(3, '0')}`,
        surveyNumber: r.survey || `15${idx}/1`,
        khasraNumber: `K-${Math.floor(200 + Math.random() * 800)}`,
        areaValue: parseFloat(r.area) || 2.0,
        areaUnit: 'Acres',
        landType: 'Agricultural',
        ownership: 'Private',
        ownerName: r.owner || 'Imported Landowner',
        village: 'Kathipudi',
        acquisitionStatus: 'Under Process',
        estimatedCompensation: 750000,
      }));
      setLandRecords([...imported, ...landRecords]);
      handleAuditLog('DATA_IMPORTED', 'Land Details', `Imported ${imported.length} rows via CSV`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B3520] text-white px-4 py-2.5 rounded-xl shadow-xl border border-[#EAB308] text-xs font-semibold flex items-center gap-2 animate-slideIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Project Header & Progress Indicator */}
      <ProjectHeaderAndProgress
        selectedProject={selectedProject}
        allProjects={allProjects}
        onSelectProject={(p) => setSelectedProjectId(p.id)}
        dataValidationStatus={dataValidationStatus}
        lastSavedTime={lastSavedTime}
        completionPercentage={completionPercentage}
        completedSectionsCount={completedCount}
        totalSectionsCount={totalCount}
        currentMode={currentMode}
        onSelectMode={(m) => setCurrentMode(m)}
        onSaveDraft={handleSaveDraft}
        isSaving={isSaving}
        canEdit={canEdit}
      />

      {/* 2. Main Work Area based on Mode */}
      {currentMode === 'create_project' ? (
        <ProjectCreationFormSection
          existingProjectIds={allProjects.map((p) => p.id)}
          onCreateProject={handleCreateNewProject}
          onCancel={() => setCurrentMode('manual')}
        />
      ) : currentMode === 'upload' ? (
        <DataUploadModule
          initialCategory={activeSection}
          onImportData={handleImportData}
          onClose={() => setCurrentMode('manual')}
        />
      ) : (
        /* Manual Entry Mode: 2-column layout with Left Section Navigator and Right Data Tables */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Navigation: 9 Modules (3 cols) */}
          <div className="lg:col-span-3">
            <SectionNavSidebar
              activeSection={activeSection}
              onSelectSection={(sec) => setActiveSection(sec)}
              sectionStatuses={sectionStatuses}
            />
          </div>

          {/* Right Data Table View: 9 cols */}
          <div className="lg:col-span-9 space-y-6">
            <DataSectionsViews
              activeSection={activeSection}
              landRecords={landRecords}
              setLandRecords={setLandRecords}
              families={families}
              setFamilies={setFamilies}
              compensationRecords={compensationRecords}
              setCompensationRecords={setCompensationRecords}
              approvals={approvals}
              setApprovals={setApprovals}
              legalDisputes={legalDisputes}
              setLegalDisputes={setLegalDisputes}
              documents={documents}
              setDocuments={setDocuments}
              rrRecords={rrRecords}
              setRrRecords={setRrRecords}
              possessionRecords={possessionRecords}
              setPossessionRecords={setPossessionRecords}
              stakeholders={stakeholders}
              setStakeholders={setStakeholders}
              userRole={userRole}
              onOpenUploadForSection={(sec) => {
                setActiveSection(sec);
                setCurrentMode('upload');
              }}
              onAuditLog={handleAuditLog}
            />

            {/* Persistent Data Status & Submit Panel */}
            <DataStatusAndSubmitPanel
              sectionStatuses={sectionStatuses}
              dataValidationStatus={dataValidationStatus}
              lastSavedTime={lastSavedTime}
              onSaveDraft={handleSaveDraft}
              onSubmitForValidation={handleSubmitForValidation}
              canSubmit={canEdit}
              userRole={userRole}
            />
          </div>
        </div>
      )}
    </div>
  );
};
