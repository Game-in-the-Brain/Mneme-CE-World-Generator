# MWG Redesign — Composition, Atmosphere, and Biosphere

**Status:** Draft v0.1 — awaiting review
**Date:** 2026-04-17
**Author:** Design consolidation from design session with Justin
**Replaces:** Portions of REF-004 (world type tables), introduces new composition pipeline
**Depends on:** Locked terminology from prior thread (INRAS = Level 1 IntRAstellar bodies; Habitability Candidates = Dwarfs and Terrestrials at Level 1 or 2)

---

## 1. Context and Motivation

Under the original book rules and current PWA implementation, the mainworld is generated first (with a full habitability stack), and the rest of the system is fleshed out around it. This was a practical concession to dice-and-paper play — no worldbuilder has time to roll 20 habitability stacks by hand just to pick one.

The PWA removes that constraint. We can now generate 2,000 bodies in a click. Under the new design flow, we generate the **entire system first**, compute **baseline habitability for every candidate body**, and **select the winner as the mainworld**. This is more physically honest: real star systems aren't designed around their inhabited world — the inhabited world is just whichever body happened to be most habitable.

This document defines the **composition → density → atmosphere → biosphere → habitability** chain that every habitability candidate runs through.

---

## 2. Pipeline Overview

For every habitability candidate (Dwarf or Terrestrial at Level 1 or 2):

```
1. Mass              (existing, 2D6 with stellar-class modifier)
2. Composition       (NEW — 3D6 table, sets density range + reactivity DM)
3. Density           (2D6 within composition-defined range)
4. Derived Physics   (gravity, radius, escape velocity — existing physics)
5. Atmosphere Composition (NEW — 3D6 abiotic atmosphere table)
6. Atmosphere Density     (2D6 — modified by composition reactivity + gravity)
7. Temperature            (existing, modified by atmosphere + zone)
8. Hazard                 (2D6 + Reactivity DM)
9. Biochem Resources      (NEW — 3D6, 11-tier ladder from −5 to +5)
10. Biosphere Test        (NEW — 5D6 dis+2 vs TN 20, triggered at Common+)
11. Biosphere Rating      (NEW — degree of pass determines B0–B6 tier)
12. Atmosphere Conversion (NEW — Biosphere ≥ B3 converts abiotic atmosphere)
13. Habitability Score    (sum of all modifiers)
```

Position (step occurs between mass sort and zone assignment — handled in a separate design thread).

---

## 3. Composition — Terrestrial Worlds (3D6)

**Rolled after:** Mass
**Rolled by:** Every Terrestrial Habitability Candidate (Level 1 or Level 2)
**Output:** Composition tier (drives density range + Reactivity DM)

| 3D6 | % | Composition | Density Range (g/cm³) | Reactivity DM | Description |
|---|---|---|---|---|---|
| 3 | 0.46% | **Exotic (Heavy-Element)** | 7.5–9.5 | +2 | Uranium-rich or post-supernova heavy-metal debris. Often radioactive. |
| 4–5 | 4.2% | **Iron-Dominant** | 6.0–7.5 | −1 | Mercury-like differentiated iron core, thin silicate mantle. |
| 6–8 | 25.9% | **Iron-Silicate** | 5.0–6.0 | +1 | Earth-like — nickel-iron core with silicate mantle. The life-bearing archetype. |
| 9–12 | 48.6% | **Silicate-Basaltic** | 3.8–5.0 | 0 | Mars-like — basaltic crust, partial iron core, moderate volcanism. |
| 13–15 | 16.2% | **Hydrous / Ocean** | 2.5–3.8 | +2 | Water-rock mix with deep oceans or icy mantle. Europa-scaled-up. |
| 16–17 | 4.2% | **Carbonaceous** | 2.0–3.0 | +1 | Carbon-rich silicates with organic precursors. Cold and primitive. |
| 18 | 0.46% | **Ceramic / Silicate-Pure** | 3.0–4.0 | 0 | Pure silicate shell, no iron core. Quake-prone, low magnetic field. |

**Design notes:**
- Silicate-Basaltic dominates at 48.6% — most rocky worlds in the universe are Mars-type, not Earth-type
- Iron-Silicate is the "Earth archetype" at 26% with a Reactivity +1 giving it the best life prospects
- Hydrous/Ocean at 16% with Reactivity +2 is the strongest life-biasing composition
- Iron-Dominant (Mercury-like) gets Reactivity −1 — sterile, outgasses poorly
- Ceramic is the special case: no iron = no magnetic field = poor atmosphere retention (atmosphere density roll gets an additional −1 if Ceramic)

**Density roll within range:** After composition is rolled, a 2D6 determines exact density within the range (roll 2 = low end, 12 = high end, linear interpolation).

---

