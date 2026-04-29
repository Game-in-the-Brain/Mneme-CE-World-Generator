# Chapter 9: Open Issues & Roadmap

## Overview

The MWG is under active development. This chapter tracks what's been done, what's queued, and what's planned — so the referee knows which parts of the generator are settled design vs. active work in progress.

---

## QA Tracker (Current)

| ID | Status | Description | Chapter |
|----|--------|-------------|---------|
| QA-064 | ✅ Fixed (retuned 2026-04-27) | Zone radiation hazard + HZ biosphere bonus. Magnitude −1 → −2 after empirical batch. | 5 |
| QA-065 | ✅ Fixed (retuned 2026-04-27) | Multi-star wide-only rebuild; hierarchical re-roll cap 5 → 10. | 7 |
| QA-066 | 📋 Queued | Cultural values → economic/demographic effects | 6 |
| QA-067 | 📋 Queued | Low population for G-class terrestrial worlds | 6 |
| QA-068 | 📋 Queued | G4 terrestrial with outer-frostline mainworld | 3 |
| QA-069 | 📋 Queued | Wealth/Development contradiction in narrative text | 6 |
| QA-070 | 📋 Queued | Mining habitat starport floor | 6 |
| QA-071 | 📋 Queued | Mainworld "raison d'être" narrative generator | 6 |
| QA-072 | 📋 Queued | Sector Dynamics discoverability UX | 6 |

---

## QA-066 Detail: Cultural Values

The next major feature after habitability and multi-star. Each cultural value (Isolationist, Xenophilic, etc.) should move mechanical levers rather than just being flavour text:

| Value | Proposed Effect |
|-------|-----------------|
| Isolationist | Reduced trade volume, higher travel zone bias toward Amber/Red |
| Xenophilic | Increased passenger counts, better trade terms |
| Militaristic | Higher Naval base probability, more ships in area |
| Commercial | Higher starport class for given PVS, more freight |
| Expansionist | Higher population growth, more colony worlds |

Source: `260421 Cultural Values Table.docx`. This is current design work.

---

## Neil Lucock Recommendations (R1–R6)

| ID | Recommendation | Status |
|----|---------------|--------|
| R1 | UWP/Cepheus UWP formatter when CE preset selected | 📋 Queued |
| R2 | Currency scale toggle (Mneme vs Traveller ×100 multiplier) | 📋 Queued |
| R3 | Population-scaled government terminology (<1M → tribal/org terms) | 📋 Queued |
| R4 | Starport class floor (mining ≥ D, agricultural ≥ E) | 📋 Queued |
| R5 | Edit-and-recompute panel on system viewer | 📋 Queued |
| R6 | Isolationist/Xenophobic → travel zone modifier + story hook | 📋 Queued |

---

## Open Design Questions

These are real, defensible alternative designs. The current spec resolves each with a specific choice, but future revision may revisit:

| Question | Current Decision | Alternative |
|----------|-----------------|-------------|
| Should magnetosphere be a separate roll for Conservative-zone worlds? | Baked into Conservative 0 DM (Chapter 5) | Separate roll; failure → +1 hazard DM |
| Should Cool zone earn a partial HZ biosphere bonus? | No — restricted to Conservative only | Cool gets half the dice shift, or biochem ≥ Abundant gate |
| Should Hot zone get a temperature offset? | No — left at +3 (Chapter 5) | Lower to +2, or add atmospheric-density-conditional reduction |
| Should outer-zone GCR be modelled? | No — O1–O5 deliberately unchanged (Chapter 5) | GCR floor of Polluted for unprotected surface life |

---

## Future FRDs

| FRD | Title | Description | Depends On |
|-----|-------|-------------|------------|
| FRD-065 | Intrastellar Economics & Population Distribution | Economic modelling across multiple worlds in a system | QA-066 |
| FRD-066 | Trade Routes & Logistics Networks | Procedural trade between systems | FRD-065 |
| FRD-067 | FTL Barypoint Navigation | Jump navigation using barycenters from Chapter 7 | QA-065 |

---

## Known Unsupported Configurations

The following are explicitly excluded from v2 and deferred to a hypothetical v3:

| Configuration | Reason Excluded | Real-World Example |
|---------------|-----------------|--------------------|
| Close binaries (sub-AU separation) | Would violate INRAS single-star constraint | Alpha Centauri AB (23 AU) |
| Circumbinary (P-type / "Tatooine") planets | No close inner binary to orbit around | Kepler-16b |
| Per-star planetary subsystems | Companions are decorative only in v2 | Proxima Centauri b (orbiting Proxima, not Alpha Cen) |
| Double-double quaternaries | The recursive tree can't produce this topology | (real but rare) |
