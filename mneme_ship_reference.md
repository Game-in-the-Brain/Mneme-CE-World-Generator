# Mneme World Generator - Ship Reference Document

## GI7B External Raw CE Ships (TL9)
**Source:** GI7B EXTERNAL RAW CE SHIPS 231024-06 240930  
**Tech Level:** TL9  
**Total Ships:** 35

---

## Quick Reference - Master Ship Table

> **Note:** `Supplies (Cr)` is treated as the **monthly operating cost** for ship traffic generation (resupply, life support, minor maintenance). The JSON file includes an explicit `monthly_operating_cost_cr` field set equal to `supplies_cr` for app integration.
>
> **Boat Units (v1.3.100):** Each ship's cost is expressed in **Boat Units** — `total_cost_cr ÷ 5,480,400`. This makes ship prices legible across economic presets:
> - **CE / Traveller:** 1 Boat Unit ≈ 228.35 salary-years (stagnant, few ships).
> - **Mneme:** 1 Boat Unit ≈ 10.1 salary-years (high growth, ships are common).

> **Traffic Pool:** Each ship carries a `traffic_pool` short key identifying which FR-030 generation pool it belongs to. The pool mapping is:
> - `"small"` — categories `Small Craft` and `Fighter`, DT ≤ 100
> - `"civilian"` — categories `Merchant`, `Passenger`, `Specialized`, `Support`, any DT
> - `"warship"` — category `Military`, any DT
>
> Filter by `traffic_pool` directly in code (`ship.traffic_pool === 'small'` etc.) — do not re-derive from `category` at runtime.

| Ship Name | TL | DT | Total Cost (Cr) | Boat Units | Supplies (Cr) | Category | Traffic Pool |
|-----------|----|----|-----------------|------------|---------------|----------|-------------|
| Courier Ship | 9 | 100 | 44,175,000 | 8.06 | 284,000 | Small Craft | small |
| Yacht | 9 | 100 | 32,200,000 | 5.88 | 284,000 | Small Craft | small |
| Research Vessel | 9 | 200 | 56,545,000 | 10.32 | 9,758,000 | Specialized | civilian |
| Asteroid Miner | 9 | 200 | 87,470,000 | 15.96 | 284,000 | Specialized | civilian |
| Merchant Trader | 9 | 200 | 43,070,000 | 7.86 | 164,000 | Merchant | civilian |
| Merchant Liner | 9 | 300 | 78,254,000 | 14.28 | 254,000 | Passenger | civilian |
| Frontier Trader | 9 | 300 | 91,944,000 | 16.78 | 304,000 | Merchant | civilian |
| Tender | 9 | 100 | 54,720,000 | 9.98 | 114,000 | Support | civilian |
| Habitat Ring | 9 | 300 | 63,645,000 | 11.61 | 164,000 | Specialized | civilian |
| Merchant Freighter | 9 | 400 | 76,994,000 | 14.05 | 174,000 | Merchant | civilian |
| 'Bosco' Merchant Freighter | 9 | 400 | 156,120,000 | 28.49 | 158,000 | Merchant | civilian |
| Patrol Frigate | 9 | 300 | 176,496,000 | 32.2 | 22,096,000 | Military | warship |
| Corvette | 9 | 300 | 190,179,000 | 34.7 | 629,000 | Military | warship |
| Exploration Vessel | 9 | 300 | 113,758,000 | 20.76 | 113,758,000 | Specialized | civilian |
| Survey Vessel | 9 | 200 | 82,658,000 | 15.08 | 10,008,000 | Specialized | civilian |
| System Defense Boat | 9 | 400 | 185,084,000 | 33.77 | 764,000 | Military | warship |
| Missile Frigate | 9 | 400 | 175,870,000 | 32.09 | 404,000 | Military | warship |
| Escort Frigate | 9 | 400 | 150,270,000 | 27.42 | 204,000 | Military | warship |
| Raider | 9 | 600 | 288,500,000 | 52.64 | 38,517,000 | Military | warship |
| Fighter (1BL/2M) | 9 | 10 | 12,930,630 | 2.36 | 11,430,630 | Fighter | small |
| Escort Fighter | 9 | 10 | 11,975,630 | 2.19 | 505,630 | Fighter | small |
| Fighter (3M) | 9 | 10 | 10,741,630 | 1.96 | 21,630 | Fighter | small |
| Medium Fighter | 9 | 20 | 16,156,630 | 2.95 | 21,630 | Fighter | small |
| Passenger Ship | 9 | 200 | 48,320,000 | 8.82 | 314,000 | Passenger | civilian |
| Passenger Liner (400DT) | 9 | 400 | 94,544,000 | 17.25 | 174,000 | Passenger | civilian |
| Frontier Passenger | 9 | 300 | 102,094,000 | 18.63 | 174,000 | Passenger | civilian |
| Passenger Liner (1000DT) | 9 | 1,000 | 379,156,000 | 3,249,000 | Passenger | civilian |
| Shuttle | 9 | 90 | 29,715,400 | 5.42 | 965,400 | Small Craft | small |
| Boat (10DT) | 9 | 10 | 5,320,400 | 5,400 | Small Craft | small |
| Boat (20DT) | 9 | 20 | 5,480,400 | 1.0 | 5,400 | Small Craft | small |
| Armed Gig | 9 | 20 | 15,465,400 | 2.82 | 5,400 | Small Craft | small |
| Ship's Boat (30DT) | 9 | 30 | 18,651,200 | 3.4 | 16,200 | Small Craft | small |
| Ship's Boat (50DT) | 9 | 50 | 13,471,200 | 2.46 | 16,200 | Small Craft | small |
| Ship's Boat (70DT) | 9 | 70 | 13,791,200 | 2.52 | 16,200 | Small Craft | small |
| Ship's Boat (95DT) | 9 | 95 | 14,191,200 | 2.59 | 16,200 | Small Craft | small |

