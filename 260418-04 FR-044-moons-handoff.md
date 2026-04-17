# FR-044 — Moons / Parent-Child Limit

## ★ HANDOFF TO KIMI ★

**Purpose:** Implement Level 2 body generation (moons and rings) that orbits Level 1 INRAS. This is the fourth feature request in the v2 pipeline redesign, sitting between Positioning (FR-042) and Habitability Application (FR-043).

**Read order before touching code:**
1. `repoAnalysis.md` — current code architecture
2. `260417-00 MWG-REDESIGN-composition-atmosphere-biosphere.md` (FR-041) — composition/atmosphere/biosphere tables that moons also use
3. `2600417-01 MWG-REDESIGN-positioning.md` (FR-042) — parent INRAS positioning; moons position *relative to parents*
4. **This document (FR-044)** — Parent-Child Limit mechanic, child count, child type, mass caps, rings
5. `260417-02 MWG-REDESIGN-habitability-application.md` (FR-043) — habitability scoring that applies to Level 2 Dwarf/Terrestrial moons

---

## 1. Core Concept

Under the v2 pipeline, every Parent INRAS (Terrestrial, Ice World, or Gas World at Level 1) generates its own set of Level 2 children. Moons are full **habitability candidates** alongside Level 1 bodies — a Hydrous Dwarf moon of a Gas Giant can become the system's mainworld, beating every inner-system Terrestrial on raw habitability score (Europa/Enceladus archetype).

The **Parent-Child Limit** mechanic (generalization of REF-002 Companion Star constraint) governs:

- How many children each Parent INRAS hosts
- What types of children (Dwarf, Terrestrial, Ring)
- How massive children can be relative to parent
- Ring existence and density

---

## 2. Level Hierarchy (locked from terminology thread)

| Level | Bodies |
|---|---|
| **Level 0** | Stars (Primary + Companions) |
| **Level 1** | INRAS — orbits a star directly (Disks, Dwarfs, Terrestrials, Ice Worlds, Gas Worlds) |
| **Level 2** | Children — orbits a Parent INRAS (Rings, Dwarfs, rarely Terrestrials) |

| Level 1 Body Type | Can Host Children? |
|---|---|
| Disk | No |
| Dwarf | No — insufficient mass |
| Terrestrial | Yes (Dwarf moons + possible Ring) |
| Ice World | Yes (Dwarf moons + possible Ring) |
| Gas World | Yes (Dwarf moons + rarely Terrestrial moons + possible Ring) |

Only **Gas World parents** can host Terrestrial children.

---

## 3. Child Count Roll (3D6 with Parent-Mass Disadvantage)

Per Parent INRAS, roll 3D6 with a Disadvantage modifier determined by parent mass.

### Disadvantage Ladder

| Parent Mass | Disadvantage | Dice Mechanic | Typical Count |
|---|---|---|---|
| Super-Jovian (≥ 3 JM) | None | 3D6 straight | 2–3 |
| Jovian (1–3 JM) | Dis+1 | 4D6 keep 3 lowest | 2 |
| Sub-Jovian (0.3–1 JM) | Dis+2 | 5D6 keep 3 lowest | 1–2 |
| Neptune/Uranus (0.1–0.3 JM) | Dis+3 | 6D6 keep 3 lowest | 1 |
| Gas-Dwarf (< 0.1 JM) | Dis+4 | 7D6 keep 3 lowest | 1 |
| Large Terrestrial/Ice (≥ 1 EM) | Dis+5 | 8D6 keep 3 lowest | 0–1 |
| Small Terrestrial/Ice (< 1 EM) | Dis+6 | 9D6 keep 3 lowest | 0–1 |

### Result → Child Count

| 3D6 Result | Children |
|---|---|
| 3–4 | 0 (barren parent) |
| 5–7 | 1 |
| 8–10 | 2 |
| 11–12 | 3 |
| 13–14 | 4 |
| 15–16 | 5 |
| 17 | 6 |
| 18 | 7 + 2D6 11+ triggers an 8th "irregular capture" |

### Sanity vs Real Solar System

