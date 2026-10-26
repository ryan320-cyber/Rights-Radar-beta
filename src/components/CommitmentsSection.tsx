import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';

export const CommitmentsSection: React.FC = () => {
  const doList = [
    'Repérer les perturbations éligibles selon les textes réglementaires.',
    'Estimer un montant indicatif sans promesse ferme ni garantie.',
    'Préparer un projet de lettre à relire et envoyer vous-même.',
    'Garder l’intégralité de vos confirmations sur votre appareil.',
  ];

  const dontList = [
    'Pas de rachat de créance ni de prélèvement de commission prohibitive.',
    'Aucun envoi de courrier ni démarche initiée sans votre accord explicite.',
    'Aucune garantie d’indemnisation assurée ni de résultat garanti.',
    'Aucune prestation de conseil juridique personnalisée.',
  ];

  return (
    <section
      id="engagements"
      className="py-20 bg-[#07111F] text-[#F4F1E9] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#35D9AE] block mb-2">
            04 — Engagements & Déontologie
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-white">
            Transparence totale sur notre rôle et nos limites.
          </h2>
        </div>

        {/* Two Column Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Ce que nous faisons */}
          <div className="p-8 rounded-3xl bg-white/[0.04] border border-[#35D9AE]/30 space-y-6">
            <h3 className="font-serif text-2xl text-[#35D9AE] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#35D9AE]/10 flex items-center justify-center text-[#35D9AE]">
                ✓
              </span>
              <span>Ce que nous faisons</span>
            </h3>

            <ul className="space-y-4">
              {doList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#F4F1E9]/90">
                  <span className="w-5 h-5 rounded-full bg-[#35D9AE]/20 text-[#35D9AE] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ce que nous ne faisons pas */}
          <div className="p-8 rounded-3xl bg-white/[0.04] border border-[#FFB84D]/30 space-y-6">
            <h3 className="font-serif text-2xl text-[#FFB84D] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#FFB84D]/10 flex items-center justify-center text-[#FFB84D]">
                ✕
              </span>
              <span>Ce que nous ne faisons pas</span>
            </h3>

            <ul className="space-y-4">
              {dontList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#F4F1E9]/90">
                  <span className="w-5 h-5 rounded-full bg-[#FFB84D]/20 text-[#FFB84D] flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mandatory Legal Notice Footer Line */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-xs font-mono text-[#A6B3C4]">
          <ShieldAlert className="w-5 h-5 text-[#FFB84D] shrink-0" />
          <p>
            <strong className="text-white">Avertissement Légal :</strong> Rights Radar ne remplace pas un avocat et aucune indemnisation n’est assurée. L’outil fournit un appui technique et informatif basé sur la réglementation européenne.
          </p>
        </div>
      </div>
    </section>
  );
};
