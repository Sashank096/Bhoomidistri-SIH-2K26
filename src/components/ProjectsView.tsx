import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Archive,
  RotateCcw,
  Download,
  AlertTriangle,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Layers,
  Sparkles,
  Shield,
  UserCheck,
  Calendar,
  MapPin,
  FileCheck,
  FolderKanban,
  FileText,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  ProjectRecord,
  ProjectAuditRecord,
  ProjectFilterState,
  UserRole,
} from '../types';
import {
  INDIAN_STATES_DISTRICTS,
  DEPARTMENTS_LIST,
  PROJECT_TYPES_LIST,
  OFFICERS_LIST,
} from '../data/projectsData';
import { CreateProjectForm } from './CreateProjectForm';
import { ProjectWorkspaceModal } from './ProjectWorkspaceModal';
import { EditProjectModal } from './EditProjectModal';
import { ArchiveProjectModal } from './ArchiveProjectModal';
import { landAcquisitionApi } from '../services/landAcquisitionApi';
import { ProjectApiRecord } from '../services/landAcquisitionApi';

interface ProjectsViewProps {
  onSelectProject?: (project: ProjectRecord) => void;
  onCreateProject?: () => void;
  onOpenGisModule?: () => void;
  onOpenLocationSelection?: (project?: ProjectRecord) => void;
  userRole?: UserRole;
}