---

## Ships by Category

### Merchant Ships

| Ship Name | TL | DT (Tons) | Total Cost (Cr) | Supplies (Cr) |
|-----------|-----|-----------|-----------------|---------------|
| Merchant Trader | 9 | 200 | 43,070,000 | 164,000 |
| Frontier Trader | 9 | 300 | 91,944,000 | 304,000 |
| Merchant Freighter | 9 | 400 | 76,994,000 | 174,000 |
| 'Bosco' Merchant Freighter | 9 | 400 | 156,120,000 | 158,000 |

### Passenger Ships

| Ship Name | TL | DT (Tons) | Total Cost (Cr) | Supplies (Cr) |
|-----------|-----|-----------|-----------------|---------------|
| Merchant Liner | 9 | 300 | 78,254,000 | 254,000 |
| Passenger Ship | 9 | 200 | 48,320,000 | 314,000 |
| Passenger Liner (400DT) | 9 | 400 | 94,544,000 | 174,000 |
| Frontier Passenger | 9 | 300 | 102,094,000 | 174,000 |
| Passenger Liner (1000DT) | 9 | 1,000 | 379,156,000 | 3,249,000 |

### Military Ships

| Ship Name | TL | DT (Tons) | Total Cost (Cr) | Supplies (Cr) |
|-----------|-----|-----------|-----------------|---------------|
| Patrol Frigate | 9 | 300 | 176,496,000 | 22,096,000 |
| Corvette | 9 | 300 | 190,179,000 | 629,000 |
| System Defense Boat | 9 | 400 | 185,084,000 | 764,000 |
| Missile Frigate | 9 | 400 | 175,870,000 | 404,000 |
| Escort Frigate | 9 | 400 | 150,270,000 | 204,000 |
| Raider | 9 | 600 | 288,500,000 | 38,517,000 |

### Fighters

| Ship Name | TL | DT (Tons) | Total Cost (Cr) | Supplies (Cr) |
|-----------|-----|-----------|-----------------|---------------|
| Fighter (1BL/2M) | 9 | 10 | 12,930,630 | 11,430,630 |
| Escort Fighter | 9 | 10 | 11,975,630 | 505,630 |
| Fighter (3M) | 9 | 10 | 10,741,630 | 21,630 |
| Medium Fighter | 9 | 20 | 16,156,630 | 21,630 |

