import React, { useEffect, useRef, useState } from 'react';
import { Plane, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const [count, setCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;
    const duration = 1200; // 1.2s

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * 45));
            if (progress < 1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };
          animationFrame = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, []);

  const fictionalFlights = [
    { code: 'AF 1840', dep: 'Paris (CDG)', arr: 'Rome (FCO)', status: 'Retard 3h 40m', claim: '250 € estimés' },
    { code: 'IB 3411', dep: 'Madrid (MAD)', arr: 'Lisbonne (LIS)', status: 'Annulation tardive', claim: '250 € estimés' },
    { code: 'KL 1204', dep: 'Amsterdam (AMS)', arr: 'Nice (NCE)', status: 'Retard 4h 10m', claim: '400 € estimés' },
  ];

  return (
    <section
      id="probleme"
      ref={sectionRef}
      className="py-20 bg-[#F4F1E9] text-[#07111F] border-t border-[#07111F]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#07111F]/60 block mb-2">
            01 — Le Problème
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Le droit existe. Pourtant, peu le réclament.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Departures Board Mock Panel */}
          <div className="lg:col-span-7 bg-[#07111F] text-[#F4F1E9] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-[#35D9AE]" />
                <span className="font-mono text-sm uppercase tracking-wider text-white">
                  Tableau d’observation des perturbations
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#FFB84D]/20 text-[#FFB84D] font-mono text-[11px]">
                Exemples représentatifs
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {fictionalFlights.map((flight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#35D9AE]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <span>{flight.code}</span>
                      <span className="text-[#A6B3C4]">•</span>
                      <span>{flight.dep} → {flight.arr}</span>
                    </div>
                    <p className="text-[#FFB84D] mt-0.5 text-[11px]">{flight.status}</p>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1 rounded-full bg-[#35D9AE]/15 text-[#35D9AE] border border-[#35D9AE]/30 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>À réclamer ({flight.claim})</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#A6B3C4] font-mono pt-2 border-t border-white/10">
              * Barèmes calculés selon la distance kilométrique orthodromique et le retard à l'arrivée (Règlement CE 261/2004).
            </p>
          </div>

          {/* Right: Key Stat Card */}
          <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-[#07111F]/10 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="font-serif text-7xl sm:text-8xl font-normal text-[#07111F] tracking-tight">
                {count} %
              </div>
              <p className="font-sans text-base text-[#07111F]/80 mt-2 leading-relaxed">
                Des passagers éligibles à une indemnisation n’entament jamais la démarche par manque d’information ou complexité perçue.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F1E9] border border-[#07111F]/10 text-xs font-mono text-[#07111F]/70 space-y-1">
              <div className="flex items-center gap-1.5 text-[#07111F] font-semibold">
                <AlertTriangle className="w-4 h-4 text-[#FFB84D]" />
                <span>Source de la statistique :</span>
              </div>
              <p>
                Direction générale de la mobilité et des transports (DG MOVE), Commission européenne.
              </p>
              <p className="text-[11px] text-[#07111F]/60 italic">
                (Étude d'évaluation de l'application du règlement (CE) n° 261/2004).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
