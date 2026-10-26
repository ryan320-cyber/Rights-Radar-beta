import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractFlightDataFromSnippet,
  setAccessToken,
  getAccessToken,
  clearSession,
  isAuthorized,
  scanInboxForFlightDisruptions,
  createClaimDraft,
  GMAIL_SCOPES,
} from './gmailService.ts';

test('GMAIL_SCOPES follows principle of least privilege', () => {
  // Must ONLY contain gmail.readonly and gmail.compose
  assert.equal(GMAIL_SCOPES.includes('https://www.googleapis.com/auth/gmail.readonly'), true);
  assert.equal(GMAIL_SCOPES.includes('https://www.googleapis.com/auth/gmail.compose'), true);
  // Must NEVER request broad mailbox control scopes
  assert.equal(GMAIL_SCOPES.includes('https://mail.google.com/'), false);
  assert.equal(GMAIL_SCOPES.includes('https://www.googleapis.com/auth/gmail.modify'), false);
});

test('Session lifecycle: in-memory token operations and clearSession', () => {
  clearSession();
  assert.equal(isAuthorized(), false);
  assert.equal(getAccessToken(), null);

  setAccessToken('ya29.test_token_in_memory');
  assert.equal(isAuthorized(), true);
  assert.equal(getAccessToken(), 'ya29.test_token_in_memory');

  clearSession();
  assert.equal(isAuthorized(), false);
  assert.equal(getAccessToken(), null);
});

test('extractFlightDataFromSnippet extracts facts conservatively without hallucinating', () => {
  const snippet1 = 'Votre vol AF 1234 reliant CDG -> NCE le 2026-09-15 a subi un retard de 3h.';
  const res1 = extractFlightDataFromSnippet(snippet1, 'Information sur votre vol');
  assert.equal(res1.flightCode, 'AF 1234');
  assert.equal(res1.airline, 'Air France');
  assert.equal(res1.departure, 'CDG');
  assert.equal(res1.arrival, 'NCE');
  assert.equal(res1.flightDate, '2026-09-15');
  assert.equal(res1.disruptionType, 'delay');
  assert.equal(res1.reportedDelayMinutes, 180);
  assert.equal(res1.confidence, 'high');

  // Email with no flight facts: must NOT invent fake flight numbers
  const snippet2 = 'Confirmation de votre newsletter mensuelle de voyage.';
  const res2 = extractFlightDataFromSnippet(snippet2, 'Newsletter');
  assert.equal(res2.flightCode, null);
  assert.equal(res2.airline, null);
  assert.equal(res2.disruptionType, 'unknown');
  assert.equal(res2.reportedDelayMinutes, null);
  assert.equal(res2.confidence, 'low');
});

test('scanInboxForFlightDisruptions: returns empty array [] on zero messages, NEVER fake demo flights', async () => {
  setAccessToken('fake_token_for_mock');
  const originalFetch = globalThis.fetch;

  // Mock Gmail API returning 0 messages
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ messages: [], resultSizeEstimate: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const results = await scanInboxForFlightDisruptions();
    // Non-negotiable: MUST be empty array, never fabricated demo flights!
    assert.deepEqual(results, []);
  } finally {
    globalThis.fetch = originalFetch;
    clearSession();
  }
});

test('scanInboxForFlightDisruptions: explicit demo mode returns clearly marked simulated records', async () => {
  const demoResults = await scanInboxForFlightDisruptions({ isExplicitDemoMode: true });
  assert.equal(demoResults.length, 1);
  assert.equal(demoResults[0].isSimulatedDemo, true);
  assert.match(demoResults[0].subject, /\[DÉMO\]/);
});

test('createClaimDraft: rejects invalid recipient email', async () => {
  setAccessToken('test_token');
  const result = await createClaimDraft({
    recipientEmail: 'not-an-email',
    airlineName: 'Air France',
    flightCode: 'AF 1234',
    subject: 'Demande d’indemnisation',
    bodyText: 'Texte de la réclamation',
  });
  assert.equal(result.success, false);
  assert.match(result.error || '', /destinataire.*invalide/i);
  clearSession();
});
