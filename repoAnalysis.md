# Mneme CE World Generator — AI Repository Analysis

> **Purpose:** Quick onboarding for AI coding assistants. Read this first before making changes.

---

## 1. Executive Summary

**Project Type:** Progressive Web App (PWA) for tabletop RPG world generation  
**System:** Mneme variant of Cepheus Engine (Traveller-like sci-fi RPG)  
**Core Function:** Procedurally generate star systems, worlds, inhabitants, and planetary bodies using dice-based mechanics  

**What it generates:**
- Primary star (spectral class O-M) + companion stars
- Main world (Dwarf/Terrestrial/Habitat) with atmosphere, temperature, hazards
- Inhabitants (pop, TL, government, culture, starport)
- Full planetary system (disks, dwarfs, terrestrials, ice worlds, gas giants)

---

## 2. Tech Stack (Critical Context)

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | React 19 + TypeScript (strict) | Functional components, hooks only |
| Build | Vite 8 | `npm run dev` / `npm run build` |
| Styling | Tailwind CSS v4 | Uses `@import "tailwindcss"` (v4 syntax) |
| State | React hooks + localStorage | No Redux/Zustand |
| DB | Dexie.js (IndexedDB wrapper) | Async CRUD in `src/lib/db.ts` |
| Export | docx library | Word document generation |
| Icons | lucide-react | All icons from here |

**Build Check:** Always run `./node_modules/.bin/tsc -b` — must pass with 0 errors.

---

## 3. Directory Structure

```
src/
├── types/index.ts          # ALL TypeScript interfaces — read this first
├── lib/
│   ├── generator.ts        # Core generation pipeline — ENTRY POINT
│   ├── worldData.ts        # Tables: gravity, atmosphere, TL, etc.
│   ├── stellarData.ts      # Star mass, luminosity, zone calculations
│   ├── physicalProperties.ts # Density → radius/gravity/escape velocity
│   ├── dice.ts             # Roll functions (2D6, 3D6, keep/explode)
│   ├── db.ts               # Dexie/IndexedDB persistence
│   ├── format.ts           # Number formatting helpers
│   └── exportDocx.ts       # Word document export
├── components/
│   ├── GeneratorDashboard.tsx # Main UI with controls
│   ├── SystemViewer.tsx    # Displays generated system (5 tabs)
│   ├── Navigation.tsx      # Top nav + theme toggle
│   ├── Settings.tsx        # Import/export/clear data
│   ├── Glossary.tsx        # Definitions reference
│   └── DataLog.tsx         # (Deprecated — moved to Settings)
├── App.tsx                 # Root component, view routing
└── main.tsx                # Entry point

references/                 # Markdown reference docs (REF-001 to REF-013)
public/                     # Static assets, PWA manifest
```

---

## 4. Key Types (from `src/types/index.ts`)

### Core Data Model
```typescript
StarSystem {
  id: string                    // UUID
  createdAt: number             // Timestamp
  primaryStar: Star
  companionStars: Star[]
  zones: ZoneBoundaries         // Infernal/Hot/Conservative/Cold/Outer AU ranges
  mainWorld: MainWorld
  inhabitants: Inhabitants
  circumstellarDisks: PlanetaryBody[]
  dwarfPlanets: PlanetaryBody[]
  terrestrialWorlds: PlanetaryBody[]
  iceWorlds: PlanetaryBody[]
  gasWorlds: PlanetaryBody[]
}

MainWorld {
  type: 'Habitat' | 'Dwarf' | 'Terrestrial'
  size: number                  // km diameter
  gravity: number               // G
  atmosphere: AtmosphereType    // Average/Thin/Trace/Dense/Crushing
  temperature: TemperatureType  // Average/Cold/Freezing/Hot/Inferno
  hazard: HazardType            // None/Polluted/Corrosive/Biohazard/Toxic/Radioactive
  hazardIntensity: HazardIntensityType
  biochemicalResources: ResourceLevel  // Scarce/Rare/Uncommon/Abundant/Inexhaustible
  techLevel: number             // 7-16 (stored here for habitability calc)
  habitability: number          // Calculated score (can be negative)
  habitabilityComponents?: {    // Component breakdown for debugging
    gravity: number
    atmosphere: number
    temperature: number
    hazard: number
    hazardIntensity: number
    biochem: number
    techLevel: number
  }
  zone: Zone                    // Which zone the world is in
  distanceAU: number
}

PlanetaryBody {
  id: string
  type: 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas'
  mass: number                  // Earth masses
  zone: Zone
  distanceAU: number
  gasClass?: GasWorldClass      // I/II/III/IV/V for gas giants
  // Physical properties (added by calculatePhysicalProperties)
  densityGcm3?: number
  radiusKm?: number
  diameterKm?: number
  surfaceGravityG?: number
  escapeVelocityMs?: number
}
```

