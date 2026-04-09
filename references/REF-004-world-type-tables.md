# REF-004: World Type & Size Tables

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 6.1 World Type & Size  
**Last Updated:** 2026-04-09

---

## Overview

Determines the type and size of the main world based on stellar class.

---

## Roll Modifier by Stellar Class

| Stellar Class | Roll Modifier |
|---------------|---------------|
| F | 4D6 keep 2 highest (Adv+2) |
| G | 3D6 keep 2 highest (Adv+1) |
| O, B, A, K, M | 2D6 (no modifier) |

---

## Table 1: World Type (2D6)

| 2D6 Result | World Type | Next Step |
|------------|------------|-----------|
| 2 | **Habitat** | Roll size on Habitat column |
| 3-5 | **Terrestrial World** | Roll size on Terrestrial column |
| 6-12 | **Dwarf World** | Roll on Lesser Earth Type table |

---

## Table 2: World Size

### Habitat Sizes (MVT = MegaVessel Tons, GVT = GigaVessel Tons)

| 2D6 | Size |
|-----|------|
| 2 | 1 MVT |
| 3 | 3 MVT |
| 4 | 10 MVT |
| 5 | 30 MVT |
| 6 | 100 MVT |
| 7 | 300 MVT |
| 8 | 1 GVT |
| 9 | 3 GVT |
| 10 | 10 GVT |
| 11 | 30 GVT |
| 12 | 100 GVT |

### Dwarf Planet Sizes (LM = Lunar Masses)

| 2D6 | Size |
|-----|------|
| 2 | 0.1 LM |
| 3 | 0.2 LM |
| 4 | 0.3 LM |
| 5 | 0.5 LM |
| 6 | 0.7 LM |
| 7 | 1.0 LM |
| 8 | 1.5 LM |
| 9 | 2 LM |
| 10 | 3 LM |
| 11 | 5 LM |
| 12 | 7 LM |

### Terrestrial Planet Sizes (EM = Earth Masses)

| 2D6 | Size |
|-----|------|
| 2 | 0.1 EM |
| 3 | 0.2 EM |
| 4 | 0.3 EM |
| 5 | 0.5 EM |
| 6 | 0.7 EM |
| 7 | 1.0 EM |
| 8 | 1.5 EM |
| 9 | 2 EM |
| 10 | 3 EM |
| 11 | 5 EM |
| 12 | 7 EM |

---

## Table 3: Lesser Earth Type (Dwarf Worlds Only)

Roll **2D6** to determine the type of dwarf planet.

| 2D6 | Type | Position Modifier | Description |
|-----|------|-------------------|-------------|
| 2-7 | **Carbonaceous** | +1 | C-type, carbon-rich, outer system |
| 8-10 | **Silicaceous** | +0 | S-type, rocky, inner system |
| 11 | **Metallic** | -1 | M-type, metal-rich, core remnants |
| 12 | **Other** | +0 | Unusual composition |

---

## Position Modifier

The position modifier is applied to the **1D6 zone roll** in section 8.4 of the FRD (not as a direct zone shift). Add the modifier to the 1D6 result before looking up the zone, then clamp to 1–6.

| Modifier | Net Effect |
|----------|------------|
| +1 (Carbonaceous) | Biases roll toward outer zones |
| 0 (Silicaceous, Other) | No change |
| -1 (Metallic) | Biases roll toward inner zones |

---

## Examples

### Example 1: F-Class Star
1. Roll 4D6 keep 2: [3, 5, 2, 6] → keep 5, 6 = **11**
2. World Type: 11 = **Dwarf World**
3. Roll Lesser Earth Type: 2D6 = 8 = **Silicaceous**
4. Roll Size: 2D6 = 7 = **1.0 LM**
5. Result: Silicaceous Dwarf Planet, 1.0 Lunar Masses

### Example 2: G-Class Star
1. Roll 3D6 keep 2: [4, 2, 5] → keep 4, 5 = **9**
2. World Type: 9 = **Dwarf World**
3. Roll Lesser Earth Type: 2D6 = 11 = **Metallic**
4. Roll Size: 2D6 = 10 = **3 LM**
5. Result: Metallic Dwarf Planet, 3 Lunar Masses

### Example 3: M-Class Star
1. Roll 2D6 = **4**
2. World Type: 4 = **Terrestrial World**
3. Roll Size: 2D6 = 8 = **1.5 EM**
4. Result: Terrestrial Planet, 1.5 Earth Masses

---

## Mass Unit Conversions

| Unit | Conversion |
|------|------------|
| 1 MVT | 1 million tons |
| 1 GVT | 1 billion tons |
| 1 LM | 0.0123 EM (Lunar Mass to Earth Mass) |
| 1 EM | 5.97 × 10²⁴ kg |
