import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, addWaitlistSubmission, saveFlightScan } from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security Middleware: JSON body limit to prevent memory exhaustion / DoS
app.use(express.json({ limit: '64kb' }));

// Standard Security Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Simple in-memory rate limiter per IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.',
      });
    }

    record.count += 1;
    next();
  };
}

const waitlistRateLimiter = createRateLimiter(15, 10 * 60 * 1000); // 15 submissions / 10m
const flightVerifyRateLimiter = createRateLimiter(20, 10 * 60 * 1000); // 20 verifications / 10m

// Initialize Gemini client with mandatory User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Helper to extract and sanitize web sources from grounding chunks
 */
interface GroundingSource {
  title: string;
  url: string;
}

function extractGroundingSources(response: any): GroundingSource[] {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const sources: GroundingSource[] = [];
  const seenUrls = new Set<string>();

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || 'Source d’information officielle';
    if (uri && typeof uri === 'string' && (uri.startsWith('http://') || uri.startsWith('https://'))) {
      if (!seenUrls.has(uri)) {
        seenUrls.add(uri);
        sources.push({
          title: title.slice(0, 120),
          url: uri,
        });
      }
    }
  }
  return sources.slice(0, 5);
}

// Bounded in-memory cache with TTL (1 hour) & maximum capacity (100 items)
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const flightCache = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 100;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCachedFlight(key: string): any | null {
  const entry = flightCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    flightCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedFlight(key: string, data: any) {
  if (flightCache.size >= CACHE_MAX_SIZE) {
    const firstKey = flightCache.keys().next().value;
    if (firstKey) flightCache.delete(firstKey);
  }
  flightCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

let quotaCooldownUntil = 0;
let cachedRegulatoryPulse: CacheEntry | null = null;

/**
 * POST /api/verify-flight
 * Query Google Search grounding with gemini-3.8-flash for actual flight incident & weather/strike reports
 */
app.post('/api/verify-flight', flightVerifyRateLimiter, async (req: Request, res: Response) => {
  const { flightCode, flightDate, departure, arrival } = req.body || {};

  if (!flightCode || typeof flightCode !== 'string' || flightCode.trim().length > 32) {
    return res.status(400).json({ error: 'Le code de vol est requis et doit être valide.' });
  }

  const cleanCode = flightCode.trim().toUpperCase().replace(/[^A-Z0-9\s-]/g, '').slice(0, 16);
  const cleanDep = typeof departure === 'string' ? departure.trim().slice(0, 64) : '';
  const cleanArr = typeof arrival === 'string' ? arrival.trim().slice(0, 64) : '';
  const cleanDate = typeof flightDate === 'string' ? flightDate.trim().slice(0, 32) : '';

  const cacheKey = `${cleanCode}-${cleanDep}-${cleanArr}-${cleanDate}`;
  const cached = getCachedFlight(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Truthful fallback when live search is unavailable: NEVER claim fake negative results or guarantee compensation
  const fallbackFlightResult = {
    summary: `Vérification du vol ${cleanCode} : Le service de recherche en direct n'a pas pu être interrogé ou aucun rapport public notoire n'a été indexé pour ce vol. L'absence d'information publique ne prouve pas l'absence de circonstance extraordinaire. Une vérification directe auprès du transporteur ou de l'aéroport reste nécessaire.`,
    disruptionAssessment: 'unverified_check_airline',
    verificationStatus: 'live_check_unavailable',
    groundingSources: [
      {
        title: 'Commission européenne — Droits des passagers aériens (Règlement 261/2004)',
        url: 'https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_fr.htm',
      },
      {
        title: 'DGAC — Direction Générale de l’Aviation Civile',
        url: 'https://www.ecologie.gouv.fr/passagers-aeriens-vos-droits',
      },
      {
        title: 'Eurocontrol — Tableau de bord des opérations de trafic aérien européen',
        url: 'https://www.eurocontrol.int',
      },
    ],
    fallback: true,
    checkedAt: new Date().toISOString(),
  };

  try {
    if (!ai || Date.now() < quotaCooldownUntil) {
      setCachedFlight(cacheKey, fallbackFlightResult);
      return res.json(fallbackFlightResult);
    }

    const queryPrompt = `Vérifie les incidents récents et les conditions de trafic aérien pour le vol ${cleanCode} reliant ${cleanDep} à ${cleanArr} (date prévue : ${cleanDate || 'récente'}).
Recherche les bulletins de grève (contrôleurs aériens, personnel au sol), alertes météo majeures, pannes techniques d'aéroports ou fermetures d'espaces aériens.
Réponds de manière concise (3 à 4 phrases maximum) en français avec :
1. Les événements signalés ou l'absence d'incident notoire.
2. L'évaluation : s'agit-il a priori d'une circonstance extraordinaire externe ou d'un retard lié à l'exploitation normale du transporteur sous le Règlement (CE) n° 261/2004 ? Mentionne clairement s'il y a incertitude.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: queryPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summaryText = response.text || 'Analyse effectuée via Google Search.';
    const sources = extractGroundingSources(response);

    const lower = summaryText.toLowerCase();
    const hasDisruptionNotice =
      lower.includes('grève') ||
      lower.includes('tempête') ||
      lower.includes('météo défavorable') ||
      lower.includes('panne radar') ||
      lower.includes('contrôle aérien');

    const isExtraordinaryMentioned =
      hasDisruptionNotice &&
      (lower.includes('circonstance extraordinaire') || lower.includes('exonératoire') || lower.includes('atc'));

    const result = {
      summary: summaryText,
      disruptionAssessment: isExtraordinaryMentioned
        ? 'potential_extraordinary_circumstance'
        : 'preliminary_no_major_strike_noted',
      verificationStatus: 'verified_with_grounding',
      groundingSources: sources.length > 0 ? sources : fallbackFlightResult.groundingSources,
      fallback: false,
      checkedAt: new Date().toISOString(),
    };

    setCachedFlight(cacheKey, result);
    return res.json(result);
  } catch (error: any) {
    const errorStr = String(error?.message || error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      quotaCooldownUntil = Date.now() + 10 * 60 * 1000; // 10 minutes cooldown
    }
    setCachedFlight(cacheKey, fallbackFlightResult);
    return res.json(fallbackFlightResult);
  }
});

/**
 * GET /api/regulatory-pulse
 * Query Google Search grounding with gemini-3.8-flash for latest EU 261 reform & court rulings
 */
app.get('/api/regulatory-pulse', async (_req: Request, res: Response) => {
  if (cachedRegulatoryPulse && Date.now() < cachedRegulatoryPulse.expiresAt) {
    return res.json(cachedRegulatoryPulse.data);
  }

  const fallbackRegulatoryResult = {
    summary: `Veille réglementaire CE 261/2004 : Le cadre légal consolidé demeure en vigueur. Les barèmes d'indemnisation forfaitaire (250 €, 400 €, 600 €) et le seuil jurisprudentiel de 3 heures issu des arrêts de la CJUE s'appliquent à tous les litiges en cours. Les propositions de révision au Conseil de l'Union européenne n'ont pas fait l'objet d'un accord définitif transposé en droit positif.`,
    groundingSources: [
      {
        title: 'EUR-Lex — Règlement (CE) n° 261/2004 consolidé',
        url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=celex%3A32004R0261',
      },
      {
        title: 'Cour de justice de l’Union européenne (CJUE) — Jurisprudence Passagers aériens',
        url: 'https://curia.europa.eu',
      },
      {
        title: 'Commission européenne — Droits des passagers et révision législative',
        url: 'https://transport.ec.europa.eu/transport-themes/passenger-rights_en',
      },
    ],
    fallback: true,
    lastChecked: new Date().toISOString(),
  };

  try {
    if (!ai || Date.now() < quotaCooldownUntil) {
      cachedRegulatoryPulse = { data: fallbackRegulatoryResult, expiresAt: Date.now() + 2 * 60 * 60 * 1000 };
      return res.json(fallbackRegulatoryResult);
    }

    const queryPrompt = `Quelle est l'actualité réglementaire et jurisprudentielle concernant le Règlement européen (CE) n° 261/2004 sur les droits des passagers aériens ?
Mentionne les décisions récentes de la CJUE ou les travaux législatifs au Conseil de l'UE en 3 phrases en français, en précisant le statut d'avancement exact sans extrapolations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: queryPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summaryText = response.text || 'Données réglementaires issues de Google Search.';
    const sources = extractGroundingSources(response);

    const result = {
      summary: summaryText,
      groundingSources: sources.length > 0 ? sources : fallbackRegulatoryResult.groundingSources,
      fallback: false,
      lastChecked: new Date().toISOString(),
    };

    cachedRegulatoryPulse = { data: result, expiresAt: Date.now() + 2 * 60 * 60 * 1000 };
    return res.json(result);
  } catch (error: any) {
    const errorStr = String(error?.message || error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      quotaCooldownUntil = Date.now() + 10 * 60 * 1000;
    }
    cachedRegulatoryPulse = { data: fallbackRegulatoryResult, expiresAt: Date.now() + 2 * 60 * 60 * 1000 };
    return res.json(fallbackRegulatoryResult);
  }
});

/**
 * POST /api/user/sync
 * Secure endpoint to synchronize Firebase Auth user profile into PostgreSQL
 */
app.post('/api/user/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    const displayName = req.user?.name || (typeof req.body?.displayName === 'string' ? req.body.displayName.slice(0, 128) : null);
    const photoUrl = req.user?.picture || (typeof req.body?.photoUrl === 'string' ? req.body.photoUrl.slice(0, 512) : null);

    if (!uid || !email) {
      return res.status(400).json({ error: 'UID et adresse email obligatoires.' });
    }

    const userRecord = await getOrCreateUser(uid, email, displayName, photoUrl);
    return res.json({ success: true, user: userRecord });
  } catch (error: any) {
    console.error('Erreur synchronisation utilisateur Cloud SQL:', error?.message || error);
    return res.status(500).json({ error: 'Échec de la synchronisation du compte utilisateur.' });
  }
});

/**
 * POST /api/waitlist
 * Adds waitlist submissions to PostgreSQL Cloud SQL with full questionnaire preservation
 */
app.post('/api/waitlist', waitlistRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, profile, frequency, notificationPref, surveyData } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Une adresse email valide est obligatoire.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 256) {
      return res.status(400).json({ error: 'Le format de l’adresse email est invalide.' });
    }

    if (!frequency || typeof frequency !== 'string') {
      return res.status(400).json({ error: 'La fréquence d’usage est obligatoire.' });
    }

    const cleanProfile = typeof profile === 'string' ? profile.slice(0, 64) : 'passager_frequent';
    const cleanFrequency = frequency.slice(0, 64);
    const cleanPref = typeof notificationPref === 'string' ? notificationPref.slice(0, 64) : 'forfait_fixe';
    const serializedSurvey = surveyData ? JSON.stringify(surveyData).slice(0, 5000) : null;

    const result = await addWaitlistSubmission({
      email: cleanEmail,
      profile: cleanProfile,
      frequency: cleanFrequency,
      notificationPref: cleanPref,
      surveyData: serializedSurvey,
    });

    if (result.isDuplicate) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        message: 'Cette adresse email est déjà inscrite sur la liste d’attente.',
      });
    }

    return res.status(201).json({
      success: true,
      submission: {
        id: result.submission?.id,
        email: cleanEmail,
        status: 'registered',
      },
    });
  } catch (error: any) {
    console.error('Erreur inscription waitlist Cloud SQL:', error?.message || error);
    return res.status(503).json({
      success: false,
      error: 'Le service de liste d’attente est momentanément indisponible. Veuillez réessayer.',
    });
  }
});

