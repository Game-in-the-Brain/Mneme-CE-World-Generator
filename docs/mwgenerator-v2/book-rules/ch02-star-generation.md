# Chapter 2: Star Generation

## Science Context

The Harvard spectral classification system (OBAFGKM) sorts stars by temperature and spectral line strength. Type O and B stars are the hottest and brightest — intense UV radiation strips planetary atmospheres and makes habitable zones effectively impossible. Type K and M stars (red dwarfs) are cool and dim, with habitable zones so close that planets are likely tidally locked. Type F and G stars (like our Sun) occupy the middle band where stable, potentially habitable worlds can exist. The Mneme system uses this classification because it is well-known, observationally grounded, and maps directly to real star tables any referee can look up.

---

## Step 1: Primary Star

### Roll 5D6 for Class

Roll 5D6 and consult the Stellar Class and Mass table:

| 5D6 | Class | Color | Typical Luminosity (L☉) | Habitability Note |
|-----|-------|-------|------------------------|-------------------|
| ≥30 | O | Blue | 10⁵–10⁶ | Disks only; no stable habitable zone |
| 29–28 | B | Deep blue-white | 10²–10⁵ | Disks only; very short-lived |
| 27–26 | A | Blue-white | 5–100 | Disks only; short stellar lifetime |
| 25–24 | F | White | 1.5–5 | Habitable zone possible; Adv+2 on world rolls |
| 23–22 | G | Yellowish-white | 0.6–1.5 | Optimal for life; Adv+1 on world rolls |
| 21–20 | K | Pale yellow-orange | 0.1–0.6 | Tidally locked worlds possible |
| ≤19 | M | Light orange-red | <0.1 | Most common; narrow HZ |

**Distribution (RECONS solar neighbourhood data):** M 75%, K 12%, G 8%, F 3%, A 0.6%, B+O 0.13%. The generator's model distribution diverges slightly (M 69%, K 15%, G 10%, F 4%, A 1.2%, B 0.4%) — within a few percentage points of the real census, weighted slightly toward brighter stars for gameplay purposes.

### Roll 5D6 for Grade

Grade (0–9) determines the star's precise mass and luminosity within its class. Grade 0 = most luminous in class, Grade 9 = least luminous in class.

| 5D6 | Grade |
|-----|-------|
| 5–17 | 9 |
| 18–20 | 8 |
| 21–22 | 7 |
| 23–24 | 6 |
| 25 | 5 |
| 26 | 4 |
| 27 | 3 |
| 28 | 2 |
| 29 | 1 |
| 30 | 0 |

### Determine Mass and Luminosity

Cross-reference class and grade on the Stellar Mass and Luminosity tables:

**Stellar Class and Mass Table (selected rows, in Solar Masses M☉):**

| Grade | O | B | A | F | G | K | M |
|-------|---|---|---|---|---|---|---|
| 9 | 27.2 | 3.49 | 1.47 | 1.08 | 0.82 | 0.49 | 0.12 |
| 5 | 72.0 | 9.05 | 1.75 | 1.22 | 0.92 | 0.63 | 0.27 |
| 0 | 128.0 | 16.0 | 2.10 | 1.40 | 1.04 | 0.80 | 0.45 |

**Stellar Luminosity Table (selected rows, in Solar Luminosity L☉):**

| Grade | O | B | A | F | G | K | M |
|-------|---|---|---|---|---|---|---|
| 9 | 30,000 | 25.0 | 5.0 | 1.50 | 0.60 | 0.08 | 0.01 |
| 5 | 249,266 | 426.1 | 14.0 | 3.08 | 1.01 | 0.31 | 0.04 |
| 0 | 3,516,325 | 14,753 | 23.0 | 4.65 | 1.41 | 0.55 | 0.07 |

Full tables are in the FRD (`REF-001-stellar-tables.md`). For pen-and-paper use, the Grade 5 row is a reasonable approximation for most stars when you want a quick value.

---

## Step 2: Calculate Zones

Zones are calculated from the primary star's **luminosity** using this formula:

```
Zone Boundary (AU) = √L☉ × zone_multiplier
```

| Zone | From | To | Multiplier |
|------|------|----|------------|
| Infernal | 0 AU | √L☉ × 0.4 AU | 0.4 |
| Hot | √L☉ × 0.4 AU | √L☉ × 0.8 AU | 0.8 |
| Conservative Habitable | √L☉ × 0.8 AU | √L☉ × 1.2 AU | 1.2 |
| Cold (= Opt. Habitable) | √L☉ × 1.2 AU | √L☉ × 4.85 AU | 4.85 |
| Outer Solar System | √L☉ × 4.85 AU | — | — |

