# QA-027 — Income "B Cr" Notation & Math Inconsistency
**Datetime:** 260415-120000  
**Status:** 🔴 Open  
**Agent:** Claude  
**Cross-link:** [QA-027 in QA.md](./QA.md#qa-027) | [FR-032 Income Assumptions spec](./260415-claude-open-fr032-income-assumptions.md)

> **Note on scope:** Neil's feedback contained two separate problems. This document covers **Problem 1: notation and formula bugs** (fixable in `format.ts`, `worldData.ts`, tooltip text). **Problem 2 — the underlying income model calibration** (Boat Units, SOC 7 man-years, TL multiplier, FAQ) is specified in [FR-032](./260415-claude-open-fr032-income-assumptions.md).

---

## Neil's Problem Statement (verbatim, email 2026-04-15)

> "The figure for 'This week' shows 1.79 B cr a week. Is this *billions* of credits? This is confusing, as the Starport box at the bottom shows 149 million credits a week. 1.79 billion x 52 gives 93.0 billion, not 54.2. I'm not convinced that 400,000 people (Leicester in the UK has 406,000) generates that kind of wealth. Can we display billions as a figure, please? An American billion is smaller than a UK billion (ours is a million x a million)"

**What Neil was comparing:**
- `This week` label → showed `1.79 B Cr/week`
- `Starport box` → showed `149 M Cr/week` (Weekly Base)
- `Annual Trade` → showed `54.2 B Cr/year`
- Neil's check: `1.79 B × 52 = 93.0 B ≠ 54.2 B` → does not reconcile

---

## Code Trace — What Is Actually Happening

### Calculation source: `src/lib/worldData.ts` lines 546–556

```typescript
const annualTrade = population * gdpPerDay * 365
                  * getTradeFraction(dev)
                  * getWealthTradeMultiplier(wealth);

const weeklyBase     = annualTrade / 364;      // ← divided by DAYS, not weeks
const weeklyActivity = weeklyBase * weeklyRoll; // weeklyRoll = 3D6 result (3–18)
```

### Display source: `src/lib/format.ts`

```typescript
export function formatCredits(value: number): string {
  return `${formatCreditScale(value)}/week`;   // ← always appends "/week"
}
```

`formatCreditScale` uses: `1e9 → 'B'`, `1e6 → 'M'`, no expansion to full number.

### Display locations: `src/components/SystemViewer.tsx`

| Label | Value | Format function |
|---|---|---|
| `This week` (Overview tab, line 298) | `starport.weeklyActivity` | `formatCredits()` → `/week` |
| `Annual Trade` (Starport card, line 791) | `starport.annualTrade` | `formatAnnualTrade()` → `/year` |
| `Weekly Base` (Starport card, line 792) | `starport.weeklyBase` | `formatCredits()` → `/week` |
| `This week` (Starport card, line 799) | `starport.weeklyActivity` | inline `formatCredits()` |

---

## Root Cause Analysis

There are **three distinct bugs** in what Neil reported.

---

### Bug A — `weeklyBase` is a daily rate, labelled as weekly

```typescript
const weeklyBase = annualTrade / 364;
```

`364 = 52 × 7` — this divides annual trade by the number of **days** in a year.  
Result: `weeklyBase` is the **daily** trade throughput, not the weekly throughput.

Neil's numbers prove it:
- `annualTrade = 54.2 B`
- `weeklyBase = 54.2 B / 364 = 148.9 M` ✓ matches "149 M Cr/week" Neil saw

But it is displayed with the `/week` unit via `formatCredits()`. This is wrong — it is `Cr/day`.

**Correct weekly base would be:** `annualTrade / 52 = 54.2 B / 52 = 1.042 B Cr/week`

---

### Bug B — `weeklyActivity` is not a recurring weekly income

```typescript
const weeklyActivity = weeklyBase * weeklyRoll; // weeklyRoll = 3D6
```

With `weeklyBase` being a daily rate and `weeklyRoll` being 3D6 (range 3–18, average 10.5):

- `weeklyActivity = 148.9 M × 12 (example roll) = 1.79 B` ✓ matches Neil's "1.79 B Cr/week"

This is **not** "what this port earns per week" — it is a **port activity snapshot**: daily_rate × dice, used to determine ship traffic budget. It is a roleplay-moment figure, not an economic projection.

Neil naturally tried to annualise it: `1.79 B × 52 = 93 B ≠ 54.2 B`.  
The disconnect is by design (it is a snapshot, not a rate) but this is **never communicated** in the UI. The tooltip (SystemViewer.tsx line 819) says:

> "Weekly throughput = (Annual Port Trade ÷ 364) × 3D6."

This does not explain what the number *means* or that it should not be multiplied by 52.

---

### Bug C — "B" abbreviation is ambiguous

`formatCreditScale` in `format.ts` maps `1e9 → 'B'`.

- US billion = 10⁹ ✓ (the code's intent)
- UK (traditional) billion = 10¹² ✗

Neil is UK-based and reads "1.79 B" as possibly 1.79 × 10¹² (1.79 trillion). Even if he accepts the US meaning, the bare "B" gives no certainty. Neil explicitly asked: *"Can we display billions as a figure, please?"*

---

## Summary of Bugs

| # | Bug | Severity | Location |
|---|---|---|---|
| A | `weeklyBase = annualTrade / 364` divides by days, not weeks — mislabelled as weekly | 🔴 High | `worldData.ts:553` |
| B | `weeklyActivity` is a snapshot, not a recurring weekly rate — never explained | 🔴 High | `SystemViewer.tsx:819` tooltip |
| C | `'B'` abbreviation ambiguous across locales | 🟠 Medium | `format.ts:formatCreditScale` |

---

## Proposed Fixes

### Fix A — Correct the weeklyBase formula

```typescript
// Before (divides by days — gives daily rate)
const weeklyBase = annualTrade / 364;

// After (divides by weeks — gives true weekly throughput)
const weeklyBase = annualTrade / 52;
```

After this fix:
- `weeklyBase` = 54.2 B / 52 = **1.042 B Cr/week** (true weekly)
- `weeklyActivity` = 1.042 B × 3D6 (snapshot multiplier)
- At average roll (10.5): weeklyActivity = 10.94 B — but this is now a *multiplied* snapshot, not a rate

**Note:** This changes the ship traffic budget calculation which feeds `shipsInArea.ts`. The budget will increase ~7×. Review the ship count output after this fix — it may require recalibrating the distribution table.

### Fix B — Relabel and re-explain the weeklyActivity display

Option 1: Rename "This week" to "Port Activity Snapshot" and update the tooltip:
> "Snapshot of port throughput this visit: (Weekly Trade ÷ 52) × 3D6. Not a recurring weekly income — roll varies each visit."

Option 2: Remove the weekly activity snapshot from the Overview tab (line 298) — it only belongs in the Starport detail card where the explanation tooltip lives.

### Fix C — Replace abbreviated notation with full numbers or explicit suffix

```typescript
// Option 1: Full number with comma separators
export function formatCreditScale(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value)) + ' Cr';
}

// Option 2: Keep abbreviation but expand to readable label
[1e9, 'bn'],   // "1.79 bn Cr" — clearer than "B"
[1e6, 'mn'],   // "149 mn Cr"

// Option 3: Full scientific label
[1e9, '× 10⁹'], // "1.79 × 10⁹ Cr"
```

Neil specifically asked for the full number. Given this is a tabletop RPG tool and the numbers are large but not astronomically so (typically M–T range), full comma-separated numbers are most readable:

`1,790,000,000 Cr/week` is unambiguous in both UK and US reading.

---

## Plausibility Check (Neil's Secondary Concern)

Neil: *"I'm not convinced that 400,000 people generates that kind of wealth."*

At `annualTrade = 54.2 B Cr` and `population = 400,000`:
- **Per-capita annual trade = 54.2 B / 400,000 = 135,500 Cr/person/year**

This is a Cepheus Engine "credits" question — CE credits are not 2026 USD. However, the ratio relative to TL matters. This is a calibration question for FR-032 (income per TL setting) and is separate from the display bug.

The formula: `population × gdpPerDay × 365 × tradeFraction × wealthMultiplier`
- `gdpPerDay` is the CE daily GDP per capita — check `worldData.ts` for its value at TL9
- If this produces implausibly high results for mid-population worlds, the `gdpPerDay` table or wealth multipliers need recalibration

This is tracked separately as part of [FR-032](./QA.md#fr-032).

---

## Implementation Order

1. **Fix C first** (format.ts) — purely cosmetic, zero logic impact, immediately clarifies Neil's confusion
2. **Fix B** (tooltip + label rename) — clarifies the snapshot nature of weeklyActivity
3. **Fix A** (worldData.ts formula) — changes weeklyBase from daily to weekly; validate ship traffic budget after

---

## Files to Touch

| File | Change |
|---|---|
| `src/lib/format.ts` | `formatCreditScale` — replace `'B'`/`'M'` with full numbers or `'bn'`/`'mn'` |
| `src/lib/worldData.ts` | Line 553: `annualTrade / 364` → `annualTrade / 52` |
| `src/components/SystemViewer.tsx` | Line 819 tooltip — rewrite to explain snapshot vs rate; consider removing Overview tab `This week` |
| `src/lib/shipsInArea.ts` | Validate budget calculation after Fix A — budget increases ~7× |
