import React from 'react';
import { ArrowDownRight, ShieldCheck, Sparkles, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { RadarCanvas } from './RadarCanvas.tsx';

interface HeroSectionProps {
  onOpenSimulator: (preset?: 'short' | 'medium' | 'long') => void;
}

export function HeroSection({ onOpenSimulator }: HeroSectionProps) {
  return (
    <section
      id="hero"
      aria-label="Présentation générale"
      className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center overflow-hidden py-12 md:py-20 bg-[#03070D] text-[#F4F4F6]"
    >
      {/* Subtle Unseen ambient atmospheric glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#43DDB0]/10 via-[#0055ff]/5 to-transparent blur-[140px] pointer-events-none -z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Kinetic Editorial Headline & Controls */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Fine Calibration Tag */}
            <div className="flex items-center gap-2 mb-6 text-xs font-code text-[#43DDB0] tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#43DDB0] animate-pulse shadow-[0_0_8px_#43DDB0]" />
              <span>DÉTECTION · ESTIMATION · PRÉPARATION LOCALE</span>
            </div>

            {/* Exactly one H1 for the page with Masked Reveal */}
            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight text-white"
              >
                Le radar de vos droits en voyage.
              </motion.h1>
            </div>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="font-body text-lg sm:text-xl text-[#94A3B8] leading-relaxed mb-8 max-w-xl"
            >
              Il repère les vols qui peuvent ouvrir un droit à indemnisation, estime le montant possible et prépare votre réclamation. Vos données restent sur votre appareil.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-4 mb-10"
            >
              <a
                href="#inscription"
                data-cursor="action"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-code text-sm font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
              >
                <span>Rejoindre la liste d’attente</span>
                <ArrowDownRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <button
                type="button"
                onClick={() => onOpenSimulator()}
                data-cursor="action"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 hover:border-white/50 bg-white/[0.04] hover:bg-white/[0.08] text-white font-code text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFB340]"
              >
                <Sparkles className="w-4 h-4 text-[#FFB340] group-hover:rotate-12 transition-transform" />
                <span>Tester le simulateur de vol</span>
              </button>
            </motion.div>

            {/* Local-first architecture note */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-[#0A0F1A]/90 border border-white/10 max-w-lg shadow-xl"
            >
              <ShieldCheck className="w-5 h-5 text-[#43DDB0] shrink-0 mt-0.5" />
              <div className="text-xs font-body text-white/80 leading-snug">
                <strong className="font-semibold text-white block mb-0.5">
                  Conception locale d’abord (local-first)
                </strong>
                L’analyse de vos confirmations de vol s’effectue directement dans votre navigateur ou sur votre appareil. Vos emails et documents personnels ne sont pas envoyés sur un serveur tiers pour être scannés.
              </div>
            </motion.div>
          </div>

          {/* Right Column: Spatial Radar Environment */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Ambient spatial glow */}
            <div
              aria-hidden="true"
              className="absolute -inset-6 bg-radial from-[#43DDB0]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"
            />
            <div className="w-full relative z-10">
              <RadarCanvas
                onBlipSelect={(blip) => {
                  if (blip.id === 'af1234') onOpenSimulator('short');
                  else if (blip.id === 'ib3401') onOpenSimulator('medium');
                  else if (blip.id === 'dl890') onOpenSimulator('long');
                  else onOpenSimulator();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Connected Section Transition: Vector Flight Path down to Problem Section */}
      <div className="relative mt-8 flex flex-col items-center justify-center pointer-events-none">
        <svg
          width="40"
          height="80"
          viewBox="0 0 40 80"
          fill="none"
          className="text-[#43DDB0]"
          aria-hidden="true"
        >
          <line
            x1="20"
            y1="0"
            x2="20"
            y2="70"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-50"
          />
          <circle cx="20" cy="70" r="3.5" fill="#03070D" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="20" cy="70" r="1.5" fill="currentColor" />
        </svg>
        <span className="font-code text-[10px] text-white/40 uppercase tracking-widest mt-1">
          Signal en cours de détection ↓
        </span>
      </div>
    </section>
  );
}
