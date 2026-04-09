# REF-005: World Position Table

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 6.10 Main World Position  
**Last Updated:** 2026-04-09

---

## Overview

Determines the orbital zone and AU distance of the main world based on its atmosphere and temperature.

**Total combinations:** 5 Atmospheres × 5 Temperatures = **25 combinations**

---

## Zone Colors

| Color | Zone | Description |
|-------|------|-------------|
| 🔴 Red | **Infernal** | Innermost, extremely hot |
| 🟠 Orange | **Hot** | Inner zone, very hot |
| 🟢 Green | **Conservative Habitable** | Primary habitable zone |
| 🩵 Cyan | **Optimistic Habitable** (= Cold) | Extended habitable zone |
| 🔵 Blue | **Outer Solar System** | Beyond frost line |

---

## Complete Position Table (25 Combinations)

```typescript
export const WORLD_POSITION_TABLE = [
  // Average Atmosphere (5 combinations)
  { atm: "Average",   temp: "Average",  zones: [{ roll: null, zone: "Conservative Habitable" }] },
  { atm: "Average",   temp: "Cold",     zones: [{ roll: null, zone: "Conservative Habitable" }] },
  { atm: "Average",   temp: "Freezing", zones: [{ roll: null, zone: "Outer Solar System" }] },
  { atm: "Average",   temp: "Hot",      zones: [{ roll: null, zone: "Hot" }] },
  { atm: "Average",   temp: "Inferno",  zones: [{ roll: null, zone: "Infernal" }] },

  // Thin Atmosphere (5 combinations)
  { atm: "Thin",      temp: "Average",  zones: [{ roll: null, zone: "Hot" }] },
  { atm: "Thin",      temp: "Cold",     zones: [{ roll: null, zone: "Conservative Habitable" }] },
  { atm: "Thin",      temp: "Freezing", zones: [{ roll: [5,6], zone: "Conservative Habitable" }, { roll: [3,4], zone: "Optimistic Habitable" }, { roll: [1,2], zone: "Outer Solar System" }] },
  { atm: "Thin",      temp: "Hot",      zones: [{ roll: null, zone: "Hot" }] },
  { atm: "Thin",      temp: "Inferno",  zones: [{ roll: null, zone: "Infernal" }] },

  // Trace Atmosphere (5 combinations)
  { atm: "Trace",     temp: "Average",  zones: [{ roll: null, zone: "Hot" }] },
  { atm: "Trace",     temp: "Cold",     zones: [{ roll: null, zone: "Conservative Habitable" }] },
  { atm: "Trace",     temp: "Freezing", zones: [{ roll: [5,6], zone: "Conservative Habitable" }, { roll: [3,4], zone: "Optimistic Habitable" }, { roll: [1,2], zone: "Outer Solar System" }] },
  { atm: "Trace",     temp: "Hot",      zones: [{ roll: null, zone: "Hot" }] },
  { atm: "Trace",     temp: "Inferno",  zones: [{ roll: null, zone: "Infernal" }] },

  // Dense Atmosphere (5 combinations)
  { atm: "Dense",     temp: "Average",  zones: [{ roll: null, zone: "Outer Solar System" }] },
  { atm: "Dense",     temp: "Cold",     zones: [{ roll: [4,5,6], zone: "Optimistic Habitable" }, { roll: [1,2,3], zone: "Outer Solar System" }] },
  { atm: "Dense",     temp: "Freezing", zones: [{ roll: null, zone: "Outer Solar System" }] },
  { atm: "Dense",     temp: "Hot",      zones: [{ roll: [1,2,3], zone: "Conservative Habitable" }, { roll: [4,5,6], zone: "Optimistic Habitable" }] },
  { atm: "Dense",     temp: "Inferno",  zones: [{ roll: [4,5,6], zone: "Infernal" }, { roll: [1,2,3], zone: "Hot" }] },

  // Crushing Atmosphere (5 combinations)
  { atm: "Crushing",  temp: "Average",  zones: [{ roll: null, zone: "Optimistic Habitable" }] },
  { atm: "Crushing",  temp: "Cold",     zones: [{ roll: null, zone: "Outer Solar System" }] },
  { atm: "Crushing",  temp: "Freezing", zones: [{ roll: null, zone: "Outer Solar System" }] },
  { atm: "Crushing",  temp: "Hot",      zones: [{ roll: [1,2,3], zone: "Hot" }, { roll: [4,5,6], zone: "Conservative Habitable" }] },
  { atm: "Crushing",  temp: "Inferno",  zones: [{ roll: null, zone: "Infernal" }] },
] as const;
```

---

## Multi-Zone Resolution

For entries with multiple zones, roll **1D6** to determine which zone applies:

### Example: Thin-Atm Freezing-Temp
```
Roll 1D6:
  5-6 → Conservative Habitable
  3-4 → Optimistic Habitable  
  1-2 → Outer Solar System
```

### Example: Dense-Atm Hot-Temp
```
Roll 1D6:
  1-3 → Conservative Habitable
  4-6 → Optimistic Habitable
```

---

## AU Distance Formulas

Once the zone is determined, roll **1D6** and apply the formula:

| Zone | Formula |
|------|---------|
| **Infernal** | √L☉ × (0.067 × 1D6) |
| **Hot** | √L☉ × ((0.067 × 1D6) + 0.4) |
| **Conservative Habitable** | √L☉ × ((0.067 × 1D6) + 0.7) |
| **Optimistic Habitable** (= Cold) | √L☉ × ((0.61 × 1D6) + 1.2) |
| **Outer Solar System** | √L☉ × ((1D6)² + 4.85) × multiplier |

### Outer Solar System Multiplier Rule
- Roll 1D6, square it, add 4.85
- If roll = 6: multiply total distance by 6 and re-roll, repeating for each consecutive 6
- **Cap:** Stop multiplying once cumulative multiplier ≥ 64 (max ×216 after three 6s); a further 6 after that is treated as a non-6 result
- Example: Roll 6, then 6, then 4 → multiplier = 36 (6 × 6); distance = √L☉ × (4² + 4.85) × 36

---

## Examples

### Example 1: Ave-Atm Ave-Temp around G2 Star (L☉ = 0.76)
1. Zone: **Conservative Habitable** (green only)
2. Roll 1D6 = 4
3. Distance = √0.76 × ((0.067 × 4) + 0.7)
4. Distance = 0.87 × (0.268 + 0.7)
5. Distance = 0.87 × 0.968 = **0.84 AU**

### Example 2: Thin-Atm Freezing-Temp around G2 Star
1. Roll 1D6 for zone = 5 → **Conservative Habitable**
2. Roll 1D6 for distance = 3
3. Distance = √0.76 × ((0.067 × 3) + 0.7)
4. Distance = 0.87 × (0.201 + 0.7)
5. Distance = 0.87 × 0.901 = **0.78 AU**

### Example 3: Dense-Atm Hot-Temp around G2 Star
1. Roll 1D6 for zone = 2 → **Conservative Habitable**
2. Roll 1D6 for distance = 6
3. Distance = √0.76 × ((0.067 × 6) + 0.7)
4. Distance = 0.87 × (0.402 + 0.7)
5. Distance = 0.87 × 1.102 = **0.96 AU**
