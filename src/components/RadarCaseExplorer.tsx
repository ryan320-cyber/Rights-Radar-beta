import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Globe, Plane, Shield, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

interface CaseCard {
  id: string;
  badge: string;
  title: string;
  route: string;
  compensation: string;
  jurisprudence: string;
  summary: string;
  delay: string;
  rotation: number;
}

const caseStudies: CaseCard[] = [
  {
    id: 'case-1',
    badge: 'Retard > 3h • Court-Courrier',
    title: 'Paris-CDG → Nice',
    route: 'AF 1234 • Distance 680 km',
    compensation: '250 € / passager',
    jurisprudence: 'Règlement CE 261/2004, Art. 7 § 1(a)',
    summary: 'Panne technique sur l’appareil au décollage. La compagnie a tenté d’invoquer un cas fortuit : la jurisprudence CJUE Sturgeon et Wallentin-Hermann confirme que la maintenance relève de l’activité normale du transporteur.',
    delay: '3h 45m de retard effectif',
    rotation: -4,
  },
  {
    id: 'case-2',
    badge: 'Annulation • Moyen-Courrier',
    title: 'Francfort → Lisbonne',
    route: 'LH 1102 • Distance 1 890 km',
    compensation: '400 € / passager',
    jurisprudence: 'Règlement CE 261/2004, Art. 7 § 1(b)',
    summary: 'Vol annulé 48 heures avant le départ pour réorganisation de flotte. L’absence de préavis de 14 jours ouvre droit à l’indemnité forfaitaire de 400 € en plus du remboursement ou réacheminement.',
    delay: 'Annulation sans réacheminement équivalent',
    rotation: 3,
  },
  {
    id: 'case-3',
    badge: 'Long-Courrier • > 3 500 km',
    title: 'Paris-CDG → New York-JFK',
    route: 'DL 0890 • Distance 5 830 km',
    compensation: '600 € / passager',
    jurisprudence: 'Règlement CE 261/2004, Art. 7 § 1(c)',
    summary: 'Arrivée avec 4h30 de retard à New York. En application du barème maximal extracommunautaire, l’indemnité est de 600 € par billet sans aucune retenue de commission avec Rights Radar.',
    delay: '4h 30m de retard',
    rotation: -2,
  },
  {
    id: 'case-4',
    badge: 'Arrêt Majeur de Principe',
    title: 'Jurisprudence CJUE Sturgeon',
    route: 'Cour de Justice de l’Union Européenne',
    compensation: 'Arrêt C-402/07 & C-432/07',
    jurisprudence: 'Droit fondamental des passagers',
    summary: 'Les passagers dont les vols atteignent leur destination finale avec trois heures de retard ou plus doivent être traités de manière égale aux passagers de vols annulés en matière d’indemnisation.',
    delay: 'Jurisprudence fondatrice',
    rotation: 5,
  },
  {
    id: 'case-5',
    badge: 'Correspondance Manquée',
    title: 'Lyon → Amsterdam → Tokyo',
    route: 'KL 1412 / KL 0861 • Trajet complet',
    compensation: '600 € / passager',
    jurisprudence: 'Arrêt Folkerts (CJUE C-11/11)',
    summary: 'Même si le premier vol court n’a subi que 25 min de retard, la correspondance a été manquée et l’arrivée finale à Tokyo s’est faite avec 6h de retard : l’indemnité de 600 € s’applique sur l’intégralité du trajet.',
    delay: '6h 15m à destination finale',
    rotation: -5,
  },
];

