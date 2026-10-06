import React from 'react';

interface BhoomiDrishtiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: 'light' | 'dark';
}

export const BhoomiDrishtiLogo: React.FC<BhoomiDrishtiLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'light',
}) => {
  const iconSize = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  const titleSize = {
    sm: 'text-base font-bold',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-bold',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Circular Emblem with Orange Sun and Terraced Green Fields */}
      <div className={`relative ${iconSize} flex-shrink-0 rounded-full bg-white p-[1px] shadow-sm flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full rounded-full overflow-hidden"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sky background */}
          <rect width="100" height="100" fill="#FFFFFF" />

          {/* Golden / Orange Sun */}
          <circle cx="50" cy="38" r="16" fill="#F97316" />

          {/* Top terraced hill curve */}
          <path
            d="M 0 65 Q 40 45 100 62 L 100 100 L 0 100 Z"
            fill="#15803D"
          />

          {/* Foreground rolling terraced hill curve */}
          <path
            d="M 0 78 Q 60 58 100 75 L 100 100 L 0 100 Z"
            fill="#166534"
          />

          {/* Terraced line accent */}
          <path
            d="M 15 72 Q 55 56 85 68"
            stroke="#86EFAC"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <span
          className={`tracking-tight font-sans ${titleSize} ${
            textColor === 'light' ? 'text-white' : 'text-[#0D3823]'
          }`}
        >
          BhoomiDrishti
        </span>
      )}
    </div>
  );
};

