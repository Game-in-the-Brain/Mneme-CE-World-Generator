# REF-009: Disk Zone Table

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 8.5 Disk Zone  
**Last Updated:** 2026-04-09

---

## Overview

Determines the zone location of circumstellar disks (debris disks, asteroid belts, etc.).

Roll **2D6** to determine the zone.

---

## Disk Zone Table

| 2D6 Roll | Zone | Description |
|----------|------|-------------|
| **2** | **Infernal** | Innermost zone, extremely hot debris |
| **3** | **Hot** | Inner zone, hot debris |
| **4** | **Conservative Habitable** | Primary habitable zone, warm debris |
| **5** | **Cold** (= Optimistic Habitable) | Extended habitable zone, cool debris |
| **6+** | **Outer Solar System** | Beyond frost line, cold debris |

---

## Probability Distribution

| Zone | 2D6 Rolls | Probability |
|------|-----------|-------------|
| Infernal | 2 only | 2.78% (1/36) |
| Hot | 3 only | 5.56% (2/36) |
| Conservative Habitable | 4 only | 8.33% (3/36) |
| Cold | 5 only | 11.11% (4/36) |
| Outer Solar System | 6-12 | 72.22% (26/36) |

---

## Disk Types by Zone

| Zone | Typical Disk Composition |
|------|-------------------------|
| **Infernal** | Vaporized rock, metal vapors, extremely hot dust |
| **Hot** | Rocky debris, metal-rich asteroids, hot dust |
| **Conservative Habitable** | Mixed rocky/icy debris, warm asteroids |
| **Cold** | Icy debris, comets, cold asteroids |
| **Outer Solar System** | Icy debris, Kuiper belt objects, comets, cold dust |

---

## Examples

### Example 1: Disk Zone
1. Roll 2D6 = 4
2. Result: **Conservative Habitable** zone
3. Roll 1D6 for AU = 5
4. Distance = √L☉ × ((0.067 × 5) + 0.7) = √L☉ × 1.035

### Example 2: Disk Zone
1. Roll 2D6 = 8
2. Result: **Outer Solar System**
3. Roll 1D6 for AU = 3
4. Distance = √L☉ × ((3²) + 4.85) = √L☉ × 13.85

### Example 3: Disk Zone
1. Roll 2D6 = 2
2. Result: **Infernal** zone
3. Roll 1D6 for AU = 6
4. Distance = √L☉ × (0.067 × 6) = √L☉ × 0.402

---

## Implementation

```typescript
function generateDiskZone(): Zone {
  const roll = rollKeep(2, 6, 2, 1, 0); // 2D6
  
  if (roll === 2) return 'Infernal';
  if (roll === 3) return 'Hot';
  if (roll === 4) return 'Conservative Habitable';
  if (roll === 5) return 'Cold'; // = Optimistic Habitable
  return 'Outer Solar System'; // 6+
}
```

---

## Solar System Analogs

| Solar System Feature | Equivalent Zone |
|---------------------|-----------------|
| Asteroid Belt (2-3.5 AU) | Conservative/Cold boundary |
| Kuiper Belt (30-50 AU) | Outer Solar System |
| Oort Cloud (>2000 AU) | Outer Solar System (extreme) |
| Zodiacal Dust | Inner zones |

---

## Multiple Disks

When a system has multiple disks, each disk is rolled independently for its zone. This can create:

- **Single disk systems:** One debris belt
- **Dual disk systems:** Inner and outer debris belts
- **Multiple disk systems:** Complex debris structures

---

## Notes

- Disks in the **Infernal** zone are rare (2.78% chance) and represent extreme environments
- Most disks (72%) form in the **Outer Solar System** where ices can accumulate
- Disks in the **Conservative Habitable** zone may affect planet formation and migration
