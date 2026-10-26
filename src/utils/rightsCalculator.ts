/**
 * Core legal estimation and validation engine for Rights Radar.
 * Strictly adheres to Regulation (EC) No 261/2004, relevant Court of Justice
 * of the European Union (CJEU) jurisprudence, and official European Commission guidelines.
 */

export type DisruptionType = 'delay' | 'cancellation' | 'denied_boarding';

export type EligibilityStatus =
  | 'potentially_eligible'
  | 'not_eligible'
  | 'insufficient_information'
  | 'requires_human_review';

export type ScopeRegime = 'EU261' | 'UK261' | 'OUT_OF_SCOPE' | 'UNKNOWN';

export interface OfficialLegalSource {
  title: string;
  url: string;
  reference: string;
}

export interface FlightEstimationInput {
  distanceKm: number;
  delayHours?: number; // Arrival delay at final destination in hours
  disruptionType: DisruptionType;
  departureAirport?: string;
  departureCountry?: string; // ISO 2-letter, e.g. 'FR', 'US'
  isDepartureInEU?: boolean;
  arrivalAirport?: string;
  arrivalCountry?: string; // ISO 2-letter, e.g. 'FR', 'US'
  isArrivalInEU?: boolean;
  operatingCarrier?: string;
  isCarrierEU?: boolean;
  isIntraEU?: boolean;
  cancellationNoticeDays?: number; // For cancellations: days before departure
  offeredReroute?: boolean;
  isDeniedBoardingInvoluntary?: boolean;
  passengerPresentedOnTime?: boolean;
  jurisdictionCountry?: string; // 'FR' | 'DE' | 'UK' | 'ES' | 'IT' | 'BE'
  flightDate?: string; // YYYY-MM-DD
}

export interface FlightEstimationResult {
  eligibilityStatus: EligibilityStatus;
  isPotentiallyEligible: boolean; // Backwards compatible boolean
  estimatedAmountEuro: number;
  tier: 'short' | 'medium' | 'long' | 'none';
  distanceCategory: string;
  scopeRegime: ScopeRegime;
  prescriptionYears: number | null;
  prescriptionBasis: string;
  qualificationText: string;
  legalBasis: string;
  reason: string;
  officialSources: OfficialLegalSource[];
  isPreliminary: boolean;
}

// Verified EU/EEA Member State ISO codes (Treaty application under EC 261/2004 Art. 3)
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA & Switzerland treated equivalently under bilateral agreements
  'IS', 'NO', 'CH'
]);

// Verified Community carriers (EU airlines)
const EU_AIRLINE_SUBSTRINGS = [
  'air france', 'lufthansa', 'iberia', 'klm', 'transavia', 'ryanair',
  'easyjet', 'tap air portugal', 'vueling', 'ita airways', 'alitalia',
  'austrian', 'swiss', 'brussels airlines', 'sas', 'finnair', 'wizz air',
  'aer lingus', 'lot polish', 'volotea', 'corsair'
];

// Verified statutory prescription periods under national legislation
const PRESCRIPTION_MAP: Record<string, { years: number; legalBasis: string }> = {
  FR: { years: 5, legalBasis: 'Code de commerce art. L110-4 ; CJUE C-139/11 Moré (prescription quinquennale commerciale)' },
  DE: { years: 3, legalBasis: 'BGB §195 & §199 (prescription triennale civile à la fin de l’année civile)' },
  ES: { years: 5, legalBasis: 'Código Civil art. 1964 réformé par la loi 42/2015' },
  IT: { years: 2, legalBasis: 'Codice della Navigazione art. 949-ter (délai biennal)' },
  BE: { years: 1, legalBasis: 'Loi du 25 août 1891 art. 9 sur le contrat de transport' },
  UK: { years: 6, legalBasis: 'Limitation Act 1980 s. 9 ; Dawson v Thomson Airways [2014] EWCA Civ 845' },
};

