# MWG Redesign — Positioning System

**Status:** Draft v0.3 — Hot Jupiter reversed to stability roll, shepherding + mass absorption + class upgrade locked, Proto-Star visualization noted
**Date:** 2026-04-17
**Author:** Design consolidation from design session with Justin
**Depends on:** Terminology (Level 0/1/2) + Composition/Atmosphere/Biosphere draft + Moons / Parent-Child Limit draft
**Replaces:** REF-003 (orbit table) and REF-005 (world position table) for Level 1 body placement

---

## 1. Context

The Positioning System determines where every Level 1 INRAS body (and its circumstellar disk) is placed in orbital space around the primary star. It's the glue between "bodies are generated" and "habitability is computed" — zone determines temperature modifiers, which affect habitability.

The system has three structural components:

1. **Inner Zones** — 4 zones + frost-line transition (Infernal / Hot / Conservative / Cool / Frost Line)
2. **Outer Zones** — 5 zones geometrically growing out to the heliopause (O1 narrow, O5 wide)
3. **Parent-anchored positioning** — the largest Gas/Ice Giant anchors the frost line; the largest Terrestrial anchors inner-system placement

---

## 2. Zone Definitions

### Inner System

| Zone | Description | Boundary Formula |
|---|---|---|
| **Infernal** | Closest to star, Mercury-like | Stellar radius × 2 to √(L/L☉) × 0.4 AU |
| **Hot** | Venus-like | √(L/L☉) × 0.4 to 0.8 AU |
| **Conservative** | Earth-like, the habitable sweet spot | √(L/L☉) × 0.8 to 1.2 AU |
| **Cool** | Mars-like | √(L/L☉) × 1.2 to 2.0 AU |
| **Frost Line transition** | Where water ice becomes stable | √(L/L☉) × 4.85 AU (anchor point) |

### Outer System

The outer system spans from the Frost Line to the Heliopause. Zone widths grow geometrically.

```
heliopauseDistance = 120 × √(L/L☉)  [AU]
outerSpan = heliopauseDistance − frostLineDistance
```

| Outer Zone | Width % of outerSpan | Cumulative position |
|---|---|---|
| **O1** | 3.125% | Just past frost line — Kuiper-Belt density |
| **O2** | 6.25% | — |
| **O3** | 12.5% | — |
| **O4** | 25% | — |
| **O5** | 50% | Out to Heliopause — Oort-cloud sparseness |

**Example:** For a G2V star (L ≈ 1 L☉), frost line ≈ 4.85 AU, heliopause = 120 AU, outer span = 115.15 AU.
- O1 spans 4.85 → 8.45 AU (width 3.6 AU)
- O2 spans 8.45 → 15.65 AU (width 7.2 AU)
- O3 spans 15.65 → 30.04 AU (width 14.4 AU)
- O4 spans 30.04 → 58.83 AU (width 28.8 AU)
- O5 spans 58.83 → 120 AU (width 57.6 AU)

---

## 3. The Unified 3D6 Position Roll

Every INRAS body rolls a **unified 3D6** to determine its zone placement. This is the core mechanic.

### Step 1: Unified 3D6 → Inner or Outer

| 3D6 Result | Placement |
|---|---|
| **3** | Infernal |
| **4–7** | Hot |
| **8–11** | Conservative |
| **12–13** | Cool |
| **14** | Frost Line transition (just past frost line, inner edge of O1) |
| **15–18** | Outer (trigger second roll for specific O-zone) |

**Distribution:**
- Infernal: 0.46%
- Hot: 15.3%
- Conservative: 43.5% (most common — matches Earth-like being the "normal" rocky world position)
- Cool: 16.2%
- Frost Line: 9.7%
- Outer: 14.8%

### Step 2: If Outer (roll was 15–18), Second 3D6 for Outer Zone

| Second 3D6 | Outer Zone |
|---|---|
| 3–9 | **O1** (50%) |
| 10–11 | **O2** (16.7%) |
| 12–13 | **O3** (16.7%) |
| 14–17 | **O4** (14.8%) |
| 18 | **O5** (0.46%) |

Outer zones are weighted heavily toward O1 (Kuiper-belt density) with exponentially decreasing probability as zones widen — balancing the fact that O5 is geometrically huge but physically sparse.

---

## 4. Placement Order

After all bodies are generated (masses + compositions), place them in sequence:

### Phase A — Anchor Placement

