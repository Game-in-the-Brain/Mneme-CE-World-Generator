# Chapter 4: Composition, Atmosphere & Biosphere

## Science Context

A world's bulk composition determines nearly everything about its surface conditions. An iron-rich terrestrial world will have high density and weak magnetic field evolution. A carbonaceous dwarf will be volatile-rich and prone to outgassing. The composition feeds into the atmosphere chemistry, which in turn determines whether a biosphere can take hold. The Mneme system models this as a pipeline: composition → abiotic atmosphere → biosphere test → atmospheric conversion.

Version 2 replaces the old single-table lookup with a **composition-driven chemistry model** where each body type uses a distinct 3D6 composition table, and rolls feed forward into atmospheric and biological outcomes.

---

## Step 1: World Type & Size

First, determine the world type category from the mainworld roll (see Chapter 2):

| Type | Size Range | Mass Unit |
|------|-----------|-----------|
| Habitat | 1 MVT to 100 GVT | Mega/Giga Volume Tons |
| Dwarf World | 0.1 to 7 Lunar Masses | Lunar Masses (LM) |
| Terrestrial World | 0.1 to 7 Earth Masses | Earth Masses (EM) |

### Mainworld Bonus

The mainworld is the system's most hospitable world. All mainworld rolls (type, size) are made with **Adv+2**. Additionally:
- F-class stars: Adv+2 (more material available)
- G-class stars: Adv+1

---

## Step 2: Composition (3D6)

### Terrestrial World Composition

| 3D6 | % | Composition | Density (g/cm³) | Reactivity DM | Notes |
|-----|---|-------------|-----------------|---------------|-------|
| 3 | 0.46% | Exotic (Heavy-Element) | 7.5–9.5 | +2 | Often radioactive |
| 4–5 | 4.2% | Iron-Dominant | 6.0–7.5 | -1 | Mercury-like |
| 6–8 | 25.9% | Iron-Silicate | 5.0–6.0 | +1 | Earth archetype |
| 9–12 | 48.6% | Silicate-Basaltic | 3.8–5.0 | 0 | Mars archetype |
| 13–15 | 16.2% | Hydrous / Ocean | 2.5–3.8 | +2 | Europa-scaled-up |
| 16–17 | 4.2% | Carbonaceous | 2.0–3.0 | +1 | Primitive, cold |
| 18 | 0.46% | Ceramic / Silicate-Pure | 3.0–4.0 | 0 | No magnetic field |

### Dwarf World Composition

| 3D6 | % | Composition | Density (g/cm³) | Reactivity DM | Notes |
|-----|---|-------------|-----------------|---------------|-------|
| 3 | 0.46% | Exotic | 1.5–4.0 | +1 | Rare chondrite |
| 4–5 | 4.2% | Metallic (M-type) | 5.0–7.5 | -1 | Core remnant |
| 6–8 | 25.9% | Silicaceous (S-type) | 2.8–3.8 | 0 | Vesta-like |
| 9–12 | 48.6% | Hydrous / Icy-Rock | 1.5–2.5 | +2 | Pluto/Ceres archetype |
| 13–15 | 16.2% | Carbonaceous (C-type) | 1.8–2.5 | +1 | Volatile-bearing |
| 16–17 | 4.2% | Rubble-Pile | 1.5–2.2 | 0 | Itokawa-type |
| 18 | 0.46% | Volatile-Rich | 1.2–2.0 | +2 | Cryovolcanic |

**Outer-zone density bonus:** Hydrous / Icy-Rock / Volatile-Rich bodies placed in O1–O5 get +0.3 g/cm³ (ice compression from deep cold).

### Density Interpolation

Roll 2D6 within the composition's density range:

```
density = min + (max - min) × ((roll - 2) / 10)
```

---

## Step 3: Gravity (Derived)

Gravity is not rolled directly in v2. It is **computed** from mass and density:

```
Radius (km) = ∛(mass_EM × 5.972e24 / (4/3 × π × density × 1000))
Surface Gravity (G) = (G_const × mass_EM × 5.972e24) / (radius_km × 1000)² / 9.81
Escape Velocity (km/s) = √(2 × G_const × mass_EM × 5.972e24 / (radius_km × 1000)) / 1000
```

### Gravity Habitability Modifier

**Dwarf Worlds:**
| Gravity | Modifier |
|---------|----------|
| < 0.06 G | -2.5 |
| < 0.08 G | -2.0 |
| < 0.10 G | -1.5 |
| < 0.12 G | -1.0 |
| < 0.16 G | -0.5 |
| ≥ 0.16 G | 0 |