const STANDARD_SOURCES: OfficialLegalSource[] = [
  {
    title: 'Règlement (CE) n° 261/2004 consolidé (EUR-Lex)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=celex%3A32004R0261',
    reference: 'Articles 3, 4, 5, 6 et 7',
  },
  {
    title: 'Commission européenne — Droits des passagers aériens',
    url: 'https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_fr.htm',
    reference: 'Portail officiel Your Europe',
  },
  {
    title: 'CJUE — Arrêts Sturgeon (C-402/07) et Nelson (C-581/10)',
    url: 'https://curia.europa.eu',
    reference: 'Droit à indemnisation dès 3 heures de retard à destination finale',
  },
];

export function determineGeographicScope(input: {
  departureCountry?: string;
  isDepartureInEU?: boolean;
  arrivalCountry?: string;
  isArrivalInEU?: boolean;
  operatingCarrier?: string;
  isCarrierEU?: boolean;
  isIntraEU?: boolean;
}): { regime: ScopeRegime; reason: string } {
  const {
    departureCountry,
    isDepartureInEU,
    arrivalCountry,
    isArrivalInEU,
    operatingCarrier,
    isCarrierEU,
    isIntraEU,
  } = input;

  const depEU = isDepartureInEU ?? (departureCountry ? EU_COUNTRIES.has(departureCountry.toUpperCase()) : undefined);
  const arrEU = isArrivalInEU ?? (arrivalCountry ? EU_COUNTRIES.has(arrivalCountry.toUpperCase()) : undefined);

  // If carrier EU status is explicitly supplied or inferable from airline name
  let carrierEU = isCarrierEU;
  if (carrierEU === undefined && operatingCarrier) {
    const lower = operatingCarrier.toLowerCase();
    carrierEU = EU_AIRLINE_SUBSTRINGS.some((sub) => lower.includes(sub));
  }

  // 1. Departures from EU/EEA airports: covered REGARDLESS of airline nationality (Art. 3.1.a)
  if (depEU === true) {
    return {
      regime: 'EU261',
      reason: 'Départ depuis un aéroport situé dans l’UE/EEE : le Règlement (CE) n° 261/2004 s’applique quel que soit le transporteur.',
    };
  }

  // 2. Intra-EU shortcut when flags set
  if (isIntraEU === true) {
    return {
      regime: 'EU261',
      reason: 'Vol intracommunautaire : soumis au Règlement (CE) n° 261/2004.',
    };
  }

  // 3. Arrivals into EU from third countries: covered ONLY IF operating carrier is Community carrier (Art. 3.1.b)
  if (depEU === false && arrEU === true) {
    if (carrierEU === true) {
      return {
        regime: 'EU261',
        reason: 'Vol en provenance d’un pays tiers à destination de l’UE exploité par un transporteur communautaire (UE).',
      };
    }
    if (carrierEU === false) {
      return {
        regime: 'OUT_OF_SCOPE',
        reason: 'Vol au départ d’un pays tiers à destination de l’UE exploité par un transporteur non-UE : hors champ du Règlement (CE) n° 261/2004 (Art. 3 § 1 b).',
      };
    }
    return {
      regime: 'UNKNOWN',
      reason: 'Vol arrivant dans l’UE depuis un pays tiers : la nationalité de la compagnie opératrice (UE vs non-UE) doit être vérifiée pour confirmer le champ d’application.',
    };
  }

  // 4. Flights between two non-EU countries
  if (depEU === false && arrEU === false) {
    return {
      regime: 'OUT_OF_SCOPE',
      reason: 'Vol effectuant un trajet intégralement en dehors de l’UE : hors du champ d’application du Règlement (CE) n° 261/2004.',
    };
  }

  // 5. UK Specific
  if (departureCountry?.toUpperCase() === 'UK' || arrivalCountry?.toUpperCase() === 'UK') {
    return {
      regime: 'UK261',
      reason: 'Vol relevant potentiellement du régime britannique UK261 (barèmes en GBP).',
    };
  }

  // 6. Unknown / Missing information
  if (depEU === undefined && arrEU === undefined) {
    return {
      regime: 'UNKNOWN',
      reason: 'Les aéroports de départ et d’arrivée n’ont pas été spécifiés. Impossible de déterminer le champ territorial d’application.',
    };
  }

  return {
    regime: 'UNKNOWN',
    reason: 'Informations géographiques incomplètes pour établir le régime légal avec certitude.',
  };
}

