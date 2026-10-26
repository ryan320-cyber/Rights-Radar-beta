import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PortalTransitionProps {
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
}

export function PortalTransition({ isTransitioning, onTransitionComplete }: PortalTransitionProps) {
  return (
    <AnimatePresence onExitComplete={onTransitionComplete}>
      {isTransitioning && (
        <motion.div
          initial={{ clipPath: 'circle(0% at 50% 90%)', opacity: 0.8 }}
          animate={{ clipPath: 'circle(150% at 50% 90%)', opacity: 1 }}
          exit={{ clipPath: 'circle(0% at 50% 90%)', opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-50 bg-[#03070D] pointer-events-none flex items-center justify-center"
        >
          {/* Subtle chromatic ripple edge */}
          <div className="absolute inset-0 bg-radial from-transparent via-[#43DDB0]/10 to-black/80 pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
