# REF-001: Stellar Tables

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 5.1 Primary Star Generation  
**Last Updated:** 2026-04-09

---

## Table 1: Stellar Class (5D6)

Determines the spectral class of the star.

| 5D6 Result | Class | Color | Description |
|------------|-------|-------|-------------|
| ≥30 | O | Blue White | Hottest, most massive |
| 29-28 | B | Deep Blue White | Very hot, very massive |
| 27-26 | A | Blue White | Hot, white |
| 25-24 | F | White | Yellowish white |
| 23-22 | G | Yellow | Yellowish white (Sun-like) |
| 21-20 | K | Orange | Pale yellow orange |
| ≤19 | M | Red | Light orange red, coolest |

**Class Rank (for companion constraints):** O=7, B=6, A=5, F=4, G=3, K=2, M=1

---

## Table 2: Stellar Grade (5D6)

Determines the luminosity grade within the spectral class. Lower grade = more luminous.

| 5D6 Result | Grade | Luminosity |
|------------|-------|------------|
| 5-17 | 9 | Least luminous in class |
| 18-20 | 8 | |
| 21-22 | 7 | |
| 23-24 | 6 | |
| 25 | 5 | |
| 26 | 4 | |
| 27 | 3 | |
| 28 | 2 | |
| 29 | 1 | |
| 30 | 0 | Most luminous in class |

---

## Table 3: Stellar Mass (by Class and Grade)

Mass in Solar Masses (M☉).

| Class | Grade 0 | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Grade 5 | Grade 6 | Grade 7 | Grade 8 | Grade 9 |
|-------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| O | 128.0 | 116.8 | 105.6 | 94.4 | 83.2 | 72.0 | 60.8 | 49.6 | 38.4 | 27.2 |
| B | 16.0 | 14.61 | 13.22 | 11.83 | 10.44 | 9.05 | 7.66 | 6.27 | 4.88 | 3.49 |
| A | 2.1 | 2.03 | 1.96 | 1.89 | 1.82 | 1.75 | 1.68 | 1.61 | 1.54 | 1.47 |
| F | 1.4 | 1.36 | 1.33 | 1.29 | 1.26 | 1.22 | 1.18 | 1.15 | 1.11 | 1.08 |
| G | 1.04 | 1.02 | 0.99 | 0.97 | 0.94 | 0.92 | 0.90 | 0.87 | 0.85 | 0.82 |
| K | 0.80 | 0.77 | 0.73 | 0.70 | 0.66 | 0.63 | 0.59 | 0.56 | 0.52 | 0.49 |
| M | 0.45 | 0.41 | 0.38 | 0.34 | 0.30 | 0.27 | 0.23 | 0.19 | 0.15 | 0.12 |

---

## Table 4: Stellar Luminosity (by Class and Grade)

Luminosity in Solar Luminosities (L☉).

| Class | Grade 0 | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Grade 5 | Grade 6 | Grade 7 | Grade 8 | Grade 9 |
|-------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| O | 3,516,325 | 2,071,113 | 1,219,884 | 718,510 | 423,202 | 249,266 | 146,817 | 86,475 | 50,934 | 30,000 |
| B | 14,752.9 | 7,260.98 | 3,573.66 | 1,758.86 | 865.66 | 426.06 | 209.69 | 103.21 | 50.8 | 25.0 |
| A | 23.0 | 21.2 | 19.4 | 17.6 | 15.8 | 14.0 | 12.2 | 10.4 | 8.6 | 5.0 |
| F | 4.65 | 4.34 | 4.02 | 3.71 | 3.39 | 3.08 | 2.76 | 2.45 | 2.13 | 1.5 |
| G | 1.41 | 1.33 | 1.25 | 1.17 | 1.09 | 1.01 | 0.92 | 0.84 | 0.76 | 0.60 |
| K | 0.55 | 0.50 | 0.45 | 0.41 | 0.36 | 0.31 | 0.27 | 0.22 | 0.17 | 0.08 |
| M | 0.07 | 0.07 | 0.06 | 0.05 | 0.05 | 0.04 | 0.03 | 0.03 | 0.02 | 0.01 |

---

## Zone Boundary Calculation

Once luminosity is determined, calculate zone boundaries:

```
sqrtL = √L☉

Infernal Zone:           0 to <(sqrtL × 0.4)
Hot Zone:                (sqrtL × 0.4) to <(sqrtL × 0.8)
Conservative Habitable:  (sqrtL × 0.8) to <(sqrtL × 1.2)
Optimistic Habitable:    (sqrtL × 1.2) to <(sqrtL × 4.85)
Outer Solar System:      ≥(sqrtL × 4.85)
```

---

## Example: Sol (G2 Star)

- Class: G
- Grade: 2 (G2)
- Mass: 0.99 M☉
- Luminosity: 1.25 L☉
- √L☉ = 1.12

**Zone Boundaries:**
- Infernal: 0 to <0.45 AU
- Hot: 0.45 to <0.89 AU
- Conservative Habitable: 0.89 to <1.34 AU
- Optimistic Habitable: 1.34 to <5.42 AU
- Outer Solar System: ≥5.42 AU
