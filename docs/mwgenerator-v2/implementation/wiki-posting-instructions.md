# DeepSeek Instructions — Mneme CE World Generator Wiki Documentation

**Date:** 2026-04-27
**For:** DeepSeek (or any LLM writing agent) tasked with creating wiki documentation
**Wiki:** https://wiki.gi7b.org — MediaWiki instance with nginx basic auth
**Wiki index page:** https://wiki.gi7b.org/index.php/Game_Projects

---

## Your Task

You are a technical documentation writer. You must create a structured, chapter-organised MediaWiki documentation section for the **Mneme CE World Generator** (MWG) — a procedural tabletop RPG world-generation tool. All documentation goes to the wiki at https://wiki.gi7b.org.

The MWG wiki section must:

1. Mirror the chapter structure defined below (same structure as the original FRD).
2. Document **all changes** made as of 2026-04-27, including QA-064 (zone radiation + HZ biosphere) and QA-065 (multi-star hierarchy). See source files listed in each chapter.
3. Use proper MediaWiki markup (wikitext) for all pages.
4. Tag every page so the section can be collected as a printable book or exported to PDF.

---

## Wiki Structure

Create one wiki page per chapter, plus a landing/index page. Page titles follow the naming convention:

```
Mneme CE World Generator
Mneme CE World Generator/Chapter 1 - Overview
Mneme CE World Generator/Chapter 2 - Dice Engine
Mneme CE World Generator/Chapter 3 - Star Generation
Mneme CE World Generator/Chapter 4 - Zone Architecture and Positioning
Mneme CE World Generator/Chapter 5 - Composition Atmosphere Biosphere
Mneme CE World Generator/Chapter 6 - Habitability Waterfall
Mneme CE World Generator/Chapter 7 - Inhabitants Module
Mneme CE World Generator/Chapter 8 - Multi-Star Hierarchy
Mneme CE World Generator/Chapter 9 - Batch Validation and Testing
Mneme CE World Generator/Chapter 10 - Open Issues and Roadmap
```

---

## MediaWiki Markup Requirements

### Every page must start with:

```mediawiki
{{MWG Documentation Header}}
__TOC__
```

### Every page must end with:

```mediawiki
[[Category:Mneme CE World Generator]]
[[Category:MWG Documentation]]
[[Category:Printable]]
```

### Navigation footer on every page:

```mediawiki
----
<div class="noprint">
{{MWG Navigation|prev=[[Mneme CE World Generator/Chapter N-1 - Previous|← Previous]]|next=[[Mneme CE World Generator/Chapter N+1 - Next|Next →]]}}
</div>
```

### Tables: use `{| class="wikitable sortable"` format. Example:

```mediawiki
{| class="wikitable sortable"
! Column A !! Column B !! Column C
|-
| value || value || value
|}
```

### Code blocks: use `<syntaxhighlight lang="typescript">` ... `</syntaxhighlight>`.

### Print-only notes (appear in print/PDF but not on screen):

```mediawiki
<div class="print-only">See companion document: Mneme CE World Generator FRD v02.</div>
```

### Section anchors: every `==` heading automatically gets an anchor in MediaWiki. Use `[[#Section Name|link text]]` for cross-references within a page.

### Inter-page cross-references: use full page path:

```mediawiki
[[Mneme CE World Generator/Chapter 6 - Habitability Waterfall#Zone Radiation Hazard|Zone Radiation DM table]]
```

---

## Templates to Create First

Before writing chapter pages, create these two templates:

### Template:MWG Documentation Header

```mediawiki
<div style="background:#1a1a2e;color:#e0e0ff;padding:0.5em 1em;border-left:4px solid #7b68ee;">
'''Mneme CE World Generator''' — Official Documentation · [[Mneme CE World Generator|Index]] · [[Game_Projects|Game Projects]]
</div>
```

### Template:MWG Navigation

```mediawiki
<div style="display:flex;justify-content:space-between;padding:0.5em 0;">
{{{prev|}}} &nbsp;&nbsp; {{{next|}}}
</div>
```

---

## Chapter Content Instructions

