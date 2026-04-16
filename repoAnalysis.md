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
│   ├── worldData.ts        # Tables: gravity, atmosphere, TL, PSS, GDP — see §6.5
│   ├── economicPresets.ts  # TL productivity presets (Mneme / CE / Custom) — see §6.5
│   ├── shipsInArea.ts      # Ships in the Area generation — see §6.5
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
   └── calculateTotalHabitability() — includes TL modifier (TL-7, clamped 0-9) for DISPLAY
       NOTE: Population uses separate TLmod lookup table — see generateInhabitants()

5. generateInhabitants(mainWorld, populated)
   ├── envHab = habitability − tlDisplayMod (strip TL-7 component for population formula)
   ├── Population: 10^(envHab + TLmod) × 2D6; TLmod from TL_POP_MOD lookup table
   │   └── TLmod: TL7→+5, TL8/9→+6 (plateau), TL10→+7 … TL16→+13
   │   └── Fork: if (envHab + TLmod) ≤ 0 → MVT/GVT habitat table instead
   ├── Wealth, Power Structure, Development, Source of Power (2D6 tables)
   ├── Governance DM = f(Development, Wealth)
   ├── Starport (PSS v1.1 — QA-019):  ← see §6.5 for full economic breakdown
   │   ├── gdpPerDay = getGdpPerDayFromPreset(TL, preset) — preset-aware (Mneme/CE/Custom)
   │   ├── annualTrade = population × gdpPerDay × 365 × tradeFraction[Dev] × wealthMult[Wealth]
   │   ├── PSS = floor(log10(annualTrade)) − 10 → rawClass (pssToClass)
   │   ├── tlCap = getTLCapClass(TL) — TL ≤3→X, 4–5→E, 6–7→D, 8–9→C, 10–11→B, ≥12→A
   │   ├── finalClass = min(rawClass, tlCap)
   │   └── weeklyActivity = (annualTrade ÷ 52) × 3D6  ← NOTE: code uses /52, old JSDoc said /364 (stale)
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
   │   See 260410-Changes.md Section 1 for rationale.
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
- **Tech Level: 0 to +9** ← For displayed habitability only (TL-7, clamped). Population uses a separate TLmod lookup table in generateInhabitants().

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

### 6.5 Economic System — Implementation Reference

Four interdependent calculations. Read this before touching any starport, income, or ships code.

#### PSS (Port Size Score)  `src/lib/worldData.ts:551–579`

```
gdpPerDay   = getGdpPerDayFromPreset(TL, preset)   ← preset-aware (see GDP below)
annualTrade = population × gdpPerDay × 365 × getTradeFraction(dev) × getWealthTradeMultiplier(wealth)
PSS         = floor(log10(max(1, annualTrade))) − 10
rawClass    = pssToClass(PSS)
tlCap       = getTLCapClass(TL)
finalClass  = min(rawClass, tlCap)
```

PSS → Class:

| PSS  | Class |
|------|-------|
| < 4  | X     |
| 4–5  | E     |
| 6–7  | D     |
| 8–9  | C     |
| 10–11| B     |
| ≥ 12 | A     |

TL Capability Cap:

| TL    | Max Class |
|-------|-----------|
| ≤ 3   | X         |
| 4–5   | E         |
| 6–7   | D         |
| 8–9   | C         |
| 10–11 | B         |
| ≥ 12  | A         |

**Known conflict:** The JSDoc comment on the weekly trade line says `annualTrade ÷ 364 × weeklyRoll`, but the live code uses `/ 52`. The code is correct (weeks, not days); the comment is stale from a pre-QA-027 edit. Do not revert to `/364`.

---

#### GDP Per Day  `src/lib/worldData.ts:477–494` + `src/lib/economicPresets.ts:76–80`

Active generation always routes through `getGdpPerDayFromPreset(tl, preset)`:

```typescript
// economicPresets.ts
export function getGdpPerDayFromPreset(tl: number, preset: TLProductivityPreset): number {
  const monthly = getSoc7MonthlyIncome(tl, preset);
  return (monthly * 12) / DAYS_PER_YEAR;
}
```

Behaviour by preset:

| Preset  | Curve  | TL 9 GDP/day | TL 12 GDP/day | Notes |
|---------|--------|-------------|--------------|-------|
| Mneme   | Compounding (×3.3 per TL) | ~1 486 Cr | ~210 000 Cr | Default |
| CE/Traveller | Flat | ~66 Cr (all TLs) | ~66 Cr | `baseIncome ≈ 2 000 Cr/mo` |
| Custom  | User multipliers | Varies | Varies | FR-032 |

The legacy `GDP_PER_DAY_BY_TL` table in `worldData.ts` still exists as a hardcoded fallback if no preset is supplied. All live calls pass a preset; the table is effectively dead code.

---

#### Annual Trade  `src/lib/worldData.ts:568`

```
annualTrade = population × gdpPerDay × 365 × TradeFraction[dev] × WealthMultiplier[wealth]
```

| Dev Level      | Trade Fraction |
|----------------|---------------|
| UnderDeveloped | 5%            |
| Developing     | 10%           |
| Mature         | 15%           |
| Developed      | 20%           |
| Well Developed | 25%           |
| Very Developed | 30%           |

| Wealth     | Multiplier |
|------------|-----------|
| Average    | 1.0       |
| Better-off | 1.2       |
| Prosperous | 1.5       |
| Affluent   | 2.0       |

