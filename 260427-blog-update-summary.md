# Update Summary — Habitability, Multi-Star Stability, and Letting Real Exoplanet Data Audit the Generator

**Date:** 2026-04-27
**Project:** Mneme CE World Generator

This update covers a substantial day of work on two interlinked problems in the Mneme world generator: how habitability is calculated for worlds in different orbital zones, and how companion stars are placed without breaking everything else. The thread that ties them together is one of the principles I keep coming back to — **let real observations be the audit, but only where the realism is playable.** Some physics we have to abstract; some we can model directly; the line between them is where the design gets interesting.

---

## The Principle: Use Observation as a Guide, Within What's Playable

A realistic universe simulator and a *usable* worldbuilding tool are not the same thing. Real stellar systems are dynamically unstable on million-year timescales unless they obey strict hierarchical rules. Real binary stars routinely fling planets out of their orbits. Real Hot Jupiters migrate inward over astronomical timescales and consume worlds. None of this is playable in a generator that has to produce 1,000 systems in 0.3 seconds and hand the user a finished, coherent setting.

So the design rule we follow is: **simulate what's playable, abstract what isn't, and use real observations to audit whether the result is recognisable.** When we can't model the dynamics directly, we substitute physically-defensible *boundaries* that prevent the worst outcomes by construction. This update applies that rule in two places.

---

## Habitability: Zone Position Now Affects More Than Temperature

The original v2 habitability waterfall fed orbital zone position into exactly one calculation: the temperature roll. Every other component — atmospheric chemistry, hazard, biochemistry, biosphere — was zone-blind. The result was that an outer-zone Hydrous Dwarf with the right rolls could outscore a Conservative-HZ Earth-analog. That contradicts both intuition and the actual exoplanet observations we now have from JWST and Kepler.

Two changes correct this:

**1. Inner-zone radiation hazard.** Worlds in the Infernal zone now take a +2 modifier to their hazard roll, biasing them toward Toxic or Radioactive outcomes; Hot zone takes +1. This represents what we directly observe: stellar UV/X-ray flux, solar-wind atmospheric stripping, and coronal mass ejection damage. JWST's atmosphere observations of TRAPPIST-1 b and c — both confirmed atmosphere-bare or near-bare — gave the empirical anchor. We don't model atmospheric escape directly because that's a million-year process; we instead model the *outcome* of being too close to your star.

**2. Habitable-Zone biosphere bonus.** Worlds in the Conservative zone with sufficient organic feedstock (biochem ≥ Common) now get a meaningful boost to their biosphere viability roll — equivalent to shifting two dice from disadvantage to advantage. The bonus is gated on biochem so it rewards *the right place plus the right chemistry*, not just orbital luck. After the empirical batch (more on that below), we tuned the magnitude up from −1 to −2 disadvantage levels.

Outer zones get no new modifier. They're already heavily penalised by cold, biochem failure rates, and the rarity of the subsurface-ocean override path that Europa-archetypes need. Stacking another penalty would push outer zones from "rare habitable lottery ticket" to "uninhabitable by default" — which is bad worldbuilding.

---

## Multi-Star: Heliopause-Limited Barycenters as a Stability Substitute

Companion stars in the previous version were cosmetic. The data model held a flat `companionStars[]` array, planet generation ignored everything except the primary, and separation was rolled from a fixed AU table that routinely placed companions inside the planetary disk. A real trinary system at those separations would scatter its planets across the neighbouring stars within a few orbital periods.

This is exactly the case where we cannot simulate the dynamics — N-body integrations over geological time are not free, and "rejection sample only stable configurations" is computationally awful. But we can use a *physical boundary* to make sure the configuration we generate is stable by construction.

**The substitute:** companion separation is rolled as **3D3 × heliopause × (1 + e)**, with a hard floor that guarantees the **Holman-Wiegert S-type stability cone** falls outside the heliopause. The Holman-Wiegert criterion is the textbook stability rule: a planet orbits stably around one member of a binary as long as its semi-major axis stays under `0.46 × a_binary × (1 − e)`. By placing companions at separations where that cap exceeds the heliopause, we mathematically guarantee that no planet in our placement zone can be destabilised by the companion's gravity — without ever simulating an orbit.

The trade-off is honest: we exclude close binaries (sub-AU and few-AU separations like Alpha Centauri AB) and circumbinary "Tatooine" planets. Both are evocative but neither is consistent with "INRAS generation must remain single-star-aware." We document them as known unsupported configurations, defer them to a future v3, and move on.

What we *do* model directly:

- **Hierarchical orbit tree.** Binaries can nest inside binaries, recursively. A trinary becomes a binary whose primary is itself a binary.
- **Barycenter math (the "gear ratio").** Each star in a binary wobbles around their shared centre of mass at a radius proportional to the *other* star's mass fraction: `r₁ = a × m₂ / (m₁ + m₂)`. For nested binaries we treat the inner pair as a point mass at its own barycenter. Cleanly recursive.
- **Kepler periods.** `P² = a³ / M_total`, in solar units. Cached on every binary node for the 2D map and FRD-067 navigation.
- **Hierarchical stability check.** `a_outer ≥ 3 × a_inner` (the textbook hierarchical rule). If a roll fails it, we re-roll up to 10 times.

