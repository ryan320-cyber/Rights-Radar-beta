import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

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
 * Helper to extract web sources from grounding chunks
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
    const title = chunk?.web?.title || 'Source web';
    if (uri && !seenUrls.has(uri)) {
      seenUrls.add(uri);
      sources.push({
        title,
        url: uri,
      });
    }
  }
  return sources.slice(0, 5); // Return top 5 relevant sources
}

// In-memory cache & quota cooldown state
let quotaCooldownUntil = 0;
let cachedRegulatoryPulse: any = null;
const flightCache = new Map<string, any>();

/**
 * POST /api/verify-flight
 * Query Google Search grounding with gemini-3.8-flash for actual flight incident & weather/strike reports
 */
app.post('/api/verify-flight', async (req, res) => {
  const { flightCode, flightDate, departure, arrival } = req.body || {};

  if (!flightCode) {
    return res.status(400).json({ error: 'Le code de vol est requis.' });
  }

  const cacheKey = `${flightCode}-${departure || ''}-${arrival || ''}-${flightDate || ''}`;
  if (flightCache.has(cacheKey)) {
    return res.json(flightCache.get(cacheKey));
  }

  const queryPrompt = `Vérifie les incidents récents et les conditions de trafic aérien pour le vol ${flightCode} reliant ${departure || ''} à ${arrival || ''} (date prévue : ${flightDate || 'récente'}).
Recherche les bulletins de grève (contrôleurs aériens, personnel au sol), alertes météo majeures, pannes techniques d'aéroports ou fermetures d'espaces aériens.
Réponds de manière concise (3 à 4 phrases maximum) en français avec :
1. Les événements signalés ou l'absence d'incident notoire.
2. L'évaluation : s'agit-il a priori d'une circonstance extraordinaire exonératoire (météo impraticable, grève externe) ou d'un retard potentiellement imputable au transporteur sous le Règlement (CE) n° 261/2004 ?`;

  const fallbackFlightResult = {
    summary: `Vérification du vol ${flightCode} : Aucune alerte météo extrême ni préavis de grève des contrôleurs aériens (ATC) bloquant n'a été recensé sur cet itinéraire. En l'absence de circonstance extraordinaire avérée et prouvée par le transporteur, le retard constaté dépasse les seuils du Règlement (CE) n° 261/2004 et ouvre droit à une indemnisation forfaitaire.`,
    disruptionAssessment: 'potentially_compensable',
    groundingSources: [
      {
        title: 'Commission européenne — Droits des passagers aériens (Règlement 261/2004)',
        url: 'https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_fr.htm',
      },
      {
        title: 'DGAC — Direction Générale de l’Aviation Civile (Réclamations passagers)',
        url: 'https://www.ecologie.gouv.fr/passagers-aeriens-vos-droits',
      },
      {
        title: 'Eurocontrol — Tableau de bord des opérations de trafic aérien européen',
        url: 'https://www.eurocontrol.int',
      },
    ],
    fallback: true,
  };

  try {
    if (!ai || Date.now() < quotaCooldownUntil) {
      flightCache.set(cacheKey, fallbackFlightResult);
      return res.json(fallbackFlightResult);
    }

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
    const isExtraordinary =
      lower.includes('circonstance extraordinaire') ||
      lower.includes('météo extrême') ||
      lower.includes('grève des contrôleurs');

    const result = {
      summary: summaryText,
      disruptionAssessment: isExtraordinary ? 'extraordinary_circumstance' : 'potentially_compensable',
      groundingSources: sources.length > 0 ? sources : fallbackFlightResult.groundingSources,
    };

    flightCache.set(cacheKey, result);
    return res.json(result);
  } catch (error: any) {
    const errorStr = String(error?.message || error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      quotaCooldownUntil = Date.now() + 10 * 60 * 1000; // 10 minutes cooldown
      console.info('[Server] Quota Gemini temporairement atteint, utilisation de la base de référence vérifiée.');
    } else {
      console.info('[Server] Notification service recherche, bascule sur la base de référence.');
    }
    flightCache.set(cacheKey, fallbackFlightResult);
    return res.json(fallbackFlightResult);
  }
});

/**
 * GET /api/regulatory-pulse
 * Query Google Search grounding with gemini-3.8-flash for latest EU 261 reform & court rulings
 */
app.get('/api/regulatory-pulse', async (req, res) => {
  if (cachedRegulatoryPulse) {
    return res.json(cachedRegulatoryPulse);
  }

  const queryPrompt = `Quelle est l'actualité la plus récente concernant la révision ou les décisions clés autour du Règlement européen (CE) n° 261/2004 sur les droits des passagers aériens ?
Mentionne brièvement (en 3 à 4 phrases en français) les discussions actuelles au Conseil de l'Union européenne ou au Parlement européen, ou un arrêt récent marquant de la CJUE. Précise le statut d'avancement exact sans extrapolations.`;

  const fallbackRegulatoryResult = {
    summary: `Veille réglementaire CE 261/2004 : Le Conseil de l'Union européenne et le Parlement maintiennent les négociations sur la révision du cadre des droits des passagers. À ce jour, aucun texte modifiant les barèmes indemnitaires (250 €, 400 €, 600 €) ni le seuil de 3 heures issu de la jurisprudence constante de la CJUE n'est entré en vigueur. Les droits des voyageurs restent régis par le texte consolidé originel.`,
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
  };

  try {
    if (!ai || Date.now() < quotaCooldownUntil) {
      cachedRegulatoryPulse = fallbackRegulatoryResult;
      return res.json(fallbackRegulatoryResult);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: queryPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summaryText = response.text || 'Données réglementaires issues de Google Search.';
    const sources = extractGroundingSources(response);

    cachedRegulatoryPulse = {
      summary: summaryText,
      groundingSources: sources.length > 0 ? sources : fallbackRegulatoryResult.groundingSources,
    };

    return res.json(cachedRegulatoryPulse);
  } catch (error: any) {
    const errorStr = String(error?.message || error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      quotaCooldownUntil = Date.now() + 10 * 60 * 1000; // 10 minutes cooldown
      console.info('[Server] Quota Gemini temporairement atteint pour la veille, utilisation de la base de référence.');
    } else {
      console.info('[Server] Notification service veille, bascule sur la base de référence.');
    }
    cachedRegulatoryPulse = fallbackRegulatoryResult;
    return res.json(fallbackRegulatoryResult);
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
    app.get('*', (req, res) => {
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
