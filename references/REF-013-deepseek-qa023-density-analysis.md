# REF-013: DeepSeek Analysis Brief — QA-023 Density Table Design

**Project:** Mneme CE World Generator  
**Purpose:** Instructions for DeepSeek to perform the statistical/physics analysis required before QA-023 can be implemented.  
**Date:** 2026-04-14

---

## Your Task

Design two 2D6 density tables — one for **Dwarf worlds** and one for **Terrestrial worlds** — that will replace the current independent gravity-roll tables. You need to analyse whether the derived gravity values reproduce a **similar or identical habitability distribution** to the current system, and identify the best design approach.

This is a pure analysis task. You will not write any code. Output:
1. A complete 2D6 density table for Dwarf worlds
2. A complete 2D6 density table for Terrestrial worlds
3. A gravity-to-habitability threshold function for each type
4. Probability distributions under both the current tables and your new tables
5. A recommendation on Option A vs. Option B (see below)

---

## Context: The Current System

The generator currently rolls **2D6 twice** (independently) to determine main-world size and gravity. These rolls are **not physically connected** — a small world can roll high gravity, which is impossible in reality. QA-022 has a band-aid fix; QA-023 is the proper rewrite.

### Current 2D6 Gravity Tables (to be replaced)

**Dwarf world gravity table (`getDwarfGravity`):**

| 2D6 | Gravity (G) | Habitability |
|-----|------------|-------------|
| 2 | 0.001 | −2.5 |
| 3 | 0.020 | −2.0 |
| 4 | 0.040 | −1.5 |
| 5 | 0.060 | −1.0 |
| 6 | 0.080 | −0.5 |
| 7 | 0.100 | −0.5 |
| 8 | 0.120 | −0.5 |
| 9 | 0.140 | −0.5 |
| 10 | 0.160 | 0 |
| 11 | 0.180 | 0 |
| 12 | 0.200 | 0 |

**Terrestrial world gravity table (`getTerrestrialGravity`):**

| 2D6 | Gravity (G) | Habitability |
|-----|------------|-------------|
| 2 | 3.000 | −2.5 |
| 3 | 2.000 | −2.0 |
| 4 | 1.500 | −1.5 |
| 5 | 1.300 | −1.0 |
| 6 | 1.200 | −0.5 |
| 7 | 0.300 | −0.5 |
| 8 | 0.400 | −0.5 |
| 9 | 0.500 | −0.5 |
| 10 | 0.700 | 0 |
| 11 | 0.900 | 0 |
| 12 | 1.000 | 0 |

⚠️ Note: The terrestrial table is **non-monotonic** — roll 7 (median, most common) has the *lowest* gravity (0.3G), while rolls 2–6 (rare, "bad" outcomes) have high gravity. This is a known design flaw. Your new design should correct it.

---

## 2D6 Probability Distribution

Rolls 2–12 on 2D6 have the following probabilities:

| Roll | Ways | Probability |
|------|------|-------------|
| 2 | 1 | 2.78% |
| 3 | 2 | 5.56% |
| 4 | 3 | 8.33% |
| 5 | 4 | 11.11% |
| 6 | 5 | 13.89% |
| 7 | 6 | 16.67% |
| 8 | 5 | 13.89% |
| 9 | 4 | 11.11% |
| 10 | 3 | 8.33% |
| 11 | 2 | 5.56% |
| 12 | 1 | 2.78% |

**Current habitability distribution** (same for both current tables — both are single 2D6):

| Hab modifier | Rolls that produce it | Probability |
|-------------|----------------------|-------------|
| −2.5 | 2 | 2.78% |
| −2.0 | 3 | 5.56% |
| −1.5 | 4 | 8.33% |
| −1.0 | 5 | 11.11% |
| −0.5 | 6, 7, 8, 9 | 50.00% |
| 0 | 10, 11, 12 | 16.67% |
| **Negative total** | | **77.78%** |
| **Zero (optimal)** | | **16.67% (actually best achievable; 0 = no gravity penalty)** |

---

## The New System: Mass + Density → Physics

