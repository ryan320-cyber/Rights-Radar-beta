import React, { useEffect, useState } from 'react';
import { ArrowDownRight, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WingedEyes } from './WingedEyes.tsx';
import { soundEngine } from '../utils/soundEngine.ts';

interface OpeningIntroProps {
  onEnter: (enableAudio?: boolean) => void;
}

export function OpeningIntro({ onEnter }: OpeningIntroProps) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // If reduced motion or autostart is requested, bypass immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const urlParams = new URLSearchParams(window.location.search);
    if (prefersReducedMotion || urlParams.get('autostart') === '1') {
      onEnter(false);
      return;
    }

    // Smooth loading counter [ 0% ] -> [ 100% ]
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 4;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setIsLoaded(true), 300);
      } else {
        setProgress(current);
      }
    }, 45);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEnter(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEnter]);

  const handleEnterWithAudio = () => {
    soundEngine.setMuted(false);
    soundEngine.playPing();
    soundEngine.startAmbient();
    onEnter(true);
  };

  const handleEnterWithoutAudio = () => {
    soundEngine.setMuted(true);
    onEnter(false);
  };

  return (
    <aside
      aria-label="Introduction interactive Rights Radar"
      className="fixed inset-0 z-50 bg-[#090D14] text-[#F4F4F6] flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#43DDB0] animate-pulse" />
          <span className="font-code text-xs text-white/50 tracking-widest">
            RIGHTS RADAR // OBSERVATOIRE FLIGHT CE 261/2004
          </span>
        </div>

        <button
          type="button"
          onClick={handleEnterWithoutAudio}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 hover:border-[#43DDB0] text-xs font-code text-white/60 hover:text-white transition focus:outline-none"
        >
          <span>Passer</span>
          <span className="text-[10px] text-white/30 font-mono">[Échap]</span>
        </button>
      </div>

      {/* Center Winged Mascot & Intro Card */}
      <div className="my-auto flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <WingedEyes className="w-36 h-20" />
        </motion.div>

        {/* Loading readout or Title */}
        <div className="font-code text-xs text-white/40 tracking-widest uppercase mb-3">
          {isLoaded ? '[ SYSTÈME PRÊT ]' : `[ ${progress}% ]`}
        </div>

        <h1 className="font-display tracking-tight text-4xl sm:text-5xl text-white mb-3">
          Rights Radar<span className="text-[#43DDB0] text-2xl align-super">®</span>
        </h1>

        <p className="font-body text-sm sm:text-base text-white/70 leading-relaxed mb-8 max-w-md">
          Un observatoire et radar d'estimation des droits aériens créant la clarté face aux retards et annulations.
        </p>

        {/* Action Controls */}
        <AnimatePresence>
          {isLoaded ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <button
                type="button"
                onClick={handleEnterWithAudio}
                autoFocus
                data-cursor="action"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-code text-xs font-semibold tracking-wider transition-all duration-200 shadow-xl active:scale-[0.98] w-full sm:w-auto"
              >
                <span>Entrer avec musique lo-fi ♫</span>
                <Volume2 className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                <ArrowDownRight className="w-3.5 h-3.5 text-black" />
              </button>

              <button
                type="button"
                onClick={handleEnterWithoutAudio}
                data-cursor="action"
                className="text-[11px] font-code text-white/40 hover:text-white/80 uppercase tracking-widest transition flex items-center gap-1.5 py-1"
              >
                <VolumeX className="w-3 h-3" />
                <span>Entrer sans musique</span>
              </button>
            </motion.div>
          ) : (
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#43DDB0] transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Legal / Tech Note */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-white/10 text-[10px] font-code text-white/40 relative z-20">
        <div>CONCEPTION LOCALE D’ABORD • AUCUN ENVOI DE DOCUMENTS VERS DES SERVEURS TIERS</div>
        <div>RÈGLEMENT (CE) N° 261/2004</div>
      </div>
    </aside>
  );
}
