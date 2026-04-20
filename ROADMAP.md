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

## ✅ FRD-047 — Batch Management + Star Systems Tab *(In Progress v1.4.0)*

**Status:** ✅ M1-M2 Complete | M3 In Progress

**Implementation:** `src/components/SystemsView.tsx`, `src/lib/db.ts`, `src/types/index.ts`

### Completed (M1-M2)
- `StarSystemBatch` type + `batchId` on `StarSystem`
- IndexedDB v2 schema with `batches` table
- Legacy systems migration → "Legacy Systems" batch
- Batch CRUD: create, rename, delete, list
- Systems tab in navigation with batch selector
- Active batch tracking via `localStorage`
- Auto-join active batch on new system generation
- Export batch to `.mneme-batch` JSON
- Import `.mneme-map` from 3D map → create batch + generate worlds

### Pending (M3)
- Progress UI for batch generation ("Generating 3/20...")
- Dashboard "Recent Batches" section
- Export batch to 3D Map format (`.mneme-map`)
- Import `.mneme-batch` files

---

## 🟡 FR-031 — 2D Animated Planetary System Map

**Status:** 🟡 In Progress — Phases 0–5 complete; Phase 6 pending

**Implementation:** Extracted to standalone repo `Game-in-the-Brain/2d-star-system-map`.  
Local path: `/home/justin/opencode260220/2d-star-system-map`  
Live URL: `https://game-in-the-brain.github.io/2d-star-system-map/`

### Completed (Phases 0–5)
- Canvas-based animated orbital map; stars, planets, disks, gas giants
- Logarithmic distance scaling; zoom/pan (mouse + pinch touch)
- Full time controls: play/pause/reverse, speed ×0.25–×365, step ±1d/±7d
- Seeded starfield + nebula procedural background (Mulberry32 PRNG)
- Disk point-field rendering; label culling; off-screen culling
- MWG integration: "View System Map" button in SystemViewer.tsx encodes live StarSystem as Base64 URL param

### Phase 6 — Pending
- Body tooltips on tap/hover
- Brachistochrone transfer arc visualisation
- Retrograde orbit option
- Rings and moons (INTRAS Level 2)

### Testing
- Test harness at `test.html` — loads 1 000 batch worlds from `public/test-batch.json`, filterable table, opens any world in the renderer

---

## ✅ FR-032 — Economic Engine Customization *(Completed v1.3.85–v1.3.109)*

Shipped. See `260416-fr032-fr033-spec.md` and VERSIONS.md entries v1.3.83–v1.3.109 for full history. Key deliverables:
- `TLProductivityPreset` type + Mneme / CE built-in presets
- Settings "Economic Assumptions" panel — preset selector, Boat-Years calibration, growth curve, SOC-income grid
- Table-weight customization (Development, Power, Government) with named presets
- Ships in Area preset-aware scarcity multiplier (QA-047)
- Ships Price List modal with income-years display (FR-034)

**Open work (queued):** QA-049 (model toggle), QA-056 (average-SOC GDP), QA-057 (redundancy analysis), QA-058 (ships rework)

---

## ✅ FR-033 — Sector Dynamics Goal-Loop *(Completed v1.3.99)*

Shipped. Generator panel includes goal-loop controls: minimum starport class, minimum population, minimum habitability. Loops up to configurable max attempts, reports success/fail.

---

## 🟡 FR-035 — System Name Generator

**Status:** 🟡 Spec Ready  
*(Previously filed as FR-032 before economy feature claimed that number)*

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

## 🟡 FR-036 — Orbital Weather & Seasonal Variation

**Status:** 🟡 Spec Ready  
*(Previously filed as FR-033 before Sector Dynamics claimed that number)*

### Objective
For elliptical orbits or worlds with high axial tilt, calculate seasonal temperature shifts and orbital "weather" events.

### Features
- Given `distanceAU` and eccentricity (rolled or derived), compute insolation variation.
- Output: "Summer is +2 temperature bands" or "Perihelion brings inferno conditions."
- Useful for adventure seeds and habitability fine-tuning.

---

## 🔵 FR-037 — Companion Star Main World Fork

**Status:** 🔵 Research  
*(Previously filed as FR-034 before Ships Price List claimed that number)*

### Objective
Allow the main world to orbit a **companion star** instead of the primary, when the companion is in the Conservative/Cold zone.

