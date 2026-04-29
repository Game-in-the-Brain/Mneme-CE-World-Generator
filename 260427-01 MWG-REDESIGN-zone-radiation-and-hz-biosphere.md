# MWG Redesign — Zone Radiation Hazard & Habitable-Zone Biosphere Bonus

**Status:** Specification — implements alongside FR-043 (habitability waterfall)
**Date:** 2026-04-27
**Replaces / Extends:** `260417-02` §6 (Hazard) and §9 (Biosphere Test); `260417-03` §6.3 and §6.6
**Scope:** Three coordinated changes to the habitability waterfall that make stellar-zone position a systemic input to habitability instead of a temperature-only modifier.

---

## 1. Problem Statement

The v2 habitability waterfall (FR-043) routes **zone position** into a single component: the temperature roll. Every other waterfall component — atmosphere, hazard, biochem, biosphere — is computed without any zone awareness. As a result:

- **Inner zones (Infernal, Hot)** are penalised only via temperature. Stellar radiation, solar-wind erosion, X-ray/UV flux, and atmospheric stripping carry **no mechanical cost** in the hazard step.
- **Conservative HZ worlds** receive zero special treatment beyond a temperature DM of 0. They are no more likely to develop a biosphere than a tidally-heated outer-zone moon with a lucky biochem roll.
- **Outer zones (O1–O5)** are penalised heavily through cold, but a Hydrous/Volatile-Rich dwarf with the **subsurface ocean override** can convert this to a competitive score. A B3+ biosphere conversion can net more habitability than a Conservative-zone terrestrial that fails its biosphere check.

**Observed symptom:** outer-zone moons routinely outscore inner-zone terrestrials, contradicting the intuition that the Habitable Zone should be the *systemically* preferred habitat.

**Root cause:** zone position only affects temperature; the implementation has no radiation-hazard penalty for inner zones and no positive HZ-specific advantage.

---

## 2. Three Coordinated Changes

This spec defines three changes. They are intentionally documented together so that future contributors (wiki authors, domain experts, designers) can review them as a coherent rebalancing rather than three independent edits.

### Option 1 — Inner-Zone Radiation Hazard DM

**Mechanism:** add a zone-driven modifier to the **Hazard roll** (waterfall step 4). Stacks additively with the existing Reactivity DM and atmosphere hazard bias.

**Table — `ZONE_HAZARD_DM`:**

| Zone | Hazard DM | Justification |
|---|---|---|
| Infernal | **+2** | Direct stellar exposure; intense UV/X-ray flux; atmosphere stripping; coronal mass ejection impact |
| Hot | **+1** | Significant stellar wind erosion; periodic flare exposure |
| Conservative | 0 | Earth-like; assumed magnetosphere is effective at this distance |
| Cool | 0 | Reduced flux; neutral |
| FrostLine | 0 | Negligible stellar effects |
| O1 | 0 | Cosmic radiation present but stellar contribution negligible |
| O2 | 0 | — |
| O3 | 0 | — |
| O4 | 0 | — |
| O5 | 0 | — |

**Effect on the Hazard roll:** an Infernal-zone world rolls 2D6 + Reactivity DM + atmo hazard bias **+ 2**, biasing outcomes toward Toxic / Radioactive. A Hot-zone world gets +1.

**Why these magnitudes:**
- +2 is one full hazard tier shift (e.g. Polluted → Corrosive, or Corrosive → Toxic). For Infernal, this is appropriate because the world is being actively cooked by its star.
- +1 for Hot keeps the penalty real but not crippling — the inner edge of the HZ should still be habitable territory under good rolls.
- 0 for Cool/FrostLine/Outer reflects that **cold is not a radiation hazard** — those zones already pay heavily through temperature.

**Why not penalise outer zones for cosmic radiation:** GCR exposure is real but at this fidelity it is dominated by the temperature failure mode. Adding a small outer-zone hazard DM would compound penalties already captured by cold and biochem failure rates. Keep the model simple.

### Option 2 — Conservative HZ Biosphere Bonus

**Mechanism:** when the world's zone is `Conservative` AND its biochem tier is Common or higher, reduce the biosphere disadvantage level by **2** (shift two dice from disadvantage toward advantage). Original magnitude was −1; raised to −2 on 2026-04-27 after the first 1000-system empirical batch showed a −1 shift was too small to meaningfully widen HZ biosphere viability.

**Trigger (BOTH required):**
- `zone === 'Conservative'`
- `biochemIndex >= biochemOrder.indexOf('Common')`

**Effect on the dice pool:** applied alongside the existing Biochem and Temperature dice adjustments in `buildBiosphereDicePool`. Net `disLevel` is reduced by 2 before the pool is built (revised 2026-04-27 from −1).