- Jupiter (1 JM, Dis+1): predicts 2 typically; real = 4 Galilean ✓
- Saturn (0.3 JM, Dis+2): predicts 1–2; real = 7 (outlier, OK)
- Neptune (0.05 JM, Dis+4): predicts 1; real = 1 (Triton) ✓
- Earth (1 EM, Dis+5): predicts 0–1; real = 1 (Luna) ✓
- Mars (0.1 EM, Dis+6): predicts 0; real = 0 major (Phobos/Deimos sub-Dwarf) ✓

---

## 4. Child Type Roll (Gas parents only)

For each child slot, determine type. **Only Gas parents run this check** — Terrestrial/Ice parents always get Dwarf children.

### Type Upgrade Check

Base roll: 3D6 with default Dis+3. Target: ≥ **15** for Terrestrial upgrade.

| Gas Parent Mass | Dice Mechanic | P(Terrestrial upgrade) per slot |
|---|---|---|
| Brown-Dwarf-class (> 13 JM) | 4D6 keep 3 high (Adv+1) | ~30% |
| Super-Jovian (3–13 JM) | 3D6 straight | ~10% |
| Jovian (1–3 JM) | 4D6 keep 3 low (Dis+1) | ~4% |
| Sub-Jovian (0.3–1 JM) | 5D6 keep 3 low (Dis+2) | ~2% |
| Neptune-class (< 0.3 JM) | 6D6 keep 3 low (Dis+3) | ~0.5% |

**System-wide target:** ~5% of systems have a Captured Terrestrial moon. Flagship discovery moment.

---

## 5. Child Mass Roll and Parent-Child Limit

Each child rolls mass using standard REF-007 mass tables (Dwarf or Terrestrial column based on type). Result is **capped** by the Parent-Child Limit.

### Mass Cap Ratios

| Parent Type | Child Type | Max Child Mass (fraction of parent) |
|---|---|---|
| Terrestrial | Dwarf | 2% |
| Ice World | Dwarf | 2% |
| Gas World | Dwarf | 0.5% |
| Gas World | Captured Terrestrial | 1% |

### Cap Enforcement

**Scale-down, not reroll:**

```typescript
if (rolledMass > parentMass * capRatio) {
  finalMass = parentMass * capRatio
}
```

Preserves intent of high rolls while enforcing physics. Matches REF-002 Companion Star pattern.

---

## 6. Rings (Independent L2 Bodies)

### Existence Roll (2D6)

| Parent Type | Target | P(Rings) |
|---|---|---|
| Gas World | 8+ | 41.7% |
| Ice World | 10+ | 16.7% |
| Terrestrial | 12 | 2.8% |

### Density/Size Roll (3D6, if Rings exist)

| 3D6 | Ring Class | Description |
|---|---|---|
| 3–8 | Faint Dust Band | Jupiter/Uranus class — nearly invisible |
| 9–13 | Visible Ring System | Neptune/Uranus class — discrete narrow bands |
| 14–17 | Saturn-Class Showpiece | Broad multi-band system |
| 18 | Great Ring | Spans multiple Hill radii |

Rings are NOT habitability candidates. Flavor/visualization only.

---

## 7. Positioning Within Parent's Hill Sphere

Each Level 2 child places within its parent's Hill Sphere, bounded by Roche limit.

### Formulas

```
parentHillRadiusAU = parent.au * cbrt(parent.massEM / (3 * starMassEM))
rocheLimit = parent.radiusAU * 2.44 * cbrt(parent.density / child.density)
maxOrbit = parentHillRadiusAU * 0.5   // stable Hill sphere
```

### Placement Algorithm

1. Sort children of this parent by mass descending
2. For each child, roll 2D6:
   - Map to fractional position between `rocheLimit` and `maxOrbit` (roll 2 = just above Roche, roll 12 = near Hill edge)
3. Check Hill sphere conflict between siblings (use REF-011 Hill spacing)
4. Reroll on conflict (5 rerolls max per FR-042 convention)
5. If all rerolls fail → sibling ejected (becomes a rogue orbiting the parent star?) — defer this edge case, log and skip

Moons do NOT trigger Hot Jupiter migration (no inner zones at L2 scale).

---

## 8. Captured Terrestrials — Special Flag

When type roll produces a Terrestrial child from a Gas parent:

- Flag body with `wasCapturedTerrestrial: true`
- Add trait: "Captured Terrestrial Moon"
- Treat as high-mass candidate for flagship mainworld pick
- Apply standard composition/atmosphere/biosphere pipeline (no special rules beyond the flag)

