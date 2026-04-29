# MWG Redesign — Multi-Star Hierarchy & Wide-Companion Separation

**Status:** Specification — implements as a flag-gated companion-star rebuild
**Date:** 2026-04-27
**Replaces / Extends:** REF-002 (companion existence), REF-003 (orbit table), FRD §5.3, FRD-067 (Barypoint Navigation)
**Related:** `260417-03` consolidated v1 (zone architecture), `260427-01` (zone radiation)
**Feature flag:** `v2MultiStar: boolean` (default `false`); legacy companion path preserved when `false`.

---

## 1. Problem Statement

The current companion-star implementation is cosmetic:

- Companions live in a flat `companionStars[]` array on `StarSystem` with no hierarchy.
- Separation is rolled from REF-003 in fixed AU bands (e.g. G-class 0.5–80 AU, with rare ×10 to ~50,000 AU). The bands routinely place companions **inside the heliopause**, where their gravity would dynamically destabilise INRAS placement.
- No barycenter is ever computed. No stability check exists.
- Planet generation receives `primaryStar` only — companions are never passed through to FR-042 positioning, FR-043 habitability, or mainworld selection. Planets implicitly orbit the primary regardless of how many other stars are present.
- 2D map renders companions at fixed seeded angles. No orbital phase. No wobble.

**The user-facing effect:** "this is a trinary system" reads as text in the export but means nothing for the planets, the habitable zone, or the world map.

**The constraint we accept:** the user has explicitly asked that fixing companion stars **must not complicate INRAS generation**. INRAS (Level 1 — bodies orbiting Level 0 stars) must continue to generate as if the system has one star. This rules out close binaries that would force per-companion stability cones inside the planet placement zone.

---

## 2. Design — Wide-Only Companions

### 2.1 Core decision

Companion stars are placed at separations **wide enough that their S-type stability cone falls outside the heliopause of the parent star**. This means INRAS placement (FR-042), habitability (FR-043), and mainworld selection see only the parent's gravity well.

**Stability constraint (Holman-Wiegert, S-type):**

$$ \text{S-type cap} = 0.46 \cdot a_{\text{binary}} \cdot (1 - e) $$

For the cap to exceed the heliopause:

$$ a_{\text{binary}} \geq \frac{\text{heliopause}_{AU}}{0.46 \cdot (1 - e_{\max})} $$

With `e_max = 0.5`, this is `a_binary ≥ ~4.35 × heliopause`. With `e_max = 0`, it is `a_binary ≥ ~2.17 × heliopause`. The mechanic must always satisfy the more conservative bound.

### 2.2 The 3D3 × Heliopause Roll

**New separation rule (replaces REF-003 under `v2MultiStar`):**

```
roll = 3D3            // sum of three 3-sided dice; range 3–9, mean 6
a_binary = roll × heliopause_AU
```

Where `heliopause_AU = sqrt(luminosity) × 120` (existing `calculateV2Zones` formula in `stellarData.ts:164`).

**Hard floor:** clamp `a_binary` to `max(rolled_value, 3) × heliopause_AU × (1 + e)` so the stability cone always clears the heliopause even on the low end with eccentric outer orbit.

**Eccentricity roll:** 1D6 → 0.0/0.1/0.2/0.3/0.4/0.5 (mean ~0.25). Capped at 0.5 to keep the floor enforceable.

### 2.3 Resulting separations by stellar class

| Parent class | Typical luminosity | Heliopause (AU) | 3D3 × heliopause | Real-world analogue |
|---|---|---|---|---|
| M | ~0.04 | ~24 | 72–216 AU | Proxima ↔ Alpha Cen AB pair (~13,000 AU is wider) |
| K | ~0.4 | ~76 | 228–684 AU | — |
| G | ~1.0 | ~120 | 360–1080 AU | (much wider than Sun ↔ nearest stars) |
| F | ~6 | ~294 | 882–2646 AU | — |
| A | ~25 | ~600 | 1800–5400 AU | Sirius pair (8.6 AU — would be excluded) |
| B | ~1000 | ~3795 | 11,385–34,155 AU | — |
| O | ~30,000 | ~20,785 | 62,355–187,065 AU | — |