## 4. Composition — Dwarf Worlds (3D6)

**Rolled after:** Mass
**Rolled by:** Every Dwarf Habitability Candidate (Level 1 or Level 2)
**Output:** Composition tier (drives density range + Reactivity DM)

| 3D6 | % | Composition | Density Range (g/cm³) | Reactivity DM | Description |
|---|---|---|---|---|---|
| 3 | 0.46% | **Exotic** | Variable 1.5–4.0 | +1 | Unusual chondrite class; rare composition. |
| 4–5 | 4.2% | **Metallic (M-type)** | 5.0–7.5 | −1 | Core remnant of shattered larger body. No atmosphere. |
| 6–8 | 25.9% | **Silicaceous (S-type)** | 2.8–3.8 | 0 | Stony differentiated silicates. Moon-like, Vesta-like. |
| 9–12 | 48.6% | **Hydrous / Icy-Rock** | 1.5–2.5 | +2 | Ice+rock mix with potential subsurface ocean. Pluto/Ceres/Europa archetype. |
| 13–15 | 16.2% | **Carbonaceous (C-type)** | 1.8–2.5 | +1 | Carbon-rich, volatile-bearing, primitive. |
| 16–17 | 4.2% | **Rubble-Pile** | 1.5–2.2 | 0 | Gravity-bound loose aggregate. Porous. Itokawa-type. |
| 18 | 0.46% | **Volatile-Rich** | 1.2–2.0 | +2 | Active cryovolcanism. Enceladus/Triton archetype. |

**Design notes:**
- Hydrous/Icy-Rock dominates at 48.6% — life-bearing is the **most common** Dwarf archetype, matching your direction
- This is the huge shift: Dwarf moons of Gas Giants (Europa, Enceladus, Titan-scale) become the statistically-likely mainworld candidate in many systems
- Volatile-Rich is the rare positive extreme (+2 Reactivity) — cryovolcanic Enceladus-like worlds
- Metallic remains the sterile low-end (−1 Reactivity)
- Rubble-Pile pushed to rare-high (16–17) rather than center — represents loose aggregates that don't retain atmosphere well

---

## 5. Atmosphere Composition (3D6) — Abiotic

**Rolled after:** Composition
**Output:** Primary gas composition of the world's atmosphere in its abiotic (pre-biosphere) state

This table produces the **starting atmosphere** every world would have in the absence of life. Nitrogen-Oxygen is deliberately absent — that atmosphere type is a biosignature, achieved only through successful biological terraforming (see §8).

| 3D6 | % | Primary Gas | Temperature DM | Hazard Bias | Notes |
|---|---|---|---|---|---|
| 3 | 0.46% | **Hydrogen-Helium** | −2 | None | Auto-downgrades to Trace if gravity < 1.5G (escape velocity) |
| 4–5 | 4.2% | **Methane / Ammonia** | −1 | Toxic +1 | Reducing atmosphere; Titan-like. Cold worlds only. |
| 6–8 | 25.9% | **Nitrogen-Inert (N₂, Ar, CO)** | 0 | None | Thick cold atmosphere; pre-oxygenation state. |
| 9–12 | 48.6% | **Carbon Dioxide** | +1 | None | The common default. Venus, Mars, early-Earth. |
| 13–15 | 16.2% | **Water Vapor / Steam** | +2 | Corrosive +1 | Runaway greenhouse or transient hot state. |
| 16–17 | 4.2% | **Sulfuric** | +2 | Corrosive +2, Toxic +1 | Venus-class; acidic and opaque. |
| 18 | 0.46% | **Exotic / Unknown** | Variable | Variable | Rare composition requiring special handling. |

**Hydrogen-Helium auto-escape rule:** If a world rolls HH composition but has gravity < 1.5G, the atmosphere defaults to Trace and the composition is recorded as "residual HH traces" for lore purposes. The world is treated as atmospheric composition = "None" for habitability calculations.

---

## 6. Atmosphere Density (2D6) — Modified

Unchanged tiers from current system:

| 2D6 | Density | Description |
|---|---|---|
| 2–3 | **Trace / None** | Negligible atmosphere |
| 4–5 | **Thin** | Mars-like, not breathable without assistance |
| 6–9 | **Average** | Earth-like pressure |
| 10–11 | **Dense** | High pressure, Titan or wet Earth |
| 12 | **Crushing** | Venus-like pressure |

**Modifiers applied to this roll:**

| Condition | Modifier |
|---|---|
| Composition Reactivity ≥ +2 (Hydrous, Volatile-Rich, Exotic-Heavy) | +1 |
| Composition Reactivity ≤ −1 (Iron-Dominant, Metallic) | −1 |
| Gravity ≥ 2G | +2 |
| Gravity ≤ 0.3G | −2 |
| Composition = Ceramic (no magnetic field) | −1 |
| **Special:** Atmosphere Comp = Hydrogen-Helium AND gravity < 1.5G | Force result to 2 (Trace) |