### Important Enums
```typescript
type StellarClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M'
type Zone = 'Infernal' | 'Hot' | 'Conservative' | 'Cold' | 'Outer'
type ViewMode = 'dashboard' | 'system' | 'settings' | 'glossary'
type Theme = 'dark' | 'day' | 'phone'
```

---

## 5. Generation Pipeline (Critical Path)

Entry: `generateStarSystem(options?)` in `src/lib/generator.ts`

```
1. generatePrimaryStar(options)
   └── stellar class + grade → mass, luminosity (stellarData.ts)

2. calculateZoneBoundaries(luminosity)
   └── sqrt(L) math → AU ranges for each zone

3. generateCompanionStars(primary)
   └── Recursive chain: roll 2D6 ≥ target → create companion

4. generateMainWorld(star, zones, forcedType?)
   ├── World type roll (5D6 keep mechanics)
   ├── Gravity roll (2D6) → gravity + habitability mod
   ├── Atmosphere roll (2D6) → type + TL + habitability
   ├── Temperature roll (2D6 + atmo mod) → temp + habitability
   ├── Hazard roll (2D6) → type + habitability
   ├── Intensity roll (2D6) → level + habitability
   ├── Biochem roll (2D6) → resources + habitability (KEY: Abundant=+3, Inexhaustible=+5)
   ├── Tech Level roll (2D6) → TL 7-16
   └── calculateTotalHabitability() — NOW includes TL modifier (TL-7, clamped 0-9)

5. generateInhabitants(mainWorld, populated)
   ├── Population: 10^habitability × 2D6 (or MVT/GVT table if Hab≤0)
   ├── Wealth, Power Structure, Development, Source of Power (2D6 tables)
   ├── Governance DM = f(Development, Wealth)
   ├── Starport class = f(Hab, TL, Wealth, Development)
   └── Travel Zone = f(Hazard, Intensity)

6. generatePlanetarySystem(star, zones)
   ├── getBodyCount(type, stellarClass) — Adv/Dis modifiers per REF-007 v1.1
   │   ├── F: Adv+2 on ALL body types (dwarf, terrestrial, ice, gas)
   │   ├── G: Baseline (no modifier)
   │   ├── K: Dis+2 on ALL body types
   │   ├── M: Dis+4 on ALL body types (dwarf, terrestrial, ice, gas)
   │   └── O/B/A: disks only
   │
   │   NOTE: Adv/Dis modifiers apply to BOTH count rolls AND mass
   │   rolls. Original book applied modifier to mass rolls only.
   │   v1.1 extends same modifier to count rolls (house rule).
   │   See 260410-Update.md Section 1 for rationale.
   ├── generateBody() for each type
   │   └── calculatePhysicalProperties() — density → radius/gravity/escape velocity
   ├── applyHotJupiterMigration() — QA-011: clear zones with Class III/IV/V gas
   └── resolveConflicts() — QA-006: Hill sphere spacing with min floor
```

---

## 6. Critical Implementation Details

### 6.1 Habitability Calculation (QA-009 Fix)
**Location:** `src/lib/worldData.ts` → `calculateTotalHabitability()`

