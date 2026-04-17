# Mneme CE World Generator — AI Repository Analysis

> **Purpose:** Quick onboarding for AI coding assistants. Read this first before making changes.
>
> **Note:** This document covers the **v1 pipeline (current code)**. A v2 pipeline redesign (FR-041/042/043) is fully specced but not yet implemented — see `QA.md` handoff section and FRD §14.2–14.4 for details. Do not modify repoAnalysis.md for v2 until the code is implemented.

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
│   ├── optionsStorage.ts   # loadGeneratorOptions() / saveGeneratorOptions() — QA-037 backward compat
│   ├── shipsInArea.ts      # Ships in the Area generation — see §6.5
│   ├── stellarData.ts      # Star mass, luminosity, zone calculations
│   ├── physicalProperties.ts # Density → radius/gravity/escape velocity
│   ├── dice.ts             # Roll functions (2D6, 3D6, keep/explode)
│   ├── db.ts               # Dexie/IndexedDB persistence
│   ├── format.ts           # Number formatting helpers
│   ├── exportDocx.ts       # Word document export
│   └── version.ts          # Auto-generated version (1.3.{commitCount})
├── components/
│   ├── GeneratorDashboard.tsx # Main UI with controls
│   ├── SystemViewer.tsx    # Displays generated system (5 tabs)
│   ├── Navigation.tsx      # Top nav + theme toggle
│   ├── Settings.tsx        # Import/export/clear data, preset management
│   ├── Glossary.tsx        # Definitions reference
│   └── ShipsPriceList.tsx  # Ship reference table with income-years
├── App.tsx                 # Root component, view routing
└── main.tsx                # Entry point

references/                 # Markdown reference docs (REF-001 to REF-013), star PNGs
public/                     # Static assets, PWA manifest
```

---

## 4. Key Types (from `src/types/index.ts`)

### Core Data Model
```typescript
StarSystem {
  id: string                    // UUID
  createdAt: number             // Timestamp
  name?: string
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
  economicPreset?: TLProductivityPreset
  economicPresetLabel?: string
  economicPresetSnapshot?: TLProductivityPreset
  allowShipsAtXPort?: boolean
}

MainWorld {
  type: 'Habitat' | 'Dwarf' | 'Terrestrial'
  size: number                  // km diameter
  lesserEarthType?: LesserEarthType  // Carbonaceous/Silicaceous/Metallic/Other
  massEM: number                // Earth Masses (QA-023)
  densityGcm3: number           // g/cm³ — rolled from density table (QA-023)
  gravity: number               // Derived from mass + density physics
  radius: number
  escapeVelocity: number
  atmosphere: AtmosphereType    // Average/Thin/Trace/Dense/Crushing
  atmosphereTL: number
  temperature: TemperatureType  // Average/Cold/Freezing/Hot/Inferno
  temperatureTL: number
  hazard: HazardType            // None/Polluted/Corrosive/Biohazard/Toxic/Radioactive
  hazardIntensity: HazardIntensityType
  hazardIntensityTL: number
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
  lesserEarthType?: LesserEarthType
  // Physical properties (added by calculatePhysicalProperties)
  densityGcm3?: number
  radiusKm?: number
  diameterKm?: number
  surfaceGravityG?: number
  escapeVelocityMs?: number
}

Inhabitants {
  populated?: boolean
  habitatType?: string          // Artificial habitat type if Hab ≤ 0
  techLevel: number
  foundingTL?: number           // QA-026: before depression penalty
  effectiveTL?: number          // QA-026: after depression penalty
  population: number
  wealth: WealthLevel
  powerStructure: PowerStructure
  development: DevelopmentLevel
  sourceOfPower: PowerSource
  governance: number            // -9 to +14 DM
  starport: Starport
  travelZone: TravelZone
  travelZoneReason?: string
  cultureTraits: string[]       // 2 traits, conflict-checked (QA-020/021)
}

