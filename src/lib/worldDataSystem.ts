import type { Zone, StellarClass, AtmosphereType, TemperatureType } from '../types';

// =====================
// Planetary System
// =====================

/**
 * Generate body count with optional stellar class Adv/Dis modifiers (QA-007 / QA-015 / FRD 8.1-8.2).
 *
 * | Class | Modifier               |
 * |-------|------------------------|
 * | F     | Adv+2 on d6            |
 * | G     | Baseline (d6)          |
 * | K     | Dis+3 on d6            |
 * | M     | Half Dice + Dis+1 (d3) |
 * | O,B,A | Disks only             |
 *
 * House Rule REF-007 v1.2 — Half Dice mechanic for M-class stars (QA-015).
 * K-class: d6 with Dis+3 (reduced planet counts).
 * M-class: d3 with Dis+1 (significantly reduced planet counts — Half Dice).
 * F-class: Adv+2 on d6 (more planets).
 * G-class: Baseline d6 (standard distribution).
 */
export function getBodyCount(
  type: 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas',
  stellarClass?: StellarClass
): number {
  // O, B, A stars: only circumstellar disks
  if (stellarClass && (stellarClass === 'O' || stellarClass === 'B' || stellarClass === 'A')) {
    if (type !== 'disk') return 0;
  }

  // Roll N dice, keep best/worst M (for d6)
  function rollNd6KeepM(n: number, keep: number, keepLowest: boolean): number {
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => keepLowest ? a - b : b - a);
    return rolls.slice(0, keep).reduce((s, r) => s + r, 0);
  }

  // Roll N d3 dice, keep best/worst M (for Half Dice mechanic)
  function rollNd3KeepM(n: number, keep: number, keepLowest: boolean): number {
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * 3) + 1);
    rolls.sort((a, b) => keepLowest ? a - b : b - a);
    return rolls.slice(0, keep).reduce((s, r) => s + r, 0);
  }

  const advExtra = stellarClass === 'F' ? 2 : 0;
  const disExtraK = stellarClass === 'K' ? 3 : 0; // K-class: Dis+3 on d6
  // M-class: Half Dice (d3) with Dis+1 — handled separately per type

  switch (type) {
    case 'disk': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 1d3-1, roll 2d3 keep lowest 1
        const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 3) + 1);
        rolls.sort((a, b) => a - b);
        return Math.max(0, rolls[0] - 1);
      }
      // Standard: 2D3 - 2 (disks use d3 for all stars)
      const r1 = Math.floor(Math.random() * 3) + 1;
      const r2 = Math.floor(Math.random() * 3) + 1;
      return Math.max(0, r1 + r2 - 2);
    }
    case 'dwarf': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 3d3-3, roll 4d3 keep lowest 3
        return Math.max(0, rollNd3KeepM(4, 3, true) - 3);
      }
      // Standard: 3D6 - 3 with Adv/Dis
      if (advExtra > 0) return Math.max(0, rollNd6KeepM(3 + advExtra, 3, false) - 3);
      if (disExtraK > 0) return Math.max(0, rollNd6KeepM(3 + disExtraK, 3, true) - 3);
      return Math.max(0,
        (Math.floor(Math.random() * 6) + 1) +
        (Math.floor(Math.random() * 6) + 1) +
        (Math.floor(Math.random() * 6) + 1) - 3
      );
    }
    case 'terrestrial': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 2d3-2, roll 3d3 keep lowest 2
        return Math.max(0, rollNd3KeepM(3, 2, true) - 2);
      }
      // Standard: 2D6 - 2 with Adv/Dis
      if (advExtra > 0) return Math.max(0, rollNd6KeepM(2 + advExtra, 2, false) - 2);
      if (disExtraK > 0) return Math.max(0, rollNd6KeepM(2 + disExtraK, 2, true) - 2);
      return Math.max(0,
        (Math.floor(Math.random() * 6) + 1) +
        (Math.floor(Math.random() * 6) + 1) - 2
      );
    }
    case 'ice': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 1d3-1, roll 2d3 keep lowest 1
        const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 3) + 1);
        rolls.sort((a, b) => a - b);
        return Math.max(0, rolls[0] - 1);
      }
      // Standard: 2D3 - 2 (ice worlds use d3 for all stars)
      const r1 = Math.floor(Math.random() * 3) + 1;
      const r2 = Math.floor(Math.random() * 3) + 1;
      return Math.max(0, r1 + r2 - 2);
    }
    case 'gas': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 1d3-1, roll 2d3 keep lowest 1
        const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 3) + 1);
        rolls.sort((a, b) => a - b);
        return Math.max(0, rolls[0] - 1);
      }
      // Standard: 2D3 - 2 (gas worlds use d3 for all stars)
      const r1 = Math.floor(Math.random() * 3) + 1;
      const r2 = Math.floor(Math.random() * 3) + 1;
      return Math.max(0, r1 + r2 - 2);
    }
  }
}

