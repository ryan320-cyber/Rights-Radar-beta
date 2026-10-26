/**
 * Gmail Service for Rights Radar.
 * Strictly adheres to Principle of Least Privilege:
 * - Scopes: ONLY gmail.readonly and gmail.compose (Never mail.google.com or gmail.modify)
 * - In-memory access token lifecycle (never saved in localStorage or logged)
 * - Zero fabricated demo flights during live scanning failures
 * - Conservative fact extraction with explicit null/unknown states
 */

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
];

export interface DetectedFlightEmail {
  messageId: string;
  subject: string;
  sender: string;
  receivedDate: string;
  flightCode: string | null;
  airline: string | null;
  departure: string | null;
  arrival: string | null;
  flightDate: string | null;
  disruptionType: 'delay' | 'cancellation' | 'denied_boarding' | 'unknown';
  reportedDelayMinutes: number | null;
  extractionConfidence: 'high' | 'partial' | 'low';
  isSimulatedDemo?: boolean;
}

export interface ClaimDraftPayload {
  recipientEmail: string;
  airlineName: string;
  flightCode: string;
  subject: string;
  bodyText: string;
}

// In-memory token storage (Cleared on logout / tab close)
let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function clearSession(): void {
  inMemoryAccessToken = null;
}

export function isAuthorized(): boolean {
  return inMemoryAccessToken !== null && inMemoryAccessToken.length > 0;
}

/**
 * Conservative extraction of flight facts from email snippets or subjects.
 * Never invents mock flight codes, routes, or dates if not explicitly present.
 */