Starport {
  class: StarportClass          // X, E, D, C, B, A
  pss: number                   // Port Size Score
  rawClass: StarportClass       // Before TL cap
  tlCap: StarportClass          // TL capability ceiling
  annualTrade: number
  weeklyBase: number            // annualTrade / 52
  weeklyActivity: number        // weeklyBase × 3D6
  hasNavalBase: boolean
  hasScoutBase: boolean
  hasPirateBase: boolean
  foundingClass?: StarportClass // QA-026: before depression
  foundingPSS?: number
  foundingRawClass?: StarportClass
}
```

### Important Enums
```typescript
type StellarClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M'
type Zone = 'Infernal' | 'Hot' | 'Conservative' | 'Cold' | 'Outer'
type WorldType = 'Habitat' | 'Dwarf' | 'Terrestrial'
type LesserEarthType = 'Carbonaceous' | 'Silicaceous' | 'Metallic' | 'Other'
type BodyType = 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas'
type StarportClass = 'X' | 'E' | 'D' | 'C' | 'B' | 'A'
type TravelZone = 'Green' | 'Amber' | 'Red'
type GasWorldClass = 'I' | 'II' | 'III' | 'IV' | 'V'
type WealthLevel = 'Average' | 'Better-off' | 'Prosperous' | 'Affluent'
type DevelopmentLevel = 'UnderDeveloped' | 'Developing' | 'Mature' | 'Developed' | 'Well Developed' | 'Very Developed'
type PowerSource = 'Aristocracy' | 'Ideocracy' | 'Kratocracy' | 'Democracy' | 'Meritocracy'
type ProductivityCurve = 'mneme' | 'flat' | 'linear' | 'custom'
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

5. generateInhabitants(mainWorld, populated, options)
   ├── envHab = habitability − tlDisplayMod (strip TL-7 component)
   ├── productivityMultiplier = getSoc7MonthlyIncome(TL, preset) / getSoc7MonthlyIncome(baseTL, preset)
   │   └── CE: always 1.0 (flat); Mneme: compounds with TL (~389 000× at TL 16)
   ├── Population (QA-061 productivity-ratio model):
   │   ├── Natural (envHab > 0): 10^(envHab+1) × productivityMultiplier × exploding2D6 → maxPop; pop = 3D6 × maxPop × 0.05
   │   └── Hostile (envHab ≤ 0): MVT/GVT habitat table × productivityMultiplier
   ├── Wealth, Power Structure, Development, Source of Power (weighted 2D6 tables)
   ├── Depression Penalty (QA-026): low pop/dev reduces effectiveTL by 0–4
   ├── Governance DM = f(Development, Wealth)
   ├── Starport (PSS v1.1 — QA-056/057):  ← see §6.5 for full economic breakdown
   │   ├── gdpPerDay = getGdpPerDayForWorld(TL, dev, wealth, preset) — avg-SOC (QA-056)
   │   ├── annualTrade = population × gdpPerDay × 365 × getTradeFraction(dev)
   │   ├── PSS = floor(log10(annualTrade)) − 10 → rawClass (pssToClass)
   │   ├── tlCap = getTLCapClass(TL) — TL ≤3→X, 4–5→E, 6–7→D, 8–9→C, 10–11→B, ≥12→A
   │   ├── finalClass = min(rawClass, tlCap)
   │   └── weeklyActivity = (annualTrade ÷ 52) × 3D6
   ├── Starport recalculated with effectiveTL → foundingClass vs final class (QA-026)
   ├── Travel Zone = f(Hazard, Intensity, effectiveTL)
   └── Culture Traits (2 traits, QA-020/021 conflict rerolls)

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
- **Tech Level: 0 to +9** ← For displayed habitability only (TL-7, clamped). Population uses a separate productivity-ratio model (QA-061) — see §6.5.

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

The economic system is the most redesigned subsystem in the PWA. It replaces the original book's PVS (Port Value Score) with a GDP-based model driven by **economic assumption presets** — the single most important user-facing setting.

#### Core Concept: Income as Productivity, and What That Implies

**"Income" in this system is a placeholder for productivity** — the total useful output per person per unit of time. It is not wages in the paycheck sense. It represents how much value one person creates when operating the full automation stack available at their TL: CNC machines, robots, drones, industrial equipment, ships, AI systems.

This matters because productivity determines two things that cascade through the entire generator:

**1. Carrying capacity (population).** A world's maximum population is bounded by how efficiently it converts resources into the necessities of civilization. At low productivity, most human labor goes to food, shelter, and basic manufacturing — the carrying capacity is low. As productivity rises, less of the total labor pool is needed for subsistence. Labor is freed for human capital formation (education, research, governance, infrastructure), which further compounds productivity. The `productivityMultiplier` in the population formula directly models this: higher productivity per person → more people the world can support.