export function getGasWorldClass(roll: number): string {
  if (roll <= 17) return 'V';
  if (roll <= 20) return 'IV';
  if (roll <= 22) return 'III';
  if (roll <= 26) return 'II';
  return 'I';
}

// =====================
// World Position
// =====================

export function calculateWorldPosition(
  _atmosphere: AtmosphereType,
  temperature: TemperatureType,
  luminosity: number
): { zone: Zone; distanceAU: number } {
  const sqrtL = Math.sqrt(luminosity);
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // Determine base zone from atmosphere + temperature
  let baseZone: Zone;
  
  if (temperature === 'Inferno') baseZone = 'Infernal';
  else if (temperature === 'Hot') baseZone = 'Hot';
  else if (temperature === 'Average') baseZone = 'Conservative';
  else if (temperature === 'Cold') baseZone = 'Cold';
  else baseZone = 'Outer';
  
  // Calculate distance based on zone
  let distance: number;
  switch (baseZone) {
    case 'Infernal':
      distance = sqrtL * (0.067 * roll);
      break;
    case 'Hot':
      distance = sqrtL * ((0.067 * roll) + 0.4);
      break;
    case 'Conservative':
      distance = sqrtL * ((0.067 * roll) + 0.7);
      break;
    case 'Cold':
      distance = sqrtL * ((0.61 * roll) + 1.2);
      break;
    case 'Outer': {
      const outerRoll = Math.floor(Math.random() * 6) + 1;
      let multiplier = 1;
      if (outerRoll === 6) {
        // Roll again and multiply
        let sixes = 1;
        let reroll = 6;
        while (reroll === 6) {
          reroll = Math.floor(Math.random() * 6) + 1;
          if (reroll === 6) sixes++;
        }
        multiplier = sixes;
      }
      distance = sqrtL * (Math.pow(outerRoll, 2) + 4.85) * multiplier;
      break;
    }
  }
  
  return { zone: baseZone, distanceAU: Math.round(distance * 100) / 100 };
}

// =====================
// Habitat Size Table (Hab ≤ 0 populated worlds — MVT/GVT)
// =====================

export function getHabitatSize(roll: number): { type: string; population: number } {
  if (roll === 2)  return { type: 'Frontier Outpost',   population: Math.floor(Math.random() * 90)       + 10 };
  if (roll <= 4)   return { type: 'Research Station',   population: Math.floor(Math.random() * 900)      + 100 };
  if (roll <= 6)   return { type: 'Mining Habitat',     population: Math.floor(Math.random() * 9000)     + 1000 };
  if (roll <= 8)   return { type: 'Industrial Habitat', population: Math.floor(Math.random() * 90000)    + 10000 };
  if (roll <= 10)  return { type: 'Colonial Habitat',   population: Math.floor(Math.random() * 900000)   + 100000 };
  if (roll === 11) return { type: 'City Habitat',       population: Math.floor(Math.random() * 9000000)  + 1000000 };
  return             { type: 'Megastructure',           population: Math.floor(Math.random() * 90000000) + 10000000 };
}

// =====================
// Tech Level Reference Table (REF-013)
// =====================

export interface TLEntry {
  mtl: number;
  ceTL: number;
  ceYear: string;
  heYear: string;
  eraName: string;
  keyTechnologies: string;
}

