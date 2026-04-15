# Feature Requirements Document (FRD)
## 2D Solar System Visualiser — MWG Integration Fork

**Date:** 2026-04-15  
**Based on:** `repoAnalysis.md` of lovelyscientist/2D-solar-system-model  
**Target Integration:** Mneme CE World Generator (MWG)  

---

## 1. Purpose

Transform the lightweight `2D-solar-system-model` into a **dynamic, data-driven star-system map** that can ingest JSON output from the Mneme CE World Generator and display it as an interactive 2D animation.

The map must:
- Work as a **static GitHub Page** with no backend.
- Accept MWG JSON (star(s), zones, planetary bodies, main world, inhabitants metadata).
- Render all bodies as abstract circles (stars, planets, moons, disks, asteroid belts).
- Allow time-stepping so referees can see future planetary positions.
- Be usable on phones, tablets, and desktops.

---

## 2. Platform & Deployment Requirements

### 2.1 GitHub Pages
**Requirement:** YES — the final app must deploy as a GitHub Page.

**Rationale:** The original repo is pure HTML/CSS/JS with zero build step. It can be published immediately by enabling GitHub Pages on the repository root. No server-side rendering, no database, no API keys.

### 2.2 PWA (Progressive Web App)
**Requirement:** SHOULD support basic PWA features.

**Minimum viable PWA checklist:**
- `manifest.json` with app name, icons, and display mode.
- A simple service worker that caches the HTML, CSS, JS, and icon assets for offline use.
- Because there is no backend, offline mode works automatically once cached.

**Effort:** Low. A `vite` or `workbox` build step is optional; a hand-written service worker in ~30 lines is sufficient.

### 2.3 Firefox Compatibility
**Requirement:** MUST run in Firefox.

**Rationale:** The original code already explicitly targets Firefox and Chrome. It uses only standard ES6, Canvas 2D, and DOM APIs — all fully supported in Firefox. No WebGL extensions, no vendor-prefixed CSS, no experimental JavaScript.

### 2.4 Performance: Phone / Tablet vs PC

| Device Class | Expected Experience | Bottleneck |
|--------------|---------------------|------------|
| **Desktop PC** | Smooth | None |
| **Mid-range tablet** | Good after refactor | Timer count (if unrefactored) |
| **Budget phone** | Acceptable after refactor | DOM reflow from 600+ timers |

**Key Issue:** The original code uses ~600 independent `setInterval` timers. On mobile this causes battery drain and frame drops. **The refactor to a single `requestAnimationFrame` loop is a hard requirement for MWG integration.**

---

## 3. Data Ingestion from MWG

### 3.1 Source Data
The Mneme CE World Generator exports `StarSystem` JSON with the following relevant fields:

```typescript
{
  primaryStar: { class, grade, mass, luminosity },
  companionStars: [{ class, grade, mass, luminosity, orbitDistance }],
  zones: { infernal, hot, conservative, cold, outer },
  circumstellarDisks: [{ zone, distanceAU, mass }],
  dwarfPlanets: [{ zone, distanceAU, mass, lesserEarthType }],
  terrestrialWorlds: [{ zone, distanceAU, mass }],
  iceWorlds: [{ zone, distanceAU, mass }],
  gasWorlds: [{ zone, distanceAU, mass, gasClass }],
  mainWorld: { type, size, massEM, distanceAU, zone, atmosphere, temperature, hazard, habitability },
  inhabitants: { techLevel, population, wealth, starport: { class } }
}
```

### 3.2 Ingestion Mechanic
**Requirement:** The visualiser must accept MWG JSON via one of:
1. **File upload** (`<input type="file">` reading a `.json` export).
2. **Clipboard paste** (paste raw JSON into a textarea).
3. **Query parameter** (`?system=<base64-encoded-json>`) for shareable links.
4. **Direct embed** (the MWG app opens the visualiser in a new tab and `postMessage`s the JSON).

**Priority:** File upload + clipboard paste for MVP. Query parameter for v1.1. `postMessage` integration for future MWG built-in map button.

---

## 4. Visual Rendering Requirements

### 4.1 Design Philosophy: Everything is a Circle
All bodies are rendered as simple filled circles with text labels. No photorealistic textures, no 3D models. This keeps the code lightweight, fast, and abstract — perfect for a referee aid.

### 4.2 Body Types & Styling

