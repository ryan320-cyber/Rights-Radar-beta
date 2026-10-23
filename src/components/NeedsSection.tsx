import React, { useRef } from 'react';
import { Coins, Zap, Lock, SlidersHorizontal, Compass } from 'lucide-react';
import { motion, useInView } from 'motion/react';

export function NeedsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const needs = [
    {
      icon: Coins,
      tag: 'TRANSPARENCE TARIFAIRE',
      title: 'Prix clairs et prévisibles',
      description:
        'Savoir exactement ce que coûte le service dès le départ, sans pourcentage rétroactif de 35 % à 50 % prélevé sur les indemnités obtenues.',
      colSpan: 'md:col-span-7',
      bg: 'bg-[#0A0F1A]',
    },
    {
      icon: Zap,
      tag: 'TRAITEMENT IMMÉDIAT',
      title: 'Rapidité d’analyse',
      description:
        'Obtenir une estimation en quelques secondes après l’importation d’une confirmation, sans attendre des semaines d’audit intermédiaire.',
      colSpan: 'md:col-span-5',
      bg: 'bg-[#0A0F1A]',
    },
    {
      icon: SlidersHorizontal,
      tag: 'AUTONOMIE GUIDÉE',
      title: 'Contrôle exclusif',
      description:
        'Rester le décisionnaire exclusif de la démarche : aucune communication n’est expédiée à une compagnie aérienne sans votre relecture préalable.',
      colSpan: 'md:col-span-5',
      bg: 'bg-[#0A0F1A]',
    },
    {
      icon: Lock,
      tag: 'SOUVERAINETÉ DES DONNÉES',
      title: 'Confidentialité absolue',
      description:
        'Éviter de transférer l’accès complet à sa boîte de réception électronique ou à des pièces d’identité sur des serveurs distants.',
      colSpan: 'md:col-span-7',
      bg: 'bg-[#0A0F1A]',
    },
  ];

  return (
    <section
      id="besoins"
      ref={sectionRef}
      aria-label="Besoins et attentes identifiés"
      className="py-20 md:py-32 bg-[#060A12] border-b border-white/[0.08] text-[#F4F4F6] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <div className="flex items-center gap-2 font-code text-xs text-[#43DDB0] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0] shadow-[0_0_6px_#43DDB0]" />
            <span>06 • Attentes & Besoins</span>
          </div>
          <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
            Prix clairs, rapidité, contrôle et confidentialité.
          </h2>
          <p className="font-body text-base sm:text-lg text-[#94A3B8] mt-4 max-w-2xl">
            Quatre principes directeurs guident la conception de l’architecture technique et de l’expérience de Rights Radar.
          </p>
        </div>

        {/* Varied Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 mb-8">
          {needs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 * idx, ease: 'easeOut' }}
                className={`relative ${item.colSpan} ${item.bg} p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl hover:border-white/20 flex flex-col justify-between group transition-all duration-300`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-code uppercase tracking-wider text-[#43DDB0]">
                      {item.tag}
                    </span>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-white/10 text-[#43DDB0] border border-white/10">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl mb-3 text-white">
                    {item.title}
                  </h3>

                  <p className="font-body text-sm sm:text-base leading-relaxed text-[#94A3B8]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mandatory Research Disclaimer */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-body text-white/70 flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#43DDB0] shrink-0" />
          <span>
            <strong className="font-semibold text-white">Avertissement méthodologique :</strong>{' '}
            Ces observations constituent des pistes de recherche et des hypothèses de conception, pas une preuve statistique représentative.
          </span>
        </div>
      </div>
    </section>
  );
}
