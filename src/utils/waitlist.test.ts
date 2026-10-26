import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail, submitWaitlist } from './waitlist.ts';

test('validateEmail validates RFC 5322 standard formats', () => {
  assert.equal(validateEmail('test@example.com'), true);
  assert.equal(validateEmail('PASSAGER@AIRLINE.FR'), true);
  assert.equal(validateEmail('user.name+tag@domain.co.uk'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail(''), false);
  assert.equal(validateEmail('test@domain'), false);
  assert.equal(validateEmail(' @domain.com'), false);
});

test('submitWaitlist: rejects invalid email immediately without network call', async () => {
  const result = await submitWaitlist({
    email: 'not-an-email',
    usageFrequency: 'once',
    interestTypes: { userResearch: true, legalSupport: false, pricingFeedback: false },
  });
  assert.equal(result.success, false);
  assert.match(result.message, /adresse email valide/i);
});

test('submitWaitlist: rejects missing usage frequency immediately', async () => {
  const result = await submitWaitlist({
    email: 'valid.passenger@test.org',
    usageFrequency: '' as any,
    interestTypes: { userResearch: true, legalSupport: false, pricingFeedback: false },
  });
  assert.equal(result.success, false);
  assert.match(result.message, /comment vous envisagez/i);
});

test('submitWaitlist: succeeds upon confirmed 201 backend response', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ success: true, submission: { id: 42, status: 'registered' } }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const result = await submitWaitlist({
      email: 'verified.passenger@domain.com',
      usageFrequency: 'multiple',
      interestTypes: { userResearch: true, legalSupport: false, pricingFeedback: false },
    });
    assert.equal(result.success, true);
    assert.match(result.message, /enregistrée avec succès/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('submitWaitlist: detects duplicate 409 response accurately', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ success: false, isDuplicate: true, message: 'Cette adresse email est déjà inscrite.' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const result = await submitWaitlist({
      email: 'already.registered@domain.com',
      usageFrequency: 'once',
      interestTypes: { userResearch: false, legalSupport: false, pricingFeedback: true },
    });
    assert.equal(result.success, false);
    assert.equal(result.isDuplicate, true);
    assert.match(result.message, /déjà inscrite/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('submitWaitlist: fails truthfully and never reports false success when backend returns 500 and Firestore fails', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ success: false, error: 'Database unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const result = await submitWaitlist({
      email: 'unlucky.passenger@domain.com',
      usageFrequency: 'once',
      interestTypes: { userResearch: true, legalSupport: false, pricingFeedback: false },
    });
    // Critical safety check: MUST NOT return success: true!
    assert.equal(result.success, false);
    assert.match(result.message, /Database unavailable|non confirmée|Erreur serveur|indisponible/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
