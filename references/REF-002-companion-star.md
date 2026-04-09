# REF-002: Companion Star Logic

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 5.3 Companion Star Generation  
**Last Updated:** 2026-04-09

---

## Overview

Companion stars are generated using a **chain rule** where each companion rolls against the **previous star** in the chain (not always the primary). This creates realistic hierarchical star systems.

---

## Step 1: Existence Check

Roll 2D6 and compare against the target based on the **previous star's** class.

### Companion Target Table

| Previous Class | Target | Roll ≥ Target? |
|----------------|--------|----------------|
| O | 4+ | Companion exists |
| B | 5+ | Companion exists |
| A | 6+ | Companion exists |
| F | 7+ | Companion exists |
| G | 8+ | Companion exists |
| K | 9+ | Companion exists |
| M | 10+ | Companion exists |

**Special Rule:** If roll = 12, the companion **is created** AND an additional companion is rolled against this companion's class (not the primary).

---

## Step 2: Roll Class and Grade

Roll 5D6 for class and 5D6 for grade using the same tables as the primary star.

---

## Step 3: Apply Constraints (No Loops)

### Class Constraint

A companion cannot be **more massive** (higher class rank) than the star it orbits.

**Class Rank:** O=7, B=6, A=5, F=4, G=3, K=2, M=1

```typescript
function constrainClass(rolledRank: number, previousRank: number): number {
  if (rolledRank > previousRank) {
    // Scale down proportionally
    const scaledRank = Math.round(rolledRank * (previousRank / 7));
    return Math.max(1, scaledRank); // Minimum M-class
  }
  return rolledRank;
}
```

### Grade Constraint

A companion cannot be **more luminous** (lower grade number) than the star it orbits.

**Grade:** 0 = most luminous, 9 = least luminous

```typescript
function constrainGrade(rolledGrade: number, previousGrade: number): number {
  if (rolledGrade < previousGrade) {
    // Scale up proportionally (less luminous)
    const scaledGrade = Math.round(rolledGrade * (previousGrade / 9));
    return Math.max(previousGrade, Math.min(9, scaledGrade));
  }
  return rolledGrade;
}
```

---

## Step 4: Chain Rule

Each companion uses the **previous star** as its reference for the existence check:

```
Primary Star
    ↓ (rolls vs Primary)
Companion 1
    ↓ (rolls vs Companion 1)
Companion 2
    ↓ (rolls vs Companion 2)
Companion 3
    etc.
```

---

## Step 5: Determine Orbit

Roll 3D6 and look up orbital distance based on the **previous star's** class.

See [REF-003: Orbit Table](./REF-003-orbit-table.md) for full table.

---

## Example: Triple Star System

### Primary: G2 Star
- Class: G (rank 3)
- Grade: 2
- Mass: 0.76 M☉
- Luminosity: 0.76 L☉

### Companion 1 Generation
1. **Existence Check:** Roll 2D6 = 9 vs target 8 (G-class) → SUCCESS
2. **Roll Class:** 5D6 = 24 → F-class (rank 4)
3. **Apply Constraint:** 4 > 3, so scale: round(4 × 3/7) = 2 → K-class
4. **Roll Grade:** 5D6 = 21 → Grade 7
5. **Apply Constraint:** 7 > 2 → OK
6. **Result:** K7 companion
7. **Orbit:** Roll 3D6 = 10 → 1-5 AU from Primary

### Companion 2 Generation (rolls vs Companion 1)
1. **Existence Check:** Roll 2D6 = 10 vs target 9 (K-class) → SUCCESS
2. **Roll Class:** 5D6 = 19 → M-class (rank 1)
3. **Apply Constraint:** 1 ≤ 2 → OK
4. **Roll Grade:** 5D6 = 25 → Grade 5
5. **Apply Constraint:** 5 < 7 (too luminous), so scale: round(5 × 7/9) = 4, then clamp(4, min=7, max=9) = **Grade 7**
6. **Result:** M7 companion
7. **Orbit:** Roll 3D6 = 8 → 0.25-0.5 AU from Companion 1

---

## Implementation Notes

1. **No Infinite Loops:** The constraint system ensures companions are always less massive/luminous than their reference star.

2. **Cascading:** Rolling 12 on existence check creates another companion in the chain.

3. **Orbit Reference:** Orbit distance is always calculated from the **previous star**, not necessarily the primary.

4. **Visual Representation:** In the UI, show companion stars with their orbital distances and indicate which star they orbit.