**Preset impact:** In Mneme, GDP/day compounds with TL — a TL 12 world at the same population as TL 9 generates ~140× more annual trade, pushing it two or three starport classes higher. In CE/Traveller the curve is flat; population and dev/wealth drive almost all variance.

---

#### Ships in the Area  `src/lib/shipsInArea.ts:85–123`

```
rawBudget          = weeklyTradeValue × (1D6 × 0.1)
boatYears          = preset.boatYears ?? derivedFromBaseIncome
scarcityMultiplier = max(1, boatYears / MNEME_PRESET.boatYears)   ← reference is ~10.1
effectiveBudget    = rawBudget / scarcityMultiplier
categoryBudgets    = effectiveBudget × DISTRIBUTION_TABLE[1D6]   (small / civilian / warship %)
```

Ships are then selected greedily from pool by `visiting_cost_cr` until the category budget is exhausted (safety cap 1 000).

**Hard gates (QA-030):**
- Class X port → zero ships (returns empty arrays)
- Class E port → budget capped at 10%, small-craft-only, max 5 ships
These gates are applied upstream in `SystemViewer.tsx` before `generateShipsInTheArea` is called.

**Known design tension — QA-052 (queued):**  
The scarcity multiplier deflates the *budget* in Credits using a Boat Years ratio, but ship costs inside the pool remain raw Credits. This is internally consistent as a "how many ships can this port afford?" model, but it couples ship availability to the income-years concept rather than native Credits throughout. The proposed fix (QA-052) is to replace the Boat Years ratio with a Credit-native multiplier (`baseIncome_Mneme / baseIncome_preset`) so the entire pipeline operates in the same unit.

---

#### Economic System Summary

| Calculation   | Status | Key Dependency |
|---------------|--------|----------------|
| PSS           | ✅ Correct | `getGdpPerDayFromPreset()` via preset |
| GDP Per Day   | ✅ Correct | `economicPresets.ts` — Mneme compounding vs CE flat |
| Annual Trade  | ✅ Correct | GDP/day × population × dev/wealth multipliers |
| Ships in Area | ⚠️ Working, design tension | Boat Years scarcity on budget; QA-052 queued |

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
mneme_theme                  // 'dark' | 'day' | 'phone'
mneme_annotations_${systemId}  // Body name/notes per system
mneme_generator_options      // FR-028: { starClass, starGrade, mainWorldType, populated } — last-used generator controls
mneme_debug_mode             // 'true' | 'false' — Batch Export visibility (QA-014)
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

2. **Habitability vs Population vs Starport**: Three separate TL scalings:
   - **Displayed habitability**: uses `TL−7` (clamped 0–9) — for world descriptors only
   - **Population**: uses `TL_POP_MOD` lookup table (TL7→+5 … TL16→+13). `envHab` = habitability minus TL display mod. MVT/GVT fires when `envHab + TLmod ≤ 0`.
   - **Starport**: uses `getGdpPerDayFromPreset(TL, preset)` for economic scale, `getTLCapClass(TL)` as capability ceiling. No Hab or TL-7 involved. See QA-019 and §6.5.

7. **GDP/day legacy table vs preset path**: `GDP_PER_DAY_BY_TL` in `worldData.ts` still exists but is dead code — all live generation uses `getGdpPerDayFromPreset()`. Do not extend the legacy table; extend the preset system.

8. **Stale JSDoc in `worldData.ts`**: The comment on the weekly trade line says `annualTrade ÷ 364 × weeklyRoll`. The actual code uses `/ 52` (weeks). The comment is wrong; the code is right. Do not "fix" the code to match the comment.

9. **Ships scarcity unit mismatch (QA-052)**: `generateShipsInTheArea` deflates the budget using a Boat Years ratio, but `visiting_cost_cr` in the ship pool is raw Credits. These are different economic units. The scarcity works numerically but the conceptual mismatch will matter when CE and Mneme worlds are compared side-by-side. See §6.5 Ships section.

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

**Last Updated:** 2026-04-16  
**Version:** 1.4.0

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

## 15. Open Issues (2026-04-16)

| Issue | Location | Description |
|-------|----------|-------------|
| QA-027 | `worldData.ts`, `SystemViewer.tsx` | Income notation ambiguous — "B" = billion unclear, weekly vs annual figures don't reconcile. Root cause: Mneme compounding makes CE-scale populations produce CE-unfamiliar numbers. Blocked on FR-032 (income redesign). |
| QA-028 | `SystemViewer.tsx` | Wealth panel contradicts World Development description. Same root cause as QA-027. |
| QA-030 | `shipsInArea.ts`, `SystemViewer.tsx` | Ships at X/E-class starports too numerous. Hard gates exist but may need tightening. |
| **QA-052** | `shipsInArea.ts` | Ships scarcity uses Boat Years ratio to deflate Credit budget, but ship pool costs are raw Credits. Proposed fix: replace `boatYears/mnemeRef` ratio with `baseIncome_Mneme/baseIncome_preset` Credit-native multiplier. See §6.5. |
| **Stale JSDoc** | `worldData.ts` ~line 574 | Comment says `annualTrade ÷ 364 × weeklyRoll`; code uses `/ 52`. Comment is wrong. Fix: update JSDoc only — do not change code. |
| FR-032 | `economicPresets.ts` | Income system redesign: avg income per TL + ships-as-income-years UI. Architectural prerequisite for resolving QA-027/028/030. Spec in `260416-fr032-fr033-spec.md`. |

---

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