### Small Craft

| Ship Name | TL | DT (Tons) | Total Cost (Cr) | Supplies (Cr) |
|-----------|-----|-----------|-----------------|---------------|
| Courier Ship | 9 | 100 | 44,175,000 | 284,000 |
| Yacht | 9 | 100 | 32,200,000 | 284,000 |
| Shuttle | 9 | 90 | 29,715,400 | 965,400 |
| Boat (10DT) | 9 | 10 | 5,320,400 | 5,400 |
| Boat (20DT) | 9 | 20 | 5,480,400 | 5,400 |
| Armed Gig | 9 | 20 | 15,465,400 | 5,400 |
| Ship's Boat (30DT) | 9 | 30 | 18,651,200 | 16,200 |
| Ship's Boat (50DT) | 9 | 50 | 13,471,200 | 16,200 |
| Ship's Boat (70DT) | 9 | 70 | 13,791,200 | 16,200 |
| Ship's Boat (95DT) | 9 | 95 | 14,191,200 | 16,200 |

### Specialized Ships

| Ship Name | TL | DT (Tons) | Total Cost (Cr) | Supplies (Cr) |
|-----------|-----|-----------|-----------------|---------------|
| Research Vessel | 9 | 200 | 56,545,000 | 9,758,000 |
| Asteroid Miner | 9 | 200 | 87,470,000 | 284,000 |
| Habitat Ring | 9 | 300 | 63,645,000 | 164,000 |
| Exploration Vessel | 9 | 300 | 113,758,000 | 113,758,000 |
| Survey Vessel | 9 | 200 | 82,658,000 | 10,008,000 |

### Support Ships

| Ship Name | TL | DT (Tons) | Total Cost (Cr) | Supplies (Cr) |
|-----------|-----|-----------|-----------------|---------------|
| Tender | 9 | 100 | 54,720,000 | 114,000 |

---

## Ships by Displacement Tonnage (DT)

### 10 DT Ships

| Ship Name | TL | Total Cost (Cr) | Supplies (Cr) | Category |
|-----------|-----|-----------------|---------------|----------|
| Fighter (1BL/2M) | 9 | 12,930,630 | 11,430,630 | Fighter |
| Escort Fighter | 9 | 11,975,630 | 505,630 | Fighter |
| Fighter (3M) | 9 | 10,741,630 | 21,630 | Fighter |
| Boat (10DT) | 9 | 5,320,400 | 5,400 | Small Craft |

### 20 DT Ships

| Ship Name | TL | Total Cost (Cr) | Supplies (Cr) | Category |
|-----------|-----|-----------------|---------------|----------|
| Medium Fighter | 9 | 16,156,630 | 21,630 | Fighter |
| Boat (20DT) | 9 | 5,480,400 | 5,400 | Small Craft |
| Armed Gig | 9 | 15,465,400 | 5,400 | Small Craft |

### 30-50 DT Ships

| Ship Name | TL | DT | Total Cost (Cr) | Supplies (Cr) | Category |
|-----------|-----|-----|-----------------|---------------|----------|
| Ship's Boat (30DT) | 9 | 30 | 18,651,200 | 16,200 | Small Craft |
| Ship's Boat (50DT) | 9 | 50 | 13,471,200 | 16,200 | Small Craft |

### 70-95 DT Ships

| Ship Name | TL | DT | Total Cost (Cr) | Supplies (Cr) | Category |
|-----------|-----|-----|-----------------|---------------|----------|
| Shuttle | 9 | 90 | 29,715,400 | 965,400 | Small Craft |
| Ship's Boat (70DT) | 9 | 70 | 13,791,200 | 16,200 | Small Craft |
| Ship's Boat (95DT) | 9 | 95 | 14,191,200 | 16,200 | Small Craft |

### 100 DT Ships

| Ship Name | TL | Total Cost (Cr) | Supplies (Cr) | Category |
|-----------|-----|-----------------|---------------|----------|
| Courier Ship | 9 | 44,175,000 | 284,000 | Small Craft |
| Yacht | 9 | 32,200,000 | 284,000 | Small Craft |
| Tender | 9 | 54,720,000 | 114,000 | Support |

