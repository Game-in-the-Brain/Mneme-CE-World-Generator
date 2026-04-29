import type {
  StellarClass, AtmosphereComp,
  AtmoDensity, BiochemTier, BiosphereRating, HazardIntensity,
  RingProminence, ZoneId
} from '../types';
import { rollExplodingD6, sumLowest } from './dice';

// ---------------------
// 3.1 Composition Tables
// ---------------------

export interface CompositionEntry {
  name: string;
  densityMin: number;
  densityMax: number;
  reactivityDM: number;
}

export const TERRESTRIAL_COMPOSITION: Record<number, CompositionEntry> = {
  3:  { name: 'Exotic (Heavy-Element)',        densityMin: 7.5, densityMax: 9.5, reactivityDM: 2 },
  4:  { name: 'Iron-Dominant',                 densityMin: 6.0, densityMax: 7.5, reactivityDM: -1 },
  5:  { name: 'Iron-Dominant',                 densityMin: 6.0, densityMax: 7.5, reactivityDM: -1 },
  6:  { name: 'Iron-Silicate',                 densityMin: 5.0, densityMax: 6.0, reactivityDM: 1 },
  7:  { name: 'Iron-Silicate',                 densityMin: 5.0, densityMax: 6.0, reactivityDM: 1 },
  8:  { name: 'Iron-Silicate',                 densityMin: 5.0, densityMax: 6.0, reactivityDM: 1 },
  9:  { name: 'Silicate-Basaltic',             densityMin: 3.8, densityMax: 5.0, reactivityDM: 0 },
  10: { name: 'Silicate-Basaltic',             densityMin: 3.8, densityMax: 5.0, reactivityDM: 0 },
  11: { name: 'Silicate-Basaltic',             densityMin: 3.8, densityMax: 5.0, reactivityDM: 0 },
  12: { name: 'Silicate-Basaltic',             densityMin: 3.8, densityMax: 5.0, reactivityDM: 0 },
  13: { name: 'Hydrous / Ocean',               densityMin: 2.5, densityMax: 3.8, reactivityDM: 2 },
  14: { name: 'Hydrous / Ocean',               densityMin: 2.5, densityMax: 3.8, reactivityDM: 2 },
  15: { name: 'Hydrous / Ocean',               densityMin: 2.5, densityMax: 3.8, reactivityDM: 2 },
  16: { name: 'Carbonaceous',                  densityMin: 2.0, densityMax: 3.0, reactivityDM: 1 },
  17: { name: 'Carbonaceous',                  densityMin: 2.0, densityMax: 3.0, reactivityDM: 1 },
  18: { name: 'Ceramic / Silicate-Pure',       densityMin: 3.0, densityMax: 4.0, reactivityDM: 0 },
};

export const DWARF_COMPOSITION: Record<number, CompositionEntry> = {
  3:  { name: 'Exotic',                        densityMin: 1.5, densityMax: 4.0, reactivityDM: 1 },
  4:  { name: 'Metallic (M-type)',             densityMin: 5.0, densityMax: 7.5, reactivityDM: -1 },
  5:  { name: 'Metallic (M-type)',             densityMin: 5.0, densityMax: 7.5, reactivityDM: -1 },
  6:  { name: 'Silicaceous (S-type)',          densityMin: 2.8, densityMax: 3.8, reactivityDM: 0 },
  7:  { name: 'Silicaceous (S-type)',          densityMin: 2.8, densityMax: 3.8, reactivityDM: 0 },
  8:  { name: 'Silicaceous (S-type)',          densityMin: 2.8, densityMax: 3.8, reactivityDM: 0 },
  9:  { name: 'Hydrous / Icy-Rock',            densityMin: 1.5, densityMax: 2.5, reactivityDM: 2 },
  10: { name: 'Hydrous / Icy-Rock',            densityMin: 1.5, densityMax: 2.5, reactivityDM: 2 },
  11: { name: 'Hydrous / Icy-Rock',            densityMin: 1.5, densityMax: 2.5, reactivityDM: 2 },
  12: { name: 'Hydrous / Icy-Rock',            densityMin: 1.5, densityMax: 2.5, reactivityDM: 2 },
  13: { name: 'Carbonaceous (C-type)',         densityMin: 1.8, densityMax: 2.5, reactivityDM: 1 },
  14: { name: 'Carbonaceous (C-type)',         densityMin: 1.8, densityMax: 2.5, reactivityDM: 1 },
  15: { name: 'Carbonaceous (C-type)',         densityMin: 1.8, densityMax: 2.5, reactivityDM: 1 },
  16: { name: 'Rubble-Pile',                   densityMin: 1.5, densityMax: 2.2, reactivityDM: 0 },
  17: { name: 'Rubble-Pile',                   densityMin: 1.5, densityMax: 2.2, reactivityDM: 0 },
  18: { name: 'Volatile-Rich',                 densityMin: 1.2, densityMax: 2.0, reactivityDM: 2 },
};

