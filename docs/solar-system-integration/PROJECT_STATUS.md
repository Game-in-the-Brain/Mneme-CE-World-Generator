# Project Status & Star Map Integration Decision
## Mneme CE World Generator — FR-031 2D Animated Planetary System Map

**Date:** 2026-04-15  
**Status:** Phase 0–1 Complete | Phase 2 Ready to Start  
**Commit:** `3657438e` on `main`

---

## 1. Executive Summary

The Mneme CE World Generator now has a working, integrated **2D animated planetary system map** living inside the monorepo. Rather than maintaining a separate repository or git submodule, the map is built as a **second Vite entry point** (`solar-system-2d/`) that shares the same build pipeline, TypeScript types, and deployment target as the main React app.

After evaluating five open-source solar-system visualisation repositories, we selected the concepts from **`lovelyscientist/2D-solar-system-model`** as our foundation—not because it was perfect out-of-the-box, but because it was the **only candidate small enough to rewrite cleanly** while retaining mathematically sound orbital mechanics.

**Current result:** A referee can generate a star system in MWG, click **"View System Map,"** and immediately see a live 2D canvas map with:
- Procedurally generated, seeded starfield background
- All INTRAS Level 1 bodies rendered as colour-coded circles
- Orbit rings for every body
- The Main World highlighted in gold
- Play/pause, speed control, reverse, and day-stepping UI

All of this builds with `npm run build` and produces zero TypeScript errors.

---

## 2. The Decision: Why Lovely 2D Was Chosen

### 2.1 The Candidate Field

We analysed five repositories for MWG integration:

| Repository | Stack | MWG Fit Score | Verdict |
|------------|-------|---------------|---------|
| **lovelyscientist/2D-solar-system-model** | Vanilla ES6, Canvas+DOM | **3/5** | **Selected for port** |
| **justinaquino/SolarSystem-Simone-Dr** | p5.js, Keplerian solver | **2/5** | Rejected — rigidly hardcoded to Sol's J2000 ephemeris; no procedural data path |
| **honzaap/SolarSystem** | Vue 3 + Three.js + Vite | **3/5** | Rejected — requires hand-made GLB+PNG assets per body; no procedural fallback |
| **SoumyaEXE/3d-Solar-System-ThreeJS** | Vanilla Three.js, monolithic | **3/5** | Rejected — 3,100-line monolith with bloat (chatbots, NASA APIs); more effort to clean than rebuild |
| **Game-in-the-Brain/Solar-System-3D** | Three.js + Vite (local) | **2/5** (today) | **Future target** — officially intended partner, but zero dynamic data layer exists yet |

### 2.2 Why Lovely 2D Won

**Speed to MVP:**
- The original engine is ~266 lines of JavaScript. We understood it in minutes, not days.
- It has zero dependencies, meaning no framework lock-in, no version conflicts, and no extra security surface.

**Mathematical Reusability:**
- The parametric ellipse math and procedural asteroid distribution (Rayleigh + Box-Muller) are correct and reusable.
- We ported the orbit-period concepts into typed `orbitMath.ts` modules.

**GitHub Pages Compatibility:**
- Because the original was pure static files, the ported version fits perfectly into MWG's existing Vite → GitHub Pages pipeline.

**Mobile Viability After Refactor:**
- The original's ~600 independent `setInterval` timers were a known anti-pattern. By rewriting the engine with a single `requestAnimationFrame` loop, we fixed the primary performance blocker.

### 2.3 What We Did NOT Inherit

We deliberately left behind every architectural limitation of the original:

| Original Weakness | MWG Fix |
|-------------------|---------|
| Hardcoded 8-planet DOM HTML | Dynamic Canvas rendering from `StarSystem` JSON |
| ~600 `setInterval` timers | Single `requestAnimationFrame` loop |
| Fixed `1 AU = 50 px` scale | Logarithmic `logScaleDistance()` with adaptive camera zoom |
| Single-star only | Companion stars rendered (simplified barycentre; true orbits are backlog) |
| No zoom/pan/interactivity | Mouse wheel + drag + touch pinch/pan (Phase 2) |
| JPG/PNG background assets | Procedural seeded vector starfield |

---

## 3. Accomplishments To Date (Phase 0–2)

### Phase 0 — Foundation ✅
- Updated `vite.config.ts` with `rollupOptions.input` for `solar-system-2d/index.html`
- Created the full TypeScript scaffold:
  - `main.ts` — bootstrap, URL payload decode, canvas initialisation
  - `renderer.ts` — `requestAnimationFrame` loop with layered render passes
  - `camera.ts` — world-to-screen transforms, logarithmic scaling, zoom-to-point
  - `orbitMath.ts` — Kepler's 3rd Law, angle offsets, hash-to-float
  - `starfield.ts` — Mulberry32 deterministic PRNG, procedural star generation
  - `dataAdapter.ts` — `StarSystem` → `SceneBody` mapper (INTRAS Level 1)
  - `uiControls.ts` — play/pause, speed slider, reverse, day stepping, seed controls
  - `input.ts` — mouse wheel/drag, touch pinch/pan, double-tap reset
  - `types.ts` — shared 2D map types
  - `styles.css` — dark space theme with glassmorphism control panel
