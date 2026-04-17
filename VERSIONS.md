# Mneme CE World Generator — Version History

**Format:** `1.3.{commitCount}` (auto-generated from git commit count during build)

---

## v1.3.113 — QA-061 Population Redesign (2026-04-17)

### Fixes
- **QA-061:** Complete population system redesign — `TL_POP_MOD` hardcoded table and `GDP_PER_DAY_BY_TL` legacy table both deleted from `worldData.ts`
- Population now scales by `productivityMultiplier = getSoc7MonthlyIncome(TL, preset) / getSoc7MonthlyIncome(baseTL, preset)`
  - CE preset: multiplier = 1.0 at every TL — populations depend purely on habitability
  - Mneme preset: multiplier follows the exact SOC-income compounding curve (1× to ~389 000×)
- Natural-world formula: `10^(envHab + 1) × productivityMultiplier × roll` — `+1` exponent restores CE populations to playable Traveller scale
- Hostile-world formula (envHab ≤ 0): habitat population scaled by `productivityMultiplier`
- `pssToClass()` thresholds revised (PSS < 3 → X, ≤ 4 → E, ≤ 5 → D, ≤ 6 → C, ≤ 7 → B, else A)
- `gdpPerDayOverride` made **required** in `calculateStarport()` — removes any fallback to dead code
- Trade fraction gains controlled variance per development level (UnderDeveloped fixed 5%; others add dice band around mean)
- Goal-loop redesigned: generates up to 2 000 candidates, scores each, returns **closest match** instead of failing
- `allowShipsAtXPort` defaults to `true` in `DEFAULT_GENERATOR_OPTIONS`
- Build passes with zero TypeScript errors

---

## v1.3.112 — QA-058 Ships in Area Rework (2026-04-17)

### Fixes
- **QA-058:** Ships in Area redesigned after QA-056/057 prerequisites completed
- Boat Years scarcity multiplier removed from `shipsInArea.ts` — CE worlds naturally produce smaller budgets from lower GDP/day
- X-class port gate converted to user toggle: `allowShipsAtXPort` field in `GeneratorOptions` (default `false` at spec time; overridden to `true` by QA-061)
- Ships table now displays **Credit Value** (`visiting_cost_cr`) and **Monthly Op. Cost** (`monthly_operating_cost_cr`) instead of income-years
- E-class gate (10% budget cap, small craft only, max 5 ships) unchanged
- `src/lib/shipsInArea.ts`, `src/components/SystemViewer.tsx`, `src/components/GeneratorDashboard.tsx`, `src/types/index.ts`
- Build passes with zero TypeScript errors

---

## v1.3.111 — QA-057 Annual Trade — wealthMultiplier Removed (2026-04-17)

### Fixes
- **QA-057:** `wealthMultiplier[wealth]` removed from `annualTrade` formula in `worldData.ts`
- Wealth is now fully expressed through average SOC in `getGdpPerDayForWorld()` (QA-056 upstream); applying it again to trade volume was double-counting
- `tradeFraction[dev]` retained as the "economic openness" modifier — development still shapes how much of GDP flows through the port
- `src/lib/worldData.ts`, `src/lib/generator.ts`
- Build passes with zero TypeScript errors

---

## v1.3.110 — QA-056 GDP/Day from Average SOC (2026-04-17)

### Features
- **QA-056:** `getGdpPerDayForWorld(tl, development, wealth, preset)` added to `src/lib/economicPresets.ts`
- Derives `avgSoc = DEVELOPMENT_AVG_SOC[dev] + WEALTH_SOC_BONUS[wealth]` (capped at SOC 12)
- Scales SOC 7 base income by `getSocIncomeRatio(avgSoc)` — an UnderDeveloped world (SOC ~3.5) earns ~4% of SOC 7; a Very Developed + Affluent world (SOC 13, capped 12) earns ~20× more
- Replaces `getGdpPerDayFromPreset()` in `generator.ts` for all inhabited worlds
- New helpers: `DEVELOPMENT_AVG_SOC`, `WEALTH_SOC_BONUS`, `getSocIncomeRatio()`, `getSocMonthlyIncome()`
- Build passes with zero TypeScript errors

---

## v1.3.109 — QA-051 Table-Weight Calibration Pass (2026-04-16)

