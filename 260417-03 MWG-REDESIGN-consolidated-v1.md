# MWG Redesign — Consolidated v1.0 Spec

**Status:** Locked for implementation  
**Date:** 2026-04-17  
**Replaces / Consolidates:** FR-041, FR-042, FR-043 drafts + INTRAS terminology lock  
**Scope:** Everything needed to implement Phases 1–5 of the v2 redesign pipeline

---

## 0. Decisions Log — Every Open Question Resolved

| # | Open Question | Decision |
|---|---|---|
| 1 | **Biosphere Test dice mechanic** | Escalating dice pool (FR-041/043 table), NOT fixed 5D6. See §3.6 for unified formula. |
| 2 | **B6 Post-Sapient = auto-mainworld?** | No. B6 gives +8 hab mod and competes normally. Inhabitants generation remains a separate post-selection step. |
| 3 | **HH inheritance on Gas Giant moons** | Dwarf moons of Gas Giants roll atmosphere normally. No special captured-atmosphere rule for v1. |
| 4 | **Composition–zone correlation** | No pre-hoc constraint. Hydrous/Volatile bodies can exist in any zone. Outer-zone placement grants a +1 density bonus (ice compression) for Hydrous/Icy-Rock. |
| 5 | **Temperature table integration** | Existing 2D6 temperature mechanic is replaced entirely by the §4.3 stacked-DM model. |
| 6 | **Shepherded body re-evaluation** | Temperature re-rolled only (zone changed). Hazard, Biochem, Biosphere fixed. |
| 7 | **B3→B4 boundary jump (+2→+4)** | Keep discrete tiers. No interpolation. The jump models the Great Oxidation Event — a threshold, not a gradient. |
| 8 | **Extreme negative habitability floor** | No floor. Scores run arbitrarily negative. MVT/GVT fallback picks the least-bad candidate. |
| 9 | **Brown Dwarf relocation after promotion** | Relocated to standard outer companion orbit per REF-003. Overrides "stay at migration position." |
| 10 | **Consumed body UI** | Render in Gas Giant detail panel as "Absorbed Worlds" list. |
| 11 | **Proto-Star sub-system generation** | Deferred. v1: keep original moons only. Full L1 sub-system generation is a post-v1 feature. |
| 12 | **Ring existence mechanic** | Added in §5. Per-Parent INRAS 2D6 existence roll + 2D6 density roll. See §5. |
| 13 | **Disk formula direction** | Corrected: stellar class applies a flat modifier to the sum, NOT more dice. See §3.2. |
| 14 | **Life Assumptions file location** | `src/lib/lifePresets.ts` (separate from `economicPresets.ts`). |
| 15 | **Feature flag for Phase 3 positioning** | `v2Positioning: boolean` in `GeneratorOptions`, default `false`. |
| 16 | **Zone rename: Cold→Cool, Outer→O1–O5** | Locked. `ZoneId` type expands; UI labels update. Old `'Cold'` and `'Outer'` values removed from codebase. |

---

## 1. Terminology (Locked — unchanged from Changes.md §14)

| Term | Definition |
|---|---|
| **Level 0 — Stars** | Primary and Companion stars. Governed by REF-002 chain rule. |
| **Level 1 — INRAS** | Any body orbiting a Level-0 star. Disks, Dwarfs, Terrestrials, Ice Worlds, Gas Worlds. |
| **Level 2 — Children / Moons** | Bodies orbiting a Parent INRAS. Rings, Dwarfs, and rarely Terrestrials (Giants only). |
| **Parent INRAS** | Level-1 body large enough to host children. Terrestrials, Ice Worlds, Gas Worlds. |
| **Disks** | Accretion / asteroid belt material. Sub-Dwarf aggregate mass at Level 1, with rolled count and position per zone. |
| **Rings** | Level-2 child of a Parent INRAS. Rolled for existence and total density. |
| **Habitability Candidate** | Any Dwarf or Terrestrial body at Level 1 or Level 2. Gets the full habitability stack. |
| **Mainworld** | The Habitability Candidate with the highest computed Baseline Habitability, selected after full system generation. |
| **Parent-Child Limit** | Generalized constraint preventing a child from being comparable to or larger than its parent. |

