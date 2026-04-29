# FRD-069 — Editable Star Systems

**Status:** 📋 Planned  
**Source:** Neil Lucock v1.3.151 feedback (R5); Justin Aquino 2026-04-27  
**Scope:** Major feature — adds a full per-world and per-star edit panel to the System Viewer, with add/delete/reposition controls, economics dials, and save-to-JSON round-trip.

---

## Problem

Generated systems are currently read-only after generation. A referee who wants to adjust a world's population to fit a campaign, fix an implausible orbit, or tweak economic assumptions must hand-edit the exported JSON. There is no way to add or remove bodies, change a star's class, or dial economics outcomes from the UI.

Neil's specific case: a G4 system placed its mainworld beyond the frost line (an inhospitable mining habitat). The referee should be able to promote an inner world, delete the outer one, and save — rather than regenerating repeatedly and hoping.

---

## Scope

### FR-069a — Edit Mode Toggle

- System Viewer gains an **Edit** button (pencil icon) in the header row alongside the existing Export buttons.
- Clicking Edit enters **Edit Mode**: a persistent banner replaces the tab nav ("Editing — changes are not saved until you click Save").
- Clicking Save commits changes to Dexie and updates JSON output.
- Clicking Discard rolls back to the last saved state.
- A **Save As…** variant prompts for a new system name and saves a copy, leaving the original unchanged.

---

### FR-069b — Per-World Dice Toggles

Each body in the Planetary System tab gains a row of **lock icons** in Edit Mode, one per randomised field:

| Field | Locked = | Unlocked = |
|---|---|---|
| World type | keep current value | re-roll on Save |
| Distance / zone | keep current AU | re-roll zone on Save |
| Mass | keep current EM | re-roll on Save |
| Habitability score | keep current value | recompute from scratch |

A **Re-roll** button per world re-randomises only unlocked fields and previews the result before Save is committed.

Locked fields render their current value in the edit form (editable as numbers/selects). Unlocked fields show a dice icon and "will randomise on Save".

---

### FR-069c — Economics Dials

In Edit Mode, the Inhabitants section gains editable dials for all rolled economic outcomes:

| Field | Control | Notes |
|---|---|---|
| Wealth level | Dropdown: Average / Better-off / Prosperous / Affluent | Overrides roll result; recalculates GDP/day, PVS, starport class, weekly trade |
| Development level | Dropdown: UnderDeveloped → Very Developed | Overrides roll result; recalculates GDP/day, PVS, trade fraction |
| Tech Level (MTL) | Numeric input (9–18) | Recalculates productivity, population ceiling, PVS |
| Population | Numeric input | Direct override; validates against TL ceiling (warn but allow) |
| Starport class | Dropdown: X, E, D, C, B, A | Direct override; recalculates weekly activity |
| Government (Power Structure) | Dropdown | Override; recalculates governance DM |
| Source of Power | Dropdown | Override |

All dials are **live-preview**: changing a value immediately recalculates downstream values (GDP/day, Ships in Area, Annual Trade) and shows the updated numbers in grey "pending" state until Save.

Each dial has a **reset to rolled** button (↺) that restores the originally generated value.

---

### FR-069d — Add a World

An **Add World** button appears at the bottom of the Planetary System list in Edit Mode. It opens a dropdown:

```
─ Random body (roll type + zone)
─ Terrestrial world
─ Dwarf planet
─ Ice world
─ Gas world (Small / Medium / Large / Super)
─ Circumstellar disk
─ Moon (adds to selected parent body)
```

On selection:
1. A zone slot is chosen: the first available zone outward from the star that isn't full.
2. If no zone is available an error banner appears: "All orbital zones occupied — delete a world to open a slot."
3. The new body is positioned at a distance consistent with its zone (midpoint of zone AU range).
4. HSR (Habitable / Stellar Stability / Radiation) is checked on every add; a warning badge appears if the new body violates zone constraints.
5. The body appears in the list as "unsaved" (yellow border) until Save.

---

### FR-069e — Delete a World

Each body row in Edit Mode gains a **Delete** toggle (trash icon). Clicking it marks the body for deletion (strikethrough, red badge). Clicking again un-marks it. Deletion takes effect on Save.

Deleting the mainworld: a warning dialog: "This is the mainworld. Deleting it will remove all Inhabitants data. Confirm?" If confirmed, Inhabitants tab is cleared; system becomes unpopulated.

