# REF-003: Orbit Table

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 5.4 Companion Orbit  
**Last Updated:** 2026-04-09

---

## Overview

Determines the orbital distance of a companion star from its reference star (primary or another companion).

Roll **3D6** and cross-reference with the **previous star's** spectral class.

---

## Orbit Distance Table (AU)

| 3D6 Roll | O Class | B Class | A Class | F Class | G Class | K Class | M Class |
|----------|---------|---------|---------|---------|---------|---------|---------|
| **3-4** | <50 AU | <10 AU | <5 AU | <1 AU | <0.5 AU | <0.25 AU | <0.125 AU |
| **5-7** | 50-<100 AU | 10-<50 AU | 5-<10 AU | 1-<5 AU | 0.5-<1 AU | 0.25-<0.5 AU | 0.125-<0.25 AU |
| **8-11** | 100-<500 AU | 50-<100 AU | 10-<50 AU | 5-<10 AU | 1-<5 AU | 0.5-<1 AU | 0.25-<0.5 AU |
| **12-14** | 500-<1000 AU | 100-<500 AU | 50-<100 AU | 10-<50 AU | 5-<10 AU | 1-<5 AU | 0.5-<1 AU |
| **15-16** | 5000-<10000 AU | 500-<1000 AU | 100-<500 AU | 50-<100 AU | 10-<50 AU | 5-<10 AU | 1-<5 AU |
| **17** | 10000-<50000 AU | 5000-<10000 AU | 500-<1000 AU | 100-<500 AU | 50-<100 AU | 10-<50 AU | 5-<10 AU |
| **18** | ×10 | ×10 | ×10 | ×10 | ×10 | ×10 | ×10 |

---

## Special Rule: Roll 18

If you roll **18** on 3D6:
1. Roll 3D6 again
2. Multiply the result distance by **10**
3. If the re-roll is also 18, multiply again (×100 total)
4. **Cap:** Maximum 2 re-rolls. A third consecutive 18 is treated as 17 and no further multiplier is applied.

---

## Examples

### Example 1: G-Class Primary, Companion Roll = 10
- Primary: G-class
- Roll: 10 (falls in 8-11 range)
- Result: **1-5 AU** from primary

### Example 2: M-Class Companion, New Companion Roll = 7
- Reference: M-class companion
- Roll: 7 (falls in 5-7 range)
- Result: **0.125-0.25 AU** from the M-class companion

### Example 3: O-Class Primary, Companion Roll = 18
- Primary: O-class
- Roll: 18 → ×10 rule
- Roll again: 12 → 500-<1000 AU
- Final: **5000-<10000 AU** from primary

---

## Implementation

```typescript
function calculateCompanionOrbit(previousClass: StarClass, roll3d6: number): string {
  if (roll3d6 === 18) {
    // Handle ×10 cascading — cap at 2 re-rolls (max ×100)
    let multiplier = 1;
    let rerolls = 0;
    let newRoll = roll3D6();
    while (newRoll === 18 && rerolls < 2) {
      multiplier *= 10;
      rerolls++;
      newRoll = roll3D6();
    }
    // If newRoll still 18 after cap, treat as 17
    if (newRoll === 18) newRoll = 17;
    const baseOrbit = getOrbitFromTable(previousClass, newRoll);
    return applyMultiplier(baseOrbit, multiplier);
  }
  
  return getOrbitFromTable(previousClass, roll3d6);
}
```

---

## Visual Scale Reference

| Distance | Context |
|----------|---------|
| <0.1 AU | Extremely close, tidal effects likely |
| 0.1-1 AU | Close binary, habitable zone overlap possible |
| 1-10 AU | Moderate separation, distinct habitable zones |
| 10-100 AU | Wide binary, separate planetary systems |
| 100-1000 AU | Very wide, Oort cloud overlap possible |
| >1000 AU | Barely gravitationally bound |