**2. Economic scale (trade, starports, ships).** GDP/day per person × population × trade fraction = the total economic activity that funds starport infrastructure and attracts ship traffic. Productivity drives both the numerator (per-capita output) and, through carrying capacity, the denominator (population size). The effects compound.

#### The Two Economic Theses

The preset system encodes two opposing theories about how technology and civilization interact over centuries:

- **Mneme preset (compounding growth):** Technology makes each unit of human effort exponentially more productive. Each TL step multiplies SOC 7 income by ~×3.3. A TL 16 worker controlling automated factories, robotic fleets, and AI systems produces ~2.8 million times the output of a TL 7 worker. This models the trajectory visible in real-world data: the automation multiplier (`P(t) = W(t) × M(t)` where M is the automation multiplier per worker) compounds with each generation of technology. Growth implies arbitrage — innovation and efficiency spread, the ability to move material in greater mass and distance increases, and raw inputs are converted into greater value at increasing levels of complexity and efficiency. Labor costs rise because each worker commands more automated output per unit of effort. This is the world described in the *Under Heaven Demographics* research series: societies that invested in human capital and structural reform see compounding returns; the population formulas reflect this.

- **CE / Traveller preset (stagnant):** Technology changes what exists but not what people earn. SOC 7 gets 2,000 Cr/month at every TL — a ship costs 228 years of wages whether you're TL 7 or TL 16. This models a Japan-style stagnation extended over centuries or millennia: real wages flat, automation captured by capital rather than distributed through the economy, demographic and institutional sclerosis preventing the productivity-to-income feedback loop from firing. In CE/Traveller, population and development level are the only economic levers. A TL 14 world with 500 people has the same per-capita output as a TL 7 world with 500 people. The difference is only in *what* they can build, not *how much* economic activity they generate.

- **Stagnant preset:** Same flat income as CE, plus tightly clustered societal roll weights — bureaucratic equilibrium with minimal variance in wealth, development, or governance. Models institutional lock-in.

- **Custom presets (FR-032):** User-defined curve, base income, and roll weights for campaign-specific economic assumptions.

#### How the Preset Cascades Through Everything

```
Preset choice (economic thesis)
  │
  ├── 1. Income curve (getSoc7MonthlyIncome)
  │     Mneme: SOC 7 income compounds ×3.3/TL (205 Cr/day TL7 → 578M Cr/day TL16)
  │     CE:    SOC 7 income flat at 2,000 Cr/month regardless of TL
  │
  ├── 2. Per-capita GDP/day (getGdpPerDayForWorld)
  │     Development+Wealth → avgSoc → getSocMonthlyIncome(avgSoc, TL, preset)
  │     A Developed/Affluent world (SOC 11) earns 16× the SOC 7 baseline
  │
  ├── 3. Population (QA-061 productivity ratio)
  │     productivityMultiplier = income(TL) / income(baseTL)
  │     CE: always 1.0 — population depends purely on habitability
  │     Mneme: ~1× at TL9, ~389,000× at TL16 — tech unlocks carrying capacity
  │     maxPop = 10^(envHab+1) × productivityMultiplier × exploding2D6
  │
  ├── 4. Annual Trade = population × GDP/day × 365 × tradeFraction(dev)
  │     └── PSS = floor(log10(annualTrade)) − 10 → starport class
  │
  ├── 5. Weekly Activity = annualTrade/52 × 3D6 → ship budget
  │     └── Ships greedy-fill from TL-gated pools
  │
  └── 6. Roll weights (wealth, development, power, governance)
        CE weights push toward more democracies, higher development
        Stagnant weights cluster tightly around median outcomes
```

**The result:** Generating the same stellar system with Mneme vs CE produces dramatically different civilizations. A TL 12 Developed world in Mneme might have 720 million people and a Class B starport with warships in orbit. The same world in CE has ~36 million people and a Class D port with a handful of small craft. The difference is not a tuning knob — it reflects fundamentally different assumptions about whether technological progress translates into economic growth or gets captured by institutional stagnation.

#### Old System (PVS) vs New System (PSS)

The original PVS added TL as a direct addend (`floor(Hab/4) + (TL-7) + mods`), double-counting TL's effect (TL already drove population). A 100-trillion-person TL 9 world and a 700-million-person TL 14 world could score identically. PSS v1.1 replaced this with GDP-scaled port sizing — population × per-capita income × trade fraction. TL now only appears as a *capability ceiling* (no jump drives below TL 12). See `260410-Changes.md §8a` for the full comparison.

#### Depression Penalty (QA-026)

