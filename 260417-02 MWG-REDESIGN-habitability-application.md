# MWG Redesign — Habitability Application & Mainworld Selection

**Status:** Draft v0.1 — awaiting review
**Date:** 2026-04-17
**Author:** Design consolidation from design session with Justin
**Depends on:** Terminology (Level 0/1/2) + Composition/Atmosphere/Biosphere + Moons/Parent-Child Limit + Positioning
**Part of:** Redesign sequence — Habitability (this doc) → Habitats → Megastructures

---

## 1. Context

This is the **selection pipeline** that runs after all bodies are generated and positioned. For every Habitability Candidate (Dwarf or Terrestrial at Level 1 or Level 2), we compute a Baseline Habitability score, rank candidates, and select the winner as the Mainworld.

This replaces the old "mainworld first, fill system around it" approach. Under the new flow, the mainworld *emerges* from full-system generation — whichever body scored highest on natural habitability. This is more physically honest and produces a broader range of mainworld archetypes (planet-surface worlds, habitable moons of Gas Giants, subsurface-ocean Dwarfs).

---

## 2. The Habitability Waterfall — Pipeline Overview

```
Pre-computed (prior threads)
├── Mass, Composition, Density, Gravity, Radius
├── Zone assignment (Inner / Frost Line / Outer sub-zone)
└── Parent info (Proto-Star flag, Gas Giant parent, tidal heating context)
                                │
                                ▼
Step 1: Atmosphere Composition (3D6, abiotic table)
Step 2: Atmosphere Density (2D6 + modifiers)
Step 3: Temperature (2D6 + zone + atmo + Proto-Star heat)
Step 4: Hazard (2D6 + Reactivity)
Step 5: Hazard Intensity (2D6)
Step 6: Biochem Resources (3D6 + Reactivity DM)
Step 7: Biosphere Test (5D6 dis+2 + Biochem dice adjustment + Temperature dice adjustment)
Step 8: Biosphere Rating (B0–B6 based on roll margin vs TN)
Step 9: Atmosphere Conversion (if B3+, apply biosignature)
Step 10: Baseline Habitability Score (sum of all mods, NO TL)
                                │
                                ▼
Selection: Highest Baseline Habitability wins → Mainworld
                                │
                                ▼
Post-selection: Inhabitants generation (TL applied), Effective Habitability (Baseline + TL)
```

**Important:** TL Modifier is **not** part of Baseline Habitability. It applies only after mainworld selection, during the Inhabitants generation pass. This preserves the "natural habitability" purity of the selection mechanic — we pick the most physically habitable world, not the world with the most tech augmentation.

---

## 3. Step 1 — Atmosphere Composition (3D6, abiotic table)

Unchanged from prior thread.

| 3D6 | Primary Gas | Temperature DM | Habitability Mod |
|---|---|---|---|
| 3 | Hydrogen-Helium | −2 | +0 (auto-escape if low grav) |
| 4–5 | Methane / Ammonia | −1 | −1 (toxic) |
| 6–8 | Nitrogen-Inert | 0 | 0 |
| 9–12 | Carbon Dioxide | +1 | −1 (not breathable) |
| 13–15 | Water Vapor / Steam | +2 | −2 (wet, unbreathable) |
| 16–17 | Sulfuric | +2 | −3 (corrosive + toxic) |
| 18 | Exotic | variable | −3 |

**H-He auto-escape:** If roll = 3 AND gravity < 1.5G → force atmosphere to Trace and composition to "None (residual H-He)."

---

## 4. Step 2 — Atmosphere Density (2D6 + modifiers)

| 2D6 | Density | Habitability Mod |
|---|---|---|
| 2–3 | Trace / None | −3 (no atmosphere retention) |
| 4–5 | Thin | −1 |
| 6–9 | Average | 0 |
| 10–11 | Dense | −1 |
| 12 | Crushing | −3 |

**Modifiers to the roll:**

| Condition | DM |
|---|---|
| Composition Reactivity ≥ +2 | +1 |
| Composition Reactivity ≤ −1 | −1 |
| Gravity ≥ 2G | +2 |
| Gravity ≤ 0.3G | −2 |
| Composition = Ceramic (no magnetic field) | −1 |
| H-He atmosphere + gravity < 1.5G | Force result to 2 (Trace) |

