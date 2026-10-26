# Site Notes — Rights Radar

## 1. Executive Summary
Rights Radar is an original, French-language, local-first web application designed to detect potential flight disruption compensations, estimate potential claim values under applicable regulations, prepare claim letters, and track legal deadlines without sending private booking data to external servers.

## 2. Unresolved `[À VÉRIFIER]` Staging Items
- **European Passenger Rights Agreement Wording**:
  - Item: Statement regarding "accord provisoire annoncé en juin 2026" on passenger rights regulation updates.
  - Staging status: Flagged with `data-review="true"` and visible amber review badge when accessed with `?review=1`.
  - Required verification: Confirmation from EU Council / EUR-Lex press releases on final text publication before removing staging review flag.

## 3. Architecture & Design Decisions
- **Palette**: Warm porcelain (`#F4F1EA`), dark ink (`#101722`), radar mint (`#43DDB0` for detections/eligible status), alert amber (`#E7A63A` for deadlines/review items).
- **Typography**: Google Fonts pairing — Instrument Serif (display/editorial), IBM Plex Sans (body/UI), JetBrains Mono (flight codes & figures).
- **Radar Canvas**: Custom HTML5 Canvas 2D/3D radar module featuring concentric range rings, radial grid, sweep beam, interactive node hover tooltips, and `IntersectionObserver` auto-pause.
- **Local-First Privacy**: No user confirmation emails or PDF attachments leave the browser. All document parsing is handled client-side.
- **Accessibility**: Skip link to main content (`#main-content`), full ARIA landmarks, modal focus traps, Escape-key handling, live region feedback (`aria-live="polite"`), and WCAG AA contrast compliance.

## 4. Waitlist Endpoint Status
- **Configuration**: `WAITLIST_ENDPOINT = null` in `src/utils/waitlist.ts`.
- **Demo / Staging Behavior**: Submissions validate email formatting and mandatory usage radio selection, prevent duplicate email entries, log the payload to console in staging, and return the confirmation message: *"Merci. Nous vous écrirons à l'ouverture."*
- **Production Persistence**: To persist entries, update `WAITLIST_ENDPOINT` with a secure server endpoint URL.

## 5. QA Checklist Results
- [x] **No copied layout/imagery from reference studio sites**: Original Rights Radar flight disruption concept.
- [x] **No fabricated proof or guarantees**: No "100 % récupéré" or "garantir" claims.
- [x] **Product mockups explicitly labelled « Maquette »**: All cards in Section S4 display « Maquette » badges.
- [x] **Fictional examples explicitly labelled**: Section S2 departures board states "Tableau fictif, à titre illustratif".
- [x] **Sourced statistics**: Section S2 45% statistic tagged as `Transport Focus, 2026 [organisme public] (trains, pas avions)`.
- [x] **Waitlist form validation & duplicate prevention**: Unit-tested and verified with `node:test`.
- [x] **Responsive design**: Fully responsive down to 390px mobile viewports.
- [x] **Accessibility**: Screen-reader accessible radar readout, ARIA dialogs, live region announcements, keyboard focus traps.
- [x] **Reduced motion**: Respects `prefers-reduced-motion: reduce` by disabling sweep spin and canvas animations.

## 6. Motion Design & Expérience Utilisateur (« The Living Radar »)
- **Séquence d'intro cinématique Unseen Studio (`OpeningIntro`)** : Mascotte animée aux yeux expressifs avec ailes battantes, suivi interactif des pupilles à la souris, clignements naturels, compteur de progression `[0%] → [100%]`, boutons `Entrer dans l'expérience ↘` et `Entrer sans audio`.
- **Moteur Audio d'Ambiance Spatial (`ambientAudio.ts`)** : Synthèse native Web Audio API (pads harmoniques chaleureux et pings radar subtils sans téléchargement externe) avec égaliseur dynamique animé dans l'en-tête.
- **Entrées Cinématiques Décalées Framer Motion (`App.tsx`)** : Chaque section majeure est enveloppée dans `motion.section` avec `initial={{ opacity: 0, y: 40 }}`, `whileInView={{ opacity: 1, y: 0 }}` et transition fluide `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Explorateur 3D de Cas & Jurisprudence (`RadarCaseExplorer`)** : Sphère interactive en filigrane et cartes 3D inclinables au survol pour analyser les arrêts majeurs (Sturgeon, Wallentin-Hermann, Folkerts) et cas concrets.
- **Enquête Passagers & Liste d'Attente Complète (`WaitlistSection`)** : 8 questions approfondies (fréquence, perturbations vécues, compagnies habituelles, expérience passée, modèle de prix forfaitaire 9-14 €, fonctionnalités attendues, suggestions libres) avec persistance directe dans Firestore `waitlist_submissions`.

