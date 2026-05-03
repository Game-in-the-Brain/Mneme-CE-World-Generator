import type { Inhabitants, TLProductivityPreset } from '../types';
import { getGdpPerDayForWorld } from './economicPresets';
import { calculateStarport } from './worldData';
import { getFloorFromClassification } from './economicClassification';

/**
 * Recalculate starport and trade values from current economics dials.
 * Called automatically when Wealth, Development, Tech Level, or Population change.
 */
export function recalculateStarportFromDials(
  inhabitants: Inhabitants,
  economicPreset: TLProductivityPreset | undefined,
): Inhabitants {
  if (!economicPreset) return inhabitants;

  const gdp = getGdpPerDayForWorld(
    inhabitants.techLevel,
    inhabitants.development,
    inhabitants.wealth,
    economicPreset,
  );
  const weeklyRoll = inhabitants.starport.weeklyRoll ?? 10;
  const floorClass = getFloorFromClassification(
    inhabitants.economicClassification,
    inhabitants.effectivePopulation ?? inhabitants.population,
  );
  const recalc = calculateStarport(
    inhabitants.effectivePopulation ?? inhabitants.population,
    inhabitants.techLevel,
    inhabitants.wealth,
    inhabitants.development,
    weeklyRoll,
    gdp,
    floorClass,
  );

  return {
    ...inhabitants,
    starport: {
      ...inhabitants.starport,
      class: recalc.class,
      pss: recalc.pss,
      rawClass: recalc.rawClass,
      tlCap: recalc.tlCap,
      annualTrade: recalc.annualTrade,
      weeklyBase: recalc.weeklyBase,
      weeklyActivity: recalc.weeklyActivity,
    },
  };
}