/** Interpolate density within composition range using a 2D6 roll (2=min, 12=max). */
export function interpolateDensity(densityMin: number, densityMax: number, roll2d6: number): number {
  const t = Math.max(0, Math.min(1, (roll2d6 - 2) / 10));
  return densityMin + (densityMax - densityMin) * t;
}

/** Roll composition for a terrestrial or dwarf body (FR-042 Phase 2). */
export function rollComposition(
  type: 'terrestrial' | 'dwarf',
  roll3d6: number,
  roll2d6: number
): { composition: string; densityGcm3: number; reactivityDM: number } {
  const table = type === 'terrestrial' ? TERRESTRIAL_COMPOSITION : DWARF_COMPOSITION;
  const entry = table[roll3d6];
  if (!entry) {
    // Fallback for out-of-range rolls (shouldn't happen with 3D6 = 3–18)
    const fallback = table[10];
    return {
      composition: fallback?.name ?? 'Unknown',
      densityGcm3: 3.0,
      reactivityDM: fallback?.reactivityDM ?? 0,
    };
  }
  return {
    composition: entry.name,
    densityGcm3: interpolateDensity(entry.densityMin, entry.densityMax, roll2d6),
    reactivityDM: entry.reactivityDM,
  };
}

// ---------------------
// 3.2 Atmosphere Composition — Abiotic
// ---------------------

export interface AtmoCompEntry {
  name: AtmosphereComp;
  tempDM: number;
  hazardBias: { corrosive?: number; toxic?: number };
  habMod: number;
}

export const ATMOSPHERE_COMPOSITION: Record<number, AtmoCompEntry> = {
  3:  { name: 'H-He',            tempDM: -2, hazardBias: {},                       habMod: 1 },
  4:  { name: 'Methane-Ammonia', tempDM: -1, hazardBias: { toxic: 1 },             habMod: 0 },
  5:  { name: 'Methane-Ammonia', tempDM: -1, hazardBias: { toxic: 1 },             habMod: 0 },
  6:  { name: 'Nitrogen-Inert',  tempDM: 0,  hazardBias: {},                       habMod: 1 },
  7:  { name: 'Nitrogen-Inert',  tempDM: 0,  hazardBias: {},                       habMod: 1 },
  8:  { name: 'Nitrogen-Inert',  tempDM: 0,  hazardBias: {},                       habMod: 1 },
  9:  { name: 'Carbon-Dioxide',  tempDM: 1,  hazardBias: {},                       habMod: 0 },
  10: { name: 'Carbon-Dioxide',  tempDM: 1,  hazardBias: {},                       habMod: 0 },
  11: { name: 'Carbon-Dioxide',  tempDM: 1,  hazardBias: {},                       habMod: 0 },
  12: { name: 'Carbon-Dioxide',  tempDM: 1,  hazardBias: {},                       habMod: 0 },
  13: { name: 'Water-Steam',     tempDM: 2,  hazardBias: { corrosive: 1 },         habMod: -1 },
  14: { name: 'Water-Steam',     tempDM: 2,  hazardBias: { corrosive: 1 },         habMod: -1 },
  15: { name: 'Water-Steam',     tempDM: 2,  hazardBias: { corrosive: 1 },         habMod: -1 },
  16: { name: 'Sulfuric',        tempDM: 2,  hazardBias: { corrosive: 2, toxic: 1 }, habMod: -2 },
  17: { name: 'Sulfuric',        tempDM: 2,  hazardBias: { corrosive: 2, toxic: 1 }, habMod: -2 },
  18: { name: 'Exotic',          tempDM: 0,  hazardBias: { toxic: 1 },             habMod: -2 },
};