These are **wide binary** ranges. Real wide binaries routinely span hundreds to tens of thousands of AU.

### 2.4 What we explicitly drop

The following configurations are **out of scope** for v2 and are documented as "known unsupported":

- **Close binaries** (sub-AU and few-AU separations like Alpha Centauri AB, Sirius A/B, RS Canum Venaticorum). The new roll cannot produce these.
- **Circumbinary (P-type / "Tatooine") planets.** Without a close inner binary, there's no inner barycenter for planets to orbit jointly.
- **S-type stability cones cutting into INRAS.** Eliminated by construction.
- **Per-star planetary subsystems for companions.** A companion star generates no planets of its own under v2. Treated as a distant gravitational + visual presence. (Phase 2 work could lift this — generate an INRAS for each star — but that's deliberately deferred.)

This is a real worldbuilding loss. It is the price of "do not complicate INRAS." Re-evaluate in v3 if close-binary worlds become a creative priority.

---

## 3. Hierarchical Orbit Tree

### 3.1 Data model

```typescript
// types/index.ts

export type OrbitNode = StarLeaf | BinaryNode

export interface StarLeaf {
  kind: 'star'
  starId: string         // references the Star in StarSystem.primaryStar / companionStars[]
  totalMass: number      // = the star's mass in M☉
}

export interface BinaryNode {
  kind: 'binary'
  primary: OrbitNode      // recursive — can be a StarLeaf or another BinaryNode
  secondary: OrbitNode    // ditto
  semiMajorAxisAU: number // separation between the two children's barycenters
  eccentricity: number    // 0.0–0.5
  totalMass: number       // = primary.totalMass + secondary.totalMass

  // Derived (cached at build time — the "gear ratio")
  rPrimaryAU: number      // = a × secondary.totalMass / totalMass
  rSecondaryAU: number    // = a × primary.totalMass / totalMass
  periodYears: number     // Kepler: P² = a³ / totalMass

  // Stability envelope (informational; INRAS doesn't use them under wide-only model)
  sTypeCapAU: number      // = 0.46 × a × (1 − e); for reference / 2D map / FRD-067
  pTypeFloorAU: number    // = 2.39 × a × (1 + e); for reference; no P-type planets generated
}

interface StarSystem {
  // ... existing fields
  rootOrbitNode?: OrbitNode  // v2 hierarchical view; coexists with companionStars[]
  multiStarVersion?: 'v1-flat' | 'v2-tree'
}
```

The legacy `companionStars[]` array is **not removed**. It is populated alongside `rootOrbitNode` so existing UI, exports, and 2D map continue to work. Consumers that want hierarchy use the tree; consumers that want a flat list use the array. New code should prefer the tree.

### 3.2 Construction algorithm

```
buildOrbitTree(primary, companions):
  1. Convert primary and each companion to StarLeaf nodes.
  2. Sort companions by their existing orbitDistance ascending (legacy field
     becomes a relative-order hint; actual separation is recomputed below).
  3. Start with rootNode = StarLeaf(primary).
  4. For each companion (innermost to outermost):
     a. Pull heliopause of the current rootNode's effective parent star.
        For a StarLeaf: heliopause(starLeaf.luminosity).
        For a BinaryNode: use the parent star's heliopause (the most luminous
        star in the existing tree — companions of binaries still need to clear
        the parent's INRAS).
     b. Roll 3D3, eccentricity 1D6.
     c. a_binary = max(roll, 3) × heliopause × (1 + e)
     d. Build new BinaryNode { primary: rootNode, secondary: StarLeaf(companion),
        a, e }.
     e. Compute totalMass, rPrimary, rSecondary, periodYears, sTypeCap, pTypeFloor.
     f. rootNode = newBinaryNode.
  5. Return rootNode.
```

This produces a left-skewed tree: every step nests the previous tree as the "primary" of a new outer binary. It is intentionally simple — we do not attempt double-double quaternaries in v2. A 4-star system becomes a 4-deep nested binary, which is physically defensible (it is one valid hierarchical configuration; the double-double is another, deferred).

### 3.3 Barycenter math (the "gear ratio")

For each `BinaryNode`:

$$ r_1 = a \cdot \frac{m_2}{m_1 + m_2}, \qquad r_2 = a \cdot \frac{m_1}{m_1 + m_2} $$

`r_1 + r_2 = a` always. For nested binaries, the inner binary acts as a point mass at its own barycenter with mass `m_1 + m_2`.

**Kepler period:** $P_{\text{years}} = \sqrt{a^3 / M_{\text{total}}}$ (with `a` in AU and `M_total` in M☉). Cached on the node for the 2D map and FRD-067.

### 3.4 Worked example — G-class trinary

Primary: G2V, M = 1.0, L = 1.0, heliopause = 120 AU.
Companion 1: K5V, M = 0.7, rolled 3D3 = 5, e = 0.2.
- a₁ = max(5, 3) × 120 × 1.2 = 720 AU. Floor satisfied.
- Total mass after = 1.7 M☉.
- r_primary (Sun side) = 720 × 0.7/1.7 = 296 AU.
- r_secondary (K5V side) = 720 × 1.0/1.7 = 424 AU.
- S-type cap = 0.46 × 720 × 0.8 = 265 AU. ✓ Well outside heliopause 120 AU.
- Period = sqrt(720³ / 1.7) ≈ 14,800 years.

Companion 2: M3V, M = 0.3, rolled 3D3 = 7, e = 0.1.
- Parent heliopause still 120 AU (G2V).
- a₂ = max(7, 3) × 120 × 1.1 = 924 AU.
- But this must also clear the existing inner binary's S-type cone reaching outward — verify a₂ > a₁ + r_secondary_outer_swing. Here 924 > 720 + r_secondary_distance_from_outer_barycenter. **Always re-validate** with `a_outer ≥ 3 × a_inner` Holman-Wiegert hierarchical rule.
- If `a_outer < 3 × a_inner`, **re-roll** until satisfied (max 5 attempts; if none satisfies, stop adding companions).

Companion 3: would be added similarly. Each layer must satisfy:
1. S-type cap > parent star heliopause (achieved by 3D3 × heliopause × (1+e))
2. a_outer ≥ 3 × a_inner_max (Holman-Wiegert hierarchical stability)

---

## 4. Pseudocode — Generator Integration

```typescript
// generator.ts (modified)

export function generateStarSystem(options): StarSystem {
  const primaryStar = generatePrimaryStar(opts);
  const zones = calculateZoneBoundaries(primaryStar.luminosity);
  const v2Zones = calculateV2Zones(primaryStar.luminosity);
  const companionStars = generateCompanionStars(primaryStar, v2Zones.heliopauseAU, opts);

  // NEW: build the hierarchical tree
  let rootOrbitNode: OrbitNode | undefined;
  if (opts.v2MultiStar) {
    rootOrbitNode = buildOrbitTree(primaryStar, companionStars, v2Zones.heliopauseAU);
  }

  // Planet generation continues to receive primaryStar only — by design.
  const planetaryResult = generatePlanetarySystem(
    primaryStar, zones, opts.v2Positioning ?? true
  );
  // ... rest unchanged
}

// stellarData.ts (modified)

export function getCompanionOrbitDistance(
  previousClass: StellarClass,
  roll: number,
  heliopauseAU?: number,   // NEW — when supplied, use 3D3 × heliopause
  eccentricity?: number,
): number {
  if (heliopauseAU !== undefined) {
    // v2: 3D3 × heliopause with hard floor
    const e = eccentricity ?? 0;
    const safeRoll = Math.max(roll, 3);
    return round(safeRoll * heliopauseAU * (1 + e), 1);
  }
  // v1: legacy REF-003 behaviour preserved for back-compat
  const baseDistances: Record<StellarClass, number> = {
    O: 120, B: 80, A: 60, F: 50, G: 40, K: 30, M: 20
  };
  const base = baseDistances[previousClass];
  const multiplier = 0.5 + (roll / 36) * 1.5;
  return round(base * multiplier, 1);
}

// multiStar.ts (NEW)

export function buildOrbitTree(
  primary: Star,
  companions: Star[],
  parentHeliopauseAU: number,
): OrbitNode { ... }

export function computeBarycenter(binary: BinaryNode): { rPrimary: number; rSecondary: number } { ... }

export function keplerPeriodYears(a_AU: number, totalMassSolar: number): number {
  return Math.sqrt(Math.pow(a_AU, 3) / totalMassSolar);
}
```

---

## 5. What This Does Not Touch

By design, the following systems remain untouched under `v2MultiStar = true`:

- **FR-042 positioning** — receives `primaryStar` only.
- **FR-043 habitability waterfall** — single-star zones.
- **Mainworld selection** — single-star candidate pool.
- **Moon generation (FR-044)** — single-parent.
- **Existing `companionStars[]` array** — still populated for back-compat with UI, DOCX, CSV.

The only new consumers of `rootOrbitNode` are:
- The 2D map (Phase 2 of this rebuild — animate companion positions from periodYears + phase).
- FRD-067 Barypoint Navigation (unblocked but not implemented in this spec).

---

## 6. Phased Rollout

| Phase | Scope | Files | Breaking? |
|---|---|---|---|
| **1** | Types + multiStar.ts + 3D3 × heliopause separation rule | `types/index.ts`, `src/lib/multiStar.ts` (new), `stellarData.ts`, `generator.ts` | No (flag `v2MultiStar`, default off) |
| **2** | 2D map animation: companions orbit barycenter at Kepler period | `solar-system-2d/src/dataAdapter.ts`, renderer | No |
| **3** | DOCX/CSV export: include barycenter offsets, period, eccentricity | `exportDocx.ts`, CSV writer | No |
| **4** | FRD-067 Barypoint navigation foundation | new module | No |
| **5** (optional) | Per-companion INRAS sub-system generation (close-binary support, P-type planets) | major | Yes — would invalidate the wide-only assumption; revisit |

---

## 7. Validation Targets

After Phase 1 is implemented, run a 1,000-system batch and verify:

| Target | Expected | Tolerance |
|---|---|---|
| Zero planets within any companion's S-type cone | 100% | strict |
| Zero `a_binary < 2.17 × heliopause` cases (should be impossible by floor) | 100% | strict |
| Zero `a_outer < 3 × a_inner` cases in nested binaries | 100% | re-roll loop max 5 attempts; track failure rate |
| Mean separation for G-class binaries | ~720 AU | ±100 AU |
| Eccentricity mean | ~0.25 | ±0.05 |
| Companion existence rate (unchanged from REF-002) | per-class table | unchanged |
| Mainworld selection unchanged for single-star systems | 100% | strict |

---

## 8. Open Questions for Wiki / Domain Review

1. **Eccentricity distribution.** We use 1D6/10 (uniform). Real wide binaries follow roughly a thermal `e ~ 2e de` distribution favouring higher eccentricities. A future revision could replace the uniform roll with a thermal-like 2D6-derived skew.
2. **Inclination.** Currently coplanar (2D). Real binaries have arbitrary inclination relative to the planetary plane. Adding inclination is cheap on the data side (one field), expensive on the renderer.
3. **Mass-dependent floor.** Should very low-mass companions (e.g. M dwarf orbiting an O star) have a tighter floor since their Hill influence is small? Currently no — we use the parent's heliopause regardless. This is conservative.
4. **Phase-2 P-type support.** A future spec could re-introduce close binaries by also generating an inner-barycenter planet pool. That would require a parallel positioning pipeline and is correctly deferred.
5. **Brown dwarf companions.** Do brown dwarf companions (M < 80 Jupiter masses, the L0+ regime) follow this rule, or do they collapse to "very large gas giant" treatment and re-enter INRAS? Current spec: brown dwarfs as companions are stars (use this spec); brown dwarfs as INRAS bodies are gas giants (use FR-042). This boundary is consistent with existing REF-002.

---

## 9. Migration

Existing saved systems have `companionStars[]` but no `rootOrbitNode`. On load:

- If `multiStarVersion` is missing or `'v1-flat'`: leave as-is. Do not retroactively build a v2 tree from legacy data — separations are too small and would fail the wide-only floor. Display "Legacy companion data" in the UI.
- New systems generated with `v2MultiStar = true`: get `rootOrbitNode` and `multiStarVersion = 'v2-tree'`.

No destructive migration. Both versions coexist indefinitely.
