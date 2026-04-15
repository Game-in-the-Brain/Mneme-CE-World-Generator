# Repository Analysis: 2D Solar System Model — MWG Integrated Context

**Original Source:** https://github.com/lovelyscientist/2D-solar-system-model  
**Parent Project:** Mneme CE World Generator (`Mneme-CE-World-Generator/`)  
**Local Integration Path:** `Mneme-CE-World-Generator/solar-system-2d/`  
**Analysis Date:** 2026-04-15  

---

## 1. Executive Summary

This document analyses the original `lovelyscientist/2D-solar-system-model` repository and explains how its concepts are being reused inside the MWG monorepo. The original was a **zero-dependency, vanilla ES6** 2D Solar System simulation. In the MWG integration, we are **not copying it wholesale**; we are porting its proven mathematical concepts into a clean TypeScript module that lives as a second Vite entry point.

**What we keep from Lovely:**
- Parametric ellipse / circular orbit concepts
- Canvas-orbit + body-render layering idea
- Procedural small-body distribution math (for future asteroid belts)

**What we leave behind:**
- Hardcoded 8-planet DOM HTML
- ~600 `setInterval` timers
- Fixed `astronomicalUnitsToPx = 50` scale
- Single-star-only assumption
- No-build-step architecture (we now use Vite + TypeScript)

---

## 2. Original File Inventory

```
2D-solar-system-model/
├── SolarSystem.html          # Entry point + hardcoded DOM scaffold
├── js/
│   ├── SolarSystemModel.constructor.js   # Core engine (~266 lines)
│   └── main.js               # 3-line bootstrap
├── styles/
│   └── style.css             # Space theme + absolute positioning
├── img/                      # PNG sprites (sun, planets, icons)
└── media/
    └── colossal_trailer_music_gaze.ogg   # Background audio loop
```

---

## 3. MWG Port Mapping

| Original File | MWG Equivalent | What Changed |
|---------------|----------------|--------------|
| `SolarSystem.html` | `solar-system-2d/index.html` | Stripped to a single `<canvas id="starmap">` + control overlay |
| `js/SolarSystemModel.constructor.js` | `src/renderer.ts` + `src/dataAdapter.ts` | Split into typed modules; timer engine replaced with `requestAnimationFrame` |
| `js/main.js` | `src/main.ts` | TypeScript bootstrap with Vite HMR awareness |
| `styles/style.css` | `src/styles.css` | Tailwind-compatible utility classes + custom space theme |
| `img/` + `media/` | *(none)* | All visuals are now vector/procedural; no image assets |

---

## 4. Architectural Concepts We Are Reusing

### 4.1 Parametric Ellipse Motion
The original used:
```javascript
left   = auToPx * (centerToFocus + semiMajorAxis * Math.sin(angle)) + sunOffset;
bottom = auToPx * (semiMinorAxis  * Math.cos(angle)) + sunOffset;
```

In MWG, this becomes `orbitMath.ts`:
```typescript
export function getOrbitalPosition(a: number, angle: number): Point {
  return {
    x: Math.cos(angle) * a,
    y: Math.sin(angle) * a
  };
}
```
(MVP uses circular orbits; elliptical parametrics are backlog.)

### 4.2 Canvas Layering
Lovely separated:
- Background canvas (orbits, shadows)
- DOM layer (planets moving via CSS)

MWG uses a **single full-screen Canvas** for everything (orbits, starfield, bodies, labels) to reduce DOM pressure on mobile. The layering concept lives on as **render passes** inside `renderer.ts`:
1. Starfield pass
2. Orbit pass
3. Body pass
4. Label/UI overlay pass

### 4.3 Procedural Asteroid Belts
Lovely used Rayleigh + Normal distributions to scatter asteroid DOM elements. MWG will reuse this math when asteroid belts are added (Phase 5+), but rendered as Canvas points instead of `<div>` elements.

---

## 5. Strengths of the Original (Still Relevant)

1. **Zero dependency philosophy** — we carry this forward by keeping the 2D map free of Three.js, p5.js, or heavy charting libraries.
2. **Mathematically literate** — Rayleigh, Box-Muller, and parametric math are proven correct and reusable.
3. **Extremely readable** — the original engine is ~266 lines; our TypeScript port stays similarly compact per module.
4. **Static-file deployable** — GitHub Pages compatibility is preserved because the build output is just HTML/JS/CSS.

---

## 6. Weaknesses We Are Explicitly Fixing

| Original Weakness | MWG Fix |
|-------------------|---------|
| ~600 `setInterval` timers | Single `requestAnimationFrame` loop in `renderer.ts` |
| Hardcoded 8-planet DOM | Dynamic scene graph from `StarSystem` JSON via `dataAdapter.ts` |
| No dynamic data ingestion | Base64 query-string "Path" from MWG React app |
| Single-star assumption | Companion stars rendered (simplified barycentre; true orbits are backlog) |
| Fixed 1 AU = 50 px scale | Logarithmic + adaptive camera zoom in `camera.ts` |
| No zoom/pan/interactivity | Mouse wheel / drag + touch pinch/pan implemented |

---

## 7. Integration Readiness Score

**Original Score:** 3 / 5  
**MWG Integrated Score (post-port):** 5 / 5

By rewriting the engine inside the MWG monorepo with TypeScript, a single animation loop, and direct `StarSystem` binding, the conceptual value of Lovely's math is fully unlocked without inheriting its architectural limitations.

---

## 8. Platform & Deployment Assessment (MWG Context)

| Question | Verdict |
|----------|---------|
| **GitHub Pages?** | ✅ Yes — built by Vite into static output |
| **PWA?** | ✅ Yes — cached by MWG's existing service worker |
| **Firefox?** | ✅ Yes — standard Canvas 2D API |
| **Phone/Tablet?** | ✅ Good — one RAF loop, no DOM timer explosion |
| **PC/Desktop?** | ✅ Smooth |
