import React from 'react';
import { X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 bg-[#03070D]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-[#07111F] text-[#F4F1E9] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#35D9AE]" />
            <h2 id="privacy-modal-title" className="font-serif text-2xl text-white">
              Transparence & Flux de Données
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="p-1.5 rounded-full border border-white/15 hover:bg-white/10 text-white/70 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-[#35D9AE]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 font-sans text-xs sm:text-sm text-[#A6B3C4] leading-relaxed">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-mono text-xs text-[#35D9AE] uppercase tracking-wider block">
              1. Calculs Déterministes Locaux
            </span>
            <p>
              L’estimation des barèmes du Règlement (CE) n° 261/2004 (250 €, 400 €, 600 €), le calcul de prescription légale et la génération de lettres de mise en demeure s'exécutent entièrement dans votre navigateur.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-mono text-xs text-[#35D9AE] uppercase tracking-wider block">
              2. Recherche d’Incidents en Direct (Google Search Grounding)
            </span>
            <p>
              Lorsque vous activez la vérification d'incident en direct, le code de vol, les aéroports et la date sont transmis de manière chiffrée à notre relais applicatif pour interroger Google Search. Aucun identifiant personnel ni nom de passager n'est envoyé au service de recherche.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-mono text-xs text-[#35D9AE] uppercase tracking-wider block">
              3. Dossiers Sauvegardés & Authentification
            </span>
            <p>
              Si vous vous authentifiez avec votre compte Google, vos analyses de vol sauvegardées sont rattachées à votre identifiant unique Firebase Auth (UID) avec contrôle strict d'accès (aucun passager ne peut consulter les dossiers d'un tiers).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-mono text-xs text-[#35D9AE] uppercase tracking-wider block">
              4. Liste d’Attente & Enquête Utilisateurs
            </span>
            <p>
              Les données de formulaire (adresse e-mail, historique de vol et avis tarifaires) sont enregistrées de façon sécurisée dans notre base de données afin de calibrer nos priorités de développement. Zéro revente à des tiers ou courtiers en données.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-mono text-white/40">
            Conformité RGPD • Hébergement UE
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#35D9AE] text-[#07111F] font-mono text-xs font-semibold hover:bg-[#2bc29a] transition"
          >
            Compris & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
