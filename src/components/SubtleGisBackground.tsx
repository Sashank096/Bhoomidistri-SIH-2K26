import React from 'react';
import bgImage from '../assets/images/bhoomidrishti_bg_1787930176761.jpg';

export const SubtleGisBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#F7F9F7]">
      {/* Right Side: Scenic Lush Terraced Hills Landscape */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[65%] lg:w-[58%] overflow-hidden">
        <img
          src={bgImage}
          alt="Terraced agricultural hills"
          className="w-full h-full object-cover object-center"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%)',
          }}
        />
        {/* Soft light overlay for mist feeling */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-white/40 pointer-events-none" />
      </div>

      {/* Left Side: Clean Topographic Contour Lines */}
      <div className="absolute left-0 top-0 bottom-0 w-full md:w-[60%] opacity-40 pointer-events-none">
        <svg
          viewBox="0 0 800 1000"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="#0D3823"
        >
          {/* Faint subtle elevation curves */}
          <g strokeWidth="0.85" opacity="0.25">
            <path d="M -100 150 C 150 180 280 320 220 500 C 160 680 350 820 450 950" />
            <path d="M -100 230 C 180 260 320 390 260 580 C 200 750 400 890 500 1020" />
            <path d="M -100 310 C 210 340 360 460 300 660 C 240 820 450 960 550 1090" />
            <path d="M -100 390 C 240 420 400 530 340 740 C 280 890 500 1030 600 1160" />
            <path d="M -100 470 C 270 500 440 600 380 820 C 320 960 550 1100 650 1230" />
            <path d="M -100 550 C 300 580 480 670 420 900 C 360 1030 600 1170 700 1300" />
          </g>

          <g strokeWidth="0.6" opacity="0.18">
            <path d="M -50 80 C 180 110 320 240 250 440 C 190 620 380 760 480 890" />
            <path d="M -50 160 C 210 190 360 310 290 520 C 230 690 430 830 530 960" />
            <path d="M 50 0 C 250 120 400 250 330 460 C 270 630 470 770 570 900" />
          </g>
        </svg>
      </div>

      {/* Top Right: Dot Grid Pattern */}
      <div
        className="absolute top-8 right-8 w-44 h-44 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#0D3823 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
        }}
      />
    </div>
  );
};

