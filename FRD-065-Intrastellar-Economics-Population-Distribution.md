# FRD-065: Intrastellar Economics & Population Distribution

**Project:** Mneme CE World Generator  
**Date:** 260424  
**Status:** Draft  
**Depends On:** FRD-064 (Procedural Business Generation), FRD-040 (Intrastellar Population Distribution)  
**Priority:** P1  

---

## 1. Purpose

CE Traveller economics are abstracted to a single main-world UWP code. MWG already calculates detailed economic outputs (FRD-032). This FRD extends that detail across **every inhabited body in a star system**, breaking population into economic sectors, employment pools, and settlement types. The result is a coherent intrastellar economy that answers:

- Where do people live? (main world, moons, habitats, asteroid belts)
- What do they do? (primary sector, manufacturing, services, bureaucracy)
- How rich are they? (per-capita income by body, SOC distribution)
- What moves between bodies? (feeds FRD-066 trade routes)

---

## 2. Core Problem with CE Economics

Standard Cepheus Engine uses:
- **Trade Codes** (Ag, Na, In, etc.) as coarse buckets
- **Single main world** as the sole economic actor
- **Passenger & freight tables** that ignore intrasystem travel

In Mneme, we can model the **entire star system** as an interconnected economy:
- A gas giant's fuel-skimming stations feed the starport
- An asteroid belt's refineries supply manufacturing on the main world
- A cold moon's research outpost buys luxury goods from the habitable world

---

## 3. Data Model

### 3.1 `EconomicZone` (per body)

```typescript
interface EconomicZone {
  bodyId: string;
  bodyName: string;
  bodyType: BodyType;

  /** Total population on this body */
  population: number;

  /** Economic sectors (percentages sum to 100) */
  sectors: EconomicSectors;

  /** Per-capita annual income (Cr) */
  perCapitaIncome: number;

  /** Total GDP for this body (population × perCapitaIncome) */
  gdp: number;

  /** SOC distribution (percentile buckets) */
  socDistribution: SocDistribution;

  /** Major employers on this body */
  employerBusinessIds: string[];

  /** What this body exports to other bodies in the system */
  exports: CommodityFlow[];

  /** What this body imports from other bodies in the system */
  imports: CommodityFlow[];
}

interface EconomicSectors {
  primary: number;      // % — agriculture, mining, extraction, fuel-skimming
  secondary: number;    // % — manufacturing, construction, refining
  tertiary: number;     // % — services, trade, hospitality, transport
  quaternary: number;   // % — research, finance, government, education
  informal: number;     // % — black market, subsistence, unregistered
}

interface SocDistribution {
  soc1_4: number;       // % labour, service, military enlisted
  soc5_7: number;       // % skilled trades, small business, NCOs
  soc8_10: number;      // % professionals, officers, managers
  soc11_12: number;     // % executives, senior officials
  soc13_15: number;     // % elite, nobility, mega-corp board
}

interface CommodityFlow {
  commodity: string;    // e.g. "hydrogen fuel", "rare earths", "starship components", "luxury goods"
  volumeCr: number;     // annual value in credits
  destinationBodyId: string; // within this system
  sourceBodyId: string;
}
```

### 3.2 `StarSystemEconomy`

```typescript
interface StarSystemEconomy {
  systemId: string;
  totalPopulation: number;
  totalGdp: number;
  systemGini: number;   // inequality index (0 = perfectly equal, 1 = all wealth to one person)
  zones: EconomicZone[];
  interstellarTradeBalance: number; // net Cr/year with other star systems
}
```

---

## 4. Generation Algorithm

### 4.1 Population Distribution (extends FRD-040)

1. Calculate habitability and carrying capacity for every body (as per FRD-040).
2. Adjust capacity by **economic opportunity**:
   - Bodies with mining businesses → +20% capacity
   - Bodies with research / high-TL → +10% capacity (habitat appeal)
   - Gas giants with fuel skimming → +15% capacity (orbital stations)
3. Distribute total system population proportionally to adjusted capacities.
4. Ensure main world retains **30–70%** of total population (political/economic gravity).

### 4.2 Sector Allocation per Body

Sector mix depends on body type, habitability, TL, and existing businesses:

```typescript
function allocateSectors(body: PlanetaryBody, businesses: Business[]): EconomicSectors {
  const hasMining = businesses.some(b => b.type === 'mining');
  const hasMfg = businesses.some(b => b.type === 'manufacturing');
  const hasResearch = businesses.some(b => b.type === 'research');
  const isHabitable = (body.habitability ?? 0) >= 3;

  let primary = isHabitable ? 20 : hasMining ? 50 : 30;
  let secondary = hasMfg ? 30 : 15;
  let tertiary = isHabitable ? 40 : 20;
  let quaternary = hasResearch ? 15 : 5;
  let informal = 100 - primary - secondary - tertiary - quaternary;

  // Normalise to 100%
  const sum = primary + secondary + tertiary + quaternary + informal;
  return {
    primary: Math.round(primary / sum * 100),
    secondary: Math.round(secondary / sum * 100),
    tertiary: Math.round(tertiary / sum * 100),
    quaternary: Math.round(quaternary / sum * 100),
    informal: Math.round(informal / sum * 100),
  };
}
```

### 4.3 Per-Capita Income by Body

