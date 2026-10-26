/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase.ts';
import { Header } from './components/Header.tsx';
import { OpeningIntro } from './components/OpeningIntro.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ProblemSection } from './components/ProblemSection.tsx';
import { WhyNowSection } from './components/WhyNowSection.tsx';
import { SolutionSection } from './components/SolutionSection.tsx';
import { CommitmentsSection } from './components/CommitmentsSection.tsx';
import { ComparisonSection } from './components/ComparisonSection.tsx';
import { NeedsSection } from './components/NeedsSection.tsx';
import { WaitlistSection } from './components/WaitlistSection.tsx';
import { FooterSection } from './components/FooterSection.tsx';
import { FlightSimulatorModal } from './components/FlightSimulatorModal.tsx';
import { PrivacyModal } from './components/PrivacyModal.tsx';
import { CustomCursor } from './components/CustomCursor.tsx';
import { RadarWorld3D } from './components/RadarWorld3D.tsx';
import { BottomFloatingBar } from './components/BottomFloatingBar.tsx';
import { PortalTransition } from './components/PortalTransition.tsx';
import { SecurityCenterModal } from './components/SecurityCenterModal.tsx';
import { CookieConsentBanner } from './components/CookieConsentBanner.tsx';
import { CookieSettingsModal } from './components/CookieSettingsModal.tsx';
import { soundEngine } from './utils/soundEngine.ts';
import { motion } from 'motion/react';

function ScrollSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -50px 0px' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorPreset, setSimulatorPreset] = useState<'short' | 'medium' | 'long' | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isRadarWorldActive, setIsRadarWorldActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  useEffect(() => {
    // Check URL parameters for review mode (?review=1) and autostart (?autostart=1)
    const params = new URLSearchParams(window.location.search);
    if (params.get('review') === '1') {
      setIsReviewMode(true);
    }
    if (params.get('autostart') === '1') {
      setShowIntro(false);
    }
    if (params.get('world') === '1') {
      setIsRadarWorldActive(true);
      setShowIntro(false);
    }

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleReviewMode = () => {
    setIsReviewMode((prev) => !prev);
  };

  const handleOpenSimulator = (preset?: 'short' | 'medium' | 'long') => {
    setSimulatorPreset(preset || null);
    setIsSimulatorOpen(true);
  };

  const handleToggleWorld = () => {
    soundEngine.playGlitch();
    setIsTransitioning(true);
    setTimeout(() => {
      setIsRadarWorldActive((prev) => !prev);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#03070D] text-[#F4F1E9] font-body selection:bg-[#35D9AE]/30 selection:text-white flex flex-col relative pb-20">
      {/* Desktop Art-directed Custom Reticle Cursor */}
      <CustomCursor />

      {/* S0: Optional Immersive Opening */}
      {showIntro && <OpeningIntro onEnter={() => setShowIntro(false)} />}

      {/* Global Persistent Header with Auth & Menu */}
      <Header
        user={user}
        isReviewMode={isReviewMode}
        onToggleReviewMode={handleToggleReviewMode}
        onOpenSecurity={() => setIsSecurityOpen(true)}
      />

      {/* Main Semantic Landmark */}
      <main id="main-content" className="flex-1">
        {/* S1: Hero Section */}
        <ScrollSection>
          <HeroSection
            onOpenSimulator={handleOpenSimulator}
          />
        </ScrollSection>

        {/* S2: The Problem */}
        <ScrollSection>
          <ProblemSection />
        </ScrollSection>

        {/* S3: Why Now */}
        <ScrollSection>
          <WhyNowSection isReviewMode={isReviewMode} />
        </ScrollSection>

        {/* S4: The Solution */}
        <ScrollSection>
          <SolutionSection />
        </ScrollSection>

        {/* S5: Commitments */}
        <ScrollSection>
          <CommitmentsSection />
        </ScrollSection>

        {/* S6: Comparison */}
        <ScrollSection>
          <ComparisonSection />
        </ScrollSection>

        {/* S7: Needs */}
        <ScrollSection>
          <NeedsSection />
        </ScrollSection>

        {/* S8: Request and Waitlist */}
        <ScrollSection>
          <WaitlistSection />
        </ScrollSection>
      </main>

      {/* S9: Footer */}
      <ScrollSection>
        <FooterSection
          onOpenCookies={() => setIsCookieModalOpen(true)}
          onOpenSecurity={() => setIsSecurityOpen(true)}
        />
      </ScrollSection>

      {/* Pinned Bottom Immersive Control Bar (like Unseen Studio) */}
      {!isRadarWorldActive && (
        <BottomFloatingBar
          isWorldActive={isRadarWorldActive}
          onToggleWorld={handleToggleWorld}
          onOpenSecurity={() => setIsSecurityOpen(true)}
          onOpenSimulator={() => handleOpenSimulator()}
          onOpenCookies={() => setIsCookieModalOpen(true)}
        />
      )}

      {/* Liquid Portal Transition Overlay */}
      <PortalTransition isTransitioning={isTransitioning} />

      {/* World B: 3D Photorealistic Radar Globe Experience */}
      {isRadarWorldActive && (
        <RadarWorld3D
          onClose={handleToggleWorld}
          onOpenSimulatorWithPreset={(preset) => {
            handleOpenSimulator(preset);
          }}
        />
      )}

      {/* Interactive Modals */}
      <FlightSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        user={user}
        initialPreset={simulatorPreset}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <SecurityCenterModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      <CookieSettingsModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />

      {/* Privacy-First Cookie Consent Banner */}
      <CookieConsentBanner onOpenCookieSettings={() => setIsCookieModalOpen(true)} />
    </div>
  );
}
