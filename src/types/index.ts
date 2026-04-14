// =====================
// Enums
// =====================

export type StellarClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';
export type StellarGrade = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Zone = 'Infernal' | 'Hot' | 'Conservative' | 'Cold' | 'Outer';

export type WorldType = 'Habitat' | 'Dwarf' | 'Terrestrial';
export type LesserEarthType = 'Carbonaceous' | 'Silicaceous' | 'Metallic' | 'Other';

export type AtmosphereType = 'Average' | 'Thin' | 'Trace' | 'Dense' | 'Crushing';
export type TemperatureType = 'Average' | 'Cold' | 'Freezing' | 'Hot' | 'Inferno';
export type HazardType = 'None' | 'Polluted' | 'Corrosive' | 'Biohazard' | 'Toxic' | 'Radioactive';
export type HazardIntensityType = 'Very Mild' | 'Mild' | 'Serious' | 'High' | 'Intense';
export type ResourceLevel = 'Scarce' | 'Rare' | 'Uncommon' | 'Abundant' | 'Inexhaustible';

export type WealthLevel = 'Average' | 'Better-off' | 'Prosperous' | 'Affluent';
export type PowerStructure = 'Anarchy' | 'Confederation' | 'Federation' | 'Unitary State';
export type DevelopmentLevel = 'UnderDeveloped' | 'Developing' | 'Mature' | 'Developed' | 'Well Developed' | 'Very Developed';
export type PowerSource = 'Aristocracy' | 'Ideocracy' | 'Kratocracy' | 'Democracy' | 'Meritocracy';
export type StarportClass = 'X' | 'E' | 'D' | 'C' | 'B' | 'A';
export type TravelZone = 'Green' | 'Amber' | 'Red';

export type GasWorldClass = 'I' | 'II' | 'III' | 'IV' | 'V';
export type BodyType = 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas';

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
}

// FR-030: Ships in the Area
export type ShipLocation = 'Orbit' | 'System' | 'Docked';

export interface ShipInArea {
  name: string;
  dt: number;
  monthlyOperatingCost: number;
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

export interface Inhabitants {
  populated?: boolean;      // false = unpopulated world; undefined treated as true
  habitatType?: string;     // set when Hab ≤ 0 and populated — inhabitants live in artificial habitat
  techLevel: number;
  population: number;
  wealth: WealthLevel;
  powerStructure: PowerStructure;
  development: DevelopmentLevel;
  sourceOfPower: PowerSource;
  governance: number;
  starport: Starport;
  travelZone: TravelZone;
  travelZoneReason?: string;
  cultureTraits: string[];
}

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
}

export interface StarSystem {
  id: string;
  createdAt: number;
  name?: string;
  
  primaryStar: Star;
  companionStars: Star[];
  zones: ZoneBoundaries;
  
  mainWorld: MainWorld;
  inhabitants: Inhabitants;
  
  circumstellarDisks: PlanetaryBody[];
  dwarfPlanets: PlanetaryBody[];
  terrestrialWorlds: PlanetaryBody[];
  iceWorlds: PlanetaryBody[];
  gasWorlds: PlanetaryBody[];
}

// =====================
// Dice Roll Types
// =====================

export interface DiceRoll {
  notation: string;
  dice: number[];
  modifier: number;
  total: number;
}

export interface RollResult {
  value: number;
  rolls: DiceRoll[];
}

// =====================
// UI Types
// =====================

export type ViewMode = 'dashboard' | 'system' | 'settings' | 'glossary';

export interface GeneratorState {
  currentSystem: StarSystem | null;
  savedSystems: StarSystem[];
  view: ViewMode;
  isGenerating: boolean;
}

export interface GeneratorOptions {
  starClass: StellarClass | 'random';
  starGrade: StellarGrade | 'random';
  mainWorldType: WorldType | 'random';
  populated: boolean;
}

export type BodyAnnotations = Record<string, { name: string; notes: string }>;