These are Endor/Pandora archetypes — rare, dramatic, potentially habitable.

---

## 9. Data Model Additions (extends FR-042 types)

```typescript
interface Body {
  // ... existing fields
  level: 0 | 1 | 2               // added in FR-042
  parentId: string                // added in FR-042 (star ID for L1, body ID for L2)

  // L2-specific (new in FR-044)
  wasCapturedTerrestrial?: boolean
  massCapApplied?: boolean        // did we clamp the mass?
  originalRolledMass?: number     // pre-cap value (for debugging/display)

  // Ring-specific (new in FR-044)
  ringClass?: 'faint' | 'visible' | 'showpiece' | 'great'
  ringMassEstimateEM?: number
  ringOuterRadiusAU?: number
}

interface Parent extends Body {
  hostedChildCount: number
  hostedChildIds: string[]
  hasRings: boolean
}

type BodyType =
  | 'star'
  | 'disk'
  | 'dwarf' | 'terrestrial' | 'ice' | 'gas'
  | 'ring'                        // new
```

---

## 10. Generation Algorithm (integrates into FR-042 Phase D)

```typescript
function generateLevel2Children(parent: Body, system: StarSystem): Body[] {
  // Step 1: Count
  const disLevel = getParentMassDisadvantage(parent.massEM)
  const countRoll = roll3D6WithDisadvantage(disLevel)
  const childCount = lookupChildCount(countRoll)

  const children: Body[] = []

  for (let i = 0; i < childCount; i++) {
    // Step 2: Type (Gas parents only)
    let childType: 'dwarf' | 'terrestrial' = 'dwarf'
    if (parent.type === 'gas') {
      const typeDis = getGasParentTypeDisadvantage(parent.massEM)
      const typeRoll = roll3D6WithDisadvantage(typeDis)
      if (typeRoll >= 15) childType = 'terrestrial'
    }

    // Step 3: Mass (from REF-007 + stellar mods)
    const massRoll = roll2D6WithStellarMods(system.primaryStar.class)
    const rolledMass = lookupMass(massRoll, childType)

    // Step 4: Cap
    const capRatio = getMassCapRatio(parent.type, childType)
    const finalMass = Math.min(rolledMass, parent.massEM * capRatio)
    const wasCapped = finalMass < rolledMass

    // Step 5: Composition + density (runs through FR-041 pipeline)
    const child = createBody({
      type: childType,
      parentId: parent.id,
      level: 2,
      massEM: finalMass,
      wasCapturedTerrestrial: childType === 'terrestrial',
      massCapApplied: wasCapped,
      originalRolledMass: rolledMass,
    })

    runCompositionPipeline(child, system)  // FR-041

    children.push(child)
  }

  // Step 6: Rings
  const ringRoll = roll2D6()
  const ringTarget = getRingTarget(parent.type)
  if (ringRoll >= ringTarget) {
    const densityRoll = roll3D6()
    const ring = createRing(parent, densityRoll)
    children.push(ring)
  }

  // Step 7: Position each child within parent's Hill sphere
  positionChildrenInHillSphere(parent, children, system)

  // Link back to parent
  parent.hostedChildCount = children.filter(c => c.type !== 'ring').length
  parent.hostedChildIds = children.map(c => c.id)
  parent.hasRings = children.some(c => c.type === 'ring')

  return children
}
```

---

## 11. UI — System Viewer Indentation Spec

**Surface:** System Viewer (`SystemViewer.tsx` — the main system-card display)

### Visual Structure

Level 1 bodies render as top-level entries. Level 2 children render as **indented sub-list items** beneath their parent, using a visual indent (left padding) and a tree-connector glyph.

**Target layout:**

```
★ Primary Star: G2V
│
├── ☿ Dwarf Mercury-type (0.1 EM, Metallic, Infernal)
├── ♀ Terrestrial Venus-type (0.8 EM, Iron-Silicate, Hot)
├── ⊕ Terrestrial Earth-analog (1.0 EM, Iron-Silicate, Conservative)  [← MAINWORLD]
├── ♂ Dwarf Mars-type (0.1 EM, Silicate-Basaltic, Cool)
├── ♃ Gas Giant Jovian (1 JM, Class I, Frost Line)
│     └── Dwarf Io-type (0.01 EM, Volatile-Rich)
│     └── Dwarf Europa-type (0.01 EM, Hydrous) ★ B3 biosphere
│     └── Terrestrial Endor-class (0.04 EM, Hydrous) [captured]
│     └── Ring (Faint Dust Band)
├── ♆ Ice World Neptune-type (17 EM, O2)
│     └── Dwarf Triton-type (0.002 EM, Hydrous)
│
Disks (2):
  ○ Kuiper belt-equivalent (O1)
  ○ Asteroid belt (Hot zone)
```

