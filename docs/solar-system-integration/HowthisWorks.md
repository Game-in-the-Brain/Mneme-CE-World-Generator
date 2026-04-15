# How This Works — 2D Solar System Model

A human-friendly guide to the code, file by file.

---

## The Big Picture

This project is a **single-page web app** that shows the Sun and planets moving in elliptical orbits. There is no server, no database, and no build tool like Webpack or Vite. You simply open `SolarSystem.html` in a browser and it runs.

It works by combining two different web technologies:
1. **HTML/CSS divs** — for the moving planets and asteroids.
2. **HTML5 Canvas** — for the grey dashed orbit lines and the shadows behind planets.

Everything is driven by plain JavaScript (ES6) with no external libraries.

---

## File Tour

### `SolarSystem.html` — The Stage

Think of this as the **theatre set**. It contains:
- A starfield background (`<div id="mainStars">`)
- A canvas for drawing orbit lines (`<canvas id="orbits">`)
- A sound toggle button (`<div id="sound">`)
- An audio element for background music
- A big `#sun` div that holds:
  - The rotating sun image
  - 8 planet containers (one for each planet from Mercury to Neptune)
  - The asteroid belt container

**Important:** The planet containers are hardcoded here. If you wanted to add a ninth planet, you would have to add another `<div>` inside this file. This is the main reason the app is not yet "plug-and-play" for arbitrary solar systems.

---

### `styles/style.css` — The Costumes

This file makes everything look like space:
- Dark background colours
- Planet sizes (e.g., Jupiter is bigger than Mercury)
- Circular shapes using `border-radius: 50%`
- The sun is a glowing yellow circle with a background image
- Asteroids are tiny grey dots

Because the planets are absolutely positioned (`position: absolute`), JavaScript can freely move them around the screen by changing their `left` and `bottom` pixel values.

---

### `js/SolarSystemModel.constructor.js` — The Director

This is the brain of the app. It is a single JavaScript class called `SolarSystemModel`. When the page loads, this class does everything in a specific order:

```
1. Register constants    → figure out screen size and centre point
2. Register planets      → load the hardcoded data for 8 planets + asteroid belts
3. Render planets        → start moving the planets
4. Render orbits         → draw the grey ellipse lines on canvas
5. Render shadows        → draw the dark bands behind planets on canvas
6. Render asteroids      → create hundreds of tiny asteroid divs and start them moving
7. Render sun rotation   → start spinning the sun
8. Init resize listener  → redraw orbits when the window is resized
9. Init sound            → hook up the speaker icon to play/pause music
```

#### How planets move

Each planet follows a **parametric ellipse equation**.

Instead of using the browser's smooth animation loop (`requestAnimationFrame`), the original author chose to give every planet its own timer (`setInterval`). Every tick of that timer:
1. Decreases the planet's angle slightly.
2. Calculates new `left` and `bottom` pixel coordinates using sine and cosine.
3. Updates the planet's CSS `left` and `bottom` properties.

This means Mercury has one timer, Venus has another timer, Earth has another ... and every asteroid also gets its own timer. In total there are about **600 timers** running at once. On a modern desktop this is fine, but it is not the most efficient way to animate things.

#### How the asteroid belt works

The asteroid belt is **procedurally generated** every time the page loads. The code does not know where each asteroid will be in advance. Instead, it uses two mathematical sampling techniques:
- **Rayleigh distribution** — to decide how oval (eccentric) each asteroid's orbit is.
- **Normal distribution** (via the Box-Muller transform) — to decide how far from the Sun the asteroid orbits.

It creates three sub-belts:
- Inner belt: ~50 asteroids
- Middle belt: ~500 asteroids
- Outer belt: ~50 asteroids

Each asteroid is a tiny `<div>` that gets appended to the page and animated with its own timer.

#### Canvas orbits and shadows

The orbit lines are drawn once on the canvas when the page loads (and again if you resize the window). They are simple ellipses centred on the screen, offset so that the Sun sits at one focus of each ellipse.

The shadows are a clever visual trick: the code draws thick, semi-transparent black strokes on the canvas **behind** the orbit lines. When a planet passes through that band, it looks like it is in shadow.

---

### `js/main.js` — The Curtain Rise

This file is only 3 lines long. It waits for the page to finish loading, creates a new `SolarSystemModel`, and that's it. Nothing else happens here.

---

## How the Pieces Fit Together

```
HTML (the stage)
    ├── CSS (costumes & colours)
    ├── Canvas (orbit lines & shadows)
    └── JavaScript (the director)
            ├── Data: hardcoded planet & asteroid tables
            ├── Canvas API: draws ellipses for orbits
            ├── DOM API: creates asteroid divs and moves planets
            └── Timers: 600+ setInterval loops drive motion
```

---

## What Would Need to Change for a Generated System?

If you wanted to plug in data from the **Mneme CE World Generator** (or any other star system generator), these are the main changes:

1. **Dynamic HTML generation** — Instead of hardcoding 8 planet `<div>`s in `SolarSystem.html`, you would generate them from JSON data on page load.
2. **A single animation loop** — Replace the 600 individual timers with one `requestAnimationFrame` loop that updates every body each frame. This is more efficient and scales to any number of planets.
3. **Adaptive zoom** — Right now 1 AU = 50 pixels, and the outer planets are manually squashed to fit. A generated system might have very different distances, so you would need a zoom or scroll feature.
4. **Multi-star support** — The current code assumes one sun in the centre. A binary or trinary system would need the concept of a **barycentre** (the centre of mass around which stars orbit).
5. **Data importer** — Add a small function that reads MWG JSON and converts `distanceAU`, `mass`, `zone`, etc. into the `semiMajorAxis`, `speed`, and `size` values this engine expects.

---

## Quick Reference: Key Terms

| Term | What it means here |
|------|--------------------|
| **Parametric ellipse** | A way to trace an oval using `sin` and `cos` of an angle |
| **Focus** | One of two special points inside an ellipse; the Sun sits at a focus |
| **Rayleigh distribution** | A probability curve used to generate realistic asteroid eccentricities |
| **Box-Muller transform** | A math trick to turn random numbers into a bell curve (normal distribution) |
| **`setInterval`** | A JavaScript timer that runs code repeatedly |
| **`requestAnimationFrame`** | The modern, smoother way to run animation code in browsers |
| **DOM** | The live tree of HTML elements that JavaScript can manipulate |
| **Canvas** | A special HTML element for drawing pixels, lines, and shapes programmatically |
