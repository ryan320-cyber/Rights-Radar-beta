import React, { useState } from 'react';
import { FileUp, SearchCheck, Calculator, FileText, CalendarCheck, Sparkles, UserCheck } from 'lucide-react';

export const SolutionSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Importer',
      desc: 'Glissez-déposez vos confirmations de réservation de vol (PDF, e-mails). Aucun envoi vers un serveur externe.',
      icon: FileUp,
    },
    {
      num: '02',
      title: 'Vérifier le vol',
      desc: 'Croisement automatique de vos horaires avec les données de vol publiques pour mesurer le retard exact à l’arrivée.',
      icon: SearchCheck,
    },
    {
      num: '03',
      title: 'Estimer',
      desc: 'Application des barèmes du règlement européen pour estimer si le vol ouvre un droit potentiel (ex. 250 €, 400 € ou 600 €).',
      icon: Calculator,
    },
    {
      num: '04',
      title: 'Préparer',
      desc: 'Génération d’un modèle de courrier personnalisé structuré avec les références légales appropriées.',
      icon: FileText,
    },
    {
      num: '05',
      title: 'Suivre',
      desc: 'Tableau de bord local indiquant les échéances légales de réponse de la compagnie aérienne.',
      icon: CalendarCheck,
    },
  ];

  const stepDetails = [
    {
      step: '01',
      title: 'Importation locale et confidentielle',
      headline: 'Vos documents ne quittent jamais votre navigateur',
      description: 'Déposez votre confirmation de réservation (PDF, e-mail). Le moteur extrait localement le numéro de vol, la date et les aéroports grâce à WebCrypto, sans transfert vers un serveur externe.',
      previewTag: 'Traitement local en mémoire volatile',
      sampleData: {
        file: 'Confirmation_AF1234_Nice.pdf',
        size: '142 Ko',
        status: 'Extrait localement en 18ms',
        route: 'Paris (CDG) → Nice (NCE)',
      },
    },
    {
      step: '02',
      title: 'Vérification du retard à l’arrivée',
      headline: 'Mesure objective du retard effectif selon la jurisprudence CJUE',
      description: 'Conformément à l’arrêt CJUE Sturgeon, c’est l’heure d’ouverture des portes à destination finale qui détermine l’éligibilité (seuil légal : 3 heures ou plus).',
      previewTag: 'Horaires certifiés OpenSky / ADS-B',
      sampleData: {
        flight: 'AF 1234 (B777-200ER)',
        scheduledArrival: '18:15 UTC',
        actualArrival: '21:35 UTC',
        delayExact: '+3h 20min à l’arrivée (Seuil >= 3h franchi)',
      },
    },
    {
      step: '03',
      title: 'Calcul de l’indemnité CE 261/2004',
      headline: 'Application stricte des barèmes légaux sans commission',
      description: 'Le calcul repose sur la distance orthodromique calculée entre les aéroports : 250 € (<= 1 500 km), 400 € (intra-UE > 1 500 km ou 1 500 - 3 500 km) ou 600 € (> 3 500 km extra-UE).',
      previewTag: 'Barème officiel CE 261/2004',
      sampleData: {
        distance: '685 km (Court-courrier)',
        category: 'Vol intra-communautaire',
        amountDue: '250 € par passager',
        deduction: '0 % de commission (100 % pour vous)',
      },
    },
    {
      step: '04',
      title: 'Génération de la mise en demeure',
      headline: 'Modèle juridique complet rédigé avec rigueur',
      description: 'Structure formelle citant l’article 7 du Règlement 261/2004, l’arrêt Wallentin-Hermann sur les circonstances extraordinaires et vos coordonnées de réservation.',
      previewTag: 'Prêt à relire et envoyer',
      sampleData: {
        recipient: 'Service Clientèle Air France',
        subject: 'Mise en demeure d’indemnisation — Vol AF 1234',
        legalArticles: 'Articles 5, 7 du Règlement (CE) n° 261/2004',
        status: 'Généré localement, modifiable librement',
      },
    },
    {
      step: '05',
      title: 'Suivi des délais légaux et prescription',
      headline: 'Alerte sur les délais de réponse des transporteurs',
      description: 'Surveillance des 60 jours recommandés pour la réponse de la compagnie et rappel de la prescription légale nationale (5 ans en France selon l’article L. 110-4 du Code de commerce).',
      previewTag: 'Protection des droits dans le temps',
      sampleData: {
        carrierDeadline: '60 jours (délai indicatif de réponse)',
        prescriptionPeriod: '5 ans (France) / 2 ans (Espagne)',
        status: 'Sauvegardable hors-ligne sur votre profil',
      },
    },
  ];

  return (
    <section
      id="solution"
      className="py-20 bg-[#F4F1E9] text-[#07111F] border-t border-[#07111F]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#07111F]/60 block mb-2">
            03 — La Solution
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Cinq étapes, et vous gardez la main.
          </h2>
          <p className="font-sans text-base text-[#07111F]/70 mt-3">
            Cliquez sur chaque étape pour visualiser le fonctionnement étape par étape :
          </p>
        </div>

        {/* 5 Steps Interactive Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#07111F] text-[#F4F1E9] border-[#07111F] shadow-xl scale-[1.02]'
                    : 'bg-white text-[#07111F] border-[#07111F]/10 hover:border-[#35D9AE]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-mono text-xs font-bold ${isActive ? 'text-[#35D9AE]' : 'text-[#07111F]/50'}`}>
                    {step.num}
                  </span>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#35D9AE]' : 'text-[#07111F]'}`} />
                </div>
                <h3 className="font-serif text-lg font-bold mb-1">{step.title}</h3>
                <p className={`text-xs ${isActive ? 'text-white/70' : 'text-[#07111F]/60'} line-clamp-2`}>
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detailed Step Experience (Changes with activeStep) */}
        {(() => {
          const cur = stepDetails[activeStep];
          return (
            <div className="p-8 sm:p-10 rounded-3xl bg-[#07111F] text-[#F4F1E9] border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Left explanation */}
                <div className="lg:max-w-xl space-y-4">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[#35D9AE]/15 text-[#35D9AE] font-bold">
                      Étape {cur.step}
                    </span>
                    <span className="text-[#A6B3C4]">·</span>
                    <span className="text-[#A6B3C4]">{cur.previewTag}</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl text-white">
                    {cur.headline}
                  </h3>

                  <p className="font-sans text-sm sm:text-base text-[#A6B3C4] leading-relaxed">
                    {cur.description}
                  </p>
                </div>

                {/* Right Interactive Sample Panel */}
                <div className="lg:w-[420px] p-6 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 font-mono text-xs">
                  <div className="text-[11px] text-[#35D9AE] font-bold uppercase tracking-wider pb-2 border-b border-white/10 flex items-center justify-between">
                    <span>Aperçu de l’étape {cur.step}</span>
                    <span className="text-[10px] text-white/40">Mode local</span>
                  </div>

                  {Object.entries(cur.sampleData).map(([key, val]) => (
                    <div key={key} className="flex items-start justify-between gap-4 py-1">
                      <span className="text-[#A6B3C4] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-white text-right font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};
