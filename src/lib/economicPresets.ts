import type { TLProductivityPreset, TableWeights } from '../types';

// =====================
// Constants
// =====================

/** Base Boat purchase price in Credits — reference unit for all ship cost scaling (v1.3.100) */
export const BOAT_PRICE_CR = 5_480_400;

/** Default number of days in a standard year */
export const DAYS_PER_YEAR = 365;

/** Legacy Mneme GDP ratios relative to TL7 baseline */
export const MNEME_RATIOS: Record<number, number> = {
  7: 1,
  8: 552 / 205,
  9: 1_486 / 205,
  10: 4_000 / 205,
  11: 29_000 / 205,
  12: 210_000 / 205,
  13: 1_500_000 / 205,
  14: 11_000_000 / 205,
  15: 80_000_000 / 205,
  16: 578_000_000 / 205,
};

// =====================
// Built-in Presets
// =====================

/** Exact Mneme default — reproduces legacy GDP_PER_DAY_BY_TL behavior */
export const MNEME_PRESET: TLProductivityPreset = {
  id: 'mneme',
  name: 'Mneme',
  description: 'Compounding productivity growth per TL. High automation, post-scarcity-adjacent economics.',
  baseIncome: 45_199, // TL 9 SOC 7 monthly income (legacy 1,486 Cr/day × 365 / 12)
  baseTL: 9,
  curve: 'mneme',
  boatYears: 10.1, // derived: 5,480,400 / (45,199 × 12) ≈ 10.1
};

/** CE / Traveller stagnant preset — flat 2,000 Cr/month SOC 7 at every TL */
export const CE_PRESET: TLProductivityPreset = {
  id: 'ce',
  name: 'CE / Traveller',
  description: 'Flat income across all TLs. Human-labour-dominant, low-compound stagnation model.',
  baseIncome: 2_000, // TL 9 SOC 7 monthly income
  baseTL: 9,
  curve: 'flat',
  boatYears: 228.35, // derived: 5,480,400 / (2,000 × 12) = 228.35
};

export const BUILT_IN_PRESETS: TLProductivityPreset[] = [MNEME_PRESET, CE_PRESET];

// =====================
// Helpers
// =====================

/**
 * Derive boat-years from a given SOC 7 monthly income.
 */
export function getBoatYears(monthlyIncome: number): number {
  if (!monthlyIncome || monthlyIncome <= 0) return Infinity;
  return BOAT_PRICE_CR / (monthlyIncome * 12);
}

/**
 * Derive SOC 7 monthly income from a target boat-years value (QA-046).
 */
export function getBaseIncomeFromBoatYears(boatYears: number): number {
  if (!boatYears || boatYears <= 0) return 1;
  return BOAT_PRICE_CR / (boatYears * 12);
}

/**
 * Compute SOC 7 monthly income for a given TL using a preset.
 */
export function getSoc7MonthlyIncome(tl: number, preset: TLProductivityPreset): number {
  if (preset.curve === 'custom' && preset.soc7IncomeByTL) {
    return preset.soc7IncomeByTL[tl] ?? preset.soc7IncomeByTL[preset.baseTL] ?? preset.baseIncome;
  }

  if (preset.curve === 'flat') {
    return preset.baseIncome;
  }

  if (preset.curve === 'mneme') {
    const baseRatio = MNEME_RATIOS[preset.baseTL] ?? 1;
    const tlRatio = MNEME_RATIOS[tl] ?? baseRatio;
    return preset.baseIncome * (tlRatio / baseRatio);
  }

  if (preset.curve === 'linear' && preset.linearMultiplier) {
    const steps = tl - preset.baseTL;
    return preset.baseIncome * Math.pow(preset.linearMultiplier, steps);
  }

  return preset.baseIncome;
}

/**
 * Compute GDP per person per day for a given TL using a preset.
 */
export function getGdpPerDayFromPreset(tl: number, preset: TLProductivityPreset): number {
  const monthly = getSoc7MonthlyIncome(tl, preset);
  const annual = monthly * 12;
  return annual / DAYS_PER_YEAR;
}

/**
 * Compute income for any SOC given the SOC 7 income.
 * SOC > 7: doubles per step
 * SOC < 7: halves per step
 */
export function getIncomeForSoc(soc: number, soc7Monthly: number): number {
  const delta = soc - 7;
  return soc7Monthly * Math.pow(2, delta);
}

/**
 * Compute "income-years" to buy a ship at a given world's TL.
 */
export function getIncomeYears(shipPriceCr: number, tl: number, preset: TLProductivityPreset): number {
  const monthly = getSoc7MonthlyIncome(tl, preset);
  if (!monthly || monthly <= 0) return Infinity;
  const annual = monthly * 12;
  return shipPriceCr / annual;
}

// =====================
// Preset builder
// =====================

export function buildPresetFromBase(
  id: string,
  name: string,
  description: string,
  baseIncome: number,
  baseTL: number,
  curve: TLProductivityPreset['curve'],
  linearMultiplier?: number,
  soc7IncomeByTL?: Record<number, number>
): TLProductivityPreset {
  return {
    id,
    name,
    description,
    baseIncome,
    baseTL,
    curve,
    linearMultiplier,
    soc7IncomeByTL,
    boatYears: getBoatYears(baseIncome),
  };
}

// =====================
// Table Weights Defaults
// =====================

/** Natural 2D6 bell curve weights (rolls 2..12) */
export const NATURAL_2D6_WEIGHTS: TableWeights = {
  dice: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
};

/** Flat / uniform distribution weights */
export const FLAT_WEIGHTS: TableWeights = {
  dice: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};

export const DEFAULT_DEVELOPMENT_WEIGHTS: TableWeights = NATURAL_2D6_WEIGHTS;
export const DEFAULT_POWER_WEIGHTS: TableWeights = NATURAL_2D6_WEIGHTS;
export const DEFAULT_GOV_WEIGHTS: TableWeights = NATURAL_2D6_WEIGHTS;

/** QA-029: Democratic bias — reduces Anarchy probability */
export const DEMOCRATIC_POWER_WEIGHTS: TableWeights = {
  dice: [1, 1, 2, 3, 4, 5, 5, 4, 3, 2, 1],
};

/** QA-029: Stable bias — increases Unitary State probability */
export const STABLE_POWER_WEIGHTS: TableWeights = {
  dice: [1, 2, 3, 4, 5, 5, 4, 3, 2, 1, 3],
};

// =====================
// Import / Export
// =====================

export function exportPresetToJSON(preset: TLProductivityPreset): string {
  return JSON.stringify(preset, null, 2);
}

export function importPresetFromJSON(json: string): TLProductivityPreset | null {
  try {
    const parsed = JSON.parse(json);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.baseIncome === 'number' &&
      typeof parsed.baseTL === 'number' &&
      ['mneme', 'flat', 'linear', 'custom'].includes(parsed.curve)
    ) {
      return parsed as TLProductivityPreset;
    }
  } catch {
    // ignore
  }
  return null;
}