**Why this is the right shape:**
- The Habitable Zone is defined astronomically by liquid-water surface conditions. The biosphere step is where that should pay off mechanically — not in temperature (which is already a 0 DM there) and not in hazard (which the Conservative entry leaves at 0).
- The biochem ≥ Common gate prevents this from rescuing biochem-poor worlds: an HZ rock without organic feedstock still can't grow life. The bonus rewards worlds that have both **the right place** and **the right chemistry**.
- A −1 disLevel shift is small. It moves a "dis+2" world to "dis+1" — about a 7% point shift in P(roll ≥ TN 20). Not a magic bullet; a fingerprint.

**Worked numbers (example only):**

| Pool before | Pool after | P(≥ TN 20) before | P(≥ TN 20) after |
|---|---|---|---|
| dis+2 (7D6 keep low 5) | dis+1 (6D6 keep low 5) | ~14% | ~21% |
| dis+0 (5D6) | adv+1 (6D6 keep high 5) | ~50% | ~68% |
| dis−1 (adv+1, 6D6 keep high 5) | adv+2 (7D6 keep high 5) | ~68% | ~80% |

(Probabilities approximate; final rebalancing is empirical via batch validation.)

### Option 3 — Outer Zones: Deliberate No Change

**Decision:** O1–O5 retain their existing temperature DMs (−4 to −8) and **gain no new zone hazard penalty**.

**Rationale:**
- Outer zones already pay through severe temperature DM (likely Freezing → −5 hab) and the biochem failure rate that follows from low organic processing.
- The subsurface ocean override (FR-043 §6.6) intentionally exists as a **rare path** to outer-zone habitability (Europa/Enceladus archetype). It should remain narratively viable.
- Stacking GCR or cryo-hazard penalties on outer zones would compound penalties already captured by other components and push the system toward "outer zones are uninhabitable lottery tickets" — which is not the design intent.

This is a documented no-op so future contributors do not assume the inner-zone hazard DM table was an oversight.

---

## 3. Combined Effect — Worked Examples

### Example A — Infernal-zone Iron-Silicate Terrestrial

Before changes:
- Hazard roll: 2D6 (avg 7) + 1 (Iron-Silicate Reactivity) = 8 → Corrosive (−2 hab)

After changes (Option 1):
- Hazard roll: 2D6 (avg 7) + 1 (Reactivity) + **2 (Infernal radiation)** = 10 → **Toxic (−3 hab)**
- Net: −1 additional habitability for being too close to the star.

### Example B — Conservative HZ Iron-Silicate Terrestrial

Before changes:
- Biochem: Common
- Biosphere pool: dis+2 (base) + 0 (Common) − 2 (Average temp) = neutral. P(B2+) ≈ 50%.

After changes (Option 2):
- Same as above − 1 (HZ bonus) = adv+1. P(B2+) ≈ 68%.
- Net: ~18 percentage-point lift in biosphere achievement, applied only to HZ worlds with Common+ biochem.

### Example C — Outer-zone Hydrous Dwarf moon (Europa)

Before changes:
- Subsurface ocean override active, pool ≈ dis+3.

After changes (Option 3 — no-op):
- **No change.** Outer dwarf still has its rare-path biosphere chance.

### Comparative Outcome

A Conservative-zone terrestrial with decent rolls now has a **~15–20 percentage-point biosphere advantage** over an outer-zone Hydrous dwarf with the override. An Infernal-zone terrestrial picks up an **extra hazard tier** that previously was not modelled. The Habitable Zone becomes mechanically distinguishable from the rest of the system — not by a single dominating modifier, but by two small advantages that compound in the worlds that matter.

---

## 4. Data Model Additions

```typescript
// types/index.ts — Body
interface Body {
  // ... existing fields

  // NEW: surfaced for breakdown / debugging / wiki export
  zoneHazardDM?: number          // applied at step 4 (Hazard)
  hzBiosphereBonusApplied?: boolean  // true if Option 2 trigger fired

  habitabilityBreakdown?: {
    // ... existing fields
    zoneHazardDM?: number        // contribution traceable in audit
  }
}
```

```typescript
// worldData.ts
export const ZONE_HAZARD_DM: Record<ZoneId, number> = {
  'Infernal': 2,
  'Hot': 1,
  'Conservative': 0,
  'Cool': 0,
  'FrostLine': 0,
  'O1': 0,
  'O2': 0,
  'O3': 0,
  'O4': 0,
  'O5': 0,
};
```

---

## 5. Pseudocode Changes

