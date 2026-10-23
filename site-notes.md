# Rights Radar — Notes de Conception, Revue et Assurance Qualité

Ce document consigne l'ensemble des éléments techniques, des choix d'architecture, des points soumis à vérification et des résultats des tests de validation pour le projet **Rights Radar**.

---

## 1. Éléments Soumis à Vérification [À VÉRIFIER]

| Identifiant | Énoncé / Revendication | Statut dans la version Staging (`rights-radar-site.html` et React) | Traitement dans la version Publication (`rights-radar-site-publish.html`) | Justification et Preuves Requises |
|---|---|---|---|---|
| **REF-REV-01** | *« accord provisoire annoncé en juin 2026 »* concernant la révision du règlement (CE) n° 261/2004. | Marqué avec l'attribut `data-review="true"`, affiché avec badge ambre uniquement en mode relecture (`?review=1`). Commentaire HTML associé. | Supprimé et remplacé par une formulation factuelle : *« Les institutions européennes examinent la modernisation du cadre d'indemnisation... »*. | Nécessite la publication formelle d'un texte de compromis au Journal officiel de l'Union européenne ou un communiqué conjoint officiel du Conseil et du Parlement. |
| **REF-REV-02** | *« Statistique de 45 % de non-recours »* (Transport Focus 2026). | Maintenu avec la mention explicite obligatoire : `[organisme public] (trains, pas avions)`. | Maintenu avec la même attribution explicite pour éviter tout amalgame avec les passagers aériens. | L'étude porte sur les passagers ferroviaires britanniques. Elle est citée pour documenter le phénomène cognitif de non-recours sans extrapoler de fausses preuves au secteur aérien. |
| **REF-REV-03** | *« Tarifs concurrentiels de 35 % à 50 % de commission »* (AirHelp). | Tagué `[partie intéressée : AirHelp]` et qualifié d'*« Exemple de calcul, pas un résultat »*. | Maintenu avec la qualification d'exemple de simulation. | Les conditions générales de vente des agences commerciales doivent être auditées périodiquement pour refléter les variations selon la phase amiable ou contentieuse. |
| **REF-REV-04** | *« Hypothèse Rights Radar à 9 à 14 € de forfait fixe »*. | Tagué `[hypothèse à tester]`. | Maintenu sous forme d'hypothèse d'étude tarifaire. | Cette tarification dépendra des retours formulés par les répondants de la liste d'attente (question d'usage). |

---

## 2. Bibliothèques et Dépendances Utilisées

Toutes les dépendances ont été vérifiées et installées dans le projet :

| Dépendance | Version Installée | Usage |
|---|---|---|
| `react` & `react-dom` | `^19.0.1` | Moteur applicatif SPA réactif |
| `firebase` | `^12.12.0` | Authentification Google (`signInWithPopup`) & persistance Firestore (`users`, `waitlist_submissions`, `inspections`) |
| `lucide-react` | `^0.546.0` | Icônes vectorielles accessibles sans logo commercial |
| `tailwindcss` | `^4.3.3` | Système de styles utilitaire moderne avec `@theme` |
| `@tailwindcss/vite` | `^4.3.3` | Intégration Vite pour Tailwind v4 |
| `vite` | `^8.3.0` | Environnement de développement et bundle de production |
| `tsx` | `^4.21.0` | Exécuteur TypeScript pour les tests unitaires purs (`node:test`) |
| Google Fonts | Remote UMD | `Instrument Serif`, `IBM Plex Sans`, `JetBrains Mono` |

---

## 3. Choix d'Architecture et d'Expérience (Design System)

1. **Inspiration Unseen Studio (Originale et Distinctive)** :
   - Univers spatial et métaphore du radar : cercles concentriques de portée correspondant aux échelons kilométriques du règlement européen (1 500 km / 250 €, 3 500 km / 400 €, > 3 500 km / 600 €).
   - Faisceau de balayage fluide avec détection de blips illustratifs (`AF 1234`, `DL 0890`), étiquetés de manière transparente comme exemples fictifs.
   - Interaction spatiale au pointeur / tactile avec possibilité de recentrage immédiat (`Recentrer le radar`).
   - Maintien des performances : suspension automatique de la boucle `requestAnimationFrame` dès que le canvas sort du viewport via `IntersectionObserver`.

