<div align="right"><a href="https://github.com/Game-in-the-Brain"><img src="./references/gitb_gi7b_logo_512.png" alt="Game in the Brain" width="64"/></a></div>

# Mneme CE World Generator — Function Requirements Document (FRD)

**Version 2.6** | **Date:** 2026-04-17  
**Project:** Mneme CE World Generator PWA (Cepheus Engine variant)  
**GitHub Repository:** [github.com/Game-in-the-Brain/Mneme-CE-World-Generator](https://github.com/Game-in-the-Brain/Mneme-CE-World-Generator)  
**Book Series:** [DriveThruRPG — Game in the Brain](https://www.drivethrurpg.com/en/publisher/17858/game-in-the-brain)

> ⚠️ **Known Issues:** See [QA.md](./QA.md) for the full list of open bugs and feature gaps.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Decisions](#2-design-decisions)
3. [Visual Design Specification](#3-visual-design-specification)
4. [Core Dice Engine](#4-core-dice-engine)
5. [Star Generation Module](#5-star-generation-module)
6. [Main World Generation Module](#6-main-world-generation-module)
7. [Inhabitant Generation Module](#7-inhabitant-generation-module)
8. [Planetary System Generation Module](#8-planetary-system-generation-module)
   - 8.6 Orbital Placement — Hill Sphere Spacing
9. [Data Model](#9-data-model)
10. [UI Components](#10-ui-components)
11. [Data Management](#11-data-management)
12. [PWA Features](#12-pwa-features)
13. [Milestone Plan](#13-milestone-plan)
14. [Planned Extensions](#14-planned-extensions)
    - 14.1 FR-040 Intrastellar Population Distribution
    - 14.2 FR-041 Composition–Atmosphere–Biosphere Pipeline Redesign
    - 14.3 FR-042 Positioning System Redesign
    - 14.4 FR-043 Habitability Application & Mainworld Selection
    - 14.5 FR-044 Moons & Parent-Child Limit
    - 14.6 FR-045 Sector Generation Mode (3D Star Map Integration)
15. [Reference Documents](#15-reference-documents)

---

## 1. Executive Summary

The MNEME World Generator PWA is a Progressive Web App that replicates and enhances the Google Sheets-based world generation system for the Mneme variant of the Cepheus Engine RPG. It generates complete solar systems including stars, worlds, inhabitants, and planetary bodies using dice-based procedural generation.

---

## 2. Design Decisions

| # | Decision | Status |
|---|----------|--------|
| 1 | Culture Table (D66 × D6) included | ✅ YES |
| 2 | Travel Zone determination (Amber/Red) | ✅ YES |
| 3 | Starport base generation (Naval/Scout/Pirate) | ✅ YES |
| 4 | Visual Theme | ✅ Dark sci-fi with red accent (Cepheus/Traveller), toggle to day theme |
| 5 | Dice Animation | ❌ NO - rolls displayed clearly but not animated |
| 6 | Phone theme (vertical single-column layout) | ✅ YES — see [QA-005](./QA.md#qa-005) |
| 7 | Single-page layout with tab anchors (not multi-page routes) | ✅ YES — see [QA-010](./QA.md#qa-010) |
| 8 | Logo in top-right linking to GitHub | ✅ YES — see [QA-002](./QA.md#qa-002) |

---

## 3. Visual Design Specification

### 3.1 Color Palette (Default/Dark Theme)

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep Space Black | `#0a0a0f` |
| Card Background | Panel Gray | `#141419` |
| Primary Accent | Traveller Red | `#e53935` |
| Secondary Accent | Star White | `#f5f5f5` |
| Text Primary | Off White | `#e0e0e0` |
| Text Secondary | Dim Gray | `#9e9e9e` |
| Success | Habitable Green | `#4caf50` |
| Warning | Amber Zone | `#ff9800` |
| Danger | Red Zone | `#f44336` |
| Star O | Blue White | `#a8d8ff` |
| Star B | Blue | `#6bb6ff` |
| Star A | White | `#ffffff` |
| Star F | Yellow White | `#fff8e1` |
| Star G | Yellow | `#ffecb3` |
| Star K | Orange | `#ffcc80` |
| Star M | Red | `#ff8a65` |

### 3.3 Phone Theme

A third theme optimised for narrow portrait screens.

| Behaviour | Rule |
|-----------|------|
| Layout | Single column, full width |
| Cards | Stack vertically, no side-by-side panels |
| Touch targets | Minimum 44px height for all interactive elements |
| Hidden elements | Collapse non-essential sidebars and decorative zone diagrams |
| Font size | Base 16px (no smaller) |
| Tab bar | Fixed to bottom of screen |

**Theme key:** `"phone"` — stored in localStorage alongside `"dark"` / `"day"`.

> ✅ **QA-005:** Phone theme implemented. [See QA-005](./QA.md#qa-005)

---

### 3.4 Theme Toggle UI

To conserve header space, the Dark/Day theme buttons occupy the same position (toggle), with Phone as a separate button.

| State | Icon | Click Action |
|-------|------|--------------|
| Dark mode | ☾ Moon | Switch to Day |
| Day mode | ☀ Sun | Switch to Dark |
| Phone mode | ▢ Smartphone | Return to previous desktop theme |

**Behaviour:**
- Only two buttons visible at any time (Day/Dark toggle + Phone)
- Phone button highlighted red when active
- Previous desktop theme remembered when switching to/from Phone

> ✅ **QA-013:** Compact theme toggle implemented. [See QA-013](./QA.md#qa-013)

---

### 3.2 Day Theme Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Light Gray | `#f5f5f5` |
| Card Background | White | `#ffffff` |
| Primary Accent | Traveller Red | `#c62828` |
| Text Primary | Dark Gray | `#212121` |

---

## 4. Core Dice Engine

### 4.1 Basic Rolls

| Function | Signature | Description |
|----------|-----------|-------------|
| `rollD6()` | `() => number` | Returns 1-6 |
| `rollD66()` | `() => number` | Returns 11-66 (two D6s as digits) |
| `rollXD6(x)` | `(count: number) => number[]` | Returns array of X D6 rolls |

### 4.2 Advanced Rolls

| Function | Signature | Description |
|----------|-----------|-------------|
| `rollKeep()` | `(diceRolls, diceType, keepSize, keepType, modifier) => number` | Roll N dice, keep M highest/lowest |
| `rollExploding()` | `(diceRolls, diceType, multiplier, modifier) => number` | Exploding dice (reroll on max) |

### 4.3 Dice Notation Mapping

| Notation | Implementation |
|----------|----------------|
| `2D6` | `rollKeep(2, 6, 2, 1, 0)` |
| `2D6 Adv+1` | `rollKeep(3, 6, 2, 1, 0)` |
| `2D6 Adv+2` | `rollKeep(4, 6, 2, 1, 0)` |
| `2D6 Dis+1` | `rollKeep(3, 6, 2, 0, 0)` |
| `2D6 Dis+2` | `rollKeep(4, 6, 2, 0, 0)` |
| `5D6` | `rollKeep(5, 6, 5, 1, 0)` |
| `3D6` | `rollKeep(3, 6, 3, 1, 0)` |
| `2D3` | `rollKeep(2, 3, 2, 1, 0)` |
| `1D6 reroll 6` | Roll until result ≠ 6 |

### 4.4 Roll Display (Non-Animated)

All rolls must be clearly displayed in the UI:
- Show the dice notation used
- Show individual die results
- Show final calculated value
- Show any modifiers applied

---

## 5. Star Generation Module

### 5.1 Primary Star Generation

| Function | Input | Output | Table |
|----------|-------|--------|-------|
| `generatePrimaryStar()` | None | `{ class, grade, mass, luminosity }` | [REF-001: Stellar Tables](./references/REF-001-stellar-tables.md) |

#### Stellar Classification Visual Reference

The seven stellar classes span from rare, extremely hot blue-white giants down to the ubiquitous cool red dwarfs. The icon for each class is shown below — colour and shape encode the spectral class at a glance.

| Class | Icon | Colour | Temp (K) | Typical Luminosity | Habitability Notes |
|-------|------|--------|----------|--------------------|--------------------|
| O | ![O](./references/Class-O-star.png) | Pale violet / blue-white | > 30,000 | 10⁵ – 10⁶ L☉ | Intense UV — disks only; no stable habitable zone |
| B | ![B](./references/Class-B-star.png) | Light blue | 10,000 – 30,000 | 10² – 10⁵ L☉ | Very short-lived; disks only |
| A | ![A](./references/Class-A-star.png) | Blue-white / white | 7,500 – 10,000 | 5 – 100 L☉ | Disks only; short stellar lifetime |
| F | ![F](./references/Class-F-star.png) | Yellow-white | 6,000 – 7,500 | 1.5 – 5 L☉ | Habitable zone possible; Adv+2 on planet count |
| G | ![G](./references/Class-G-star.png) | Yellow (Sun-like) | 5,200 – 6,000 | 0.6 – 1.5 L☉ | Optimal for life; baseline (no modifier) |
| K | ![K](./references/Class-K-star.png) | Yellow-orange | 3,700 – 5,200 | 0.1 – 0.6 L☉ | Tidally locked worlds possible; Dis+2 on planet count |
| M | ![M](./references/Class-M-star.png) | Orange-red | < 3,700 | < 0.1 L☉ | Common; narrow habitable zone; Dis+4 on planet count |

> **UI:** The full spectrum strip (all 7 classes left-to-right, O → M) is displayed as a persistent reference row on the Star section. The primary star's class is highlighted. Individual class images are at `public/references/Class-[X]-star.png`.
>
> ✅ **QA-003:** Star classification images surfaced in UI. [See QA-003](./QA.md#qa-003)

### 5.2 Zone Calculation

| Function | Formula |
|----------|---------|
| `calculateZones(luminosity)` | Returns zone boundaries |

**Zone Boundaries (based on √L☉):**

| Zone | Formula |
|------|---------|
| Infernal | 0 to <(√L☉ × 0.4) |
| Hot | (√L☉ × 0.4) to <(√L☉ × 0.8) |
| Conservative Habitable | (√L☉ × 0.8) to <(√L☉ × 1.2) |
| Cold (= Optimistic Habitable) | (√L☉ × 1.2) to <(√L☉ × 4.85) |
| Outer Solar System | ≥(√L☉ × 4.85) |

### 5.3 Companion Star Generation

See [REF-002: Companion Star Logic](./references/REF-002-companion-star.md) for detailed implementation.

#### Step 1: Existence Check

Roll 2D6 vs target based on **previous star's** class (chain rule):

| Previous Class | Target |
|----------------|--------|
| O | 4+ |
| B | 5+ |
| A | 6+ |
| F | 7+ |
| G | 8+ |
| K | 9+ |
| M | 10+ |

- Roll ≥ target: Companion exists
- Roll = 12: Companion exists AND attempt an additional companion roll (vs this companion's class, not the primary)

#### Step 2: Roll Class and Grade

- Roll 5D6 for class (same table as primary)
- Roll 5D6 for grade (same table as primary)

#### Step 3: Apply Constraints (No Loops)

**Class Constraint:**
- Class rank: O=7, B=6, A=5, F=4, G=3, K=2, M=1
- If rolled rank > previous rank:
  ```
  scaledRank = round(rolledRank × (previousRank / 7))
  constrainedClass = rankToClass(scaledRank)
  ```

**Grade Constraint:**
- Grade 0 = most luminous, Grade 9 = least luminous
- If rolled grade < previous grade (too luminous):
  ```
  scaledGrade = round(rolledGrade × (previousGrade / 9))
  constrainedGrade = clamp(scaledGrade, previousGrade, 9)
  ```

#### Step 4: Chain Rule

Each companion rolls against the **previous star** in the chain:
- Companion 1 rolls vs Primary
- Companion 2 rolls vs Companion 1
- Companion 3 rolls vs Companion 2
- etc.

### 5.4 Companion Orbit

| Function | Input | Output |
|----------|-------|--------|
| `calculateCompanionOrbit(previousClass, roll)` | Class, 3D6 | Distance in AU |

See [REF-003: Orbit Table](./references/REF-003-orbit-table.md) for full table.

> **Roll-18 recursion rule:** If the re-roll also yields 18, multiply again (×100 total). Cap at 2 re-rolls — a third consecutive 18 is treated as 17.

---

## 6. Main World Generation Module

### 6.1 World Type & Size

| Function | Input | Output | Roll |
|----------|-------|--------|------|
| `generateWorldType(stellarClass)` | Stellar class | Type (Habitat/Dwarf/Terrestrial) + Size | Varies by class |

**World Type Roll by Stellar Class:**

| Class | Roll |
|-------|------|
| F | 4D6 keep 2 (Adv+2) |
| G | 3D6 keep 2 (Adv+1) |
| O, B, A, K, M | 2D6 |

See [REF-004: World Type & Size Tables](./references/REF-004-world-type-tables.md) for full tables.

> **QA-023:** World "size" is now expressed as **mass** (Lunar Masses for Dwarfs, Earth Masses for Terrestrials, MVT/GVT for Habitats) rather than diameter. Gravity is derived from mass + density via physics formulas (see §6.3).

**Habitat Size Calculation (QA-017):**

Habitats are artificial megastructures sized based on the largest planetary body mass in the system:

```
Habitat Radius (km) = (largestBodyMass ^ 0.33) × 6371 km × randomFactor
```

Where:
- `largestBodyMass` = Mass of largest non-star body in system (in Earth Masses)
- `6371 km` = Earth's radius
- `randomFactor` = 0.8 to 1.2 (±20% variation)

This ensures habitats are appropriately scaled to the largest available mass in their system — whether built around a planet, moon, or constructed from asteroids.

> ✅ **QA-017:** Habitats sized by largest body mass in system. [See QA-017](./QA.md#qa-017)

### 6.2 Lesser Earth Type (Dwarf Worlds)

| Function | Roll | Output |
|----------|------|--------|
| `generateLesserEarthType()` | 2D6 | Type + Position Modifier |

| 2D6 | Type | Position Modifier |
|-----|------|-------------------|
| 2-7 | Carbonaceous | +1 |
| 8-10 | Silicaceous | +0 |
| 11 | Metallic | -1 |
| 12 | Other | +0 |

### 6.3 Density & Gravity

| Function | Input | Output |
|----------|-------|--------|
| `generateDensity(worldType, roll)` | Type, 2D6 | Density in g/cm³ |
| `calculateGravity(massEM, densityGcm3)` | Mass (EM), Density | Gravity in G, radius, escape velocity |
| `gravityToHabitability(worldType, gravityG)` | Type, Gravity | Habitability modifier |

**Density Tables (QA-023):**

| 2D6 | Dwarf Density (g/cm³) | Terrestrial Density (g/cm³) |
|-----|----------------------|----------------------------|
| 2 | 1.5 | 6.5 |
| 3 | 1.8 | 6.0 |
| 4 | 2.1 | 5.7 |
| 5 | 2.4 | 5.4 |
| 6 | 2.7 | 5.1 |
| 7 | 3.0 | 5.0 |
| 8 | 3.2 | 4.8 |
| 9 | 3.4 | 4.6 |
| 10 | 3.5 | 4.4 |
| 11 | 3.5 | 4.2 |
| 12 | 3.5 | 4.0 |

**Physics Formulas:**
```
Radius (km) = ∛(massEM × 5.972e24 kg / (4/3 × π × densityGcm3 × 1000 kg/m³))
Surface Gravity (G) = (G × massEM × 5.972e24 kg) / (radius × 1000 m)² / 9.81 m/s²
Escape Velocity (km/s) = √(2 × G × massEM × 5.972e24 kg / (radius × 1000 m)) / 1000
```

**Gravity-to-Habitability Threshold Functions:**

*Dwarf Worlds:*
- < 0.06 G → -2.5
- < 0.08 G → -2.0
- < 0.10 G → -1.5
- < 0.12 G → -1.0
- < 0.16 G → -0.5
- ≥ 0.16 G → 0

*Terrestrial Worlds:*
- > 1.8 G → -2.5
- > 1.4 G → -2.0
- > 1.2 G → -1.5
- > 1.0 G → -1.0
- < 0.5 G → -0.5
- < 0.7 G → -0.5
- 0.7–1.0 G → 0

**Critical Fixes (QA-023):**
- **Non-monotonic table corrected:** Roll 7 = Earth-like density (5.0 g/cm³ → ~0.91G), not absurd 0.3G
- **Physical extremes eliminated:** 0.001G dwarf and 3.0G terrestrial are impossible
- **Solar system accuracy:** Matches Moon (0.143G vs 0.166G), Mars (0.375G vs 0.379G), Earth (0.91G vs 1.00G)
- **Probability shift:** hab 0 worlds increase from 16.7% to ~25.5% (acceptable for physical consistency)

> **QA-023:** Gravity derived from mass + density physics pipeline. [See QA-023](./QA.md#qa-023)

### 6.4 Atmosphere

| Function | Roll | Output | Habitability |
|----------|------|--------|--------------|
| `generateAtmosphere()` | 2D6 | Type | Modifier |

| Modified 2D6 | Atmosphere | Habitability |
|--------------|------------|--------------|
| ≤1 | Crushing (TL9) | -2.5 |
| 2-5 | Dense (TL8) | -2 |
| 6-8 | Trace (TL8) | -1.5 |
| 9-11 | Thin (TL7) | -1 |
| ≥12 | Average (TL0) | 0 |

> **Note:** The ≤1 and ≥12 rows are only reachable when a modifier is applied to the base 2D6 roll. Document modifiers here when defined.

### 6.5 Temperature

| Function | Input | Roll | Output |
|----------|-------|------|--------|
| `generateTemperature(atmosphere, roll)` | Atmosphere type, 2D6 | Varies by atmosphere | Temp + habitability |

**Temperature Modifiers:**

| Atmosphere | Modifier |
|------------|----------|
| Dense | +1 to roll |
| Crushing | +2 to roll |
| Thin | -1 to roll |
| Trace | -2 to roll |

| Modified 2D6 | Temperature | Habitability |
|--------------|-------------|--------------|
| ≤2 | Inferno (TL8) | -2 |
| 3-6 | Hot (TL7) | -1.5 |
| 7-10 | Freezing (TL7) | -1 |
| 11 | Cold (TL6) | -0.5 |
| ≥12 | Average (TL0) | 0 |

**Note:** Modified results ≤2 and ≥12 are only reachable via atmosphere modifiers.

### 6.6 Hazard

| Function | Roll | Output | Habitability |
|----------|------|--------|--------------|
| `generateHazard()` | 2D6 | Type | Modifier |

| 2D6 | Hazard | Habitability |
|-----|--------|--------------|
| <2 | Radioactive | -1.5 |
| 3-4 | Toxic | -1.5 |
| 5-6 | Biohazard | -1 |
| 7 | Corrosive | -1 |
| 8-9 | Polluted | -0.5 |
| >10 | None | 0 |

### 6.7 Hazard Intensity

| Function | Roll | Output | Habitability |
|----------|------|--------|--------------|
| `generateHazardIntensity()` | 2D6 | Intensity | Modifier |

| 2D6 | Intensity | Habitability |
|-----|-----------|--------------|
| 2-3 | Intense (TL9) | -2 |
| 4-6 | High (TL8) | -1.5 |
| 7-8 | Serious (TL7) | -1 |
| 9-10 | Mild (TL6) | -0.5 |
| 11-12 | Very Mild (TL11) | 0 |

### 6.8 Biochemical Resources

| Function | Roll | Output | Habitability |
|----------|------|--------|--------------|
| `generateBiochemicalResources()` | 2D6 | Level | Modifier |

| 2D6 | Resources | Habitability |
|-----|-----------|--------------|
| 2 | Scarce (TL8) | -5 |
| 3-4 | Rare (TL7) | -4 |
| 5-7 | Uncommon (TL4) | -3 |
| 8-11 | Abundant | 0 |
| 12 | Inexhaustible | +5 |

### 6.9 Total Habitability Calculation

| Function | Inputs | Output |
|----------|--------|--------|
| `calculateTotalHabitability()` | Mass, Atmosphere, Temperature, Hazard, Intensity, Bio, TL | Final score |

**Habitability Components:**
- Gravity modifier (derived from calculated gravity via threshold functions in §6.3 — uses mass + density physics)
- Atmosphere modifier
- Temperature modifier
- Hazard type modifier
- Hazard intensity modifier
- Biochemical resources modifier
- Tech Level modifier (TL 7-16 → TLMod = TL − 7, range +0 to +9)

> **Note:** The displayed habitability score (EnvHab + TL−7) is used for world descriptors only. Population uses a **separate TLmod productivity table** (see Section 7.2). Starport uses **GDP-based PSS with TL capability cap** (see Section 7.8) — neither population nor starport uses the displayed TL−7 modifier directly.

### 6.10 Main World Position

| Function | Inputs | Output |
|----------|--------|--------|
| `determineMainWorldPosition(atmosphere, temperature, luminosity)` | Atmo, Temp, L☉ | Zone + AU distance |

See [REF-005: World Position Table](./references/REF-005-world-position-table.md) for the complete 25-combination lookup table.

**AU Distance Formulas:**

| Zone | Formula |
|------|---------|
| Infernal | √L☉ × (0.067 × 1D6) |
| Hot | √L☉ × ((0.067 × 1D6) + 0.4) |
| Conservative Habitable | √L☉ × ((0.067 × 1D6) + 0.7) |
| Optimistic Habitable (= Cold) | √L☉ × ((0.61 × 1D6) + 1.2) |
| Outer Solar System | √L☉ × ((1D6)² + 4.85) × multiplier |

**Outer Solar System Multiplier Rule:**
- Roll 1D6, square it, add 4.85
- If roll = 6: multiply total distance by 6 and re-roll, repeating for each consecutive 6
- Cap: stop multiplying once cumulative multiplier ≥ 64 (i.e. max ×216 if three 6s land in a row); a further 6 after that is treated as a non-6 result

---

## 7. Inhabitant Generation Module

### 7.1 Tech Level

| Function | Roll | Output |
|----------|------|--------|
| `generateTechLevel()` | 2D6 | MTL 9–18 |

See [REF-013: Technology Level Reference](./references/REF-013-tech-level.md) for the full TL table with Cepheus Engine TL cross-reference, CE/HE years, era names, key technologies, and glossary terms.

#### Quick Reference (2D6 → MTL)

| 2D6 | MTL | CE TL | Era Name | CE Year Range |
|-----|-----|-------|----------|---------------|
| 2 | 9 | 7.0 | New Space Race / Space Industrialisation | 2050–2100 CE |
| 3 | 10 | 8.0 | Cis-Lunar Development | 2100–2200 CE |
| 4 | 11 | 8.5 | Interplanetary Settlement & Jovian Colonisation | 2200–2300 CE |
| 5 | 12 | 9.0 | Post-Earth Dependence | 2300–2400 CE |
| 6–7 | 13 | 9.5 | Outer System Development | 2400–2500 CE |
| 8 | 14 | 10.0 | Early Interstellar Trade & Exploration | 2500–2600 CE |
| 9 | 15 | 10.5 | Interstellar Colonisation | 2600–2700 CE |
| 10 | 16 | 11.0 | Self-Sufficient Megastructures & Swarms | 2700+ CE |
| 11 | 17 | 11.5 | Post-Megastructure Expansion | 2800+ CE |
| 12 | 18 | 12.0 | Unknown Future | 2900+ CE |

**UI Note:** The Inhabitants tab should display MTL, CE TL, era name, and a collapsible "Key Technologies" panel for each generated world. See REF-013 for the full key technologies text per level.

### 7.2 Population

| Function | Inputs | Output |
|----------|--------|--------|
| `generateInhabitants(envHab, techLevel, preset, ...)` | EnvHab (without TL), Tech Level, TLProductivityPreset | Population number |

**Formula (QA-061 — productivity-ratio model):**
```
productivityMultiplier = getSoc7MonthlyIncome(TL, preset)
                       / getSoc7MonthlyIncome(preset.baseTL, preset)

Natural world (envHab > 0):
  maxPop     = 10^(envHab + 1) × productivityMultiplier × rollExploding(2,6)
  population = max(10, floor(roll3D6 × maxPop × 0.05))

Hostile world (envHab ≤ 0):
  population = max(10, floor(habitatResult.population × productivityMultiplier))
  (use MVT/GVT table for habitat type — see 7.2.1)
```

- **EnvHab** = Gravity + Atmosphere + Temperature + Hazard + Hazard Intensity + Biochemical Resources (without TL modifier)
- **productivityMultiplier** scales with TL only for presets with compounding growth curves
  - **CE/Traveller preset:** multiplier = 1.0 at every TL — populations depend purely on EnvHab
  - **Mneme preset:** multiplier follows the compounding income curve (1× at TL 7 → ~389 000× at TL 16)
- The `+1` in the exponent shifts the base population scale to playable Traveller levels for CE worlds

> **`TL_POP_MOD` table deleted (QA-061):** The old lookup table (TL7→+5 … TL16→+13) was Mneme-only and caused CE/Traveller worlds to generate trillion-person populations. It has been removed.

> **Starport note:** Population and starport use **different scaling paths**. Population uses the preset productivity ratio (carrying capacity). Starport uses `getGdpPerDayForWorld(TL, dev, wealth, preset)` with TL capability cap — wealth/development affect per-capita income, not just a multiplier. See Section 7.8.

#### 7.2.1 MVT/GVT Table (Hab ≤ 0)

If `effectiveHab = max(0, EnvHab + TLmod)` resolves to 0 (i.e. the raw sum is ≤ 0), use the MVT/GVT habitat table instead of the standard formula:

| Roll | Habitat Type | Population Range |
|------|-------------|------------------|
| 2 | Frontier Outpost | 10–100 |
| 3–4 | Research Station | 100–1,000 |
| 5–6 | Mining Habitat | 1,000–10,000 |
| 7–8 | Industrial Habitat | 10,000–100,000 |
| 9–10 | Colonial Habitat | 100,000–1,000,000 |
| 11 | City Habitat | 1,000,000–10,000,000 |
| 12 | Megastructure | 10,000,000–100,000,000 |

#### 7.2.2 Low Population Terminology & Depression Penalty (QA-025/QA-026)

When a world's population is critically low, it struggles to maintain its technological base and economic complexity.

**1. Terminology Overrides (<1,000,000 population):**
- Text descriptions for Wealth and Development replace large-scale systemic terms with communal terms.
- "Economy" becomes "fiscal condition" or "framework".
- "Middle class" becomes "specialist groups" or "core communal groups".
- "Consumer goods" becomes "vital supplies".

**2. Depression Penalty (Effective TL):**
Worlds with critically low populations suffer a temporary penalty to their functional Tech Level. This penalty models the loss of complex supply chains and industrial capacity.
* Base Penalty:
  * Population < 1,000,000: **-1 TL**
  * Population < 100,000: **-2 TL**
  * Population < 10,000: **-3 TL**
* Development Penalty: If Development is *UnderDeveloped* or *Developing*, apply an additional **-1 TL** penalty.
* **Effective TL = max(0, Base TL − Total Penalty)**
* TL10 is the minimum baseline for surviving low habitability. If the effective TL drops below the survival threshold, the colony enters a state of collapse.

The `effectiveTL` replaces the base TL in Starport generation (crashing the local economy and PSS) and triggers Travel Zone overrides (see 7.8 and 7.9).

### 7.3 Wealth

| Function | Inputs | Output |
|----------|--------|--------|
| `generateWealth(roll, resources)` | 2D6, bio resources | Wealth level |

| 2D6 | Wealth | SOC Bonus |
|-----|--------|-----------|
| 2-8 | Average | +0 |
| 9-10 | Better-off | +1 |
| 11 | Prosperous | +2 |
| 12 | Affluent | +3 |

**Modifiers:**
- Abundant resources: Adv+1
- Inexhaustible resources: Adv+2

### 7.4 Power Structure

| Function | Roll | Output |
|----------|------|--------|
| `generatePowerStructure()` | 2D6 | Structure |

| 2D6 | Power Structure |
|-----|-----------------|
| ≤7 | Anarchy |
| 8-9 | Confederation |
| 10-11 | Federation |
| ≥12 | Unitary State |

### 7.5 Development

| Function | Roll | Output |
|----------|------|--------|
| `generateDevelopment()` | 2D6 | Development level |

| 2D6 | Development | HDI | Ave SOC |
|-----|-------------|-----|---------|
| 2 | UnderDeveloped | 0.0-0.39 | 2 |
| 3-5 | UnderDeveloped | 0.40-0.49 | 3 |
| 6-7 | UnderDeveloped | 0.50-0.59 | 4 |
| 8 | Developing | 0.60-0.69 | 5 |
| 9 | Mature | 0.70-0.79 | 6 |
| 10 | Developed | 0.80-0.89 | 8 |
| 11 | Well Developed | 0.9-0.94 | 9 |
| 12 | Very Developed | >0.95 | 10 |

### 7.6 Source of Power

| Function | Roll | Output |
|----------|------|--------|
| `generateSourceOfPower()` | 2D6 | Source |

| 2D6 | Source of Power |
|-----|-----------------|
| 2-5 | Aristocracy |
| 6-7 | Ideocracy |
| 8-9 | Kratocracy |
| 10-11 | Democracy |
| 12 | Meritocracy |

### 7.7 Governance

| Function | Inputs | Output |
|----------|--------|--------|
| `calculateGovernance(development, wealth)` | Dev + Wealth | DM |

Calculated from Development × Wealth combination table:

| Development \ Wealth | Average | Better-off | Prosperous | Affluent |
|---|---|---|---|---|
| UnderDeveloped | -9 | -3 | +3 | +9 |
| Developing | -8 | -2 | +4 | +10 |
| Mature | -7 | -1 | +5 | +11 |
| Developed | -6 | 0 | +6 | +12 |
| Well Developed | -5 | +1 | +7 | +13 |
| Very Developed | -4 | +2 | +8 | +14 |

### 7.8 Starport (PSS v1.1)

| Function | Inputs | Output |
|----------|--------|--------|
| `calculateStarport(population, tl, wealth, development, weeklyRoll)` | Multiple | Class + PSS + Weekly Activity |

Two independent steps — economic scale and capability ceiling.

#### Step 1 — Port Size Score (PSS)

```
GDP/day = getGdpPerDayForWorld(TL, development, wealth, preset)
                               ← avg SOC from dev + wealth (QA-056)
GDP/year = Population × GDP/day × 365
Annual Port Trade = GDP/year × getTradeFraction(development)
                   ← wealthMultiplier removed (QA-057); wealth is in GDP/day
PSS = floor( log10(Annual Port Trade) ) − 10
```

**GDP/day by dev+wealth (example — Mneme preset at SOC 7 = Mature/Average):**

| TL | SOC 7 GDP/day | TL | SOC 7 GDP/day |
|----|---------------|----|---------------|
| 7 | 205 Cr | 12 | 210,000 Cr |
| 8 | 552 Cr | 13 | 1,500,000 Cr |
| 9 | 1,486 Cr | 14 | 11,000,000 Cr |
| 10 | 4,000 Cr | 15 | 80,000,000 Cr |
| 11 | 29,000 Cr | 16 | 578,000,000 Cr |

SOC mapping: `avgSoc = DEVELOPMENT_AVG_SOC[dev] + WEALTH_SOC_BONUS[wealth]`. GDP/day scales proportionally: UnderDeveloped/Average (SOC ~3.5) earns ~4% of SOC 7; Very Developed/Affluent (SOC ~13, capped 12) earns ~20×.

**Trade Fraction by Development** (mean; actual result rolls a dice band around this — QA-061):

| Development | Mean Fraction |
|-------------|--------------|
| UnderDeveloped | 5% (fixed) |
| Developing | 10% |
| Mature | 15% |
| Developed | 20% |
| Well Developed | 25% |
| Very Developed | 30% |

**PSS to Raw Class (updated QA-061):**

| PSS | Raw Class |
|-----|-----------|
| < 3 | X |
| 3–4 | E |
| 5   | D |
| 6   | C |
| 7   | B |
| ≥ 8 | A |

#### Step 2 — TL Capability Cap

TL sets what the port can physically build or service:

| TL | Max Class | Capability |
|----|----------|------------|
| <4 | X | No facilities |
| 4–5 | E | Frontier landing area only |
| 6–7 | D | Basic constructed area, no maintenance |
| 8–9 | C | Reasonable repairs, unrefined fuel |
| 10–11 | B | Non-starship construction, refined fuel, annual maintenance |
| 12+ | **A** | **Starship construction**, refined fuel, annual maintenance |

```
Final Class = min(PSS-derived class, TL capability cap)
```

#### Step 3 — Weekly Port Activity (×3D6)

```
Weekly Base     = Annual Port Trade ÷ 52
Weekly Activity = Weekly Base × 3D6
```

3D6 (range 3–18, median 10–11) reflects week-to-week variation. ÷52 gives a true weekly rate. (Earlier drafts and a stale JSDoc said ÷364 — that was a daily rate; corrected in QA-027 v1.3.81.)

#### Step 4 — Weekly Activity Roll Button (FR-029) *(📋 Open)*

In the Starport UI card, provide a **Roll 3D6** button next to the Weekly Base value. When clicked:

1. Roll 3D6 and display the individual die results.
2. Calculate `Weekly Activity = Weekly Base × 3D6 result`.
3. Display the final Weekly Activity value alongside the roll.
4. Store the rolled result in the saved system state so it persists on reload.

> **Rationale:** Weekly activity is meant to vary per week of in-game time. A manual roll button lets the GM randomise traffic on demand without regenerating the entire world.

**Base class thresholds for Naval/Scout/Pirate bases are unchanged.**

### 7.9 Travel Zone

| Function | Inputs | Output |
|----------|--------|--------|
| `determineTravelZone(hazard, hazardIntensity, sourceOfPower, stabilityMode, manualOverride?)` | Hazard, Intensity, Source of Power, Stability Mode toggle | Zone (`Green` / `Amber` / `Red`) + Reason |

#### Amber Zone

Amber worlds are dangerous or undergoing upheaval. Travelers are warned to be on guard.

**Automatic Amber Zone** — triggered if either condition is true:
- Hazard = **Radioactive** (any intensity)
- Hazard = **Biohazard** AND Intensity ≥ **High** (i.e. Intense or High)

**Random Amber Zone** — if no automatic trigger, roll 2D6. On a result of **2**, the world is an Amber Zone. Roll on the Amber Zone Reason Table for the cause.

#### Red Zone

A Red Zone world is one where the combination of **inequality** and the **need for violence to create change** makes it actively dangerous to outsiders. It is procedurally generated; likelihood is shaped by the world's political situation.

**Core principle:** High inequality (low development, extractive power structures) + violent political systems = Red Zone risk.

##### Step 1 — Roll the Red Zone Target Number (TN)

Roll **2D6 with the Stability Mode modifier** (user-configurable) and take the **highest single die result** as the TN.

> Taking the highest die (not the sum) weights the result toward higher values — a prosperous, stable world has a high TN that is hard to beat. A collapsing empire has a low TN, making Red Zones common.

| Stability Mode | Roll | Notes |
|----------------|------|-------|
| **Very Stable / Prosperous** | 4D6 keep highest 1 (Adv+2) | Red Zones very rare |
| **Normal** (default) | 3D6 keep highest 1 (Adv+1) | Balanced |
| **Troubled** | 2D6 keep highest 1 | Elevated risk |
| **Imperial Collapse / Terrible Times** | 3D6 keep lowest 1 (Dis+1) | Red Zones common |

This is a **user-configurable toggle** in the UI. Default is **Normal (Adv+1)**.

##### Step 2 — Roll the Red Zone Check

Roll **2D6** and apply the **Source of Power modifier**:

| Source of Power | Modifier |
|-----------------|----------|
| Aristocracy | −2 |
| Kratocracy | −2 |
| Ideocracy | −1 |
| Anarchy | −1 |
| Federation | +0 |
| Confederation | +0 |
| Democracy | +0 |
| Meritocracy | +0 |

##### Step 3 — Determine Result

- If **modified check roll ≥ TN** → **Green Zone**
- If **modified check roll < TN** → **Red Zone**

##### Red Zone Override

The referee (end user) can always **manually toggle** Red Zone on or off. The procedural roll is the default, not binding.

#### Amber Zone Reason Table (2D6)

| 2D6 | Reason |
|-----|--------|
| 2 | War |
| 3 | Small War |
| 4 | Major Insurgency and Terrorism |
| 5 | Heightened Security |
| 6 | Political Purging |
| 7 | Economic Crisis |
| 8 | Major Political Issue |
| 9 | Environmental Disaster |
| 10 | Major Social Issue |
| 11 | Engineering Disaster |
| 12 | Major Economic Collapse |

#### TypeScript Interface

```typescript
type StabilityMode = "very_stable" | "normal" | "troubled" | "collapse";

interface TravelZoneResult {
  zone: "Green" | "Amber" | "Red";
  isAutomatic: boolean;       // true if Amber was auto-triggered by hazard
  redZoneTN?: number;         // the highest-die target number
  redZoneCheck?: number;      // the modified check roll
  reason?: string;            // Amber Zone Reason table result if Amber
  manualOverride: boolean;    // true if referee toggled manually
}
```

### 7.10 Ships in the Area (FR-030) *(📋 Open)*

A dynamic ship-traffic generator tied to the Starport's **Weekly Trade Value**. This section is intended for GM convenience and appears in the `.docx` export, but it is **excluded from JSON backup** because it represents fluctuating week-to-week traffic.

#### Step 1 — Ships Budget

```
Ships Budget = Weekly Trade Value × (1D6 × 10%)
```

Roll 1D6 and multiply by 10%. The result (10%–60%) is the portion of the week's trade value currently represented by ship operating costs in and around the starport.

#### Step 2 — Category Distribution

Roll 1D6 to divide the Ships Budget among three pools. Small Craft and Civilian ships should generally outnumber Warships.

| 1D6 | Small Craft | Civilian | Warship |
|-----|-------------|----------|---------|
| 1 | 33% | 33% | 33% |
| 2 | 50% | 40% | 10% |
| 3 | 40% | 50% | 10% |
| 4 | 60% | 30% | 10% |
| 5 | 45% | 45% | 10% |
| 6 | 50% | 30% | 20% |

#### Step 3 — Ship Pools

Ships are drawn from `mneme_ship_reference.json` (`/mneme_ship_reference.md`).

Each ship in the JSON carries a **`traffic_pool`** field (pre-populated) that directly identifies which pool it belongs to. The implementation must filter by `traffic_pool` — do not re-derive pool membership from `category` at runtime.

| `traffic_pool` value | `category` values included | DT Rule |
|----------------------|---------------------------|---------|
| `"small"` | `"Small Craft"`, `"Fighter"` | ≤ 100 DT |
| `"civilian"` | `"Merchant"`, `"Passenger"`, `"Specialized"`, `"Support"` | Any |
| `"warship"` | `"Military"` | Any |

> Individual ships carry `traffic_pool` as a short lowercase key (`"small"`, `"civilian"`, `"warship"`) so the generator can filter with a single equality check (`ship.traffic_pool === 'small'` etc.). The `traffic_pool_map` object at the top of `mneme_ship_reference.json` documents the human-readable mapping rules but is not used at runtime.

**Monthly Operating Cost:** Use `monthly_operating_cost_cr` from the JSON reference. This value is set equal to `supplies_cr` (resupply / life-support / minor maintenance cost) for each hull.

#### Step 4 — Generation Loop

For each pool (Small Craft → Civilian → Warship):

1. Set `Pool Budget = Ships Budget × distribution %`.
2. Identify the cheapest ship in the pool (`min monthly_operating_cost_cr`).
3. While `Pool Budget >= cheapest ship cost`:
   - Roll a random ship from the pool.
   - If the ship's monthly operating cost ≤ remaining `Pool Budget`:
     - Subtract cost from `Pool Budget`.
     - Roll 1D6 for location (see Step 5).
     - Add ship to the results list.
   - Otherwise, skip and continue (or stop if no ship in the pool is affordable).
4. If `Pool Budget` falls below the cheapest ship in that pool, stop rolling for that category.

> **Note:** The total generated value will be *near* but not necessarily exactly equal to the pool budget, because the final remainder may be smaller than the cheapest available hull.

#### Step 5 — Location Roll

For each generated ship, roll 1D6:

| 1D6 | Location |
|-----|----------|
| 1–2 | **In Orbit** (around the main world) |
| 3–4 | **In System** — roll additional position (see below) |
| 5–6 | **Docked at Starport** |

**In System position roll:**  
Ships with result 3–4 are somewhere else in the system, not at the main world. Roll 1 to *N* (where *N* = total number of bodies in the planetary system: sum of all disks + dwarfs + terrestrials + ices + gas worlds). The result is the body index the ship is near.

- If the system has zero bodies, treat the ship as **In Orbit** instead.
- Body index is 1-based (body 1 = first body in the system list as generated).
- Display as: **"In System — Body *N*"** (e.g. "In System — Body 3").

> **Rationale:** "In System" without a position is meaningless to a GM. A body index tells them exactly which world the ship is near — useful for encounter placement, trade route context, or piracy scenarios.

#### Step 6 — UI / Export Rules

- Provide a **"Generate Ships in the Area"** button in the Starport card (next to the Weekly Activity roll button).
- Display results grouped by location. For "In System" ships, show the body index (e.g. "In System — Body 3").
- Include the generated ship list in the `.docx` system export with body index shown.
- **Do not** persist the ship list in the JSON backup or Dexie database; regenerate on demand when the user clicks the button.

---

### 7.11 Culture Table (D66 × D6)

| Function | Roll | Output |
|----------|------|--------|
| `generateCultureTraits(count, exclude?)` | 3D6 per trait | Cultural traits |

Roll 3D6: First two = row (D66), last = column (1-6)

See [REF-006: Culture Table](./references/REF-006-culture-table.md) for full 36×6 table.

**Reroll Rules:**
1. **Duplicate trait:** Reroll until a non-duplicate trait is obtained.
2. **Opposing trait:** The second (and subsequent) trait cannot be contradictory to any already-selected trait. Opposing pairs are defined as:
   - Anarchist ↔ Bureaucratic, Legalistic
   - Bureaucratic ↔ Anarchist, Libertarian
   - Caste system ↔ Egalitarian
   - Collectivist ↔ Individualist
   - Cosmopolitan ↔ Isolationist, Rustic
   - Deceptive ↔ Honest, Honorable
   - Degenerate ↔ Honorable, Proud
   - Devoted ↔ Indifferent
   - Egalitarian ↔ Elitist, Caste system
   - Elitist ↔ Egalitarian
   - Fatalistic ↔ Idealistic
   - Fearful ↔ Heroic
   - Generous ↔ Ruthless
   - Gregarious ↔ Paranoid
   - Heroic ↔ Fearful
   - Honest ↔ Deceptive, Scheming
   - Honorable ↔ Ruthless, Deceptive, Degenerate
   - Hospitable ↔ Hostile
   - Hostile ↔ Hospitable, Pacifist
   - Idealistic ↔ Fatalistic
   - Indifferent ↔ Devoted
   - Individualist ↔ Collectivist
   - Isolationist ↔ Cosmopolitan
   - Legalistic ↔ Libertarian, Anarchist
   - Libertarian ↔ Legalistic, Bureaucratic
   - Militarist ↔ Pacifist
   - Pacifist ↔ Militarist, Hostile
   - Paranoid ↔ Gregarious
   - Progressive ↔ Rustic
   - Proud ↔ Degenerate
   - Rustic ↔ Cosmopolitan, Progressive
   - Ruthless ↔ Honorable, Generous
   - Scheming ↔ Honest
3. **Power/Culture Conflict:** A culture trait cannot contradict the world's Source of Power (§7.6). The following combinations are excluded:
   - **Kratocracy** excludes: Pacifist, Egalitarian, Legalistic
   - **Democracy** excludes: Anarchist
   - **Aristocracy** excludes: Egalitarian
   - **Meritocracy** excludes: Caste system
   - **Ideocracy** excludes: Anarchist, Libertarian

All invalid rolls are rerolled up to 20 attempts per trait slot.

---

## 8. Planetary System Generation Module

### 8.1 Body Count Generation

| Function | Roll | Output |
|----------|------|--------|
| `generateCircumstellarDisks()` | 2D3-2 (Half Dice + Dis+1 for M only) | Number of disks |
| `generateDwarfPlanets()` | 3D6-3 (Dis+3 for K, Half Dice + Dis+1 for M) | Number of dwarf planets |
| `generateTerrestrialWorlds()` | 2D6-2 (Dis+3 for K, Half Dice + Dis+1 for M) | Number of terrestrial worlds |
| `generateIceWorlds()` | 2D3-2 (Half Dice + Dis+1 for M only) | Number of ice worlds |
| `generateGasWorlds()` | 2D3-2 (Half Dice + Dis+1 for M only) | Number of gas worlds |

**Stellar Class Modifiers:**

| Class | Mechanism | Notes |
|-------|-----------|-------|
| F | Adv+2 on d6 | Roll 2 extra d6, keep highest |
| G | Baseline d6 | Standard dice |
| K | **Dis+3 on d6** | Roll 3 extra d6, keep lowest (regular dice) |
| M | **Half Dice + Dis+1 on d3** | Use d3 (1-3) instead of d6, roll 1 extra, keep lowest |
| O, B, A | Disks only | No other body types |

**Half Dice Mechanism (M-class only):**
M-class stars use **Half Dice** — d3 (1-3) instead of d6 (1-6) — combined with Dis+1:

| Body Type | M-class (Half Dice + Dis+1) |
|-----------|----------------------------|
| Disks | 1d3-1, roll 2d3 keep lowest 1 |
| Dwarfs | 3d3-3, roll 4d3 keep lowest 3 |
| Terrestrials | 2d3-2, roll 3d3 keep lowest 2 |
| Ices | 1d3-1, roll 2d3 keep lowest 1 |
| Gases | 1d3-1, roll 2d3 keep lowest 1 |

**K-class:** Uses standard d6 with Dis+3 (roll 3 extra d6, keep lowest).

### 8.2 Body Mass Generation

| Function | Inputs | Output |
|----------|--------|--------|
| `generateBodyMass(type, roll, stellarMod)` | Type, 2D6, modifier | Mass |

See [REF-007: Planetary Systems Table](./references/REF-007-planetary-systems-table.md) for full mass table.

**Stellar Class Modifiers:**

| Class | Modifier | Notes |
|-------|----------|-------|
| F | Adv+2 | Roll 2 extra d6, keep highest |
| G | Baseline (no modifier) | Standard d6 dice |
| K | **Dis+3** | Roll 3 extra d6, keep lowest (regular dice) |
| M | **Half Dice + Dis+1** | Use d3 (1-3) instead of d6, roll 1 extra d3, keep lowest |
| O, B, A | Disks only | No other body types |

> ✅ **QA-007:** Advantage/Disadvantage modifiers applied to body count rolls. O/B/A stars generate disks only. [See QA-007](./QA.md#qa-007)
> ✅ **QA-015:** Half Dice mechanic for M-class stars (d3 + Dis+1) and Dis+3 for K-class to reduce planet counts. [See QA-015](./QA.md#qa-015)
> 🏠 **REF-007 v1.2 (House Rule):** G=Baseline, K=Dis+3 (d6), M=Half Dice+Dis+1 (d3). Effective 2026-04-10.

### 8.3 Gas World Classification

| Function | Roll | Output |
|----------|------|--------|
| `classifyGasWorld()` | 5D6 | Class I-V |

See [REF-008: Gas World Classification](./references/REF-008-gas-world-classification.md) for full table.

### 8.4 Planetary Position by World Type

| World Type | Zone Determination |
|------------|-------------------|
| **Class I Gas** | Fixed: Outer Solar System |
| **Class II Gas** | Roll 1D6: 4-6 = Conservative, 1-3 = Optimistic (= Cold) |
| **Class III Gas** | Fixed: Infernal |
| **Class IV Gas** | Fixed: Hot |
| **Class V Gas** | Fixed: Hot |
| **Ice World** | Fixed: Outer Solar System |
| **Dwarf Planet** | Roll 1D6 (reroll 6): 1=Infernal, 2=Hot, 3=Conservative, 4=Optimistic, 5=Outer |
| **Carbonaceous Lesser Earth** | Roll 1D6 + position modifier: 4-6 = Optimistic, 1-3 = Outer |
| **Silicaceous Lesser Earth** | Roll 1D6 + position modifier: 1=Outer, 2=Hot, 3-4=Optimistic, 5-6=Conservative |
| **Metallic Lesser Earth** | Roll 1D6 + position modifier: 1=Infernal, 2=Outer, 3=Hot, 4=Optimistic, 5-6=Conservative |
| **Other Lesser Earth** | Same as Metallic |

> **Position Modifier:** Apply the Lesser Earth Type position modifier from section 6.2 (+1 Carbonaceous, +0 Silicaceous, −1 Metallic/Other) to the 1D6 zone roll before lookup. Clamp modified roll to 1–6.

### 8.4a Hot Jupiter Migration Rule

If a Gas World of **Class III, IV, or V** is placed in the **Infernal** or **Hot** zone, it is a **hot Jupiter** — a gas giant that migrated inward early in the system's history, clearing the zone of all other bodies.

**Rules:**
1. Before the Hill Sphere placement loop runs, scan all gas worlds for hot Jupiters.
2. For each hot Jupiter found:
   - **Clear the entire zone** of all other non-disk bodies.
   - The hot Jupiter occupies that zone **alone**.
   - Roll 2D6. On **11+**, one captured rogue world exists in the cleared zone — place it using Hill sphere spacing from the gas giant.
3. This pre-sweep runs **before** `placePlanetaryBodies()`.

> ✅ **QA-011:** Hot Jupiter migration rule implemented. [See QA-011](./QA.md#qa-011)

### 8.5 Disk Zone

| Function | Roll | Output |
|----------|------|--------|
| `generateDiskZone()` | 2D6 | Zone |

See [REF-009: Disk Zone Table](./references/REF-009-disk-zone-table.md) for full table.

> ✅ **QA-006:** Circumstellar disk AU positions are now randomised; a minimum separation floor (0.05 AU inner / 0.2 AU outer) is enforced across all bodies after generation. [See QA-006](./QA.md#qa-006)

### 8.6 Orbital Placement — Hill Sphere Spacing

| Function | Inputs | Output |
|----------|--------|--------|
| `placePlanetaryBodies(mainWorld, others, starMassSun, luminosity)` | Main world, all other bodies, star mass (M☉), luminosity (L☉) | `PlacedBody[]` sorted innermost → outermost |

All planetary bodies are placed using a **Hill sphere spacing algorithm** to prevent physically implausible overlapping orbits. Implementation source: `hillSphereOrbits.ts`.

#### Algorithm

1. **Place Main World first** — its zone and AU position (from section 6.10) are fixed and not displaced.
2. **Sort remaining bodies by mass descending** — most massive placed first (gas giants claim their zones before smaller bodies).
3. **For each body:**
   a. Roll its initial AU position from the zone formula (section 6.10 / section 8.4).
   b. Check clearance against every already-placed body using the mutual Hill sphere minimum separation.
   c. If conflict: nudge outward by one Hill radius of the conflicting body at a time until clear, remaining within the zone where possible.
   d. If zone is exhausted: overflow to the next outer zone's minimum AU.
4. Output is sorted by AU ascending.

#### Hill Sphere Formula

```
r_H = a × ∛(m_planet / (3 × M_star))
```

Where:
- `a` = orbital distance in AU
- `m_planet` = planet mass in Earth Masses (EM)
- `M_star` = star mass in Earth Masses (1 M☉ = 333,000 EM)

#### Constants

| Constant | Value | Notes |
|----------|-------|-------|
| `HILL_FACTOR` | 4.0 | Minimum separation = 4.0 × Hill radius of larger body (standard mutual Hill criterion is ~3.5; 4.0 adds stability margin) |
| `LM_TO_EM` | 0.0123 | 1 Lunar Mass in Earth Masses |
| `JM_TO_EM` | 317.8 | 1 Jupiter Mass in Earth Masses |
| `CM_TO_EM` | 1.577×10⁻⁴ | 1 Ceres Mass in Earth Masses |
| Star EM | `M☉ × 333,000` | Star mass conversion for Hill sphere calculation |

#### Zone Overflow Rule

If a body cannot fit in its rolled zone (all positions within the zone are within HILL_FACTOR × Hill radius of an already-placed body), it overflows to the **next outer zone**. It is placed at that zone's minimum AU plus one step. Displaced bodies are flagged in the output.

#### PlacedBody Interface

```typescript
interface PlacedBody {
  id: string;
  type: BodyType;
  massEM: number;        // all masses normalised to Earth Masses
  zone: Zone;            // final zone (may differ from rolled zone if displaced)
  au: number;            // final orbital distance in AU
  hillRadiusAU: number;  // Hill sphere radius at final AU
}
```

---

## 9. Data Model

### 9.1 Core TypeScript Interfaces

```typescript
interface StarSystem {
  id: string;
  createdAt: Date;
  name?: string;
  
  // Star Generation
  primaryStar: Star;
  companionStars: CompanionStar[];
  zones: ZoneBoundaries;
  
  // Main World
  mainWorld: MainWorld;
  
  // Inhabitants
  inhabitants: Inhabitants;
  
  // Planetary System
  circumstellarDisks: Disk[];
  dwarfPlanets: DwarfPlanet[];
  terrestrialWorlds: TerrestrialWorld[];
  iceWorlds: IceWorld[];
  gasWorlds: GasWorld[];
}

interface Star {
  class: "O" | "B" | "A" | "F" | "G" | "K" | "M";
  grade: number; // 0-9
  mass: number; // Solar masses
  luminosity: number; // Solar luminosity
  color: string;
}

interface CompanionStar extends Star {
  orbitDistance: number; // AU
  orbits: "primary" | "companion";
}

interface ZoneBoundaries {
  infernal: { min: 0; max: number };
  hot: { min: number; max: number };
  conservativeHabitable: { min: number; max: number };
  optimisticHabitable: { min: number; max: number }; // = Cold
  outerSolarSystem: { min: number; max: null };
}

interface MainWorld {
  type: "Habitat" | "Dwarf" | "Terrestrial";
  size: number; // MVT, LM, or EM
  lesserEarthType?: "Carbonaceous" | "Silicaceous" | "Metallic" | "Other";
  
  // Physical
  gravity: number; // G
  radius: number; // km
  escapeVelocity: number; // m/s
  
  // Atmosphere
  atmosphere: "Average" | "Thin" | "Trace" | "Dense" | "Crushing";
  atmosphereTL: number;
  
  // Temperature
  temperature: "Average" | "Cold" | "Freezing" | "Hot" | "Inferno";
  temperatureTL: number;
  
  // Hazard
  hazard: "None" | "Polluted" | "Corrosive" | "Biohazard" | "Toxic" | "Radioactive";
  hazardIntensity: "Very Mild" | "Mild" | "Serious" | "High" | "Intense";
  
  // Resources
  biochemicalResources: "Scarce" | "Rare" | "Uncommon" | "Abundant" | "Inexhaustible";
  
  // Habitability
  habitability: number;
  
  // Position
  zone: Zone;
  distanceAU: number;
}

interface Inhabitants {
  techLevel: number;
  population: number;
  wealth: "Average" | "Better-off" | "Prosperous" | "Affluent";
  powerStructure: "Anarchy" | "Confederation" | "Federation" | "Unitary State";
  development: "UnderDeveloped" | "Developing" | "Mature" | "Developed" | "Well Developed" | "Very Developed";
  sourceOfPower: "Aristocracy" | "Ideocracy" | "Kratocracy" | "Democracy" | "Meritocracy";
  governance: number; // DM
  starport: {
    class: "X" | "E" | "D" | "C" | "B" | "A";
    output: string;
    hasNavalBase: boolean;
    hasScoutBase: boolean;
    hasPirateBase: boolean;
  };
  travelZone: "Green" | "Amber" | "Red";
  travelZoneIsAutomatic: boolean;    // true if Amber triggered by hazard condition
  travelZoneReason?: string;         // Amber Zone Reason table result
  redZoneTN?: number;                // highest-die target number (Red Zone check)
  redZoneCheck?: number;             // modified check roll result
  travelZoneManualOverride: boolean; // true if referee toggled manually
  stabilityMode: "very_stable" | "normal" | "troubled" | "collapse";
  cultureTraits?: string[];
}

interface PlanetaryBody {
  id: string;
  type: BodyType;       // "ice" stored as 'ice' internally; displayed as "Ice Worlds" — see QA-008
  massEM: number;        // mass in Earth Masses (normalised — see 8.6 constants for conversions)
  zone: Zone;            // final zone after orbital placement (may differ from rolled zone)
  distanceAU: number;    // final AU after Hill sphere placement (see section 8.6)
  hillRadiusAU: number;  // computed by placePlanetaryBodies()

  // Derived physical properties — see REF-010-planet-densities.md and QA-009
  densityGcm3?: number;       // g/cm³ from body type lookup
  volumeM3?: number;
  radiusKm?: number;
  diameterKm?: number;
  surfaceGravityG?: number;   // in g (Earth = 1.0)
  escapeVelocityMs?: number;  // in m/s (ΔV to escape surface)
}
```

> ✅ **QA-008:** Body type label "Ice" is now displayed as "Ice Worlds". Internal type key `'ice'` unchanged. [See QA-008](./QA.md#qa-008)
> ✅ **QA-009:** Physical properties calculated and displayed for all non-disk bodies. [See QA-009](./QA.md#qa-009)

```typescript

interface Disk extends PlanetaryBody {
  type: "circumstellar";
}

interface DwarfPlanet extends PlanetaryBody {
  type: "dwarf";
  lesserEarthType: "Carbonaceous" | "Silicaceous" | "Metallic" | "Other";
}

interface TerrestrialWorld extends PlanetaryBody {
  type: "terrestrial";
  gravity?: number;
  atmosphere?: string;
}

interface IceWorld extends PlanetaryBody {
  type: "ice";
  density?: number;
}

interface GasWorld extends PlanetaryBody {
  type: "gas";
  gasClass: "I" | "II" | "III" | "IV" | "V";
}
```

---

## 10. UI Components

### 10.1 Main Interface

| Component | Description |
|-----------|-------------|
| **Generator Dashboard** | Main screen with "Generate System" button |
| **Star Display Card** | Visual representation of star(s) with data |
| **Zone Visualization** | Diagram showing zone boundaries with distances |
| **Main World Card** | Detailed world properties display |
| **Inhabitants Panel** | TL, population, government, starport info |
| **Planetary System Accordion** | Expandable list of all bodies |
| **Data Log Table** | Saved systems with search/filter |
| **Export Controls** | JSON/CSV export buttons |

### 10.3 Generator Options Persistence (FR-028)

**Requirement:** Generator options must persist across generations and page navigations. The app must not reset to defaults each time the user leaves and returns to the generator view.

**Fields persisted:**

| Field | Type | Default |
|-------|------|---------|
| `starClass` | `StellarClass \| 'random'` | `'random'` |
| `starGrade` | `StellarGrade \| 'random'` | `'random'` |
| `mainWorldType` | `WorldType \| 'random'` | `'random'` |
| `populated` | `boolean` | `true` |
| `tlProductivityPreset` | `TLProductivityPreset` | Mneme default |
| `developmentWeights` | `number[]` | Mneme default (uniform 2D6) |
| `powerWeights` | `number[]` | Mneme default (uniform 2D6) |
| `govWeights` | `number[]` | Mneme default (uniform 2D6) |

**localStorage key:** `mneme_generator_options` (JSON object with the fields above)

**Behaviour:**
- On component mount: read from `mneme_generator_options`; if present, initialise state from stored values; if absent, use defaults above.
- On any option change (star class, grade, world type, populated toggle): write updated values to `mneme_generator_options`.
- No explicit "save" button required — auto-persist on change.
- Stored values are validated on load (e.g. unknown string → fall back to `'random'`).

---

### 10.2 Navigation — Single Page with Tab Anchors

The generator view is a **single page**. The five tabs jump to anchored sections within the same page — they do not navigate to new routes.

| Tab | Anchor | Content |
|-----|--------|---------|
| Overview | `#overview` | System summary card, generate button |
| Star | `#star` | Primary star + companions, zone diagram |
| World | `#world` | Main world properties, habitability |
| Inhabitants | `#inhabitants` | TL, population, government, starport, culture |
| Planetary System | `#planetary-system` | All bodies with mass, radius, gravity, ΔV |

**Separate views** (not tabs):

| View | Content |
|------|---------|
| `dashboard` | Generator (single page above) |
| `log` | Saved systems log |
| `settings` | Theme toggle, export/import |

> ✅ **QA-010:** Single-page with anchor tabs implemented. [See QA-010](./QA.md#qa-010)

### 10.4 Economic Settings (FR-032)

A new **Settings** panel titled **"Economic Assumptions"** lets the user configure the underlying economic engine. This directly affects starport trade volumes, ship traffic density, and the affordability of spacecraft.

#### 10.4.1 Preset Selector

| Preset | Description |
|---|---|
| `Mneme` | Compounding productivity growth per TL. Default. |
| `CE / Traveller` | Flat 2,000 Cr/month SOC 7 income at **all TLs** (stagnant). |
| `Custom` | User-editable curve. |

Actions beside the dropdown: **Save**, **Save As**, **Load**, **Import** (JSON), **Export** (JSON).

#### 10.4.2 Boat-Years Calibration

The primary calibration input is:

> **"Years for a SOC 7 worker to purchase the base Boat (10DT)"**

- Boat price is fixed at **5,320,400 Cr**.
- `SOC 7 annual income = 5,320,400 / Y`
- `gdpPerDay = SOC 7 annual income / 365`

**Mneme default:** Y = 30 yrs → ~486 Cr/day at TL 7, compounding upward.  
**CE default:** Y ≈ 222 yrs → ~66 Cr/day, **identical at every TL**.

#### 10.4.3 Growth Curves

| Curve | Behaviour |
|---|---|
| `mneme` | Anchors TL 7 to the Boat-Years value; TL 8–16 scale via the Mneme productivity curve. |
| `flat` | Applies the same SOC 7 income to **every TL** (CE stagnation model). |
| `linear` | Adds a fixed percentage per TL step (e.g. +50% each TL). |
| `custom` | User directly edits the SOC 7 income for each TL (7–16). |

#### 10.4.4 SOC-Income Grid

An expandable grid shows **SOC 1 through SOC 60** for the selected TL.
- Only **SOC 7** is editable.
- `SOC > 7`: doubles per step (`× 2^(SOC − 7)`)
- `SOC < 7`: halves per step (`× 0.5^(7 − SOC)`)

#### 10.4.5 World Economics Mechanics — GDP & PSS

The generator uses a four-step pipeline to derive starport size from economic assumptions:

**Step 1 — Per-Capita Income (QA-056)**
```
avgSoc    = DEVELOPMENT_AVG_SOC[development] + WEALTH_SOC_BONUS[wealth]  (capped at 12)
gdpPerDay = getGdpPerDayForWorld(TL, development, wealth, preset)
          = getSocMonthlyIncome(avgSoc, TL, preset) × 12 / 365
```

Development and Wealth now drive the per-capita income baseline via average SOC. An UnderDeveloped/Average world earns ~4% of SOC 7; a Very Developed/Affluent world earns ~20×.

**Step 2 — Gross Domestic Product**
```
GDP/year = Population × gdpPerDay × 365
```

**Step 3 — Port Trade Volume (QA-057)**
```
Annual Port Trade = GDP/year × getTradeFraction(development)
```

`wealthMultiplier` removed — Wealth is fully expressed through avg SOC in GDP/day (double-counting eliminated).

Trade Fraction (mean; dice variance added per level in QA-061):
- UnderDeveloped: 5% | Developing: ~10% | Mature: ~15% | Developed: ~20% | Well Developed: ~25% | Very Developed: ~30%

**Step 4 — Port Size Score (PSS) & Ships**
```
PSS = floor( log10(Annual Port Trade) ) − 10
Raw Class = pssToClass(PSS)  →  < 3=X, 3–4=E, 5=D, 6=C, 7=B, ≥8=A  (QA-061 thresholds)
Final Class = min(Raw Class, TL Capability Cap)
Weekly Base = Annual Port Trade ÷ 52                    ← true weekly rate (QA-027)
Weekly Activity = Weekly Base × 3D6
```

`Weekly Activity` is the budget passed to `shipsInArea.ts`. Lower `gdpPerDay` (e.g. CE mode) naturally shrinks this budget — no separate Boat Years scarcity multiplier needed (QA-058).

#### 10.4.6 Table Customization

The panel also includes weight editors for:
- **Development distribution** (2D6 weights, 2–12)
- **Source of Power distribution** (2D6 weights, 2–12)
- **Government structure distribution** (2D6 weights, 2–12)

Each editor shows the mapped result, HDI/SOC context for Development, and preset buttons (`Mneme Default`, `Reset Uniform`, etc.).

---

## 11. Data Management

### 11.1 Dexie.js Schema

```typescript
class MnemeDatabase extends Dexie {
  starSystems!: Table<StarSystem>;
  
  constructor() {
    super("MnemeWorldGenerator");
    this.version(1).stores({
      starSystems: "++id, createdAt, name, [primaryStar.class]"
    });
  }
}
```

### 11.3 Number Formatting

All displayed values use formatted output — no raw scientific notation.

```typescript
// src/lib/format.ts
formatValue(87376105.82, "people")   // → "87,376,106 people"
formatValue(3516325, "L☉")           // → "3,516,325 L☉"
formatValue(0.0123, "EM")            // → "0.0123 EM"
formatNumber(1.19e25)                // → "11,900,000,000,000,000,000,000,000"
formatCredits(1e12)                  // → "1,000,000,000,000 Cr/week"
```

> ✅ **QA-004:** Number formatting implemented via `src/lib/format.ts`. [See QA-004](./QA.md#qa-004)

### 11.4 CSV Export Format

See [QA-ADD-002](./QA.md#qa-add-002) and [REF-012](./references/REF-012-csv-export-format.md) for the full wide-row CSV column specification.

**Format summary:** One system = one row. Standard fields for star + main world, then open-ended prefixed columns for companions (`S1_`, `S2_`) and planetary bodies (`P01_`, `P02_`, `D01_`).

**Key format:** `YYMMDD-HHMMSS-[CLASS][GRADE]-[3-char-random]` (e.g. `260409-143022-G2-XKR`)

### 11.2 CRUD Operations

| Function | Description |
|----------|-------------|
| `saveSystem(system: StarSystem)` | Save to IndexedDB |
| `loadSystem(id: string)` | Retrieve by ID |
| `getAllSystems()` | List all saved systems |
| `deleteSystem(id: string)` | Remove from DB |
| `exportToJSON(system)` | Download as JSON file |
| `exportToCSV(system)` | Download as CSV file |
| `importFromJSON(json)` | Import previously exported system |

---

## 12. PWA Features

| Feature | Implementation |
|---------|----------------|
| **Offline Support** | Service worker with vite-plugin-pwa |
| **Installable** | Web app manifest |
| **Responsive** | Mobile-first Tailwind CSS |
| **Theme Toggle** | Dark (default) / Day mode |
| **Storage** | IndexedDB (Dexie.js) |
| **Background Sync** | Optional for future cloud sync |

### 12.1 Installing the App

The Mneme CE World Generator is a Progressive Web App (PWA) that can be installed on your device for offline use.

#### Mobile (iOS/Android)

**iPhone/iPad (Safari):**
1. Open the app in Safari
2. Tap the **Share** button (rectangle with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** in the top-right corner
5. The app icon appears on your home screen — tap to launch

**Android (Chrome):**
1. Open the app in Chrome
2. Tap the **menu (⋮)** or look for the **"Add to Home screen"** banner
3. Tap **"Install"** or **"Add to Home screen"**
4. Confirm by tapping **"Install"**
5. The app icon appears on your home screen

#### Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Look for the **download/install icon** (↓) in the address bar
3. Click **"Install Mneme CE World Generator..."**
4. Alternatively: click the **menu (⋮)** → **"Install Mneme CE World Generator"**
5. The app opens in its own window and can be launched from your desktop/start menu

#### Benefits of Installing
- ✅ **Offline access** — Generate systems without internet
- ✅ **Full-screen experience** — No browser UI clutter
- ✅ **Quick launch** — App icon on home screen/desktop
- ✅ **Automatic updates** — New features download in background

---

## 13. Milestone Plan

| Milestone | Features | Est. Time |
|-----------|----------|-----------|
| **M1** | Dice Engine + Star Generation (with companion logic) | 2-3 days |
| **M2** | Main World Generation (Type, Gravity, Atmo, Temp, Hazard, Bio, Position) | 3-4 days |
| **M3** | Inhabitants + Culture Table + Travel Zones + Starport | 2-3 days |
| **M4** | UI Polish, Export/Import, PWA Features, Theme Toggle | 2-3 days |
| **M5** | Dexie Persistence, Save/Load, Data Log | 2 days |
| **M6** | Full Planetary System Generation | 3-4 days |

**Total Estimated Time:** 14-19 days

---

## 14. Planned Extensions

### 14.1 FR-040 — Intrastellar Population Distribution *(🟢 Planned)*

**Status:** Planned — spec in [ROADMAP.md](./ROADMAP.md#fr-040--intrastellar-population-distribution)

**Objective:** Shift from a single main-world population to a system-wide model where inhabitants are distributed proportionally across all habitable bodies. The main world remains the political and economic centre but no longer monopolises 100% of the population.

#### Core Mechanics

1. **Calculate habitability for every body** — run the full habitability pipeline (gravity, atmosphere, temperature, hazard, biochem) for each terrestrial, ice world, and gas giant in the system. Dwarfs and disks excluded unless high TL permits artificial habitats.

2. **Determine carrying capacity per body**
   ```
   carryingCapacity[body] = 10^(habitability + 1) × productivityMultiplier
   ```
   Bodies with `habitability ≤ 0` may still host habitats at TL 11+ (scaled by `getHabitatSize()`).

3. **Distribute total system population**
   ```
   body.population = totalSystemPopulation × (body.capacity / sumOfAllCapacities)
   ```
   The main world receives the largest single share — typically 30–70%.

4. **TL scaling** — higher TL increases `productivityMultiplier`, raising total system population and expanding habitat eligibility to more hostile bodies.

#### Display & Data Model

- **System Viewer — Inhabitants panel:** "Population Distribution" subsection listing inhabited bodies with their share %.
- **Planetary System tab:** each body row shows its population and habitability breakdown.
- **DOCX export:** "Major Settlements" table with body name, type, population, habitability.
- **Types:** extend `PlanetaryBody` with optional `population?: number` and `habitability?: number`.

#### Affected Files

| File | Change |
|------|--------|
| `src/lib/generator.ts` | Run habitability for all bodies, compute capacities, distribute population |
| `src/types/index.ts` | Add `population?` and `habitability?` to `PlanetaryBody` |
| `src/components/SystemViewer.tsx` | Population distribution UI in Inhabitants panel |
| `src/lib/exportDocx.ts` | Settlement table export |

---

### 14.2 FR-041 — Composition–Atmosphere–Biosphere Pipeline Redesign *(📋 Planned)*

**Status:** Planned — full design spec in [`260417-03 MWG-REDESIGN-consolidated-v1.md`](./260417-03%20MWG-REDESIGN-consolidated-v1.md) (supersedes FR-041/042/043 drafts).  
**Replaces:** Current §6.2 (Lesser Earth Type), §6.3 (Density), §6.4 (Atmosphere), §6.8 (Biochem)  
**Enables:** FR-040 (Intrastellar Population Distribution)

#### Motivation

The current pipeline generates the mainworld first and builds the system around it. The PWA can now generate the **entire system first**, compute baseline habitability for every candidate body, and select the winner as mainworld — more physically honest. This requires a composition → atmosphere → biosphere chain for every candidate.

#### Pipeline (13 Steps)

```
1. Mass              (existing, 2D6 with stellar-class modifier)
2. Composition       (NEW — 3D6, 7-tier tables for Terrestrial + Dwarf)
                     Output: density range + Reactivity DM
3. Density           (2D6 within composition-defined range)
4. Derived Physics   (existing — gravity, radius, escape velocity)
5. Atmosphere Comp   (NEW — 3D6 abiotic gas table: HH/CH₄/N₂/CO₂/H₂O/H₂SO₄/Exotic)
                     N-O deliberately absent — it's a biosignature
6. Atmosphere Density(2D6 + gravity/composition/Reactivity modifiers)
7. Temperature       (existing, modified by atmosphere composition + zone)
8. Hazard            (2D6 + Reactivity DM)
9. Biochem Resources (NEW — 3D6 + Reactivity DM, 11-tier: Scarce→Inexhaustible, −5 to +5)
10. Biosphere Test   (NEW — 5D6 dis+2 vs TN 20; triggered at Common+)
                     Biochem mod reduces disadvantage (mod +N removes N dis levels)
11. Biosphere Rating (NEW — B0–B6 from degree of pass; hab mods 0 to +8)
12. Atmo Conversion  (NEW — B3+ converts abiotic atmosphere toward N-O)
13. Habitability     (sum of all modifiers)
```

#### Key Tables

**Terrestrial Composition (3D6):**

| 3D6 | Composition | Density (g/cm³) | Reactivity DM |
|---|---|---|---|
| 3 | Exotic (Heavy-Element) | 7.5–9.5 | +2 |
| 4–5 | Iron-Dominant | 6.0–7.5 | −1 |
| 6–8 | Iron-Silicate (Earth-type) | 5.0–6.0 | +1 |
| 9–12 | Silicate-Basaltic (Mars-type) | 3.8–5.0 | 0 |
| 13–15 | Hydrous / Ocean | 2.5–3.8 | +2 |
| 16–17 | Carbonaceous | 2.0–3.0 | +1 |
| 18 | Ceramic / Silicate-Pure | 3.0–4.0 | 0 |

**Dwarf Composition (3D6):**

| 3D6 | Composition | Density (g/cm³) | Reactivity DM |
|---|---|---|---|
| 3 | Exotic | 1.5–4.0 | +1 |
| 4–5 | Metallic (M-type) | 5.0–7.5 | −1 |
| 6–8 | Silicaceous (S-type) | 2.8–3.8 | 0 |
| 9–12 | Hydrous / Icy-Rock | 1.5–2.5 | +2 |
| 13–15 | Carbonaceous (C-type) | 1.8–2.5 | +1 |
| 16–17 | Rubble-Pile | 1.5–2.2 | 0 |
| 18 | Volatile-Rich | 1.2–2.0 | +2 |

**Abiotic Atmosphere Composition (3D6):**

| 3D6 | Primary Gas | Temp DM | Hazard Bias |
|---|---|---|---|
| 3 | Hydrogen-Helium | −2 | None |
| 4–5 | Methane / Ammonia | −1 | Toxic +1 |
| 6–8 | Nitrogen-Inert (N₂, Ar, CO) | 0 | None |
| 9–12 | Carbon Dioxide | +1 | None |
| 13–15 | Water Vapor / Steam | +2 | Corrosive +1 |
| 16–17 | Sulfuric | +2 | Corrosive +2, Toxic +1 |
| 18 | Exotic / Unknown | Variable | Variable |

**Biochem Resources (3D6 + Reactivity DM, 11-tier):**

| 3D6 | Tier | Hab Mod |
|---|---|---|
| 3 | Scarce | −5 |
| 4 | Rare | −4 |
| 5 | Uncommon | −3 |
| 6–7 | Poor | −2 |
| 8–9 | Deficient | −1 |
| 10–11 | Common | 0 |
| 12–13 | Abundant | +1 |
| 14 | Rich | +2 |
| 15 | Bountiful | +3 |
| 16 | Prolific | +4 |
| 17–18 | Inexhaustible | +5 |

**Biosphere Test (triggered at Common+):**

| Biochem Tier | Dice Pool | P(≥ TN 20) |
|---|---|---|
| Common (0) | 7D6 keep low 5 (dis+2) | ~12% |
| Abundant (+1) | 6D6 keep low 5 (dis+1) | ~22% |
| Rich (+2) | 5D6 plain | ~41% |
| Bountiful (+3) | 6D6 keep high 5 (adv+1) | ~68% |
| Prolific (+4) | 7D6 keep high 5 (adv+2) | ~85% |
| Inexhaustible (+5) | 8D6 keep high 5 (adv+3) | ~94% |

**Biosphere Rating (B0–B6):**

| Degree | Rating | Name | Atmo Effect | Hab Mod |
|---|---|---|---|---|
| < TN−5 | B0 | None | — | 0 |
| TN−5 to TN−1 | B1 | Pre-Biotic | — | 0 |
| TN to TN+2 | B2 | Microbial | Trace O₂ | +1 |
| TN+3 to TN+5 | B3 | Photosynthetic | CO₂ → transitional | +2 |
| TN+6 to TN+8 | B4 | Complex | → **Nitrogen-Oxygen** | +4 |
| TN+9 to TN+11 | B5 | Advanced | Stable N-O | +6 |
| ≥ TN+12 | B6 | Post-Sapient | Engineered | +8 |

#### Extraterrestrial Life Assumptions Settings

New settings panel (parallel to Economic Presets):

```typescript
interface ExtraterrestrialLifeAssumptions {
  id: string
  name: string
  description: string
  biosphereTN: number                    // default 20, range 15–35
  biosphereDisadvantage: number          // default 2, range 0–5
  minBiochemForBiosphereRoll: 'Common' | 'Abundant' | 'Rich'
  enableTransitionalAtmospheres: boolean
  biochemOffsetRule: 'standard' | 'halved' | 'none'
}
```

**Built-in presets:**

| Preset | TN | Dis | Min Biochem | Transitional | N-O emergence |
|---|---|---|---|---|---|
| Mneme Default | 20 | 2 | Common | yes | ~3–10% of candidates |
| Rare Earth | 28 | 3 | Abundant | no | < 1% |
| Panspermia | 15 | 0 | Common | yes | ~15–30% |

**localStorage:** `mneme_life_assumptions_presets` (custom presets), active ID in `mneme_generator_options`

#### Affected Files

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `composition`, `atmosphereComposition`, `biosphereRating`, `ExtraterrestrialLifeAssumptions` types |
| `src/lib/worldData.ts` | Composition tables, atmosphere composition table, 11-tier biochem, biosphere test/rating |
| `src/lib/physicalProperties.ts` | Accept composition-driven density (override random sampling); existing function remains as fallback for gas/ice/disk |
| `src/lib/generator.ts` | Rewrite habitability pipeline for all candidates; mainworld selection by best hab score |
| `src/lib/lifePresets.ts` | NEW — Life assumptions preset builder + built-in presets (Mneme Default / Rare Earth / Panspermia) |
| `src/lib/optionsStorage.ts` | Persist active life assumptions preset |
| `src/components/Settings.tsx` | Life Assumptions panel (TN slider, dis slider, biochem minimum, preset save/load) |
| `src/components/SystemViewer.tsx` | Display composition, atmosphere composition, biosphere rating per body |
| `src/components/GeneratorDashboard.tsx` | Life assumptions preset selector |

#### Open Questions (Deferred)

- B6 Post-Sapient: auto-mainworld or compete normally?
- HH inheritance from Gas Giant parent (captured-atmosphere edge case)
- Composition–zone correlation (Hydrous/Volatile beyond frost line)
- Temperature DM integration with existing temperature mechanic

---

### 14.3 FR-042 — Positioning System Redesign *(📋 Planned)*

**Status:** Planned — full design spec in [`260417-03 MWG-REDESIGN-consolidated-v1.md`](./260417-03%20MWG-REDESIGN-consolidated-v1.md) (supersedes FR-041/042/043 drafts).  
**Replaces:** REF-003 (orbit table), REF-005 (world position table), QA-011 (Hot Jupiter migration)  
**Depends on:** FR-041 (composition runs before positioning; habitability pipeline runs after)

#### Zone Architecture

**Inner System (5 zones):**

| Zone | Boundary |
|---|---|
| Infernal | Stellar radius × 2 to √L × 0.4 AU |
| Hot | √L × 0.4 to 0.8 AU |
| Conservative | √L × 0.8 to 1.2 AU |
| Cool | √L × 1.2 to 2.0 AU |
| Frost Line | √L × 4.85 AU (anchor) |

**Outer System (5 zones, geometric growth to heliopause = 120 × √L AU):**

| Zone | Width % of outer span |
|---|---|
| O1 | 3.125% (Kuiper-Belt density) |
| O2 | 6.25% |
| O3 | 12.5% |
| O4 | 25% |
| O5 | 50% (Oort-cloud sparseness) |

#### Unified 3D6 Position Roll

| 3D6 | Zone | Probability |
|---|---|---|
| 3 | Infernal | 0.46% |
| 4–7 | Hot | 15.3% |
| 8–11 | Conservative | 43.5% |
| 12–13 | Cool | 16.2% |
| 14 | Frost Line | 9.7% |
| 15–18 | Outer (second 3D6 for O1–O5) | 14.8% |

#### 4-Phase Placement

- **Phase A — Anchors:** Largest Gas/Ice Giant at frost line (3D6 jitter ±7%); largest Terrestrial via unified 3D6
- **Phase B — Disks first:** Disks placed before planets; block Terrestrials + Gas/Ice Giants; Dwarfs coexist
- **Phase C — Remaining bodies (mass-descending):** Hill sphere conflict (4× max r_H separation); disk-blocking; 5-reroll limit → ejection to rogue worlds
- **Phase D — Moons:** Level 2 within parent Hill sphere (separate thread)

#### Hot Jupiter — Stability Roll (replaces QA-011)

**Trigger:** Gas Giant rolls inner zone + all 4 inner zones filled + stability roll fails (5D6 keep lowest 3, TN 5, ~5.5% failure per trigger → ~0.5–0.6% per system)

**Consequences:** Mass absorption of consumed bodies (between original and final position), shepherded bodies lose 6–26% distance (70 + 4D6, stellar-class-dependent Adv/Dis). Class upgrades: ≥20 JM → Proto-Star trait; ≥50 JM → Brown Dwarf (Level 0 companion, relocated per REF-003).

#### Data Model Additions

```typescript
interface OuterZoneBoundaries {
  o1: { minAU: number; maxAU: number }
  o2: { minAU: number; maxAU: number }
  o3: { minAU: number; maxAU: number }
  o4: { minAU: number; maxAU: number }
  o5: { minAU: number; maxAU: number }
}

type ZoneId = 'Infernal' | 'Hot' | 'Conservative' | 'Cool'
  | 'FrostLine' | 'O1' | 'O2' | 'O3' | 'O4' | 'O5'

// StarSystem additions:
heliopauseAU: number           // 120 × √(L/L☉)
frostLineAU: number            // 4.85 × √(L/L☉)
outerSystemZones: OuterZoneBoundaries
ejectedBodies: Body[]          // rogue worlds from saturation
consumedBodies: Body[]         // absorbed by Hot Jupiter

// Body additions:
positionRoll: number           // debug — 3D6 result
positionRerollCount: number    // how many rerolls
wasEjected?: boolean
ejectionReason?: string        // 'saturation' | 'gravitational'
```

#### Affected Files

| File | Change |
|------|--------|
| `src/types/index.ts` | `OuterZoneBoundaries`, expanded `ZoneId`, `ejectedBodies`, `consumedBodies`, body position fields |
| `src/lib/generator.ts` | Rewrite `generatePlanetarySystem()` with 4-phase placement, anchor logic, ejection, Hot Jupiter stability |
| `src/lib/worldData.ts` | Unified 3D6 zone table, outer zone table, disk count formula, shepherding roll |
| `src/lib/stellarData.ts` | `heliopauseAU`, `frostLineAU` calculations |
| `src/components/SystemViewer.tsx` | Rogue Worlds panel, consumed bodies display, Proto-Star indicators |
| `src/components/GeneratorDashboard.tsx` | Batch export: ejection stats, Hot Jupiter rate validation |

#### Open Questions

- Shepherded body temperature re-evaluation post-shepherding
- Promoted Brown Dwarf sub-system generation (deferred — v1 keeps only original moons)
- Brown Dwarf positioning after Hot Jupiter promotion (proposed: relocate to standard outer orbit)
- Consumed body narrative display in UI

---

### 14.4 FR-043 — Habitability Application & Mainworld Selection *(📋 Planned)*

**Status:** Planned — full design spec in [`260417-03 MWG-REDESIGN-consolidated-v1.md`](./260417-03%20MWG-REDESIGN-consolidated-v1.md) (supersedes FR-041/042/043 drafts).  
**Replaces:** Current §6.4–6.9 (atmosphere, temperature, hazard, biochem, habitability) and mainworld-first generation  
**Depends on:** FR-041 (composition), FR-042 (positioning — provides zone assignments)  
**Part of:** Redesign sequence: Composition → Positioning → **Habitability (this)** → Habitats → Megastructures

#### Core Change: Mainworld Emerges from System

Every Dwarf and Terrestrial (Level 1 and 2) runs through a 10-step habitability waterfall. The body with the highest **Baseline Habitability** wins. TL applies only after selection. A Level 2 moon can beat a Level 1 planet.

#### The 10-Step Habitability Waterfall

**Step 1 — Atmosphere Composition (3D6, abiotic):**
From FR-041. Hab mods: CO₂ −1, Steam −2, Sulfuric −3, Exotic −3, N-Inert 0, H-He 0.

**Step 2 — Atmosphere Density (2D6 + modifiers):**
Trace −3, Thin −1, Average 0, Dense −1, Crushing −3. Modified by Reactivity, gravity, Ceramic.

**Step 3 — Temperature (2D6 + stacked modifiers):**
Freezing −5, Cold −2, Average 0, Hot −2, Inferno −5.

Zone DMs: Infernal +5, Hot +3, Conservative 0, Cool −2, Frost Line −3, O1 −4, O2 −5, O3 −6, O4 −7, O5 −8.
Plus atmosphere composition DM, atmosphere density greenhouse DM, Proto-Star heat DM (+1 to +3 for moons).
Shepherded bodies re-roll temperature with new zone DM.

**Step 4 — Hazard (2D6 + Reactivity DM + atmo hazard bias):**
≤3 None(0), 4–6 Polluted(−1), 7–8 Corrosive(−2), 9 Biohazard(−2), 10 Toxic(−3), 11–12 Radioactive(−4).

**Step 5 — Hazard Intensity (2D6):**
2–3 Trace(0), 4–6 Light(0), 7–9 Moderate(−1), 10–11 Heavy(−2), 12 Extreme(−3).

**Step 6 — Biochem Resources (3D6 + Reactivity DM):**
11-tier from FR-041. Scarce(−5) through Inexhaustible(+5).

**Step 7 — Biosphere Test (dice pool with three modifiers):**
Base: 5D6 dis+2 vs TN 20.
- (A) Biochem: each +1 mod removes 1 dis level
- (B) Temperature: Average adv+2, Cold/Hot dis+2, Freezing/Inferno dis+3
- (C) Subsurface Ocean Override: Hydrous/Volatile-Rich + Cold/Freezing + tidal heating → halve temperature penalty

**Step 8 — Biosphere Rating (B0–B6):**
From degree of pass. B0 None(0), B1 Pre-Biotic(0), B2 Microbial(+1), B3 Photosynthetic(+2), B4 Complex(+4), B5 Advanced(+6), B6 Post-Sapient(+8).

**Step 9 — Atmosphere Conversion:**
B3+ converts abiotic atmosphere. CO₂/N-Inert → N-O at B4+. Removes atmosphere hab penalty.

**Step 10 — Baseline Habitability:**
`Gravity + AtmoComp + AtmoDensity + Temperature + Hazard + HazardIntensity + Biochem + Biosphere`

#### Gravity Modifier (revised, symmetric)

| Gravity | Hab Mod |
|---|---|
| 0.0–0.1G | −3 |
| 0.1–0.3G | −2 |
| 0.3–0.7G | −1 |
| 0.7–1.3G | 0 |
| 1.3–1.7G | −1 |
| 1.7–2.5G | −2 |
| ≥2.5G | −3 |

#### Mainworld Selection

1. Highest Baseline Habitability wins (Level 1 or Level 2)
2. Tiebreakers: Biosphere Rating > Composition quality > Mass > Random
3. If no candidate > 0: MVT/GVT fallback (artificial habitats)
4. Post-selection: TL rolled, Effective Hab = Baseline + TL mod, Inhabitants generated

#### Data Model Additions

```typescript
// Body additions:
baselineHabitability: number
habitabilityBreakdown: {
  gravity: number; atmosphereComp: number; atmosphereDensity: number
  temperature: number; hazard: number; hazardIntensity: number
  biochem: number; biosphere: number
}
atmosphereCompositionAbiotic: AtmosphereComposition  // pre-conversion
wasSelectedAsMainworld: boolean
hasSubsurfaceOceanOverride: boolean
wasShepherded: boolean

// StarSystem additions:
mainworldId: string
mainworldSelectionLog: {
  candidates: Array<{ id: string; score: number; rank: number }>
  tiebreakerApplied: boolean
  fallbackTriggered: boolean
}
```

#### Affected Files

| File | Change |
|------|--------|
| `src/lib/habitabilityPipeline.ts` | NEW — 10-step waterfall + mainworld selection |
| `src/lib/worldData.ts` | Revised temperature/hazard/intensity tables, zone DM table, gravity ladder |
| `src/lib/generator.ts` | Replace `generateMainWorld` with candidate scoring + selection |
| `src/types/index.ts` | `baselineHabitability`, `habitabilityBreakdown`, `mainworldSelectionLog` |
| `src/components/SystemViewer.tsx` | Candidate ranking display, habitability breakdown per body |

#### Open Questions

- Zone DM values (Infernal +5 through O5 −8) need batch validation
- Shepherded body re-evaluation: temperature only, or also hazard/biochem?
- B3→B4 boundary jump (+2 to +4) may cause tie clustering
- Should extreme negative scores have a floor, or let MVT/GVT handle arbitrarily hostile worlds?

---

### 14.6 FR-045 — Sector Generation Mode (3D Star Map Integration) *(📋 Planned)*

**Status:** Planned — new cross-repo feature  
**Companion specs:**
- `3d-interstellar-map/frd.md` §FR-011 / FR-012 / FR-013 / FR-014 (consumer & host)
- `2d-star-system-map/FRD.md` §8 Sector-Hosted Mode (consumer)

**Depends on:** FR-041 (composition), FR-042 (positioning), FR-043 (habitability), FR-044 (moons). Batch generation pipeline (1 000-world harness) is the execution substrate.

#### Motivation

MWG currently generates **one system at a time**. The 3D Interstellar Map ships a catalogue of real stars (10/50/100 pc) as static JSON but has no planetary content. Users want to:

1. Open a 3D sector (say, the 50 pc catalogue), and have MWG generate a complete world record for **every** star in that sector in a single pass.
2. Set a **Sector Age** and **campaign goals** that steer every generated world consistently (so a 2300 CE "Frontier Expansion" sector feels different from a 3500 CE "Collapse" sector).
3. Persist the sector. Clicking any star in the 3D map opens that star's full MWG record or its 2D system map.
4. Treat the 3D map as the **host / container** — the sector lives there, MWG is the generator, the 2D map is the drill-down viewer.

#### Scope

A new generation mode — parallel to single-world and 1 000-world batch — that consumes the 3D map's star catalogue JSON and emits a `SectorFile`.

#### Inputs

1. **3D star catalogue** (`stars-10pc.json` / `stars-50pc.json` / `stars-100pc.json`, or an uploaded custom catalogue conforming to the same schema).
   - Each entry: `{ id, name, x, y, z, spec, absMag }` (from 3D map FR-007).
   - MWG reuses `spec` (spectral class) + `absMag` to derive stellar mass/luminosity rather than re-rolling a random star.
2. **Sector Age** (new global setting — see §14.6 Data Model).
3. **Sector Goals preset** (new settings panel — see §14.6 Goal Settings).
4. **Existing presets** — Life Assumptions (FR-041), Economic Presets (§7.2), positioning + habitability settings all apply per-system.

#### Outputs — `SectorFile`

```typescript
interface SectorFile {
  schemaVersion: '1.0'
  sectorId: string                    // uuid
  sectorName: string                  // user-supplied, e.g. "Near Sol 50 pc — 2300 CE"
  catalogueSource: string             // e.g. "stars-50pc.json" or uploaded filename
  catalogueHash: string               // sha256 of the input catalogue (for integrity)

  sectorAge: SectorAge                // see §14.6 Data Model
  goals: SectorGoals                  // see §14.6 Goal Settings
  lifeAssumptionsPresetId: string
  economicPresetId: string

  generatedAt: string                 // ISO 8601
  generatorVersion: string            // MWG semver
  rngSeed: string                     // master seed for reproducibility

  systems: SectorSystemRecord[]       // one per input star
}

interface SectorSystemRecord {
  starId: string                      // matches the 3D catalogue id
  starPosition: { x: number; y: number; z: number }  // pc, copied from catalogue for convenience
  catalogueName: string               // e.g. "Alpha Centauri A"
  starSystem: StarSystem              // the full generated MWG StarSystem (types/index.ts)
  generationLog: {
    seed: string                      // per-system seed (derived from master + starId)
    mainworldSelectionLog: MainworldSelectionLog     // from FR-043
    ejectedBodies: number
    consumedBodies: number
  }
}
```

Stars in the catalogue that MWG cannot honestly resolve (e.g. unresolved binaries, white dwarfs, catalogue gaps in `absMag`) are emitted with `starSystem = null` and a `skipReason` string. They remain visible in the 3D map as "ungenerated".

#### Sector Age

A new top-level setting on the Sector Generation panel.

```typescript
interface SectorAge {
  calendarEra: 'CE' | 'HE' | 'custom'
  year: number                        // e.g. 2300
  label?: string                      // display override, e.g. "Imperial Year 1105"
  yearsSinceColonisation?: number     // optional — derived if the preset implies it
}
```

**Generation effects (applied per-system):**

| Age bracket | Tech Level bias | Population bias | Starport-A probability | Ships-in-Area mix |
|---|---|---|---|---|
| Pre-industrial (< 1900 CE) | TL cap = 4 | Low | None | Sail-era only (N/A) |
| Industrial (1900–2100) | TL cap = 8 | Medium | Rare | Mostly small craft |
| Early interstellar (2100–2400) | TL 8–12 | Colonial, front-loaded to mainworld | Uncommon | Frontier skew |
| Mature interstellar (2400–3000) | TL 10–14 | FR-040 distribution fully applied | Common | Mixed civilian + warship |
| Fallen / Post-collapse (user flag) | TL random ±4 per system | Depopulation roll 2D6 → x0.01–x1.0 | Rare | Scavenger-heavy |

Sector Age replaces the per-world era DM only when the "Override per-world TL" flag on Sector Goals is enabled. Otherwise Sector Age is an **upper cap** and the existing TL roll runs.

#### Goal Settings

A new settings panel (sibling to Life Assumptions). A "Sector Goals" preset is a bag of knobs that steer what kind of sector the generator emits.

```typescript
interface SectorGoals {
  id: string
  name: string                          // "Frontier Expansion", "Collapse", "Golden Age", "Survey Bureau"
  description: string

  // Aggregate shape
  targetInhabitedFraction: number       // 0..1 — target fraction of systems with pop > 0
  mainworldTlCap?: number               // hard cap across the sector
  mainworldTlFloor?: number             // hard floor
  overridePerWorldTl: boolean           // if true, sector sets TL; if false, sector only biases

  // Civilisation shape
  naval: 'none' | 'scattered' | 'dominant'
  scout: 'none' | 'present' | 'active'
  pirateProbability: number             // 0..1 — DM into §5 Starport Base table
  redZoneProbability: number            // 0..1 — boosts REF-010 Red Zone triggers
  amberZoneProbability: number

  // Generation determinism
  masterSeed?: string                   // if omitted, random; if set, sector is reproducible

  // Guardrails
  allowUngeneratable: boolean           // if false, skipReason systems are filled with a placeholder
}
```

**Built-in presets (v1):**

| Preset | Inhabited | TL cap/floor | Naval | Pirates | Red Zones |
|---|---|---|---|---|---|
| Frontier Expansion | 35% | 12 / 8 | scattered | 15% | 8% |
| Golden Age | 70% | 15 / 11 | dominant | 2% | 2% |
| Collapse / Dark Age | 45% | 10 / 4 | none | 35% | 20% |
| Survey Bureau (Pristine) | 5% | 14 / 12 | scattered | 0% | 30% |
| Mneme Default | — | — | present | 10% | 10% |

`mneme_sector_goals_presets` localStorage key (custom), active id in `mneme_generator_options.activeSectorGoalsPresetId`.

#### Generation Algorithm

```
input: catalogue[], sectorAge, goals, lifePreset, econPreset, masterSeed
output: SectorFile

1. Derive per-star seeds: seed[i] = hash(masterSeed || starId[i])
2. Sector aggregate pre-pass:
   - inhabitedCount = round(catalogue.length × goals.targetInhabitedFraction)
   - Select which stars are inhabited (weighted by habitability prior: G/K/F > M > others)
3. For each star in catalogue:
   a. Use catalogue spec + absMag to build `primaryStar` (skip §5 random star roll)
   b. Run FR-042 positioning → FR-041 composition → FR-043 habitability for all candidates
   c. Apply Sector Age TL cap + Goals TL floor/cap
   d. If this star was not marked inhabited in step 2, force population = 0 (empty system — main world
      still selected for reference, but no inhabitants, starport X, no ships)
   e. Assemble SectorSystemRecord; log per-system stats
4. Assemble SectorFile; sign with catalogueHash + generatorVersion
5. Offer "Download sector", "Open in 3D map" (cross-app handoff — see 3D FR-011)
```

#### UI

- **New tab:** "Sector Generator" (between "Batch" and "Settings").
- Catalogue chooser (10 pc / 50 pc / 100 pc / upload custom JSON).
- Sector Age picker (era + year slider).
- Goals preset selector + custom preset builder.
- "Generate Sector" button → progress bar per system (generation is not instant — 50 pc catalogue is ~130 stars, 100 pc is ~13 000 and may require web-worker offload).
- Result panel: summary table (inhabited, ejected bodies total, mainworld TL distribution, starport distribution).
- Export:
  - "Download .sector.json" (raw SectorFile)
  - "Open in 3D Map" — constructs cross-app URL with the SectorFile (too large for URL — see §14.6 Handoff below).

#### Cross-App Handoff (MWG → 3D map)

`SectorFile` is far too large for URL-encoding (50 pc ≈ 1–3 MB, 100 pc ≈ 100 MB). Options:

1. **Direct download + upload** (v1): MWG writes `.sector.json` to disk; user uploads it to 3D map.
2. **Hosted handoff** (v1.1): MWG writes to `IndexedDB` keyed by `sectorId`; 3D map (same origin family) reads via a shared `BroadcastChannel('gi7b-sector-bus')` — both apps are under `game-in-the-brain.github.io` so shared origin is viable. 3D map persists to its own IndexedDB on receipt.
3. **PostMessage** (fallback): MWG `window.open`s 3D map, then posts the SectorFile over `postMessage` with origin check.

v1 **must** support option 1 (file download/upload) so sectors are portable without origin constraints. Option 2 is a v1.1 convenience.

#### Data Model Additions

```typescript
// types/index.ts
interface SectorAge { /* as above */ }
interface SectorGoals { /* as above */ }
interface SectorSystemRecord { /* as above */ }
interface SectorFile { /* as above */ }

// StarSystem additions (optional, populated only in sector mode):
sectorId?: string
sectorCoordinates?: { x: number; y: number; z: number }
sectorAge?: SectorAge
sectorGoalsId?: string
```

#### localStorage Keys

| Key | Purpose |
|---|---|
| `mneme_sector_goals_presets` | Array of custom SectorGoals |
| `mneme_sector_age_last` | Last-used SectorAge (convenience) |
| `mneme_sector_generator_options` | Catalogue choice, active goals id, master seed |

`SectorFile`s themselves are **not** stored in MWG localStorage — they can be megabytes and belong on disk or in the 3D map's IndexedDB.

#### Affected Files

| File | Change |
|---|---|
| `src/types/index.ts` | `SectorAge`, `SectorGoals`, `SectorFile`, `SectorSystemRecord` |
| `src/lib/sectorGenerator.ts` | NEW — orchestrates per-star generation from a catalogue |
| `src/lib/sectorGoalsPresets.ts` | NEW — built-in presets + storage helpers |
| `src/lib/starFromCatalogue.ts` | NEW — derive `primaryStar` from spec + absMag instead of rolling |
| `src/lib/generator.ts` | Accept optional `primaryStarOverride` and `sectorContext` parameters |
| `src/components/SectorGenerator.tsx` | NEW — the new tab |
| `src/components/Settings.tsx` | Sector Goals preset panel |
| `src/lib/optionsStorage.ts` | Persist sector generator options |
| `src/lib/sectorHandoff.ts` | NEW — BroadcastChannel + postMessage helpers (v1.1) |

#### Acceptance Criteria

- [ ] Loading `stars-50pc.json` and generating with default presets produces a `SectorFile` where every entry either has a `starSystem` or a populated `skipReason`.
- [ ] The same `masterSeed` + same catalogue + same presets produces a byte-identical `SectorFile` (modulo `generatedAt`).
- [ ] Sector Age "2300 CE — Early interstellar" caps mainworld TL at 12 across the sector.
- [ ] Goals preset "Collapse" lowers the mean TL and raises pirate starport frequency versus "Golden Age" on the same catalogue + seed.
- [ ] `.sector.json` can be downloaded, then uploaded to the 3D map, and the 3D map lights up every previously-generated star as clickable.
- [ ] 100 pc catalogue generation runs on a web worker so the UI remains responsive; a progress bar updates at least every 50 systems.

#### Open Questions

- Binary/trinary handling: does MWG roll a companion when the catalogue already lists the system as multiple stars (e.g. α Cen A + B are separate catalogue entries)? **Proposed:** treat as separate entries unless their IDs are linked via a `companionGroupId` catalogue field (requires 3D map catalogue schema addition).
- Sector re-generation with partial edits (user tweaks one system manually and then wants to regenerate only the rest): v2 feature. v1 is all-or-nothing.
- Memory ceiling for 100 pc catalogue in the browser — may need streaming write to a File System Access API handle rather than in-memory SectorFile assembly.

---

## 16. Reference Documents

The following reference documents contain detailed tables and implementation notes:

| Reference | Title | Description |
|-----------|-------|-------------|
| [REF-001](./references/REF-001-stellar-tables.md) | Stellar Tables | Class, mass, and luminosity lookup tables |
| [REF-002](./references/REF-002-companion-star.md) | Companion Star Logic | Detailed companion generation with chain rule |
| [REF-003](./references/REF-003-orbit-table.md) | Orbit Table | Companion star orbital distances |
| [REF-004](./references/REF-004-world-type-tables.md) | World Type & Size Tables | World type and size generation |
| [REF-005](./references/REF-005-world-position-table.md) | World Position Table | 25-combination zone lookup table |
| [REF-006](./references/REF-006-culture-table.md) | Culture Table | D66 × D6 cultural traits table |
| [REF-007](./references/REF-007-planetary-systems-table.md) | Planetary Systems Table | Body mass generation |
| [REF-008](./references/REF-008-gas-world-classification.md) | Gas World Classification | Class I-V determination |
| [REF-009](./references/REF-009-disk-zone-table.md) | Disk Zone Table | Circumstellar disk zone determination |
| [REF-010-travel-zone](./references/REF-010-travel-zone.md) | Travel Zone v1.3 | Full Travel Zone mechanic — Amber auto-triggers, Red Zone procedural generation, Stability Mode, Reason table |
| [REF-010-densities](./references/REF-010-planet-densities.md) | Planet Type Densities | Density values + formulas for radius, surface gravity, escape velocity |
| [REF-011](./references/REF-011-hill-sphere-orbits.ts) | Hill Sphere Orbits | TypeScript implementation of orbital placement with Hill sphere spacing (source for section 8.6) |
| [REF-012](./references/REF-012-csv-export-format.md) | CSV Export Format | Wide-row format spec, key naming convention, column reference |
| [REF-013](./references/REF-013-tech-level.md) | Technology Level Reference | Full MTL table with CE TL, CE/HE years, era names, key technologies, and glossary terms |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-09 | Initial FRD |
| 1.1 | 2026-04-09 | Added visual design spec, clarified companion star logic, added reference document index |
| 1.2 | 2026-04-09 | Fixed REF-001 mass/luminosity values, corrected temperature bounds, added Governance DM table, documented Red Zone as manual-only, clarified 6.9 gravity modifier input |
| 1.3 | 2026-04-10 | Logo + GitHub link added (QA-002); title corrected to "Mneme CE World Generator" (QA-001); Phone theme spec added (QA-005); Hot Jupiter migration rule added (8.4a, QA-011); Hill Sphere minimum separation documented (QA-006); Adv/Dis planet roll bug fixed (QA-007); Physical properties added to PlanetaryBody interface (QA-009); Ice Worlds label fixed (QA-008); single-page tab nav specified (QA-010); number formatting spec added (QA-004); CSV export format specified (QA-ADD-002); REF-010-planet-densities.md and REF-012-csv-export-format.md created; QA.md created and linked throughout |
| 1.4 | 2026-04-10 | REF-007 v1.1 house rule applied (G=baseline, K=Dis+2, M=Dis+4); REF-013 tech level reference created; Section 7.1 expanded with full MTL table, CE TL, era names, key technologies; REF-013 added to reference index |
| 1.5 | 2026-04-11 | FR-028: Generator options persistence — added section 10.3 specifying localStorage key `mneme_generator_options` for starClass, starGrade, mainWorldType, populated |
| 1.6 | 2026-04-14 | Added culture trait reroll rule to section 7.10; updated REF-006 culture table notes |
| 1.7 | 2026-04-14 | FR-029: Added Weekly Activity Roll Button spec to Section 7.8; QA-020/021 marked fixed |
| 1.8 | 2026-04-14 | FR-030: Added Ships in the Area spec (Section 7.10); updated ship reference files with `monthly_operating_cost_cr` |
| 1.9 | 2026-04-14 | FR-030 Step 3: Added `traffic_pool` field to all 35 ships in `mneme_ship_reference.json`; added `traffic_pool_map` header object; FRD Step 3 updated to specify `traffic_pool` as the filter field — implementation must not re-derive pool membership from `category` |
| 2.0 | 2026-04-14 | Open items audit: FR-028/QA-018, FR-029, FR-030, QA-022 confirmed open and implementation-ready; QA-023 proposed/pending approval; all specs verified complete against reference data |
| 2.1 | 2026-04-14 | FR-030 Step 3: traffic_pool values corrected to short lowercase keys (`"small"`, `"civilian"`, `"warship"`) to match shipsInArea.ts implementation |
| 2.2 | 2026-04-14 | FR-030 Step 5: "In System" ships now roll a body index 1–N (total planetary bodies); display as "In System — Body N"; zero-body fallback to Orbit; see QA-024 |
| 2.3 | 2026-04-17 | QA-056/057/058/061: §7.2 population rewritten for productivity-ratio model (QA-061); §7.8 Starport PSS formula updated (avg-SOC GDP, wealthMult removed, ÷364→÷52, new class thresholds); §10.4.5 pipeline updated to match; §14.1 FR-040 Intrastellar Population Distribution spec added |
| 2.4 | 2026-04-17 | §14.2 FR-041 Composition–Atmosphere–Biosphere Pipeline Redesign added — full spec with composition tables, abiotic atmosphere, 11-tier biochem, biosphere test/rating (B0–B6), atmosphere conversion, and Extraterrestrial Life Assumptions settings |
| 2.5 | 2026-04-17 | §14.3 FR-042 Positioning System Redesign added — unified 3D6 roll, 4-phase placement, O1–O5 outer zones, reversed Hot Jupiter stability roll, disk-blocking, rogue worlds, Proto-Star/Brown Dwarf promotion |
| 2.6 | 2026-04-17 | §14.4 FR-043 Habitability Application & Mainworld Selection added — 10-step waterfall, TL separated from Baseline, zone temperature DMs, biosphere-temperature link, subsurface ocean override, competitive selection with tiebreakers, revised gravity ladder |
| 2.7 | 2026-04-19 | §14.6 FR-045 Sector Generation Mode added — consumes 3D star map catalogues, emits SectorFile with per-system MWG records; Sector Age + Sector Goals presets; cross-app handoff to 3D Interstellar Map (hosts sector) and 2D Star System Map (drill-down). Companion specs added to `3d-interstellar-map/frd.md` and `2d-star-system-map/FRD.md` |