Instead of rolling gravity directly, the new system:
1. **Rolls mass** independently (2D6, using REF-004 tables — see below)
2. **Rolls density** from the new 2D6 density tables you will design
3. **Derives gravity** from mass + density via physics

### Mass Tables (already implemented in REF-004, DO NOT CHANGE)

**Dwarf worlds** — mass in Lunar Masses (LM):

| 2D6 | Mass (LM) | Mass (kg) |
|-----|----------|-----------|
| 2 | 0.1 | 7.342×10²¹ |
| 3 | 0.2 | 1.468×10²² |
| 4 | 0.3 | 2.203×10²² |
| 5 | 0.5 | 3.671×10²² |
| 6 | 0.7 | 5.139×10²² |
| 7 | 1.0 | 7.342×10²² |
| 8 | 1.5 | 1.101×10²³ |
| 9 | 2.0 | 1.468×10²³ |
| 10 | 3.0 | 2.203×10²³ |
| 11 | 5.0 | 3.671×10²³ |
| 12 | 7.0 | 5.139×10²³ |

**Terrestrial worlds** — mass in Earth Masses (EM):

| 2D6 | Mass (EM) | Mass (kg) |
|-----|----------|-----------|
| 2 | 0.1 | 5.972×10²³ |
| 3 | 0.2 | 1.194×10²⁴ |
| 4 | 0.3 | 1.792×10²⁴ |
| 5 | 0.5 | 2.986×10²⁴ |
| 6 | 0.7 | 4.180×10²⁴ |
| 7 | 1.0 | 5.972×10²⁴ |
| 8 | 1.5 | 8.958×10²⁴ |
| 9 | 2.0 | 1.194×10²⁵ |
| 10 | 3.0 | 1.792×10²⁵ |
| 11 | 5.0 | 2.986×10²⁵ |
| 12 | 7.0 | 4.180×10²⁵ |

---

## Physics Formula Chain

```
density_kg_m3 = density_gcm3 × 1000
mass_kg       = (see tables above)
volume_m3     = mass_kg / density_kg_m3
radius_m      = ∛(3 × volume_m3 / (4 × π))
gravity_ms2   = G × mass_kg / radius_m²
gravity_G     = gravity_ms2 / 9.81

where G = 6.674×10⁻¹¹ m³ kg⁻¹ s⁻²
```

---

## Density Ranges (physical constraints from REF-010)

| Body type | Min density (g/cm³) | Max density (g/cm³) | Notes |
|-----------|--------------------|--------------------|-------|
| Dwarf | 1.5 | 3.5 | Mixed composition — carbonaceous to silicaceous |
| Terrestrial | 4.0 | 6.5 | Rocky/silicate to iron-core compressed |

Your density table values must stay **within these ranges**.

---

## Pre-Computed Gravity Matrices (use these — do not recompute)

### Dwarf Gravity Matrix (surface gravity in G)

| Mass\Density | 1.5 | 2.0 | 2.5 | 3.0 | 3.5 |
|-------------|-----|-----|-----|-----|-----|
| 0.1 LM | 0.044 | 0.052 | 0.058 | 0.064 | 0.079 |
| 0.2 LM | 0.055 | 0.065 | 0.074 | 0.081 | 0.092 |
| 0.3 LM | 0.063 | 0.075 | 0.085 | 0.093 | 0.106 |
| 0.5 LM | 0.075 | 0.089 | 0.101 | 0.111 | 0.120 |
| 0.7 LM | 0.085 | 0.101 | 0.114 | 0.125 | 0.143 |
| 1.0 LM | 0.097 | 0.115 | 0.130 | 0.143 | 0.170 |
| 1.5 LM | 0.113 | 0.134 | 0.152 | 0.167 | 0.191 |
| 2.0 LM | 0.121 | 0.145 | 0.163 | 0.180 | 0.214 |
| 3.0 LM | 0.152 | 0.181 | 0.205 | 0.225 | 0.258 |
| 5.0 LM | 0.187 | 0.222 | 0.252 | 0.277 | 0.317 |
| 7.0 LM | 0.210 | 0.250 | 0.282 | 0.311 | 0.367 |

