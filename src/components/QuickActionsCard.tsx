import React from 'react';
import {
  Plus,
  FolderKanban,
  MapPin,
  Map,
  Database,
  Bell,
} from 'lucide-react';

interface QuickActionsCardProps {
  onCreateProject?: () => void;
  onSelectProject?: () => void;
  onSelectLocation?: () => void;
  onOpenGis?: () => void;
  onAddData?: () => void;
  onViewAlerts?: () => void;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onCreateProject,
  onSelectProject,
  onSelectLocation,
  onOpenGis,
  onAddData,
  onViewAlerts,
}) => {
  const actions = [
    {
      label: 'Create Project',
      icon: Plus,
      iconBg: 'bg-[#0B3520] text-white',
      onClick: onCreateProject,
    },
    {
      label: 'Select Project',
      icon: FolderKanban,
      iconBg: 'bg-emerald-50 text-[#0B3520] border border-emerald-200',
      onClick: onSelectProject,
    },
    {
      label: 'Location Selection',
      icon: MapPin,
      iconBg: 'bg-amber-50 text-amber-800 border border-amber-300',
      onClick: onSelectLocation,
    },
    {
      label: 'Open GIS Module',
      icon: Map,
      iconBg: 'bg-blue-50 text-blue-700 border border-blue-200',
      onClick: onOpenGis,
    },
    {
      label: 'View Alerts',
      icon: Bell,
      iconBg: 'bg-rose-50 text-rose-700 border border-rose-200',
      onClick: onViewAlerts,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-gray-900 leading-tight mb-3">
          Quick Actions
        </h3>

        <div className="space-y-2">
          {actions.map((action, idx) => {
            const Icon = action.icon;

            return (
              <button
                key={idx}
                type="button"
                onClick={action.onClick}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 hover:border-[#0B3520] hover:bg-gray-50/80 transition-all text-xs font-semibold text-gray-800 cursor-pointer shadow-2xs group"
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${action.iconBg} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