- Verified `npm run build` emits `dist/solar-system-2d/index.html` with zero errors

### Phase 1 — The Path & Data Adapter ✅
- Implemented **Unicode-safe Base64 payload encoding/decoding** between MWG and the map
- Added the **"View System Map"** button to `SystemViewer.tsx` (primary-styled, opens in new tab)
- `dataAdapter.ts` now maps:
  - Primary star (spectral-class colour)
  - Companion stars
  - Circumstellar disks (dashed rings — point-field backlog)
  - Dwarf planets, terrestrial worlds, ice worlds
  - Gas worlds Class I–V (colour-coded)
  - Main World (gold stroke + `★ MAIN` label)
- Renderer draws:
  - Seeded procedural starfield background
  - Orbit rings for all bodies
  - Filled-circle bodies with type-appropriate colours and labels
  - Deterministic initial angles derived from the system data hash

### Phase 2 — Camera & Interaction ✅
- Mouse wheel zooms centred on cursor
- Mouse drag pans the camera
- Touch pinch-zoom and two-finger pan work on phones/tablets
- "Reset View" button and double-tap restore default fit
- Camera uses persistent state (no longer auto-fitted every frame)

### Phase 3 — Animation Hardening ✅
- Orbital angles advance correctly from `simDayOffset` in the RAF loop
- Reverse playback orbits planets backward
- Step buttons pause playback, then jump exactly 1 or 7 days
- `dt` capped at 0.1s to prevent background-tab jumps
- Date display shows blue pulse glow while playing; uses robust timestamp math for large offsets

### Documentation Preserved ✅
- Created `solar-system-2d/docs/repoAnalysis.md` — contextualised AI-first analysis of the original Lovely repo
- Created `solar-system-2d/docs/HowthisWorks.md` — human-centric architecture guide for the MWG port
- Updated `docs/solar-system-integration/FRD.md` with completed phases and disk backlog spec
- Updated `QA.md` with FR-031 tracking
- Created `20260415-fr031-scaffold.md` session log

---

## 4. Current Architecture

```
MWG React App (Vite)
    └── "View System Map" button
            └── Navigates to /solar-system-2d/?system=<base64-payload>
                    └── solar-system-2d/index.html
                            ├── main.ts
                            │       ├── decodeMapPayload() → StarSystem + seed + epoch
                            │       ├── buildSceneGraph() → SceneBody[]
                            │       └── initRenderer() → RAF loop
                            ├── renderer.ts
                            │       ├── starfield.ts (Mulberry32 background)
                            │       ├── orbit rings (log-scale)
                            │       ├── body circles + labels
                            │       └── UI overlay
                            ├── camera.ts (zoom/pan transforms)
                            ├── input.ts (mouse + touch handlers)
                            ├── orbitMath.ts (Kepler periods)
                            ├── uiControls.ts (time + seed controls)
                            └── styles.css
```

**Key design choices already implemented:**
- **Everything is a circle.** No 3D models, no JPGs, no GLBs.
- **Default epoch:** `2300-01-01` CE.
- **Background seed:** 8-character alphanumeric, shareable, regenerable.
- **No dynamic data generation** in the 2D map — it is a pure visualiser of MWG output.

---

## 5. What Is NOT in MVP (Explicit Backlog)

- **Planetary rings** — MWG has no ring-generation rules yet
- **INTRAS Level 2 (moons)** — child bodies orbiting planets are not generated by MWG yet
- **True barycentric orbits** — companion stars are rendered at fixed angles for now
- **Brachistochrone trajectory lines** — UI spec exists but implementation is post-MVP
- **Retrograde orbits** — all MVP orbits are prograde (counter-clockwise)
- **Body selection tooltips** — click-to-inspect stats (planned for Phase 5+)

---

## 6. Next Steps (Phase 2 & Beyond)

### Phase 3 — Animation Hardening
- Confirm time controls smoothly advance orbital angles at all speed multipliers
- Add date display formatting for large negative/positive offsets

### Phase 4 — Starfield Polish
- Responsive starfield regeneration on canvas resize
- Optional faint nebula clouds (seeded)

### Phase 5 — Production Hardening
- Disk point-field rendering (scattered high-density orbital noise)
- Label culling at extreme zoom levels
- 60 fps validation on mid-range phones
- Offline caching via existing PWA service worker

### Phase 6 — Long-Term 3D Option
- Once `Game-in-the-Brain/Solar-System-3D` matures, reuse the same JSON-to-visual pipeline to offer a **"Fast 2D / Pretty 3D"** toggle.

---

## 7. Developer Quick Reference

**Start dev server (serves both apps):**
```bash
npm run dev
```

**URLs:**
- Main generator: `http://localhost:5173/`
- 2D map: `http://localhost:5173/solar-system-2d/`

**Build (must pass with zero errors):**
```bash
npm run build
```

**Key files:**
- `solar-system-2d/src/renderer.ts` — render loop
- `solar-system-2d/src/dataAdapter.ts` — MWG JSON → scene graph
- `src/components/SystemViewer.tsx` — "View System Map" button
- `vite.config.ts` — multi-page entry points
