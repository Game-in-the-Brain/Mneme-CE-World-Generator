# REF-007: Planetary Systems Table

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 8.2 Body Mass Generation  
**Last Updated:** 2026-04-10

---

## Overview

Determines the mass of planetary bodies (disks, dwarf planets, terrestrial worlds, ice worlds, gas worlds) in the system.

---

## Roll Modifier by Stellar Class

| Stellar Class | Modifier |
|---------------|----------|
| F | Adv+2 |
| G | Baseline (no modifier) |
| K | Dis+2 |
| M | Dis+4 |
| O, B, A | Disks only |

> **House Rule REF-007 v1.1:** G-class is redefined as the baseline — no modifier. K escalated to Dis+2 (was None). M escalated to Dis+4 (was Dis+1 per book). F and O/B/A unchanged.

---

## Mass Units

| Unit | Full Name | Conversion |
|------|-----------|------------|
| CM | Ceres Mass | 9.39 × 10²⁰ kg |
| LM | Lunar Mass | 7.35 × 10²² kg (0.0123 EM) |
| EM | Earth Mass | 5.97 × 10²⁴ kg |
| JM | Jupiter Mass | 1.90 × 10²⁷ kg (317.8 EM) |

---

## Planetary Systems Table (2D6)

| 2D6 | Circumstellar Disk | Dwarf Planet | Terrestrial World | Ice World | Gas World |
|-----|-------------------|--------------|-------------------|-----------|-----------|
| **2** | 0.01 CM | 0.1 LM | 0.1 EM | 0.03 EM | 0.1 EM |
| **3** | 0.1 CM | 0.2 LM | 0.2 EM | 0.1 EM | 0.3 EM |
| **4** | 1 CM | 0.3 LM | 0.3 EM | 0.3 EM | 1 EM |
| **5** | 10 CM | 0.5 LM | 0.5 EM | 1 EM | 3 EM |
| **6** | 1 LM | 0.7 LM | 0.7 EM | 3 EM | 0.03 JM |
| **7** | 10 LM | 1.0 LM | 1.0 EM | 0.03 JM | 0.1 JM |
| **8** | 0.1 EM | 1.5 LM | 1.5 EM | 0.1 JM | 0.3 JM |
| **9** | 1 EM | 2 LM | 2 EM | 0.3 JM | 1 JM |
| **10** | 10 EM | 3 LM | 3 EM | 1 JM | 3 JM |
| **11** | 0.3 JM | 5 LM | 5 EM | 2 JM | 5 JM |
| **≥12** | 3 JM | 7 LM | 7 EM | 3 JM | 7 JM |

---

## Body Count Generation

| Body Type | Roll | Formula |
|-----------|------|---------|
| Circumstellar Disks | 2D3 | Result - 2 (0-4 disks) |
| Dwarf Planets | 3D6 | Result - 3 (0-15 planets) |
| Terrestrial Worlds | 2D6 | Result - 2 (0-10 worlds) |
| Ice Worlds | 2D3 | Result - 2 (0-4 worlds) |
| Gas Worlds | 2D3 | Result - 2 (0-4 worlds) |

---

## Examples

### Example 1: G-Class Star, Dwarf Planet Mass
1. Modifier: Baseline → roll 3D6 keep 2 (no advantage or disadvantage)
2. Roll: [3, 5, 2] → keep 5, 3 = **8**
3. Result: **1.5 LM** (Lunar Masses)

### Example 2: F-Class Star, Gas World Mass
1. Modifier: Adv+2 → roll 4D6 keep 2
2. Roll: [4, 6, 2, 5] → keep 6, 5 = **11**
3. Result: **5 JM** (Jupiter Masses)

### Example 3: M-Class Star, Terrestrial World Mass
1. Modifier: Dis+1 → roll 3D6 keep 2 lowest
2. Roll: [2, 4, 3] → keep 2, 3 = **5**
3. Result: **0.5 EM** (Earth Masses)

---

## Implementation

```typescript
function generateBodyMass(
  bodyType: BodyType,
  stellarClass: StarClass,
  roll2d6: number
): number {
  const tableRow = PLANETARY_SYSTEMS_TABLE[roll2d6];
  
  switch (bodyType) {
    case 'circumstellar': return tableRow.circumstellar;
    case 'dwarf': return tableRow.dwarf;
    case 'terrestrial': return tableRow.terrestrial;
    case 'ice': return tableRow.ice;
    case 'gas': return tableRow.gas;
  }
}

function getModifiedRoll(stellarClass: StarClass): number {
  switch (stellarClass) {
    case 'F': return rollKeep(4, 6, 2, 1, 0); // Adv+2
    case 'G': return rollKeep(3, 6, 2, 1, 0); // Adv+1
    case 'K': return rollKeep(2, 6, 2, 1, 0); // No mod
    case 'M': return rollKeep(3, 6, 2, 0, 0); // Dis+1
    default: return rollKeep(2, 6, 2, 1, 0);  // O, B, A - disks only
  }
}
```

---

## Mass Distribution Notes

- **Circumstellar Disks:** Range from tiny (0.01 CM) to massive (3 JM)
- **Dwarf Planets:** Typically 0.1-7 LM (Moon-sized or smaller)
- **Terrestrial Worlds:** 0.1-7 EM (Mars to Super-Earth range)
- **Ice Worlds:** 0.03 EM to 3 JM (Pluto to Neptune range)
- **Gas Worlds:** 0.1 EM to 7 JM (Sub-Earth to Super-Jupiter range)
