# Mneme World Generator, Version 2 — Book Rules

**Repository:** [github.com/Game-in-the-Brain/Mneme-CE-World-Generator](https://github.com/Game-in-the-Brain/Mneme-CE-World-Generator)  
**Published book:** [Mneme World Generator on DriveThruRPG](https://www.drivethrurpg.com/en/product/403824/MNEME-World-Generator)  
**Wiki (published version):** [Game Projects — GI7B Wiki](https://wiki.gi7b.org/index.php/Game_Projects)

---

## What This Is

A chapter-by-chapter rules reference for the Mneme World Generator, Version 2. Each chapter documents the rules **as rolled** — dice tables, modifiers, decision trees, worked examples. A referee should be able to run through any chapter with pen, paper, and a handful of D6s.

These files are sized for LLM context windows (~500–1500 lines each). For the published version with print/PDF export, see the [GI7B Wiki](https://wiki.gi7b.org).

---

## Chapters

| # | File | Covers |
|---|------|--------|
| 0 | [ch00-overview.md](./ch00-overview.md) | Design philosophy, version history, feature flags, how to read this documentation |
| 1 | [ch01-dice-engine.md](./ch01-dice-engine.md) | Roll types, Adv/Dis pool system, notation mapping |
| 2 | [ch02-star-generation.md](./ch02-star-generation.md) | Primary star class/grade tables, zone calculation, companion existence and orbits, tech level |
| 3 | [ch03-zone-positioning.md](./ch03-zone-positioning.md) | Zone IDs (Infernal→O5), unified 3D6 placement, 4-phase algorithm, Hill spheres, Hot Jupiter stability |
| 4 | [ch04-composition-atmo-biosphere.md](./ch04-composition-atmo-biosphere.md) | World type & size, composition tables (3D6), density, gravity, abiotic atmosphere, biochem, biosphere test, atmosphere conversion |
| 5 | [ch05-habitability-waterfall.md](./ch05-habitability-waterfall.md) | 10-step pipeline, zone radiation hazard (QA-064), HZ biosphere bonus, validation targets |
| 6 | [ch06-inhabitants.md](./ch06-inhabitants.md) | TL, population, wealth, power structure, development, governance, source of power, starport, travel zones |
| 7 | [ch07-multi-star.md](./ch07-multi-star.md) | 3D3 × heliopause separation, Holman-Wiegert stability, barycenter math, Kepler periods, orbit tree (QA-065) |
| 8 | [ch08-batch-validation.md](./ch08-batch-validation.md) | Methodology, stellar class distribution, habitability targets, retune impact, known deviations |
| 9 | [ch09-open-issues.md](./ch09-open-issues.md) | QA tracker (QA-066 through QA-072), Neil Lucock recommendations, future FRDs, open design questions |

---

## How to Use

1. **Start with Chapter 0** for design philosophy and feature flag explanation
2. **Generate a system in order:** Chapters 1 → 2 → 3 → 4 → 5 → 6
3. **Multi-star systems:** Add Chapter 7 between Chapters 5 and 6
4. **Check your work:** Chapter 8 tells you what distributions to expect
5. **What's coming:** Chapter 9 tracks known issues and planned features

---

## Relationship to the Wiki

The [GI7B Wiki](https://wiki.gi7b.org/index.php/Game_Projects) contains the published version of this documentation with MediaWiki formatting, cross-links, and print/PDF export via the Book Creator tool. These markdown files are the source — changes flow from here to the wiki.

The companion file at `../implementation/wiki-posting-instructions.md` contains instructions for publishing to the wiki.

---

## License

This documentation describes variant rules for the Cepheus Engine RPG. The Mneme Variant Rules are open gaming content. See the [OGL](https://wiki.gi7b.org/index.php/Mneme_World_Generator/OGL) for the full license text.

The source code in the repository is MIT-licensed.
