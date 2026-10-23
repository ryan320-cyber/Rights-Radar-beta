import React, { useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.ts';
import { LogIn, LogOut, Menu, ShieldCheck, UserCheck } from 'lucide-react';
import { MenuOverlay } from './MenuOverlay.tsx';

interface HeaderProps {
  user: User | null;
  isReviewMode: boolean;
  onToggleReviewMode: () => void;
}

export function Header({ user, isReviewMode, onToggleReviewMode }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.warn('[Header] Auth Google:', err);
      setAuthError('Connexion interrompue ou bloquée. Veuillez réessayer.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[Header] Déconnexion:', err);
    }
  };

  return (
    <>
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[#101722] text-[#F6F5F1] px-4 py-2 rounded font-code text-xs border border-[#43DDB0]"
      >
        Passer au contenu principal
      </a>

      <header className="sticky top-0 z-40 w-full bg-[#F4F1EA]/85 backdrop-blur-md border-b border-[#17191D]/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Wordmark */}
          <a href="#" className="flex items-center gap-3 group">
            <span className="w-2.5 h-2.5 rounded-full bg-[#43DDB0] ring-4 ring-[#43DDB0]/20" />
            <span className="font-display italic text-2xl sm:text-3xl tracking-tight text-[#17191D] group-hover:text-[#101722] transition">
              Rights Radar
            </span>
            <span className="hidden md:inline-block text-[11px] font-code text-[#17191D]/50 tracking-wider">
              MAQUETTE · RECHERCHE
            </span>
          </a>

          {/* Right Controls: Review Mode + Firebase Auth + Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Review mode indicator */}
            {isReviewMode && (
              <button
                type="button"
                onClick={onToggleReviewMode}
                title="Désactiver le mode relecture"
                className="review-tag hidden sm:inline-flex cursor-pointer hover:bg-amber-100"
              >
                MODE RELECTURE (?review=1)
              </button>
            )}

            {/* Firebase Auth Google Sign-in */}
            {user ? (
              <div className="flex items-center gap-2 bg-[#17191D]/5 hover:bg-[#17191D]/10 px-2.5 py-1.5 rounded-full border border-[#17191D]/10 transition">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Utilisateur'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#101722] text-[#F6F5F1] flex items-center justify-center text-xs font-code">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-body text-[#17191D] font-medium max-w-[120px] truncate hidden sm:inline-block">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Se déconnecter"
                  aria-label="Se déconnecter"
                  className="p-1 hover:text-red-600 transition text-[#17191D]/60"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isAuthLoading}
                aria-label="Connexion Google"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101722] hover:bg-[#1C2636] text-[#F6F5F1] text-xs font-code transition focus:ring-2 focus:ring-[#43DDB0]"
              >
                <LogIn className="w-3.5 h-3.5 text-[#43DDB0]" />
                <span>{isAuthLoading ? 'Connexion...' : 'Connexion'}</span>
              </button>
            )}

            {/* Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Ouvrir le menu de navigation"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#17191D]/20 hover:border-[#17191D]/60 bg-transparent text-[#17191D] text-xs font-code transition focus:ring-2 focus:ring-[#43DDB0]"
            >
              <Menu className="w-3.5 h-3.5 text-[#17191D]" />
              <span className="hidden xs:inline">Menu</span>
            </button>
          </div>
        </div>

        {authError && (
          <div className="bg-red-50 text-red-700 text-xs px-4 py-1 text-center border-t border-red-200 font-body">
            {authError}
          </div>
        )}
      </header>

      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
