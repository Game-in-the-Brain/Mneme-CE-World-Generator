# Mneme CE World Generator — Mechanics Changes

**Date:** 2026-04-10 (last updated 2026-04-17)  
**Purpose:** Document every intentional deviation from the original book rules — what changed, why, and the recommendation for the 2026 printed edition.

---

## Executive Summary

This document tracks all mechanics changes from the original Mneme World Generator book rules discovered during PWA implementation and statistical validation. These changes address balance issues, missing mechanics, and computational clarifications.

---

## ★ Key Mechanics Change — Gravity Now Calculated, Not Rolled (QA-023)

**Old method (book rules):** Roll 2D6 → look up gravity directly from a table.  
Two separate rolls — world size (in km) and gravity — were completely independent. A tiny 342 km rock could roll 0.18G, which requires a density of 37 g/cm³ (denser than any known substance). Physically impossible.

**New method (current implementation):**
1. **Roll mass** — 2D6 gives a mass in Lunar Masses (Dwarf) or Earth Masses (Terrestrial)
2. **Roll density** — 2D6 gives a density in g/cm³ from a range appropriate to the world type
3. **Calculate gravity** — physics formula: `g = G × M / R²` where radius `R = ∛(3M / 4πρ)`

Every world is now physically self-consistent. A small world always has low gravity. A dense iron world has high gravity. The math matches real solar system bodies (Moon, Mars, Earth, Mercury) to within 1–10%.

**Effect on gameplay:**  
Extreme penalties (0.001G dwarfs, 3.0G super-Earths) are replaced by physically realistic values. Habitable (hab 0) worlds increase from ~17% to ~25% of rolls. All negative-habitability outcomes are preserved — just shifted toward moderate rather than impossible extremes.

**See Section 12** for full details.

---

## 1. Stellar Class Modifiers (REF-007 v1.1)

### Original Book Rules
| Class | Dwarf Modifier | Terrestrial Modifier |
|-------|---------------|---------------------|
| F | Adv+1 | Adv+1 |
| G | Adv+1 | Adv+1 |
| K | None | None |
| M | Dis+1 | Dis+1 |
| O/B/A | Disks only | Disks only |

### Current Implementation (v1.1)
| Class | Dwarf | Terrestrial | Ice | Gas |
|-------|-------|-------------|-----|-----|
| F | Adv+2 | Adv+2 | Adv+2 | Adv+2 |
| G | Baseline | Baseline | Baseline | Baseline |
| K | Dis+2 | Dis+2 | Dis+2 | Dis+2 |
| M | Dis+4 | Dis+4 | Dis+4 | Dis+4 |
| O/B/A | 0 | 0 | 0 | 0 |

### Rationale
Statistical analysis showed original M-class modifiers produced systems nearly as dense as G-class, contradicting astrophysical reality. M-dwarfs have:
- Narrow protoplanetary disks
- High stellar wind pressure
- Lower metallicity correlation

**Dis+4 for M-class** creates appropriate sparsity (~4-6 bodies vs ~12-15 for G-class).

### Recommendation for 2026 Book
Update REF-007 table to match v1.1 modifiers. Clarify that ice worlds and gas giants follow same modifier progression as rocky planets.

---

## 1b. Stellar Class Modifiers — Half Dice (REF-007 v1.2)

### Update (2026-04-10)

Further statistical validation showed that v1.1 modifiers (Dis+2 for K, Dis+4 for M) still produced too many planetary bodies for these star types:

| Star Class | v1.1 Median | Target | Issue |
|------------|-------------|--------|-------|
| K-class | ~10 worlds | ~8-12 | Slightly too dense |
| M-class | ~7 worlds | ~4-6 | Still too dense |

### Solution: Dis+3 for K, Half Dice for M

**K-class:** Increased to **Dis+3** on standard d6 dice.

**M-class:** Introduced **Half Dice** — using d3 (1-3) instead of d6 (1-6) with Dis+1:

| Star Class | Mechanism | Median Bodies |
|------------|-----------|---------------|
| F | Adv+2 on d6 | ~20 |
| G | Baseline d6 | ~17 |
| **K** | **Dis+3 on d6** | **~11** |
| **M** | **Half Dice (d3) + Dis+1** | **~5** |

### Final Implementation (Validated)

For **K-class** stars (Dis+3 on d6):
- Dwarfs: 3d6-3, roll 6d6 keep lowest 3
- Terrestrials: 2d6-2, roll 5d6 keep lowest 2

For **M-class** stars (Half Dice + Dis+1):
- Disks: 1d3-1, roll 2d3 keep lowest 1
- Dwarfs: 3d3-3, roll 4d3 keep lowest 3
- Terrestrials: 2d3-2, roll 3d3 keep lowest 2
- Ices: 1d3-1, roll 2d3 keep lowest 1
- Gases: 1d3-1, roll 2d3 keep lowest 1

### Statistical Validation (1000 Systems)

| Class | Count | Median Total | Median Terrestrials | Median Dwarfs |
|-------|-------|--------------|---------------------|---------------|
| A | 16 | 2 | 0 | 0 |
| B | 5 | 2 | 0 | 0 |
| F | 44 | 20 | 7 | 9 |
| G | 97 | 17 | 4 | 6 |
| **K** | **158** | **11** | **2** | **3** |
| **M** | **679** | **5** | **1** | **2** |

### Rationale

K and M dwarfs have fewer planets due to:
- Narrower protoplanetary disks
- Lower mass available for planet formation
- Higher stellar wind pressure clearing debris
- Lower metallicity correlation

**M-class** uses Half Dice (d3) for significantly reduced counts (~5 median). **K-class** uses aggressive Dis+3 on standard dice for moderate reduction (~11 median).

### Recommendation for 2026 Book

Update REF-007 to v1.2. Add "Half Dice" term to glossary: rolling d3 (1-3) instead of d6 (1-6), used for M-class stars to achieve ~50% reduction in planet counts.

---

## 2. Habitability Calculation

### Original Book Rules
Habitability = Gravity + Atmosphere + Temperature + Hazard + Hazard Intensity + Biochemical Resources

**Missing:** Tech Level modifier

### Current Implementation
Habitability = Gravity + Atmosphere + Temperature + Hazard + Hazard Intensity + Biochemical + **Tech Level Modifier**

Where:
```
Tech Level Modifier = MAX(0, MIN(9, TL - 7))
TL 7 → +0
TL 8 → +1
TL 9 → +2
...
TL 16 → +9
```

### Rationale
Without TL modifier, 85% of generated worlds had negative habitability, making population calculations produce negligible results. High-TL societies terraform, dome, or bioengineer solutions to environmental challenges.

### Biochemical Resources Correction

| Resource | Book Value | Implemented | Status |
|----------|-----------|-------------|--------|
| Scarce | -5 | -5 | ✅ Correct |
| Rare | -4 | -4 | ✅ Correct |
| Uncommon | -3 | -3 | ✅ Correct |
| Abundant | **0** | **+3** | ⚠️ **CHANGED** |
| Inexhaustible | +5 | +5 | ✅ Correct |

**Issue:** Original book had Abundant at 0, making positive habitability nearly impossible without TL modifier.

### Recommendation for 2026 Book
Add Tech Level modifier section. Correct Abundant biochem to +3. Add explicit formula with all components listed.

---

## 3. Hot Jupiter Migration (New Section)

### Current Implementation (QA-011)

**Trigger:** Gas giant in inner zone
- Class III in Infernal zone, OR
- Class IV/V in Hot zone

**Effect:**
1. Clear ALL non-disk bodies from that zone
2. Gas giant remains alone
3. Roll 2D6: 11+ adds one captured rogue dwarf

### Rationale
Not in original book. Added because:
- Hot Jupiters are observed to clear inner planetary systems
- Prevents unrealistic stacking of terrestrial worlds at 0.4 AU alongside gas giants
- Creates dramatic system architecture variety

### Recommendation for 2026 Book
Add Section 8.4a: Hot Jupiter Migration. Include probability table for captured rogues (2D6 ≥ 11 = 8.33% chance per cleared zone).

---

## 4. Hill Sphere Orbital Spacing (New Section)

### Current Implementation (QA-006)

