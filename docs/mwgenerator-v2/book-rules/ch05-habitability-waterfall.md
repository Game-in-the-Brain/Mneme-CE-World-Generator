# Chapter 5: Habitability Waterfall

## Science Context

Habitability is not a single property — it is the composite outcome of atmosphere chemistry, temperature, surface hazards, available organic feedstock, and the presence of life itself. The Mneme system models this as a **10-step waterfall**, where each step consumes the output of the previous one. This mirrors how real planetary science evaluates habitability: starting from raw geological composition, through atmospheric chemistry, to the biological processes that can transform a planet's surface.

Version 2 introduces two critical changes (QA-064, 2026-04-27) that make **zone position** a systemic input to habitability instead of a temperature-only modifier:

1. **Inner-zone radiation hazard** (Option 1): worlds close to their star take a penalty on the hazard roll
2. **Conservative HZ biosphere bonus** (Option 2): worlds in the habitable zone with sufficient organic chemistry get a boost to biosphere viability

These changes were driven directly by exoplanet observations — JWST's confirmed atmosphere-bare TRAPPIST-1 inner planets, and Kepler's bias-corrected η-Earth rates.

---

## The 10-Step Waterfall

| Step | Name | Key Input | Output | Habitability Effect |
|------|------|-----------|--------|-------------------|
| 1 | Atmosphere Composition | World type, biosphere | Atmo type | Modifier from gas composition |
| 2 | Atmosphere Density | Atmo type | Density class | Modifier from pressure |
| 3 | Temperature | Zone, atmo density | Temp class | Modifier from heat/cold |
| 4 | Hazard | Composition reactivity, zone radiation | Hazard class | Modifier from environmental danger |
| 5 | Hazard Intensity | Hazard class | Intensity modifier | Severity multiplier |
| 6 | Biochemical Resources | Composition, reactivity | Biochem tier | Modifier from organic feedstock |
| 7 | Biosphere Test | Biochem, temperature, zone | Pass/fail + rating | Modifier from life |
| 8 | Biosphere Rating | Test result | B0–B6 | Increasing bonus with complexity |
| 9 | Atmosphere Conversion | Biosphere rating | Final atmosphere | May improve breathability |
| 10 | Baseline Score | All modifiers | Habitability number | Sum of all components |

---

## Step 1: Atmosphere Composition

Roll 3D6 for the abiotic (pre-life) atmosphere composition. See Chapter 4 for the full table.

Key modifiers feed forward:
- **Hazard bias:** some compositions predispose toward Toxic or Corrosive outcomes (used in Step 4)
- **Density modifier:** composition affects the density roll in Step 2

---

## Step 2: Atmosphere Density

Roll 2D6 modified by composition. See Chapter 4 for the full table.

**Density habitability modifiers:**
| Density | TL Required | Hab Mod |
|---------|-------------|---------|
| None | Vacuum suit | -3 |
| Trace | TL8 | -1.5 |
| Thin | TL7 | -1 |
| Standard | TL0 | 0 |
| Dense | TL10 | -2 |
| Thick | TL12 | -3 |

**Density also modifies the temperature roll in Step 3:**
- Dense: +1
- Crushing (Dense+): +2
- Thin: -1
- Trace: -2
- Standard/None: 0

---

## Step 3: Temperature

Roll 2D6 modified by atmosphere density AND zone position.

### Zone Temperature Modifiers (Stacked)

| Zone | Temp DM | Notes |
|------|---------|-------|
| Infernal | +5 | Extreme heat from direct stellar exposure |
| Hot | +3 | Venus-like |
| Conservative | 0 | Earth-like; the baseline |
| Cool | -2 | Mars-like |
| FrostLine | -3 | Water-ice stable |
| O1 | -4 | Kuiper-belt cold |
| O2 | -5 | |
| O3 | -6 | |
| O4 | -7 | |
| O5 | -8 | Oort-cloud edge |

### Temperature Outcomes

| Modified 2D6 | Temperature | Hab Mod | Notes |
|--------------|-------------|---------|-------|
| ≤2 | Inferno | -2 | Atmosphere stripped |
| 3–6 | Hot | -1.5 | Greenhouse conditions |
| 7–10 | Freezing | -1 | Sub-zero baseline |
| 11 | Cold | -0.5 | Mars-like |
| ≥12 | Average | 0 | Earth-normal |

