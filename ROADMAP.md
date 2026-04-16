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

**Status:** 🟢 Planned — queued after QA-056/057/058

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

**Last Updated:** 2026-04-16
