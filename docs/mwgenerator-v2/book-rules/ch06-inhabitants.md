# Chapter 6: Inhabitants

## Science Context

A world's physical properties determine what kind of society can exist there — but not deterministically. Tech level, population, wealth, development, and governance are emergent properties of history, culture, and resource availability. The Mneme system models this as a set of interconnected rolls that take the habitability score (from Chapter 5) as their primary input, then layer on randomness to simulate the contingency of history.

---

## Process Overview

The inhabitant generation follows this sequence:

1. Determine Tech Level
2. Determine Population
3. Determine Wealth
4. Determine Power Structure
5. Determine Development
6. Determine Governance
7. Determine Source of Power
8. Determine Starport
9. Determine Travel Zone

---

## 1. Tech Level

Roll 2D6 against the setting's Standard Tech Level (STL):

| 2D6 | MTL | CE TL | Era |
|-----|-----|-------|-----|
| 2 | 7 | 6.0 | Early Space Age (1950–2000) |
| 3 | 8 | 6.5 | Commercial Space (2000–2050) |
| 4 | 9 | 7.0 | New Space Race (2050–2100) |
| 5 | 10 | 7.5 | Cis-Lunar Development (2100–2200) |
| 6–7 | 11 | 8.5 | Interstellar Settlement (2200–2300) |
| 8 | 12 | 9.0 | Post-Earth Dependence (2300–2400) |
| 9 | 13 | 9.5 | Early Jump-Drive (2400–2500) |
| 10 | 14 | 10.0 | Interstellar Space (2500–2600) |
| 11 | 15 | 10.5 | Interstellar Colonization |
| 12 | 16 | 11.0 | Self-Sufficient Megastructures |

**TL also modifies the Development roll** (Step 5): worlds with TL 14+ get Adv+1 on development.

---

## 2. Population

### Terrestrial/Dwarf World Population

Base Population (Bp) is calculated from the habitability score:

```
Bp = 10^Habitability
```

Then roll 2D6 and multiply:

```
Population = Bp × 2D6
```

**Example:** A world with Habitability 8 has Bp = 100,000,000. A 2D6 roll of 6 gives a population of 600,000,000.

### Habitat Population

For habitats, Bp is the maximum capacity ÷ 12 (minimum 1). Maximum capacity is determined from the habitat's size and tech level (see Chapter 4, Habitat tables).

---

## 3. Wealth

Roll 2D6 modified by biochemical resources:

| 2D6 | SOC Mod | Wealth |
|-----|---------|--------|
| 2–8 | +0 | Average |
| 9–10 | +1 | Better-off |
| 11 | +2 | Prosperous |
| 12 | +3 | Affluent |

**Modifiers:**
- Abundant biochem: Adv+1
- Inexhaustible biochem: Adv+2

Wealth raises the average SOC of the population, which feeds into governance and starport calculations.

---

## 4. Power Structure

Roll 2D6 to determine the degree of political unification:

| 2D6 | Power Structure | Description |
|-----|-----------------|-------------|
| ≤7 | Anarchy | Many competing factions; no unified government |
| 8–9 | Confederation | Union of self-governing states (EU-like) |
| 10–11 | Federation | Partially self-governing states under a central government |
| ≥12 | Unitary State | Single centralized government |

**Development modifier:** Very Developed worlds get Adv+2 on this roll (more likely to be unified).

---

## 5. Development

Roll 2D6, modified by TL:

| 2D6 | Development | HDI Range | Ave SOC | TL Mod |
|-----|-------------|-----------|---------|--------|
| 2 | UnderDeveloped | 0.0–0.39 | 2 | |
| 3–5 | UnderDeveloped | 0.40–0.49 | 3 | |
| 6–7 | UnderDeveloped | 0.50–0.59 | 4 | |
| 8 | Developing | 0.60–0.69 | 5 | |
| 9 | Mature | 0.70–0.79 | 6 | |
| 10 | Developed | 0.80–0.89 | 8 | |
| 11 | Well Developed | 0.90–0.94 | 9 | |
| 12 | Very Developed | ≥0.95 | 10 | |

**Development modifies starport class and governance capability.**

---

## 6. Governance

Governance represents the world's ability to deploy resources, enforce laws, and control its population. It's a combined modifier from Development and Wealth:

| Development + Wealth | Governance DM |
|----------------------|---------------|
| UnderDeveloped | -9 to -3 (varies by wealth) |
| Developing | -8 to -2 |
| Mature | -7 to -1 |
| Developed | -6 to 0 |
| Well Developed | -5 to +1 |
| Very Developed | -4 to +2 |

Higher governance = faster bureaucracy, more reliable transactions, more predictable law enforcement.

---

## 7. Source of Power

Roll 2D6 to determine what the population considers legitimate authority:

| 2D6 | Source | What Matters |
|-----|--------|--------------|
| 2–5 | Aristocracy | Heredity, lineage, social class |
| 6–7 | Ideocracy | Tradition, values, culture, ideas |
| 8–9 | Kratocracy | Force, intimidation, credible threats |
| 10–11 | Democracy | Popularity, public opinion |
| 12 | Meritocracy | Skill, competence, demonstrated capability |

Each source of power affects how Travellers are received. An Aristocracy cares about SOC. A Meritocracy wants to see credentials. A Kratocracy respects credible threats. A Democracy is diverse and decentralised. An Ideocracy values cultural signalling.

---

## 8. Starport

The starport class is determined by the **Port Value Score (PVS):**

```
PVS = (Habitability / 4) + (TL - 7) + Wealth + Development Modifiers
```

**Development modifiers:**
- Developed: +1
- Well Developed: +2
- Very Developed: +3

**Wealth modifiers:**
- Better-off: +1
- Prosperous: +2
- Affluent: +3

### Port Value Score Table

| PVS | Starport | Features |
|-----|----------|----------|
| <4 | X | None. Landing causes damage. |
| 4–5 | E | Prepared area. Minimal facilities. |
| 6–7 | D | Specialised constructed area. Scout base possible. |
| 8–9 | C | Roll for Scout base. |
| 10–11 | B | Roll for Naval base. |
| ≥12 | A | Full facilities. Naval + Scout base rolls. |

### Starport Output

10^PVS determines the value of ship services and station components processed per week in credits:

| PVS | Output/Week |
|-----|-------------|
| 1 | 10 Cr |
| 4 | 10 KCr |
| 6 | 1 MCr |
| 8 | 100 MCr |
| 10 | 10 GCr |

---

## 9. Travel Zone

### Amber Zone

Worlds with High Biohazard or Radioactive hazard are automatically Amber Zone. Other worlds roll 2D6; on a 2, the world is Amber.

**Amber Zone Reason Table (2D6):**

| 2D6 | Reason |
|-----|--------|
| 2 | War |
| 3 | Plague |
| 4 | Major Insurgency |
| 5 | Heightened Security |
| 6 | Political Purging |
| 7 | Economic Crisis |
| 8 | Major Political Controversy |
| 9 | Environmental Disaster |
| 10 | Major Social Issue |
| 11 | Engineering Disaster |
| 12 | Major Economic Collapse |

### Red Zone

Red Zone worlds are interdicted by the Navy. The referee assigns Red status at their discretion, typically for extreme hazard, quarantine, or military exclusion.
