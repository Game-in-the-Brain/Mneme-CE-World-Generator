import type { 
  StellarClass, Zone, LesserEarthType, 
  AtmosphereType, TemperatureType, HazardType, HazardIntensityType, ResourceLevel,
  WealthLevel, PowerStructure, DevelopmentLevel, PowerSource, StarportClass, TravelZone
} from '../types';

// =====================
// World Type by Stellar Class
// =====================

export function getWorldTypeRoll(stellarClass: StellarClass): { dice: number; keep: number } {
  switch (stellarClass) {
    case 'F': return { dice: 4, keep: 2 };
    case 'G': return { dice: 3, keep: 2 };
    default: return { dice: 2, keep: 2 };
  }
}

// =====================
// Lesser Earth Type
// =====================

export function getLesserEarthType(roll: number): { type: LesserEarthType; modifier: number } {
  if (roll <= 7) return { type: 'Carbonaceous', modifier: 1 };
  if (roll <= 10) return { type: 'Silicaceous', modifier: 0 };
  if (roll === 11) return { type: 'Metallic', modifier: -1 };
  return { type: 'Other', modifier: 0 };
}

// =====================
// Gravity Table
// =====================

export function getDwarfGravity(roll: number): { gravity: number; habitability: number } {
  const table: Record<number, { gravity: number; habitability: number }> = {
    2: { gravity: 0.001, habitability: -2.5 },
    3: { gravity: 0.02, habitability: -2 },
    4: { gravity: 0.04, habitability: -1.5 },
    5: { gravity: 0.06, habitability: -1 },
    6: { gravity: 0.08, habitability: -0.5 },
    7: { gravity: 0.10, habitability: -0.5 },
    8: { gravity: 0.12, habitability: -0.5 },
    9: { gravity: 0.14, habitability: -0.5 },
    10: { gravity: 0.16, habitability: 0 },
    11: { gravity: 0.18, habitability: 0 },
    12: { gravity: 0.2, habitability: 0 },
  };
  return table[roll] || table[7];
}

export function getTerrestrialGravity(roll: number): { gravity: number; habitability: number } {
  const table: Record<number, { gravity: number; habitability: number }> = {
    2: { gravity: 3.0, habitability: -2.5 },
    3: { gravity: 2.0, habitability: -2 },
    4: { gravity: 1.5, habitability: -1.5 },
    5: { gravity: 1.3, habitability: -1 },
    6: { gravity: 1.2, habitability: -0.5 },
    7: { gravity: 0.3, habitability: -0.5 },
    8: { gravity: 0.4, habitability: -0.5 },
    9: { gravity: 0.5, habitability: -0.5 },
    10: { gravity: 0.7, habitability: 0 },
    11: { gravity: 0.9, habitability: 0 },
    12: { gravity: 1.0, habitability: 0 },
  };
  return table[roll] || table[7];
}

// =====================
// Atmosphere Table
// =====================

export function getAtmosphere(roll: number): { type: AtmosphereType; tl: number; habitability: number } {
  if (roll <= 1) return { type: 'Crushing', tl: 9, habitability: -2.5 };
  if (roll <= 5) return { type: 'Dense', tl: 8, habitability: -2 };
  if (roll <= 8) return { type: 'Trace', tl: 8, habitability: -1.5 };
  if (roll <= 11) return { type: 'Thin', tl: 7, habitability: -1 };
  return { type: 'Average', tl: 0, habitability: 0 };
}

// =====================
// Temperature Table
// =====================

export function getTemperatureModifier(atmosphere: AtmosphereType): number {
  switch (atmosphere) {
    case 'Crushing': return 2;
    case 'Dense': return 1;
    case 'Thin': return -1;
    case 'Trace': return -2;
    default: return 0;
  }
}

export function getTemperature(roll: number): { type: TemperatureType; tl: number; habitability: number } {
  if (roll <= 2) return { type: 'Inferno', tl: 8, habitability: -2 };
  if (roll <= 6) return { type: 'Hot', tl: 7, habitability: -1.5 };
  if (roll <= 10) return { type: 'Freezing', tl: 7, habitability: -1 };
  if (roll === 11) return { type: 'Cold', tl: 6, habitability: -0.5 };
  return { type: 'Average', tl: 0, habitability: 0 };
}