### Type Skeleton

```typescript
type OrbitLevel = 0 | 1 | 2
type BodyType = 'star' | 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas' | 'ring'

interface Body {
  id: string
  type: BodyType
  level: OrbitLevel
  parentId?: string          // undefined for Level 0 (stars)
  // ... physical + habitability fields added below
}

const isHabitabilityCandidate = (b: Body) =>
  (b.type === 'dwarf' || b.type === 'terrestrial') &&
  (b.level === 1 || b.level === 2)

const canHostChildren = (b: Body) =>
  b.level === 1 && (b.type === 'terrestrial' || b.type === 'ice' || b.type === 'gas')
```

---

## 2. Data Model Additions

### `ZoneId` Expansion

```typescript
type ZoneId =
  | 'Infernal' | 'Hot' | 'Conservative' | 'Cool' | 'FrostLine'
  | 'O1' | 'O2' | 'O3' | 'O4' | 'O5'
```

> **Note:** `'Cold'` → `'Cool'`. `'Outer'` → removed; every outer placement resolves to O1–O5.

### `StarSystem` Additions

```typescript
interface StarSystem {
  // ... existing fields

  heliopauseAU: number
  frostLineAU: number
  outerSystemZones: OuterZoneBoundaries
  ejectedBodies: Body[]
  consumedBodies: Body[]
  mainworldId: string
  mainworldSelectionLog: {
    candidates: Array<{ id: string; score: number; rank: number }>
    tiebreakerApplied: boolean
    fallbackTriggered: boolean
    fallbackReason?: string
  }
}

interface OuterZoneBoundaries {
  o1: { minAU: number; maxAU: number }
  o2: { minAU: number; maxAU: number }
  o3: { minAU: number; maxAU: number }
  o4: { minAU: number; maxAU: number }
  o5: { minAU: number; maxAU: number }
}
```

### `Body` Additions

```typescript
interface Body {
  // Positioning
  zone: ZoneId
  au: number
  positionRoll: number
  positionRerollCount: number
  wasEjected?: boolean
  ejectionReason?: 'saturation' | 'gravitational'
  wasShepherded?: boolean

  // Composition (FR-041)
  composition?: string
  reactivityDM: number

  // Atmosphere
  atmosphereCompositionAbiotic: AtmosphereComp
  atmosphereComposition: AtmosphereComp   // post-biosphere conversion
  atmosphereDensity: AtmoDensity

  // Habitability waterfall (FR-043)
  temperature: Temperature
  hazard: Hazard
  hazardIntensity: HazardIntensity
  biochem: BiochemTier
  biosphereRating: BiosphereRating   // 'B0' | 'B1' | ... | 'B6'
  biosphereRoll: number
  biosphereTN: number
  hasSubsurfaceOceanOverride: boolean

  baselineHabitability: number
  habitabilityBreakdown: {
    gravity: number
    atmosphereComp: number
    atmosphereDensity: number
    temperature: number
    hazard: number
    hazardIntensity: number
    biochem: number
    biosphere: number
  }

  wasSelectedAsMainworld: boolean
  tiebreakerRank?: number
}
```

---

## 3. Composition, Atmosphere, Biosphere (FR-041 — Locked)

### 3.1 Composition Tables

#### Terrestrial (3D6)

| 3D6 | % | Composition | Density (g/cm³) | Reactivity DM | Notes |
|---|---|---|---|---|---|
| 3 | 0.46% | Exotic (Heavy-Element) | 7.5–9.5 | +2 | Often radioactive |
| 4–5 | 4.2% | Iron-Dominant | 6.0–7.5 | −1 | Mercury-like |
| 6–8 | 25.9% | Iron-Silicate | 5.0–6.0 | +1 | Earth archetype |
| 9–12 | 48.6% | Silicate-Basaltic | 3.8–5.0 | 0 | Mars archetype |
| 13–15 | 16.2% | Hydrous / Ocean | 2.5–3.8 | +2 | Europa-scaled-up |
| 16–17 | 4.2% | Carbonaceous | 2.0–3.0 | +1 | Primitive, cold |
| 18 | 0.46% | Ceramic / Silicate-Pure | 3.0–4.0 | 0 | No magnetic field |