/**
 * POST /api/flight-scans
 * Secure endpoint to record flight compensation simulations to Cloud SQL
 * REQUIRES AUTHENTICATION: Caller cannot spoof userId.
 */
app.post('/api/flight-scans', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const authUid = req.user?.uid;
    const authEmail = req.user?.email;

    if (!authUid || !authEmail) {
      return res.status(401).json({ error: 'Authentification requise pour enregistrer un dossier.' });
    }

    // Map verified Firebase Auth UID to internal user
    const dbUser = await getOrCreateUser(authUid, authEmail, req.user?.name);
    const internalUserId = dbUser.id;

    const { flightNumber, flightDate, route, delayMinutes, amountEstimated, claimLetter } = req.body || {};

    if (!flightNumber || typeof flightNumber !== 'string') {
      return res.status(400).json({ error: 'Le numéro de vol est obligatoire.' });
    }

    const cleanFlightNumber = flightNumber.trim().toUpperCase().slice(0, 32);
    const cleanFlightDate = typeof flightDate === 'string' ? flightDate.trim().slice(0, 32) : undefined;
    const cleanRoute = typeof route === 'string' ? route.trim().slice(0, 128) : undefined;
    const parsedDelay = typeof delayMinutes === 'number' && delayMinutes >= 0 && delayMinutes <= 100000 ? delayMinutes : 0;
    const parsedAmount = typeof amountEstimated === 'number' && amountEstimated >= 0 && amountEstimated <= 10000 ? amountEstimated : 0;
    const cleanLetter = typeof claimLetter === 'string' ? claimLetter.slice(0, 8000) : undefined;

    const scan = await saveFlightScan({
      userId: internalUserId,
      flightNumber: cleanFlightNumber,
      flightDate: cleanFlightDate,
      route: cleanRoute,
      delayMinutes: parsedDelay,
      amountEstimated: parsedAmount,
      claimLetter: cleanLetter,
    });

    return res.status(201).json({ success: true, scan });
  } catch (error: any) {
    console.error('Erreur enregistrement flight-scans:', error?.message || error);
    return res.status(500).json({ error: 'Échec de la sauvegarde de l’analyse de vol.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rights Radar server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
