# FRD-066: 2D Map Trade Routes & Logistics Networks

**Project:** Mneme CE World Generator  
**Date:** 260424  
**Status:** Draft  
**Depends On:** FRD-065 (Intrastellar Economics), FRD-053 (2D Map Integration), FRD-060 (Mneme 2D Map)  
**Priority:** P1  

---

## 1. Purpose

Transform the 2D Star System Map from a purely orbital visualisation into a **logistics and trade dashboard**. Using the intrastellar economic data from FRD-065, MWG generates:

1. **Trade Routes** — arcs between bodies showing commodity flows
2. **Logistics Networks** — layered toggles for fuel lines, supply chains, passenger corridors
3. **Route Economics** — travel time, cost per tonne, and profit margins for each leg

All networks are **toggleable layers** so the GM can declutter the view.

---

## 2. User Story

> As a GM, I want to see which bodies trade with each other, what they ship, and how long it takes, so I can set up smuggling runs, pirate interdiction scenes, and supply-chain sabotage adventures.

---

## 3. Data Sources

The 2D map receives trade data from MWG via the existing sync mechanisms (FRD-053):

| Source | Data | Format |
|---|---|---|
| FRD-065 `CommodityFlow[]` | What moves between bodies | `sourceBodyId`, `destBodyId`, `commodity`, `volumeCr` |
| FRD-060 orbital mechanics | Body positions at epoch | `distanceAU`, `orbital phase` |
| FRD-067 FTL system | Lagrange point locations | `lagrangePoint[]` per body pair |

---

## 4. Network Types (Toggle Layers)

Each layer can be independently shown/hidden via a layer control panel.

### 4.1 Commodity Trade Routes

- **Visual:** Bézier arcs between trading bodies, colour-coded by commodity type.
- **Thickness:** proportional to `volumeCr` (logarithmic scale).
- **Direction:** animated chevrons or pulsing dots showing flow direction.
- **Tooltip:** hover shows commodity name, annual value, and volume.

```typescript
const commodityColors: Record<string, string> = {
  'hydrogen fuel': '#00BFFF',
  'rare earths': '#8B4513',
  'starship components': '#C0C0C0',
  'agricultural products': '#32CD32',
  'pharmaceuticals': '#FF69B4',
  'luxury goods': '#FFD700',
  'waste/recycling': '#8B8B83',
  'default': '#AAAAAA',
};
```

### 4.2 Passenger Corridors

- **Visual:** Dashed lines between high-population bodies.
- **Thickness:** based on combined population of endpoints.
- **Logic:** Any body pair where both have population > 100K and habitability > 0 gets a passenger corridor.

### 4.3 Fuel Lines

- **Visual:** Thin blue lines from gas giants to all other bodies with starship traffic.
- **Logic:** Gas giants auto-export fuel to any body with a starport or orbital station.

### 4.4 Supply Chain (Critical Infrastructure)

- **Visual:** Bold red lines for flows that have no alternative source within the system.
- **Logic:** If body B imports commodity X from body A, and no other body in the system produces X, the A→B link is critical.

### 4.5 Pirate Risk Heat Map

- **Visual:** Semi-transparent overlay colouring space between bodies by piracy risk.
- **Logic:** Based on distance from main world/patrol bases, travel zone (Red = high risk), and presence of criminal factions (FRD-063).

---

## 5. Route Physics & Economics

### 5.1 Travel Time Between Bodies

In-system travel uses realistic thrust-based brachistochrone (as per FRD-060 §29), **not** instantaneous jump.

```typescript
interface RouteLeg {
  fromBodyId: string;
  toBodyId: string;
  distanceAU: number;
  travelDays: number;        // at 1G continuous brachistochrone
  fuelCostCr: number;        // based on ship tonnage and distance
  freightRateCr: number;     // Cr per tonne per AU (market rate)
  profitMargin: number;      // % based on competition and risk
}

function brachistochroneDays(distanceAU: number, accelerationG: number = 1): number {
  const AU_IN_M = 1.496e11;
  const G = 9.81;
  const a = accelerationG * G;
  const d = distanceAU * AU_IN_M;
  // t = 2 × sqrt(d / a)  (accelerate half way, decelerate half way)
  return (2 * Math.sqrt(d / a)) / 86400;
}
```

### 5.2 Route Cost Calculator

Accessible via right-click on any trade arc:

```
┌─ Route: Main World → Belt-1 ─────┐
│ Distance: 2.4 AU                 │
│ Travel Time: 4.2 days @ 1G       │
│                                  │
│ Freight Cost: 12,000 Cr/tonne    │
│ Fuel Cost: 2,400 Cr/tonne        │
│ Risk Surcharge: 800 Cr/tonne     │
│                                  │
│ Market Rate: 15,200 Cr/tonne     │
│ Profit Margin: 8%                │
│                                  │
│ [Plan Shipment] [View Schedule]  │
└──────────────────────────────────┘
```

