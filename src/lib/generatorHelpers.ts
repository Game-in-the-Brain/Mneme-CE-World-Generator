import type {
  ResourceLevel, StarportClass
} from '../types';

// =====================
// Starport Floor Helper (R4 / QA-070 / QA-076)
// =====================

export function getStarportFloorClass(
  population: number,
  envHab: number,
  habitatType: string | undefined,
  biochemicalResources: ResourceLevel
): StarportClass | undefined {
  if (population >= 500_000) return undefined;

  // Mining / Inhospitable worlds need at least Class D to export
  if (envHab <= 0 && habitatType) {
    const lower = habitatType.toLowerCase();
    if (lower.includes('mining') || lower.includes('industrial')) {
      return 'D';
    }
  }

  // Agricultural worlds need at least Class E to trade surplus
  if (envHab > 0) {
    const agResources: ResourceLevel[] = ['Abundant', 'Inexhaustible'];
    if (agResources.includes(biochemicalResources)) {
      return 'E';
    }
  }

  return undefined;
}
