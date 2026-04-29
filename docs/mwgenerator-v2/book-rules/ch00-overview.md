# Mneme World Generator, Version 2 — Overview

**Section:** Mneme CE World Generator / Book Rules  
**Repository:** [github.com/Game-in-the-Brain/Mneme-CE-World-Generator](https://github.com/Game-in-the-Brain/Mneme-CE-World-Generator)  
**Book:** [Mneme World Generator on DriveThruRPG](https://www.drivethrurpg.com/en/product/403824/MNEME-World-Generator)  
**Wiki:** [Game Projects — GI7B Wiki](https://wiki.gi7b.org/index.php/Game_Projects)

---

## What This Is

The Mneme World Generator is a procedural worldbuilding tool for the Cepheus Engine RPG. It produces a complete star system — star, main world, inhabitants, full planetary system — in a fraction of a second. The generator exists in two forms:

1. **The book** (pen-and-paper): dice tables, modifiers, and procedures a referee works through by hand
2. **The software** (this repo): a Progressive Web App that automates the same rules

This documentation section covers Version 2 of the generator. Each chapter documents the rules *as rolled* — dice tables, modifiers, decision trees, worked examples. A referee should be able to run through any chapter with pen, paper, and a handful of D6s. Where the software departs from the published book rules (e.g. algorithmic substitutes for manual lookup tables), those decisions are noted and explained.

---

## Design Philosophy

The MWG follows one governing principle:

> **Simulate what's playable. Abstract what isn't. Use real observations as the audit.**

A realistic universe simulator and a usable worldbuilding tool are not the same thing. Real stellar systems are dynamically unstable on million-year timescales. Real binary stars routinely fling planets out of their orbits. Real Hot Jupiters migrate inward over astronomical timescales and consume worlds. None of this is playable in a generator that has to produce 1,000 systems in 0.3 seconds and hand the referee a finished, coherent setting.

The design rule is therefore tripartite:

### 1. Simulate What's Playable

Where the underlying physics produces outcomes a referee cares about — surface gravity, atmosphere composition, orbital position — and those outcomes can be computed from first principles in a single pass, the generator models them directly. The habitability waterfall (Chapter 5) is the clearest example: ten sequential steps, each consuming the output of the previous one, producing a final habitability score that determines population, starport class, and travel zone.

### 2. Abstract What Isn't

Where the physics would require N-body integration over geological time, the generator substitutes a *physically defensible boundary* that prevents impossible outcomes by construction. The clearest example is companion star placement (Chapter 7): instead of testing whether a given orbit is dynamically stable (computationally prohibitive), the generator places companions at separations that guarantee the Holman-Wiegert stability cone falls outside the planetary disk. It excludes known problem configurations (close binaries, circumbinary planets) rather than generating them and hoping they work.

### 3. Use Real Observations as the Audit

Every major parameter in the generator — stellar class distribution, mean planets per system, inner-zone atmosphere stripping rate, habitable-zone mainworld share — is tested against real exoplanet data. The batch validation system (Chapter 8) runs 1,000 systems, aggregates statistics, and flags any distribution that diverges meaningfully from RECONS solar-neighbourhood data, Kepler's bias-corrected η-Earth, or JWST atmosphere measurements. When the data says the model is wrong, the model changes — not the other way around.

This practice caught two errors during the Version 2 development:

- An `opts` propagation bug silently disabled all v2 features during generation (fixed)
- The original validation targets for Conservative-zone mainworld share (60–75%) and Infernal Toxic+ rate (25–35%) were *anthropic assumptions*, not observationally grounded (revised to 30–50% and 70–90% respectively)

---

## What Changed in Version 2

Version 2 is not a minor rules tweak. It replaces three core subsystems and adds a fourth:

### New in v2

| Module | Book Chapter | Change |
|--------|-------------|--------|
| Positioning | Chapter 3 | Flat zone rolls replaced by a 4-phase placement algorithm with Hill-sphere conflict resolution |
| Composition–Atmosphere–Biosphere | Chapter 4 | Single lookup tables replaced by a unified dice-pool biosphere test with composition-dependent chemistry |
| Habitability Waterfall | Chapter 5 | Zone-blind habitability replaced by a 10-step pipeline where zone position feeds temperature, hazard, and biosphere independently |
| Multi-Star Hierarchy | Chapter 7 | Cosmetic companion-star array replaced by a recursive hierarchical orbit tree with barycenter math and Holman-Wiegert stability guarantees |

### Preserved unchanged

| Module | Notes |
|--------|-------|
| Dice engine | Same roll types, Adv/Dis system, notation (see Chapter 1) |
| Star generation | Same OBAFGKM class table, grade rolls, zone formulae (see Chapter 2) |
| Inhabitants | Same TL/pop/wealth/power/development tables (see Chapter 6) |
| Starport | Same Port Value Score calculation (see Chapter 6) |
| Gas world classification | Same 5D6 → Class I–V table (see Chapter 3, zone positioning) |

---

## Feature Flags

The software implements v2 changes behind feature flags. This allows toggling individual v2 subsystems on and off for testing, comparison, or backward compatibility.

| Flag | Default | Effect When On |
|------|---------|----------------|
| `v2Positioning` | `true` | Enables the 4-phase placement algorithm, Hill-sphere conflict resolution, disk-blocking rule, and Hot Jupiter stability roll |
| `v2MultiStar` | `true` | Enables the hierarchical orbit tree, 3D3 × heliopause separation, barycenter math, and stability re-roll |

When both flags are off, the generator falls back to the v1 rules (book tables, flat companion array, zone-blind habitability).

---

## How to Read This Documentation

Each chapter is a standalone document that fits a single LLM context window (roughly 500-1500 lines). Chapters are arranged in the order a referee would generate a system:

| Chapter | Title | What It Covers |
|---------|-------|----------------|
| 0 | Overview | (this page) |
| 1 | Dice Engine | Roll types, Adv/Dis pool system, notation |
| 2 | Star Generation | Class table, zone calculation, companion existence and orbits |
| 3 | Zone Architecture & Positioning | Zone IDs, 4-phase placement, Hill spheres, disk generation |
| 4 | Composition, Atmosphere & Biosphere | World type, density, biochemistry, biosphere test |
| 5 | Habitability Waterfall | 10-step pipeline, zone radiation hazard (QA-064), HZ biosphere bonus |
| 6 | Inhabitants | TL, population, wealth, power, development, starport, travel zones |
| 7 | Multi-Star Hierarchy | 3D3 × heliopause separation, barycenter math, orbit tree (QA-065) |
| 8 | Batch Validation | Methodology, targets, deviation tables, empirical findings |
| 9 | Open Issues & Roadmap | QA tracker, planned features (FRD-065 through FRD-067) |

Each chapter follows a consistent format:

1. **Science context** — the real-world phenomenon the rule models
2. **The rule** — dice rolls, tables, modifiers, decision trees
3. **Worked example** — a concrete walkthrough with dice results
4. **Software notes** — where the code departs from the pen-and-paper rule and why
5. **Validation targets** — observational benchmarks the rule is tested against

---

## License

This documentation describes variant rules for the Cepheus Engine RPG. The Mneme Variant Rules are open gaming content. See the [OGL](https://wiki.gi7b.org/index.php/Mneme_World_Generator/OGL) for the full license text.

The source code in this repository is MIT-licensed.