```typescript
// === Step 4: Hazard — UPDATED ===
const zoneHazardDM = ZONE_HAZARD_DM[zone] ?? 0;
let hazardRollMod = reactivity + zoneHazardDM;
if (hazardBias.corrosive) hazardRollMod += hazardBias.corrosive;
if (hazardBias.toxic)     hazardRollMod += hazardBias.toxic;

const hazardRoll = clamp2to12(roll2D6().value + hazardRollMod);
body.hazardV2 = HAZARD_TABLE_V2[hazardRoll].hazard;
body.zoneHazardDM = zoneHazardDM;

// === Step 7: Biosphere Test — UPDATED dice pool ===
// (after biochem offset and temperature adjust, before buildBiosphereDicePool)

// HZ Biosphere Bonus (Option 2)
const isHZ = zone === 'Conservative';
const hasMinBiochemForHZBonus = biochemIndex >= biochemOrder.indexOf('Common');
const hzBonusActive = isHZ && hasMinBiochemForHZBonus;
if (hzBonusActive) disLevel -= 1;

body.hzBiosphereBonusApplied = hzBonusActive;
const pool = buildBiosphereDicePool(disLevel);
```

---

## 6. Batch Validation Targets (Update)

Add to existing FR-043 validation (`260417-03 §9`):

| Target | Expected | Tolerance |
|---|---|---|
| Mainworld Conservative-zone share | **30–50%** (revised 2026-04-27 from inflated 60–75%; aligns with η-Earth ~10–25% per FGK star plus M-dwarf bias) | ±5% |
| Mainworld Outer-zone share | ≤ 15% | ±5% |
| Mainworld Hot+Infernal share | ≤ 20% (revised 2026-04-27 from ≤5%; M-dwarf systems plausibly produce Hot rocky mainworlds — TRAPPIST-like) | ±5% |
| **Inner-zone Toxic+ hazard rate** | **~70–90% of Infernal worlds** (revised 2026-04-27 from 25–35%; JWST atmosphere observations of TRAPPIST-1 b/c support the high rate; Mercury, Venus also fit this band) | ±10% |
| HZ biosphere ≥ B2 rate | informational, no fixed target | empirical |

**2026-04-27 retune note:** the original Conservative-share target of 60–75% was anthropic, not observational. Real exoplanet survey data (Kepler bias-corrected η-Earth) gives 10–25% per FGK star. Our generator aggregates across stellar classes weighted toward M dwarfs (which dominate the universe but have narrow HZs), so 30–50% is a defensible upper bound. The original Infernal Toxic+ target of 25–35% was wrong in the same direction — JWST observations of TRAPPIST-1 inner planets show 70–100% atmosphere stripping or toxic CO₂ thick atmospheres. The +2 hazard DM is observationally justified.

If the empirical numbers diverge sharply, **first** option to revisit is Option 1's magnitudes (try +1/+0 instead of +2/+1), **second** is Option 2's gate (try `Abundant` instead of `Common`), **third** is Option 2's magnitude (try −2 disLevel instead of −1). Outer-zone (Option 3) magnitudes should be the **last** thing to touch.

---

## 7. What This Spec Does NOT Change

- Temperature DM table (zone temp DM unchanged at +5 / +3 / 0 / −2 / −3 / −4 / −5 / −6 / −7 / −8).
- Subsurface ocean override (FR-043 §6.6 unchanged).
- Mainworld selection algorithm (highest baseline still wins; tiebreakers unchanged).
- TL post-selection layer.
- Biosphere TN, biochem trigger threshold, atmosphere conversion matrix.

These are all intentionally preserved. The point of this spec is to **inject zone awareness into hazard and biosphere** without disturbing the rest of the calibrated system.

---

## 8. Open Questions for Wiki / Domain Review

1. **Should magnetosphere be a separate roll?** A Conservative-zone world without a magnetosphere should arguably take a hazard hit. We currently bake magnetosphere into the Conservative-zone 0 DM. A future spec could add a magnetosphere roll that, on failure, applies a +1 hazard DM regardless of zone.
2. **Should Cool zone earn a small biosphere advantage too?** The "Optimistic Habitable Zone" (Cool) is also liquid-water-capable for some compositions. Currently we restrict the HZ biosphere bonus to Conservative only. A wiki contributor might argue for Cool getting a partial bonus (e.g. half the dice shift, or biochem ≥ Abundant gate).
3. **Should Hot zone earn a temperature offset for being closer to liquid water than Infernal?** Currently Hot is +3 temperature DM; an argument exists to lower it to +2 or add an atmospheric-density-conditional reduction. This spec leaves Hot alone deliberately to keep the change scope minimal.
4. **Outer-zone GCR modelling.** A future spec could model galactic cosmic ray exposure as a `Polluted` floor for unprotected outer-zone surface biospheres. Currently subsurface oceans are assumed shielded by ice; surface life in the outer zones is implicitly already penalised by temperature.

These are real, defensible alternative designs. The current spec is **Option 1 + Option 2 + Option 3 (no-op)**. Future revisions should reference this doc as the baseline.