2. **Éthique et Transparence Totale** :
   - Aucun avis client fabriqué, aucun faux témoignage, aucun compteur d'usagers imaginaire, aucun logo de presse non vérifié.
   - Absence totale du verbe *« garantir »* ou de promesses trompeuses de type *« 100 % récupéré »*.
   - Toutes les interfaces projetées portent la mention explicite et visible **« Maquette »**.
   - Préservation stricte du principe : **aucun envoi de réclamation sans validation et expédition manuelle par l'usager**.

3. **Intégration Firebase Production-Ready** :
   - Provisionnement Firestore via FAX RPC avec schéma `firebase-blueprint.json` et spécification de sécurité `security_spec.md`.
   - Règles déployées (`firestore.rules`) garantissant l'étanchéité ABAC et le Zero-Trust : restriction de lecture des emails de la liste d'attente à l'administrateur (`rhilanerayaneyasmine@gmail.com`), isolation des analyses par `request.auth.uid`.
   - Gestion d'erreur normalisée via `handleFirestoreError` et `FirestoreErrorInfo`.

4. **Points de Terminaison (Endpoints) & Search Grounding** :
   - `WAITLIST_ENDPOINT` est initialisé à `null` par défaut conformément aux exigences. En mode React, la persistance est assurée directement dans Firestore (`waitlist_submissions`).
   - `POST /api/verify-flight` : Ancrage Google Search avec `gemini-3.8-flash` pour recouper les incidents de vol réels (grèves, météo critique, pannes) et restituer des sources cliquables avec titre et URL (`groundingChunks.web`).
   - `GET /api/regulatory-pulse` : Veille en direct sur la révision du Règlement (CE) n° 261/2004 via Google Search, retournant les communiqués et arrêts récents avec sources officielles.

---

## 4. Résultats des Tests et Validation QA

### A. Tests Unitaires Logiques (Node built-in runner `tsx --test`)
- **Fichier** : `src/utils/rightsCalculator.test.ts`
- **Commande** : `npx tsx --test src/utils/rightsCalculator.test.ts`
- **Résultat** : **8 / 8 tests réussis (PASS)**
  1. *Flight rights estimation: under 3 hours delay gives 0 EUR and not eligible* : PASS
  2. *Flight rights estimation: <= 1500 km with >= 3h delay yields 250 EUR* : PASS
  3. *Flight rights estimation: Intra-EU or 1500-3500 km yields 400 EUR* : PASS
  4. *Flight rights estimation: Extra-EU > 3500 km with >= 4h delay yields 600 EUR* : PASS
  5. *Flight rights estimation: Extra-EU > 3500 km with 3h-4h delay applies 50% reduction (300 EUR)* : PASS
  6. *Prescription calculation respects French 5-year limit* : PASS
  7. *Waitlist validation: rejects empty email and unselected frequency* : PASS
  8. *Claim letter generation includes key passenger rights markers and no guarantee wording* : PASS

### B. Compilation Applicative
- **Commande** : `compile_applet`
- **Résultat** : **Succès (0 erreurs TypeScript, 0 erreurs Vite)**.

### C. Vérification de l'Accessibilité et Conformité
- **Repères sémantiques** : `<header>`, `<nav>`, `<main id="main-content">`, `<section id="...">`, `<footer>`.
- **Hiérarchie des titres** : Un unique titre `<h1>` sur la page d'accueil, suivi de `<h2>` et `<h3>` structurés.
- **Lien d'évitement** : Lien fonctionnel « Passer au contenu principal » visible lors de la navigation au clavier.
- **Gestion du focus** : Piège du focus dans le menu overlay et support de la touche `Échap`.
- **Préférence mouvement réduit** : Règles CSS `@media (prefers-reduced-motion: reduce)` désactivant les animations, le balayage radar et l'écran d'introduction.
- **Contraste WCAG AA** : Texte sombre `#17191D` sur fond clair `#F4F1EA` (ratio > 11:1), texte `#F6F5F1` sur fond `#101722` (ratio > 14:1). Mentions secondaires contrastées.