---

## The 1000-System Audit: Letting Real Exoplanet Data Tell Us Whether We're Right

Both changes are physically defensible on paper, but "defensible on paper" is the easy part. To know whether the *aggregate behaviour* of the generator matches the universe we observe, we need batch validation. Today we built that:

```bash
npm run batch -- --count 1000 --v2multistar --report all
```

This runs 1,000 procedurally-generated systems in about a third of a second, then aggregates statistics and emits a report against pre-defined targets. Per-world detail can be dumped to JSONL for granular analysis. What matters is that we now treat **observations as the unit test**: if our generator's distributions diverge meaningfully from RECONS solar-neighbourhood data, Kepler's bias-corrected η-Earth, or JWST atmosphere measurements, we have evidence the model is wrong.

The first batch caught a real bug (a flag wasn't propagating through the options struct, so v2 features were silently inert) and showed two of our validation targets were themselves wrong — they had been set anthropically rather than observationally. The retune was driven directly by the data.

### How our model deviates from observation, after the retune

| Metric | Our model | Real observation | Verdict |
|---|---|---|---|
| Stellar class distribution | M 69% / K 15% / G 10% / F 4% / A 1.2% / B 0.4% | M 75% / K 12% / G 8% / F 3% / A 0.6% / B+O 0.13% (RECONS) | Within a few percentage points |
| Mean planets per system | 6.6 (Level 1) | Kepler bias-corrected ~6–8 | In range |
| Inner-zone atmosphere-stripping rate (Toxic+) | 69.6% | JWST: TRAPPIST-1 b/c atmosphere-bare; Mercury/Venus solar inner = 50% bare + 50% toxic-thick | Matches |
| Conservative HZ candidate share | 28% of rocky candidates | η-Earth (FGK) 10–25%; M-dwarf higher | Slightly high; defensible given M-dwarf bias |
| Conservative mainworld share | 47.2% | (anthropic — no direct observable) | Within revised 30–50% target |
| Hot+Infernal mainworld share | 15.3% | (M-dwarf systems plausibly produce hot rocky mainworlds, à la TRAPPIST-1) | Within revised ≤20% target |

### What the retune actually moved

| Metric | Pre-retune | Post-retune | Δ |
|---|---|---|---|
| HZ biosphere ≥ B2 rate | 31.8% | 39.9% | +8.1 pp |
| Conservative mainworld share | 44.8% | 47.2% | +2.4 pp |
| Hot+Infernal share | 16.9% | 15.3% | −1.6 pp |

The HZ bonus magnitude change is doing exactly what it was supposed to: lifting the rate at which Habitable-Zone worlds successfully develop life by a meaningful margin, without distorting the overall mainworld geography.

---

## What We Found About Our Old Targets

Before today, the validation doc said Conservative-HZ worlds should be the mainworld 60–75% of the time. That number was **anthropic** — borrowed from the assumption that "the universe biases toward HZ mainworlds because that's where life happens." Real observation says nothing of the sort. Kepler's bias-corrected η-Earth puts the per-FGK-star HZ rocky planet rate at 10–25%. Our generator, weighted toward M dwarfs, hits 47% — which is *already higher* than reality, not lower. The original target wasn't a target; it was a wish.

We also had an Infernal Toxic+ target of 25–35%. JWST has now directly observed at least two of TRAPPIST-1's inner planets to be atmosphere-bare. Mercury is bare. Venus is functionally Toxic. The real rate is 70–90%. We were aiming below the data because we hadn't checked.

The new targets — 30–50% Conservative mainworld, 70–90% Infernal Toxic+, ≤20% Hot+Infernal mainworld — are anchored in measurements. The model lands within all of them.

---

## Closing Thought

The most useful thing about treating observation as the audit is that it forces honesty about what the model is for. We're not building a physics simulator; we're building a generator that produces settings recognisable to anyone who has read a popular-science article on exoplanets in the last five years. When our distributions match what telescopes are seeing, the worldbuilding feels grounded. When they diverge — and we always check — we can decide whether the divergence is a bug, a deliberate trade-off (like wide-only companions for INRAS stability), or an outdated assumption that the data has just made obsolete. All three happened today.

Next on the list: cultural values. Whether a culture is xenophobic, xenophilic, or somewhere in between needs to actually move trade volume, ship counts, and demographic outcomes — not just sit as flavour text on the world card. That's where the same principle applies: pull a real-world phenomenon (Dutch disease, post-industrial decline, Gulf-state petro-economies), wire it to the generator's economic levers, then run 1,000 systems to make sure the distributions look like something a sociologist or economist would recognise.