```typescript
function bodyPerCapitaIncome(
  mainWorldIncome: number,
  bodyHabitability: number,
  bodyTechLevel: number,
  bodySectors: EconomicSectors
): number {
  // Base: main world income adjusted for local conditions
  let income = mainWorldIncome;

  // Habitability penalty: hostile worlds pay hazard bonuses
  if (bodyHabitability < 3) income *= 1.2;
  if (bodyHabitability < 1) income *= 1.3;

  // TL adjustment: higher TL worlds are more productive
  income *= 1 + (bodyTechLevel - 7) * 0.05;

  // Sector premium: quaternary pays best, informal pays worst
  income *= 1 + (bodySectors.quaternary - bodySectors.informal) / 200;

  return Math.round(income);
}
```

### 4.4 SOC Distribution

Derived from per-capita income and sector mix:

| Condition | SOC 13–15 | SOC 11–12 | SOC 8–10 | SOC 5–7 | SOC 1–4 |
|---|---|---|---|---|---|
| High quaternary (>20%) | 5% | 10% | 25% | 30% | 30% |
| Balanced | 2% | 5% | 18% | 30% | 45% |
| High informal (>30%) | 1% | 3% | 10% | 20% | 66% |

### 4.5 Intrastellar Commodity Flows

For each body pair (A, B) in the system:

1. **A produces commodity X** (from its primary/secondary sectors and business types).
2. **B needs commodity X** (from its secondary/tertiary sectors or deficit in local production).
3. Create a `CommodityFlow` if A's surplus ≥ B's deficit × random(0.5–1.0).
4. Value = tonnes/year × market price (simplified: use CE trade goods table as baseline).

**Example flows:**
- Gas giant (fuel) → Starport/main world (starship operations)
- Asteroid belt (ores) → Industrial moon (refining/manufacturing)
- Main world (agriculture) → Habitat stations (food)
- Research outpost (pharma) → Main world (hospitals)

---

## 5. UI Specifications

### 5.1 System Viewer — Economy Tab (Enhanced)

```
┌─ Economy ────────────────────────┐
│ System GDP: 847 TCr | Pop: 5.2B  │
│ Inequality (Gini): 0.42          │
│                                  │
│ Population Distribution          │
│ ┌──────────────────────────────┐ │
│ │ Main World      ████████████ 67%│
│ │ Moon-2 (Hab)    ██ 12%        │
│ │ Gas Giant Orbit █ 8%          │
│ │ Belt-1          █ 7%          │
│ │ Outer Habitat   ▏ 4%          │
│ │ Research Outpost▏ 2%          │
│ └──────────────────────────────┘ │
│                                  │
│ [View Sector Breakdown]          │
│ [View Trade Flows]               │
│ [View SOC Pyramid]               │
└──────────────────────────────────┘
```

### 5.2 Body-Level Economic Card

Inside **Planetary System → BodyRow expanded view**:

```
┌─ Economic Profile ───────────────┐
│ Population: 420,000              │
│ Per-Capita Income: 24,600 Cr/yr  │
│ Body GDP: 10.3 BCr/yr            │
│                                  │
│ Sectors:                         │
│   Primary   ████████ 35%         │
│   Secondary ██████ 25%           │
│   Tertiary  ████████ 30%         │
│   Quaternary██ 8%                │
│   Informal  █ 2%                 │
│                                  │
│ Exports: hydrogen fuel → Main World│
│ Imports: electronics ← Main World │
│                                  │
│ Major Employers:                 │
│   • Twin Suns Fuel (tier 3)      │
│   • Bakunawa Orbital Yard (tier 3)│
└──────────────────────────────────┘
```

---

## 6. Integration with Other FRDs

| FRD | Integration Point |
|---|---|
| FRD-040 | Population distribution logic; this FRD adds economic layer on top |
| FRD-032 | Economic presets and productivity multipliers feed per-capita income |
| FRD-064 | Business `products`/`imports` arrays become `CommodityFlow` edges |
| FRD-066 | Intrastellar commodity flows are the input data for 2D map trade routes |
| FRD-063 | Cultural bias affects business naming and employer identity |

---

## 7. Export & Persistence

- `StarSystemEconomy` stored in new IndexedDB table `systemEconomies`.
- `.mneme-batch` export includes `economy` object.
- DOCX export gains:
  - "System Economic Summary" page
  - Per-body "Settlement & Economy" subsections
  - "Major Trade Flows" table (top 10 by value)

---

## 8. QA Acceptance

### QA-ECO-01 — Population sums correctly
**Test:** Sum `population` across all `EconomicZone` entries. Must equal `StarSystem.totalPopulation` within ±0.1%.

### QA-ECO-02 — Sector percentages sum to 100
**Test:** For every body, `primary + secondary + tertiary + quaternary + informal === 100`.

### QA-ECO-03 — SOC distribution sums to 100
**Test:** For every body, percentile buckets sum to 100%.

### QA-ECO-04 — GDP consistency
**Test:** `zone.gdp` must equal `zone.population × zone.perCapitaIncome` within rounding error.

### QA-ECO-05 — Trade flow bidirectionality
**Test:** If body A exports fuel to body B, body B's imports must include fuel from body A. Values must match.

### QA-ECO-06 — Main world dominance
**Test:** Main world population share is always 30–70% of total system population.

---

## 9. Open Questions

1. **Should TL vary by body?** Currently MWG assigns one TL per system. Should habitats or research outposts have locally higher TL?
2. **How to model unemployment?** Should sector percentages include an explicit unemployment bucket, or absorb it into `informal`?
3. **Real-time vs snapshot:** Should the economy be a static snapshot at generation, or should the historical event engine (FRD-055) mutate it over time?