export function estimateFlightRights(input: FlightEstimationInput): FlightEstimationResult {
  const {
    distanceKm,
    delayHours = 0,
    disruptionType,
    departureCountry,
    isDepartureInEU,
    arrivalCountry,
    isArrivalInEU,
    operatingCarrier,
    isCarrierEU,
    isIntraEU,
    cancellationNoticeDays,
    isDeniedBoardingInvoluntary,
    jurisdictionCountry = 'FR',
  } = input;

  // Validation: bounds check
  if (isNaN(distanceKm) || distanceKm <= 0) {
    return {
      eligibilityStatus: 'insufficient_information',
      isPotentiallyEligible: false,
      estimatedAmountEuro: 0,
      tier: 'none',
      distanceCategory: 'Distance indéterminée',
      scopeRegime: 'UNKNOWN',
      prescriptionYears: null,
      prescriptionBasis: 'Distance kilométrique invalide ou manquante.',
      qualificationText: 'Veuillez renseigner une distance de vol positive pour calculer l’éligibilité.',
      legalBasis: 'Règlement (CE) n° 261/2004, Art. 7',
      reason: 'Distance de vol requise pour déterminer le barème légal.',
      officialSources: STANDARD_SOURCES,
      isPreliminary: true,
    };
  }

  if (delayHours < 0) {
    return {
      eligibilityStatus: 'insufficient_information',
      isPotentiallyEligible: false,
      estimatedAmountEuro: 0,
      tier: 'none',
      distanceCategory: 'Heures de retard invalides',
      scopeRegime: 'UNKNOWN',
      prescriptionYears: null,
      prescriptionBasis: 'Durée de retard invalide.',
      qualificationText: 'La durée de retard ne peut pas être négative.',
      legalBasis: 'Règlement (CE) n° 261/2004',
      reason: 'Données de retard invalides.',
      officialSources: STANDARD_SOURCES,
      isPreliminary: true,
    };
  }

  // Prescription lookup - strictly from verified map, never an invented default
  const jCode = jurisdictionCountry.toUpperCase();
  const prescrInfo = PRESCRIPTION_MAP[jCode];
  const prescriptionYears = prescrInfo ? prescrInfo.years : null;
  const prescriptionBasis = prescrInfo
    ? prescrInfo.legalBasis
    : 'Délai de prescription non répertorié pour ce pays — vérification juridique nationale requise.';

  // Determine geographic scope
  const scope = determineGeographicScope({
    departureCountry,
    isDepartureInEU,
    arrivalCountry,
    isArrivalInEU,
    operatingCarrier,
    isCarrierEU,
    isIntraEU,
  });

  if (scope.regime === 'OUT_OF_SCOPE') {
    return {
      eligibilityStatus: 'not_eligible',
      isPotentiallyEligible: false,
      estimatedAmountEuro: 0,
      tier: 'none',
      distanceCategory: 'Vol hors champ d’application EU261',
      scopeRegime: 'OUT_OF_SCOPE',
      prescriptionYears,
      prescriptionBasis,
      qualificationText: `Vol non couvert par le Règlement (CE) n° 261/2004. ${scope.reason}`,
      legalBasis: 'Règlement (CE) n° 261/2004, Art. 3 § 1 (Champ d’application territorial)',
      reason: scope.reason,
      officialSources: STANDARD_SOURCES,
      isPreliminary: true,
    };
  }

  if (scope.regime === 'UNKNOWN') {
    return {
      eligibilityStatus: 'insufficient_information',
      isPotentiallyEligible: false,
      estimatedAmountEuro: 0,
      tier: 'none',
      distanceCategory: 'Champ territorial à préciser',
      scopeRegime: 'UNKNOWN',
      prescriptionYears,
      prescriptionBasis,
      qualificationText: `Champ territorial incertain : ${scope.reason}`,
      legalBasis: 'Règlement (CE) n° 261/2004, Art. 3',
      reason: scope.reason,
      officialSources: STANDARD_SOURCES,
      isPreliminary: true,
    };
  }

  // Specific Disruption Rules
  // 1. DELAYS
  if (disruptionType === 'delay') {
    if (delayHours < 3) {
      return {
        eligibilityStatus: 'not_eligible',
        isPotentiallyEligible: false,
        estimatedAmountEuro: 0,
        tier: 'none',
        distanceCategory: 'Retard inférieur à 3 heures',
        scopeRegime: scope.regime,
        prescriptionYears,
        prescriptionBasis,
        qualificationText: 'Estimation : Aucun droit indemnitaire standard pour un retard inférieur à 3 heures à l’arrivée.',
        legalBasis: 'Règlement (CE) n° 261/2004, Arrêt Sturgeon C-402/07 (CJUE)',
        reason: 'Le droit à indemnité forfaitaire pour retard n’est ouvert qu’à partir de 3 heures de retard effectif à la destination finale.',
        officialSources: STANDARD_SOURCES,
        isPreliminary: true,
      };
    }
  }

  // 2. CANCELLATIONS
  if (disruptionType === 'cancellation') {
    if (cancellationNoticeDays !== undefined && cancellationNoticeDays >= 14) {
      return {
        eligibilityStatus: 'not_eligible',
        isPotentiallyEligible: false,
        estimatedAmountEuro: 0,
        tier: 'none',
        distanceCategory: 'Annulation notifiée ≥ 14 jours avant',
        scopeRegime: scope.regime,
        prescriptionYears,
        prescriptionBasis,
        qualificationText: 'Aucune indemnisation forfaitaire : la compagnie a prévenu au moins 14 jours avant la date du vol.',
        legalBasis: 'Règlement (CE) n° 261/2004, Art. 5 § 1 (c) (i)',
        reason: 'L’article 5 § 1 (c) (i) exonère expressément le transporteur de l’obligation d’indemniser si l’annulation est notifiée deux semaines avant le départ.',
        officialSources: STANDARD_SOURCES,
        isPreliminary: true,
      };
    }
  }

  // 3. DENIED BOARDING
  if (disruptionType === 'denied_boarding') {
    if (isDeniedBoardingInvoluntary === false) {
      return {
        eligibilityStatus: 'not_eligible',
        isPotentiallyEligible: false,
        estimatedAmountEuro: 0,
        tier: 'none',
        distanceCategory: 'Renoncement volontaire',
        scopeRegime: scope.regime,
        prescriptionYears,
        prescriptionBasis,
        qualificationText: 'Refus d’embarquement volontaire : le passager a accepté de renoncer à sa réservation en échange de contreparties négociées.',
        legalBasis: 'Règlement (CE) n° 261/2004, Art. 4 § 1',
        reason: 'Seul le refus d’embarquement non volontaire (surbooking sans accord) ouvre droit à l’indemnité forfaitaire de l’article 7.',
        officialSources: STANDARD_SOURCES,
        isPreliminary: true,
      };
    }
  }

  // Distance Brackets under Article 7(1)
  // Bracket 1: <= 1500 km -> 250 €
  if (distanceKm <= 1500) {
    return {
      eligibilityStatus: 'potentially_eligible',
      isPotentiallyEligible: true,
      estimatedAmountEuro: 250,
      tier: 'short',
      distanceCategory: 'Vol jusqu’à 1 500 km',
      scopeRegime: scope.regime,
      prescriptionYears,
      prescriptionBasis,
      qualificationText: 'Montant possible estimé : 250 € par passager (sous réserve de vérification des circonstances extraordinaires).',
      legalBasis: 'Règlement (CE) n° 261/2004, Art. 7 § 1 (a)',
      reason: 'Vol de 1 500 km ou moins remplissant les critères du barème court-courrier.',
      officialSources: STANDARD_SOURCES,
      isPreliminary: true,
    };
  }

  // Bracket 2: Intra-EU > 1500 km OR any flight between 1500 km and 3500 km -> 400 €
  const isConsideredIntraEU = isIntraEU || (isDepartureInEU && isArrivalInEU);
  if (isConsideredIntraEU || (distanceKm > 1500 && distanceKm <= 3500)) {
    return {
      eligibilityStatus: 'potentially_eligible',
      isPotentiallyEligible: true,
      estimatedAmountEuro: 400,
      tier: 'medium',
      distanceCategory: isConsideredIntraEU ? 'Vol intracommunautaire de plus de 1 500 km' : 'Vol de 1 500 à 3 500 km',
      scopeRegime: scope.regime,
      prescriptionYears,
      prescriptionBasis,
      qualificationText: 'Montant possible estimé : 400 € par passager (sous réserve de vérification des circonstances extraordinaires).',
      legalBasis: 'Règlement (CE) n° 261/2004, Art. 7 § 1 (b)',
      reason: isConsideredIntraEU
        ? 'Vol intracommunautaire excédant 1 500 km éligible au barème moyen-courrier.'
        : 'Vol extracommunautaire de 1 500 à 3 500 km éligible au barème intermédiaire.',
      officialSources: STANDARD_SOURCES,
      isPreliminary: true,
    };
  }

  // Bracket 3: Extra-EU > 3500 km
  // Under Article 7(2)(c): If arrival delay is between 3h and 4h, carrier may reduce compensation by 50% (300 €)
  const isBetween3and4Hours = disruptionType === 'delay' && delayHours >= 3 && delayHours < 4;
  const amount = isBetween3and4Hours ? 300 : 600;

  return {
    eligibilityStatus: 'potentially_eligible',
    isPotentiallyEligible: true,
    estimatedAmountEuro: amount,
    tier: 'long',
    distanceCategory: 'Vol extracommunautaire de plus de 3 500 km',
    scopeRegime: scope.regime,
    prescriptionYears,
    prescriptionBasis,
    qualificationText: isBetween3and4Hours
      ? 'Montant possible estimé : 300 € par passager (réduction légale de 50 % pour retard entre 3h et 4h à l’arrivée).'
      : 'Montant possible estimé : 600 € par passager (taux plein pour retard ≥ 4h ou annulation).',
    legalBasis: isBetween3and4Hours
      ? 'Règlement (CE) n° 261/2004, Art. 7 § 1 (c) & Art. 7 § 2 (c)'
      : 'Règlement (CE) n° 261/2004, Art. 7 § 1 (c)',
    reason: isBetween3and4Hours
      ? 'Vol long-courrier avec retard à l’arrivée compris entre 3h et 4h : application de la réduction légale de 50 % prévue par l’article 7 § 2 (c).'
      : 'Vol long-courrier de plus de 3 500 km avec retard supérieur à 4h ou annulation.',
    officialSources: STANDARD_SOURCES,
    isPreliminary: true,
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
  delayHours?: number;
  estimatedAmount?: number;
  airlineName?: string;
  disruptionType?: DisruptionType;
  cancellationNoticeDays?: number;
  isNeutralInquiry?: boolean;
}): string {
  const {
    passengerName,
    bookingRef,
    flightCode,
    departureAirport,
    arrivalAirport,
    flightDate,
    delayHours = 3,
    estimatedAmount = 250,
    airlineName = 'la compagnie aérienne',
    disruptionType = 'delay',
    isNeutralInquiry = false,
  } = params;

  const passengerGreeting = passengerName || '[Prénom et Nom du passager]';
  const bookingReference = bookingRef || '[Référence de réservation / Dossier PNR]';

  // 1. Neutral inquiry request (when circumstances or eligibility are uncertain)
  if (isNeutralInquiry) {
    return `À l'attention du Service Client & Réclamations de ${airlineName}

Objet : Demande de précisions et attestation d'incident — Vol ${flightCode} du ${flightDate}
Référence de réservation : ${bookingReference}

Madame, Monsieur,

En qualité de passager du vol ${flightCode} reliant ${departureAirport} à ${arrivalAirport} le ${flightDate}, j'ai subi une perturbation opérationnelle lors de mon voyage.

Afin de faire valoir mes droits au titre de la réglementation applicable relative aux droits des passagers aériens (Règlement CE n° 261/2004), je vous saurais gré de bien vouloir me transmettre :
1. Une attestation officielle d'incident précisant la cause exacte et vérifiée de la perturbation ;
2. La justification documentaire des mesures raisonnables prises par votre compagnie pour y remédier.

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${passengerGreeting}
`;
  }

  // 2. Cancellation specific demand
  if (disruptionType === 'cancellation') {
    return `À l'attention du Service Réclamations de ${airlineName}

Objet : Demande d'indemnisation pour annulation de vol — Vol ${flightCode} du ${flightDate}
Référence de réservation : ${bookingReference}
Fondement légal : Règlement (CE) n° 261/2004 du Parlement européen et du Conseil, Articles 5 et 7

Madame, Monsieur,

J'étais passager du vol ${flightCode} devant relier ${departureAirport} à ${arrivalAirport} le ${flightDate}. Ce vol a fait l'objet d'une annulation par votre compagnie sans que je n'en aie été informé au moins deux semaines avant l'horaire de départ prévu.

Conformément à l'article 5 § 1 (c) et à l'article 7 du Règlement (CE) n° 261/2004, en l'absence de circonstances extraordinaires que le transporteur aérien effectif est tenu de démontrer par des preuves tangibles, les passagers disposent d'un droit à indemnisation forfaitaire.

Pour ce trajet dont la distance correspond aux barèmes de l'article 7, l'indemnité forfaitaire s'élève à ${estimatedAmount} € par passager.

Je vous remercie de bien vouloir procéder au versement de cette indemnité de ${estimatedAmount} € par virement bancaire sous un délai amiable de 14 jours ouvrés.

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${passengerGreeting}
`;
  }

  // 3. Denied Boarding specific demand
  if (disruptionType === 'denied_boarding') {
    return `À l'attention du Service Réclamations de ${airlineName}

Objet : Demande d'indemnisation pour refus d'embarquement non volontaire — Vol ${flightCode} du ${flightDate}
Référence de réservation : ${bookingReference}
Fondement légal : Règlement (CE) n° 261/2004 du Parlement européen et du Conseil, Articles 4 et 7

Madame, Monsieur,

Je disposais d'une réservation confirmée pour le vol ${flightCode} devant relier ${departureAirport} à ${arrivalAirport} le ${flightDate}. Bien que m'étant présenté(e) à l'enregistrement dans les délais impartis et muni(e) des documents de voyage requis, l'embarquement m'a été refusé de manière non volontaire pour des motifs d'exploitation de votre compagnie.

En application directe des articles 4 § 3 et 7 du Règlement (CE) n° 261/2004, le refus d'embarquement contre la volonté du passager ouvre droit à une indemnisation immédiate et forfaitaire.

Pour cet itinéraire, le barème légal applicable prévoit une indemnité compensatoire de ${estimatedAmount} €.

Je vous mets en demeure par la présente de procéder au règlement de cette somme de ${estimatedAmount} € par virement bancaire sous 14 jours ouvrés.

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${passengerGreeting}
`;
  }

  // 4. Delay standard demand (Arrival delay >= 3h)
  return `À l'attention du Service Réclamations de ${airlineName}

Objet : Demande d'indemnisation pour retard de vol — Vol ${flightCode} du ${flightDate}
Référence de réservation : ${bookingReference}
Fondement légal : Règlement (CE) n° 261/2004, Articles 6 et 7 ; Arrêts CJUE Sturgeon (C-402/07) et Nelson (C-581/10)

Madame, Monsieur,

Je vous contacte en qualité de passager du vol ${flightCode} reliant ${departureAirport} à ${arrivalAirport}, initialement programmé le ${flightDate}.

Ce vol a subi une perturbation majeure se traduisant par une arrivée effective à destination avec un retard constaté supérieur à ${delayHours} heures par rapport à l'horaire contractuel.

Conformément à la jurisprudence constante de la Cour de Justice de l'Union européenne interprétant les articles 5, 6 et 7 du Règlement (CE) n° 261/2004, les passagers arrivant à leur destination finale avec un retard de trois heures ou plus disposent d'un droit à indemnisation forfaitaire, sauf preuve par le transporteur de circonstances extraordinaires imprévisibles et insurmontables.

Pour ce trajet dont la distance correspond aux barèmes de l'article 7, l'indemnité forfaitaire prévue s'élève à ${estimatedAmount} € par passager.

Je vous invite à bien vouloir procéder au règlement de cette somme de ${estimatedAmount} € par virement bancaire dans un délai convenable de 14 jours ouvrés.

Dans l'attente de votre confirmation, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${passengerGreeting}
`;
}

export const generateClaimLetter = generateClaimLetterTemplate;
