import React from 'react';

interface GovernmentEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'gold';
}

export const GovernmentEmblem: React.FC<GovernmentEmblemProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
}) => {
  const sizeMap = {
    sm: 'w-8 h-10',
    md: 'w-10 h-12',
    lg: 'w-16 h-20',
  };

  const colorClass =
    variant === 'gold'
      ? 'text-[#E5B54F]'
      : variant === 'dark'
      ? 'text-[#063B2A]'
      : 'text-white';

  return (
    <div className={`flex flex-col items-center flex-shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 120"
        className={`${sizeMap[size]} ${colorClass} flex-shrink-0`}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="State Emblem of India"
        role="img"
      >
        {/* Central & Side Lions Top Profile */}
        <g id="lions">
          {/* Central Lion */}
          <path d="M50 8 C44 8 41 12 40 17 C39 22 41 26 43 28 C39 30 37 34 37 38 C37 43 40 47 45 49 L45 53 L55 53 L55 49 C60 47 63 43 63 38 C63 34 61 30 57 28 C59 26 61 22 60 17 C59 12 56 8 50 8 Z" />
          <circle cx="50" cy="18" r="3" fill="currentColor" opacity="0.3" />
          
          {/* Left Lion */}
          <path d="M39 18 C35 18 32 21 30 25 C29 29 30 33 32 35 C28 37 27 41 27 46 C28 50 32 54 36 55 L36 57 L42 57 L42 51 C38 49 35 45 35 41 C35 37 38 34 40 33 Z" opacity="0.9" />
          
          {/* Right Lion */}
          <path d="M61 18 C65 18 68 21 70 25 C71 29 70 33 68 35 C72 37 73 41 73 46 C72 50 68 54 64 55 L64 57 L58 57 L58 51 C62 49 65 45 65 41 C65 37 62 34 60 33 Z" opacity="0.9" />
        </g>

        {/* Abacus Platform */}
        <g id="abacus">
          <rect x="22" y="60" width="56" height="5" rx="1.5" fill="currentColor" />
          <rect x="18" y="65" width="64" height="10" rx="1.5" fill="currentColor" opacity="0.95" />
          
          {/* Center Ashoka Chakra */}
          <circle cx="50" cy="70" r="4.5" fill="#063B2A" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="70" r="1.2" fill="currentColor" />
          
          {/* Horse on Left */}
          <path d="M28 70 C26 69 24 69 23 71 C22 72 24 73 26 73 C28 73 29 71 31 71 Z" fill="currentColor" opacity="0.8" />
          
          {/* Bull on Right */}
          <path d="M72 70 C74 69 76 69 77 71 C78 72 76 73 74 73 C72 73 71 71 69 71 Z" fill="currentColor" opacity="0.8" />
        </g>

        {/* Bell Capital / Inverted Lotus */}
        <g id="lotus">
          <path d="M22 77 C25 85 35 90 50 90 C65 90 75 85 78 77 Z" fill="currentColor" opacity="0.8" />
        </g>

        {/* Satyameva Jayate Text in Devanagari */}
        <text
          x="50"
          y="108"
          textAnchor="middle"
          fill="currentColor"
          fontSize="9.5"
          fontWeight="bold"
          letterSpacing="0.5"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          सत्यमेव जयते
        </text>
      </svg>
    </div>
  );
};