Write each chapter page using the sources listed. Summarise rules as tables and pseudocode where possible. Avoid reproducing full TypeScript source verbatim — describe the algorithm and show the key formula or lookup table. Use worked examples liberally.

---

### Chapter 1 — Overview

**Page title:** `Mneme CE World Generator/Chapter 1 - Overview`

**Sources:**
- `260409-v02 Mneme-CE-World-Generator-FRD.md` §1–2 (Executive Summary, Design Decisions)
- `260427-blog-update-summary.md` (design philosophy: "simulate what's playable, abstract what isn't, use real observations to audit")

**Sections:**
1. What the MWG Is
2. Design Philosophy (observation-as-audit, INRAS single-star constraint, playable vs. simulatable)
3. Version History (v1 → v2 redesign highlights)
4. Feature Flags (v2Positioning, v2MultiStar) — explain each flag, default state, and what it unlocks
5. How to Read This Documentation

---

### Chapter 2 — Dice Engine

**Page title:** `Mneme CE World Generator/Chapter 2 - Dice Engine`

**Sources:**
- `260409-v02 Mneme-CE-World-Generator-FRD.md` §4

**Sections:**
1. Basic Roll Types (D6, 2D6, 3D6, percentile)
2. Advanced Rolls (keep-highest, keep-lowest, advantage/disadvantage)
3. Advantage/Disadvantage Pool System — document the `disLevel` integer: negative = advantage, positive = disadvantage, zero = straight. Pool size = 5 + |disLevel|. Roll 5D6 straight, or (5+n)D6 keep lowest 5 (disadvantage), or (5+n)D6 keep highest 5 (advantage).
4. 3D3 Roll — used for companion star separation. Sum three 3-sided dice; range 3–9, mean 6.
5. Dice Notation Mapping table (2D6 vs 3D6 vs 2D6+DM etc.)

---

### Chapter 3 — Star Generation

**Page title:** `Mneme CE World Generator/Chapter 3 - Star Generation`

**Sources:**
- `260409-v02 Mneme-CE-World-Generator-FRD.md` §5.1–5.5
- `src/lib/stellarData.ts` (class/grade tables, heliopause formula)

**Sections:**
1. Primary Star Generation (class distribution table: M 69%, K 15%, G 10%, F 4%, A 1.2%, B 0.4%)
2. Zone Calculation — heliopause formula: `heliopause_AU = sqrt(luminosity) × 120`. Zone boundaries from FRD §5.2.
3. Companion Star Existence & Class (REF-002 existence check, class/grade roll, no-loops constraint)
4. Companion Separation — v1 legacy (REF-003 AU bands) vs v2MultiStar (3D3 × heliopause — see Chapter 8)
5. Stellar Classification Visual Reference (class + grade → colour/temperature table)

---

### Chapter 4 — Zone Architecture and Positioning

**Page title:** `Mneme CE World Generator/Chapter 4 - Zone Architecture and Positioning`

**Sources:**
- `260417-03 MWG-REDESIGN-consolidated-v1.md` §4 (FR-042 Positioning)
- `2600417-01 MWG-REDESIGN-positioning.md`

**Sections:**
1. Zone IDs — table: Infernal, Hot, Conservative, Cool, FrostLine, O1–O5 with AU boundaries for reference star class
2. Unified 3D6 Position Roll — how zone + sub-band is determined
3. Disk Generation (corrected formula for slot count per zone)
4. 4-Phase Placement Algorithm (gas giant first, rocky fill, conflict resolution, outer scatter)
5. Hill Sphere & Conflict Resolution
6. Disk-Blocking Rule
7. Hot Jupiter Stability Roll (QA-011 replacement)
8. Moon Zone Positioning (FR-044) — hill sphere bounds, 6 moon zones, Roche zone survival

---

### Chapter 5 — Composition, Atmosphere, and Biosphere

**Page title:** `Mneme CE World Generator/Chapter 5 - Composition Atmosphere Biosphere`

**Sources:**
- `260417-03 MWG-REDESIGN-consolidated-v1.md` §3 (FR-041)
- `260417-00 MWG-REDESIGN-composition-atmosphere-biosphere.md`

