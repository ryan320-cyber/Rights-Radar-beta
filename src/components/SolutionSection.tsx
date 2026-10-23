import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Calculator, FileText, CalendarClock, ChevronRight, Sparkles, Plane } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'motion/react';

interface SolutionSectionProps {
  onOpenSimulator: () => void;
}

export function SolutionSection({ onOpenSimulator }: SolutionSectionProps) {
  const [activeCard, setActiveCard] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const nodes = [
    { num: '01', title: 'Importer', desc: 'Glissez votre reçu de réservation ou confirmation PDF.' },
    { num: '02', title: 'Vérifier le vol', desc: 'Recoupement des horaires effectifs de départ et d’arrivée.' },
    { num: '03', title: 'Estimer', desc: 'Calcul du montant indicatif selon le barème CE 261/2004.' },
    { num: '04', title: 'Préparer', desc: 'Génération d’un courrier formel complet, prêt à être relu.' },
    { num: '05', title: 'Suivre', desc: 'Rappel des délais de prescription légaux (ex. 5 ans en France).' },
  ];

  const mockups = [
    {
      id: 0,
      title: 'Importation locale du billet',
      tag: 'Étape 1 • Analyse sur votre appareil',
      content: (
        <div className="space-y-4">
          <div className="border border-dashed border-[#43DDB0]/40 rounded-2xl p-6 text-center bg-[#080C14]/60">
            <UploadCloud className="w-8 h-8 text-[#43DDB0] mx-auto mb-2" />
            <div className="font-code text-xs text-white/90 font-medium">Billet_AF_Madrid_Paris.pdf</div>
            <div className="text-[11px] font-body text-white/50 mt-1">
              Lecture et extraction effectuées localement dans votre navigateur (aucune copie cloud)
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between text-xs font-code">
            <span className="text-white/60">Référence PNR extraite</span>
            <span className="text-[#43DDB0] font-semibold">7B9X2Q</span>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: 'Vérification du vol et du retard',
      tag: 'Étape 2 • Recoupement horaire',
      content: (
        <div className="space-y-3 font-code text-xs">
          <div className="flex justify-between p-3 rounded-xl bg-white/5">
            <span className="text-white/60">Vol identifié</span>
            <span className="text-white/90 font-medium">AF 7632 (MAD → CDG)</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-white/5">
            <span className="text-white/60">Arrivée prévue</span>
            <span className="text-white/90">14:20</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-white/5">
            <span className="text-white/60">Arrivée constatée</span>
            <span className="text-[#E7A63A] font-semibold">17:55 (+3h35)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#43DDB0]/15 text-[#43DDB0] text-[11px] border border-[#43DDB0]/30">
            Retard supérieur au seuil de 3 heures ouvrant droit à analyse d'indemnisation
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Estimation du montant indicatif',
      tag: 'Étape 3 • Barème officiel',
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#131D2D] to-[#080C14] border border-[#43DDB0]/40 text-center">
            <div className="text-xs font-code text-white/60 mb-1">Montant estimé par passager</div>
            <div className="font-display italic text-4xl sm:text-5xl text-[#43DDB0]">250 €</div>
            <div className="text-[11px] font-body text-white/50 mt-1">
              Trajet ≤ 1 500 km • Art. 7 § 1 (a) Règl. CE 261/2004
            </div>
          </div>
          <div className="text-[11px] font-body text-[#E7A63A] bg-[#E7A63A]/10 p-3 rounded-xl border border-[#E7A63A]/30">
            Estimation sous réserve de vérification de l’absence de circonstances extraordinaires par le transporteur.
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Courrier préparé pour relecture',
      tag: 'Étape 4 & 5 • Vous gardez la main',
      content: (
        <div className="space-y-3 font-body text-xs">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-white/70 space-y-2 font-code text-[11px]">
            <div className="text-white/40">Destinataire : Service Réclamations Air France</div>
            <div className="text-[#43DDB0]">Objet : Demande d’indemnisation CE 261/2004 — Vol AF 7632</div>
            <div className="line-clamp-3 text-white/60 leading-relaxed">
              « Madame, Monsieur, je sollicite par la présente le versement de l’indemnité forfaitaire de 250 € prévue à l’article 7 du Règlement européen (CE) n° 261/2004... »
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/10 text-white/90 text-center font-code text-xs">
            Vous relisez, validez et envoyez vous-même. Aucun envoi automatique en sous-main.
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="solution"
      ref={sectionRef}
      aria-label="La solution en 5 étapes"
      className="py-20 md:py-32 bg-[#080C14] text-[#F6F5F1] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <div className="flex items-center gap-2 font-code text-xs text-[#43DDB0] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0]" />
            <span>03 • Fonctionnement</span>
          </div>
          <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-[#F6F5F1] leading-tight">
            Cinq étapes, et vous gardez la main.
          </h2>
          <p className="font-body text-base sm:text-lg text-white/70 mt-4 max-w-2xl">
            Aucun rachat de créance, aucune commission prélevée sur votre dû. L’outil vous assiste pour que vous restiez le seul décisionnaire.
          </p>
        </div>

        {/* 5-Nodes Flight Path Journey with Animated SVG Trail */}
        <div className="mb-16 relative">
          {/* Connecting Flight Trail SVG */}
          <div aria-hidden="true" className="hidden lg:block absolute top-7 left-12 right-12 h-1 -z-0">
            <svg className="w-full h-8 overflow-visible">
              <motion.path
                d="M 0 4 Q 300 -12 600 4 T 1200 4"
                fill="none"
                stroke="#43DDB0"
                strokeWidth="1.8"
                strokeDasharray="5 7"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {nodes.map((n, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 * idx, ease: 'easeOut' }}
                className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-[#43DDB0]/50 transition-all flex flex-col justify-between group hover:bg-white/[0.08]"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#131D2D] border border-[#43DDB0]/50 text-[#43DDB0] flex items-center justify-center font-code text-sm font-semibold mb-3 shadow-md group-hover:scale-105 transition-transform">
                    {n.num}
                  </div>
                  <h3 className="font-display text-xl text-[#F6F5F1] mb-2">{n.title}</h3>
                  <p className="font-body text-xs text-white/60 leading-relaxed">{n.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interactive Mockups Screen Console */}
        <div className="bg-[#0E1520] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
            <div>
              <span className="font-code text-xs text-[#43DDB0] uppercase tracking-wider block mb-1">
                Visualisation de l’expérience
              </span>
              <h3 className="font-display text-2xl sm:text-3xl text-[#F6F5F1]">
                Aperçu des interfaces prévues
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-code text-xs px-3 py-1 rounded bg-[#E7A63A]/20 text-[#E7A63A] border border-[#E7A63A]/40 font-medium">
                Maquette
              </span>
              <button
                type="button"
                onClick={onOpenSimulator}
                data-cursor="action"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#43DDB0] hover:bg-[#38C69D] text-[#080C14] text-xs font-code font-semibold transition shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simuler un vol</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left selector buttons */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {mockups.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveCard(idx)}
                  data-cursor="action"
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                    activeCard === idx
                      ? 'bg-white/10 border-[#43DDB0] text-[#F6F5F1] shadow-lg ring-1 ring-[#43DDB0]/30'
                      : 'bg-white/5 border-white/5 hover:bg-white/[0.08] text-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-code text-[#43DDB0]">{m.tag}</span>
                    <span className="text-[10px] font-code px-2 py-0.5 rounded bg-white/10 text-white/60">
                      Maquette
                    </span>
                  </div>
                  <div className="font-display text-lg text-white/95">{m.title}</div>
                </button>
              ))}
            </div>

            {/* Right active card display with smooth animated transition */}
            <div className="lg:col-span-7 bg-[#080C14] rounded-2xl p-6 sm:p-8 border border-white/10 min-h-[300px] flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="font-code text-xs text-white/90 font-medium">
                  {mockups[activeCard].title}
                </div>
                <span className="font-code text-[11px] text-[#E7A63A] px-2.5 py-0.5 rounded bg-[#E7A63A]/10 border border-[#E7A63A]/30 font-medium">
                  Maquette d’écran
                </span>
              </div>

              <div className="my-auto py-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCard}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {mockups[activeCard].content}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="pt-4 border-t border-white/10 text-[11px] font-body text-white/40">
                L’outil ne transmet aucune réclamation automatiquement. Vous conservez la validation et le choix du moyen d’envoi.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
