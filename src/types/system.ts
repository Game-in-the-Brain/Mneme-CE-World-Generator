import type { StellarClass, StellarGrade, StarportClass } from './enums';
import type { Star, ZoneBoundaries, OuterZoneBoundaries, MainWorld } from './core';
import type { PlanetaryBody, RawUdpProfile } from './bodies';
import type { Inhabitants } from './inhabitants';

export interface StarSystem {
  id: string;
  createdAt: number;
  name?: string;
  /** 3D map coordinates (parsecs) */
  x?: number;
  y?: number;
  z?: number;
  /** Source star ID from 3D interstellar map */
  sourceStarId?: string;

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

  /** FR-032: the economic assumptions this world was generated with */
  economicPreset?: TLProductivityPreset;
  /** Snapshot of preset label used at generation time */
  economicPresetLabel?: string;
  /** Full snapshot of preset values used at generation time */
  economicPresetSnapshot?: TLProductivityPreset;
  /** QA-058: allow ships to be generated at X-class ports */
  allowShipsAtXPort?: boolean;

  // FRD-063: generated place names (system + bodies)
  placeNames?: PlaceNames;

  // FR-042: v2 positioning fields (additive, non-breaking)
  heliopauseAU?: number;
  frostLineAU?: number;
  outerSystemZones?: OuterZoneBoundaries;
  ejectedBodies?: PlanetaryBody[];
  consumedBodies?: PlanetaryBody[];

  // FR-043: v2 mainworld selection
  mainworldId?: string;
  mainworldSelectionLog?: {
    candidates: Array<{ id: string; score: number; rank: number }>;
    tiebreakerApplied: boolean;
    fallbackTriggered: boolean;
    fallbackReason?: string;
  };

  // FR-044: Level 2 children (moons and rings)
  moons?: PlanetaryBody[];
  rings?: PlanetaryBody[];

  // FRD-047: Batch management
  batchId?: string;
  batchOrder?: number;

  // 260427-02: hierarchical multi-star tree (gated by GeneratorOptions.v2MultiStar).
  // Coexists with companionStars[]; legacy consumers stay on the flat array.
  rootOrbitNode?: OrbitNode;
  multiStarVersion?: 'v1-flat' | 'v2-tree';

  /** FRD-068: cached RAW UDP profile (computed on demand) */
  rawUdpProfile?: RawUdpProfile;

  /** FRD-069: timestamp of last edit */
  editedAt?: number;

  /** FRD-069: dice lock state for re-rollable fields */
  diceLocks?: {
    worldType?: boolean;
    distance?: boolean;
    mass?: boolean;
    habitability?: boolean;
    wealth?: boolean;
    development?: boolean;
    powerStructure?: boolean;
    sourceOfPower?: boolean;
    population?: boolean;
    techLevel?: boolean;
  };
}

// =====================
// 260427-02: Multi-Star Hierarchy
// =====================

export type OrbitNode = StarLeaf | BinaryNode;

export interface StarLeaf {
  kind: 'star';
  starId: string;
  totalMass: number;
}

export interface BinaryNode {
  kind: 'binary';
  primary: OrbitNode;
  secondary: OrbitNode;
  semiMajorAxisAU: number;
  eccentricity: number;
  totalMass: number;
  rPrimaryAU: number;
  rSecondaryAU: number;
  periodYears: number;
  sTypeCapAU: number;
  pTypeFloorAU: number;
}

// =====================
// Batch Management (FRD-047)
// =====================

export interface StarSystemBatch {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Source: 'manual', '3dmap-import', 'generated' */
  source: string;
  /** If imported from 3D map, store the original map metadata */
  sourceMapId?: string;
  /** Systems in this batch */
  systemIds: string[];
  /** Batch-level notes */
  notes?: string;
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

export type ViewMode = 'dashboard' | 'system' | 'settings' | 'glossary' | 'systems';

export interface GeneratorState {
  currentSystem: StarSystem | null;
  savedSystems: StarSystem[];
  view: ViewMode;
  isGenerating: boolean;
}

export type ProductivityCurve = 'mneme' | 'flat' | 'linear' | 'custom';

export interface TLProductivityPreset {
  id: string;
  name: string;
  label?: string;
  description: string;
  /** Primary calibration: SOC 7 monthly income at the base TL */
  baseIncome: number;
  /** The TL that serves as the anchor for the curve (default: 9) */
  baseTL: number;
  curve: ProductivityCurve;
  linearMultiplier?: number;
  /** Direct override table for custom curves */
  soc7IncomeByTL?: Record<number, number>;
  /** Derived: years for SOC 7 to buy the 10DT Boat at baseTL */
  boatYears?: number;
  /** Roll-profile weights bundled with the preset (v1.3.106) */
  wealthWeights?: TableWeights;
  developmentWeights?: TableWeights;
  powerWeights?: TableWeights;
  govWeights?: TableWeights;
}

export interface TableWeights {
  dice: number[]; // length 11, indices 0..10 map to rolls 2..12
}

// =====================
// Place Name Generation (FRD-063)
// =====================

export interface PlaceNames {
  baseLc: string;
  driftLc: string;
  driftLevel: number;
  systemName: string;
  bodyNames: Record<string, string>;
}

export interface GeneratorOptions {
  starClass: StellarClass | 'random';
  starGrade: StellarGrade | 'random';
  mainWorldType: import('./enums').WorldType | 'random';
  populated: boolean;
  tlProductivityPreset?: TLProductivityPreset;
  developmentWeights?: TableWeights;
  powerWeights?: TableWeights;
  govWeights?: TableWeights;
  wealthWeights?: TableWeights;
  /** FR-033: optional goal-loop targets */
  goalStarportMin?: StarportClass;
  goalMinPopulation?: number;
  goalHabitable?: boolean;
  /** QA-058: allow ships to be generated at X-class ports */
  allowShipsAtXPort?: boolean;
  /** QA-049: preferred economic growth model — surfaces curve type as first-class user choice */
  growthModel?: 'compounding' | 'stable';
  /** FR-042: v2 positioning feature flag */
  v2Positioning?: boolean;
  /** 260427-02: wide-only hierarchical multi-star generation */
  v2MultiStar?: boolean;
  /** FR-041: active extraterrestrial life assumptions preset ID */
  activeLifeAssumptionsId?: string;
  /** QA-Mega+: allow Mega+ structure habitats (default OFF for CE/Traveller) */
  allowMegaStructures?: boolean;
  /** FRD-068: RAW UDP mode — display worlds in CE UWP format */
  rawUdpMode?: boolean;
  /** FRD-063: auto-generate place names when generating a system */
  includeNames?: boolean;
}

export interface ExtraterrestrialLifeAssumptions {
  id: string;
  name: string;
  description: string;
  biosphereTN: number;
  biosphereDisadvantage: number;
  minBiochemForBiosphereRoll: 'Common' | 'Abundant' | 'Rich';
  enableTransitionalAtmospheres: boolean;
  biochemOffsetRule: 'standard' | 'halved' | 'none';
}

export type BodyAnnotations = Record<string, { name: string; notes: string }>;
