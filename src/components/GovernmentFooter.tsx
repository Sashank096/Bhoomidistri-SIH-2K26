import React from 'react';
import { Lock } from 'lucide-react';
import { SupportedLanguage, translations } from '../i18n';

interface GovernmentFooterProps {
  currentLang?: SupportedLanguage;
}

export const GovernmentFooter: React.FC<GovernmentFooterProps> = ({ currentLang = 'en' }) => {
  const t = translations[currentLang] || translations.en;

  return (
    <footer className="w-full bg-[#EAEFEA]/90 border-t border-gray-200 text-gray-600 px-6 sm:px-12 py-3 select-none text-xs" role="contentinfo">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left text with Lock Icon */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Lock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          <span className="font-normal text-gray-700">
            {t.footerText}
          </span>
        </div>

        {/* Right System Version */}
        <div className="text-gray-600 font-normal">
          {t.systemVersion}: <strong className="font-semibold text-gray-800 font-mono">v1.0.0</strong>
        </div>
      </div>
    </footer>
  );
};
