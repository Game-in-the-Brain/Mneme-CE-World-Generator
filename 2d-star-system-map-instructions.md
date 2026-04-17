# 2D Star System Map — User Instructions

**Feature:** Interactive 2D animated map of any generated star system  
**Live Map:** [https://game-in-the-brain.github.io/2d-star-system-map/](https://game-in-the-brain.github.io/2d-star-system-map/)  
**Source Repo:** [Game-in-the-Brain/2d-star-system-map](https://github.com/Game-in-the-Brain/2d-star-system-map)

---

## How to View a System Map

1. **Generate a system** in the Mneme CE World Generator
2. Click the **"View System Map"** button in the System Viewer panel
3. The map opens in a new browser tab at `https://game-in-the-brain.github.io/2d-star-system-map/`

The button encodes the current star system as a Base64 payload in the URL. The map reads this payload and renders an animated orbital view of the entire system — star, planets, dwarfs, ice worlds, gas giants, and disks, all orbiting at proportionally correct distances and periods.

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

## Saving the Map as HTML

You can save any generated map as a standalone HTML file that works offline:

1. Open the map in your browser (via the "View System Map" button)
2. Wait for the map to fully render
3. Use your browser's **Save Page** feature:
   - **Chrome/Edge:** `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac) → choose "Webpage, Complete"
   - **Firefox:** `Ctrl+S` → choose "Web Page, Complete"
   - **Safari:** `File → Save As` → choose "Web Archive"
4. The saved file contains the full system data in the URL — no internet connection needed to view it later

**Tip:** The URL itself contains the entire star system. You can also bookmark the map tab or copy the URL to share a specific system with someone else. Anyone who opens that URL sees the same map.

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

The integration between the World Generator and the 2D Map works via URL encoding:

1. The "View System Map" button in `src/components/SystemViewer.tsx` wraps the current `StarSystem` object with a random starfield seed and epoch (year 2300)
2. The payload is encoded as Unicode-safe Base64: `btoa(encodeURIComponent(json))`
3. The map is opened at: `https://game-in-the-brain.github.io/2d-star-system-map/?system=<encoded>`
4. The map app decodes the payload and builds a scene graph from the star system data

The 2D Map is a standalone Vite + TypeScript app with no React dependencies. It lives in a separate repo (`2d-star-system-map`) and has no runtime dependency on the World Generator.

---

**Last Updated:** 2026-04-17