### Fixes
- **QA-051 Phase 2:** Weight calibration pass for Development, Power Structure, and Source of Power tables
- Mneme, CE, and Stagnant weight presets tuned against 1 000-system batch export
- Build passes with zero TypeScript errors

---

## v1.3.108 — QA-048 Boat Years / SOC7 Income Decoupled (2026-04-16)

### Fixes
- **QA-048:** Boat Years and SOC 7 Income are now independently fillable inputs in Settings
- Changing one no longer force-recalculates the other; both accept direct user entry
- Derived GDP/day updates from whichever field was last edited

---

## v1.3.106 — QA-051 Economic Customizations Roll Profiles + QA-029 Weight Presets (2026-04-16)

### Features / Fixes
- **QA-051:** Economic Assumptions panel in Settings now includes per-table roll-weight customization
  - Development, Power Structure, Source of Power, Government weights each have editable per-outcome rows
  - Live bar and percentage display updates as weights are changed
- **QA-029 (Addressed):** Mneme, CE/Traveller, and Stagnant named weight presets shipped
  - Mneme: progressive/meritocracy-skewed
  - CE/Traveller: classic Traveller distribution
  - Stagnant: Anarchy-heavy frontier default

---

## v1.3.105 — QA-046 Boat Years as Primary Calibration Input (2026-04-16)

### Fixes
- **QA-046:** Settings Economic panel — Boat Years is now the editable primary calibration input
- SOC 7 monthly income and GDP/day are derived read-outs from Boat Years, not separate edit fields

---

## v1.3.103 — QA-047 Ships Scarcity Multiplier by Economic Preset (2026-04-16)

### Fixes
- **QA-047:** `shipsInArea.ts` — scarcity multiplier now derived from the active economic preset's `boatYears` ratio
- CE worlds (boatYears ≈ 222) see ≈22× budget deflation vs Mneme (boatYears = 10.1)
- Ships visiting-cost still in native Credits; multiplier gates total budget, not individual ship cost

---

## v1.3.101 — QA-029 Government Weights (2026-04-16)

### Fixes
- **QA-029 (Partial):** Anarchy disproportionality addressed via the `govWeights` table in GeneratorOptions
- Natural 2D6 distribution preserved as default; override weights can be set in Settings or via preset

---

## v1.3.99 — FR-033 Sector Dynamics Goal-Loop (2026-04-16)

### Features
- **FR-033:** Goal-loop generation in GeneratorDashboard — generate until Starport/Pop/Habitability targets hit
- Target selectors: min starport class, min population, min habitability
- Loop runs up to configurable max attempts, reports success/fail summary

---

## v1.3.98 — FR-034 Ships Price List Modal (2026-04-16)

### Features
- **FR-034:** Ships Price List page (modal) accessible from System Viewer
- Lists all 35 ships from `mneme_ship_reference.json` with cost-in-years display based on active economic preset
- "Years to own" column recalculates live when preset changes

---

## v1.3.97 — QA-027 / QA-028 Income Display Fixes (2026-04-16)

### Fixes
- **QA-027 (final):** `formatCreditScale()` now outputs full comma-separated numbers (`1,790,000,000 Cr`); `annualTrade / 52` weekly base confirmed in code
- **QA-028 (partial):** `SystemViewer.tsx` — contextual narrative notes now appear when Wealth and Development levels mismatch (e.g. high dev + low wealth shows "productive but poor" flavour text); underlying independent-roll table tension noted as remaining work

---

## v1.3.96 — QA-025 Low Population Terminology Override (2026-04-16)

### Fixes
- **QA-025:** Wealth and Development descriptor text now uses scalable language for small populations
- Replaces "Economy", "Middle class", "Investment capital" etc. with "Fiscal condition", "Specialist groups", "Communal resources" at population < 10 000

---

## v1.3.95 — QA-043 Recent Systems World Code (2026-04-16)

### Fixes
- **QA-043:** Recent systems table now displays world code or WB-assigned star system name alongside system ID
- Falls back to truncated UUID when no name assigned

---

## v1.3.94 — QA-044 System Viewer Economic Model Badge (2026-04-16)

### Fixes
- **QA-044:** System Viewer Overview tab now shows an "Economic Model" badge (Mneme / CE / Custom)
- Badge displays the preset name used when generating that system, not the current active preset

---

## v1.3.85 — FR-032 Phase 3–4 + QA-030 Ship Hard Gates (2026-04-16)

