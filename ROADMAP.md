# Mneme CE World Generator — Roadmap & Backlog

**Purpose:** Track planned features, future capabilities, and long-term vision for the Mneme CE World Generator. Items here are not yet implemented; they are design specs awaiting development time.

---

## Legend

| Status | Meaning |
|--------|---------|
| 🟢 **Planned** | Approved concept, ready for implementation when resourced |
| 🟡 **Spec Ready** | Detailed requirements written, may need prototyping or approval |
| 🔵 **Research** | Requires external analysis, data, or algorithm design before coding |
| ⚪ **Idea** | Conceptual only, no formal spec yet |

---

## 🟢 FR-031 — 2D Animated Planetary System Map

**Status:** 🟢 Planned — High value for referee play

### Objective
Give players and referees a visual, interactive representation of the generated planetary system. This aids navigation, encounter placement, and travel planning — especially for Brachistochrone trajectory calculations.

### Visual Design
- **Everything is a circle.** Abstraction over photorealism.
- Star = filled circle, colour-coded by spectral class.
- Planetary bodies = filled circles, sized relatively by mass tier (not to true scale, but readable).
- Orbits = thin concentric rings or arcs.
- Text labels = body type, zone, and optional custom annotation name.
- Child moons (if added later) = smaller circles orbiting their parent.

### Default Epoch
- **Default century: 2300 CE** (MTL 12 / CE TL 9.0)
- All orbital positions are calculated from this epoch.

### Time Control
- **Day slider:** Add/subtract days from the default epoch.
- All planetary positions recalculate and animate to their new orbital locations.
- No need for real-time clock animation — discrete day-stepping is preferred for RPG planning.

### Brachistochrone Aid
- Click **Origin body** → Click **Destination body**.
- Display approximate transfer angle and transit time assuming constant-thrust or Hohmann transfer (configurable).
- Visualise the trajectory arc as a dashed line.

### Data Binding
- All visual elements draw directly from `StarSystem` data.
- If a body has a custom annotation name, display that instead of the generic label.
- Hot Jupiter cleared zones can be shown as a faint "cleared" shadow.

### Technical Approach
- Canvas or SVG (SVG preferred for accessibility and text rendering).
- Logarithmic distance scaling so inner and outer zones fit on one screen.
- Responsive: works on phone (pinch-zoom, pan) and desktop (mouse drag, scroll zoom).

---

## 🟡 FR-032 — System Name Generator

**Status:** 🟡 Spec Ready

### Objective
Auto-generate evocative names for each star system based on stellar class, main world type, and a seeded random table.

### Examples
- "Krasnikov's Folly" (K-class, failed colony)
- "Silicate Halo" (Dwarf main world, metallic)
- "Ouroboros Station" (Habitat, artificial)
- "Bakunawa's Reach" (F-class, high population)

### Features
- Name appears in header and `.docx` export.
- Editable by user.
- Persistent in `localStorage` and exported JSON.

---

## 🟡 FR-033 — Orbital Weather & Seasonal Variation

**Status:** 🟡 Spec Ready

### Objective
For elliptical orbits or worlds with high axial tilt, calculate seasonal temperature shifts and orbital "weather" events.

### Features
- Given `distanceAU` and eccentricity (rolled or derived), compute insolation variation.
- Output: "Summer is +2 temperature bands" or "Perihelion brings inferno conditions."
- Useful for adventure seeds and habitability fine-tuning.

---

## 🔵 FR-034 — Companion Star Main World Fork

**Status:** 🔵 Research

### Objective
Allow the main world to orbit a **companion star** instead of the primary, when the companion is in the Conservative/Cold zone.

### Open Questions
- How does luminosity differ for a companion-orbiting world?
- Does this change the habitability formula?
- What % of systems should trigger this fork?

---

## 🟢 QA-025 — Scalable Terminology for Small Populations

**Status:** 🟢 Planned

### Objective
Replace large-scale language in Wealth and Development descriptions with scalable terms that work for colonies of 12 people up to trillions.

### Proposed Mapping
| Old | New |
|-----|-----|
| Economy | Fiscal condition / framework / resource base |
| Middle class | Specialist groups / core communal groups |
| Consumer goods | Vital supplies / surplus goods |
| Investment capital | Communal resources / shared reserves |
| Poverty | Scarcity / hardship |
| Ruling class | Dominant circle / leading families |

### Files Affected
- `src/lib/worldData.ts` (`WEALTH_DESCRIPTIONS`, `DEVELOPMENT_DESCRIPTIONS`, `CULTURE_TRAIT_DESCRIPTIONS`)

---

## 🟡 QA-ADD-002 — CSV Export Implementation

**Status:** 🟡 Spec Ready

### Objective
Implement the wide-row CSV export format already specified in `references/REF-012-csv-export-format.md`.

### Current State
- Spec is complete.
- `exportToCSV()` function in `src/data/exportCSV.ts` is pending.
- UI has a CSV button but no actual implementation.

---

## ⚪ FR-035 — Faction & Organisation Generator

**Status:** ⚪ Idea

### Objective
Generate 1-3 major factions per populated world with:
- Power level (Insignificant → Dominant)
- Resource base
- Public agenda vs hidden agenda
- Relationship to government and starport

### Use Case
Adventure hooks, trade negotiation obstacles, patron generation.

---

## ⚪ FR-036 — Random Encounter Tables by Zone

**Status:** ⚪ Idea

### Objective
Contextual random encounter tables:
- Surface encounters (by world type and hazard)
- Orbital encounters (by starport class and travel zone)
- Deep-space encounters (by stellar class and zone)

---

## 🟢 Infrastructure — Code Quality & Maintenance

| Task | Priority | Notes |
|------|----------|-------|
| Chunk size warning | Low | Vite bundle > 500KB — consider `manualChunks` or dynamic imports |
| TypeScript strict mode | Medium | Enable `strict: true` in `tsconfig.json` |
| Unit tests for `worldData.ts` tables | Medium | Validate table monotonicity and boundary rolls |
| E2E tests for generation pipeline | Low | Cypress or Playwright smoke tests |

---

## How to Propose a Roadmap Item

1. Open a discussion or draft an issue.
2. Include: **objective**, **affected files**, **proposed UI changes**, and **acceptance criteria**.
3. Tag with `roadmap` and either `feature-request` or `engine-change`.

**Last Updated:** 2026-04-15
