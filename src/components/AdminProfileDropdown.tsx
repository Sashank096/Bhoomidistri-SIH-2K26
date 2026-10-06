import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  User,
  ShieldCheck,
  Mail,
  Building,
  KeyRound,
  Clock,
  RefreshCw,
  LogOut,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { AdminUser } from '../types';

interface AdminProfileDropdownProps {
  user: AdminUser;
  onLogout: (reason?: string) => void;
  secondsRemaining: number;
  onExtendSession: () => void;
  onOpenSettings?: () => void;
}

export const AdminProfileDropdown: React.FC<AdminProfileDropdownProps> = ({
  user,
  onLogout,
  secondsRemaining,
  onExtendSession,
  onOpenSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clean Admin Avatar / Logo Button matching screenshot */}
      <button
        type="button"
        id="admin-profile-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[#EAB308] focus-visible:outline-none"
      >
        {/* Circular Avatar Logo */}
        <div className="w-8 h-8 rounded-full bg-white text-gray-700 flex items-center justify-center font-bold text-xs shadow-xs border border-white/40 flex-shrink-0">
          <User className="w-4 h-4 text-gray-700 stroke-[2.2]" />
        </div>

        {/* Clean Admin Labels */}
        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold leading-tight text-white">
            Administrator
          </div>
          <div className="text-[11px] text-white/70 font-mono leading-tight">
            ADM-001
          </div>
        </div>

        {/* Chevron Indicator */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/80 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Detailed Admin Information Modal/Popover */}
      {isOpen && (
        <div
          id="admin-profile-details-popover"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 text-gray-800 animate-fadeIn overflow-hidden"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header Banner */}
          <div className="bg-[#0B3520] text-white p-4 relative border-b border-[#EAB308]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-[#0B3520] flex items-center justify-center font-bold text-base shadow-sm border border-white/20">
                  {user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="font-bold text-sm leading-snug">{user.fullName}</div>
                  <div className="text-xs text-white/80 font-mono">
                    ID: {user.officialId} (ADM-001)
                  </div>
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#EAB308] text-[10px] font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{user.securityClearance}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Metadata List */}
          <div className="p-4 space-y-2.5 text-xs border-b border-gray-100 bg-[#F9FBFA]">
            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1.5 text-gray-500">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span>Designation:</span>
              </span>
              <span className="font-semibold text-gray-900 text-right max-w-[200px] truncate">
                {user.designation}
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1.5 text-gray-500">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>Department:</span>
              </span>
              <span className="font-medium text-gray-800">{user.department}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1.5 text-gray-500">
                <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                <span>Active Session Ref:</span>
              </span>
              <span className="font-mono font-bold text-[#0B3520]">{user.activeSessionId}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1.5 text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                <span>NIC IP Address:</span>
              </span>
              <span className="font-mono text-gray-700">{user.ipAddress}</span>
            </div>
          </div>

          {/* Session Timer & Extension Row */}
          <div className="p-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <div>
                <div className="text-[11px] text-gray-500">Session Inactivity Expiry</div>
                <div className="font-mono font-bold text-xs text-emerald-900">
                  {formatTime(secondsRemaining)} remaining
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onExtendSession();
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-[#0B3520] border border-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-[#0B3520]" />
              <span>Extend +15m</span>
            </button>
          </div>

          {/* Quick Actions & Logout */}
          <div className="p-3 space-y-1">
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-gray-500" />
                  <span>Administrative Preferences</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}

            <button
              type="button"
              id="popover-sign-out-btn"
              onClick={() => {
                setIsOpen(false);
                onLogout('manual');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Sign Out from BhoomiDrishti</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
