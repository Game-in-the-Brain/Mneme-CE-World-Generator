# FRD-067: Mneme FTL & Barypoint Navigation

**Project:** Mneme CE World Generator  
**Date:** 260424  
**Status:** Draft  
**Depends On:** FRD-060 (Mneme 2D Map), FRD-066 (Trade Routes)  
**Priority:** P2  

---

## 1. Purpose

Define and visualise the **Mneme Faster-Than-Light travel model** for use in MWG and the 2D/3D maps. Unlike standard Traveller jump drives (1-week transit regardless of distance), Mneme FTL is:

- **Instantaneous** — travel time is effectively zero
- **Lagrange-locked** — ships can only enter/exit FTL at Lagrange points (L1–L5) of massive bodies
- **Barypoint-linked** — in multi-star systems, the clearest travel nodes are the **barycentres** (barypoints) between stellar pairs

This creates strategic chokepoints, predictable shipping lanes, and natural locations for starports, defence platforms, and pirate ambushes.

---

## 2. User Story

> As a GM, I want to know where the jump points are in a system, which Lagrange points are active, and where ships arrive from other stars, so I can plan naval battles, customs checkpoints, and smuggling routes.

---

## 3. Core Mechanics

### 3.1 Lagrange Points

Every body-star or body-body pair with sufficient mass ratio generates 5 Lagrange points:

| Point | Location | Stability | FTL Usability |
|---|---|---|---|
| L1 | Between the two bodies | Unstable | ✅ Primary FTL gateway |
| L2 | Beyond the smaller body | Unstable | ✅ Secondary gateway |
| L3 | Opposite the smaller body | Unstable | ⚠️ Rarely used (long approach) |
| L4 | Leading triangular | Stable | ✅ Preferred for stations |
| L5 | Trailing triangular | Stable | ✅ Preferred for stations |

**FTL constraint:** A ship must be within **0.001 AU** of an L-point to engage the Mneme drive. This means:
- Short in-system burns (hours to days) to reach the L-point
- Instant jump to the target system
- Short exit burn from the destination L-point

### 3.2 Barypoints (Multi-Star Systems)

In binary or trinary systems, the **barycentre** of each stellar pair is the dominant gravitational equilibrium point. Barypoints are:

- Always located on the line connecting the two stars
- Distance from primary: `a × (m₂ / (m₁ + m₂))` where `a` = separation, `m₁,m₂` = masses
- The **clearest FTL destination** when jumping into a multi-star system
- Often host the system's primary starport and defence grid

```typescript
interface Barypoint {
  id: string;
  starPair: [string, string];      // IDs of the two stars
  x: number;                       // AU, system barycentric coordinates
  y: number;
  z: number;
  distanceFromPrimaryAU: number;
  isPrimaryNavPoint: boolean;      // true if this is the main arrival point
}
```

### 3.3 Travel Workflow

```
Origin System                          Destination System
├─ Body A (main world)                ├─ Barypoint / L-point
│   ↓ in-system burn (hours)          │   ↓ in-system burn (hours)
├─ L-point of Body A                  ├─ Body B (main world)
│   ↓ Mneme FTL (instant)             │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

**Total trip time** = origin burn + destination burn + manoeuvre margin. Typically **hours**, not weeks.

---

## 4. Generation Rules

### 4.1 Which Bodies Get Lagrange Points?

L-points are generated for:
- Every **planet** around its parent star
- Every **moon** around its parent planet (if moon mass > 0.01 Earth masses)
- Every **stellar pair** in multi-star systems (these become barypoints, not L-points)

Rings, debris disks, and dwarf planets below the mass threshold do not generate usable L-points.

### 4.2 Starport Placement Heuristic

Starports are preferentially placed at:
1. **Barypoints** in multi-star systems (the crossroads)
2. **L4/L5** of gas giants (stable, near fuel sources)
3. **L1** of the main world (shortest shuttle time, but unstable — requires station-keeping)
4. **Planetary surface** only when no viable L-point exists (low-TL worlds)

### 4.3 Defence & Customs Nodes

High-value L-points (barypoints, gas-giant L4/L5) automatically generate:
- Nav beacon / traffic control
- Optional defence platform (if TL ≥ 10 and system is militarised)
- Customs checkpoint (if system government is restrictive)

---

## 5. Visualisation in 2D Map

### 5.1 Lagrange Point Markers

When the **Lagrange Points** layer is enabled (FRD-066 §6.1):

```
L1: ◇ (diamond, small) — unstable, primary gateway
L2: ◇ (diamond, small, hollow) — unstable, secondary
L3: ◇ (diamond, small, dashed) — rarely used
L4: ▲ (triangle, filled) — stable, station-friendly
L5: ▼ (triangle, filled) — stable, station-friendly
```

- Colour: same as parent body orbit colour, desaturated 50%
- Labels: "L1", "L2", etc. shown on hover or at zoom ≥ 2×

### 5.2 Barypoint Markers

In multi-star systems:

```
Barypoint: ★ (star icon, larger than L-points)
Label: "Bary: Alpha-Proxima"
Ring radius: 0.05 AU (visual only, represents safe approach zone)
```

### 5.3 FTL Arrival/Departure Vectors

When viewing a multi-star system map, faint dashed lines connect each star to the barypoint:

```
      ★ Proxima (M5)
       \
        ★ Bary: Alpha-Proxima
       /
      ☉ Alpha Centauri (G2)
