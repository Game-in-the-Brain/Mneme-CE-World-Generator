# FRD-062: MWG Hill Sphere / SOI Display

## 1. Purpose

Display the Hill Sphere (also known as Sphere of Influence, SOI) radius for every planetary body in the Mneme World Generator (MWG) System Viewer. This provides:

1. **Visual reference** for end users to understand each body's gravitational domain
2. **Verification** that the HRS/SOI traversal costs calculated by the 2D Star System Map Travel Planner are correct
3. **Narrative context** for referees deciding where ships can safely park, where moons can exist, and where gravitational interference occurs

## 2. Hill Sphere Formula

```
r_H = a * ∛(m / (3 * M))
```

Where:
- `a` = orbital distance from star (AU)
- `m` = body mass (Earth Masses)
- `M` = star mass (Solar Masses)

Implementation in `src/lib/physicalProperties.ts`:

```typescript
export function hillSphereAU(
  massEM: number,
  starMassSolar: number,
  distanceAU: number,
  bodyType: BodyType
): number {
  if (bodyType === 'star' || bodyType === 'ring' || distanceAU <= 0 || starMassSolar <= 0) return 0;
  const SOLAR_TO_EM = 332946; // 1 solar mass in Earth masses
  const massRatio = massEM / (3 * starMassSolar * SOLAR_TO_EM);
  if (massRatio <= 0) return 0;
  return distanceAU * Math.cbrt(massRatio);
}
```

## 3. UI Placement

### 3.1 Location

Inside **Planetary System → All Bodies by Distance → BodyRow expanded view**, in the physical properties grid.

### 3.2 Display Format

- **Label**: "Hill Sphere"
- **Value**: displayed in scientific notation with 3 significant figures (e.g., `1.234e-4 AU`)
- **Condition**: Only shown when `hillSphereAU > 0` (hidden for stars, rings, and invalid data)
- **Grid position**: 6th column in the physical properties row (after Density, Radius, Diameter, Surface Gravity, Escape Velocity)

### 3.3 Responsive Layout

```
Mobile (<768px):  grid-cols-2
Desktop (≥768px): grid-cols-6
```

## 4. Component Changes

### 4.1 `src/lib/physicalProperties.ts`

Add the `hillSphereAU()` export function. No changes to existing functions.

### 4.2 `src/components/SystemViewer.tsx`

**Import:**
```typescript
import { hillSphereAU } from '../lib/physicalProperties';
```

**Prop drilling:**
- `PlanetarySystemTab` → `ParentBodyList`: pass `starMassSolar={system.primaryStar.mass}`
- `ParentBodyList` → `BodyRow`: pass `starMassSolar={starMassSolar}`
- `BodyRow` signature: add `starMassSolar: number`

**Display (inside BodyRow expanded view):**
```tsx
{(() => {
  const hs = hillSphereAU(body.mass, starMassSolar, body.distanceAU, body.type);
  if (hs <= 0) return null;
  return <PhysProp label="Hill Sphere" value={`${hs.toExponential(3)} AU`} />;
})()}
```

## 5. Cross-Reference to 2D Map

The same `hillSphereAU()` formula is used in:
- `/home/justin/opencode260220/2d-star-system-map/src/travelPhysics.ts` (FRD-060 §29)

End users can compare the MWG display with the 2D map's HRS traversal cost to verify consistency.

## 6. QA Acceptance

### QA-HS-01 — Hill Sphere displayed for all non-star, non-ring bodies
**Test**: Generate any system, open Planetary System tab, expand every body row. Every body except stars and rings shows a Hill Sphere value > 0.

### QA-HS-02 — Hill Sphere hidden for stars and rings
**Test**: Expand a circumstellar disk or ring entry. No Hill Sphere row appears.

### QA-HS-03 — Formula correctness
**Test**: For a 1 M⊕ body at 1 AU around a 1 M☉ star, Hill Sphere ≈ 0.0069 AU. Verify displayed value is in this order of magnitude.

### QA-HS-04 — Consistency with 2D map
**Test**: Note the Hill Sphere of a gas giant in MWG. Paste the system into the 2D map, plan a transfer that passes near that gas giant. The HRS traversal cost should correspond to a body whose Hill Sphere radius matches the MWG display.

## 7. Version

- **FRD Version**: 1.0
- **Target MWG Version**: Next release after v2.02
