import type {
  MainWorld, PlanetaryBody
} from '../types';
import { rollTL } from './dice';
import { getTechLevel } from './worldData';


// =====================
// V2 MainWorld Builder (FR-043)
// =====================

/** Map v2 HazardIntensity to v1 HazardIntensityType. */
export function mapHazardIntensity(v2: string | undefined): import('../types').HazardIntensityType {
  switch (v2) {
    case 'Trace': return 'Very Mild';
    case 'Light': return 'Mild';
    case 'Moderate': return 'Serious';
    case 'Heavy': return 'High';
    case 'Extreme': return 'Intense';
    default: return 'Very Mild';
  }
}

/** Map v2 BiochemTier to v1 ResourceLevel. */
export function mapBiochemToResource(v2: string | undefined): import('../types').ResourceLevel {
  switch (v2) {
    case 'Scarce': return 'Scarce';
    case 'Rare': return 'Rare';
    case 'Uncommon':
    case 'Poor':
    case 'Deficient':
    case 'Common': return 'Uncommon';
    case 'Abundant':
    case 'Rich':
    case 'Bountiful': return 'Abundant';
    case 'Prolific':
    case 'Inexhaustible': return 'Inexhaustible';
    default: return 'Uncommon';
  }
}

/** Build a v1 MainWorld from a v2 winning PlanetaryBody. */
export function buildMainWorldFromV2Winner(body: PlanetaryBody): MainWorld {
  // Roll TL post-selection (v2 spec: TL applies only after mainworld selection)
  const tlRoll = rollTL();
  const techLevel = getTechLevel(tlRoll);
  const tlModifier = Math.max(0, Math.min(9, techLevel - 7));

  const baseline = body.baselineHabitability ?? 0;
  const effectiveHab = baseline + tlModifier;

  const bd = body.habitabilityBreakdown;
  const habitabilityComponents = bd ? {
    gravity: bd.gravity,
    atmosphere: bd.atmosphereComp + bd.atmosphereDensity,
    temperature: bd.temperature,
    hazard: bd.hazard,
    hazardIntensity: bd.hazardIntensity,
    biochem: bd.biochem + bd.biosphere,
    techLevel: tlModifier,
  } : {
    gravity: 0, atmosphere: 0, temperature: 0,
    hazard: 0, hazardIntensity: 0, biochem: 0, techLevel: tlModifier,
  };

  // Derive world type from body type
  const worldType: import('../types').WorldType =
    body.type === 'dwarf' ? 'Dwarf' : 'Terrestrial';

  return {
    type: worldType,
    size: Math.round(body.diameterKm ?? body.radiusKm ? (body.radiusKm! * 2) : 1000),
    lesserEarthType: undefined,
    massEM: body.mass,
    densityGcm3: body.densityGcm3 ?? 0,
    gravity: body.surfaceGravityG ?? 0,
    radius: body.radiusKm ?? 0,
    escapeVelocity: body.escapeVelocityMs ? Math.round((body.escapeVelocityMs / 1000) * 100) / 100 : 0,
    atmosphere: (body.atmosphereDensityV2 ?? 'Trace') as import('../types').AtmosphereType,
    atmosphereTL: 0,
    temperature: (body.temperatureV2 ?? 'Average') as import('../types').TemperatureType,
    temperatureTL: 0,
    hazard: (body.hazardV2 ?? 'None') as import('../types').HazardType,
    hazardIntensity: mapHazardIntensity(body.hazardIntensityV2),
    hazardIntensityTL: 0,
    biochemicalResources: mapBiochemToResource(body.biochem),
    techLevel,
    habitability: effectiveHab,
    habitabilityComponents,
    zone: body.zone,
    distanceAU: (body as PlanetaryBody).parentDistanceAU ?? body.distanceAU,
  };
}
