import React from 'react';
import { ArrowDownRight, ShieldCheck, Sparkles, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { RadarCanvas } from './RadarCanvas.tsx';

interface HeroSectionProps {
  onOpenSimulator: () => void;
}

export function HeroSection({ onOpenSimulator }: HeroSectionProps) {
  return (
    <section
      id="hero"
      aria-label="Présentation générale"
      className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center overflow-hidden py-12 md:py-20 bg-[#F4F1EA]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Kinetic Editorial Headline & Controls */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Fine Calibration Tag */}
            <div className="flex items-center gap-2 mb-6 text-xs font-code text-[#17191D]/70 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#43DDB0] animate-pulse" />
              <span>DÉTECTION · ESTIMATION · PRÉPARATION LOCALE</span>
            </div>

            {/* Exactly one H1 for the page with Masked Reveal */}
            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight text-[#17191D]"
              >
                Le radar de vos droits en voyage.
              </motion.h1>
            </div>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="font-body text-lg sm:text-xl text-[#17191D]/80 leading-relaxed mb-8 max-w-xl"
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
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#101722] hover:bg-[#1D2736] text-[#F6F5F1] font-code text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
              >
                <span>Rejoindre la liste d’attente</span>
                <ArrowDownRight className="w-4 h-4 text-[#43DDB0] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <button
                type="button"
                onClick={onOpenSimulator}
                data-cursor="action"
                className="group inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-[#17191D]/20 hover:border-[#17191D]/60 bg-[#F4F1EA] text-[#17191D] font-code text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E7A63A]"
              >
                <Sparkles className="w-4 h-4 text-[#E7A63A] group-hover:rotate-12 transition-transform" />
                <span>Tester le simulateur de vol</span>
              </button>
            </motion.div>

            {/* Local-first architecture note */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
              className="flex items-start gap-3 p-4 rounded-xl bg-[#E7E7E2]/70 border border-[#17191D]/10 max-w-lg"
            >
              <ShieldCheck className="w-5 h-5 text-[#43DDB0] shrink-0 mt-0.5" />
              <div className="text-xs font-body text-[#17191D]/80 leading-snug">
                <strong className="font-medium text-[#17191D] block mb-0.5">
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
              <RadarCanvas />
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
            className="opacity-40"
          />
          <circle cx="20" cy="70" r="3.5" fill="#101722" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="20" cy="70" r="1.5" fill="currentColor" />
        </svg>
        <span className="font-code text-[10px] text-[#17191D]/50 uppercase tracking-widest mt-1">
          Signal en cours de détection ↓
        </span>
      </div>
    </section>
  );
}