**Sections:**
1. World Type & Size (body type table: Terrestrial, Dwarf, Gas Giant, etc.)
2. Composition Tables (Terrestrial 3D6, Dwarf 3D6) — reproduce full tables with Reactivity DM column
3. Atmosphere Composition — Abiotic (3D6), include CO₂/N₂/other table
4. Atmosphere Density (2D6 + modifiers) — None/Trace/Thin/Standard/Dense/Thick
5. Biochemical Resources (3D6 + Reactivity DM) — None/Trace/Marginal/Common/Abundant/Rich table
6. Biosphere Test — Unified Dice Pool Formula. Show: `disLevel` starts at base, modifiers from Biochem, Temperature, HZ bonus. Pool = (5+|disLevel|)D6 keep high/low 5.
7. Biosphere Rating (B0–B6) — TN 20 check; rating table with narrative descriptions
8. Atmosphere Conversion Matrix — biosphere modifies atmosphere type; show full matrix
9. Extraterrestrial Life Assumptions Settings

---

### Chapter 6 — Habitability Waterfall

**Page title:** `Mneme CE World Generator/Chapter 6 - Habitability Waterfall`

**Sources:**
- `260417-03 MWG-REDESIGN-consolidated-v1.md` §6 (FR-043)
- `260417-02 MWG-REDESIGN-habitability-application.md`
- **`260427-01 MWG-REDESIGN-zone-radiation-and-hz-biosphere.md`** ← PRIMARY SOURCE for QA-064 changes
- `src/lib/habitabilityPipeline.ts`

**Sections:**

1. The 10-Step Waterfall — summary table:

   | Step | Name | Key Input | Output |
   |------|------|-----------|--------|
   | 1 | Atmosphere Composition | World type, biosphere | Atmo type |
   | 2 | Atmosphere Density | Atmo type | Density class |
   | 3 | Temperature | Zone, atmo density | Temp class |
   | 4 | **Hazard** | Composition reactivity, zone radiation | Hazard class |
   | 5 | Hazard Intensity | Hazard class | Intensity modifier |
   | 6 | Biochem Resources | Composition, reactivity | Biochem tier |
   | 7 | **Biosphere Test** | Biochem, temp, zone | Pass/fail + rating |
   | 8 | Biosphere Rating | Test result | B0–B6 |
   | 9 | Atmosphere Conversion | Biosphere rating | Final atmo |
   | 10 | Baseline Score | All modifiers | Habitability score |

2. Temperature Stacked Modifiers — zone temp DM table (+5 Infernal → −8 O5)

3. **Zone Radiation Hazard DM (QA-064 — 2026-04-27)**

   Explain: zone position now feeds the Hazard step, not just temperature.

   ```
   ZONE_HAZARD_DM:
   Infernal  +2   (intense UV/X-ray flux; atmosphere stripping; CME impact)
   Hot       +1   (significant stellar wind erosion; flare exposure)
   all other  0
   ```

   Justification: JWST atmosphere observations of TRAPPIST-1 b and c (atmosphere-bare or near-bare). Mercury and Venus provide inner solar system anchors. The +2 shifts outcomes by one full hazard tier (e.g. Corrosive → Toxic) for Infernal worlds.

   Show the hazard roll formula: `hazardRoll = 2D6 + reactivityDM + zoneHazardDM + atmoHazardBias`.

4. **Conservative HZ Biosphere Bonus (QA-064 — 2026-04-27)**

   Explain: worlds in the Conservative zone with Biochem ≥ Common receive a −2 disLevel bonus on the biosphere dice pool (shifts two dice from disadvantage toward advantage).

   Trigger conditions (BOTH required):
   - Zone = Conservative
   - Biochem index ≥ Common

   Probability table (before → after for three starting pool states):

   | Pool before bonus | Pool after | P(≥ TN 20) before | P(≥ TN 20) after |
   |---|---|---|---|
   | dis+2 (7D6 keep low 5) | dis+0 (5D6 straight) | ~14% | ~50% |
   | dis+0 (5D6 straight) | adv+2 (7D6 keep high 5) | ~50% | ~80% |
   | adv+1 (6D6 keep high 5) | adv+3 (8D6 keep high 5) | ~68% | ~88% |

   Note on tuning: initial magnitude was −1 (from design spec). After 1000-system empirical batch (2026-04-27), raised to −2. HZ biosphere ≥ B2 rate improved from 31.8% to 39.9% (+8.1 pp).

