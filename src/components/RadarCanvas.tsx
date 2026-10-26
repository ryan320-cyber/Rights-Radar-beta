import React, { useEffect, useRef, useState } from 'react';
import { Plane, AlertTriangle, CheckCircle, Navigation, Radio, Compass, Filter, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

export interface RadarAircraft {
  id: string;
  flightCode: string;
  callsign: string;
  airline: string;
  aircraftType: string;
  route: string;
  origin: string;
  destination: string;
  distanceKm: number;
  altitude: number; // Flight level (e.g. 340 for 34,000 ft)
  speed: number; // knots
  heading: number; // degrees 0-360
  delayMinutes: number;
  delayText: string;
  statusText: string;
  eligible: boolean;
  estimatedAmount: string;
  preset: 'short' | 'medium' | 'long';
  x: number; // normalized relative to center [-1, 1]
  y: number;
  dx: number; // movement vector
  dy: number;
  history: Array<{ x: number; y: number }>;
  lastSweepHit: number;
}

const REAL_RADAR_FLIGHTS: RadarAircraft[] = [
  {
    id: 'af1234',
    flightCode: 'AF 1234',
    callsign: 'AFR1234',
    airline: 'Air France',
    aircraftType: 'B777-200ER',
    route: 'Paris (CDG) → Nice (NCE)',
    origin: 'CDG',
    destination: 'NCE',
    distanceKm: 685,
    altitude: 280,
    speed: 460,
    heading: 145,
    delayMinutes: 200,
    delayText: '+3h20 à l’arrivée',
    statusText: 'Retard > 3h (Rotation appareil)',
    eligible: true,
    estimatedAmount: '250 €',
    preset: 'short',
    x: 0.35,
    y: 0.42,
    dx: 0.0004,
    dy: 0.0003,
    history: [],
    lastSweepHit: 0,
  },
  {
    id: 'dl890',
    flightCode: 'DL 0890',
    callsign: 'DAL890',
    airline: 'Delta Air Lines',
    aircraftType: 'A350-900',
    route: 'New York (JFK) → Paris (CDG)',
    origin: 'JFK',
    destination: 'CDG',
    distanceKm: 5840,
    altitude: 380,
    speed: 510,
    heading: 78,
    delayMinutes: 270,
    delayText: '+4h30 à l’arrivée',
    statusText: 'Retard > 4h (Maintenance)',
    eligible: true,
    estimatedAmount: '600 €',
    preset: 'long',
    x: -0.42,
    y: -0.25,
    dx: 0.0005,
    dy: 0.0001,
    history: [],
    lastSweepHit: 0,
  },
  {
    id: 'ib3401',
    flightCode: 'IB 3401',
    callsign: 'IBE3401',
    airline: 'Iberia',
    aircraftType: 'A321neo',
    route: 'Madrid (MAD) → Paris (CDG)',
    origin: 'MAD',
    destination: 'CDG',
    distanceKm: 1050,
    altitude: 320,
    speed: 440,
    heading: 25,
    delayMinutes: 245,
    delayText: '+4h05 à l’arrivée',
    statusText: 'Retard technique à l’embarquement',
    eligible: true,
    estimatedAmount: '400 €',
    preset: 'medium',
    x: -0.22,
    y: 0.52,
    dx: 0.0002,
    dy: -0.0004,
    history: [],
    lastSweepHit: 0,
  },
  {
    id: 'lh1045',
    flightCode: 'LH 1045',
    callsign: 'DLH1045',
    airline: 'Lufthansa',
    aircraftType: 'A320-200',
    route: 'Francfort (FRA) → Paris (CDG)',
    origin: 'FRA',
    destination: 'CDG',
    distanceKm: 480,
    altitude: 190,
    speed: 390,
    heading: 245,
    delayMinutes: 0,
    delayText: 'Annulé (prévenu à H-4)',
    statusText: 'Annulation sans préavis 14j',
    eligible: true,
    estimatedAmount: '250 €',
    preset: 'short',
    x: 0.55,
    y: -0.32,
    dx: -0.0003,
    dy: 0.0002,
    history: [],
    lastSweepHit: 0,
  },
  {
    id: 'ba308',
    flightCode: 'BA 0308',
    callsign: 'BAW308',
    airline: 'British Airways',
    aircraftType: 'A320neo',
    route: 'Londres (LHR) → Paris (CDG)',
    origin: 'LHR',
    destination: 'CDG',
    distanceKm: 345,
    altitude: 210,
    speed: 410,
    heading: 140,
    delayMinutes: 225,
    delayText: '+3h45 à l’arrivée',
    statusText: 'Retard passerelle & rotation',
    eligible: true,
    estimatedAmount: '250 €',
    preset: 'short',
    x: -0.38,
    y: -0.52,
    dx: 0.0003,
    dy: 0.0003,
    history: [],
    lastSweepHit: 0,
  },
  {
    id: 'kl1204',
    flightCode: 'KL 1204',
    callsign: 'KLM1204',
    airline: 'KLM Royal Dutch',
    aircraftType: 'B737-800',
    route: 'Amsterdam (AMS) → Paris (CDG)',
    origin: 'AMS',
    destination: 'CDG',
    distanceKm: 400,
    altitude: 240,
    speed: 430,
    heading: 195,
    delayMinutes: 5,
    delayText: 'Ponctuel (+5m)',
    statusText: 'Dans les tolérances',
    eligible: false,
    estimatedAmount: '0 €',
    preset: 'short',
    x: 0.08,
    y: -0.65,
    dx: -0.0001,
    dy: 0.0004,
    history: [],
    lastSweepHit: 0,
  },
  {
    id: 'to4510',
    flightCode: 'TO 4510',
    callsign: 'TVF4510',
    airline: 'Transavia France',
    aircraftType: 'B737-800',
    route: 'Paris (ORY) → Séville (SVQ)',
    origin: 'ORY',
    destination: 'SVQ',
    distanceKm: 1420,
    altitude: 350,
    speed: 450,
    heading: 205,
    delayMinutes: 0,
    delayText: 'À l’heure',
    statusText: 'Vol conforme',
    eligible: false,
    estimatedAmount: '0 €',
    preset: 'short',
    x: -0.05,
    y: 0.22,
    dx: -0.0002,
    dy: 0.0004,
    history: [],
    lastSweepHit: 0,
  },
  {
    id: 'af7632',
    flightCode: 'AF 7632',
    callsign: 'AFR7632',
    airline: 'Air France',
    aircraftType: 'A319-100',
    route: 'Paris (CDG) → Marseille (MRS)',
    origin: 'CDG',
    destination: 'MRS',
    distanceKm: 650,
    altitude: 310,
    speed: 470,
    heading: 155,
    delayMinutes: 215,
    delayText: '+3h35 à l’arrivée',
    statusText: 'Retard technique imputable',
    eligible: true,
    estimatedAmount: '250 €',
    preset: 'short',
    x: 0.18,
    y: 0.58,
    dx: 0.0002,
    dy: 0.0003,
    history: [],
    lastSweepHit: 0,
  },
];

// Major airport waypoints around European scope
const WAYPOINTS = [
  { name: 'LFPG', label: 'CDG', x: 0, y: 0 },
  { name: 'LFPO', label: 'ORY', x: -0.05, y: 0.08 },
  { name: 'EGLL', label: 'LHR', x: -0.45, y: -0.55 },
  { name: 'EDDF', label: 'FRA', x: 0.62, y: -0.38 },
  { name: 'LEMD', label: 'MAD', x: -0.35, y: 0.75 },
  { name: 'LFMN', label: 'NCE', x: 0.45, y: 0.65 },
  { name: 'EHAM', label: 'AMS', x: 0.12, y: -0.72 },
  { name: 'EBBR', label: 'BRU', x: 0.25, y: -0.42 },
];

interface RadarCanvasProps {
  flights?: any[];
  onBlipSelect?: (aircraft: RadarAircraft) => void;
}

export function RadarCanvas({ onBlipSelect }: RadarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [aircraftList, setAircraftList] = useState<RadarAircraft[]>(REAL_RADAR_FLIGHTS);
  const [selectedAircraft, setSelectedAircraft] = useState<RadarAircraft | null>(REAL_RADAR_FLIGHTS[0]);
  const [filterOnlyEligible, setFilterOnlyEligible] = useState(false);
  const [zuluTime, setZuluTime] = useState('');
  const [rangeZoom, setRangeZoom] = useState<'150NM' | '300NM'>('150NM');

  // Live Zulu time clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      setZuluTime(`${h}:${m}:${s} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let sweepAngle = 0;
    let lastTime = performance.now();

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(centerX, centerY) - 24;

      ctx.clearRect(0, 0, width, height);

      // 1. Radar Cathode Ray Tube (CRT) glass background
      const crtGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 1.05);
      crtGradient.addColorStop(0, '#040913');
      crtGradient.addColorStop(0.7, '#02060D');
      crtGradient.addColorStop(1, '#010307');
      ctx.fillStyle = crtGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // CRT Inner glow ring
      ctx.strokeStyle = 'rgba(67, 221, 176, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Concentric Range Rings (50 NM, 100 NM, 150 NM, 200 NM)
      const rangeDistances = [0.25, 0.5, 0.75, 1.0];
      const rangeLabels = rangeZoom === '150NM' ? ['35 NM', '75 NM', '110 NM', '150 NM'] : ['75 NM', '150 NM', '225 NM', '300 NM'];

      rangeDistances.forEach((pct, idx) => {
        const r = maxRadius * pct;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(67, 221, 176, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash(idx === 3 ? [] : [3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Nautical mile label along vertical axis
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(67, 221, 176, 0.45)';
        ctx.fillText(rangeLabels[idx], centerX + 6, centerY - r + 12);
      });

      // 3. Compass Rose Azimuth Ticks (every 10 degrees)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let deg = 0; deg < 360; deg += 10) {
        const rad = (deg * Math.PI) / 180;
        const isCardinal = deg % 90 === 0;
        const isSemi = deg % 30 === 0;
        const tickLen = isCardinal ? 10 : isSemi ? 6 : 3;

        const x1 = centerX + Math.cos(rad) * (maxRadius - tickLen);
        const y1 = centerY + Math.sin(rad) * (maxRadius - tickLen);
        const x2 = centerX + Math.cos(rad) * maxRadius;
        const y2 = centerY + Math.sin(rad) * maxRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (isCardinal) {
          const labelDist = maxRadius - 18;
          const lx = centerX + Math.cos(rad) * labelDist;
          const ly = centerY + Math.sin(rad) * labelDist + 3;
          const cardinal = deg === 270 ? 'N' : deg === 0 ? 'E' : deg === 90 ? 'S' : 'W';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = deg === 270 ? '#43DDB0' : 'rgba(255, 255, 255, 0.6)';
          ctx.textAlign = 'center';
          ctx.fillText(cardinal, lx, ly);
          ctx.textAlign = 'start';
        }
      }

      // 4. Draw Aviation Waypoints (Airports)
      WAYPOINTS.forEach((wp) => {
        const wx = centerX + wp.x * maxRadius;
        const wy = centerY + wp.y * maxRadius;

        // Small 4-point cross
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx - 3, wy);
        ctx.lineTo(wx + 3, wy);
        ctx.moveTo(wx, wy - 3);
        ctx.lineTo(wx, wy + 3);
        ctx.stroke();

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(wp.label, wx + 5, wy - 4);
      });

      // 5. Update Sweep Angle (Realistic 14 RPM scope sweep)
      sweepAngle += 0.022;
      if (sweepAngle >= Math.PI * 2) {
        sweepAngle -= Math.PI * 2;
      }

      // Sweeping Phosphor Conic Decay Gradient
      const sweepGrad = ctx.createConicGradient(sweepAngle, centerX, centerY);
      sweepGrad.addColorStop(0, 'rgba(67, 221, 176, 0.35)');
      sweepGrad.addColorStop(0.08, 'rgba(67, 221, 176, 0.12)');
      sweepGrad.addColorStop(0.22, 'rgba(67, 221, 176, 0.01)');
      sweepGrad.addColorStop(1, 'rgba(67, 221, 176, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius - 1, 0, Math.PI * 2);
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Lead sweep line with bright phosphor tip
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const tipX = centerX + Math.cos(sweepAngle) * maxRadius;
      const tipY = centerY + Math.sin(sweepAngle) * maxRadius;
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = '#43DDB0';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 6. Draw Aircraft & Telemetry Tags
      setAircraftList((prev) =>
        prev.map((plane) => {
          // Flight kinematics: gentle progression along heading
          const speedFactor = dt * 0.04;
          const headingRad = (plane.heading * Math.PI) / 180;
          let nx = plane.x + Math.sin(headingRad) * speedFactor;
          let ny = plane.y - Math.cos(headingRad) * speedFactor;

          // Wrap inside scope bounds
          if (Math.hypot(nx, ny) > 0.88) {
            nx = -nx * 0.85;
            ny = -ny * 0.85;
          }

          // Check sweep collision (phosphor hit)
          const planeAngle = Math.atan2(ny, nx);
          const normalizedSweep = sweepAngle > Math.PI ? sweepAngle - Math.PI * 2 : sweepAngle;
          const angleDiff = Math.abs(planeAngle - normalizedSweep);
          let newHit = plane.lastSweepHit;
          if (angleDiff < 0.04) {
            newHit = time;
          }

          // Maintain breadcrumb trail
          const history = [...plane.history];
          if (history.length === 0 || Math.hypot(nx - history[history.length - 1].x, ny - history[history.length - 1].y) > 0.03) {
            history.push({ x: nx, y: ny });
            if (history.length > 4) history.shift();
          }

          return {
            ...plane,
            x: nx,
            y: ny,
            history,
            lastSweepHit: newHit,
          };
        })
      );

      // Filter display
      const displayed = filterOnlyEligible
        ? aircraftList.filter((p) => p.eligible)
        : aircraftList;

      displayed.forEach((plane) => {
        const px = centerX + plane.x * maxRadius;
        const py = centerY + plane.y * maxRadius;

        const isSelected = selectedAircraft?.id === plane.id;
        const timeSinceHit = (time - plane.lastSweepHit) / 1000;
        const phosphorGlow = Math.max(0, 1 - timeSinceHit / 2.5);

        // A. Draw radar phosphor trail (breadcrumbs)
        plane.history.forEach((h, i) => {
          const hx = centerX + h.x * maxRadius;
          const hy = centerY + h.y * maxRadius;
          const trailAlpha = (i + 1) / (plane.history.length + 1) * 0.3;
          ctx.beginPath();
          ctx.arc(hx, hy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = plane.eligible ? `rgba(67, 221, 176, ${trailAlpha})` : `rgba(255, 179, 64, ${trailAlpha})`;
          ctx.fill();
        });

        // B. Aircraft Heading Vector Line (10-second predictive speed vector)
        const vLen = 18;
        const hRad = (plane.heading * Math.PI) / 180;
        const vx = px + Math.sin(hRad) * vLen;
        const vy = py - Math.cos(hRad) * vLen;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(vx, vy);
        ctx.strokeStyle = plane.eligible ? '#43DDB0' : '#FFB340';
        ctx.lineWidth = 1;
        ctx.stroke();

        // C. Aircraft Chevron symbol
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(hRad);
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(4, 4);
        ctx.lineTo(0, 2);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fillStyle = plane.eligible ? (phosphorGlow > 0.5 ? '#FFFFFF' : '#43DDB0') : '#FFB340';
        ctx.fill();
        ctx.restore();

        // D. Phosphor hit bloom ring
        if (phosphorGlow > 0.2) {
          ctx.beginPath();
          ctx.arc(px, py, 12 * phosphorGlow, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(67, 221, 176, ${phosphorGlow * 0.25})`;
          ctx.fill();
        }

        // E. Target Lock HUD Brackets if selected
        if (isSelected) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.2;
          const bSize = 10;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(px - bSize, py - bSize + 4);
          ctx.lineTo(px - bSize, py - bSize);
          ctx.lineTo(px - bSize + 4, py - bSize);
          // Top-right
          ctx.moveTo(px + bSize - 4, py - bSize);
          ctx.lineTo(px + bSize, py - bSize);
          ctx.lineTo(px + bSize, py - bSize + 4);
          // Bottom-left
          ctx.moveTo(px - bSize, py + bSize - 4);
          ctx.lineTo(px - bSize, py + bSize);
          ctx.lineTo(px - bSize + 4, py + bSize);
          // Bottom-right
          ctx.moveTo(px + bSize - 4, py + bSize);
          ctx.lineTo(px + bSize, py + bSize);
          ctx.lineTo(px + bSize, py + bSize - 4);
          ctx.stroke();
        }

        // F. Aviation Data Tag (Callsign, Altitude FL, Speed, Delay)
        const tagX = px + 12;
        const tagY = py - 8;

        // Leader line
        ctx.beginPath();
        ctx.moveTo(px + 3, py - 3);
        ctx.lineTo(tagX - 2, tagY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = plane.eligible ? '#43DDB0' : '#FFB340';
        ctx.fillText(plane.flightCode, tagX, tagY);

        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`FL${plane.altitude} ${plane.speed}kt`, tagX, tagY + 10);

        if (plane.eligible) {
          ctx.fillStyle = '#43DDB0';
          ctx.fillText(`+${plane.delayText.split(' ')[0]} [${plane.estimatedAmount}]`, tagX, tagY + 20);
        }
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [aircraftList, filterOnlyEligible, selectedAircraft, rangeZoom]);

  // Handle canvas click to select plane
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 24;

    let nearest: RadarAircraft | null = null;
    let minDist = 30; // 30px click radius

    aircraftList.forEach((plane) => {
      const px = centerX + plane.x * maxRadius;
      const py = centerY + plane.y * maxRadius;
      const d = Math.hypot(clickX - px, clickY - py);
      if (d < minDist) {
        minDist = d;
        nearest = plane;
      }
    });

    if (nearest) {
      soundEngine.playClick();
      setSelectedAircraft(nearest);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Radar Scope Frame */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-[520px] rounded-full border-2 border-white/20 bg-[#02050B] shadow-[0_0_50px_rgba(67,221,176,0.18)] overflow-hidden select-none"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair"
        />

        {/* Top-left Telemetry HUD badge */}
        <div className="absolute top-4 left-6 pointer-events-none text-[10px] font-code text-white/60 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[#35D9AE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35D9AE]" />
            <span className="font-semibold tracking-wider">RADAR SURVEILLANCE CE 261</span>
          </div>
          <div>ESPACE AÉRIEN EUROPÉEN</div>
          <div>{zuluTime}</div>
        </div>

        {/* Top-right Range & Mode toggle */}
        <div className="absolute top-4 right-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterOnlyEligible(!filterOnlyEligible)}
            className={`px-3 py-1 rounded-full text-[10px] font-code border transition cursor-pointer ${
              filterOnlyEligible
                ? 'bg-[#35D9AE] text-[#03070D] border-[#35D9AE] font-semibold'
                : 'bg-black/60 text-white/70 border-white/20 hover:text-white'
            }`}
          >
            {filterOnlyEligible ? 'Filtre : Perturbés CE 261' : 'Filtre : Tous les vols'}
          </button>
        </div>

        {/* Bottom Scope Scale Marker */}
        <div className="absolute bottom-4 left-6 pointer-events-none text-[9px] font-code text-white/40">
          RAYON D’OBSERVATION : {rangeZoom} (AZIMUTH 0° - 360°)
        </div>
      </div>

      {/* Selected Aircraft Telemetry Card (Integrated sample result panel) */}
      {selectedAircraft && (
        <div className="w-full mt-4 bg-[#07111F]/90 border border-white/15 rounded-2xl p-4 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] relative">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${selectedAircraft.eligible ? 'bg-[#35D9AE]' : 'bg-[#FFB84D]'}`} />
              <span className="font-code text-xs text-white font-semibold">
                {selectedAircraft.flightCode} ({selectedAircraft.callsign})
              </span>
              <span className="text-[10px] font-code text-[#A6B3C4]">
                {selectedAircraft.aircraftType}
              </span>
            </div>
            <span className={`text-[10px] font-code px-2 py-0.5 rounded border ${
              selectedAircraft.eligible
                ? 'border-[#35D9AE]/40 text-[#35D9AE] bg-[#35D9AE]/10 font-bold'
                : 'border-white/20 text-white/60 bg-white/5'
            }`}>
              {selectedAircraft.eligible ? `${selectedAircraft.estimatedAmount} Éligible CE 261` : 'Non éligible'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-code mb-3">
            <div>
              <span className="text-[10px] text-white/40 block">Itinéraire</span>
              <span className="text-white font-medium">{selectedAircraft.origin} → {selectedAircraft.destination}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 block">Altitude & Vitesse</span>
              <span className="text-white">FL{selectedAircraft.altitude} · {selectedAircraft.speed} kt</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 block">Statut horaire</span>
              <span className={selectedAircraft.eligible ? 'text-[#FFB84D] font-semibold' : 'text-white/70'}>
                {selectedAircraft.delayText}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 block">Compagnie</span>
              <span className="text-white/80 truncate block">{selectedAircraft.airline}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-body text-[#A6B3C4]">
              {selectedAircraft.statusText}
            </span>

            {selectedAircraft.eligible && onBlipSelect && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onBlipSelect(selectedAircraft);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35D9AE] hover:bg-[#2fc29b] text-[#03070D] text-[11px] font-code font-bold transition active:scale-95 shadow"
              >
                <span>Simuler ce vol</span>
                <Sparkles className="w-3 h-3 text-[#03070D]" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
