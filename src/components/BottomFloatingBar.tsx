import React, { useState, useEffect } from 'react';
import { Globe, Volume2, VolumeX, ShieldCheck, Sparkles, Cookie } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

interface BottomFloatingBarProps {
  onToggleWorld: () => void;
  isWorldActive: boolean;
  onOpenSecurity?: () => void;
  onOpenSimulator?: () => void;
  onOpenCookies?: () => void;
}

export function BottomFloatingBar({
  onToggleWorld,
  isWorldActive,
  onOpenSecurity,
  onOpenSimulator,
  onOpenCookies,
}: BottomFloatingBarProps) {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted());

  useEffect(() => {
    setIsMuted(soundEngine.isMuted());
  }, []);

  const handleToggleAudio = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playTick();
    }
  };

  return (
    <aside
      aria-label="Barre de contrôle fluide et sécurité"
      className="fixed bottom-5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-full bg-[#07111F]/80 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(53,217,174,0.15)] pointer-events-auto transition-all duration-300">
        
        {/* Left: Audio Lo-Fi Toggle */}
        <button
          type="button"
          onClick={handleToggleAudio}
          data-cursor="action"
          className="group cursor-pointer flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-all duration-200 active:scale-95"
          aria-label={isMuted ? "Activer l'ambiance sonore" : "Couper l'ambiance sonore"}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
          ) : (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 pb-0.5">
              <span className="w-0.5 bg-[#35D9AE] rounded-full eq-1" />
              <span className="w-0.5 bg-[#35D9AE] rounded-full eq-2" />
              <span className="w-0.5 bg-[#35D9AE] rounded-full eq-3" />
              <span className="w-0.5 bg-[#35D9AE] rounded-full eq-4" />
            </div>
          )}
          <span className="hidden md:inline text-[11px] font-code tracking-wider uppercase select-none">
            {isMuted ? 'Lo-Fi Off' : 'Lo-Fi City ♫'}
          </span>
        </button>

        {/* Security Audit Badge Button */}
        {onOpenSecurity && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenSecurity();
            }}
            data-cursor="action"
            className="group cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#35D9AE]/10 hover:bg-[#35D9AE]/20 border border-[#35D9AE]/30 text-[#35D9AE] transition-all duration-200 active:scale-95"
            title="Lancer le centre de sécurité et vérification cryptographique"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#35D9AE] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-code font-medium tracking-wide">
              Sécurité Local-First
            </span>
          </button>
        )}

        {/* Center Prominent World Toggle Button (Unseen Studio Hero Callout) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleWorld();
          }}
          data-cursor="radar"
          className="group cursor-pointer relative inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-code text-xs font-semibold tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(53,217,174,0.5)] active:scale-95 select-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#35D9AE] animate-ping" />
          <span>{isWorldActive ? 'Quitter le Radar 3D' : 'Radar 3D World'}</span>
          <Globe className="w-3.5 h-3.5 text-black group-hover:rotate-45 transition-transform" />
        </button>

        {/* Quick Simulator Launcher */}
        {onOpenSimulator && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenSimulator();
            }}
            data-cursor="action"
            className="group cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/90 hover:text-white transition-all duration-200 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFB84D] group-hover:rotate-12 transition-transform" />
            <span className="text-[11px] font-code tracking-wide">
              Simulateur
            </span>
          </button>
        )}

        {/* Right Cookies Button */}
        {onOpenCookies && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenCookies();
            }}
            data-cursor="action"
            className="group cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/60 hover:text-white transition-all duration-200 active:scale-95"
            title="Paramètres de confidentialité et cookies"
          >
            <Cookie className="w-3.5 h-3.5 text-white/50 group-hover:text-[#43DDB0] transition-colors" />
            <span className="hidden lg:inline text-[11px] font-code">
              Cookies
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
