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
| **QA-023** | ✅ Fixed | Mass + density pipeline — Option B. worldData.ts, generator.ts, types/index.ts |
| **QA-ADD-002** | 📋 Spec only | CSV export — spec in REF-012; low priority, no implementation yet |
| **FR-031** | 🟡 In Progress | 2D Animated Planetary System Map — Phase 0 scaffold complete; Phase 1 Path & button pending |


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
| [QA-023](#qa-023) | Engine — World Physics | Mass + density pipeline implemented — Option B (gravity-derived habitability) | 🟠 Medium | ✅ Fixed |
| [QA-024](#qa-024) | Engine — FR-030 Ships | "In System" ships have no position — missing body index 1–N | 🟠 Medium | ✅ Fixed |
| [FR-031](#fr-031) | Feature — 2D Map | 2D Animated Planetary System Map (MWG integrated monorepo build) | 🟠 Medium | 🟡 In Progress |
| [QA-INV-001](#qa-inv-001) | Engine — Starport | Investigation: E/X port dominance — is the PSS formula excluding higher classes? | 📋 Investigated | ✅ No Bug |
| [QA-025](#qa-025) | Engine — Inhabitants | Low Population Terminology Override | 🟡 Low | 📋 Proposed |
| [QA-026](#qa-026) | Engine — Inhabitants | Depression Penalty for Low Population Worlds | 🟠 Medium | ✅ Fixed |
| [QA-027](#qa-027) | UI — Economy | Income "B cr" notation ambiguous; weekly × 52 ≠ annual total shown | 🔴 High | 🔴 Open |
| [QA-028](#qa-028) | UI — Economy | Wealth display contradicts World Development section | 🟠 Medium | 🔴 Open |
| [QA-029](#qa-029) | Engine — Government | Anarchy government type disproportionately dominant | 🔴 High | 🔴 Open |
| [QA-030](#qa-030) | Engine — Ships (FR-030) | Ships at X/E-class starport too numerous for port class | 🔴 High | 🔴 Open |
| [QA-031](#qa-031) | UI — Stars | Star color displayed as raw hex — needs human-readable name | 🟠 Medium | 🔴 Open |
| [QA-032](#qa-032) | Engine — World Physics | 427 km world showing 0.18G — floor density may still be off post QA-023 | 🟠 Medium | 🔴 Open |
| [FR-032](#fr-032) | Feature — Economy | Income system redesign: avg income per TL + ships as income-years | 🟠 Medium | 📋 Proposed |
| [QA-035](#qa-035) | UI — 2D Map | Main world missing from 2D map — buildSceneGraph never adds it (only marks) | 🔴 High | 🔴 Open |
| [QA-036](#qa-036) | UI — Planetary System Tab | Total Planetary Bodies count excludes main world; ships totalBodies also off-by-one | 🟠 Medium | 🔴 Open |
| [FR-033](#fr-033) | Feature — Generate | Sector Dynamics goal-loop: generate until Starport/Pop/Habitability targets hit | 🟡 Low | 📋 Proposed |

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

### QA-025

**Title:** Low Population Terminology Override  
**Area:** Engine — Inhabitants  
**Priority:** 🟡 Low  
**Status:** 📋 **Proposed**  

**Problem Statement**  
Currently, the descriptive text for Wealth and Development uses terms like "middle class", "consumer economy", and "investment capital". For populations under 1,000,000 (and especially under 10,000), these terms feel out of place and break narrative immersion for small colonies or survival outposts.

**Proposed Solution**  
Implement a dynamic text replacement or secondary lookup table for populations `< 1,000,000`. Replace terminology:
- "Economy" -> "Fiscal condition" or "Framework"
- "Middle class" -> "Specialist groups" or "Core communal groups"
- "Consumer goods" -> "Vital supplies"
- "Investment capital" -> "Communal resources"

---

### QA-026

**Title:** Depression Penalty for Low Population Worlds  
**Area:** Engine — Inhabitants  
**Priority:** 🟠 Medium  
**Status:** ✅ **Implemented**
**Date:** 2026-04-15

**Problem Statement**  
A population of 5,000 people can currently generate a Class B starport with billions of credits in annual trade simply by rolling a high base TL (e.g. TL11). This creates "Ghost Ports" that contradict their demographic reality. Small populations lack the human capital to maintain high-tech industries.

**Design Decision — After-Starport Recalculation**
We chose **`after-starport`** as the canonical calculation method. This means:
1. The starport is first calculated with the *founding* TL (the TL the world was originally colonised at).
2. The depression penalty is then applied, producing an `effectiveTL`.
3. The starport is **recalculated** with the depressed `effectiveTL`.
4. The final display shows the downgraded class with the founding class in parentheses (e.g., `Class E (founded Class B)`).

Because this is a post-calculation step, it triggers a **recalculation series** for all downstream dependents.

**Cascading Effects & Automated Recalculation**

| Sub-task | Description | Status |
|----------|-------------|--------|
| QA-026-A | `calculateDepressionPenalty()` — pop/development based TL penalty | ✅ Implemented |
| QA-026-B | `Inhabitants.foundingTL` / `effectiveTL` data model | ✅ Implemented |
| QA-026-C | `Starport.foundingClass` / `foundingPSS` / `foundingRawClass` storage | ✅ Implemented |
| QA-026-D | Starport recalculation using `after-starport` timing | ✅ Implemented |
| QA-026-E | Overview tab: parenthetical founding class display | ✅ Implemented |
| QA-026-F | Inhabitants tab: parenthetical founding class + PSS display | ✅ Implemented |
| QA-026-G | Travel Zone auto-recalculation with `effectiveTL` | ✅ Implemented |
| QA-026-H | Ships-in-the-Area budget auto-recalculation from depressed starport | ✅ Implemented |
| QA-026-I | Batch export: include founding TL and founding starport metrics | ✅ Implemented |
| QA-026-J | Generator options: `depressionPenaltyTiming` persisted to localStorage | ✅ Implemented |

**Datetime-kimi-open:** 2026-04-15T13:45:00+08:00 — All QA-026 sub-tasks approved and opened.

---

### QA-033

**Title:** Map button generates wrong URL in dev; GitHub Pages map broken  
**Area:** UI — 2D Map Integration  
**Priority:** 🔴 High  
**Status:** ✅ Fixed (commit `fix(SystemViewer): use BASE_URL unconditionally for map button`, 2026-04-15)  
**Date Opened:** 2026-04-15  
**Root Cause Identified:** 2026-04-15T21:30+08:00 — Justin QA session

---

**Expected Behaviour**

The **Map** button in `SystemViewer.tsx` must open a fresh 2D map of the currently generated star system in a new browser tab (`_blank`).

1. Serialize the current `StarSystem` JSON.
2. Add a new random 8-character `starfieldSeed`.
3. Add the default epoch (`2300-01-01`).
4. Encode the payload as a Unicode-safe Base64 string.
5. Open the URL `https://game-in-the-brain.github.io/Mneme-CE-World-Generator/solar-system-2d/?system=<payload>` in a new tab.

---

**Root Cause (identified 260415)**

Two earlier "fix" commits (v71 `635b7511`, v72 `8ddad55f`) introduced a wrong DEV override:

```typescript
// WRONG — commit 8ddad55f
const base = import.meta.env.DEV ? '/' : import.meta.env.BASE_URL;
const url = new URL(`solar-system-2d/?system=${encoded}`, window.location.origin + base);
```

**Why this is wrong:**  
`vite.config.ts` sets `base: '/Mneme-CE-World-Generator/'`. Vite therefore injects `import.meta.env.BASE_URL = '/Mneme-CE-World-Generator/'` in **both** dev and production builds. Overriding it to `/` in DEV strips the base path from the generated URL.

**What each environment saw:**

| Environment | URL generated (broken code) | Result |
|-------------|----------------------------|--------|
| Dev (`npm run dev`) | `http://localhost:5175/solar-system-2d/?system=...` | Wrong — missing `/Mneme-CE-World-Generator/`. Vite shows "did you mean `/Mneme-CE-World-Generator/solar-system-2d/`?" redirect. Works only after manually following redirect. |
| GitHub Pages (PROD) | `https://game-in-the-brain.github.io/Mneme-CE-World-Generator/solar-system-2d/?system=...` | Correct in v72 final form, but any user with a **stale service worker** (PWA cache from v71's broken intermediate state) would load the old broken JS and get the wrong URL. |

**Why it worked at v69 (Phase 4 starfield polish):**  
The original code before the "fix" commits was:
```typescript
window.open(`${window.location.origin}${import.meta.env.BASE_URL}solar-system-2d/?system=${encoded}`, '_blank');
```
This uses `BASE_URL` unconditionally — correct in both dev and prod.

**The actual fix applied this session:**
```typescript
// CORRECT — BASE_URL is /Mneme-CE-World-Generator/ in both dev and prod
const url = new URL(`solar-system-2d/?system=${encoded}`, window.location.origin + import.meta.env.BASE_URL);
```

---

**Verification Checklist**
- [x] Local dev (`npm run dev`): button opens `http://localhost:5175/Mneme-CE-World-Generator/solar-system-2d/?system=...` (no Vite redirect message)
- [x] GitHub Pages: button opens `https://game-in-the-brain.github.io/Mneme-CE-World-Generator/solar-system-2d/?system=...`
- [x] Clicking Map from an already-open solar-system-2d tab does **not** double the path
- [x] Build passes: `tsc && vite build` zero errors
- [ ] GitHub Pages smoke-test after deploy (test on live site)

**Service Worker Cache Note:**  
If GitHub Pages still shows the broken URL after this deploy, the browser is serving a stale PWA cache from before the fix. Fix: `Ctrl+Shift+R` (hard refresh) or DevTools → Application → Service Workers → Unregister → reload.

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
**Status:** ✅ Fixed — implemented 2026-04-15 (Option B: gravity-derived habitability)  
**Date Proposed:** 2026-04-14  
**File(s):** `src/lib/worldData.ts`, `src/lib/generator.ts`, `src/types/index.ts`, `src/components/SystemViewer.tsx`, `260409-v02 Mneme-CE-World-Generator-FRD.md`, `260410-Changes.md`

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
| 3 | `260410-Changes.md` | Add section: "11. Density-Derived Gravity for Main Worlds" documenting the rules change from gravity tables to density+physics |
| 4 | `src/lib/worldData.ts` | Add mass tables and density tables; remove old gravity tables |
| 5 | `src/lib/physicalProperties.ts` | Add `calculatePhysicalPropertiesFromDensity()` |
| 6 | `src/lib/generator.ts` | Replace independent size+gravity rolls with mass+density physics |
| 7 | `src/types/index.ts` | Add `mass` and `densityGcm3` to `MainWorld` |
| 8 | `src/components/SystemViewer.tsx` | Display mass and density |

---

**Next Action Required**

1. **Send REF-013 to DeepSeek** for density distribution analysis — see [`references/REF-013-deepseek-qa023-density-analysis.md`](./references/REF-013-deepseek-qa023-density-analysis.md)
2. DeepSeek must deliver: final density tables, gravity-to-hab thresholds (if Option B), and probability distribution comparison
3. **User reviews DeepSeek output** and approves density table values
4. Once approved, implementation steps above (Steps 1–5) are executed

Awaiting user approval and DeepSeek analysis output before implementation begins.

---

### QA-023 — Preliminary Analysis: Derived Gravity Ranges

**Date:** 2026-04-14  
**Purpose:** Pre-approval analysis to validate density table design before implementation. This block contains computed gravity values for the full mass × density range, plus the open design question DeepSeek must resolve before coding begins.

#### Key Physical Constants Used

| Constant | Value |
|----------|-------|
| G (gravitational) | 6.674×10⁻¹¹ m³ kg⁻¹ s⁻² |
| 1 Earth Mass (EM) | 5.972×10²⁴ kg |
| 1 Lunar Mass (LM) | 7.342×10²² kg (= 0.0123 EM) |
| g_Earth | 9.81 m/s² |

Physics chain: `density (g/cm³) → density_kg_m3 × 1000 → volume = mass_kg / density_kg_m3 → radius = ∛(3V / 4π) → g = G × mass / radius² / 9.81`

---

#### Derived Gravity Matrix — Dwarf Worlds (density range: 1.5–3.5 g/cm³)

Mass values from REF-004 Dwarf table (LM converted to kg via ×7.342×10²²):

| Mass (LM) | Density 1.5 | Density 2.0 | Density 2.5 | Density 3.0 | Density 3.5 |
|-----------|------------|------------|------------|------------|------------|
| 0.1 LM | 0.044G | 0.052G | 0.058G | 0.064G | 0.079G |
| 0.2 LM | 0.055G | 0.065G | 0.074G | 0.081G | 0.092G |
| 0.5 LM | 0.075G | 0.089G | 0.101G | 0.111G | 0.120G |
| 1.0 LM | 0.097G | 0.115G | 0.130G | 0.143G | 0.170G |
| 2.0 LM | 0.121G | 0.145G | 0.163G | 0.180G | 0.214G |
| 7.0 LM | 0.210G | 0.250G | 0.282G | 0.311G | 0.367G |

**Gravity range across all rolls:** ~0.044G (min mass + min density) to ~0.367G (max mass + max density)

**Critical finding:** The draft density table assigns `hab -2.5` to density roll 2 (1.5 g/cm³). But the physics show that even at MINIMUM mass+density (0.1 LM, 1.5 g/cm³), derived gravity is **0.044G** — far above the old table's roll-2 gravity of 0.001G. The extreme low-gravity penalty cannot be reproduced with this mass range. See Design Question below.

---

#### Derived Gravity Matrix — Terrestrial Worlds (density range: 4.0–6.5 g/cm³)

Mass values from REF-004 Terrestrial table (in Earth Masses):

| Mass (EM) | Density 4.0 | Density 4.5 | Density 5.0 | Density 5.5 | Density 6.0 | Density 6.5 |
|-----------|------------|------------|------------|------------|------------|------------|
| 0.1 EM | 0.375G | 0.404G | 0.430G | 0.454G | 0.476G | 0.518G |
| 0.2 EM | 0.472G | 0.509G | 0.542G | 0.572G | 0.599G | 0.652G |
| 0.5 EM | 0.630G | 0.679G | 0.722G | 0.763G | 0.799G | 0.869G |
| 1.0 EM | 0.793G | 0.855G | 0.910G | 0.961G | 1.006G | 1.034G |
| 2.0 EM | 0.998G | 1.076G | 1.146G | 1.210G | 1.268G | 1.380G |
| 5.0 EM | 1.371G | 1.478G | 1.573G | 1.661G | 1.740G | 1.892G |
| 7.0 EM | 1.545G | 1.665G | 1.772G | 1.871G | 1.960G | 2.132G |

**Gravity range across all rolls:** ~0.375G (min mass + min density) to ~2.132G (max mass + max density)

**Critical finding:** With this mass range, the minimum possible terrestrial gravity is ~0.375G and the maximum is ~2.13G. The old table's extreme values (0.3G for roll 7, 3.0G for roll 2) cannot be reproduced faithfully — the new physics-derived range is narrower but entirely realistic.

---

#### ⚠️ Design Question: Two Options for Habitability Assignment

The QA-023 draft assumes Option A, but both options need to be evaluated before implementation:

**Option A — Density roll carries the hab modifier directly (preserves current distribution)**
- Same as old gravity table: density roll 2 → hab -2.5, roll 7 → hab -0.5, roll 12 → hab 0
- Habitability is determined by density roll alone, independent of derived gravity
- Simple to implement; distribution is identical to current system
- Problem: Physically inconsistent — a "hab -2.5" density world may actually have moderate gravity due to its small mass

**Option B — Habitability derived from the resulting gravity (physics-consistent)**
- A gravity-to-hab function is applied after physics derivation
- Heavier worlds (high mass) naturally get worse habitability; smaller worlds get better habitability
- Problem: The two-roll combination changes the probability distribution — needs a new gravity→hab threshold table
- The overall distribution of hab outcomes will differ from the current single-table design

**Open question for DeepSeek:** Analyse Option B. Given the derived gravity ranges in the matrices above:
1. What gravity-to-habitability thresholds for Dwarf and Terrestrial world types would produce a probability distribution closest to the current single-table distribution?
2. What is the probability distribution of habitability outcomes under the draft Option A density tables vs. Option B?

---

### FR-031

**Title:** 2D Animated Planetary System Map — MWG Integrated Monorepo Build  
**Area:** Feature — Visualisation  
**Priority:** 🟠 Medium  
**Status:** 🟡 In Progress  
**Date Opened:** 2026-04-15  
**File(s):** `vite.config.ts`, `solar-system-2d/index.html`, `solar-system-2d/src/*.ts`, `src/components/SystemViewer.tsx`

**Description:**  
Deliver a one-tap visual star-system map inside MWG. When a referee generates a `StarSystem`, a "View System Map" button opens a responsive, animated 2D canvas map of that system. All visual data is derived from the already-generated MWG state. The 2D map does not generate new astronomical data; it is a pure visualiser.

**Integration Model:**  
Monorepo sub-directory (`solar-system-2d/`) as a second Vite entry point — NOT a submodule or fork. This ensures `npm run dev` serves both apps and `npm run build` emits both to `dist/`.

**Phase Breakdown:**

| Phase | Goal | Status |
|-------|------|--------|
| Phase 0 | Foundation — Vite entry point, blank canvas, RAF loop | ✅ Complete |
| Phase 1 | The Path — Base64 query-string payload, View System Map button, dataAdapter, static circle render | ✅ Complete |
| Phase 2 | Orbits & Camera — logarithmic scale, orbit rings, zoom, pan, touch gestures, reset view | ✅ Complete |
| Phase 3 | Animation & Time Controls — RAF angle updates, play/pause/reverse, dt cap, date display pulse | ✅ Complete |
| Phase 4 | Starfield Polish — Mulberry32 PRNG, nebula clouds, resize regeneration, seed controls | ✅ Complete |
| Phase 5 | Production Hardening — disk point fields, label culling, off-screen culling | ✅ Complete (pending device fps test) |
| Phase 6 | Backlog — body tooltips, Brachistochrone, retrograde orbits, rings, moons | 📋 Future |

**Phase 0 Completion Details:**
- `vite.config.ts` updated with `rollupOptions.input` for `solar-system-2d/index.html`
- `solar-system-2d/index.html` created with full-screen canvas and control overlay
- TypeScript scaffold created:
  - `main.ts` — bootstrap, payload decode, canvas init
  - `renderer.ts` — `requestAnimationFrame` loop skeleton
  - `camera.ts` — pan/zoom transform math
  - `orbitMath.ts` — Kepler period, angle offset, hash-to-float
  - `starfield.ts` — Mulberry32 PRNG, procedural star generation
  - `dataAdapter.ts` — `StarSystem` → `SceneBody` mapper (INTRAS Level 1)
  - `uiControls.ts` — play/pause, speed, reverse, step, seed controls
  - `types.ts` — shared types
  - `styles.css` — space theme, glassmorphism controls
- `npm run build` passes with zero errors; `dist/solar-system-2d/` emitted correctly

**Phase 1 Completion Details:**
- "View System Map" button added to `SystemViewer.tsx` (primary-styled, opens in new tab)
- Unicode-safe Base64 payload encoding/decoding implemented end-to-end
- `dataAdapter.ts` maps full `StarSystem` to typed `SceneBody` graph
- Renderer draws static circles, orbit rings, labels, and seeded starfield background
- Main world highlighted with gold stroke and "MAIN" label

**Phase 2 Completion Details:**
- `camera.ts` supports zoom-to-point (mouse wheel centred on cursor) and pan-by-pixel
- `input.ts` handles mouse drag, mouse wheel zoom, touch pinch-zoom, and touch pan
- Double-tap and "Reset View" button snap camera back to default fit
- Orbit rings draw correctly under camera transforms
- Logarithmic distance scaling keeps inner and outer bodies visible simultaneously

**Phase 3 Completion Details:**
- Orbital angles advance from `simDayOffset` in the RAF loop using Kepler's 3rd Law periods
- Reverse playback flips the time direction multiplier
- `dt` is capped at 0.1s to prevent background-tab time jumps
- Step buttons (+1d, -7d, etc.) automatically pause playback before stepping
- Date display uses direct timestamp math (reliable for large positive/negative offsets)
- Date display shows a blue pulse glow when the simulation is running

**Phase 4 Completion Details:**
- `starfield.ts` uses Mulberry32 deterministic PRNG seeded from the system payload
- Starfield regenerates automatically on canvas resize without changing the seed
- Optional faint nebula clouds generated behind stars (3–6 per viewport, violet/indigo/blue/pink)
- Seed controls (display, regenerate, copy, paste) are wired and working
- Two browsers with the same URL render identical backgrounds

**Phase 5 Completion Details:**
- Disk point-field rendering implemented: each circumstellar disk generates 300–800 seeded points distributed along its orbit with ±4% radial jitter
- Disk points use warmer colours (`#8B7355`, `#A0522D`, `#CD853F`) and higher opacity than background stars for contrast
- Label culling: non-essential labels hidden when zoom < 0.35× to reduce clutter
- Off-screen culling: non-disk bodies skip rendering when fully outside viewport
- Single RAF loop, no DOM timers, and no per-frame garbage collection for efficient mobile performance
- PWA offline caching inherited from MWG's existing service worker

**MVP Design Constraints:**
- Everything is a circle (stars, planets, disks) — disks rendered as scattered point rings
- Default epoch: `2300-01-01` CE
- Default animation: 1 day/sec, reversible
- Background: procedural seeded vector starfield + nebula clouds (no image assets)
- No rings, no moons (INTRAS Level 2), no true barycentres in MVP

**Open Tasks:**
- Phase 5 follow-up: Physical device FPS validation on a 3-year-old phone
- Phase 6: Long-term 3D option once Solar-System-3D matures

---

### QA-027

**Title:** Income display "B cr" notation ambiguous; weekly × 52 ≠ annual total shown  
**Area:** UI — Economy  
**Priority:** 🔴 High  
**Status:** 🔴 Open  
**Datetime:** 260415-120000  
**Reported by:** Neil Lucock (email 2026-04-15)

**Problem Statement**  
Neil reports two interrelated issues with the income/credits display:

1. **Notation ambiguity:** "1.79 B cr a week" — it is unclear whether "B" means billion. The Starport box separately shows 149 million credits/week. The relationship between these two figures is not explained.
2. **Math inconsistency:** 1.79 B cr/week × 52 weeks = ~93 B cr/year. The annual figure shown is 54.2 B. These do not reconcile.
3. **US vs UK billion:** "B" is ambiguous — US billion = 10⁹, UK (traditional) billion = 10¹². Neil is UK-based. This will confuse international users.
4. **Plausibility concern:** Neil notes 400,000 people (comparable to Leicester, UK) generating 1.79 B cr/week seems implausibly high, regardless of TL.

**Expected Behaviour**
- Display full unabbreviated numbers, or use explicit notation: `1,790,000,000 cr/week` or `1.79 × 10⁹ cr/week`.
- Reconcile the weekly income figure with the annual total shown (check formula — are there multiple partial-year income sources being summed, or a period mismatch?).
- Add a tooltip or label clarifying the unit if abbreviation is kept.

**Working Document**  
[260415-claude-open-qa027-income-notation.md](./260415-claude-open-qa027-income-notation.md) — full root cause analysis, code trace, and proposed fixes.

**Notes**  
Justin response: income UI will be redesigned (see FR-032). The math inconsistency may be a separate calculation bug that should be verified independently.

---

### QA-028

**Title:** Wealth display contradicts World Development section  
**Area:** UI — Economy  
**Priority:** 🟠 Medium  
**Status:** 🔴 Open  
**Datetime:** 260415-120000  
**Reported by:** Neil Lucock (email 2026-04-15)

**Problem Statement**  
Neil observes that the Wealth panel displays a world as "not rich" while the World Development section implies significant productive output ("seems to be working hard but not getting much in return"). The two panels give contradictory impressions of the same world.

**Expected Behaviour**  
Wealth and World Development descriptors should tell a coherent story. If a world has high development but low wealth, the text should explicitly surface this tension as a design outcome (e.g., "high-output resource extraction with wealth extracted off-world") rather than appearing contradictory.

**Notes**  
May be a display/wording issue rather than a calculation bug. Review what each panel sources its descriptors from and ensure they are contextually aware of each other.

---

### QA-029

**Title:** Anarchy government type disproportionately dominant  
**Area:** Engine — Government Generation  
**Priority:** 🔴 High  
**Status:** 🔴 Open  
**Datetime:** 260415-120000  
**Reported by:** Neil Lucock (emails 2026-04-14 and 2026-04-15)

**Problem Statement**  
Neil has generated many random worlds across multiple sessions and reports seeing Anarchy as the government type on almost every result. "Yet another world with Anarchy? I haven't seen anything else."

QA-INV-001 previously investigated E/X port dominance and found it to be correct design behaviour. Government type distribution has not been separately verified.

**Expected Behaviour**  
Government type distribution should roughly follow the CE table probabilities. Anarchy (Government 0) should appear, but no more than its table frequency warrants — not as the near-universal result.

**Investigation Required**
- Run batch export (1,000 worlds) and tally government type distribution.
- Compare against raw CE probability table.
- Check if any modifier (population, TL, Depression Penalty from QA-026) is systematically pushing rolls toward 0.
- Check if the Depression Penalty `effectiveTL` cascade is feeding back into government generation.

---

### QA-030

**Title:** Ships at X/E-class starport: count too high for port class  
**Area:** Engine — Ships (FR-030)  
**Priority:** 🔴 High  
**Status:** 🔴 Open  
**Datetime:** 260415-120000  
**Reported by:** Neil Lucock (email 2026-04-15)

**Problem Statement**  
Neil reports a TL9 X-class port showing 104 ships in orbit, including a 1,000-ton passenger liner. An X-class port means no facilities — there should be no docked traffic at all, and minimal in-system traffic.

**Expected Behaviour**  
- **Class X:** Zero docked/in-port ships. Minimal in-system traffic (scouts, prospectors, the occasional free trader).
- **Class E:** Minimal facilities — handful of ships at most.
- Ship count should be hard-gated by starport class, not just PSS/TL score.
- A 1,000-ton passenger liner will not visit a world with no port facilities.

**Files**  
`src/lib/shipsInArea.ts` — add port class ceiling to traffic pool lookup.

**Notes**  
FR-030 (`shipsInArea.ts`) generates traffic from `traffic_pool` fields. The pool selection needs an additional gate: if `starport.class === 'X'`, zero docked ships; if `'E'`, minimal pool only. The `budget` from PSS may need to be zeroed or clamped for X/E regardless of TL.

---

### QA-031

**Title:** Star color displayed as raw hex code  
**Area:** UI — Stars  
**Priority:** 🟠 Medium  
**Status:** 🔴 Open  
**Datetime:** 260415-120000  
**Reported by:** Neil Lucock (email 2026-04-14)

**Problem Statement**  
The star color field displays the raw hexadecimal value (e.g., `#ff8a65`) directly in the UI. This adds no value to a user — they need a human-readable colour description to picture what the star looks like.

**Expected Behaviour**  
Display a colour name or description alongside (or instead of) the hex value. E.g.:
- `#ff8a65` → "Orange-Red" or "Coral Orange"
- Link to an authoritative reference (stellar classification colour chart) for easy cross-checking.

**Notes**  
Justin (email reply): "I can just make the stars color adopt that (and link to it directly for easy checking)." The hex value can be kept as a secondary display (tooltip or small swatch) while the primary display shows the name.

---

### QA-032

**Title:** Small world surface gravity floor — 427 km world showing 0.18G  
**Area:** Engine — World Physics  
**Priority:** 🟠 Medium  
**Status:** 🔴 Open  
**Datetime:** 260415-120000  
**Reported by:** Neil Lucock (email 2026-04-14)

**Problem Statement**  
Neil reports a 427 km world (roughly the size of Ceres) displaying a surface gravity of 0.18G. This is physically implausible — Ceres has ~0.029G. Even a very dense iron-rich body of 427 km would not exceed ~0.04–0.06G.

QA-022 and QA-023 implemented the mass + density pipeline. However, this case suggests the floor density or the gravity derivation formula may still produce unrealistic results for small bodies.

**Expected Behaviour**  
A 427 km world at any realistic density should produce gravity well under 0.1G.

**Investigation Required**
- Trace the pipeline for `size = 427 km` through `worldData.ts` density tables and `physicalProperties.ts`.
- Check the minimum density floor value.
- Verify the gravity formula: `g = G × m / r²` with correct unit conversions.
- Justin note (email reply): "I'll double check the floor density" and "I'll also double check the surface gravity formula."

---

### FR-032

**Title:** Income system redesign — average income per TL + ships as income-years  
**Area:** Feature — Economy  
**Priority:** 🟠 Medium  
**Status:** 📋 Proposed  
**Datetime:** 260415-120000  
**Proposed by:** Justin (email reply 2026-04-15)

**Proposal**  
Justin's three-part income system redesign, driven by Neil's feedback on implausible income figures:

1. **Settings: average income per TL (in Credits)**  
   World builders can set a baseline "average annual income per person per TL" in the Generator Settings. This anchors all economic outputs to a user-defined plausible value.

2. **Ships = X income-years stat**  
   Each ship entry gets a derived stat: `cost / annual_income_per_capita = X income-years`. This makes ship costs legible in human terms ("this frigate costs 12 years of the entire planet's per-capita output").  
   All ship cost displays recalculate relative to the income setting.

3. **Underlying income forces**  
   Set up the fundamental economic forces that feed the income calculation: trade routes, resource extraction, population productivity, TL multiplier. These feed up into the displayed income rather than income being a single formula.

**Dependencies**  
QA-027 (income display bugs should be fixed as part of this redesign).  
Links to QA-026 (Depression Penalty already modifies effectiveTL which feeds GDP).

---

### FR-033

**Title:** Sector Dynamics — goal-loop generation for Starport/Population/Habitability targets  
**Area:** Feature — Generate Page  
**Priority:** 🟡 Low  
**Status:** 📋 Proposed  
**Datetime:** 260415-120000  
**Proposed by:** Justin (email reply 2026-04-15)

**Proposal**  
On the Generate page, add a "Goal Mode" that loops the world generator until it produces a system matching user-specified targets:

- **Starport class target** — e.g., "generate until I get at least a Class C port"
- **Population target** — e.g., "minimum 1,000,000 population"
- **Habitability target** — e.g., "habitable main world"

The generator already supports batch runs of up to 1,000 for statistical testing. Goal-loop simply returns the first system satisfying all goals rather than displaying all 1,000.

**UX**  
- Goals are optional — if none set, generator behaves as normal.
- Show iteration count on result ("found after 47 generations").
- Add max-iteration safety cap (e.g., 2,000) with "no matching world found" fallback.

**Notes**  
Justin: "the loops just generates thousands until it hits the targets — it's through your feedback I didn't think of some things."

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
| 1.18 | 2026-04-14 | QA-023 preliminary analysis added: gravity matrices for all mass × density combinations; REF-013 DeepSeek analysis brief created; Option A vs Option B design question documented |
| 1.19 | 2026-04-15 | QA-023 implemented: mass+density physics pipeline, Option B gravity-derived habitability, monotonic terrestrial table; @ts-expect-error cleanup; build verified |
| 1.20 | 2026-04-15 | FR-031 Phase 0 scaffolded: 2D map monorepo entry point, Vite multi-page config, Canvas RAF skeleton, procedural starfield PRNG, dataAdapter for INTRAS Level 1; build verified |
| 1.21 | 2026-04-15 | Added QA-027–QA-032 (Neil Lucock feedback: income display, wealth contradiction, anarchy dominance, X-port ship count, star hex color, small-world gravity floor); FR-032 (income redesign) and FR-033 (goal-loop generation) proposed by Justin; QA-025/026 added to index table |
| 1.23 | 2026-04-15 | QA-035: main world missing from 2D map (dataAdapter fallback never adds); QA-036: total body count and ships totalBodies exclude main world |
| 1.22 | 2026-04-15 | FR-031 Phases 2–5 completed: camera interactions, animation hardening, starfield polish, disk point-field rendering, label/off-screen culling; QA-033 added for Map button URL resolution spec review |

---

## MCP Session Logs

### 2026-04-15 00:58:24-mcp
**Findings:** 
- Discovered roughly 28 minor linting/TypeScript issues causing the build to fail.
- `SystemViewer.tsx` contained a React hooks violation (calling `useRef` directly inside an object literal during component render).
- `lucide-react` types were updated, leaving 5 dangling `// @ts-expect-error - lucide-react types` directives which broke `npm run build` and `tsc` via TypeScript errors.

**Actions Taken:**
- Extracted the `useRef` declarations in `SystemViewer.tsx` outside of the object literal to satisfy React Rules of Hooks.
- Removed unused `@ts-expect-error` directives from `GeneratorDashboard.tsx`, `Glossary.tsx`, `Navigation.tsx`, `Settings.tsx`, and `SystemViewer.tsx`.

**Remaining Action:** None
**Status:** Done

### 2026-04-15 02:14:00-antigravity
**Findings:** 
- The user requested that the QA-025 (Low Population Terminology) and QA-026 (Depression Penalty) changes only be documented in QA.md and FRD.md as proposed specifications, and that the code should not be executed or modified at this time.
- I used `git checkout src/` to revert the code changes and successfully removed the executed code.

**Actions Taken:**
- Reverted code changes made to `index.ts`, `worldData.ts`, `generator.ts`, and `SystemViewer.tsx`.
- Updated Section 7.2.2 of `260409-v02 Mneme-CE-World-Generator-FRD.md` with the new specifications.
- Added QA-025 and QA-026 to the `QA.md` Index table.
- Added QA-025 and QA-026 details to the `QA.md` Bug Details section.

**Remaining Action:** Needs code implementation.
**Status:** Open