// =====================
// Hazard Table
// =====================

export function getHazard(roll: number): { type: HazardType; habitability: number } {
  if (roll <= 2) return { type: 'Radioactive', habitability: -1.5 };
  if (roll <= 4) return { type: 'Toxic', habitability: -1.5 };
  if (roll <= 6) return { type: 'Biohazard', habitability: -1 };
  if (roll === 7) return { type: 'Corrosive', habitability: -1 };
  if (roll <= 9) return { type: 'Polluted', habitability: -0.5 };
  return { type: 'None', habitability: 0 };
}

// =====================
// Hazard Intensity Table
// =====================

export function getHazardIntensity(roll: number): { intensity: HazardIntensityType; tl: number; habitability: number } {
  if (roll <= 3) return { intensity: 'Intense', tl: 9, habitability: -2 };
  if (roll <= 6) return { intensity: 'High', tl: 8, habitability: -1.5 };
  if (roll <= 8) return { intensity: 'Serious', tl: 7, habitability: -1 };
  if (roll <= 10) return { intensity: 'Mild', tl: 6, habitability: -0.5 };
  return { intensity: 'Very Mild', tl: 11, habitability: 0 };
}

// =====================
// Biochemical Resources Table
// =====================

export function getBiochemicalResources(roll: number): { level: ResourceLevel; tl: number; habitability: number } {
  if (roll === 2) return { level: 'Scarce', tl: 8, habitability: -5 };
  if (roll <= 4) return { level: 'Rare', tl: 7, habitability: -4 };
  if (roll <= 7) return { level: 'Uncommon', tl: 4, habitability: -3 };
  if (roll <= 11) return { level: 'Abundant', tl: 0, habitability: 0 };
  return { level: 'Inexhaustible', tl: 0, habitability: 5 };
}

// =====================
// Tech Level Table
// =====================

export function getTechLevel(roll: number): number {
  if (roll === 2) return 7;
  if (roll === 3) return 8;
  if (roll === 4) return 9;
  if (roll === 5) return 10;
  if (roll <= 7) return 11;
  if (roll === 8) return 12;
  if (roll === 9) return 13;
  if (roll === 10) return 14;
  if (roll === 11) return 15;
  return 16;
}

export function getTechLevelDescription(tl: number): string {
  const descriptions: Record<number, string> = {
    7: 'Early Space Age (1950-2000)',
    8: 'Commercial Space (2000-2050)',
    9: 'New Space Race (2050-2100)',
    10: 'Cis Lunar Development (2100-2200)',
    11: 'Interstellar Settlement (2200-2300)',
    12: 'Post Earth Dependence (2300-2400)',
    13: 'Early Jump-Drive (2400-2500)',
    14: 'Interstellar Space (2500-2600)',
    15: 'Interstellar Colonization',
    16: 'Self-Sufficient Mega Structures',
  };
  return descriptions[tl] || 'Unknown';
}

// =====================
// Population
// =====================

export function calculatePopulation(habitability: number, roll: number): number {
  // Clamp habitability to 0 minimum before exponent
  const effectiveHabitability = Math.max(0, habitability);
  const basePopulation = Math.pow(10, effectiveHabitability);
  return Math.floor(basePopulation * roll);
}

// =====================
// Wealth Table
// =====================

export function getWealth(roll: number, resources: ResourceLevel): WealthLevel {
  let modifier = 0;
  if (resources === 'Abundant') modifier = 1;
  if (resources === 'Inexhaustible') modifier = 2;
  
  const adjustedRoll = roll + modifier;
  
  if (adjustedRoll <= 8) return 'Average';
  if (adjustedRoll <= 10) return 'Better-off';
  if (adjustedRoll === 11) return 'Prosperous';
  return 'Affluent';
}

export function getWealthModifier(wealth: WealthLevel): number {
  switch (wealth) {
    case 'Average': return 0;
    case 'Better-off': return 1;
    case 'Prosperous': return 2;
    case 'Affluent': return 3;
  }
}

// =====================
// Power Structure Table
// =====================

export function getPowerStructure(roll: number): PowerStructure {
  if (roll <= 7) return 'Anarchy';
  if (roll <= 9) return 'Confederation';
  if (roll <= 11) return 'Federation';
  return 'Unitary State';
}

