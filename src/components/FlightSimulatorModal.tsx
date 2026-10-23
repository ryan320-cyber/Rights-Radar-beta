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
import { X, Plane, Copy, Check, Save, Trash2, ShieldCheck, Search, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

interface FlightSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
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

export function FlightSimulatorModal({ isOpen, onClose, user }: FlightSimulatorModalProps) {
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

  // Calculate rights in real time
  const estimation: FlightEstimationResult = estimateFlightRights({
    distanceKm,
    delayHours,
    disruptionType,
    isIntraEU,
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

  const handleSaveToFirestore = async () => {
    if (!user) {
      alert('Veuillez vous connecter avec Google pour synchroniser vos analyses sur votre profil.');
      return;
    }
    setIsSaving(true);
    const path = 'inspections';
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        flightCode: flightCode.trim(),
        route: `${departure} → ${arrival}`,
        departureDate: flightDate,
        disruptionType,
        delayHours,
        estimatedAmount: estimation.estimatedAmountEuro,
        deadlineDate: '2031-09-15',
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

  const loadPreset = (preset: 'short' | 'medium' | 'long') => {
    setLiveSummary(null);
    setGroundingSources([]);
    if (preset === 'short') {
      setFlightCode('AF 1234');
      setDeparture('Paris-CDG');
      setArrival('Nice-NCE');
      setDistanceKm(700);
      setDelayHours(3.5);
      setIsIntraEU(true);
      setAirlineName('Air France');
    } else if (preset === 'medium') {
      setFlightCode('IB 3401');
      setDeparture('Paris-ORY');
      setArrival('Madrid-MAD');
      setDistanceKm(1050);
      setDelayHours(4);
      setIsIntraEU(true);
      setAirlineName('Iberia');
    } else {
      setFlightCode('DL 0890');
      setDeparture('New York-JFK');
      setArrival('Paris-CDG');
      setDistanceKm(5840);
      setDelayHours(4.5);
      setIsIntraEU(false);
      setAirlineName('Delta Air Lines');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Simulateur d’estimation de vol"
      className="fixed inset-0 z-50 bg-[#101722]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#151F2E] border border-white/10 text-[#F6F5F1] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#43DDB0]/20 text-[#43DDB0] flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-[#F6F5F1]">
                Simulateur de vol & Préparation de courrier
              </h2>
              <span className="font-code text-xs text-white/50">
                Barème officiel CE 261/2004 • Ancrage Google Search en direct
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

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-code text-white/60 mr-2">Exemples types :</span>
          <button
            type="button"
            onClick={() => loadPreset('short')}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs font-code text-white/80 border border-white/10"
          >
            Court-courrier (&le; 1 500 km • ~250 €)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('medium')}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs font-code text-white/80 border border-white/10"
          >
            Moyen-courrier intra-UE (~400 €)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('long')}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs font-code text-white/80 border border-white/10"
          >
            Long-courrier (&gt; 3 500 km • ~600 €)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          {/* Flight Input Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-code text-white/70 mb-1">Vol</label>
                <input
                  type="text"
                  value={flightCode}
                  onChange={(e) => setFlightCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F17] border border-white/15 text-xs font-code"
                />
              </div>
              <div>
                <label className="block text-xs font-code text-white/70 mb-1">Date</label>
                <input
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F17] border border-white/15 text-xs font-code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-code text-white/70 mb-1">Départ</label>
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F17] border border-white/15 text-xs font-code"
                />
              </div>
              <div>
                <label className="block text-xs font-code text-white/70 mb-1">Arrivée</label>
                <input
                  type="text"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F17] border border-white/15 text-xs font-code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-code text-white/70 mb-1">
                  Distance estimée ({distanceKm} km)
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
                  className="w-full accent-[#E7A63A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-code text-white/70 mb-1">Compagnie aérienne</label>
              <input
                type="text"
                value={airlineName}
                onChange={(e) => setAirlineName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0F17] border border-white/15 text-xs font-code"
              />
            </div>

            {/* Google Search Live Verification Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleVerifyFlightSearch}
                disabled={isSearchingLive}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-[#43DDB0]/40 text-xs font-code text-[#43DDB0] transition focus:outline-none focus:ring-2 focus:ring-[#43DDB0]"
              >
                {isSearchingLive ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#43DDB0]" />
                    <span>Recherche des bulletins officiels et incidents en direct...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Vérifier les incidents en direct (Google Search Grounding)</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Google Search Result Box */}
            {liveSummary && (
              <div className="p-4 rounded-2xl bg-[#0E1520] border border-[#43DDB0]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-code text-[#43DDB0] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Rapport en direct (Google Search)
                  </span>
                  <span
                    className={`text-[10px] font-code px-2 py-0.5 rounded ${
                      disruptionAssessment === 'extraordinary_circumstance'
                        ? 'bg-[#E7A63A]/20 text-[#E7A63A] border border-[#E7A63A]/40'
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

                {/* Clickable Source Badges */}
                <SearchGroundingBadges sources={groundingSources} />
              </div>
            )}

            {searchError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-body">
                {searchError}
              </div>
            )}

            {/* Estimation Summary Box */}
            <div className="p-4 rounded-2xl bg-[#0E1520] border border-white/10 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-code text-white/70">Montant indicatif estimé :</span>
                <span className="font-display italic text-3xl text-[#43DDB0]">
                  {estimation.estimatedAmountEuro} €
                </span>
              </div>
              <div className="text-[11px] font-body text-white/60 leading-snug">
                {estimation.qualificationText}
              </div>
              <div className="text-[10px] font-code text-white/40 pt-1 border-t border-white/10">
                Fondement : {estimation.legalBasis} • Prescription légale : ~{estimation.prescriptionYears} ans
              </div>
            </div>
          </div>

          {/* Letter Draft Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-code text-xs text-white/80">Courrier généré (prêt à relire)</span>
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
              rows={12}
              className="w-full p-3.5 rounded-xl bg-[#0A0F17] border border-white/10 font-mono text-[11px] text-white/80 leading-relaxed focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={handleSaveToFirestore}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#43DDB0] hover:bg-[#38C69D] text-[#101722] text-xs font-code font-semibold transition"
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
          </div>
        </div>

        {/* User's Persisted Flights in Firestore */}
        {user && savedInspections.length > 0 && (
          <div className="pt-6 border-t border-white/10">
            <h3 className="font-display text-xl text-[#F6F5F1] mb-3">
              Vos vols enregistrés dans votre radar personnel (Firestore)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {savedInspections.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-code"
                >
                  <div>
                    <div className="font-semibold text-[#43DDB0]">{item.flightCode}</div>
                    <div className="text-white/70">{item.route}</div>
                    <div className="text-[11px] text-white/40">~{item.estimatedAmount} € estimé</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(item.id)}
                    title="Supprimer cette analyse"
                    className="p-1.5 hover:text-red-400 text-white/40 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-xs font-body text-white/50 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#43DDB0] shrink-0" />
          <span>
            Rights Radar ne transmet aucun courrier à votre place. Vous conservez la pleine maîtrise de l'envoi de votre réclamation.
          </span>
        </div>
      </div>
    </div>
  );
}