### Heliopause Floor (Software Note)

The software enforces a **hard floor** on the heliopause (`heliopause_AU = √L☉ × 120`). This is not a book rule — it exists because the software must guarantee that companion star separations (Chapter 7) clear the planetary disk. For pen-and-paper generation, the heliopause is informational; the referee can place companion stars by judgement.

### Worked Example: Zone Calculation

A G2 star with L☉ = 1.01:
- √1.01 = 1.005
- Infernal: 0 to 1.005 × 0.4 = 0.40 AU
- Hot: 0.40 to 1.005 × 0.8 = 0.80 AU
- Conservative Habitable: 0.80 to 1.005 × 1.2 = 1.21 AU
- Cold: 1.21 to 1.005 × 4.85 = 4.87 AU
- Outer Solar System: 4.87 AU and beyond

Compare to our own Solar System: Mercury at 0.39 AU (Infernal), Venus at 0.72 AU (Hot), Earth at 1.0 AU (Conservative Habitable), Mars at 1.52 AU (Cold), Asteroid Belt at 2.8 AU (Cold), Jupiter at 5.2 AU (Outer).

---

## Step 3: Companion Stars

### Existence Check

Roll 2D6 against a target based on the **primary star's class**:

| Primary Class | Target (2D6 ≥) |
|---------------|-----------------|
| O | 4+ |
| B | 5+ |
| A | 6+ |
| F | 7+ |
| G | 8+ |
| K | 9+ |
| M | 10+ |

- Roll ≥ target: Companion exists
- Roll = 12: Companion exists AND roll again for a third star (chain rule — roll vs the companion's class, not the primary's)

### Companion Class and Grade

Roll 5D6 for class (same table as primary) and 5D6 for grade (same table as primary). Apply constraints:

- **Class constraint:** If the rolled class is larger (earlier letter) than the previous star, reduce it to one class smaller than the previous star. (O > B > A > F > G > K > M)
- **Grade constraint:** If the rolled grade is lower (more luminous) than the previous star, increase it to one grade higher than the previous star.

This ensures no companion outshines the star it orbits — a physically necessary constraint.

### Companion Separation

#### v1 Rule (Legacy)
Roll 3D6 and consult the Orbit Table (see `REF-003-orbit-table.md`). Distances vary by stellar class. On a roll of 18, multiply the result by 10 (recursive, capped at 2 re-rolls).

#### v2 Rule (v2MultiStar — see Chapter 7)
When `v2MultiStar` is enabled, separation is calculated as:

```
separation_AU = max(3D3, 3) × heliopause_AU × (1 + e)
```

Where `e` (eccentricity) is rolled on 1D6: 1→0.0, 2→0.1, 3→0.2, 4→0.3, 5→0.4, 6→0.5.

This places every companion's S-type stability cone outside the heliopause, guaranteeing that planet generation can remain single-star-aware. See Chapter 7 for the full treatment including the hierarchical orbit tree and barycenter math.

---

## Step 4: Tech Level

If the setting has a Standard Tech Level (STL), roll 2D6 to determine each world's TL:

| 2D6 | MTL | CE TL | Era |
|-----|-----|-------|-----|
| 2 | 7 | 6.0 | Early Space Age (1950–2000 CE) |
| 3 | 8 | 6.5 | Commercial Space (2000–2050 CE) |
| 4 | 9 | 7.0 | New Space Race (2050–2100 CE) |
| 5 | 10 | 7.5 | Cis-Lunar Development (2100–2200 CE) |
| 6–7 | 11 | 8.5 | Interstellar Settlement (2200–2300 CE) |
| 8 | 12 | 9.0 | Post-Earth Dependence (2300–2400 CE) |
| 9 | 13 | 9.5 | Early Jump-Drive (2400–2500 CE) |
| 10 | 14 | 10.0 | Interstellar Space (2500–2600 CE) |
| 11 | 15 | 10.5 | Interstellar Colonization |
| 12 | 16 | 11.0 | Self-Sufficient Megastructures |

Alternatively, use the CE TL column if your campaign uses standard Cepheus Engine tech levels.

---

## Validation Targets

| Metric | Model | RECONS/Observation | Tolerance |
|--------|-------|--------------------|-----------|
| M-class share | 69% | 75% | ±5 pp |
| G-class share | 10% | 8% | ±3 pp |
| Companion frequency (G-class) | Roll 8+ on 2D6 | ~44% of Sun-like stars have companions | Within range |
| Mean planets per system | 6.6 | Kepler bias-corrected 6–8 | In range |