export function extractFlightDataFromSnippet(text: string, subject: string = ''): {
  flightCode: string | null;
  airline: string | null;
  departure: string | null;
  arrival: string | null;
  flightDate: string | null;
  disruptionType: 'delay' | 'cancellation' | 'denied_boarding' | 'unknown';
  reportedDelayMinutes: number | null;
  confidence: 'high' | 'partial' | 'low';
} {
  const combined = `${subject} ${text}`;

  // 1. Flight Code extraction (e.g. AF1234, LH 456, U2 1890, BA 304)
  const flightCodeRegex = /\b([A-Z0-9]{2})\s?(\d{2,4})\b/i;
  const flightMatch = combined.match(flightCodeRegex);
  const flightCode = flightMatch ? `${flightMatch[1].toUpperCase()} ${flightMatch[2]}` : null;

  // 2. Airline detection from common carrier signatures and IATA code prefix
  let airline: string | null = null;
  const lower = combined.toLowerCase();
  const iataPrefix = flightMatch ? flightMatch[1].toUpperCase() : '';

  const IATA_AIRLINE_MAP: Record<string, string> = {
    AF: 'Air France',
    LH: 'Lufthansa',
    U2: 'easyJet',
    DS: 'easyJet',
    FR: 'Ryanair',
    TO: 'Transavia',
    IB: 'Iberia',
    BA: 'British Airways',
    KL: 'KLM',
    DL: 'Delta Air Lines',
    LX: 'Swiss',
    OS: 'Austrian',
    SN: 'Brussels Airlines',
    TP: 'TAP Air Portugal',
    VY: 'Vueling',
    AZ: 'ITA Airways',
  };

  if (lower.includes('air france')) airline = 'Air France';
  else if (lower.includes('lufthansa')) airline = 'Lufthansa';
  else if (lower.includes('easyjet')) airline = 'easyJet';
  else if (lower.includes('ryanair')) airline = 'Ryanair';
  else if (lower.includes('transavia')) airline = 'Transavia';
  else if (lower.includes('iberia')) airline = 'Iberia';
  else if (lower.includes('british airways')) airline = 'British Airways';
  else if (lower.includes('klm')) airline = 'KLM';
  else if (lower.includes('delta')) airline = 'Delta Air Lines';
  else if (IATA_AIRLINE_MAP[iataPrefix]) {
    airline = IATA_AIRLINE_MAP[iataPrefix];
  }

  // 3. Disruption Type detection
  let disruptionType: 'delay' | 'cancellation' | 'denied_boarding' | 'unknown' = 'unknown';
  if (lower.includes('annul') || lower.includes('cancel')) {
    disruptionType = 'cancellation';
  } else if (lower.includes('refus d’embarquement') || lower.includes('denied boarding') || lower.includes('surbooking')) {
    disruptionType = 'denied_boarding';
  } else if (lower.includes('retard') || lower.includes('delay') || lower.includes('reporté')) {
    disruptionType = 'delay';
  }

  // 4. Delay duration extraction (e.g. "retard de 3h", "retardé de 180 minutes", "4 hours delay")
  let reportedDelayMinutes: number | null = null;
  const hoursDelayMatch = combined.match(/(\d+)\s*(?:h|heures?|hours?)\s*(?:de retard|delay)?/i);
  if (hoursDelayMatch) {
    reportedDelayMinutes = parseInt(hoursDelayMatch[1], 10) * 60;
  } else {
    const minsDelayMatch = combined.match(/(\d+)\s*(?:min|minutes?)\s*(?:de retard|delay)?/i);
    if (minsDelayMatch) {
      reportedDelayMinutes = parseInt(minsDelayMatch[1], 10);
    }
  }

  // 5. Date extraction (YYYY-MM-DD or DD/MM/YYYY)
  let flightDate: string | null = null;
  const dateIsoMatch = combined.match(/\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (dateIsoMatch) {
    flightDate = dateIsoMatch[0];
  } else {
    const dateFrMatch = combined.match(/\b(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(20\d{2})\b/);
    if (dateFrMatch) {
      flightDate = `${dateFrMatch[3]}-${dateFrMatch[2]}-${dateFrMatch[1]}`;
    }
  }

  // 6. Airport code extraction (e.g. CDG -> NCE or CDG - JFK)
  let departure: string | null = null;
  let arrival: string | null = null;
  const routeMatch = combined.match(/\b([A-Z]{3})\s*(?:->|→|-|to|vers)\s*([A-Z]{3})\b/);
  if (routeMatch) {
    departure = routeMatch[1].toUpperCase();
    arrival = routeMatch[2].toUpperCase();
  }

  const confidence = flightCode && disruptionType !== 'unknown'
    ? 'high'
    : flightCode || disruptionType !== 'unknown'
    ? 'partial'
    : 'low';

  return {
    flightCode,
    airline,
    departure,
    arrival,
    flightDate,
    disruptionType,
    reportedDelayMinutes,
    confidence,
  };
}

/**
 * Searches the user's Gmail messages for flight confirmation and disruption notifications.
 * STRICT NON-NEGOTIABLE RULE:
 * Returns an empty array [] if no messages match. NEVER falls back to fake demo data!
 */
export async function scanInboxForFlightDisruptions(
  options?: { isExplicitDemoMode?: boolean }
): Promise<DetectedFlightEmail[]> {
  // If user explicitly activated demo sandbox mode
  if (options?.isExplicitDemoMode) {
    return [
      {
        messageId: 'demo_msg_01',
        subject: '[DÉMO] Retard important sur votre vol AF 1234 Paris CDG → Nice',
        sender: 'service.client@airfrance.fr',
        receivedDate: '2026-09-15',
        flightCode: 'AF 1234',
        airline: 'Air France',
        departure: 'CDG',
        arrival: 'NCE',
        flightDate: '2026-09-15',
        disruptionType: 'delay',
        reportedDelayMinutes: 210,
        extractionConfidence: 'high',
        isSimulatedDemo: true,
      },
    ];
  }

  if (!inMemoryAccessToken) {
    throw new Error('Non autorisé : Aucun jeton d’accès Gmail en mémoire. Veuillez vous connecter.');
  }

  const query = 'subject:(vol OR flight OR retard OR delay OR annulation OR cancelled)';
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${inMemoryAccessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      throw new Error('Session Gmail expirée. Veuillez ré-autoriser l’accès.');
    }
    throw new Error(`Erreur de l’API Gmail (${response.status}). Impossible de récupérer les messages.`);
  }

  const listData = await response.json();
  const messages: Array<{ id: string }> = listData.messages || [];

  if (messages.length === 0) {
    // Truthful empty array: NO matching messages in user's inbox
    return [];
  }

  // Fetch individual message snippets and metadata
  const results: DetectedFlightEmail[] = [];

  for (const item of messages.slice(0, 5)) {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        {
          headers: {
            Authorization: `Bearer ${inMemoryAccessToken}`,
          },
        }
      );

      if (!msgRes.ok) continue;

      const msgData = await msgRes.json();
      const headers = msgData.payload?.headers || [];
      const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'Sans objet';
      const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Inconnu';
      const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();
      const snippet = msgData.snippet || '';

      const extracted = extractFlightDataFromSnippet(snippet, subject);

      results.push({
        messageId: item.id,
        subject,
        sender: from,
        receivedDate: date,
        flightCode: extracted.flightCode,
        airline: extracted.airline,
        departure: extracted.departure,
        arrival: extracted.arrival,
        flightDate: extracted.flightDate,
        disruptionType: extracted.disruptionType,
        reportedDelayMinutes: extracted.reportedDelayMinutes,
        extractionConfidence: extracted.confidence,
        isSimulatedDemo: false,
      });
    } catch (msgErr) {
      console.warn(`[GmailService] Erreur lecture message ${item.id}:`, msgErr);
    }
  }

  return results;
}

/**
 * Creates a formal claim letter draft in user's Gmail box.
 * NEVER sends automatically: creates an editable draft under gmail.compose.
 */
export async function createClaimDraft(payload: ClaimDraftPayload): Promise<{
  success: boolean;
  draftId?: string;
  error?: string;
}> {
  if (!inMemoryAccessToken) {
    return {
      success: false,
      error: 'Non autorisé : Jeton d’accès Gmail requis pour créer un brouillon.',
    };
  }

  const { recipientEmail, subject, bodyText } = payload;
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return {
      success: false,
      error: 'Adresse email du destinataire (compagnie aérienne) invalide.',
    };
  }

  // Construct RFC 2822 email message
  const rawMessage = [
    `To: ${recipientEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    bodyText,
  ].join('\r\n');

  // Base64url encode
  const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${inMemoryAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          raw: encodedMessage,
        },
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.error?.message || `Erreur de création de brouillon (${response.status}).`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      draftId: data.id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Erreur réseau lors de la communication avec l’API Gmail.',
    };
  }
}
