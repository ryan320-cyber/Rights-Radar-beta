import React from 'react';
import { RadarCanvas } from './RadarCanvas';
import { FlightDisruption } from '../types';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

const sampleFlights: FlightDisruption[] = [
  {
    id: 'f1',
    flightCode: 'AF 1422',
    route: 'CDG → BER',
    date: '14 Oct 2026',
    status: 'Annulé (Surcharge)',
    delay: '> 3h',
    eligible: true,
    estimatedAmount: '250 €',
  },
  {
    id: 'f2',
    flightCode: 'LH 2201',
    route: 'FRA → LHR',
    date: '02 Sep 2026',
    status: 'Retard important',
    delay: '4h 15m',
    eligible: true,
    estimatedAmount: '400 €',
  },
  {
    id: 'f3',
    flightCode: 'BA 0308',
    route: 'LHR → ORY',
    date: '18 Aoû 2026',
    status: 'En analyse',
    delay: '2h 10m',
    eligible: false,
    estimatedAmount: 'À vérifier',
  },
];

export const Hero: React.FC = () => {
  return (
    <section
      id="S1"
      aria-label="Présentation principale Rights Radar"
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 lg:py-20 overflow-hidden bg-[#101722] text-[#F6F5F1]"
    >
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#43DDB0]/10 via-[#101722] to-[#101722] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Editorial Copy Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#43DDB0]/10 border border-[#43DDB0]/30 text-[#43DDB0] font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Projet en phase d'expérimentation</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-[#F6F5F1]">
              Le radar de vos droits en voyage.
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#E7E7E2]/80 leading-relaxed font-light">
              Il repère les vols qui peuvent ouvrir un droit à indemnisation, estime le montant possible et prépare votre réclamation. Vos données restent sur votre appareil.
            </p>

            {/* Local-first Privacy Highlight */}
            <div className="p-4 rounded-xl bg-white/5 border border-[#E7E7E2]/10 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#43DDB0] shrink-0 mt-0.5" />
              <p className="text-xs font-sans text-[#E7E7E2]/70 leading-normal">
                <strong className="text-[#F6F5F1] font-semibold">Architecture locale première :</strong> Aucune confirmation de vol n'est envoyée sur nos serveurs. L'analyse s'exécute directement dans votre navigateur.
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="#S8"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#43DDB0] text-[#101722] font-mono text-sm font-semibold hover:bg-[#38c49b] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#43DDB0]/20 focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
              >
                <span>Rejoindre la liste d’attente</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#S2"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-[#E7E7E2]/20 text-[#F6F5F1] font-mono text-sm hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
              >
                Comprendre le problème
              </a>
            </div>
          </div>

          {/* Right Interactive Radar Scene */}
          <div className="lg:col-span-6">
            <div className="relative">
              <RadarCanvas flights={sampleFlights} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
