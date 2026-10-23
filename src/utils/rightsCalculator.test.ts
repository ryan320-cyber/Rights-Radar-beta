import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateFlightRights, validateWaitlistInput, generateClaimLetterTemplate } from './rightsCalculator.ts';

test('Flight rights estimation: under 3 hours delay gives 0 EUR and not eligible', () => {
  const result = estimateFlightRights({
    distanceKm: 800,
    delayHours: 2.5,
    disruptionType: 'delay',
  });
  assert.equal(result.isPotentiallyEligible, false);
  assert.equal(result.estimatedAmountEuro, 0);
  assert.equal(result.tier, 'none');
});

test('Flight rights estimation: <= 1500 km with >= 3h delay yields 250 EUR', () => {
  const result = estimateFlightRights({
    distanceKm: 750,
    delayHours: 3.5,
    disruptionType: 'delay',
  });
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 250);
  assert.equal(result.tier, 'short');
  assert.match(result.qualificationText, /250 €/);
});

test('Flight rights estimation: Intra-EU or 1500-3500 km yields 400 EUR', () => {
  const result = estimateFlightRights({
    distanceKm: 2200,
    isIntraEU: true,
    delayHours: 4,
    disruptionType: 'delay',
  });
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 400);
  assert.equal(result.tier, 'medium');
});

test('Flight rights estimation: Extra-EU > 3500 km with >= 4h delay yields 600 EUR', () => {
  const result = estimateFlightRights({
    distanceKm: 5800,
    isIntraEU: false,
    delayHours: 5,
    disruptionType: 'delay',
  });
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 600);
  assert.equal(result.tier, 'long');
});

test('Flight rights estimation: Extra-EU > 3500 km with 3h-4h delay applies 50% reduction (300 EUR)', () => {
  const result = estimateFlightRights({
    distanceKm: 5800,
    isIntraEU: false,
    delayHours: 3.2,
    disruptionType: 'delay',
  });
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 300);
});

test('Prescription calculation respects French 5-year limit', () => {
  const result = estimateFlightRights({
    distanceKm: 900,
    delayHours: 3,
    disruptionType: 'delay',
    jurisdictionCountry: 'FR',
  });
  assert.equal(result.prescriptionYears, 5);
});

test('Waitlist validation: rejects empty email and unselected frequency', () => {
  const emptyEmail = validateWaitlistInput('', 'once');
  assert.equal(emptyEmail.isValid, false);
  assert.match(emptyEmail.error || '', /adresse email/);

  const invalidFormat = validateWaitlistInput('notanemail', 'once');
  assert.equal(invalidFormat.isValid, false);

  const missingFrequency = validateWaitlistInput('test@example.com', null);
  assert.equal(missingFrequency.isValid, false);

  const valid = validateWaitlistInput('passager@example.com', 'Plusieurs fois par an');
  assert.equal(valid.isValid, true);
  assert.equal(valid.error, undefined);
});

test('Claim letter generation includes key passenger rights markers and no guarantee wording', () => {
  const letter = generateClaimLetterTemplate({
    passengerName: 'Camille Dupont',
    bookingRef: 'AF7890',
    flightCode: 'AF1234',
    departureAirport: 'Paris-CDG',
    arrivalAirport: 'Nice-NCE',
    flightDate: '2026-09-15',
    delayHours: 3.5,
    estimatedAmount: 250,
    airlineName: 'Air France',
  });
  assert.match(letter, /AF1234/);
  assert.match(letter, /250 €/);
  assert.match(letter, /Règlement \(CE\) n° 261\/2004/);
  // Ensure "garantir" or "100 % récupéré" is never present
  assert.doesNotMatch(letter, /garantir/i);
  assert.doesNotMatch(letter, /100 % récupéré/i);
});
