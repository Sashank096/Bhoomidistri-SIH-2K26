import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Keyboard,
  Clock,
} from 'lucide-react';
import { LoginFormState } from '../types';
import { SupportedLanguage, translations } from '../i18n';

interface LoginCardProps {
  onLoginSubmit: (formData: LoginFormState) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  onForgotPasswordClick: () => void;
  lang?: SupportedLanguage;
}

// Official government email pattern: name@<department>.gov.in
// Accepts shorthand "name@<dept>.gov.in" and the simpler "name@gov.in" form for shared admin accounts.
const OFFICIAL_EMAIL_PATTERN = /^[a-z0-9._%+-]+@([a-z0-9.-]+\.)?gov\.in$/i;
const OFFICIAL_ID_PATTERN = /^[A-Z0-9-]{3,}$/i;

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000;

interface LockoutState {
  failedAttempts: number;
  lockedUntil: number | null;
}

function readLockout(): LockoutState {
  if (typeof window === 'undefined') return { failedAttempts: 0, lockedUntil: null };
  try {
    const raw = sessionStorage.getItem('bhoomidrishti_login_lockout');
    if (!raw) return { failedAttempts: 0, lockedUntil: null };
    const parsed = JSON.parse(raw) as LockoutState;
    if (parsed.lockedUntil && parsed.lockedUntil < Date.now()) {
      return { failedAttempts: 0, lockedUntil: null };
    }
    return parsed;
  } catch {
    return { failedAttempts: 0, lockedUntil: null };
  }
}

function writeLockout(state: LockoutState) {
  try {
    sessionStorage.setItem('bhoomidrishti_login_lockout', JSON.stringify(state));
  } catch {
    /* sessionStorage unavailable; ignore. */
  }
}