| MWG Type | Visual | Fill Colour | Label |
|----------|--------|-------------|-------|
| **Star (Primary)** | Large circle | Spectral-class colour (O=blue-white, M=red) | `Class + Grade` (e.g., `G2`) |
| **Companion Star** | Medium circle | Same spectral colour | `Class + Grade` |
| **Circumstellar Disk** | Dashed ring | Brown/grey | `Disk` |
| **Dwarf Planet** | Small circle | Grey | `Dwarf` + custom name if annotated |
| **Terrestrial World** | Small circle | Green/brown | `Terrestrial` + custom name |
| **Ice World** | Small circle | Cyan/white | `Ice` + custom name |
| **Gas World Class I** | Medium circle | Pale banded | `Gas I` |
| **Gas World Class II** | Medium circle | Blue banded | `Gas II` |
| **Gas World Class III** | Medium circle | Red banded | `Gas III` |
| **Gas World Class IV/V** | Medium circle | White banded | `Gas IV/V` |
| **Main World** | Highlighted circle | Same as type, but with a 2px gold stroke | `MAIN` + type + name |
| **Asteroid Belt** | Scattered tiny dots | Grey | `Belt` |

### 4.3 Scale & Zoom
**Requirement:** Logarithmic or adaptive linear scale so that both 0.1 AU and 50 AU bodies are visible.

**Approach:**
- Use a **logarithmic radial axis** for the orbit map (`log10(distanceAU + 1)`).
- Alternatively, a **pan-and-zoom infinite canvas** where the referee can zoom in on the inner system and zoom out to see outer gas giants.
- For MVP: fit the entire system into view with `distanceAU` mapped to canvas coordinates using a scaling factor computed as `min(viewportSize / maxDistanceAU)`.

### 4.4 Time Control (Orbital Animation)
**Requirement:** A slider or buttons to step time forward/backward.

**Default epoch:** 2300 CE (MTL 12 / CE TL 9.0).

**Time-stepping logic:**
- All bodies orbit with circular or simplified elliptical motion.
- Period `T` is derived from `distanceAU` using Kepler's 3rd Law: `T² ∝ a³`.
- Given a day offset `Δt`, each body's angle advances by `2π × Δt / T`.
- The UI shows the current date (e.g., `2300-03-15`).

**Animation modes:**
- Pause
- Play (1 day/sec)
- Fast-forward (1 month/sec)
- Step +1 day / +7 days / +30 days

---

## 5. Architecture Changes from Original Code

### 5.1 Replace Timer Architecture
**From:** One `setInterval` per body (~600 timers).  
**To:** One `requestAnimationFrame` loop that updates every body each frame.

**Benefits:**
- Scales to any number of planets.
- Syncs with display refresh (smoother, less battery drain).
- Easy to pause/play/fast-forward globally.

### 5.2 Replace Hardcoded DOM with Dynamic Generation
**From:** 8 planet `<div>`s hardcoded in `SolarSystem.html`.  
**To:** A single function `renderSystemFromJSON(data)` that creates DOM elements (or Canvas shapes) for every body in the MWG export.

### 5.3 Add JSON Importer UI
A small control panel (top-left or top-right) with:
- "Load MWG JSON" file picker
- "Paste JSON" textarea toggle
- System name display
- Time controls
- Zoom / pan hints (mouse wheel = zoom, drag = pan)

### 5.4 Multi-Star Support
**From:** Single central sun at `(0,0)`.  
**To:** Support binary/trinary systems.

**MVP simplification:**
- Place the primary star at `(0,0)`.
- Plot companion stars at their `orbitDistance` from the primary on a fixed circular path (or at a static angle for the epoch).
- All planetary orbits are centred on the primary star. This is physically approximate but visually adequate for RPG use.
- **Future enhancement:** True barycentric orbits where planets orbit the system centre of mass.

---

## 6. Comparative Analysis: Which Repo is Best for MWG?

We analysed five candidate repositories for integration with the Mneme CE World Generator.

### 6.1 Candidate Scorecard

| Repo | Tech Stack | MWG Score | Best For | Main Blocker |
|------|------------|-----------|----------|--------------|
| **lovelyscientist/2D-solar-system-model** | Vanilla ES6, Canvas+DOM | **3/5** | Fast, lightweight 2D map | Needs timer refactor + dynamic DOM |
| **justinaquino/SolarSystem-Simone-Dr** | p5.js, Canvas 2D, Keplerian | **2/5** | Accurate real-time orbits | Rigidly hardcoded to Sol; Keplerian physics overkill |
| **Game-in-the-Brain/SolarSystem-honzaap** | Vue 3 + Three.js + Vite | **3/5** | Polished 3D presentation | Requires GLB asset per body; single-star |
| **justinaquino/3d-Solar-System-ThreeJS-soumyaEXE** | Three.js + Vite, monolithic | **3/5** | Feature-rich 3D demo | Monolithic 3,100-line file; heavy bloat |
| **Solar-System-3D (local)** | Three.js + Vite, GitBrain fork | **2/5** | Official intended partner | Currently hardcoded; PRD exists but code is not ready |