5. Outer Zones — Deliberate No-Op. Document that O1–O5 receive no additional hazard modifier. They already pay through severe cold (−4 to −8 temperature DM) and biochem failure rates. The subsurface ocean override (Europa archetype) remains viable.

6. Gravity Modifier (Symmetric) — from FRD §6.4

7. Mainworld Selection Algorithm — highest baseline score wins; tiebreaker rules

8. Subsurface Ocean Override (FR-043 §6.6) — conditions for outer-zone Hydrous Dwarf biosphere path

9. Validation Targets (post-retune, 2026-04-27):

   | Target | Expected | Tolerance | Actual (1000 systems) |
   |---|---|---|---|
   | Mainworld Conservative-zone share | 30–50% | ±5% | 47.2% ✓ |
   | Mainworld Hot+Infernal share | ≤ 20% | ±5% | 15.3% ✓ |
   | Infernal Toxic+ hazard rate | 70–90% | ±10% | 69.6% ✓ |
   | HZ biosphere ≥ B2 rate | informational | — | 39.9% |

   Explain why old targets (Conservative 60–75%, Infernal Toxic+ 25–35%) were wrong: they were anthropic assumptions, not observationally grounded. New targets are anchored to JWST TRAPPIST-1 observations and Kepler bias-corrected η-Earth (10–25% per FGK star).

---

### Chapter 7 — Inhabitants Module

**Page title:** `Mneme CE World Generator/Chapter 7 - Inhabitants Module`

**Sources:**
- `260409-v02 Mneme-CE-World-Generator-FRD.md` §7

**Sections:**
1. Tech Level — 2D6 → MTL table
2. Population — hab-weighted roll; MVT/GVT for hab ≤ 0; low population terminology (QA-025/QA-026)
3. Wealth — DM table by pop/TL
4. Power Structure — roll + modifier table
5. Development — roll + modifier table
6. Source of Power — table
7. Governance — table
8. Starport (PSS v1.1) — 4-step algorithm: Port Size Score, TL Capability Cap, Weekly Port Activity, Weekly Activity Roll
9. Travel Zone — Amber/Red logic; Amber reason table (2D6); Red zone TN, check, result

---

### Chapter 8 — Multi-Star Hierarchy

**Page title:** `Mneme CE World Generator/Chapter 8 - Multi-Star Hierarchy`

**Sources:**
- **`260427-02 MWG-REDESIGN-multi-star-hierarchy.md`** ← PRIMARY SOURCE
- `src/lib/multiStar.ts`
- `src/types/index.ts` (OrbitNode, StarLeaf, BinaryNode)

**Sections:**

1. Problem Statement — previous companion stars were cosmetic; flat array with no hierarchy; separations could be inside heliopause; no barycenter computed

2. Design Constraint — INRAS (planet generation) must stay single-star-aware. Companion placement must guarantee S-type stability cone falls outside heliopause.

3. Holman-Wiegert S-Type Stability — formula and table:
   ```
   S-type cap = 0.46 × a_binary × (1 − e)
   For cap to exceed heliopause: a_binary ≥ heliopause / (0.46 × (1 − e_max))
   ```

4. The 3D3 × Heliopause Separation Rule:
   ```
   roll = 3D3   (range 3–9, mean 6)
   a_binary = max(roll, 3) × heliopause_AU × (1 + e)
   eccentricity: 1D6 → 0.0/0.1/0.2/0.3/0.4/0.5
   ```
   Table: typical separations by stellar class (M: 30–270 AU, G: 360–3240 AU, etc.)

5. Barycenter Math ("The Gear Ratio"):
   ```
   r_primary   = a × m_secondary / (m_primary + m_secondary)
   r_secondary = a × m_primary   / (m_primary + m_secondary)
   ```
   Explain: each star orbits the shared centre of mass. For nested binaries, the inner pair is treated as a point mass at its own barycenter.

