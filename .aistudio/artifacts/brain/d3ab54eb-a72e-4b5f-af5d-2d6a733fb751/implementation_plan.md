# Rights Radar — Intégration Search Grounding (Google Search & Gemini 3.8 Flash)

Intégration d'un ancrage en direct sur les données réelles du web via Google Search (`gemini-3.8-flash` avec l'outil `googleSearch`) pour enrichir Rights Radar sur deux volets clés : la vérification factuelle des causes de perturbation de vol (circonstances extraordinaires vs retards indemnisables) et la veille réglementaire en direct sur la révision du Règlement (CE) n° 261/2004, avec des badges de sources vérifiées cliquables.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Les choix d'intégration ont été validés lors de la phase d'échange :
> - **Périmètre fonctionnel** : Combinaison de la vérification de vol (perturbations effectives, grèves, météo) dans le simulateur et de la veille réglementaire en direct (Section 02 / S3).
> - **Restitution visuelle** : Badges de sources cliquables avec titre de page web et extrait vérifié, intégrés dans l'interface sans rupture d'ergonomie.
> - **Architecture serveur** : Routage backend Express (`server.ts`) sécurisé exploitant le SDK `@google/genai` avec `process.env.GEMINI_API_KEY` (aucune clé API exposée au client).

---

## 1. Overview & Core Concept

Rights Radar conserve son socle **local-first** et son éthique de transparence tout en offrant aux passagers la puissance de l'information en temps réel :

1. **Vérification factuelle de vol (`/api/verify-flight`)** :
   - Lorsqu'un utilisateur saisit un vol (ex. *AF 7632 le 15/09/2026* ou tout autre vol), Gemini 3.8 Flash interroge Google Search pour vérifier si des incidents notoires, pannes techniques, grèves de contrôleurs ou alertes météo majeures ont été signalés.
   - Restitution d'un statut clair : *Circonstances extraordinaires potentielles* vs *Retard imputable au transporteur*.
   - Affichage immédiat des articles et communiqués sources sous forme de badges cliquables (`groundingChunks.web`).

2. **Veille réglementaire dynamique (`/api/regulatory-pulse`)** :
   - Dans la section *Pourquoi maintenant ?* (S3), un bouton d'actualisation permet d'interroger Google Search pour obtenir l'état le plus récent des discussions institutionnelles (Parlement européen, Conseil de l'Union européenne, CJUE).
   - Les informations vérifiées s'affichent avec des liens hypertextes directs vers les sources officielles (EUR-Lex, communiqués du Conseil, etc.).

---

## 2. User Experience & Visual Design

### Parcours utilisateur dans le simulateur de vol
1. L'usager ouvre le simulateur et renseigne son numéro de vol, sa date et ses aéroports.
2. Un bouton interactif **« Vérifier les incidents en direct (Google Search) »** déclenche l'analyse ancrée.
3. Pendant la recherche, un indicateur d'état sobre s'anime avec discrétion (`Recherche des bulletins officiels et actualités...`).
4. À la réception de la réponse :
   - Synthèse factuelle concise en français.
   - Évaluation de l'impact sur l'éligibilité au Règlement CE 261/2004.
   - Rangée de **badges de sources cliquables** avec icône de lien externe, titre tronqué et domaine source.
5. L'utilisateur peut copier le courrier de réclamation mis à jour avec les éléments de fait vérifiés.

### Charte graphique et tokens
- **Palette** : Fond porcelaine chaud `#F4F1EA`, accents radar menthe `#43DDB0` pour les signaux positifs, ambre `#E7A63A` pour les alertes de circonstances extraordinaires, encre profonde `#101722` pour les panneaux techniques.
- **Typographie** : *Instrument Serif* pour les titres éditoriaux, *IBM Plex Sans* pour le texte de lecture et *JetBrains Mono* pour les codes de vol et métadonnées sources.
- **Badges de sources** : Boîtes compactes avec liseré fin `border border-white/15`, fond semi-transparent, favicône/lien externe et infobulle d'extrait au survol.

---

## 3. Key Product Decisions & Trade-Offs

