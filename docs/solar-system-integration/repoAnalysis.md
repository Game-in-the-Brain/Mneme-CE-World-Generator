# Repository Analysis: 2D Solar System Model

**Source:** https://github.com/lovelyscientist/2D-solar-system-model  
**Local Path:** `/home/justin/opencode260220/solar-system-2d-lovely`  
**Analysis Date:** 2026-04-15  
**Analyst:** Kimi (AI-1st review)

---

## 1. Executive Summary

This is a **zero-dependency, vanilla ES6** 2D Solar System simulation. It renders the Sun, 8 planets, and a procedural main asteroid belt using a hybrid approach:
- **Static orbit lines** drawn on a `<canvas>`
- **Animated planets/asteroids** rendered as absolutely-positioned DOM `<div>` elements
- **~600 independent `setInterval` timers** drive animation

The codebase is intentionally simple (3 human-authored files, ~270 lines of core JS) and targets educational/demonstration use. It is **not yet architected for dynamic data ingestion**, but its lightweight nature makes it highly malleable for integration with external generators such as the Mneme CE World Generator (MWG).

---

## 2. File Inventory & Organization

```
.
├── SolarSystem.html          # Entry point + hardcoded DOM scaffold
├── js/
│   ├── SolarSystemModel.constructor.js   # Core engine (~266 lines)
│   └── main.js               # 3-line bootstrap
├── styles/
│   └── style.css             # Space theme + absolute positioning
├── img/                      # PNG sprites (sun, 8 planets, asteroid, speaker icons, formula images)
└── media/
    └── colossal_trailer_music_gaze.ogg   # Background audio loop
```

---

## 3. Component Architecture

### 3.1 `SolarSystem.html` — The Scaffold
- Loads CSS and two JS files in `<head>`.
- Contains a hardcoded DOM tree: `sun-container` + 8 planet containers + `asteroids` container.
- Each planet container wraps a planet `<div>` (e.g., `#mercury` inside `#mercury-container`).
- Includes a single `<canvas id="orbits">` for orbit lines and shadows.
- No build step; open directly in browser.

### 3.2 `js/SolarSystemModel.constructor.js` — The Engine
A single ES6 class with 16 methods. Here is the functional decomposition:

| Method | Purpose | Sub-Architecture |
|--------|---------|------------------|
| `constructor()` | Bootstrap pipeline | Calls all registration/render/init methods in sequence |
| `registerConstants()` | Viewport math | Computes px offsets based on `clientWidth/Height` |
| `registerPlanets()` | Data registry | Hardcodes two arrays: `this.planets` (8 objects) and `this.mainAsteroidBelt` (3 belt configs) |
| `renderPlanets()` | Animation kickoff | Sorts planets by speed, then calls `animate()` for each |
| `renderOrbits()` | Canvas drawing | Uses `ctx.ellipse()` to draw dashed grey orbit paths for all 8 planets |
| `renderShadows()` | Canvas overlay | Draws thick semi-transparent strokes behind planets using `destination-over` compositing |
| `renderAsteroids()` | Belt spawning | Iterates 3 belt classes and calls `renderMainAsteroidBelt()` |
| `renderMainAsteroidBelt(cfg)` | Procedural DOM factory | Samples Rayleigh + Normal distributions, creates `<div class="asteroids">`, injects into DOM, and animates |
| `renderSunRotation()` | CSS rotation | Spins the sun container via `transform: rotate(...)` on a timer |
| `animate(...)` | Per-object motion engine | Computes parametric ellipse position (`left`/`bottom`) on a `setInterval`. Also handles planet self-rotation |
| `initResizeListener()` | Responsive redraw | Clears canvas and re-runs `renderOrbits()` + `renderShadows()` on window resize |
| `initSound()` | Audio toggle | Play/pause the `<audio>` loop and swaps speaker icon |
| `ellipseLength(a,b)` | Math utility | Ramanujan approximation for ellipse circumference |
| `pxToNumber(value)` | Parser | Strips `'px'` from CSS strings |
| `sample_from_normal_distribution(mean, std)` | Statistics | Box-Muller transform from uniform → normal |
| `sample_from_rayleigh_distribution(sigma)` | Statistics | Inverse-transform sampling from Rayleigh |

### 3.3 `js/main.js` — The Bootstrap
```javascript
window.addEventListener('load', () => {
    let model = new SolarSystemModel();
}, false);
```

### 3.4 `styles/style.css` — The Presentation Layer
- Dark space background.
- Planet sizes defined as fixed pixel widths/heights.
- `#sun` and planet containers are `position: absolute`.
- `.asteroids` are tiny grey circular divs.

---

## 4. Data Model

### 4.1 Planets (`this.planets`)
Array of 8 objects. Schema:
```typescript
{
  distanceToSun: number,     // visual AU proxy
  semiMajorAxis: number,     // a
  semiMinorAxis: number,     // b
  centerToFocus: number,     // c
  speed: number,             // proxy for orbital period (higher = slower in timer ms)
  id: string,                // DOM container id, e.g. 'mercury-container'
  orbitDelta: number,        // visual nudge px
  shadowWidth: number,       // canvas shadow stroke width
  rotationPeriod: number     // ms interval for self-rotation CSS spin
}
```

