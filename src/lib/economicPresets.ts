import type { TLProductivityPreset, TableWeights } from '../types';

// =====================
// Constants
// =====================

/** Base Boat (10DT) purchase price in Credits — from mneme_ship_reference.json */
export const BOAT_PRICE_CR = 5_320_400;

/** Default number of days in a standard year */
export const DAYS_PER_YEAR = 365;

// =====================
// Built-in Presets
// =====================

/** Exact Mneme default — reproduces legacy GDP_PER_DAY_BY_TL behavior */
export const MNEME_PRESET: TLProductivityPreset = {
  id: 'mneme',
  name: 'Mneme',
  description: 'Compounding productivity growth per TL. High automation, post-scarcity-adjacent economics.',
  boatYears: 71, // calibrated so that TL7 SOC7 monthly income matches legacy ~6,235 Cr
  referenceTL: 7,
  curve: 'custom',
  soc7IncomeByTL: {
    7: 6_235,      // 205 Cr/day × 365 / 12
    8: 16_790,     // 552 Cr/day × 365 / 12
    9: 45_199,     // 1,486 Cr/day × 365 / 12
    10: 121_667,   // 4,000 Cr/day × 365 / 12
    11: 882_083,   // 29,000 Cr/day × 365 / 12
    12: 6_387_500, // 210,000 Cr/day × 365 / 12
    13: 45_625_000, // 1,500,000 Cr/day × 365 / 12
    14: 334_583_333, // 11,000,000 Cr/day × 365 / 12
    15: 2_433_333_333, // 80,000,000 Cr/day × 365 / 12
    16: 17_580_833_333, // 578,000,000 Cr/day × 365 / 12
  },
};

/** CE / Traveller stagnant preset — flat 2,000 Cr/month SOC 7 at every TL */
export const CE_PRESET: TLProductivityPreset = {
  id: 'ce',
  name: 'CE / Traveller',
  description: 'Flat income across all TLs. Human-labour-dominant, low-compound stagnation model.',
  boatYears: 222, // 5,320,400 / (2,000 × 12)
  referenceTL: 9,
  curve: 'flat',
};

export const BUILT_IN_PRESETS: TLProductivityPreset[] = [MNEME_PRESET, CE_PRESET];

// =====================
// Helpers
// =====================

/**
 * Compute SOC 7 monthly income for a given TL using a preset.
 */
export function getSoc7MonthlyIncome(tl: number, preset: TLProductivityPreset): number {
  if (preset.curve === 'custom' && preset.soc7IncomeByTL) {
    return preset.soc7IncomeByTL[tl] ?? preset.soc7IncomeByTL[preset.referenceTL] ?? 0;
  }

  const baseAnnual = BOAT_PRICE_CR / preset.boatYears;
  const baseMonthly = baseAnnual / 12;

  if (preset.curve === 'flat') {
    return baseMonthly;
  }

  if (preset.curve === 'mneme') {
    // Scale from the reference TL using Mneme ratios
    const ratios: Record<number, number> = {
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
    const ratio = ratios[tl] ?? ratios[preset.referenceTL] ?? 1;
    const refRatio = ratios[preset.referenceTL] ?? 1;
    return baseMonthly * (ratio / refRatio);
  }

  if (preset.curve === 'linear' && preset.linearMultiplier) {
    const steps = tl - preset.referenceTL;
    return baseMonthly * Math.pow(preset.linearMultiplier, steps);
  }

  return baseMonthly;
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
// Table Weights Defaults
// =====================

export const DEFAULT_DEVELOPMENT_WEIGHTS: TableWeights = {
  dice: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2D6 rolls 2..12
};

export const DEFAULT_POWER_WEIGHTS: TableWeights = {
  dice: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};

export const DEFAULT_GOV_WEIGHTS: TableWeights = {
  dice: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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
      typeof parsed.boatYears === 'number' &&
      typeof parsed.referenceTL === 'number' &&
      ['mneme', 'flat', 'linear', 'custom'].includes(parsed.curve)
    ) {
      return parsed as TLProductivityPreset;
    }
  } catch {
    // ignore
  }
  return null;
}
