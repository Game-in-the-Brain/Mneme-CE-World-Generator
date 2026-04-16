import type { RollResult, TableWeights } from '../types';

// =====================
// Basic Dice Rolls
// =====================

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollD66(): number {
  const tens = rollD6();
  const ones = rollD6();
  return tens * 10 + ones;
}

export function rollXD6(count: number): number[] {
  return Array.from({ length: count }, () => rollD6());
}

// =====================
// Advanced Rolls
// =====================

export function rollKeep(
  diceRolls: number,
  diceType: number,
  keepSize: number,
  keepType: 'highest' | 'lowest' = 'highest',
  modifier: number = 0
): RollResult {
  const rolls = Array.from({ length: diceRolls }, () => 
    Math.floor(Math.random() * diceType) + 1
  );
  
  const sorted = [...rolls].sort((a, b) => 
    keepType === 'highest' ? b - a : a - b
  );
  
  const kept = sorted.slice(0, keepSize);
  const total = kept.reduce((sum, r) => sum + r, 0) + modifier;
  
  return {
    value: total,
    rolls: [{
      notation: `${diceRolls}D${diceType} keep ${keepSize} ${keepType}${modifier ? `+${modifier}` : ''}`,
      dice: rolls,
      modifier,
      total
    }]
  };
}

export function rollExploding(
  diceRolls: number,
  diceType: number,
  multiplier: number = 1,
  modifier: number = 0
): RollResult {
  const rolls: number[] = [];
  
  for (let i = 0; i < diceRolls; i++) {
    let roll = Math.floor(Math.random() * diceType) + 1;
    rolls.push(roll);
    
    // Exploding dice - reroll on max
    while (roll === diceType) {
      roll = Math.floor(Math.random() * diceType) + 1;
      rolls.push(roll);
    }
  }
  
  const total = rolls.reduce((sum, r) => sum + r, 0) * multiplier + modifier;
  
  return {
    value: total,
    rolls: [{
      notation: `${diceRolls}D${diceType} exploding`,
      dice: rolls,
      modifier,
      total
    }]
  };
}

// =====================
// Dice Notation Helpers
// =====================

/**
 * Roll 2D6 with weighted probabilities.
 * `weights.dice` must be length 11, mapping indices 0..10 to rolls 2..12.
 */
export function rollWeighted2D6(weights: TableWeights): RollResult {
  const totalWeight = weights.dice.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) {
    // Fallback to uniform if weights are all zero
    return roll2D6();
  }
  let pick = Math.random() * totalWeight;
  for (let i = 0; i < weights.dice.length; i++) {
    pick -= weights.dice[i];
    if (pick <= 0) {
      const value = i + 2; // map index 0 -> roll 2
      return {
        value,
        rolls: [{
          notation: `weighted 2D6 [${weights.dice.join(', ')}]`,
          dice: [value],
          modifier: 0,
          total: value,
        }]
      };
    }
  }
  // Should never reach here, but safety fallback
  return roll2D6();
}

export function roll2D6(): RollResult {
  return rollKeep(2, 6, 2, 'highest', 0);
}

export function roll2D6Adv(advantage: number = 1): RollResult {
  return rollKeep(2 + advantage, 6, 2, 'highest', 0);
}

export function roll2D6Dis(disadvantage: number = 1): RollResult {
  return rollKeep(2 + disadvantage, 6, 2, 'lowest', 0);
}

export function roll3D6(): RollResult {
  return rollKeep(3, 6, 3, 'highest', 0);
}

export function roll5D6(): RollResult {
  return rollKeep(5, 6, 5, 'highest', 0);
}

export function roll2D3(): RollResult {
  return rollKeep(2, 3, 2, 'highest', 0);
}

export function roll1D6Reroll6(): RollResult {
  let roll = rollD6();
  const rolls = [roll];
  
  while (roll === 6) {
    roll = rollD6();
    rolls.push(roll);
  }
  
  return {
    value: roll,
    rolls: [{
      notation: '1D6 reroll 6',
      dice: rolls,
      modifier: 0,
      total: roll
    }]
  };
}

// =====================
// Utility
// =====================

export function formatRollResult(result: RollResult): string {
  const roll = result.rolls[0];
  return `${roll.notation}: [${roll.dice.join(', ')}] = ${result.value}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
