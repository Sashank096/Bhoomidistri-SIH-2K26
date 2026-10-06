import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Clock,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { AdminUser } from '../types';

interface SessionExpiryModalProps {
  isOpen: boolean;
  user: AdminUser;
  secondsRemaining: number;
  onExtendSession: () => void;
  onLogout: (reason?: string) => void;
}

export const SessionExpiryModal: React.FC<SessionExpiryModalProps> = ({
  isOpen,
  user,
  secondsRemaining,
  onExtendSession,
  onLogout,
}) => {
  const [isExtending, setIsExtending] = useState(false);

  // Format mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExtend = async () => {
    setIsExtending(true);
    // Simulate lightweight server handshake
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsExtending(false);
    onExtendSession();
  };

  if (!isOpen) return null;

  // Percentage for progress ring (assuming 120s warning window)
  const percentLeft = Math.min(100, Math.max(0, (secondsRemaining / 120) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expiry-title"
      aria-describedby="session-expiry-desc"
    >
      <div
        id="session-expiry-dialog"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-300 overflow-hidden relative"
      >
        {/* Top Warning Strip */}
        <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#063B2A]" />

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-b from-amber-50/80 to-white border-b border-amber-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0 shadow-inner">
            <ShieldAlert className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded border border-amber-300 mb-1">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              <span>Government Portal Security Warning</span>
            </div>
            <h3 id="session-expiry-title" className="text-lg font-bold text-[#063B2A]">
              Administrative Session Expiring
            </h3>
            <p className="text-xs text-gray-500">
              Department of Land Resources • BhoomiDrishti
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Prominent Live Countdown Card */}
          <div className="bg-amber-50/90 rounded-2xl p-4 border border-amber-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-1">
              Automatic Sign-Out In
            </span>
            <div className="flex items-center gap-2 text-3xl sm:text-4xl font-mono font-extrabold text-amber-950 my-1">
              <Clock className="w-6 h-6 text-amber-700 animate-pulse" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Visual Time Bar */}
            <div className="w-full bg-amber-200/80 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${percentLeft}%` }}
              />
            </div>
          </div>

          {/* Policy & Inactivity Explanation */}
          <p id="session-expiry-desc" className="text-xs text-gray-700 leading-relaxed text-center">
            In compliance with <strong>NIC Cyber Security Guidelines</strong>, administrative sessions are automatically terminated after prolonged inactivity to safeguard sensitive GIS cadastral records.
          </p>

          {/* Session Metadata Details */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-[11px] space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Authorized Officer:</span>
              <strong className="text-gray-900">{user.fullName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Official ID:</span>
              <span className="font-mono text-gray-800">{user.officialId}</span>
            </div>
            <div className="flex justify-between">
              <span>Session Reference:</span>
              <span className="font-mono text-gray-800">{user.activeSessionId}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              id="extend-session-btn"
              onClick={handleExtend}
              disabled={isExtending}
              className="w-full py-3 px-5 rounded-xl bg-[#06452F] hover:bg-[#043222] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#06452F] disabled:opacity-75"
            >
              {isExtending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Renewing Official Session...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Extend Session (Continue Working)</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="session-logout-now-btn"
              onClick={() => onLogout('manual_timeout')}
              disabled={isExtending}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:text-red-700 hover:bg-red-50 hover:border-red-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out Immediately</span>
            </button>
          </div>
        </div>

        {/* Card Footer Security Micro-text */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
          <Lock className="w-3 h-3 text-emerald-700" />
          <span>Encrypted NIC Terminal Session • STQC Audited</span>
        </div>
      </div>
    </div>
  );
};
