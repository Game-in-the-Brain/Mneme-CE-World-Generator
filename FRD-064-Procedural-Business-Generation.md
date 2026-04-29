# FRD-064: Procedural Business & Corporate Entity Generation

**Project:** Mneme CE World Generator  
**Date:** 260424  
**Status:** Draft  
**Depends On:** FRD-063 (Name-Place-Faction Generator Integration) — for faction→business linkage  
**Priority:** P2  

---

## 1. Purpose

Every populated world in MWG gains a procedurally-generated **business ecosystem** ranging from sector-wide mega-corporations down to local family shops. These entities provide:

1. **Economic texture** — who owns the starport, who mines the asteroid belt, who runs the habitat canteen
2. **Adventure hooks** — corporate espionage, supply-chain sabotage, small-business protection rackets
3. **Trade context** — what goods are produced, who buys them, how they move (feeds FRD-066)

---

## 2. User Story

> As a GM, I want to know who the major employers are on a world, what they produce, and who their competitors are, so I can create meaningful patron encounters and trade negotiations.

---

## 3. Business Hierarchy

Businesses are generated in **four tiers**. The tier determines scope, employee count, and number of locations.

| Tier | Name | Scope | Employee Range | Locations |
|---|---|---|---|---|
| 1 | **Mega-Corporation** | Sector-wide (10+ systems) | 1M–1B | HQ + dozens of branch offices |
| 2 | **Corporation** | Multi-system (2–10 systems) | 10K–1M | HQ + 2–10 branches |
| 3 | **Enterprise** | Single system / world | 100–10K | 1–5 facilities |
| 4 | **Small Business** | Local (settlement or habitat) | 1–100 | 1 facility |

---

## 4. Generation Algorithm

### 4.1 Tier Allocation per World

```typescript
function allocateBusinessTiers(population: number, techLevel: number, starportClass: string): BusinessTier[] {
  const tiers: BusinessTier[] = [];

  // Mega-corps: only on high-pop, high-TL, A/B starport worlds
  if (population >= 1e9 && techLevel >= 10 && ['A','B'].includes(starportClass)) {
    tiers.push({ tier: 1, count: rollD66() <= 16 ? 1 : 0 }); // 1 in 6 chance
  }

  // Corporations: high-pop, TL 8+
  if (population >= 1e7 && techLevel >= 8) {
    tiers.push({ tier: 2, count: d66ToRange(rollD66(), 0, 3) });
  }

  // Enterprises: any populated world
  if (population >= 1e3) {
    const base = Math.log10(population) - 2; // 1 at Pop 1K, 7 at Pop 1B
    tiers.push({ tier: 3, count: Math.floor(base * (1 + Math.random())) });
  }

  // Small businesses: ubiquitous
  if (population >= 1) {
    const density = starportClass === 'A' ? 5000 : starportClass === 'B' ? 10000 : 50000;
    tiers.push({ tier: 4, count: Math.floor(population / density) });
  }

  return tiers;
}
```

### 4.2 Business Type Selection

Types are weighted by world tags and body type:

| World Tag / Body Type | Favoured Business Types |
|---|---|
| `trade-hub` | Shipping, brokerage, warehousing, banking |
| `shipyard` | Starship construction, component manufacturing |
| `mining` | Extraction, refining, heavy equipment |
| `agricultural` | Agri-corp, food processing, bio-tech |
| `research` | R&D, pharma, AI labs, universities |
| `militarised` | Arms manufacturing, mercenary contracts, naval suppliers |
| `tourism` | Hotels, entertainment, travel agencies |
| Gas giant | Fuel skimming, refinery orbitals, helium-3 extraction |
| Asteroid belt | Mining, smelting, zero-G manufacturing |
| Ice world | Water extraction, cryo-preservation, tourism |

### 4.3 Business Data Model

```typescript
interface Business {
  id: string;
  systemId: string;
  bodyId?: string;                 // which body this business is primarily on
  name: string;
  tier: 1 | 2 | 3 | 4;
  type: BusinessType;
  employees: number;
  annualRevenueCr: number;         // approximate, for flavour

  /** What this business produces */
  products: string[];

  /** What this business consumes / needs to import */
  imports: string[];

  /** Owning faction, if any */
  parentFactionId?: string;

  /** For tier 1–2: which other systems have branches */
  branchSystemIds?: string[];

  /** Market position */
  marketShare: number;             // 0.0–1.0 within this system for this product type

  /** Narrative hooks */
  hook: string;                    // one-sentence adventure seed
  secret: string;                  // hidden fact about the business
}

type BusinessType =
  | 'shipping' | 'brokerage' | 'banking' | 'insurance'
  | 'manufacturing' | 'mining' | 'agriculture' | 'energy'
  | 'research' | 'pharma' | 'defense' | 'mercenary'
  | 'hospitality' | 'entertainment' | 'retail' | 'construction'
  | 'waste-management' | 'habitat-ops' | 'fuel-skimming' | 'salvage';
```