**Observation:** The full achievable range is ~0.044G–0.367G. The old table's 0.001G (roll 2) is physically impossible for a body in this mass range.

### Terrestrial Gravity Matrix (surface gravity in G)

| Mass\Density | 4.0 | 4.5 | 5.0 | 5.5 | 6.0 | 6.5 |
|-------------|-----|-----|-----|-----|-----|-----|
| 0.1 EM | 0.375 | 0.404 | 0.430 | 0.454 | 0.476 | 0.518 |
| 0.2 EM | 0.472 | 0.509 | 0.542 | 0.572 | 0.599 | 0.652 |
| 0.3 EM | 0.540 | 0.582 | 0.621 | 0.655 | 0.686 | 0.747 |
| 0.5 EM | 0.630 | 0.679 | 0.722 | 0.763 | 0.799 | 0.869 |
| 0.7 EM | 0.706 | 0.761 | 0.810 | 0.855 | 0.896 | 0.975 |
| 1.0 EM | 0.793 | 0.855 | 0.910 | 0.961 | 1.006 | 1.034 |
| 1.5 EM | 0.920 | 0.992 | 1.056 | 1.115 | 1.167 | 1.200 |
| 2.0 EM | 0.998 | 1.076 | 1.146 | 1.210 | 1.268 | 1.380 |
| 3.0 EM | 1.158 | 1.249 | 1.330 | 1.404 | 1.470 | 1.600 |
| 5.0 EM | 1.371 | 1.478 | 1.573 | 1.661 | 1.740 | 1.892 |
| 7.0 EM | 1.545 | 1.665 | 1.772 | 1.871 | 1.960 | 2.132 |

**Observation:** The full achievable range is ~0.375G–2.132G. The old table's 3.0G (roll 2) and 0.3G (roll 7) are outside or at the edge of this range.

---

## The Design Question: Two Options

### Option A — Density roll carries the hab modifier directly (preserves current distribution)

The density table bakes in a habitability value per roll, **independent of the resulting gravity**:

```
DwarfDensity(roll): { density: number, habitability: number }
// habitability is read from this table only — not recomputed from derived gravity
```

This preserves the current probability distribution exactly. A density roll of 2 always means hab −2.5, roll 7 means hab −0.5, etc.

**Problem:** Physically inconsistent. A roll-2 density world (small carbonaceous dwarf, low gravity) gets hab −2.5 despite its derived gravity being ~0.044–0.079G — which under Option B would be hab −1 or better. The player sees "0.044G, hab −2.5" and the numbers don't make sense.

### Option B — Habitability derived from the resulting gravity (physics-consistent)

After deriving gravity from mass + density, apply a **gravity-to-habitability lookup** function. The density table only specifies density values — no baked-in hab modifier.

```
DwarfDensity(roll): number  // density only
TerrestrialDensity(roll): number  // density only

// after physics derivation:
dwarfGravToHab(gravityG: number): number
terrestrialGravToHab(gravityG: number): number
```

**Problem:** With two independent 2D6 rolls (mass + density), the combined distribution is a convolution of two bell curves. This changes the probability distribution of habitability outcomes. You must determine whether the new distribution is acceptable game design.

---

## Analysis Tasks

### Task 1 — Verify the draft density tables

The current draft density tables in QA-023 are:

**Draft Dwarf density table:**

| Roll | Density (g/cm³) | Draft Hab |
|------|---------------|----------|
| 2 | 1.5 | −2.5 |
| 3 | 1.8 | −2.0 |
| 4 | 2.1 | −1.5 |
| 5 | 2.4 | −1.0 |
| 6 | 2.7 | −0.5 |
| 7 | 3.0 | −0.5 |
| 8 | 3.2 | −0.5 |
| 9 | 3.4 | −0.5 |
| 10 | 3.5 | 0 |
| 11 | 3.5 | 0 |
| 12 | 3.5 | 0 |

**Draft Terrestrial density table:**

