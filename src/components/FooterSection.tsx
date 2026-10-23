import React from 'react';
import { ArrowUp, ExternalLink } from 'lucide-react';

interface FooterSectionProps {
  onOpenPrivacy: () => void;
}

export function FooterSection({ onOpenPrivacy }: FooterSectionProps) {
  const sources = [
    'EUR-Lex',
    'Commission européenne',
    'Parlement européen',
    'Conseil de l\'Union européenne',
    'AirHelp',
    'Skycop',
    'Transport Focus',
    'CURIA',
    'Unsplash',
    'Lucide',
    'Phosphor',
    'Google Fonts',
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="footer"
      aria-label="Pied de page et mentions"
      className="bg-[#020509] text-[#F4F4F6] pt-16 pb-12 border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#43DDB0] shadow-[0_0_8px_#43DDB0]" />
              <span className="font-display italic text-2xl tracking-wide text-white">
                Rights Radar
              </span>
            </div>
            <p className="font-body text-xs text-[#94A3B8] leading-relaxed max-w-sm">
              Projet d’outil local-first d’analyse documentaire et d’estimation des droits des passagers aériens. Conception transparente, données conservées sur votre appareil.
            </p>
            {/* Mandatory legal disclaimer */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-body text-[#FFB340] max-w-sm">
              Ce site ne constitue pas un conseil juridique.
            </div>
          </div>

          {/* Sourced Reference List */}
          <div className="md:col-span-7">
            <div className="font-code text-xs text-white/50 uppercase tracking-wider mb-3">
              Sources documentaires et ressources citées (sans logo)
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-code text-white/70">
              {sources.map((src, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-white/5 border border-white/10"
                >
                  {src}
                </span>
              ))}
            </div>
            <p className="font-body text-[11px] text-white/40 mt-3 leading-normal">
              Les références à des organismes publics ou des tiers cités sur ce site le sont à titre informatif et d’attribution méthodologique, sans affiliation commerciale ni approbation.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-white/50">
          <div>
            © 2026 Rights Radar. Tous droits réservés. Maquette d'étude et projet de recherche.
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-[#43DDB0] transition underline underline-offset-4"
            >
              Note de confidentialité (ébauche)
            </button>

            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-[#43DDB0] transition font-code"
            >
              <span>Haut de page</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
