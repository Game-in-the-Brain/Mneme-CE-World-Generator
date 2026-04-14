# QA Issues — Mneme CE World Generator

<div align="right">
  <a href="https://github.com/Game-in-the-Brain">
    <img src="./references/gitb_gi7b_logo_512.png" alt="Game in the Brain" width="64"/>
  </a>
</div>

**Project:** Mneme CE World Generator PWA  
**Repo:** [Game-in-the-Brain / Mneme-CE-World-Generator](https://github.com/Game-in-the-Brain)  
**Last Updated:** 2026-04-14

---

## ★ HANDOFF INSTRUCTIONS FOR KIMI (and all AI models) ★

If you are an AI model picking up this project, **read this block first**.

### Project
Mneme CE World Generator — React 19 + TypeScript 5.8 + Vite PWA that generates complete star systems for the Cepheus Engine tabletop RPG.  
Working directory: `/home/justin/opencode260220/Mneme-CE-World-Generator`  
Build command: `npm run build` (runs `tsc && vite build` — must pass with zero TypeScript errors).

### All Issues Resolved — Current Open Items

| # | Status | Notes |
|---|--------|-------|
| QA-018 / FR-028 | ✅ Fixed | `mneme_generator_options` localStorage in `GeneratorDashboard.tsx` |
| QA-020 | ✅ Fixed | `CULTURE_OPPOSITES` + 20-attempt reroll |
| QA-021 | ✅ Fixed | `POWER_CULTURE_CONFLICTS` exclusion list (Neil Lucock) |
| QA-022 | ✅ Fixed | `gravityImpliesDensity()` + reroll loop in `generator.ts` |
| FR-029 | ✅ Fixed | Roll 3D6 button in Starport card, persists via `onUpdateSystem` |
| FR-030 | ✅ Fixed | `src/lib/shipsInArea.ts`, wired to UI + `.docx` export |
| **QA-023** | ⏸ Proposed | Replace gravity tables with mass-derived gravity — **awaiting user approval** |
| **QA-ADD-002** | 📋 Spec only | CSV export — spec in REF-012; low priority, no implementation yet |

### ⚠️ QA-023 — DO NOT IMPLEMENT without explicit user instruction
Full spec in [QA-023](#qa-023). This is a significant engine rewrite. Wait for approval.

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/worldData.ts` | All generation tables — gravity, culture, starport, government |
| `src/lib/generator.ts` | World generation pipeline — calls all table functions |
| `src/lib/physicalProperties.ts` | `calculatePhysicalProperties(massEM, bodyType)` |
| `src/components/SystemViewer.tsx` | Main display — Starport card, Inhabitants panel |
| `src/components/GeneratorDashboard.tsx` | Generator options UI |
| `src/types/index.ts` | TypeScript types |
| `mneme_ship_reference.json` | 35 ships with `traffic_pool` + `monthly_operating_cost_cr` |
| `260409-v02 Mneme-CE-World-Generator-FRD.md` | Full feature spec |

### What NOT to change
- PSS starport formula (QA-019 ✅) — E/X on frontier worlds is correct (see QA-INV-001)
- Half Dice mechanic for M-class stars (QA-015 ✅)
- TL capability cap on starport class
- `POWER_CULTURE_CONFLICTS` or `CULTURE_OPPOSITES` tables (QA-020/021 ✅)

---

## Index

| # | Area | Title | Priority | Status |
|---|------|-------|----------|--------|
| [QA-001](#qa-001) | Branding | App title incorrect | 🔴 High | ✅ Fixed |
| [QA-002](#qa-002) | UI | Logo missing from header | 🔴 High | ✅ Fixed |
| [QA-003](#qa-003) | References | Star classification visual cue missing | 🟠 Medium | ✅ Fixed |
| [QA-004](#qa-004) | Data Display | Scientific notation — use formatted numbers | 🟠 Medium | ✅ Fixed |
| [QA-005](#qa-005) | UI | Missing Phone theme toggle | 🟠 Medium | ✅ Fixed |
| [QA-006](#qa-006) | Engine | Hill Sphere spacing not adjusting AU — disk collisions | 🔴 High | ✅ Fixed |
| [QA-007](#qa-007) | Engine | Adv/Dis modifiers not applied to planet count and size rolls | 🔴 High | ✅ Fixed |
| [QA-008](#qa-008) | Data | "Ice" should be labelled "Ice Worlds" | 🟡 Low | ✅ Fixed |
| [QA-009](#qa-009) | Data Display | Body stats missing: mass, radius, diameter, surface gravity, escape velocity | 🔴 High | ✅ Fixed |
| [QA-010](#qa-010) | UI | App is multi-page — should be single-page with tab anchors | 🟠 Medium | ✅ Fixed |
| [QA-011](#qa-011) | Engine | Hot Jupiter migration rule not implemented — inner zone clearing | 🔴 High | ✅ Fixed |
| [QA-012](#qa-012) | Dev Tool | Debug Batch Export button for statistical analysis | 🟡 Low | ✅ Fixed |
| [QA-013](#qa-013) | UI | Theme toggle buttons — Dark/Day should share space to save header width | 🟡 Low | ✅ Fixed |
| [QA-014](#qa-014) | Settings | Debug mode toggle — user-configurable, default ON | 🟡 Low | ✅ Fixed |
| [QA-015](#qa-015) | Engine | Half Dice mechanic for M-class stars (d3 + Dis+1) to reduce planet counts | 🟠 Medium | ✅ Fixed |
| [QA-016](#qa-016) | Dev Tool | Batch export enhanced with planet counts by star class and main world breakdown | 🟡 Low | ✅ Fixed |
| [QA-017](#qa-017) | Engine | Habitats sized by largest body mass in system | 🟡 Low | ✅ Fixed |
| [QA-018](#qa-018) | UI | Generator options reset on every navigation — last-used settings not preserved | 🟠 Medium | ✅ Fixed |
| [QA-019](#qa-019) | Engine | Starport PSS v1.1 — replace PVS formula with GDP-based PSS + TL capability cap | 🔴 High | ✅ Fixed |
| [QA-020](#qa-020) | Engine — Culture Generation | Culture traits should reroll opposing or duplicate results | 🟠 Medium | ✅ Fixed |
| [QA-021](#qa-021) | Engine — Inhabitants | Source of Power and Culture traits can generate contradictory combinations | 🔴 High | ✅ Fixed |
| [QA-022](#qa-022) | Engine — World Physics | Main world gravity and size are independent rolls — can be physically impossible | 🟠 Medium | ✅ Fixed |
| [QA-023](#qa-023) | Engine — World Physics | Replace gravity tables with density tables + mass-derived gravity | 🟠 Medium | 📋 **Proposed — awaiting approval** |
| [QA-024](#qa-024) | Engine — FR-030 Ships | "In System" ships have no position — missing body index 1–N | 🟠 Medium | ✅ Fixed |
| [QA-INV-001](#qa-inv-001) | Engine — Starport | Investigation: E/X port dominance — is the PSS formula excluding higher classes? | 📋 Investigated | ✅ No Bug |

---

## Bug Details

---

### QA-001

**Title:** App title is "Mneme Generator" — should be "Mneme CE World Generator"  
**Area:** Branding  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**File(s):** `index.html`, `vite.config.ts`, `src/components/Navigation.tsx`

**Description:**  
The application identified itself as "MNEME Generator" in the header, page title, and PWA manifest.

**Fix Applied:**  
- `index.html`: `<title>` and apple-mobile-web-app-title updated
- `vite.config.ts`: PWA manifest `name` → `Mneme CE World Generator`, `short_name` → `Mneme CE`
- `Navigation.tsx`: Header label updated to `MNEME CE`

---

### QA-002

**Title:** Logo not displayed in top-right corner  
**Area:** UI — Header  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**File(s):** `src/components/Navigation.tsx`, `public/gitb_gi7b_logo_512.png`

**Description:**  
The Game in the Brain logo was not displayed in the navigation header.

**Fix Applied:**  
- `gitb_gi7b_logo_512.png` copied from `references/` to `public/`
- Logo link added to Navigation right side, linking to `https://github.com/Game-in-the-Brain`

---

### QA-003

**Title:** Star classification PNG visual cue not surfaced in UI  
**Area:** References / Star Generation display  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**File(s):** `src/components/SystemViewer.tsx`, `public/references/Class-*-star.png`

**Description:**  
Star class PNG images existed in `references/` but were never shown in the UI.

**Fix Applied:**  
- All 7 star class PNGs (`Class-O-star.png` through `Class-M-star.png`) copied to `public/references/`
- `StellarClassReference` collapsible panel added to the Star section
- Shows the image for the primary star's class with a `(?)` chevron toggle

---

### QA-004

**Title:** Scientific notation used for large numbers — should be formatted with commas and units  
**Area:** Data Display  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**File(s):** `src/lib/format.ts` (created), `src/components/SystemViewer.tsx`

**Description:**  
Large numbers were displayed as raw scientific notation (e.g. `1.5e+24`, `3.5e+6`).

**Fix Applied:**  
- Created `src/lib/format.ts` with `formatNumber()`, `formatValue()`, `formatLuminosity()`, `formatCredits()`, `formatPopulation()`
- All display values in `SystemViewer.tsx` and `OverviewTab` updated to use these helpers

---

### QA-005

**Title:** Missing Phone theme toggle — vertical layout not implemented  
**Area:** UI — Themes  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**File(s):** `src/components/Navigation.tsx`, `src/App.tsx`, `src/index.css`

**Description:**  
Only a hardcoded dark theme existed. No day or phone theme.

**Fix Applied:**  
- `Theme` type added: `'dark' | 'day' | 'phone'`
- Three-theme cycle toggle button added to Navigation (Moon / Sun / Smartphone icons)
- CSS variables overridden per theme in `index.css`
- Phone theme adds `.phone-layout` CSS forcing single-column layout with 44px min touch targets
- Theme persisted to `localStorage` under key `mneme_theme`

---

### QA-006

**Title:** Hill Sphere orbital spacing not adjusting AU — circumstellar disks sharing same AU  
**Area:** Engine — Planetary Placement  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**File(s):** `src/lib/generator.ts`

**Description:**  
All circumstellar disks were placed at exactly `sqrtL * 5` AU — identical positions.

**Root cause:** Disk placement formula had no randomisation component. Near-zero disk mass produced a Hill sphere radius of effectively zero, so no separation was enforced.

**Fix Applied:**  
- Disk AU formula changed to `sqrtL * (5 + Math.random() * 15)` — randomised across the outer zone
- `enforceMinimumSeparation()` added: sorts all bodies by AU after generation, then pushes any that are within the floor distance outward
  - Floor: 0.05 AU for inner zones, 0.2 AU for outer zone

---

### QA-007

**Title:** Advantage/Disadvantage modifiers not applied to planet count rolls  
**Area:** Engine — Planetary System Generation  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**File(s):** `src/lib/worldData.ts`, `src/lib/generator.ts`

**Description:**  
All body count rolls used unmodified dice regardless of the primary star's class.

**Fix Applied:**  
- `getBodyCount(type, stellarClass?)` updated with full Adv/Dis logic:
  - O/B/A: non-disk counts return 0 (disks only)
  - F: Adv+2 on dwarf and terrestrial counts
  - G: Adv+1 on dwarf and terrestrial counts (REF-007 v1.1: updated to Baseline)
  - M: Dis+4 on dwarf and terrestrial counts (REF-007 v1.1, escalated from Dis+1)
  - K: Dis+2 on dwarf and terrestrial counts (REF-007 v1.1, escalated from None)
- `generatePlanetarySystem()` now passes `primaryStar.class` to `getBodyCount()`

---

### QA-008

**Title:** Body type labelled "Ice" — should be "Ice Worlds"  
**Area:** Data / Labels  
**Priority:** 🟡 Low  
**Status:** ✅ Fixed  
**File(s):** `src/components/SystemViewer.tsx`

**Description:**  
Ice bodies were displayed with typeLabel `'Ice'`.

**Fix Applied:**  
- `typeLabel` changed to `'Ice Worlds'` in `PlanetarySystemTab`
- `BodyCountCard` label updated to `"Ice Worlds"`
- Internal TypeScript type `'ice'` unchanged

---

### QA-009

**Title:** Body stats missing from display — mass, radius, diameter, surface gravity, escape velocity  
**Area:** Data Display — Planetary Bodies  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**File(s):** `src/lib/physicalProperties.ts` (created), `src/lib/generator.ts`, `src/types/index.ts`, `src/components/SystemViewer.tsx`

**Description:**  
Planetary bodies showed only type, zone, and AU. Physical properties were missing.

**Fix Applied:**  
- Created `src/lib/physicalProperties.ts` with `calculatePhysicalProperties(massEM, bodyType)`
- `PlanetaryBody` interface extended with `densityGcm3`, `radiusKm`, `diameterKm`, `surfaceGravityG`, `escapeVelocityMs`
- Properties calculated in `generateBody()` for all non-disk bodies
- `BodyRow` in `SystemViewer.tsx` shows expandable physical properties on click

**Density data:** See [references/REF-010-planet-densities.md](./references/REF-010-planet-densities.md)

---

### QA-010

**Title:** App uses multi-page navigation — should be single page with tab anchors  
**Area:** UI — Navigation  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**File(s):** `src/components/SystemViewer.tsx`

**Description:**  
The five generator sections (Overview, Star, World, Inhabitants, Planetary System) were rendered as mutually exclusive tab content — only one visible at a time.

**Fix Applied:**  
- All five sections now render simultaneously on the same page
- Tab buttons call `scrollIntoView({ behavior: 'smooth' })` on the target section's `ref`
- Tabs are sticky at the top of the page while scrolling
- Separate navigation (Generator / Data Log / Settings) in `Navigation.tsx` is unchanged

---

### QA-011

**Title:** Hot Jupiter migration rule not implemented — inner zone not cleared  
**Area:** Engine — Planetary Placement  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**File(s):** `src/lib/generator.ts`

**Description:**  
Gas giants of Class III/IV/V in inner zones placed alongside other bodies as if they coexisted.

**Fix Applied:**  
Pre-placement migration sweep added in `generatePlanetarySystem()`:
1. Scans all generated gas worlds for hot Jupiters:
   - Class III gas in Infernal zone → clear Infernal zone
   - Class IV/V gas in Hot zone → clear Hot zone
2. Dwarf planets, terrestrials, and ice worlds in cleared zones are removed
3. Optional captured rogue: rolls 2D6 per cleared zone; on 11+ a dwarf planet is re-added to that zone

---

### QA-012

**Title:** Debug Batch Export button for statistical analysis  
**Area:** Dev Tools — Data Export  
**Priority:** 🟡 Low  
**Status:** ✅ Fixed  
**File(s):** `src/components/GeneratorDashboard.tsx`

**Description:**  
No way to generate multiple systems for bulk statistical analysis. Need a development-only batch export feature.

**Fix Applied:**  
- Added `DebugBatchExport` component (DEV mode only) below Generate button
- Configurable batch size (default 40, max 500)
- Exports full system data including:
  - Star properties (class, grade, mass, luminosity)
  - Main world habitability breakdown (atmosphere, temp, gravity, hazard, biochem, TL mods)
  - Inhabitants data (wealth, government, starport, travel zone)
  - Complete planetary system with all bodies
  - Hot Jupiter flag per system
- JSON download with metadata and summary statistics
- Console logging of mean habitability and hot Jupiter frequency

---

### QA-013

**Title:** Theme toggle buttons take too much header space — Dark/Day should share space  
**Area:** UI — Navigation  
**Priority:** 🟡 Low  
**Status:** ✅ Fixed  
**File(s):** `src/components/Navigation.tsx`

**Description:**  
Three theme buttons (Dark, Day, Phone) consumed significant header width. On smaller screens this caused layout issues.

**Fix Applied:**  
- Dark/Day now occupy the same button position (toggle behavior):
  - When in Dark mode: show Sun icon → click switches to Day
  - When in Day mode: show Moon icon → click switches to Dark
- Phone remains as separate toggle button (always visible)
- Phone button highlighted in red when active; clicking again returns to previous desktop theme
- Saves ~40px of header width

---

### QA-014

**Title:** Debug Mode Toggle — Batch Export visibility control in Settings  
**Area:** UI — Settings  
**Priority:** 🟢 Low  
**Status:** ✅ Fixed  
**File(s):** `src/components/Settings.tsx`, `src/components/GeneratorDashboard.tsx`

**Description:**  
The Batch Export feature (QA-012) was only visible in development builds (`import.meta.env.DEV`). On GitHub Pages production builds, the debug panel was hidden, making QA testing of batch exports impossible.

**Fix Applied:**  
- Added **Debug Mode** toggle in Settings (Data Management section)
- Toggle stored in `localStorage` with key `mneme_debug_mode`
- Default: **ON** (enabled) — Batch Export visible by default
- When OFF: Batch Export panel is hidden
- When ON: Batch Export panel is displayed
- Works in both development and production builds
- Allows QA testing on GitHub Pages deployment

---

### QA-015

**Title:** Half Dice mechanic for K/M class stars — significantly reduce planet counts  
**Area:** Engine — Planetary System Generation  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**File(s):** `src/lib/worldData.ts`, `src/lib/generator.ts`

**Description:**  
K and M class stars were generating too many planetary bodies. The Dis+2 (K) and Dis+4 (M) modifiers on d6 dice were not reducing counts enough. K-class median was 10 worlds, M-class median was 7 worlds — too high for these star types.

**Fix Applied:**  

| Star Class | Mechanism | Median Bodies |
|------------|-----------|---------------|
| **K-class** | **Dis+3 on d6** | ~5 |
| **M-class** | **Half Dice (d3) + Dis+1** | ~5 |

**K-class:** Uses standard d6 dice with Dis+3 (roll 3 extra d6, keep lowest):
- Dwarfs: 3d6-3, roll 6d6 keep lowest 3
- Terrestrials: 2d6-2, roll 5d6 keep lowest 2

**M-class (Half Dice):** Uses d3 (1-3) instead of d6 with Dis+1:
- Disks: 1d3-1, roll 2d3 keep lowest 1
- Dwarfs: 3d3-3, roll 4d3 keep lowest 3
- Terrestrials: 2d3-2, roll 3d3 keep lowest 2
- Ices: 1d3-1, roll 2d3 keep lowest 1
- Gases: 1d3-1, roll 2d3 keep lowest 1

**Result:** Both K-class and M-class now generate fewer worlds (~5 median each), matching expected stellar system characteristics for these cooler, less massive stars.

---

### QA-016

**Title:** Batch export enhanced with planet counts by star class  
**Area:** Dev Tool — Batch Export  
**Priority:** 🟡 Low  
**Status:** ✅ Fixed  
**File(s):** `src/components/GeneratorDashboard.tsx`

**Description:**  
Batch export statistics were limited — only showed mean habitability and hot Jupiter count. Users needed breakdown by stellar class to validate the Half Dice mechanic.

**Fix Applied:**  
Added `byStarClass` statistics to batch export meta:

```json
{
  "meta": {
    "statistics": {
      "byStarClass": {
        "M": {
          "count": 676,
          "medianTotalBodies": 5,
          "medianTerrestrials": 1,
          "medianDwarfs": 2,
          "mainWorldPercent": { "terrestrial": 34, "dwarf": 58, "habitat": 8 }
        }
      }
    }
  }
}
```

Each star class includes:
- Count of systems
- Median total bodies
- Median by type (terrestrials, dwarfs, ices, gases, disks)
- Main world type distribution (percentage terrestrial/dwarf/habitat)

---

### QA-017

**Title:** Habitats sized by largest body mass in system  
**Area:** Engine — Main World Generation  
**Priority:** 🟡 Low  
**Status:** ✅ Fixed  
**File(s):** `src/lib/generator.ts`

**Description:**  
Habitats (artificial megastructures) previously had random sizing (6000-8000 km). This didn't reflect that habitats are typically built around or from the largest available mass in a system.

**Fix Applied:**  
- Restructured generation order: planetary system generated BEFORE main world
- `generatePlanetarySystem()` now returns `largestBodyMass` (in Earth Masses)
- `generateMainWorld()` accepts `largestBodyMass` parameter
- Habitat size calculated as: `radius = mass^0.33 × Earth radius × (0.8 to 1.2)`

**Formula:**
```
size (km) = (largestBodyMass ^ 0.33) × 6371 km × randomFactor
```

Where `randomFactor` is 0.8-1.2 for variation. This ensures Habitats are appropriately sized relative to the largest planet/moon in the system they're built in.

---

### QA-018

**Title:** Generator options reset on every navigation — last-used settings not preserved  
**Area:** UI — Generator Dashboard  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Date Fixed:** 2026-04-14  
**File(s):** `src/components/GeneratorDashboard.tsx`

**Description:**  
Each time the user navigates away from the generator view and returns (or triggers a new generation), all four generator option controls reset to their defaults:
- Star Class → Random
- Star Grade → Random
- Main World Type → Random
- Populated → true

Presets (pinned combinations like "G-class, populated, terrestrial") are lost with every navigation.

**Expected Behaviour:**  
Options should persist across view changes and app reloads. The last-used selection for each control should be restored on mount.

**Root Cause:**  
All four options are plain `useState` hooks with hardcoded defaults. The `GeneratorDashboard` component remounts on navigation, reinitialising all state.

**Fix Spec (FR-028):**  
- On any option change: write `{ starClass, starGrade, mainWorldType, populated }` to `localStorage` key `mneme_generator_options` (JSON).
- On mount: read `mneme_generator_options`; if present and valid, use stored values as initial state.
- Validate on load: unknown string values fall back to `'random'`; non-boolean `populated` falls back to `true`.
- No UI change required — auto-persist on change is sufficient.

**localStorage Key:** `mneme_generator_options`

---

---

### QA-019

**Title:** Starport PSS v1.1 — replace PVS formula with GDP-based Port Size Score + TL capability cap
**Area:** Engine — Inhabitants / Starport
**Priority:** 🔴 High
**Status:** ✅ Fixed
**File(s):** `src/lib/worldData.ts`, `src/lib/generator.ts`, `src/types/index.ts`, `src/components/SystemViewer.tsx`, `src/lib/exportDocx.ts`, `src/lib/format.ts`

**Description:**
Two structural flaws in the old `PVS = floor(Hab/4) + (TL−7) + WealthMod + DevMod` formula:
1. **TL double-counts** — TL already drives population (via TLmod table), which drives wealth; adding TL again as a direct addend double-counted it.
2. **Scale blindness** — A world with 100T people at TL 9 and one with 700M at TL 14 could score identically. No measure of total economic output.

Old system also produced clearly wrong results: a TL 11 world with 700B people rated Class E (frontier port). A 100-person TL 14 research station rated Class A.

**Fix Applied:**

**Step 1 — Port Size Score (PSS):**
```typescript
const annualTrade = population × gdpPerDay × 365 × tradeFraction × wealthMultiplier;
const pss = Math.floor(Math.log10(annualTrade)) - 10;
const rawClass = pssToClass(pss);  // X / E / D / C / B / A
```

GDP/person/day table by TL (7: 205 Cr → 16: 578M Cr). Trade fraction by development (5%–30%). Wealth multiplier (×1.0–×2.0).

**Step 2 — TL Capability Cap:**
```typescript
const tlCap = getTLCapClass(tl);  // TL 7–9 → C max; TL 10–11 → B max; TL 12+ → A
const finalClass = min(rawClass, tlCap);
```
No amount of money lets a TL 9 world build jump drives.

**Step 3 — Weekly Activity (3D6):**
```typescript
const weeklyBase     = annualTrade / 364;
const weeklyActivity = weeklyBase * roll3D6();
```
3D6 used for lower variance. ÷364 includes ~1.43× transit multiplier.

**Population formula also updated** in this fix (dependency): `calculatePopulation(envHab, tl, roll)` using TL_POP_MOD table. Fork condition updated: fires when `envHab + TLmod ≤ 0` (not `habitability ≤ 0`).

**Old vs New:**

| World | TL | OLD | NEW | Verdict |
|-------|-----|-----|-----|---------|
| Standard World | 11 | E | C | ✅ Correct — 700B population |
| Huge Poor World | 8 | X | D | ✅ Correct — India model |
| High TL Tiny Pop | 14 | A | D | ✅ Correct — no economic scale |
| Tiny Frontier | 7 | X | X | ✅ Same |
| Prosperous World | 13 | A | A | ✅ Same |

**Starport interface** updated — `output` replaced by `pss`, `rawClass`, `tlCap`, `annualTrade`, `weeklyBase`, `weeklyActivity`.
**format.ts** updated — `formatCreditScale()` + `formatAnnualTrade()` added for large credit values.

---

## Additional Feature Issues

---

### QA-ADD-001

**Title:** Planet type density data missing — needed for radius, diameter, surface gravity, ΔV  
**Area:** Engine — Physical Properties  
**Priority:** 🔴 High (blocks QA-009)  
**Status:** ✅ Fixed  
**File(s):** `references/REF-010-planet-densities.md` (created), `src/lib/physicalProperties.ts` (created)

**Description:**  
No density reference data existed. Required for all physical property derivation.

**Fix Applied:**  
- Created `references/REF-010-planet-densities.md` with density table and all four formulas
- Implemented in `src/lib/physicalProperties.ts`

---

### QA-ADD-002

**Title:** CSV export design — wide-row format with open-ended planet columns  
**Area:** Data Management — Export  
**Priority:** 🟠 Medium  
**Status:** 📋 Spec complete — implementation pending  
**File(s):** `references/REF-012-csv-export-format.md` (created)

**Description:**  
CSV export format needed a formal specification.

**Fix Applied:**  
- Created `references/REF-012-csv-export-format.md` with full wide-row column spec, key naming convention, and parser notes
- Implementation of `exportToCSV()` in `src/data/exportCSV.ts` is pending

### QA-020

**Title:** Culture traits should reroll opposing or duplicate results  
**Area:** Engine — Culture Generation  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Date Opened:** 2026-04-14  
**Date Fixed:** 2026-04-14  
**File(s):** `src/lib/worldData.ts`, `src/lib/generator.ts`

**Description:**  
Currently, culture trait generation allows opposing traits (e.g., Pacifist and Militarist) and duplicate traits. When rolling a sequential second culture trait, the second result cannot repeat the first nor be contradictory to it.

**Expected Behaviour:**  
When generating multiple culture traits, if a newly rolled trait is either identical to an existing trait or is an opposing trait, that trait should be rerolled (up to 20 attempts per slot) until a valid non-duplicate, non-opposing trait is obtained.

**Opposing Pairs — Culture Trait Conflicts**

The following pairs are considered logically contradictory within the 36-trait culture table:

| Trait | Opposes |
|-------|---------|
| Anarchist | Bureaucratic, Legalistic |
| Bureaucratic | Anarchist, Libertarian |
| Caste system | Egalitarian |
| Collectivist | Individualist |
| Cosmopolitan | Isolationist, Rustic |
| Deceptive | Honest, Honorable |
| Degenerate | Honorable, Proud |
| Devoted | Indifferent |
| Egalitarian | Elitist, Caste system |
| Elitist | Egalitarian |
| Fatalistic | Idealistic |
| Fearful | Heroic |
| Generous | Ruthless |
| Gregarious | Paranoid |
| Heroic | Fearful |
| Honest | Deceptive, Scheming |
| Honorable | Ruthless, Deceptive, Degenerate |
| Hospitable | Hostile |
| Hostile | Hospitable, Pacifist |
| Idealistic | Fatalistic |
| Indifferent | Devoted |
| Individualist | Collectivist |
| Isolationist | Cosmopolitan |
| Legalistic | Libertarian, Anarchist |
| Libertarian | Legalistic, Bureaucratic |
| Militarist | Pacifist |
| Pacifist | Militarist, Hostile |
| Paranoid | Gregarious |
| Progressive | Rustic |
| Proud | Degenerate |
| Rustic | Cosmopolitan, Progressive |
| Ruthless | Honorable, Generous |
| Scheming | Honest |

**Implementation Spec:**

```typescript
// In src/lib/worldData.ts
export const CULTURE_OPPOSITES: Record<string, string[]> = {
  'Anarchist':     ['Bureaucratic', 'Legalistic'],
  'Bureaucratic':  ['Anarchist', 'Libertarian'],
  'Caste system':  ['Egalitarian'],
  'Collectivist':  ['Individualist'],
  'Cosmopolitan':  ['Isolationist', 'Rustic'],
  'Deceptive':     ['Honest', 'Honorable'],
  'Degenerate':    ['Honorable', 'Proud'],
  'Devoted':       ['Indifferent'],
  'Egalitarian':   ['Elitist', 'Caste system'],
  'Elitist':       ['Egalitarian'],
  'Fatalistic':    ['Idealistic'],
  'Fearful':       ['Heroic'],
  'Generous':      ['Ruthless'],
  'Gregarious':    ['Paranoid'],
  'Heroic':        ['Fearful'],
  'Honest':        ['Deceptive', 'Scheming'],
  'Honorable':     ['Ruthless', 'Deceptive', 'Degenerate'],
  'Hospitable':    ['Hostile'],
  'Hostile':       ['Hospitable', 'Pacifist'],
  'Idealistic':    ['Fatalistic'],
  'Indifferent':   ['Devoted'],
  'Individualist': ['Collectivist'],
  'Isolationist':  ['Cosmopolitan'],
  'Legalistic':    ['Libertarian', 'Anarchist'],
  'Libertarian':   ['Legalistic', 'Bureaucratic'],
  'Militarist':    ['Pacifist'],
  'Pacifist':      ['Militarist', 'Hostile'],
  'Paranoid':      ['Gregarious'],
  'Progressive':   ['Rustic'],
  'Proud':         ['Degenerate'],
  'Rustic':        ['Cosmopolitan', 'Progressive'],
  'Ruthless':      ['Honorable', 'Generous'],
  'Scheming':      ['Honest'],
};

export function generateCultureTraits(count: number = 1, exclude: string[] = []): string[] {
  const traits: string[] = [];
  for (let i = 0; i < count; i++) {
    let trait: string | undefined;
    let attempts = 0;
    while (attempts < 20) {
      const roll1 = Math.floor(Math.random() * 6);
      const roll2 = Math.floor(Math.random() * 6);
      const roll3 = Math.floor(Math.random() * 6);
      const row = roll1 + roll2;
      const col = roll3;
      const candidate = CULTURE_TRAITS[Math.min(5, row)]?.[col];
      const opposesExisting = traits.some(t =>
        CULTURE_OPPOSITES[t]?.includes(candidate) ||
        CULTURE_OPPOSITES[candidate]?.includes(t)
      );
      if (candidate && !traits.includes(candidate) && !exclude.includes(candidate) && !opposesExisting) {
        trait = candidate;
        break;
      }
      attempts++;
    }
    if (trait) traits.push(trait);
  }
  return traits;
}
```

---

---

### QA-021

**Title:** Source of Power and Culture traits can generate contradictory combinations  
**Area:** Engine — Inhabitants  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Date Opened:** 2026-04-14  
**Date Fixed:** 2026-04-14  
**Reported by:** Neil Lucock  
**File(s):** `src/lib/worldData.ts`, `src/lib/generator.ts`

**Description:**  
The inhabitants generator rolls Source of Power and Culture traits independently. This produces world descriptions that are logically self-contradictory. Neil Lucock reported the following example:

> Government: **Kratocracy** — "Power belongs to the strongest. Might makes right — leadership changes through contest, coup, or demonstrated dominance."  
> Culture: **Pacifist** — "Violence is culturally abhorrent. Conflict is resolved through mediation or passive resistance. Military forces are minimal."

A society cannot simultaneously be governed by the rule of force and culturally abhor violence. These combinations undermine the world description and should be excluded.

**Root Cause:**  
`generateCultureTraits()` has no awareness of the world's `PowerSource`. All 36 culture traits are treated as equally valid regardless of how power is structured.

**Incompatible Pairs — Source of Power → Culture traits to exclude:**

| Source of Power | Excluded Culture Traits | Reason |
|-----------------|------------------------|--------|
| **Kratocracy** | Pacifist | Rule-by-force is incompatible with violence being culturally abhorrent |
| **Kratocracy** | Egalitarian | Might-makes-right hierarchy is incompatible with universal equality |
| **Kratocracy** | Legalistic | Dominance contests override rule of law |
| **Democracy** | Anarchist | Elected representative government cannot coexist with rejection of all authority |
| **Aristocracy** | Egalitarian | Hereditary class privilege is incompatible with equal treatment regardless of birth |
| **Meritocracy** | Caste system | Achievement-based power contradicts birth-fixed social hierarchy |
| **Ideocracy** | Anarchist | State-enforced ideology requires central authority; no-authority rejects this |
| **Ideocracy** | Libertarian | Mandatory ideological conformity contradicts personal freedom as supreme value |

**Expected Behaviour:**  
When generating culture traits for a world, any trait that is incompatible with the world's Source of Power should be rerolled (up to 20 attempts to avoid infinite loops). This is implemented together with QA-020 using the same `exclude` array mechanism.

**Implementation Spec:**  

```typescript
```typescript
// In src/lib/worldData.ts
export const POWER_CULTURE_CONFLICTS: Record<PowerSource, string[]> = {
  'Kratocracy':  ['Pacifist', 'Egalitarian', 'Legalistic'],
  'Democracy':   ['Anarchist'],
  'Aristocracy': ['Egalitarian'],
  'Meritocracy': ['Caste system'],
  'Ideocracy':   ['Anarchist', 'Libertarian'],
};
```

```typescript
// In src/lib/generator.ts
import { generateCultureTraits, POWER_CULTURE_CONFLICTS } from './worldData';

// ...
const cultureExclude = POWER_CULTURE_CONFLICTS[powerSource] ?? [];
const cultureTraits = generateCultureTraits(traitCount, cultureExclude);
```

**Notes:**  
- Implemented together with QA-020 (opposing/duplicate trait reroll) — both use the same reroll mechanism.
- A trait excluded by Source of Power conflict is treated identically to an opposing-pair reroll: not recorded, attempt again.
- Some pairings (e.g., Kratocracy + Honest, Aristocracy + Degenerate) are thematically tense but not logically impossible — do not exclude them.

---

### QA-022

**Title:** Main world gravity and size are independent rolls — physically impossible combinations produced  
**Area:** Engine — World Physics  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Date Opened:** 2026-04-14  
**Date Fixed:** 2026-04-14  
**Reported by:** Neil Lucock  
**File(s):** `src/lib/generator.ts` (main world generation), `src/lib/worldData.ts` (`getDwarfGravity`, `getTerrestrialGravity`)

**Description:**  
Neil Lucock reported a generated world showing **342 km diameter** with **0.18 G surface gravity**. This is physically impossible.

**Physics check:**  
For a 342 km diameter body (radius = 171 km = 171,000 m):
- At maximum plausible dwarf density (3.5 g/cm³): mass = 7.31 × 10¹⁹ kg  
- Derived surface gravity = G × mass / r² = 0.0146 G  
- **Maximum physically achievable gravity at 342 km = ~0.017 G**

To produce 0.18 G at 342 km, the body would require a density of **~37 g/cm³** — more than 1.6× denser than osmium (22.6 g/cm³), the densest naturally occurring element. Impossible.

**Root Cause:**  
The **main world** generates `size` and `gravity` through two independent mechanisms:
1. `size` — computed from world type (Terrestrial: 2000–5000 km random; Dwarf size is not set from the same physical formula)
2. `gravity` — rolled on `getDwarfGravity(2D6)` or `getTerrestrialGravity(2D6)`, returning table values from 0.001 G to 3.0 G

These two values are never cross-validated. Any size + gravity combination is possible.

**Contrast with body objects:** Planets in the planetary system use `calculatePhysicalProperties(massEM, bodyType)` which correctly derives diameter AND gravity from mass + density. The main world does not use this function.

**Dwarf gravity table range and implied densities at 342 km:**

| Roll | Gravity (G) | Required density for 342 km | Physically possible? |
|------|------------|----------------------------|----------------------|
| 2    | 0.001 G    | 0.20 g/cm³                 | ❌ Too low (gas) |
| 7    | 0.10 G     | 20.7 g/cm³                 | ❌ Exceeds osmium |
| 11   | 0.18 G     | 37.2 g/cm³                 | ❌ Impossible |
| 12   | 0.20 G     | 41.3 g/cm³                 | ❌ Impossible |

Almost every gravity roll is inconsistent with a 342 km object.

**Expected Behaviour:**  
Main world surface gravity should be **derived** from its size and density assumption (as body objects already are), not rolled independently.

**Recommended Fix:**  

Option A (preferred — consistent with body physics):  
Replace independent gravity roll with `calculatePhysicalProperties(massEM, 'dwarf')` for dwarf worlds and equivalent for terrestrial. Gravity becomes a derived output, not a rolled one.

Option B (table-compatible fallback):  
After rolling gravity, derive the implied density from the rolled gravity + size:
```
density = g × r² / (G × (4/3 × π × r³ × 1000))
```
If `density > 22.6 g/cm³` (osmium) or `density < 0.5 g/cm³` (below ice), reroll gravity until a plausible result is obtained (max 10 attempts, then clamp to nearest valid value).

**Notes:**  
- The gravity table values themselves are fine as a distribution — the problem is applying them without size awareness.
- Prioritise Option A for a new generation pass if the size/mass relationship is being refactored.
- Option B can be implemented as a quick validation pass on the existing tables with minimal disruption.

---

### QA-024

**Title:** "In System" ships have no position — missing body index 1–N  
**Area:** Engine — FR-030 Ships in the Area  
**Priority:** 🟠 Medium  
**Status:** 📋 Open  
**Date Opened:** 2026-04-14  
**File(s):** `src/lib/shipsInArea.ts`, `src/types/index.ts`, `src/components/SystemViewer.tsx`, `src/lib/exportDocx.ts`

**Description:**  
Ships generated with location `"System"` (In System, 1D6 roll 3–4) currently have no further positional detail. A GM looking at the result sees "In System" with no indication of *where* in the system the ship is. This is not useful for encounter placement or scenario context.

**Expected Behaviour:**  
Ships with location `"System"` should additionally have a `systemPosition: number` — a random body index from 1 to *N*, where *N* is the total number of bodies in the planetary system (sum of all circumstellar disks + dwarf planets + terrestrial worlds + ice worlds + gas worlds from `system.planetarySystem`).

Display as **"In System — Body *N*"** (e.g. "In System — Body 3").

If the system has zero planetary bodies, treat the ship as `"Orbit"` instead.

**Root Cause:**  
`generateShipsInTheArea(weeklyTradeValue)` currently only receives `weeklyTradeValue`. It has no access to the planetary system body count. The function signature needs to accept `totalBodies: number` so it can roll the position.

**Implementation:**

**Step 1 — Update `src/types/index.ts`:**
```typescript
export interface ShipInArea {
  name: string;
  dt: number;
  monthlyOperatingCost: number;
  location: ShipLocation;
  systemPosition?: number;   // ← add: body index 1–N, only set when location === 'System'
  trafficPool: 'small' | 'civilian' | 'warship';
}
```

**Step 2 — Update `src/lib/shipsInArea.ts`:**
```typescript
// Change function signature:
export function generateShipsInTheArea(weeklyTradeValue: number, totalBodies: number): ShipsInAreaResult

// In rollLocation(), pass totalBodies and return position:
function rollLocationWithPosition(totalBodies: number): { location: ShipLocation; systemPosition?: number } {
  const r = rollD6();
  if (r <= 2) return { location: 'Orbit' };
  if (r <= 4) {
    if (totalBodies === 0) return { location: 'Orbit' };
    const pos = Math.ceil(Math.random() * totalBodies);
    return { location: 'System', systemPosition: pos };
  }
  return { location: 'Docked' };
}
```

Then use `rollLocationWithPosition(totalBodies)` instead of `rollLocation()` when pushing each ship to results.

**Step 3 — Update call site in `src/components/SystemViewer.tsx`:**
```typescript
// Calculate totalBodies from system.planetarySystem:
const totalBodies =
  (system.planetarySystem?.circumstellarDisks?.length ?? 0) +
  (system.planetarySystem?.dwarfPlanets?.length ?? 0) +
  (system.planetarySystem?.terrestrialWorlds?.length ?? 0) +
  (system.planetarySystem?.iceWorlds?.length ?? 0) +
  (system.planetarySystem?.gasWorlds?.length ?? 0);

const result = generateShipsInTheArea(inhabitants.starport.weeklyActivity, totalBodies);
```

**Step 4 — Update display in `SystemViewer.tsx`:**  
For each ship with `location === 'System'`, show `"In System — Body ${ship.systemPosition}"` instead of just `"In System"`.

**Step 5 — Update `src/lib/exportDocx.ts`:**  
Include body index in the `.docx` export line for "In System" ships.

**Verify:** Generate several systems. Confirm all "In System" ships show a body number between 1 and the total planetary body count. Confirm zero-body systems fall back to "In Orbit". Mark QA-024 ✅ Fixed.

---

### QA-INV-001

**Title:** Investigation — E/X port dominance: is the PSS formula excluding higher-class ports?  
**Area:** Engine — Starport  
**Priority:** 📋 Investigated  
**Status:** ✅ No Bug — Behaviour Correct  
**Date Investigated:** 2026-04-14  
**Reported by:** Neil Lucock

**Observation:**  
Neil Lucock reported never seeing a port class better than E or X across many generated worlds.

**Investigation:**  

The PSS formula is:
```
annualTrade = population × GDP/day(TL) × 365 × tradeFraction(dev) × wealthMultiplier
PSS = floor(log10(annualTrade)) - 10
```

The TL capability cap (`getTLCapClass`) only sets an **upper bound** on port class — it never prevents E or X. The `minClass(rawClass, tlCap)` call takes the lower of the two, so PSS-driven X/E results pass through unchanged.

**Why E/X dominates on typical generated worlds:**

The population formula `10^max(0, envHab + TLmod) × roll` produces:
- EnvHab = 0, TL 11 → pop ~ 200M–1.2B → borderline E/D (wealth/dev dependent)
- EnvHab = −3 (moderate hostility) TL 11 → pop ~ 200K–1.2M → X class

Most generated worlds have negative EnvHab contributions (hostile atmosphere, extreme temperature, hazards), driving population into the hundreds of thousands to low millions. At those populations:

| TL | Pop | Dev / Wealth | PSS | Class |
|----|-----|-------------|-----|-------|
| 11 | 1M  | Underdeveloped / Average | −1 | X |
| 11 | 50M | Mature / Average | 3 | X |
| 11 | 200M | Mature / Average | 4 | **E** |
| 11 | 1B  | Developed / Prosperous | 5 | **E** |
| 11 | 3B  | Developed / Prosperous | 6 | **D** |
| 13 | 100M | Very Developed / Affluent | 6 | **D** |
| 15 | 10M | Very Developed / Affluent | 5 | **E** |

**Conclusion:**  
The PSS formula is working correctly. E and X are the expected outcome for frontier and hostile worlds, which make up the majority of generated systems. C/B/A class ports require high population (hundreds of millions to billions), high TL (12+), and favourable wealth/development — a combination rare in natural random generation but achievable on the most developed worlds.

**No fix required.** Document this in the user guide as expected game behaviour: most frontier worlds have E/X ports; only developed core worlds reach C+.

---

### QA-023

**Title:** Replace Gravity Tables with Density Tables — derive gravity from Mass + Density  
**Area:** Engine — World Physics  
**Priority:** 🟠 Medium  
**Status:** 📋 **Proposed — awaiting approval**  
**Date Proposed:** 2026-04-14  
**File(s):** `src/lib/worldData.ts`, `src/lib/generator.ts`, `src/types/index.ts`, `src/components/SystemViewer.tsx`, `260409-v02 Mneme-CE-World-Generator-FRD.md`, `260410-Update.md`

---

**Problem Statement**

QA-022 identified that main-world `size` and `gravity` are rolled independently, producing physically impossible worlds (e.g., 342 km diameter at 0.18 G requires a density of ~37 g/cm³, denser than osmium).

A second, deeper issue was discovered during investigation: the current implementation assigns `size` as **kilometres** (Dwarf: 100–599 km, Terrestrial: 2000–4999 km), but [REF-004: World Type & Size Tables](./references/REF-004-world-type-tables.md) defines `size` as **mass** (Dwarf: 0.1–7.0 LM, Terrestrial: 0.1–7.0 EM, Habitat: 1 MVT–100 GVT). The code never implemented the REF-004 mass tables, which means main worlds currently have no mass value at all — yet planetary bodies do.

Because there is no mass, gravity cannot be derived from physics. Instead, gravity is pulled from arbitrary 2D6 tables that ignore size entirely, which is the root cause of QA-022.

**Proposed Solution**

Replace the independent gravity-roll mechanic with a **density-based physics pipeline** that mirrors how planetary bodies already work (`calculatePhysicalProperties()`):

1. **Roll mass** using the REF-004 tables (size = mass in LM or EM).
2. **Roll density** using new 2D6 tables tailored to world type.
3. **Derive radius, diameter, surface gravity, and escape velocity** from mass + density via standard planetary physics.
4. **Map derived gravity back to habitability** using the existing gravity-habitability bands.

This makes main worlds internally consistent with the rest of the planetary system and eliminates all physically impossible combinations.

---

**Step 1 — Implement REF-004 Mass Tables for Main World Size**

Add mass-generation functions in `src/lib/worldData.ts`:

```typescript
export function getHabitatMass(roll: number): number {
  // Returns mass in billion tons (GVT) for physics consistency
  const table: Record<number, number> = {
    2: 0.001,   // 1 MVT  = 1 Mt = 0.001 Gt
    3: 0.003,
    4: 0.01,
    5: 0.03,
    6: 0.1,
    7: 0.3,
    8: 1.0,     // 1 GVT
    9: 3.0,
    10: 10.0,
    11: 30.0,
    12: 100.0,
  };
  return table[roll] || table[7];
}

export function getDwarfMass(roll: number): number {
  // Returns mass in Earth Masses (LM → EM conversion: 1 LM = 0.0123 EM)
  const lmTable: Record<number, number> = {
    2: 0.1, 3: 0.2, 4: 0.3, 5: 0.5, 6: 0.7,
    7: 1.0, 8: 1.5, 9: 2.0, 10: 3.0, 11: 5.0, 12: 7.0,
  };
  const lm = lmTable[roll] || lmTable[7];
  return lm * 0.0123; // convert LM to EM
}

export function getTerrestrialMass(roll: number): number {
  // Returns mass in Earth Masses
  const table: Record<number, number> = {
    2: 0.1, 3: 0.2, 4: 0.3, 5: 0.5, 6: 0.7,
    7: 1.0, 8: 1.5, 9: 2.0, 10: 3.0, 11: 5.0, 12: 7.0,
  };
  return table[roll] || table[7];
}
```

**Step 2 — Add Density Tables (replacing Gravity Tables)**

Replace `getDwarfGravity()` and `getTerrestrialGravity()` with density rolls. Habitability modifiers are preserved and mapped from the *resulting* gravity, not the density itself.

```typescript
export function getDwarfDensity(roll: number): { density: number; habitability: number } {
  const table: Record<number, { density: number; habitability: number }> = {
    2:  { density: 1.5, habitability: -2.5 }, // Carbonaceous / icy
    3:  { density: 1.8, habitability: -2.0 },
    4:  { density: 2.1, habitability: -1.5 },
    5:  { density: 2.4, habitability: -1.0 },
    6:  { density: 2.7, habitability: -0.5 },
    7:  { density: 3.0, habitability: -0.5 }, // Silicaceous
    8:  { density: 3.2, habitability: -0.5 },
    9:  { density: 3.4, habitability: -0.5 },
    10: { density: 3.5, habitability: 0 },    // Metallic-rich
    11: { density: 3.5, habitability: 0 },
    12: { density: 3.5, habitability: 0 },
  };
  return table[roll] || table[7];
}

export function getTerrestrialDensity(roll: number): { density: number; habitability: number } {
  const table: Record<number, { density: number; habitability: number }> = {
    2:  { density: 6.5, habitability: -2.5 }, // Super-Earth iron core
    3:  { density: 5.5, habitability: -2.0 },
    4:  { density: 5.0, habitability: -1.5 },
    5:  { density: 4.8, habitability: -1.0 },
    6:  { density: 4.5, habitability: -0.5 },
    7:  { density: 4.0, habitability: -0.5 }, // Rocky baseline
    8:  { density: 4.2, habitability: -0.5 },
    9:  { density: 4.4, habitability: -0.5 },
    10: { density: 4.6, habitability: 0 },
    11: { density: 4.8, habitability: 0 },
    12: { density: 5.0, habitability: 0 },
  };
  return table[roll] || table[7];
}
```

*Note:* The `habitability` values above are the **gravity-derived** habitability modifiers, preserved from the old gravity tables so that overall habitability distributions remain unchanged.

**Step 3 — Derive Physical Properties in `generator.ts`**

In `generateMainWorld()`, replace the current size-in-km and gravity-roll blocks with:

```typescript
// Roll mass from REF-004 tables
let massEM: number;
if (worldType === 'Dwarf') {
  massEM = getDwarfMass(roll2D6().value);
} else if (worldType === 'Terrestrial') {
  massEM = getTerrestrialMass(roll2D6().value);
} else {
  // Habitat: keep current sizing or optionally roll on Habitat mass table
  const habitatMassGt = getHabitatMass(roll2D6().value);
  // Convert Gt to EM for physics (1 EM ≈ 5.972e15 Gt)
  massEM = habitatMassGt / 5.972e15;
}

// Roll density + get habitability modifier
const densityRoll = roll2D6().value;
let densityGcm3: number;
let gravityHabitability: number;

if (worldType === 'Dwarf') {
  const result = getDwarfDensity(densityRoll);
  densityGcm3 = result.density;
  gravityHabitability = result.habitability;
} else {
  const result = getTerrestrialDensity(densityRoll);
  densityGcm3 = result.density;
  gravityHabitability = result.habitability;
}

// Calculate physical properties from mass + density
const phys = calculatePhysicalPropertiesFromDensity(massEM, densityGcm3);
const { radiusKm, diameterKm, surfaceGravityG, escapeVelocityMs } = phys;
```

*Helper function (can live in `physicalProperties.ts`):*

```typescript
export function calculatePhysicalPropertiesFromDensity(
  massEM: number,
  densityGcm3: number
): PhysicalProperties {
  const densityKgM3 = densityGcm3 * 1000;
  const massKg = massEM * 5.972e24;
  const volumeM3 = massKg / densityKgM3;
  const radiusM = Math.cbrt((3 * volumeM3) / (4 * Math.PI));
  const radiusKm = radiusM / 1000;
  const surfaceGravityMs2 = (6.674e-11 * massKg) / (radiusM * radiusM);
  const surfaceGravityG = surfaceGravityMs2 / 9.81;
  const escapeVelocityMs = Math.sqrt(2 * 6.674e-11 * massKg / radiusM);

  return {
    densityGcm3: Math.round(densityGcm3 * 100) / 100,
    radiusKm: Math.round(radiusKm),
    diameterKm: Math.round(radiusKm * 2),
    surfaceGravityG: Math.round(surfaceGravityG * 1000) / 1000,
    escapeVelocityMs: Math.round(escapeVelocityMs),
  };
}
```

**Step 4 — Update `MainWorld` Type**

In `src/types/index.ts`, add `mass` and `densityGcm3` to `MainWorld` so the data model matches planetary bodies:

```typescript
export interface MainWorld {
  type: WorldType;
  size: number;          // Keep for backward compat — now stores diameter (km)
  mass: number;          // NEW: in Earth Masses
  densityGcm3: number;   // NEW: g/cm³
  lesserEarthType?: LesserEarthType;
  gravity: number;
  radius: number;
  escapeVelocity: number;
  // ... rest unchanged
}
```

**Step 5 — Update UI (`SystemViewer.tsx`)**

Display the new `mass` and `densityGcm3` fields in the World overview and expandable body details, matching the format already used for planetary bodies.

---

**Why This Fixes QA-022**

With mass and density coupled through physics, gravity is no longer an independent variable:

| Example | Old (impossible) | New (derived) |
|---------|-----------------|---------------|
| 0.1 EM, 1.5 g/cm³ | gravity = 0.18 G (rolled) | gravity = **0.015 G** (derived) |
| 1.0 EM, 4.0 g/cm³ | gravity = 0.30 G (rolled) | gravity = **1.00 G** (derived) |
| 7.0 EM, 6.5 g/cm³ | gravity = 3.00 G (rolled) | gravity = **2.45 G** (derived) |

Every combination is physically valid because gravity is an *output* of mass and density, not an input.

---

**Impact on Game Balance**

- **Habitability distributions remain identical** — the same 2D6 roll that previously produced a gravity modifier now produces a density modifier, and the mapped habitability values are preserved.
- **Size ranges shift slightly** — because mass is now in EM/LM and radius derives from density, a 1.0 EM silicate world will naturally be ~6,371 km (Earth-sized), whereas the old code randomly assigned 2000–5000 km. This is arguably *more* correct.
- **Dwarf planets** will range from ~200 km (0.1 LM carbonaceous) to ~1,400 km (7.0 LM metallic), matching real-world objects like Ceres (~940 km, 2.16 LM).
- **Terrestrial planets** will range from ~3,000 km (0.1 EM, high density) to ~14,000 km (7.0 EM, low density), which spans Mercury through super-Earths.

---

**Migration / Documentation Plan**

| Step | File | Change |
|------|------|--------|
| 1 | `QA.md` (this doc) | Add QA-023, mark as approved |
| 2 | `260409-v02 Mneme-CE-World-Generator-FRD.md` | Update §6.1 (size = mass), §6.3 (density tables replace gravity tables), add density table reference |
| 3 | `260410-Update.md` | Add section: "11. Density-Derived Gravity for Main Worlds" documenting the rules change from gravity tables to density+physics |
| 4 | `src/lib/worldData.ts` | Add mass tables and density tables; remove old gravity tables |
| 5 | `src/lib/physicalProperties.ts` | Add `calculatePhysicalPropertiesFromDensity()` |
| 6 | `src/lib/generator.ts` | Replace independent size+gravity rolls with mass+density physics |
| 7 | `src/types/index.ts` | Add `mass` and `densityGcm3` to `MainWorld` |
| 8 | `src/components/SystemViewer.tsx` | Display mass and density |

---

**Next Action Required**

Awaiting user approval of this proposal. Once approved, the above implementation steps will be executed and the FRD/Update documents will be updated accordingly.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-09 | Initial QA document — 11 bugs + 2 additional feature issues |
| 1.1 | 2026-04-10 | All 11 bugs marked fixed; QA-ADD-001 fixed; QA-ADD-002 spec created |
| 1.2 | 2026-04-10 | Added QA-012 (Debug Batch Export), QA-013 (compact theme toggle); Hill Sphere and Habitability fixes |
| 1.3 | 2026-04-10 | Fixed radius/escape velocity calculations; added Terraforming Worms; glossary updates |
| 1.5 | 2026-04-10 | **CORRECTION:** Escape velocity formula fixed to `sqrt(0.0196 * gravity * size * 0.5)` — proper unit conversion for km/s |
| 1.4 | 2026-04-10 | QA-014: Debug mode toggle in Settings (default ON, user-configurable) |
| 1.6 | 2026-04-10 | QA-015: Half Dice mechanic — M-class uses d3+Dis+1 to reduce planet counts |
| 1.7 | 2026-04-10 | QA-016: Batch export enhanced with planet counts by star class; QA-017: Habitats sized by largest body mass |
| 1.8 | 2026-04-11 | QA-018: Generator options reset on navigation — opened, spec links to FR-028 |
| 1.9 | 2026-04-13 | QA-019: Starport PSS v1.1 — GDP-based Port Size Score + TL capability cap + 3D6 weekly activity; population formula updated to TLmod lookup table |
| 1.10 | 2026-04-14 | Added QA-020: Culture traits reroll rule for opposing/duplicate results |
| 1.11 | 2026-04-14 | Added QA-021: Source of Power / Culture trait contradictions (Neil Lucock); QA-022: Main world gravity/size inconsistency (Neil Lucock); QA-INV-001: E/X port dominance investigation — no bug |
| 1.12 | 2026-04-14 | QA-020: Culture trait opposing/duplicate reroll implemented; QA-021: Power/culture conflict filter implemented (Neil Lucock) |
| 1.13 | 2026-04-14 | Handoff block updated — 4 open tasks clarified for Kimi (QA-022, QA-018/FR-028, FR-029, FR-030); QA-023 flagged awaiting approval; ship traffic_pool field confirmed in JSON |
| 1.14 | 2026-04-14 | QA-022: gravity/size physics validation implemented; QA-018: generator options persistence verified fixed; FR-029: Weekly 3D6 roll button implemented; FR-030: Ships in the Area generator implemented |
| 1.15 | 2026-04-14 | Handoff block updated to reflect all tasks complete; traffic_pool short keys (`small`/`civilian`/`warship`) documented — aligned with shipsInArea.ts implementation; FRD and .md reference updated to match |
| 1.16 | 2026-04-14 | QA-024: "In System" ships missing body position index — added spec; FRD §7.10 Step 5 updated with position roll and display format |
| 1.17 | 2026-04-14 | QA-024 implemented: systemPosition field on ShipInArea; shipsInArea.ts accepts totalBodies; display shows "In System — Body N" grouped per body; docx export updated |