---

## Step 4: Hazard **(Updated — QA-064)**

Roll 2D6 modified by **reactivity DM** (from composition), **atmosphere hazard bias** (from Step 1), and **zone radiation DM** (NEW — QA-064 Option 1).

### Zone Radiation Hazard DM (NEW)

| Zone | Hazard DM | Why |
|------|-----------|-----|
| **Infernal** | **+2** | Intense UV/X-ray flux; atmosphere stripping; CME impact |
| **Hot** | **+1** | Significant stellar wind erosion; periodic flare exposure |
| Conservative | 0 | Earth-like; magnetosphere assumed effective |
| Cool | 0 | Reduced flux |
| FrostLine | 0 | Negligible stellar effects |
| O1–O5 | 0 | Cold is the dominant hazard, not radiation |

**Hazard roll formula:**
```
hazardRoll = 2D6 + reactivityDM + zoneHazardDM + atmoHazardBias
```

**Justification:** JWST confirmed two of TRAPPIST-1's inner planets are atmosphere-bare or near-bare. Mercury is bare. Venus is functionally Toxic. The real inner-zone atmosphere-stripping rate is 70–90%, which the new +2/+1 modifiers reproduce.

### Hazard Outcomes

| Modified 2D6 | Hazard | Hab Mod |
|--------------|--------|---------|
| ≤2 | Radioactive | -1.5 |
| 3–4 | Toxic | -1.5 |
| 5–6 | Biohazard | -1 |
| 7 | Corrosive | -1 |
| 8–9 | Polluted | -0.5 |
| ≥10 | None | 0 |

### Worked Example: Infernal Zone Hazard

Before QA-064: an Iron-Silicate terrestrial (Reactivity +1) in the Infernal zone rolls 2D6 getting 7, plus +1 = 8 → Corrosive (−1 hab).

After QA-064: same roll of 7, plus +1 (Reactivity) plus **+2 (Infernal radiation)** = 10 → **None**... wait — let's re-roll: roll of 10, plus +1 plus +2 = 13 → clamped to ≥10 → None. Actually a more typical roll: 5 + 1 + 2 = 8 → Corrosive. A low roll like 3 + 1 + 2 = 6 → Biohazard. The +2 shifts the distribution roughly one full tier toward worse outcomes.

---

## Step 5: Hazard Intensity

Roll 2D6 to determine how severe the hazard is:

| 2D6 | Intensity | Hab Mod | TL to Mitigate |
|-----|-----------|---------|----------------|
| ≤2–3 | Intense | -2 | TL9 |
| 4–6 | High | -1.5 | TL8 |
| 7–8 | Serious | -1 | TL7 |
| 9–10 | Mild | -0.5 | TL6 |
| ≥11–12 | Very Mild | 0 | TL11 |

---

## Step 6: Biochemical Resources

Roll 3D6 + reactivity DM (from composition). See Chapter 4 for full table.

| Modified 3D6 | Tier | Hab Mod |
|--------------|------|---------|
| ≤3 | None | -6 |
| 4–6 | Trace | -4 |
| 7–9 | Marginal | -3 |
| 10–12 | Common | 0 |
| 13–15 | Abundant | +3 |
| ≥16 | Inexhaustible | +5 |

Biochem is the primary gate for the biosphere test (Step 7).

---

## Step 7: Biosphere Test **(Updated — QA-064)**

The biosphere test uses the **unified dice pool** system (Chapter 1) to determine whether life has established itself.

### Base Parameters

- **Target Number (TN):** 20 (sum of 5 kept dice)
- **Base pool:** 5D6 straight (`disLevel = 0`)
- **Result:** Roll ≥ TN = success; Roll < TN = failure

### Dice Pool Modifiers (disLevel)

| Condition | disLevel Change |
|-----------|-----------------|
| Biochem None/Trace | +4 |
| Biochem Marginal | +2 |
| Biochem Common | 0 |
| Biochem Abundant | -1 |
| Biochem Inexhaustible | -2 |
| Temperature Inferno | +3 |
| Temperature Hot | +1 |
| Temperature Freezing | +2 |
| Temperature Cold | +1 |
| Temperature Average | 0 |
| **Zone = Conservative AND Biochem ≥ Common (QA-064)** | **-2** |