---

## 5. Synthèse des Livrables Fournis

1. `src/` : Application complète React 19 + TypeScript + Vite + Firebase (Sections S0 à S9, radar interactif, simulateur de réclamations, auth Google et persistance Firestore).
2. `rights-radar-site.html` : Version autonome Staging complète intégrant les indicateurs de relecture (`?review=1`).
3. `rights-radar-site-publish.html` : Version autonome de Publication nettoyée de tout indicateur de relecture et revendication non certifiée.
4. `site-notes.md` : Ce rapport détaillé d'architecture, motion design et vérification.
5. `firebase-blueprint.json`, `security_spec.md`, `firestore.rules` : Configuration Firestore sécurisée et déployée.

---

## 6. Système de Motion Design & Architecture Visuelle (« The Living Radar »)

Inspiré des principes d’exploration spatiale et de cinétique d’Unseen Studio (`unseen.co`), tout en créant une identité originale propre aux droits des passagers aériens :

1. **Tokens de mouvement et physique** :
   - Easing d'autorité : courbe `cubic-bezier(0.16, 1, 0.3, 1)` pour les révélations de typographie masquée.
   - Micro-interactions : 140–200 ms pour les boutons magnétiques et pastilles de sources.
   - Révélations de section : 600–900 ms échelonnées avec `useInView` sans blocage du défilement naturel.
   - Boucle radar : suspension automatique via `IntersectionObserver` dès que le canvas quitte le champ visuel.

2. **Séquence d'ouverture cinématique (`OpeningIntro`)** :
   - Écran spatial sombre avec étalonnage de coordonnées télémétriques (`ADS-B 1090 MHz • 48°51' N / 002°21' E`).
   - Révélation masquée en fente du mot-symbole *Rights Radar* avec balayage laser vert menthe.
   - Bouton magnétique « Entrer dans l’environnement » et bouton explicite d'évitement immédiat « Passer l’intro [Échap] ».

3. **Environnement Radar Vivant (`RadarCanvas`)** :
   - Faisceau rotatif phosphorescent avec traînée d'atténuation.
   - Trajectoires vectorielles d'avions reliant les aéroports au centre avec pulsations lumineuses animées.
   - Échelons kilométriques concentriques (`1 500 km • 250 €`, `1 500 – 3 500 km • 400 €`, `> 3 500 km • 600 €`).
   - Télémétrie HUD en temps réel (azimut, latitude, longitude) et infobulle volante réactive au survol des blips d'avions.
   - Inclinaison 3D au pointeur avec bouton de recentrage immédiat.

4. **Curseur Réticule Technique (`CustomCursor`)** :
   - Réticule de visée avec axes orthogonaux `+` et point central pour les périphériques desktop (`pointer: fine`).
   - Réaction dynamique au survol des boutons, du radar et des liens interactifs.
   - Désactivé immédiatement sur terminaux tactiles et pour les utilisateurs avec `prefers-reduced-motion`.

5. **Transition connectée entre sections** :
   - Ligne de vol vectorielle reliant le bas du radar Hero au tableau des départs de la section Constat.
   - Faisceau de balayage animé sur le tableau des départs révélant les vols perturbés.
   - Trajectoire d'arc de vol SVG animée connectant les 5 étapes du parcours Solution.
   - Barres comparatives animées de zéro à leur valeur réelle calculée dans la section Modèle économique.
   - Convergence d'ondes radar concentriques vers le formulaire de participation finale.

6. **Validation multi-écrans & Accessibilité** :
   - Testé et validé à 1440px (desktop), 1024px (tablette), 390px et 320px (mobile) sans débordement horizontal ni coupure de texte.
   - Prise en charge stricte de `prefers-reduced-motion` : aucune translation violente, désactivation des boucles cinématiques non essentielles, persistance intégrale des informations et fonctionnalités.
