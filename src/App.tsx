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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    // Check URL parameters for review mode (?review=1) and autostart (?autostart=1)
    const params = new URLSearchParams(window.location.search);
    if (params.get('review') === '1') {
      setIsReviewMode(true);
    }
    if (params.get('autostart') === '1') {
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

  return (
    <div className="min-h-screen bg-[#03070D] text-[#F4F4F6] font-body selection:bg-[#43DDB0]/30 selection:text-white flex flex-col">
      {/* Desktop Art-directed Custom Reticle Cursor */}
      <CustomCursor />

      {/* S0: Optional Immersive Opening */}
      {showIntro && <OpeningIntro onEnter={() => setShowIntro(false)} />}

      {/* Global Persistent Header with Auth & Menu */}
      <Header
        user={user}
        isReviewMode={isReviewMode}
        onToggleReviewMode={handleToggleReviewMode}
      />

      {/* Main Semantic Landmark */}
      <main id="main-content" className="flex-1">
        {/* S1: Hero Section */}
        <HeroSection onOpenSimulator={() => setIsSimulatorOpen(true)} />

        {/* S2: The Problem */}
        <ProblemSection />

        {/* S3: Why Now */}
        <WhyNowSection isReviewMode={isReviewMode} />

        {/* S4: The Solution */}
        <SolutionSection onOpenSimulator={() => setIsSimulatorOpen(true)} />

        {/* S5: Commitments */}
        <CommitmentsSection />

        {/* S6: Comparison */}
        <ComparisonSection />

        {/* S7: Needs */}
        <NeedsSection />

        {/* S8: Request and Waitlist */}
        <WaitlistSection user={user} />
      </main>

      {/* S9: Footer */}
      <FooterSection onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      {/* Interactive Modals */}
      <FlightSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        user={user}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
