import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/soundEngine.ts';
import { getCookieConsent, saveCookieConsent, CookieConsentState } from '../utils/cookieManager.ts';

interface CookieConsentBannerProps {
  onOpenCookieSettings?: () => void;
}

export function CookieConsentBanner({ onOpenCookieSettings }: CookieConsentBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<CookieConsentState>({
    essential: true,
    audioAndPerformance: true,
    localDossiers: true,
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    soundEngine.playClick();
    const fullPrefs: CookieConsentState = {
      essential: true,
      audioAndPerformance: true,
      localDossiers: true,
      updatedAt: new Date().toISOString(),
    };
    saveCookieConsent(fullPrefs);
    setIsOpen(false);
  };

  const handleEssentialOnly = () => {
    soundEngine.playClick();
    const minPrefs: CookieConsentState = {
      essential: true,
      audioAndPerformance: false,
      localDossiers: false,
      updatedAt: new Date().toISOString(),
    };
    saveCookieConsent(minPrefs);
    setIsOpen(false);
  };

  const handleSaveCustom = () => {
    soundEngine.playClick();
    saveCookieConsent({ ...prefs, updatedAt: new Date().toISOString() });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cookie-banner"
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-24 right-4 sm:right-6 left-4 sm:left-auto sm:max-w-md z-40 bg-[#080E18]/95 border border-white/15 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-white scanlines relative overflow-hidden"
      >
        {/* Subtle radar accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#43DDB0]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-xl bg-[#43DDB0]/15 text-[#43DDB0] border border-[#43DDB0]/30 shrink-0 mt-0.5">
            <Cookie className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm tracking-wide text-white">
                Stockage Local & Cookies Privés
              </h3>
              <span className="text-[9px] font-code px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
                0 Traceur publicitaire
              </span>
            </div>
            <p className="font-body text-xs text-white/70 leading-relaxed mt-1">
              Rights Radar applique une déontologie stricte : vos confirmations de vol et tokens d’accès restent cloisonnés sur votre appareil. Aucun profilage publicitaire ni revente de données.
            </p>
          </div>
        </div>

        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="py-3 my-2 border-y border-white/10 space-y-3 text-xs font-body"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Cookies Essentiels & Sécurité</span>
                <span className="text-[11px] text-white/50">Maintien de la session radar et jeton volatile chiffré</span>
              </div>
              <span className="text-[10px] font-code text-[#43DDB0] font-bold">Actif (Requis)</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Ambiance Sonore & 3D Radar</span>
                <span className="text-[11px] text-white/50">Mémorise l'état muet et les performances de rendu</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.audioAndPerformance}
                onChange={(e) => setPrefs({ ...prefs, audioAndPerformance: e.target.checked })}
                className="rounded border-white/30 text-[#43DDB0] focus:ring-[#43DDB0] bg-black/40 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Sauvegarde Locale des Dossiers</span>
                <span className="text-[11px] text-white/50">Conserver les brouillons de réclamations sur ce navigateur</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.localDossiers}
                onChange={(e) => setPrefs({ ...prefs, localDossiers: e.target.checked })}
                className="rounded border-white/30 text-[#43DDB0] focus:ring-[#43DDB0] bg-black/40 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-3 py-1 rounded-full bg-[#43DDB0] text-black font-code text-xs font-bold"
              >
                Enregistrer mes choix
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black font-code text-xs font-semibold tracking-wider transition active:scale-95 shadow cursor-pointer"
          >
            Tout accepter
          </button>

          <button
            type="button"
            onClick={handleEssentialOnly}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-code text-xs transition cursor-pointer"
          >
            Essentiels uniquement
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenCookieSettings) {
                onOpenCookieSettings();
              } else {
                setShowSettings(!showSettings);
              }
            }}
            className="p-1.5 rounded-full text-white/50 hover:text-white transition ml-auto cursor-pointer"
            title="Paramètres détaillés des cookies"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
