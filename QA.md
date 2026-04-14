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
| [QA-018](#qa-018) | UI | Generator options reset on every navigation — last-used settings not preserved | 🟠 Medium | 📋 Open |
| [QA-019](#qa-019) | Engine | Starport PSS v1.1 — replace PVS formula with GDP-based PSS + TL capability cap | 🔴 High | ✅ Fixed |
| [QA-020](#qa-020) | Engine — Culture Generation | Culture traits should reroll opposing or duplicate results | 🟠 Medium | 📋 Open |
| [QA-021](#qa-021) | Engine — Inhabitants | Source of Power and Culture traits can generate contradictory combinations | 🔴 High | 📋 Open |
| [QA-022](#qa-022) | Engine — World Physics | Main world gravity and size are independent rolls — can be physically impossible | 🟠 Medium | 📋 Open |
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
**Status:** 📋 Open  
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
**Status:** 📋 Open  
**Date Opened:** 2026-04-14  
**File(s):** `src/lib/worldData.ts`, `references/REF-006-culture-table.md`

**Description:**  
Currently, culture trait generation allows opposing traits (e.g., Pacifist and Militarist) and duplicate traits. According to the BRC document, opposing and same culture results cannot be results and should trigger a reroll of the second result.

**Expected Behaviour:**  
When generating multiple culture traits, if a newly rolled trait is either identical to an existing trait or is an opposing trait (as defined by the BRC document's opposing pairs), that trait should be rerolled until a non-duplicate, non-opposing trait is obtained.

---

---

### QA-021

**Title:** Source of Power and Culture traits can generate contradictory combinations  
**Area:** Engine — Inhabitants  
**Priority:** 🔴 High  
**Status:** 📋 Open  
**Date Opened:** 2026-04-14  
**Reported by:** Neil Lucock  
**File(s):** `src/lib/worldData.ts` (`getSourceOfPower`, `generateCultureTraits`), `src/lib/generator.ts`

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
When generating culture traits for a world, any trait that is incompatible with the world's Source of Power should be rerolled (up to N attempts to avoid infinite loops). This is an extension of the same reroll mechanism being specified in QA-020 for opposing trait pairs.

**Suggested Implementation:**  

```typescript
// In generator.ts, after rolling powerSource and before generateCultureTraits():
const POWER_CULTURE_CONFLICTS: Record<PowerSource, string[]> = {
  'Kratocracy':  ['Pacifist', 'Egalitarian', 'Legalistic'],
  'Democracy':   ['Anarchist'],
  'Aristocracy': ['Egalitarian'],
  'Meritocracy': ['Caste system'],
  'Ideocracy':   ['Anarchist', 'Libertarian'],
};

// Pass the conflict list into generateCultureTraits() as an exclusion set
function generateCultureTraits(count: number, exclude: string[] = []): string[] {
  // ... existing logic ...
  // When a rolled trait matches exclude[], reroll (max 20 attempts per trait)
}
```

**Notes:**  
- This should be implemented together with QA-020 (opposing/duplicate trait reroll) — both use the same reroll mechanism.
- A trait excluded by Source of Power conflict should be treated identically to an opposing-pair reroll — not recorded, attempt again.
- Some pairings (e.g., Kratocracy + Honest, Aristocracy + Degenerate) are thematically tense but not logically impossible — do not exclude them.

---

### QA-022

**Title:** Main world gravity and size are independent rolls — physically impossible combinations produced  
**Area:** Engine — World Physics  
**Priority:** 🟠 Medium  
**Status:** 📋 Open  
**Date Opened:** 2026-04-14  
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