**Density interpolation:** Roll 2D6 within the range. `density = min + (max - min) × ((roll - 2) / 10)`.

#### Dwarf (3D6)

| 3D6 | % | Composition | Density (g/cm³) | Reactivity DM | Notes |
|---|---|---|---|---|---|
| 3 | 0.46% | Exotic | 1.5–4.0 | +1 | Rare chondrite |
| 4–5 | 4.2% | Metallic (M-type) | 5.0–7.5 | −1 | Core remnant |
| 6–8 | 25.9% | Silicaceous (S-type) | 2.8–3.8 | 0 | Vesta-like |
| 9–12 | 48.6% | Hydrous / Icy-Rock | 1.5–2.5 | +2 | Pluto/Ceres archetype |
| 13–15 | 16.2% | Carbonaceous (C-type) | 1.8–2.5 | +1 | Volatile-bearing |
| 16–17 | 4.2% | Rubble-Pile | 1.5–2.2 | 0 | Itokawa-type |
| 18 | 0.46% | Volatile-Rich | 1.2–2.0 | +2 | Cryovolcanic |

**Outer-zone density bonus:** Hydrous / Icy-Rock / Volatile-Rich bodies placed in O1–O5 get +0.3 g/cm³ (ice compression), capped at the composition's max density.

### 3.2 Atmosphere Composition — Abiotic (3D6)

| 3D6 | % | Primary Gas | Temp DM | Hazard Bias | Hab Mod |
|---|---|---|---|---|---|
| 3 | 0.46% | Hydrogen-Helium | −2 | None | 0 |
| 4–5 | 4.2% | Methane / Ammonia | −1 | Toxic +1 | −1 |
| 6–8 | 25.9% | Nitrogen-Inert | 0 | None | 0 |
| 9–12 | 48.6% | Carbon Dioxide | +1 | None | −1 |
| 13–15 | 16.2% | Water Vapor / Steam | +2 | Corrosive +1 | −2 |
| 16–17 | 4.2% | Sulfuric | +2 | Corrosive +2, Toxic +1 | −3 |
| 18 | 0.46% | Exotic | Variable | Variable | −3 |

**H-He auto-escape:** If gravity < 1.5G, force atmosphere to Trace and record "None (residual H-He)" for lore. Hab mod = 0.

### 3.3 Atmosphere Density (2D6 + modifiers)

| 2D6 (modified) | Density | Hab Mod |
|---|---|---|
| ≤3 | Trace / None | −3 |
| 4–5 | Thin | −1 |
| 6–9 | Average | 0 |
| 10–11 | Dense | −1 |
| ≥12 | Crushing | −3 |

**Modifiers:**
- Reactivity ≥ +2: +1
- Reactivity ≤ −1: −1
- Gravity ≥ 2G: +2
- Gravity ≤ 0.3G: −2
- Ceramic composition: −1
- H-He + gravity < 1.5G: force to Trace (2)

### 3.4 Biochem Resources (3D6 + Reactivity DM)

| Modified Roll | Tier | Hab Mod |
|---|---|---|
| 3 | Scarce | −5 |
| 4 | Rare | −4 |
| 5 | Uncommon | −3 |
| 6–7 | Poor | −2 |
| 8–9 | Deficient | −1 |
| 10–11 | Common | 0 |
| 12–13 | Abundant | +1 |
| 14 | Rich | +2 |
| 15 | Bountiful | +3 |
| 16 | Prolific | +4 |
| 17–18 | Inexhaustible | +5 |

### 3.5 Biosphere Test — Unified Dice Pool Formula

**Trigger:** Biochem tier ≥ preset minimum (default Common).

**Base pool:** 5D6.

**Pool modification rule:** Each "disadvantage level" adds 1 die and keeps the **lowest** N. Each "advantage level" adds 1 die and keeps the **highest** N. N is always 5 (the base pool size).

| Net Dis/Adv Level | Dice Pool | Description |
|---|---|---|
| dis+3 | 8D6 keep lowest 5 | Catastrophically hostile |
| dis+2 | 7D6 keep lowest 5 | Base — very hard |
| dis+1 | 6D6 keep lowest 5 | Hard |
| 0 (neutral) | 5D6 plain | Even odds |
| adv+1 | 6D6 keep highest 5 | Favorable |
| adv+2 | 7D6 keep highest 5 | Very favorable |
| adv+3 | 8D6 keep highest 5 | Near-certain |