Minimum separation = MAX(
  Hill Sphere × 1.5,
  Floor (0.05 AU inner, 0.15 AU outer)
)

Where:
```
Hill Sphere (AU) = a × ∛(m / 3M)
a = orbital distance (AU)
m = body mass (Earth masses)
M = star mass (Solar masses)
```

### Rationale
Original book had no explicit spacing rules, causing bodies to stack at identical AU positions. Hill sphere physics ensures:
- Large gas giants push neighbors outward
- Dwarf planets can pack closer than terrestrials
- Minimum floor prevents unrealistically tight groupings

### Recommendation for 2026 Book
Add Section 8.6: Orbital Spacing. Include:
- Hill sphere formula
- 1.5× safety factor
- Floor values by zone
- Worked example

---

## 5. Temperature "Average" Rarity

### Current Implementation
Average temperature requires **modified roll ≥ 12** on 2D6.

Atmosphere modifiers:
- Crushing: +2
- Dense: +1
- Average: 0
- Thin: -1
- Trace: -2

**Probability of Average temperature:**
- With Average atmosphere: 2.78% (natural 12)
- With Dense atmosphere: 8.33% (natural 11-12)
- With Crushing atmosphere: 16.67% (natural 10-12)
- With Thin atmosphere: 0% (impossible)
- With Trace atmosphere: 0% (impossible)

### Rationale
This is **working as designed**. "Average" temperature is rare because:
- Thin/Trace atmospheres cannot retain heat → always cold/freezing
- Most worlds have some atmospheric deviation
- Matches real exoplanet statistics (habitable zone ≠ habitable temperature)

### Recommendation for 2026 Book
Clarify in Section 6.5 that Average temperature is intentionally rare. Add probability sidebar. Emphasize that "Conservative Habitable Zone" refers to radiation distance, not temperature comfort.

---

## 6. Tech Level Range Extension (REF-013)

### Current Implementation
Extended TL table from original 7-12 to 9-18:

| MTL | CE TL | Era | Key Technologies |
|-----|-------|-----|------------------|
| 9 | 7.0 | 2050 CE | New Space Race |
| 10 | 8.0 | 2100 CE | Cis-Lunar Development |
| 11 | 8.5 | 2200 CE | Jovian Colonization |
| 12 | 9.0 | 2300 CE | Post-Earth Dependence |
| 13 | 9.5 | 2400 CE | Outer System Development |
| 14 | 10.0 | 2500 CE | Early Interstellar |
| 15 | 10.5 | 2600 CE | Interstellar Colonization |
| 16 | 11.0 | 2700 CE | Self-Sufficient Megastructures |
| 17 | 11.5 | 2800 CE | Post-Megastructure Expansion |
| 18 | 12.0 | 2900+ CE | Unknown Future |

### Rationale
Original 2D6 → TL 7-12 range insufficient for far-future campaigns. Extended table supports:
- Jump gates (TL 13)
- Self-directed megastructures (TL 16)
- Post-scarcity civilizations

### Recommendation for 2026 Book
Replace Section 7.3 Tech Level table with REF-013 extended version. Maintain backwards compatibility: TL 7-12 map identically.

---

## 7. Population Fork (Hab ≤ 0)

### Current Implementation

**If MainWorld.habitability > 0:**
```
Population = 10^habitability × 2D6
```

**If MainWorld.habitability ≤ 0:**
Use MVT/GVT (Minimum Viable Tech / Gravity Variable Tech) table:

| Roll | Habitat Type | Population Range |
|------|-------------|------------------|
| 2 | Frontier Outpost | 10-100 |
| 3-4 | Research Station | 100-1,000 |
| 5-6 | Mining Habitat | 1,000-10,000 |
| 7-8 | Industrial Habitat | 10,000-100,000 |
| 9-10 | Colonial Habitat | 100,000-1,000,000 |
| 11 | City Habitat | 1,000,000-10,000,000 |
| 12 | Megastructure | 10,000,000-100,000,000 |

### Rationale
Original book produced nonsensical results for Hab ≤ 0 worlds (tiny populations living on hostile surfaces). MVT/GVT table explicitly models artificial habitats:
- Underground complexes
- Orbital stations
- Domed enclosures
- Hollowed asteroids

### Recommendation for 2026 Book
Add Section 7.1.1: Population Fork. Include MVT/GVT table and examples (Titan research stations, Mercury mining habs, etc.).

---

## 7b. Population Formula — Productivity-Ratio Model (QA-061)

> **QA-061 (2026-04-17) supersedes the TLmod lookup table described here.** The `TL_POP_MOD` hardcoded table has been deleted. Population now scales by a preset-aware `productivityMultiplier` so CE and Mneme worlds diverge naturally.

### Original Implementation (Book)

```
Population = 10^habitability × 2D6
where habitability = EnvHab + (TL − 7)
```

### Intermediate Implementation (TLmod Table — now deleted)

The TLmod lookup table (TL7→+5 … TL16→+13) was introduced to match Mneme's compounding productivity. It worked for Mneme but applied the same aggressive TL bonus to CE/Traveller worlds — which have flat, stagnant economics — producing trillion-person CE worlds that contradicted CE canon.

### Current Implementation (Productivity-Ratio — QA-061)

```
productivityMultiplier = getSoc7MonthlyIncome(TL, preset)
                       / getSoc7MonthlyIncome(preset.baseTL, preset)

Natural world (envHab > 0):
  maxPopulation = 10^(envHab + 1) × productivityMultiplier × rollExploding(2,6)
  population    = max(10, floor(roll3D6 × maxPopulation × 0.05))

Hostile world (envHab ≤ 0):
  population = max(10, floor(habitatSize × productivityMultiplier))
```

**CE/Traveller result:** `productivityMultiplier = 1.0` at every TL — population depends purely on habitability.  
**Mneme result:** `productivityMultiplier` follows the SOC-7 income compounding curve exactly (1× at baseTL → ~389 000× at TL 16).

### +1 Baseline Exponent

A `+1` was added to `envHab` in the natural-world formula. This shifts the CE population scale back to playable Traveller levels:

| envHab | TLmod-table era (Mneme TL9, +6) | QA-061 CE (×1.0) | QA-061 Mneme TL9 (~×1.5) |
|--------|--------------------------------|------------------|--------------------------|
| 2 | ~1B | ~3,600 | ~5,400 |
| 4 | ~1B | ~360,000 | ~540,000 |
| 6 | ~1B | ~36M | ~54M |

### Starport Unaffected (direct path)

Starport now uses `getGdpPerDayForWorld(TL, dev, wealth, preset)` (QA-056) — not TL-7. Population and starport use entirely separate scaling paths, intentionally.

### Recommendation for 2026 Book

Replace Section 7.2 with the productivity-ratio model. Include two worked examples: one Mneme TL 11 world, one CE TL 9 world at the same habitability — the difference in population reflects the different economic assumptions. Retain the MVT/GVT habitat table for hostile worlds.

---

## 8a. Starport Mechanic — PSS v1.1 (GDP-Based with TL Capability Cap)

### Original Implementation (PVS)

```
PVS = floor(Habitability/4) + (TL−7) + WealthMod + DevelopmentMod
Starport Output = 10^PVS Cr/week
```

Two structural flaws:
1. **TL double-counts** — TL already sets population (via TLmod table), which drives wealth. Adding TL again as a direct addend double-counted it.
2. **Scale blindness** — A world with 100 trillion people at TL 9 and one with 700 million at TL 14 could score the same PVS. No measure of total economic output.

### Current Implementation (PSS v1.1)

**Real-world insight:** Singapore (GDP: $0.5T, ~30th in world) handles more containerised throughput than the entire US West Coast. South Korea (GDP: $1.7T, 13th) builds ~40% of the world's ships. Port capability = TL + institutional specialisation. Port size = economic scale.

**Step 1 — Port Size Score (PSS):**
```
GDP/year = Population × getGdpPerDayForWorld(TL, dev, wealth, preset) × 365
Annual Port Trade = GDP/year × getTradeFraction(dev)
PSS = floor(log10(Annual Port Trade)) − 10
```

