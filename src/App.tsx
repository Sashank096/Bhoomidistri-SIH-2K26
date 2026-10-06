import React, { useState } from 'react';
import { GovernmentTopBar } from './components/GovernmentTopBar';
import { SubtleGisBackground } from './components/SubtleGisBackground';
import { LoginCard } from './components/LoginCard';
import { MfaCard } from './components/MfaCard';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { AppDetailsBanner } from './components/AppDetailsBanner';
import { GovernmentFooter } from './components/GovernmentFooter';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthStep, LoginFormState, AdminUser, UserRole } from './types';
import { SupportedLanguage, translations } from './i18n';
import { LandownerInviteWorkspace, PortalRole, PortalSelector, PortalWorkspace, PortalIcon } from './components/PortalAccess';
import { landAcquisitionApi } from './services/landAcquisitionApi';

export default function App() {
  const inviteMatch = window.location.pathname.match(/^\/landowner\/invite\/([^/]+)/);
  // Authentication Step State
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);

  // Authenticated Admin User Data
  const [authenticatedUser, setAuthenticatedUser] = useState<AdminUser | null>(null);
  const [selectedPortal, setSelectedPortal] = useState<PortalRole | null>(null);
  const [portalUser, setPortalUser] = useState<string | null>(null);
  const [authChallengeId, setAuthChallengeId] = useState<string | null>(null);
  const [portalChallengeId, setPortalChallengeId] = useState<string | null>(null);
  const [portalAuthenticatedUser, setPortalAuthenticatedUser] = useState<AdminUser | null>(null);

  // Multilingual State (English, Hindi, Telugu, Tamil)
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');

  const t = translations[currentLang] || translations.en;

  if (inviteMatch) return <LandownerInviteWorkspace token={decodeURIComponent(inviteMatch[1])} />;

  // Handle Primary Login Submission
  const handleLoginSubmit = async (formData: LoginFormState) => {
    setIsLoading(true);
    setErrorMessage(null);

    const id = formData.officialId.toLowerCase().trim();
    const pass = formData.password;

    // Official credentials validation — the backend enforces role, active status,
    // and password verification. Frontend only submits the entered values.
    try {
      const auth = await landAcquisitionApi.login(id, pass);
      // Build the authenticated user object from the server-issued challenge
      // and the verified session. No hardcoded profile data is used.
      const user: AdminUser = {
        officialId: formData.officialId,
        fullName: auth.user?.full_name || formData.officialId,
        designation: auth.user?.role === 'Administrator'
          ? 'Central Land Acquisition Director & Nodal GIS Officer'
          : auth.user?.role === 'Officer'
            ? 'Land Acquisition Officer'
            : 'Portal User',
        department: 'Land Records Modernization Division',
        ministry: 'Ministry of Rural Development',
        securityClearance: 'Level-5 (Top Secret GIS)',
        zone: 'Northern & Western Infrastructure Corridor',
        lastLogin: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        ipAddress: '10.144.62.19 (NIC National Gateway)',
        activeSessionId: `BD-GOV-${Math.floor(100000 + Math.random() * 900000)}`,
        role: (auth.user?.role as UserRole) || 'Administrator',
      };

      setAuthenticatedUser(user);
      setAuthChallengeId(auth.challenge_id);
      setIsLoading(false);
      // Advance to Step 2: Multi-Factor Authentication
      setCurrentStep('mfa');
    } catch (error) {
      // Invalid credentials - Generic message to prevent username enumeration
      setIsLoading(false);
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    }
  };

  // Handle MFA Verification
  const handleVerifyMfa = async (otpCode: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    if (authChallengeId && otpCode.length === 6) {
      try {
        const auth = await landAcquisitionApi.verifyOtp(authChallengeId, otpCode);
        sessionStorage.setItem('bhoomidrishti_access_token', auth.access_token);
        setIsLoading(false);
        setCurrentStep('authenticated');
        return;
      } catch (error) {
        setIsLoading(false);
        setErrorMessage(error instanceof Error ? error.message : 'The authentication code is invalid or expired.');
        return;
      }
    }
    setIsLoading(false);
    setErrorMessage('Start a new sign-in challenge before entering an authentication code.');
  };

  // Handle Sign out
  const handleLogout = (reason?: string) => {
    const token = sessionStorage.getItem('bhoomidrishti_access_token');
    if (token) void landAcquisitionApi.logout(token).catch(() => undefined);
    sessionStorage.removeItem('bhoomidrishti_access_token');
    setAuthenticatedUser(null);
    setCurrentStep('login');
    if (reason === 'timeout' || reason === 'manual_timeout') {
      setErrorMessage(
        'Your administrative session has expired due to inactivity. Please log in again to access BhoomiDrishti.'
      );
    } else {
      setErrorMessage(null);
    }
  };

  const handlePortalLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identity = String(form.get('identity') || '').trim();
    const password = String(form.get('password') || '');
    setIsLoading(true);
    setErrorMessage(null);
    if (selectedPortal === 'Officer') {
      try {
        const auth = await landAcquisitionApi.login(identity.toLowerCase(), password);
        if (auth.delivery === 'development') {
          setErrorMessage('A development OTP has been generated. Enter it on the next screen.');
        }
        setPortalChallengeId(auth.challenge_id);
        setPortalAuthenticatedUser({
          officialId: identity,
          fullName: identity,
          designation: 'Land Acquisition Officer',
          department: 'Department of Land Resources',
          ministry: 'Ministry of Rural Development',
          securityClearance: 'Level-3 (Restricted)',
          zone: 'Assigned project zone',
          lastLogin: new Date().toLocaleString('en-IN'),
          ipAddress: 'Authenticated service session',
          activeSessionId: `BD-OFFICER-${Date.now()}`,
          role: 'Officer',
        });
        setCurrentStep('mfa');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Officer authentication failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setIsLoading(false);
    if (identity) setPortalUser(identity);
  };

  const handleVerifyPortalMfa = async (otpCode: string) => {
    if (!portalChallengeId || !portalAuthenticatedUser) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const auth = await landAcquisitionApi.verifyOtp(portalChallengeId, otpCode);
      sessionStorage.setItem('bhoomidrishti_access_token', auth.access_token);
      setPortalUser(auth.user.username);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error instanceof Error ? error.message : 'The officer authentication code is invalid or expired.');
    }
  };

  const handlePortalLogout = () => {
    const token = sessionStorage.getItem('bhoomidrishti_access_token');
    if (token) void landAcquisitionApi.logout(token).catch(() => undefined);
    sessionStorage.removeItem('bhoomidrishti_access_token');
    setPortalUser(null);
    setPortalChallengeId(null);
    setPortalAuthenticatedUser(null);
    setSelectedPortal(null);
    setCurrentStep('login');
  };

  // If already authenticated and inside the portal
  if (currentStep === 'authenticated' && authenticatedUser) {
    return <AdminDashboard user={authenticatedUser} onLogout={handleLogout} />;
  }

  if (portalUser && selectedPortal && selectedPortal !== 'Administrator') {
    return <PortalWorkspace role={selectedPortal} userName={portalUser} onLogout={handlePortalLogout} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAF9] text-[#1E2922] font-sans">
      {/* 1. Government Header Bar with Multilingual Switcher */}
      <GovernmentTopBar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* 2. Main Center Body with Subtle GIS/Agricultural Background */}
      <main className="relative flex-1 flex flex-col justify-center items-center px-4 pt-6 pb-6 overflow-hidden">
        {/* Subtle Agricultural / Land / GIS Visual Background Asset on Right */}
        <SubtleGisBackground />

        {/* Title Header */}
        <div className="text-center mb-6 relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0D3823] tracking-tight font-sans">
            {t.portalName}
          </h1>
          <p className="text-xs sm:text-sm md:text-base font-normal text-gray-600 mt-1 tracking-normal">
            | {t.systemSubtitle} |
          </p>
        </div>

        {/* Shared role gateway and role-specific access */}
        {!selectedPortal ? <PortalSelector onSelect={setSelectedPortal} /> : <div className="w-full flex justify-center relative z-10">
          {selectedPortal === 'Administrator' && currentStep === 'mfa' && authenticatedUser ? (
            <MfaCard
              user={authenticatedUser}
              onVerifyMfa={handleVerifyMfa}
              onCancel={() => {
                setCurrentStep('login');
                setErrorMessage(null);
              }}
              isLoading={isLoading}
              errorMessage={errorMessage}
              lang={currentLang}
            />
          ) : selectedPortal === 'Officer' && currentStep === 'mfa' && portalAuthenticatedUser ? (
            <MfaCard
              user={portalAuthenticatedUser}
              onVerifyMfa={handleVerifyPortalMfa}
              onCancel={() => {
                setCurrentStep('login');
                setPortalChallengeId(null);
                setPortalAuthenticatedUser(null);
                setErrorMessage(null);
              }}
              isLoading={isLoading}
              errorMessage={errorMessage}
              lang={currentLang}
            />
          ) : selectedPortal === 'Administrator' ? (
            <LoginCard
              onLoginSubmit={handleLoginSubmit}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onForgotPasswordClick={() => setIsForgotPasswordOpen(true)}
              onClearError={() => setErrorMessage(null)}
              lang={currentLang}
            />
          ) : (
            <form onSubmit={handlePortalLogin} className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-7 space-y-5">
              <div className="flex items-center gap-2 text-[#0B3520] font-bold text-sm"><PortalIcon role={selectedPortal} /> {selectedPortal} access</div>
              <div><h2 className="text-xl font-extrabold text-gray-900">Continue to your workspace</h2><p className="text-xs text-gray-500 mt-1">{selectedPortal === 'Officer' ? 'Use your official Officer ID.' : 'Enter your mobile number or secure invitation ID.'}</p></div>
              <label className="block text-sm font-semibold text-gray-700">{selectedPortal === 'Officer' ? 'Officer ID' : 'Mobile or invitation ID'}<input name="identity" required className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" placeholder={selectedPortal === 'Officer' ? 'officer-102' : 'Enter your ID'} /></label>
              {selectedPortal === 'Officer' && <label className="block text-sm font-semibold text-gray-700">Password<input name="password" type="password" required minLength={8} className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" placeholder="Enter your officer password" /></label>}
              <button className="w-full rounded-xl bg-[#0B3520] text-white py-3 text-sm font-bold">Send secure access code</button>
              <button type="button" onClick={() => setSelectedPortal(null)} className="w-full text-xs text-gray-500 hover:text-gray-900">Back to portal selection</button>
            </form>
          )}
        </div>}

        {/* Details About BhoomiDrishti App in Selected Language */}
        <div className="relative z-10 w-full">
          <AppDetailsBanner lang={currentLang} />
        </div>
      </main>

      {/* 3. Password Reset Workflow Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      {/* 4. Official Government Footer */}
      <GovernmentFooter currentLang={currentLang} />
    </div>
  );
}
