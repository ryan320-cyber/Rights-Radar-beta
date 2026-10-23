import React, { useEffect, useState } from 'react';
import { ArrowRight, Compass, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OpeningIntroProps {
  onEnter: () => void;
}

export function OpeningIntro({ onEnter }: OpeningIntroProps) {
  const [coords, setCoords] = useState('48°51′24″ N · 002°21′07″ E');
  const [step, setStep] = useState(0);

  useEffect(() => {
    // If reduced motion or autostart is requested, bypass immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const urlParams = new URLSearchParams(window.location.search);
    if (prefersReducedMotion || urlParams.get('autostart') === '1') {
      onEnter();
      return;
    }

    // Sequence timing
    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 700);
    const t3 = setTimeout(() => setStep(3), 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onEnter]);

  return (
    <aside
      aria-label="Introduction interactive Rights Radar"
      className="fixed inset-0 z-50 bg-[#080C14] text-[#F6F5F1] flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none"
    >
      {/* Top Bar with Technical Calibration & Skip Action */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-20">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#43DDB0] animate-pulse" />
          <span className="font-code text-xs text-white/60 tracking-wider">
            CALIBRATION RADAR CE 261/2004 • {coords}
          </span>
        </div>

        <button
          type="button"
          onClick={onEnter}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:border-[#43DDB0] text-xs font-code text-white/70 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
        >
          <span>Passer l’intro</span>
          <span className="text-[10px] text-white/40 font-mono">[Échap]</span>
        </button>
      </div>

      {/* Center Cinematic Radar Core */}
      <div className="relative my-auto flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full py-12">
        {/* Concentric expanding radar rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0">
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.6, 1.2, 1], opacity: [0, 0.4, 0.15] }}
            transition={{ duration: 2, ease: 'easeOut', repeat: Infinity, repeatType: 'reverse' }}
            className="w-96 h-96 rounded-full border border-[#43DDB0]/30"
          />
          <motion.div
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.25 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="w-72 h-72 rounded-full border border-dashed border-white/20"
          />
          <div className="w-48 h-48 rounded-full border border-white/10" />

          {/* Sweeping laser line */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
            className="absolute w-80 h-0.5 bg-gradient-to-r from-transparent via-[#43DDB0]/40 to-[#43DDB0] origin-center"
          />
        </div>

        {/* Wordmark with Mask Reveal */}
        <div className="relative z-10 space-y-4">
          <div className="overflow-hidden pb-1">
            <motion.h1
              initial={{ y: '100%', opacity: 0 }}
              animate={step >= 1 ? { y: '0%', opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display italic text-6xl sm:text-7xl lg:text-8xl tracking-tight text-[#F6F5F1]"
            >
              Rights Radar
            </motion.h1>
          </div>

          <div className="overflow-hidden">
            <motion.p
              initial={{ y: '100%', opacity: 0 }}
              animate={step >= 2 ? { y: '0%', opacity: 1 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-body text-base sm:text-lg text-white/70 max-w-md mx-auto"
            >
              Le radar de vos droits en voyage.
              <span className="block text-xs font-code text-[#43DDB0] mt-2">
                Détection locale · Estimation indicative · Sans commission prélevée
              </span>
            </motion.p>
          </div>

          {/* Enter CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={step >= 3 ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="pt-6"
          >
            <button
              type="button"
              onClick={onEnter}
              autoFocus
              data-cursor="radar"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#43DDB0] hover:bg-[#38C69D] text-[#080C14] font-code text-sm font-semibold tracking-wide transition-all duration-300 shadow-[0_0_25px_rgba(67,221,176,0.4)] hover:shadow-[0_0_35px_rgba(67,221,176,0.6)] focus:outline-none focus:ring-4 focus:ring-[#43DDB0]/50"
            >
              <span>Entrer dans l’environnement</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Technical Readout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 text-[11px] font-code text-white/50 relative z-20">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#43DDB0]" />
          <span>ADS-B FREQ 1090 MHz • TRAITEMENT NAVIGATEUR LOCAL (CLIENT-SIDE)</span>
        </div>
        <div>AUCUN COURRIEL NI BILLET TRANSMIS À UN TIERS</div>
      </div>
    </aside>
  );
}