`getGdpPerDayForWorld()` (QA-056) derives per-capita income from the average SOC of the world's Development + Wealth levels — so wealth is now embedded in GDP/day rather than applied again as a multiplier. `wealthMultiplier` was removed from the Annual Port Trade formula in QA-057.

**GDP/person/day varies by dev+wealth+TL** (example at SOC 7 = Mature/Average, Mneme preset): 205 Cr at TL 7 → 578,000,000 Cr at TL 16.

**Step 2 — TL Capability Cap:**
```
Final Class = min(PSS-derived class, TL cap)
TL 7–9 → max C   |   TL 10–11 → max B   |   TL 12+ → A
```
No amount of money lets a TL 9 world build jump drives.

**Step 3 — Weekly Activity:**
```
Weekly Base     = Annual Port Trade ÷ 52
Weekly Activity = Weekly Base × 3D6
```
3D6 (not 2D6) — port activity clusters around a normal level with lower variance. ÷52 gives a true weekly rate. (Earlier drafts and a stale JSDoc said ÷364 — that was a daily rate misread as weekly; corrected in QA-027 v1.3.97.)

### Old vs New Comparison

| World | TL | OLD | NEW | Notes |
|-------|-----|-----|-----|-------|
| Tiny Frontier | 7 | X | X | Same |
| Standard World | 11 | E | **C** | 700B people correctly reflected |
| Huge Poor World | 8 | X | **D** | *India model* — massive pop, low TL, real port volume |
| High TL Tiny Pop | 14 | A | **D** | *Research outpost* — TL14 tech but no economic scale |
| Rich Low-TL | 8 | D | D | Same letter, coherent reason — TL8 caps at C; PSS gives D |
| Prosperous World | 13 | A | A | *Korea/Japan model* — advanced + strong economy |

### What Changed vs What Stayed

| Item | Old | New (current) |
|------|-----|--------------|
| Score formula | `floor(Hab/4) + (TL−7) + mods` | `floor(log10(pop × avgSocGdp × tradeFraction)) − 10` |
| TL role | Addend | Capability cap |
| GDP/day | Fixed table (`GDP_PER_DAY_BY_TL`) | `getGdpPerDayForWorld(TL, dev, wealth, preset)` — avg SOC |
| Wealth role | +1/+2/+3 addend to PVS | Embedded in avgSoc → GDP/day; not a separate multiplier |
| Output | `10^PVS Cr/week` (deterministic) | `(annualTrade ÷ 52) × 3D6` (variable) |
| Scale awareness | None | Population × avg-SOC GDP drives economic size |
| Weekly dice | — (none) | 3D6 (lower variance than 2D6) |
| PSS thresholds | < 4→X, 4–5→E, 6–7→D, 8–9→C, 10–11→B, ≥12→A | < 3→X, 3–4→E, 5→D, 6→C, 7→B, ≥8→A (QA-061) |
| Base rolls (naval/scout/pirate) | Unchanged | Unchanged |
| Refined/unrefined fuel by class | Unchanged | Unchanged |

### Recommendation for 2026 Book

Replace Section 7.8 PVS formula with PSS procedure. Add sidebar explaining TL cap (Singapore/Korea analogy). Add weekly activity roll as a standard table mechanic. Add GDP/person/day table by TL.

---

## 8b. Depression Penalty for Low Population Worlds (QA-026)

### Current Implementation

Low-population worlds suffer a **Tech Level depression** that compresses starport class and can downgrade the travel zone.

**Depression Penalty (`calculateDepressionPenalty`):**
- Pop < 1,000,000: −1 TL
- Pop < 100,000: −2 TL (cumulative)
- Pop < 10,000: −3 TL (cumulative)
- Development = UnderDeveloped or Developing: additional −1 TL

`effectiveTL = MAX(0, foundingTL − penalty)`

**After-Starport Calculation (chosen method):**
1. Calculate starport with `foundingTL`.
2. Recalculate starport with `effectiveTL`.
3. Display final class with founding class in parentheses (e.g., `Class E (founded Class B)`).
4. All downstream metrics auto-recalculate:
   - Travel Zone (Green → Amber/Red if effectiveTL < 10/9)
   - Ships in the Area budget (from depressed weekly activity)
   - Base presence (Naval/Scout/Pirate rerolled against new class)

### Rationale

A 5,000-person colony rolling TL 11 could previously produce a Class B starport. That is a "ghost port" — the demographic reality cannot support the infrastructure. The depression penalty forces small or undeveloped colonies into Class E/X ports naturally, without arbitrary clamping.

**Travel Zone overrides:**
- `effectiveTL < 9` → Red Zone (technology base collapse)
- `effectiveTL < 10` → Amber Zone (marginal technology base)

### Recommendation for 2026 Book

Add Section 7.2.3: Depression Penalty. Include:
- Penalty table by population threshold
- After-starport recalculation procedure
- Parenthetical founding-class notation
- Travel zone override rules

---

## 8. Companion Star Generation

### Current Implementation
Recursive chain with class constraints:
- Companion class ≤ Primary class (O→M scale)
- Companion grade within ±2 of primary
- Orbit distance calculated from primary luminosity

### Clarification Needed in Book
Original Section 5.3 lacks explicit constraints. Current implementation assumes:
- Companions form from same molecular cloud → similar metallicity
- Mass ratio limitations prevent extreme companions
- Orbital stability requires minimum separation

### Recommendation for 2026 Book
Add explicit constraints to Section 5.3:
- Class limitation table
- Grade deviation limits
- Minimum orbit distance formula

---

## 9. Physical Properties (New Section)

### Current Implementation
Calculated from mass and type using density tables:

| Body Type | Density (g/cm³) |
|-----------|----------------|
| Iron (Metallic Dwarf) | 7.87 |
| Silicate | 3.25 |
| Carbonaceous | 2.10 |
| Ice | 1.80 |
| Gas I | 0.40 |
| Gas II-V | 0.25 |

Derived values:
```
Radius (km) = ∛(mass × 5.977 × 10²⁴ kg / (4/3 × π × density))
Surface Gravity (G) = mass / (radius / 6371)²
Escape Velocity (m/s) = √(2 × G × mass × 5.977 × 10²⁴ kg / (radius × 1000))
```

### Rationale
Original book provided no density/gravity data. Physical properties needed for:
- Realistic ship landing calculations
- Fuel consumption estimates
- Atmospheric retention assessment

### Recommendation for 2026 Book
Add Appendix C: Physical Properties. Include density table, formulas, and worked examples.

---

## 10. Clarifications and Errata

### 10.1 Zone Terminology
**Book says:** "Conservative Habitable Zone"  
**Clarification:** This refers to **stellar radiation distance**, not guaranteed habitability. A world in the Conservative zone with Trace atmosphere and Freezing temperature is not habitable.

### 10.2 Biochemical Resources vs Habitability
**Book implies:** Abundant resources = habitable world  
**Correction:** Biochem is ONE component. Gravity, atmosphere, and temperature can still make a world uninhabitable despite abundant resources.

### 10.3 Starport Class Formula (PSS v1.1 — supersedes PVS)

> **Note:** The old PVS formula (`floor(Hab/4) + (TL-7) + mods`) was replaced by PSS v1.1. See **Section 8a** for full details.

**Current formula (PSS v1.1):**
```
gdpPerDay   = getGdpPerDayForWorld(TL, dev, wealth, preset)   ← avg-SOC (QA-056)
annualTrade = population × gdpPerDay × 365 × getTradeFraction(dev)
PSS         = floor(log10(max(1, annualTrade))) − 10
rawClass    = pssToClass(PSS)
tlCap       = getTLCapClass(TL)
finalClass  = min(rawClass, tlCap)
```

**PSS → Class (QA-061 thresholds):**
- PSS < 3: X
- 3–4: E
- 5: D
- 6: C
- 7: B
- ≥ 8: A

**TL Capability Cap:** TL ≤3→X, 4–5→E, 6–7→D, 8–9→C, 10–11→B, ≥12→A

### 10.4 Culture Traits Table
**Book format:** D66 × D6 (two dice as digits × one die)  
**Implementation:** D6 × D6 × D6 (three independent dice)

**Impact:** Negligible. Both produce uniform 1/36 probability per trait.

---

## 11. Culture Trait Reroll Rules (QA-020 / QA-021)

