import React from 'react';
import { Info, BarChart2 } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section
      id="comparaison"
      className="py-20 bg-[#F4F1E9] text-[#07111F] border-t border-[#07111F]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#07111F]/60 block mb-2">
            05 — Comparaison de Modèle
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight">
            D'autres services existent, et certains ont davantage d'expérience.
          </h2>
          <p className="font-sans text-base text-[#07111F]/70 mt-3">
            Exemple comparatif basé sur une indemnité théorique de <strong className="text-[#07111F]">400 €</strong> (vol moyen-courrier intra-UE) :
          </p>
        </div>

        {/* Comparison Bars */}
        <div className="bg-[#07111F] text-[#F4F1E9] p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#35D9AE]" />
              <span className="font-mono text-sm uppercase text-white font-semibold">
                Coût comparé sur une indemnité de 400 €
              </span>
            </div>
            <span className="text-xs font-mono text-[#A6B3C4]">
              Montant effectif net versé au passager
            </span>
          </div>

          {/* Option A: Commission Service */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-mono gap-1">
              <span className="font-bold text-white">
                Intermédiaires à la commission (ex. 35 % de commission)
              </span>
              <span className="text-[#FFB84D] font-bold">
                140 € prélevés (Reste 260 €) <span className="text-white/40 font-normal">[ex: modèle à la commission]</span>
              </span>
            </div>

            <div className="w-full h-9 bg-white/5 rounded-xl overflow-hidden flex border border-white/10">
              <div
                style={{ width: '65%' }}
                className="bg-[#35D9AE]/35 h-full flex items-center justify-center text-xs font-mono font-bold text-white"
              >
                260 € à l'usager (65 %)
              </div>
              <div
                style={{ width: '35%' }}
                className="bg-[#FFB84D] h-full flex items-center justify-center text-xs font-mono font-bold text-[#03070D]"
              >
                140 € commission (35 %)
              </div>
            </div>
          </div>

          {/* Option B: Rights Radar Fixed Fee Hypothesis */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-mono gap-1">
              <span className="font-bold text-white">
                Rights Radar (Hypothèse de modèle forfaitaire)
              </span>
              <span className="text-[#35D9AE] font-bold">
                9 à 14 € forfait <span className="text-white/40 font-normal">[hypothèse à tester auprès des usagers]</span>
              </span>
            </div>

            <div className="w-full h-9 bg-white/5 rounded-xl overflow-hidden flex border border-white/10">
              <div
                style={{ width: '97%' }}
                className="bg-[#35D9AE] h-full flex items-center px-4 text-xs font-mono font-bold text-[#03070D]"
              >
                ~386 € à 391 € conservés par l'usager (&gt; 96 %)
              </div>
              <div
                style={{ width: '3%' }}
                className="bg-white/40 h-full"
                title="Forfait 9-14 €"
              />
            </div>
          </div>

          {/* Disclaimer Note */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3 text-xs font-mono text-[#A6B3C4]">
            <Info className="w-4 h-4 text-[#35D9AE] shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Exemple de calcul indicatif :</strong> Ce graphique illustre l'impact économique d'un modèle à la commission par rapport à une hypothèse de forfait technique indépendant. Les conditions réelles varient selon chaque compagnie et chaque dossier.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
