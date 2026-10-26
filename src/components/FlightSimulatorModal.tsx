import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import {
  estimateFlightRights,
  generateClaimLetterTemplate,
  DisruptionType,
  FlightEstimationResult,
} from '../utils/rightsCalculator.ts';
import { SearchGroundingBadges, GroundingSource } from './SearchGroundingBadges.tsx';
import {
  X,
  Plane,
  Copy,
  Check,
  Save,
  Trash2,
  ShieldCheck,
  Search,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  Sliders,
  ShieldAlert,
  Euro,
} from 'lucide-react';

interface FlightSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  initialPreset?: 'short' | 'medium' | 'long' | null;
}

interface SavedInspection {
  id: string;
  flightCode: string;
  route: string;
  delayHours: number;
  estimatedAmount: number;
  deadlineDate?: string;
  notes?: string;
}

export function FlightSimulatorModal({ isOpen, onClose, user, initialPreset }: FlightSimulatorModalProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  const [flightCode, setFlightCode] = useState('AF 1234');
  const [departure, setDeparture] = useState('Paris-CDG');
  const [arrival, setArrival] = useState('Nice-NCE');
  const [distanceKm, setDistanceKm] = useState(700);
  const [delayHours, setDelayHours] = useState(3.5);
  const [disruptionType, setDisruptionType] = useState<DisruptionType>('delay');
  const [isIntraEU, setIsIntraEU] = useState(true);
  const [passengerName, setPassengerName] = useState(user?.displayName || '');
  const [bookingRef, setBookingRef] = useState('PNR-7890');
  const [airlineName, setAirlineName] = useState('Air France');
  const [flightDate, setFlightDate] = useState('2026-09-15');

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedInspections, setSavedInspections] = useState<SavedInspection[]>([]);

  // Search Grounding Live Verification States
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSummary, setLiveSummary] = useState<string | null>(null);
  const [disruptionAssessment, setDisruptionAssessment] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Calculate rights in real time with comprehensive EC 261/2004 scope engine
  const estimation: FlightEstimationResult = estimateFlightRights({
    distanceKm,
    delayHours,
    disruptionType,
    departureAirport: departure,
    arrivalAirport: arrival,
    isIntraEU,
    operatingCarrier: airlineName,
    flightDate,
    jurisdictionCountry: 'FR',
  });

  const letterText = generateClaimLetterTemplate({
    passengerName,
    bookingRef,
    flightCode,
    departureAirport: departure,
    arrivalAirport: arrival,
    flightDate,
    delayHours,
    estimatedAmount: estimation.estimatedAmountEuro,
    airlineName,
    disruptionType,
    isNeutralInquiry: !estimation.isPotentiallyEligible,
  });

  // Load user's saved flight inspections if authenticated
  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchInspections = async () => {
      const path = 'inspections';
      try {
        const q = query(collection(db, path), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const list: SavedInspection[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            flightCode: data.flightCode || 'Vol',
            route: data.route || 'Trajet',
            delayHours: data.delayHours || 0,
            estimatedAmount: data.estimatedAmount || 0,
            deadlineDate: data.deadlineDate,
            notes: data.notes,
          });
        });
        setSavedInspections(list);
      } catch (err) {
        console.warn('Could not load saved inspections:', err);
      }
    };

    fetchInspections();
  }, [user, isOpen, saveSuccess]);

  const handleVerifyFlightSearch = async () => {
    setIsSearchingLive(true);
    setSearchError(null);
    setLiveSummary(null);
    setGroundingSources([]);

    try {
      const res = await fetch('/api/verify-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightCode,
          flightDate,
          departure,
          arrival,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la vérification de vol.');
      }

      const data = await res.json();
      setLiveSummary(data.summary || 'Vérification effectuée.');
      setDisruptionAssessment(data.disruptionAssessment || 'potentially_compensable');
      setGroundingSources(data.groundingSources || []);
    } catch (err: any) {
      console.warn('[FlightSimulatorModal] Info vérification:', err?.message || err);
      setSearchError('Impossible d’interroger Google Search pour le moment. Veuillez réessayer.');
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleCopyLetter = async () => {
    try {
      await navigator.clipboard.writeText(letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  const calculateDeadline = (): string => {
    if (!estimation.prescriptionYears || !flightDate) {
      return 'Délai à vérifier selon la juridiction compétente';
    }
    try {
      const d = new Date(flightDate);
      if (isNaN(d.getTime())) return 'Date de vol à vérifier';
      d.setFullYear(d.getFullYear() + estimation.prescriptionYears);
      return d.toISOString().split('T')[0];
    } catch {
      return 'Délai à vérifier';
    }
  };

  const handleSaveToFirestore = async () => {
    if (!user) {
      alert('Veuillez vous connecter avec Google pour synchroniser vos analyses sur votre profil.');
      return;
    }
    setIsSaving(true);
    const path = 'inspections';
    const deadlineStr = calculateDeadline();
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        flightCode: flightCode.trim(),
        route: `${departure} → ${arrival}`,
        departureDate: flightDate,
        disruptionType,
        delayHours,
        estimatedAmount: estimation.estimatedAmountEuro,
        deadlineDate: deadlineStr,
        notes: liveSummary
          ? `Google Search Grounding : ${liveSummary.slice(0, 300)}`
          : `Simulation locale : ${estimation.qualificationText}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.warn('[FlightSimulatorModal] Info sauvegarde Firestore:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, path);
      } catch (e) {
        alert('Erreur lors de l’enregistrement. Veuillez vérifier votre connexion.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    const path = 'inspections';
    try {
      await deleteDoc(doc(db, path, id));
      setSavedInspections((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.warn('[FlightSimulatorModal] Info suppression Firestore:', err);
    }
  };

  const loadPreset = (preset: 'short' | 'medium' | 'long' | 'out_of_scope') => {
    setLiveSummary(null);
    setGroundingSources([]);
    if (preset === 'short') {
      // Short-haul qualifying flight (<= 1500 km -> 250 €)
      setFlightCode('AF 1234');
      setDeparture('Paris-CDG');
      setArrival('Nice-NCE');
      setDistanceKm(700);
      setDelayHours(3.5);
      setIsIntraEU(true);
      setAirlineName('Air France');
    } else if (preset === 'medium') {
      // Medium-haul qualifying intra-EU flight (> 1500 km -> 400 €)
      setFlightCode('AF 1832');
      setDeparture('Paris-CDG');
      setArrival('Athènes-ATH');
      setDistanceKm(2100);
      setDelayHours(4);
      setIsIntraEU(true);
      setAirlineName('Air France');
    } else if (preset === 'long') {
      // Long-haul qualifying flight (> 3500 km, departing EU -> 600 €)
      setFlightCode('AF 0022');
      setDeparture('Paris-CDG');
      setArrival('New York-JFK');
      setDistanceKm(5840);
      setDelayHours(4.5);
      setIsIntraEU(false);
      setAirlineName('Air France');
    } else {
      // Extra-EU arriving flight on non-EU carrier -> OUT OF SCOPE (0 €) under Art. 3.1.b
      setFlightCode('DL 0890');
      setDeparture('New York-JFK');
      setArrival('Paris-CDG');
      setDistanceKm(5840);
      setDelayHours(4.5);
      setIsIntraEU(false);
      setAirlineName('Delta Air Lines');
    }
  };

  useEffect(() => {
    if (isOpen && initialPreset) {
      loadPreset(initialPreset);
    }
  }, [isOpen, initialPreset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Simulateur d’estimation de vol"
      className="fixed inset-0 z-50 bg-[#03070D]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Liquid Glass Glow Backing */}
      <div className="absolute w-[600px] h-[400px] bg-gradient-to-tr from-[#43DDB0]/15 via-[#0055ff]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Main Glass Container */}
      <div className="relative bg-[#080E18]/85 border border-white/20 text-[#F4F4F6] rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(67,221,176,0.12)] my-auto max-h-[92vh] overflow-y-auto backdrop-blur-2xl scanlines flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#43DDB0]/20 text-[#43DDB0] border border-[#43DDB0]/30 flex items-center justify-center shadow-[0_0_15px_rgba(67,221,176,0.3)]">
                <Plane className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-display text-xl sm:text-2xl text-white">
                  Simulateur de vol CE 261
                </h2>
                <span className="font-code text-xs text-white/50">
                  Calculateur de droits & vérification d'incident en direct
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la simulation"
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mini-Page Liquid Step Bar */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 text-xs font-code">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeStep === 1
                  ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1. Vol & Trajet</span>
              <span className="sm:hidden">1. Vol</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeStep === 2
                  ? 'bg-[#43DDB0] text-black font-semibold shadow-[0_0_15px_rgba(67,221,176,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2. Incident Live</span>
              <span className="sm:hidden">2. Incident</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeStep === 3
                  ? 'bg-[#FFB340] text-black font-semibold shadow-[0_0_15px_rgba(255,179,64,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Euro className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3. Estimation</span>
              <span className="sm:hidden">3. Calcul</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeStep === 4
                  ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">4. Courrier</span>
              <span className="sm:hidden">4. Lettre</span>
            </button>
          </div>
        </div>

        {/* STEP CONTENT PAGES */}
        <div className="min-h-[300px] flex flex-col justify-between my-2">
          
          {/* PAGE 1: Flight & Route Inputs */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-code text-white/50">Préréglages :</span>
                <button
                  type="button"
                  onClick={() => loadPreset('short')}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs font-code text-white/80 border border-white/15 transition"
                >
                  Court-courrier (250 €)
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('medium')}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs font-code text-white/80 border border-white/15 transition"
                >
                  Moyen-courrier (400 €)
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('long')}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs font-code text-white/80 border border-white/15 transition"
                >
                  Long-courrier (600 €)
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('out_of_scope')}
                  className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-xs font-code text-amber-300 border border-amber-500/30 transition"
                  title="Test : vol au départ d'un pays tiers sur transporteur non-UE"
                >
                  Hors champ UE (0 €)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-code text-white/70 mb-1">Numéro de vol</label>
                  <input
                    type="text"
                    value={flightCode}
                    onChange={(e) => setFlightCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#03070D] border border-white/15 text-xs font-code focus:border-[#43DDB0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-code text-white/70 mb-1">Date du vol</label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#03070D] border border-white/15 text-xs font-code focus:border-[#43DDB0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-code text-white/70 mb-1">Aéroport de départ</label>
                  <input
                    type="text"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#03070D] border border-white/15 text-xs font-code focus:border-[#43DDB0] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-code text-white/70 mb-1">Aéroport d'arrivée</label>
                  <input
                    type="text"
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#03070D] border border-white/15 text-xs font-code focus:border-[#43DDB0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-code text-white/70 mb-1">
                    Distance du trajet ({distanceKm} km)
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="10000"
                    step="100"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full accent-[#43DDB0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-code text-white/70 mb-1">
                    Retard à l'arrivée ({delayHours} h)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={delayHours}
                    onChange={(e) => setDelayHours(Number(e.target.value))}
                    className="w-full accent-[#FFB340]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-code text-white/70 mb-1">Compagnie aérienne</label>
                <input
                  type="text"
                  value={airlineName}
                  onChange={(e) => setAirlineName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#03070D] border border-white/15 text-xs font-code focus:border-[#43DDB0] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* PAGE 2: Live Search Grounding */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <p className="text-xs font-body text-white/70 leading-relaxed">
                  Interrogez en direct les bulletins officiels et incidents aériens de <strong className="text-white">{flightCode}</strong> ({departure} → {arrival}) pour vérifier la présence d'incidents météo ou de contrôle aérien.
                </p>

                <button
                  type="button"
                  onClick={handleVerifyFlightSearch}
                  disabled={isSearchingLive}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#43DDB0]/15 hover:bg-[#43DDB0]/25 border border-[#43DDB0]/40 text-xs font-code text-[#43DDB0] font-semibold transition active:scale-98 shadow-[0_0_20px_rgba(67,221,176,0.15)]"
                >
                  {isSearchingLive ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#43DDB0]" />
                      <span>Recherche des bulletins officiels...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Lancer la recherche d'incidents (Google Search Grounding)</span>
                    </>
                  )}
                </button>
              </div>

              {liveSummary && (
                <div className="p-4 rounded-2xl bg-[#0E1520] border border-[#43DDB0]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-code text-[#43DDB0] font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Rapport d'incident certifié
                    </span>
                    <span
                      className={`text-[10px] font-code px-2 py-0.5 rounded ${
                        disruptionAssessment === 'extraordinary_circumstance'
                          ? 'bg-[#FFB340]/20 text-[#FFB340] border border-[#FFB340]/40'
                          : 'bg-[#43DDB0]/20 text-[#43DDB0] border border-[#43DDB0]/40'
                      }`}
                    >
                      {disruptionAssessment === 'extraordinary_circumstance'
                        ? 'Circonstance extraordinaire probable'
                        : 'Retard a priori indemnisable'}
                    </span>
                  </div>
                  <p className="font-body text-xs text-white/85 leading-relaxed">
                    {liveSummary}
                  </p>
                  <SearchGroundingBadges sources={groundingSources} />
                </div>
              )}

              {searchError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-body">
                  {searchError}
                </div>
              )}
            </div>
          )}

          {/* PAGE 3: CE 261 Estimation */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-[#0E1520] border border-[#43DDB0]/30 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-code text-white/70 block mb-1">Montant indicatif estimé :</span>
                    <span className="font-display italic text-4xl text-[#43DDB0]">
                      {estimation.estimatedAmountEuro} €
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-code px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      estimation.eligibilityStatus === 'potentially_eligible'
                        ? 'bg-[#35D9AE]/15 text-[#35D9AE] border border-[#35D9AE]/30'
                        : estimation.eligibilityStatus === 'not_eligible'
                        ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {estimation.eligibilityStatus === 'potentially_eligible'
                      ? 'Éligible a priori'
                      : estimation.eligibilityStatus === 'not_eligible'
                      ? 'Non éligible'
                      : 'Vérification requise'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] font-code text-[#43DDB0] block font-medium">Motif de l'évaluation :</span>
                  <p className="text-xs font-body text-white/85 leading-relaxed">
                    {estimation.reason}
                  </p>
                </div>

                <div className="text-[11px] font-code text-white/60 pt-2 border-t border-white/10 space-y-1.5">
                  <div><span className="text-white/40">Régime applicable :</span> {estimation.scopeRegime}</div>
                  <div><span className="text-white/40">Fondement légal :</span> {estimation.legalBasis}</div>
                  <div>
                    <span className="text-white/40">Prescription :</span>{' '}
                    {estimation.prescriptionYears !== null
                      ? `~${estimation.prescriptionYears} ans (${estimation.prescriptionBasis})`
                      : estimation.prescriptionBasis}
                  </div>
                  <div><span className="text-white/40">Barème distance :</span> {estimation.distanceCategory} ({distanceKm} km)</div>
                </div>

                {estimation.officialSources && estimation.officialSources.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] font-code text-white/40 uppercase tracking-wider block mb-2">Sources officielles :</span>
                    <div className="flex flex-wrap gap-2">
                      {estimation.officialSources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-code px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#43DDB0] border border-white/10 transition inline-block"
                        >
                          {src.title} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAGE 4: Claim Letter & Saved Flights */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-code text-xs text-white/80">Courrier de réclamation généré</span>
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-code text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#43DDB0]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier la lettre'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={letterText}
                rows={7}
                className="w-full p-3.5 rounded-xl bg-[#03070D] border border-white/15 font-mono text-[11px] text-white/80 leading-relaxed focus:outline-none resize-none"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSaveToFirestore}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#43DDB0] hover:bg-[#38C69D] text-[#101722] text-xs font-code font-semibold transition active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveSuccess ? 'Enregistré dans Firestore !' : isSaving ? 'Enregistrement...' : 'Enregistrer sur mon compte'}</span>
                  </button>
                ) : (
                  <div className="text-xs font-body text-white/50">
                    Connectez-vous avec Google pour sauvegarder vos vols scannés.
                  </div>
                )}
              </div>

              {/* User Saved Inspections */}
              {user && savedInspections.length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <span className="font-code text-xs text-white/70 block mb-2">Vols enregistrés sur votre compte :</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedInspections.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-code"
                      >
                        <div>
                          <div className="font-semibold text-[#43DDB0]">{item.flightCode}</div>
                          <div className="text-white/60 text-[10px]">{item.route}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSaved(item.id)}
                          title="Supprimer"
                          className="p-1 hover:text-red-400 text-white/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Navigation Controls */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4)}
            disabled={activeStep === 1}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-code transition border ${
              activeStep === 1
                ? 'opacity-30 border-transparent cursor-not-allowed text-white/30'
                : 'bg-white/5 hover:bg-white/15 border-white/20 text-white active:scale-95'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Précédent</span>
          </button>

          <span className="text-xs font-code text-white/40">
            Page {activeStep} / 4
          </span>

          {activeStep < 4 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => Math.min(4, prev + 1) as 1 | 2 | 3 | 4)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-code font-semibold transition active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <span>Suivant</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-[#43DDB0] hover:bg-[#38C69D] text-[#101722] text-xs font-code font-semibold transition active:scale-95"
            >
              Terminer
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
