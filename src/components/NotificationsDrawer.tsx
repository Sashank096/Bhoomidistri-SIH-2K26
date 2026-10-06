import React from 'react';
import { X, Bell, BellOff } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  level: 'critical' | 'warning' | 'info';
  read: boolean;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onSelectAlert?: (alertId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onSelectAlert,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-gray-200 animate-slideLeft">
        {/* Top Header */}
        <div className="p-4 bg-[#0B3520] text-white flex items-center justify-between border-b border-[#EAB308]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#EAB308]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Notifications &amp; Intelligence Alerts
              </h3>
              <p className="text-[11px] text-white/70">
                {notifications.length} Pending Portal {notifications.length === 1 ? 'Notification' : 'Notifications'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Alerts / Empty State */}
        {notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3 shadow-2xs">
              <BellOff className="w-6 h-6 stroke-[1.6]" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">No New Notifications</h4>
            <p className="text-xs text-gray-500 max-w-xs mt-1">
              You are completely caught up. Critical alerts, stage transitions, and validation triggers will appear here.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onSelectAlert?.(n.id);
                  onClose();
                }}
                className={`pt-3 first:pt-0 p-2.5 rounded-xl transition-colors cursor-pointer ${
                  n.read ? 'bg-white hover:bg-gray-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        n.level === 'critical'
                          ? 'bg-red-600'
                          : n.level === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                    />
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                      {n.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                    {n.time}
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed pl-4">
                  {n.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
          {notifications.length > 0 ? (
            <button
              type="button"
              onClick={onClose}
              className="text-[#0B3520] font-semibold hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          ) : (
            <span className="text-gray-400 text-xs">All clear</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-[#0B3520] text-white font-medium rounded-lg hover:bg-[#082818] cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