```

These lines are **not** travel paths (FTL is instantaneous) but **navigational reference lines** showing the geometric relationship.

---

## 6. Visualisation in 3D Map

The 3D interstellar map (FRD-045/049) uses Mneme FTL for interstellar jumps:

- **Jump origin:** L-point of the departure star's main world (or barypoint, if departing from a multi-star system)
- **Jump destination:** Barypoint of the target multi-star system, or L1 of the target single star's main world
- **Range limit:** Mneme drives have a maximum range (e.g. 5 pc for standard drives, 10 pc for military drives). Beyond this, multi-leg journeys via intermediate systems are required.

### 6.1 3D Map — Jump Range Bubbles

Toggleable sphere around each star showing Mneme drive range:

```typescript
interface JumpRangeBubble {
  starId: string;
  rangePc: number;        // parsecs
  opacity: 0.15;          // subtle overlay
  colour: '#00BFFF';      // cyan for civilian, '#FF4500' for military
}
```

Stars whose bubbles overlap are **direct-jump reachable**. Stars that do not overlap require a **waypoint system**.

---

## 7. Data Model Extensions

### 7.1 `PlanetaryBody`

```typescript
interface PlanetaryBody {
  // ... existing fields ...

  /** Generated Lagrange points for this body */
  lagrangePoints?: LagrangePoint[];
}

interface LagrangePoint {
  number: 1 | 2 | 3 | 4 | 5;
  distanceAU: number;     // distance from parent body
  angleDeg: number;       // orbital angle at epoch
  stability: 'unstable' | 'stable';
  hasStation: boolean;
  stationType?: 'starport' | 'defence' | 'fuel' | 'customs' | 'research';
}
```

### 7.2 `StarSystem`

```typescript
interface StarSystem {
  // ... existing fields ...

  /** For multi-star systems only */
  barypoints?: Barypoint[];

  /** Primary arrival point for FTL traffic */
  primaryNavPointId?: string; // references a barypoint or body L-point
}
```

---

## 8. UI Specifications

### 8.1 MWG System Viewer — Navigation Tab (New)

```
┌─ Navigation ─────────────────────┐
│                                  │
│ Primary Jump Point:              │
│   Bary: Alpha-Proxima (0.12 AU)  │
│   [View on 2D Map]               │
│                                  │
│ Lagrange Points                  │
│ ┌──────────────────────────────┐ │
│ │ Body: Alpha Centauri Bb      │ │
│ │   L1 ◇  Starport (unstable)  │ │
│ │   L4 ▲  Fuel Station (stable)│ │
│ │   L5 ▼  Defence Platform     │ │
│ │ Body: Gas Giant 1            │ │
│ │   L4 ▲  Refinery (stable)    │ │
│ └──────────────────────────────┘ │
│                                  │
│ [Export Jump Points to 3D Map]   │
└──────────────────────────────────┘
```

### 8.2 Travel Planner Integration

The 2D map's existing travel planner (FRD-060 §30) is extended:

```
┌─ Travel Planner ─────────────────┐
│ Origin: [Main World L1 ▼]       │
│ Destination: [Belt-1 L2 ▼]      │
│                                  │
│ In-System Burn: 1.4 days         │
│ FTL Jump: Instant                │
│ Exit Burn: 0.8 days              │
│ Total: 2.2 days                  │
│                                  │
│ [Calculate] [Add to Route]       │
└──────────────────────────────────┘
```

---

## 9. Integration with Other FRDs

| FRD | Integration Point |
|---|---|
| FRD-060 | 2D map orbital rendering; L-point markers overlay on existing canvas |
| FRD-066 | Trade routes terminate at L-points, not body surfaces; route cost includes burn to/from L-point |
| FRD-053 | MWG → 2D map payload includes `lagrangePoints[]` and `barypoints[]` |
| FRD-045/049 | 3D map jump range bubbles and waypoint routing |
| FRD-064 | Starports at L4/L5 are owned by tier-2+ businesses |

---

## 10. Export & Persistence

- L-points and barypoints are stored in `StarSystem` and exported in `.mneme-batch`.
- 2D map interactive HTML export preserves L-point visibility state.
- 3D map `.mneme-map` export includes `barypoints[]` for multi-star systems.

---

## 11. QA Acceptance

### QA-FTL-01 — L-point count
**Test:** Generate a single-star system with 5 planets. Verify each planet has 5 Lagrange points generated.

### QA-FTL-02 — Barypoint in binary system
**Test:** Generate a binary star system. Verify exactly 1 barypoint exists on the line between the two stars.

### QA-FTL-03 — Starport placement preference
**Test:** Generate 10 high-TL systems. Verify ≥60% have their primary starport at an L4/L5 or barypoint, not planetary surface.

### QA-FTL-04 — Travel time sanity
**Test:** Trip from main world to gas giant in same system. In-system burn time must dominate; FTL component must be listed as "instant" or "< 1 min".

### QA-FTL-05 — 3D map jump range
**Test:** Two stars 3 pc apart with 5-pc drive range. Verify direct jump line is drawn. Two stars 7 pc apart. Verify no direct line; waypoint suggestion appears.

---

## 12. Open Questions

1. **Drive range scaling:** Should Mneme drive range be a flat value (e.g. 5 pc), or should it depend on star class / mass (larger gravity wells = longer effective range)?
2. **L-point traffic capacity:** Should there be a limit to how many ships can queue at an L-point, creating congestion at busy systems?
3. **Military drives:** Should there be a separate "fast/stealth" drive class that can use non-standard L-points (e.g. L3, or temporary pseudo-Lagrange points)?