### 11.1 Opposing Trait Reroll (QA-020)

**Book rule:** The original book notes that opposing and same culture results should trigger a reroll of the second result, but did not enumerate the opposing pairs.

**Current Implementation:**
- Duplicate traits are automatically rerolled.
- Opposing traits are defined explicitly for the 36-trait culture table:
  - Anarchist ↔ Bureaucratic, Legalistic
  - Bureaucratic ↔ Anarchist, Libertarian
  - Caste system ↔ Egalitarian
  - Collectivist ↔ Individualist
  - Cosmopolitan ↔ Isolationist, Rustic
  - Deceptive ↔ Honest, Honorable
  - Degenerate ↔ Honorable, Proud
  - Devoted ↔ Indifferent
  - Egalitarian ↔ Elitist, Caste system
  - Elitist ↔ Egalitarian
  - Fatalistic ↔ Idealistic
  - Fearful ↔ Heroic
  - Generous ↔ Ruthless
  - Gregarious ↔ Paranoid
  - Heroic ↔ Fearful
  - Honest ↔ Deceptive, Scheming
  - Honorable ↔ Ruthless, Deceptive, Degenerate
  - Hospitable ↔ Hostile
  - Hostile ↔ Hospitable, Pacifist
  - Idealistic ↔ Fatalistic
  - Indifferent ↔ Devoted
  - Individualist ↔ Collectivist
  - Isolationist ↔ Cosmopolitan
  - Legalistic ↔ Libertarian, Anarchist
  - Libertarian ↔ Legalistic, Bureaucratic
  - Militarist ↔ Pacifist
  - Pacifist ↔ Militarist, Hostile
  - Paranoid ↔ Gregarious
  - Progressive ↔ Rustic
  - Proud ↔ Degenerate
  - Rustic ↔ Cosmopolitan, Progressive
  - Ruthless ↔ Honorable, Generous
  - Scheming ↔ Honest

When generating multiple culture traits, any rolled trait that opposes an already-selected trait is rerolled (max 20 attempts per slot).

### 11.2 Source of Power / Culture Conflict Filter (QA-021)

**Problem:** Source of Power and Culture traits were rolled independently, producing self-contradictory world descriptions (e.g., Kratocracy + Pacifist).

**Current Implementation:**
The following Source of Power values exclude specific culture traits:

| Source of Power | Excluded Culture Traits |
|-----------------|------------------------|
| Kratocracy | Pacifist, Egalitarian, Legalistic |
| Democracy | Anarchist |
| Aristocracy | Egalitarian |
| Meritocracy | Caste system |
| Ideocracy | Anarchist, Libertarian |

Excluded traits are rerolled using the same 20-attempt mechanism as duplicate/opposing traits.

### Recommendation for 2026 Book
Add Section 7.10.1: Culture Trait Rerolls and Power/Culture Conflicts. Include the opposing-pairs table and the Source of Power exclusion list.

---

## 12. Density-Derived Gravity for Main Worlds (QA-023)

### Original Book Rules
The 2025 Mneme CE World Generator book uses two independent 2D6 rolls:
- **§6.1 Size:** Random diameter (Dwarf: 100–599 km, Terrestrial: 2000–4999 km)
- **§6.3 Gravity:** Lookup tables (Dwarf: 0.001–0.2 G, Terrestrial: 0.3–3.0 G)

These independent rolls produce physically impossible combinations (e.g., 342 km at 0.18 G requires density >37 g/cm³). The terrestrial table is also non-monotonic — roll 7 (most common) gives the lowest gravity (0.3G), breaking player intuition.

### Current Implementation (QA-023)
Replaces independent rolls with **mass + density → physics pipeline**:

1. **Mass:** Rolled from REF-004 tables (Dwarf: 0.1–7.0 LM, Terrestrial: 0.1–7.0 EM)
2. **Density:** Rolled from new 2D6 density tables (Dwarf: 1.5–3.5 g/cm³, Terrestrial: 4.0–6.5 g/cm³)
3. **Physics:** Gravity, radius, escape velocity calculated from mass + density
4. **Habitability:** Derived from resulting gravity via threshold functions

**Critical Fixes:**
- **Non-monotonic table corrected:** Roll 7 = Earth-like (5.0 g/cm³ → ~0.91G), not absurd 0.3G
- **Physical extremes eliminated:** 0.001G dwarf and 3.0G terrestrial are impossible in new system
- **Solar system accuracy:** Matches Moon (0.143G vs 0.166G), Mars (0.375G vs 0.379G), Earth (0.91G vs 1.00G)

### Probability Distribution Shift
The convolution of two 2D6 rolls changes habitability distribution:

| Hab | Book | Implementation | Change |
|-----|------|----------------|--------|
| −2.5 | 2.78% | ~2.5% | Slight reduction |
| 0 | 16.67% | ~25.5% | **+8.8% increase** |

**Rationale for shift:** The old extremes were physically impossible. The new distribution reflects actual mass×density physics, producing more Earth-like worlds while preserving challenge (74% negative hab vs original 78%).

### Recommendation for 2026 Book
Update Sections 6.1 and 6.3 with the following changes:

**§6.1 World Size Tables:**
- Replace kilometre diameter with mass in Lunar Masses (LM) / Earth Masses (EM)
- Use REF-004 mass tables (0.1–7.0 LM/EM)

**§6.3 Gravity Generation:**
- Replace gravity lookup tables with density tables
- Add Dwarf Density Table (2D6 → 1.5–3.5 g/cm³)
- Add Terrestrial Density Table (2D6 → 4.0–6.5 g/cm³, monotonically decreasing)
- Include physics formula: `g = G × M / R²` where `R = ∛(3M/(4πρ))`
- Add gravity-to-habitability threshold functions (provided above)
- Note: Habitability now derived from physics gravity, not composition

**Game Design Note:** The increased percentage of habitable worlds (hab 0) improves gameplay variety while maintaining overall challenge. The old extremes (0.001G, 3.0G) were unrealistic and rarely contributed meaningful gameplay.

## Summary Table: Book vs Implementation