export const RadarCaseExplorer: React.FC = () => {
  const [activeCase, setActiveCase] = useState<CaseCard>(caseStudies[0]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <section className="py-24 bg-[#0B0E14] text-[#F5F2EB] relative overflow-hidden border-t border-[#E7E7E2]/10 select-none">
      {/* Decorative background radial grid & atmospheric glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#43DDB0]/10 via-[#0B0E14]/80 to-[#0B0E14] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#43DDB0] uppercase tracking-widest mb-4">
            <Globe className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Exploration Interactive • Jurisprudence & Cas Concrets</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#F5F2EB] leading-tight">
            Le radar en action : survolez les dossiers réels.
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#9BA3AF] mt-4 leading-relaxed font-light">
            Inspiré de l’univers interactif 3D d’Unseen Studio. Explorez comment les principes du Règlement CE 261/2004 s'appliquent à chaque scénario de perturbation.
          </p>
        </div>

        {/* 3D Interactive Card Sphere / Carousel Stage */}
        <div
          onMouseMove={handleMouseMove}
          className="relative min-h-[460px] flex items-center justify-center perspective-[1200px]"
        >
          {/* Wireframe Rotating Globe Background Effect */}
          <div
            className="absolute w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full border border-white/10 pointer-events-none transition-transform duration-500 ease-out"
            style={{
              transform: `rotateY(${mousePos.x * 25}deg) rotateX(${-mousePos.y * 25}deg)`,
              boxShadow: '0 0 80px rgba(67, 221, 176, 0.08) inset',
            }}
          >
            <div className="absolute inset-4 rounded-full border border-dashed border-white/15 animate-spin-slow" />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />
            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/10" />
            {/* Latitude rings */}
            <div className="absolute top-[25%] left-0 w-full h-[1px] bg-white/5" />
            <div className="absolute bottom-[25%] left-0 w-full h-[1px] bg-white/5" />
          </div>

          {/* Floating Interactive 3D Cards */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {caseStudies.slice(0, 3).map((study) => {
              const isHovered = hoveredCard === study.id;
              const isCurrent = activeCase.id === study.id;

              return (
                <motion.div
                  key={study.id}
                  whileHover={{ scale: 1.04, y: -6 }}
                  onMouseEnter={() => {
                    setHoveredCard(study.id);
                    setActiveCase(study);
                  }}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setActiveCase(study)}
                  className={`relative p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer backdrop-blur-xl ${
                    isCurrent
                      ? 'bg-white/10 border-[#43DDB0] shadow-[0_0_30px_rgba(67,221,176,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-white/25'
                  }`}
                  style={{
                    transform: `rotate(${study.rotation}deg) translateY(${
                      mousePos.y * 10
                    }px)`,
                  }}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-mono uppercase tracking-wider text-[#43DDB0]">
                      {study.badge}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#E7A63A]">
                      {study.compensation}
                    </span>
                  </div>

                  {/* Route & Title */}
                  <h3 className="font-serif text-2xl text-white mb-1">
                    {study.title}
                  </h3>
                  <div className="font-mono text-xs text-[#9BA3AF] mb-4 flex items-center gap-1.5">
                    <Plane className="w-3 h-3 text-[#43DDB0]" />
                    <span>{study.route}</span>
                  </div>

                  {/* Delay & Summary */}
                  <div className="space-y-3 font-sans text-xs text-[#C3C7CF] leading-relaxed">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-[#43DDB0]">
                      ⏱ {study.delay}
                    </div>
                    <p>{study.summary}</p>
                  </div>

                  {/* Footer Legal Reference */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#717885]">
                    <span>{study.jurisprudence}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#43DDB0]" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Inspection Drawer */}
        <motion.div
          key={activeCase.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#43DDB0]">
              Jurisprudence analysée • {activeCase.route}
            </span>
            <div className="font-serif text-xl sm:text-2xl text-white">
              {activeCase.title} — Montant estimé : <span className="text-[#43DDB0]">{activeCase.compensation}</span>
            </div>
            <p className="font-sans text-xs text-[#9BA3AF] max-w-2xl">
              {activeCase.summary}
            </p>
          </div>
          <a
            href="#S8"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#43DDB0] text-[#0B0E14] font-mono text-xs font-bold hover:bg-[#38c49b] transition-transform transform hover:scale-105"
          >
            <span>Tester mes vols</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
