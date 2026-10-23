import React, { useEffect, useRef, useState } from 'react';
import { PlaneTakeoff, AlertCircle, Radio, Clock } from 'lucide-react';
import { motion, useInView } from 'motion/react';

export function ProblemSection() {
  const [count, setCount] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });
  const hasCountedRef = useRef(false);

  useEffect(() => {
    if (isInView && !hasCountedRef.current) {
      hasCountedRef.current = true;
      const duration = 1200;
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(easeOut * 45));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView]);

  const flights = [
    {
      code: 'AF 7632',
      dest: 'MADRID (MAD)',
      route: 'Paris-CDG → Madrid-Barajas',
      sched: '14:20',
      actual: '17:55',
      delay: '+3h35 à l’arrivée',
      est: '250 € estimé',
      article: 'Art. 7§1(a) CE 261/2004',
    },
    {
      code: 'LH 1045',
      dest: 'FRANCFORT (FRA)',
      route: 'Paris-CDG → Francfort',
      sched: '09:40',
      actual: '13:50',
      delay: '+4h10 à l’arrivée',
      est: '250 € estimé',
      article: 'Art. 7§1(a) CE 261/2004',
    },
    {
      code: 'BA 0308',
      dest: 'LONDRES (LHR)',
      route: 'Paris-CDG → Londres-Heathrow',
      sched: '18:15',
      actual: '21:20',
      delay: '+3h05 à l’arrivée',
      est: '250 € estimé',
      article: 'Art. 7§1(a) CE 261/2004',
    },
  ];

  return (
    <section
      id="probleme"
      ref={sectionRef}
      aria-label="Le problème du non-recours"
      className="py-20 md:py-32 bg-[#E7E7E2]/50 border-t border-b border-[#17191D]/10 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <div className="flex items-center gap-2 font-code text-xs text-[#17191D]/60 uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17191D]/40" />
            <span>01 • Constat</span>
          </div>
          <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl text-[#17191D] leading-tight">
            Le droit existe. Pourtant, peu le réclament.
          </h2>
          <p className="font-body text-base sm:text-lg text-[#17191D]/70 mt-4">
            Des milliers de vols subissent des retards éligibles chaque mois, mais la complexité des démarches conduit à un abandon massif des demandes d'indemnisation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Departures Board as a Living Information Object */}
          <div className="lg:col-span-7 bg-[#0B111A] text-[#F6F5F1] rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Animated Scanning Beam passing over board */}
            <motion.div
              animate={{ y: ['-100%', '400%'] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#43DDB0]/10 to-transparent pointer-events-none -z-0"
            />

            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <PlaneTakeoff className="w-5 h-5 text-[#43DDB0]" />
                <span className="font-code text-xs tracking-wider text-white/90">
                  TABLEAU DES DÉPARTS RÉCENTS
                </span>
              </div>
              <span className="font-code text-[11px] px-2.5 py-0.5 rounded bg-white/10 text-white/70">
                Tableau fictif, à titre illustratif
              </span>
            </div>

            <div className="divide-y divide-white/10 relative z-10">
              {flights.map((f, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + idx * 0.15, ease: 'easeOut' }}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-code group hover:bg-white/[0.03] transition-colors rounded-lg px-2"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#43DDB0] text-sm font-semibold">{f.code}</span>
                      <span className="text-white/95 text-sm">{f.dest}</span>
                    </div>
                    <div className="text-[11px] font-body text-white/50 mt-0.5">{f.route}</div>
                  </div>

                  <div className="flex items-center gap-3 text-xs self-start sm:self-center">
                    <span className="text-white/40">Prévu {f.sched}</span>
                    <span className="text-[#E7A63A] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {f.delay}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#43DDB0]/15 text-[#43DDB0] border border-[#43DDB0]/30 text-[11px] font-semibold">
                      {f.est}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-body text-white/50 flex items-start gap-2 relative z-10">
              <AlertCircle className="w-3.5 h-3.5 text-[#E7A63A] shrink-0 mt-0.5" />
              <span>
                Données simulées. Les montants indiqués dépendent du règlement européen applicable et de l’absence de circonstances extraordinaires (météo impraticable, grève de contrôleurs aériens externes, etc.).
              </span>
            </div>
          </div>

          {/* Right: Sourced Statistic with Animated Reveal */}
          <div className="lg:col-span-5 bg-[#F4F1EA] rounded-2xl p-8 sm:p-10 border border-[#17191D]/10 flex flex-col justify-between h-full shadow-sm">
            <div>
              <div className="font-code text-xs text-[#17191D]/50 uppercase tracking-wider mb-2">
                Illustration statistique du non-recours
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-display italic text-7xl sm:text-8xl text-[#101722] font-semibold tracking-tighter">
                  {count} %
                </span>
                <span className="font-body text-sm text-[#17191D]/70 max-w-[140px] leading-tight">
                  des usagers éligibles ne réclament pas leur dû
                </span>
              </div>
              <p className="font-body text-sm sm:text-base text-[#17191D]/80 leading-relaxed mb-6">
                La complexité des démarches, le manque de visibilité sur les textes légaux et la crainte de procédures chronophages dissuadent une grande partie des passagers d’exercer leurs droits.
              </p>
            </div>

            {/* Strict source tag */}
            <div className="pt-4 border-t border-[#17191D]/10 text-xs font-code text-[#17191D]/70 bg-[#E7E7E2]/60 p-3.5 rounded-xl">
              <div className="text-[10px] text-[#17191D]/50 uppercase mb-1">Source vérifiable :</div>
              <strong>Transport Focus, 2026 [organisme public] (trains, pas avions)</strong>
              <div className="text-[11px] font-body text-[#17191D]/60 mt-1">
                Note de rigueur : Ce chiffre officiel concerne les retards ferroviaires au Royaume-Uni. Il est cité ici pour illustrer le phénomène général de renoncement, et ne doit pas être confondu avec une mesure propre au trafic aérien.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