---

## 5. Step 3 — Temperature (2D6 + stacked modifiers)

Temperature is the most heavily-modified roll in the waterfall, combining zone, atmosphere, and Proto-Star effects.

### Base 2D6 Result Mapping

| 2D6 (modified) | Temperature | Habitability Mod |
|---|---|---|
| ≤ 3 | **Freezing** | −5 |
| 4–5 | **Cold** | −2 |
| 6–9 | **Average** | 0 |
| 10–11 | **Hot** | −2 |
| ≥ 12 | **Inferno** | −5 |

### Zone DM

| Zone | Temperature DM |
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

### Atmosphere Composition DM

Per step 1: H-He −2, Methane −1, N-Inert 0, CO₂ +1, Steam +2, Sulfuric +2.

### Atmosphere Density DM (greenhouse effect)

| Density | Temp DM |
|---|---|
| Trace | −2 (no retention) |
| Thin | −1 |
| Average | 0 |
| Dense | +1 |
| Crushing | +2 |

### Proto-Star Heat DM (Level 2 children of Proto-Star parents only)

| Distance from Proto-Star | Heat DM |
|---|---|
| Inner moon slot | +3 |
| Middle moon slot | +2 |
| Outer moon slot | +1 |

### Shepherded Body Re-evaluation

If the body was shepherded inward during a Hot Jupiter Event, its AU has decreased and its zone label updated. Temperature is **re-rolled** with the new zone DM applied — shepherded bodies can dramatically shift from Cool to Hot or Hot to Inferno.

---

## 6. Step 4 — Hazard (2D6 + Reactivity DM + Zone Radiation DM)

| 2D6 (modified) | Hazard Type | Habitability Mod |
|---|---|---|
| ≤ 3 | None | 0 |
| 4–6 | Polluted | −1 |
| 7–8 | Corrosive | −2 |
| 9 | Biohazard | −2 |
| 10 | Toxic | −3 |
| 11–12 | Radioactive | −4 |

**Modifiers:**
- Composition Reactivity DM adds to roll (more reactive compositions produce more hazardous outcomes)
- Atmosphere Composition Hazard Bias stacks (Sulfuric +2 Corrosive +1 Toxic, etc.)
- **Zone Radiation DM** stacks (see table below) — captures stellar UV/X-ray flux, solar-wind erosion, and atmospheric stripping for inner-zone bodies.

### Zone Radiation Hazard DM

