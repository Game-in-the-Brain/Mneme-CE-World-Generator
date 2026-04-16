# QA-055 — Table Weights UI: Dropdowns Shipped Instead of Per-Outcome Editable Weight Rows

**Area:** UI — Settings → Economic Assumptions → Table Weights  
**Priority:** 🔴 High  
**Status:** 📋 Queued  
**Datetime:** 2026-04-16  
**Relates to:** QA-051 (marked ✅ Fixed — engine is correct; this is the UI half that was not delivered)

---

## Problem Statement

The Table Weights panel in `Settings.tsx` currently renders **four dropdown selects** — one per table (Wealth, Development, Power Structure, Source of Power) — each offering only coarse options like "Flat — uniform". This is **not** what was specified.

The required UI is a **per-outcome editable weight table**: each outcome in each table gets its own numeric input, a live percentage readout, and a visual bar showing its proportion of the total. Changing any input immediately recalculates all percentages for that table. The active preset label switches to "Custom" automatically when any weight is edited manually.

The screenshot below confirms the current state: four dropdowns, no numeric inputs, no percentage bars, no live feedback.

---

## Root Cause Analysis

### What Kimi built (current)

```
Table Weights panel
├── Wealth          [dropdown: "Flat — uniform" ▼]
├── Development     [dropdown: "Flat — uniform" ▼]
├── Power Structure [dropdown: "Flat — uniform" ▼]
└── Source of Power [dropdown: "Flat — uniform" ▼]
```

Each dropdown maps to a named `TableWeights` constant (e.g. `FLAT_WEIGHTS`, `MNEME_DEV_WEIGHTS`) and replaces the entire weight array on selection. The user cannot see or edit individual outcome weights.

### What was specified

The spec in `260416 Economic Assumptions Customizations Custom tables.md` — **Developer Instructions — Adjustable Table Weights UI** — describes this structure:

```
Table Weights panel
├── [Wealth card]
│   ├── Heading: "Wealth"          ∑ badge (green = total > 0)
│   ├── Row: Average    SOC +0  [  28 ] 70%  ████████████████████░░░░░
│   ├── Row: Better-off SOC +1  [   8 ] 20%  █████░░░░░░░░░░░░░░░░░░░░
│   ├── Row: Prosperous SOC +2  [   2 ]  5%  █░░░░░░░░░░░░░░░░░░░░░░░░
│   └── Row: Affluent   SOC +3  [   2 ]  5%  █░░░░░░░░░░░░░░░░░░░░░░░░
├── [Development card]  (6 rows)
├── [Power Structure card]  (4 rows)
└── [Source of Power card]  (5 rows)
```

Each row contains: outcome label + descriptor, a proportional fill bar, a numeric `<input>` for the weight, and a live `%` label. Editing any input recalculates all percentages in that card instantly. When any weight is changed, the Preset selector switches to "Custom".

### Why the gap occurred

1. **QA-051 was marked ✅ Fixed based on the engine work only.** The constants in `economicPresets.ts`, the wiring in `generator.ts`, and the `getWealth()` signature extension are all correct. The fix note says "added a Wealth selector to the Table Weights panel (now a 4-column layout)" — this describes a UI addition, but the addition was a dropdown, not the per-outcome editor.

2. **The spec document was delivered after the engine work.** `260416 Economic Assumptions Customizations Custom tables.md` was provided as a reference after QA-051 was already closed. Kimi had no spec to work from for the UI portion, so it implemented the simplest possible UI that exposed the existing constants — a dropdown per table.

3. **The interactive widget prototype was not in the codebase.** The working widget (built in Claude) showing the per-outcome row design was never translated into an instruction Kimi could act on. The spec document contains the instruction, but QA-051 was already marked resolved, so Kimi did not revisit it.

---

## Expected Behaviour

### Preset selector (already correct — keep as-is)

The top of the Economic Assumptions panel has a Preset dropdown (Mneme / CE / Stagnant / Custom) with Save, Save As, Export, Import buttons. This is working correctly. **Do not change it.**

### Table Weights section — replace the four dropdowns with this:

For each of the four tables, render a card containing:

**Card header row:**
- Left: table name (`Wealth`, `Development`, `Power Structure`, `Source of Power`)
- Right: `∑ {total}` badge — green background when total > 0, red when total is 0

**One row per outcome** (see outcome lists below). Each row contains:
1. Outcome label (e.g. `Average`) — normal weight text
2. Outcome descriptor (e.g. `SOC +0`) — muted/secondary text, same line or sub-line
3. A proportional fill bar — width = `(weight / total) * 100%`, capped at 100%. Use a thin bar (6px height), muted fill colour. Updates live.
4. `<input type="number" min="0" />` — the editable weight. No upper bound enforced.
5. A read-only `%` label — `Math.round((weight / total) * 100)` — updates live on every keystroke.

