# Name Generation — RCA & Proposals

## Date: 2026-04-29

---

## 1. Root Cause: Some Worlds Have No Names (RCA)

**Symptom:** When "Generate place names" is ON, the system gets a name but individual planetary bodies appear blank (placeholder "Name…") in the Planetary System tab.

**Root Cause:** `App.tsx` calls `generatePlaceNames()` which populates `system.placeNames.bodyNames` (a `Record<string, string>` mapping body IDs to generated names). However, the `PlanetarySystemBodies` component reads from `annotations[body.id].name`, which is stored in `localStorage` under `mneme_annotations_${system.id}`. The generation code **never copies** `placeNames.bodyNames` into `annotations`.

**Code path:**
1. `App.tsx:192-194` — generates `placeNames`, sets `system.placeNames`
2. `SystemViewer.tsx:66-72` — loads `annotations` from `localStorage`; if none exist, sets `{}`
3. `PlanetarySystemBodies.tsx:149` — reads `ann = annotations[body.id] ?? { name: '', notes: '' }`
4. Result: `ann.name` is `''` even though `system.placeNames.bodyNames[body.id]` exists

**The manual workaround:** Clicking "Generate Place Names" in `SystemViewer.tsx:136-156` DOES copy names to annotations. But this is a manual step.

**Fix:** On system generation with `includeNames`, pre-fill `localStorage` annotations. Also on SystemViewer mount, if `placeNames.bodyNames` exists but annotations are empty, auto-populate.

---

## 2. Descriptor Overload

**Symptom:** Names like "Commercial Bilaraltamira Hallowed Organized Bazpueblo Artistic Harmonious Bena Stalwart Lawful Tirsofelix"

**Explanation:** The `@gi7b/placegen` library's `PlaceDescriptorEngine` rolls `1d3-1` descriptors per name (0–2). With ~8–15 bodies per system, roughly 1/3 of names get 2 descriptors, creating long 3-word names. When listed together without clear separators, this looks overwhelming.

**Library behavior:**
```js
// place-descriptor.js
const count = this.rng.int(1, 3) - 1; // 0, 1, or 2 with equal probability
```

**Proposed controls:**
- **Clean** — no descriptors, just raw names (e.g., "Bilaraltamira")
- **Descriptive** — max 1 descriptor (e.g., "Commercial Bilaraltamira"); 3-word names impossible
- **Verbose** — current behavior, 0–2 descriptors (e.g., "Hallowed Organized Bazpueblo")

Default: **Descriptive** (makes 3-word names rare by making them impossible).

---

## 3. Names Not Editable in Edit Mode

**Symptom:** System name input in `SystemViewer.tsx` uses `system.name` directly, not the `pendingSystem` from edit mode. Body name inputs use `annotations` which are editable always, but their changes are saved immediately to localStorage, not deferred to edit-mode save.

**Fix needed:**
- System name: bind to `displaySystem.name` and route changes through `pendingSystem` when editing
- Body names: in edit mode, changes should be staged in `pendingSystem` (or a parallel pending annotations state) and committed on Save

---

## 4. Proposed Name Generation Options (UI)

Add to GeneratorDashboard (under the "Generate place names" toggle):

| Option | Values | Default |
|--------|--------|---------|
| Name style | Clean / Descriptive / Verbose | Descriptive |
| Base culture | Random / [list of LCs] | Random |
| Drift culture | Random / [list of LCs] | Random |

The Base/Drift culture selectors already exist in SystemViewer but should also be available at generation time.

---

## Action Log

- [x] RCA documented
- [x] Fix blank names on generation — `App.tsx` now pre-fills localStorage annotations
- [x] Auto-populate annotations in `SystemViewer` when viewing systems with existing `placeNames`
- [x] Add `nameDescriptorMode` to GeneratorOptions (`clean` | `descriptive` | `verbose`)
- [x] Update `placeNameGen.ts` to respect mode (passes `undefined`, `{maxDescriptors:1}`, or `{}` to PlaceGen)
- [x] Add UI controls in GeneratorDashboard — checkbox + style dropdown (shown when checked)
- [x] Make system name editable in edit mode — binds to `displaySystem.name`, updates `pendingSystem`
- [x] Make body names editable in edit mode — `pendingAnnotations` state, committed on Save/Discard
