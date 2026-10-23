import React, { useRef } from 'react';
import { Info, Scale } from 'lucide-react';
import { motion, useInView } from 'motion/react';

export function ComparisonSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      id="comparaison"
      ref={sectionRef}
      aria-label="Comparaison des modèles économiques"
      className="py-20 md:py-32 bg-[#E7E7E2]/40 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <div className="flex items-center gap-2 font-code text-xs text-[#17191D]/60 uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17191D]/40" />
            <span>05 • Modèle économique</span>
          </div>
          <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-[#17191D] leading-tight">
            D'autres services existent, et certains ont davantage d'expérience.
          </h2>
          <p className="font-body text-base sm:text-lg text-[#17191D]/70 mt-4 max-w-2xl">
            Des agences spécialisées proposent une prise en charge intégrale contre une commission proportionnelle. Rights Radar explore une alternative en autonomie guidée à coût fixe modéré.
          </p>
        </div>

        {/* Proportional Comparison Container */}
        <div className="bg-[#F4F1EA] rounded-3xl p-6 sm:p-10 border border-[#17191D]/10 max-w-4xl shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#17191D]/10 mb-8 gap-3">
            <div>
              <div className="font-code text-xs text-[#17191D]/50 uppercase tracking-wider mb-1">
                Base de simulation
              </div>
              <div className="font-display text-2xl sm:text-3xl text-[#17191D]">
                Sur une indemnité théorique de <span className="italic font-semibold">400 €</span>
              </div>
            </div>
            <div className="font-code text-xs px-3 py-1.5 rounded-full bg-[#E7A63A]/15 text-[#8C5300] border border-[#E7A63A]/30 self-start sm:self-center">
              Exemple de calcul, pas un résultat.
            </div>
          </div>

          <div className="space-y-8">
            {/* Example A: 35% commission */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-body font-semibold text-sm text-[#17191D]">
                    Exemple A : Modèle à la commission (35 %)
                  </span>
                  <span className="font-code text-[11px] text-[#17191D]/60 bg-[#17191D]/5 px-2 py-0.5 rounded">
                    [partie intéressée : AirHelp]
                  </span>
                </div>
                <div className="font-code text-xs text-[#E7A63A] font-semibold">
                  140 € prélevés • 260 € reversés
                </div>
              </div>

              {/* Animated Progress bar */}
              <div className="w-full h-9 rounded-xl bg-[#E7E7E2] overflow-hidden flex font-code text-xs shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '35%' } : {}}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#E7A63A] text-white flex items-center justify-center font-medium px-2 truncate"
                >
                  Commission 140 € (35%)
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '65%' } : {}}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="bg-[#101722] text-[#F6F5F1] flex items-center justify-center px-2 truncate font-medium"
                >
                  Passager 260 € (65%)
                </motion.div>
              </div>
              <p className="font-body text-xs text-[#17191D]/60 mt-2">
                Prise en charge clé en main par l’intermédiaire, avec prélèvement automatique sur le montant versé par la compagnie.
              </p>
            </div>

            {/* Example B: Fixed fee */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-body font-semibold text-sm text-[#17191D]">
                    Exemple B : Modèle Rights Radar (forfait fixe)
                  </span>
                  <span className="font-code text-[11px] text-[#43DDB0] bg-[#101722] px-2 py-0.5 rounded">
                    [hypothèse à tester]
                  </span>
                </div>
                <div className="font-code text-xs text-[#43DDB0] font-semibold">
                  ~12 € de forfait • ~388 € conservés
                </div>
              </div>

              {/* Animated Progress bar */}
              <div className="w-full h-9 rounded-xl bg-[#E7E7E2] overflow-hidden flex font-code text-xs shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '5%' } : {}}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#43DDB0] text-[#101722] flex items-center justify-center font-bold px-1 text-[11px] min-w-[45px]"
                >
                  ~12 €
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '95%' } : {}}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="bg-[#101722] text-[#F6F5F1] flex items-center justify-center px-2 truncate font-medium"
                >
                  Montant conservé par le passager : ~388 € (97%)
                </motion.div>
              </div>
              <p className="font-body text-xs text-[#17191D]/60 mt-2">
                Préparation du dossier et accompagnement documentaire. Le passager effectue lui-même l’envoi et perçoit l’intégralité de l’indemnité.
              </p>
            </div>
          </div>

          {/* Caveat note */}
          <div className="mt-8 pt-6 border-t border-[#17191D]/10 text-xs font-body text-[#17191D]/70 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#17191D]/50 shrink-0 mt-0.5" />
            <div>
              Ce comparatif constitue un exemple arithmétique et non une garantie tarifaire ou juridique. Les barèmes des agences commerciales varient selon les démarches amiables ou contentieuses (pouvant aller jusqu’à 50 % en cas de procédure judiciaire). Les tarifs définitifs de Rights Radar feront l’objet de tests auprès des inscrits de la liste d’attente.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
