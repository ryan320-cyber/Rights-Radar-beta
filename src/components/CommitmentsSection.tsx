import React, { useRef } from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';
import { motion, useInView } from 'motion/react';

export function CommitmentsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const doList = [
    {
      title: 'Scan et analyse locale sur votre machine',
      desc: 'Vos billets et courriels ne quittent pas votre navigateur pour être enregistrés sur un serveur distant.',
    },
    {
      title: 'Estimation transparente des barèmes officiels',
      desc: 'Chaque calcul cite directement l’article du règlement (CE) n° 261/2004 et expose les critères de distance et d’horaires.',
    },
    {
      title: 'Génération de courriers prêts à l’envoi',
      desc: 'Un modèle juridique soigné est préparé avec vos données de vol, que vous pouvez librement relire, amender et copier.',
    },
    {
      title: 'Suivi des délais de prescription',
      desc: 'Rappels clairs des échéances légales par juridiction (ex. 5 ans en France, 3 ans en Allemagne) pour ne pas forclore vos droits.',
    },
  ];

  const dontList = [
    {
      title: 'Aucun rachat de créance',
      desc: 'Nous n’achetons pas votre indemnité pour en tirer profit et nous ne nous substituons pas à votre créance.',
    },
    {
      title: 'Aucun pourcentage sur votre indemnisation',
      desc: 'Aucun prélèvement de 35 % ou 50 % sur votre indemnité reçue. Vous touchez 100 % des sommes accordées.',
    },
    {
      title: 'Aucun envoi sans votre accord explicite',
      desc: 'L’outil ne contacte jamais une compagnie en sous-main. Vous êtes l’unique expéditeur de votre réclamation.',
    },
    {
      title: 'Aucun conseil juridique personnalisé',
      desc: 'L’outil fournit une assistance documentaire et technique, mais ne remplace pas un avocat ou une consultation légale.',
    },
  ];

  return (
    <section
      id="engagements"
      ref={sectionRef}
      aria-label="Engagements de transparence"
      className="py-20 md:py-32 bg-[#060A12] border-b border-white/[0.08] text-[#F4F4F6] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <div className="flex items-center gap-2 font-code text-xs text-[#43DDB0] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43DDB0] shadow-[0_0_6px_#43DDB0]" />
            <span>04 • Déontologie</span>
          </div>
          <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
            Des engagements stricts et vérifiables.
          </h2>
          <p className="font-body text-base sm:text-lg text-[#94A3B8] mt-4 max-w-2xl">
            La confiance repose sur des limites précises. Voici ce que l’outil est conçu pour accomplir, et ce qu’il refuse formellement de faire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Ce que nous faisons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-[#0A0F1A] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl hover:border-white/20 transition"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
              <span className="w-8 h-8 rounded-full bg-[#43DDB0] text-black flex items-center justify-center font-bold shadow-[0_0_12px_rgba(67,221,176,0.5)]">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <h3 className="font-display text-2xl sm:text-3xl text-white">
                Ce que nous faisons
              </h3>
            </div>

            <ul className="space-y-6">
              {doList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#43DDB0]/20 text-[#43DDB0] flex items-center justify-center shrink-0 mt-0.5 border border-[#43DDB0]/30">
                    <Check className="w-3.5 h-3.5 text-[#43DDB0] stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-sm text-white mb-0.5">
                      {item.title}
                    </h4>
                    <p className="font-body text-xs text-[#94A3B8] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Ce que nous ne faisons pas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="bg-[#0A0F1A] text-[#F4F4F6] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl hover:border-white/20 transition"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
              <span className="w-8 h-8 rounded-full bg-[#FFB340] text-black flex items-center justify-center font-bold shadow-[0_0_12px_rgba(255,179,64,0.5)]">
                <X className="w-4 h-4 stroke-[3]" />
              </span>
              <h3 className="font-display text-2xl sm:text-3xl text-white">
                Ce que nous ne faisons pas
              </h3>
            </div>

            <ul className="space-y-6">
              {dontList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5 border border-white/15">
                    <X className="w-3.5 h-3.5 text-[#FFB340] stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-sm text-white mb-0.5">
                      {item.title}
                    </h4>
                    <p className="font-body text-xs text-[#94A3B8] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Required Mandatory Footer Line */}
        <div className="mt-12 p-4 rounded-2xl bg-[#FFB340]/10 border border-[#FFB340]/30 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-[#FFB340] shrink-0" />
          <p className="font-body text-xs sm:text-sm text-[#FFB340] font-medium">
            Rights Radar ne remplace pas un avocat et aucune indemnisation n’est assurée.
          </p>
        </div>
      </div>
    </section>
  );
}
