# FR-032 — Underlying Income Assumptions & Boat Unit Calibration
**Datetime:** 260415-120000  
**Status:** 🔴 Open (Spec)  
**Agent:** Claude  
**Cross-link:** [FR-032 in QA.md](./QA.md#fr-032) | [QA-027](./QA.md#qa-027)

---

## Why This Exists — The Two Problems in QA-027

QA-027 has two separate problems. The working doc [260415-claude-open-qa027-income-notation.md](./260415-claude-open-qa027-income-notation.md) handles **Problem 1: notation bugs** (formula errors, display units).

**Problem 2 is this document:** even after the notation bugs are fixed, the raw credit numbers will still confuse people. The confusion is about *calibration assumptions* — specifically:

> *"I'm not convinced that 400,000 people generates that kind of wealth."* — Neil Lucock

The reason Neil is right to be confused: **credit wealth scales with TL**, and the TL multiplier is a design choice that users bring different priors to. Someone who assumes TL14→15 is 100× more productive sees wildly different numbers than someone who assumes 2×. Neither is wrong — they're different assumptions about how fast technology improves quality of life.

The solution is not to pick one answer. It's to give users an **anchor in human terms**: how many years does an average person (SOC 7) need to work to buy the cheapest boat?

---

## Core Concept: Boat Units (BU)

**The Boat (10DT)** is the anchor ship — the smallest, cheapest vessel in the fleet. Everything else is expressed as a multiple of its cost.

| Ship | Purchase Price | **BU** | Monthly Upkeep |
|---|---|---|---|
| **Boat (10DT)** | 5,320,400 Cr | **1.00 BU** | 5,400 Cr/mo |
| Boat (20DT) | 5,480,400 Cr | 1.03 BU | 5,400 Cr/mo |
| Ship's Boat (50DT) | 13,471,200 Cr | 2.53 BU | 16,200 Cr/mo |
| Ship's Boat (95DT) | 14,191,200 Cr | 2.67 BU | 16,200 Cr/mo |
| Yacht | 32,200,000 Cr | 6.05 BU | 284,000 Cr/mo |
| **Merchant Trader** | 43,070,000 Cr | **8.10 BU** | 164,000 Cr/mo |
| **Courier Ship** | 44,175,000 Cr | **8.30 BU** | 284,000 Cr/mo |
| Passenger Ship | 48,320,000 Cr | 9.08 BU | 314,000 Cr/mo |
| Tender | 54,720,000 Cr | 10.28 BU | 114,000 Cr/mo |
| Merchant Freighter | 76,994,000 Cr | 14.47 BU | 174,000 Cr/mo |
| Merchant Liner | 78,254,000 Cr | 14.71 BU | 254,000 Cr/mo |
| Frontier Trader | 91,944,000 Cr | 17.28 BU | 304,000 Cr/mo |
| Passenger Liner (400DT) | 94,544,000 Cr | 17.77 BU | 174,000 Cr/mo |
| Escort Frigate | 150,270,000 Cr | 28.24 BU | 204,000 Cr/mo |
| Corvette | 190,179,000 Cr | 35.75 BU | 629,000 Cr/mo |
| Raider | 288,500,000 Cr | 54.23 BU | 38,517,000 Cr/mo |
| Passenger Liner (1000DT) | 379,156,000 Cr | 71.26 BU | 3,249,000 Cr/mo |

**BU ratios are fixed.** They do not change with user settings. They are pre-computed from `mneme_ship_reference.json`.

---

## Core Concept: SOC 7 Annual Income (the Calibration Input)

The user sets a single value in Settings:

> **"Years for a SOC 7 worker to purchase the base Boat"**

Call this **Y**. From Y, everything derives:

```
SOC 7 annual income  = Boat price / Y
                     = 5,320,400 / Y

SOC 7 monthly income = SOC 7 annual / 12
                     = 5,320,400 / (Y × 12)

Man-years to buy Ship X = Ship X price / SOC 7 annual income
                        = (Ship X BU ratio) × Y

Man-months upkeep Ship X = Ship X monthly upkeep / SOC 7 monthly income
```

### Worked Example — Three Reference Ships at Y = 20 years

> "An average worker needs 20 years of full income to buy the smallest boat"

| | Boat (10DT) | Courier | Merchant Trader |
|---|---|---|---|
| BU | 1.00 | 8.30 | 8.10 |
| **Man-years to buy** | **20 yrs** | **166 yrs** | **162 yrs** |
| Monthly upkeep | 5,400 | 284,000 | 164,000 |
| **Upkeep as income-months** | **0.03 mo** | **1.3 mo** | **0.75 mo** |

> "The Courier costs 166 average working lifetimes to buy, and costs 1.3 months of an average wage just to keep running for one month."

This is immediately legible to any player regardless of their TL assumptions.

### Calibration Presets (suggested)

| Preset | Y | SOC 7 monthly income | Description |
|---|---|---|---|
| Frontier | 50 yrs | 8,867 Cr/mo | Frontier economics — ship is a lifetime's savings |
| Standard | 20 yrs | 22,168 Cr/mo | Moderate prosperity |
| Prosperous | 10 yrs | 44,337 Cr/mo | Comfortable mid-TL world |
| Core World | 5 yrs | 88,673 Cr/mo | Wealthy core system |

The user can type a custom value or choose a preset.

---

## The TL Multiplier Problem (Slow vs Fast Tech)

When income is calculated for a world's TL, the result depends on how much more productive TL+1 is than TL. This is a worldbuilding assumption, not a fixed CE rule.

### What this means for Neil's 400,000-person TL9 world

If the TL9 income multiplier relative to TL7 (industrial baseline) is:
- ×2 per TL → TL9 = TL7 × 2² = 4× baseline
- ×5 per TL → TL9 = TL7 × 5² = 25× baseline
- ×10 per TL → TL9 = TL7 × 10² = 100× baseline

The existing formula uses `gdpPerDay` — this table encodes one set of assumptions. Users coming from a "×2 per TL" mental model will see TL9 incomes as absurdly high.

### The Per-TL Income Table (second Settings table)

This is the second table Justin described. The user sets:
1. **Base reference TL** (default: TL7 = Industrial)
2. **Monthly income at base TL** (set by the Y calibration above)
3. **TL multiplier** — how much more productive is TL+1?

| Option | Multiplier | Label |
|---|---|---|
| A | ×2 per TL | Slow Tech — modest gains, realistic near-future |
| B | ×3 per TL | Moderate Tech |
| C | ×5 per TL | Normal (CE standard assumption) |
| D | ×10 per TL | Fast Tech — order-of-magnitude leaps |
| E | ×100 per TL | Very Fast Tech — sci-fi explosive growth |
| Custom | user entry | — |

**Resulting monthly income at each TL (Y=20, base TL7, example multipliers):**

| TL | Slow ×2 | Normal ×5 | Fast ×10 |
|---|---|---|---|
| 7 | 22,168 Cr/mo | 22,168 Cr/mo | 22,168 Cr/mo |
| 8 | 44,336 | 110,840 | 221,680 |
| 9 | 88,672 | 554,200 | 2,216,800 |
| 10 | 177,344 | 2,771,000 | 22,168,000 |
| 12 | 708,576 | 69,275,000 | 2.2 B |
| 14 | 2,834,304 | 1.73 B | 221 B |
| 15 | 5,668,608 | 8.65 B | 2.21 T |

This table explains why income figures look absurd if you're using Fast Tech assumptions for a TL14 world. **The FAQ must explain this.**

The Per-TL income table is only needed when the generator is showing income for multi-TL comparisons or explaining Sector Dynamics. For a single-world display the Y calibration is sufficient.

---

## The Three Reference Ships

Justin specified: **Boat, Courier, Trader** as the three UI anchors. From the ship data:

```
BOAT     = Boat (10DT)        BU 1.00   5,320,400 Cr   upkeep 5,400/mo
COURIER  = Courier Ship       BU 8.30  44,175,000 Cr   upkeep 284,000/mo
TRADER   = Merchant Trader    BU 8.10  43,070,000 Cr   upkeep 164,000/mo
```

Note: Courier and Trader are nearly equal in purchase price (both ~8.1–8.3 BU) but the Courier costs 1.73× more to run per month than the Trader. This is an interesting data point for the FAQ — the Courier is a prestige small craft, not an economical one.

These three form the "ruler" at the top of the Ships section in the UI — fixed reference points the user can mentally compare against.

---

## Implementation Plan

### Phase 1 — Settings: Income Calibration Panel

**New section in Settings:** "Income Assumptions"

```
┌─ Income Calibration ──────────────────────────────────────────┐
│                                                               │
│  Base Boat (10DT) = 1 Boat Unit (BU) — 5,320,400 Cr          │
│                                                               │
│  SOC 7 years to buy the Boat: [ 20   ] years                 │
│  → SOC 7 monthly income at this TL: 22,168 Cr/mo             │
│  → SOC 7 annual income: 266,020 Cr/year                      │
│                                                               │
│  Display mode: ○ Credits  ● Boat Units  ○ Man-Years           │
│                                                               │
│  TL productivity multiplier: ○ ×2  ● ×5  ○ ×10  ○ Custom    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

Persisted to `localStorage` under `mneme_generator_options.incomeCalibration`:
```typescript
{
  boatYears: number;         // Y — years for SOC 7 to buy Boat
  tlMultiplier: number;      // 2, 3, 5, 10, 100
  displayMode: 'credits' | 'boat_units' | 'man_years';
}
```

### Phase 2 — Ship Display: Add BU and Man-Years columns

In `SystemViewer.tsx` Ships in the Area section, add columns:

| Ship | Count | BU | Man-Yrs to Buy | Upkeep/mo |
|---|---|---|---|---|
| Boat (10DT) | 3 | 1.0 BU | 20 yrs | 0.03 mo income |
| Courier Ship | 1 | 8.3 BU | 166 yrs | 1.3 mo income |
| Merchant Trader | 2 | 8.1 BU | 162 yrs | 0.75 mo income |

Column visibility controlled by `displayMode` setting.

### Phase 3 — World Economy Display: Reframe

Instead of (or alongside) the raw annual trade figure:
```
Annual Trade:  54.2 B Cr/year
               ≈ 203,000 Boats  (at this TL calibration)
               ≈ 2,038 man-lifetimes per citizen/year
```

Or simpler:
```
Annual Trade:  54.2 B Cr/year  (≈ 203K Boat equivalents)
```

This gives Neil a frame: "this planet's entire trade volume per year could buy 203,000 Boats."

### Phase 4 — FAQ Page

New tab or linked page: **"Economic Assumptions"**

Sections:
1. **What is a Credit?** — CE credits are not USD. They are a fictional unit whose real-world feel depends entirely on the TL multiplier you choose.
2. **Boat Units explained** — why we anchor to the 10DT Boat.
3. **SOC 7 calibration** — what it means to set Y=20 vs Y=5. Examples.
4. **Slow Tech vs Fast Tech** — the TL multiplier table with consequences. Show the income-by-TL table for each option.
5. **Why does my TL14 world seem absurdly rich?** — Direct answer. At ×5 per TL, TL14 is 5^7 = 78,125× more productive per person than TL7. That's the assumption baked in. If that feels wrong, use Slow Tech (×2).
6. **What does a Courier actually cost in human terms?** — Worked example with Courier = 166 working lifetimes at Y=20.

---

## Files to Create / Modify

| File | Change |
|---|---|
| `src/components/Settings.tsx` | Add "Income Calibration" panel (boatYears, tlMultiplier, displayMode) |
| `src/lib/incomeCalibration.ts` | New — `calcSOC7Income(boatYears)`, `calcManYears(shipPrice, boatYears)`, `calcBU(shipPrice)`, `tlIncomeTable(boatYears, tlMultiplier)` |
| `src/components/SystemViewer.tsx` | Ships section: add BU / Man-Years columns; economy section: add BU equivalent line |
| `src/pages/FAQ.tsx` | New — Economic Assumptions FAQ page |
| `vite.config.ts` | Add FAQ as input if multi-page |
| `src/lib/worldData.ts` | No change to formula yet — FR-032 is a display layer, not a recalculation |

---

## What FR-032 Does NOT Change

- The `annualTrade` formula in `worldData.ts` — that is QA-027's job.
- The `weeklyBase` / `weeklyActivity` calculation — also QA-027.
- Ship prices in `mneme_ship_reference.json` — Boat Units are computed ratios, not stored values.
- The existing `formatCredits` / `formatAnnualTrade` functions — QA-027 Fix C handles those.

FR-032 is a **display calibration layer** that sits on top of the existing numbers, translating them into human-scale terms. The underlying data does not change.

---

## Dependency Order

```
QA-027 Fix C  (notation display)
  → FR-032 Phase 1  (settings panel + BU calculation)
    → FR-032 Phase 2  (ship display columns)
      → FR-032 Phase 3  (world economy reframe)
        → FR-032 Phase 4  (FAQ page)
```

QA-027 Bug A (weeklyBase formula) should be verified *before* FR-032 Phase 3 is built, since the economy reframe will show the corrected weekly figure.