### 4.4 Revenue Estimation

Revenue is derived from employee count and tier, not simulated in detail:

```typescript
function estimateRevenue(tier: number, employees: number, techLevel: number): number {
  const baseRevenuePerEmployee = [0, 50000, 20000, 5000, 1000][tier]; // Cr/year
  const tlMultiplier = 1 + (techLevel - 7) * 0.1; // TL 7 = 1.0, TL 14 = 1.7
  return Math.round(employees * baseRevenuePerEmployee * tlMultiplier);
}
```

---

## 5. UI Specifications

### 5.1 System Viewer — Economy Tab (New)

```
┌─ Economy ────────────────────────┐
│                                  │
│ GDP (est.):  42 TCr              │
│ Major Industries: Mining, Shipping│
│                                  │
│ ┌─ Mega-Corporations ──────────┐│
│ │ ☐ Helios Heavy Industries    ││
│ │    12M employees | Shipyard  ││
│ │    [Details]                 ││
│ └──────────────────────────────┘│
│ ┌─ Local Enterprises ──────────┐│
│ │ ☐ Bakunawa Refinery          ││
│ │ ☐ Twin Suns Logistics        ││
│ │    ...                       ││
│ └──────────────────────────────┘│
│ [View Trade Network →]           │
└──────────────────────────────────┘
```

### 5.2 Business Detail Card

```
┌─ Helios Heavy Industries ────────┐
│ Tier: Mega-Corporation           │
│ Type: Manufacturing / Shipyard   │
│ Employees: 12,400,000            │
│ Est. Revenue: 620 BCr/year       │
│                                  │
│ Products: Starship hulls,        │
│   Jump drives, Armour plate      │
│ Imports: Rare earths,            │
│   Electronic components          │
│                                  │
│ Parent Faction: Helios Conglomerate│
│ Branches in 8 systems            │
│                                  │
│ Hook: Rushing a military contract│
│   ahead of a rival bid.          │
│ Secret: Using substandard alloys │
│   on civilian hulls.             │
└──────────────────────────────────┘
```

---

## 6. Integration with Other FRDs

| FRD | Integration Point |
|---|---|
| FRD-063 | Factions own businesses; business names share cultural bias |
| FRD-065 | Businesses determine where population works; employment drives per-body demographics |
| FRD-066 | Business `imports`/`products` arrays define trade-route edges |
| FRD-054 | World tags weight business type selection |

---

## 7. Export & Persistence

- Businesses stored in new IndexedDB table `businesses` (keyed by `systemId`).
- `.mneme-batch` export includes `businesses[]`.
- DOCX export gains an **"Economic Overview"** section with top 5 businesses per tier.

---

## 8. QA Acceptance

### QA-BIZ-01 — Tier scaling
**Test:** Generate a Pop 0 world. Verify 0 businesses. Generate a Pop 10B TL 12 A-starport world. Verify ≥1 mega-corp, ≥2 corporations, ≥10 enterprises.

### QA-BIZ-02 — Tag weighting
**Test:** Generate a world with `mining` tag. Verify ≥30% of enterprises are mining/extraction type.

### QA-BIZ-03 — Trade-route readiness
**Test:** Generate any Pop > 1M world. Verify every enterprise has non-empty `products` and `imports` arrays.

### QA-BIZ-04 — Faction linkage
**Test:** Generate a world with factions enabled. Verify ≥50% of tier 1–2 businesses have a `parentFactionId` matching an existing faction.

---

## 9. Performance Considerations

- Small-business tier 4 can number in the thousands on high-pop worlds. UI must **paginate** or **collapse** tier-4 entries behind a "Show 4,237 small businesses" expander.
- Generation of tier-4 businesses should be **lazy**: generate first 20 immediately, stream the rest in a Web Worker if the user expands the list.

---

## 10. Open Questions

1. Should tier-4 small businesses be generated at all, or should they be represented as an aggregate "small business sector" summary?
2. Should mega-corporations be **shared across systems** (i.e. the same `Helios Heavy Industries` appears in multiple systems' business lists) or duplicated per system?
3. How do we handle business failure / creation over time — static snapshot or tied to the historical event engine (FRD-055)?
