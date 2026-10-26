import test from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateFlightRights,
  validateWaitlistInput,
  generateClaimLetterTemplate,
  determineGeographicScope,
} from './rightsCalculator.ts';

test('Flight rights estimation: invalid negative distance returns insufficient_information', () => {
  const result = estimateFlightRights({
    distanceKm: -500,
    delayHours: 3.5,
    disruptionType: 'delay',
  });
  assert.equal(result.eligibilityStatus, 'insufficient_information');
  assert.equal(result.isPotentiallyEligible, false);
  assert.equal(result.estimatedAmountEuro, 0);
});

test('Flight rights estimation: negative delay returns insufficient_information', () => {
  const result = estimateFlightRights({
    distanceKm: 1200,
    delayHours: -1,
    disruptionType: 'delay',
  });
  assert.equal(result.eligibilityStatus, 'insufficient_information');
  assert.equal(result.estimatedAmountEuro, 0);
});

test('Flight rights estimation: under 3 hours delay gives 0 EUR and not eligible', () => {
  const result = estimateFlightRights({
    distanceKm: 800,
    delayHours: 2.5,
    disruptionType: 'delay',
    isIntraEU: true,
  });
  assert.equal(result.eligibilityStatus, 'not_eligible');
  assert.equal(result.isPotentiallyEligible, false);
  assert.equal(result.estimatedAmountEuro, 0);
  assert.equal(result.tier, 'none');
  assert.match(result.qualificationText, /inférieur à 3 heures/i);
});