| Feature | Book | Implementation | 2026 Recommendation |
|---------|------|----------------|---------------------|
| F-class modifier | Adv+1 | Adv+2 | Adopt v1.1 |
| G-class modifier | Adv+1 | Baseline | Adopt v1.1 |
| K-class modifier | None | **Dis+3** (d6) | Adopt v1.2 |
| M-class modifier | Dis+1 | **Half Dice + Dis+1** (d3) | Adopt v1.2 |
| Ice/gas modifiers | Not specified | Same as rocky | Document explicitly |
| TL habitability | Not included | TL-7 (0-9) | Add to book |
| Abundant biochem | 0 | +3 | Correct to +3 |
| Hot Jupiter migration | Not included | Clears zones | Add Section 8.4a |
| Hill sphere spacing | Not included | 1.5× Hill radius | Add Section 8.6 |
| Population formula | 10^Hab × 2D6 (Hab includes TL−7) | 10^(envHab+1) × productivityMultiplier × roll; preset-aware (QA-061) | Replace Section 7.2 |
| Population TLmod | TL−7 linear (+0 to +9) | Productivity ratio from preset income curve; CE=flat, Mneme=compounding (QA-061) | Preset-linked scaling |
| Population (Hab≤0) | 10^Hab × 2D6 | MVT/GVT table × productivityMultiplier | Add Section 7.1.1 |
| TL range | 7-12 | 9-18 | Adopt REF-013 |
| Physical properties | Not included | Density-derived | Add Appendix C |
| Main world size | Random km (2D6) | Mass in LM/EM from REF-004 | Replace §6.1 with mass tables |
| Main world gravity | Independent 2D6 lookup | Derived from mass + density physics | Replace §6.3 with density tables + physics formula |
| Terrestrial gravity table | Non-monotonic (roll 7 = 0.3G) | Monotonic (roll 7 = Earth-like) | Correct table monotonicity |
| Habitability distribution | Single 2D6 (77.8% negative) | Convolution of two 2D6 (74% negative) | Accept shift as physics correction |
| Companion constraints | Vague | Explicit limits | Clarify Section 5.3 |
| Culture opposing pairs | Mentioned but not listed | Explicit 32-pair table | Add Section 7.10.1 |
| Power/Culture conflicts | Not included | Exclusion table by Source of Power | Add Section 7.10.1 |
| Starport formula | PVS = floor(Hab/4) + (TL-7) + mods | PSS v1.1: floor(log10(pop × avgSocGdp × tradeFraction)) − 10 (QA-056/061) | Replace Section 7.8 with PSS |
| GDP/day | Not specified | `getGdpPerDayForWorld(TL, dev, wealth, preset)` — avg-SOC (QA-056) | Add GDP/day table by TL+preset |
| Depression penalty | Not included | Low-pop/dev worlds lose TL → starport downgrade (QA-026) | Add Section 7.2.3 |
| Economic presets | Single hardcoded curve | Mneme (compounding) / CE (flat) / Stagnant / Custom (FR-032) | Add Section 7.9 |
| Ships in Area | Not specified | Credit-budget greedy fill; TL-gated pools; X/E-port gates (QA-058/059) | Add Section 8.7 |
| Trade fraction | Not specified | Dice-band variance by development level (QA-061) | Document in Section 7.8 |
| Composition | Not specified (Lesser Earth Type only) | 3D6 7-tier tables with density range + Reactivity DM (FR-041 proposed) | Replace §6.2 |
| Atmosphere composition | Not specified (single density roll) | 3D6 abiotic gas table; N-O absent — biosignature only (FR-041 proposed) | Split §6.4 |
| Biochem resources | 5-tier (2D6) | 11-tier symmetric ladder (3D6 + Reactivity DM, −5 to +5) (FR-041 proposed) | Expand §6.8 |
| Biosphere | Not included | 5D6 dis+2 vs TN; B0–B6 rating; atmosphere conversion at B3+ (FR-041 proposed) | Add new sections |
| Life assumptions | Not included | Configurable TN/dis/min-biochem with Mneme/Rare Earth/Panspermia presets (FR-041 proposed) | Add sidebar |
| Zone system | 5 zones (Infernal→Outer) | 10 zones: 5 inner (add Cool + Frost Line) + 5 outer (O1–O5 geometric) (FR-042 proposed) | Replace §8 |
| Body positioning | REF-003/REF-005 lookup tables | Unified 3D6 roll + 4-phase placement (anchor→disk→mass-desc→moons) (FR-042 proposed) | Replace §8 |
| Hot Jupiter | Clears zone unconditionally (QA-011) | Stability roll: 5D6 keep low 3 vs TN 5 (~0.5%); mass absorption + shepherding (FR-042 proposed) | Replace §8.4a |
| Orbital conflict | 1.5× Hill sphere + floor | 4× Hill sphere + disk-blocking + 5-reroll ejection → rogue worlds (FR-042 proposed) | Replace §8.6 |
| Disk generation | Simple count by class | 3D6 exploding keep low 2 ÷ 2 − 1; disks placed first, block Terrestrials (FR-042 proposed) | Add to §8 |
| Rogue worlds | Not included | Ejected bodies after 5 rerolls; retain full stats; UI panel (FR-042 proposed) | Add sidebar |
| Mainworld selection | Generated independently first | Competitive selection from all candidates by Baseline Hab score (FR-043 proposed) | Replace §6 |
| TL in habitability | Included in hab score | Separated: Baseline (no TL) for selection; Effective (with TL) after selection (FR-043 proposed) | Split §6.9 |
| Temperature modifiers | Atmosphere density only | Zone DM (Infernal +5 to O5 −8) + atmo comp + atmo density + Proto-Star heat (FR-043 proposed) | Expand §6.5 |
| Biosphere–temperature link | Not included | Temperature adjusts biosphere dice pool: Average adv+2, Freezing dis+3 (FR-043 proposed) | Add to biosphere section |
| Subsurface ocean | Not included | Hydrous + Cold/Freezing + tidal heating → halve temp penalty on biosphere (FR-043 proposed) | Add sidebar |
| Gravity ladder | Asymmetric (QA-023) | Symmetric −3 to 0 to −3 around 0.7–1.3G (FR-043 proposed) | Update §6.3 |

---

## 13. Economic Preset System (FR-032 — 2026-04-16)

### Problem

The original `GDP_PER_DAY_BY_TL` table in `worldData.ts` hardcoded Mneme's compounding productivity curve. Users expecting CE/Traveller economics (flat income, slow growth) saw confusingly large credit values from small populations.

### Theoretical Framework

**"Income" in the generator is a placeholder for productivity** — the total useful output per person operating their TL's full automation stack. This distinction is critical because productivity determines both *carrying capacity* (how many people a world can support) and *economic scale* (how much trade flows through its ports).

In human civilization, increasing productivity frees labor from subsistence — less of the total workforce is needed for food, clothing, and shelter. The freed labor builds human capital (education, research, governance), which further compounds productivity. At higher TLs, a single worker controls automated CNC, robots, drones, heavy industrial equipment, and ships — each unit of human effort produces more output. Labor *costs rise* because each worker commands more automated output.

The preset system lets the GM choose between two theses about whether this compounding actually happens:

- **Compounding (Mneme):** The automation multiplier fires. `P(t) = W(t) × M(t)` where M grows with TL. Growth implies arbitrage — innovation spreads, efficiency scales, material handling increases in mass and distance, and inputs are converted into greater value at increasing complexity and efficiency. Societies that invest in human capital see compounding returns (per the *Under Heaven Demographics* research). Population grows because productivity *unlocks carrying capacity*.

- **Stagnant (CE/Traveller):** The feedback loop never fires. Real wages flat across all TLs — a Japan-style depression extended over centuries or millennia. Automation exists but its gains are captured by capital, not distributed through the economy. Institutional sclerosis prevents productivity from translating into broadly shared growth. Population depends purely on environmental habitability; TL determines only *what* can be built, not the scale of economic activity.

### Current Implementation

**Files:** `src/lib/economicPresets.ts`, `src/lib/optionsStorage.ts`, `src/components/Settings.tsx`

A `TLProductivityPreset` object replaces the hardcoded table:

```typescript
interface TLProductivityPreset {
  id: string;
  name: string;
  label?: string;
  description: string;
  baseIncome: number;           // SOC 7 monthly income at baseTL
  baseTL: number;               // Anchor TL (default 9)
  curve: 'mneme' | 'flat' | 'linear' | 'custom';
  linearMultiplier?: number;
  soc7IncomeByTL?: Record<number, number>;  // curve === 'custom' only
  boatYears?: number;           // Years for SOC 7 to buy the 10DT Boat at baseTL
  wealthWeights?: TableWeights;
  developmentWeights?: TableWeights;
  powerWeights?: TableWeights;
  govWeights?: TableWeights;
}
```

**Built-in presets:**

| Preset | baseTL | Curve | SOC 7 at TL 9 | Notes |
|--------|--------|-------|---------------|-------|
| Mneme (default) | 9 | mneme | ~44 580 Cr/mo | Compounding ×3.3/TL |
| CE / Traveller | 9 | flat | 2 000 Cr/mo | Stagnant across all TLs |
| Stagnant | 9 | flat | 2 000 Cr/mo | Same income + pessimistic weight presets |

**How it integrates:**
- `getGdpPerDayForWorld(tl, dev, wealth, preset)` replaces all legacy GDP lookups — routes through avg-SOC (QA-056)
- `getGdpPerDayFromPreset(tl, preset)` still exists (SOC 7 anchor) but bypassed for inhabited worlds
- `calculateStarport()` accepts `gdpPerDayOverride` from the active preset
- `generateShipsInTheArea()` accepts `preset`; Boat Years scarcity removed (QA-058)
- Generator options stored via `optionsStorage.ts`; old stored objects auto-merge with defaults (QA-037)

**Table weights (QA-051):**
`GeneratorOptions` now includes `developmentWeights`, `powerWeights`, `govWeights` for per-outcome 2D6 roll customization. Named weight presets (Mneme, CE, Stagnant) ship alongside the income presets.

### Hard Gates (QA-030 + QA-058)

Ships in the Area is hard-gated before any budget calculation:
- **Class X:** controlled by `allowShipsAtXPort` toggle (default `true` after QA-061). When false → zero ships.
- **Class E:** budget capped 10%, small craft only, max 5 ships