| Roll | Density (g/cm³) | Draft Hab |
|------|---------------|----------|
| 2 | 6.5 | −2.5 |
| 3 | 5.5 | −2.0 |
| 4 | 5.0 | −1.5 |
| 5 | 4.8 | −1.0 |
| 6 | 4.5 | −0.5 |
| 7 | 4.0 | −0.5 |
| 8 | 4.2 | −0.5 |
| 9 | 4.4 | −0.5 |
| 10 | 4.6 | 0 |
| 11 | 4.8 | 0 |
| 12 | 5.0 | 0 |

For each row in the Dwarf table, using the pre-computed gravity matrices above:
- What is the **minimum, median (1.0 LM mass), and maximum** gravity that this density produces across the full mass range?
- Does the resulting gravity "make sense" for the assigned habitability band?
- Flag any rows where the derived gravity is inconsistent with the assigned hab modifier.

Repeat for the Terrestrial table.

---

### Task 2 — Option B gravity-to-habitability thresholds

Given the full gravity matrices above, design **gravity-to-habitability threshold tables** for each world type such that the **probability-weighted distribution** of habitability outcomes (across all 11×11 mass × density roll combinations) closest matches the current single-table distribution:

| Hab modifier | Target probability |
|-------------|------------------|
| −2.5 | 2.78% |
| −2.0 | 5.56% |
| −1.5 | 8.33% |
| −1.0 | 11.11% |
| −0.5 | 50.00% |
| 0 | 16.67% |

To compute this: for each of the 121 (mass roll, density roll) combinations, compute the gravity, map it to a hab band using your threshold function, and weight by P(mass roll) × P(density roll).

You may not be able to match the target exactly because the gravity range has changed (see Critical Findings above). State how close you can get, and where the biggest deviations are.

---

### Task 3 — Recommendation

Based on Tasks 1 and 2, recommend either:
- **Option A** (density roll sets hab modifier directly): better for game balance, simpler implementation
- **Option B** (gravity-derived habitability): better for physics consistency, requires new threshold function
- **Option A+ (hybrid)**: density roll sets hab modifier, but also display derived gravity for flavour

If recommending Option B, provide the complete gravity-to-hab threshold tables (in TypeScript switch/if format) ready for implementation.

If recommending Option A, evaluate whether the draft density tables need adjustment (e.g., should the three roll-10/11/12 entries for Dwarfs all use density 3.5, or should they be spread out?).

---

### Task 4 — Correct the non-monotonic terrestrial issue

The old terrestrial table had roll 7 (median) = 0.3G (lowest gravity), rolls 2–6 = high gravity, and rolls 8–12 = moderate-high gravity. This made the table non-monotonic in a confusing way.

For both Option A and Option B, the new terrestrial density table should be:
- **Monotonically ordered** by density (or by derived gravity) across the 2–12 roll range
- Roll 7 (most common, 16.67%) should correspond to **Earth-like conditions** (moderate density, ~1.0 EM mass → ~0.8–1.0G)
- Low density (rolls 8–12) should map to hab 0 (reasonable gravity for a rocky world)
- High density (rolls 2–4) should map to hab −1.5 or worse

Note that in the new system, "bad" gravity means too-HIGH gravity (from heavy/dense worlds), not too-low. Too-low gravity is a Dwarf world problem, not a Terrestrial world problem given the 4.0–6.5 g/cm³ density floor produces minimum gravity ~0.375G at 0.1 EM.

---

## Deliverables

Please provide:

1. **Dwarf density table** (2D6 roll → density value in g/cm³, with notes on derived gravity ranges and hab assignment)
2. **Terrestrial density table** (2D6 roll → density value in g/cm³, with notes on derived gravity ranges and hab assignment)
3. **Gravity-to-hab threshold function** for each world type (Option B) OR confirmation that Option A baked-in hab values are internally consistent
4. **Probability distribution table** comparing current habitability distribution vs. proposed new distribution
5. **Design recommendation**: Option A, Option B, or hybrid, with rationale
6. **Update document entry** for `260410-Changes.md` — see Task 5 below