// Convert API project record to ProjectRecord format
function toProjectRecord(apiRecord: ProjectApiRecord): ProjectRecord {
  return {
    id: apiRecord.project_id,
    name: apiRecord.project_name,
    projectType: (apiRecord.project_type as ProjectRecord['projectType']) || 'Other',
    state: apiRecord.state || '',
    district: apiRecord.district || '',
    location: `${apiRecord.district || ''}, ${apiRecord.state || ''}`,
    department: apiRecord.department || '',
    startDate: apiRecord.start_date || '',
    targetCompletionDate: apiRecord.planned_completion_date || '',
    description: apiRecord.description || '',
    status: (apiRecord.status as ProjectRecord['status']) || 'Draft',
    riskLevel: (apiRecord.risk_assessment?.risk_level as ProjectRecord['riskLevel']) || 'LOW',
    delayProbability: apiRecord.risk_assessment?.predicted_delay_days ? Math.round((apiRecord.risk_assessment.predicted_delay_days / 365) * 100) : 0,
    delayDays: apiRecord.risk_assessment?.predicted_delay_days || 0,
    totalParcels: apiRecord.target_parcels || 0,
    acquiredParcels: apiRecord.matched_parcels || 0,
    disputedParcels: 0,
    budgetCr: apiRecord.budget_inr ? apiRecord.budget_inr / 10000000 : 0,
    totalLandAreaHa: apiRecord.required_area_acres ? apiRecord.required_area_acres * 0.404686 : undefined,
    numberOfVillages: undefined,
    initialAffectedFamilies: undefined,
    priority: apiRecord.priority === 'High' ? 'High' : apiRecord.priority === 'Medium' ? 'Medium' : 'Standard',
    assignedOfficer: apiRecord.officer_id ? `Officer ${apiRecord.officer_id}` : '',
    officerId: apiRecord.officer_id || '',
    createdBy: 'Administrator',
    createdAt: apiRecord.created_at || new Date().toISOString(),
    lastUpdated: apiRecord.updated_at || new Date().toISOString(),
    archivedAt: null,
    stage: 'Planning',
  };
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onSelectProject,
  onOpenGisModule,
  onOpenLocationSelection,
  userRole: initialRole = 'Administrator',
}) => {
  // Active Main Tab: 'existing' | 'create'
  const [activeTab, setActiveTab] = useState<'existing' | 'create'>('existing');

  // Interactive User Role switcher (to demonstrate RBAC behaviors)
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);

  // Projects State - loaded from API
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<ProjectAuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load projects from API
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const apiProjects = await landAcquisitionApi.listProjects();
      setProjects(apiProjects.map(toProjectRecord));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Filters State
  const initialFilters: ProjectFilterState = {
    searchQuery: '',
    state: 'ALL',
    district: 'ALL',
    status: 'ALL',
    riskLevel: 'ALL',
    projectType: 'ALL',
    officer: 'ALL',
  };
  const [filters, setFilters] = useState<ProjectFilterState>(initialFilters);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modals State
  const [selectedWorkspaceProject, setSelectedWorkspaceProject] = useState<ProjectRecord | null>(null);
  const [selectedEditProject, setSelectedEditProject] = useState<ProjectRecord | null>(null);
  const [selectedArchiveProject, setSelectedArchiveProject] = useState<ProjectRecord | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Toast Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Log Audit Action
  const logAudit = useCallback(
    (
      action: ProjectAuditRecord['action'],
      projectId: string,
      projectName: string,
      details: string,
      result: 'SUCCESS' | 'DENIED' | 'FAILED' = 'SUCCESS'
    ) => {
      const newLog: ProjectAuditRecord = {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        user: currentRole === 'Administrator' ? 'Dr. Rajeshwar Sharma (ADM-001)' : currentRole === 'Officer' ? 'Shri A. K. Verma (Officer-108)' : 'Public Auditor (Viewer-04)',
        role: currentRole,
        action,
        projectId,
        projectName,
        timestamp: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        result,
        details,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentRole]
  );

  // Filtered Projects Computation
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Search Query (ID, Name, or Location)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchId = p.id.toLowerCase().includes(query);
        const matchName = p.name.toLowerCase().includes(query);
        const matchLoc = p.location.toLowerCase().includes(query) || p.state.toLowerCase().includes(query) || p.district.toLowerCase().includes(query);
        if (!matchId && !matchName && !matchLoc) return false;
      }

      // 2. State
      if (filters.state !== 'ALL' && p.state !== filters.state) return false;

      // 3. District
      if (filters.district !== 'ALL' && p.district !== filters.district) return false;

      // 4. Status
      if (filters.status !== 'ALL' && p.status !== filters.status) return false;

      // 5. Risk Level
      if (filters.riskLevel !== 'ALL' && p.riskLevel !== filters.riskLevel) return false;

      // 6. Project Type
      if (filters.projectType !== 'ALL' && p.projectType !== filters.projectType) return false;

      // 7. Officer
      if (filters.officer !== 'ALL' && p.officerId !== filters.officer && !p.assignedOfficer.includes(filters.officer)) return false;

      return true;
    });
  }, [projects, filters]);

  // Paginated Projects Computation
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  // Handle State Filter Change (Cascades District options)
  const handleStateFilterChange = (st: string) => {
    setFilters((prev) => ({
      ...prev,
      state: st,
      district: 'ALL',
    }));
    setCurrentPage(1);
  };

  // Create Project Callback
  const handleCreateProjectSubmit = (newProj: ProjectRecord, isDraft = false) => {
    setProjects((prev) => [newProj, ...prev]);
    logAudit(
      'PROJECT_CREATED',
      newProj.id,
      newProj.name,
      `Project registered in ${newProj.state} with budget ₹${newProj.budgetCr} Cr (${isDraft ? 'Draft' : 'Planning'}).`
    );
    showToast(`✓ Project ${newProj.id} registered successfully.`);
  };

  // Save Edited Project
  const handleSaveEditedProject = (updated: ProjectRecord) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    logAudit('PROJECT_UPDATED', updated.id, updated.name, 'Updated project metadata and timelines.');
    showToast(`✓ Project ${updated.id} updated successfully.`);
  };

  // Archive Project
  const handleConfirmArchive = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: 'Archived',
              archivedAt: new Date().toISOString(),
              lastUpdated: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
            }
          : p
      )
    );

    logAudit('PROJECT_ARCHIVED', proj.id, proj.name, 'Project archived to historical database.');
    setSelectedArchiveProject(null);
    showToast(`Project ${proj.id} moved to archive.`);
  };

  // Open Project Workspace
  const handleOpenWorkspace = (proj: ProjectRecord) => {
    setSelectedWorkspaceProject(proj);
    logAudit('PROJECT_VIEWED', proj.id, proj.name, 'Accessed project overview and dossier.');
    if (onSelectProject) onSelectProject(proj);
  };

  // Permissions check
  const canCreate = currentRole === 'Administrator' || currentRole === 'Officer';
  const canEdit = currentRole === 'Administrator' || currentRole === 'Officer';
  const canArchive = currentRole === 'Administrator';

  // Risk Badge helper
  const getRiskBadge = (level: ProjectRecord['riskLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
            LOW
          </span>
        );
    }
  };

  // Status Badge helper
  const getStatusBadge = (status: ProjectRecord['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
            ACTIVE
          </span>
        );
      case 'Planning':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
            PLANNING
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
            UNDER REVIEW
          </span>
        );
      case 'Delayed':
        return (
          <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold">
            DELAYED
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-bold">
            COMPLETED
          </span>
        );
      case 'Archived':
        return (
          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-300 text-[11px] font-bold">
            ARCHIVED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-bold">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  // Available Districts based on selected state filter
  const availableDistricts =
    filters.state !== 'ALL' && INDIAN_STATES_DISTRICTS[filters.state]
      ? INDIAN_STATES_DISTRICTS[filters.state]
      : [];

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Toast Alert Notice */}
      {toastMessage && (
        <div className="bg-[#0B3520] text-emerald-200 text-xs py-2 px-4 rounded-xl border border-[#EAB308] flex items-center justify-between gap-2 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#EAB308]" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 5. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Project Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Create, manage, and access authorized land-acquisition projects
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* RBAC Role Indicator / Switcher for Testing Verification */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs text-xs">
            <Shield className="w-3.5 h-3.5 text-[#0B3520]" />
            <span className="text-gray-500 font-medium">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="font-bold text-[#0B3520] bg-transparent focus:outline-none cursor-pointer"
              title="Switch role to test Administrator / Officer / Viewer permissions"
            >
              <option value="Administrator">Administrator</option>
              <option value="Officer">Officer</option>
              <option value="Viewer">Viewer (Read-Only)</option>
            </select>
          </div>

          {/* Refresh Projects Button */}
          <button
            type="button"
            onClick={loadProjects}
            disabled={isLoading || selectedWorkspaceProject != null}
            className="px-3 py-1.5 bg-[#0B3520] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh projects from backend"
          >
            {isLoading ? 'Loading...' : <ArrowRight className="w-3.5 h-3.5" />}
          </button>

          {/* + Create New Project Button (Only shown if authorized) */}
          {canCreate && (
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-[#0B3520] hover:bg-[#082818] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#EAB308]" />
              <span>Create New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* 6. Project Management Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {/* Tab 1: Existing Projects */}
          <button
            type="button"
            onClick={() => setActiveTab('existing')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'existing'
                ? 'bg-white text-[#0B3520] border-[#0B3520] shadow-2xs'
                : 'text-gray-500 hover:text-gray-800 border-transparent hover:bg-gray-100/60'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Existing Projects</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-[#0B3520] border border-emerald-200">
              {filteredProjects.length}
            </span>
          </button>

          {/* Tab 2: Create New Project (if permitted) */}
          {canCreate && (
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'create'
                  ? 'bg-white text-[#0B3520] border-[#0B3520] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800 border-transparent hover:bg-gray-100/60'
              }`}
            >
              <Plus className="w-4 h-4 text-[#EAB308]" />
              <span>Create New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'create' ? (
        /* Render Multi-Section Project Creation Form */
        <CreateProjectForm
          existingProjectIds={projects.map((p) => p.id)}
          onCreateProject={handleCreateProjectSubmit}
          onCancel={() => setActiveTab('existing')}
          onOpenCreatedProject={(proj) => {
            setActiveTab('existing');
            handleOpenWorkspace(proj);
          }}
        />
      ) : (
        /* Render Existing Projects Search & Table */
        <div className="space-y-4">
          {/* 7. Existing Projects — Search & Filtering Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            {/* Row 1: Search Field */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Project ID, Project Name or Location (e.g. PRJ-1042, NH-216, Andhra Pradesh)..."
                value={filters.searchQuery}
                onChange={(e) => {
                  setFilters({ ...filters, searchQuery: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] font-medium"
              />
            </div>

            {/* Row 2: Cascading Filters Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* State Filter */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium text-[11px]">State:</span>
                <select
                  value={filters.state}
                  onChange={(e) => handleStateFilterChange(e.target.value)}
                  className="py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50/70 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B3520]"
                >
                  <option value="ALL">All States</option>
                  {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Filter (Cascades based on State) */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium text-[11px]">District:</span>
                <select
                  value={filters.district}
                  onChange={(e) => {
                    setFilters({ ...filters, district: e.target.value });
                    setCurrentPage(1);
                  }}
                  disabled={filters.state === 'ALL'}
                  className="py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50/70 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B3520] disabled:opacity-50"
                >
                  <option value="ALL">All Districts</option>
                  {availableDistricts.map((dst) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium text-[11px]">Status:</span>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters({ ...filters, status: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50/70 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B3520]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Planning">Planning</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Risk Level Filter */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium text-[11px]">Risk Level:</span>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => {
                    setFilters({ ...filters, riskLevel: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50/70 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B3520]"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">Critical Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </div>

              {/* Project Type Filter */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium text-[11px]">Type:</span>
                <select
                  value={filters.projectType}
                  onChange={(e) => {
                    setFilters({ ...filters, projectType: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50/70 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B3520]"
                >
                  <option value="ALL">All Types</option>
                  {PROJECT_TYPES_LIST.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Officer Filter */}
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-medium text-[11px]">Officer:</span>
                <select
                  value={filters.officer}
                  onChange={(e) => {
                    setFilters({ ...filters, officer: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50/70 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B3520]"
                >
                  <option value="ALL">All Officers</option>
                  {OFFICERS_LIST.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:text-[#0B3520] hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* 8. Existing Projects Table & 35. Responsive Cards */}
          {isLoading ? (
            /* Loading State */
            <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#0B3520] flex items-center justify-center mx-auto">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">Loading projects...</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">Fetching authorized project records from the backend.</p>
              </div>
            </div>
          ) : loadError ? (
            /* Error State */
            <div className="bg-white rounded-2xl p-12 border border-red-200 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">Failed to load projects</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">{loadError}</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={loadProjects}
                  className="px-4 py-2 bg-[#0B3520] hover:bg-[#082818] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            /* 32. Empty State */
            <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <FolderKanban className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">
                  No Projects Found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  No projects match your current search or filter criteria. Check your spelling or reset the filters.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
                {canCreate && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-[#0B3520] hover:bg-[#082818] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Project</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Full Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F8FAF9] text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200 font-bold">
                        <th className="py-3.5 px-4">Project ID</th>
                        <th className="py-3.5 px-4">Project Name</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Risk Level</th>
                        <th className="py-3.5 px-4">Delay Probability</th>
                        <th className="py-3.5 px-4">Last Updated</th>
                        <th className="py-3.5 px-4">Officer Assigned</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedProjects.map((proj) => (
                        <tr
                          key={proj.id}
                          onClick={() => handleOpenWorkspace(proj)}
                          className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Project ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#0B3520]">
                            {proj.id}
                          </td>

                          {/* Project Name & Type */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900 group-hover:text-[#0B3520] transition-colors">
                              {proj.name}
                            </div>
                            <div className="text-[11px] text-gray-400 font-medium">
                              {proj.projectType} • {proj.department.split('(')[0]}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-gray-800">{proj.state}</div>
                            <div className="text-[11px] text-gray-500 truncate max-w-[140px]">
                              {proj.district}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {getStatusBadge(proj.status)}
                          </td>

                          {/* Risk Level */}
                          <td className="py-3.5 px-4">
                            {getRiskBadge(proj.riskLevel)}
                          </td>

                          {/* Predicted Delay Probability (Section 10) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900 text-xs w-9">
                                {proj.delayProbability}%
                              </span>
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    proj.delayProbability >= 70
                                      ? 'bg-red-500'
                                      : proj.delayProbability >= 40
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${proj.delayProbability}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              Predicted: +{proj.delayDays}d
                            </div>
                          </td>

                          {/* Last Updated */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                            {proj.lastUpdated}
                          </td>

                          {/* Officer Assigned */}
                          <td className="py-3.5 px-4 text-[11px] font-medium text-gray-800">
                            {proj.assignedOfficer}
                          </td>

                          {/* Project Actions (Section 12) */}
                          <td
                            className="py-3.5 px-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenWorkspace(proj)}
                                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#0B3520] font-semibold text-xs rounded-lg border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                                title="Open Project Workspace"
                              >
                                Open
                              </button>

                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedEditProject(proj)}
                                  className="p-1 rounded-lg text-gray-500 hover:text-[#0B3520] hover:bg-emerald-50 transition-colors cursor-pointer"
                                  title="Edit Project"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {canArchive && proj.status !== 'Archived' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedArchiveProject(proj)}
                                  className="p-1 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Archive Project"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards View (Section 35) */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {paginatedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleOpenWorkspace(proj)}
                    className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#0B3520]">
                          {proj.id}
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm mt-0.5 leading-snug">
                          {proj.name}
                        </h3>
                        <p className="text-xs text-gray-500">{proj.state}, {proj.district}</p>
                      </div>
                      <div>{getStatusBadge(proj.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 text-[10px] block uppercase font-medium">Risk Level</span>
                        <div className="mt-0.5">{getRiskBadge(proj.riskLevel)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block uppercase font-medium">Delay Probability</span>
                        <div className="font-mono font-bold text-gray-800 text-xs mt-0.5">
                          {proj.delayProbability}% (+{proj.delayDays}d)
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block uppercase font-medium">Officer</span>
                        <div className="text-gray-700 truncate font-medium mt-0.5">{proj.assignedOfficer}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block uppercase font-medium">Updated</span>
                        <div className="font-mono text-gray-600 text-[11px] mt-0.5">{proj.lastUpdated}</div>
                      </div>
                    </div>

                    <div
                      className="pt-2 border-t border-gray-100 flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenWorkspace(proj)}
                        className="px-3 py-1.5 bg-[#0B3520] text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        Open Project
                      </button>

                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => setSelectedEditProject(proj)}
                            className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
                          >
                            Edit
                          </button>
                        )}
                        {canArchive && proj.status !== 'Archived' && (
                          <button
                            type="button"
                            onClick={() => setSelectedArchiveProject(proj)}
                            className="px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg border border-red-200"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 31. Server-side Style Pagination Toolbar */}
              <div className="bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>
                    Showing <strong className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                    <strong className="text-gray-900">
                      {Math.min(currentPage * itemsPerPage, filteredProjects.length)}
                    </strong>{' '}
                    of <strong className="text-gray-900">{filteredProjects.length}</strong> authorized projects
                  </span>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1">
                    <span>Per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-200 rounded-md px-1.5 py-0.5 bg-gray-50 text-gray-700 font-medium"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[30px] h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#0B3520] text-white shadow-xs'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 37. Audit Logging Live Feed for Project Actions */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0B3520]" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Project Action Audit Trails (NIC Security Gateway)
                </h3>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                Live Audit Active
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {auditLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px] gap-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0B3520]">{log.projectId}</span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 text-[9px] font-bold font-mono">
                      {log.action}
                    </span>
                    <span className="text-gray-700 font-medium">{log.projectName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-[10px]">
                    <span>By: {log.user}</span>
                    <span className="font-mono">{log.timestamp}</span>
                    <span className="font-bold text-emerald-700">✓ {log.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      {/* 1. Project Workspace Modal */}
      <ProjectWorkspaceModal
        project={selectedWorkspaceProject}
        isOpen={!!selectedWorkspaceProject}
        onClose={() => setSelectedWorkspaceProject(null)}
        onOpenGisModule={onOpenGisModule}
        onOpenLocationSelection={() => {
          if (onOpenLocationSelection) {
            onOpenLocationSelection(selectedWorkspaceProject || undefined);
          }
        }}
      />

      {/* 2. Edit Project Modal */}
      <EditProjectModal
        project={selectedEditProject}
        isOpen={!!selectedEditProject}
        onClose={() => setSelectedEditProject(null)}
        onSave={handleSaveEditedProject}
      />

      {/* 3. Archive Project Modal */}
      <ArchiveProjectModal
        project={selectedArchiveProject}
        isOpen={!!selectedArchiveProject}
        onClose={() => setSelectedArchiveProject(null)}
        onConfirmArchive={handleConfirmArchive}
      />
    </div>
  );
};
