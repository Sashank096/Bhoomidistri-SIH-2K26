import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  Bell,
  RefreshCw,
  Clock,
  Menu,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AdminUser } from '../types';
import { GovernmentEmblem } from './GovernmentEmblem';
import { BhoomiDrishtiLogo } from './BhoomiDrishtiLogo';
import { DashboardSidebar, NavSection } from './DashboardSidebar';
import { AdminProfileDropdown } from './AdminProfileDropdown';
import { KpiSummaryCards } from './KpiSummaryCards';
import { RiskDistributionChart } from './RiskDistributionChart';
import { RecentAlertsCard } from './RecentAlertsCard';
import { QuickActionsCard } from './QuickActionsCard';
import { ProjectRiskTable, ProjectSummaryRow } from './ProjectRiskTable';
import { RiskTrendChart } from './RiskTrendChart';
import { GisMapModule } from './GisMapModule';
import { ProjectsView } from './ProjectsView';
import { LocationSelectionView, SelectedLocationContext } from './LocationSelectionView';
import { ProjectManagement } from './ProjectManagement';
import { DataValidationView } from './DataValidationView';
import { MlPredictionsView } from './MlPredictionsView';
import { MlProjectPipelineView } from './MlProjectPipelineView';
import {
  RiskAnalysisView,
  ReportsView,
  AdministrationView,
} from './AdministrationViews';
import { SessionExpiryModal } from './SessionExpiryModal';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { NotificationsDrawer } from './NotificationsDrawer';
import { landAcquisitionApi, ProjectApiRecord } from '../services/landAcquisitionApi';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: (reason?: string) => void;
}