**A1: Largest Gas/Ice Giant → Frost Line Anchor**

The most massive Gas/Ice Giant in the system is **always placed at the frost line** with minor jitter.

```
anchorDistance = frostLineAU × (1 + (roll3D6 × 0.01 − 0.10))
```

- **Roll 3D6**, apply `roll × 0.01 − 0.10` as a fractional offset
- Minimum roll (3): offset = −0.07, body at 93% of frost-line distance (just inside)
- Maximum roll (18): offset = +0.08, body at 108% of frost-line distance (just past)
- Typical roll (10): offset = 0, body exactly at frost line

**A2: Largest Terrestrial → Inner Placement**

The most massive Terrestrial rolls the **unified 3D6** for placement. Unlike the Gas/Ice anchor, the Terrestrial uses the normal positioning roll.

### Phase B — Disks (placed FIRST to establish zone density)

**Disks are placed before non-anchor bodies.** This is critical because dense disks block subsequent Terrestrial formation in their zones (see §5 and §6 for the blocking rule).

- Roll disk count using the new formula (§6)
- Each disk rolls the unified 3D6 for zone placement
- Disks do NOT conflict with each other or with placed anchor bodies
- Disks **register zone occupancy** for later conflict checks against Terrestrials

### Phase C — Remaining Level 1 Bodies

In **mass-descending order**, each remaining Terrestrial, Dwarf, Ice World, and Gas Giant rolls the unified 3D6 for zone assignment.

**Special body-type rules apply:**
- **Ice Worlds** skip the unified 3D6 entirely — they roll directly on the Outer 3D6 table (§3 Step 2). Ice Worlds physically cannot exist in inner zones (the star strips volatiles).
- **Gas Giants rolling into inner zones** trigger the Hot Jupiter Migration check (§7).
- **Terrestrials rolling into a disk-occupied zone** are blocked and must reroll (§5).
- **Dwarfs rolling into a disk-occupied zone** proceed normally (they coexist with disks by clearing local Hill-sphere gaps).

For each body:
- Apply roll, determine specific zone
- Compute Hill Sphere at the zone's midpoint radius
- Check conflict against already-placed bodies
- Check disk-blocking for Terrestrials
- If conflict → block zone, reroll (see §5)

### Phase D — Moons (Level 2)

Handled by the separate Moons / Parent-Child Limit thread. Each moon is placed within its Parent INRAS's Hill Sphere, with Roche limit as the inner boundary.

---

## 5. Hill Sphere Conflict & Reroll Mechanic

### Hill Sphere Formula

```
r_H = a × ∛(m_body / (3 × M_star))
```

Where:
- `a` = orbital distance (AU)
- `m_body` = body mass (Earth Masses)
- `M_star` = star mass (Earth Masses, 1 M☉ = 333,000 EM)

### Conflict Check

Two bodies' **Hill Spheres cannot overlap by more than 50%**. For positioning purposes, use the standard spacing rule:

```
minSeparation = 4.0 × max(r_H_body1, r_H_body2)
```

If a newly-placed body's position is within `minSeparation` of any already-placed body, **zone is blocked**.

### Disk-Blocking Rule (NEW)

A disk occupies a zone. When subsequent bodies roll into a disk-occupied zone:

