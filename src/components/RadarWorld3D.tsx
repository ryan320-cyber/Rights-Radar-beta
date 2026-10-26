import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { X, ChevronLeft, ChevronRight, Sparkles, Navigation, Globe, ZoomIn, ZoomOut, Play, Pause, Radio, Compass, Plane, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine.ts';

interface FlightCase3D {
  id: string;
  code: string;
  airline: string;
  route: string;
  origin: string;
  destination: string;
  delay: string;
  amount: string;
  status: string;
  preset: 'short' | 'medium' | 'long';
  lawArticle: string;
  details: string;
  coords: { lat: number; lon: number };
  destCoords: { lat: number; lon: number };
}

const FLIGHT_CASES: FlightCase3D[] = [
  {
    id: 'af1234',
    code: 'AF 1234',
    airline: 'Air France',
    route: 'Paris (CDG) → Nice (NCE)',
    origin: 'CDG',
    destination: 'NCE',
    delay: '+3h20 à l’arrivée',
    amount: '250 €',
    status: 'Éligible indemnisation',
    preset: 'short',
    lawArticle: 'Article 7.1.a (≤ 1 500 km)',
    details: 'Vol national / intra-UE retardé de plus de 3 heures. Circonstance ordinaire constatée (rotation appareil).',
    coords: { lat: 49.0097, lon: 2.5479 },
    destCoords: { lat: 43.6653, lon: 7.2150 },
  },
  {
    id: 'dl890',
    code: 'DL 0890',
    airline: 'Delta Air Lines',
    route: 'New York (JFK) → Paris (CDG)',
    origin: 'JFK',
    destination: 'CDG',
    delay: '+4h30 à l’arrivée',
    amount: '600 €',
    status: 'Éligible indemnisation',
    preset: 'long',
    lawArticle: 'Article 7.1.c (Extra-UE > 3 500 km)',
    details: 'Vol long-courrier transatlantique arrivé avec plus de 4 heures de retard suite à une panne technique à JFK.',
    coords: { lat: 40.6413, lon: -73.7781 },
    destCoords: { lat: 49.0097, lon: 2.5479 },
  },
  {
    id: 'ib3401',
    code: 'IB 3401',
    airline: 'Iberia',
    route: 'Madrid (MAD) → Paris (CDG)',
    origin: 'MAD',
    destination: 'CDG',
    delay: '+4h05 à l’arrivée',
    amount: '400 €',
    status: 'Éligible indemnisation',
    preset: 'medium',
    lawArticle: 'Article 7.1.b (Intra-UE > 1 500 km)',
    details: 'Vol intra-communautaire retardé pour réorganisation de flotte non imputable à des circonstances extraordinaires.',
    coords: { lat: 40.4839, lon: -3.5679 },
    destCoords: { lat: 49.0097, lon: 2.5479 },
  },
  {
    id: 'lh1045',
    code: 'LH 1045',
    airline: 'Lufthansa',
    route: 'Francfort (FRA) → Paris (CDG)',
    origin: 'FRA',
    destination: 'CDG',
    delay: 'Annulé (prévenu à H-4)',
    amount: '250 €',
    status: 'Éligible indemnisation',
    preset: 'short',
    lawArticle: 'Article 5 & 7 (Annulation sans préavis 14j)',
    details: 'Annulation annoncée le jour même sans proposition de réacheminement équivalent.',
    coords: { lat: 50.0379, lon: 8.5622 },
    destCoords: { lat: 49.0097, lon: 2.5479 },
  },
  {
    id: 'ba308',
    code: 'BA 0308',
    airline: 'British Airways',
    route: 'Londres (LHR) → Paris (CDG)',
    origin: 'LHR',
    destination: 'CDG',
    delay: '+3h45 à l’arrivée',
    amount: '250 €',
    status: 'Éligible indemnisation',
    preset: 'short',
    lawArticle: 'Article 7.1.a (≤ 1 500 km)',
    details: 'Retard de livraison des bagages et blocage passerelle à Heathrow.',
    coords: { lat: 51.4700, lon: -0.4543 },
    destCoords: { lat: 49.0097, lon: 2.5479 },
  },
];

// Airport hubs with ICAO and Coordinates
const AIRPORT_HUBS = [
  { code: 'CDG', name: 'Paris CDG', icao: 'LFPG', lat: 49.0097, lon: 2.5479 },
  { code: 'JFK', name: 'New York JFK', icao: 'KJFK', lat: 40.6413, lon: -73.7781 },
  { code: 'LHR', name: 'Londres LHR', icao: 'EGLL', lat: 51.4700, lon: -0.4543 },
  { code: 'FRA', name: 'Francfort FRA', icao: 'EDDF', lat: 50.0379, lon: 8.5622 },
  { code: 'MAD', name: 'Madrid MAD', icao: 'LEMD', lat: 40.4839, lon: -3.5679 },
  { code: 'NCE', name: 'Nice NCE', icao: 'LFMN', lat: 43.6653, lon: 7.2150 },
  { code: 'DXB', name: 'Dubaï DXB', icao: 'OMDB', lat: 25.2532, lon: 55.3657 },
  { code: 'NRT', name: 'Tokyo NRT', icao: 'RJAA', lat: 35.7720, lon: 140.3929 },
];

// Rich vector shoreline contours across all world continents
const DETAILED_WORLD_COASTLINES = [
  // Europe (France, Germany, Low Countries, Poland)
  [
    { lat: 51.0, lon: 2.5 }, { lat: 53.5, lon: 7.0 }, { lat: 54.5, lon: 10.0 }, { lat: 54.5, lon: 14.0 },
    { lat: 54.5, lon: 18.5 }, { lat: 50.0, lon: 19.5 }, { lat: 46.0, lon: 16.0 }, { lat: 45.5, lon: 13.0 },
    { lat: 44.0, lon: 8.0 }, { lat: 43.7, lon: 7.3 }, { lat: 43.3, lon: 3.5 }, { lat: 42.4, lon: 3.1 },
    { lat: 43.3, lon: -1.8 }, { lat: 46.0, lon: -1.2 }, { lat: 48.4, lon: -4.8 }, { lat: 49.7, lon: -1.9 },
    { lat: 51.0, lon: 2.5 }
  ],
  // Great Britain & Ireland
  [
    { lat: 50.5, lon: 1.4 }, { lat: 51.9, lon: 1.3 }, { lat: 52.9, lon: 0.5 }, { lat: 54.5, lon: -0.5 },
    { lat: 58.5, lon: -3.0 }, { lat: 58.5, lon: -5.0 }, { lat: 55.5, lon: -5.0 }, { lat: 53.5, lon: -3.0 },
    { lat: 51.5, lon: -5.0 }, { lat: 50.0, lon: -5.2 }, { lat: 50.5, lon: 1.4 }
  ],
  [
    { lat: 51.5, lon: -9.5 }, { lat: 53.0, lon: -9.5 }, { lat: 54.5, lon: -8.5 }, { lat: 55.2, lon: -6.5 },
    { lat: 53.5, lon: -6.0 }, { lat: 52.0, lon: -6.5 }, { lat: 51.5, lon: -9.5 }
  ],
  // Scandinavia
  [
    { lat: 55.0, lon: 12.0 }, { lat: 56.0, lon: 16.0 }, { lat: 59.5, lon: 18.5 }, { lat: 65.0, lon: 22.0 },
    { lat: 70.0, lon: 28.0 }, { lat: 71.0, lon: 25.0 }, { lat: 68.0, lon: 15.0 }, { lat: 62.0, lon: 5.0 },
    { lat: 58.0, lon: 6.0 }, { lat: 55.0, lon: 12.0 }
  ],
  // Iberian Peninsula (Spain & Portugal)
  [
    { lat: 43.3, lon: -1.8 }, { lat: 43.8, lon: -8.5 }, { lat: 42.0, lon: -8.9 }, { lat: 37.0, lon: -9.0 },
    { lat: 36.0, lon: -5.6 }, { lat: 36.7, lon: -2.4 }, { lat: 38.3, lon: -0.5 }, { lat: 41.4, lon: 2.2 },
    { lat: 42.4, lon: 3.1 }
  ],
  // Italy & Adriatic
  [
    { lat: 44.0, lon: 8.0 }, { lat: 45.4, lon: 12.3 }, { lat: 42.0, lon: 15.0 }, { lat: 40.0, lon: 18.5 },
    { lat: 38.0, lon: 15.5 }, { lat: 38.0, lon: 12.5 }, { lat: 41.0, lon: 14.0 }, { lat: 44.0, lon: 9.5 }
  ],
  // Greece & Aegean
  [
    { lat: 40.5, lon: 23.0 }, { lat: 38.0, lon: 24.0 }, { lat: 36.5, lon: 23.0 }, { lat: 38.0, lon: 21.0 },
    { lat: 40.0, lon: 20.0 }
  ],
  // North America (East Coast & Canada)
  [
    { lat: 25.0, lon: -80.0 }, { lat: 28.5, lon: -80.5 }, { lat: 32.0, lon: -81.0 }, { lat: 35.0, lon: -75.5 },
    { lat: 39.0, lon: -74.5 }, { lat: 40.7, lon: -74.0 }, { lat: 42.3, lon: -71.0 }, { lat: 44.5, lon: -67.0 },
    { lat: 47.0, lon: -60.0 }, { lat: 52.0, lon: -56.0 }, { lat: 58.0, lon: -62.0 }, { lat: 62.0, lon: -75.0 }
  ],
  // North America (West Coast)
  [
    { lat: 32.5, lon: -117.0 }, { lat: 34.0, lon: -119.0 }, { lat: 37.8, lon: -122.5 }, { lat: 42.0, lon: -124.5 },
    { lat: 48.0, lon: -124.5 }, { lat: 54.0, lon: -130.0 }, { lat: 60.0, lon: -140.0 }
  ],
  // Gulf of Mexico
  [
    { lat: 25.0, lon: -80.0 }, { lat: 26.0, lon: -82.0 }, { lat: 30.0, lon: -85.0 }, { lat: 29.5, lon: -94.0 },
    { lat: 26.0, lon: -97.0 }, { lat: 22.0, lon: -97.5 }, { lat: 19.0, lon: -96.0 }, { lat: 21.0, lon: -87.0 }
  ],
  // South America
  [
    { lat: 11.0, lon: -72.0 }, { lat: 5.0, lon: -52.0 }, { lat: -5.0, lon: -35.0 }, { lat: -23.0, lon: -43.0 },
    { lat: -35.0, lon: -55.0 }, { lat: -54.0, lon: -68.0 }, { lat: -40.0, lon: -73.0 }, { lat: -18.0, lon: -70.0 },
    { lat: -5.0, lon: -81.0 }, { lat: 8.0, lon: -77.0 }, { lat: 11.0, lon: -72.0 }
  ],
  // Africa
  [
    { lat: 35.8, lon: -5.8 }, { lat: 36.5, lon: 3.0 }, { lat: 37.0, lon: 10.0 }, { lat: 33.0, lon: 11.5 },
    { lat: 31.5, lon: 30.0 }, { lat: 27.0, lon: 34.0 }, { lat: 12.0, lon: 44.0 }, { lat: 5.0, lon: 48.0 },
    { lat: -10.0, lon: 40.0 }, { lat: -26.0, lon: 33.0 }, { lat: -34.5, lon: 20.0 }, { lat: -22.0, lon: 14.0 },
    { lat: -5.0, lon: 12.0 }, { lat: 4.5, lon: 7.0 }, { lat: 5.0, lon: -5.0 }, { lat: 14.5, lon: -17.5 },
    { lat: 28.0, lon: -13.0 }, { lat: 35.8, lon: -5.8 }
  ],
  // Middle East & Arabian Peninsula
  [
    { lat: 31.0, lon: 35.0 }, { lat: 27.5, lon: 35.5 }, { lat: 13.0, lon: 45.0 }, { lat: 22.0, lon: 59.0 },
    { lat: 26.0, lon: 56.0 }, { lat: 29.0, lon: 48.0 }, { lat: 31.0, lon: 35.0 }
  ],
  // India & South Asia
  [
    { lat: 25.0, lon: 68.0 }, { lat: 18.0, lon: 73.0 }, { lat: 8.0, lon: 77.5 }, { lat: 13.0, lon: 80.0 },
    { lat: 21.0, lon: 88.0 }, { lat: 22.0, lon: 90.0 }
  ],
  // East Asia & Japan
  [
    { lat: 22.0, lon: 114.0 }, { lat: 30.0, lon: 122.0 }, { lat: 38.0, lon: 120.0 }, { lat: 40.0, lon: 128.0 }
  ],
  [
    { lat: 31.0, lon: 130.5 }, { lat: 35.0, lon: 136.0 }, { lat: 40.0, lon: 140.0 }, { lat: 44.0, lon: 144.0 }
  ],
  // Australia
  [
    { lat: -12.0, lon: 131.0 }, { lat: -15.0, lon: 145.0 }, { lat: -28.0, lon: 153.0 }, { lat: -38.0, lon: 145.0 },
    { lat: -35.0, lon: 117.0 }, { lat: -22.0, lon: 114.0 }, { lat: -12.0, lon: 131.0 }
  ]
];

interface RadarWorld3DProps {
  onClose: () => void;
  onOpenSimulatorWithPreset: (preset: 'short' | 'medium' | 'long') => void;
}

export function RadarWorld3D({ onClose, onOpenSimulatorWithPreset }: RadarWorld3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(6.2);
  const [zuluTime, setZuluTime] = useState('');

  const activeFlight = FLIGHT_CASES[activeIdx];

  // Camera & rotation refs for smooth damping
  const rotationRef = useRef({ x: 0.35, y: -0.5, targetX: 0.35, targetY: -0.5, velX: 0, velY: 0 });
  const isPointerDownRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Live Zulu Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      setZuluTime(`${h}:${m}:${s} ZULU`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const nextCard = useCallback(() => {
    soundEngine.playTick();
    setActiveIdx((prev) => (prev + 1) % FLIGHT_CASES.length);
  }, []);

  const prevCard = useCallback(() => {
    soundEngine.playTick();
    setActiveIdx((prev) => (prev - 1 + FLIGHT_CASES.length) % FLIGHT_CASES.length);
  }, []);

  useEffect(() => {
    soundEngine.playGlitch();
    soundEngine.playPing();
  }, []);

  // Set camera view preset
  const setViewPreset = (lat: number, lon: number, zoom: number) => {
    soundEngine.playClick();
    const targetY = -((lon + 180) * (Math.PI / 180)) + Math.PI / 2;
    const targetX = (lat * (Math.PI / 180)) * 0.7;

    rotationRef.current.targetY = targetY;
    rotationRef.current.targetX = targetX;
    setZoomLevel(zoom);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02060e, 0.07);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = zoomLevel;
    camera.position.y = 0.15;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeRadius = 2.0;

    // Helper: convert geographic coordinates to 3D sphere Vector3
    const geoToVector3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 1. Deep Oceanic Core Sphere
    const oceanGeo = new THREE.SphereGeometry(globeRadius * 0.995, 48, 48);
    const oceanMat = new THREE.MeshBasicMaterial({
      color: 0x020712,
    });
    const oceanSphere = new THREE.Mesh(oceanGeo, oceanMat);
    scene.add(oceanSphere);

    // 2. Realistic Earth Graticule (Parallels and Meridians)
    const graticuleGroup = new THREE.Group();
    scene.add(graticuleGroup);

    // Parallels (Equator, Tropics, Latitudes)
    const latitudes = [-66.5, -30, -23.5, 0, 23.5, 30, 66.5];
    latitudes.forEach((lat) => {
      const isEquator = lat === 0;
      const isTropic = Math.abs(lat) === 23.5;
      const rAtLat = Math.cos((lat * Math.PI) / 180) * globeRadius * 1.001;
      const yAtLat = Math.sin((lat * Math.PI) / 180) * globeRadius * 1.001;

      const ringGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * rAtLat, yAtLat, Math.sin(theta) * rAtLat));
      }
      ringGeo.setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({
        color: isEquator ? 0x43ddb0 : 0x1f364d,
        transparent: true,
        opacity: isEquator ? 0.7 : isTropic ? 0.35 : 0.2,
      });
      const parallelLine = new THREE.Line(ringGeo, ringMat);
      graticuleGroup.add(parallelLine);
    });

    // Meridians (every 30 degrees)
    for (let lon = -180; lon < 180; lon += 30) {
      const isPrime = lon === 0;
      const meridianGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(geoToVector3(lat, lon, globeRadius * 1.001));
      }
      meridianGeo.setFromPoints(points);
      const meridianMat = new THREE.LineBasicMaterial({
        color: isPrime ? 0x43ddb0 : 0x1f364d,
        transparent: true,
        opacity: isPrime ? 0.6 : 0.2,
      });
      const meridianLine = new THREE.Line(meridianGeo, meridianMat);
      graticuleGroup.add(meridianLine);
    }

    // 3. Detailed World Shoreline Vectors
    const coastlinesGroup = new THREE.Group();
    scene.add(coastlinesGroup);

    DETAILED_WORLD_COASTLINES.forEach((polygon) => {
      const pts = polygon.map((p) => geoToVector3(p.lat, p.lon, globeRadius * 1.003));
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x43ddb0,
        transparent: true,
        opacity: 0.85,
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      coastlinesGroup.add(lineMesh);
    });

    // 4. Ground Radar ATC Stations & Expanding Radio Waves
    const stationsGroup = new THREE.Group();
    scene.add(stationsGroup);

    const stationMarkers: THREE.Mesh[] = [];

    AIRPORT_HUBS.forEach((hub) => {
      const pos = geoToVector3(hub.lat, hub.lon, globeRadius * 1.006);

      // Station beacon dot
      const markerGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x43ddb0 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      stationsGroup.add(marker);
      stationMarkers.push(marker);

      // Tower stem
      const stemGeo = new THREE.BufferGeometry().setFromPoints([
        geoToVector3(hub.lat, hub.lon, globeRadius),
        geoToVector3(hub.lat, hub.lon, globeRadius * 1.05),
      ]);
      const stemMat = new THREE.LineBasicMaterial({ color: 0x43ddb0, transparent: true, opacity: 0.6 });
      const stem = new THREE.Line(stemGeo, stemMat);
      stationsGroup.add(stem);
    });

    // 5. Great-Circle Flight Arcs with Directional Aircraft Models
    const arcsGroup = new THREE.Group();
    scene.add(arcsGroup);

    interface PlaneModel {
      group: THREE.Group;
      curve: THREE.Curve<THREE.Vector3>;
      t: number;
      speed: number;
      trailPoints: THREE.Vector3[];
    }

    const activePlanes: PlaneModel[] = [];

    FLIGHT_CASES.forEach((flight, idx) => {
      const orig = flight.coords;
      const dest = flight.destCoords;

      const startV = geoToVector3(orig.lat, orig.lon, globeRadius);
      const endV = geoToVector3(dest.lat, dest.lon, globeRadius);

      const dist = startV.distanceTo(endV);
      const midElevation = globeRadius + Math.max(0.38, dist * 0.32);
      const midV = startV.clone().add(endV).multiplyScalar(0.5).normalize().multiplyScalar(midElevation);

      const curve = new THREE.QuadraticBezierCurve3(startV, midV, endV);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: idx === 1 ? 0xffb340 : 0x43ddb0,
        transparent: true,
        opacity: 0.85,
      });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      arcsGroup.add(arcLine);

      // Create Directional 3D Aircraft Model
      const planeGroup = new THREE.Group();

      // Fuselage
      const fuselageGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.09, 8);
      fuselageGeo.rotateX(Math.PI / 2);
      const fuselageMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
      planeGroup.add(fuselage);

      // Wings
      const wingGeo = new THREE.BufferGeometry();
      const wingPts = [
        new THREE.Vector3(0, 0, 0.01),
        new THREE.Vector3(-0.07, 0, -0.02),
        new THREE.Vector3(-0.065, 0, -0.035),
        new THREE.Vector3(0.065, 0, -0.035),
        new THREE.Vector3(0.07, 0, -0.02),
        new THREE.Vector3(0, 0, 0.01),
      ];
      wingGeo.setFromPoints(wingPts);
      const wingMat = new THREE.LineBasicMaterial({ color: 0xffffff });
      const wings = new THREE.Line(wingGeo, wingMat);
      planeGroup.add(wings);

      // Navigation Beacons: Red Port Wing (left), Green Starboard Wing (right)
      const beaconGeo = new THREE.SphereGeometry(0.01, 8, 8);
      const redMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
      const greenMat = new THREE.MeshBasicMaterial({ color: 0x22ff44 });

      const redBeacon = new THREE.Mesh(beaconGeo, redMat);
      redBeacon.position.set(-0.07, 0, -0.02);
      planeGroup.add(redBeacon);

      const greenBeacon = new THREE.Mesh(beaconGeo, greenMat);
      greenBeacon.position.set(0.07, 0, -0.02);
      planeGroup.add(greenBeacon);

      arcsGroup.add(planeGroup);

      activePlanes.push({
        group: planeGroup,
        curve,
        t: (idx * 0.22) % 1,
        speed: 0.0025 + (idx * 0.0006),
        trailPoints: [],
      });
    });

    // 6. Photorealistic Atmospheric Glow Halo (Fresnel Outer Ring)
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.15, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          gl_FragColor = vec4(0.26, 0.86, 0.69, 1.0) * intensity * 0.6;
        }
      `,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphere);

    // 7. Celestial Star Field Background
    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 20;
      starPositions[i + 1] = (Math.random() - 0.5) * 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.025,
      transparent: true,
      opacity: 0.5,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera zoom
      if (cameraRef.current) {
        cameraRef.current.position.z += (zoomLevel - cameraRef.current.position.z) * 0.08;
      }

      // Smooth camera interpolation towards targets
      if (!isPointerDownRef.current) {
        if (isRotating) {
          rotationRef.current.targetY += 0.0025;
        }
        rotationRef.current.y += (rotationRef.current.targetY - rotationRef.current.y) * 0.08;
        rotationRef.current.x += (rotationRef.current.targetX - rotationRef.current.x) * 0.08;
      }

      // Rotate entire globe assembly
      const ry = rotationRef.current.y;
      const rx = rotationRef.current.x;

      oceanSphere.rotation.y = ry;
      oceanSphere.rotation.x = rx;
      graticuleGroup.rotation.y = ry;
      graticuleGroup.rotation.x = rx;
      coastlinesGroup.rotation.y = ry;
      coastlinesGroup.rotation.x = rx;
      stationsGroup.rotation.y = ry;
      stationsGroup.rotation.x = rx;
      arcsGroup.rotation.y = ry;
      arcsGroup.rotation.x = rx;

      // Animate Ground Radar Beacons (pulse scale)
      stationMarkers.forEach((m, idx) => {
        const s = 1 + Math.sin(time * 3 + idx) * 0.25;
        m.scale.set(s, s, s);
      });

      // Animate 3D aircraft beacons along geodesics with realistic heading alignment
      activePlanes.forEach((p) => {
        p.t = (p.t + p.speed) % 1;
        const pt = p.curve.getPoint(p.t);
        const tangent = p.curve.getTangent(p.t).normalize();

        p.group.position.copy(pt);

        // Orient aircraft along trajectory tangent
        const lookTarget = pt.clone().add(tangent);
        p.group.lookAt(lookTarget);
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Pointer Drag Interaction with Smooth Damping
    const handlePointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true;
      startPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - startPointerRef.current.x;
      const dy = e.clientY - startPointerRef.current.y;
      startPointerRef.current = { x: e.clientX, y: e.clientY };

      rotationRef.current.targetY += dx * 0.005;
      rotationRef.current.targetX = Math.max(-1.2, Math.min(1.2, rotationRef.current.targetX + dy * 0.005));
    };

    const handlePointerUp = () => {
      isPointerDownRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomLevel((prev) => Math.max(3.8, Math.min(8.5, prev + e.deltaY * 0.004)));
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [zoomLevel, isRotating]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Environnement 3D Radar Spatial"
      className="fixed inset-0 z-50 bg-[#02050B] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
      />

      {/* Top Header Bar: Telemetry & Controls */}
      <header className="relative z-10 flex items-center justify-between p-6 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#43DDB0] animate-ping" />
            <span className="font-display italic text-sm text-white">Rights Radar</span>
            <span className="text-[10px] font-code text-[#43DDB0] border-l border-white/20 pl-2">
              GLOBE SPATIAL ADS-B 3D
            </span>
          </div>
        </div>

        {/* Tactical HUD Telemetry Header */}
        <div className="hidden md:flex items-center gap-4 text-[11px] font-code text-white/60 pointer-events-auto bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#43DDB0]" />
            <span>COUVERTURE : FIR EUROPE & ATLANTIQUE NORD</span>
          </div>
          <div>{zuluTime}</div>
          <div className="text-[#43DDB0]">ALTITUDES : FL280 - FL380</div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-code text-white transition active:scale-95"
          aria-label="Fermer l'espace radar 3D"
        >
          <span>Fermer le radar</span>
          <X className="w-4 h-4 text-[#43DDB0]" />
        </button>
      </header>

      {/* Floating Tactical Camera Control Palette (Right side) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 pointer-events-auto bg-black/70 p-2 rounded-2xl border border-white/15 backdrop-blur-md shadow-2xl">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(3.8, z - 0.7))}
          className="p-2 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition"
          title="Zoomer +"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(8.5, z + 0.7))}
          className="p-2 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition"
          title="Dézoomer -"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-white/15 my-1" />
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-xl transition ${isRotating ? 'text-[#43DDB0] bg-[#43DDB0]/15' : 'text-white/50 hover:bg-white/10'}`}
          title={isRotating ? 'Pause rotation' : 'Reprendre rotation'}
        >
          {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* Camera Preset Quick Pills (Top Center) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => setViewPreset(48.8, 2.3, 5.2)}
          className="px-3 py-1 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-[10px] font-code text-white/80 hover:text-white backdrop-blur-md transition"
        >
          Secteur Europe FIR
        </button>
        <button
          type="button"
          onClick={() => setViewPreset(45.0, -35.0, 6.5)}
          className="px-3 py-1 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-[10px] font-code text-white/80 hover:text-white backdrop-blur-md transition"
        >
          Corridor Transatlantique
        </button>
        <button
          type="button"
          onClick={() => setViewPreset(20.0, 0, 7.2)}
          className="px-3 py-1 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-[10px] font-code text-white/80 hover:text-white backdrop-blur-md transition"
        >
          Vue Globale
        </button>
      </div>

      {/* Main Bottom Tactical Flight Inspection Card */}
      <div className="relative z-10 max-w-xl w-full mx-auto px-4 pb-8 pointer-events-auto">
        <div className="bg-[#080E18]/95 border border-white/20 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl scanlines relative overflow-hidden">
          {/* Top card header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#43DDB0]" />
              <span className="font-code text-xs text-white font-bold tracking-wider">
                DOSSIER VOL {activeFlight.code} ({activeIdx + 1}/{FLIGHT_CASES.length})
              </span>
              <span className="text-[10px] font-code text-white/50">
                · {activeFlight.airline}
              </span>
            </div>

            <div className="text-[11px] font-code px-2.5 py-0.5 rounded-full bg-[#43DDB0]/15 border border-[#43DDB0]/40 text-[#43DDB0] font-bold">
              {activeFlight.amount} selon barème CE 261
            </div>
          </div>

          {/* Route & Details */}
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="font-display text-2xl text-white">
              {activeFlight.route}
            </h3>
            <span className="font-code text-xs text-amber-400 font-semibold">
              {activeFlight.delay}
            </span>
          </div>

          <div className="text-[11px] font-code text-[#43DDB0] mb-3">
            {activeFlight.lawArticle}
          </div>

          <p className="font-body text-xs text-white/70 leading-relaxed mb-5">
            {activeFlight.details}
          </p>

          {/* Carousel and Simulation Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevCard}
                className="p-2 rounded-full border border-white/20 hover:border-white text-white/70 hover:text-white transition active:scale-95"
                title="Vol précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextCard}
                className="p-2 rounded-full border border-white/20 hover:border-white text-white/70 hover:text-white transition active:scale-95"
                title="Vol suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-code text-white/40 ml-1">
                Faites glisser le globe pour orienter
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenSimulatorWithPreset(activeFlight.preset);
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-code text-xs font-bold transition active:scale-95 shadow-lg"
            >
              <span>Simuler ce vol</span>
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