### Implementation Approach

In `SystemViewer.tsx`:

1. After generating the body list, group bodies by `parentId`:
   - `starChildren` = all Level 1 bodies (parent is a star)
   - `bodyChildren[bodyId]` = all Level 2 bodies with that bodyId as parent
2. Render Level 1 bodies in their existing card format
3. For each Level 1 body, after its header/details block, render an indented sub-list of its Level 2 children
4. Use `pl-8` (32px left padding) or similar Tailwind class for indent
5. Tree connector: use a vertical bar `│` and elbow `└──` as styled pseudo-elements or a left-border treatment

### Styling Tokens

Use theme tokens (per repoAnalysis coding standards):

```tsx
<div className="ml-8 border-l-2 border-border pl-4 space-y-2">
  {children.map(moon => (
    <MoonRow key={moon.id} moon={moon} />
  ))}
</div>
```

For the mainworld callout on a moon (when a Level 2 body is selected as mainworld):
- Highlight the row with `bg-primary/5` or similar subtle theme highlight
- Add "MAINWORLD" badge next to the name
- The Level 1 parent should display "hosts mainworld moon" metadata

### Collapsible Option

Consider adding a collapse/expand chevron next to each Parent INRAS that has children. Gas Giants with 4+ moons + rings can get visually heavy; let the worldbuilder toggle the detail. Default: expanded.

### Rings Display

Rings render as the last child under their parent, visually distinct from moons:
- Icon: ∞ or ◉ to represent rings
- No habitability stats (not a candidate)
- Show ring class and estimated mass

### Mobile Considerations

On narrow viewports, the indent should be smaller (e.g., `pl-4` instead of `pl-8`) to avoid horizontal overflow. Consider: on very narrow screens, collapse all moons by default and let users tap a parent to expand.

---

## 12. Implementation Phases

Slot this between Phase 3 (Positioning) and Phase 4 (Habitability) of the master 8-phase plan. Call it **Phase 3.5**.

| Sub-phase | What | Files | Breaking? |
|---|---|---|---|
| 3.5a | Types — add L2 fields, Ring type, parent tracking | `types/index.ts` | No |
| 3.5b | Parent-Child Limit tables | `worldData.ts` | No |
| 3.5c | `generateLevel2Children()` function | NEW `moons.ts` or extend `generator.ts` | No |
| 3.5d | Integrate into generation pipeline (Phase D of positioning) | `generator.ts` | No (feature-flagged) |
| 3.5e | System Viewer UI — indented sub-lists | `SystemViewer.tsx` | No |
| 3.5f | Docx export update | `exportDocx.ts` | No |

Build order: 3.5a → 3.5b → 3.5c → 3.5d → 3.5e → 3.5f.

---

## 13. Acceptance Criteria

Each subtask must meet these before shipping:

**3.5a — Types**
- `level: 0 | 1 | 2` added to Body interface
- `parentId: string` added
- Ring-specific optional fields added
- `BodyType` extended with `'ring'`
- `npm run build` passes with zero TS errors

**3.5b — Tables**
- Parent mass disadvantage ladder matches §3
- Type upgrade dice mechanic matches §4
- Mass cap ratios match §5
- Ring existence targets match §6
- All constants exported and unit-testable

**3.5c — Generation**
- `generateLevel2Children(parent, system)` returns array of bodies
- Child count distribution matches sanity table in §3
- Captured Terrestrial rate ~5% system-wide (validate via batch test)
- Mass cap enforcement scales down without rerolling
- Rings generated independently of moon count
- No sub-Dwarf bodies produced (children below Dwarf threshold dropped)

**3.5d — Pipeline integration**
- Runs in Phase D of the positioning flow
- Fires for every Parent INRAS (Terrestrial/Ice/Gas at Level 1)
- Does NOT fire for Dwarfs or Disks
- Feature-flagged behind `ENABLE_V2_PIPELINE` for safe rollout