### Features / Fixes
- **FR-032 Phase 3:** Engine integration — `calculateStarport()` and `generateShipsInTheArea()` accept and use the active `TLProductivityPreset` from generator options
- **FR-032 Phase 4:** Ships displayed as "income-years" in Ship Detail cards alongside Credit cost
- **QA-030:** `shipsInArea.ts` — hard gates by starport class
  - Class X: returns zero ships immediately
  - Class E: budget capped at 10%, small craft only, max 5 ships

---

## v1.3.84 — FR-032 Phase 2: Economic Settings UI (2026-04-16)

### Features
- **FR-032 Phase 2**: Added the "Economic Assumptions" panel to `Settings.tsx`
  - Preset selector (Mneme / CE) with Save, Save As, Load, Import, Export for custom presets
  - Boat-Years calibration input with live derived income/GDP readouts
  - Reference TL and Growth curve selectors (Mneme / Flat / Linear / Custom)
  - Expandable SOC-Income grid (SOC 1–60) for any TL 7–16
  - Collapsible explanatory note on CE stagnation vs Mneme growth
- `src/components/Settings.tsx`: refactored to manage `activePreset`, `customPresets`, and localStorage persistence
- `formatCreditCompact()` helper for readable large-credit grid values
- Build passes with zero TypeScript errors

---

## v1.3.83 — FR-032 Phase 1: Economic Engine Data Model (2026-04-16)

### Features
- **FR-032 Phase 1**: Scaffolded the full economic engine customization layer
- `src/types/index.ts`: added `TLProductivityPreset`, `ProductivityCurve`, `TableWeights`, expanded `GeneratorOptions`
- `src/lib/economicPresets.ts`: Mneme & CE built-in presets, SOC-income grid helpers, preset import/export
- `src/lib/optionsStorage.ts`: validates and defaults `tlProductivityPreset`, `developmentWeights`, `powerWeights`, `govWeights`
- `src/lib/dice.ts`: added `rollWeighted2D6()` for configurable 2D6 table distributions
- `src/lib/worldData.ts`: `calculateStarport()` accepts optional `gdpPerDayOverride`; `getDevelopment`/`getPowerStructure`/`getSourceOfPower` accept optional `weights`
- `src/lib/generator.ts`: wires preset GDP into starport calculation and weights into Development/Power/Gov rolls
- `GeneratorDashboard.tsx`: passes full options object (including new fields) to `generateStarSystem()`

### Design Notes
- Mneme preset exactly reproduces legacy `GDP_PER_DAY_BY_TL` behavior (backward compatible)
- CE preset uses flat 2,000 Cr/month SOC 7 income across all TLs (Y≈222)
- Build passes with zero TypeScript errors

---

## v1.3.82 — QA-037 localStorage Backward Compatibility (2026-04-16)

### Fixes
- **QA-037:** Added `src/lib/optionsStorage.ts` with `loadGeneratorOptions()` and `saveGeneratorOptions()`
- Centralised parsing, validation, and default-merging for `mneme_generator_options`
- Refactored `GeneratorDashboard.tsx` to use the new helpers instead of inline localStorage access
- Ensures old stored objects gracefully merge with new defaults when FR-032 fields arrive

---

## v1.3.81 — QA-027 Income Notation & Math Fix (2026-04-16)

### Fixes
- **QA-027 Bug A:** `src/lib/worldData.ts` — corrected `weeklyBase` from `annualTrade / 364` (daily rate) to `annualTrade / 52` (true weekly rate)
- **QA-027 Bug B:** `src/components/SystemViewer.tsx` — relabelled "This week" → "Port Activity"; updated tooltip to explain snapshot nature and new ÷52 formula
- **QA-027 Bug C:** `src/lib/format.ts` — `formatCreditScale()` now outputs full comma-separated numbers (e.g. `1,790,000,000 Cr`) instead of ambiguous `B`/`M` abbreviations
- `QA.md`: marked QA-027 as ✅ Fixed; added QA-037 (localStorage backward compatibility) as a prerequisite for FR-032

---

## v1.3.80 — FR-032/FR-033 Spec + FRD Economic Settings Section (2026-04-16)

