import React, { useState, useEffect } from 'react';
import { Cookie, Shield, ShieldCheck, Check, Trash2, RefreshCw, X, Lock, FileCode, CheckCircle2, Settings, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/soundEngine.ts';
import {
  CookieConsentState,
  CookieItem,
  getAllCookies,
  getCookieConsent,
  saveCookieConsent,
  clearAllCookies,
  setCookie,
  deleteCookie,
} from '../utils/cookieManager.ts';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieSettingsModal({ isOpen, onClose }: CookieSettingsModalProps) {
  const [consent, setConsent] = useState<CookieConsentState>({
    essential: true,
    audioAndPerformance: true,
    localDossiers: true,
    updatedAt: new Date().toISOString(),
  });

  const [activeCookies, setActiveCookies] = useState<CookieItem[]>([]);
  const [newCookieName, setNewCookieName] = useState('');
  const [newCookieValue, setNewCookieValue] = useState('');
  const [showTestForm, setShowTestForm] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = getCookieConsent();
      if (saved) setConsent(saved);
      refreshActiveCookies();
    }
  }, [isOpen]);

  const refreshActiveCookies = () => {
    const list = getAllCookies();
    setActiveCookies(list);
  };

  const handleSavePreferences = () => {
    soundEngine.playClick();
    const updated: CookieConsentState = {
      ...consent,
      updatedAt: new Date().toISOString(),
    };
    saveCookieConsent(updated);
    refreshActiveCookies();
    setSaveSuccessMsg('Préférences de cookies enregistrées avec succès !');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleAcceptAll = () => {
    soundEngine.playClick();
    const full: CookieConsentState = {
      essential: true,
      audioAndPerformance: true,
      localDossiers: true,
      updatedAt: new Date().toISOString(),
    };
    setConsent(full);
    saveCookieConsent(full);
    refreshActiveCookies();
    setSaveSuccessMsg('Tous les cookies de personnalisation ont été autorisés.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleClearCookies = () => {
    soundEngine.playClick();
    clearAllCookies();
    refreshActiveCookies();
    setSaveSuccessMsg('Tous les cookies du domaine ont été supprimés.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleAddTestCookie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCookieName.trim()) return;
    soundEngine.playClick();
    setCookie(newCookieName.trim(), newCookieValue.trim() || 'test-value', 30);
    setNewCookieName('');
    setNewCookieValue('');
    setShowTestForm(false);
    refreshActiveCookies();
  };

  const handleDeleteSingleCookie = (name: string) => {
    soundEngine.playClick();
    deleteCookie(name);
    refreshActiveCookies();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cookie-settings-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            key="cookie-settings-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-2xl bg-[#080E18] border border-white/20 rounded-2xl shadow-2xl p-6 text-white scanlines relative max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#43DDB0]/15 text-[#43DDB0] border border-[#43DDB0]/30">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg tracking-wide text-white flex items-center gap-2">
                  <span>Centre de Gestion des Cookies & Stockage Local</span>
                  <span className="text-[10px] font-code px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
                    0 TRACEUR TIERS
                  </span>
                </h2>
                <p className="text-xs font-body text-white/60">
                  Transparence totale conformément à la directive ePrivacy & CNIL
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alert Message */}
          {saveSuccessMsg && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6">
            {/* Category Toggles */}
            <div className="space-y-3">
              <h3 className="text-xs font-code text-white/60 uppercase tracking-wider">
                Catégories de Cookies & Préférences
              </h3>

              {/* Essential */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">1. Cookies Essentiels & Sécurité</span>
                    <span className="text-[10px] font-code px-1.5 py-0.5 rounded bg-[#43DDB0]/15 text-[#43DDB0] border border-[#43DDB0]/30 font-bold">
                      REQUIS
                    </span>
                  </div>
                  <p className="text-xs font-body text-white/60 leading-relaxed">
                    Nécessaires au fonctionnement du radar (session OAuth Google temporaire en RAM, chiffrement TLS 1.3 et sécurité CSRF/SameSite).
                  </p>
                </div>
                <div className="text-[10px] font-code text-[#43DDB0] font-bold shrink-0 pt-1">
                  Toujours Actifs
                </div>
              </div>

              {/* Audio & Performance */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">2. Musique Lo-Fi & Rendu 3D Canvas</span>
                  </div>
                  <p className="text-xs font-body text-white/60 leading-relaxed">
                    Mémorise si le son est activé ou muet (`rights_radar_audio`) et conserve le mode de performance graphique du globe 3D (`rights_radar_3d_perf`).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.audioAndPerformance}
                  onChange={(e) => setConsent({ ...consent, audioAndPerformance: e.target.checked })}
                  className="rounded border-white/30 text-[#43DDB0] focus:ring-[#43DDB0] bg-black/40 w-5 h-5 cursor-pointer shrink-0 mt-1"
                />
              </div>

              {/* Local Dossiers */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">3. Sauvegarde Locale des Simulations</span>
                  </div>
                  <p className="text-xs font-body text-white/60 leading-relaxed">
                    Conserve vos brouillons de réclamation CE 261 hors-ligne sur cet appareil pour vous éviter de saisir à nouveau votre numéro de vol.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.localDossiers}
                  onChange={(e) => setConsent({ ...consent, localDossiers: e.target.checked })}
                  className="rounded border-white/30 text-[#43DDB0] focus:ring-[#43DDB0] bg-black/40 w-5 h-5 cursor-pointer shrink-0 mt-1"
                />
              </div>
            </div>

            {/* Active Browser Cookies Inspector */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-code text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-[#43DDB0]" />
                  <span>Inspecteur de Cookies du Navigateur ({activeCookies.length})</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTestForm(!showTestForm)}
                    className="inline-flex items-center gap-1 text-[10px] font-code px-2.5 py-1 rounded-full border border-white/20 hover:border-white text-white/80 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Créer un cookie</span>
                  </button>

                  <button
                    type="button"
                    onClick={refreshActiveCookies}
                    className="p-1 rounded text-white/50 hover:text-white transition"
                    title="Rafraîchir"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {showTestForm && (
                <form onSubmit={handleAddTestCookie} className="p-3 rounded-xl bg-black/50 border border-white/15 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nom (ex: radar_pref)"
                      value={newCookieName}
                      onChange={(e) => setNewCookieName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#43DDB0]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Valeur (ex: true)"
                      value={newCookieValue}
                      onChange={(e) => setNewCookieValue(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#43DDB0]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTestForm(false)}
                      className="px-3 py-1 text-white/60 hover:text-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#43DDB0] text-black font-code font-bold rounded-lg hover:bg-[#38c29b]"
                    >
                      Ajouter le cookie
                    </button>
                  </div>
                </form>
              )}

              {activeCookies.length === 0 ? (
                <div className="p-4 rounded-xl bg-black/30 border border-white/10 text-center text-xs font-code text-white/40">
                  Aucun cookie personnalisé actif sur ce domaine.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeCookies.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-code"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-[#43DDB0]">{c.name}</span>
                        <span className="text-white/40 mx-1.5">=</span>
                        <span className="text-white/80">{c.value}</span>
                        <span className="text-[10px] text-white/40 block mt-0.5">
                          Path: {c.path} · SameSite: {c.sameSite} · Secure: {c.secure ? 'Oui' : 'Non'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleCookie(c.name)}
                        className="p-1 rounded text-white/40 hover:text-red-400 hover:bg-white/5 transition shrink-0"
                        title="Supprimer ce cookie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClearCookies}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-code text-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purger tous les cookies</span>
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-code text-xs transition"
              >
                Tout autoriser
              </button>

              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-5 py-1.5 rounded-full bg-[#43DDB0] hover:bg-[#38c29b] text-black font-code text-xs font-bold transition shadow"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
}
