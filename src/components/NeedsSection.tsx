import React from 'react';
import { DollarSign, Zap, Sliders, Lock, AlertCircle } from 'lucide-react';

export const NeedsSection: React.FC = () => {
  const needs = [
    {
      icon: DollarSign,
      title: 'Clarté du prix',
      desc: 'Un modèle forfaitaire transparent évite de céder un tiers de son indemnité pour de simples démarches administratives.',
    },
    {
      icon: Zap,
      title: 'Rapidité d’analyse',
      desc: 'Savoir en quelques secondes si un vol perturbé est susceptible d’ouvrir un droit selon la réglementation.',
    },
    {
      icon: Sliders,
      title: 'Maintien du contrôle',
      desc: 'L’utilisateur relit le document, choisit son canal d’envoi et conserve la maîtrise directe avec la compagnie.',
    },
    {
      icon: Lock,
      title: 'Confidentialité des données',
      desc: 'Pas de collecte de boîtes e-mail complètes ni de revente de données personnelles à des tiers commercialisant des billets.',
    },
  ];

  return (
    <section
      id="besoins"
      className="py-20 bg-[#07111F] text-[#F4F1E9] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#35D9AE] block mb-2">
            06 — Besoins Identifiés
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-white">
            Prix clairs, rapidité, contrôle et confidentialité.
          </h2>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {needs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-[#35D9AE]/60 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#35D9AE]/10 border border-[#35D9AE]/30 flex items-center justify-center text-[#35D9AE] mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="font-serif text-2xl text-white mb-2">
                  {item.title}
                </h3>

                <p className="font-sans text-sm text-[#A6B3C4] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Research Disclaimer */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-xs font-mono text-[#A6B3C4]">
          <AlertCircle className="w-4 h-4 text-[#FFB84D] shrink-0" />
          <p>
            <strong className="text-white">Note de recherche :</strong> Ces observations qualitatives guident l’architecture fonctionnelle de la solution.
          </p>
        </div>
      </div>
    </section>
  );
};