export const TL_TABLE: Record<number, TLEntry> = {
  9:  { mtl: 9,  ceTL: 7.0, ceYear: '2050 CE', heYear: '12,050 HE', eraName: 'New Space Race / Space Industrialisation',        keyTechnologies: 'Reliable orbit access, maker era, companion AI, graphene fibre, orbital manufacturing, and Lunar colonisation. Xeno-surrogacy and human gene-engineering emerge.' },
  10: { mtl: 10, ceTL: 8.0, ceYear: '2100 CE', heYear: '12,100 HE', eraName: 'Cis-Lunar Development',                           keyTechnologies: 'Skyhook networks, Lagrange manufacturing, Lunar Frontier Economy developing with footholds to other planets. Voidborn colonisation begins. Combined Cis-Lunar economy exceeds any single nation on Earth.' },
  11: { mtl: 11, ceTL: 8.5, ceYear: '2200 CE', heYear: '12,200 HE', eraName: 'Interplanetary Settlement & Jovian Colonisation',  keyTechnologies: 'Space economy surpasses Earth. Jupiter colonisation enabled by Carbon Nanotube construction — gigaton-scale structures and ships. Jovian Variant humans. Space elevator construction begins. Jovian economy surpasses Cis-Lunar.' },
  12: { mtl: 12, ceTL: 9.0, ceYear: '2300 CE', heYear: '12,300 HE', eraName: 'Post-Earth Dependence',                           keyTechnologies: 'Early jump gate (initially only at the Jupiter/Sol Lagrange point). Jovian economy independent of Earth, population exceeding Earth\'s. Jovian Hammers skim Jupiter for unique materials. The Bakunawa/Antaboga Coil — 898,394 km particle accelerator — creates antimatter to power jump gates.' },
  13: { mtl: 13, ceTL: 9.5, ceYear: '2400 CE', heYear: '12,400 HE', eraName: 'Outer System Development',                        keyTechnologies: 'World Serpents (particle accelerators on radiation belts) and jump gates connect star systems. Great Trees (fixed space elevators, Bradley C. Edwards design) viable for >1G escape by 24th century. Celestials (inner system solar swarms) sail light. Terraforming Worms process microbiomes on low-G worlds. Colony ships — O\'Neill cylinders and spiral CNT constructs — jump to new stars. Earth restoration begins.' },
  14: { mtl: 14, ceTL: 10.0, ceYear: '2500 CE', heYear: '12,500 HE', eraName: 'Early Interstellar Trade & Exploration',         keyTechnologies: 'Jump opens nearby systems. First contact with Divergent Humans — outside-Sol humans using Xeno-Surrogacy (early FTL). 200+ years of freedom allowed billions to emerge. Convergent technology exchange. Terraforming increases Venus and Mars habitability. Intense exodus from Sol.' },
  15: { mtl: 15, ceTL: 10.5, ceYear: '2600 CE', heYear: '12,600 HE', eraName: 'Interstellar Colonisation',                      keyTechnologies: 'Interstellar colonisation well underway with 100 billion+ people outside Sol. Spiral Ships — CNT space elevators twisted into spiral O\'Neill cylinders — fit Jump Gates to carry communities to new stars. Generated primarily by Jupiter, which keeps growing.' },
  16: { mtl: 16, ceTL: 11.0, ceYear: '2700 CE', heYear: '12,700 HE', eraName: 'Self-Sufficient Megastructures & Swarms',        keyTechnologies: 'Serpents, Trees, and Celestials become self-directed — jumping and spreading outward. Humanity cannot help but be carried away by the momentum of its own creations.' },
  17: { mtl: 17, ceTL: 11.5, ceYear: '2800 CE', heYear: '12,800 HE', eraName: 'Post-Megastructure Expansion',                   keyTechnologies: 'Civilisation expands beyond any single direction. The megastructures carry it outward.' },
  18: { mtl: 18, ceTL: 12.0, ceYear: '2900+ CE', heYear: '12,900+ HE', eraName: 'Unknown Future',                               keyTechnologies: 'Beyond current modelling. Civilisational trajectory unknown.' },
};