Added 2026-04-27 to address the design gap where zone position only affected temperature. Inner zones now carry a hazard cost; outer zones do not (see `260427-01` for full rationale and Option 3's deliberate no-op).

| Zone | Hazard DM | Justification |
|---|---|---|
| Infernal | **+2** | Direct stellar exposure; intense UV/X-ray; coronal mass ejection impact; atmospheric stripping |
| Hot | **+1** | Significant stellar wind erosion; periodic flare exposure |
| Conservative | 0 | Earth-like; magnetosphere assumed effective |
| Cool | 0 | Reduced flux; neutral |
| Frost Line | 0 | Negligible stellar effects |
| O1 | 0 | Stellar contribution negligible (GCR not modelled at this fidelity) |
| O2 | 0 | — |
| O3 | 0 | — |
| O4 | 0 | — |
| O5 | 0 | — |

**Effect:** an Infernal-zone world rolls 2D6 + Reactivity + atmo bias **+ 2** for hazard, biasing toward Toxic / Radioactive. Hot is +1. All other zones are +0. The Reactivity and atmosphere-bias modifiers stack on top.

---

## 7. Step 5 — Hazard Intensity (2D6)

| 2D6 | Intensity | Habitability Mod (stacks with Hazard) |
|---|---|---|
| 2–3 | Trace | 0 |
| 4–6 | Light | 0 |
| 7–9 | Moderate | −1 |
| 10–11 | Heavy | −2 |
| 12 | Extreme | −3 |

---

## 8. Step 6 — Biochem Resources (3D6 + Reactivity DM)

Unchanged from prior thread. 11-tier ladder with Common at 10–11.

| 3D6 (modified) | Tier | Hab Mod |
|---|---|---|
| 3 | Scarce | −5 |
| 4 | Rare | −4 |
| 5 | Uncommon | −3 |
| 6–7 | Poor | −2 |
| 8–9 | Deficient | −1 |
| **10–11** | **Common** | **0** |
| 12–13 | Abundant | +1 |
| 14 | Rich | +2 |
| 15 | Bountiful | +3 |
| 16 | Prolific | +4 |
| 17–18 | Inexhaustible | +5 |

**Composition Reactivity DM is added to the 3D6 sum before looking up the tier.**

---

## 9. Step 7 — Biosphere Test (dice pool modification)

**Trigger:** Biochem tier is Common or higher (configurable via Life Assumptions preset, default "Common").

**Base pool:** 5D6. The pool is modified by disadvantage/advantage levels: each dis level adds 1 die and keeps the lowest 5; each adv level adds 1 die and keeps the highest 5. See consolidated spec §3.5 for the full formula.

### Dice Pool Modifiers

Three sources adjust the dice pool BEFORE rolling:

**(A) Biochem Tier Adjustment** — positive Biochem mod reduces disadvantage level:

| Biochem Mod | Dice Adjustment |
|---|---|
| +0 (Common) | −0 (base dis+2 stays) |
| +1 (Abundant) | −1 dis level (becomes dis+1) |
| +2 (Rich) | −2 dis levels (becomes neutral) |
| +3 (Bountiful) | −3 → adv+1 |
| +4 (Prolific) | −4 → adv+2 |
| +5 (Inexhaustible) | −5 → adv+3 |

**(B) Temperature Dice Adjustment** — liquid water drives biosphere development:

| Temperature | Dice Adjustment |
|---|---|
| Freezing | +3 dis levels |
| Cold | +2 dis levels |
| Average | **−2 dis levels (adv+2)** |
| Hot | +2 dis levels |
| Inferno | +3 dis levels |

**(C) Habitable-Zone Biosphere Bonus** — Conservative-zone bodies with sufficient organic feedstock get a small dice-pool advantage. Added 2026-04-27 (`260427-01`); makes the HZ mechanically distinct from "lucky elsewhere."

**Trigger (BOTH required):**
- Zone is `Conservative`
- Biochem tier ≥ `Common` (after Reactivity DM)

**Effect:** `disLevel −= 1` (one die shifts from disadvantage toward advantage). Stacks with the Biochem and Temperature adjustments.

**Why gated on biochem:** an HZ rock without organic chemistry still cannot grow life. The bonus rewards worlds with **both** the right place **and** the right chemistry, not just orbital luck.

**(D) Subsurface Ocean Override** — Hydrous/Volatile-Rich Dwarfs with tidal heating halve the Temperature penalty:

**Trigger (all three required):**
- Composition ∈ {Hydrous/Icy-Rock, Volatile-Rich} (Dwarf) OR {Hydrous/Ocean} (Terrestrial)
- Temperature ∈ {Cold, Freezing}
- Body has tidal heating: Proto-Star parent OR Gas Giant parent with innermost moon slot

**Effect:** Temperature's dis-level is halved, rounded toward less severe:
- Freezing dis+3 → dis+2 (halved)
- Cold dis+2 → dis+1 (halved)

This permits Europa/Enceladus-archetype biospheres in subsurface oceans despite surface freeze.

### Combined Dice Pool — Examples

```
Example 1: Ideal Terrestrial
Composition: Iron-Silicate (+1 Reactivity)
Biochem roll: 3D6 + 1 = 12 → Abundant (+1)
Temperature: Average → adv+2
Biosphere pool: base dis+2, −1 (Biochem), −2 (Temperature Average) = net adv+1
Dice: 6D6 keep high 5, mean ~19.7, P(≥ TN 20) ≈ 68%

Example 2: Frozen Europa Dwarf
Composition: Hydrous (+2 Reactivity)
Biochem roll: 3D6 + 2 = 13 → Abundant (+1)
Temperature: Freezing → dis+3
Subsurface override: Hydrous + Freezing + Gas Giant inner moon → halved to dis+2
Biosphere pool: base dis+2, −1 (Biochem), +2 (Temperature, halved) = net dis+3
Dice: 6D6 keep low 5, mean ~13.3, P(≥ TN 20) ≈ 5%
(Europa-archetype: life possible but uncommon)

Example 3: Desert Mars
Composition: Silicate-Basaltic (0 Reactivity)
Biochem roll: 3D6 = 10 → Common (0)
Temperature: Cold → dis+2
Biosphere pool: base dis+2, +0 (Biochem), +2 (Temperature) = net dis+4
Dice: 7D6 keep low 5, mean ~12.4, P(≥ TN 20) ≈ 2%
(Mars-archetype: biosphere very unlikely)
```

---

## 10. Step 8 — Biosphere Rating (B0–B6)

Based on Biosphere roll margin versus TN.

| Roll vs TN | Rating | Description | Habitability Mod |
|---|---|---|---|
| Roll < TN − 5 | **B0 — None** | Abiotic | 0 |
| TN − 5 to TN − 1 | **B1 — Pre-Biotic** | Organic chemistry | 0 |
| TN to TN + 2 | **B2 — Microbial** | Anaerobic prokaryotes | +1 |
| TN + 3 to TN + 5 | **B3 — Photosynthetic** | Active atmospheric processing | +2 |
| TN + 6 to TN + 8 | **B4 — Complex** | Post-Cambrian multicellular | +4 |
| TN + 9 to TN + 11 | **B5 — Advanced** | Gaia-regulated ecosystems | +6 |
| Roll ≥ TN + 12 | **B6 — Post-Sapient** | Intelligence emerged | +8 |

B6 gives the habitability bonus only — it does NOT auto-generate Inhabitants. That remains a separate step after mainworld selection.

---

## 11. Step 9 — Atmosphere Conversion

If Biosphere Rating ≥ B3, convert abiotic atmosphere per this matrix:

| Abiotic Atmosphere | B3 (Transitional) | B4+ (Oxygenated) |
|---|---|---|
| H-He | No change (gas giant moons only) | No change |
| Methane / Ammonia | Transitional CH₄+O₂ | Nitrogen-Inert (anaerobic conversion) |
| Nitrogen-Inert | No change | **Nitrogen-Oxygen** |
| Carbon Dioxide | CO₂ + 1–10% O₂ | **Nitrogen-Oxygen** |
| Water Vapor / Steam | Humid CO₂ + O₂ | Humid Nitrogen-Oxygen |
| Sulfuric | Sulfuric (traces reduced) | CO₂ (partial reduction) |
| Exotic | Variable | Variable |

**Important:** Atmosphere Conversion does NOT retroactively affect Temperature. Temperature was already rolled with the abiotic atmosphere's DM applied. The conversion creates a cosmetic/narrative difference but Temperature stays.

**BUT** the converted atmosphere composition DOES modify the final Habitability Score's atmosphere mod. An N-O converted world gets 0 atmo habitability mod (vs CO₂'s −1), so Biosphere-converted worlds get a small habitability boost from the atmosphere-mod delta.

