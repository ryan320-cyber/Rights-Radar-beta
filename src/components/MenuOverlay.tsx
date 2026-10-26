import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowUpRight, Radio, Compass, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/soundEngine.ts';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const INDEX_ITEMS = [
  { num: '01', id: 'probleme', label: 'Constat', href: '#probleme', desc: 'Le droit existe, mais le non-recours domine' },
  { num: '02', id: 'pourquoi-maintenant', label: 'Contexte & Veille', href: '#pourquoi-maintenant', desc: 'Règles européennes, IA locale & loyauté' },
  { num: '03', id: 'solution', label: 'Fonctionnement', href: '#solution', desc: 'Cinq étapes sous votre contrôle strict' },
  { num: '04', id: 'engagements', label: 'Déontologie', href: '#engagements', desc: 'Ce que nous faisons et refusons formellement' },
  { num: '05', id: 'comparaison', label: 'Modèle économique', href: '#comparaison', desc: 'Exemple indicatif face aux commissions' },
  { num: '06', id: 'besoins', label: 'Attentes & Besoins', href: '#besoins', desc: 'Pistes de recherche et retours attendus' },
  { num: '07', id: 'inscription', label: 'Liste d’attente', href: '#inscription', desc: 'Rejoindre la recherche et tester le prototype' },
];

export function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('probleme');

  // Track active visible section using IntersectionObserver
  useEffect(() => {
    if (!isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { threshold: 0.25, rootMargin: '-10% 0px -40% 0px' }
    );

    INDEX_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isOpen]);

  // Keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    soundEngine.playClick();
    onClose();

    setTimeout(() => {
      const targetEl = document.querySelector(href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  if (!isOpen) return null;

  const activeIndexNumber = INDEX_ITEMS.findIndex((it) => it.id === activeSectionId);
  const activeProgress = activeIndexNumber >= 0 ? ((activeIndexNumber + 1) / INDEX_ITEMS.length) * 100 : 15;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal de navigation"
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 bg-[#080C14]/98 backdrop-blur-2xl text-[#F6F5F1] flex flex-col justify-between p-6 md:p-12 overflow-y-auto"
      >
        {/* Subtle background radar flight arcs */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-10 -z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80%" cy="20%" r="350" fill="none" stroke="#43DDB0" strokeWidth="1" strokeDasharray="6 8" />
            <circle cx="80%" cy="20%" r="550" fill="none" stroke="#43DDB0" strokeWidth="1" strokeDasharray="4 6" />
            <path d="M 0 300 Q 400 100 900 400 T 1600 200" fill="none" stroke="#43DDB0" strokeWidth="1" strokeDasharray="3 5" />
          </svg>
        </div>

        {/* Top bar inside menu */}
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-display italic text-2xl tracking-wide text-[#F6F5F1]">rights radar</span>
              <span className="text-xs font-code text-white/50 border border-white/10 px-2.5 py-0.5 rounded">
                INDEX DE NAVIGATION · 7 SECTIONS
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              autoFocus
              aria-label="Fermer le menu"
              data-cursor="action"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-[#43DDB0] text-xs font-code text-white/80 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
            >
              <span>Fermer [Échap]</span>
              <X className="w-4 h-4 text-[#43DDB0]" />
            </button>
          </div>

          {/* Live Section Progress Bar */}
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden flex items-center">
            <div
              className="bg-[#43DDB0] h-full transition-all duration-500 shadow-[0_0_12px_rgba(67,221,176,0.8)]"
              style={{ width: `${activeProgress}%` }}
            />
          </div>
        </div>

        {/* Staggered masked links list */}
        <nav aria-label="Index des sections" className="my-auto py-8 max-w-4xl w-full mx-auto relative z-10">
          <ul className="flex flex-col divide-y divide-white/5">
            {INDEX_ITEMS.map((item, idx) => {
              const isActive = item.id === activeSectionId;
              return (
                <li key={item.num} className="group overflow-hidden">
                  <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.04 * idx, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      data-cursor="action"
                      className={`flex items-center justify-between py-4 md:py-5 group-hover:pl-4 transition-all duration-200 ${
                        isActive ? 'bg-white/[0.03] px-3 rounded-xl border-l-2 border-[#43DDB0]' : ''
                      }`}
                    >
                      <div className="flex items-baseline gap-4 md:gap-8">
                        <span className={`font-code text-xs md:text-sm font-semibold ${isActive ? 'text-[#43DDB0]' : 'text-white/40'}`}>
                          {item.num}
                        </span>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className={`font-display text-2xl md:text-4xl transition ${isActive ? 'text-[#43DDB0] italic' : 'text-[#F6F5F1] group-hover:text-[#43DDB0]'}`}>
                              {item.label}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-code px-2 py-0.5 rounded bg-[#43DDB0]/15 text-[#43DDB0] border border-[#43DDB0]/30 uppercase tracking-widest hidden sm:inline-block">
                                VOLET ACTUEL
                              </span>
                            )}
                          </div>
                          <span className="block text-xs font-body text-white/50 mt-1">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className={`w-5 h-5 transition duration-200 ${isActive ? 'text-[#43DDB0]' : 'text-white/30 group-hover:text-[#43DDB0] group-hover:translate-x-1 group-hover:-translate-y-1'}`} />
                    </a>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom system status notice */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-code text-white/50 relative z-10">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#43DDB0]" />
            <span>INDEX RESPECTÉ · 7 SECTIONS MAPPÉES · RECHERCHE LOCALE SANS INTERMÉDIAIRE</span>
          </div>
          <div className="text-white/40">Navigation clavier active · Touche Échap pour quitter</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
