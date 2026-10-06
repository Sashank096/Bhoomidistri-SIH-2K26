import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  MapPin,
  Map,
  FileInput,
  FileCheck2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Users,
  Database,
  ScrollText,
  Sparkles,
  X,
} from 'lucide-react';

export type NavSection =
  | 'dashboard'
  | 'projects'
  | 'location'
  | 'gis'
  | 'data_input'
  | 'data_validation'
  | 'risk'
  | 'predictions'
  | 'pipeline'
  | 'reports'
  | 'notifications'
  | 'users'
  | 'datasets'
  | 'ml_models'
  | 'settings'
  | 'audit_logs'
  | 'help';

interface DashboardSidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  unreadAlertCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection,
  onSelectSection,
  unreadAlertCount = 5,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const mainNavItems = [
    { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as NavSection, label: 'Projects', icon: FolderKanban },
    { id: 'location' as NavSection, label: 'Location Selection', icon: MapPin },
    { id: 'gis' as NavSection, label: 'GIS Module', icon: Map },
    { id: 'pipeline' as NavSection, label: 'ML Pipeline', icon: Sparkles },
    { id: 'reports' as NavSection, label: 'Reports', icon: FileText },
  ];

  const adminNavItems = [
    { id: 'users' as NavSection, label: 'Users', icon: Users },
    { id: 'datasets' as NavSection, label: 'Datasets', icon: Database },
    { id: 'audit_logs' as NavSection, label: 'Audit Logs', icon: ScrollText },
  ];

  const handleItemClick = (id: NavSection) => {
    onSelectSection(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Top Header on Mobile */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B3520] text-white flex items-center justify-center font-bold text-sm">
              BD
            </div>
            <span className="font-bold text-[#0B3520] text-sm">BhoomiDrishti</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 select-none scrollbar-thin">
          {/* Main Navigation Group */}
          <nav className="space-y-1" aria-label="Main Portfolio">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#0B3520] text-white font-semibold shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white stroke-[2.2]' : 'text-gray-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                </button>
              );
            })}
          </nav>

          {/* Administration Section */}
          <div className="pt-2">
            <div className="px-3.5 mb-2 text-[11px] font-bold tracking-wider text-[#0B3520] uppercase font-sans">
              Administration
            </div>
            <nav className="space-y-1" aria-label="Administration">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#0B3520] text-white font-semibold shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white stroke-[2.2]' : 'text-gray-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

      </aside>
    </>
  );
};
