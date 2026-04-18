# QA Issues — Mneme CE World Generator

<div align="right">
  <a href="https://github.com/Game-in-the-Brain">
    <img src="./references/gitb_gi7b_logo_512.png" alt="Game in the Brain" width="64"/>
  </a>
</div>

**Project:** Mneme CE World Generator PWA  
**Repo:** [Game-in-the-Brain / Mneme-CE-World-Generator](https://github.com/Game-in-the-Brain)  
**Last Updated:** 2026-04-17

---

## ★ HANDOFF INSTRUCTIONS FOR KIMI (and all AI models) ★

If you are an AI model picking up this project, **read this block first**.

### Project
Mneme CE World Generator — React 19 + TypeScript 5.8 + Vite PWA that generates complete star systems for the Cepheus Engine tabletop RPG.  
Working directory: `/home/justin/opencode260220/Mneme-CE-World-Generator`  
Build command: `npm run build` (runs `tsc && vite build` — must pass with zero TypeScript errors).

### ★ Project State (2026-04-17) — Two Layers

**Layer 1 — IMPLEMENTED (the running app):**
The current codebase is stable and working. All QA issues through QA-061 are fixed. The economic system (presets, GDP/day, PSS starports, ships) is complete. The generation pipeline works: star → zones → companions → planetary system → main world (independent) → inhabitants. `repoAnalysis.md` documents the actual code.

**Layer 2 — DESIGNED BUT NOT IMPLEMENTED (the v2 pipeline redesign):**
Three design specs define a complete pipeline rewrite that reverses the generation order — system first, mainworld selected by competitive habitability scoring:

| FR | Design Spec | What It Does |
|---|---|---|
| **FR-041** | `260417-00 MWG-REDESIGN-composition-atmosphere-biosphere.md` | Adds 3D6 composition tables (7-tier for Terrestrial, 7-tier for Dwarf) with Reactivity DM → density range → abiotic atmosphere composition → 11-tier biochem → Biosphere Test (5D6 dis+2 vs TN) → B0–B6 rating → atmosphere conversion (B3+ → N-O). N-O atmospheres are a biosignature, not a lucky roll. |
| **FR-042** | `2600417-01 MWG-REDESIGN-positioning.md` | Replaces zone placement with unified 3D6 roll, 4-phase algorithm (anchor → disks first → remaining mass-descending → moons), 10-zone system (5 inner + 5 outer O1–O5), Hill sphere conflict with 5-reroll ejection → rogue worlds, reversed Hot Jupiter stability roll (~0.5% rate), disk-blocking, Proto-Star/Brown Dwarf promotion. |
| **FR-043** | `260417-02 MWG-REDESIGN-habitability-application.md` | 10-step habitability waterfall on every Dwarf/Terrestrial candidate. Temperature gets zone DMs (Infernal +5 to O5 −8) + atmosphere + greenhouse + Proto-Star heat. Biosphere test gains temperature dice adjustment (Average adv+2, Freezing dis+3) + subsurface ocean override (Europa-type). Highest Baseline Habitability wins → mainworld. TL applies only after selection. |

**Key architectural shift:** Under v1 the mainworld is generated first and the system is built around it. Under v2 the entire system is generated first, every candidate runs through the habitability waterfall, and the most habitable body *emerges* as the mainworld. A Europa-type Dwarf moon can beat an inner-system Terrestrial.

### What To Read (in order)

1. **`repoAnalysis.md`** — current code architecture, types, pipeline, economic system
2. **`260410-Changes.md`** — all mechanics deviations from the book (§1–14 = implemented; §15–17 = proposed/not implemented)
3. **`260409-v02 Mneme-CE-World-Generator-FRD.md`** — full feature spec (§1–13 = implemented; §14.2–14.4 = planned FR-041/042/043)
4. **The three design specs above** (FR-041 → FR-042 → FR-043 in that order) — only if working on the v2 pipeline

### Implementation Plan (8 phases, if assigned v2 work)

| Phase | What | Files | Breaking? |
|---|---|---|---|
| 1 | Type system — add optional fields | `types/index.ts` | No |
| 2 | Composition-density tables | `worldData.ts`, `physicalProperties.ts`, `generator.ts` | No |
| 3 | Positioning system (highest risk) | NEW `positioning.ts`, `generator.ts`, `stellarData.ts` | Yes (feature flag) |
| 4 | Habitability pipeline | NEW `habitabilityPipeline.ts`, `worldData.ts` | No |
| 5 | Pipeline integration (big-bang) | `generator.ts` | Yes |
| 6 | Life Assumptions settings | NEW `lifePresets.ts`, `Settings.tsx`, `optionsStorage.ts` | No |
| 7 | UI updates | `SystemViewer.tsx`, `GeneratorDashboard.tsx`, `exportDocx.ts` | No |
| 8 | Migration (legacy saved systems) | `db.ts` | No |

**Build order:** 1 → 2 → 6 (parallel) → 3 → 4 → 5 → 7 → 8. Zone rename (`Cold`→`Cool`, `Outer`→O1–O5) is the riskiest change — touches CSS, every zone switch, stellarData, worldData.

### Critical Constraints

- `npm run build` must pass with zero TS errors at every commit
- `tsconfig.json`: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- Use `catch` (bare) not `catch (error)` when error variable unused
- Economic presets (Mneme/CE/Stagnant) are the most important user-facing setting — income is a proxy for productivity, not wages. See `repoAnalysis.md §6.5` for the full theoretical framework.
- The `optionsStorage.ts` is the single gateway to `mneme_generator_options` — never access localStorage directly for generator options

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
| **QA-032** | ✅ Fixed | 427 km / 0.18G world — stale pre-QA-023 cached data, no code bug |
| **QA-033** | ✅ Fixed | 2D Map button URL broken on GitHub Pages — extracted to standalone repo |
| **QA-034** | ✅ Fixed | Remove Depression Penalty Timing option; hardcode after-starport recalculation |
| **QA-035** | ✅ Fixed | Main world missing from 2D map — dataAdapter now adds explicitly |
| **QA-036** | ✅ Fixed | Total Planetary Bodies count excludes main world — now included |
| **QA-025** | ✅ Fixed | Low Population Terminology Override — v1.3.96 |
| **QA-027** | ✅ Fixed | Income notation ambiguous; formula and formatting corrected — v1.3.97 |
| **QA-028** | 🟡 Partially Fixed | Wealth contradicts Development — coherence notes added v1.3.97; root table tension remains |
| **QA-029** | 📋 Addressed | Anarchy dominance — natural 2D6 default; Mneme/CE/Stagnant table-weight presets shipped v1.3.101/v1.3.106 |
| **QA-030** | ✅ Fixed | Ships at X/E ports too numerous — port-class hard gate — v1.3.85 |
| **FR-032** | ✅ Fixed | Income system redesign: avg income per TL + ships as income-years — v1.3.85 |
| **QA-043** | ✅ Fixed | Recent systems table shows world code or WB-assigned name — v1.3.95 |
| **QA-044** | ✅ Fixed | System Viewer economic model badge — v1.3.94 |
| **QA-046** | ✅ Fixed | Settings Boat Years as primary editable input — v1.3.105 |
| **QA-047** | ✅ Fixed | Ships scarcity multiplier by economic preset — v1.3.103 |
| **FR-033** | ✅ Fixed | Sector Dynamics goal-loop generation — v1.3.99 |
| **FR-034** | ✅ Fixed | Ships Price List modal — v1.3.98 |
| **QA-ADD-002** | 📋 Spec only | CSV export — spec in REF-012; low priority, no implementation yet |
| **FR-031** | ✅ Fixed | 2D Animated Planetary System Map — clipboard paste workflow; download JSON feature |
| **QA-048** | ✅ Fixed | Boat Years and SOC 7 Income should be independently fillable — v1.3.108 |
| **QA-049** | ✅ Fixed | Economic model effectively implemented via CE (flat/stable) vs Mneme (compounding) vs Stagnant preset selector in Generator and Settings |
| **QA-050** | ✅ Fixed | Recent Systems list displays `economicPresetLabel` (GeneratorDashboard.tsx line 477) |
| **QA-051** | ✅ Fixed | Economic Assumptions Customizations roll profiles — v1.3.106 + v1.3.109 weight calibration |
| **QA-052** | ✅ Fixed | Ships use absolute Cr values from ship reference JSON; preset-scaled income already drives weekly trade budget which determines ship count |
| **QA-053** | ✅ Fixed | Same as QA-050 — `economicPresetLabel` shown in recent systems list |
| **QA-054** | 📋 Queued | Terraforming Terraton Structures — megastructure lore umbrella |
| **QA-055** | ✅ Fixed | Table Weights UI: per-outcome editable rows with live bars and percentages |
| **QA-056** | ✅ Fixed | GDP/day uses average SOC (Development + Wealth) — `getGdpPerDayForWorld()` |
| **QA-057** | ✅ Fixed | Wealth multiplier removed from `annualTrade` — baked into GDP/day via SOC |
| **QA-058** | ✅ Fixed | Ships in the Area: X-port toggle default ON, Boat Years scarcity removed, Credits display |
| **QA-061** | ✅ Fixed | Population redesign: productivity ratio replaces `TL_POP_MOD`; +1 exponent; forgiving PSS mapping |
| **FR-041** | 📋 Planned | Composition–Atmosphere–Biosphere Pipeline Redesign — see below |

### FR-041 — Composition–Atmosphere–Biosphere Pipeline Redesign

**Status:** 📋 Planned — design spec in `260417-00 MWG-REDESIGN-composition-atmosphere-biosphere.md`  
**Scope:** Replaces §6.2–§6.8 of the current pipeline for all Habitability Candidates (Dwarfs + Terrestrials at Level 1 or 2).

**Pipeline:** Mass → **Composition** (3D6, 7-tier with Reactivity DM) → Density (2D6 within composition range) → Physics → **Atmosphere Composition** (3D6, abiotic gas table) → **Atmosphere Density** (2D6 + modifiers) → Temperature → Hazard → **Biochem** (3D6, 11-tier ladder −5 to +5) → **Biosphere Test** (escalating dice pool vs TN 20, triggered at Common+) → **Biosphere Rating** (B0–B6) → **Atmosphere Conversion** (B3+ converts abiotic → transitional/N-O) → Habitability Score

**New subsystems:**
- FR-041a: Composition tables (Terrestrial 7-tier + Dwarf 7-tier, each with density range + Reactivity DM)
- FR-041b: Atmosphere Composition (3D6 abiotic gas table — N-O deliberately absent; it's a biosignature)
- FR-041c: Biochem 11-tier ladder (3D6 + Reactivity DM, Scarce→Inexhaustible, linear −5 to +5)
- FR-041d: Biosphere Test + Rating (base 5D6 dis+2 vs TN; Biochem mod adjusts dice pool — each +1 removes 1 dis level, becoming adv if surplus: Common=7D6 keep low 5, Rich=5D6 plain, Inexhaustible=8D6 keep high 5; B0–B6 tier from degree of pass)
- FR-041e: Atmosphere Conversion matrix (B3 = transitional CO₂+O₂; B4+ = Nitrogen-Oxygen)
- FR-041f: Extraterrestrial Life Assumptions settings panel (TN, disadvantage, min biochem, transitional toggle, offset rule; built-in presets: Mneme Default / Rare Earth / Panspermia)

**Key design shift:** System generated first → baseline habitability for every candidate body → winner selected as mainworld. N-O atmospheres emerge from biosphere conversion (~3–10% of candidates under default settings).

**Depends on:** Locked terminology (INRAS = Level 1 IntRAstellar bodies)  
**Enables:** FR-040 (Intrastellar Population Distribution)  
**Full spec:** `260417-03 MWG-REDESIGN-consolidated-v1.md` (supersedes `260417-00`)

| **FR-042** | 📋 Planned | Positioning System Redesign — see below |

### FR-042 — Positioning System Redesign

**Status:** 📋 Planned — design spec in `2600417-01 MWG-REDESIGN-positioning.md` (v0.3)  
**Scope:** Replaces REF-003 (orbit table) and REF-005 (world position table) for Level 1 body placement.  
**Depends on:** FR-041 (composition must run before positioning; habitability pipeline runs after positioning)

**4-Phase placement algorithm:**

- **Phase A — Anchors:** Largest Gas/Ice Giant placed at frost line with 3D6 jitter; largest Terrestrial rolls unified 3D6
- **Phase B — Disks first:** Disks placed before planets to establish zone density; disks block Terrestrials but not Dwarfs
- **Phase C — Remaining bodies (mass-descending):** Unified 3D6 → zone; Hill sphere conflict check → reroll if blocked; 5-reroll limit → ejection (rogue worlds)
- **Phase D — Moons (Level 2):** Handled by separate Moons/Parent-Child Limit thread

**Sub-items:**
- FR-042a: Zone system — Inner (Infernal/Hot/Conservative/Cool/Frost Line) + Outer (O1–O5 geometric growth to heliopause)
- FR-042b: Unified 3D6 position roll (3→Infernal, 4–7→Hot, 8–11→Conservative, 12–13→Cool, 14→Frost Line, 15–18→Outer)
- FR-042c: Hill sphere conflict + disk-blocking + 5-reroll ejection mechanic (rogue worlds)
- FR-042d: Ice Worlds hard outer-only rule (skip unified 3D6, roll Outer table directly)
- FR-042e: Hot Jupiter stability roll (reversed from QA-011 — 5D6 keep lowest 3 vs TN 5, ~0.5–0.6% rate; mass absorption + shepherding + Proto-Star/Brown Dwarf class upgrade)
- FR-042f: Disk generation formula (3D6 exploding keep lowest 2 ÷ 2 − 1, stellar class modifier)
- FR-042g: Brown Dwarf promotion (≥50 JM → Level 0 companion, relocated to outer orbit per REF-003)
- FR-042h: Data model additions (OuterZoneBoundaries, ejectedBodies, consumedBodies, ZoneId expansion to O1–O5)

**Replaces:** QA-011 (Hot Jupiter Migration) with richer stability-roll mechanic  
**Full spec:** `260417-03 MWG-REDESIGN-consolidated-v1.md` (supersedes `2600417-01`)

| **FR-043** | 📋 Planned | Habitability Application & Mainworld Selection — see below |

### FR-043 — Habitability Application & Mainworld Selection

**Status:** 📋 Planned — design spec in `260417-02 MWG-REDESIGN-habitability-application.md` (v0.1)  
**Scope:** The selection pipeline that runs after all bodies are generated and positioned. Computes Baseline Habitability for every candidate, ranks them, selects the winner as mainworld.  
**Depends on:** FR-041 (composition/biosphere), FR-042 (positioning/zones)  
**Part of:** Redesign sequence: Composition (FR-041) → Positioning (FR-042) → Habitability (this) → Habitats → Megastructures

**10-step habitability waterfall (per candidate body):**
1. Atmosphere Composition (3D6, abiotic — from FR-041)
2. Atmosphere Density (2D6 + modifiers)
3. Temperature (2D6 + zone DM + atmo comp DM + atmo density DM + Proto-Star heat DM)
4. Hazard (2D6 + Reactivity DM + atmosphere hazard bias)
5. Hazard Intensity (2D6)
6. Biochem Resources (3D6 + Reactivity DM, 11-tier — from FR-041)
7. Biosphere Test (5D6 dis+2 + Biochem adjustment + Temperature adjustment + Subsurface override)
8. Biosphere Rating (B0–B6 from degree of pass)
9. Atmosphere Conversion (B3+ → transitional/N-O)
10. Baseline Habitability Score (sum of all mods — NO TL)

**Sub-items:**
- FR-043a: Temperature zone DMs (Infernal +5 through O5 −8) + atmosphere density greenhouse DMs + Proto-Star heat DMs
- FR-043b: Revised hazard table (None→Radioactive with Reactivity + atmo hazard bias stacking)
- FR-043c: Revised hazard intensity (Trace/Light/Moderate/Heavy/Extreme, new tier names)
- FR-043d: Biosphere Test temperature dice adjustment (Average adv+2, Cold/Hot dis+2, Freezing/Inferno dis+3)
- FR-043e: Subsurface Ocean Override (Hydrous/Volatile-Rich + Cold/Freezing + tidal heating → halve temp penalty)
- FR-043f: Revised gravity habitability ladder (symmetric −3 to 0 to −3 around 0.7–1.3G)
- FR-043g: Mainworld selection algorithm (highest baseline hab wins; tiebreakers: biosphere > composition quality > mass > random)
- FR-043h: MVT/GVT fallback (all candidates ≤ 0 → artificial habitat path)
- FR-043i: Data model (baselineHabitability, habitabilityBreakdown, mainworldSelectionLog, wasSelectedAsMainworld)
- FR-043j: Post-selection inhabitants pass (TL applied only after selection, Effective Hab = Baseline + TL mod)

**Key design principle:** TL is NOT part of Baseline Habitability — it applies only after mainworld selection. We pick the most physically habitable world, not the most tech-augmented one.

**Open question:** B6 Post-Sapient worlds give +8 hab bonus but do NOT auto-generate Inhabitants. Does B6 auto-select as mainworld, or compete normally? Currently: competes normally (B6 is just a strong candidate). See FRD §14.2 and §14.4 Open Questions.

**Full spec:** `260417-03 MWG-REDESIGN-consolidated-v1.md` (supersedes `260417-02`)

| **FR-044** | 📋 Planned | Moon Zone Positioning + Roche Ring Creation + Ring Proximity Hazard — see below |

### FR-044 — Moon Zone Positioning System (Phase D / Phase 3b)

**Status:** 📋 Planned — design in consolidated spec §5b  
**Scope:** Level 2 moon placement within parent Hill sphere using 6 discrete zones (Z0 Roche → Z5 Hill Edge). Replaces continuous 2D6→AU mapping.  
**Depends on:** FR-042 (Phase 3 positioning must be complete — parents must be placed first)

**6 Moon Zones (2D6):** Z0 Roche (2.8%), Z1 Inner (8.3%), Z2 Near (41.7% — Europa peak), Z3 Mid (25%), Z4 Outer (16.7%), Z5 Hill Edge (2.8%). One moon per zone; nudge on conflict (1D6 direction → try adjacent zones).

**Sub-items:**
- FR-044a: Moon zone table (2D6 → Z0–Z5) + position within zone (random in zone bounds)
- FR-044b: Zone occupancy + nudge mechanic (same 1D6 direction pattern as Ice World/L1 placement)
- FR-044c: Roche survival check (2D6 + parent mass bonus ≥ 9; failure → moon destroyed → ring creation/upgrade)
- FR-044d: Ring creation from Roche failure (create Faint if no rings; upgrade one tier if rings exist; capped at Massive)
- FR-044e: Rogue moons — `status: 'rogue'`, `parentId: undefined`, enter system dwarf pool. Re-capture deferred to post-v1.
- FR-044f: Ring proximity hazard — moons in Z0/Z1 of ringed parents get +3/+1 to hazard roll (scaled by ring prominence: Prominent/Brilliant ×1.5, Massive ×2)
- FR-044g: `status?: 'planet' | 'moon' | 'rogue'` field on PlanetaryBody
- FR-044h: Visual fix — max moon orbit ≈ 0.49 × hillRadius, no more stellar zone overflow on 2D map

**Implementation queue (Phase 3b):**

| File | Change |
|------|--------|
| `src/lib/moons.ts` | NEW — `placeMoonInZone()`, `roll2D6ToMoonZone()`, Roche survival, rogue queue |
| `src/lib/positioning.ts` | Integrate moon placement after L1 Phase C |
| `src/lib/generator.ts` | Handle rogue moon queue after all L2 generation |
| `src/types/index.ts` | Add `status?: 'planet' \| 'moon' \| 'rogue'`, `moonZone?: number` |
| `src/lib/habitabilityPipeline.ts` | Ring proximity hazard DM in hazard step; rogue moons skip parent heating |

**Full spec:** `260417-03 MWG-REDESIGN-consolidated-v1.md` §5b

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

### 2D Star System Map Integration

MWG links to a **separate standalone repo** (`Game-in-the-Brain/2d-star-system-map`) for the animated planetary system map. The integration is a one-way URL push — MWG encodes the generated system as Base64 and opens the map in a new browser tab. The map repo has no dependency on MWG at runtime.

**Trigger location:** `src/components/SystemViewer.tsx` — the "Copy for 2D Map" button.

**How it works (step by step):**
1. The button click handler takes the current `StarSystem` object (`system` prop).
2. It builds a `MapPayload`: `{ starSystem: system, starfieldSeed: <random 8-char>, epoch: { year: 2300, month: 1, day: 1 } }`.
3. It copies the JSON as plain text to the clipboard via `navigator.clipboard.writeText()`.
4. The user opens the 2D Map and pastes into the textarea, then clicks "Load System".
5. The map parses the JSON and renders the system. A "Download JSON" button lets users save the file.

**The `StarSystem` fields the map actually reads:**

| MWG field | Map field | Notes |
|-----------|-----------|-------|
| `system.key` | `key` | Used as hash seed for deterministic orbit angles |
| `system.primaryStar.class/grade/mass` | `primaryStar.*` | Spectral colour + label |
| `system.companionStars[].orbitDistance` | `companionStars[].orbitDistance` | Companion orbit period |
| `system.circumstellarDisks[].distanceAU` | `circumstellarDisks[].distanceAU` | Disk point fields |
| `system.terrestrialWorlds[].distanceAU/mass` | `terrestrialWorlds[].distanceAU/mass` | Green circles |
| `system.dwarfPlanets[].distanceAU/mass` | `dwarfPlanets[].distanceAU/mass` | Grey circles |
| `system.iceWorlds[].distanceAU/mass` | `iceWorlds[].distanceAU/mass` | Cyan circles |
| `system.gasWorlds[].distanceAU/mass/gasClass` | `gasWorlds[].distanceAU/mass/gasClass` | `gasClass` is a **number** 1–5 |
| `system.mainWorld.type/distanceAU/massEM` | `mainWorld.*` | Gold stroke; added explicitly if not in body arrays |

**Troubleshooting — map opens blank / no bodies rendered:**

1. **Check the paste** — make sure you copied from MWG using the "Copy for 2D Map" button and pasted the entire JSON block into the textarea.
2. **Validate the JSON** — in the browser console:
   ```js
   JSON.parse(document.getElementById('system-paste').value)
   ```
   Verify `starSystem.primaryStar` is populated and `terrestrialWorlds`/`gasWorlds` etc. have entries.
3. **`gasClass` must be a number** — if MWG ever serialises `gasClass` as a string (e.g., `"IV"`), the map's `switch` falls through to `gas-i`. Check `src/types/index.ts` `gasWorlds` — it must be `gasClass: number`.
4. **Main world missing** — `dataAdapter.ts` in the map repo explicitly adds `mainWorld` if no existing body matches its `distanceAU`. If the main world disappears, check that `system.mainWorld` is not `null` in the payload and that its `type` is `"Terrestrial"`, `"Dwarf"`, `"Ice World"`, or `"Habitat"`.
5. **Legacy URL links** — old `?system=<base64>` URLs still work for backward compatibility, but large systems may hit URL limits. Use the clipboard workflow for all new systems.
6. **Unicode in system `key`** — the clipboard copy uses plain JSON text, so Unicode is preserved without encoding issues.

**What NOT to change in this integration:**
- The encoding dance — do not simplify to plain `btoa(json)`. It will crash on any non-ASCII world name.
- The `?system=` param name — the map's `main.ts` decodes exactly this key.
- The `epoch` structure `{ year, month, day }` — used to initialise the orbital simulation date.

**Local testing without GitHub Pages:**
Use the test harness in the map repo: `npm run dev` in `2d-star-system-map/`, then open `http://localhost:<port>/test.html`. This lets you browse 1 000 batch-generated worlds and open any in the renderer — no MWG needed.

---

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
| [QA-025](#qa-025) | Engine — Inhabitants | Low Population Terminology Override | 🟡 Low | ✅ Fixed |
| [QA-026](#qa-026) | Engine — Inhabitants | Depression Penalty for Low Population Worlds | 🟠 Medium | ✅ Fixed |
| [QA-027](#qa-027) | UI — Economy | Income "B cr" notation ambiguous; weekly × 52 ≠ annual total shown | 🔴 High | ✅ Fixed |
| [QA-028](#qa-028) | UI — Economy | Wealth display contradicts World Development section | 🟠 Medium | 🟡 Partially Fixed |
| [QA-029](#qa-029) | Engine — Government | Anarchy government type disproportionately dominant | 🔴 High | 📋 Addressed via Table Weights |
| [QA-030](#qa-030) | Engine — Ships (FR-030) | Ships at X/E-class starport too numerous for port class | 🔴 High | ✅ Fixed |
| [QA-031](#qa-031) | UI — Stars | Star color displayed as raw hex — needs human-readable name | 🟠 Medium | ✅ Fixed |
| [QA-032](#qa-032) | Engine — World Physics | 427 km world showing 0.18G — stale pre-QA-023 data | 🟠 Medium | ✅ Fixed — No Bug |
| [QA-033](#qa-033) | UI — 2D Map | Map button URL broken on GitHub Pages — extracted to standalone repo | 🔴 High | ✅ Fixed |
| [QA-034](#qa-034) | Engine — Inhabitants | Remove Depression Penalty Timing option — default to after-starport only | 🟠 Medium | ✅ Fixed |
| [FR-032](#fr-032) | Feature — Economy | Income system redesign: avg income per TL + ships as income-years | 🟠 Medium | ✅ Fixed |
| [QA-035](#qa-035) | UI — 2D Map | Main world missing from 2D map — buildSceneGraph never adds it (only marks) | 🔴 High | ✅ Fixed |
| [QA-036](#qa-036) | UI — Planetary System Tab | Total Planetary Bodies count excludes main world; ships totalBodies also off-by-one | 🟠 Medium | ✅ Fixed |
| [QA-037](#qa-037) | UI — Settings | localStorage `mneme_generator_options` backward compatibility for new fields | 🟠 Medium | ✅ Fixed |
| [FR-034](#fr-034) | Feature — Ships | Ships Price List page reflecting economic assumptions | 🟠 Medium | ✅ Fixed |
| [FR-033](#fr-033) | Feature — Generate | Sector Dynamics goal-loop: generate until Starport/Pop/Habitability targets hit | 🟡 Low | ✅ Fixed |
| [QA-038](#qa-038) | Lore — Megastructures | Great Serpent (formerly Bakunawa Coil) — MTL 12 antimatter ring | 🟢 Lore | ✅ Documented |
| [QA-039](#qa-039) | Lore — Megastructures | Celestials — self-directed solar swarm for terraforming | 🟢 Lore | ✅ Documented |
| [QA-040](#qa-040) | Lore — Megastructures | Great Trees — space elevator megastructures | 🟢 Lore | ✅ Documented |
| [QA-045](#qa-045) | Lore — Megastructures | Jovian Hammers — MTL 12 gas-giant skimming industry | 🟢 Lore | ✅ Documented |
| [QA-041](#qa-041) | UI — Generate | Economic assumptions selectable in generation; recent systems show preset used | 🟠 Medium | ✅ Fixed |
| [QA-042](#qa-042) | UI — Generate / Settings | Generator: TL9 SOC7 & growth curve read-only; editing belongs in Settings | 🟠 Medium | ✅ Fixed |
| [QA-043](#qa-043) | UI — Recent Systems | Recent systems table should display world code or WB-assigned star system name | 🟠 Medium | ✅ Fixed |
| [QA-044](#qa-044) | UI — System Viewer | Overview should display economic assumptions: "made with: CE / Traveller" | 🟠 Medium | ✅ Fixed |
| [QA-046](#qa-046) | UI — Settings | Settings: Boat Years should be the editable primary calibration input | 🟠 Medium | ✅ Fixed |
| [QA-047](#qa-047) | Engine — Ships | Ships in the Area should use visiting cost scaled by economic scarcity multiplier | 🟠 Medium | ✅ Fixed |
| [QA-048](#qa-048) | Engine — Economy / Ships | Boat Years and SOC 7 Income should be decoupled | 🔴 High | ✅ Fixed |
| [QA-049](#qa-049) | Engine — Economy / Population | Economic model toggle (Stable vs Compounding) | 🔴 High | 📋 Queued |
| [QA-050](#qa-050) | UI — Recent Systems | Recent Systems should show Economic Assumptions used | 🟠 Medium | 📋 Queued |
| [QA-051](#qa-051) | Engine — Inhabitants | Economic Assumptions Customizations roll profiles | 🟠 Medium | ✅ Fixed |
| [QA-052](#qa-052) | Engine — Ships | Ships in the Area should use Credit values based on Economic Assumptions | 🟠 Medium | 📋 Queued |
| [QA-053](#qa-053) | UI — Recent Systems | Recent Items should display what Economic Assumptions were used | 🟡 Low | 📋 Queued |
| [QA-054](#qa-054) | Lore — Megastructures | Terraforming Terraton Structures | 🟢 Lore | 📋 Queued |
| [QA-055](#qa-055) | UI — Settings | Table Weights UI: per-outcome editable rows | 🔴 High | ✅ Fixed |
| [QA-056](#qa-056) | Engine — Economy | GDP/day should use average SOC (Development + Wealth) instead of hardcoded SOC 7 | 🔴 High | ✅ Fixed |
| [QA-057](#qa-057) | Engine — Economy | Impact Analysis: Annual Trade after GDP fix | 🔴 High | ✅ Fixed |
| [QA-058](#qa-058) | Engine — Ships | Ships in the Area rework | 🔴 High | ✅ Fixed |
| [QA-061](#qa-061) | Engine — Population / Starport | Population and PSS calibration — productivity ratio replaces TL_POP_MOD | 🔴 High | ✅ Fixed |

---


---

## Current Open Issues

### QA-027

**Title:** Income display "B cr" notation ambiguous; weekly × 52 ≠ annual total shown  
**Area:** UI — Economy  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Datetime:** 260415-120000 | Fixed: 260416  
**Reported by:** Neil Lucock (email 2026-04-15)

**Problem Statement**  
Neil reports two interrelated issues with the income/credits display:

1. **Notation ambiguity:** "1.79 B cr a week" — it is unclear whether "B" means billion. The Starport box separately shows 149 million credits/week. The relationship between these two figures is not explained.
2. **Math inconsistency:** 1.79 B cr/week × 52 weeks = ~93 B cr/year. The annual figure shown is 54.2 B. These do not reconcile.
3. **US vs UK billion:** "B" is ambiguous — US billion = 10⁹, UK (traditional) billion = 10¹². Neil is UK-based. This will confuse international users.
4. **Plausibility concern:** Neil notes 400,000 people (comparable to Leicester, UK) generating 1.79 B cr/week seems implausibly high, regardless of TL.

**Fixes Applied**
- **Bug A (formula):** `src/lib/worldData.ts` — `weeklyBase = annualTrade / 364` changed to `annualTrade / 52`. Weekly Base is now a true weekly rate.
- **Bug B (snapshot label):** `src/components/SystemViewer.tsx` — Overview tab label changed from "This week" to "Port Activity". Starport card tooltip rewritten to explain that Port Activity = (Annual Port Trade ÷ 52) × 3D6 and varies per visit.
- **Bug C (notation):** `src/lib/format.ts` — `formatCreditScale()` now outputs full comma-separated numbers (e.g. `1,790,000,000 Cr`) instead of ambiguous `B`/`M` abbreviations.

**Working Document**  
[260415-claude-open-qa027-income-notation.md](./260415-claude-open-qa027-income-notation.md) — full root cause analysis, code trace, and proposed fixes.

**Notes**  
Justin response: income UI will be redesigned (see FR-032). The underlying plausibility concern is addressed by FR-032's configurable productivity curves.

---

---

### QA-028

**Title:** Wealth display contradicts World Development section  
**Area:** UI — Economy  
**Priority:** 🟠 Medium  
**Status:** 🟡 Partially Fixed  
**Datetime:** 260415-120000  
**Reported by:** Neil Lucock (email 2026-04-15)

**Problem Statement**  
Neil observes that the Wealth panel displays a world as "not rich" while the World Development section implies significant productive output ("seems to be working hard but not getting much in return"). The two panels give contradictory impressions of the same world.

**Expected Behaviour**  
Wealth and World Development descriptors should tell a coherent story. If a world has high development but low wealth, the text should explicitly surface this tension as a design outcome (e.g., "high-output resource extraction with wealth extracted off-world") rather than appearing contradictory.

**Fix Applied (v1.3.97)**  
- `src/components/SystemViewer.tsx`: contextual narrative notes now appear when Wealth and Development levels mismatch (e.g. high development + low wealth shows "productive but poor" flavour text).
- This masks the contradiction in the UI, but the underlying independent-roll tables can still produce these pairings.

**Design Intent — Not a Bug**  
Wealth and Development are intentionally rolled independently because they represent *different things*:
- **Development** = institutional capacity (education, healthcare, infrastructure, governance quality)
- **Wealth** = resource endowment + trade surplus

Real-world analogues exist where these diverge dramatically:
- **Gulf / Oil nations**: High wealth from resource extraction, lower development due to [Dutch disease](https://en.wikipedia.org/wiki/Dutch_disease) — currency appreciation hollows out other sectors, institutions remain underdeveloped despite vast revenue.
- **Nordic social democracies**: High development + moderate wealth — strong institutions with constrained resource extraction.
- **Post-industrial rust belts**: High development (legacy infrastructure) + declining wealth — former manufacturing powerhouses with depleted resources.

The narrative bridge surfaces these tensions explicitly. A unified socioeconomic generation pass would remove this realistic diversity. **Status: considered sufficient.**

---

---

### QA-037

**Title:** localStorage `mneme_generator_options` backward compatibility for new fields  
**Area:** UI — Settings  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 260416 | Fixed: 260416  

**Problem Statement**  
`GeneratorDashboard.tsx` and `Settings.tsx` read `mneme_generator_options` from `localStorage`. Older stored objects only contain `starClass`, `starGrade`, `mainWorldType`, and `populated`. When FR-032 adds `tlProductivityPreset`, `developmentWeights`, `powerWeights`, and `govWeights`, naive destructuring or missing-field access will cause runtime errors or `undefined` values propagating into the UI.

**Expected Behaviour**
- Loading an old `mneme_generator_options` object must gracefully merge with the new default values.
- No runtime errors when old users upgrade.
- New fields must be independently validate-able (e.g. unknown preset ID → fallback to Mneme default).

**Fixes Applied**
- Created `src/lib/optionsStorage.ts` with:
  - `DEFAULT_GENERATOR_OPTIONS`
  - `loadGeneratorOptions()` — parses, validates, and merges old stored data with defaults
  - `saveGeneratorOptions()` — centralised persistence helper
- Refactored `GeneratorDashboard.tsx` to use `loadGeneratorOptions()` and `saveGeneratorOptions()` instead of inline localStorage access.

**Files**  
`src/lib/optionsStorage.ts` (new), `src/components/GeneratorDashboard.tsx`

---

---

### QA-030

**Title:** Ships at X/E-class starport: count too high for port class  
**Area:** Engine — Ships (FR-030)  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Datetime:** 260415-120000 | Fixed: 260416  
**Reported by:** Neil Lucock (email 2026-04-15)

**Problem Statement**  
Neil reports a TL9 X-class port showing 104 ships in orbit, including a 1,000-ton passenger liner. An X-class port means no facilities — there should be no docked traffic at all, and minimal in-system traffic.

**Expected Behaviour**  
- **Class X:** Zero docked/in-port ships. Minimal in-system traffic (scouts, prospectors, the occasional free trader).
- **Class E:** Minimal facilities — handful of ships at most.
- Ship count should be hard-gated by starport class, not just PSS/TL score.
- A 1,000-ton passenger liner will not visit a world with no port facilities.

**Fix Applied**  
- `src/lib/shipsInArea.ts`: added early-return hard gates based on `starport.class`.
  - **Class X:** returns `{ budget: 0, ships: [], shipsInPort: [], shipsInSystem: [], totalShips: 0 }`.
  - **Class E:** caps budget to 10% of computed value, limits pool to small craft only, and enforces `maxShips = 5`.
- Ships display in `SystemViewer.tsx` already handles empty arrays gracefully.

**Commit:** `v1.3.85` (bundled with FR-032 Phase 3–4)

---

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

---

## Root Cause Analysis: Economy Engine Cluster

This section documents the systemic design tension underlying QA-027, QA-028, and QA-030.

### The Core Conflict: CE Productivity vs. Mneme Productivity

**Cepheus Engine / Traveller** assumes a gentle productivity slope — roughly 1970s-to-1990s style growth, decade over decade. A 400,000-person colony generating significant trade is an anomaly in that framework.

**Mneme** does not live in that world. Mneme lives in:
- The age of **Agents and Robots**.
- The age of **Space Industry**, where one human + automation moves and converts **3× more material per person** every 50 years.
- Compounding growth modeled roughly as **Productivity × 3.3^(TL−8)**.

This is the difference between buying a car and buying an **Orbiter**. Between a house and an **Interstellar Ship with a habitat ring**. Between a construction crane and a **Jovian Hammer** skimming gas giants. Between a particle accelerator and an **800,000 km Great Serpent** harvesting antimatter from radiation belts.

When humans move **gigatons and terratons** the way we move tons in 2026, the entire frame of reference shifts. Terraforming a world to Earth-likeness becomes less attractive than building a billion-habitat cluster. A tiny colony can maintain a Class B starport because robots don't sleep.

### What This Means for the Generator

The audience is split:
- Some want **classic Traveller/CE** — gritty, slow, frontier ports, human-scale labour.
- Some want **Mneme** — post-scarcity-adjacent, automated, high-compounding.

**The current code leans Mneme by default**, but it lacks a UI to express this choice. The result is that Neil (expecting CE-scale economics) sees "billions of credits" from a 400,000-person world as a bug, when in Mneme's timeline it is a feature.

### Required Fix

Build **core mechanics that let the user (or referee) set the TL productivity curve themselves**:
- **CE Default:** Slow 1960s–1990s pace. Low compound growth. Human labour dominant.
- **Mneme Default:** High compound growth (`Productivity × 3.3^(TL−8)`). Agent/robot labour.
- **Custom:** User-defined income baseline per TL.

This is the architectural prerequisite for resolving QA-027, QA-028, and QA-030. See FR-032 for the concrete redesign proposal.

**References:**
- [Under Heaven Demographics 2030 to 2100](https://wiki.gi7b.org/index.php/Under_Heaven_Demographics_2030_to_2100)
- [Game Projects Wiki](https://wiki.gi7b.org/index.php/Game_Projects)

---

## Fixed Issues

### QA-024

**Title:** "In System" ships have no position — missing body index 1–N  
**Area:** Engine — FR-030 Ships in the Area  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Date Opened:** 2026-04-14  
**Date Fixed:** 2026-04-14  
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

---

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

---

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

---

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

---

### QA-033

**Title:** Map button generates wrong URL in dev; GitHub Pages map broken  
**Area:** UI — 2D Map Integration  
**Priority:** 🔴 High  
**Status:** ✅ Fixed (extracted to standalone repo + updated MWG button URL, 2026-04-15)  
**Date Opened:** 2026-04-15  
**Root Cause Identified:** 2026-04-15T21:30+08:00 — Justin QA session
**Resolution:** Map app extracted to [`Game-in-the-Brain/2d-star-system-map`](https://github.com/Game-in-the-Brain/2d-star-system-map). MWG now links to the standalone deployment, eliminating monorepo BASE_URL path-resolution issues entirely.

---

**Expected Behaviour**

The **Map** button in `SystemViewer.tsx` must open a fresh 2D map of the currently generated star system in a new browser tab (`_blank`).

1. Serialize the current `StarSystem` JSON.
2. Add a new random 8-character `starfieldSeed`.
3. Add the default epoch (`2300-01-01`).
4. Encode the payload as a Unicode-safe Base64 string.
5. Open the URL in a new tab.

---

**Root Cause (identified 260415)**

Two earlier "fix" commits (v71 `635b7511`, v72 `8ddad55f`) introduced a wrong DEV override inside the monorepo:

```typescript
// WRONG — commit 8ddad55f
const base = import.meta.env.DEV ? '/' : import.meta.env.BASE_URL;
const url = new URL(`solar-system-2d/?system=${encoded}`, window.location.origin + base);
```

**Why this is wrong:**  
`vite.config.ts` sets `base: '/Mneme-CE-World-Generator/'`. Vite therefore injects `import.meta.env.BASE_URL = '/Mneme-CE-World-Generator/'` in **both** dev and production builds. Overriding it to `/` in DEV strips the base path from the generated URL.

**Why the bug was masked in dev but fatal on GitHub Pages:**

GitHub Pages is a **static file host with zero URL rewrite/redirect logic**. The browser requests exactly the URL the JavaScript constructs. If that URL is missing the repository base path (`/Mneme-CE-World-Generator/`), GitHub Pages serves a 404 — silently, with no fallback.

By contrast, the **Vite dev server** (`npm run dev`) is an active development server. When it receives a request to `http://localhost:5175/solar-system-2d/...` (missing the base path), Vite's own middleware detects the mismatch and prints a friendly "did you mean `/Mneme-CE-World-Generator/solar-system-2d/`?" message, often auto-redirecting the tab. This made the broken code *appear* to work locally while failing completely in production.

**What each environment saw:**

| Environment | URL generated (broken code) | Result |
|-------------|----------------------------|--------|
| Dev (`npm run dev`) | `http://localhost:5175/solar-system-2d/?system=...` | Wrong — missing `/Mneme-CE-World-Generator/`. Vite dev server intercepts the request and redirects, masking the bug. |
| GitHub Pages (PROD) | `https://game-in-the-brain.github.io/solar-system-2d/?system=...` | **404** — GitHub Pages has no redirect server. The missing base path means the file does not exist. |

**Final Fix — Architectural, Not Code-Only:**

Rather than continue patching BASE_URL logic inside a monorepo multi-entry build, the 2D map was extracted to its own standalone repository:

- **New repo:** [`Game-in-the-Brain/2d-star-system-map`](https://github.com/Game-in-the-Brain/2d-star-system-map)
- **Live URL:** `https://game-in-the-brain.github.io/2d-star-system-map/`
- **MWG commit:** `63a01d12` — `SystemViewer.tsx` now opens the external URL directly.

```typescript
// NEW — hardcoded external deployment, no relative-path resolution
const url = new URL(`/?system=${encoded}`, 'https://game-in-the-brain.github.io/2d-star-system-map/');
```

This eliminates the entire class of BASE_URL / path-resolution bugs because the map is no longer a sub-page of the MWG deployment.

---

**Verification Checklist**
- [x] Local dev (`npm run dev`): MWG button opens `https://game-in-the-brain.github.io/2d-star-system-map/?system=...`
- [x] Standalone repo builds with zero TypeScript errors
- [x] MWG build passes: `tsc && vite build` zero errors
- [ ] GitHub Pages smoke-test after deploy (test on live site)

**Service Worker Cache Note:**  
If GitHub Pages still shows the broken URL after this deploy, the browser is serving a stale PWA cache from before the fix. Fix: `Ctrl+Shift+R` (hard refresh) or DevTools → Application → Service Workers → Unregister → reload.

---

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

---

### QA-031

**Title:** Star color displayed as raw hex code  
**Area:** UI — Stars  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 260415-120000  
**Date Fixed:** 2026-04-15  
**Reported by:** Neil Lucock (email 2026-04-14)
**File(s):** `src/lib/stellarData.ts`, `src/components/SystemViewer.tsx`

**Problem Statement**  
The star color field displays the raw hexadecimal value (e.g., `#ff8a65`) directly in the UI. This adds no value to a user — they need a human-readable colour description to picture what the star looks like.

**Fix Applied**

1. Added `STAR_COLOR_NAMES` dictionary to `src/lib/stellarData.ts`:

| Stellar Class | Hex Example | Display Name |
|---------------|-------------|--------------|
| O | `#a8d8ff` | Blue-White |
| B | `#6bb6ff` | Pale Blue |
| A | `#ffffff` | White |
| F | `#fff8e1` | Yellow-White |
| G | `#ffecb3` | Yellow |
| K | `#ffcc80` | Orange |
| M | `#ff8a65` | Orange-Red |

2. Updated `StarDetails` in `src/components/SystemViewer.tsx`:
   - Replaced the plain "Color" DataRow with a prominent **big colour circle** (`w-24 h-24 rounded-full`) using the star's actual hex colour
   - Added the human-readable name below the circle in `text-lg font-semibold`
   - Added the hex code beneath the name in `text-xs font-mono`

**Build Verification**
- `npm run build` passes with zero TypeScript errors (2026-04-15).

---

---

### QA-032

**Title:** Small world surface gravity floor — 427 km world showing 0.18G  
**Area:** Engine — World Physics  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed — No Bug (Stale Data)  
**Datetime:** 260415-120000  
**Date Closed:** 2026-04-15  
**Reported by:** Neil Lucock (email 2026-04-14)

**Problem Statement**  
Neil reports a 427 km world (roughly the size of Ceres) displaying a surface gravity of 0.18G. This is physically implausible — Ceres has ~0.029G. Even a very dense iron-rich body of 427 km would not exceed ~0.04–0.06G.

QA-022 and QA-023 implemented the mass + density pipeline. However, this case suggests the floor density or the gravity derivation formula may still produce unrealistic results for small bodies.

**Investigation Results**

The current mass + density pipeline (QA-023) **cannot** produce a 427 km dwarf world:
- Minimum dwarf mass (`getDwarfMass(2)`) = 0.1 LM = 0.00123 EM
- Minimum dwarf density (`getDwarfDensity(2)`) = 1.5 g/cm³
- Derived diameter = **~2,100 km**

Even planetary dwarf bodies (`generateBody()` with mass 0.0001–0.0011 EM) produce diameters of **~690–2,000 km**. A 427 km body would require a mass ~100× smaller than the Dwarf table minimum, or a density ~14× higher than osmium — both impossible.

**Conclusion:** The reported 427 km / 0.18G world was **old cached data** from before QA-023 (when `size` and `gravity` were rolled independently from tables), or a saved system loaded from `localStorage` / Dexie that predates the physics pipeline.

**Expected Behaviour**  
A 427 km world at any realistic density should produce gravity well under 0.1G. The current code achieves this.

**Recommended Actions**
1. **Check saved systems:** Any `StarSystem` with `mainWorld.size < 1,500` and `mainWorld.type === 'Dwarf'` was generated pre-QA-023 and should be considered stale.
2. **PWA cache clear:** If the issue persists on *new* generations, force-refresh or unregister the service worker to ensure the post-QA-023 build is active.
3. No code change required. Floor density of 1.5 g/cm³ is physically plausible, and `g = G × m / r²` is implemented with correct SI conversions.

---

---

### QA-034

**Title:** Remove Depression Penalty Timing option — default to after-starport only  
**Area:** Engine — Inhabitants  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Date Fixed:** 2026-04-15  
**File(s):** `src/components/GeneratorDashboard.tsx`, `src/types/index.ts`, `src/lib/generator.ts`

**Problem Statement**  
The generator exposed a user-selectable `depressionPenaltyTiming` option with two choices: "Before Starport" and "After Starport." This added cognitive load, created inconsistent saved-world data, and complicated batch export and debugging.

**Fix Applied**  
- Removed the `depressionPenaltyTiming` UI control from `GeneratorDashboard.tsx`.
- Removed `depressionPenaltyTiming` from the `GeneratorOptions` type in `src/types/index.ts`.
- Hardcoded the after-starport path in `generateInhabitants()`:
  1. Calculate starport with founding TL.
  2. Apply depression penalty to get `effectiveTL`.
  3. Recalculate starport with `effectiveTL` if it differs from founding TL.
  4. Store `foundingClass` / `foundingPSS` when downgraded.
- Removed the field from `localStorage` persistence (`mneme_generator_options`).
- Existing saved systems missing the flag gracefully degrade to the after-starport behaviour.

**Acceptance Criteria**
- [x] No UI control for depression penalty timing exists.
- [x] All newly generated worlds use after-starport recalculation.
- [x] Batch export no longer includes `depressionPenaltyTiming`.
- [x] TypeScript builds with zero errors.

---

---

### QA-035

**Title:** Main world missing from 2D map — buildSceneGraph never adds it (only marks)  
**Area:** UI — 2D Map  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Date Fixed:** 2026-04-15  
**File(s):** `solar-system-2d/src/dataAdapter.ts`

**Problem Statement**  
The main world generated by MWG is not part of any planetary body array (dwarfPlanets, terrestrialWorlds, iceWorlds, gasWorlds). The 2D map's `buildSceneGraph()` only *marked* an existing body as main world if coordinates matched, but never actually added the main world when it wasn't found. This meant many generated systems showed no "★ MAIN" body on the map.

**Fix Applied**  
- In `dataAdapter.ts`, after iterating all body arrays, an explicit fallback now adds the main world as a new `SceneBody` when no match is found.
- The fallback uses `mainWorld.type`, `mainWorld.distanceAU`, and `mainWorld.massEM` to derive the correct `BodyType`, radius, and orbit.
- Main world gets a gold stroke (`#FACC15`) and the label "★ MAIN".

**Commit:** `6a26b85e`

---

### QA-036

**Title:** Total Planetary Bodies count excludes main world; ships totalBodies also off-by-one  
**Area:** UI — Planetary System Tab  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Date Fixed:** 2026-04-15  
**File(s):** `src/components/SystemViewer.tsx`, `src/lib/shipsInArea.ts`

**Problem Statement**  
The "Total Planetary Bodies" count in the Planetary System tab summed only the circumstellar disks + dwarf + terrestrial + ice + gas arrays. It did not include the main world itself. This also affected `shipsInArea.ts` because `totalBodies` was computed using the same incomplete sum, causing ship positions to roll in a slightly smaller range than the actual body count.

**Fix Applied**  
- `SystemViewer.tsx`: Added `+ 1` to the total planetary bodies count to include the main world.
- `shipsInArea.ts`: Updated the `totalBodies` calculation to include the main world so "In System — Body N" rolls cover the correct full range.

**Commit:** `2f8e76b4`

---

## Proposed / Spec-Only Features

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

---

### FR-032

**Title:** Income system redesign — average income per TL + ships as income-years  
**Area:** Feature — Economy  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 260415-120000 | Phase 1–4: 260416  
**Proposed by:** Justin (email reply 2026-04-15)

**Proposal**  
Justin's expanded economic engine redesign:

1. **Settings: TL Productivity Presets**  
   Choose between `Mneme` (compounding growth) and `CE / Traveller` (flat 2,000 Cr/month SOC 7 at all TLs), or build a `Custom` curve. The preset replaces the hardcoded `GDP_PER_DAY_BY_TL`, directly affecting starport trade and ship traffic budgets.

2. **Boat-Years Calibration**  
   The primary input is "years for SOC 7 to buy the base Boat (10DT)". This sets the per-capita GDP baseline. In CE mode (Y≈222) ships become enormously expensive in human terms, shrinking port traffic naturally.

3. **SOC-Income Grid & Table Weights**  
   Users can view/edit the SOC 1–60 income table and adjust Development, Power, and Government 2D6 distributions.

4. **Ships = Income-Years stat**  
   `cost / annual_income_per_capita = X income-years`. This makes ship costs legible in human terms.

**Phase 1 Completed (260416)**
- `src/types/index.ts`: added `TLProductivityPreset`, `ProductivityCurve`, `TableWeights`, expanded `GeneratorOptions`
- `src/lib/economicPresets.ts`: Mneme & CE built-in presets, SOC-income helpers, import/export
- `src/lib/optionsStorage.ts`: validates and defaults new fields on load
- `src/lib/dice.ts`: added `rollWeighted2D6()`
- `src/lib/worldData.ts`: `calculateStarport()` accepts `gdpPerDayOverride`; `getDevelopment`/`getPowerStructure`/`getSourceOfPower` accept optional `weights`
- `src/lib/generator.ts`: passes preset GDP into `calculateStarport()` and weights into table rolls

**Phase 2 Completed (260416)**
- `src/components/GeneratorDashboard.tsx`: added "Economic Assumptions" directly into **Generation Options**
  - Preset selector with built-in Mneme / CE presets
  - **TL 9 SOC 7 Income** as the primary calibration input (Cr/month)
  - Growth curve selector (Mneme / Flat / Linear / Custom)
  - Boat-Years displayed as a derived value (e.g. Boat = 5,320,400 Cr → 10 yrs at TL 9 in Mneme, 222 yrs in CE)
  - Generated worlds **snapshot** the active preset into `StarSystem.economicPreset`
- `src/components/Settings.tsx`: moved detailed preset editor + SOC-Income grid here for advanced world-building
- `src/components/SystemViewer.tsx`: Ships in the Area now displays **Income-Years** per ship using the world's stored preset

**Phase 3–4 Completed (260416)**
- Refactored preset model from `boatYears`/`referenceTL` → `baseIncome`/`baseTL` for clearer world-builder UX.
- `src/lib/shipsInArea.ts`: hard-gated ship counts by starport class (QA-030) — X-class returns zero ships; E-class returns ≤5 small craft only.
- `src/components/SystemViewer.tsx`: added "Income-Years" column to ship display and explanatory tooltip.
- `src/lib/generator.ts` & `src/lib/worldData.ts`: fully wired economic preset and optional table weights into all world generation paths.
- `src/lib/optionsStorage.ts`: added migration for old `boatYears`/`referenceTL` stored presets to `baseIncome`/`baseTL`.

**Reference Prices (from `mneme_ship_reference.json`)**
| Ship | Purchase Price |
|---|---|
| Boat (10DT) | 5,320,400 Cr |
| Courier Ship | 44,175,000 Cr |
| Merchant Trader | 43,070,000 Cr |
| Raider | 288,500,000 Cr |
| Passenger Liner (1000DT) | 379,156,000 Cr |

**Commit:** `v1.3.85`

**Dependencies**  
QA-027 ✅ (fixed as prerequisite).  
QA-030 ✅ (fixed as part of Phase 3–4).  
QA-037 ✅ (localStorage backward compatibility).

---

---

### FR-034

**Title:** Ships Price List — dynamic page reflecting Economic Assumptions  
**Area:** Feature — Ships / Economy  
**Priority:** 🟠 Medium  
**Status:** 📋 Proposed  
**Datetime:** 260416  

**Proposal**  
A dedicated **Ships Price List** view (or modal/page) that displays the full `mneme_ship_reference.json` catalogue through the lens of the current economic preset.

**Key behaviour:**
- **CE/Traveller mode:** prices are shown in raw Credits. Incomes are low, so ships appear enormously expensive in human terms (hundreds of income-years). This matches the stagnant model where only collectives, corporations, or governments can afford spacecraft.
- **Mneme mode:** prices are still shown in raw Credits, but the SOC-income grid makes them affordable. A 10DT Boat costs ~10 years of TL 9 average income — equivalent to buying a car or a modest house in 2026. A Courier (~80 years) is like a mortgage. A Raider (~500 years) is like a small business loan or a collective investment.

**Columns to display:**
| Ship | DT | Purchase Price (Cr) | Income-Years at TL 9 | Monthly Upkeep |
|---|---|---|---|---|

The page should be accessible from:
- The **System Viewer** Ships card ("Open Price List" link)
- The **Generator Dashboard** Economic Assumptions section ("View Ships Price List" link)

**Design note:** The raw Credit prices from CE are kept unchanged. What changes is the *affordability* — driven entirely by the income curve the user selects.

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

---

## Lore — Megastructures & Terraforming

These structures are necessary in the ever-compounding growth of technology and the self-directed growth of humans. The Great Serpents, Great Trees, Celestials, and Jump Gates are all necessary for trade and growth. Just as the Space Race, Earth's Recovery, and the Transition to Green Energy propelled civilisation forward, without such projects of science and engineering humans regress to infighting, capital hoarding, and enslaving each other. These infrastructures compound growth by harnessing a star's massive resources to propel humans to more stars.

---

### QA-042

**Title:** Generator: TL9 SOC 7 income and growth curve should be read-only; full editing belongs in Settings  
**Area:** UI — Generate / Settings  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 260416 | Fixed: 260416

**Problem Statement**  
Currently the Generator dashboard exposes raw economic inputs (TL9 SOC 7 monthly income, growth curve selection) that can be edited inline. This blurs the line between *world selection* (Mneme vs CE/Traveller) and *world building* (customising the underlying income model).

**Expected Behaviour**
- **Generator Dashboard**: purely **selective**, not creative.
  - Show a **preset dropdown** only: `Mneme`, `CE / Traveller`, or a user-saved custom preset.
  - Display the resulting TL9 SOC 7 income and growth curve as **read-only summary text** (e.g. "TL 9 SOC 7 = 44,170 Cr/month • Mneme compounding curve").
  - No inline number editing, no curve dropdown, no SOC grid.
- **Settings Page**: the **world-building workshop**.
  - Create / edit / import / export custom presets.
  - Edit TL9 SOC 7 income, choose growth curves, view the full SOC 1–60 grid.
  - Saved custom presets appear in the Generator dropdown.

**Fix Applied**
- `src/components/GeneratorDashboard.tsx`:
  - Removed editable **TL 9 SOC 7 Income** number input and **Growth Curve** dropdown.
  - Preset selector now loads **custom presets** from `localStorage` (`mneme_custom_presets`) and groups them under a "Custom" optgroup alongside built-ins.
  - Added read-only summary panel displaying:
    - TL {baseTL} SOC 7 Income (full comma-separated Credits)
    - Growth curve label
    - Boat-years at the reference TL
  - Added helper text: "Editing presets is available in Settings."
- `src/components/Settings.tsx`: unchanged — continues to serve as the authoritative preset editor with Save / Save-As / Import / Export / SOC-Income Grid.

**Commit:** `v1.3.90`

---

### QA-043

**Title:** Recent systems table should display the world code or the WB-assigned star system name  
**Area:** UI — Recent Systems  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 260416 | Fixed: 260416

**Problem Statement**  
The Recent Systems table currently shows only a generic identifier or timestamp, making it hard for world builders (and users) to quickly locate a previously generated system. When a user generates multiple worlds in a session, the list becomes visually indistinguishable.

**Fix Applied**
- `src/components/GeneratorDashboard.tsx`: Recent Systems now shows `system.name || generatedCode` as the primary label.
- Added `getSystemCode()` helper producing compact codes like `AT+3-TL9-Pop12K` (starport + world-type-initial + hab + TL + pop).
- `src/components/SystemViewer.tsx`: header includes an inline editable name input. Changes propagate back to saved systems via `onUpdateSystem`.

**Commit:** `v1.3.95`

---

### QA-044

**Title:** Overview should display economic assumptions: "made with: CE / Traveller" or "Mneme"  
**Area:** UI — System Viewer / Overview  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 260416 | Fixed: 260416

**Problem Statement**  
Users viewing a generated system have no immediate visual indication of which economic model was used to create it. Because Mneme and CE/Traveller worlds are intentionally incompatible (different GDP curves, different ship traffic logic), this context is essential for referees interpreting trade, ship budgets, and world wealth.

**Fix Applied**
- `src/components/SystemViewer.tsx`: added a badge below the generation timestamp showing **"Economic model: {preset.name}"**.
- Fallback for legacy worlds (pre-FR-032) shows **"Legacy / Unknown"**.

**Commit:** `v1.3.94`

---

### QA-046

**Title:** Settings: Boat Years should be the editable primary calibration input  
**Area:** UI — Settings / Economic Assumptions  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 260416 | Fixed: 260416

**Problem Statement**  
Currently the Settings preset editor exposes **TL 9 SOC 7 Income (Cr/month)** as the editable number. World builders think in terms of "how many years of average salary does it take to buy a Boat?" — not in raw Credits. The current UI forces them to do mental arithmetic.

**Fix Applied**
- `src/lib/economicPresets.ts`: added `getBaseIncomeFromBoatYears(boatYears)` helper.
- `src/components/Settings.tsx`:
  - The **"Boat Years at TL {baseTL}"** input is now the primary editable field.
  - Typing a value (e.g. `228.35`) instantly computes `baseIncome = 5,480,400 / (boatYears × 12)`.
  - The old **TL 9 SOC 7 Income (Cr/mo)** field is now a read-only derived summary displayed below the inputs.
  - Added helper text explaining the relationship: "Lower years = higher income = more ships."
- Generator Dashboard remains read-only summary only (QA-042).

**Rationale**  
Boat-years is the intuitive human-scale anchor. It directly answers: "is a ship like a car (10 years), a house (30 years), or a medieval cathedral (200+ years)?"

**Commit:** `v1.3.105`

---

### QA-047

**Title:** Ships in the Area generator should use visiting cost scaled by economic scarcity multiplier  
**Area:** Engine — Ships (FR-030 / v1.3.103)  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 260416 | Fixed: 260416

**Problem Statement**  
Even after QA-030 (X/E hard gates) and FR-032 (economic presets), CE/Traveller worlds were still generating too many ships. The raw Credit comparison of port budget vs ship visiting cost does not account for the *structural* scarcity of spacecraft in a stagnant economy. In CE, a Boat costs ~228 salary-years — it should be treated as a rare capital asset, not a routine purchase.

**Fix Applied (v1.3.103)**
- `src/lib/shipsInArea.ts`: `generateShipsInTheArea()` now accepts an optional `TLProductivityPreset`.
- It computes a **scarcity multiplier**:
  ```
  boatYears = getBoatYears(preset.baseIncome)
  scarcityMultiplier = max(1, boatYears / mnemeReference)
  // mnemeReference ≈ 10.1
  ```
- The effective ship-generation budget is divided by this multiplier:
  ```
  effectiveBudget = rawBudget / scarcityMultiplier
  ```
- Ships are still selected from pools using their raw `visiting_cost_cr`, but the available budget is reduced proportionally to the economy's ship-scarcity.

**Impact Analysis**
| Mode | Boat Years | Budget Factor (from GDP) | Scarcity Multiplier | Combined Ship Density |
|------|-----------|--------------------------|---------------------|----------------------|
| **Mneme** | ~10.1 | 1× | 1.0 | **High** — ships are common (car-like) |
| **CE / Traveller** | ~228 | ~0.044× | ~22.6 | **Very Low** — ships are cathedral-like capital assets |

*Combined effect:* CE/Traveller ship counts drop by roughly **500×** versus Mneme for the same port class, because:
1. Lower GDP produces a smaller port budget (~22× less)
2. The scarcity multiplier makes each ship "cost" ~22× more in generation terms

**Result:** A TL 9 Pop-4 CE world might see **0–3** small craft instead of **50+**. A Mneme world of the same stats might see **20–60** ships of mixed pools.

**Files**
- `src/lib/shipsInArea.ts` — scarcity multiplier logic.
- `src/components/SystemViewer.tsx` — passes `system.economicPreset` into generation.

**Commit:** `v1.3.103`

---

### QA-048

**Title:** Economic Assumptions — Boat Years and SOC 7 Income should be independently fillable
**Area:** Engine — Economy / Ships
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Datetime:** 260416 | Fixed: 260416  

**Problem Statement**  
In the Settings preset editor, **Boat Years at TL 9** was the primary editable input, and **Derived TL 9 SOC 7 Income** was shown as a read-only derived value. The two were mathematically coupled:
```
baseIncome = BOAT_PRICE_CR / (boatYears × 12)
```
This meant a world builder could not set them independently.

**Fix Applied (v1.3.108)**
1. `src/components/Settings.tsx`: both **Boat Years** and **SOC 7 Income (Cr/mo)** are now independently editable. Changing one no longer overwrites the other.
2. `src/lib/economicPresets.ts`: added `getBoatYearsAtTL(tl, preset)` which uses `preset.boatYears` when available, otherwise falls back to `getBoatYears(preset.baseIncome)`. `getIncomeYears()` now computes affordability via boat-years directly.
3. `src/lib/shipsInArea.ts`: scarcity multiplier reads `preset.boatYears` directly, so ship generation is decoupled from GDP.
4. `src/components/GeneratorDashboard.tsx`: read-only summary displays the stored `boatYears` value.
5. Backward compatibility preserved: old presets without an explicit `boatYears` field still derive it from `baseIncome`.

**Result**
- A high-income world can now have scarce ships (high `baseIncome`, high `boatYears`).
- A low-income world can now have common ships (low `baseIncome`, low `boatYears`).
- The two dials control separate concerns: **income** → GDP/port budgets; **boat-years** → ship scarcity & affordability.

---

### QA-038

**Title:** Megastructure — Great Serpent (Bakunawa Coil rename)  
**Area:** Lore — Megastructures  
**Priority:** 🟢 Lore  
**Status:** ✅ Documented  
**Datetime:** 260416

**Description**  
**MTL 12** megastructure. A particle accelerator **898,394 km** in circumference (approximately the Sun's circumference). This is a ring built around a gas giant's radiation belt — powered by thousands of fusion plants — whose magnets capture and channel particles to generate **antimatter**.

**Nomenclature**  
Named after mythological world serpents. Examples:
- **Bakunawa Coil** — around Jupiter
- **Jörmungandr** — around Earth

**Manufacture**  
Produced with the same process as space elevators:
- Carbon nanotubes manufactured at **Lagrange points**
- Reinforced in **Jovian Forges**

**Role**  
They create the necessary power infrastructure for **FTL travel**.

---

### QA-039

**Title:** Megastructure — Celestials (Solar swarm)  
**Area:** Lore — Megastructures  
**Priority:** 🟢 Lore  
**Status:** ✅ Documented  
**Datetime:** 260416

**Description**  
**MTL 13** self-directed solar swarm megastructures that sail on light and gravity in the inner system (Venus, Mars, Mercury orbits).

**Capabilities**
- Harvest **trace atmospheres**
- **Reflect or concentrate light** for terraforming

**Nomenclature**  
Named after celestial beings from various cultures.

**Autonomy**  
Become **fully autonomous by MTL 16**.

**Role**  
Essential in making any **Hot** or **Cool** world terraformable. The swarm becomes self-sustaining when a **Great Tree** is configured to extract resources for its maintenance.

---

### QA-040

**Title:** Megastructure — Great Trees (Space elevators)  
**Area:** Lore — Megastructures  
**Priority:** 🟢 Lore  
**Status:** ✅ Documented  
**Datetime:** 260416

**Description**  
**MTL 13** fixed space elevator megastructures that grow to enormous scale. Based on **Bradley C. Edwards' designs** — only viable for >1G world escape by the 24th century.

**Nomenclature**  
Cultural terms vary; **Great Trees** is one of many names used across human cultures.

**Autonomy & Mobility**  
Become **self-directed by MTL 16**, capable of **jumping between star systems**.

---

### QA-045

**Title:** Megastructure — Jovian Hammers and Forges (MTL 12 gas-giant skimming industry)  
**Area:** Lore — Megastructures  
**Priority:** 🟢 Lore  
**Status:** ✅ Documented  
**Datetime:** 260416 | Updated: 2026-04-16

**Description**  
**MTL 12** industrial megastructures built from carbon nanotubes — the same core material used in space elevators and Great Serpents. Jovian Hammers function like sky-hooks or spinning bolas in orbit around gas giants (e.g. Jupiter, Saturn). They make deep gouging or skimming passes through the upper atmosphere to harvest materials that can only be produced under gas-giant conditions.

**Scale Context**
- **Megastructures in the millions of tons** are achievable by **TL 9**.
- **Gigatons** (billions of tons) become the standard civilisational output as automation compounds. For reference, Earth's concrete production is measured in gigatons per year, and carbon generated per year is roughly **10 gigatons**.
- **Terratons** (trillions of tons) mark the next order of magnitude. Atmospheric carbon in 2026 is approximately **0.8 Terratons**.

**Evolution by Tech Level**
- **TL 13:** Hammers can skim **Brown Dwarf Stars**, accessing even denser exotic atmospheres.
- **Higher TLs:** The simple bolas design gives way to **Titans** — megaton Celestials arranged as a **ring orbiting a Hot Giant or a Cool Brown Dwarf**. These rings create a magnetic runway and catch system that launches Hammers into hotter gas giants, cooler stars, and eventually into more intense stellar environments.
- **Exotic specialisation:** As humanity spreads interstellar, Jovian Hammers and their supporting **Forges** diversify. Crystallisation processes and quantum properties unique to gas-giant pressures become industrial staples.

**Role**  
They extract the raw bulk materials needed for antimatter rings (Great Serpents), space-elevator tethers (Great Trees), and the orbital infrastructure that powers FTL civilisation.

---

### QA-041

**Title:** Economic assumptions selectable in generation; recent systems show which preset was used  
**Area:** UI — Generate / Recent Systems  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 260416

**Description**  
Worlds generated with different economic assumptions (Mneme vs CE/Traveller) are intentionally incompatible because the underlying GDP tables and productivity curves differ. Users need to know which economic model a saved or recent world was built with.

**Fix Applied**
- `src/components/GeneratorDashboard.tsx`: the **Generation Options** panel now includes an **Economic Assumptions** selector (Mneme / CE / Custom). The active preset name is displayed above the Generate button.
- `src/lib/generator.ts`: every generated `StarSystem` **snapshots** the active `TLProductivityPreset` into `system.generationOptions.tlProductivityPreset`.
- `src/components/SystemViewer.tsx`: the **Ships in the Area** card uses the world's stored preset to compute **Income-Years** per ship.
- Recent / saved systems therefore carry their economic assumption with them; loading an old world preserves the exact GDP curve it was generated under.

**Commit:** `v1.3.85` (bundled with FR-032)

---

## Investigations — No Bug

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

### QA-029

**Title:** Anarchy government type disproportionately dominant  
**Area:** Engine — Government Generation  
**Priority:** 🔴 High  
**Status:** 📋 Investigated — Table Design, Not a Generator Bug; Awaiting Settings Framework  
**Datetime:** 260415-120000  
**Reported by:** Neil Lucock (emails 2026-04-14 and 2026-04-15)

**Problem Statement**  
Neil has generated many random worlds across multiple sessions and reports seeing Anarchy as the government type on almost every result. "Yet another world with Anarchy? I haven't seen anything else."

QA-INV-001 previously investigated E/X port dominance and found it to be correct design behaviour. Government type distribution has not been separately verified.

**Expected Behaviour**  
Government type distribution should roughly follow the CE table probabilities. Anarchy (Government 0) should appear, but no more than its table frequency warrants — not as the near-universal result.

**Investigation Results**

*File:* `src/lib/worldData.ts` — `getPowerStructure()`  
*Roll mechanism:* Unmodified 2D6 (values 2–12).

```typescript
export function getPowerStructure(roll: number): PowerStructure {
  if (roll <= 7) return 'Anarchy';
  if (roll <= 9) return 'Confederation';
  if (roll <= 11) return 'Federation';
  return 'Unitary State';
}
```

**Probability Distribution (2D6 → Power Structure)**

| Power Structure | 2D6 Range | Combinations | Probability |
|-----------------|-----------|--------------|-------------|
| **Anarchy** | 2 – 7 | 21 / 36 | **58.33%** |
| **Confederation** | 8 – 9 | 9 / 36 | **25.00%** |
| **Federation** | 10 – 11 | 5 / 36 | **13.89%** |
| **Unitary State** | 12 | 1 / 36 | **2.78%** |

**Batch Simulation (1,000 worlds)** — confirms theoretical distribution:
- Anarchy: ~570–590 occurrences (57–59%)
- Confederation: ~240–270 occurrences (24–27%)
- Federation: ~120–140 occurrences (12–14%)
- Unitary State: ~25–40 occurrences (2.5–4%)

**QA-026 Depression Penalty Feedback Check:** **NEGATIVE.**
- `calculateDepressionPenalty()` only produces `effectiveTL`.
- `effectiveTL` is consumed exclusively by `calculateStarport()` and `determineTravelZone()`.
- The `powerRoll` in `generateInhabitants()` (`src/lib/generator.ts`) is a fresh, unmodified 2D6 with **zero interaction** with population, TL, wealth, development, or depression penalty.

**Root Cause — Table Design, Not Code**  
The `getPowerStructure` lookup table itself maps the lower 58% of the 2D6 bell curve to Anarchy. There is no generator bug, no hidden modifier, and no QA-026 feedback loop. Neil's experience of seeing "nothing but Anarchy" is the statistically expected outcome of this particular table design.

**The Real Culprit: Depression Penalty is Overwhelming**

The same 1,000-world batch shows that **QA-026 is the dominant force** shaping the overall "frontier world" feel:

| Metric | Value |
|--------|------|
| Worlds with `effectiveTL < foundingTL` | **909 / 1,000 (90.9%)** |
| UnderDeveloped | **610 (61.0%)** |
| Average Wealth | **664 (66.4%)** |
| Starport Class X | **840 (84.0%)** |
| Starport Class A+B+C combined | **54 (5.4%)** |

The depression penalty fires on **91% of all generated worlds**, crushing their `effectiveTL` and therefore their starport class into X/E. Star class bias amplifies this: 67.8% of generated stars are M-class, which skews toward lower habitability and lower population.

**Data-Context: Mneme Bias vs. User Preference**

> *"Governance, Source of Power, and Development Statistics can be edited by users. There is the Mneme Settings (can be saved/loaded, imported, exported and saved as). The Mneme Bias is from a developing worlder."*

This confirms that the current tables encode a **specific setting bias** — gritty, frontier, developing-world dominated. That is a valid creative choice, but it should be **explicit and configurable**, not hardcoded.

**Recommended Action — Build Configuration Settings Framework**

Rather than hardcoding one table, we should expose **Mneme Defaults** vs. **CE Defaults** (and eventually user-custom presets) for all social/economic tables.

**Proposed Settings Tiers:**

| Table | Mneme Default (current) | CE Default (book-like) | User Custom |
|-------|------------------------|------------------------|-------------|
| `getPowerStructure()` | Anarchy ≤7 (58%) | Wider spread, e.g. ≤5 (28%) | Editable breakpoints |
| `getDevelopment()` | UnderDeveloped ≤7 (58%) | Adjusted to taste | Editable breakpoints |
| `getSourceOfPower()` | Current 2D6 | Current 2D6 | Editable breakpoints |
| `calculateDepressionPenalty()` | Aggressive (pop <1M = −1, <100k = −2, <10k = −3) | Milder or off | Toggle/scale |
| `getBodyCount()` | Half Dice for M-class | Standard CE planet generation | Toggle |

**Implementation Path:**
1. Refactor all table functions in `worldData.ts` to accept an optional **settings/ruleset** object.
2. Create `src/lib/rulePresets.ts` with `MNEME_DEFAULT` and `CE_DEFAULT` presets.
3. Extend the **Mneme Settings** UI to allow switching presets and exporting/importing custom JSON.
4. Default for existing users remains `MNEME_DEFAULT` (backward compatibility).

**Immediate workaround (no code change):**  
Users who want less Anarchy can edit the `powerStructure` field post-generation, which is already supported.

**Long-term fix:**  
Ship a **CE Default** preset that flattens the government/development curves and optionally disables the depression penalty, producing more "classic Traveller" distributions.

---

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
| 1.24 | 2026-04-15 | **Major reorganization:** QA.md restructured by status (Open → Root Cause → Fixed → Proposed → Investigated). QA-032 closed (stale data). QA-033 fixed (2D map extracted to standalone repo). QA-034 fixed (depression timing removed). QA-035/036 fixed (main world map + body count). QA-031 fixed (star colour names). QA-029 fully investigated (58% Anarchy by table design). Root Cause Analysis section added for economy engine cluster (QA-027/028/030). |
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

---

---

### QA-049

**Title:** Economic Model Setting: Stable vs Compounding  
**Area:** Engine — Economy / Population  
**Priority:** 🔴 High  
**Status:** 📋 Queued  
**Datetime:** 2026-04-16  
**Affects:** Population, Starport PSS, Weekly Port Activity, GDP/year display  
**Files:** `src/lib/generator.ts`, `src/lib/worldData.ts`, `src/components/Settings.tsx`

**Description:**  
Add a global setting that lets the user choose between two economic models. This setting changes how TL affects population and port throughput. All other generation is unchanged.

**Background:**  
Cepheus Engine and classic Traveller use a **stable economic model**. Wages and prices do not change across Tech Levels. A TL 9 pilot earns the same as a TL 10 pilot. Ships cost the same at TL 12 as at TL 14. The economy is treated as essentially static — Technology Level measures capability (particularly jump distance) but not economic growth. This keeps credit values consistent across a campaign and makes ship costs and salaries predictable regardless of the setting's era.

Mneme uses a **compounding economic model**. Productivity grows with automation. A single operator managing a robot fleet at TL 12 produces 100× the output of a TL 8 worker. Populations are much larger at high TL because lower support ratios mean the same resources sustain far more people. Port throughput scales with the size of the system economy, not just the starport's physical class. Ship costs and wages rise with TL, but so does the economic capacity to pay for them.

Both are valid design choices for different campaign styles. The setting toggle makes both accessible without hardcoding either assumption.

**Implementation:**  
Add a setting to the app (in Settings or as a generator option):

```typescript
type EconomicModel = 'stable' | 'compounding';
```

**Stable model (CE/Traveller compatible):**
- TLmod for population = `TL − 7` (current linear formula, range 0–9)
- Port weekly activity = `10^PVS` fixed (old starport output table)
- GDP display = not shown (not meaningful in stable model)
- Credit values consistent across all TLs

**Compounding model (Mneme default):**
- TLmod for population = productivity-derived lookup table
  `{7:5, 8:6, 9:6, 10:7, 11:8, 12:9, 13:10, 14:11, 15:12, 16:13}`
- Port weekly activity = `Annual Trade ÷ 364 × 3D6`
  where Annual Trade = GDP × TradeFraction × WealthMultiplier
- GDP/year displayed on world sheet
- Credit values scale with TL (ship prices differ by era)

**UI:** A toggle in Settings labelled:

```
Economic Model
○ Stable       Wages and prices are consistent across all Tech Levels.
               Compatible with Cepheus Engine and classic Traveller rules.
● Compounding  Productivity and populations grow with automation.
               Mneme default. Port activity scales with world GDP.
```

Default: **Compounding** (Mneme native).

Persist to localStorage key: `mneme_economic_model`.

**Acceptance criteria:**
1. Toggle appears in Settings, persists across sessions.
2. Switching to Stable immediately changes population formula to TL−7.
3. Switching to Compounding immediately restores productivity table.
4. The world sheet labels the active model so players know which assumptions apply to printed handouts.
5. Batch export JSON includes `economicModel: 'stable' | 'compounding'` field in the metadata block so exported data is self-documenting.

**Reference:**  
See `population_recommendation.md` and `starport_recommendation_v1.1.md` in project outputs for full formula derivations and comparison tables. See `population_comparison.csv` and `starport_comparison.csv` for the statistical dataset comparing both models across 1,760–2,304 test cases.

---

---

### QA-050

**Title:** Recent Systems should show Economic Assumptions used  
**Area:** UI — Recent Systems  
**Priority:** 🟠 Medium  
**Status:** 📋 Queued  
**Datetime:** 2026-04-16  

**Problem Statement**  
The Recent Systems list on the Generator page currently shows the world code or system name, but it does not display which **Economic Assumptions** (preset) were used when the world was generated. Because Mneme and CE/Traveller worlds are intentionally incompatible (different GDP curves, ship scarcity, and income scales), users need this context at a glance to avoid mixing incompatible settings in the same campaign.

**Expected Behaviour**  
Each entry in the Recent Systems list should visually indicate the economic preset that was active when the system was generated. This could be:
- A small badge or tag showing the preset name (e.g. "Mneme", "CE / Traveller", "Stagnant", or "Custom")
- A tooltip on hover with full preset details (TL 9 SOC 7 income, growth curve, boat years)
- Colour-coding or an icon for quick scanning

**Files**  
- `src/components/GeneratorDashboard.tsx` — Recent Systems list UI
- `src/types/index.ts` — `StarSystem` already snapshots `economicPreset`

**Acceptance Criteria**
1. Every Recent Systems entry shows the name of the `economicPreset` used at generation time.
2. Legacy systems without an `economicPreset` display "Legacy" or "Mneme (default)".
3. No source-code changes to generation logic — this is a pure UI enhancement.


---

---

### QA-051

**Title:** Economic Assumptions Customizations — Roll Profile Presets for Inhabitants Tables  
**Area:** Engine — Inhabitants  
**Priority:** 🟠 Medium  
**Status:** ✅ Fixed  
**Datetime:** 2026-04-16 | Fixed: 2026-04-16  

**Description:**  
Defines preset roll profiles for **Wealth**, **Development**, **Power Structure**, and **Source of Power** tables to align generated inhabitants with three distinct campaign assumptions. The profiles are implemented as weighted-distribution presets bundled with economic presets.

**Background:**  
The Mneme default tables are calibrated to realistic socio-economic diversity — underdeveloped and poor worlds are common, power is often fragmented or authoritarian. Classic Traveller / CE players typically come from high-income nations and carry different baseline assumptions: poverty is the exception, governments are stable, and power leans democratic. A third **Stagnant / Uniform** profile represents a plateaued, homogenised galaxy with no dramatic extremes.

**Fix Applied (v1.3.106 / v1.3.109)**
1. `src/lib/economicPresets.ts`: added `MNEME_*_WEIGHTS`, `CE_*_WEIGHTS`, and `STAGNANT_*_WEIGHTS` constants for all four inhabitant tables.
2. `src/lib/worldData.ts`: extended `getWealth()` signature to accept optional `TableWeights` (matching `getPowerStructure`, `getDevelopment`, and `getSourceOfPower`).
3. `src/lib/generator.ts`: wired `wealthWeights`, `developmentWeights`, `powerWeights`, and `govWeights` into `generateInhabitants()`, with cascading defaults from the active preset.
4. `src/components/Settings.tsx`: added a **Wealth** selector to the Table Weights panel (now a 4-column layout).
5. `v1.3.109`: recalibrated `STAGNANT_GOV_WEIGHTS` to `[3, 3, 3, 4, 13, 12, 13, 12, 17, 16, 5]` so the Stagnant Government distribution matches the spec (~13% Aristocracy, ~25% Ideocracy, ~25% Kratocracy, ~33% Democracy, ~5% Meritocracy).

**Presets:**

| Preset | Wealth | Development | Power Structure | Source of Power |
|--------|--------|-------------|-----------------|-----------------|
| **Mneme Default** | 70% Average, 20% Better-off, 5% Prosperous, 5% Affluent | 53% UnderDeveloped, 13% Developing, 13% Mature, 13% Developed, 5% Well Developed, 5% Very Developed | 53% Anarchy, 20% Confederation, 20% Federation, 8% Unitary | 38% Aristocracy, 20% Ideocracy, 20% Kratocracy, 20% Democracy, 3% Meritocracy |
| **CE / Traveller** | 20% Average, 35% Better-off, 25% Prosperous, 20% Affluent | 8% UnderDeveloped, 10% Developing, 25% Mature, 25% Developed, 23% Well Developed, 10% Very Developed | 10% Anarchy, 20% Confederation, 45% Federation, 25% Unitary | 8% Aristocracy, 13% Ideocracy, 18% Kratocracy, 50% Democracy, 13% Meritocracy |
| **Stagnant / Uniform** | 30% Average, 50% Better-off, 18% Prosperous, 3% Affluent | 3% UnderDeveloped, 15% Developing, 40% Mature, 35% Developed, 8% Well Developed, 0% Very Developed | 5% Anarchy, 40% Confederation, 45% Federation, 10% Unitary | 13% Aristocracy, 25% Ideocracy, 25% Kratocracy, 33% Democracy, 5% Meritocracy |

**Implementation Notes:**  
- Weights are **relative** and converted to percentages per table.
- Modifiers (e.g. resource bonuses on Wealth) apply on top of the weighted selection.
- Roll profiles are bundled into `TLProductivityPreset` (`wealthWeights`, `developmentWeights`, `powerWeights`, `govWeights`) and passed to the respective table lookup functions.
- Custom presets can override individual table weights in Settings.

**Files:**  
- `src/lib/economicPresets.ts` — weight constants and preset bundling
- `src/lib/worldData.ts` — weighted table lookup functions
- `src/lib/generator.ts` — wiring weights into inhabitants generation
- `src/components/Settings.tsx` — Table Weights UI panel

**Reference:**  
See `260416 Economic Assumptions Customizations Custom tables.md` for full derivation, comparison matrices, and design intent.


---

---

### QA-052

**Title:** Ships in the Area should use Credit values based on Economic Assumptions, not Years-to-own  
**Area:** Engine — Ships  
**Priority:** 🟠 Medium  
**Status:** 📋 Queued  
**Datetime:** 2026-04-16  

**Problem Statement**  
Currently, the Ships in the Area generator uses `visiting_cost_cr` (monthly operating cost + supplies) as the threshold for adding ships to a pool, but the *selection* logic and scarcity multiplier are anchored to **Boat Years** (years-to-own). This creates a mismatch: a ship's affordability in human terms (income-years) is being used as its gatekeeping cost in the generation budget, rather than its raw Credit price.

**Expected Behaviour**  
The ship generation budget and selection logic should operate in **Credits** as the native unit, scaled by the economic assumptions of the world:
- Port budget = `weeklyTradeValue × (1D6 × 0.1)` in Credits
- Ship costs = raw `visiting_cost_cr` or `total_cost_cr` in Credits
- Economic scarcity should deflate the budget based on the **Credit ratio** between Mneme and the active preset, not the Boat Years ratio

This decouples the *availability* of ships from their *affordability in income-years*.

**Impact Assessment**
| Aspect | Current (Boat Years) | Proposed (Credits) |
|--------|----------------------|--------------------|
| Budget basis | weeklyTradeValue (already Cr) | unchanged |
| Scarcity logic | `boatYears / mnemeReference` | Credit-scale multiplier |
| Ship gatekeeping | `visiting_cost_cr` vs deflated budget | unchanged in structure |
| UI display | Income-years per ship | Add raw Cr cost alongside income-years |

**Risk:** Low. The change is confined to `src/lib/shipsInArea.ts` and display formatting in `SystemViewer.tsx`. No type changes required.

**Files:**  
- `src/lib/shipsInArea.ts` — budget/scarcity calculation
- `src/components/SystemViewer.tsx` — ship cost display

---

---

### QA-053

**Title:** Recent Items should display what Economic Assumptions were used  
**Area:** UI — Recent Systems  
**Priority:** 🟡 Low  
**Status:** 📋 Queued  
**Datetime:** 2026-04-16  

**Problem Statement**  
When a user generates multiple worlds, the Recent Systems / Recent Items list does not show which Economic Assumptions preset was active during generation. Because Mneme and CE/Traveller worlds are intentionally incompatible (different GDP curves, ship scarcity, and income scales), users need this context immediately to avoid mixing incompatible models in the same campaign.

**Expected Behaviour**  
Each entry in the Recent Systems list should display the economic preset name that was snapshotted at generation time. Possible implementations:
- A small badge or chip showing the preset name (e.g. "Mneme", "CE / Traveller", "Stagnant", "Custom")
- A subtitle or tooltip with the preset details
- Colour-coding for quick visual scanning

**Impact Assessment**
| Aspect | Change |
|--------|--------|
| Data model | None — `StarSystem.economicPreset` already exists |
| UI scope | `src/components/GeneratorDashboard.tsx` Recent Systems list only |
| Backward compat | Legacy systems without `economicPreset` show "Legacy" or default label |

**Risk:** Very low. Pure UI enhancement with no generation logic changes.

**Files:**  
- `src/components/GeneratorDashboard.tsx` — Recent Systems rendering


---

---

### QA-054

**Title:** Terraforming Terraton Structures  
**Area:** Lore — Megastructures  
**Priority:** 🟢 Lore  
**Status:** 📋 Queued  
**Datetime:** 2026-04-16  

**Description:**  
These structures are necessary in the ever-compounding growth of technology and the self-directed growth of humans. The **Great Serpents**, **Great Trees**, **Celestials**, and **Jump Gates** are all necessary for trade and growth. Just as the Space Race, Earth's Recovery, and the Transition to Green Energy propelled civilisation forward, without such projects of science and engineering humans regress to infighting, capital hoarding, and enslaving each other. These infrastructures compound growth by harnessing a star's massive resources to propel humans to more stars.

**Component Megastructures (Documented)**  
- **QA-038 — Great Serpents** (formerly Bakunawa Coil): MTL 12 antimatter rings built around gas-giant radiation belts.
- **QA-039 — Celestials**: MTL 13 self-directed solar swarms that harvest atmospheres and concentrate light for terraforming.
- **QA-040 — Great Trees**: MTL 13 fixed space-elevator megastructures capable of interstellar travel by MTL 16.
- **QA-045 — Jovian Hammers and Forges**: MTL 12 gas-giant skimming industry that extracts raw bulk materials for orbital infrastructure.

**Design Note:**  
The megastructure cluster forms the technological backbone of the Mneme setting. In a high-compound economy, these projects are not optional luxuries — they are the minimum infrastructure required to prevent stagnation and maintain upward trajectory.


---

---

### QA-055

**Title:** Table Weights UI: Replace dropdowns with per-outcome editable weight rows  
**Area:** UI — Settings → Economic Assumptions → Table Weights  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Datetime:** 2026-04-16 | Fixed: 2026-04-16  

**Problem Statement**  
The Table Weights panel in `Settings.tsx` rendered four coarse dropdown selects ("Natural 2D6", "Flat", etc.) instead of the specified per-outcome editor. Users could not see or edit individual outcome probabilities, and the UI provided no live feedback on how weights translated to percentages.

**Fix Applied**
1. `src/components/Settings.tsx`:
   - Replaced the four `<select>` dropdowns with `WeightCard` components.
   - Each card shows one row per outcome with: label, descriptor, live percentage, numeric input, and a proportional fill bar.
   - Outcome configs define the mapping from dice indices (rolls 2–12) to logical outcomes:
     - **Wealth:** 4 outcomes (Average/Better-off/Prosperous/Affluent)
     - **Development:** 6 outcomes
     - **Power Structure:** 4 outcomes
     - **Source of Power:** 5 outcomes
   - Helper functions `diceToOutcomeWeights()` and `outcomeWeightsToDice()` convert between the 11-index dice array and the outcome-level weights.
   - Editing any weight immediately recalculates all percentages and fill bars in that card.
   - Editing any weight automatically switches the Preset label to `Custom`.
   - Added a `useEffect` that syncs table-weight states to the active named preset (Mneme / CE / Stagnant) when the preset changes.

2. `src/components/Glossary.tsx`:
   - Updated megastructure entries (Great Serpents, Celestials, Great Trees, Jovian Hammers and Forges) to match the latest lore from QA-038/039/040/045.

**Visual Result**
```
┌─────────────────────────────────────────────────────┐
│ Wealth                                     ∑ 40     │
├─────────────────────────────────────────────────────┤
│ Average     SOC +0  ████████████████░░░░  [ 28 ] 70%│
│ Better-off  SOC +1  ████░░░░░░░░░░░░░░░░  [  8 ] 20%│
│ Prosperous  SOC +2  █░░░░░░░░░░░░░░░░░░░  [  2 ]  5%│
│ Affluent    SOC +3  █░░░░░░░░░░░░░░░░░░░  [  2 ]  5%│
└─────────────────────────────────────────────────────┘
```

**Files**
- `src/components/Settings.tsx` — new WeightCard UI, outcome configs, conversion helpers
- `src/components/Glossary.tsx` — lore updates for megastructures

**Reference**
See `260416-04 Economic Assumptions Customizations Custom tables.md` for the original spec and comparison matrices.


---

---

### QA-056

**Title:** GDP/day should use average SOC (Development + Wealth) instead of hardcoded SOC 7  
**Area:** Engine — Economy  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Datetime:** 2026-04-16 | Fixed: 2026-04-17  

**Problem Statement**  
`getGdpPerDayFromPreset(tl, preset)` always anchors to **SOC 7 income** when computing per-capita GDP. Development and Wealth do affect `annualTrade` via `tradeFraction[dev]` and `wealthMultiplier[wealth]`, but those are rough proxies — they don't actually shift the **per-capita income baseline**, which is what Development and Wealth are supposed to represent mechanically.

Per the rulebook:
- **Development** sets the **base average SOC** (UnderDeveloped=3–4, Developing=5, Mature=6, Developed=8, Well Developed=9, Very Developed=10)
- **Wealth** adds a **SOC bonus** on top (+0 to +3)

So the GDP/day used in `annualTrade` should be based on `avgSoc = developmentSoc + wealthBonus`, not hardcoded to SOC 7.

**Root Cause**  
- `getGdpPerDayFromPreset(tl, preset)` calls `getSoc7MonthlyIncome(tl, preset)` — it always uses SOC 7 as the anchor.
- The SOC & Income Table shows income scales with SOC level. Development determines the population's average SOC; Wealth raises it further.
- Neither Development nor Wealth is currently wired into the GDP/day calculation.

**Proposed Fix**

**Step 1 — Add SOC mapping tables**

```typescript
export const DEVELOPMENT_AVG_SOC: Record<DevelopmentLevel, number> = {
  'UnderDeveloped': 3.5,
  'Developing':     5,
  'Mature':         6,
  'Developed':      8,
  'Well Developed': 9,
  'Very Developed': 10,
};

export const WEALTH_SOC_BONUS: Record<WealthLevel, number> = {
  'Average':    0,
  'Better-off': 1,
  'Prosperous': 2,
  'Affluent':   3,
};
```

**Step 2 — Generalize `getSocMonthlyIncome` to accept any SOC**

```typescript
export const SOC_MONTHLY_INCOME_MC: Record<number, number> = {
  0:  0,      1:  0.05,  2:  0.10,  3:  0.20,
  4:  0.50,   5:  1.00,  6:  2.00,  7:  5.00,
  8:  10.00,  9:  20.00, 10: 50.00, 11: 100.00,
  12: 200.00,
};

export function getSocIncomeRatio(soc: number): number {
  return (SOC_MONTHLY_INCOME_MC[soc] ?? 0) / SOC_MONTHLY_INCOME_MC[7];
}

export function getSocMonthlyIncome(soc: number, tl: number, preset: TLProductivityPreset): number {
  return getSoc7MonthlyIncome(tl, preset) * getSocIncomeRatio(soc);
}
```

**Step 3 — Add `getGdpPerDayForWorld`**

```typescript
export function getGdpPerDayForWorld(
  tl: number,
  development: DevelopmentLevel,
  wealth: WealthLevel,
  preset: TLProductivityPreset,
): number {
  const baseSoc = DEVELOPMENT_AVG_SOC[development];
  const socBonus = WEALTH_SOC_BONUS[wealth];
  const avgSoc = Math.min(12, baseSoc + socBonus);
  const monthly = getSocMonthlyIncome(avgSoc, tl, preset);
  return (monthly * 12) / DAYS_PER_YEAR;
}
```

**Step 4 — Replace the call in `generator.ts`**

```typescript
// Before
const gdpPerDay = getGdpPerDayFromPreset(techLevel, opts.tlProductivityPreset!);

// After
const gdpPerDay = getGdpPerDayForWorld(techLevel, devResult.level, wealth, opts.tlProductivityPreset!);
```

**Trade Fraction Question**

With this fix, Development and Wealth are embedded in GDP/day. Two options:

- **Option A (recommended):** Remove `wealthMultiplier[wealth]` from `annualTrade` entirely. Wealth is now fully expressed via SOC income. `tradeFraction[dev]` remains as the external-trade-openness modifier.
- **Option B:** Keep `wealthMultiplier` as an additional trade-volume amplifier. This means Affluent worlds get a double boost; acceptable only if intentionally documented.

**Files**
- `src/lib/economicPresets.ts` — new SOC tables and helpers
- `src/lib/worldData.ts` — update `annualTrade` calculation
- `src/lib/generator.ts` — switch to `getGdpPerDayForWorld`


---

---

### QA-057

**Title:** Impact Analysis: Annual Trade after GDP fix — resolve wealthMultiplier redundancy  
**Area:** Engine — Economy  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Datetime:** 2026-04-16 | Fixed: 2026-04-17  

**Problem Statement**  
After implementing QA-056 (GDP/day derived from Development + Wealth), `annualTrade` still multiplies by both `tradeFraction[dev]` and `wealthMult[wealth]`. Since Development and Wealth are now already embedded in `gdpPerDay` via average SOC, this creates double-counting.

**The redundancy**

| Factor | Old gdpPerDay | New gdpPerDay | tradeFraction | wealthMult |
|--------|--------------|--------------|---------------|------------|
| TL | ✅ | ✅ | — | — |
| Development | ❌ | ✅ | ✅ | — |
| Wealth | ❌ | ✅ | — | ✅ |

Development now appears **twice** (in `gdpPerDay` and `tradeFraction`). Wealth now appears **twice** (in `gdpPerDay` and `wealthMult`).

**Quantified impact** (TL 9, Mneme preset, same population):

| Development | Old Combined | New Combined (both redundancies) |
|---|---|---|
| UnderDeveloped (SOC 3.5) | 74 | 3 |
| Developed (SOC 8) | 297 | 2,980 |
| Very Developed (SOC 10) | 446 | 22,290 |

Ratio UnderDeveloped → Very Developed goes from **6×** to **~7,430×**. Adding Wealth double-count (Average → Affluent = 20×) pushes total swing to ~148,600× — about **5 PSS points**, enough to drive X→A purely from development and wealth regardless of population.

**Recommended Resolution**
1. **Drop `wealthMult` entirely** from `annualTrade`. Wealth is now fully expressed through avg SOC → income.
2. **Keep `tradeFraction[dev]`** but reframe it as "economic openness" rather than productivity proxy.
3. **Optionally compress `tradeFraction`** range (e.g. 8–22% instead of 5–30%) to soften development's double-count if testing shows starport distribution collapses to extremes.

**Files**
- `src/lib/worldData.ts` — `annualTrade` formula and multiplier tables
- `src/lib/economicPresets.ts` — SOC-to-income helpers (QA-056 dependency)
- `src/lib/generator.ts` — call site wiring

---

---

### QA-058

**Title:** Ships in the Area rework — remove Boat Years scarcity, X-port toggle, Credit display  
**Area:** Engine — Ships  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Datetime:** 2026-04-16 | Fixed: 2026-04-17  

**Problem Statement**  
The Ships in the Area system needs three targeted fixes: (1) the Boat Years scarcity multiplier is redundant after the GDP fix, (2) X-class ports need a user-configurable override, and (3) the display should show raw Credit values instead of income-years.

---

#### Fix 1 — Remove Boat Years scarcity multiplier

**File:** `src/lib/shipsInArea.ts`

The `scarcityMultiplier` based on `boatYears / mnemeReference` deflates the budget artificially. After QA-056, CE worlds already produce lower `weeklyTradeValue` because `gdpPerDay` is lower. The budget is naturally smaller.

**Action:** Remove these lines and use `const budget = rawBudget;`:
```typescript
const boatYears = preset?.boatYears ?? (preset?.baseIncome ? getBoatYears(preset.baseIncome) : MNEME_PRESET.boatYears ?? 10);
const mnemeReference = MNEME_PRESET.boatYears ?? 10;
const scarcityMultiplier = Math.max(1, boatYears / mnemeReference);
const budget = rawBudget / scarcityMultiplier;
```

---

#### Fix 2 — X-class hard gate → generation option

**Files:** `src/types/index.ts`, `src/components/SystemViewer.tsx`, `src/components/GeneratorDashboard.tsx`

**Action:**
1. Add `allowShipsAtXPort?: boolean` to `GeneratorOptions` (default `false`).
2. In `SystemViewer.tsx`, change the X-port skip from unconditional to:
   ```typescript
   if (starportClass === 'X' && !generatorOptions.allowShipsAtXPort) { /* skip */ }
   ```
3. In `GeneratorDashboard.tsx`, add a checkbox:
   ```
   ☐ Allow ships at X-class ports (e.g. uncharted worlds with informal traffic)
   ```
   Default unchecked.

The existing E-class gate (10% budget cap, small craft only, max 5 ships) is **unchanged**.

---

#### Fix 3 — Display Credit value and monthly operating cost

**Files:** `src/lib/shipsInArea.ts`, `src/components/SystemViewer.tsx`

**Action:**
1. Ensure each ship in the pool exposes `visiting_cost_cr` and `monthly_operating_cost_cr`. If `monthly_operating_cost_cr` is missing, derive it as `Math.round(visiting_cost_cr * 0.001)` (0.1% of value per month, CE standard).
2. Update the Ships in the Area table in `SystemViewer.tsx` to show:
   - **Credit Value** — `formatCredits(ship.visiting_cost_cr)`
   - **Monthly Op. Cost** — `formatCredits(ship.monthly_operating_cost_cr)`
3. Remove any "years" / "income-years" display from this table.

**Verification checklist**
- [ ] CE TL 9 world shows fewer ships than Mneme TL 9 world purely from lower trade value
- [ ] X-class port with toggle off → zero ships
- [ ] X-class port with toggle on → ships appear
- [ ] E-class port caps still apply regardless of toggle
- [ ] Table shows Credit Value and Monthly Op. Cost, no years
- [ ] `tsc -b` passes with 0 errors

**Files**
- `src/lib/shipsInArea.ts` — budget calculation, ship pool fields
- `src/components/SystemViewer.tsx` — display table, X-port gate
- `src/components/GeneratorDashboard.tsx` — X-port toggle
- `src/types/index.ts` — `GeneratorOptions` extension


---

---

### QA-061

**Title:** Population and PSS Calibration — Productivity Ratio Replaces `TL_POP_MOD`  
**Area:** Engine — Population / Starport / Economy  
**Priority:** 🔴 High  
**Status:** ✅ Fixed  
**Datetime:** 2026-04-17  
**Reported by:** Justin (design review)

---

**Problem Statement**

The population system suffered from a fundamental disconnect between economic presets and population scaling:

1. **`TL_POP_MOD` was a hardcoded Mneme table** (5–13 exponent bonus) that was applied **regardless of economic preset**. CE/Traveller worlds got the same artificial trillion-person boosts as Mneme worlds, making CE incompatible with its own stagnant-economy assumptions.

2. **`TL_POP_MOD` was far more aggressive than actual income growth.** At TL 16 it added `+13` to the population exponent (`10^13` = 10 trillion multiplier), while Mneme's actual SOC-7 income ratio was only ~389,000×. Population scaling was arbitrarily 25 million times stronger than the productivity curve it was supposed to represent.

3. **Removing `TL_POP_MOD` without compensation collapsed populations.** When the table was deleted, the new productivity-based multiplier was linear (1× to 389,232×) instead of exponential (10^5 to 10^13). CE worlds with habitability 4 dropped from ~7M people to ~36,000 people, causing almost every CE world to receive an **X-class starport**.

4. **`GDP_PER_DAY_BY_TL` was dead code** — a hardcoded Mneme table left over from pre-preset days. It had been bypassed by `getGdpPerDayForWorld()` but still sat in `worldData.ts` as a false source of truth.

5. **PSS thresholds were too steep.** `pssToClass` required PSS 6 for D, 8 for B, 10 for A. With populations collapsed, even reasonably productive worlds couldn't climb out of X/E.

---

**Root Cause Analysis**

| Component | Old Behavior | Intended Behavior |
|-----------|-------------|-------------------|
| `TL_POP_MOD` | Hardcoded exponent bonus 5–13, all presets | Should scale with **actual preset productivity** |
| Population formula | `10^(envHab + TL_POP_MOD) × 2d6` | Should be `10^(envHab) × productivityRatio × roll` |
| CE preset productivity | Flat 1× (no TL growth) | Population should be **flat across TLs** |
| Mneme preset productivity | Compounding 1× to ~389k× | Population should **match income curve exactly** |
| PSS thresholds | PSS <4→X, ≤5→E, ≤7→D, ≤9→C, ≤11→B | Too steep for new population scale |
| `GDP_PER_DAY_BY_TL` | Legacy dead table in `worldData.ts` | Should not exist; formula-driven only |

---

**Fixes Applied**

#### Fix 1 — Deleted `TL_POP_MOD` and `GDP_PER_DAY_BY_TL`

**Files:** `src/lib/worldData.ts`

- Removed `TL_POP_MOD` table and `getPopTLMod()` helper
- Removed `GDP_PER_DAY_BY_TL` table and `getGdpPerDay()` helper
- Made `gdpPerDayOverride` **required** in `calculateStarport()` to prevent any fallback to dead code
- Removed stale "× Wealth Multiplier" reference from the `SystemViewer.tsx` tooltip

#### Fix 2 — Population now scales by productivity ratio

**File:** `src/lib/generator.ts`

```typescript
const productivityMultiplier = getSoc7MonthlyIncome(techLevel, preset) 
                             / getSoc7MonthlyIncome(preset.baseTL, preset);

if (envHab <= 0) {
  // Hostile world: habitats scaled by productivity
  const habitatResult = getHabitatSize(roll2D6().value);
  population = Math.max(10, Math.floor(habitatResult.population * productivityMultiplier));
} else {
  // Natural world: max capacity from envHab + productivity + exploding 2d6
  const carryingCapacityRoll = rollExploding(2, 6).value;
  const maxPopulation = Math.pow(10, envHab + 1) * productivityMultiplier * carryingCapacityRoll;
  const popRoll = roll3D6().value;
  population = Math.max(10, Math.floor(popRoll * maxPopulation * 0.05));
}
```

**CE/Traveller result:** `productivityMultiplier = 1.0` at every TL. Population depends purely on habitability.

**Mneme result:** `productivityMultiplier` follows the exact `MNEME_RATIOS` income curve.

#### Fix 3 — +1 baseline exponent

Added `+1` to `envHab` in the natural-world formula. This restores CE populations to playable Traveller levels:

| envHab | Old (no +1) | New (+1) |
|--------|-------------|----------|
| 2 | ~360 | ~3,600 |
| 4 | ~36,000 | ~360,000 |
| 6 | ~3.6M | ~36M |
| 8 | ~360M | ~3.6B |

#### Fix 4 — More forgiving PSS thresholds

**File:** `src/lib/worldData.ts`

```typescript
function pssToClass(pss: number): StarportClass {
  if (pss < 3)  return 'X';
  if (pss <= 4) return 'E';
  if (pss <= 5) return 'D';
  if (pss <= 6) return 'C';
  if (pss <= 7) return 'B';
  return 'A';
}
```

Each +1 PSS now advances exactly one starport class (after E). A world needs ~10× more trade to climb one letter grade.

#### Fix 5 — Goal mode now returns closest match

**File:** `src/App.tsx`

Instead of returning the first match or failing at 2,000 iterations, the goal-loop now:
- Generates up to 2,000 candidates
- Scores each by distance from goals (starport rank penalty, population log-ratio, habitability gap)
- Sorts and returns the **best match**
- Reports "Best match found after 2,000 generations (closest to goals)" if no exact match exists

#### Fix 6 — `allowShipsAtXPort` defaults to `true`

**Files:** `src/lib/optionsStorage.ts`, `src/components/GeneratorDashboard.tsx`

- `DEFAULT_GENERATOR_OPTIONS` now sets `allowShipsAtXPort: true`
- Dashboard `useState` default changed from `|| false` to `?? true`
- Fixed missing dependency in `useEffect` so the toggle now auto-persists to `localStorage`

#### Fix 7 — Trade fraction now has variance by development level

**File:** `src/lib/worldData.ts`

The old `getTradeFraction()` returned a fixed constant for every world of the same development level (e.g. every `Developed` world = exactly 20%). This made starports mechanically predictable and removed meaningful differentiation.

The new implementation adds controlled randomness:

| Development | Formula | Mean | Range |
|---|---|---|---|
| UnderDeveloped | **5% (fixed)** | 5.0% | 5% |
| Developing | **6.5% + 1D6 × 1%** | 10.0% | 7.5%–12.5% |
| Mature | **10% + 2D6 × 0.7%** | 15.0% | 12%–18.4% |
| Developed | **15% + 2D6 × 0.7%** | 20.0% | 17%–23.4% |
| Well Developed | **20% + 2D6 × 0.7%** | 25.0% | 22%–28.4% |
| Very Developed | **25% + 2D6 × 0.7%** | 30.0% | 27%–33.4% |

- UnderDeveloped stays flat at 5% (no surplus to vary)
- Developing gets wider 1D6 variance as industrialisation is unpredictable
- Mature+ gets narrower 2D6 bands but still enough to shift PSS by 1–2 points on large-population worlds

---

**Expected Results After Fix**

| Scenario | Population | PSS | Class |
|---|---|---|---|
| CE TL 9, envHab 4, Mature/Average | ~360K | 2 | **E** |
| CE TL 9, envHab 6, Mature/Average | ~36M | 4 | **E** |
| CE TL 12, envHab 6, Developed/Prosperous | ~36M | 5 | **D** |
| Mneme TL 11, envHab 4, Mature/Average | ~7.2M | 4 | **E** |
| Mneme TL 11, envHab 6, Developed/Affluent | ~720M | 7 | **B** |
| Mneme TL 16, envHab 6, Very Developed/Affluent | ~14.4T | 11 | **A** |

---

**Files Changed**

- `src/lib/worldData.ts` — deleted dead tables, updated `pssToClass`, made `gdpPerDayOverride` required
- `src/lib/generator.ts` — replaced `TL_POP_MOD` with productivity ratio, added `+1` exponent
- `src/lib/dice.ts` — already had `rollExploding()`, now used in population block
- `src/App.tsx` — goal-loop closest-match scoring
- `src/lib/optionsStorage.ts` — `allowShipsAtXPort: true` default
- `src/components/GeneratorDashboard.tsx` — toggle default ON, auto-save fix
- `src/components/SystemViewer.tsx` — corrected Annual Port Trade tooltip
- `QA.md` — this documentation

---

**Verification Checklist**

- [x] CE world at TL 12 does **not** get artificial population boost from TL
- [x] Mneme world at TL 16 scales population with income curve
- [x] `GDP_PER_DAY_BY_TL` no longer exists in codebase
- [x] `TL_POP_MOD` no longer exists in codebase
- [x] `./node_modules/.bin/tsc -b` passes with 0 errors
- [x] PSS thresholds advance one class per +1 point
- [x] Goal mode returns best match after 2,000 iterations
- [x] X-class ports show ships by default
- [x] Trade fraction varies by development level (fixed 5% for UnderDeveloped, dice-driven for all others)