---

## 12. Step 10 — Baseline Habitability Score

Sum all habitability modifiers:

```
Baseline Habitability =
    Gravity mod            (physics-driven, see below)
  + Atmosphere Composition mod (post-conversion)
  + Atmosphere Density mod
  + Temperature mod
  + Hazard mod
  + Hazard Intensity mod
  + Biochem mod
  + Biosphere Rating mod
```

### Gravity Modifier (from physics)

| Gravity (G) | Habitability Mod |
|---|---|
| 0.0 – 0.1 | −3 (microgravity, can't retain atmosphere) |
| 0.1 – 0.3 | −2 |
| 0.3 – 0.7 | −1 |
| 0.7 – 1.3 | 0 (Earth-like, ideal) |
| 1.3 – 1.7 | −1 |
| 1.7 – 2.5 | −2 |
| ≥ 2.5 | −3 (crushing weight) |

Uses QA-023's density-derived physics.

---

## 13. Step 11 — Mainworld Selection

### Selection Rule — Pure Score

**The candidate with the highest Baseline Habitability wins, regardless of Level 1 vs Level 2.**

A Hydrous Dwarf moon of a Gas Giant can absolutely beat an inner-system Terrestrial if its Baseline Habitability scores higher. Europa-archetypes are legitimate mainworld candidates.

### Tiebreakers (when scores are equal)

In priority order:

1. **Biosphere Rating** — higher B-number wins (B5 beats B4)
2. **Composition Quality** — preference order: Iron-Silicate > Hydrous > Silicate-Basaltic > Carbonaceous > others (Terrestrial); Hydrous > Volatile-Rich > Carbonaceous > Silicaceous > others (Dwarf)
3. **Mass** — larger wins (more resources)
4. **Random** — final tiebreaker

### Habitability Threshold for "No Habitable Candidate"

If no candidate scores Baseline Habitability > 0 (all worlds are marginally hostile), trigger the **MVT/GVT Habitat path**:

1. Highest-scoring body (even negative) becomes the mainworld
2. Inhabitants live in artificial structures — domed, buried, or orbital habitats
3. Habitat Type is rolled from the MVT/GVT table (existing behavior)
4. Population scales by the artificial-habitat model

If the Megastructures toggle is enabled (Compounding economics required), artificial Habitats enter the candidate pool at this point — they become competitive candidates or the fallback.

---

## 14. Step 12 — Post-Selection (Inhabitants & TL)

Once the mainworld is selected, Inhabitants are generated using the existing pipeline:

- TL rolled based on world conditions and founding era
- Population computed from Baseline Habitability + TL productivity multiplier (QA-061)
- Government, culture, starport — existing mechanics
- **Effective Habitability** = Baseline + TL Modifier (used for population/economics display)

The TL Modifier (max(0, min(9, TL − 7))) is applied here, NOT during selection.

---

## 15. Data Model Additions

```typescript
interface Body {
  // ... existing fields

  // Habitability waterfall outputs
  atmosphereComposition: AtmosphereComp
  atmosphereCompositionAbiotic: AtmosphereComp  // pre-conversion
  atmosphereDensity: AtmoDensity
  temperature: Temperature
  hazard: Hazard
  hazardIntensity: HazardIntensity
  biochem: BiochemTier
  biosphereRating: 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6'
  biosphereRoll: number
  biosphereTN: number  // preset used for this calculation

  // Score breakdown
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

  // Selection metadata
  wasSelectedAsMainworld: boolean
  tiebreakerRank?: number  // if tied, position in tiebreaker sort

  // Flags
  hasSubsurfaceOceanOverride: boolean  // trigger fired?
  wasShepherded: boolean                // Hot Jupiter shepherding?

  // Zone radiation + HZ biosphere bonus (260427-01)
  zoneHazardDM?: number                  // applied at step 4 (Hazard)
  hzBiosphereBonusApplied?: boolean      // true if Conservative + biochem ≥ Common
}

interface StarSystem {
  // ... existing fields
  mainworldId: string              // winning body
  mainworldSelectionLog: {         // for debugging/display
    candidates: Array<{ id: string; score: number; rank: number }>
    tiebreakerApplied: boolean
    fallbackTriggered: boolean
    fallbackReason?: string
  }
}
```

---

## 16. Full Pseudocode

```typescript
function computeBaselineHabitability(body: Body, system: StarSystem, preset: LifeAssumptions) {
  // Step 1: Atmosphere Composition
  const atmoComp = rollAtmosphereComposition()
  if (atmoComp === 'H-He' && body.gravity < 1.5) {
    body.atmosphereComposition = 'None (residual)'
    body.atmosphereDensity = 'Trace'
  } else {
    body.atmosphereCompositionAbiotic = atmoComp
  }

  // Step 2: Atmosphere Density
  const densityRoll = roll2D6() + computeDensityModifiers(body)
  body.atmosphereDensity = lookupAtmoDensity(densityRoll)

  // Step 3: Temperature
  const tempRoll = roll2D6() + computeTemperatureModifiers(body, system)
  body.temperature = lookupTemperature(tempRoll)

  // Step 4: Hazard
  const hazardRoll = roll2D6() + getReactivityDM(body.composition) + getAtmoHazardBias(atmoComp)
  body.hazard = lookupHazard(hazardRoll)

  // Step 5: Hazard Intensity
  body.hazardIntensity = lookupHazardIntensity(roll2D6())

  // Step 6: Biochem
  const biochemRoll = roll3D6() + getReactivityDM(body.composition)
  body.biochem = lookupBiochemTier(biochemRoll)

  // Step 7–8: Biosphere Test + Rating
  if (meetsBiosphereTrigger(body.biochem, preset.minBiochemForBiosphereRoll)) {
    const dicePool = computeBiospherePool(body, preset)  // applies all dice modifications
    const biosphereResult = rollDicePool(dicePool)
    body.biosphereRoll = biosphereResult
    body.biosphereTN = preset.biosphereTN
    body.biosphereRating = computeBiosphereRating(biosphereResult, preset.biosphereTN)
  } else {
    body.biosphereRating = 'B0'
  }

  // Step 9: Atmosphere Conversion
  body.atmosphereComposition = applyAtmosphereConversion(
    body.atmosphereCompositionAbiotic,
    body.biosphereRating
  )

  // Step 10: Baseline Habitability
  body.baselineHabitability = sumHabitabilityMods(body)
  body.habitabilityBreakdown = computeHabitabilityBreakdown(body)
}

function computeBiospherePool(body: Body, preset: LifeAssumptions): DicePool {
  let disLevel = preset.biosphereDisadvantage  // default 2

  // Biochem offset
  const biochemMod = getBiochemHabMod(body.biochem)
  if (biochemMod > 0) disLevel -= biochemMod

  // Temperature adjustment
  const tempAdjust = getTemperatureDiceAdjust(body.temperature)  // dis or adv levels

  // Subsurface override
  const hasSubsurface = checkSubsurfaceOverride(body)
  const effectiveTempAdjust = hasSubsurface ? Math.ceil(tempAdjust / 2) : tempAdjust

  disLevel += effectiveTempAdjust

  return buildDicePool(disLevel)  // translates to 5Dn keep low/high or straight
}

function selectMainworld(system: StarSystem): string {
  const candidates = system.bodies.filter(isHabitabilityCandidate)

  // Sort by Baseline Habitability (descending), then tiebreakers
  candidates.sort((a, b) => {
    if (a.baselineHabitability !== b.baselineHabitability) {
      return b.baselineHabitability - a.baselineHabitability
    }
    // Tiebreaker 1: Biosphere Rating
    const aB = biosphereRatingValue(a.biosphereRating)
    const bB = biosphereRatingValue(b.biosphereRating)
    if (aB !== bB) return bB - aB

    // Tiebreaker 2: Composition quality
    const aC = compositionQualityRank(a.composition)
    const bC = compositionQualityRank(b.composition)
    if (aC !== bC) return bC - aC

    // Tiebreaker 3: Mass
    if (a.massEM !== b.massEM) return b.massEM - a.massEM

    // Tiebreaker 4: Random
    return random() - 0.5
  })

  const winner = candidates[0]

  // Check fallback condition
  if (!winner || winner.baselineHabitability <= 0) {
    triggerMVTGVTFallback(system, winner)
  } else {
    winner.wasSelectedAsMainworld = true
    system.mainworldId = winner.id
  }

  // Log selection for UI/debugging
  system.mainworldSelectionLog = {
    candidates: candidates.map((c, rank) => ({
      id: c.id,
      score: c.baselineHabitability,
      rank: rank + 1,
    })),
    tiebreakerApplied: hasTies(candidates),
    fallbackTriggered: !winner || winner.baselineHabitability <= 0,
  }

  return winner.id
}

function isHabitabilityCandidate(body: Body): boolean {
  return (body.type === 'dwarf' || body.type === 'terrestrial')
    && (body.level === 1 || body.level === 2)
}
```

---

## 17. Worked Example — G-class system

**System setup:**
- G2V star
- Level 1 Terrestrial (Earth-like, 1 EM, Iron-Silicate, Conservative zone)
- Level 1 Gas Giant (1 JM, Class I Ammonia, Frost Line anchor)
- Level 2 Hydrous Dwarf moon of Gas Giant (1 LM, Hydrous, Cold temp from outer zone)

**Candidate 1 — Terrestrial (Earth-like):**
- Composition: Iron-Silicate (+1 Reactivity), density 5.5 g/cm³
- Gravity: 1.0G (+0 hab)
- Atmosphere Comp rolled 9 → CO₂ (temp DM +1, hab −1)
- Atmosphere Density rolled 7 + 0 mods = 7 → Average (hab 0, temp 0)
- Temperature: 2D6 = 8 + 0 (zone Conservative) + 1 (CO₂) + 0 (Average dens) = 9 → Average (hab 0, biosphere adv+2)
- Hazard: 2D6 + 1 (Reactivity) = 5 → Polluted (hab −1)
- Hazard Intensity: 2D6 = 6 → Light (hab 0)
- Biochem: 3D6 + 1 = 11 → Common (hab 0)
- Biosphere triggered (Common). Pool: dis+2 base, +0 Biochem, −2 Temp = neutral. Roll 5D6 = 18 (TN 20, missed by 2) → B1 Pre-Biotic (hab 0)
- Atmosphere stays CO₂ (no conversion)
- **Baseline: 0 (grav) − 1 (atmo CO₂) + 0 (density) + 0 (temp) − 1 (hazard) + 0 (intensity) + 0 (biochem) + 0 (biosphere) = −2**

Ouch — this Earth-like world missed biosphere and scored negative.

**Candidate 2 — Hydrous Dwarf Moon (Europa):**
- Composition: Hydrous (+2 Reactivity), density 1.8 g/cm³
- Gravity: 0.15G (hab −2)
- Atmosphere Comp rolled 13 → Steam (temp +2, hab −2)
- Atmosphere Density rolled 6 + 1 (Reactivity) − 2 (low grav) = 5 → Thin (hab −1, temp −1)
- Temperature: 2D6 = 7 + (−6) (zone O3) + 2 (Steam) − 1 (Thin dens) = 2 → Freezing (hab −5)
- Hazard: 2D6 + 2 = 9 → Biohazard (hab −2)
- Hazard Intensity: 2D6 = 8 → Moderate (hab −1)
- Biochem: 3D6 + 2 = 13 → Abundant (+1 hab)
- Biosphere triggered. Pool calculation:
  - Base: dis+2
  - Biochem Abundant (+1): −1 dis
  - Temperature Freezing: +3 dis
  - Subsurface Override trigger: Hydrous + Freezing + Gas Giant parent (innermost slot) → halve freezing dis → +2 dis instead of +3
  - Net: dis+2 − 1 + 2 = **dis+3** (6D6 keep low 5, mean 13.3)
- Rolled 19, barely missed TN 20 → B1 Pre-Biotic (hab 0)

Wait — this also missed Biosphere. Let me redo with luckier rolls.

Assume Biosphere roll = 22 (TN + 2) → **B2 Microbial** (hab +1). Subsurface microbial biosphere, Europa-archetype.

- **Baseline: −2 (grav) − 2 (atmo Steam) − 1 (density Thin) − 5 (Freezing) − 2 (hazard) − 1 (intensity) + 1 (biochem Abundant) + 1 (biosphere B2) = −11**

Europa scored much worse than the Terrestrial this time.

**Selection:** Terrestrial wins at −2 vs Dwarf's −11.

Both scored negative, so **MVT/GVT fallback triggers**. The Terrestrial is the mainworld but inhabitants live in dome/buried habitats.

---

## 18. Open Questions — Resolved in Consolidated Spec

All open questions from this draft have been resolved in `260417-03 MWG-REDESIGN-consolidated-v1.md`:

- **Zone DM table:** Locked at Infernal +5 through O5 −8. Batch validation post-implementation.
- **Gravity DM ladder:** Locked symmetric −3→0→3 around 0.7–1.3G.
- **Hot Jupiter shepherded re-evaluation:** Temperature re-rolled only. Other attributes fixed.
- **B3 → B4 boundary:** Keep discrete tiers. The jump models the Great Oxidation Event threshold.
- **Extreme negative scores:** No floor. MVT/GVT fallback handles arbitrarily hostile worlds.
- **Zone-only-affects-temperature problem:** Resolved 2026-04-27 in `260427-01`. Inner zones now carry a Hazard DM (+2 Infernal, +1 Hot); Conservative HZ now carries a small biosphere dice-pool bonus when biochem ≥ Common; outer zones are deliberately unchanged. See `260427-01` §1–2 for full rationale.

---

**End of draft v0.1.** Awaiting review before moving to Habitats thread.