**On any weight input change:**
- Recalculate all percentages for that card (no debounce — immediate on `onChange`)
- Switch the Preset selector label to `Custom`
- Do **not** validate that weights sum to any fixed number — they are relative

**Reset / Apply:**
- Reset restores the weights from the last explicitly selected named preset
- Apply / Save writes the full weight state to localStorage under the active preset

---

## Outcome Lists (per table)

### Wealth (4 outcomes)

| Outcome    | Descriptor | Mneme wt | CE wt | Stagnant wt |
|------------|------------|----------|-------|-------------|
| Average    | SOC +0     | 28       | 8     | 12          |
| Better-off | SOC +1     | 8        | 14    | 20          |
| Prosperous | SOC +2     | 2        | 10    | 7           |
| Affluent   | SOC +3     | 2        | 8     | 1           |

### Development (6 outcomes)

| Outcome        | Descriptor  | Mneme wt | CE wt | Stagnant wt |
|----------------|-------------|----------|-------|-------------|
| UnderDeveloped | HDI 0.0–0.59| 21       | 3     | 1           |
| Developing     | HDI 0.60–0.69| 5       | 4     | 6           |
| Mature         | HDI 0.70–0.79| 5       | 10    | 16          |
| Developed      | HDI 0.80–0.89| 5       | 10    | 14          |
| Well Developed | HDI 0.90–0.94| 2       | 9     | 3           |
| Very Developed | HDI >0.95   | 2        | 4     | 0           |

### Power Structure (4 outcomes)

| Outcome       | Descriptor | Mneme wt | CE wt | Stagnant wt |
|---------------|------------|----------|-------|-------------|
| Anarchy       | ≤7         | 21       | 4     | 2           |
| Confederation | 8–9        | 8        | 8     | 16          |
| Federation    | 10–11      | 8        | 18    | 18          |
| Unitary State | 12         | 3        | 10    | 4           |

### Source of Power (5 outcomes)

| Outcome     | Descriptor | Mneme wt | CE wt | Stagnant wt |
|-------------|------------|----------|-------|-------------|
| Aristocracy | 2–5        | 15       | 3     | 5           |
| Ideocracy   | 6–7        | 8        | 5     | 10          |
| Kratocracy  | 8–9        | 8        | 7     | 10          |
| Democracy   | 10–11      | 8        | 20    | 13          |
| Meritocracy | 12         | 1        | 5     | 2           |

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/Settings.tsx` | Replace the four `<select>` dropdowns in the Table Weights panel with per-outcome editable rows as described above. The weight constants already exist in `economicPresets.ts` — read initial values from there based on the active preset. |
| `src/lib/economicPresets.ts` | No change needed — weight constants are already correct. |
| `src/lib/worldData.ts` | No change needed — weighted lookup functions already accept `TableWeights`. |
| `src/lib/generator.ts` | No change needed — already wired. |

**The engine is correct. This is a Settings.tsx UI-only change.**

---

## Acceptance Criteria

1. The Table Weights panel shows four expandable/visible cards (Wealth, Development, Power Structure, Source of Power).
2. Each card shows one row per outcome with: label, descriptor, fill bar, numeric input, live `%`.
3. Selecting a named preset (Mneme / CE / Stagnant) populates all inputs with that preset's weights.
4. Editing any input immediately updates the `%` label and fill bar for that card.
5. Editing any input switches the Preset label to `Custom`.
6. The `∑` badge on each card shows the running total and turns red if all weights are zero.
7. Saving/applying with `Custom` active persists the full custom weight set to localStorage.
8. Build passes with zero TypeScript errors.

---

## Visual Reference

The interaction model to implement is the one shown in the Claude-generated widget prototype. Each table card looks like this (ASCII approximation):

```
┌─────────────────────────────────────────────────────┐
│ Wealth                                     ∑ 40     │
├─────────────────────────────────────────────────────┤
│ Average     SOC +0  ████████████████░░░░  [ 28 ] 70%│
│ Better-off  SOC +1  ████░░░░░░░░░░░░░░░░  [  8 ] 20%│
│ Prosperous  SOC +2  █░░░░░░░░░░░░░░░░░░░  [  2 ]  5%│
│ Affluent    SOC +3  █░░░░░░░░░░░░░░░░░░░  [  2 ]  5%│
└─────────────────────────────────────────────────────┘
```

Repeat the same pattern for Development (6 rows), Power Structure (4 rows), and Source of Power (5 rows).

---

*Logged: 2026-04-16 — Mneme CE World Generator*