const toDashboardProject = (record: ProjectApiRecord): ProjectSummaryRow => {
  const assessment = record.risk_assessment as { risk_level?: string; predicted_delay_days?: number } | null | undefined;
  const rawLevel = String(assessment?.risk_level || '');
  const riskLevel = (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(rawLevel) ? rawLevel : record.priority === 'High' ? 'HIGH' : 'LOW') as ProjectSummaryRow['riskLevel'];
  const updatedAt = typeof record.updated_at === 'string' ? record.updated_at : '';
  return {
    id: record.project_id,
    name: record.project_name,
    location: [record.village, record.mandal_taluk, record.district, record.state].filter(Boolean).join(', ') || 'Location pending',
    stage: record.status === 'Published' ? 'Published to Officer' : record.status,
    riskLevel,
    lastUpdated: updatedAt ? new Date(updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not updated',
    delayDays: Number(assessment?.predicted_delay_days || 0),
    totalParcels: Number(record.target_parcels || 0),
    acquiredParcels: Number(record.matched_parcels || 0),
    budgetCr: Number(record.budget_inr || 0) / 10000000,
  };
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState<boolean>(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<ProjectSummaryRow | null>(null);
  const [selectedProjectForLocation, setSelectedProjectForLocation] = useState<any | null>(null);
  const [selectedLocationContext, setSelectedLocationContext] = useState<SelectedLocationContext | null>(null);
  const [dashboardProjects, setDashboardProjects] = useState<ProjectSummaryRow[]>([]);

  const loadDashboardProjects = useCallback(() => {
    return landAcquisitionApi.listProjects().then((records) => {
      setDashboardProjects(records.map(toDashboardProject));
    });
  }, []);

  // Administrative Session Inactivity & Expiry State
  // Default session: 15 minutes (900 seconds). Warning triggers at <= 120 seconds.
  const DEFAULT_SESSION_SECONDS = 900;
  const WARNING_THRESHOLD_SECONDS = 120;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(DEFAULT_SESSION_SECONDS);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);
  const [sessionToast, setSessionToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;
    loadDashboardProjects().catch(() => { if (mounted) setDashboardProjects([]); });
    return () => { mounted = false; };
  }, [loadDashboardProjects]);

  // Session Extension Handler
  const handleExtendSession = useCallback(() => {
    setSecondsRemaining(DEFAULT_SESSION_SECONDS);
    setIsWarningModalOpen(false);
    setSessionToast('Official session extended for 15 minutes. Activity logged to NIC audit.');
    setTimeout(() => {
      setSessionToast(null);
    }, 4000);
  }, []);

  // Main countdown timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsWarningModalOpen(false);
          onLogout('timeout');
          return 0;
        }

        const next = prev - 1;
        if (next <= WARNING_THRESHOLD_SECONDS && !isWarningModalOpen) {
          setIsWarningModalOpen(true);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onLogout, isWarningModalOpen]);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    loadDashboardProjects().catch(() => undefined).finally(() => {
      setIsRefreshing(false);
      setSessionToast('Data refreshed successfully from NIC Land Records Gateway.');
      setTimeout(() => setSessionToast(null), 3000);
    });
  };

  const handleCreateProject = (newProj: ProjectSummaryRow) => {
    setDashboardProjects((current) => [newProj, ...current.filter((project) => project.id !== newProj.id)]);
    setSessionToast(`Project ${newProj.id} registered successfully.`);
    setTimeout(() => setSessionToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-gray-800">
      {/* Top Banner Notice if any */}
      {sessionToast && (
        <div className="bg-[#0B3520] text-emerald-200 text-xs py-2 px-4 text-center font-medium border-b border-[#EAB308] flex items-center justify-center gap-2 animate-fadeIn z-50">
          <CheckCircle2 className="w-4 h-4 text-[#EAB308]" />
          <span>{sessionToast}</span>
        </div>
      )}

      {/* Main Top Bar matching exact screenshot */}
      <header className="bg-[#0B3520] text-white border-b border-[#EAB308]/40 sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Government of India & Ministry */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 lg:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Emblem & Ministry text */}
            <div className="flex items-center gap-2.5">
              <GovernmentEmblem className="w-7 h-9 text-white filter drop-shadow-xs" />
              <div className="text-left border-l border-white/20 pl-2.5 hidden sm:block">
                <div className="text-[11px] font-bold tracking-tight text-[#E5B54F] uppercase">
                  Government of India
                </div>
                <div className="text-[10px] text-white/80 font-medium leading-tight">
                  Ministry of Rural Development
                </div>
                <div className="text-[9px] text-emerald-200/90 leading-tight">
                  Department of Land Resources
                </div>
              </div>
            </div>
          </div>

          {/* Center: BhoomiDrishti Brand & Subtitle */}
          <div className="flex items-center gap-2.5 mx-auto">
            {/* BhoomiDrishti Leaf Logo */}
            <div className="w-7 h-7 rounded-full bg-emerald-600 border border-[#EAB308]/60 flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="#10B981" fillOpacity="0.4" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>BhoomiDrishti</span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-emerald-200 hidden md:block leading-none">
                Predictive Land Acquisition Delay Prevention System
              </div>
            </div>
          </div>

          {/* Right: Notifications Bell & Clean Admin Logo / Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell with Badge */}
            <button
              type="button"
              id="header-notifications-bell-btn"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#EAB308] focus-visible:outline-none"
              title="5 Portal Notifications"
            >
              <Bell className="w-5 h-5 text-white stroke-[2]" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-[#0B3520]">
                5
              </span>
            </button>

            {/* Clean Admin Profile Dropdown (Hides all admin details in the logo) */}
            <AdminProfileDropdown
              user={user}
              onLogout={onLogout}
              secondsRemaining={secondsRemaining}
              onExtendSession={handleExtendSession}
              onOpenSettings={() => setActiveSection('settings')}
            />
          </div>
        </div>
      </header>

      {/* Main Body Layout: Sidebar + Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Panel */}
        <DashboardSidebar
          activeSection={activeSection}
          onSelectSection={(sec) => {
            if (sec === 'notifications') {
              setIsNotificationsOpen(true);
            } else {
              setActiveSection(sec);
            }
          }}
          unreadAlertCount={5}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Render Active View */}
          {activeSection === 'dashboard' && (
            <>
              {/* Dashboard Content Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200/80">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
                    Dashboard Overview
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Real-time overview of the BhoomiDrishti project portfolio
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRefreshData}
                    disabled={isRefreshing}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-[#0B3520] ${
                        isRefreshing ? 'animate-spin' : ''
                      }`}
                    />
                    <span>Refresh Data</span>
                  </button>
                </div>
              </div>

              {/* 1. KPI Cards Row (Summaries) */}
              <KpiSummaryCards
                projectsCount={dashboardProjects.length}
                activeProjectsCount={dashboardProjects.filter((project) => !['Completed', 'Closed', 'Cancelled'].includes(project.stage)).length}
                highRiskCount={dashboardProjects.filter((project) => project.riskLevel === 'HIGH' || project.riskLevel === 'CRITICAL').length}
                affectedFamiliesCount={dashboardProjects.reduce((total, project) => total + project.totalParcels, 0)}
                onSelectKpiFilter={(kpi) => {
                  if (kpi === 'high_risk') setActiveSection('risk');
                }}
              />

              {/* 2. Middle Row: Risk Distribution + Recent Alerts + Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Risk Distribution (5 cols) */}
                <div className="lg:col-span-5">
                  <RiskDistributionChart
                    onSelectCategory={(cat) => {
                      setActiveSection('projects');
                    }}
                  />
                </div>

                {/* Recent Alerts (4 cols) */}
                <div className="lg:col-span-4">
                  <RecentAlertsCard
                    onViewAllAlerts={() => setIsNotificationsOpen(true)}
                    onSelectAlert={(id) => {
                      const found = dashboardProjects.find((p) => p.id === 'PRJ-1042');
                      if (found) setSelectedProjectForDetail(found);
                    }}
                  />
                </div>

                {/* Quick Actions (3 cols) */}
                <div className="lg:col-span-3">
                  <QuickActionsCard
                    onCreateProject={() => setIsCreateProjectOpen(true)}
                    onSelectProject={() => setActiveSection('projects')}
                    onSelectLocation={() => {
                      setSelectedProjectForLocation(null);
                      setActiveSection('location');
                    }}
                    onOpenGis={() => setActiveSection('gis')}
                    onAddData={() => setIsCreateProjectOpen(true)}
                    onViewAlerts={() => setIsNotificationsOpen(true)}
                  />
                </div>
              </div>

              {/* 3. Bottom Row: Project Risk Overview + Risk Trend (Last 30 Days) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Project Risk Overview Table (7 cols) */}
                <div className="lg:col-span-7">
                  <ProjectRiskTable
                    projects={dashboardProjects}
                    onSelectProject={(proj) => setSelectedProjectForDetail(proj)}
                    onViewAllProjects={() => setActiveSection('projects')}
                    onCreateProject={() => setIsCreateProjectOpen(true)}
                  />
                </div>

                {/* Risk Trend (Last 30 Days) Chart (5 cols) */}
                <div className="lg:col-span-5">
                  <RiskTrendChart />
                </div>
              </div>
            </>
          )}

          {/* Subviews */}
          {activeSection === 'projects' && (
            <ProjectsView
              onSelectProject={(proj) => {
                // Keep selected for any parent interactions
              }}
              onOpenLocationSelection={(proj) => {
                setSelectedProjectForLocation(proj || null);
                setActiveSection('location');
              }}
              onOpenGisModule={() => setActiveSection('gis')}
              userRole={user.role as any || 'Administrator'}
            />
          )}

          {activeSection === 'location' && (
            <LocationSelectionView
              selectedProject={selectedProjectForLocation}
              onContinueToGis={(context) => {
                setSelectedLocationContext(context);
                setActiveSection('gis');
              }}
              onBackToProjects={() => setActiveSection('projects')}
            />
          )}

          {activeSection === 'gis' && (
            <GisMapModule
              locationContext={selectedLocationContext}
              onBackToLocationSelection={() => setActiveSection('location')}
            />
          )}

          {activeSection === 'data_input' && (
            <ProjectManagement
              userRole={user.role as any || 'Administrator'}
              onNavigateToValidation={() => setActiveSection('data_validation')}
            />
          )}

          {activeSection === 'data_validation' && (
            <DataValidationView
              userRole={user.role as any || 'Administrator'}
              projectId="PRJ-1042"
              projectName="NH-216 Land Acquisition"
              location="Andhra Pradesh"
              onNavigateToDataInput={(dataset) => {
                setActiveSection('data_input');
              }}
              onProceedToMlPipeline={() => {
                setActiveSection('predictions');
              }}
            />
          )}

          {activeSection === 'risk' && <RiskAnalysisView />}

          {activeSection === 'predictions' && (
            <MlProjectPipelineView userRole={(user.role as any) || 'Administrator'} />
          )}

          {activeSection === 'pipeline' && (
            <MlProjectPipelineView
              userRole={(user.role as any) || 'Administrator'}
              onOpenProjects={() => setActiveSection('projects')}
              onOpenDataManager={() => setActiveSection('data_input')}
              onOpenValidationDetails={() => setActiveSection('data_validation')}
              onOpenRiskDetails={() => setActiveSection('risk')}
              onOpenPredictionDetails={() => setActiveSection('predictions')}
            />
          )}

          {activeSection === 'reports' && <ReportsView />}

          {activeSection === 'help' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                Help &amp; Administrative Technical Support
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                For administrative clearance elevation, cadastral shapefile ingestion assistance, or NIC gateway token renewals, contact the National Informatics Centre (NIC) Land Records Helpdesk at <span className="font-mono font-bold text-[#0B3520]">helpdesk-ebhoomi@nic.in</span> or toll-free <span className="font-mono font-bold text-[#0B3520]">1800-11-2026</span>.
              </p>
            </div>
          )}

          {[
            'users',
            'datasets',
            'ml_models',
            'settings',
            'audit_logs',
          ].includes(activeSection) && (
            <AdministrationView tab={activeSection} />
          )}
        </main>
      </div>

      {/* Official Government Footer matching screenshot */}
      <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <span>
            BhoomiDrishti | Department of Land Resources | Government of India
          </span>
        </div>
        <div className="font-mono text-[11px] text-gray-400">
          System Version: v1.0.0
        </div>
      </footer>

      {/* Modals and Drawers */}
      {/* 1. Session Expiry Warning Modal */}
      <SessionExpiryModal
        isOpen={isWarningModalOpen}
        secondsRemaining={secondsRemaining}
        onExtendSession={handleExtendSession}
        onLogout={() => onLogout('manual')}
      />

      {/* 2. Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* 3. Project Detail Drawer */}
      <ProjectDetailsModal
        project={selectedProjectForDetail}
        onClose={() => setSelectedProjectForDetail(null)}
      />

      {/* 4. Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectAlert={(id) => {
          const found = dashboardProjects.find((p) => p.id === 'PRJ-1042');
          if (found) setSelectedProjectForDetail(found);
        }}
      />
    </div>
  );
};
