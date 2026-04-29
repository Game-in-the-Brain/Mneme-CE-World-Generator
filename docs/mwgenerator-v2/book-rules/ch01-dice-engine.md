# Chapter 1: Dice Engine

## Science Context

Every world generation system needs a source of randomness. The six-sided die (D6) is the standard for Cepheus Engine and Traveller-family games — it's cheap, ubiquitous at any gaming table, and produces a good distribution when rolled in groups. The Mneme system extends the basic 2D6 roll with advantage and disadvantage pools, which shift the probability curve without changing the range of possible outcomes. This lets the system encode "the universe biases toward X outcome" as a mechanical modifier rather than a flat bonus or penalty.

---

## Basic Rolls

| Roll | Notation | Range | Mean | Used For |
|------|----------|-------|------|----------|
| Single D6 | `1D6` | 1–6 | 3.5 | Simple checks, random tables |
| Two D6 | `2D6` | 2–12 | 7.0 | Core resolution (CE standard) |
| Three D6 | `3D6` | 3–18 | 10.5 | Companion star orbit, composition tables |
| Five D6 | `5D6` | 5–30 | 17.5 | Stellar class determination |
| D66 | `D66` | 11–66 | — | Culture table (two D6s as tens + ones digits) |
| D3 | `D3` | 1–3 | 2.0 | Companion separation multiplier (v2MultiStar) |
| 3D3 | `3D3` | 3–9 | 6.0 | Companion separation roll (v2MultiStar) |

---

## Advantage and Disadvantage

### What They Model

Advantage and Disadvantage encode real-world biases in the generation process. A world in a system with abundant building materials gets Advantage on its development roll. A star in a dense cluster with disruptive neighbours gets Disadvantage on companion stability. The modifiers stack and cancel.

### The Rule

When a roll has advantage or disadvantage, a number is assigned to represent how much. This is written as `Adv+N` for Advantage and `Dis+N` for Disadvantage.

- **Cancellation:** Adv and Dis cancel each other. A roll with `Adv+2` from one condition and `Dis+1` from another ends up as `Adv+1`.
- **Rolling with Advantage:** Roll the base dice plus the Advantage amount. Drop the same number of lowest dice. Example: `Adv+2` on a 2D6 roll means roll 4D6, keep the 2 highest.
- **Rolling with Disadvantage:** Roll the base dice plus the Disadvantage amount. Drop the same number of highest dice. Example: `Dis+2` on a 2D6 roll means roll 4D6, keep the 2 lowest.

### Pool System (v2)

Version 2 replaces the flat Adv/Dis system with a unified dice pool for complex checks (biosphere viability, habitability). The pool is defined by a **disadvantage level** (`disLevel`):

- `disLevel = 0`: straight roll (5D6, keep all 5)
- `disLevel = -1`: advantage 1 (6D6, keep highest 5)
- `disLevel = +2`: disadvantage 2 (7D6, keep lowest 5)
- General: pool size = `5 + |disLevel|`. Keep highest 5 if `disLevel < 0`, keep lowest 5 if `disLevel > 0`.

This is used in the biosphere test (Chapter 4) and habitability waterfall (Chapter 5).

### Notation Mapping

| Notation | Underlying Roll |
|----------|----------------|
| `2D6` | Roll 2 D6, sum both |
| `2D6 Adv+1` | Roll 3 D6, sum the 2 highest |
| `2D6 Adv+2` | Roll 4 D6, sum the 2 highest |
| `2D6 Dis+1` | Roll 3 D6, sum the 2 lowest |
| `2D6 Dis+2` | Roll 4 D6, sum the 2 lowest |
| `5D6` | Roll 5 D6, sum all |
| `3D6` | Roll 3 D6, sum all |
| `2D3` | Roll 2 D3, sum both |
| `D66` | Roll 2 D6: first = tens digit (1–6), second = ones digit (1–6) |

---

## Worked Examples

### Example 1: Advantage Roll
A G-class star grants `Adv+1` on the world type roll. The referee rolls 3D6 instead of the usual 2D6 and gets `{5, 2, 4}`. They drop the lowest (2) and sum the remaining two: `5 + 4 = 9`.

### Example 2: Disadvantage Roll
An M-class star grants `Dis+1` on the planetary mass roll. The referee rolls 3D6 and gets `{3, 6, 1}`. They drop the highest (6) and sum the remaining two: `3 + 1 = 4`.

### Example 3: Cancellation
A roll has `Adv+2` from the star class and `Dis+1` from a hazardous environment. Net = `Adv+1`. Roll 3D6, drop lowest, sum remaining.

---

## Software Notes

The FRD implementation uses a `rollKeep(diceRolls, diceType, keepSize, keepType, modifier)` function where:
- `diceRolls` = number of dice to roll
- `diceType` = number of sides (almost always 6)
- `keepSize` = number of dice to keep
- `keepType` = 1 (keep highest) or 0 (keep lowest)
- `modifier` = flat addition after the dice sum

The pool system (`disLevel`) is a software convenience that converts a single integer into the appropriate `rollKeep` call. A human referee can achieve the same effect by rolling extra dice and manually discarding.