Small or undeveloped populations cannot sustain their founding TL. `calculateDepressionPenalty()` reduces effective TL by 0–4 points based on population thresholds (<1M/100K/10K) and development level. The starport is calculated twice — once at founding TL, once at effective TL — and the final class shown with founding class in parentheses (e.g., "Class E (founded Class B)"). Low effective TL also forces Amber (TL<10) or Red (TL<9) travel zones.

---

Four interdependent formulas follow. Read this before touching any starport, income, or ships code.

#### PSS (Port Size Score)  `src/lib/worldData.ts:510–539`

```
gdpPerDay   = getGdpPerDayForWorld(TL, dev, wealth, preset)  ← QA-056: avg-SOC (see GDP below)
annualTrade = population × gdpPerDay × 365 × getTradeFraction(dev)
PSS         = floor(log10(max(1, annualTrade))) − 10
rawClass    = pssToClass(PSS)
tlCap       = getTLCapClass(TL)
finalClass  = min(rawClass, tlCap)
```

PSS → Class (updated QA-061):

| PSS  | Class |
|------|-------|
| < 3  | X     |
| 3–4  | E     |
| 5    | D     |
| 6    | C     |
| 7    | B     |
| ≥ 8  | A     |

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

#### GDP Per Day  `src/lib/economicPresets.ts`

All live generation now routes through `getGdpPerDayForWorld(tl, development, wealth, preset)` (QA-056):

```typescript
// economicPresets.ts — QA-056
export function getGdpPerDayForWorld(
  tl: number,
  development: DevelopmentLevel,
  wealth: WealthLevel,
  preset: TLProductivityPreset,
): number {
  const avgSoc = Math.min(12, DEVELOPMENT_AVG_SOC[development] + WEALTH_SOC_BONUS[wealth]);
  const monthly = getSocMonthlyIncome(avgSoc, tl, preset);
  return (monthly * 12) / DAYS_PER_YEAR;
}
```

SOC mapping:

| Development       | Avg SOC | Wealth     | SOC Bonus |
|-------------------|---------|------------|-----------|
| UnderDeveloped    | 3.5     | Average    | +0        |
| Developing        | 5       | Better-off | +1        |
| Mature            | 6       | Prosperous | +2        |
| Developed         | 8       | Affluent   | +3        |
| Well Developed    | 9       |            |           |
| Very Developed    | 10      |            |           |

Behaviour by preset (TL 9, Mature/Average = SOC 6):

| Preset  | Curve  | TL 9 SOC6 GDP/day | TL 12 SOC6 GDP/day | Notes |
|---------|--------|-------------------|-------------------|-------|
| Mneme   | Compounding (×3.3 per TL) | ~744 Cr | ~105 000 Cr | Default |
| CE/Traveller | Flat | ~33 Cr (all TLs) | ~33 Cr | `baseIncome ≈ 2 000 Cr/mo SOC 7` |
| Custom  | User multipliers | Varies | Varies | FR-032 |

`getGdpPerDayFromPreset(tl, preset)` still exists (anchored to SOC 7) but is no longer used in the main generation pipeline — `getGdpPerDayForWorld()` routes through avg-SOC instead. `GDP_PER_DAY_BY_TL` and `getGdpPerDay()` were deleted in QA-061.

---

#### Annual Trade  `src/lib/worldData.ts:568`

```
annualTrade = population × gdpPerDay × 365 × getTradeFraction(dev)
```

`gdpPerDay` is from `getGdpPerDayForWorld()` (QA-056) — Wealth is already embedded in the avg-SOC income. `wealthMultiplier` was removed in QA-057 to eliminate double-counting.

Trade fraction adds controlled variance per level (QA-061):

| Dev Level      | Formula | Mean | Range |
|----------------|---------|------|-------|
| UnderDeveloped | 5% (fixed) | 5% | 5% |
| Developing     | 6.5% + 1D6 × 1% | 10% | 7.5%–12.5% |
| Mature         | 10% + 2D6 × 0.7% | 15% | 12%–18.4% |
| Developed      | 15% + 2D6 × 0.7% | 20% | 17%–23.4% |
| Well Developed | 20% + 2D6 × 0.7% | 25% | 22%–28.4% |
| Very Developed | 25% + 2D6 × 0.7% | 30% | 27%–33.4% |