### Documentation
- Created `260416-fr032-fr033-spec.md` — unified spec for Economic Engine Customization and Goal-Loop Generation
- FR-032 spec now defines:
  - Boat-Years calibration (Mneme default Y=30, CE default Y≈222 with flat 2,000 Cr/month SOC 7 at all TLs)
  - Four growth curves: `mneme`, `flat`, `linear`, `custom`
  - Engine-level integration: preset replaces `GDP_PER_DAY_BY_TL`, driving `calculateStarport()` and `shipsInArea.ts`
  - SOC-Income grid (1–60), Development/Power/Gov weight customization, and Income-Years ship display
  - Inline GDP/PSS mechanics reference for the Settings UI
- `260409-v02 Mneme-CE-World-Generator-FRD.md`: added **Section 10.4 — Economic Settings (FR-032)** documenting presets, Boat-Years calibration, growth curves, GDP/PSS pipeline, and table customization

---

## v1.3.79 — QA-034 Canonical Depression Penalty + Economy Docs (2026-04-15)

### Code Changes
- **QA-034**: Removed the `depressionPenaltyTiming` generator option; after-starport recalculation is now the only behavior
- `GeneratorDashboard.tsx`: removed timing selector UI and `localStorage` persistence
- `generator.ts`: hardcoded after-starport depression penalty flow (calculate founding starport with base TL, then recalculate with `effectiveTL` if depressed)
- `types/index.ts`: removed `depressionPenaltyTiming` from `GeneratorOptions`

### Documentation
- `QA.md`: added Root Cause Analysis for economy engine cluster (QA-027, QA-028, QA-030)
- `QA.md`: marked QA-031 through QA-036 and FR-031 statuses; added detailed FR-031 Phase 0–5 completion notes
- Added `260415-claude-open-qa027-income-notation.md` and `260415-claude-open-fr032-income-assumptions.md` specs
- `260410-Update.md` renamed to `260410-Changes.md` with expanded Section 12 (Density-Derived Gravity)
- `260409-v02 Mneme-CE-World-Generator-FRD.md`: added §7.2.2 Low Population Terminology & Depression Penalty

---

## v1.3.62 — Depression Penalty & After-Starport Recalculation (2026-04-15)

### Major Feature: QA-026 — Low Population Depression Penalty
- Added `calculateDepressionPenalty()` based on population thresholds and development level
- **After-starport timing** (chosen canonical method): starport calculated with founding TL, then recalculated with depressed `effectiveTL`
- Downgraded starports display founding class in parentheses: `Class E (founded Class B)`
- Parenthetical founding PSS also shown when downgraded
- Travel Zone auto-recalculates with `effectiveTL` (`< 10` → Amber, `< 9` → Red)
- Ships-in-the-Area budget auto-recalculates from depressed weekly activity
- New data model fields: `Inhabitants.foundingTL`, `Inhabitants.effectiveTL`, `Starport.foundingClass`, `Starport.foundingPSS`, `Starport.foundingRawClass`
- Generator option `depressionPenaltyTiming` persisted to `localStorage`

---

## v1.3.61 — README v1.4.0 Update (2026-04-15)

### Documentation
- Updated README with v1.4.0 highlights
- Added links to new documentation files

---

## v1.3.60 — QA-023 Marked Live (2026-04-15)

### Documentation
- Formally marked QA-023 (mass + density physics pipeline) as ✅ Implemented in `QA.md`
- Confirmed gravity is derived from mass + density, not rolled independently

---

## v1.3.59 — QA-024: In-System Ship Positions (2026-04-14)

### Fix / Feature
- Ships with location `"System"` now receive a `systemPosition` (body index 1–N)
- UI displays `In System — Body 3`
- Zero-body systems fall back to `In Orbit`
- Updated `.docx` export and `shipsInArea.ts`

---

## v1.3.58 — FR-030 Ships in the Area + QA-022 Physics (2026-04-14)

### Features
- **FR-030**: "Ships in the Area" generator wired to UI + `.docx` export
- **FR-029**: Weekly 3D6 roll button on Starport card, persists via `onUpdateSystem`
- **QA-022**: Main world gravity/size physics validation — impossible combinations eliminated

---

## v1.3.57 — Culture & Power Conflict Fixes (2026-04-14)

### Engine Fixes
- **QA-020**: Culture traits reroll opposing/duplicate results (max 20 attempts)
- **QA-021**: Source of Power excludes contradictory culture traits

---

## v1.3.56 — Generator Options Persistence (2026-04-14)

### Feature
- **FR-028 / QA-018**: Generator options (star class, grade, world type, populated) persist to `localStorage`
- Restored on navigation and app reload