### 4.2 Asteroid Belt Classes (`this.mainAsteroidBelt`)
Array of 3 belt-region configs. Schema:
```typescript
{
  maxSemiMajorAxis: number,
  minSemiMajorAxis: number,
  standardDeviationCoef: number,
  number: number,            // how many DOM asteroids to spawn
  rayleighSigma: number,     // Rayleigh eccentricity parameter
  speed: number,             // timer interval proxy
  id: string                 // always 'asteroid'
}
```

### 4.3 Constants (`this.CONSTANTS`)
Runtime-computed viewport metrics:
- `astronomicalUnitsToPx: 50` — conversion factor
- `sunLeftPosition`, `sunTopPosition`, `sunBottomPosition` — derived from screen center
- `uranusCoef: 1.5`, `neptuneCoef: 2` — manual compression factors so outer planets fit on screen
- `asteroidsContainer` — DOM reference

---

## 5. Rendering & Animation Mechanics

### 5.1 Orbit Lines (Canvas)
- `renderOrbits()` draws one `ctx.ellipse()` per planet.
- Ellipse center is offset by `centerToFocus` to place the Sun at a focus.
- Dashed grey stroke, line width 1.

### 5.2 Shadows (Canvas)
- `renderShadows()` uses `globalCompositeOperation = 'destination-over'`.
- Thick semi-transparent strokes (`globalAlpha = 0.6`) are drawn slightly larger than the orbit ellipse, creating a shadow band behind the planet when it passes through.

### 5.3 Planet Motion (DOM + Timers)
Each planet gets its own `setInterval` in `animate()`:
```javascript
setInterval(() => {
    targetProxy.angle -= s;  // decrement angle
    planet.style.left   = auToPx * (centerToFocus + semiMajorAxis * Math.sin(angle)) + sunOffset;
    planet.style.bottom = auToPx * (semiMinorAxis  * Math.cos(angle)) + sunOffset;
}, speed / semiMajorAxis);
```
- Angle wraps at `-6.26626` (~-2π).
- Motion is counter-clockwise (except Venus and Uranus self-rotation, which are retrograde).

### 5.4 Asteroid Motion (DOM + Timers)
- `renderMainAsteroidBelt()` creates `<div>` elements and injects them into `#asteroids`.
- Each asteroid gets its own `setInterval` via the same `animate()` method.
- Eccentricities sampled from Rayleigh; semi-major axes from Normal distribution.

### 5.5 Self-Rotation (CSS)
- A second `setInterval` per planet updates `transform: rotate(...deg)`.
- Periods are hardcoded (e.g., Mercury = 140.7 ms interval).

---

## 6. Strengths (Engineering Perspective)

1. **Zero dependencies** — No npm, no build step, no framework lock-in.
2. **Mathematically literate** — Implements Rayleigh sampling, Box-Muller, and parametric ellipse equations correctly.
3. **Decoupled canvas/DOM** — Orbit lines (canvas) and moving bodies (DOM) are separate layers; easy to swap either.
4. **Procedural asteroid belt** — Shows how to generate statistically realistic small-body distributions from code.
5. **Extremely readable** — 266 lines in one class; a human can understand the entire engine in 15 minutes.

---

## 7. Weaknesses & Technical Debt

1. **Timer explosion** — ~600 `setInterval` instances is a known anti-pattern. It forces constant reflow/repaint and scales poorly.
2. **Hardcoded DOM** — The HTML assumes exactly 8 planets. Adding/removing bodies requires editing both HTML and JS.
3. **No dynamic data ingestion** — No `fetch`, no file input, no JSON loader.
4. **Single-star assumption** — Barycenters and companion stars are impossible without architectural changes.
5. **Fixed scale** — `astronomicalUnitsToPx = 50` with manual compression coefficients for Uranus/Neptune. A system with very different AU spacing would need adaptive zoom.
6. **No `requestAnimationFrame`** — Timer-based animation is uncoupled from display refresh, causing jitter and battery drain.
7. **Missing interactivity** — No zoom, pan, click-to-inspect, or time scrubbing.

---

## 8. MWG Integration Readiness Score

**Score: 3 / 5** (Moderate effort)

**Path to integration:**
- Replace hardcoded HTML with dynamic DOM generation from MWG JSON.
- Replace timer-per-object with a single `requestAnimationFrame` loop to handle variable planet counts.
- Map MWG fields (`distanceAU`, `mass`, `zone`, `gasClass`, etc.) to visual properties (ellipse size, speed, colour).
- Add adaptive zoom/scroll so compact and sprawling systems both render legibly.
- Implement multi-star barycenters if MWG companion-star systems are to be visualised.

**Why 3/5 and not lower:** The codebase is small and dependency-free, so refactoring is fast. The orbit math is already correct and reusable.

---

## 9. Platform & Deployment Assessment

| Question | Verdict |
|----------|---------|
| **GitHub Pages?** | ✅ Yes — pure static files |
| **PWA?** | ⚠️ Low out-of-the-box; needs manifest + service worker |
| **Firefox?** | ✅ Explicitly tested and supported |
| **Phone/Tablet?** | ⚠️ Functional but inefficient due to timer architecture |
| **PC/Desktop?** | ✅ Smooth |