**Preset impact:** In Mneme, GDP/day compounds with TL and varies by dev+wealth SOC — a TL 12 Developed world generates many times more annual trade than TL 9 Developing. In CE/Traveller the curve is flat; population and development drive nearly all variance.

---

#### Ships in the Area  `src/lib/shipsInArea.ts`

```
rawBudget       = weeklyTradeValue × (1D6 × 0.1)
effectiveBudget = rawBudget                           ← Boat Years scarcity removed (QA-058)
categoryBudgets = effectiveBudget × DISTRIBUTION_TABLE[1D6]   (small / civilian / warship %)
```

Ships are selected greedily from pool by `visiting_cost_cr` until the category budget is exhausted (safety cap 1 000). Table shows **Credit Value** and **Monthly Op. Cost** — income-years display removed (QA-058).

**Port gates (QA-030 + QA-058):**
- Class X port → controlled by `allowShipsAtXPort` toggle (default `true` after QA-061). When false → zero ships.
- Class E port → budget capped at 10%, small-craft-only, max 5 ships (unchanged)
The E-class gate is applied upstream in `SystemViewer.tsx`; X-class checks the toggle first.

**Budget scaling (post QA-056/058):**  
Boat Years scarcity multiplier removed. CE worlds already produce far lower `weeklyTradeValue` because `gdpPerDay` is lower (via avg SOC from QA-056). The budget is naturally proportionate — no artificial deflation needed.

---

#### Economic System Summary

| Calculation   | Status | Key Function |
|---------------|--------|--------------|
| PSS           | ✅ Correct (QA-061 thresholds) | `getGdpPerDayForWorld()` + `pssToClass()` |
| GDP Per Day   | ✅ Correct (QA-056 avg-SOC) | `economicPresets.ts` — dev+wealth → avgSoc → income |
| Annual Trade  | ✅ Correct (QA-057 wealthMult removed) | GDP/day × population × tradeFraction[dev] |
| Ships in Area | ✅ Reworked (QA-058) | Credit-native budget; Boat Years scarcity removed; X-port toggle |

**Open economic engine issues (queued):**
- **QA-049** — Economic model toggle (Stable vs Compounding) surface in Settings
- **QA-052** — Absorbed into QA-058 (completed)
- **QA-054** — Terraforming Terraton Structures lore entry

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
import { roll2D6, roll3D6, roll5D6, rollD6, rollD66, rollXD6,
         roll2D3, roll2D6Adv, roll2D6Dis, roll1D6Reroll6,
         rollKeep, rollExploding, rollWeighted2D6, rollTL,
         clamp, round } from './dice';

// Standard: roll2D6().value
// Keep/drop: rollKeep(diceCount, diceType, keepCount, 'highest'|'lowest', modifier)
// Exploding: rollExploding(diceCount, diceType, multiplier?, modifier?)
// Weighted 2D6: rollWeighted2D6(weights: TableWeights) — custom distribution
// TL roll: rollTL() — 6D6 keep lowest 4 ÷ 2 (downward-biased, range 2-12)
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
mneme_theme                    // 'dark' | 'day' | 'phone'
mneme_annotations_${systemId}  // Body name/notes per system
mneme_generator_options        // FR-028: GeneratorOptions — starClass, grade, worldType, preset, weights, goals
mneme_debug_mode               // 'true' | 'false' — Batch Export visibility (default: true)
mneme_custom_presets           // TLProductivityPreset[] — user-defined economic presets
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

2. **Three separate TL scalings** — Habitability, Population, and Starport use different paths:
   - **Displayed habitability**: `TL−7` (clamped 0–9) — for world descriptors only
   - **Population (QA-061)**: `productivityMultiplier = getSoc7MonthlyIncome(TL, preset) / getSoc7MonthlyIncome(baseTL, preset)`. Formula: `10^(envHab + 1) × productivityMultiplier × roll`. MVT/GVT fires when `envHab ≤ 0`.
   - **Starport (QA-056)**: `getGdpPerDayForWorld(TL, dev, wealth, preset)` for economic scale, `getTLCapClass(TL)` as capability ceiling. No Hab or TL-7 involved. See §6.5.

3. **Stellar class modifiers (v1.2)**: REF-007 v1.2:
   - F: Adv+2 on d6 | G: Baseline d6 | K: Dis+3 on d6 | M: Half Dice (d3) + Dis+1

4. **GDP/day — all legacy fallbacks deleted**: `GDP_PER_DAY_BY_TL` table and `getGdpPerDay()` deleted in QA-061. Use `getGdpPerDayForWorld(tl, dev, wealth, preset)` — avg-SOC income scaling (QA-056).