Format density tables and threshold functions in TypeScript syntax ready to paste into `src/lib/worldData.ts`.

---

## Task 5 — Write the `260410-Changes.md` Entry

`260410-Changes.md` is the rules-deviation tracking document. It records every place where the implementation intentionally departs from the original Cepheus Engine book rules. Every QA fix that changes book mechanics gets a numbered section in this document.

The document follows a strict format. Here is a representative example (Section 11.2) for reference:

```markdown
### 11.2 Source of Power / Culture Conflict Filter (QA-021)

**Problem:** Source of Power and Culture traits were rolled independently, producing self-contradictory world descriptions.

**Current Implementation:**
The following Source of Power values exclude specific culture traits: [table]

### Recommendation for 2026 Book
Add Section 7.10.1: Culture Trait Rerolls and Power/Culture Conflicts.
```

The Summary Table at the bottom of `260410-Changes.md` also needs a new row for this change. Current last rows in the table are:

```
| Culture opposing pairs | Mentioned but not listed | Explicit 32-pair table | Add Section 7.10.1 |
| Power/Culture conflicts | Not included | Exclusion table by Source of Power | Add Section 7.10.1 |
```

Your entry (Deliverable 6) must include:

**A. A new section** to be inserted before the Summary Table. Number it **Section 12: Density-Derived Gravity for Main Worlds (QA-023)**. It must follow this format:

```markdown
## 12. Density-Derived Gravity for Main Worlds (QA-023)

### Original Book Rules
[describe what the book says about main world size and gravity — two independent 2D6 rolls, size in km, gravity from a lookup table]

### Current Implementation (QA-023)
[describe the new mass + density pipeline in plain English — mass rolled from REF-004 tables, density rolled from new 2D6 tables, gravity derived from physics formula]

Include:
- The final density tables you designed (Dwarf and Terrestrial)
- The gravity-to-hab function (if Option B) or note that Option A preserves hab directly
- Sample derivation: [median mass + median density → derived gravity example]

### Rationale
[explain why independent gravity rolls are physically impossible and the new system fixes it, referencing QA-022 and the example of a 342 km body at 0.18G]

### Recommendation for 2026 Book
[what section of the book should be updated, and what to add — e.g., replace §6.1 size tables with mass tables, replace §6.3 gravity tables with density tables + physics formula]
```

**B. Two new rows** to append to the Summary Table in `260410-Changes.md`:

| Feature | Book | Implementation | 2026 Recommendation |
|---------|------|----------------|---------------------|
| Main world size | Random km (2D6) | Mass in LM/EM from REF-004 | Replace §6.1 size tables with mass tables |
| Main world gravity | Independent 2D6 lookup | Derived from mass + density physics | Replace §6.3 gravity tables with density + formula |

Adjust column values based on your final recommendation (Option A/B). The Summary Table entry should match the section body.

Output the complete Section 12 block and two Summary Table rows as a separate block in your response, clearly labelled "**Update Document Entry**", ready to paste into `260410-Changes.md`.

---

## Reference Calibration Check

Use these known values to verify your physics calculations before starting:

| Body | Mass | Density | Expected gravity |
|------|------|---------|-----------------|
| Earth | 1.0 EM | 5.515 g/cm³ | 1.000G |
| Moon | 0.0123 EM (1 LM) | 3.346 g/cm³ | 0.166G |
| Mars | 0.107 EM | 3.933 g/cm³ | 0.379G |
| Mercury | 0.055 EM | 5.427 g/cm³ | 0.378G |

If your formula produces values close to these, it is correct.

---

## Files for Reference (do not modify)

- `src/lib/worldData.ts` — current gravity tables (`getDwarfGravity`, `getTerrestrialGravity`)
- `src/lib/physicalProperties.ts` — physics formula implementation (`calculatePhysicalProperties`)
- `references/REF-004-world-type-tables.md` — mass tables
- `references/REF-010-planet-densities.md` — density ranges source
- `QA.md` §QA-023 — full implementation spec and migration plan
