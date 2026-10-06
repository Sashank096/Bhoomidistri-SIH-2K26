import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  Lock,
  AlertCircle,
  Clock,
  Keyboard,
} from 'lucide-react';
import { AdminUser } from '../types';
import { SupportedLanguage, translations } from '../i18n';

interface MfaCardProps {
  user: AdminUser;
  onVerifyMfa: (otpCode: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  lang?: SupportedLanguage;
}

export const MfaCard: React.FC<MfaCardProps> = ({
  user,
  onVerifyMfa,
  onCancel,
  isLoading,
  errorMessage,
  lang = 'en',
}) => {
  const t = translations[lang] || translations.en;

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [mfaMethod, setMfaMethod] = useState<'sms_email' | 'nic_token'>('sms_email');
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendNotification, setResendNotification] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Global Escape key listener to return to login
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onCancel]);

  const handleDigitChange = (index: number, value: string) => {
    if (isLoading) return;
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (cleanVal && index === 5) {
      // All filled, focus submit button or ready
      submitButtonRef.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const fullCode = otpDigits.join('');
      if (fullCode.length === 6) {
        onVerifyMfa(fullCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResend = () => {
    setTimeLeft(120);
    setCanResend(false);
    setOtpDigits(['', '', '', '', '', '']);
    setResendNotification('A fresh 6-digit authentication token has been dispatched.');
    setTimeout(() => setResendNotification(null), 5000);
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) return;
    await onVerifyMfa(fullCode);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isComplete = otpDigits.every((d) => d.length === 1);

  return (
    <div
      id="mfa-card-container"
      className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] border border-gray-100 p-8 sm:p-9 relative z-10 animate-fadeIn"
      role="region"
      aria-label={t.twoFactorAuth}
    >
      {/* Header */}
      <div className="text-center mb-6 pt-1">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] mx-auto flex items-center justify-center text-[#0D3823] mb-3 shadow-xs">
          <ShieldCheck className="w-7 h-7 stroke-[1.75] text-[#0D3823]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D3823]/5 text-[#0D3823] text-[11px] font-semibold uppercase tracking-wider mb-1.5 border border-[#0D3823]/10">
          <KeyRound className="w-3 h-3 text-[#EAB308]" />
          <span>{t.step2of2}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {t.twoFactorAuth}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {user.fullName} <span className="text-gray-400">({user.officialId})</span>
        </p>
      </div>

      {/* Method Selector Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-medium border border-gray-200">
        <button
          type="button"
          tabIndex={1}
          onClick={() => setMfaMethod('sms_email')}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setMfaMethod('sms_email');
            }
          }}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:outline-none ${
            mfaMethod === 'sms_email'
              ? 'bg-white text-[#0D3823] shadow-xs font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{t.smsEmailTab}</span>
        </button>
        <button
          type="button"
          tabIndex={2}
          onClick={() => setMfaMethod('nic_token')}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setMfaMethod('nic_token');
            }
          }}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:outline-none ${
            mfaMethod === 'nic_token'
              ? 'bg-white text-[#0D3823] shadow-xs font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{t.totpTab}</span>
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-[#0D3823] mb-4">
        <p className="font-medium flex items-center gap-1.5 leading-snug">
          <Smartphone className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
          <span>
            {mfaMethod === 'sms_email' ? t.otpSentNotice : t.totpNotice}
          </span>
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Resend success notice */}
      {resendNotification && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{resendNotification}</span>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 6 Digit Input Boxes */}
        <div>
          <label className="block text-center text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
            {t.enterOtp}
          </label>
          <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                tabIndex={3 + index}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                aria-label={`Digit ${index + 1}`}
                className="w-10 h-12 sm:w-12 sm:h-13 text-center font-mono text-xl sm:text-2xl font-bold bg-white text-gray-900 border border-gray-300 rounded-xl focus:border-[#0D3823] focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:ring-offset-1 outline-none transition-all"
              />
            ))}
          </div>
        </div>

        {/* Countdown Timer only */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="text-[#0B3520] font-medium">Enter the 6-digit OTP sent to your NIC-registered contact or authenticator app.</div>

          {/* Timer */}
          <div className="flex items-center gap-1 text-gray-500 font-mono">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Resend Action */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {t.didntReceiveCode}{' '}
            <button
              type="button"
              tabIndex={10}
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className={`font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#0D3823] rounded px-1 ${
                canResend
                  ? 'text-[#0D3823] hover:underline cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              {t.resendOtp} {canResend ? '' : `(in ${timeLeft}s)`}
            </button>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            ref={submitButtonRef}
            type="submit"
            id="verify-mfa-submit-btn"
            tabIndex={11}
            disabled={isLoading || !isComplete}
            className="w-full py-3 px-6 rounded-xl bg-[#0B3520] hover:bg-[#082818] text-white font-medium text-sm tracking-normal shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B3520] focus-visible:outline-none"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#EAB308]" />
                <span>{t.verifying}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white stroke-[2]" />
                <span>{t.verifyAndEnter}</span>
              </>
            )}
          </button>

          <button
            type="button"
            tabIndex={12}
            onClick={onCancel}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onCancel();
              }
            }}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.cancelReturn}</span>
          </button>
        </div>
      </form>

      {/* Keyboard tip */}
      <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-gray-400 select-none">
        <Keyboard className="w-3 h-3 text-gray-400" />
        <span>{t.keyboardNavTip}</span>
      </div>
    </div>
  );
};
