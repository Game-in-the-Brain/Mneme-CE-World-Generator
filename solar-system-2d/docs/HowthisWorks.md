# How This Works — 2D Solar System Map (MWG Integrated)

A human-friendly guide to how the original `lovelyscientist/2D-solar-system-model` concepts were adapted into the Mneme CE World Generator monorepo.

---

## The Big Picture

The MWG app is a **React + Vite PWA** that generates complete star systems. When a referee clicks **"View System Map,"** MWG serialises the current `StarSystem` into a Base64 payload and opens `/solar-system-2d/?system=<payload>` in a new tab.

The 2D map is **not a React app**. It is a lightweight TypeScript Canvas 2D renderer that:
1. Reads the query string.
2. Builds a scene graph from the `StarSystem` data.
3. Starts a single `requestAnimationFrame` loop.
4. Renders orbits, bodies, labels, and a procedural starfield background.

Because it lives in the same repo and shares the same Vite build, there are no CORS issues, no submodules, and no extra deployment steps.

---

## File Tour (MWG Solar-System-2D)

### `solar-system-2d/index.html` — The Stage

This is a minimal HTML shell. It contains:
- A full-screen `<canvas id="starmap">`
- A small UI overlay div for controls (play/pause, speed, date, seed)
- A script tag that loads `src/main.ts`

Unlike the original `SolarSystem.html`, there are **no hardcoded planet divs**. Everything is drawn dynamically from the payload.

---

### `solar-system-2d/src/styles.css` — The Costumes

This file provides:
- A deep-space dark background (`#0a0a0f`)
- Control panel glassmorphism styling
- Responsive typography so labels remain readable on phones
- No planet-size CSS classes — sizes are calculated in code and drawn as Canvas circles

---

### `solar-system-2d/src/main.ts` — The Curtain Rise

This is the bootstrap. It:
1. Parses the URL query string.
2. Calls `decodeMapPayload()` to get the `StarSystem`, seed, and epoch.
3. Initialises the Canvas context and sizes it to the window.
4. Calls `dataAdapter.ts` to build the scene graph.
5. Hands control to `renderer.ts` to start the animation loop.
6. Wires up window resize and UI control events.

---

### `solar-system-2d/src/renderer.ts` — The Director

This replaces the original `SolarSystemModel` class. It owns the **single `requestAnimationFrame` loop** that drives everything.

Each frame, the renderer executes these passes:

```
1. Clear canvas
2. Starfield pass    → draw procedural background stars
3. Orbit pass        → draw thin rings for every body
4. Body pass         → draw filled circles at current orbital angles
5. Label pass        → draw type labels and the MAIN WORLD highlight
6. UI overlay        → date, speed, seed (drawn or DOM overlay)
```

#### How planets move (MWG way)

Instead of 600 timers, there is **one loop**.

For each body in the scene graph:
1. Calculate its orbital period from `distanceAU` using Kepler's 3rd Law.
2. Given the simulation day offset `Δt`, advance its angle: `angle += 2π × Δt / T`.
3. Convert polar angle to screen coordinates using the camera transform.
4. Draw the circle.

This scales to any number of planets and stays perfectly in sync.

---

### `solar-system-2d/src/dataAdapter.ts` — The Casting Director

This file translates MWG's `StarSystem` JSON into renderable scene objects.

**Input:** `StarSystem` from the query-string payload  
**Output:** An array of `SceneBody` objects, each with:
- `type` (star, disk, dwarf, terrestrial, ice, gas)
- `distanceAU` and `mass`
- `colour` and `radius` (visual abstraction, not true scale)
- `angle` (initial orbital angle for epoch 2300-01-01)
- `isMainWorld` flag

No DOM elements are created here — just a lightweight data structure that the renderer consumes.

---

### `solar-system-2d/src/camera.ts` — The Lens

Handles pan, zoom, and coordinate transforms.

- **World coordinates:** Astronomical units (AU) around the primary star at `(0,0)`.
- **Screen coordinates:** Pixels on the Canvas, offset by pan and zoom.

The camera uses a **logarithmic distance mapping** so that a body at 0.2 AU and a body at 50 AU are both visible on the same screen.

---

### `solar-system-2d/src/orbitMath.ts` — The Choreographer

Pure math functions:
- `calculatePeriod(distanceAU)` → orbital period in days
- `getOrbitalPosition(distanceAU, angle)` → `(x, y)` in AU
- `daysToAngleOffset(period, days)` → how much a body moves in `days`

These are the spiritual successors to the original `animate()` ellipse math, but typed, tested, and decoupled from the DOM.

---

### `solar-system-2d/src/starfield.ts` — The Wallpaper

Generates a seeded procedural background using a deterministic PRNG (Mulberry32).

- ~200–400 tiny vector stars per viewport.
- Star positions, sizes, and colours are derived from the seed.
- Changing the seed (via the UI) redraws the background without touching the planetary layout.

This completely replaces the original's JPG/PNG background assets.

---

### `solar-system-2d/src/uiControls.ts` — The Mixing Desk

Wires DOM buttons to the renderer state:
- Play / Pause
- Speed slider
- Reverse toggle
- Step +1 / -1 / +7 / -7 days
- Reset to 2300-01-01
- Seed display, regenerate, copy, paste

---

## How the Pieces Fit Together

```
MWG React App
    └── "View System Map" button
            └── Navigates to /solar-system-2d/?system=<base64>
                    └── solar-system-2d/index.html
                            ├── main.ts (bootstrap)
                            │       ├── decodeMapPayload()
                            │       ├── dataAdapter.ts → scene graph
                            │       └── renderer.ts → start RAF loop
                            ├── renderer.ts
                            │       ├── starfield.ts (background)
                            │       ├── orbitMath.ts (positions)
                            │       ├── camera.ts (zoom/pan)
                            │       └── Canvas API (draw everything)
                            ├── uiControls.ts (buttons + sliders)
                            └── styles.css (space theme)
```

---

## What Changed from the Original for MWG?

| Aspect | Original (Lovely) | MWG Integration |
|--------|-------------------|-----------------|
| **Build tool** | None — open HTML directly | Vite (shared with MWG) |
| **Framework** | Vanilla ES6 | TypeScript modules |
| **Planet DOM** | 8 hardcoded `<div>`s | Dynamic Canvas circles |
| **Animation** | ~600 `setInterval` timers | Single `requestAnimationFrame` loop |
| **Data source** | Hardcoded JS arrays | MWG `StarSystem` query-string payload |
| **Background** | JPG/PNG starfield + sun sprite | Procedural seeded vector stars |
| **Zoom/Pan** | None | Mouse wheel + touch gestures |
| **Time control** | None | Play, pause, speed, reverse, day stepping |
| **Multi-star** | Single star only | Companion stars rendered (simplified) |

---

## Quick Reference: Key Terms

| Term | What it means here |
|------|--------------------|
| **The Path** | The Base64 query-string bridge from MWG to the 2D map |
| **Scene graph** | The lightweight array of renderable bodies created by `dataAdapter.ts` |
| **RAF** | `requestAnimationFrame` — the single browser loop that draws every frame |
| **Starfield seed** | An 8-character string that deterministically generates the background |
| **Logarithmic scale** | A mapping that compresses large AU distances so inner and outer bodies fit on screen |
| **Camera transform** | Math that converts AU world coordinates into on-screen pixel coordinates |
