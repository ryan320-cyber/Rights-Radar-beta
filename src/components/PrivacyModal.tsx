import React from 'react';
import { X, ShieldCheck, Lock, Trash } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Note de confidentialité"
      className="fixed inset-0 z-50 bg-[#101722]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#151F2E] border border-white/10 text-[#F6F5F1] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#43DDB0]" />
            <h2 className="font-display text-2xl text-[#F6F5F1]">
              Note de confidentialité (Ébauche de projet)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la note"
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 font-body text-xs sm:text-sm text-white/75 leading-relaxed">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
            <strong>Statut du document :</strong> Cette page est une ébauche explicative décrivant l’architecture envisagée pour Rights Radar. Elle ne constitue pas une politique de confidentialité contractuelle définitive d’un service en production.
          </div>

          <h3 className="font-display text-lg text-white pt-2">1. Principe local-first</h3>
          <p>
            L’analyse des billets d’avion et des courriels de réservation est conçue pour s’exécuter intégralement sur l’appareil de l’utilisateur (au moyen de technologies WebAssembly ou de modèles locaux). Aucune copie de vos billets n’est expédiée sur un serveur distant sans votre accord explicite.
          </p>

          <h3 className="font-display text-lg text-white pt-2">2. Données de la liste d'attente</h3>
          <p>
            Lorsque vous soumettez le formulaire d’inscription à la liste d’attente, votre adresse email et votre choix d’usage sont stockés pour vous tenir informé de l’avancement du projet Rights Radar. Vous pouvez demander la suppression immédiate de votre adresse à tout moment.
          </p>

          <h3 className="font-display text-lg text-white pt-2">3. Absence de revente ou de profilage</h3>
          <p>
            Vos données ne font l’objet d’aucune revente, cession ou transmission à des tiers ou compagnies aériennes. L’outil ne procède à aucune prise de contact automatique auprès de tiers.
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#F6F5F1] text-[#101722] text-xs font-code font-semibold hover:bg-[#43DDB0] transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
