import React from 'react';
import {
  BellOff,
  ChevronRight,
} from 'lucide-react';

export interface AlertItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  level: 'critical' | 'warning' | 'info';
  icon?: any;
  iconBg?: string;
  iconBorder?: string;
  iconColor?: string;
  badgeBg?: string;
}

interface RecentAlertsCardProps {
  alerts?: AlertItem[];
  onViewAllAlerts?: () => void;
  onSelectAlert?: (alertId: string) => void;
}

export const RecentAlertsCard: React.FC<RecentAlertsCardProps> = ({
  alerts = [],
  onViewAllAlerts,
  onSelectAlert,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            Recent Alerts
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Important project events requiring attention
          </p>
        </div>
        {alerts.length > 0 && (
          <button
            type="button"
            onClick={onViewAllAlerts}
            className="text-xs font-semibold text-[#0B3520] hover:text-[#082818] hover:underline cursor-pointer flex items-center"
          >
            <span>View All Alerts</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}
      </div>

      {/* Alert Items List / Empty State */}
      {alerts.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center my-auto">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-2.5">
            <BellOff className="w-5 h-5 stroke-[1.6]" />
          </div>
          <p className="text-xs font-bold text-gray-700">No Active Alerts</p>
          <p className="text-[11px] text-gray-400 max-w-[220px] mt-0.5">
            All registered project timelines and regulatory milestones are normal.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 mt-2">
          {alerts.map((alert) => {
            const Icon = alert.icon;

            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert?.(alert.id)}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <div
                      className={`w-8 h-8 rounded-full ${alert.iconBg || 'bg-gray-100'} border ${alert.iconBorder || 'border-gray-200'} ${alert.iconColor || 'text-gray-700'} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-gray-900 leading-tight">
                      {alert.title}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate mt-0.5 max-w-[220px] sm:max-w-xs">
                      {alert.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium whitespace-nowrap flex-shrink-0">
                  <span>{alert.time}</span>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
