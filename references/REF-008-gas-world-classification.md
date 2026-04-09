# REF-008: Gas World Classification

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 8.3 Gas World Classification  
**Last Updated:** 2026-04-09

---

## Overview

Classifies gas giants into five types based on temperature and cloud composition.

Roll **5D6** to determine the gas world class.

---

## Gas World Classification Table

| 5D6 Result | Class | Name | Temperature | Cloud Composition | Zone |
|------------|-------|------|-------------|-------------------|------|
| ≤20 | **I** | Ammonia Clouds | <150 K | Ammonia (NH₃), Ammonium Hydrosulfide (NH₄SH) | Outer Solar System |
| 21-26 | **II** | Water Clouds | 150-250 K | Water (H₂O), Ice crystals | Conservative/Optimistic Habitable |
| 27-28 | **III** | Cloudless | 350-800 K | None (too hot for clouds) | Infernal |
| 29 | **IV** | Alkali Metals | 900-1300 K | Sodium (Na), Potassium (K) | Hot |
| ≥30 | **V** | Silicate Clouds | >1400 K | Silicate, Iron | Hot |

---

## Class Details

### Class I: Ammonia Clouds
- **Temperature:** Very cold (<150 K / -123°C)
- **Appearance:** White to pale yellow
- **Examples:** Jupiter, Saturn
- **Zone:** Outer Solar System
- **Position Roll:** Fixed to Outer

### Class II: Water Clouds
- **Temperature:** Cold to cool (150-250 K / -123 to -23°C)
- **Appearance:** Blue to white
- **Examples:** None in Solar System (hypothetical)
- **Zone:** Conservative or Optimistic Habitable
- **Position Roll:** 1D6: 4-6 = Conservative, 1-3 = Optimistic

### Class III: Cloudless
- **Temperature:** Hot (350-800 K / 77 to 527°C)
- **Appearance:** Dark, featureless
- **Examples:** None in Solar System (hypothetical)
- **Zone:** Infernal
- **Position Roll:** Fixed to Infernal

### Class IV: Alkali Metals
- **Temperature:** Very hot (900-1300 K / 627 to 1027°C)
- **Appearance:** Dark with bright alkali metal lines
- **Examples:** None in Solar System (hypothetical)
- **Zone:** Hot
- **Position Roll:** Fixed to Hot

### Class V: Silicate Clouds
- **Temperature:** Extremely hot (>1400 K / >1127°C)
- **Appearance:** Glowing red to orange
- **Examples:** Hot Jupiters (exoplanets)
- **Zone:** Hot
- **Position Roll:** Fixed to Hot

---

## Zone Determination by Class

| Class | Zone Determination |
|-------|-------------------|
| **I** | Fixed: Outer Solar System |
| **II** | Roll 1D6: 4-6 = Conservative, 1-3 = Optimistic |
| **III** | Fixed: Infernal |
| **IV** | Fixed: Hot |
| **V** | Fixed: Hot |

---

## Examples

### Example 1: Gas World Classification
1. Roll 5D6 = 18
2. Result: **Class I** (Ammonia Clouds)
3. Zone: Outer Solar System
4. Roll 1D6 for AU = 4
5. Distance = √L☉ × ((4²) + 4.85) = √L☉ × 20.85

### Example 2: Gas World Classification
1. Roll 5D6 = 24
2. Result: **Class II** (Water Clouds)
3. Roll 1D6 for zone = 5 → Conservative Habitable
4. Roll 1D6 for AU = 3
5. Distance = √L☉ × ((0.067 × 3) + 0.7) = √L☉ × 0.901

### Example 3: Gas World Classification
1. Roll 5D6 = 30
2. Result: **Class V** (Silicate Clouds)
3. Zone: Hot
4. Roll 1D6 for AU = 2
5. Distance = √L☉ × ((0.067 × 2) + 0.4) = √L☉ × 0.534

---

## Implementation

```typescript
function classifyGasWorld(): GasWorldClass {
  const roll = rollKeep(5, 6, 5, 1, 0); // 5D6
  
  if (roll <= 20) return { class: 'I', name: 'Ammonia Clouds', zone: 'Outer Solar System' };
  if (roll <= 26) return { class: 'II', name: 'Water Clouds', zone: 'variable' };
  if (roll <= 28) return { class: 'III', name: 'Cloudless', zone: 'Infernal' };
  if (roll === 29) return { class: 'IV', name: 'Alkali Metals', zone: 'Hot' };
  return { class: 'V', name: 'Silicate Clouds', zone: 'Hot' };
}

function getGasWorldZone(gasClass: GasWorldClass): Zone {
  switch (gasClass.class) {
    case 'I': return 'Outer Solar System';
    case 'II':
      const roll = rollD6();
      return roll >= 4 ? 'Conservative Habitable' : 'Optimistic Habitable';
    case 'III': return 'Infernal';
    case 'IV':
    case 'V': return 'Hot';
  }
}
```

---

## Real-World Equivalents

| Solar System Body | Equivalent Class |
|-------------------|------------------|
| Jupiter | Class I |
| Saturn | Class I |
| Uranus | Class I |
| Neptune | Class I |
| Hot Jupiters (exoplanets) | Class V |