---

## 6. 2D Map UI Changes

### 6.1 Layer Toggle Panel

New floating panel (collapsible, top-right):

```
┌─ Layers ─────────────────────────┐
│ [☑] Orbits                       │
│ [☑] Bodies                       │
│ [☑] Labels                       │
│ [☑] Zones (Infernal/Hot/...)     │
│ ──────────────────────────────── │
│ [☐] Trade Routes                 │
│ [☐] Passenger Corridors          │
│ [☐] Fuel Lines                   │
│ [☐] Supply Chains (Critical)     │
│ [☐] Pirate Risk Heat Map         │
│ [☐] Lagrange Points              │
│ [☐] Barypoints (multi-star)      │
└──────────────────────────────────┘
```

### 6.2 Body Context Menu

Right-click a body:

```
┌─ Alpha Centauri Bb ──────────────┐
│ [View Economic Profile]          │
│ [View Incoming Trade]            │
│ [View Outgoing Trade]            │
│ [Plan Route From Here...]        │
│ [Set as Origin]                  │
└──────────────────────────────────┘
```

### 6.3 Trade Route Legend

When trade routes are visible, a dynamic legend appears:

```
┌─ Trade Legend ───────────────────┐
│ ─ Hydrogen Fuel     (4 routes)   │
│ ─ Rare Earths       (2 routes)   │
│ ─ Starship Parts    (1 route)    │
│ ─ Luxury Goods      (3 routes)   │
│ [Filter: [All ▼]]                │
└──────────────────────────────────┘
```

---

## 7. MWG Integration Points

### 7.1 Data Pipeline

```
MWG Generator
  ├─ FRD-064: Businesses generated
  ├─ FRD-065: CommodityFlows calculated
  └─ FRD-066: Trade route JSON built
         ↓
  2D Map receives via:
    • postMessage (iframe embed, FRD-053 Option A)
    • localStorage bridge (FRD-053 Option C)
    • URL param + payload (for new-tab open)
```

### 7.2 Trade Route JSON Payload

```typescript
interface TradeRoutePayload {
  version: 'traderoute-v1';
  systemName: string;
  epoch: string;               // ISO date
  bodies: Array<{
    id: string;
    name: string;
    x: number;                 // orbital position at epoch (AU, heliocentric)
    y: number;
    population: number;
    habitability: number;
  }>;
  routes: Array<{
    fromBodyId: string;
    toBodyId: string;
    commodity: string;
    volumeCr: number;
    travelDays: number;
    isCritical: boolean;
    riskLevel: 'safe' | 'moderate' | 'dangerous';
  }>;
  lagrangePoints?: Array<{
    bodyId: string;
    lpNumber: 1 | 2 | 3 | 4 | 5;
    x: number;
    y: number;
  }>;
}
```

---

## 8. Export

- **Interactive HTML export** (FRD-046): includes trade route layers if they were visible at export time.
- **CSV export:** route table with from/to body, commodity, volume, travel time.
- **PNG/Screenshot:** layer toggles are respected in the captured image.

---

## 9. QA Acceptance

### QA-TR-01 — Layer toggle independence
**Test:** Show trade routes. Hide orbits. Verify trade arcs remain visible while orbital paths are hidden.

### QA-TR-02 — Tooltip accuracy
**Test:** Hover a trade arc. Tooltip commodity name and volume must match FRD-065 `CommodityFlow` data.

### QA-TR-03 — Critical supply chain detection
**Test:** Identify a body that imports a commodity produced nowhere else in the system. Verify the incoming arc is styled as critical (bold red) when the Supply Chains layer is on.

### QA-TR-04 — Travel time sanity
**Test:** Route from main world at 1 AU to body at 2 AU. Travel time must be > route to body at 1.5 AU. All times must be ≥ 1 day for distances > 0.1 AU.

### QA-TR-05 — Performance at scale
**Test:** Load a system with 20 bodies and 50 trade routes. Frame rate must stay ≥ 30 fps on a mid-range laptop with all layers enabled.

---

## 10. Open Questions

1. **Should trade routes update in real time** as the orbital animation plays (bodies move, distances change), or should they be static based on epoch positions?
2. **Should we render actual ship sprites** moving along routes, or keep it abstract (arcs only)?
3. **How to handle multi-star systems?** Trade routes between stars are interstellar (jump-capable ships), not brachistochrone. Should they be shown differently?