---

### FR-069f — Reposition a World

Each body row gains **↑ Zone** and **↓ Zone** buttons in Edit Mode.

- **↑ Zone**: moves the body one zone inward (reduces distanceAU to the midpoint of the next inner zone).
  - If the inner zone is full: "All orbits in [Zone Name] are full — delete a world to open a slot."
  - If the body would move inside the innermost zone: "Cannot move further inward — body is at the innermost orbital zone."
- **↓ Zone**: moves outward by one zone, same logic.

After each move, HSR is rechecked and any mainworld flag is re-evaluated (the world with the highest Baseline Habitability score in the system becomes the mainworld candidate, per the existing selection algorithm).

---

### FR-069g — Star Class / Grade Edit

In Edit Mode, the Star tab gains editable **Class** and **Grade** selects (same controls as the current read-only display but now active). Changes trigger:

1. Luminosity recalculation → zone boundary recalculation.
2. All existing body positions are checked against new zone boundaries; bodies that fall outside a valid zone get a warning badge.
3. A **Reposition all** button redistributes all bodies proportionally across the new zone layout.
4. Habitability pipeline re-runs for all terrestrial/dwarf worlds.
5. The mainworld candidate is re-evaluated.

Companion stars (if present) have the same Class/Grade edit available on their respective rows.

---

### FR-069h — Save / Save As

- **Save**: commits all pending edits (body list, economics overrides, star edits) to Dexie. Updates `system.editedAt` timestamp. The exported JSON reflects all changes.
- **Save As…**: prompts for a new system name (defaults to `[original name] (edited)`). Creates a new `system.id` (UUID). Does not modify the original.
- Both paths write the full `StarSystem` object to Dexie via the existing `saveSystem()` call in `db.ts`.

---

## Implementation Notes

### Files affected

| File | Change |
|---|---|
| `src/components/SystemViewer.tsx` | Edit mode state, per-world edit rows, economics dials, save/discard/save-as |
| `src/types/index.ts` | Add `editedAt?: string` and `economicsOverrides?: Partial<Inhabitants>` to `StarSystem` |
| `src/lib/generator.ts` | Extract `recomputeEconomics(system, overrides)` helper for live-preview recalc |
| `src/lib/positioning.ts` | Export `getZoneForAU(distanceAU, starLuminosity)` for HSR checks |
| `src/lib/db.ts` | No change needed — `saveSystem()` already handles full StarSystem |
| `src/App.tsx` | Pass `onUpdateSystem` callback to SystemViewer (already exists) |

### HSR check definition

HSR (Habitability–Stability–Radiation) means:
- Body is within a zone that supports its type (gas worlds cannot be in inner zones without Hot Jupiter flag)
- If the body is the mainworld, its zone is not inside the stellar Infernal radius
- Distance is outside the stellar Roche limit

Violations get a yellow warning badge, not a hard block — referees can override.

### Economics recalculation chain

When any economics dial changes:
```
override Wealth / Development / TL / Population
  → getGdpPerDayForWorld(overrides)
  → getTradeFraction(development)
  → annualTrade = gdpPerDay × 365 × tradeFraction × population
  → pssToClass(pss) → new starportClass
  → weeklyActivity = 10^pss
  → generateShipsInTheArea(weeklyActivity, ...)
```

All preview values shown in amber until Save.

---

## Out of Scope (this FRD)

- Adding or editing moons (complex parent-body relationship — deferred)
- Editing companion star orbital parameters
- Changing economic preset (CE / Mneme / Stagnant) per-system — this is a generator-level setting
- Terraforming / megastructure overlays (FRD-054 territory)

---

## Acceptance Criteria

- [ ] Edit mode can be entered and exited without data loss
- [ ] Changing Wealth dial updates GDP/day and starport class in live preview
- [ ] Changing TL updates population ceiling warning and productivity
- [ ] Adding a world places it in the correct zone and passes HSR
- [ ] Attempting to add a world to a full zone shows the correct error message
- [ ] Repositioning a world updates zone boundaries and re-evaluates mainworld
- [ ] Changing star class recalculates zone boundaries and flags displaced bodies
- [ ] Save commits to Dexie and the exported JSON reflects all edits
- [ ] Save As creates a new system; original is unchanged
- [ ] Discard restores the pre-edit state exactly
- [ ] `tsc -b` passes with 0 errors after implementation
