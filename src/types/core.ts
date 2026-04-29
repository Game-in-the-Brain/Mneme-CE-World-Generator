import type {
  StellarClass, StellarGrade, Zone, WorldType, LesserEarthType,
  AtmosphereType, TemperatureType, HazardType, HazardIntensityType,
  ResourceLevel, StarportClass,
} from './enums';

// =====================
// Core Interfaces
// =====================

export interface Star {
  id: string;
  class: StellarClass;
  grade: StellarGrade;
  mass: number;
  luminosity: number;
  color: string;
  isPrimary: boolean;
  orbitDistance?: number;
  orbits?: 'primary' | 'companion';
}

export interface ZoneBoundaries {
  infernal: { min: number; max: number };
  hot: { min: number; max: number };
  conservative: { min: number; max: number };
  cold: { min: number; max: number };
  outer: { min: number; max: null };
}

// FR-042: v2 zone architecture
export type ZoneId = 'Infernal' | 'Hot' | 'Conservative' | 'Cool' | 'FrostLine' | 'O1' | 'O2' | 'O3' | 'O4' | 'O5';

export interface OuterZoneBoundaries {
  o1: { minAU: number; maxAU: number };
  o2: { minAU: number; maxAU: number };
  o3: { minAU: number; maxAU: number };
  o4: { minAU: number; maxAU: number };
  o5: { minAU: number; maxAU: number };
}

export interface MainWorld {
  type: WorldType;
  size: number;                // diameter in km (derived from mass + density)
  lesserEarthType?: LesserEarthType;

  // QA-023: Mass + Density physics pipeline
  massEM: number;              // mass in Earth Masses
  densityGcm3: number;         // density in g/cm³

  gravity: number;             // derived from mass + density
  radius: number;              // derived from mass + density
  escapeVelocity: number;      // derived from mass + density

  atmosphere: AtmosphereType;
  atmosphereTL: number;

  temperature: TemperatureType;
  temperatureTL: number;

  hazard: HazardType;
  hazardIntensity: HazardIntensityType;
  hazardIntensityTL: number;

  biochemicalResources: ResourceLevel;

  // QA-009: Tech Level affects habitability, so it's stored in MainWorld
  techLevel: number;

  habitability: number;

  // Component breakdown for debugging/analysis
  habitabilityComponents?: {
    gravity: number;
    atmosphere: number;
    temperature: number;
    hazard: number;
    hazardIntensity: number;
    biochem: number;
    techLevel: number;
  };

  zone: Zone;
  distanceAU: number;
}

export interface Starport {
  class: StarportClass;
  pss: number;              // Port Size Score (GDP-derived, pre-cap)
  rawClass: StarportClass;  // Class from PSS before TL capability cap
  tlCap: StarportClass;     // TL capability ceiling
  annualTrade: number;      // Annual port trade volume (Credits/year)
  weeklyBase: number;       // annualTrade ÷ 364
  weeklyActivity: number;   // weeklyBase × 3D6 (this week's actual throughput)
  weeklyRoll?: number;      // FR-029: stored 3D6 roll result
  hasNavalBase: boolean;
  hasScoutBase: boolean;
  hasPirateBase: boolean;
  // QA-026 after-starport: founding starport metrics before depression penalty
  foundingClass?: StarportClass;
  foundingPSS?: number;
  foundingRawClass?: StarportClass;
}

// FR-030: Ships in the Area
export type ShipLocation = 'Orbit' | 'System' | 'Docked';

export interface ShipInArea {
  name: string;
  dt: number;
  monthlyOperatingCost: number;
  purchasePrice: number;    // FR-032: for income-years calculation
  visitingCost: number;     // QA-058: raw visiting cost in Credits
  location: ShipLocation;
  systemPosition?: number;  // QA-024: body index 1–N, only set when location === 'System'
  trafficPool: 'small' | 'civilian' | 'warship';
}

export interface ShipsInAreaResult {
  budget: number;
  distributionRoll: number;
  smallCraftBudget: number;
  civilianBudget: number;
  warshipBudget: number;
  ships: ShipInArea[];
}