### 200 DT Ships

| Ship Name | TL | Total Cost (Cr) | Supplies (Cr) | Category |
|-----------|-----|-----------------|---------------|----------|
| Research Vessel | 9 | 56,545,000 | 9,758,000 | Specialized |
| Asteroid Miner | 9 | 87,470,000 | 284,000 | Specialized |
| Merchant Trader | 9 | 43,070,000 | 164,000 | Merchant |
| Survey Vessel | 9 | 82,658,000 | 10,008,000 | Specialized |
| Passenger Ship | 9 | 48,320,000 | 314,000 | Passenger |

### 300 DT Ships

| Ship Name | TL | Total Cost (Cr) | Supplies (Cr) | Category |
|-----------|-----|-----------------|---------------|----------|
| Merchant Liner | 9 | 78,254,000 | 254,000 | Passenger |
| Frontier Trader | 9 | 91,944,000 | 304,000 | Merchant |
| Habitat Ring | 9 | 63,645,000 | 164,000 | Specialized |
| Patrol Frigate | 9 | 176,496,000 | 22,096,000 | Military |
| Corvette | 9 | 190,179,000 | 629,000 | Military |
| Exploration Vessel | 9 | 113,758,000 | 113,758,000 | Specialized |
| Frontier Passenger | 9 | 102,094,000 | 174,000 | Passenger |

### 400 DT Ships

| Ship Name | TL | Total Cost (Cr) | Supplies (Cr) | Category |
|-----------|-----|-----------------|---------------|----------|
| Merchant Freighter | 9 | 76,994,000 | 174,000 | Merchant |
| 'Bosco' Merchant Freighter | 9 | 156,120,000 | 158,000 | Merchant |
| System Defense Boat | 9 | 185,084,000 | 764,000 | Military |
| Missile Frigate | 9 | 175,870,000 | 404,000 | Military |
| Escort Frigate | 9 | 150,270,000 | 204,000 | Military |
| Passenger Liner (400DT) | 9 | 94,544,000 | 174,000 | Passenger |

### 600+ DT Ships

| Ship Name | TL | DT | Total Cost (Cr) | Supplies (Cr) | Category |
|-----------|-----|-----|-----------------|---------------|----------|
| Raider | 9 | 600 | 288,500,000 | 38,517,000 | Military |
| Passenger Liner (1000DT) | 9 | 1000 | 379,156,000 | 3,249,000 | Passenger |

---

## Summary Statistics

### By Category

| Category | Count | Min DT | Max DT | Avg Cost (MCr) |
|----------|-------|--------|--------|----------------|
| Fighter | 4 | 10 | 20 | 12.95 |
| Merchant | 4 | 200 | 400 | 92.03 |
| Military | 6 | 300 | 600 | 194.40 |
| Passenger | 5 | 200 | 1000 | 140.47 |
| Small Craft | 10 | 10 | 100 | 19.25 |
| Specialized | 5 | 200 | 300 | 80.82 |
| Support | 1 | 100 | 100 | 54.72 |

### Cost Ranges

| Cost Range | Count | Ships |
|------------|-------|-------|
| 0-10 MCr | 2 | Boat (10DT), Boat (20DT) |
| 10-50 MCr | 14 | Courier Ship, Yacht, Merchant Trader (+11 more) |
| 50-100 MCr | 9 | Research Vessel, Asteroid Miner, Merchant Liner (+6 more) |
| 100-200 MCr | 8 | 'Bosco' Merchant Freighter, Patrol Frigate, Corvette (+5 more) |
| 200+ MCr | 2 | Raider, Passenger Liner (1000DT) |

---

## JSON Data Format (for App Integration)

