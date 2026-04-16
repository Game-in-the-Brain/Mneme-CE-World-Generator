# Economic Assumptions Customizations

Reference document for the Mneme World Generator PWA — Inhabitants generation stage.
Defines preset roll profiles for Wealth, Development, Power Structure, and Source of Power tables.

---

## Background

The Mneme default tables are calibrated to a realistic distribution of human development based on Earth's socio-economic history. Most worlds in this distribution are underdeveloped or developing — reflecting the actual majority of human societies rather than the affluent minority.

Most Classic Traveller / Cepheus Engine players come from high-income nations and carry different baseline assumptions: poverty is the exception, not the norm; governments are stable and federal; power is democratic or meritocratic. These assumptions differ enough from Mneme defaults that a preset system is warranted.

A third profile — **Stagnant / Uniform** — is added to represent a galaxy where colonisation has plateaued and worlds have converged toward a mediocre, undifferentiated middle. No exceptional wealth, no exceptional poverty; moderate governance everywhere.

---

## How Weights Work

All weights are **relative**, not fixed dice probabilities. The system converts each outcome's weight into a percentage of the total for that table, then uses weighted random selection. Weights do not need to sum to any specific number.

---

## Preset 1 — Mneme Default

Reflects realistic socio-economic diversity. Underdeveloped and poor worlds are common. Power is often fragmented or authoritarian.

### Wealth

| Outcome     | SOC Bonus | Weight | Approx % |
|-------------|-----------|--------|----------|
| Average     | +0        | 28     | 70%      |
| Better-off  | +1        | 8      | 20%      |
| Prosperous  | +2        | 2      | 5%       |
| Affluent    | +3        | 2      | 5%       |

### Development

| Outcome         | HDI Range   | Weight | Approx % |
|-----------------|-------------|--------|----------|
| UnderDeveloped  | 0.0–0.59    | 21     | 53%      |
| Developing      | 0.60–0.69   | 5      | 13%      |
| Mature          | 0.70–0.79   | 5      | 13%      |
| Developed       | 0.80–0.89   | 5      | 13%      |
| Well Developed  | 0.90–0.94   | 2      | 5%       |
| Very Developed  | >0.95       | 2      | 5%       |

### Power Structure

| Outcome       | Roll Range | Weight | Approx % |
|---------------|------------|--------|----------|
| Anarchy       | ≤7         | 21     | 53%      |
| Confederation | 8–9        | 8      | 20%      |
| Federation    | 10–11      | 8      | 20%      |
| Unitary State | 12         | 3      | 8%       |

### Source of Power

| Outcome      | Roll Range | Weight | Approx % |
|--------------|------------|--------|----------|
| Aristocracy  | 2–5        | 15     | 38%      |
| Ideocracy    | 6–7        | 8      | 20%      |
| Kratocracy   | 8–9        | 8      | 20%      |
| Democracy    | 10–11      | 8      | 20%      |
| Meritocracy  | 12         | 1      | 3%       |

---

## Preset 2 — CE / Traveller

Biased toward the assumptions of Classic Traveller and Cepheus Engine players from high-income nations. Poverty-tier outcomes are rare. Governments lean democratic, federal, or unitary. Wealth is broadly distributed above the baseline.

### Wealth

| Outcome     | SOC Bonus | Weight | Approx % |
|-------------|-----------|--------|----------|
| Average     | +0        | 8      | 20%      |
| Better-off  | +1        | 14     | 35%      |
| Prosperous  | +2        | 10     | 25%      |
| Affluent    | +3        | 8      | 20%      |

### Development

| Outcome         | HDI Range   | Weight | Approx % |
|-----------------|-------------|--------|----------|
| UnderDeveloped  | 0.0–0.59    | 3      | 8%       |
| Developing      | 0.60–0.69   | 4      | 10%      |
| Mature          | 0.70–0.79   | 10     | 25%      |
| Developed       | 0.80–0.89   | 10     | 25%      |
| Well Developed  | 0.90–0.94   | 9      | 23%      |
| Very Developed  | >0.95       | 4      | 10%      |

### Power Structure

| Outcome       | Roll Range | Weight | Approx % |
|---------------|------------|--------|----------|
| Anarchy       | ≤7         | 4      | 10%      |
| Confederation | 8–9        | 8      | 20%      |
| Federation    | 10–11      | 18     | 45%      |
| Unitary State | 12         | 10     | 25%      |

### Source of Power

| Outcome      | Roll Range | Weight | Approx % |
|--------------|------------|--------|----------|
| Aristocracy  | 2–5        | 3      | 8%       |
| Ideocracy    | 6–7        | 5      | 13%      |
| Kratocracy   | 8–9        | 7      | 18%      |
| Democracy    | 10–11      | 20     | 50%      |
| Meritocracy  | 12         | 5      | 13%      |

---

## Preset 3 — Stagnant / Uniform