// =====================
// Development Table
// =====================

export function getDevelopment(roll: number): { level: DevelopmentLevel; hdi: string; soc: number } {
  if (roll === 2) return { level: 'UnderDeveloped', hdi: '0.0-0.39', soc: 2 };
  if (roll <= 5) return { level: 'UnderDeveloped', hdi: '0.40-0.49', soc: 3 };
  if (roll <= 7) return { level: 'UnderDeveloped', hdi: '0.50-0.59', soc: 4 };
  if (roll === 8) return { level: 'Developing', hdi: '0.60-0.69', soc: 5 };
  if (roll === 9) return { level: 'Mature', hdi: '0.70-0.79', soc: 6 };
  if (roll === 10) return { level: 'Developed', hdi: '0.80-0.89', soc: 8 };
  if (roll === 11) return { level: 'Well Developed', hdi: '0.9-0.94', soc: 9 };
  return { level: 'Very Developed', hdi: '>0.95', soc: 10 };
}

export function getDevelopmentModifier(dev: DevelopmentLevel): number {
  switch (dev) {
    case 'UnderDeveloped': return -2;
    case 'Developing': return -1;
    case 'Mature': return 0;
    case 'Developed': return 1;
    case 'Well Developed': return 2;
    case 'Very Developed': return 3;
  }
}

// =====================
// Source of Power Table
// =====================

export function getSourceOfPower(roll: number): PowerSource {
  if (roll <= 5) return 'Aristocracy';
  if (roll <= 7) return 'Ideocracy';
  if (roll <= 9) return 'Kratocracy';
  if (roll <= 11) return 'Democracy';
  return 'Meritocracy';
}

// =====================
// Governance DM Table
// =====================

export function getGovernanceDM(dev: DevelopmentLevel, wealth: WealthLevel): number {
  const table: Record<DevelopmentLevel, Record<WealthLevel, number>> = {
    'UnderDeveloped': { 'Average': -9, 'Better-off': -3, 'Prosperous': 3, 'Affluent': 9 },
    'Developing': { 'Average': -8, 'Better-off': -2, 'Prosperous': 4, 'Affluent': 10 },
    'Mature': { 'Average': -7, 'Better-off': -1, 'Prosperous': 5, 'Affluent': 11 },
    'Developed': { 'Average': -6, 'Better-off': 0, 'Prosperous': 6, 'Affluent': 12 },
    'Well Developed': { 'Average': -5, 'Better-off': 1, 'Prosperous': 7, 'Affluent': 13 },
    'Very Developed': { 'Average': -4, 'Better-off': 2, 'Prosperous': 8, 'Affluent': 14 },
  };
  return table[dev][wealth];
}

// =====================
// Starport
// =====================