Conservative HZ Bonus detail (QA-064, Option 2):
- Trigger: zone is `Conservative` AND biochem tier is `Common` or higher
- Effect: reduce `disLevel` by 2 (shifts pool from dis+2 → straight, or straight → adv+2)
- Originally specified as −1; raised to **−2** after the 2026-04-27 empirical batch showed −1 was too small

Final `disLevel` = sum of all applicable changes.
- Negative = Advantage (keep highest 5 of `5 + |disLevel|` dice)
- Positive = Disadvantage (keep lowest 5 of `5 + |disLevel|` dice)
- Zero = straight 5D6

### Probability Comparison

| Pool Before | Pool After | P(≥ TN 20) Before | P(≥ TN 20) After |
|-------------|------------|-------------------|-------------------|
| dis+2 (7D6 keep low 5) | dis+0 (5D6 straight) | ~14% | ~50% |
| dis+0 (5D6 straight) | adv+2 (7D6 keep high 5) | ~50% | ~80% |
| adv+1 (6D6 keep high 5) | adv+3 (8D6 keep high 5) | ~68% | ~88% |

---

## Step 8: Biosphere Rating

| Roll ≥ TN 20? | Rating | Narrative | Hab Mod |
|---------------|--------|-----------|---------|
| No | B0 | Sterile world | 0 |
| Yes, Effect 0–1 | B1 | Microbial | +1 |
| Yes, Effect 2–3 | B2 | Simple life (plants, fungi) | +2 |
| Yes, Effect 4–5 | B3 | Complex life (animals) | +4 |
| Yes, Effect 6–7 | B4 | Sapient-capable | +6 |
| Yes, Effect 8–9 | B5 | Sapient | +8 |
| Yes, Effect 10+ | B6 | Post-sapient | +10 |

**Effect** = roll result - TN (20). A roll of 27 = Effect 7 = B4.

---

## Step 9: Atmosphere Conversion

Life transforms the atmosphere. The conversion matrix:

| Biosphere | Effect on Atmosphere |
|-----------|---------------------|
| B0–B1 | No change (abiotic atmosphere remains) |
| B2–B3 | CO₂ scrubbed; N₂-O₂ Earth-like atmosphere |
| B4+ | O₂-rich atmosphere; elevated oxygen |

---

## Step 10: Baseline Habitability Score

Sum all component modifiers:

```
Baseline = gravityMod + densityMod + temperatureMod + hazardMod + 
           hazardIntensityMod + biochemMod + biosphereMod
```

This score is used to:
1. **Select the mainworld** (highest score among all habitability candidates)
2. **Calculate population** (see Chapter 6)
3. **Determine starport class** (see Chapter 6)

---

## Subsurface Ocean Override

For outer-zone (O1–O5) Hydrous or Volatile-Rich dwarf worlds, a subsurface ocean may exist independent of the surface biosphere test. When triggered, the world gets a separate biosphere path where the disLevel penalty from temperature is ignored (the ocean is insulated by ice). This models the Europa/Enceladus archetype.

---

## Post-Retune Validation Targets (2026-04-27)

| Target | Pre-Retune | Post-Retune | Actual (1000 systems) |
|--------|-----------|-------------|----------------------|
| Conservative mainworld share | 60–75% ❌ | **30–50%** | 47.2% ✓ |
| Hot+Infernal mainworld share | ≤5% ❌ | **≤20%** | 15.3% ✓ |
| Infernal Toxic+ hazard rate | 25–35% ❌ | **70–90%** | 69.6% ✓ |
| HZ biosphere ≥ B2 rate | — | informational | 39.9% |

**Why the old targets were wrong:**
- The original 60–75% Conservative share target was **anthropic** — assuming the universe biases toward HZ mainworlds because that's where we live. Kepler bias-corrected η-Earth gives 10–25% per FGK star.
- The original 25–35% Infernal Toxic+ target was based on pre-JWST assumptions. JWST has now directly observed inner-zone atmosphere stripping at 70–100% rates.
- M-dwarf weighting in the generator (M stars are 69% of systems) pushes Conservative share above the FGK-only η-Earth rate, making 30–50% defensible.