// ---------------------
// 3.3 Atmosphere Density
// ---------------------

export const ATMOSPHERE_DENSITY_TABLE: Record<number, { density: AtmoDensity; habMod: number }> = {
  2:  { density: 'Trace',     habMod: -2 },
  3:  { density: 'Trace',     habMod: -2 },
  4:  { density: 'Thin',      habMod: 0 },
  5:  { density: 'Thin',      habMod: 0 },
  6:  { density: 'Average',   habMod: 1 },
  7:  { density: 'Average',   habMod: 1 },
  8:  { density: 'Average',   habMod: 1 },
  9:  { density: 'Average',   habMod: 1 },
  10: { density: 'Dense',     habMod: 0 },
  11: { density: 'Dense',     habMod: 0 },
  12: { density: 'Crushing',  habMod: -2 },
};

export function getAtmosphereDensityModifiers(
  reactivityDM: number,
  gravity: number,
  isCeramic: boolean,
  isHHEscape: boolean
): number {
  if (isHHEscape) return -99; // force Trace
  let mod = 0;
  if (reactivityDM >= 2) mod += 1;
  if (reactivityDM <= -1) mod -= 1;
  if (gravity >= 2.0) mod += 2;
  if (gravity <= 0.3) mod -= 2;
  if (isCeramic) mod -= 1;
  return mod;
}

// ---------------------
// 3.4 Biochem Resources (11-tier)
// ---------------------

export interface BiochemEntry {
  tier: BiochemTier;
  habMod: number;
}

export const BIOCHEM_TABLE: Record<number, BiochemEntry> = {
  3:  { tier: 'Scarce',        habMod: -5 },
  4:  { tier: 'Rare',          habMod: -4 },
  5:  { tier: 'Uncommon',      habMod: -3 },
  6:  { tier: 'Poor',          habMod: -2 },
  7:  { tier: 'Poor',          habMod: -2 },
  8:  { tier: 'Deficient',     habMod: -1 },
  9:  { tier: 'Deficient',     habMod: -1 },
  10: { tier: 'Common',        habMod: 0 },
  11: { tier: 'Common',        habMod: 0 },
  12: { tier: 'Abundant',      habMod: 1 },
  13: { tier: 'Abundant',      habMod: 1 },
  14: { tier: 'Rich',          habMod: 2 },
  15: { tier: 'Bountiful',     habMod: 3 },
  16: { tier: 'Prolific',      habMod: 4 },
  17: { tier: 'Inexhaustible', habMod: 5 },
  18: { tier: 'Inexhaustible', habMod: 5 },
};

export function lookupBiochem(modifiedRoll: number): BiochemEntry {
  const clamped = Math.max(3, Math.min(18, modifiedRoll));
  return BIOCHEM_TABLE[clamped];
}

// ---------------------
// 3.5 Biosphere Test — Dice Pool
// ---------------------

export interface DicePool {
  diceCount: number;   // total dice rolled
  keepCount: number;   // dice kept (always 5 for biosphere)
  keepType: 'highest' | 'lowest';
}

/** Build the dice pool from net disadvantage level.
 *  Negative disLevel = advantage; positive = disadvantage.
 */
export function buildBiosphereDicePool(netDisLevel: number): DicePool {
  // Base: 5D6. Each dis level adds 1 die and keeps lowest 5.
  // Each adv level adds 1 die and keeps highest 5.
  const baseDice = 5;
  const keep = 5;
  if (netDisLevel >= 0) {
    return { diceCount: baseDice + netDisLevel, keepCount: keep, keepType: 'lowest' };
  }
  return { diceCount: baseDice + Math.abs(netDisLevel), keepCount: keep, keepType: 'highest' };
}

export function getBiochemHabMod(tier: BiochemTier): number {
  const entry = Object.values(BIOCHEM_TABLE).find(e => e.tier === tier);
  return entry?.habMod ?? 0;
}

// ---------------------
// 3.6 Biosphere Rating
// ---------------------