---

## v1.3.55 — CI & Version Fixes (2026-04-13)

### Infrastructure
- GitHub Actions workflow for auto-deploy to `gh-pages`
- Fixed workflow permissions (`contents: write`)
- Switched to official GitHub Pages deployment actions
- Updated to Node 24
- Fixed `--legacy-peer-deps` for `vite-plugin-pwa` conflict
- Version now dynamic based on git commit count
- Fixed hardcoded version in batch export

---

## v1.3.54 — Batch Export + Habitat Sizing (2026-04-11)

### Features
- **QA-016**: Batch export enhanced with `byStarClass` statistics (median bodies, main world type %)
- **QA-017**: Habitats sized by largest body mass in system

---

## v1.3.53 — Half Dice v1.2 (2026-04-10)

### Engine Change
- **QA-015**: M-class stars use **Half Dice** (d3 + Dis+1)
- K-class stars use Dis+3 on standard d6
- Significantly reduced planet counts for K/M dwarfs

---

## v1.3.52 — README & Credits Update (2026-04-10)

### Documentation
- Added Credits section (GitHub, DeepSeek, Kimi)
- Added Contributors section
- Updated README with Recent Updates and Settings sections

---

## v1.3.51 — Version Badge & Physics Tests (2026-04-10)

### Features / Fixes
- Visible version badge in header
- Fixed escape velocity formula to pure metric units
- Added Python-based physics validation test suite
- Fixed radius calculation (`size × 0.5`)

---

## v1.3.50 — Debug Toggle & Glossary (2026-04-10)

### Features
- **QA-014**: Debug Mode Toggle in Settings (default ON)
- Updated glossary: World Serpents, Celestials, Great Trees, Divergent/Variant Humans, Spiral Ships, Terraforming Worms

---

## v1.3.49 — Documentation & FRD Links (2026-04-10)

### Documentation
- Added GitHub repo link, DriveThruRPG link, PWA installation instructions to FRD
- Updated `repoAnalysis.md` and `260410-Update.md`

---

## v1.3.48 — Hill Sphere & Hot Jupiter Fix (2026-04-10)

### Major Engine Fixes
- **QA-006**: Hill Sphere orbital spacing prevents disk collisions
- **QA-007**: Adv/Dis modifiers applied to planet count rolls
- **QA-009**: Body stats display (mass, radius, diameter, surface gravity, escape velocity)
- **QA-011**: Hot Jupiter migration clears inner zones

---

## v1.3.47 — Theme Toggles & Batch Export (2026-04-10)

### UI / Dev Tools
- **QA-012**: Debug Batch Export for statistical analysis
- **QA-013**: Compact theme toggle (Dark/Day share button space)

---

## v1.3.46 — TL Reference & Inhabitants UI (2026-04-09)

### Features
- **REF-013**: Tech Level expansion in Inhabitants tab (MTL 9-18)
- Wealth, Government, Development, Power Structure cards
- Population minimum 10 fix
- Governance DM footnote
- Starport output footnote

---

## v1.3.45 — DOCX Export & Annotations (2026-04-09)

### Features
- **DOCX export** with full system data
- **Body annotations** — persisted per system in `localStorage`
- Navigation phone layout fix

---

## v1.3.44 — Generator Controls (2026-04-09)

### Features
- Star class, star grade, main world type dropdowns
- Populated / Unpopulated toggle
- Hab ≤ 0 habitat fork (MVT/GVT table)

---

## v1.3.43 — Cultural Traits & Glossary (2026-04-09)

### Features
- Cultural trait descriptions
- Glossary page
- Stellar spectrum display
- CSV export spec

---

## v1.3.42 — QA Pass: Branding & Engine (2026-04-09)

### Fixes
- App title corrected to "Mneme CE World Generator"
- Logo added to header
- Scientific notation replaced with formatted numbers
- Phone theme toggle
- Single-page layout with tab anchors

---

## v1.3.41 — Initial PWA Implementation (2026-04-08)

### Launch
- First full implementation of MNEME World Generator PWA
- React 19 + TypeScript 5.8 + Vite
- GitHub Pages deployment workflow

---

## v1.3.1 — First Versioned Release (2026-04-10)

The first version to display a visible version badge (`v1.3.1`).

---

**For the full technical change history, see:** `git log --reverse --oneline`