6. Kepler Period:
   ```
   P² = a³ / M_total   (solar units: AU, solar masses, years)
   ```

7. Hierarchical Orbit Tree — `OrbitNode = StarLeaf | BinaryNode`. Left-skewed nesting (each new companion wraps the existing tree). Diagram:
   ```
   Triple system:
   BinaryNode (outer)
   ├── primary: BinaryNode (inner)
   │   ├── primary: StarLeaf (star A)
   │   └── secondary: StarLeaf (star B)
   └── secondary: StarLeaf (star C)
   ```

8. Hierarchical Stability Check — `a_outer ≥ 3 × a_inner`. Re-roll up to 10 times if violated. With cap = 10, violation rate < 1.6% (down from 1.9% with cap = 5).

9. What is NOT modelled — close binaries (sub-AU); circumbinary Tatooine planets; N-body dynamics. Deferred to v3.

10. Empirical Findings (1000-system batch, 2026-04-27):
    - S-type cap clears heliopause: 100% strict
    - G-class mean separation: ~700 AU
    - Eccentricity mean: 0.234
    - Hierarchical violations: 4/243 (1.6%)

---

### Chapter 9 — Batch Validation and Testing

**Page title:** `Mneme CE World Generator/Chapter 9 - Batch Validation and Testing`

**Sources:**
- `scripts/batch-runner.ts`
- `FRD-047-batch-management.md`
- `260427-blog-update-summary.md` §"The 1000-System Audit"

**Sections:**

1. Philosophy — observation as the unit test. Explain: run 1,000 systems, compare aggregate distributions to RECONS (solar neighbourhood stellar census), Kepler bias-corrected η-Earth, JWST atmosphere observations. If distributions diverge, investigate whether it's a bug, a deliberate trade-off, or an outdated assumption.

2. Running the Batch Tool:
   ```bash
   npm run batch -- --count 1000 --v2multistar --report all
   npm run batch -- --count 500 --report habitability
   npm run batch -- --count 1000 --details ./output.jsonl
   ```
   Report modes: `multi-star`, `habitability`, `summary`, `all`. `--details <file>` emits per-world JSONL.

3. Stellar Class Distribution Target vs Actual:

   | Class | Model | RECONS | Verdict |
   |---|---|---|---|
   | M | 69% | 75% | Within range |
   | K | 15% | 12% | Within range |
   | G | 10% | 8% | Within range |
   | F | 4% | 3% | Within range |
   | A | 1.2% | 0.6% | Slightly high |
   | B | 0.4% | 0.13% | Slightly high |

4. Mean planets per system: 6.6 (Level 1). Kepler bias-corrected ~6–8. In range.

5. Validation Targets Table (all categories, with tolerance bands) — reference from Chapter 6 §9 and Chapter 8 §10.

6. Known Deviations and Why They Are Acceptable — e.g. Conservative-zone share 47.2% is above η-Earth's 10–25% but below the old wrong target of 60–75%; M-dwarf weighting pushes it up legitimately.

7. Bug Caught by Batch — `opts` propagation bug: `generateStarSystem` was silently dropping all optional feature flags (`v2MultiStar`, `v2Positioning`, etc.). Fixed by explicitly mapping all option fields through to the internal `opts` object.

---

### Chapter 10 — Open Issues and Roadmap

**Page title:** `Mneme CE World Generator/Chapter 10 - Open Issues and Roadmap`

**Sources:**
- `QA.md` (QA-064 through QA-072)
- `ROADMAP.md`
- `FRD-065` through `FRD-067`

**Sections:**