export function computeBiosphereRating(roll: number, tn: number): { rating: BiosphereRating; habMod: number } {
  const margin = roll - tn;
  if (margin < -5) return { rating: 'B0', habMod: 0 };
  if (margin < 0)  return { rating: 'B1', habMod: 0 };
  if (margin <= 2) return { rating: 'B2', habMod: 1 };
  if (margin <= 5) return { rating: 'B3', habMod: 2 };
  if (margin <= 8) return { rating: 'B4', habMod: 4 };
  if (margin <= 11) return { rating: 'B5', habMod: 6 };
  return { rating: 'B6', habMod: 8 };
}

// ---------------------
// 3.7 Atmosphere Conversion
// ---------------------

export function convertAtmosphere(abiotic: AtmosphereComp, rating: BiosphereRating): AtmosphereComp {
  if (rating < 'B3') return abiotic;
  const isB3 = rating === 'B3';
  switch (abiotic) {
    case 'H-He':            return 'H-He';
    case 'Methane-Ammonia': return isB3 ? 'Methane-Ammonia' : 'Nitrogen-Inert';
    case 'Nitrogen-Inert':  return isB3 ? 'Nitrogen-Inert' : 'Nitrogen-Inert'; // B4+ = N-O
    case 'Carbon-Dioxide':  return isB3 ? 'Carbon-Dioxide' : 'Nitrogen-Inert'; // B4+ = N-O
    case 'Water-Steam':     return isB3 ? 'Water-Steam' : 'Nitrogen-Inert';     // B4+ = humid N-O
    case 'Sulfuric':        return isB3 ? 'Sulfuric' : 'Carbon-Dioxide';
    case 'Exotic':          return 'Exotic';
    default:                return abiotic;
  }
}

/** After conversion, what is the hab mod for the (possibly converted) atmosphere? */
export function getConvertedAtmoHabMod(abiotic: AtmosphereComp, rating: BiosphereRating): number {
  const converted = convertAtmosphere(abiotic, rating);
  if (converted === 'Nitrogen-Inert' && rating >= 'B4') return 0; // N-O is breathable
  // Otherwise use abiotic penalty
  const entry = Object.values(ATMOSPHERE_COMPOSITION).find(e => e.name === abiotic);
  return entry?.habMod ?? 0;
}

// ---------------------
// 4.2 Zone Temperature DM
// ---------------------

export const ZONE_TEMPERATURE_DM: Record<ZoneId, number> = {
  'Infernal': 5,
  'Hot': 3,
  'Conservative': 0,
  'Cool': -2,
  'FrostLine': -3,
  'O1': -4,
  'O2': -5,
  'O3': -6,
  'O4': -7,
  'O5': -8,
};

// ---------------------
// 4.2b Zone Radiation Hazard DM (260427-01 Option 1)
// ---------------------
// Stacks with Reactivity DM and atmosphere hazard bias on the step-4 hazard roll.
// Inner zones carry a stellar-radiation cost; outer zones do not.
// Justification + alternative magnitudes documented in 260427-01.

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

// ---------------------
// 4.3 Atmosphere Density Greenhouse DM
// ---------------------

export const DENSITY_GREENHOUSE_DM: Record<AtmoDensity, number> = {
  'Trace': -2,
  'Thin': -1,
  'Average': 0,
  'Dense': 1,
  'Crushing': 2,
};

// ---------------------
// 6.3 Hazard (v2)
// ---------------------

export const HAZARD_TABLE_V2: Record<number, { hazard: import('../types').HazardType; habMod: number }> = {
  2:  { hazard: 'None',       habMod: 1 },
  3:  { hazard: 'None',       habMod: 1 },
  4:  { hazard: 'Polluted',   habMod: 0 },
  5:  { hazard: 'Polluted',   habMod: 0 },
  6:  { hazard: 'Polluted',   habMod: 0 },
  7:  { hazard: 'Corrosive',  habMod: -1 },
  8:  { hazard: 'Corrosive',  habMod: -1 },
  9:  { hazard: 'Biohazard',  habMod: -1 },
  10: { hazard: 'Toxic',      habMod: -2 },
  11: { hazard: 'Radioactive',habMod: -3 },
  12: { hazard: 'Radioactive',habMod: -3 },
};

// ---------------------
// 6.4 Hazard Intensity (v2)
// ---------------------