Represents a galaxy where colonisation has stalled, trade is limited, and worlds have converged toward a bland, undifferentiated middle. No world is strikingly poor or strikingly rich. Power structures are stable but unremarkable. Sources of legitimacy are mixed and contested without resolution. This preset produces worlds that feel **samey** — useful for settings where the galaxy feels exhausted, post-peak, or homogenised by long isolation.

**Design intent:** The distribution is tightly clustered around the median of each table. Extreme outcomes (very rich, very poor, fully anarchic, fully unitary, purely meritocratic) are suppressed. The result is a lot of "middling" worlds that lack dramatic contrast.

### Wealth

| Outcome     | SOC Bonus | Weight | Approx % |
|-------------|-----------|--------|----------|
| Average     | +0        | 12     | 30%      |
| Better-off  | +1        | 20     | 50%      |
| Prosperous  | +2        | 7      | 18%      |
| Affluent    | +3        | 1      | 3%       |

> Most worlds are Better-off — comfortable but not wealthy. Affluent worlds are very rare. No world is truly poor, but no world is notably rich either.

### Development

| Outcome         | HDI Range   | Weight | Approx % |
|-----------------|-------------|--------|----------|
| UnderDeveloped  | 0.0–0.59    | 1      | 3%       |
| Developing      | 0.60–0.69   | 6      | 15%      |
| Mature          | 0.70–0.79   | 16     | 40%      |
| Developed       | 0.80–0.89   | 14     | 35%      |
| Well Developed  | 0.90–0.94   | 3      | 8%       |
| Very Developed  | >0.95       | 0      | 0%       |

> The distribution peaks at Mature and Developed. No world reaches Very Developed — the galaxy's technological and social ceiling has stopped rising.

### Power Structure

| Outcome       | Roll Range | Weight | Approx % |
|---------------|------------|--------|----------|
| Anarchy       | ≤7         | 2      | 5%       |
| Confederation | 8–9        | 16     | 40%      |
| Federation    | 10–11      | 18     | 45%      |
| Unitary State | 12         | 4      | 10%      |

> Confederations and Federations dominate — loose-to-moderate state cohesion is the norm. Anarchy is rare; true Unitary States are unusual.

### Source of Power

| Outcome      | Roll Range | Weight | Approx % |
|--------------|------------|--------|----------|
| Aristocracy  | 2–5        | 5      | 13%      |
| Ideocracy    | 6–7        | 10     | 25%      |
| Kratocracy   | 8–9        | 10     | 25%      |
| Democracy    | 10–11      | 13     | 33%      |
| Meritocracy  | 12         | 2      | 5%       |

> Power sources are broadly shared across Ideocracy, Kratocracy, and Democracy — no single source of legitimacy dominates. The galaxy argues about who should rule without arriving at a consensus. Meritocracy is rare; pure Aristocracy is fading but present.

---

## Comparison: Mneme Default vs CE / Traveller vs Stagnant

### Wealth (% chance)

| Outcome    | Mneme | CE / Traveller | Stagnant |
|------------|-------|----------------|----------|
| Average    | 70%   | 20%            | 30%      |
| Better-off | 20%   | 35%            | 50%      |
| Prosperous | 5%    | 25%            | 18%      |
| Affluent   | 5%    | 20%            | 3%       |

### Development (% chance)

| Outcome        | Mneme | CE / Traveller | Stagnant |
|----------------|-------|----------------|----------|
| UnderDeveloped | 53%   | 8%             | 3%       |
| Developing     | 13%   | 10%            | 15%      |
| Mature         | 13%   | 25%            | 40%      |
| Developed      | 13%   | 25%            | 35%      |
| Well Developed | 5%    | 23%            | 8%       |
| Very Developed | 5%    | 10%            | 0%       |

### Power Structure (% chance)

| Outcome       | Mneme | CE / Traveller | Stagnant |
|---------------|-------|----------------|----------|
| Anarchy       | 53%   | 10%            | 5%       |
| Confederation | 20%   | 20%            | 40%      |
| Federation    | 20%   | 45%            | 45%      |
| Unitary State | 8%    | 25%            | 10%      |

### Source of Power (% chance)

| Outcome     | Mneme | CE / Traveller | Stagnant |
|-------------|-------|----------------|----------|
| Aristocracy | 38%   | 8%             | 13%      |
| Ideocracy   | 20%   | 13%            | 25%      |
| Kratocracy  | 20%   | 18%            | 25%      |
| Democracy   | 20%   | 50%            | 33%      |
| Meritocracy | 3%    | 13%            | 5%       |

---

## Implementation Notes

- Weights are stored in a `RollProfile` object in Dexie under a `settings` table.
- The active profile key is passed to `generateWealth()`, `generateDevelopment()`, `generatePowerStructure()`, and `generateSourceOfPower()` as a weighted random seed replacing a raw 2D6 roll.
- Modifiers (e.g. Abundant/Inexhaustible resource bonuses on the Wealth roll) apply on top of the profile's weighted selection.
- The custom profile state is saved per-world-project, allowing different campaigns to use different assumptions.

---

*Last updated: April 2026 — Mneme World Generator PWA*