export function calculateStarport(
  habitability: number,
  tl: number,
  wealth: WealthLevel,
  dev: DevelopmentLevel
): { class: StarportClass; pvs: number; output: number } {
  const pvs = Math.floor(habitability / 4) + (tl - 7) + getWealthModifier(wealth) + getDevelopmentModifier(dev);
  
  let starportClass: StarportClass;
  if (pvs < 4) starportClass = 'X';
  else if (pvs <= 5) starportClass = 'E';
  else if (pvs <= 7) starportClass = 'D';
  else if (pvs <= 9) starportClass = 'C';
  else if (pvs <= 11) starportClass = 'B';
  else starportClass = 'A';
  
  return {
    class: starportClass,
    pvs,
    output: Math.pow(10, pvs)
  };
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
// Travel Zone
// =====================

export function determineTravelZone(hazard: HazardType, intensity: HazardIntensityType): { zone: TravelZone; reason?: string } {
  // High Biohazard or Radioactive = Automatic Amber Zone
  if (hazard === 'Radioactive' || (hazard === 'Biohazard' && intensity === 'High')) {
    return { zone: 'Amber', reason: `High ${hazard}` };
  }
  
  // Otherwise roll 2D6, on 2 = Amber Zone
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  if (roll === 2) {
    const reasons = [
      'Civil unrest',
      'Disease outbreak',
      'Environmental hazard',
      'Political instability',
      'Trade restrictions',
      'Military activity'
    ];
    return { zone: 'Amber', reason: reasons[Math.floor(Math.random() * reasons.length)] };
  }
  
  return { zone: 'Green' };
}

// =====================
// Culture Table (D66 × D6)
// =====================

const CULTURE_TRAITS: string[][] = [
  ['Anarchist', 'Bureaucratic', 'Caste system', 'Collectivist', 'Competitive', 'Cosmopolitan'],
  ['Deceptive', 'Degenerate', 'Devoted', 'Egalitarian', 'Elitist', 'Fatalistic'],
  ['Fearful', 'Generous', 'Gregarious', 'Heroic', 'Honest', 'Honorable'],
  ['Hospitable', 'Hostile', 'Idealistic', 'Indifferent', 'Individualist', 'Intolerant'],
  ['Isolationist', 'Legalistic', 'Libertarian', 'Militarist', 'Pacifist', 'Paranoid'],
  ['Piety', 'Progressive', 'Proud', 'Rustic', 'Ruthless', 'Scheming'],
];

export function generateCultureTraits(count: number = 1): string[] {
  const traits: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const roll1 = Math.floor(Math.random() * 6);
    const roll2 = Math.floor(Math.random() * 6);
    const roll3 = Math.floor(Math.random() * 6);
    
    const row = roll1 + roll2; // 0-10, clamp to 0-5
    const col = roll3;
    
    const trait = CULTURE_TRAITS[Math.min(5, row)]?.[col];
    if (trait && !traits.includes(trait)) {
      traits.push(trait);
    }
  }
  
  return traits;
}

// =====================
// Planetary System
// =====================

export function getBodyCount(type: 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas'): number {
  switch (type) {
    case 'disk':
      return Math.max(0, (Math.floor(Math.random() * 3) + 1) + (Math.floor(Math.random() * 3) + 1) - 2);
    case 'dwarf':
      return Math.max(0, (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1) - 3);
    case 'terrestrial':
      return Math.max(0, (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1) - 2);
    case 'ice':
      return Math.max(0, (Math.floor(Math.random() * 3) + 1) + (Math.floor(Math.random() * 3) + 1) - 2);
    case 'gas':
      return Math.max(0, (Math.floor(Math.random() * 3) + 1) + (Math.floor(Math.random() * 3) + 1) - 2);
  }
}

export function getGasWorldClass(roll: number): string {
  if (roll <= 17) return 'V';
  if (roll <= 20) return 'IV';
  if (roll <= 22) return 'III';
  if (roll <= 26) return 'II';
  return 'I';
}

// =====================
// World Position
// =====================

export function calculateWorldPosition(
  _atmosphere: AtmosphereType,
  temperature: TemperatureType,
  luminosity: number
): { zone: Zone; distanceAU: number } {
  const sqrtL = Math.sqrt(luminosity);
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // Determine base zone from atmosphere + temperature
  let baseZone: Zone;
  
  if (temperature === 'Inferno') baseZone = 'Infernal';
  else if (temperature === 'Hot') baseZone = 'Hot';
  else if (temperature === 'Average') baseZone = 'Conservative';
  else if (temperature === 'Cold') baseZone = 'Cold';
  else baseZone = 'Outer';
  
  // Calculate distance based on zone
  let distance: number;
  switch (baseZone) {
    case 'Infernal':
      distance = sqrtL * (0.067 * roll);
      break;
    case 'Hot':
      distance = sqrtL * ((0.067 * roll) + 0.4);
      break;
    case 'Conservative':
      distance = sqrtL * ((0.067 * roll) + 0.7);
      break;
    case 'Cold':
      distance = sqrtL * ((0.61 * roll) + 1.2);
      break;
    case 'Outer':
      const outerRoll = Math.floor(Math.random() * 6) + 1;
      let multiplier = 1;
      if (outerRoll === 6) {
        // Roll again and multiply
        let sixes = 1;
        let reroll = 6;
        while (reroll === 6) {
          reroll = Math.floor(Math.random() * 6) + 1;
          if (reroll === 6) sixes++;
        }
        multiplier = sixes;
      }
      distance = sqrtL * (Math.pow(outerRoll, 2) + 4.85) * multiplier;
      break;
  }
  
  return { zone: baseZone, distanceAU: Math.round(distance * 100) / 100 };
}


