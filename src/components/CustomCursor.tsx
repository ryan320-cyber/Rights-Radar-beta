import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export function CustomCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'radar' | 'action'>('default');

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only enable on desktop pointer devices with fine control
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Check target element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, input, select, textarea, [data-cursor]');
      if (interactive) {
        setIsHovering(true);
        const customType = interactive.getAttribute('data-cursor') as 'default' | 'radar' | 'action';
        setCursorType(customType || 'action');
      } else {
        setIsHovering(false);
        setCursorType('default');
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!isEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden select-none">
      {/* Outer Reticle Ring */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? (cursorType === 'radar' ? 2.2 : 1.5) : 1,
          borderColor: isHovering
            ? cursorType === 'radar'
              ? 'rgba(67, 221, 176, 0.8)'
              : 'rgba(231, 166, 58, 0.8)'
            : 'rgba(67, 221, 176, 0.4)',
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-8 h-8 rounded-full border border-[#43DDB0]/40 flex items-center justify-center backdrop-blur-[1px]"
      >
        {/* Subtle crosshair ticks */}
        <div className="absolute top-0 w-1 h-0.5 bg-[#43DDB0]/60 -translate-y-1" />
        <div className="absolute bottom-0 w-1 h-0.5 bg-[#43DDB0]/60 translate-y-1" />
        <div className="absolute left-0 w-0.5 h-1 bg-[#43DDB0]/60 -translate-x-1" />
        <div className="absolute right-0 w-0.5 h-1 bg-[#43DDB0]/60 translate-x-1" />

        {/* Center dot */}
        <motion.div
          animate={{
            scale: isHovering ? 0.6 : 1,
            backgroundColor: isHovering ? '#43DDB0' : '#101722',
          }}
          className="w-1.5 h-1.5 rounded-full bg-[#101722] border border-[#43DDB0]"
        />
      </motion.div>
    </div>
  );
}
