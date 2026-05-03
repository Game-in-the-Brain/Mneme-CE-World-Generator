import type {
  WealthLevel, PowerStructure, DevelopmentLevel, PowerSource,
  TravelZone,
} from './enums';
import type { Starport, ShipsInAreaResult } from './core';

export interface Inhabitants {
  populated?: boolean;      // false = unpopulated world; undefined treated as true
  habitatType?: string;     // set when Hab ≤ 0 and populated — inhabitants live in artificial habitat
  techLevel: number;
  foundingTL?: number;      // QA-026: original TL before depression penalty
  effectiveTL?: number;     // QA-026: TL after depression penalty
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

  // QA-066: Cultural Values mechanical effects
  /** Effective population after workforce participation modifiers */
  effectivePopulation?: number;
  /** Trade budget multiplier derived from cultural traits (affects ships-in-area) */
  tradeMultiplier?: number;
  /** Human-readable list of cultural trait → mechanical effect */
  culturalEffectsBreakdown?: string[];

  // FRD-070: Economic Classification
  /** Derived economic classification (primary driver, modifiers, tech tier, etc.) */
  economicClassification?: EconomicClassification;
}

// FRD-070: Economic Classification & World Trade Codes
export type EconomicDriver =
  | 'Extraction'
  | 'Agricultural Surplus'
  | 'Manufacturing'
  | 'Refining'
  | 'Services / Trade Hub'
  | 'High-Technology'
  | 'Subsistence / Closed'
  | 'Research Outpost';

export type EconomicModifier =
  | 'Garden'
  | 'Fluid Ocean'
  | 'Water World'
  | 'Marginal'
  | 'Contested';

export type TechTier =
  | 'Primitive'
  | 'Emergent'
  | 'Industrial'
  | 'Advanced'
  | 'Post-Scarcity';

export type PopulationScale =
  | 'Outpost'
  | 'Settlement'
  | 'Colony'
  | 'Province'
  | 'Homeworld';

export interface EconomicClassification {
  /** Primary driver: what this world produces most of */
  primaryDriver: EconomicDriver;
  /** Secondary modifiers layered on top */
  modifiers: EconomicModifier[];
  /** Technology tier (replaces CE Hi/Lt) */
  techTier: TechTier;
  /** Population scale label (replaces CE Hi/Lo as trade code) */
  populationScale: PopulationScale;
  /** Human-readable summary sentence */
  summary: string;
  /** Raison d'être: why is anyone here? */
  reasonForExistence: string;
  /** CE trade codes for RAW UDP backward compatibility */
  ceTradeCodes: string[];
}

export type { Starport, ShipsInAreaResult };
