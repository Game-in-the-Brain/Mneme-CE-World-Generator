# 2D Star System Map — User Instructions

**Feature:** Interactive 2D animated map of any generated star system  
**Live Map:** [https://game-in-the-brain.github.io/2d-star-system-map/](https://game-in-the-brain.github.io/2d-star-system-map/)  
**Source Repo:** [Game-in-the-Brain/2d-star-system-map](https://github.com/Game-in-the-Brain/2d-star-system-map)

---

## How to View a System Map

1. **Generate a system** in the Mneme CE World Generator
2. Click the **"Copy for 2D Map"** button in the System Viewer panel
3. Open [the 2D Map](https://game-in-the-brain.github.io/2d-star-system-map/) in a new browser tab
4. **Paste** the copied JSON into the textarea under the controls
5. Click **"Load System"**

The map renders an animated orbital view of the entire system — star, planets, dwarfs, ice worlds, gas giants, and disks, all orbiting at proportionally correct distances and periods.

---

## Map Controls

| Control | Action |
|---------|--------|
| **Mouse drag** | Pan the view |
| **Scroll wheel** | Zoom in/out |
| **Touch pinch** | Zoom (mobile) |
| **Touch drag** | Pan (mobile) |
| **Play/Pause** | Toggle orbital animation |
| **Speed slider** | Adjust animation speed |
| **Step buttons** | Advance time by set increments |

---

## Saving the Map

You can save any loaded system as a standalone JSON file:

1. Load a system via paste (see above)
2. Click the **"Download JSON"** button in the map controls
3. The `.json` file contains the full system data — you can re-paste it later

**Tip:** Save the JSON file to your device for long-term storage. The 2D Map app itself can be saved to your home screen as a PWA (Add to Home Screen on mobile, or Install on desktop).

---

## What the Map Shows

- **Central star** with correct spectral color (O blue-white through M red)
- **Habitable zone** band (Conservative zone highlighted in green)
- **All planetary bodies** orbiting at their generated AU distances
- **Body labels** with name/type
- **Orbital paths** as concentric rings
- **Seeded starfield** background (consistent per system)

The map is a **read-only visualizer** — it does not modify the generated system. All data flows one-way from the World Generator to the map.

---

## Technical Details

The integration between the World Generator and the 2D Map works via **clipboard copy/paste**:

1. The "Copy for 2D Map" button in `src/components/SystemViewer.tsx` copies the current `StarSystem` as formatted JSON to your clipboard
2. The 2D Map app parses the pasted JSON and builds a scene graph from the star system data
3. This avoids URL length limits that previously caused errors with large systems (many moons/rings)

The 2D Map is a standalone Vite + TypeScript app with no React dependencies. It lives in a separate repo (`2d-star-system-map`) and has no runtime dependency on the World Generator.

---

**Last Updated:** 2026-04-17