---

## 7. Biochem Resources (3D6) — 11-tier Ladder

**Rolled after:** Hazard
**Output:** Biochem Resource tier and Habitability Modifier
**3D6 + Composition Reactivity DM**

| 3D6 | % | Tier | Hab Mod |
|---|---|---|---|
| 3 | 0.46% | **Scarce** | −5 |
| 4 | 1.4% | **Rare** | −4 |
| 5 | 2.8% | **Uncommon** | −3 |
| 6–7 | 11.6% | **Poor** | −2 |
| 8–9 | 21.3% | **Deficient** | −1 |
| **10–11** | **25.0%** | **Common** | **0** |
| 12–13 | 21.3% | **Abundant** | +1 |
| 14 | 7.0% | **Rich** | +2 |
| 15 | 4.6% | **Bountiful** | +3 |
| 16 | 2.8% | **Prolific** | +4 |
| 17–18 | 1.9% | **Inexhaustible** | +5 |

**Design notes:**
- Symmetric distribution around Common (10–11, 25%)
- Modifier ladder is linear −5 to +5 (11 points — 1 tier = 1 mod point)
- Composition Reactivity adds directly to the 3D6 sum BEFORE looking up the tier (a +2 Reactivity Hydrous world rolling 10 produces 12 → Abundant)
- Tier determines **both** the habitability modifier **and** the Biosphere Test trigger and offset

---

## 8. Biosphere Test (5D6 dis+2, TN 20)

**Triggered when:** Biochem tier is **Common** or higher
**Base roll:** `5D6 dis+2` (roll 7D6, keep lowest 5, sum)
**Target Number:** 20 (Mneme Default)
**Modified by:** Biochem tier reduces disadvantage level (see table below)

### Dice Pool Modification by Biochem Tier

Biochem's positive Hab Mod value (if > 0) reduces the disadvantage on the Biosphere roll. A mod of +N removes N "dis" levels; if mod exceeds the base disadvantage of 2, the remainder becomes advantage.

| Biochem Tier | Hab Mod | Resulting Dice Pool | Mean Roll | P(≥ TN 20) |
|---|---|---|---|---|
| Below Common | — | No trigger | — | 0% |
| Common | 0 | 7D6 keep low 5 (dis+2) | 13.7 | ~12% |
| Abundant | +1 | 6D6 keep low 5 (dis+1) | 15.3 | ~22% |
| Rich | +2 | 5D6 plain (neutral) | 17.5 | ~41% |
| Bountiful | +3 | 6D6 keep high 5 (adv+1) | 19.7 | ~68% |
| Prolific | +4 | 7D6 keep high 5 (adv+2) | 21.5 | ~85% |
| Inexhaustible | +5 | 8D6 keep high 5 (adv+3) | 23.0 | ~94% |

**Interpretation:** Common worlds have ~1 in 8 chance of developing a biosphere. Inexhaustible worlds are near-certain. The mechanic models the anthropic cost of life emerging — it's hard even when the chemistry is ideal, and it's virtually impossible without at least Common-tier biochem.

---

## 9. Biosphere Rating (B0–B6)

**Derived from:** Biosphere Test roll relative to TN
**Outputs:** Biosphere tier, atmosphere conversion, habitability modifier

The **degree** by which the Biosphere Test passes or fails determines how developed the biosphere is:

| Roll vs TN | Rating | Name | Description | Atmosphere Effect | Hab Mod |
|---|---|---|---|---|---|
| Roll < TN − 5 | **B0** | **None** | Abiotic world | None | 0 |
| TN − 5 to TN − 1 | **B1** | **Pre-Biotic** | Organic precursors, no self-replicators | None (trace methane possible) | 0 |
| TN to TN + 2 | **B2** | **Microbial** | Prokaryotic equivalent; anaerobic | Trace O₂/CH₄ detectable | +1 |
| TN + 3 to TN + 5 | **B3** | **Photosynthetic** | Cyanobacteria-equivalent; active processing | **Transitional** — CO₂ partially converted, O₂ 1–10% | +2 |
| TN + 6 to TN + 8 | **B4** | **Complex** | Multicellular, post-Cambrian | **Oxygenated** — N-O atmosphere established | +4 |
| TN + 9 to TN + 11 | **B5** | **Advanced** | All niches colonized; Gaia feedback active | **Stable N-O** — Earth-class atmosphere | +6 |
| Roll ≥ TN + 12 | **B6** | **Post-Sapient** | Intelligence has emerged | **Engineered** — industrial signatures possible | +8 |

