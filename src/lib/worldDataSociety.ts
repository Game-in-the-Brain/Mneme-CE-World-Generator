import type { ResourceLevel, WealthLevel, PowerStructure, DevelopmentLevel, PowerSource, TableWeights } from '../types';
import { rollWeighted2D6 } from './dice';

// =====================
// Tech Level Table
// =====================

export function getTechLevel(roll: number): number {
  if (roll === 2) return 7;
  if (roll === 3) return 8;
  if (roll === 4) return 9;
  if (roll === 5) return 10;
  if (roll <= 7) return 11;
  if (roll === 8) return 12;
  if (roll === 9) return 13;
  if (roll === 10) return 14;
  if (roll === 11) return 15;
  return 16;
}

export function getTechLevelDescription(tl: number): string {
  const descriptions: Record<number, string> = {
    7: 'Early Space Age (1950-2000)',
    8: 'Commercial Space (2000-2050)',
    9: 'New Space Race (2050-2100)',
    10: 'Cis Lunar Development (2100-2200)',
    11: 'Interstellar Settlement (2200-2300)',
    12: 'Post Earth Dependence (2300-2400)',
    13: 'Early Jump-Drive (2400-2500)',
    14: 'Interstellar Space (2500-2600)',
    15: 'Interstellar Colonization',
    16: 'Self-Sufficient Mega Structures',
  };
  return descriptions[tl] || 'Unknown';
}

// =====================
// Population
// =====================


// =====================
// Wealth Table
// =====================

export function getWealth(roll: number, resources: ResourceLevel): WealthLevel;
export function getWealth(roll: undefined, resources: ResourceLevel, weights?: TableWeights): WealthLevel;
export function getWealth(roll: number | undefined, resources: ResourceLevel, weights?: TableWeights): WealthLevel {
  const r = roll ?? (weights ? rollWeighted2D6(weights).value : (() => {
    const v = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    return v;
  })());

  let modifier = 0;
  if (resources === 'Abundant') modifier = 1;
  if (resources === 'Inexhaustible') modifier = 2;

  const adjustedRoll = r + modifier;

  if (adjustedRoll <= 8) return 'Average';
  if (adjustedRoll <= 10) return 'Better-off';
  if (adjustedRoll === 11) return 'Prosperous';
  return 'Affluent';
}

export function getWealthModifier(wealth: WealthLevel): number {
  switch (wealth) {
    case 'Average': return 0;
    case 'Better-off': return 1;
    case 'Prosperous': return 2;
    case 'Affluent': return 3;
  }
}

// =====================
// Power Structure Table
// =====================

export function getPowerStructure(roll?: number, weights?: TableWeights): PowerStructure {
  const r = roll ?? (weights ? rollWeighted2D6(weights).value : (() => {
    const v = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    return v;
  })());
  if (r <= 7) return 'Anarchy';
  if (r <= 9) return 'Confederation';
  if (r <= 11) return 'Federation';
  return 'Unitary State';
}

// =====================
// Development Table
// =====================

export function getDevelopment(roll?: number, weights?: TableWeights): { level: DevelopmentLevel; hdi: string; soc: number } {
  const r = roll ?? (weights ? rollWeighted2D6(weights).value : (() => {
    const v = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    return v;
  })());
  if (r === 2) return { level: 'UnderDeveloped', hdi: '0.0-0.39', soc: 2 };
  if (r <= 5) return { level: 'UnderDeveloped', hdi: '0.40-0.49', soc: 3 };
  if (r <= 7) return { level: 'UnderDeveloped', hdi: '0.50-0.59', soc: 4 };
  if (r === 8) return { level: 'Developing', hdi: '0.60-0.69', soc: 5 };
  if (r === 9) return { level: 'Mature', hdi: '0.70-0.79', soc: 6 };
  if (r === 10) return { level: 'Developed', hdi: '0.80-0.89', soc: 8 };
  if (r === 11) return { level: 'Well Developed', hdi: '0.9-0.94', soc: 9 };
  return { level: 'Very Developed', hdi: '>0.95', soc: 10 };
}

export function getDevelopmentModifier(dev: DevelopmentLevel): number {
  switch (dev) {
    case 'UnderDeveloped': return -2;
    case 'Developing': return -1;
    case 'Mature': return 0;
    case 'Developed': return 1;
    case 'Well Developed': return 2;
    case 'Very Developed': return 3;
  }
}

// =====================
// Source of Power Table
// =====================

export function getSourceOfPower(roll?: number, weights?: TableWeights): PowerSource {
  const r = roll ?? (weights ? rollWeighted2D6(weights).value : (() => {
    const v = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    return v;
  })());
  if (r <= 5) return 'Aristocracy';
  if (r <= 7) return 'Ideocracy';
  if (r <= 9) return 'Kratocracy';
  if (r <= 11) return 'Democracy';
  return 'Meritocracy';
}

// =====================
// Governance DM Table
// =====================

export function getGovernanceDM(dev: DevelopmentLevel, wealth: WealthLevel): number {
  const table: Record<DevelopmentLevel, Record<WealthLevel, number>> = {
    'UnderDeveloped': { 'Average': -9, 'Better-off': -3, 'Prosperous': 3, 'Affluent': 9 },
    'Developing': { 'Average': -8, 'Better-off': -2, 'Prosperous': 4, 'Affluent': 10 },
    'Mature': { 'Average': -7, 'Better-off': -1, 'Prosperous': 5, 'Affluent': 11 },
    'Developed': { 'Average': -6, 'Better-off': 0, 'Prosperous': 6, 'Affluent': 12 },
    'Well Developed': { 'Average': -5, 'Better-off': 1, 'Prosperous': 7, 'Affluent': 13 },
    'Very Developed': { 'Average': -4, 'Better-off': 2, 'Prosperous': 8, 'Affluent': 14 },
  };
  return table[dev][wealth];
}