**How net level is computed:**
1. Start with `preset.biosphereDisadvantage` (default 2)
2. Subtract `biochemHabMod` (if positive) → each +1 removes 1 dis level
3. Add `temperatureDiceAdjust` → Freezing +3, Cold +2, Hot +2, Inferno +3, Average −2
4. If subsurface ocean override applies, halve the temperature adjustment (round toward less severe)

**Example:** Base dis+2, Biochem Abundant (+1) → −1 level = dis+1. Temperature Average → −2 levels. Net = adv+1 → 6D6 keep highest 5.

### 3.6 Biosphere Rating (B0–B6)

| Roll vs TN | Rating | Name | Atmo Effect | Hab Mod |
|---|---|---|---|---|
| < TN − 5 | B0 | None | — | 0 |
| TN − 5 to TN − 1 | B1 | Pre-Biotic | Trace CH₄ | 0 |
| TN to TN + 2 | B2 | Microbial | Trace O₂ | +1 |
| TN + 3 to TN + 5 | B3 | Photosynthetic | Transitional CO₂+O₂ | +2 |
| TN + 6 to TN + 8 | B4 | Complex | **Nitrogen-Oxygen** | +4 |
| TN + 9 to TN + 11 | B5 | Advanced | Stable N-O | +6 |
| ≥ TN + 12 | B6 | Post-Sapient | Engineered | +8 |

### 3.7 Atmosphere Conversion Matrix

| Abiotic Atmosphere | B3 (Transitional) | B4+ (Oxygenated) |
|---|---|---|
| H-He | No change | No change |
| Methane / Ammonia | Transitional CH₄+O₂ | Nitrogen-Inert |
| Nitrogen-Inert | No change | **Nitrogen-Oxygen** |
| Carbon Dioxide | CO₂ + 1–10% O₂ | **Nitrogen-Oxygen** |
| Water Vapor / Steam | Humid CO₂+O₂ | Humid **Nitrogen-Oxygen** |
| Sulfuric | Sulfuric (traces reduced) | CO₂ (partial only) |
| Exotic | Variable | Variable |

**Post-conversion hab mod:** N-O and N-Inert get 0. All others keep their abiotic penalty.

### 3.8 Extraterrestrial Life Assumptions Settings

```typescript
interface ExtraterrestrialLifeAssumptions {
  id: string
  name: string
  description: string
  biosphereTN: number                    // 15–35, default 20
  biosphereDisadvantage: number          // 0–5, default 2
  minBiochemForBiosphereRoll: 'Common' | 'Abundant' | 'Rich'
  enableTransitionalAtmospheres: boolean // default true
  biochemOffsetRule: 'standard' | 'halved' | 'none'  // default 'standard'
}
```

| Preset | TN | Dis | Min Biochem | Transitional | Offset Rule | N-O Rate |
|---|---|---|---|---|---|---|
| Mneme Default | 20 | 2 | Common | true | standard | ~3–10% |
| Rare Earth | 28 | 3 | Abundant | false | halved | < 1% |
| Panspermia | 15 | 0 | Common | true | standard | ~15–30% |

**Storage:** `mneme_life_assumptions_presets` (custom presets array). Active ID stored in `mneme_generator_options.activeLifeAssumptionsId`.

---

## 4. Positioning System (FR-042 — Locked)

### 4.1 Zone Architecture

**Inner System:**

| Zone | Boundary |
|---|---|
| Infernal | Stellar radius × 2 to √L × 0.4 AU |
| Hot | √L × 0.4 to 0.8 AU |
| Conservative | √L × 0.8 to 1.2 AU |
| Cool | √L × 1.2 to 2.0 AU |
| Frost Line | √L × 4.85 AU |

**Outer System:**

```
heliopauseAU = 120 × √L
outerSpan = heliopauseAU − frostLineAU
```