Components:
- Gravity: -2.5 to 0
- Atmosphere: -2.5 to 0
- Temperature: -2.0 to 0
- Hazard type: -1.5 to 0
- Hazard intensity: -2.0 to 0
- **Biochem resources: -5 to +5** ← Was broken (Abundant returned 0, now +3)
- **Tech Level: 0 to +9** ← Was missing (TL-7, clamped)

Debug: In DEV mode, logs component breakdown to console.

### 6.2 Hill Sphere Spacing (QA-006 Fix)
**Location:** `src/lib/generator.ts`

```typescript
hillSphereAU(a, m, M) = a × ∛(m/(3M))
// where a=AU, m=body mass (Earth masses), M=star mass (Solar masses)

resolveConflicts() enforces:
- Hill sphere separation × 1.5, OR
- Minimum floor: 0.05 AU (inner zones), 0.15 AU (Outer)
// Whichever is LARGER wins
```

Violations logged to console in DEV mode.

### 6.3 Hot Jupiter Migration (QA-011 Fix)
**Location:** `src/lib/generator.ts` → `applyHotJupiterMigration()`

Rule: If Gas III in Infernal OR Gas IV/V in Hot:
1. Remove ALL non-disk bodies from that zone
2. Roll 2D6 per cleared zone: 11+ adds one captured rogue dwarf

### 6.4 Theme System (QA-005, QA-013)
**Location:** `src/components/Navigation.tsx`, `src/App.tsx`

- Dark/Day toggle shares button (saves space)
- Phone is separate toggle — click again returns to previous desktop theme
- Persisted to localStorage key: `mneme_theme`
- CSS: `[data-theme="phone"]` triggers single-column layout

---

## 7. Common Extension Points

### Adding a new world characteristic
1. Add to `MainWorld` interface in `src/types/index.ts`
2. Add generation logic in `generateMainWorld()` (generator.ts)
3. Add display in `SystemViewer.tsx` (World tab)
4. Add to DOCX export in `src/lib/exportDocx.ts`

### Adding a new table/lookup
1. Add to `src/lib/worldData.ts`
2. Export function that takes roll value, returns result object
3. Pattern: `{ value: X, habitability?: number, tl?: number }`

### Adding a new export format
1. Add button in `SystemViewer.tsx` (header export buttons)
2. Create `exportXXX.ts` in `src/lib/`
3. Use `downloadFile()` pattern from `src/lib/db.ts`

### Modifying habitability
**ALWAYS** update `calculateTotalHabitability()` in worldData.ts — this is the single source of truth.

---

## 8. Known Patterns & Conventions

### Dice Rolls
```typescript
// Standard: roll2D6().value
import { roll2D6, roll3D6, roll5D6, rollD6, rollKeep } from './dice';

// Keep/drop: rollKeep(diceCount, diceType, keepCount, 'highest'|'lowest', modifier)
const roll = rollKeep(4, 6, 3, 'highest', 0);
```

### CSS Variables (Theming)
```css
/* Always use these, never hardcode colors */
background-color: var(--bg-primary);
color: var(--text-primary);
border-color: var(--border-color);
accent: var(--accent-red);  /* #e53935 */
```

### Formatting Numbers
```typescript
import { formatNumber, formatPopulation, formatCredits } from './format';
formatNumber(1234567);     // "1,234,567"
formatPopulation(1500000); // "1.5M"
formatCredits(10000);      // "10,000 Cr"
```

### LocalStorage Keys
```
mneme_theme        // 'dark' | 'day' | 'phone'
mneme_annotations_${systemId}  // Body name/notes per system
```

---

## 9. Testing & Verification

### Type Check (Required)
```bash
./node_modules/.bin/tsc -b
# Must return 0 errors before committing
```

### Dev Mode Batch Testing
Use the Debug Batch Export panel (DEV only) to generate 40+ systems and verify:
- Mean habitability should be > 3.0
- Hill violations should be 0
- Some systems should have hotJupiterPresent: true