- **Décision 1 : Exécution côté serveur (Express + `@google/genai`)**
  - *Choix retenu* : Mise en place d'un serveur `server.ts` exécutant Express en développement et en production (`tsx server.ts`), intégrant les middlewares Vite.
  - *Pourquoi* : Respect absolu des règles de sécurité de l'environnement (la clé `GEMINI_API_KEY` reste exclusivement sur le serveur, protégée de toute inspection client).

- **Décision 2 : Double ancrage (Vol + Cadre législatif)**
  - *Choix retenu* : Deux points d'accès API distincts (`/api/verify-flight` et `/api/regulatory-pulse`).
  - *Pourquoi* : Évite de mélanger les contextes de prompt et permet une réactivité granulaire selon la section consultée par l'usager.

- **Décision 3 : Préservation des règles du livrable autonome (`rights-radar-site.html`)**
  - *Choix retenu* : L'application React full-stack héberge la fonctionnalité active Search Grounding, tandis que les fichiers autonomes HTML documentent l'interface et le comportement de repli gracefully dégradé.

---

## 4. Technical Architecture & Data Strategy

### Diagramme d'architecture système

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Web (SPA)                       │
│  ┌──────────────────────┐        ┌───────────────────────┐  │
│  │  Simulateur de vol   │        │ Section S3 (Contexte) │  │
│  │ (FlightSimulatorModal)│       │   (WhyNowSection)     │  │
│  └──────────┬───────────┘        └───────────┬───────────┘  │
│             │                                │              │
│             │ POST /api/verify-flight        │ GET /api/... │
└─────────────┼────────────────────────────────┼──────────────┘
              ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Serveur Backend Express (server.ts)          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Contrôleurs d'API & Validation des requêtes          │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────▼────────────────────────────┐  │
│  │  Client @google/genai (model: gemini-3.8-flash)       │  │
│  │  tools: [{ googleSearch: {} }]                        │  │
│  └──────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Google Gemini API Gateway                 │
│         Interrogation Google Search + Grounding Chunks      │
└─────────────────────────────────────────────────────────────┘
```

### Contrat d'interface API

#### 1. `POST /api/verify-flight`
- **Corps de requête** :
  ```json
  {
    "flightCode": "AF 7632",
    "flightDate": "2026-09-15",
    "route": "Madrid (MAD) -> Paris (CDG)"
  }
  ```
- **Réponse** :
  ```json
  {
    "summary": "Aucune circonstance extraordinaire majeure signalée...",
    "disruptionAssessment": "likely_compensable",
    "groundingSources": [
      {
        "title": "Bulletin trafic aérien DGAC",
        "url": "https://..."
      }
    ]
  }
  ```

#### 2. `GET /api/regulatory-pulse`
- **Réponse** :
  ```json
  {
    "summary": "État d'avancement des négociations sur la révision du règlement (CE) 261/2004...",
    "groundingSources": [
      {
        "title": "Communiqué du Conseil européen",
        "url": "https://..."
      }
    ]
  }
  ```

---

## 5. Étapes d'exécution prévues

1. **Serveur Express full-stack (`server.ts`)** :
   - Création de `server.ts` avec Express et configuration de `@google/genai` (`gemini-3.8-flash` avec `googleSearch: {}`).
   - Mise à jour du script `"dev"` dans `package.json` pour lancer `tsx server.ts`.
2. **Composant UI pour les badges de sources (`src/components/SearchGroundingBadges.tsx`)** :
   - Affichage propre des badges cliquables, favicônes et titres tronqués avec infobulle.
3. **Mise à jour du simulateur (`src/components/FlightSimulatorModal.tsx`)** :
   - Intégration du bouton d'analyse en direct, gestion du chargement et affichage des résultats vérifiés par Google Search.
4. **Mise à jour de la section Contexte (`src/components/WhyNowSection.tsx`)** :
   - Ajout d'un volet d'actualité en direct sur la réglementation avec badges de sources officielles.
5. **Tests de non-régression & validation** :
   - Vérification de la suite de tests unitaires `tsx --test`.
   - Compilation avec `compile_applet` et vérification Playwright.
