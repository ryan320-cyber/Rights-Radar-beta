# Implementation Plan — Restore & Respect Index Navigation

Restore seamless Index menu navigation, align section anchors across all 7 indexed sections, and implement live active section tracking in the Index overlay without modifying unrequested project components.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Confirmed Choice 1**: Restore anchor link mapping (`#probleme`, `#pourquoi-maintenant`, `#solution`, `#engagements`, `#comparaison`, `#besoins`, `#inscription`) so clicking any Index item smoothly targets its section.
> - **Confirmed Choice 2**: Add live active section tracking (IntersectionObserver) and a progress indicator bar inside the Index overlay (`MenuOverlay.tsx`).

---

## 1. Overview & Core Concept

The Index overlay (`MenuOverlay.tsx`) lists 7 primary sections corresponding to the Rights Radar project structure:
1. **01 — Constat** (`#probleme`)
2. **02 — Contexte & Veille** (`#pourquoi-maintenant`)
3. **03 — Fonctionnement** (`#solution`)
4. **04 — Déontologie** (`#engagements`)
5. **05 — Modèle économique** (`#comparaison`)
6. **06 — Attentes & Besoins** (`#besoins`)
7. **07 — Liste d'attente** (`#inscription`)

This plan restores dual-anchor compatibility on all section components so both semantic named anchors (`id="probleme"`, etc.) and short codes (`id="S2"`, etc.) work flawlessly from the menu and header.

---

## 2. User Experience & Visual Design

- **Index Menu Alignment**:
  - Clicking any of the 7 index items closes the overlay and smoothly scrolls directly to the chosen section on the page.
  - Active section highlight badge (e.g. `[ VOLET ACTUEL ]` in `#43DDB0` mint) next to the currently visible section in the Index list.
  - Progress bar at the top of the Index overlay showing completion percentage through the 7 sections (`01` to `07`).

- **Section Anchor Mapping Table**:
  | Index # | Index Label | Target Anchor | Section Component |
  |---|---|---|---|
  | `01` | Constat | `#probleme` / `#S2` | `ProblemSection.tsx` |
  | `02` | Contexte & Veille | `#pourquoi-maintenant` / `#S3` | `WhyNowSection.tsx` |
  | `03` | Fonctionnement | `#solution` / `#S4` | `SolutionSection.tsx` |
  | `04` | Déontologie | `#engagements` / `#S5` | `CommitmentsSection.tsx` |
  | `05` | Modèle économique | `#comparaison` / `#S6` | `ComparisonSection.tsx` |
  | `06` | Attentes & Besoins | `#besoins` / `#S7` | `NeedsSection.tsx` |
  | `07` | Liste d’attente | `#inscription` / `#S8` | `WaitlistSection.tsx` |

---

## 3. Technical Architecture & Component Changes

```
┌────────────────────────────────────────────────────────┐
│               MenuOverlay / Header Nav                 │
└──────────────────────────┬─────────────────────────────┘
                           │ Smooth Scroll & Active Tracking
                           ▼
┌────────────────────────────────────────────────────────┐
│                     App.tsx                            │
│  <ScrollSection>                                       │
│    ├── #probleme / #S2       -> ProblemSection         │
│    ├── #pourquoi-maintenant  -> WhyNowSection          │
│    ├── #solution / #S4       -> SolutionSection        │
│    ├── #engagements / #S5    -> CommitmentsSection     │
│    ├── #comparaison / #S6    -> ComparisonSection      │
│    ├── #besoins / #S7        -> NeedsSection           │
│    └── #inscription / #S8    -> WaitlistSection        │
└────────────────────────────────────────────────────────┘
```

- **Files to Modify**:
  - `src/components/ProblemSection.tsx`: Add `id="probleme"` (or dual `id="probleme"` & `id="S2"`).
  - `src/components/WhyNowSection.tsx`: Add `id="pourquoi-maintenant"` (or dual `id="pourquoi-maintenant"` & `id="S3"`).
  - `src/components/SolutionSection.tsx`: Add `id="solution"` (or dual `id="solution"` & `id="S4"`).
  - `src/components/CommitmentsSection.tsx`: Add `id="engagements"` (or dual `id="engagements"` & `id="S5"`).
  - `src/components/ComparisonSection.tsx`: Add `id="comparaison"` (or dual `id="comparaison"` & `id="S6"`).
  - `src/components/NeedsSection.tsx`: Add `id="besoins"` (or dual `id="besoins"` & `id="S7"`).
  - `src/components/WaitlistSection.tsx`: Add `id="inscription"` (or dual `id="inscription"` & `id="S8"`).
  - `src/components/MenuOverlay.tsx`: Add active section state, scrollspy tracking, and live progress indicator.

---

## 4. Verification Plan

1. Run `compile_applet` and `lint_applet` to verify zero TypeScript errors.
2. Launch Playwright test to verify clicking each of the 7 items in the Index menu smoothly scrolls to the exact section.
