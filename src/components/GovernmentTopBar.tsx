import React from 'react';
import { GovernmentEmblem } from './GovernmentEmblem';
import { BhoomiDrishtiLogo } from './BhoomiDrishtiLogo';
import { Globe } from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, translations } from '../i18n';

interface GovernmentTopBarProps {
  currentLang?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

export const GovernmentTopBar: React.FC<GovernmentTopBarProps> = ({
  currentLang = 'en',
  onLanguageChange,
}) => {
  const t = translations[currentLang] || translations.en;

  return (
    <header className="w-full select-none" role="banner">
      {/* Main Government Green Header */}
      <div className="bg-[#0B3520] text-white px-4 sm:px-8 lg:px-12 py-3 border-b-[3px] border-[#EAB308] shadow-sm relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: State Emblem of India */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <GovernmentEmblem size="sm" variant="light" />
          </div>

          {/* Center: Ministry and Department Name */}
          <div className="text-center flex flex-col items-center justify-center flex-1 px-2">
            <div className="text-[11px] sm:text-xs md:text-sm font-normal text-white/90 tracking-normal font-sans">
              {t.govTitle} <span className="mx-1 text-white/60">|</span> {t.ministryTitle}
            </div>
            <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white tracking-wide mt-0.5 font-sans">
              {t.departmentTitle}
            </div>
          </div>

          {/* Right: BhoomiDrishti Logo & Language Selector */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Multilingual Selector */}
            <div className="relative flex items-center">
              <label htmlFor="language-selector" className="sr-only">
                {t.languageSelect}
              </label>
              <div className="flex items-center gap-1.5 bg-[#072415] hover:bg-[#051a0f] text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/20 transition-all focus-within:ring-2 focus-within:ring-[#EAB308]">
                <Globe className="w-3.5 h-3.5 text-[#EAB308] flex-shrink-0" aria-hidden="true" />
                <select
                  id="language-selector"
                  value={currentLang}
                  onChange={(e) => onLanguageChange?.(e.target.value as SupportedLanguage)}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer pr-1 font-medium"
                  aria-label="Select Language (English, Hindi, Telugu, Tamil)"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-[#0B3520] text-white">
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BhoomiDrishti Logo */}
            <div className="hidden sm:flex items-center">
              <BhoomiDrishtiLogo size="md" textColor="light" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
