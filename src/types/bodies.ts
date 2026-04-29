import type {
  Zone, BodyType, GasWorldClass, LesserEarthType,
  AtmosphereComp, AtmoDensity, TemperatureType, HazardType, HazardIntensity,
  BiochemTier, BiosphereRating, RingProminence,
} from './enums';

export interface PlanetaryBody {
  id: string;
  type: BodyType;
  mass: number;
  zone: Zone;
  distanceAU: number;
  gasClass?: GasWorldClass;
  lesserEarthType?: LesserEarthType;
  gravity?: number;
  atmosphere?: string;
  density?: number;
  // Derived physical properties — see QA-009, REF-010-planet-densities.md
  densityGcm3?: number;
  radiusKm?: number;
  diameterKm?: number;
  surfaceGravityG?: number;
  escapeVelocityMs?: number;

  // FR-041/042/043: v2 optional fields (additive, non-breaking)
  orbitLevel?: 0 | 1 | 2;
  parentId?: string;

  // Composition
  composition?: string;
  reactivityDM?: number;

  // Atmosphere (v2)
  atmosphereCompositionAbiotic?: AtmosphereComp;
  atmosphereComposition?: AtmosphereComp;
  atmosphereDensityV2?: AtmoDensity;

  // Habitability waterfall (v2)
  temperatureV2?: TemperatureType;
  hazardV2?: HazardType;
  hazardIntensityV2?: HazardIntensity;
  biochem?: BiochemTier;
  biosphereRating?: BiosphereRating;
  biosphereRoll?: number;
  biosphereTN?: number;
  hasSubsurfaceOceanOverride?: boolean;

  // 260427-01: zone-driven habitability inputs
  zoneHazardDM?: number;
  hzBiosphereBonusApplied?: boolean;

  baselineHabitability?: number;
  habitabilityBreakdown?: {
    gravity: number;
    atmosphereComp: number;
    atmosphereDensity: number;
    temperature: number;
    hazard: number;
    hazardIntensity: number;
    biochem: number;
    biosphere: number;
  };

  // Positioning (v2)
  positionRoll?: number;
  positionRerollCount?: number;
  wasEjected?: boolean;
  ejectionReason?: 'saturation' | 'gravitational';
  wasShepherded?: boolean;

  // Selection (v2)
  wasSelectedAsMainworld?: boolean;
  tiebreakerRank?: number;

  // Rings (v2)
  ringProminence?: RingProminence;

  // FR-044: Level 2 children (moons)
  level?: 0 | 1 | 2;
  wasCapturedTerrestrial?: boolean;
  massCapApplied?: boolean;
  originalRolledMass?: number;
  parentDistanceAU?: number; // parent's star-distance, used when moon wins mainworld
  moonOrbitAU?: number;      // orbital distance from parent (for moons)

  // FR-044: Ring classification
  ringClass?: 'faint' | 'visible' | 'showpiece' | 'great';
}

export interface RawUdpProfile {
  uwp: string;
  starport: import('./enums').StarportClass;
  size: number;
  atmosphere: number;
  hydrographics: number;
  population: number;
  government: number;
  lawLevel: number;
  techLevel: number;
  bases: string[];
  tradeCodes: string[];
  travelZone: import('./enums').TravelZone;
  hasBelt: boolean;
  hasGas: boolean;
  mnemeSource: {
    sizeKm: number;
    atmosphereType: import('./enums').AtmosphereType;
    populationExact: number;
    techLevelMneme: number;
    techLevelCe: number;
    governmentRoll: number;
  };
}
