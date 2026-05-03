import type {
  ResourceLevel, StarportClass, EconomicClassification
} from '../types';

// =====================
// Starport Floor Helper (R4 / QA-070 / QA-076)
// =====================

export function getStarportFloorClass(
  population: number,
  envHab: number,
  habitatType: string | undefined,
  biochemicalResources: ResourceLevel,
  economicClassification?: EconomicClassification,
): StarportClass | undefined {
  // FRD-070: semantic floor rules based on economic classification
  if (economicClassification) {
    const driver = economicClassification.primaryDriver;
    const popUnder500k = population < 500_000;

    switch (driver) {
      case 'Extraction':
        if (popUnder500k) return 'D';
        break;
      case 'Agricultural Surplus':
        if (popUnder500k) return 'E';
        break;
      case 'Services / Trade Hub':
        return 'C';
      case 'Research Outpost':
        return 'E';
      case 'Subsistence / Closed':
        return undefined; // genuinely self-sufficient
    }
  }

  if (population >= 500_000) return undefined;

  // Legacy fallback: Mining / Inhospitable worlds need at least Class D to export
  if (envHab <= 0 && habitatType) {
    const lower = habitatType.toLowerCase();
    if (lower.includes('mining') || lower.includes('industrial')) {
      return 'D';
    }
  }

  // Legacy fallback: Agricultural worlds need at least Class E to trade surplus
  if (envHab > 0) {
    const agResources: ResourceLevel[] = ['Abundant', 'Inexhaustible'];
    if (agResources.includes(biochemicalResources)) {
      return 'E';
    }
  }

  return undefined;
}