### 6.2 Detailed Comparison

#### A. lovelyscientist/2D-solar-system-model (THIS FRD)
**Why choose it:**
- **Smallest codebase** — easy to understand and refactor in hours, not days.
- **Zero dependencies** — no framework lock-in, no build complexity.
- **Already on GitHub Pages trajectory** — static files, instant deploy.
- **Ellipse math already works** — just needs dynamic data feeding.

**Why not choose it:**
- Timer architecture is inefficient; must be refactored.
- 2D only — no 3D "wow" factor.
- No existing UI controls (zoom, time slider) — must be built.

**Verdict:** Best choice for a **quick, reliable, PWA-friendly 2D map** that referees can use on any device.

---

#### B. SolarSystem-Simone-Dr (p5.js)
**Why choose it:**
- Real Keplerian orbital mechanics are already implemented.
- Has a date picker and zoom presets.

**Why not choose it:**
- The physics engine is **tightly coupled to our Solar System's 12 Keplerian parameters per planet**. MWG does not output Keplerian elements, so you would have to synthesise them or strip the physics engine.
- 2D-only projection throws away inclination.
- No touch UX (pinch zoom, tap targets).

**Verdict:** Good for a **realistic Sol-system clock**, poor fit for procedurally generated Traveller systems.

---

#### C. SolarSystem-honzaap (Vue 3 + Three.js)
**Why choose it:**
- Very polished 3D look with lens flares, trajectory rings, and camera follow.
- Hierarchical moon orbits are already solved cleanly.
- Modern build stack (Vite + Vue 3) matches MWG's toolchain.

**Why not choose it:**
- **Every body requires a hand-made GLB model and a PNG card image.** Procedural MWG worlds have no assets.
- Single-star lighting setup.
- Scales are manually fudged for visual appeal.

**Verdict:** Best for a **high-polish 3D showcase** if you are willing to build a procedural asset pipeline (coloured spheres instead of GLBs).

---

#### D. 3d-Solar-System-ThreeJS-soumyaEXE
**Why choose it:**
- The most feature-complete Three.js base: bloom, tone mapping, starfields, asteroid belts, NASA APIs, AI chatbot, eclipse tours.

**Why not choose it:**
- **3,100 lines of monolithic JavaScript** mixing rendering, UI, API calls, and audio. Extremely hard to refactor safely.
- Heavy bloat (background music, NASA APIs, Gemini chatbot) that is irrelevant to MWG.
- Asteroid belts use 500+ individual meshes instead of `InstancedMesh`.
- Circular orbits only.

**Verdict:** Avoid for MWG unless you plan to **rewrite from scratch** and only keep the Three.js boilerplate.

---

#### E. Solar-System-3D (Game-in-the-Brain local)
**Why choose it:**
- This is the **officially intended partner project**. The PRD explicitly says Phase 6A is "Mneme World Generator Integration."
- Already has a GitHub Pages CI workflow.

**Why not choose it (today):**
- The **codebase is still a hardcoded scene file**. Despite extensive PRD/Analysis docs, zero MWG integration code exists.
- 4,000 cloned asteroid meshes with no instancing = poor mobile performance.
- Flat circular orbits only.

**Verdict:** This will likely be the **long-term 3D solution** once the Game-in-the-Brain team builds out the data layer. For a **fast 2D map that works today**, the lovelyscientist fork is the better starting point.

---

## 7. Recommended Path Forward

**Phase 1 (MVP — 2D Map):** Fork `lovelyscientist/2D-solar-system-model`.
- Refactor to `requestAnimationFrame`.
- Add dynamic DOM generation from MWG JSON.
- Add file upload / paste JSON UI.
- Add zoom, pan, and time controls.
- Deploy to GitHub Pages.

**Phase 2 (Integration):** Add a "View Map" button inside MWG that opens the GitHub Page with the current system encoded in the URL (Base64 JSON query param).

**Phase 3 (Future):** Once `Solar-System-3D` matures, reuse the same JSON-to-scene mapper to feed its Three.js renderer, giving users a choice between **Fast 2D** and **Pretty 3D**.

---

## 8. Acceptance Criteria

- [ ] Open the GitHub Page on a phone and load a sample MWG JSON export — all bodies appear within 2 seconds.
- [ ] Pan and zoom the map with touch gestures.
- [ ] Press Play and watch planets orbit at 1 day/sec without stutter on a 3-year-old phone.
- [ ] Pause, step forward 30 days, and verify body positions have advanced correctly.
- [ ] Click a body and see a tooltip with its MWG name, type, zone, and distanceAU.
- [ ] Load the same system in Firefox — identical behaviour to Chrome.
- [ ] Disconnect from internet after first load — the app still works (service worker caches assets).