test('Flight rights estimation: <= 1500 km with >= 3h delay yields 250 EUR', () => {
  const result = estimateFlightRights({
    distanceKm: 750,
    delayHours: 3.5,
    disruptionType: 'delay',
    isIntraEU: true,
  });
  assert.equal(result.eligibilityStatus, 'potentially_eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 250);
  assert.equal(result.tier, 'short');
  assert.match(result.qualificationText, /250 €/);
});

test('Flight rights estimation: Intra-EU > 1500 km yields 400 EUR', () => {
  const result = estimateFlightRights({
    distanceKm: 2200,
    isIntraEU: true,
    delayHours: 4,
    disruptionType: 'delay',
  });
  assert.equal(result.eligibilityStatus, 'potentially_eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 400);
  assert.equal(result.tier, 'medium');
});

test('Flight rights estimation: Extra-EU > 3500 km with 3h-4h delay applies 50% statutory reduction (300 EUR)', () => {
  const result = estimateFlightRights({
    distanceKm: 5800,
    isDepartureInEU: true,
    delayHours: 3.5,
    disruptionType: 'delay',
  });
  assert.equal(result.eligibilityStatus, 'potentially_eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 300);
  assert.equal(result.tier, 'long');
  assert.match(result.qualificationText, /300 €/);
});

test('Flight rights estimation: Extra-EU > 3500 km with >= 4h delay yields 600 EUR full rate', () => {
  const result = estimateFlightRights({
    distanceKm: 5800,
    isDepartureInEU: true,
    delayHours: 4.5,
    disruptionType: 'delay',
  });
  assert.equal(result.eligibilityStatus, 'potentially_eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 600);
  assert.equal(result.tier, 'long');
});

test('Geographic Scope: Non-EU origin to EU arrival on non-EU carrier is OUT OF SCOPE (Delta JFK to CDG)', () => {
  const scope = determineGeographicScope({
    departureCountry: 'US',
    arrivalCountry: 'FR',
    operatingCarrier: 'Delta Air Lines',
    isCarrierEU: false,
  });
  assert.equal(scope.regime, 'OUT_OF_SCOPE');

  const result = estimateFlightRights({
    distanceKm: 5840,
    departureCountry: 'US',
    arrivalCountry: 'FR',
    operatingCarrier: 'Delta Air Lines',
    isCarrierEU: false,
    delayHours: 5,
    disruptionType: 'delay',
  });
  assert.equal(result.eligibilityStatus, 'not_eligible');
  assert.equal(result.isPotentiallyEligible, false);
  assert.equal(result.estimatedAmountEuro, 0);
  assert.equal(result.scopeRegime, 'OUT_OF_SCOPE');
});

test('Geographic Scope: EU origin to Non-EU arrival on non-EU carrier is COVERED under Art 3.1.a (Delta CDG to JFK)', () => {
  const scope = determineGeographicScope({
    departureCountry: 'FR',
    arrivalCountry: 'US',
    operatingCarrier: 'Delta Air Lines',
    isCarrierEU: false,
  });
  assert.equal(scope.regime, 'EU261');

  const result = estimateFlightRights({
    distanceKm: 5840,
    departureCountry: 'FR',
    arrivalCountry: 'US',
    operatingCarrier: 'Delta Air Lines',
    isCarrierEU: false,
    delayHours: 5,
    disruptionType: 'delay',
  });
  assert.equal(result.eligibilityStatus, 'potentially_eligible');
  assert.equal(result.estimatedAmountEuro, 600);
});

test('Cancellation: notice >= 14 days yields 0 EUR under Art 5.1.c.i', () => {
  const result = estimateFlightRights({
    distanceKm: 1200,
    isIntraEU: true,
    disruptionType: 'cancellation',
    cancellationNoticeDays: 16,
  });
  assert.equal(result.eligibilityStatus, 'not_eligible');
  assert.equal(result.isPotentiallyEligible, false);
  assert.equal(result.estimatedAmountEuro, 0);
  assert.match(result.qualificationText, /14 jours/);
});

test('Denied Boarding: voluntary surrender yields 0 EUR statutory compensation', () => {
  const result = estimateFlightRights({
    distanceKm: 1000,
    isIntraEU: true,
    disruptionType: 'denied_boarding',
    isDeniedBoardingInvoluntary: false,
  });
  assert.equal(result.eligibilityStatus, 'not_eligible');
  assert.equal(result.estimatedAmountEuro, 0);
});

test('Denied Boarding: involuntary denied boarding is eligible for statutory compensation', () => {
  const result = estimateFlightRights({
    distanceKm: 1000,
    isIntraEU: true,
    disruptionType: 'denied_boarding',
    isDeniedBoardingInvoluntary: true,
  });
  assert.equal(result.eligibilityStatus, 'potentially_eligible');
  assert.equal(result.estimatedAmountEuro, 250);
});

test('Prescription calculation: verified countries and unknown country verification', () => {
  // FR: 5 years
  const fr = estimateFlightRights({ distanceKm: 900, delayHours: 3.5, disruptionType: 'delay', jurisdictionCountry: 'FR' });
  assert.equal(fr.prescriptionYears, 5);

  // DE: 3 years
  const de = estimateFlightRights({ distanceKm: 900, delayHours: 3.5, disruptionType: 'delay', jurisdictionCountry: 'DE' });
  assert.equal(de.prescriptionYears, 3);

  // IT: 2 years
  const it = estimateFlightRights({ distanceKm: 900, delayHours: 3.5, disruptionType: 'delay', jurisdictionCountry: 'IT' });
  assert.equal(it.prescriptionYears, 2);

  // Unknown country: must NOT invent 5 years, must return null
  const unknownCountry = estimateFlightRights({ distanceKm: 900, delayHours: 3.5, disruptionType: 'delay', jurisdictionCountry: 'JP' });
  assert.equal(unknownCountry.prescriptionYears, null);
  assert.match(unknownCountry.prescriptionBasis, /non répertorié/i);
});

test('Claim letter generation produces disruption-specific templates', () => {
  // Delay template
  const delayLetter = generateClaimLetterTemplate({
    passengerName: 'Camille Dupont',
    bookingRef: 'PNR123',
    flightCode: 'AF 1234',
    departureAirport: 'Paris-CDG',
    arrivalAirport: 'Nice-NCE',
    flightDate: '2026-09-15',
    delayHours: 3.5,
    estimatedAmount: 250,
    airlineName: 'Air France',
    disruptionType: 'delay',
  });
  assert.match(delayLetter, /Sturgeon/);
  assert.match(delayLetter, /250 €/);
  assert.doesNotMatch(delayLetter, /garantir/i);

  // Cancellation template
  const cancelLetter = generateClaimLetterTemplate({
    passengerName: 'Alexandre Martin',
    bookingRef: 'PNR456',
    flightCode: 'LH 1045',
    departureAirport: 'Paris-CDG',
    arrivalAirport: 'Frankfurt-FRA',
    flightDate: '2026-10-10',
    estimatedAmount: 250,
    airlineName: 'Lufthansa',
    disruptionType: 'cancellation',
  });
  assert.match(cancelLetter, /annulation de vol/i);
  assert.match(cancelLetter, /deux semaines avant/i);

  // Neutral inquiry template
  const inquiryLetter = generateClaimLetterTemplate({
    passengerName: 'Samira Belkacem',
    bookingRef: 'PNR789',
    flightCode: 'DL 0890',
    departureAirport: 'New York-JFK',
    arrivalAirport: 'Paris-CDG',
    flightDate: '2026-08-20',
    airlineName: 'Delta Air Lines',
    isNeutralInquiry: true,
  });
  assert.match(inquiryLetter, /attestation d'incident/i);
  assert.doesNotMatch(inquiryLetter, /mise en demeure/i);
});

test('Waitlist input validation works accurately', () => {
  assert.equal(validateWaitlistInput('', 'once').isValid, false);
  assert.equal(validateWaitlistInput('bademail', 'once').isValid, false);
  assert.equal(validateWaitlistInput('user@domaine.fr', null).isValid, false);
  assert.equal(validateWaitlistInput('user@domaine.fr', 'multiple').isValid, true);
});
