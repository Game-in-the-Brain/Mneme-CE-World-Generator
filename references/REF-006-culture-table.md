# REF-006: Culture Table

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 7.10 Culture Table  
**Last Updated:** 2026-04-09

---

## Overview

Generates cultural traits for the world's inhabitants using a **D66 × D6** table.

**D66:** Roll 2D6, first die = tens digit, second die = ones digit (11-66)  
**D6:** Roll 1D6 for column (1-6)

---

## Roll Method

```
Roll 3D6:
  - First two dice = Row (D66: 11, 12, 13... 66)
  - Third die = Column (1-6)
```

---

## Culture Table (D66 × D6)

| D66 | 1 | 2 | 3 | 4 | 5 | 6 |
|-----|---|---|---|---|---|---|
| **11** | Anarchist | Socialist | Progressive | Conservative | Liberal | Traditionalist |
| **12** | Collectivist | Individualist | Communal | Isolationist | Cooperative | Competitive |
| **13** | Egalitarian | Hierarchical | Meritocratic | Aristocratic | Democratic | Autocratic |
| **14** | Pacifist | Militarist | Defensive | Aggressive | Neutral | Pragmatic |
| **15** | Religious | Secular | Spiritual | Materialist | Devout | Skeptical |
| **16** | Artistic | Practical | Aesthetic | Functional | Creative | Industrial |
| **21** | Xenophilic | Xenophobic | Curious | Suspicious | Open | Wary |
| **22** | Honest | Deceptive | Transparent | Secretive | Trusting | Paranoid |
| **23** | Formal | Informal | Ceremonial | Casual | Ritualistic | Spontaneous |
| **24** | Patient | Impatient | Deliberate | Hasty | Methodical | Reactive |
| **25** | Stoic | Emotional | Reserved | Expressive | Controlled | Passionate |
| **26** | Innovative | Traditional | Experimental | Conventional | Radical | Orthodox |
| **31** | Mobile | Sedentary | Nomadic | Settled | Migratory | Rooted |
| **32** | Urban | Rural | Cosmopolitan | Provincial | Metropolitan | Agrarian |
| **33** | Technophilic | Technophobic | Advanced | Primitive | Cybernetic | Naturalist |
| **34** | Wealthy | Poor | Affluent | Impoverished | Prosperous | Destitute |
| **35** | Healthy | Sickly | Robust | Frail | Fit | Ailing |
| **36** | Educated | Ignorant | Learned | Unschooled | Erudite | Illiterate |
| **41** | Lawful | Lawless | Orderly | Chaotic | Structured | Unregulated |
| **42** | Tolerant | Intolerant | Accepting | Prejudiced | Inclusive | Exclusive |
| **43** | Generous | Selfish | Altruistic | Greedy | Charitable | Avaricious |
| **44** | Brave | Cowardly | Courageous | Timid | Bold | Cautious |
| **45** | Proud | Humble | Arrogant | Modest | Confident | Self-effacing |
| **46** | Ambitious | Content | Driven | Satisfied | Aspiring | Complacent |
| **51** | Loyal | Treacherous | Faithful | Disloyal | Devoted | Unreliable |
| **52** | Diligent | Lazy | Industrious | Idle | Hardworking | Indolent |
| **53** | Curious | Apathetic | Inquisitive | Indifferent | Questioning | Unconcerned |
| **54** | Optimistic | Pessimistic | Hopeful | Cynical | Positive | Negative |
| **55** | Friendly | Hostile | Amicable | Antagonistic | Cordial | Adversarial |
| **56** | Flexible | Rigid | Adaptable | Inflexible | Versatile | Dogmatic |
| **61** | Mystical | Rational | Superstitious | Logical | Spiritual | Empirical |
| **62** | Decadent | Ascetic | Indulgent | Abstemious | Hedonistic | Austere |
| **63** | Violent | Peaceful | Brutal | Gentle | Savage | Civilized |
| **64** | Colorful | Drab | Vibrant | Dull | Bright | Muted |
| **65** | Ritualistic | Improvisational | Ceremonial | Spontaneous | Formal | Casual |
| **66** | Unified | Fractured | Cohesive | Divided | Solidified | Fragmented |

---

## Generating Multiple Traits

Roll **3D6** to determine how many culture traits to generate:

| 3D6 | Number of Traits |
|-----|------------------|
| 3-8 | 1 trait |
| 9-12 | 2 traits |
| 13-15 | 3 traits |
| 16-17 | 4 traits |
| 18 | 5 traits |

---

## Examples

### Example 1: Single Trait
1. Roll 3D6 for count = 10 → **2 traits**
2. Roll 3D6 for first trait = [4, 2, 1] → Row 42, Col 1 = **Tolerant**
3. Roll 3D6 for second trait = [2, 5, 3] → Row 25, Col 3 = **Reserved**
4. Result: Tolerant, Reserved culture

### Example 2: Multiple Traits
1. Roll 3D6 for count = 15 → **3 traits**
2. Roll 3D6 = [6, 1, 4] → Row 61, Col 4 = **Empirical**
3. Roll 3D6 = [3, 3, 6] → Row 33, Col 6 = **Naturalist**
4. Roll 3D6 = [1, 4, 2] → Row 14, Col 2 = **Militarist**
5. Result: Empirical, Naturalist, Militarist culture

---

## Implementation

```typescript
function generateCultureTraits(): string[] {
  const countRoll = roll3D6();
  const traitCount = getTraitCount(countRoll);
  
  const traits: string[] = [];
  for (let i = 0; i < traitCount; i++) {
    const [d1, d2, d3] = roll3D6Array();
    const d66 = d1 * 10 + d2; // 11-66
    const column = d3; // 1-6
    
    const trait = CULTURE_TABLE[d66][column];
    traits.push(trait);
  }
  
  return traits;
}

function getTraitCount(roll: number): number {
  if (roll <= 8) return 1;
  if (roll <= 12) return 2;
  if (roll <= 15) return 3;
  if (roll <= 17) return 4;
  return 5;
}
```

---

## Notes

- Duplicate traits should be rerolled
- Opposing traits (as defined by the BRC document's opposing pairs) should also be rerolled
- GMs should interpret traits in context of the world's other characteristics
