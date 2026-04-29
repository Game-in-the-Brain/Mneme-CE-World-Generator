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
}

export type { Starport, ShipsInAreaResult };
