import React from 'react';

export function WingedEyes({ className = "w-28 h-16" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Left Wing */}
      <svg
        className="w-10 h-10 text-white/90 animate-flap-left"
        viewBox="0 0 40 40"
        fill="currentColor"
        style={{ transformOrigin: '80% 50%' }}
      >
        <path d="M36 20 C28 14 18 10 2 14 C0 20 6 26 14 26 C20 26 28 24 36 20 Z" fill="#F4E8E1" opacity="0.95" />
        <path d="M34 22 C26 18 16 16 6 20 C6 24 14 28 22 27 C26 26 30 24 34 22 Z" fill="#EAD5C8" opacity="0.7" />
        <path d="M30 24 C24 22 18 21 10 24 C12 27 18 29 24 28 C26 27 28 25 30 24 Z" fill="#D8BCAC" opacity="0.5" />
      </svg>

      {/* Eyes Container */}
      <div className="relative flex items-center -space-x-1 z-10">
        {/* Left Eye */}
        <div className="w-8 h-9 rounded-[50%] bg-[#FFDA79] border-2 border-[#1E1E24] relative overflow-hidden shadow-inner flex items-center justify-center">
          {/* Pupil */}
          <div className="w-4 h-4 rounded-full bg-[#1A1A1A] relative animate-pulse flex items-center justify-center">
            {/* Pupil Glint */}
            <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-0.5 right-0.5" />
          </div>
          {/* Subtle Radar Scanline overlay in eye */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#43DDB0]/20 to-transparent pointer-events-none" />
        </div>

        {/* Right Eye */}
        <div className="w-8 h-9 rounded-[50%] bg-[#FFDA79] border-2 border-[#1E1E24] relative overflow-hidden shadow-inner flex items-center justify-center">
          {/* Pupil */}
          <div className="w-4 h-4 rounded-full bg-[#1A1A1A] relative animate-pulse flex items-center justify-center">
            {/* Pupil Glint */}
            <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-0.5 right-0.5" />
          </div>
          {/* Subtle Radar Scanline overlay in eye */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#43DDB0]/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Right Wing */}
      <svg
        className="w-10 h-10 text-white/90 animate-flap-right"
        viewBox="0 0 40 40"
        fill="currentColor"
        style={{ transformOrigin: '20% 50%' }}
      >
        <path d="M4 20 C12 14 22 10 38 14 C40 20 34 26 26 26 C20 26 12 24 4 20 Z" fill="#F4E8E1" opacity="0.95" />
        <path d="M6 22 C14 18 24 16 34 20 C34 24 26 28 18 27 C14 26 10 24 6 22 Z" fill="#EAD5C8" opacity="0.7" />
        <path d="M10 24 C16 22 22 21 30 24 C28 27 22 29 16 28 C14 27 12 25 10 24 Z" fill="#D8BCAC" opacity="0.5" />
      </svg>
    </div>
  );
}
