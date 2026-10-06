import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Scale,
  CreditCard,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SupportedLanguage, translations } from '../i18n';

interface AppDetailsBannerProps {
  lang?: SupportedLanguage;
}

export const AppDetailsBanner: React.FC<AppDetailsBannerProps> = ({ lang = 'en' }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const t = translations[lang] || translations.en;
  const { aboutApp } = t;

  const featureIcons = [
    <TrendingUp className="w-5 h-5 text-[#0D3823]" key="0" />,
    <MapPin className="w-5 h-5 text-[#0D3823]" key="1" />,
    <Scale className="w-5 h-5 text-[#0D3823]" key="2" />,
    <CreditCard className="w-5 h-5 text-[#0D3823]" key="3" />,
  ];

  return (
    <section
      className="w-full max-w-6xl mx-auto px-4 mt-6 mb-4"
      aria-label={aboutApp.heading}
    >
      <div className="bg-white/95 backdrop-blur-xs rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-gray-200/80 p-5 sm:p-6 transition-all duration-200">
        {/* Header Strip with Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#0D3823] flex-shrink-0">
              <Info className="w-4 h-4 text-[#0D3823]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-[#0D3823] bg-[#0D3823]/5 uppercase tracking-wider mb-0.5">
                <span>{aboutApp.tag}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                {aboutApp.heading}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="self-start sm:self-auto inline-flex items-center gap-1 text-xs font-semibold text-[#0D3823] hover:text-[#082818] bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0D3823] focus-visible:outline-none"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Content Body */}
        {isExpanded && (
          <div className="pt-4 space-y-4 animate-fadeIn">
            {/* App Purpose Summary */}
            <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed max-w-5xl">
              {aboutApp.summary}
            </p>

            {/* 4 Core Pillars of BhoomiDrishti */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {aboutApp.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-[#F8FAF9] hover:bg-[#F0F5F2] p-3.5 rounded-xl border border-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#C8E6C9] flex items-center justify-center mb-2.5 shadow-2xs">
                    {featureIcons[idx % featureIcons.length]}
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 leading-snug">
                    {feature.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