| Zone | Width % | Cumulative |
|---|---|---|
| O1 | 3.125% | Just past frost line |
| O2 | 6.25% | — |
| O3 | 12.5% | — |
| O4 | 25% | — |
| O5 | 50% | To heliopause |

### 4.2 Unified 3D6 Position Roll

| 3D6 | Zone | Probability |
|---|---|---|
| 3 | Infernal | 0.46% |
| 4–7 | Hot | 15.3% |
| 8–11 | Conservative | 43.5% |
| 12–13 | Cool | 16.2% |
| 14 | Frost Line | 9.7% |
| 15–18 | Outer → second roll | 14.8% |

**Outer second roll (if 15–18):**

| 3D6 | Zone | Probability |
|---|---|---|
| 3–9 | O1 | 50% |
| 10–11 | O2 | 16.7% |
| 12–13 | O3 | 16.7% |
| 14–17 | O4 | 14.8% |
| 18 | O5 | 0.46% |

### 4.3 Disk Generation (Corrected Formula)

```
baseRoll = sum of lowest 2 of (3D6 exploding)
classMod = { M: -1, K: 0, G: 0, F: +1, A: +2, B: +3, O: +4 }
diskCount = max(0, floor((baseRoll + classMod) / 2) - 1)
```

**Expected distribution (simulated):**

| Class | Mean | P(0 disks) |
|---|---|---|
| M | ~0.9 | ~30% |
| K/G | ~1.1 | ~22% |
| F | ~1.3 | ~15% |
| A | ~1.5 | ~10% |
| B | ~1.8 | ~5% |
| O | ~2.0 | ~3% |

### 4.4 4-Phase Placement Algorithm

**Phase A — Anchors:**
1. Largest Gas/Ice Giant → frost line anchor: `au = frostLineAU × (1 + (3D6 × 0.01 − 0.10))`
2. Largest Terrestrial → unified 3D6 roll

**Phase B — Disks FIRST:**
- Roll disk count, place each via unified 3D6
- Disks skip Hill sphere checks
- Multiple disks in same zone aggregate into single denser disk entry

**Phase C — Remaining bodies (mass-descending):**
- Ice Worlds skip unified roll → direct Outer table. Hill sphere check applies: on conflict, roll 1D6 for direction (1–3 = nudge inward, 4–6 = nudge outward) by the minimum separation. If nudge fails in the assigned zone, try remaining outer zones (O1–O5) in order. With 5 outer zones available, ejection is statistically near-impossible — only if all 5 are exhausted.
- Gas Giants in inner zones → Hot Jupiter stability check
- Terrestrials blocked by disks → reroll
- Dwarfs coexist with disks → proceed
- Hill sphere conflict (4× max r_H) → reroll
- 5 reroll limit → ejection to `ejectedBodies`

**Phase D — Moons:**
- Separate thread. Each moon within parent's Hill sphere, Roche limit as inner bound.

### 4.5 Hill Sphere & Conflict

```
r_H (AU) = a × ∛(m_body / (3 × M_star))
minSeparation = 4.0 × max(r_H1, r_H2)
```

If new body is within `minSeparation` of any placed body → conflict → zone blocked → reroll.

### 4.6 Disk-Blocking Rule

| Body Type | Disk-Occupied Zone Behavior |
|---|---|
| Terrestrial | Blocked — must reroll |
| Gas / Ice | Blocked — would have consumed disk during formation |
| Dwarf | Allowed — coexists, clears local gap |
| Disk | Allowed — aggregates with existing disk in zone |

### 4.7 Hot Jupiter Stability Roll (Replaces QA-011)

**Trigger conditions (ALL required):**
1. Gas Giant rolls inner zone (Infernal / Hot / Conservative / Cool)
2. All 4 inner zones already have placed bodies (saturation)
3. Stability roll **FAILS**

**Stability roll:** `5D6, keep lowest 3, sum ≥ 5` = stable. Sum < 5 = destabilized.

**Failure probability per trigger:** ~5.5%. **Net per system:** ~0.5–0.6%.