```json
{
  "source": "GI7B EXTERNAL RAW CE SHIPS 231024-06 240930",
  "tech_level": 9,
  "total_ships": 35,
  "ships": [
    {
      "name": "Courier Ship",
      "tl": 9,
      "dt": 100,
      "total_cost_cr": 44175000,
      "supplies_cr": 284000,
      "category": "Small Craft"
    },
    {
      "name": "Yacht",
      "tl": 9,
      "dt": 100,
      "total_cost_cr": 32200000,
      "supplies_cr": 284000,
      "category": "Small Craft"
    },
    {
      "name": "Research Vessel",
      "tl": 9,
      "dt": 200,
      "total_cost_cr": 56545000,
      "supplies_cr": 9758000,
      "category": "Specialized"
    },
    {
      "name": "Asteroid Miner",
      "tl": 9,
      "dt": 200,
      "total_cost_cr": 87470000,
      "supplies_cr": 284000,
      "category": "Specialized"
    },
    {
      "name": "Merchant Trader",
      "tl": 9,
      "dt": 200,
      "total_cost_cr": 43070000,
      "supplies_cr": 164000,
      "category": "Merchant"
    },
    {
      "name": "Merchant Liner",
      "tl": 9,
      "dt": 300,
      "total_cost_cr": 78254000,
      "supplies_cr": 254000,
      "category": "Passenger"
    },
    {
      "name": "Frontier Trader",
      "tl": 9,
      "dt": 300,
      "total_cost_cr": 91944000,
      "supplies_cr": 304000,
      "category": "Merchant"
    },
    {
      "name": "Tender",
      "tl": 9,
      "dt": 100,
      "total_cost_cr": 54720000,
      "supplies_cr": 114000,
      "category": "Support"
    },
    {
      "name": "Habitat Ring",
      "tl": 9,
      "dt": 300,
      "total_cost_cr": 63645000,
      "supplies_cr": 164000,
      "category": "Specialized"
    },
    {
      "name": "Merchant Freighter",
      "tl": 9,
      "dt": 400,
      "total_cost_cr": 76994000,
      "supplies_cr": 174000,
      "category": "Merchant"
    },
    {
      "name": "'Bosco' Merchant Freighter",
      "tl": 9,
      "dt": 400,
      "total_cost_cr": 156120000,
      "supplies_cr": 158000,
      "category": "Merchant"
    },
    {
      "name": "Patrol Frigate",
      "tl": 9,
      "dt": 300,
      "total_cost_cr": 176496000,
      "supplies_cr": 22096000,
      "category": "Military"
    },
    {
      "name": "Corvette",
      "tl": 9,
      "dt": 300,
      "total_cost_cr": 190179000,
      "supplies_cr": 629000,
      "category": "Military"
    },
    {
      "name": "Exploration Vessel",
      "tl": 9,
      "dt": 300,
      "total_cost_cr": 113758000,
      "supplies_cr": 113758000,
      "category": "Specialized"
    },
    {
      "name": "Survey Vessel",
      "tl": 9,
      "dt": 200,
      "total_cost_cr": 82658000,
      "supplies_cr": 10008000,
      "category": "Specialized"
    },
    {
      "name": "System Defense Boat",
      "tl": 9,
      "dt": 400,
      "total_cost_cr": 185084000,
      "supplies_cr": 764000,
      "category": "Military"
    },
    {
      "name": "Missile Frigate",
      "tl": 9,
      "dt": 400,
      "total_cost_cr": 175870000,
      "supplies_cr": 404000,
      "category": "Military"
    },
    {
      "name": "Escort Frigate",
      "tl": 9,
      "dt": 400,
      "total_cost_cr": 150270000,
      "supplies_cr": 204000,
      "category": "Military"
    },
    {
      "name": "Raider",
      "tl": 9,
      "dt": 600,
      "total_cost_cr": 288500000,
      "supplies_cr": 38517000,
      "category": "Military"
    },
    {
      "name": "Fighter (1BL/2M)",
      "tl": 9,
      "dt": 10,
      "total_cost_cr": 12930630,
      "supplies_cr": 11430630,
      "category": "Fighter"
    },
    {
      "name": "Escort Fighter",
      "tl": 9,
      "dt": 10,
      "total_cost_cr": 11975630,
      "supplies_cr": 505630,
      "category": "Fighter"
    },
    {
      "name": "Fighter (3M)",
      "tl": 9,
      "dt": 10,
      "total_cost_cr": 10741630,
      "supplies_cr": 21630,
      "category": "Fighter"
    },
    {
      "name": "Medium Fighter",
      "tl": 9,
      "dt": 20,
      "total_cost_cr": 16156630,
      "supplies_cr": 21630,
      "category": "Fighter"
    },
    {
      "name": "Passenger Ship",
      "tl": 9,
      "dt": 200,
      "total_cost_cr": 48320000,
      "supplies_cr": 314000,
      "category": "Passenger"
    },
    {
      "name": "Passenger Liner (400DT)",
      "tl": 9,
      "dt": 400,
      "total_cost_cr": 94544000,
      "supplies_cr": 174000,
      "category": "Passenger"
    },
    {
      "name": "Frontier Passenger",
      "tl": 9,
      "dt": 300,
      "total_cost_cr": 102094000,
      "supplies_cr": 174000,
      "category": "Passenger"
    },
    {
      "name": "Passenger Liner (1000DT)",
      "tl": 9,
      "dt": 1000,
      "total_cost_cr": 379156000,
      "supplies_cr": 3249000,
      "category": "Passenger"
    },
    {
      "name": "Shuttle",
      "tl": 9,
      "dt": 90,
      "total_cost_cr": 29715400,
      "supplies_cr": 965400,
      "category": "Small Craft"
    },
    {
      "name": "Boat (10DT)",
      "tl": 9,
      "dt": 10,
      "total_cost_cr": 5320400,
      "supplies_cr": 5400,
      "category": "Small Craft"
    },
    {
      "name": "Boat (20DT)",
      "tl": 9,
      "dt": 20,
      "total_cost_cr": 5480400,
      "supplies_cr": 5400,
      "category": "Small Craft"
    },
    {
      "name": "Armed Gig",
      "tl": 9,
      "dt": 20,
      "total_cost_cr": 15465400,
      "supplies_cr": 5400,
      "category": "Small Craft"
    },
    {
      "name": "Ship's Boat (30DT)",
      "tl": 9,
      "dt": 30,
      "total_cost_cr": 18651200,
      "supplies_cr": 16200,
      "category": "Small Craft"
    },
    {
      "name": "Ship's Boat (50DT)",
      "tl": 9,
      "dt": 50,
      "total_cost_cr": 13471200,
      "supplies_cr": 16200,
      "category": "Small Craft"
    },
    {
      "name": "Ship's Boat (70DT)",
      "tl": 9,
      "dt": 70,
      "total_cost_cr": 13791200,
      "supplies_cr": 16200,
      "category": "Small Craft"
    },
    {
      "name": "Ship's Boat (95DT)",
      "tl": 9,
      "dt": 95,
      "total_cost_cr": 14191200,
      "supplies_cr": 16200,
      "category": "Small Craft"
    }
  ]
}
```

---

## Notes for Mneme World Gen Integration

### Ship Entry Detection Pattern
Ship entries in the source document start with the pattern:
```
TL [number] [SHIP NAME] [DT value]DT
```

Example: `TL 9 COURIER SHIP 100DT`

### Key Data Points
- **TL**: Tech Level (all ships in this document are TL9)
- **Ship Name**: The vessel type/name
- **DT**: Displacement Tonnage (ship size)
- **Total Cost**: Found at the end of each ship entry as `[amount] Cr TOTAL`
- **Supplies Value**: Found to the right of `SUPPLIES:` in the total row
- **Monthly Operating Cost (`monthly_operating_cost_cr`)**: Treated as equal to `supplies_cr` for ship traffic and port activity calculations

### Cost Categories for World Generation
- **Budget Ships**: < 10 MCr (Small craft, fighters, boats)
- **Standard Ships**: 10-50 MCr (Merchant traders, couriers, yachts)
- **Premium Ships**: 50-100 MCr (Research vessels, passenger liners)
- **Military Ships**: 100-200 MCr (Frigates, corvettes)
- **Capital Ships**: > 200 MCr (Raiders, large liners)

---

*Document generated from GI7B External Raw CE Ships data*