**Terrestrial Worlds:**
| Gravity | Modifier |
|---------|----------|
| > 1.8 G | -2.5 |
| > 1.4 G | -2.0 |
| > 1.2 G | -1.5 |
| > 1.0 G | -1.0 |
| < 0.5 G | -0.5 |
| < 0.7 G | -0.5 |
| 0.7–1.0 G | 0 |

---

## Step 4: Abiotic Atmosphere Composition (3D6)

Before life, roll for the planet's raw atmospheric chemistry. This is the **abiotic** composition — what the atmosphere looks like before any biological processes modify it.

| 3D6 | % | Primary Gas | Hazard Bias | Hab Mod |
|-----|---|-------------|-------------|---------|
| 3 | 0.46% | Sulfur Dioxide (SO₂) | Toxic | -2 |
| 4–5 | 4.2% | CO₂-Dominant | Toxic | -1 |
| 6–8 | 25.9% | CO₂-N₂ | Corrosive | -1 |
| 9–12 | 48.6% | N₂-CO₂ | None | 0 |
| 13–15 | 16.2% | N₂-O₂ (trace) | None | 0 |
| 16–17 | 4.2% | N₂-O₂ (thin) | None | 0 |
| 18 | 0.46% | O₂-Rich | Polluted | +1 |

### Atmosphere Density (2D6)

Roll 2D6 for density, with modifiers from composition:

| Modified 2D6 | Density | TL Required | Hab Mod |
|--------------|---------|-------------|---------|
| ≤1 | None | Vacuum suit | -3 |
| 2–5 | Trace | TL8 suit | -1.5 |
| 6–8 | Thin | TL7 suit | -1 |
| 9–11 | Standard | TL0 | 0 |
| 12 | Dense | TL10 suit | -2 |
| ≥13 | Thick | TL12 habitat | -3 |

Density modifiers by composition: Heavy-Element +1, Iron-Dominant -1, Hydrous +1, Carbonaceous -1.

---

## Step 5: Biochemical Resources (3D6 + Reactivity DM)

Biochemical resources measure the availability of water, carbon, nitrogen, and other elements needed for life.

| Modified 3D6 | Tier | Hab Mod | Population Effect |
|--------------|------|---------|-------------------|
| ≤3 | None | -6 | No organic feedstock |
| 4–6 | Trace | -4 | Minimal, rare |
| 7–9 | Marginal | -3 | Possible but difficult |
| 10–12 | Common | 0 | Earth-normal |
| 13–15 | Abundant | +3 | Rich |
| ≥16 | Inexhaustible | +5 | Super-abundant |

Roll is: `3D6 + Reactivity_DM` (from the composition table).

---

## Step 6: Biosphere Test (Unified Dice Pool)

The biosphere test determines whether life has taken hold on the world. It uses the **unified dice pool** system from Chapter 1.

### Base Parameters

- **Target Number (TN):** 20 (sum of 5 dice = 20)
- **Pool base:** 5D6
- **disLevel** starts at 0 and is modified by:

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
| Zone = Conservative AND Biochem ≥ Common (v2) | -2 |

Final `disLevel` = sum of all applicable changes. If negative, roll with Advantage (keep highest 5 of `5+|disLevel|` dice). If positive, roll with Disadvantage (keep lowest 5 of `5+|disLevel|` dice).

### Biosphere Rating

| Roll ≥ TN = 20 | Rating | Narrative | Hab Mod |
|----------------|--------|-----------|---------|
| No (roll < 20) | B0 | Sterile | 0 |
| Yes, Effect 0–1 | B1 | Microbial | +1 |
| Yes, Effect 2–3 | B2 | Simple life (plants, fungi) | +2 |
| Yes, Effect 4–5 | B3 | Complex life (animals) | +4 |
| Yes, Effect 6–7 | B4 | Sapient-capable | +6 |
| Yes, Effect 8–9 | B5 | Sapient | +8 |
| Yes, Effect 10+ | B6 | Post-sapient | +10 |

**Effect** = roll result - TN (20). A roll of 26 = Effect 6 = B4.

---

## Step 7: Atmosphere Conversion

The biosphere modifies the atmosphere. The conversion matrix:

| Biosphere | Abiotic → Converted |
|-----------|-------------------|
| B0–B1 | No change (abiotic atmosphere remains) |
| B2–B3 | Earth-like: N₂-O₂ (CO₂ scrubbed to trace) |
| B4+ | O₂-rich: N₂-O₂ with elevated oxygen |

---

## Validation Targets

| Metric | Target | Basis |
|--------|--------|-------|
| Silicate-Basaltic (terrestrial) share | ~49% | Most common rocky composition in inner system |
| Hydrous composition outer-zone bias | Density bonus applied | Ice compression physics |
| HZ biosphere ≥ B2 rate | ~40% | Post-retune (up from 31.8% pre-retune) |
