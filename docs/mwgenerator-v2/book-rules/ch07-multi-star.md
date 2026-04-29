# Chapter 7: Multi-Star Hierarchy

## Science Context

About 44% of Sun-like stars have at least one companion star. Real multi-star systems follow strict hierarchical rules: binaries nest inside binaries, and the separation between each level must be wide enough for the system to be dynamically stable over geological time. Close binaries (a few AU apart) are common in the real universe but create unstable planetary environments — planets are either ejected or forced into exotic orbits.

The Mneme system makes a deliberate trade-off: **companions are wide-only**, placed at separations that guarantee their gravitational influence does not reach the planetary disk. This means every system's planets can be generated as if only one star exists (INRAS — Inward of the Nearest Remotely Adjacent Star), keeping the generation algorithm simple. The cost is that close binaries (Alpha Centauri AB, Sirius) and "Tatooine" circumbinary planets are excluded from v2.

---

## Key Physics: Holman-Wiegert S-Type Stability

A planet orbiting one member of a binary (S-type orbit) is stable if its orbital distance stays within:

```
S-type cap = 0.46 × a_binary × (1 - e)
```

Where `a_binary` is the separation between the two stars and `e` is the binary's eccentricity.

For the planet placement zone (inside the heliopause) to be completely safe from the companion's gravity:

```
a_binary ≥ heliopause / (0.46 × (1 - e_max))
```

With `e_max = 0.5`, this is `a_binary ≥ ~4.35 × heliopause`. The 3D3 × heliopause rule guarantees this holds.

---

## Step 1: Companion Existence

Same as Chapter 2. Roll 2D6 against the primary star's class:

| Class | Target (2D6 ≥) |
|-------|-----------------|
| O | 4+ |
| B | 5+ |
| A | 6+ |
| F | 7+ |
| G | 8+ |
| K | 9+ |
| M | 10+ |

A roll of 12 triggers an additional companion roll (chained).

---

## Step 2: The 3D3 × Heliopause Separation Rule (v2MultiStar)

Replaces the legacy REF-003 orbit table when `v2MultiStar` is enabled.

### Separation Roll

```
roll = 3D3                    (sum of three 3-sided dice; range 3–9, mean 6)
a_binary = roll × heliopause_AU × (1 + e)
```

Where:
- `heliopause_AU = √L☉ × 120`
- `e` (eccentricity) = 1D6 → 0.0 / 0.1 / 0.2 / 0.3 / 0.4 / 0.5

### Hard Floor

```
a_binary = max(roll, 3) × heliopause_AU × (1 + e)
```

This guarantees the S-type stability cone always clears the heliopause even on the lowest roll with the worst eccentricity.

### Typical Separations by Stellar Class

| Class | L☉ (typ.) | Heliopause | Separation Range | Real-World Analogue |
|-------|-----------|------------|------------------|---------------------|
| M | 0.04 | 24 AU | 72–216 AU | (wider than Proxima/Alpha Cen at ~13,000 AU) |
| K | 0.4 | 76 AU | 228–684 AU | |
| G | 1.0 | 120 AU | 360–1,080 AU | |
| F | 6 | 294 AU | 882–2,646 AU | |
| A | 25 | 600 AU | 1,800–5,400 AU | Sirius pair (8.6 AU — excluded) |
| B | 1,000 | 3,795 AU | 11,385–34,155 AU | |
| O | 30,000 | 20,785 AU | 62,355–187,065 AU | |

### What Is Excluded

- **Close binaries** (sub-AU and few-AU) — cannot be produced by this roll
- **Circumbinary (P-type) planets** — no close inner binary to orbit around
- **Per-star planetary subsystems** — companions generate no planets in v2

---

## Step 3: The Hierarchical Orbit Tree

Companion stars are organised into a recursive tree structure:

```
OrbitNode = StarLeaf | BinaryNode
```

A **StarLeaf** is a single star. A **BinaryNode** pairs two OrbitNodes (each of which can itself be a BinaryNode).

### Construction Algorithm

```
1. Convert primary star to StarLeaf. → rootNode
2. For each companion (innermost to outermost):
   a. Roll 3D3 for separation, 1D6 for eccentricity
   b. a_binary = max(roll, 3) × heliopause × (1 + e)
   c. Create BinaryNode { primary: rootNode, secondary: companion }
   d. rootNode = new BinaryNode
3. Return rootNode
```

### Example: Trinary System

```
G2V primary + K5V companion + M3V companion becomes:

BinaryNode (outer: a₂ = 924 AU, e = 0.1)
├── primary: BinaryNode (inner: a₁ = 720 AU, e = 0.2)
│   ├── primary: StarLeaf (G2V, 1.0 M☉)
│   └── secondary: StarLeaf (K5V, 0.7 M☉)
└── secondary: StarLeaf (M3V, 0.3 M☉)
```

---

## Step 4: Barycenter Math (The "Gear Ratio")

Each star in a binary orbits the shared centre of mass:

```
r_primary   = a_binary × m_secondary / (m_primary + m_secondary)
r_secondary = a_binary × m_primary   / (m_primary + m_secondary)
```

`r_primary + r_secondary` always equals `a_binary`. The more massive star has a shorter orbit radius — it wobbles less. For nested binaries, the inner pair acts as a point mass at its own barycenter.

### Worked Example

G2V (1.0 M☉) + K5V (0.7 M☉) at a = 720 AU, e = 0.2:

- Total mass = 1.7 M☉
- r_primary (G2V side) = 720 × 0.7 / 1.7 = **296 AU**
- r_secondary (K5V side) = 720 × 1.0 / 1.7 = **424 AU**
- S-type cap = 0.46 × 720 × 0.8 = **265 AU** ✓ (well outside 120 AU heliopause)

The G2V wobbles 296 AU around the barycenter. The K5V wobbles 424 AU. The distance between them averages 720 AU.

---

## Step 5: Kepler Period

```
P² = a³ / M_total
```

In solar units (AU, M☉, years). Period is cached on every BinaryNode.

**Worked example:** The G2V-K5V pair above: P = √(720³ / 1.7) ≈ **14,800 years**. One full orbit of the binary.

---

## Step 6: Hierarchical Stability Check

For nested binaries, the outer pair must satisfy:

```
a_outer ≥ 3 × a_inner
```

If violated, re-roll the outer separation (up to 10 attempts). With 10 attempts, the violation rate in practice is < 1.6%.

---

## Step 7: Orbital Phase and Rendering

The barycenter positions feed into the 2D map and the planned FRD-067 (FTL Barypoint Navigation) module. Each barycenter becomes a reference point for jump navigation.

---

## Validation Targets (1000-System Batch, 2026-04-27)

| Metric | Result | Notes |
|--------|--------|-------|
| S-type cap clears heliopause | 100% strict | Guaranteed by construction |
| G-class mean separation | ~700 AU | |
| Mean eccentricity | 0.234 | |
| Hierarchical violations | 4/243 (1.6%) | All resolved by re-roll within 10 attempts |
| Close binaries produced | 0 | By design — excluded from v2 |