### Manual Verification Checklist
Generate a G5 star with Average atmo/temp, no hazard, Abundant biochem, TL 14:
- Expected habitability: 0 (gravity) + 0 (atmo) + 0 (temp) + 0 (hazard) + 3 (biochem) + 7 (TL) = **10.0**

---

## 10. Gotchas & Common Mistakes

1. **Mass units**: PlanetaryBody.mass is in Earth masses (EM). For Hill sphere calc, convert: `mSolar = m / 333000`

2. **Habitability vs Population**: Population uses `10^habitability`, so Hab=0 gives tiny populations. This is correct — Hab≤0 worlds use MVT/GVT table instead.

3. **Stellar class modifiers**: REF-007 v1.1 changed these:
   - F: Adv+2 (was +1)
   - G: Baseline (was +1)
   - K: Dis+2 (was none)
   - M: Dis+4 (was +1)

4. **Theme persistence**: Always use `handleThemeChange` in App.tsx — it tracks desktopTheme for Phone toggle return behavior.

5. **Body type labels**: Internal type is `'ice'`, but UI shows `"Ice Worlds"` (QA-008). Always use typeLabel in UI.

6. **Zone clearing timing**: Hot Jupiter migration runs BEFORE Hill sphere spacing. Order matters.

---

## 11. Reference Documents (in `references/`)

| Document | Content |
|----------|---------|
| REF-001 | Stellar tables (mass, luminosity by class/grade) |
| REF-003 | Zone boundaries calculation |
| REF-004 | World type selection tables |
| REF-007 | Planetary system generation (Adv/Dis modifiers) |
| REF-010 | Planet densities (g/cm³ by type) |
| REF-012 | CSV export format spec |
| REF-013 | Tech Level 9-18 table |

---

## 12. Quick Commands

```bash
# Dev server
npm run dev

# Type check (MUST PASS)
./node_modules/.bin/tsc -b

# Build
npm run build

# Preview production build
npm run preview
```

---

**Last Updated:** 2026-04-10  
**Version:** 1.3.0

## 13. Batch Export & Statistical Analysis (QA-012, QA-016)

**Location:** `src/components/GeneratorDashboard.tsx` → `DebugBatchExport`

DEV-only feature for statistical validation:
- Configurable batch size (default 40, max 1000)
- Exports full system data including habitability component breakdown
- **QA-016 Enhancement:** Star class breakdown with median body counts
  - Count per stellar class
  - Median total bodies, terrestrials, dwarfs, ices, gases, disks
  - Main world type distribution (terrestrial/dwarf/habitat %)
- Tracks: mean habitability, hot Jupiter frequency
- JSON format with metadata and summary statistics

## 14. Recent Fixes (2026-04-10)

| Fix | Location | Issue |
|-----|----------|-------|
| Body count modifiers | `worldData.ts` | Ice/gas worlds were missing Adv/Dis modifiers |
| Habitability components | `types/index.ts`, `generator.ts` | Added breakdown field for debugging |
| Temperature roll | `generator.ts` | Verified: Average requires modified roll ≥12 (2.78% chance) |

**Validated Body Counts by Stellar Class (1000 Systems):**

| Class | Mechanism | Dwarfs | Terrestrials | Ice | Gas | Total |
|-------|-----------|--------|--------------|-----|-----|-------|
| M | Half Dice (d3) + Dis+1 | ~2 | ~1 | ~0 | ~0 | **~5** |
| K | Dis+3 on d6 | ~3 | ~2 | ~2 | ~2 | **~11** |
| G | Baseline d6 | ~6 | ~4 | ~2 | ~2 | **~17** |
| F | Adv+2 on d6 | ~9 | ~7 | ~2 | ~2 | **~20** |
| A/B | Disks only | ~0 | ~0 | ~0 | ~0 | **~2** |

**Note:** M-class uses Half Dice (d3), all others use standard d6.