- **Terrestrial bodies are blocked** — a disk represents material that couldn't form into a planet; a Terrestrial in that zone would have swept up the disk and grown larger. If the disk still exists, a Terrestrial can't form there.
- **Dwarf bodies are allowed** — small enough to orbit through the disk without sweeping it up; their Hill sphere locally clears a gap (like Saturn's shepherd moons Pan and Daphnis).
- **Gas Giants and Ice Worlds** — not applicable; Gas/Ice Giants would have consumed the disk during formation, so if a disk still exists in that zone, the Giant formed elsewhere.

Implementation:

```typescript
function isBlockedByDisk(body: Body, zone: Zone, system: StarSystem): boolean {
  const diskInZone = system.disks.find(d => d.zone === zone)
  if (!diskInZone) return false
  if (body.type === 'terrestrial') return true
  if (body.type === 'gas' || body.type === 'ice') return true  // Giants clear their disk
  if (body.type === 'dwarf') return false  // Dwarfs coexist
  return false
}
```

### Reroll Logic

1. Body rolls unified 3D6 → zone
2. Compute position and Hill Sphere at zone midpoint
3. Check against all already-placed bodies
4. **If conflict:**
   - Mark zone as **blocked** for this body
   - Roll again (3D6)
   - If new result lands on blocked zone → reroll again
   - Continue until body lands in unblocked zone

### Saturation / Ejection Rule

If a body **rerolls 5 times** without finding an unblocked zone, the body is **ejected**:

- Removed from the system body list
- Added to `ejectedBodies` array with reason flag
- Lore: "This body was hurled out of the system during formation" — matches the Mass Vortex Theory illustration in the Mneme revisions doc

**Ejections are common and intentional.** The 5-reroll limit ensures saturated systems naturally produce 2–5 rogue bodies per generation. This matches real astronomical observation — current research suggests rogue (unbound) planets may outnumber bound planets in the galaxy by 2:1 or more. Stars can only hold a limited amount of orbital material; the rest is ejected.

### Rogue World Implications

- Ejected bodies retain full mass, composition, and biosphere stats (if they passed the biosphere test before ejection)
- A rogue Hydrous Dwarf with a locked-in biosphere becomes a dramatic worldbuilding hook — "an interstellar drifter with a frozen ocean beneath kilometers of ice"
- Ejected Level 2 bodies: if a parent is ejected, its moons travel with it (gravitationally bound); a compound loss
- UI surfaces ejected bodies in a **Rogue Worlds** panel beneath the system viewer

Ejected bodies are **not** part of the habitability candidate pool — a rogue world is not the system's mainworld.

---

## 6. Disk Generation — New Formula

### Count Formula

```
diskCount = floor( (sum of lowest 2 of 3D6 exploding) / 2 − 1 )
```

With **minimum of 0** (negative results clamped to 0).

### Exploding Dice Rule

When a D6 rolls 6, add an additional D6 to that die's total. Explosions chain (a rolled 6 can itself explode).

### Stellar Class Modifier

| Stellar Class | Dice Pool | Modifier Level | Mean Disk Count | P(0 disks) |
|---|---|---|---|---|
| **M** | 4D6 exploding, keep lowest 2 | Dis+1 | ~0.9 | ~30% |
| **K** | 3D6 exploding, keep lowest 2 | Neutral | ~1.1 | ~22% |
| **G** | 3D6 exploding, keep lowest 2 | Neutral | ~1.1 | ~22% |
| **F** | 4D6 exploding, keep lowest 2 | Adv+1 | ~1.3 | ~15% |
| **A** | 5D6 exploding, keep lowest 2 | Adv+2 | ~1.5 | ~10% |
| **B** | 6D6 exploding, keep lowest 2 | Adv+3 | ~1.8 | ~5% |
| **O** | 7D6 exploding, keep lowest 2 | Adv+4 | ~2.0 | ~3% |

### Rationale

"Greater star classifications create too much accretion that planets cannot form due to their radiations." O/B/A stars produce more disks because their radiation environment prevents planetary formation — accretion keeps producing debris without coalescing.

Exploding dice also cluster disk counts at high end for extreme rolls (~0.5% chance of 5+ disks).

### Disk Placement — Phase B (before other bodies)

**IMPORTANT ORDER CHANGE:** Disks are placed in **Phase B**, *before* non-anchor planetary bodies. This allows disks to establish zone density, which affects Terrestrial placement downstream.

- Each Disk rolls the **unified 3D6** for zone placement (same roll as bodies)
- Disks do **not** undergo Hill Sphere conflict checks — disks are diffuse
- Disks do **not** conflict with each other — multiple disks in one zone aggregate into a single denser disk entry
- Disks **do** block Terrestrial (and Gas/Ice Giant) placement in their zone; see §5 "Disk-Blocking Rule"
- Dwarfs can coexist with disks in the same zone

This ordering creates a physically coherent system: **where disks are dense, planets didn't form; where planets formed, disks are absent.**

---

## 7. Body-Type Placement Rules

Beyond the unified 3D6 and conflict-reroll mechanic, two body types have special placement rules:

### Ice Worlds — Outer Zones Only (HARD RULE)

Ice Worlds **cannot exist in inner zones**. The star's energy strips volatiles (H₂O, CH₄, NH₃) before they can stabilize. Any icy material in the inner zones is stripped away during formation; what remains is the rocky/metallic core, which is classified as Terrestrial or Dwarf, not Ice World.

**Implementation:**

Ice Worlds skip the unified 3D6 and roll **directly on the Outer 3D6 table**:

| Outer 3D6 | Zone |
|---|---|
| 3–9 | O1 |
| 10–11 | O2 |
| 12–13 | O3 |
| 14–17 | O4 |
| 18 | O5 |

This means Ice Worlds always place in outer zones — they never enter the unified-roll pool that can land in inner zones.

### Hot Jupiter Migration (Stability Roll — Reversed from QA-011)

A Gas Giant that would otherwise place in an inner zone triggers a **stability check**. The default state is stable; only a *failure* of the stability roll destabilizes the system and causes inward migration.

This reframes the mechanic: **stability is the norm, Hot Jupiters are the exception.** Real exoplanet observation confirms hot Jupiters appear in ~1% of sun-like systems — rare events, not reliable rolls.

**Trigger Conditions (all required):**

1. Gas Giant rolls into an inner zone (Infernal / Hot / Conservative / Cool) via unified 3D6
2. **All four inner zones are already filled** with other bodies (saturation condition)
3. **Stability roll FAILS:**
   - Roll **5D6, keep lowest 3** (Adv+2 mechanic)
   - **TN 5** — sum of kept dice must be **≥ 5** to stay stable
   - Sum **< 5** → instability → Hot Jupiter Event fires

**Net frequency per system:** ~0.5–0.6%, matching real-world exoplanet observation (~1% of sun-like systems host hot Jupiters).

**Why "Adv+2" makes stability likely:** rolling 5 dice and keeping the lowest 3 biases the result toward higher values — systems naturally tend to stabilize. Only unusually unlucky rolls fail.

**Event Execution:**

```typescript
function hotJupiterStabilityRoll(gasGiant: Body, system: StarSystem): boolean {
  // Returns true if stable (no event), false if destabilized
  const roll = rollKeepLowest(5, 6, 3)  // 5D6 keep lowest 3
  return roll.sum >= 5
}

function hotJupiterMigration(gasGiant: Body, system: StarSystem) {
  // Determine final zone (deeper migration on more dramatic failures)
  // Natural 3 (all dice = 1) → Infernal; else Hot
  const stabilityFailure = rollKeepLowest(5, 6, 3).sum
  const finalZone: Zone = stabilityFailure === 3 ? 'Infernal' : 'Hot'
  const finalAU = rollPositionWithinZone(finalZone, system)

  const originalAU = gasGiant.au

  // Identify consumed and shepherded bodies
  const consumedBodies = system.placedBodies.filter(
    b => b.au > finalAU && b.au < originalAU && b.id !== gasGiant.id
  )
  const shepherdedBodies = system.placedBodies.filter(
    b => b.au < finalAU && b.id !== gasGiant.id
  )

  // Consumed: remove from active pool, transfer mass to Gas Giant
  const absorbedMassEM = consumedBodies.reduce((sum, b) => sum + b.massEM, 0)
  const absorbedAvgDensity = consumedBodies.length > 0
    ? consumedBodies.reduce((sum, b) => sum + (b.densityGcm3 || 3), 0) / consumedBodies.length
    : gasGiant.densityGcm3

  // Update Gas Giant mass and density
  const oldMassEM = gasGiant.massEM
  gasGiant.massEM += absorbedMassEM
  gasGiant.massJM = gasGiant.massEM / 317.8
  const massRatio = absorbedMassEM / gasGiant.massEM
  gasGiant.densityGcm3 =
    gasGiant.densityGcm3 * (1 - massRatio) + absorbedAvgDensity * massRatio

  // Class upgrade check based on new mass
  if (gasGiant.massJM >= 50) {
    promoteToBrownDwarf(gasGiant, system)  // Level 0 companion
  } else if (gasGiant.massJM >= 20 && !gasGiant.traits.includes('Proto-Star')) {
    gasGiant.traits.push('Proto-Star')
    applyProtoStarEffects(gasGiant, system)
  }

  // Relocate Gas Giant
  gasGiant.zone = finalZone
  gasGiant.au = finalAU
  gasGiant.traits.push('Hot Jupiter — Migrated Inward', `Absorbed ${consumedBodies.length} bodies`)

  // Shepherded bodies: lose distance to star
  for (const shepherded of shepherdedBodies) {
    const distanceRetentionRoll = rollShepherding(system.primaryStar.class)
    const retentionFraction = distanceRetentionRoll / 100  // e.g., 0.74–0.94
    shepherded.au *= retentionFraction
    shepherded.zone = determineZoneFromAU(shepherded.au, system)
    shepherded.traits.push('Shepherded Inward by Hot Jupiter')
  }

  // Remove consumed bodies from active pool
  for (const consumed of consumedBodies) {
    system.placedBodies = system.placedBodies.filter(b => b.id !== consumed.id)
    system.consumedBodies.push(consumed)
    // Consumed bodies do NOT score in habitability pool
  }
}

function rollShepherding(stellarClass: StellarClass): number {
  // Returns 70 + 4D6 (= 74..94 retention percentage)
  // Adv = more drama = LOWER roll = LESS retention (more distance lost)
  // Dis = less drama = HIGHER roll = MORE retention (less distance lost)
  const diceCount = getShepherdingDiceCount(stellarClass)
  const keepHighest = stellarClass === 'M' || stellarClass === 'K'  // Dis keeps highest to reduce drama
  const roll = keepHighest
    ? rollKeepHighest(diceCount, 6, 4).sum
    : rollKeepLowest(diceCount, 6, 4).sum
  return 70 + roll
}

function getShepherdingDiceCount(stellarClass: StellarClass): number {
  // F-class: Adv+2 (6D6 keep lowest 4 → lower roll → more drama)
  // G-class: Adv+1 (5D6 keep lowest 4)
  // K-class: Neutral (4D6)
  // M-class: Dis+1 (5D6 keep highest 4 → higher roll → less drama)
  switch (stellarClass) {
    case 'F': return 6  // keep lowest 4
    case 'G': return 5  // keep lowest 4
    case 'K': return 4  // straight roll
    case 'M': return 5  // keep highest 4
    default: return 4
  }
}
```

### Shepherded Planet Distance Loss

Bodies with `au < finalAU` (closer to the star than the Gas Giant's landing position) are **shepherded inward** rather than consumed. Their new distance is calculated as:

```
newDistance = oldDistance × ((70 + 4D6) / 100)
```

- Base roll: 4D6 → 4 to 24 → retention 74% to 94% → loses 6-26% of distance
- **Stellar class modifier on the retention roll** — *Adv means more drama (more distance lost):*

| Stellar Class | Dice Mechanic | Retention Tendency |
|---|---|---|
| **F** | 6D6 keep lowest 4 | Biased low → retains 74–84% (more drama) |
| **G** | 5D6 keep lowest 4 | Slightly biased low → retains 75–88% |
| **K** | 4D6 straight | Neutral → retains 78–88% |
| **M** | 5D6 keep highest 4 | Biased high → retains 84–94% (less drama) |

Hotter/denser stars produce more aggressive migration; cooler M-class stars produce gentler shepherding. Physically this reflects that F-class stars have more energetic disk environments during formation.

### Consequences of Hot Jupiter Event

1. **Consumed bodies** (between original and final position): removed from system, added to `consumedBodies` array for display. **Do not score in habitability candidate pool.**
2. **Shepherded bodies** (inside final position): remain in system but distance reduced; update zone assignment based on new AU.
3. **Gas Giant mass absorption:** sums all consumed body masses, adds to Gas Giant mass. Density recalculated proportionally (rocky absorption raises density from ~1.3 g/cm³ toward ~5 g/cm³ based on mix).
4. **Class upgrade:** if post-absorption mass ≥ 20 JM, body gains Proto-Star trait; if ≥ 50 JM, body is promoted to Level 0 Brown Dwarf companion (see §9). Dramatic Hot Jupiter events can ignite a star.
5. **Traits logged:** Gas Giant records `Hot Jupiter — Migrated Inward`, `Absorbed N bodies`. Shepherded bodies record `Shepherded Inward by Hot Jupiter`.
6. **System architecture changed:** the system has a hot Jupiter (or Proto-Star, or binary if promoted) where previously it had a normal Gas Giant. Trade/travel patterns, habitability, and narrative hooks all shift accordingly.

### Interaction with Original QA-011

This **replaces** the previous mechanic ("Gas Giant in Hot/Infernal zone clears the zone"). The new rule is rarer, more destructive when it fires (eats multiple zones), more physically honest (disk-migration narrative), and has richer downstream consequences (mass absorption, class upgrade, shepherding).

---

## 8. Proto-Star Positioning

## 8. Proto-Star Positioning Adjustments

Per the Moons / Parent-Child Limit thread, Proto-Stars (20–49 JM Gas Giants with the Proto-Star trait) heat their own moons. This creates a mini-habitable zone around the Proto-Star, regardless of its position in the primary star's zones.

**Proto-Star positioning is normal** — they follow the same anchor or unified 3D6 rules as other Gas Giants. The *effects* of the Proto-Star on its children (heat DMs on temperature, more moons, higher Captured Terrestrial odds) are handled in the Moons thread and referenced during L2 generation.

### Visualization (2D System Map)

Proto-Star parents should display a **mini-habitable-zone band** around the body in the 2D system map, distinct from the primary star's habitable zone. This helps worldbuilders identify which moons benefit from Proto-Star heat.

The band should be colored similarly to the primary star's Conservative zone (e.g., a subtle green tint) but positioned around the Proto-Star itself, spanning a fraction of its Hill sphere (roughly 1–5% of Hill radius from the Proto-Star, depending on mass).

Implementation ties into **FR-031 (2D Animated Map)** and should be added to the Phase 6 work along with tooltips and Brachistochrone paths.

---

## 9. Brown Dwarf Positioning (Level 0 Promotion)

When a Gas Giant is promoted to a Brown Dwarf (mass ≥ 50 JM, per the Gas Giant generation thread), it **becomes a Level 0 Companion Star** and exits the Level 1 placement pool.

### Relocation to Companion Orbit

Brown Dwarfs typically orbit primaries at **tens-to-hundreds of AU**, not at gas-giant distances. On promotion:

1. Body is removed from the Level 1 gas-giant list
2. Body is added to the Companion Stars array
3. Body rolls a new orbit using REF-003 Companion Star orbit rules (3D6 table distant-orbit distribution)
4. Any moons already generated for the body travel with it
5. Body's Hill Sphere is recalculated at its new orbit — may increase dramatically

### Implications for Inner System

A Brown Dwarf in the inner system is astronomically implausible (it would destabilize inner planets). The positioning system enforces this: Brown Dwarfs only place in outer orbits (~50+ AU from primary).

### System Architecture

A system with a Brown Dwarf companion becomes **multi-star architecture** even if it started as a single-star configuration. The Brown Dwarf can itself host Level 1 INRAS — a sub-system with its own planets (per the "promoted Brown Dwarfs get their own INRAS system" direction).

**This is a deferred detail** — for v1, promoted Brown Dwarfs keep only their original moons (re-orbiting the new Brown Dwarf parent). Full sub-system generation around promoted Brown Dwarfs can be a later feature.

---

## 10. Data Model Additions

```typescript
interface StarSystem {
  // ... existing fields
  heliopauseAU: number              // 120 × √(L/L☉)
  frostLineAU: number               // 4.85 × √(L/L☉)
  innerSystemZones: ZoneBoundaries  // existing
  outerSystemZones: OuterZoneBoundaries  // NEW
  ejectedBodies: Body[]             // NEW — rogue bodies from saturation
}

interface OuterZoneBoundaries {
  o1: { minAU: number; maxAU: number }
  o2: { minAU: number; maxAU: number }
  o3: { minAU: number; maxAU: number }
  o4: { minAU: number; maxAU: number }
  o5: { minAU: number; maxAU: number }
}

interface Body {
  // ... existing fields
  zone: ZoneId                       // existing, extend to include O1–O5
  positionRoll: number               // debug/display — what 3D6 landed on
  positionRerollCount: number        // how many times this body rerolled
  wasEjected?: boolean               // NEW — ejected from system
  ejectionReason?: string            // NEW — "saturation" | "gravitational"
}

type ZoneId =
  | 'Infernal' | 'Hot' | 'Conservative' | 'Cool'
  | 'FrostLine'
  | 'O1' | 'O2' | 'O3' | 'O4' | 'O5'
```

---

## 11. Full Placement Algorithm (Pseudocode)

```typescript
function placeBodiesInSystem(system: StarSystem): StarSystem {
  // Phase A: Anchor placement
  const gasIceGiants = system.bodies.filter(b => b.type === 'gas' || b.type === 'ice')
  const terrestrialsAndDwarfs = system.bodies.filter(b => b.type === 'terrestrial' || b.type === 'dwarf')

  if (gasIceGiants.length > 0) {
    const largestGasIce = maxByMass(gasIceGiants)
    placeAtFrostLineAnchor(largestGasIce, system)
  }

  if (terrestrialsAndDwarfs.length > 0) {
    const largestTerrestrial = maxByMass(terrestrialsAndDwarfs.filter(b => b.type === 'terrestrial'))
    if (largestTerrestrial) {
      placeViaUnifiedRoll(largestTerrestrial, system)
    }
  }

  // Phase B: Disks FIRST (establish zone density before planets)
  const diskCount = rollDiskCount(system.primaryStar.class)
  for (let i = 0; i < diskCount; i++) {
    const disk = generateDisk(system)
    placeViaUnifiedRoll(disk, system)  // no Hill check, no conflict
    system.disks.push(disk)
  }

  // Phase C: Remaining bodies, mass-descending
  const remaining = system.bodies
    .filter(b => !b.placed)
    .sort((a, b) => b.massEM - a.massEM)

  for (const body of remaining) {
    // Ice Worlds: skip unified roll, go directly to Outer
    if (body.type === 'ice') {
      const placed = placeIceWorldInOuterZone(body, system)
      if (!placed) {
        ejectBody(body, system, 'saturation')
      }
      continue
    }

    // Gas Giants check Hot Jupiter trigger when rolling into saturated inner zones
    if (body.type === 'gas') {
      const targetZone = rollUnifiedZone()
      if (isInnerZone(targetZone) && allInnerZonesFilled(system)) {
        const stabilityRoll = rollKeepLowest(5, 6, 3).sum  // 5D6 keep lowest 3
        if (stabilityRoll < 5) {
          // Hot Jupiter Event fires — stability failed
          hotJupiterMigration(body, stabilityRoll, system)
          continue
        }
      }
      // Fall through to normal placement with the already-rolled zone
      placeBodyAtZone(body, targetZone, system)
      continue
    }

    // Terrestrials, Dwarfs: unified roll with disk-blocking check
    const placed = placeViaUnifiedRollWithRerolls(body, system)
    if (!placed) {
      ejectBody(body, system, 'saturation')
    }
  }

  // Phase D: Moons (handled by Moons thread)
  for (const parent of getParentINRAS(system)) {
    generateLevel2Children(parent, system)
  }

  return system
}

function placeViaUnifiedRollWithRerolls(
  body: Body,
  system: StarSystem,
  maxRerolls: number = 5
): boolean {
  const blockedZones = new Set<ZoneId>()

  for (let attempt = 0; attempt < maxRerolls; attempt++) {
    const roll = roll3D6()
    const zone = mapUnifiedRollToZone(roll, blockedZones)

    if (zone === null) {
      return false  // All viable zones blocked
    }

    // Disk-blocking check
    if (isBlockedByDisk(body, zone, system)) {
      blockedZones.add(zone)
      continue
    }

    const position = rollPositionWithinZone(zone, system)
    body.zone = zone
    body.au = position
    body.hillRadiusAU = computeHillSphere(body.massEM, position, system.primaryStar.massEM)

    if (hasConflict(body, system.placedBodies)) {
      blockedZones.add(zone)
      body.positionRerollCount = attempt + 1
      continue
    }

    system.placedBodies.push(body)
    body.placed = true
    return true
  }

  return false  // Max rerolls reached — body is ejected
}
```

---

## 12. Worked Example

### Scenario: G2V star, 1 Terrestrial (2 EM), 1 Gas Giant (1 JM), 1 Ice World (0.3 JM), 1 Dwarf (0.5 LM)

**System constants:**
- L ≈ 1 L☉, √L = 1.0
- Frost line ≈ 4.85 AU
- Heliopause ≈ 120 AU
- Outer span ≈ 115 AU
- Zone boundaries: O1 = 4.85–8.45 AU, O2 = 8.45–15.65 AU, ...

**Phase A anchors:**
- Gas Giant (1 JM) anchored at Frost Line. Roll 3D6 = 11 → offset = 11 × 0.01 − 0.10 = 0.01 → placed at 4.85 × 1.01 = **4.90 AU** ✓
- Terrestrial (2 EM) rolls unified 3D6 = 9 → **Conservative zone** → rolled position at ~1.0 AU ✓

**Phase B remaining bodies (mass desc):**
- Ice World (0.3 JM) rolls 3D6 = 17 → Outer. Second 3D6 = 11 → **O2**. Placed at ~12 AU. Check Hill conflict with Gas Giant at 4.90 AU. Hill radius of Gas Giant at 4.90 AU ≈ 0.33 AU. Separation from 12 AU = 7.1 AU >> 4 × 0.33 = 1.3 AU. No conflict. ✓
- Dwarf (0.5 LM = 0.006 EM) rolls 3D6 = 4 → **Hot zone** → position ~0.6 AU. No bodies in Hot zone yet. No conflict. ✓

**Phase C disks:**
- G-class: 3D6 exploding, keep lowest 2. Rolls [2, 5, 6(+3=9)] → lowest 2 = 2, 5 → sum = 7 → (7/2) − 1 = 2.5 → floor = **2 disks**
- Disk 1 rolls 3D6 = 18 → Outer → O1 at ~6 AU. No Hill conflict (disks don't have Hill spheres). ✓
- Disk 2 rolls 3D6 = 6 → Hot at ~0.5 AU. ✓

**Phase D moons:**
- Gas Giant hosts children (per Moons thread) — rolls 3D6 Dis+2 for child count → typically 1–2 moons
- Terrestrial hosts children — Dis+5 → typically 0 moons

Result: a 4-planet system with Sol-like architecture. Ice Giant in the Neptune zone, Gas Giant near Jupiter's position, Earth-like in the habitable zone, Mercury-like Dwarf in the Hot zone, with asteroid-belt-equivalent disks.

---

## 13. Open Questions

### Resolved in v0.2

- ~~Multiple-roll reroll limit (5) is arbitrary.~~ **Locked at 5.** Ejections are common and intentional — rogue worlds are a feature, matching real astronomical observations (2:1+ rogue-to-bound ratio).
- ~~Disks and zone blocking.~~ **Locked.** Disks block Terrestrials and Gas/Ice Giants; Dwarfs coexist with disks.
- ~~Ice Worlds in inner zones.~~ **Locked as hard rule.** Ice Worlds roll on Outer 3D6 table directly; they never appear in inner zones.
- ~~Hot Jupiter Migration trigger.~~ **Locked.** Saturated inner zones + Gas Giant rolls inner + stability roll fails.

### Resolved in v0.3 (this revision)

- ~~Hot Jupiter rarity tuning.~~ **Locked at ~0.5-0.6% per system** via reversed stability roll: 5D6 keep lowest 3 vs TN 5 (Adv+2 mechanic, ~5.5% failure per trigger, net ~0.5-0.6% per system). Matches real-world hot Jupiter observation (~1%).
- ~~Shepherded planets during Hot Jupiter Event.~~ **Locked.** Planets inside final Gas Giant position retain (70 + 4D6)% of their distance, losing 6–26%. Stellar class modifier applied: Adv = more drama/more loss (F-class), Dis = less drama (M-class).
- ~~Mass-driven class upgrade.~~ **Locked.** Gas Giant absorbs consumed planet mass; if post-absorption mass ≥ 20 JM, gains Proto-Star trait; if ≥ 50 JM, promoted to Level 0 Brown Dwarf.
- ~~Density adjustment.~~ **Locked.** Density recalculated proportionally based on absorbed mass ratio and consumed body densities.
- ~~Consumed bodies in habitability pool.~~ **Locked.** Consumed bodies are removed from the candidate pool; their mass transfers to the Gas Giant.
- ~~Proto-Star heat zone visualization.~~ **Locked.** Band-color display on 2D System Map (FR-031 Phase 6).

### Remaining Open Questions

- **Hot Jupiter rarity batch-validation.** After implementation, run 10,000-system batch to verify ~0.5-1% Hot Jupiter rate holds across stellar classes. Tune TN up to 6 or mechanic adjustments if empirical rate drifts.
- **Shepherded body zone reassignment.** When a shepherded planet's AU decreases enough that it crosses a zone boundary, its zone label updates. Should we also recalculate its temperature habitability? The body is now closer to the star → hotter → possibly uninhabitable. For v1, yes — shepherded bodies have their temperature re-evaluated post-shepherding.
- **Promoted Brown Dwarf sub-systems.** For v1, promoted Brown Dwarfs keep only their original moons. Full sub-system generation is a deferred feature (FR).
- **Consumed body narrative display.** The `consumedBodies` array should render in the UI as a "Absorbed Worlds" list with the Gas Giant's detail panel — showing their pre-consumption composition/biosphere. Narrative hook: "This gas giant devoured a potentially habitable Hydrous Terrestrial during its migration."
- **Brown Dwarf companion position after Hot Jupiter promotion.** ~~Proposed: relocate to standard outer orbit.~~ **Resolved:** Relocate to standard Brown Dwarf companion orbit per REF-003. See consolidated spec §4.7.

---

**End of draft v0.3.** Awaiting review before moving to Habitability Application thread.
