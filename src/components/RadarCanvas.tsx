import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface RadarBlip {
  id: string;
  code: string;
  airline: string;
  route: string;
  delay: string;
  amount: string;
  angle: number; // in radians
  distanceRatio: number; // 0 to 1
  label: string;
  originX?: number;
  originY?: number;
}

export function RadarCanvas({
  isInteractive = true,
  onBlipSelect,
}: {
  isInteractive?: boolean;
  onBlipSelect?: (blip: RadarBlip) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredBlip, setHoveredBlip] = useState<RadarBlip | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [pointerCoords, setPointerCoords] = useState<{ lat: string; lon: string; az: number }>({
    lat: '48°51′ N',
    lon: '002°21′ E',
    az: 124,
  });

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const blips: RadarBlip[] = [
    {
      id: 'af1234',
      code: 'AF 1234',
      airline: 'Air France',
      route: 'Paris (CDG) → Nice (NCE)',
      delay: '+3h20 à l’arrivée',
      amount: '250 € estimé',
      angle: 0.95,
      distanceRatio: 0.38,
      label: 'Exemple illustratif',
    },
    {
      id: 'ib3401',
      code: 'IB 3401',
      airline: 'Iberia',
      route: 'Madrid (MAD) → Paris (CDG)',
      delay: '+4h05 à l’arrivée',
      amount: '400 € estimé',
      angle: 2.3,
      distanceRatio: 0.62,
      label: 'Exemple illustratif',
    },
    {
      id: 'dl890',
      code: 'DL 0890',
      airline: 'Delta',
      route: 'New York (JFK) → Paris (CDG)',
      delay: '+4h30 à l’arrivée',
      amount: '600 € estimé',
      angle: 3.85,
      distanceRatio: 0.86,
      label: 'Exemple illustratif',
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let sweepAngle = 0;
    let isVisible = true;
    let trailPhase = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const centerX = width / 2 + tilt.x * 0.2;
      const centerY = height / 2 + tilt.y * 0.2;
      const maxRadius = Math.min(width, height) * 0.44;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric background
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, maxRadius * 1.35);
      bgGrad.addColorStop(0, '#0F1A2A');
      bgGrad.addColorStop(0.55, '#0B1320');
      bgGrad.addColorStop(0.9, '#070C14');
      bgGrad.addColorStop(1, '#05080E');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Calibration grid
      ctx.strokeStyle = 'rgba(67, 221, 176, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 44;
      for (let x = centerX - maxRadius; x <= centerX + maxRadius; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, centerY - maxRadius);
        ctx.lineTo(x, centerY + maxRadius);
        ctx.stroke();
      }
      for (let y = centerY - maxRadius; y <= centerY + maxRadius; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(centerX - maxRadius, y);
        ctx.lineTo(centerX + maxRadius, y);
        ctx.stroke();
      }

      // Range zones (concentric rings according to CE 261/2004 tiers)
      const ringTiers = [
        { ratio: 0.35, label: '≤ 1 500 km • 250 €' },
        { ratio: 0.65, label: '1 500 – 3 500 km • 400 €' },
        { ratio: 0.95, label: '> 3 500 km • 600 €' },
      ];

      ringTiers.forEach((ring) => {
        const r = maxRadius * ring.ratio;
        ctx.strokeStyle = 'rgba(67, 221, 176, 0.16)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on ring
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(246, 245, 241, 0.4)';
        ctx.textAlign = 'left';
        ctx.fillText(ring.label, centerX + 10, centerY - r + 13);
      });

      // Cardinal axes and degree ticks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();

      // Degree markings along outer perimeter
      const tickCount = 36;
      for (let i = 0; i < tickCount; i++) {
        const angle = (i * Math.PI * 2) / tickCount;
        const isMajor = i % 9 === 0;
        const outerR = maxRadius;
        const innerR = maxRadius - (isMajor ? 10 : 5);
        ctx.strokeStyle = isMajor ? 'rgba(67, 221, 176, 0.5)' : 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.stroke();
      }

      // Draw curved flight paths connecting coordinates to center
      blips.forEach((blip, idx) => {
        const bx = centerX + Math.cos(blip.angle) * (maxRadius * blip.distanceRatio);
        const by = centerY + Math.sin(blip.angle) * (maxRadius * blip.distanceRatio);

        // Curved arc path to center
        ctx.save();
        ctx.strokeStyle = 'rgba(67, 221, 176, 0.2)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 5]);

        const cpX = (centerX + bx) / 2 + Math.sin(blip.angle) * 35;
        const cpY = (centerY + by) / 2 - Math.cos(blip.angle) * 35;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.quadraticCurveTo(cpX, cpY, bx, by);
        ctx.stroke();
        ctx.restore();

        // Animated packet/pulse along path
        if (!prefersReducedMotion) {
          const t = ((trailPhase + idx * 0.33) % 1);
          const px = (1 - t) * (1 - t) * centerX + 2 * (1 - t) * t * cpX + t * t * bx;
          const py = (1 - t) * (1 - t) * centerY + 2 * (1 - t) * t * cpY + t * t * by;
          ctx.fillStyle = 'rgba(67, 221, 176, 0.8)';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Update sweep rotation
      if (!prefersReducedMotion) {
        sweepAngle += 0.016;
        if (sweepAngle > Math.PI * 2) sweepAngle -= Math.PI * 2;
        trailPhase += 0.006;
      } else {
        sweepAngle = 1.25;
      }

      // Sweep gradient sector (radar phosphorescent cone)
      const sweepLength = 0.65;
      const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      sweepGrad.addColorStop(0, 'rgba(67, 221, 176, 0.3)');
      sweepGrad.addColorStop(0.7, 'rgba(67, 221, 176, 0.1)');
      sweepGrad.addColorStop(1, 'rgba(67, 221, 176, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, sweepAngle - sweepLength, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sweep leading beam line
      ctx.strokeStyle = '#43DDB0';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#43DDB0';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepAngle) * maxRadius,
        centerY + Math.sin(sweepAngle) * maxRadius
      );
      ctx.stroke();
      ctx.restore();

      // Center transmitter core
      ctx.fillStyle = '#43DDB0';
      ctx.shadowColor = '#43DDB0';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw detected blips
      blips.forEach((blip) => {
        const bx = centerX + Math.cos(blip.angle) * (maxRadius * blip.distanceRatio);
        const by = centerY + Math.sin(blip.angle) * (maxRadius * blip.distanceRatio);

        // Angle diff to sweep
        const diff = (sweepAngle - blip.angle + Math.PI * 2) % (Math.PI * 2);
        const intensity = diff < 0.65 ? 1 - diff / 0.65 : 0.25;

        // Blip outer pulse ring
        ctx.strokeStyle = `rgba(67, 221, 176, ${intensity * 0.8})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(bx, by, 7 + (1 - intensity) * 6, 0, Math.PI * 2);
        ctx.stroke();

        // Blip core dot
        ctx.fillStyle = intensity > 0.6 ? '#43DDB0' : 'rgba(67, 221, 176, 0.6)';
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Callout label
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#F6F5F1';
        ctx.textAlign = 'left';
        ctx.fillText(blip.code, bx + 10, by - 4);

        ctx.font = '9px "IBM Plex Sans", sans-serif';
        ctx.fillStyle = '#43DDB0';
        ctx.fillText(blip.amount, bx + 10, by + 8);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [tilt]);

  // Handle pointer interactions and 3D parallax tilt
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - tilt.x, y: e.clientY - tilt.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const angleDeg = Math.round(((Math.atan2(py - centerY, px - centerX) * 180) / Math.PI + 360) % 360);

      setPointerCoords({
        lat: `${(48.85 + (py / rect.height) * 0.2).toFixed(2)}° N`,
        lon: `${(2.35 + (px / rect.width) * 0.2).toFixed(2)}° E`,
        az: angleDeg,
      });

      // Check proximity to blips for hover tooltip
      let found: RadarBlip | null = null;
      blips.forEach((blip) => {
        const maxR = Math.min(rect.width, rect.height) * 0.44;
        const bx = centerX + Math.cos(blip.angle) * (maxR * blip.distanceRatio);
        const by = centerY + Math.sin(blip.angle) * (maxR * blip.distanceRatio);
        const dist = Math.hypot(px - bx, py - by);
        if (dist < 26) {
          found = blip;
          setTooltipPos({ x: bx, y: by });
        }
      });
      setHoveredBlip(found);
    }

    if (!isDraggingRef.current || !isInteractive) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setTilt({
      x: Math.max(-45, Math.min(45, dx)),
      y: Math.max(-35, Math.min(35, dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerLeave = () => {
    setHoveredBlip(null);
    setTooltipPos(null);
  };

  const handleReset = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[480px] md:min-h-[600px] flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        data-cursor="radar"
        className="w-full h-full max-w-[620px] max-h-[620px] aspect-square rounded-full cursor-grab active:cursor-grabbing border border-[#43DDB0]/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
      />

      {/* Accessible Description */}
      <div className="sr-only">
        Radar interactif illustrant la détection de trois vols : AF 1234 (Paris-Nice, 250 €), IB 3401 (Madrid-Paris, 400 €) et DL 0890 (New York-Paris, 600 €) selon le barème CE 261/2004.
      </div>

      {/* Live Telemetry HUD Overlays */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#080C14]/90 backdrop-blur-md border border-[#43DDB0]/30 text-xs font-code text-[#43DDB0]">
          <span className="w-2 h-2 rounded-full bg-[#43DDB0] animate-pulse" />
          <span>BALAYAGE ACTIF • 1090 MHz ADS-B</span>
        </div>
        <div className="text-[11px] font-code text-white/60 bg-[#080C14]/70 px-2 py-0.5 rounded border border-white/5 backdrop-blur-sm">
          AZIMUTH {pointerCoords.az}° • {pointerCoords.lat} / {pointerCoords.lon}
        </div>
      </div>

      {/* Hover Blip Floating Card */}
      {hoveredBlip && tooltipPos && (
        <div
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 12}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute z-30 pointer-events-none p-3 rounded-xl bg-[#080C14]/95 border border-[#43DDB0]/50 shadow-2xl backdrop-blur-md text-xs font-code text-[#F6F5F1] min-w-[200px]"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5">
            <span className="font-semibold text-[#43DDB0]">{hoveredBlip.code}</span>
            <span className="text-[10px] text-white/50">{hoveredBlip.airline}</span>
          </div>
          <div className="text-white/80 font-body text-[11px] mb-1">{hoveredBlip.route}</div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#E7A63A]">{hoveredBlip.delay}</span>
            <span className="font-bold text-[#43DDB0]">{hoveredBlip.amount}</span>
          </div>
          <div className="text-[9px] text-white/40 mt-1 uppercase tracking-wider">
            {hoveredBlip.label}
          </div>
        </div>
      )}

      {/* Interactive Controls & Calibration */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        {(tilt.x !== 0 || tilt.y !== 0) && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-code rounded bg-white/10 hover:bg-white/20 text-[#F6F5F1] transition border border-white/10 backdrop-blur-md"
          >
            Recentrer le radar
          </button>
        )}
        <div className="text-[10px] font-code text-white/40 hidden sm:block bg-[#080C14]/80 px-2.5 py-1.5 rounded border border-white/10 backdrop-blur-sm">
          Glisser pour orienter l'angle
        </div>
      </div>
    </div>
  );
}