### Open Questions
- How does luminosity differ for a companion-orbiting world?
- Does this change the habitability formula?
- What % of systems should trigger this fork?

---

## ✅ QA-025 — Scalable Terminology for Small Populations *(Completed v1.3.96)*

**Status:** ✅ Done — Wealth/Development descriptors now use scalable language below population 10 000. See VERSIONS.md v1.3.96.

---

## 🟢 QA-049 — Economic Model Toggle (Stable vs Compounding)

**Status:** 🟢 Planned — prerequisites (QA-056/057/058/061) now complete

### Objective
Surface the active economic curve (Stable / Compounding) as a **first-class user choice** alongside the preset selector in Settings. Currently the Mneme vs CE preset already controls this, but the toggle should make the distinction explicit for users who don't understand what "Mneme" vs "CE" means.

### Proposed UI
- In the "Economic Assumptions" panel in Settings: add a toggle/radio labelled **"Growth Model"**
  - **Compounding** — productivity compounds per TL (Mneme default). Each TL step multiplies per-capita income ~3.3×.
  - **Stable** — flat income across all TLs (CE/Traveller). Only habitability and dev/wealth drive starport class.
- Selecting a model pre-fills the preset to the matching built-in (Mneme or CE) but still allows further customization.
- Badge on System Viewer Overview shows "Compounding" or "Stable" next to the preset name.

### Files Affected
- `src/components/Settings.tsx` — add growth model toggle
- `src/lib/economicPresets.ts` — expose curve type as a first-class query
- `src/lib/optionsStorage.ts` — persist toggle choice
- `src/components/SystemViewer.tsx` — update economic model badge

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

## ⚪ FR-038 — Faction & Organisation Generator

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

## ⚪ FR-039 — Random Encounter Tables by Zone

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

**Last Updated:** 2026-04-17 (QA-049 body corrected; FR-040 added by user)

---

## 🟢 FR-040 — Intrastellar Population Distribution

**Status:** 🟢 Planned

**Objective**
Shift from a single main-world population to a **system-wide population model** where inhabitants are distributed across all habitable bodies in the star system. The main world remains the political/economic centre but no longer monopolises 100% of the population.

### Core Mechanics

1. **Calculate habitability for every body**
   - Run the full habitability pipeline (gravity, atmosphere, temperature, hazard, biochem) for each terrestrial world, ice world, and gas giant in the system.
   - Dwarf planets and circumstellar disks are generally excluded unless high TL permits artificial habitats.

2. **Determine carrying capacity per body**
   - Apply the same `productivityMultiplier` logic used for main-world population.
   - `carryingCapacity[body] = 10^(habitability + 1) × productivityMultiplier`
   - Bodies with `habitability ≤ 0` may still host habitats at high TL (TL 11+) scaled by `getHabitatSize()`.

3. **Distribute total system population**
   - Compute a **target system population** from the main world's habitability and TL (same formula as today).
   - Allocate population proportionally to each body's carrying capacity:
     ```
     body.population = totalSystemPopulation × (body.capacity / sumOfAllCapacities)
     ```
   - The main world receives the **largest single share** but typically 30–70% rather than 100%.

4. **TL scaling**
   - Higher TL increases `productivityMultiplier`, which increases `totalSystemPopulation`.
   - It also expands habitat eligibility (more hostile bodies become viable at TL 12+).

### Display & Data Model

- **System Viewer:** Inhabitants panel shows a new "Population Distribution" subsection listing inhabited bodies with their share %.
- **Planetary System tab:** Each body row displays its population and habitability breakdown.
- **DOCX export:** Includes a "Major Settlements" table with body name, type, population, and habitability.
- **Types:** Extend `PlanetaryBody` with optional `population?: number` and `habitability?: number`.

### Affected Files

- `src/lib/generator.ts` — run habitability for all bodies, compute capacities, distribute population
- `src/types/index.ts` — add `population` and `habitability` to `PlanetaryBody`
- `src/components/SystemViewer.tsx` — new population distribution UI
- `src/lib/exportDocx.ts` — export settlement table

### Narrative Goal

A TL 14 system with a main-world habitability of 6 should feel like a genuinely developed interplanetary civilisation — billions on the primary world, hundreds of millions on terraformable secondary worlds, and habitats scattered through the outer system. A CE TL 9 system should feel more frontier-like: most people on the main world, a few outposts elsewhere.