**Event execution:**
1. Determine final zone: sum = 3 → Infernal; else → Hot
2. `consumedBodies` = all bodies between finalAU and originalAU
3. Absorb mass and recalculate density proportionally
4. `shepherdedBodies` = all bodies with au < finalAU
5. Shepherded bodies: `newAU = oldAU × ((70 + shepherdingRoll) / 100)`
6. Shepherding roll per stellar class:
   - F: 6D6 keep lowest 4 → +70
   - G: 5D6 keep lowest 4 → +70
   - K: 4D6 straight → +70
   - M: 5D6 keep highest 4 → +70
7. Class upgrade: post-absorption mass ≥ 20 JM → Proto-Star trait; ≥ 50 JM → Brown Dwarf promotion
8. If promoted to Brown Dwarf: relocate to outer companion orbit per REF-003

**Shepherded body temperature:** Re-rolled with new zone DM only. Other attributes fixed.

---

## 5. Rings (Level 2 — New)

Rings are Level-2 children of Parent INRAS bodies (Terrestrial, Ice, Gas). They are NOT habitability candidates.

### 5.1 Existence Roll

Per Parent INRAS, roll **2D6** after all L1 placement is complete:

| Parent Type | Threshold | P(rings) |
|---|---|---|
| Gas Giant | 7+ | 58.3% |
| Ice World | 9+ | 27.8% |
| Terrestrial | 11+ | 8.3% |

### 5.2 Density / Prominence Roll (if existence triggered)

Roll **2D6**:

| 2D6 | Prominence | Description |
|---|---|---|
| 2–3 | Faint | Dusty band, barely visible (Jupiter-like) |
| 4–6 | Moderate | Visible ring system |
| 7–9 | Prominent | Saturn-class showpiece |
| 10–11 | Brilliant | Extended, bright rings |
| 12 | Massive | Super-Saturn; dominates system architecture |

### 5.3 Data Model

```typescript
interface Body {
  // ... existing
  ringProminence?: 'faint' | 'moderate' | 'prominent' | 'brilliant' | 'massive'
}
```

Rings displayed in System Viewer as a visual indicator on the parent body card. No orbital mechanics for v1.

---

## 6. Habitability Waterfall & Mainworld Selection (FR-043 — Locked)

### 6.1 The 10-Step Waterfall

Pre-computed inputs: mass, composition, density, gravity, radius, zone, parent info.

1. **Atmosphere Composition** (3D6, abiotic table) → temp DM + hab mod
2. **Atmosphere Density** (2D6 + mods) → hab mod
3. **Temperature** (2D6 + zone DM + atmo comp DM + atmo density DM + Proto-Star heat DM) → temp tier + hab mod
4. **Hazard** (2D6 + Reactivity DM + atmo hazard bias) → hazard type + hab mod
5. **Hazard Intensity** (2D6) → intensity + hab mod
6. **Biochem** (3D6 + Reactivity DM) → tier + hab mod
7. **Biosphere Test** (dice pool per §3.5) → roll vs TN
8. **Biosphere Rating** (B0–B6 from margin) → hab mod
9. **Atmosphere Conversion** (if B3+) → update atmo comp + hab mod
10. **Baseline Habitability** = sum of all mods. **NO TL.**

### 6.2 Temperature Stacked Modifiers

**Base mapping (modified 2D6):**

| Roll | Temperature | Hab Mod |
|---|---|---|
| ≤3 | Freezing | −5 |
| 4–5 | Cold | −2 |
| 6–9 | Average | 0 |
| 10–11 | Hot | −2 |
| ≥12 | Inferno | −5 |

**Zone DM:**

| Zone | DM |
|---|---|
| Infernal | +5 |
| Hot | +3 |
| Conservative | 0 |
| Cool | −2 |
| Frost Line | −3 |
| O1 | −4 |
| O2 | −5 |
| O3 | −6 |
| O4 | −7 |
| O5 | −8 |

**Atmosphere comp DM:** H-He −2, CH₄ −1, N-Inert 0, CO₂ +1, Steam +2, Sulfuric +2.

**Atmosphere density DM (greenhouse):** Trace −2, Thin −1, Average 0, Dense +1, Crushing +2.

**Proto-Star heat DM (L2 children of Proto-Star only):** Inner moon +3, Middle +2, Outer +1.

### 6.3 Hazard Stack

**Hazard roll:** 2D6 + Reactivity DM + atmo hazard bias.

