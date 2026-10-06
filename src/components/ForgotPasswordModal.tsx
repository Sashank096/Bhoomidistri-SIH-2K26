import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  User,
  KeyRound,
  RefreshCw,
  AlertCircle,
  MailCheck,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [officialId, setOfficialId] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
      setOfficialId('');
      setSubmitted(false);
      setErrorMsg(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Keyboard navigation for closing via Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialId.trim()) {
      setErrorMsg('Please enter your official ID or registered employee email.');
      return;
    }
    if (!captchaInput.trim() || captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg('Invalid captcha code. Please try again.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Simulate secure government dispatch
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative">
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-[#0B3520] border-b border-[#EAB308]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#F8FAF9] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D3823]/10 text-[#0D3823] flex items-center justify-center border border-[#0D3823]/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 id="forgot-password-title" className="text-base sm:text-lg font-bold text-[#0D3823]">
                Administrator Credential Recovery
              </h3>
              <p className="text-xs text-gray-500">Department of Land Resources Portal</p>
            </div>
          </div>
          <button
            type="button"
            tabIndex={0}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:outline-none cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7">
          {submitted ? (
            /* Secure Generic Success Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                <MailCheck className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-[#0D3823]">
                Recovery Request Dispatched
              </h4>
              <div className="bg-[#F8FAF9] border border-gray-200 rounded-xl p-4 text-xs text-gray-700 leading-relaxed text-left space-y-2">
                <p className="font-medium text-gray-900">
                  <strong>Security Policy Notice:</strong>
                </p>
                <p>
                  If the account is registered, password recovery instructions will be provided through the configured recovery channel.
                </p>
                <p className="text-[11px] text-gray-500">
                  Please check your registered government inbox (@gov.in / @nic.in) and official NIC SMS communications.
                </p>
              </div>
              <button
                type="button"
                tabIndex={0}
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-[#0B3520] hover:bg-[#082818] text-white text-xs font-bold rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#0B3520] cursor-pointer"
              >
                Return to Login Page
              </button>
            </div>
          ) : (
            /* Recovery Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  For security compliance, password resets require dual validation through your designated Nodal Officer and NIC identity token.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="recovery-id-input"
                  className="block text-xs font-semibold text-gray-800 mb-1.5"
                >
                  Official Email or Employee ID <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="recovery-id-input"
                    type="text"
                    tabIndex={1}
                    placeholder="e.g. officer@landresources.gov.in"
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white text-gray-900 border border-gray-300 rounded-xl placeholder:text-gray-400 outline-none focus:border-[#0D3823] focus-visible:ring-2 focus-visible:ring-[#0D3823]"
                  />
                </div>
              </div>

              {/* Security Captcha */}
              <div>
                <label
                  htmlFor="captcha-input-box"
                  className="block text-xs font-semibold text-gray-800 mb-1.5"
                >
                  Verification Captcha <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-10 bg-gray-100 rounded-xl border border-gray-300 flex items-center justify-center select-none font-mono text-base sm:text-lg font-bold tracking-widest text-[#0D3823]">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    tabIndex={2}
                    onClick={generateCaptcha}
                    className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 focus-visible:ring-2 focus-visible:ring-[#0D3823] cursor-pointer"
                    title="Refresh code"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <input
                    id="captcha-input-box"
                    type="text"
                    tabIndex={3}
                    placeholder="Code"
                    maxLength={6}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    disabled={isLoading}
                    className="w-28 py-2 px-3 text-xs sm:text-sm font-mono uppercase bg-white border border-gray-300 rounded-xl outline-none focus:border-[#0D3823] focus-visible:ring-2 focus-visible:ring-[#0D3823]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  tabIndex={4}
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#0D3823] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  tabIndex={5}
                  disabled={isLoading}
                  className="w-full sm:w-2/3 py-2.5 px-5 rounded-xl bg-[#0B3520] hover:bg-[#082818] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B3520]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#EAB308]" />
                      <span>Verifying & Sending...</span>
                    </>
                  ) : (
                    <span>Request Password Reset</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
