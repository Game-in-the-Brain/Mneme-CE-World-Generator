# Chapter 3: Zone Architecture & Positioning

## Science Context

A star's radiation output determines where different types of worlds can form and survive. Too close to the star and atmospheres get stripped by solar wind and UV flux (infernal zone). Too far out and volatiles freeze solid (outer solar system). The habitable zone — the Goldilocks band where liquid water can exist on a rocky surface — is the narrowest and most interesting region. The Mneme system maps these physical zones onto a unified position roll so that every generated system has a physically plausible orbital architecture.

Version 2 introduces a major change: instead of rolling each world's position from a flat table, it uses a **4-phase placement algorithm** that respects disk-blocking, Hill-sphere conflicts, and Hot Jupiter stability.

---

## Zone Definitions

### Inner System (4 zones + frost line)

| Zone | Description | Boundary Formula |
|------|-------------|-----------------|
| Infernal | Mercury-like | 0 to √L☉ × 0.4 AU |
| Hot | Venus-like | √L☉ × 0.4 to 0.8 AU |
| Conservative | Earth-like | √L☉ × 0.8 to 1.2 AU |
| Cool | Mars-like | √L☉ × 1.2 to 4.85 AU |
| Frost Line | Water-ice stability boundary | √L☉ × 4.85 AU |

### Outer System (5 zones, O1–O5)

The outer system spans from the frost line to the **heliopause** (the point where the solar wind meets interstellar medium):

```
heliopause_AU = √L☉ × 120
outerSpan = heliopause_AU - frostLine_AU
```

| Zone | Width % of outerSpan | Description |
|------|---------------------|-------------|
| O1 | 3.125% | Just past frost line — Kuiper-belt density |
| O2 | 6.25% | |
| O3 | 12.5% | |
| O4 | 25% | |
| O5 | 50% | Out to heliopause — Oort-cloud sparseness |

**Example (G2 star, L☉ ≈ 1.01):**
- Frost line ≈ 4.87 AU, heliopause ≈ 120 AU, outer span ≈ 115 AU
- O1: 4.87–8.5 AU, O2: 8.5–15.7 AU, O3: 15.7–30 AU, O4: 30–59 AU, O5: 59–120 AU

---

## The Unified 3D6 Position Roll

Every Level 1 body (disk, dwarf, terrestrial, ice world, gas giant) rolls a **unified 3D6** to determine its zone.

### Step 1: Zone Roll

| 3D6 | Zone | Probability |
|-----|------|-------------|
| 3 | Infernal | 0.46% |
| 4–7 | Hot | 15.3% |
| 8–11 | Conservative | 43.5% |
| 12–13 | Cool | 16.2% |
| 14 | Frost Line transition | 9.7% |
| 15–18 | Outer (roll Step 2) | 14.8% |

### Step 2: Outer Zone Roll (if Step 1 rolled 15–18)

| Second 3D6 | Outer Zone | Probability |
|------------|------------|-------------|
| 3–9 | O1 | 50.0% |
| 10–11 | O2 | 16.7% |
| 12–13 | O3 | 16.7% |
| 14–17 | O4 | 14.8% |
| 18 | O5 | 0.46% |

Outer zones are weighted toward O1 (Kuiper-belt density) — the geometrically larger outer zones are physically sparser.

---

## 4-Phase Placement Algorithm

### Phase A — Anchors

1. **Largest Gas/Ice giant → frost line anchor.** Placed at the frost line with minor jitter:
   ```
   anchorDistance = frostLine_AU × (1 + (3D6 × 0.01 - 0.10))
   ```
   Typical roll (10): exactly at frost line. Min roll (3): 93% of frost line. Max roll (18): 108%.

2. **Largest Terrestrial → rolls unified 3D6 normally.** No special treatment, but this body establishes the inner-system anchor.

### Phase B — Disks

Disks are placed before non-anchor bodies. They register **zone occupancy** for the disk-blocking rule (Phase C). Disks do NOT conflict with each other or with anchor bodies.

### Phase C — Remaining Level 1 Bodies

In mass-descending order, each remaining body rolls the unified 3D6 for zone. Special rules:

- **Ice worlds** skip the unified roll — they roll directly on the Outer Zone table (Step 2). Ice worlds physically cannot exist in inner zones (the star strips volatiles).
- **Gas giants rolling into inner zones** trigger the Hot Jupiter stability check (§ below).
- **Terrestrials rolling into a disk-occupied zone** are blocked and must reroll.
- **Dwarfs rolling into a disk-occupied zone** proceed normally (they coexist by clearing local Hill-sphere gaps).

### Phase D — Moons (Level 2)

Moons are placed within their Parent INRAS's Hill sphere, with the Roche limit as the inner boundary. See the Moons spec (FR-044) for full details.

---

## Disk-Blocking Rule

A **disk** (circumstellar belt) occupies a zone. When subsequent bodies roll into that zone:

| Body Type | Blocked? | Reason |
|-----------|----------|--------|
| Terrestrial | Yes | A disk represents material that didn't form a planet. A terrestrial in that zone would have swept it up. |
| Dwarf | No | Small enough to orbit through the disk without sweeping it up |
| Gas/Ice Giant | Yes | Would have consumed the disk during formation |

Blocked bodies reroll the unified 3D6 (up to 5 attempts in the software; at the table, the referee may place them in the nearest unblocked zone).

---

## Hill Sphere Conflict Resolution

Once a zone is determined, compute the body's Hill sphere:

```
r_H = a × ∛(m_body / (3 × M_star))
```

Where `a` is the orbital distance (AU), `m_body` is mass in Earth masses, and `M_star` is the star's mass in Earth masses (1 M☉ = 333,000 EM).

Two bodies conflict if their Hill spheres overlap by more than 50%:

```
minSeparation = 4.0 × max(r_H_1, r_H_2)
```

If a newly-placed body's position is within `minSeparation` of any already-placed body, the zone is blocked and the body must reroll.

---

## Hot Jupiter Stability Roll (v2, replaces QA-011)

When a Class III, IV, or V gas giant rolls into the Infernal or Hot zone, it triggers a **Hot Jupiter migration check**. Instead of the old rule (hot Jupiters automatically clear their zone of all other bodies), v2 uses a stability roll:

- Roll 2D6. On 6+, the Hot Jupiter is **stable** at its migrated position.
- On 1–5, the Hot Jupiter is **unstable** — it would have migrated further inward or been ejected. Re-roll its position in the Cool or an Outer zone.

If stable, the Hot Jupiter occupies the zone alone (it cleared the inner system during migration). A small chance exists for a captured rogue world.

---

## World Position Table (for Pen and Paper)

Once the zone is known, determine the exact AU distance:

| Zone | Distance Formula |
|------|-----------------|
| Infernal | √L☉ × (0.067 × 1D6) |
| Hot | √L☉ × ((0.067 × 1D6) + 0.4) |
| Conservative | √L☉ × ((0.067 × 1D6) + 0.7) |
| Cold (Cool) | √L☉ × ((0.61 × 1D6) + 1.2) |
| Outer | √L☉ × ((1D6²) + 4.85) |

---

## Validation Targets

| Metric | Target | Basis |
|--------|--------|-------|
| Conservative mainworld share | 30–50% | Post-retune (was incorrectly 60–75% in v1) |
| Hot+Infernal mainworld share | ≤20% | M-dwarf systems plausibly produce hot rocky mainworlds |
| Mean planets per system | 6–8 | Kepler bias-corrected |
