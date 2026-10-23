import React, { useState, useRef } from 'react';
import { Clock, Cpu, Scale, RefreshCw, Sparkles } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { SearchGroundingBadges, GroundingSource } from './SearchGroundingBadges.tsx';

interface WhyNowSectionProps {
  isReviewMode: boolean;
}

export function WhyNowSection({ isReviewMode }: WhyNowSectionProps) {
  const [isUpdatingPulse, setIsUpdatingPulse] = useState(false);
  const [pulseSummary, setPulseSummary] = useState<string | null>(null);
  const [pulseSources, setPulseSources] = useState<GroundingSource[]>([]);
  const [pulseError, setPulseError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const steps = [
    {
      step: '01',
      icon: Clock,
      title: 'Évolution du cadre européen',
      description:
        'Les institutions européennes mènent des réflexions sur l’ajustement des barèmes et des délais du règlement (CE) n° 261/2004 pour clarifier les droits des voyageurs.',
      source: 'Conseil de l’UE & Parlement européen, 2026 [organisme public]',
      reviewFlag: {
        claim: 'accord provisoire annoncé en juin 2026',
        reason: 'Énoncé sous réserve de confirmation des textes définitifs au Journal officiel.',
      },
    },
    {
      step: '02',
      icon: Cpu,
      title: 'Nouvelles capacités locales',
      description:
        'L’apparition de modèles d’extraction légers et du traitement local (Wasm / WebGPU) permet d’analyser des billets directement dans le navigateur, sans exposer vos courriels personnels à des serveurs tiers.',
      source: 'Travaux de recherche Edge AI & Local-First, 2026 [académique]',
    },
    {
      step: '03',
      icon: Scale,
      title: 'Vigilance sur les pratiques commerciales',
      description:
        'Les régulateurs surveillent de près les interfaces trompeuses ("dark patterns") et les commissions opaques prélevées par certains intermédiaires (souvent 35 % à 50 % de l’indemnité versée).',
      source: 'Commission européenne, Digital Fairness Fitness Check, 2024-2026 [organisme public]',
    },
  ];

  const handleFetchRegulatoryPulse = async () => {
    setIsUpdatingPulse(true);
    setPulseError(null);

    try {
      const res = await fetch('/api/regulatory-pulse');
      if (!res.ok) throw new Error('Erreur lors de la récupération des actualités.');
      const data = await res.json();
      setPulseSummary(data.summary || 'Veille réglementaire actualisée.');
      setPulseSources(data.groundingSources || []);
    } catch (err: any) {
      console.warn('[WhyNowSection] Info actualisation veille:', err?.message || err);
      setPulseError('Impossible d’actualiser la veille réglementaire via Google Search pour le moment.');
    } finally {
      setIsUpdatingPulse(false);
    }
  };

  return (
    <section
      id="pourquoi-maintenant"
      ref={sectionRef}
      aria-label="Pourquoi maintenant"
      className="py-20 md:py-32 bg-[#03070D] text-[#F4F4F6] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-code text-xs text-[#43DDB0] uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0] shadow-[0_0_6px_#43DDB0]" />
              <span>02 • Contexte & Veille</span>
            </div>
            <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
              Pourquoi maintenant ?
            </h2>
            <p className="font-body text-base sm:text-lg text-[#94A3B8] mt-4">
              La convergence d’évolutions réglementaires, de progrès techniques et d’exigences de transparence crée le moment opportun pour un outil local-first.
            </p>
          </div>

          {/* Trigger live regulatory pulse search grounding */}
          <button
            type="button"
            onClick={handleFetchRegulatoryPulse}
            disabled={isUpdatingPulse}
            data-cursor="action"
            className="self-start md:self-end flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-code border border-white/15 transition focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#43DDB0] ${isUpdatingPulse ? 'animate-spin' : ''}`} />
            <span>{isUpdatingPulse ? 'Recherche en cours...' : 'Actualiser la veille (Google Search)'}</span>
          </button>
        </div>

        {/* Live Grounded Regulatory Banner if loaded */}
        {pulseSummary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 rounded-2xl bg-[#0A0F1A] text-[#F4F4F6] border border-[#43DDB0]/40 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="font-code text-xs text-[#43DDB0] flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Veille en direct ancrée sur Google Search (gemini-3.8-flash)
              </span>
              <span className="text-[11px] font-code text-white/50">
                Sources institutionnelles récentes
              </span>
            </div>
            <p className="font-body text-sm text-white/90 leading-relaxed">
              {pulseSummary}
            </p>

            <SearchGroundingBadges sources={pulseSources} label="Sources officielles détectées" />
          </motion.div>
        )}

        {pulseError && (
          <div className="mb-8 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-body">
            {pulseError}
          </div>
        )}

        {/* Timeline Grid with Connected Vector Path */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting SVG route line on desktop */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-12 left-16 right-16 h-0.5 -z-0"
          >
            <svg className="w-full h-4 overflow-visible">
              <motion.line
                x1="0"
                y1="2"
                x2="100%"
                y2="2"
                stroke="#43DDB0"
                strokeWidth="2"
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
            </svg>
          </div>

          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.2, ease: 'easeOut' }}
                className="relative z-10 flex flex-col justify-between bg-[#0A0F1A] rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-code text-sm font-bold shadow-md ring-4 ring-[#03070D]">
                      {s.step}
                    </span>
                    <Icon className="w-5 h-5 text-[#43DDB0]" />
                  </div>

                  <h3 className="font-display text-2xl text-white mb-3 leading-snug">
                    {s.title}
                  </h3>

                  <p className="font-body text-sm text-[#94A3B8] leading-relaxed mb-4">
                    {s.description}
                  </p>

                  {/* Review flag if applicable */}
                  {s.reviewFlag && (
                    <div
                      data-review="true"
                      className={`text-xs p-2.5 rounded-xl mb-4 ${
                        isReviewMode
                          ? 'bg-amber-500/15 border border-amber-500/50 text-amber-200 block'
                          : 'hidden'
                      }`}
                    >
                      <span className="font-code font-medium block mb-0.5">
                        [À VÉRIFIER EN RELECTURE]
                      </span>
                      « {s.reviewFlag.claim} » — {s.reviewFlag.reason}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 text-xs font-code text-white/50">
                  <span className="text-[10px] uppercase block text-[#43DDB0] mb-0.5">Source :</span>
                  {s.source}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