export const HAZARD_INTENSITY_V2: Record<number, { intensity: HazardIntensity; habMod: number }> = {
  2:  { intensity: 'Trace',    habMod: 1 },
  3:  { intensity: 'Trace',    habMod: 1 },
  4:  { intensity: 'Light',    habMod: 1 },
  5:  { intensity: 'Light',    habMod: 1 },
  6:  { intensity: 'Light',    habMod: 1 },
  7:  { intensity: 'Moderate', habMod: 0 },
  8:  { intensity: 'Moderate', habMod: 0 },
  9:  { intensity: 'Moderate', habMod: 0 },
  10: { intensity: 'Heavy',    habMod: -1 },
  11: { intensity: 'Heavy',    habMod: -1 },
  12: { intensity: 'Extreme',  habMod: -2 },
};

// ---------------------
// 6.5 Gravity Modifier (Symmetric)
// ---------------------

export function getGravityHabMod(gravity: number): number {
  if (gravity < 0.1) return -2;
  if (gravity < 0.3) return -1;
  if (gravity < 0.7) return 0;
  if (gravity < 1.3) return 0;
  if (gravity < 1.7) return 0;
  if (gravity < 2.5) return -1;
  return -2;
}

// ---------------------
// 5. Rings
// ---------------------

export function getRingExistenceThreshold(parentType: 'terrestrial' | 'ice' | 'gas'): number {
  switch (parentType) {
    case 'gas': return 7;
    case 'ice': return 9;
    case 'terrestrial': return 11;
  }
}

export const RING_PROMINENCE_TABLE: Record<number, { prominence: RingProminence; label: string }> = {
  2:  { prominence: 'faint',     label: 'Faint dusty band' },
  3:  { prominence: 'faint',     label: 'Faint dusty band' },
  4:  { prominence: 'moderate',  label: 'Moderate ring system' },
  5:  { prominence: 'moderate',  label: 'Moderate ring system' },
  6:  { prominence: 'moderate',  label: 'Moderate ring system' },
  7:  { prominence: 'prominent', label: 'Prominent rings' },
  8:  { prominence: 'prominent', label: 'Prominent rings' },
  9:  { prominence: 'prominent', label: 'Prominent rings' },
  10: { prominence: 'brilliant', label: 'Brilliant rings' },
  11: { prominence: 'brilliant', label: 'Brilliant rings' },
  12: { prominence: 'massive',   label: 'Massive ring system' },
};

// ---------------------
// 4.3 Disk Generation (v2)
// ---------------------

export function getDiskClassModifier(stellarClass: StellarClass): number {
  switch (stellarClass) {
    case 'M': return -1;
    case 'K': return 0;
    case 'G': return 0;
    case 'F': return 1;
    case 'A': return 2;
    case 'B': return 3;
    case 'O': return 4;
  }
}

/** v2 disk count formula. */
export function rollDiskCount(stellarClass: StellarClass): number {
  const exploding = rollExplodingD6(3);
  const baseRoll = sumLowest(exploding, 2);
  const classMod = getDiskClassModifier(stellarClass);
  return Math.max(0, Math.floor((baseRoll + classMod) / 2) - 1);
}

// ---------------------
// 4.7 Hot Jupiter Shepherding Roll
// ---------------------

export function rollShepherdingRetention(stellarClass: StellarClass): number {
  switch (stellarClass) {
    case 'F': {
      // 6D6 keep lowest 4
      const dice = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
      dice.sort((a, b) => a - b);
      const kept = dice.slice(0, 4);
      return 70 + kept.reduce((s, v) => s + v, 0);
    }
    case 'G': {
      // 5D6 keep lowest 4
      const dice = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
      dice.sort((a, b) => a - b);
      const kept = dice.slice(0, 4);
      return 70 + kept.reduce((s, v) => s + v, 0);
    }
    case 'K': {
      // 4D6 straight
      const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      return 70 + dice.reduce((s, v) => s + v, 0);
    }
    case 'M': {
      // 5D6 keep highest 4
      const dice = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
      dice.sort((a, b) => b - a);
      const kept = dice.slice(0, 4);
      return 70 + kept.reduce((s, v) => s + v, 0);
    }
    default: {
      const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      return 70 + dice.reduce((s, v) => s + v, 0);
    }
  }
}
