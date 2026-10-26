import React from 'react';
import { TimelineItem } from '../types';
import { Clock, HelpCircle } from 'lucide-react';

interface WhyNowSectionProps {
  isReviewMode: boolean;
}

const timelineData: TimelineItem[] = [
  {
    id: 't1',
    date: 'Juin 2026',
    title: 'Évolution des règles européennes',
    description: 'Accord provisoire annoncé en juin 2026 concernant l’actualisation des règles sur les droits des passagers aériens.',
    source: 'Conseil de l’Union européenne [organisme public]',
    sourceType: '[organisme public]',
    isUnverified: true,
  },
  {
    id: 't2',
    date: '2025 - 2026',
    title: 'Modèles IA légers et locaux',
    description: 'Les navigateurs modernes permettent désormais d’exécuter de petits modèles d’analyse de texte directement sur le processeur du client.',
    source: 'Recherches en IA embarquée [académique]',
    sourceType: '[académique]',
    isUnverified: false,
  },
  {
    id: 't3',
    date: '2025',
    title: 'Lutte contre les motifs trompeurs',
    description: 'Encadrement strict des frais cachés et des intermédiaires abusifs par les instances réglementaires.',
    source: 'Parlement européen [organisme public]',
    sourceType: '[organisme public]',
    isUnverified: false,
  },
];

export const WhyNowSection: React.FC<WhyNowSectionProps> = ({ isReviewMode }) => {
  return (
    <section
      id="pourquoi-maintenant"
      className="py-20 bg-[#07111F] text-[#F4F1E9] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#35D9AE] block mb-2">
            02 — Pourquoi maintenant ?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-white">
            La convergence de trois facteurs majeurs.
          </h2>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {timelineData.map((item, idx) => (
            <div
              key={item.id}
              data-review={item.isUnverified ? 'true' : undefined}
              className="relative p-6 sm:p-8 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#35D9AE]/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Timeline index & date */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-bold text-[#35D9AE]">
                    0{idx + 1}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-mono text-xs">
                    <Clock className="w-3 h-3 text-[#35D9AE]" />
                    {item.date}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-white mb-3">
                  {item.title}
                </h3>

                <p className="font-sans text-sm text-[#A6B3C4] leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              {/* Review flag for staging mode */}
              {item.isUnverified && isReviewMode && (
                <div className="mb-4 p-2.5 rounded-xl bg-[#FFB84D]/20 border border-[#FFB84D] text-[#FFB84D] text-xs font-mono flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>[À VÉRIFIER] Formulation de l’accord provisoire</span>
                </div>
              )}

              {/* Source Tag */}
              <div className="pt-4 border-t border-white/10 text-xs font-mono text-[#A6B3C4]">
                <span>Source : </span>
                <span className="text-white font-medium">{item.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