5. **Weekly activity formula**: code uses `annualTrade / 52` (true weekly rate). Any old doc saying `÷ 364` is stale.

6. **Ships scarcity removed (QA-058)**: Boat Years budget deflation gone. CE worlds produce naturally smaller budgets via lower `weeklyTradeValue` (QA-056 avg-SOC GDP). Budget = `rawBudget` directly.

7. **`optionsStorage.ts` is the single gateway** to `mneme_generator_options`: Always use `loadGeneratorOptions()` / `saveGeneratorOptions()` — ensures backward-compat merging with defaults (QA-037).

8. **Theme persistence**: Always use `handleThemeChange` in App.tsx — it tracks desktopTheme for Phone toggle return behavior.

9. **Body type labels**: Internal type is `'ice'`, but UI shows `"Ice Worlds"` (QA-008). Always use typeLabel in UI.

10. **Zone clearing timing**: Hot Jupiter migration runs BEFORE Hill sphere spacing. Order matters.

---

## 11. Reference Documents (in `references/`)

| Document | Content |
|----------|---------|
| REF-001 | Stellar tables (mass, luminosity by class/grade) |
| REF-002 | Companion star generation rules |
| REF-003 | Zone boundaries / orbit distance calculation |
| REF-004 | World type selection & mass tables |
| REF-005 | Main world position in habitable zone |
| REF-006 | Culture trait generation (D6×D6×D6) |
| REF-007 | Planetary system body counts (Adv/Dis modifiers, v1.2) |
| REF-008 | Gas world classification (Class I–V) |
| REF-009 | Circumstellar disk zone table |
| REF-010 | Planet densities (g/cm³ by type) + Travel zone rules |
| REF-011 | Hill sphere orbital spacing algorithm (.ts) |
| REF-012 | CSV export format spec (not yet implemented) |
| REF-013 | Tech Level 9-18 table + QA-023 density analysis |

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

**Last Updated:** 2026-04-17  
**Version:** 1.7.0

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

## 14. Open Issues (2026-04-17)

### Recently Fixed (2026-04-17)

| Issue | Version | Description |
|-------|---------|-------------|
| QA-056 | v1.3.110 | GDP/day now uses average SOC (`getGdpPerDayForWorld()`) — Development + Wealth drive per-capita income |
| QA-057 | v1.3.111 | `wealthMultiplier` removed from annual trade — Wealth fully expressed via avg-SOC GDP |
| QA-058 | v1.3.112 | Ships rework — Boat Years scarcity removed; X-port toggle; Credit display |
| QA-061 | v1.3.113 | Population redesign — productivity ratio replaces `TL_POP_MOD`; +1 exponent; forgiving PSS thresholds |

### Queued — pending implementation

| Issue | Priority | Location | Description |
|-------|----------|----------|-------------|
| QA-049 | 🔴 High | `Settings.tsx`, `generator.ts` | Economic model toggle (Stable vs Compounding) — surface the curve type as a first-class user choice |
| QA-050 | 🟠 Medium | `SystemViewer.tsx` | Recent Systems should show Economic Assumptions used per system |
| QA-053 | 🟡 Low | Recent Systems UI | Recent Items should display what Economic Assumptions were used |
| QA-054 | 🟢 Lore | Glossary | Terraforming Terraton Structures — megastructure lore umbrella entry |
| QA-ADD-002 | 🟡 Low | `exportCSV.ts` | CSV export — spec in REF-012; no implementation yet |

### Partially fixed

| Issue | Status | Notes |
|-------|--------|-------|
| QA-028 | 🟡 Partial | Wealth vs Development contradiction — narrative bridge added (v1.3.97); underlying independent-roll table tension remains |
| QA-029 | 📋 Addressed | Anarchy over-representation — natural 2D6 preserved as default; Mneme/CE/Stagnant weight presets reduce skew (v1.3.101/106) |

### In progress

| Item | Status | Notes |
|------|--------|-------|
| FR-031 | 🟡 In Progress | 2D Animated Map — standalone repo (`2d-star-system-map`); Phases 0–5 complete; Phase 6 (tooltips, Brachistochrone, moons) pending |
| FR-040 | 🟢 Planned | Intrastellar Population Distribution — system-wide population model; see ROADMAP.md |

---

## 15. Recent Fixes (2026-04-10)

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