**B6 note:** B6 gives habitability bonus only; it does NOT automatically generate Inhabitants. Inhabitants generation remains a separate step triggered after mainworld selection. (A B6 world is a *strong* candidate for the mainworld pick but whether that civilization is extant or extinct is determined by subsequent rolls — a deferred decision.)

### Atmosphere Conversion Matrix

When Biosphere rating is B3 or higher, the abiotic atmosphere is converted:

| Abiotic Atmosphere | B3 (Transitional) | B4+ (Oxygenated) |
|---|---|---|
| Hydrogen-Helium | No change | No change (gas-giant only anyway) |
| Methane/Ammonia | Transitional CH₄+O₂ mix | Nitrogen-Inert (anaerobic conversion) |
| Nitrogen-Inert | No change | **Nitrogen-Oxygen** |
| Carbon Dioxide | CO₂ + 1–10% O₂ | **Nitrogen-Oxygen** |
| Water Vapor / Steam | Humid CO₂ + O₂ | Humid **Nitrogen-Oxygen** |
| Sulfuric | Sulfuric with traces reduced | CO₂ (partial reduction only — biology cannot fully convert Venus-class) |
| Exotic | Variable | Variable |

---

## 10. Extraterrestrial Life Assumptions — Worldbuilder Settings

A new settings panel (parallel to existing Economic Presets) exposes two levers for the worldbuilder:

### Controls

1. **Biosphere Target Number** — default 20 (Mneme); slider range 15–35
2. **Biosphere Roll Disadvantage** — default dis+2; slider range dis+0 to dis+5
3. **Biochem Offset Rule** — default 'standard' (each Biochem mod point removes one dis level); options `'standard' | 'halved' | 'none'`
4. **Minimum Biochem for Biosphere Trigger** — default `'Common'`; options `'Common' | 'Abundant' | 'Rich'`
5. **Enable Transitional Atmospheres** — default `true`; if disabled, Biosphere conversion is binary (B0–B3 = no conversion, B4+ = full)

### Type Definition

```typescript
interface ExtraterrestrialLifeAssumptions {
  id: string
  name: string
  description: string

  biosphereTN: number                    // default 20, range 15–35
  biosphereDisadvantage: number          // default 2, range 0–5
  minBiochemForBiosphereRoll: 'Common' | 'Abundant' | 'Rich'
  enableTransitionalAtmospheres: boolean
  biochemOffsetRule: 'standard' | 'halved' | 'none'
}
```

### Built-in Presets

| Preset | TN | Dis | Min Biochem | Transitional | Offset |
|---|---|---|---|---|---|
| **Mneme Default** | 20 | 2 | Common | true | standard |
| **Rare Earth** | 28 | 3 | Abundant | false | halved |
| **Panspermia** | 15 | 0 | Common | true | standard |

### Settings UI

Parallels existing Economic Presets panel:
- Save / Load / Import / Export / Save-As
- Lives under Settings → "Extraterrestrial Life Assumptions"
- LocalStorage key: `mneme_life_assumptions_presets`
- Active preset stored in `mneme_generator_options` under `activeLifeAssumptionsId`

---

## 11. Summary: Probability of N-O Atmosphere Emergence

A worked example, assuming **Mneme Default** settings:

A randomly-rolled Habitability Candidate has:
- ~26% chance of Iron-Silicate composition (+1 Reactivity) or ~16% Hydrous (+2 Reactivity)
- Biochem rolled with Reactivity DM → probability of reaching Common (mod 0) or higher is ~55% for neutral compositions, ~80% for Hydrous worlds
- Of worlds that reach Common+, probability of B4+ (full N-O atmosphere) is ~10–50% depending on Biochem tier

**Net result:** roughly **3–10% of candidate worlds** end up with N-O atmospheres under default settings — making breathable Earth-class atmospheres the rare-but-not-impossible outcome they should be.

Under **Rare Earth settings** (TN 28, Abundant minimum), this drops to well below 1%.
Under **Panspermia settings** (TN 15, no dis), it rises to 15–30%.

---

## 12. Open Questions — Resolved in Consolidated Spec

All open questions from this draft have been resolved in `260417-03 MWG-REDESIGN-consolidated-v1.md`:

- **B6 Post-Sapient:** Competes normally; does NOT auto-win mainworld.
- **H-H on Gas Giant moons:** No special rule for v1. Dwarf moons roll atmosphere normally.
- **Composition–zone correlation:** No pre-hoc constraint. Outer-zone Hydrous/Icy-Rock/Volatile-Rich bodies get +0.3 g/cm³ ice-compression bonus.
- **Temperature integration:** Existing 2D6 temperature mechanic replaced entirely by stacked-DM model in consolidated spec §6.2.

---

**Next thread:** See `260417-03 MWG-REDESIGN-consolidated-v1.md` for the locked positioning, habitability, and ring mechanics.