### Completed (2026-04-17)

- **QA-056 ✅:** `getGdpPerDayForWorld()` — GDP/day uses average SOC from Development + Wealth (v1.3.110)
- **QA-057 ✅:** `wealthMultiplier` removed from annual trade formula — double-counting eliminated (v1.3.111)
- **QA-058 ✅:** Ships in Area rework — Boat Years scarcity removed, X-port toggle, Credit display (v1.3.112)

### Remaining Open Work

- **QA-049:** Economic model toggle (Stable vs Compounding) — surface curve type as first-class Settings choice

### Recommendation for 2026 Book

Add Section 7.9: Economic Assumptions. Frame income as productivity (total output per person operating their TL's automation stack), not wages. Explain why compounding productivity affects carrying capacity (freed labor → human capital → further compounding) and why stagnant productivity caps population at habitability alone. Document the two canonical presets (Mneme compounding, CE flat), the Boat-Years calibration method, and the roll weight profiles. Note that the GDP/day table in §8a should match whichever preset a campaign uses. Reference the *Under Heaven Demographics* research for the real-world basis of the compounding thesis.

---

## 14. Population Redesign — Productivity-Ratio Model (QA-061 — 2026-04-17)

### Problem

The population system had a fundamental disconnect between economic presets and TL scaling:

1. **`TL_POP_MOD` was Mneme-only.** It added an exponent bonus of +5 to +13 regardless of economic preset. CE/Traveller worlds got the same trillion-person boosts as Mneme worlds — contradicting CE's flat-economy canon.
2. **`TL_POP_MOD` was far more aggressive than income.** At TL 16 it added `+13` to the exponent (×10 trillion), while Mneme's actual SOC-7 income ratio was ~389 000×. Population was scaling ~25 million times faster than productivity.
3. **`GDP_PER_DAY_BY_TL` was dead code** left over from before the preset system. Deleted.
4. **PSS thresholds were too steep.** With smaller populations, even productive worlds couldn't climb out of X/E.

### Fix — Productivity Ratio

```typescript
const productivityMultiplier =
  getSoc7MonthlyIncome(techLevel, preset) /
  getSoc7MonthlyIncome(preset.baseTL, preset);

// Natural world (envHab > 0):
const maxPopulation = Math.pow(10, envHab + 1) * productivityMultiplier * rollExploding(2, 6).value;
population = Math.max(10, Math.floor(roll3D6().value * maxPopulation * 0.05));

// Hostile world (envHab ≤ 0):
population = Math.max(10, Math.floor(habitatResult.population * productivityMultiplier));
```

- **CE preset:** `productivityMultiplier = 1.0` at every TL. Population depends purely on habitability.
- **Mneme preset:** follows the compounding income curve (1× at TL 7, ~389 000× at TL 16).
- **`+1` exponent** on `envHab` shifts CE populations up to playable Traveller scale (e.g. envHab 4 → ~360 000 people, not ~36 000).

### Fix — Revised PSS Thresholds

```typescript
if (pss < 3)  return 'X';
if (pss <= 4) return 'E';
if (pss <= 5) return 'D';
if (pss <= 6) return 'C';
if (pss <= 7) return 'B';
return 'A';
```

Each +1 PSS now advances exactly one starport class after E.

### Fix — Trade Fraction Variance

Trade fraction is no longer a fixed constant per development level. Each level now rolls a dice band:

| Development | Formula | Mean |
|---|---|---|
| UnderDeveloped | 5% (fixed) | 5% |
| Developing | 6.5% + 1D6 × 1% | 10% |
| Mature | 10% + 2D6 × 0.7% | 15% |
| Developed | 15% + 2D6 × 0.7% | 20% |
| Well Developed | 20% + 2D6 × 0.7% | 25% |
| Very Developed | 25% + 2D6 × 0.7% | 30% |

### Fix — Goal-Loop: Closest Match

The sector-dynamics goal-loop now generates up to 2 000 candidates, scores each by distance from goals (starport rank, population log-ratio, habitability gap), and returns the **closest match** even when no exact match exists.

### Expected Population Outcomes

| Scenario | Population | PSS | Class |
|---|---|---|---|
| CE TL 9, envHab 4, Mature/Average | ~360K | 2 | E |
| CE TL 9, envHab 6, Mature/Average | ~36M | 4 | E |
| CE TL 12, envHab 6, Developed/Prosperous | ~36M | 5 | D |
| Mneme TL 11, envHab 4, Mature/Average | ~7.2M | 4 | E |
| Mneme TL 11, envHab 6, Developed/Affluent | ~720M | 7 | B |
| Mneme TL 16, envHab 6, Very Developed/Affluent | ~14.4T | 11 | A |

### Recommendation for 2026 Book

Replace Section 7.2 population formula entirely with the productivity-ratio model. Provide a two-preset comparison table (CE vs Mneme) showing populations at the same habitability and TL.

---

## 15. Composition–Atmosphere–Biosphere Pipeline (FR-041 — Proposed)

> **Status:** Proposed — not yet implemented. Full design spec in `260417-03 MWG-REDESIGN-consolidated-v1.md` (supersedes FR-041/042/043 drafts).

### Original Book Rules

The book rolls atmosphere, temperature, hazard, and biochem as independent 2D6 lookups with no physical relationship between them. Atmosphere is a single roll producing a density tier (Trace/Thin/Average/Dense/Crushing). There is no composition model — all atmospheres are implicitly breathable or not. Biochemical resources has 5 tiers (Scarce/Rare/Uncommon/Abundant/Inexhaustible). There is no biosphere mechanic.

### Proposed Changes

Five major additions that restructure the mainworld pipeline:

**1. Composition (NEW — replaces Lesser Earth Type)**

Every Habitability Candidate rolls 3D6 on a 7-tier composition table (separate tables for Terrestrial and Dwarf). Composition determines:
- **Density range** (replaces flat density tables) — e.g., Iron-Silicate = 5.0–6.0 g/cm³, Hydrous = 2.5–3.8 g/cm³
- **Reactivity DM** — a modifier that propagates through atmosphere, biochem, and hazard rolls

The key insight: composition is the physical foundation. An Iron-Dominant world (Mercury-like, Reactivity −1) outgasses poorly and is sterile. A Hydrous/Ocean world (Reactivity +2) has deep water, volatile chemistry, and strong life prospects. The bell curve peaks at Silicate-Basaltic (Mars-type, 48.6%) — most rocky worlds are Mars-type, not Earth-type.

**2. Atmosphere Composition (NEW — abiotic gas table)**

A 3D6 table produces the world's **starting atmosphere in the absence of life**: Hydrogen-Helium, Methane/Ammonia, Nitrogen-Inert, Carbon Dioxide, Water Vapor, Sulfuric, or Exotic. Critically, **Nitrogen-Oxygen is absent from this table** — N-O atmospheres are a biosignature, achieved only through successful biological processing (see Biosphere below).

Atmosphere Density remains a separate 2D6 roll (Trace→Crushing) but now receives modifiers from composition reactivity and gravity.

**3. Biochem 11-tier Ladder (replaces 5-tier)**

3D6 + Reactivity DM produces an 11-tier scale from Scarce (−5) to Inexhaustible (+5), with Common (0) at the 3D6 peak. This is a symmetric linear ladder: 1 tier = 1 habitability point. The Reactivity DM means a Hydrous world (+2) statistically rolls 2 tiers higher — its chemistry biases toward life.

**4. Biosphere Test and Rating (NEW)**

Triggered when Biochem ≥ Common. Base roll is 5D6 dis+2 (= 7D6 keep lowest 5) against TN 20 (configurable). Each point of positive Biochem mod adjusts the dice pool by removing one dis level — the actual dice count changes: Common = 7D6 keep low 5 (dis+2), Abundant = 6D6 keep low 5 (dis+1), Rich = 5D6 plain (neutral), Bountiful = 6D6 keep high 5 (adv+1), Prolific = 7D6 keep high 5 (adv+2), Inexhaustible = 8D6 keep high 5 (adv+3, ~94% pass rate). The degree of success determines a B0–B6 Biosphere Rating:
- B0 (None) through B1 (Pre-Biotic): abiotic
- B2 (Microbial): trace biosignatures
- B3 (Photosynthetic): transitional atmosphere conversion begins
- B4 (Complex) through B5 (Advanced): **full Nitrogen-Oxygen atmosphere established**
- B6 (Post-Sapient): intelligence has emerged (+8 hab bonus)

**5. Atmosphere Conversion**

Biosphere ≥ B3 converts the abiotic atmosphere. CO₂ → transitional CO₂+O₂ at B3; CO₂ or N₂-Inert → **Nitrogen-Oxygen** at B4+. Sulfuric atmospheres partially reduce but cannot fully convert. This means breathable Earth-class atmospheres are **emergent** — they arise from biology, not from a lucky atmosphere roll.

### Net Result

Under default settings (Mneme Default: TN 20, dis+2, Common minimum), roughly **3–10% of candidate worlds** end up with N-O atmospheres. Under Rare Earth settings, < 1%. Under Panspermia, 15–30%.

### Extraterrestrial Life Assumptions

A new settings panel (parallel to Economic Presets) exposes: Biosphere TN (15–35), disadvantage (0–5), minimum biochem tier for trigger, transitional atmosphere toggle, biochem offset rule. Built-in presets: Mneme Default, Rare Earth, Panspermia.

### Recommendation for 2026 Book

Replace §6.2 (Lesser Earth Type) with Composition tables. Split §6.4 (Atmosphere) into Composition + Density. Expand §6.8 (Biochem) from 5-tier to 11-tier. Add new sections for Biosphere Test, Biosphere Rating, and Atmosphere Conversion. Add Extraterrestrial Life Assumptions sidebar explaining the configurable parameters. Include worked example showing the full chain from Iron-Silicate composition through to N-O atmosphere emergence.

---

## 16. Positioning System Redesign (FR-042 — Proposed)

> **Status:** Proposed — not yet implemented. Full design spec in `260417-03 MWG-REDESIGN-consolidated-v1.md` (supersedes FR-041/042/043 drafts).

### Original Book Rules

The book places the main world using a 25-combination atmosphere×temperature lookup table (REF-005) that maps to a zone. Planetary system bodies get individual zone assignments from REF-003, but there is no unified positioning mechanic, no conflict resolution, no ejection, and no disk-blocking. Hot Jupiter migration was a PWA-only addition (QA-011) that unconditionally cleared zones.

### Proposed Changes

**1. Unified 3D6 Position Roll (replaces REF-003 + REF-005)**

Every Level 1 INRAS body rolls a single 3D6 for zone placement. The bell curve naturally concentrates bodies in the Conservative zone (43.5%), matching the physical reality that most rocky worlds form near the habitable zone. Inner zones (Infernal 0.46%, Hot 15.3%) and outer placement (14.8%) are the tails.

**2. Inner + Outer Zone Architecture**

Inner system gains a **Cool** zone (Mars-like, √L × 1.2–2.0 AU) and a **Frost Line transition** (√L × 4.85 AU). Outer system splits into 5 geometrically-growing zones (O1–O5) from frost line to heliopause (120 × √L AU). Zone widths double at each step (3.125% → 50% of outer span) — O1 is dense (Kuiper Belt), O5 is sparse (Oort Cloud).

**3. 4-Phase Placement Algorithm**

- **Phase A (Anchors):** Largest Gas/Ice Giant placed at frost line with 3D6 jitter; largest Terrestrial rolls unified 3D6. Anchors establish the system's architecture before other bodies are placed.
- **Phase B (Disks first):** Disks placed before planets. A disk in a zone means planetary formation failed there — **Terrestrials are blocked** from disk-occupied zones (must reroll). Dwarfs coexist with disks (shepherd-moon-like gap clearing). This creates physically coherent systems: where disks are dense, planets didn't form.
- **Phase C (Remaining bodies, mass-descending):** Hill sphere conflict check at each placement. If blocked, reroll up to 5 times. After 5 failures → **ejection** (body becomes a rogue world). Ejections are intentional — rogue planets may outnumber bound planets 2:1 in the galaxy.
- **Phase D (Moons):** Level 2 bodies placed within parent's Hill sphere (separate Moons thread).

**4. Ice Worlds — Hard Outer-Only Rule**

Ice Worlds skip the unified 3D6 entirely and roll directly on the Outer zone table. The star strips volatiles from inner zones — icy material cannot survive there. This is a hard physical constraint, not a probability bias.

**5. Hot Jupiter — Reversed Stability Roll (replaces QA-011)**

The previous mechanic (QA-011: Gas Giant in inner zone unconditionally clears it) is replaced with a rarer, richer event:
- **Trigger:** Gas Giant rolls into inner zone AND all four inner zones are already filled (saturation)
- **Stability roll:** 5D6 keep lowest 3, TN 5. Stability is the default; only a failure (~5.5% per trigger) destabilizes.
- **Net frequency:** ~0.5–0.6% per system (matches real-world hot Jupiter observation ~1%)
- **Consequences when it fires:** Gas Giant migrates inward; bodies between original and final position are **consumed** (mass absorbed, density recalculated); bodies inside final position are **shepherded** inward (retain 74–94% of distance, stellar-class-dependent). If post-absorption mass ≥ 20 JM → Proto-Star trait. If ≥ 50 JM → Brown Dwarf promotion (Level 0 companion, proposed: relocated to standard outer orbit per REF-003 — open question, see FRD §14.3).

**6. Disk Generation Formula (replaces current)**

```
diskCount = floor( (sum of lowest 2 of 3D6 exploding) / 2 − 1 )
```

Stellar class modifier: M-class = Dis+1 (fewer disks), O-class = Adv+4 (more disks). Hotter stars produce more disks because radiation prevents planetary coalescence.

### Data Model Additions

- `OuterZoneBoundaries` (O1–O5 with minAU/maxAU)
- `ZoneId` expanded: `'Infernal' | 'Hot' | 'Conservative' | 'Cool' | 'FrostLine' | 'O1' | 'O2' | 'O3' | 'O4' | 'O5'`
- `StarSystem.ejectedBodies: Body[]` — rogue worlds from saturation
- `StarSystem.consumedBodies: Body[]` — bodies absorbed by Hot Jupiter
- `StarSystem.heliopauseAU`, `StarSystem.frostLineAU`
- `Body.positionRoll`, `Body.positionRerollCount`, `Body.wasEjected`, `Body.ejectionReason`

### Recommendation for 2026 Book

Replace §8 (Planetary System Generation) with the 4-phase placement algorithm. Add the unified 3D6 position table. Add the outer zone architecture. Replace the Hot Jupiter clearing rule with the stability-roll mechanic. Add a "Rogue Worlds" sidebar explaining ejection. Add disk-blocking rule to the circumstellar disk section. Include the worked example from the design spec.

---

## 17. Habitability Application & Mainworld Selection (FR-043 — Proposed)

> **Status:** Proposed — not yet implemented. Full design spec in `260417-03 MWG-REDESIGN-consolidated-v1.md` (supersedes FR-041/042/043 drafts).

### Original Book Rules

The book generates the mainworld first as an independent step, then fills the system around it. Habitability is a single sum of gravity + atmosphere + temperature + hazard + intensity + biochem + TL. There is no biosphere mechanic, no candidate ranking, and no selection from system-wide bodies. TL is included in the habitability score from the start.

### Proposed Changes

**1. System-first generation with competitive mainworld selection**

Under the new flow, every Dwarf and Terrestrial body (Level 1 and Level 2) runs through a 10-step habitability waterfall. The body with the highest **Baseline Habitability** wins and becomes the mainworld. A Hydrous Dwarf moon of a Gas Giant can beat an inner-system Terrestrial if its score is higher — Europa-archetypes are legitimate mainworld candidates.

**2. TL separated from Baseline Habitability**

TL Modifier (`max(0, min(9, TL − 7))`) applies only after mainworld selection during the Inhabitants pass. Baseline Habitability is the **natural** score — purely physical. This preserves selection purity: we pick the most physically habitable world, not the most tech-augmented one.

**3. Temperature heavily modified by zone**

Temperature gains stacked DMs from zone placement (Infernal +5 through O5 −8), atmosphere composition (CO₂ +1, Steam +2), atmosphere density (greenhouse: Crushing +2, Trace −2), and Proto-Star heat (+1 to +3 for moons of Proto-Star parents). Shepherded bodies re-roll temperature with their new zone DM.

**4. Biosphere Test gains Temperature dice adjustment**

The biosphere roll's dice pool is modified by temperature: Average gives adv+2 (life thrives in liquid water), Cold/Hot gives dis+2, Freezing/Inferno gives dis+3. Combined with Biochem adjustment, this creates a nuanced probability surface where the "sweet spot" is Average temperature + high Biochem + reactive composition.

**5. Subsurface Ocean Override (Europa-type worlds)**

Hydrous/Volatile-Rich bodies that are Freezing/Cold AND have tidal heating (Proto-Star parent or Gas Giant innermost moon slot) halve the temperature dice penalty. This permits Europa/Enceladus-archetype biospheres in subsurface oceans despite surface freeze — life is unlikely but possible (~5%).

**6. Revised gravity ladder (symmetric)**

| Gravity | Hab Mod |
|---|---|
| 0.0–0.1G | −3 |
| 0.1–0.3G | −2 |
| 0.3–0.7G | −1 |
| 0.7–1.3G | 0 (ideal) |
| 1.3–1.7G | −1 |
| 1.7–2.5G | −2 |
| ≥2.5G | −3 |

Symmetric around Earth-like. Replaces the current asymmetric thresholds from QA-023.

**7. Revised hazard table**

Hazard roll is modified by Reactivity DM + atmosphere hazard bias. New mapping: ≤3→None, 4–6→Polluted, 7–8→Corrosive, 9→Biohazard, 10→Toxic, 11–12→Radioactive. Higher rolls = worse hazards (Reactivity pushes up). Hazard Intensity renamed: Trace/Light/Moderate/Heavy/Extreme (was Very Mild/Mild/Serious/High/Intense).

**8. Mainworld selection with tiebreakers**

When Baseline Habitability scores are tied: (1) higher Biosphere Rating wins, (2) better composition quality wins (Iron-Silicate > Hydrous > Silicate-Basaltic for Terrestrials), (3) larger mass wins, (4) random. If no candidate scores > 0, MVT/GVT fallback triggers — highest-scoring body (even negative) becomes mainworld with artificial habitats.

**9. Atmosphere composition habitability modifiers**

Abiotic atmospheres carry hab penalties: CO₂ −1, Steam −2, Sulfuric −3, Exotic −3. Post-biosphere N-O conversion removes the penalty (0 mod). This means biosphere-converted worlds get a small hab boost from the atmosphere-mod delta.

### Data Model Additions

- `Body.baselineHabitability` — natural score without TL
- `Body.habitabilityBreakdown` — per-component mod breakdown (gravity, atmosphereComp, atmosphereDensity, temperature, hazard, hazardIntensity, biochem, biosphere)
- `Body.atmosphereCompositionAbiotic` — pre-conversion atmosphere (preserved for display)
- `Body.wasSelectedAsMainworld`, `Body.hasSubsurfaceOceanOverride`, `Body.wasShepherded`
- `StarSystem.mainworldId` — winning body ID
- `StarSystem.mainworldSelectionLog` — candidate list with scores/ranks, tiebreaker flag, fallback flag

### Recommendation for 2026 Book

Replace §6 (Main World Generation) entirely with the Habitability Waterfall. Add the zone temperature DM table. Add the biosphere temperature dice adjustment sidebar. Add a "Mainworld Selection" section explaining competitive scoring across all system bodies. Add a "Subsurface Ocean" sidebar for Europa-archetype worlds. Split "Habitability" into Baseline (physical) and Effective (with TL), and explain why TL is applied only after selection. Include the worked example showing how two candidates compete.

---

## Implementation Notes for Developers

### Key Files
- `src/lib/worldData.ts` — All tables and modifiers
- `src/lib/generator.ts` — Pipeline orchestration
- `src/lib/stellarData.ts` — Star properties
- `src/types/index.ts` — Type definitions

### Statistical Validation
Use Debug Batch Export (DEV mode) to generate 40+ systems and verify:
- Body counts by stellar class match expected ranges
- Mean habitability > 0
- Temperature distribution includes some Average results
- Hot Jupiter systems appear (8-15% of all systems)

### QA Tracking
All fixes tracked in `QA.md` with IDs QA-001 through QA-023.

---

## INTRAS Terminology & Data Model Lock (2026-04-17)

The following definitions and type-system sketch were locked during the FR-031 / INTRAS (IntRAstellar) architecture refactor. They govern how all bodies — stars, planets, moons, rings, and disks — are modelled in the unified `Body[]` pipeline.

### Locked: Disks (Level 1)

We keep the current roll flow — count and position are both rolled — just slotted into the new "whole system first" pipeline. The existing REF-009 disk-zone table doesn't need to change structurally.

### Locked: Rings (Level 2)

Rings are **children of a Parent INRAS**, same level as moons, with two rolls:
1. **Existence** — probability roll per Parent INRAS (trigger threshold TBD, likely something like natural 11+ on 2D6, or a per-parent-type target like the Companion Star mechanic)
2. **Density/size** — a total-density roll that determines the ring's extent (narrow dusty band vs Saturn-class showpiece)

Rings are not habitability candidates. They're a flavor child with physical presence but no inhabitants.

### Full locked glossary

| Term | Definition |
|---|---|
| **Level 0 — Stars** | Primary and Companion stars. Governed by REF-002 chain rule. |
| **Level 1 — INRAS (IntRAstellar)** | Any body orbiting a Level-0 star. Disks, Dwarfs, Terrestrials, Ice Worlds, Gas Worlds. |
| **Level 2 — Children / Moons** | Bodies orbiting a Parent INRAS. Rings, Dwarfs, and rarely Terrestrials (Giants only). |
| **Parent INRAS** | Level-1 body large enough to host children. Terrestrials, Ice Worlds, Gas Worlds. |
| **Disks** | Accretion / asteroid belt material. Sub-Dwarf aggregate mass at Level 1, with rolled count and position per zone. |
| **Rings** | Level-2 child of a Parent INRAS. Rolled for existence and total density. |
| **Habitability Candidate** | Any Dwarf or Terrestrial body at Level 1 or Level 2. These get the full habitability stack calculated. |
| **Mainworld** | The Habitability Candidate with the highest computed baseline habitability, selected after full system generation. |
| **Parent-Child Limit** | Generalized constraint (from REF-002) preventing a child from being comparable to or larger than its parent. Applied to moon size vs parent, companion star size vs primary, etc. |

### Type-system sketch

```typescript
type OrbitLevel = 0 | 1 | 2
type BodyType = 'star' | 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas' | 'ring'

interface Body {
  id: string
  type: BodyType
  level: OrbitLevel
  parentId?: string         // Star ID for Level 1, Body ID for Level 2; undefined for Level 0 (stars)
  // ... physical properties
}

// Convenience: "is this a candidate worth computing habitability for?"
const isHabitabilityCandidate = (b: Body) =>
  (b.type === 'dwarf' || b.type === 'terrestrial') &&
  (b.level === 1 || b.level === 2)

// Convenience: "can this body host children?"
const canHostChildren = (b: Body) =>
  b.level === 1 && (b.type === 'terrestrial' || b.type === 'ice' || b.type === 'gas')
```

The current codebase has separate arrays (`dwarfPlanets`, `terrestrialWorlds`, `iceWorlds`, `gasWorlds`, `circumstellarDisks`) on `StarSystem`. Under the new model, we'd flatten to a single `bodies: Body[]` array and derive the grouped views through filters. This makes the "iterate all habitability candidates" step trivially easy, which is exactly what we need for the "pick best habitable" pipeline.

---

**Document Version:** 1.9 (2026-04-17 — §17 FR-043 Habitability Application & Mainworld Selection proposed (10-step waterfall, TL separated, temperature zone DMs, biosphere-temperature link, subsurface ocean override, competitive selection); summary table expanded with 7 habitability rows)  
**Prepared for:** 2026 Mneme CE World Generator Book Update  
**Author:** PWA Development Team