| Roll | Hazard | Hab Mod |
|---|---|---|
| ≤3 | None | 0 |
| 4–6 | Polluted | −1 |
| 7–8 | Corrosive | −2 |
| 9 | Biohazard | −2 |
| 10 | Toxic | −3 |
| 11–12 | Radioactive | −4 |

**Hazard intensity:** 2D6 → Trace(0) / Light(0) / Moderate(−1) / Heavy(−2) / Extreme(−3).

### 6.4 Gravity Modifier (Symmetric)

| Gravity | Hab Mod |
|---|---|
| 0.0–0.1G | −3 |
| 0.1–0.3G | −2 |
| 0.3–0.7G | −1 |
| 0.7–1.3G | 0 |
| 1.3–1.7G | −1 |
| 1.7–2.5G | −2 |
| ≥2.5G | −3 |

### 6.5 Mainworld Selection

1. Compute Baseline Habitability for every `isHabitabilityCandidate` body
2. Sort descending by score
3. **Tiebreakers:**
   1. Higher Biosphere Rating (B6 beats B5)
   2. Composition quality (Terrestrial: Iron-Silicate > Hydrous > Silicate-Basaltic > Carbonaceous > others; Dwarf: Hydrous > Volatile-Rich > Carbonaceous > Silicaceous > others)
   3. Larger mass
   4. Random
4. If winner.score ≤ 0 → MVT/GVT fallback
5. Post-selection: TL rolled, Effective Hab = Baseline + TL mod

### 6.6 Subsurface Ocean Override

**Trigger (ALL required):**
- Composition ∈ {Hydrous, Volatile-Rich} (Dwarf) or {Hydrous/Ocean} (Terrestrial)
- Temperature ∈ {Cold, Freezing}
- Tidal heating: Proto-Star parent OR Gas Giant parent with innermost moon slot

**Effect:** Temperature's dice adjustment is halved, rounded toward less severe.
- Freezing dis+3 → dis+2
- Cold dis+2 → dis+1

---

## 7. Implementation Order (8 Phases)

| Phase | Scope | Files | Breaking? |
|---|---|---|---|
| 1 | Type system — add optional fields to `Body`, `StarSystem` | `types/index.ts` | No |
| 2 | Composition-density tables | `worldData.ts`, `physicalProperties.ts` | No |
| 3 | Positioning system | NEW `positioning.ts`, `generator.ts`, `stellarData.ts` | Yes (behind `v2Positioning` flag) |
| 4 | Habitability pipeline | NEW `habitabilityPipeline.ts`, `worldData.ts` | No |
| 5 | Pipeline integration | `generator.ts` | Yes (flag-conditional) |
| 6 | Life Assumptions settings | NEW `lifePresets.ts`, `Settings.tsx`, `optionsStorage.ts` | No |
| 7 | UI updates | `SystemViewer.tsx`, `GeneratorDashboard.tsx`, `exportDocx.ts` | No |
| 8 | Legacy migration | `db.ts` | No |

**Build order:** 1 → 2 → 6 (parallel) → 3 → 4 → 5 → 7 → 8.

---

## 8. Critical Constraints

- `npm run build` must pass with zero TS errors at every commit.
- `tsconfig.json`: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.
- Use bare `catch` when error variable is unused.
- `optionsStorage.ts` is the single gateway to `mneme_generator_options` — never access `localStorage` directly for generator options.
- The `v2Positioning` feature flag must be checked at the top of `generatePlanetarySystem()` to preserve legacy behavior when `false`.

---

## 9. Batch Validation Targets (Post-Implementation)

| Target | Expected | Tolerance |
|---|---|---|
| Hot Jupiter frequency | 0.5–1.0% per system | ±0.3% |
| N-O atmosphere rate (Mneme Default) | 3–10% of candidates | ±2% |
| N-O atmosphere rate (Rare Earth) | < 1% | — |
| Ejected bodies per system | 2–5 | ±1 |
| Mean disk count (G-class) | ~1.1 | ±0.3 |
| Conservative zone placement | ~43.5% of bodies | ±3% |
| Ring frequency (Gas Giants) | ~58% | ±5% |

Run 10,000-system batch export. Adjust table values if empirical results diverge beyond tolerance.
