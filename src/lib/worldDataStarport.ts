import type { 
  DevelopmentLevel, WealthLevel, StarportClass, TravelZone,
  HazardType, HazardIntensityType
} from '../types';

// =====================
// Starport (PSS v1.1 — GDP-based with TL capability cap)
// =====================

/** Trade fraction of GDP that flows through the starport, by development level. */
export function getTradeFraction(dev: DevelopmentLevel): number {
  switch (dev) {
    case 'UnderDeveloped': return 0.05;
    case 'Developing':     return 0.065 + (Math.floor(Math.random() * 6) + 1) * 0.01;
    case 'Mature':         return 0.10 + (Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2) * 0.007;
    case 'Developed':      return 0.15 + (Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2) * 0.007;
    case 'Well Developed': return 0.20 + (Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2) * 0.007;
    case 'Very Developed': return 0.25 + (Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2) * 0.007;
  }
}

/** Wealth trade multiplier — wealthier economies generate proportionally more starport traffic. */
export function getWealthTradeMultiplier(wealth: WealthLevel): number {
  switch (wealth) {
    case 'Average':    return 1.0;
    case 'Better-off': return 1.2;
    case 'Prosperous': return 1.5;
    case 'Affluent':   return 2.0;
  }
}

/** TL capability ceiling — what the port can physically build/service. */
export function getTLCapClass(tl: number): StarportClass {
  if (tl < 4)   return 'X';
  if (tl <= 5)  return 'E';
  if (tl <= 7)  return 'D';
  if (tl <= 9)  return 'C';
  if (tl <= 11) return 'B';
  return 'A'; // TL 12+: starship construction capable
}

const CLASS_ORDER: Record<StarportClass, number> = { X: 0, E: 1, D: 2, C: 3, B: 4, A: 5 };
const ORDER_TO_CLASS: Record<number, StarportClass> = { 0: 'X', 1: 'E', 2: 'D', 3: 'C', 4: 'B', 5: 'A' };

function pssToClass(pss: number): StarportClass {
  if (pss < 1.5) return 'X';
  if (pss < 2.5) return 'E';
  if (pss < 3.5) return 'D';
  if (pss < 4.5) return 'C';
  if (pss < 5.5) return 'B';
  return 'A';
}

function minClass(a: StarportClass, b: StarportClass): StarportClass {
  return ORDER_TO_CLASS[Math.min(CLASS_ORDER[a], CLASS_ORDER[b])];
}

function maxClass(a: StarportClass, b: StarportClass): StarportClass {
  return ORDER_TO_CLASS[Math.max(CLASS_ORDER[a], CLASS_ORDER[b])];
}

/**
 * Calculate starport class and throughput.
 * Step 1 — GDP × trade fraction → Annual Port Trade → PSS → raw class
 * Step 2 — TL capability cap
 * Step 3 — Final class = min(rawClass, tlCap)
 * Weekly throughput: annualTrade ÷ 52 × weeklyRoll (3D6)
 */
export function calculateStarport(
  population: number,
  tl: number,
  _wealth: WealthLevel,
  dev: DevelopmentLevel,
  weeklyRoll: number,
  gdpPerDayOverride: number,
  floorClass?: StarportClass,
): {
  class: StarportClass;
  pss: number;
  rawClass: StarportClass;
  tlCap: StarportClass;
  annualTrade: number;
  weeklyBase: number;
  weeklyActivity: number;
} {
  const gdpPerDay   = gdpPerDayOverride;
  // QA-057: removed wealth multiplier to avoid double-counting (Wealth is now baked into GDP/day via SOC)
  const annualTrade = population * gdpPerDay * 365 * getTradeFraction(dev);

  const pss       = Math.floor(Math.log10(Math.max(1, annualTrade)) * 100) / 100 - 6;
  const rawClass  = pssToClass(pss);
  const tlCap     = getTLCapClass(tl);
  let finalClass = minClass(rawClass, tlCap);

  // R4 / QA-070 / QA-076: starport floor by world function
  if (floorClass) {
    finalClass = maxClass(finalClass, floorClass);
  }

  const weeklyBaseRaw  = annualTrade / 52;

  // QA-062: scale weekly throughput by actual starport class
  // A world with A-class economic potential but X-class facilities can't process trade
  const classScale: Record<string, number> = {
    X: 0,
    E: 0.05,
    D: 0.15,
    C: 0.35,
    B: 0.60,
    A: 1.0,
  };
  const scale = classScale[finalClass] ?? 1.0;
  const weeklyBase     = weeklyBaseRaw * scale;
  const weeklyActivity = weeklyBase * weeklyRoll;

  return { class: finalClass, pss, rawClass, tlCap, annualTrade, weeklyBase, weeklyActivity };
}

export function rollForBase(starportClass: StarportClass, baseType: 'naval' | 'scout' | 'pirate'): boolean {
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  
  switch (baseType) {
    case 'naval':
      return starportClass === 'A' || starportClass === 'B' ? roll >= 8 : false;
    case 'scout':
      if (starportClass === 'A') return roll >= 5;
      if (starportClass === 'B') return roll >= 6;
      if (starportClass === 'C') return roll >= 7;
      if (starportClass === 'D') return roll >= 8;
      return false;
    case 'pirate':
      return starportClass === 'A' || starportClass === 'B' ? roll === 12 : false;
    default:
      return false;
  }
}

// =====================
// Depression Penalty (QA-026)
// =====================

export function calculateDepressionPenalty(population: number, development: DevelopmentLevel): number {
  let penalty = 0;
  if (population < 1_000_000) penalty += 1;
  if (population < 100_000) penalty += 1;
  if (population < 10_000) penalty += 1;
  if (development === 'UnderDeveloped' || development === 'Developing') penalty += 1;
  return penalty;
}

// =====================
// Travel Zone
// =====================

export function determineTravelZone(
  hazard: HazardType,
  intensity: HazardIntensityType,
  effectiveTL?: number
): { zone: TravelZone; reason?: string } {
  // High Biohazard or Radioactive = Automatic Amber Zone
  if (hazard === 'Radioactive' || (hazard === 'Biohazard' && intensity === 'High')) {
    return { zone: 'Amber', reason: `High ${hazard}` };
  }

  // Otherwise roll 2D6, on 2 = Amber Zone
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  let zone: TravelZone = 'Green';
  let reason: string | undefined;

  if (roll === 2) {
    const reasons = [
      'Civil unrest',
      'Disease outbreak',
      'Environmental hazard',
      'Political instability',
      'Trade restrictions',
      'Military activity'
    ];
    zone = 'Amber';
    reason = reasons[Math.floor(Math.random() * reasons.length)];
  }

  // QA-026: low effectiveTL forces Amber/Red zones
  if (effectiveTL !== undefined) {
    if (effectiveTL < 9) {
      zone = 'Red';
      reason = 'Depressed technology base (TL < 9)';
    } else if (effectiveTL < 10 && zone === 'Green') {
      zone = 'Amber';
      reason = 'Marginal technology base (TL < 10)';
    }
  }

  return { zone, reason };
}

