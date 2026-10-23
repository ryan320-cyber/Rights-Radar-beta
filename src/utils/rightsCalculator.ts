/**
 * Core estimation and validation logic for Rights Radar.
 * All amounts and regimes are strictly estimates under Regulation (EC) No 261/2004
 * or applicable national prescription periods.
 */

export type DisruptionType = 'delay' | 'cancellation' | 'denied_boarding';

export interface FlightEstimationInput {
  distanceKm: number;
  isIntraEU?: boolean;
  delayHours: number;
  disruptionType: DisruptionType;
  jurisdictionCountry?: string; // 'FR' | 'DE' | 'UK' | 'ES' etc.
  flightDate?: string; // YYYY-MM-DD
}

export interface FlightEstimationResult {
  isPotentiallyEligible: boolean;
  estimatedAmountEuro: number;
  tier: 'short' | 'medium' | 'long' | 'none';
  distanceCategory: string;
  prescriptionYears: number;
  qualificationText: string;
  legalBasis: string;
}

export function estimateFlightRights(input: FlightEstimationInput): FlightEstimationResult {
  const { distanceKm, isIntraEU = true, delayHours, disruptionType, jurisdictionCountry = 'FR' } = input;

  // Prescription periods
  const prescriptionMap: Record<string, number> = {
    FR: 5,
    UK: 6,
    DE: 3,
    ES: 5,
    IT: 2,
    BE: 1,
  };
  const prescriptionYears = prescriptionMap[jurisdictionCountry.toUpperCase()] || 5;

  // Delay eligibility requires at least 3 hours at final arrival
  if (disruptionType === 'delay' && delayHours < 3) {
    return {
      isPotentiallyEligible: false,
      estimatedAmountEuro: 0,
      tier: 'none',
      distanceCategory: 'Retard inférieur à 3 heures',
      prescriptionYears,
      qualificationText: 'Estimation : Aucun droit indemnitaire standard prévu pour les retards de moins de 3 heures.',
      legalBasis: 'Règlement (CE) n° 261/2004, Arrêt Sturgeon (CJUE)',
    };
  }

  // Bracket 1: <= 1500 km -> 250 €
  if (distanceKm <= 1500) {
    return {
      isPotentiallyEligible: true,
      estimatedAmountEuro: 250,
      tier: 'short',
      distanceCategory: 'Vol jusqu’à 1 500 km',
      prescriptionYears,
      qualificationText: 'Montant possible estimé : 250 € par passager (sous réserve de vérification des circonstances extraordinaires).',
      legalBasis: 'Règlement (CE) n° 261/2004, Art. 7 § 1 (a)',
    };
  }

  // Bracket 2: Intra-EU > 1500 km OR any flight 1500 to 3500 km -> 400 €
  if (isIntraEU || (distanceKm > 1500 && distanceKm <= 3500)) {
    return {
      isPotentiallyEligible: true,
      estimatedAmountEuro: 400,
      tier: 'medium',
      distanceCategory: isIntraEU ? 'Vol intracommunautaire de plus de 1 500 km' : 'Vol de 1 500 à 3 500 km',
      prescriptionYears,
      qualificationText: 'Montant possible estimé : 400 € par passager (sous réserve de vérification des circonstances extraordinaires).',
      legalBasis: 'Règlement (CE) n° 261/2004, Art. 7 § 1 (b)',
    };
  }

  // Bracket 3: Extra-EU > 3500 km
  // If delay is between 3h and 4h, compensation may be reduced by 50% (300 €)
  const amount = delayHours >= 4 || disruptionType !== 'delay' ? 600 : 300;
  return {
    isPotentiallyEligible: true,
    estimatedAmountEuro: amount,
    tier: 'long',
    distanceCategory: 'Vol extracommunautaire de plus de 3 500 km',
    prescriptionYears,
    qualificationText: `Montant possible estimé : ${amount} € par passager (${delayHours < 4 ? 'réduction de 50 % applicable entre 3h et 4h de retard' : 'taux plein pour retard ≥ 4h'}).`,
    legalBasis: 'Règlement (CE) n° 261/2004, Art. 7 § 1 (c) & Art. 7 § 2 (c)',
  };
}

export function validateWaitlistInput(email: string, usageFrequency: string | null): { isValid: boolean; error?: string } {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { isValid: false, error: 'Veuillez saisir votre adresse email.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Veuillez saisir une adresse email valide (ex. nom@domaine.fr).' };
  }
  if (!usageFrequency) {
    return { isValid: false, error: 'Veuillez sélectionner votre fréquence d’usage envisagée.' };
  }
  return { isValid: true };
}

export function generateClaimLetterTemplate(params: {
  passengerName: string;
  bookingRef: string;
  flightCode: string;
  departureAirport: string;
  arrivalAirport: string;
  flightDate: string;
  delayHours: number;
  estimatedAmount: number;
  airlineName: string;
}): string {
  const {
    passengerName,
    bookingRef,
    flightCode,
    departureAirport,
    arrivalAirport,
    flightDate,
    delayHours,
    estimatedAmount,
    airlineName,
  } = params;

  return `À l'attention du Service Réclamations de ${airlineName || 'la compagnie aérienne'}

Objet : Demande d'indemnisation — Vol ${flightCode} du ${flightDate} (Réf. dossier : ${bookingRef || 'À compléter'})
Fondement : Règlement européen (CE) n° 261/2004

Madame, Monsieur,

Je vous contacte en qualité de passager du vol ${flightCode} reliant ${departureAirport} à ${arrivalAirport}, initialement prévu le ${flightDate}.

Ce vol a subi une perturbation majeure se traduisant par une arrivée effective avec un retard supérieur à ${delayHours} heures par rapport à l'horaire contractuel.

Conformément à la jurisprudence constante de la Cour de Justice de l'Union européenne (arrêts Sturgeon C-402/07 et Nelson C-581/10) interprétant les articles 5, 6 et 7 du Règlement (CE) n° 261/2004, les passagers de vols retardés de trois heures ou plus disposent d'un droit à indemnisation forfaitaire.

Pour ce trajet dont la distance correspond aux barèmes de l'article 7, l'indemnité forfaitaire prévue s'élève à ${estimatedAmount} € par passager.

Je vous remercie de bien vouloir procéder au versement de cette somme de ${estimatedAmount} € par virement bancaire dans un délai de 14 jours ouvrés.

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${passengerName || '[Prénom et Nom du passager]'}
`;
}