1. QA Tracker — reproduce current open items:

   | ID | Status | Description |
   |---|---|---|
   | QA-064 | ✅ Fixed | Zone radiation hazard + HZ biosphere bonus (retuned 2026-04-27) |
   | QA-065 | ✅ Fixed | Multi-star hierarchy + wide-companion rebuild (retuned 2026-04-27) |
   | QA-066 | 📋 Queued | Cultural values → economic/demographic effects |
   | QA-067 | 📋 Queued | Low population for G-class terrestrial (Neil's R1) |
   | QA-068 | 📋 Queued | G4 mainworld beyond Saturn orbit (Neil's R2) |
   | QA-069 | 📋 Queued | Wealth/Development contradiction in text |
   | QA-070 | 📋 Queued | Mining habitat starport guard |
   | QA-071 | 📋 Queued | Mainworld raison d'être narrative generator |
   | QA-072 | 📋 Queued | Sector Dynamics discoverability UX |

2. Neil Lucock Recommendations (R1–R6):
   - R1: UWP/Cepheus UWP formatter when CE preset selected
   - R2: Currency Scale toggle (Mneme vs Traveller ×100 multiplier)
   - R3: Population-scaled government terminology (<1M → tribal/org terms)
   - R4: Starport class floor (mining ≥ D; agricultural ≥ E)
   - R5: Edit-and-recompute panel on system viewer
   - R6: Isolationist/Xenophobic → travel zone modifier + story hook

3. QA-066 Detail — Cultural Values (Queued):
   Explain the intended mechanic: each cultural value (Isolationist, Xenophilic, etc.) should affect trade volume multipliers, workforce participation rates, starport tier probability, and travel zone bias. Source: `260421 Cultural Values Table.docx`.

4. Open Design Questions (from spec docs):
   - Should magnetosphere be a separate roll for Conservative-zone worlds?
   - Should Cool zone earn a partial HZ biosphere bonus?
   - Outer-zone GCR surface radiation modelling (future spec)
   - Close binaries and Tatooine circumbinary planets (deferred v3)

5. Future FRDs:
   - FRD-065: Intrastellar Economics & Population Distribution
   - FRD-066: Trade Routes & Logistics Networks
   - FRD-067: FTL Barypoint Navigation (uses barycenter positions from Chapter 8)

---

## Landing/Index Page

**Page title:** `Mneme CE World Generator`

Content:

```mediawiki
{{MWG Documentation Header}}

= Mneme CE World Generator — Documentation =

The '''Mneme CE World Generator''' (MWG) is a procedural tabletop RPG world-generation tool
for the [[Cepheus Engine]] ruleset. It produces complete star systems including stars, planets,
moons, inhabitants, and economic data in a fraction of a second.

This documentation section covers version 2.x of the generator, including the v2 redesign
(composition/atmosphere/biosphere, positioning, habitability waterfall) and the 2026-04-27
updates (zone radiation hazard, Conservative-HZ biosphere bonus, multi-star hierarchy).

== Chapters ==

# [[Mneme CE World Generator/Chapter 1 - Overview|Chapter 1 — Overview & Design Philosophy]]
# [[Mneme CE World Generator/Chapter 2 - Dice Engine|Chapter 2 — Dice Engine]]
# [[Mneme CE World Generator/Chapter 3 - Star Generation|Chapter 3 — Star Generation]]
# [[Mneme CE World Generator/Chapter 4 - Zone Architecture and Positioning|Chapter 4 — Zone Architecture & Positioning]]
# [[Mneme CE World Generator/Chapter 5 - Composition Atmosphere Biosphere|Chapter 5 — Composition, Atmosphere & Biosphere]]
# [[Mneme CE World Generator/Chapter 6 - Habitability Waterfall|Chapter 6 — Habitability Waterfall]]
# [[Mneme CE World Generator/Chapter 7 - Inhabitants Module|Chapter 7 — Inhabitants Module]]
# [[Mneme CE World Generator/Chapter 8 - Multi-Star Hierarchy|Chapter 8 — Multi-Star Hierarchy]]
# [[Mneme CE World Generator/Chapter 9 - Batch Validation and Testing|Chapter 9 — Batch Validation & Testing]]
# [[Mneme CE World Generator/Chapter 10 - Open Issues and Roadmap|Chapter 10 — Open Issues & Roadmap]]

== Version ==

Current documentation revision: '''2026-04-27''' (QA-064 + QA-065 retune)

[[Category:Mneme CE World Generator]]
[[Category:MWG Documentation]]
[[Category:Printable]]
[[Category:Game Projects]]
```

---

## Category Page

Create: `Category:MWG Documentation`

```mediawiki
This category contains all pages in the '''Mneme CE World Generator''' documentation.
These pages are tagged for print/PDF export. To collect them as a book, use the
MediaWiki Book Creator tool (Special:Book) and add all pages in this category.

[[Category:Game Projects]]
[[Category:Printable]]
```

---

## Posting to the Wiki

The wiki is at https://wiki.gi7b.org. It requires:

1. **nginx basic auth** — credentials stored in the project environment. Ask the user for the credentials before posting.
2. **MediaWiki bot account** — for scripted posting. Use the MediaWiki API (`api.php?action=edit`) with `Content-Type: application/x-www-form-urlencoded` and a valid login session token.

**Manual posting:** navigate to each page URL (e.g. `https://wiki.gi7b.org/index.php/Mneme_CE_World_Generator/Chapter_1_-_Overview`), click Edit, paste wikitext, and save.

**Bot posting (if API access is configured):**

```bash
# Get CSRF token
curl -b cookies.txt -c cookies.txt \
  "https://wiki.gi7b.org/api.php?action=query&meta=tokens&format=json"

# Post page
curl -b cookies.txt -c cookies.txt \
  -d "action=edit&title=Mneme_CE_World_Generator&text=<WIKITEXT>&token=<TOKEN>&format=json" \
  "https://wiki.gi7b.org/api.php"
```

---

## Source File Reference

All source material is in `/home/justin/opencode260220/Mneme-CE-World-Generator/`:

| File | What it covers |
|---|---|
| `260409-v02 Mneme-CE-World-Generator-FRD.md` | Master FRD — full system spec |
| `260417-00 MWG-REDESIGN-composition-atmosphere-biosphere.md` | FR-041 detail |
| `260417-02 MWG-REDESIGN-habitability-application.md` | FR-043 waterfall detail |
| `260417-03 MWG-REDESIGN-consolidated-v1.md` | Consolidated v1 spec (all FR-041–043) |
| `260427-01 MWG-REDESIGN-zone-radiation-and-hz-biosphere.md` | **QA-064: zone radiation + HZ biosphere** |
| `260427-02 MWG-REDESIGN-multi-star-hierarchy.md` | **QA-065: multi-star hierarchy** |
| `260427-blog-update-summary.md` | Design philosophy + empirical findings narrative |
| `QA.md` | Full QA tracker (QA-064 through QA-072) |
| `ROADMAP.md` | Planned FRDs |
| `src/lib/habitabilityPipeline.ts` | Waterfall implementation |
| `src/lib/multiStar.ts` | Multi-star hierarchy implementation |
| `src/lib/worldData.ts` | ZONE_HAZARD_DM and other lookup tables |
| `src/types/index.ts` | OrbitNode, BinaryNode, StarLeaf types |
| `scripts/batch-runner.ts` | Batch validation CLI |

---

## Quality Checklist (for the writer agent)

Before marking the wiki documentation complete, verify:

- [ ] Every chapter page has `{{MWG Documentation Header}}` and `__TOC__` at the top
- [ ] Every chapter page ends with the three category tags: `[[Category:Mneme CE World Generator]]`, `[[Category:MWG Documentation]]`, `[[Category:Printable]]`
- [ ] Chapter 6 documents BOTH QA-064 changes (zone radiation DM table AND HZ biosphere bonus) with the post-retune magnitudes (+2/+1 and −2)
- [ ] Chapter 6 §9 uses the 2026-04-27 revised validation targets (Conservative 30–50%, not the old 60–75%)
- [ ] Chapter 8 documents the Holman-Wiegert guarantee and explains WHY close binaries are explicitly excluded
- [ ] Chapter 9 documents the `opts` propagation bug and its fix
- [ ] The landing page `Mneme CE World Generator` links to all 10 chapters in order
- [ ] `Category:MWG Documentation` page exists and is in `[[Category:Game Projects]]`
- [ ] No page is missing a navigation footer (prev/next links)
