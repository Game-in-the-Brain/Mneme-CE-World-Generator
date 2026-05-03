# FRD-070 — Economic Classification & World Trade Codes

**Status:** 📋 Research / On Hold — model design required before implementation  
**Depends on:** QA-076 (starport floor), QA-077 (raison d'être), ~~QA-067 (pop calibration)~~ ✅ Resolved 2026-05-01  
**Source:** Neil Lucock v1.3.151 feedback; Justin Aquino 2026-04-27  
**Related:** QA-071 (absorbed), FRD-069 (Editable Star Systems — economics dials)

---

## Problem

Cepheus Engine trade codes (Ag, Na, Hi, Lo, Po, De, Ri, Ht, Lt, In, Ni, etc.) were designed in the 1970s–80s. They reflect the economic thinking of that era and do not map to how modern economists, demographers, or game designers would characterise a world's economic identity.

Specific failures:

| CE Code | Problem |
|---|---|
| **Non-Industrial (Ni)** | Every society above subsistence is industrial to some degree. "Non-industrial" is not a meaningful economic descriptor in the 21st century. |
| **Industrial (In)** | High population is not an economy type. Taiwan and South Korea are industrial; so is a 19th-century textile mill town. They are not equivalent. |
| **High Population (Hi)** | Population magnitude is a demographic fact, not a trade code. It says nothing about what a world produces or trades. |
| **Ice-Capped** | A physical geography description, not a trade value. Ice caps do not determine export capacity. |
| **Rich (Ri) / Poor (Po)** | These conflate Material Wealth with Development, which the Mneme system already separates. |
| **Agricultural (Ag)** | Useful, but too binary — does not capture whether agriculture is subsistence, domestic surplus, or export-oriented. |
| **Water World (Wa)** | Physical composition, not economic function. A water world can be agricultural, mining, or dead. |

The deeper problem: CE trade codes assume a pre-AI, pre-information-age model of comparative advantage where worlds specialize in one thing and export it. The real-world understanding of economic complexity — supply chains, services, knowledge economies, informal sectors — has advanced substantially. Economic **illiteracy** and the political divisiveness around trade, immigration, and public spending make this a delicate design area that deserves precision.

---

## Design Goals

1. Replace CE trade codes with **economic classifications grounded in real-world economic frameworks** (World Bank primary/secondary/tertiary/quaternary, WTO trade categories, IMF development tiers).
2. Every world's economic type should be **derivable from existing generator outputs** (TL, Wealth, Development, Biochem, Biosphere, Composition, Population) — no new random rolls required.
3. Classifications should answer: **what does this world produce, what does it need, and why would anyone trade with it?**
4. The system must support QA-076 (starport floor rules based on economic function) and QA-077 (raison d'être justified by economic role).

---

## Proposed Classification Framework

### Primary Economic Driver (what the world produces most of)

Derived from existing generator outputs — no new dice.

| Classification | Derivation | Real-world analogue |
|---|---|---|
| **Extraction** | High Mineral Wealth (Affluent/Prosperous) + low Biochem + low TL | Qatar 1950s, DRC, early Gulf states — export raw materials, import almost everything else |
| **Agricultural Surplus** | Biochem Abundance ≥ Rich + Biosphere ≥ B3 + population density allows export | Argentina, Ukraine, New Zealand — food/biomass export economy |
| **Manufacturing** | TL mid-range (MTL 10–12) + population > 1M + port activity > threshold | Vietnam, Bangladesh, Mexico — assembly and production for export |
| **Refining / Processing** | Extraction economy + TL sufficient to process output locally | Saudi Arabia post-ARAMCO, South Korea steel era — add value before export |
| **Services / Trade Hub** | High starport class + high Development + pop density | Singapore, Dubai, Hong Kong — facilitate commerce for others |
| **High-Technology** | MTL ≥ 13 (CE TL 9.5+) + Very Developed | Taiwan (TSMC), South Korea, USA — knowledge and advanced manufacture export |
| **Subsistence / Closed** | pop < 10k OR starport X + low Development | Pre-contact isolated settlements — produces nothing for export |
| **Research Outpost** | pop < 100k + Very Developed TL + no starport or Class E | Antarctic stations, ESA facilities — exists to study, not to trade |

### Secondary Economic Character (modifiers on top of primary)

| Modifier | Derivation |
|---|---|
| **Garden** | Biosphere ≥ B4 + Biochem Rich+ + Habitability > 4 — pristine ecology, tourism/scientific value |
| **Fluid Ocean** | Composition: liquid-surface type + temperature range allows liquid | Europa analogue — subsurface ocean, may have Extraction potential |
| **Water World** | Hydrographic coverage > 95% + breathable atmosphere | Oceanic world — Agricultural or Services depending on pop |
| **Marginal** | Habitability 1–3, inhabited only due to economic necessity | Most mining habitats — exists because the resource is here, not because it's pleasant |
| **Contested** | Cultural trait: Hostile/Militarist + neighbour proximity (3D map) | Active dispute over resources or sovereignty |

### Development Context (replaces CE Rich/Poor)

Already captured by Wealth (material) and Development (equity) — these replace CE Ri/Po entirely. No new codes needed.

### Technology Tier (replaces CE Hi/Lt)

| Tier | Mneme TL | CE equivalent | Description |
|---|---|---|---|
| **Primitive** | MTL < 9 | < CE TL 7 | Pre-space — cannot participate in interstellar economy |
| **Emergent** | MTL 9–10 | CE TL 7–8 | Early space access; dependent on imports for advanced goods |
| **Industrial** | MTL 11–12 | CE TL 8.5–9 | Self-sufficient manufacturing; can export mid-tech goods |
| **Advanced** | MTL 13–15 | CE TL 9.5–11 | High-tech export capacity (Taiwan/Korea equivalent) |
| **Post-Scarcity** | MTL ≥ 16 | CE TL 12+ | Automation handles labour; exports are knowledge and culture |

### Population Scale (demographic fact, not trade code)

| Label | Population | Notes |
|---|---|---|
| **Outpost** | < 10k | Cannot sustain full economic specialisation |
| **Settlement** | 10k–100k | Early specialisation possible |
| **Colony** | 100k–1M | Can support one primary driver |
| **Province** | 1M–100M | Full economic complexity begins |
| **Homeworld** | > 100M | Multiple drivers, internal market significant |

---

## Starport Floor Rules (QA-076 dependency)

Once economic classification is defined, floor rules become semantic:

| Economic class | Starport minimum | Reason |
|---|---|---|
| Extraction (any pop < 500k) | Class D | Must export product; cannot survive without imports |
| Agricultural Surplus (pop < 500k) | Class E | Produces food but cannot consume all of it; needs buyers |
| Subsistence / Closed | No minimum — Class X valid | Genuinely self-sufficient by definition |
| Research Outpost | Class E minimum | Supply chain dependency even if not export-oriented |
| Services / Trade Hub | Class C minimum | Cannot function as a hub without port infrastructure |

---

## Raison d'être Integration (QA-077 dependency)

Economic classification provides the primary existence justification:

| Economic class | Why is anyone here? |
|---|---|
| Extraction | "The rock/gas/ore is here — someone is paid to pull it out" |
| Agricultural Surplus | "The soil and sun are right — settlers came to farm" |
| Research Outpost | "There is something here worth studying" |
| Services / Trade Hub | "The jump point is here — ships must stop" |
| Subsistence | "They came for [reason from culture roll]; they stayed because leaving costs too much" |
| Marginal (Extraction) | "A corporation holds the concession; workers rotate on 2-year contracts" |

Secondary existence reasons (from cultural rolls) layer on top of the economic primary. A Devotee cult on an Extraction world makes sense — *they believe the rocks are sacred, and someone is paying to mine them anyway*.

---

## CE Trade Code Mapping (for FRD-068 RAW UDP compatibility)

When RAW UDP mode is active, the new economic classifications map back to CE codes for display:

| New Classification | CE equivalent output |
|---|---|
| Extraction + Marginal | Na, Po |
| Agricultural Surplus | Ag |
| Manufacturing + Industrial TL | In |
| High-Technology + Advanced TL | Ht, In |
| Services / Trade Hub | Ri |
| Garden modifier | Ga |
| Water World modifier | Wa |
| Fluid Ocean modifier | Fl |
| Outpost (<10k pop) | Lo |
| Province / Homeworld (>1B pop) | Hi |
| Primitive TL | Lt |
| Advanced / Post-Scarcity TL | Ht |

Note: CE codes Non-Industrial (Ni) and Ice-Capped (Ic) have no clean new equivalent. Ni is retired (every world above Subsistence is industrial); Ic becomes a physical-geography tag in the Planetary System tab, not a trade code.

---

## What's Needed Before Implementation

This FRD is on hold pending:

1. ~~**Population calibration** (QA-067)~~ — ✅ Resolved 2026-05-01. 1,000-system G-class terrestrial batch: 8.8% <100k overall, 7.1% in Conservative zone. Outpost tier is not over-represented; thresholds are sound.

2. **Composition pipeline** (FR-041) — Fluid Ocean and Water World modifiers depend on the composition output. Cannot implement without that foundation.

3. **Economic model review** — a working session to validate the real-world analogues are correctly mapped. Specifically: does the TL-to-economic-tier mapping hold for Mneme's compounding productivity curve? At MTL 11 (CE TL 8.5) a world *can* manufacture, but is it actually in the "Manufacturing" tier by productivity output?

4. **FRD-069 economics dials** — the edit mode should allow a referee to override economic classification directly. Implement FRD-069 first so there's always an escape hatch.

---

## Out of Scope

- Modelling informal economies (barter, black markets) — these exist in cultural value descriptions (Deceptive, Libertarian traits) but are not quantified
- Inter-system commodity prices — FRD-066 territory
- Corporate ownership structures — FRD-064 territory
- Economic inequality within a world — captured by Development + Gini coefficient in FRD-065