function clearLockout() {
  try {
    sessionStorage.removeItem('bhoomidrishti_login_lockout');
  } catch {
    /* ignore */
  }
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onLoginSubmit,
  isLoading,
  errorMessage,
  onClearError,
  onForgotPasswordClick,
  lang = 'en',
}) => {
  const t = translations[lang] || translations.en;

  // Form State
  const [officialId, setOfficialId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Field validation errors
  const [idError, setIdError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Lockout state (per-tab, session-bound)
  const [lockout, setLockout] = useState<LockoutState>(() => readLockout());
  const [now, setNow] = useState<number>(() => Date.now());

  // Refresh countdown timer for lockout message
  useEffect(() => {
    if (!lockout.lockedUntil) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [lockout.lockedUntil]);

  // Input Refs for deterministic keyboard focusing
  const officialIdInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const remainingLockMs = lockout.lockedUntil ? Math.max(0, lockout.lockedUntil - now) : 0;
  const isLocked = remainingLockMs > 0;

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfficialId(e.target.value);
    if (idError) setIdError(null);
    if (errorMessage) onClearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(null);
    if (errorMessage) onClearError();
  };

  const validateInputs = (): string | null => {
    const trimmedId = officialId.trim();
    if (!trimmedId) {
      setIdError(t.idRequired);
      officialIdInputRef.current?.focus();
      return t.idRequired;
    }
    if (!OFFICIAL_EMAIL_PATTERN.test(trimmedId) && !OFFICIAL_ID_PATTERN.test(trimmedId)) {
      const message = t.idFormatError;
      setIdError(message);
      officialIdInputRef.current?.focus();
      return message;
    }
    setIdError(null);

    if (!password) {
      setPasswordError(t.passwordRequired);
      passwordInputRef.current?.focus();
      return t.passwordRequired;
    }
    if (password.length < 8) {
      const message = t.passwordTooShort;
      setPasswordError(message);
      passwordInputRef.current?.focus();
      return message;
    }
    setPasswordError(null);
    return null;
  };

  const executeSubmit = async () => {
    if (isLoading || isLocked) return;

    const validationError = validateInputs();
    if (validationError) return;

    try {
      await onLoginSubmit({
        officialId: officialId.trim(),
        password,
        captchaInput: 'VERIFIED',
        rememberDevice: false,
      });
      // On success clear any prior failure lockout
      clearLockout();
      setLockout({ failedAttempts: 0, lockedUntil: null });
    } catch {
      // Parent surfaces the error; track failed attempts locally for soft throttle
      const nextAttempts = lockout.failedAttempts + 1;
      const nextState: LockoutState =
        nextAttempts >= MAX_LOGIN_ATTEMPTS
          ? { failedAttempts: nextAttempts, lockedUntil: Date.now() + LOCKOUT_DURATION_MS }
          : { failedAttempts: nextAttempts, lockedUntil: null };
      writeLockout(nextState);
      setLockout(nextState);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSubmit();
  };

  // Keyboard navigation handler for seamless Tab / Enter / Arrows handling
  const handleKeyDownOfficialId = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!password) {
        passwordInputRef.current?.focus();
      } else {
        executeSubmit();
      }
    }
  };

  const handleKeyDownPassword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSubmit();
    }
  };

  return (
    <div
      id="login-card-container"
      className="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] border border-gray-100 p-8 sm:p-9 relative z-10"
      role="region"
      aria-label={t.adminLogin}
    >
      {/* 1. Top Shield User Badge */}
      <div className="text-center mb-6 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#0D3823] mb-4 shadow-xs">
          <svg
            className="w-7 h-7 text-[#0D3823]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Shield Outline */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            {/* User Inside */}
            <circle cx="12" cy="10" r="2.5" />
            <path d="M8.5 16.5c0-1.8 1.5-3 3.5-3s3.5 1.2 3.5 3" />
          </svg>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight font-sans">
          {t.adminLogin}
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-normal">
          {t.secureAccessPortal}
        </p>
      </div>

      {/* 2. Global Error Message Alert */}
      {errorMessage && (
        <div
          id="auth-error-alert"
          role="alert"
          aria-live="assertive"
          className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 leading-snug">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Lockout Warning */}
      {isLocked && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Too many failed attempts. Try again in {Math.ceil(remainingLockMs / 1000)}s.
          </span>
        </div>
      )}

      {/* 3. Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Official ID Field */}
        <div>
          <label
            htmlFor="official-id"
            className="block text-xs font-semibold text-gray-800 mb-1.5"
          >
            {t.officialIdLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              ref={officialIdInputRef}
              id="official-id"
              name="officialId"
              type="text"
              tabIndex={1}
              autoComplete="username"
              placeholder={t.officialIdPlaceholder}
              value={officialId}
              onChange={handleIdChange}
              onKeyDown={handleKeyDownOfficialId}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white text-gray-900 border rounded-xl placeholder:text-gray-400 outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:ring-offset-1 ${
                idError
                  ? 'border-red-400 focus:border-red-600'
                  : 'border-gray-300 hover:border-gray-400 focus:border-[#0D3823]'
              }`}
            />
          </div>
          {idError && (
            <p id="official-id-error" className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {idError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="official-password"
            className="block text-xs font-semibold text-gray-800 mb-1.5"
          >
            {t.passwordLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              ref={passwordInputRef}
              id="official-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              tabIndex={2}
              autoComplete="current-password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDownPassword}
              disabled={isLoading}
              className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white text-gray-900 border rounded-xl placeholder:text-gray-400 outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:ring-offset-1 ${
                passwordError
                  ? 'border-red-400 focus:border-red-600'
                  : 'border-gray-300 hover:border-gray-400 focus:border-[#0D3823]'
              }`}
            />
            <button
              type="button"
              id="toggle-password-visibility-btn"
              tabIndex={3}
              onClick={() => setShowPassword(!showPassword)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setShowPassword(!showPassword);
                }
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:outline-none rounded-md cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {passwordError}
            </p>
          )}

          {/* Forgot Password Link */}
          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              id="forgot-password-link"
              tabIndex={4}
              onClick={onForgotPasswordClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onForgotPasswordClick();
                }
              }}
              className="text-xs font-semibold text-[#0D3823] hover:underline focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:outline-none rounded px-1 transition-colors cursor-pointer"
            >
              {t.forgotPassword}
            </button>
          </div>
        </div>

        {/* 4. Login Button */}
        <div className="pt-2">
          <button
            ref={submitButtonRef}
            type="submit"
            id="login-submit-btn"
            tabIndex={5}
            disabled={isLoading || isLocked}
            className="w-full py-3 px-6 rounded-xl bg-[#0B3520] hover:bg-[#082818] active:bg-[#051a10] text-white font-medium text-sm tracking-normal shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B3520] focus-visible:outline-none"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#EAB308]" />
                <span>{t.loggingIn}</span>
              </>
            ) : isLocked ? (
              <>
                <Clock className="w-4 h-4 text-white stroke-[2]" />
                <span>Locked – {Math.ceil(remainingLockMs / 1000)}s</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white stroke-[2]" />
                <span>{t.loginBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Keyboard navigation helper pill */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 select-none">
        <Keyboard className="w-3.5 h-3.5 text-gray-400" />
        <span>{t.keyboardNavTip}</span>
      </div>

      {/* 5. Authorised administrator access only divider */}
      <div className="mt-3 pt-2 flex items-center justify-center">
        <div className="w-full flex items-center justify-center gap-2">
          <div className="h-[1px] bg-gray-200 flex-1 max-w-[40px]" />
          <div className="flex items-center gap-1.5 text-xs text-gray-600 select-none">
            <svg
              className="w-3.5 h-3.5 text-gray-500 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v8" />
              <path d="m8 12 4 4 4-4" />
            </svg>
            <span className="text-center">{t.authorisedOnly}</span>
          </div>
          <div className="h-[1px] bg-gray-200 flex-1 max-w-[40px]" />
        </div>
      </div>
    </div>
  );
};