**3.5e — UI**
- Level 2 children render indented under their parent in System Viewer
- Tree-connector styling visible in both light and dark modes
- Mainworld moon highlighted with badge when applicable
- Rings render distinctly from moons
- Collapsible parents work (if implemented)
- Mobile view doesn't overflow horizontally

**3.5f — Docx**
- Indentation preserved in exported Word doc
- Moon attributes listed in nested format under parent
- Captured Terrestrial flag visible in export

---

## 14. Testing & Validation

### Batch Statistical Validation

Use the existing Debug Batch Export panel (`GeneratorDashboard.tsx`) to generate 1000-system batches and verify:

| Metric | Target |
|---|---|
| Avg moons per Jupiter-mass parent (1–3 JM) | 2 |
| Avg moons per Earth-mass parent (1 EM) | 0.5 |
| Avg moons per Mars-mass parent (0.1 EM) | 0.2 |
| Captured Terrestrial rate (system-wide) | ~5% |
| Ring presence on Gas Giants | ~42% |
| Ring presence on Ice Worlds | ~17% |
| Mass-cap violations before clamping | ~8–15% of moon rolls |
| Avg mainworld-is-moon rate (after FR-043 integration) | 15–25% |

### Unit Tests

- `getParentMassDisadvantage(massEM)` returns correct disadvantage level for boundary cases
- `getMassCapRatio(parentType, childType)` returns correct ratio for all combinations
- `generateLevel2Children(terrestrial)` never produces Terrestrial children
- `generateLevel2Children(gasGiant)` occasionally produces Terrestrial children at expected rate
- Mass-cap scale-down produces exact cap value when rolled mass exceeds

### Manual Validation

1. Generate 10 systems with F/G stars; verify Gas Giants typically have 2–4 moons
2. Generate 10 systems with M stars; verify Gas Giants have 1–2 moons
3. Generate 100 systems; verify at least 3–7 have Captured Terrestrials (~5% rate)
4. Open a system with a Captured Terrestrial moon in System Viewer; verify indented display
5. Export that system as docx; verify indentation preserved
6. Toggle dark mode; verify tree connectors still visible

---

## 15. Critical Constraints (carried from QA.md)

- `npm run build` must pass with zero TS errors at every commit
- `tsconfig.json`: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- Use `catch` (bare) when error variable is unused
- Theme tokens only — no hardcoded colors in UI work
- Feature-flag behind `ENABLE_V2_PIPELINE` so v1 codepath still works during rollout
- Test in both light and dark modes
- Mobile/narrow viewport compatibility

---

## 16. Open Questions (for Justin to resolve if hit during implementation)

- **Moon of Moon (Level 3):** A Captured Terrestrial child could physically host its own Dwarf moons. For v1: NO — max level is 2. Revisit in future FR if needed.
- **Resonant orbit systems:** Io-Europa-Ganymede 4:2:1 resonance is real-world. Should we generate these? Defer; positioning within Hill sphere doesn't currently model resonance.
- **Ring material composition:** Should rings have composition (icy/rocky)? Defer — flavor addition.
- **Gas-parent Dwarf composition bias:** Should Dwarf moons of Gas Giants skew toward Hydrous (real solar system pattern)? Currently uses neutral Dwarf Composition table. Consider +1 DM toward Hydrous in future revision.
- **Ejected moons:** If Hill sphere conflict can't be resolved, what happens? Currently: log and skip. Could become a rogue orbiting the parent star at a wide orbit. Defer.

---

## 17. Cross-References

- **FR-041** (Composition/Atmosphere/Biosphere): moons run through this pipeline — same tables, same rolls
- **FR-042** (Positioning): provides parent positions and Hill spheres; Moons slot as Phase D
- **FR-043** (Habitability Application): Level 2 bodies must be included in candidate pool; Moon selection as mainworld is a key feature
- **REF-002** (Companion Star): Parent-Child Limit mechanic generalizes from this
- **REF-007** (Planetary Systems Mass Table): moon masses roll from Dwarf/Terrestrial columns
- **REF-011** (Hill Sphere): orbital spacing for siblings

---

**End of FR-044 handoff.**

When ready to implement, start with Phase 3.5a (types) and build outward.
