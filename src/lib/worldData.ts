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
  // Fixed: Abundant and Inexhaustible must provide POSITIVE habitability
  if (roll === 2) return { level: 'Scarce', tl: 8, habitability: -5 };
  if (roll <= 4) return { level: 'Rare', tl: 7, habitability: -4 };
  if (roll <= 7) return { level: 'Uncommon', tl: 4, habitability: -3 };
  if (roll <= 11) return { level: 'Abundant', tl: 0, habitability: 3 };  // Was 0, should be +3
  return { level: 'Inexhaustible', tl: 0, habitability: 5 };             // Correctly +5
}

// =====================
// Habitability Calculation with TL modifier
// =====================

/**
 * Calculate total habitability including Tech Level modifier.
 * 
 * TL Modifier = TL - 7, clamped to 0-9 (so TL 7 = 0, TL 8 = 1, ..., TL 16 = 9)
 * 
 * Expected component ranges:
 *   Gravity:           -2.5 to 0
 *   Atmosphere:        -2.5 to 0
 *   Temperature:       -2.0 to 0
 *   Hazard type:       -1.5 to 0
 *   Hazard intensity:  -2.0 to 0
 *   Biochem resources: -5 to +5
 *   Tech Level:         0 to +9
 */
export function calculateTotalHabitability(
  gravityHabitability: number,
  atmosphereHabitability: number,
  temperatureHabitability: number,
  hazardHabitability: number,
  hazardIntensityHabitability: number,
  biochemHabitability: number,
  techLevel: number
): number {
  // TL modifier: TL - 7, clamped 0-9
  const tlModifier = Math.max(0, Math.min(9, techLevel - 7));
  
  const total = 
    gravityHabitability +
    atmosphereHabitability +
    temperatureHabitability +
    hazardHabitability +
    hazardIntensityHabitability +
    biochemHabitability +
    tlModifier;
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('Habitability breakdown:', {
      gravity: gravityHabitability,
      atmosphere: atmosphereHabitability,
      temperature: temperatureHabitability,
      hazard: hazardHabitability,
      hazardIntensity: hazardIntensityHabitability,
      biochem: biochemHabitability,
      techLevel,
      tlModifier,
      total: Math.round(total * 10) / 10,
    });
  }
  
  return Math.round(total * 10) / 10;
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
  return Math.max(10, Math.floor(basePopulation * roll));
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

export const CULTURE_TRAIT_DESCRIPTIONS: Record<string, string> = {
  'Anarchist':    'Society operates without centralised authority. Power is distributed among local communities or strong individuals. Disputes are settled by consensus, reputation, or force — formal government is absent or minimal.',
  'Bureaucratic': 'Governed by elaborate formal procedures and hierarchies of officials. Progress is slow and paper-heavy. Outsiders find the system impenetrable without local contacts or expert knowledge.',
  'Caste system': 'Social class is fixed at birth and rarely changes. Occupation, marriage, and rights are tied to caste membership. Intermingling between castes is discouraged or forbidden.',
  'Collectivist': 'The group takes precedence over the individual. Resources and achievements are shared communally. Individual ambition is viewed with suspicion; loyalty to the collective is the highest virtue.',
  'Competitive':  'Driven by rivalry — economic, political, or social. Factions constantly vie for status and resources. Innovation is high but cooperation is low; betrayal is common in business and politics.',
  'Cosmopolitan': 'Open, diverse, and outward-looking. Outsiders are welcomed; multiple languages and customs coexist. Trade and cultural exchange are celebrated; insularity is considered backward.',
  'Deceptive':    'Dissembling is culturally accepted or even admired. Contracts are honoured only when convenient. Visitors should assume they are being misled; direct dealing is considered naïve.',
  'Degenerate':   'Social structures are in visible decay. Corruption, excess, and breakdown of shared norms are widespread. The ruling class indulges itself while the population suffers.',
  'Devoted':      'Organised around a powerful faith, ideology, or cause. Members sacrifice personal interests readily. Outsiders who do not share the devotion may be viewed as threats or potential converts.',
  'Egalitarian':  'Social equality is a core value. Titles, inherited wealth, and privilege are viewed with suspicion. Everyone is expected to contribute and receive fair reward.',
  'Elitist':      'Stratified by talent, birth, or achievement — and those at the top are unapologetic about it. Access to power is tightly controlled by a privileged few.',
  'Fatalistic':   'Outcomes are believed to be predetermined — by fate, the stars, or divine will. There is little sense of personal agency. Tragedy is accepted with resignation; risk is taken boldly.',
  'Fearful':      'Chronic fear shapes daily life — of authority, outsiders, or each other. Informants are common. Public behaviour is guarded. Creativity and dissent are suppressed by the constant threat of consequences.',
  'Generous':     'Hospitality and giving are core values. Wealth is measured by how much is given away. Visitors can expect food, shelter, and help; refusing a gift is a serious insult.',
  'Gregarious':   'Outgoing and social. Business is conducted over meals and celebrations. Silence and reserve are read as hostility. Networking is essential to getting anything done.',
  'Heroic':       'Celebrates bold action, personal courage, and decisive leadership. Self-sacrifice for a worthy cause is the highest honour. Caution and compromise are viewed as cowardice.',
  'Honest':       'Directness and truthfulness are paramount virtues. Lying — even polite social lies — is deeply shameful. Negotiations are blunt; what you see is what you get.',
  'Honorable':    'A strict code of personal conduct governs all interactions. Promises made are kept regardless of cost. Insults demand satisfaction. Reputation is everything.',
  'Hospitable':   'Welcoming strangers is a near-sacred duty. Travellers receive food, shelter, and protection as guests. In return, guests must behave with respect; violating hospitality is unforgivable.',
  'Hostile':      'Outsiders are viewed with deep suspicion or open aggression. Trade and diplomacy are grudging. Violence is a common first response to perceived threats.',
  'Idealistic':   'Driven by a vision of a better future — political, spiritual, or philosophical. Pragmatism is subordinated to principle. Grand projects are launched with enthusiasm; results rarely match the vision.',
  'Indifferent':  'Largely apathetic to politics, religion, and outside events. People focus on day-to-day comfort. The society is stable but difficult to mobilise for collective action, good or ill.',
  'Individualist':'Personal freedom and self-determination are paramount. Community obligations are minimal; everyone makes their own way. Privacy is jealously guarded; mutual aid is transactional.',
  'Intolerant':   'Conformity is enforced in belief, appearance, or behaviour. Minorities or those who deviate from norms face discrimination. The dominant group defines what is acceptable.',
  'Isolationist': 'Prefers minimal contact with outsiders. Off-world trade and immigration are restricted. Self-sufficiency is a point of pride. Outsiders are rarely made welcome.',
  'Legalistic':   'Governed by an intricate body of law applied rigorously. Contracts are everything. Legal disputes are common and consume years. An advocate is essential for any significant dealings.',
  'Libertarian':  'Personal freedom is the supreme value. Government is minimal by design; taxation and regulation are resisted. The individual is sovereign. The resulting society is dynamic, unequal, and occasionally chaotic.',
  'Militarist':   'Military virtues — discipline, strength, sacrifice — dominate culture. A significant fraction of the population serves or has served. Foreign policy is assertive; war is always a near possibility.',
  'Pacifist':     'Violence is culturally abhorrent. Conflict is resolved through mediation or passive resistance. Military forces are minimal. The society may be vulnerable but its internal cohesion is usually high.',
  'Paranoid':     'Lives in fear of hidden enemies — foreign agents, conspirators, or unseen forces. Surveillance is normalised. Strangers are automatically suspect. Accusations of betrayal are common and dangerous.',
  'Piety':        'Religious observance permeates every aspect of daily life. Festivals, prayers, and ritual duties structure the calendar. Offending religious sensibilities — even unknowingly — has serious consequences.',
  'Progressive':  'Embraces change, experimentation, and modernisation. Traditional structures are questioned or dismantled. Innovation is celebrated; rapid social change creates opportunity and instability in equal measure.',
  'Proud':        'Has a strong sense of its own greatness — historical, cultural, or racial. Perceived slights against national honour are taken very seriously. Admitting weakness is almost impossible.',
  'Rustic':       'Values simplicity, self-reliance, and closeness to the land. Urban sophistication is viewed with suspicion. Hard work, practical skills, and community ties are the true measures of a person.',
  'Ruthless':     'Winning is everything. Compassion and sentiment are luxuries. Competitors are destroyed, not merely defeated. Visitors are advised not to show weakness.',
  'Scheming':     'Political and social life is a labyrinth of alliances, betrayals, and counter-moves. Everyone has an agenda; nothing is said directly. Information is currency. Naïveté is fatal.',
};

// =====================
// Inhabitants Descriptions
// =====================

export const WEALTH_DESCRIPTIONS: Record<WealthLevel, { description: string }> = {
  'Average':    { description: 'The working population meets basic needs with little surplus. Consumer goods are limited; saving is difficult. Standard of living varies widely between regions.' },
  'Better-off': { description: 'An above-average economy with a growing middle class. Basic luxuries are accessible; disposable income exists. Trade is active and investment is beginning to circulate.' },
  'Prosperous': { description: 'A strong economy with significant trade surplus. Luxury goods are available; investment capital circulates freely. Quality of life is high for most citizens.' },
  'Affluent':   { description: 'A wealthy, thriving society with high per-capita income. Premium services are standard; off-world investment is significant. Poverty is minimal; consumption is conspicuous.' },
};

export const POWER_STRUCTURE_DESCRIPTIONS: Record<PowerStructure, { description: string }> = {
  'Anarchy':       { description: 'No recognised central authority exists. Power is fragmented among local strongmen, warlords, community councils, or guilds. Rules vary by location; travel between zones can be unpredictable.' },
  'Confederation': { description: 'A loose alliance of member-states that retain sovereignty. The central body has limited powers — primarily defence and trade arbitration. Member interests frequently conflict with collective decisions.' },
  'Federation':    { description: 'Member-states have delegated significant powers to a central government. Strong federal institutions co-exist with retained regional identity and local law. The most stable structure for diverse worlds.' },
  'Unitary State': { description: 'A single centralised government rules directly. Regions are administrative divisions, not political entities. Policy is imposed from the top; efficient but can be brittle under stress.' },
};

export const DEVELOPMENT_DESCRIPTIONS: Record<DevelopmentLevel, { hdi: string; description: string }> = {
  'UnderDeveloped': { hdi: '0.0–0.59', description: 'Subsistence economy dominates. High infant mortality, minimal infrastructure, most of the population engaged in agricultural or extractive labour. Basic literacy and healthcare are patchy. Significant poverty is the norm. (Book p.29)' },
  'Developing':     { hdi: '0.60–0.69', description: 'Industrial base is forming. A middle class is emerging. Access to basic technology — communications, medicine, transport — is becoming widespread. Rural-to-urban migration is accelerating. Inequality is often high during this transition. (Book p.29)' },
  'Mature':         { hdi: '0.70–0.79', description: 'A stable industrial economy with broadly accessible education and healthcare. A consumer economy is growing. Social institutions are functioning but under strain. Life expectancy has improved markedly. (Book p.29)' },
  'Developed':      { hdi: '0.80–0.89', description: 'High standard of living. Service and knowledge economy is dominant. Strong institutions; rule of law is generally reliable. Life expectancy is high; most citizens have access to advanced medical care and education. (Book p.29)' },
  'Well Developed': { hdi: '0.90–0.94', description: 'Post-industrial, technology-intensive economy. High educational attainment across the population. A strong social safety net reduces extreme hardship. Automation handles much routine labour. Off-world investment is common. (Book p.29)' },
  'Very Developed': { hdi: '>0.95', description: 'Near-optimal material conditions. Automation handles most labour; citizens pursue creative, scientific, and exploratory vocations. Inequality is minimal. This society is a significant player in interstellar trade and culture. (Book p.29)' },
};

export const SOURCE_OF_POWER_DESCRIPTIONS: Record<PowerSource, { description: string }> = {
  'Aristocracy': { description: 'Power is held by hereditary noble families or landed gentry. Bloodlines and inheritance determine access to governance. Reform is slow; the system perpetuates itself across generations.' },
  'Ideocracy':   { description: 'Power is legitimised by adherence to an ideology, religion, or doctrine. True believers run the state; deviation from orthodoxy is a political as well as moral offence.' },
  'Kratocracy':  { description: 'Power belongs to the strongest. Might makes right — leadership changes through contest, coup, or demonstrated dominance. Can be dynamic but is inherently unstable.' },
  'Democracy':   { description: 'Power is derived from popular will through elections, referenda, or direct participation. Legitimacy requires ongoing consent of the governed. Prone to short-termism but resilient to abuse.' },
  'Meritocracy': { description: 'Power is awarded to those who demonstrate competence through examination, achievement, or proven track record. Efficient and innovative, but risks creating a self-perpetuating technocratic elite.' },
};

// =====================
// Planetary System
// =====================

/**
 * Generate body count with optional stellar class Adv/Dis modifiers (QA-007 / QA-015 / FRD 8.1-8.2).
 *
 * | Class | Modifier               |
 * |-------|------------------------|
 * | F     | Adv+2 on d6            |
 * | G     | Baseline (d6)          |
 * | K     | Dis+3 on d6            |
 * | M     | Half Dice + Dis+1 (d3) |
 * | O,B,A | Disks only             |
 *
 * House Rule REF-007 v1.2 — Half Dice mechanic for M-class stars (QA-015).
 * K-class: d6 with Dis+3 (reduced planet counts).
 * M-class: d3 with Dis+1 (significantly reduced planet counts — Half Dice).
 * F-class: Adv+2 on d6 (more planets).
 * G-class: Baseline d6 (standard distribution).
 */
export function getBodyCount(
  type: 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas',
  stellarClass?: StellarClass
): number {
  // O, B, A stars: only circumstellar disks
  if (stellarClass && (stellarClass === 'O' || stellarClass === 'B' || stellarClass === 'A')) {
    if (type !== 'disk') return 0;
  }

  // Roll N dice, keep best/worst M (for d6)
  function rollNd6KeepM(n: number, keep: number, keepLowest: boolean): number {
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => keepLowest ? a - b : b - a);
    return rolls.slice(0, keep).reduce((s, r) => s + r, 0);
  }

  // Roll N d3 dice, keep best/worst M (for Half Dice mechanic)
  function rollNd3KeepM(n: number, keep: number, keepLowest: boolean): number {
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * 3) + 1);
    rolls.sort((a, b) => keepLowest ? a - b : b - a);
    return rolls.slice(0, keep).reduce((s, r) => s + r, 0);
  }

  const advExtra = stellarClass === 'F' ? 2 : 0;
  const disExtraK = stellarClass === 'K' ? 3 : 0; // K-class: Dis+3 on d6
  // M-class: Half Dice (d3) with Dis+1 — handled separately per type

  switch (type) {
    case 'disk': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 1d3-1, roll 2d3 keep lowest 1
        const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 3) + 1);
        rolls.sort((a, b) => a - b);
        return Math.max(0, rolls[0] - 1);
      }
      // Standard: 2D3 - 2 (disks use d3 for all stars)
      const r1 = Math.floor(Math.random() * 3) + 1;
      const r2 = Math.floor(Math.random() * 3) + 1;
      return Math.max(0, r1 + r2 - 2);
    }
    case 'dwarf': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 3d3-3, roll 4d3 keep lowest 3
        return Math.max(0, rollNd3KeepM(4, 3, true) - 3);
      }
      // Standard: 3D6 - 3 with Adv/Dis
      if (advExtra > 0) return Math.max(0, rollNd6KeepM(3 + advExtra, 3, false) - 3);
      if (disExtraK > 0) return Math.max(0, rollNd6KeepM(3 + disExtraK, 3, true) - 3);
      return Math.max(0,
        (Math.floor(Math.random() * 6) + 1) +
        (Math.floor(Math.random() * 6) + 1) +
        (Math.floor(Math.random() * 6) + 1) - 3
      );
    }
    case 'terrestrial': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 2d3-2, roll 3d3 keep lowest 2
        return Math.max(0, rollNd3KeepM(3, 2, true) - 2);
      }
      // Standard: 2D6 - 2 with Adv/Dis
      if (advExtra > 0) return Math.max(0, rollNd6KeepM(2 + advExtra, 2, false) - 2);
      if (disExtraK > 0) return Math.max(0, rollNd6KeepM(2 + disExtraK, 2, true) - 2);
      return Math.max(0,
        (Math.floor(Math.random() * 6) + 1) +
        (Math.floor(Math.random() * 6) + 1) - 2
      );
    }
    case 'ice': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 1d3-1, roll 2d3 keep lowest 1
        const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 3) + 1);
        rolls.sort((a, b) => a - b);
        return Math.max(0, rolls[0] - 1);
      }
      // Standard: 2D3 - 2 (ice worlds use d3 for all stars)
      const r1 = Math.floor(Math.random() * 3) + 1;
      const r2 = Math.floor(Math.random() * 3) + 1;
      return Math.max(0, r1 + r2 - 2);
    }
    case 'gas': {
      if (stellarClass === 'M') {
        // Half Dice + Dis+1: 1d3-1, roll 2d3 keep lowest 1
        const rolls = Array.from({ length: 2 }, () => Math.floor(Math.random() * 3) + 1);
        rolls.sort((a, b) => a - b);
        return Math.max(0, rolls[0] - 1);
      }
      // Standard: 2D3 - 2 (gas worlds use d3 for all stars)
      const r1 = Math.floor(Math.random() * 3) + 1;
      const r2 = Math.floor(Math.random() * 3) + 1;
      return Math.max(0, r1 + r2 - 2);
    }
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

// =====================
// Habitat Size Table (Hab ≤ 0 populated worlds — MVT/GVT)
// =====================

export function getHabitatSize(roll: number): { type: string; population: number } {
  if (roll === 2)  return { type: 'Frontier Outpost',   population: Math.floor(Math.random() * 90)       + 10 };
  if (roll <= 4)   return { type: 'Research Station',   population: Math.floor(Math.random() * 900)      + 100 };
  if (roll <= 6)   return { type: 'Mining Habitat',     population: Math.floor(Math.random() * 9000)     + 1000 };
  if (roll <= 8)   return { type: 'Industrial Habitat', population: Math.floor(Math.random() * 90000)    + 10000 };
  if (roll <= 10)  return { type: 'Colonial Habitat',   population: Math.floor(Math.random() * 900000)   + 100000 };
  if (roll === 11) return { type: 'City Habitat',       population: Math.floor(Math.random() * 9000000)  + 1000000 };
  return             { type: 'Megastructure',           population: Math.floor(Math.random() * 90000000) + 10000000 };
}

// =====================
// Tech Level Reference Table (REF-013)
// =====================

export interface TLEntry {
  mtl: number;
  ceTL: number;
  ceYear: string;
  heYear: string;
  eraName: string;
  keyTechnologies: string;
}

export const TL_TABLE: Record<number, TLEntry> = {
  9:  { mtl: 9,  ceTL: 7.0, ceYear: '2050 CE', heYear: '12,050 HE', eraName: 'New Space Race / Space Industrialisation',        keyTechnologies: 'Reliable orbit access, maker era, companion AI, graphene fibre, orbital manufacturing, and Lunar colonisation. Xeno-surrogacy and human gene-engineering emerge.' },
  10: { mtl: 10, ceTL: 8.0, ceYear: '2100 CE', heYear: '12,100 HE', eraName: 'Cis-Lunar Development',                           keyTechnologies: 'Skyhook networks, Lagrange manufacturing, Lunar Frontier Economy developing with footholds to other planets. Voidborn colonisation begins. Combined Cis-Lunar economy exceeds any single nation on Earth.' },
  11: { mtl: 11, ceTL: 8.5, ceYear: '2200 CE', heYear: '12,200 HE', eraName: 'Interplanetary Settlement & Jovian Colonisation',  keyTechnologies: 'Space economy surpasses Earth. Jupiter colonisation enabled by Carbon Nanotube construction — gigaton-scale structures and ships. Jovian Variant humans. Space elevator construction begins. Jovian economy surpasses Cis-Lunar.' },
  12: { mtl: 12, ceTL: 9.0, ceYear: '2300 CE', heYear: '12,300 HE', eraName: 'Post-Earth Dependence',                           keyTechnologies: 'Early jump gate (initially only at the Jupiter/Sol Lagrange point). Jovian economy independent of Earth, population exceeding Earth\'s. Jovian Hammers skim Jupiter for unique materials. The Bakunawa/Antaboga Coil — 898,394 km particle accelerator — creates antimatter to power jump gates.' },
  13: { mtl: 13, ceTL: 9.5, ceYear: '2400 CE', heYear: '12,400 HE', eraName: 'Outer System Development',                        keyTechnologies: 'World Serpents (particle accelerators on radiation belts) and jump gates connect star systems. Great Trees (fixed space elevators, Bradley C. Edwards design) viable for >1G escape by 24th century. Celestials (inner system solar swarms) sail light. Terraforming Worms process microbiomes on low-G worlds. Colony ships — O\'Neill cylinders and spiral CNT constructs — jump to new stars. Earth restoration begins.' },
  14: { mtl: 14, ceTL: 10.0, ceYear: '2500 CE', heYear: '12,500 HE', eraName: 'Early Interstellar Trade & Exploration',         keyTechnologies: 'Jump opens nearby systems. First contact with Divergent Humans — outside-Sol humans using Xeno-Surrogacy (early FTL). 200+ years of freedom allowed billions to emerge. Convergent technology exchange. Terraforming increases Venus and Mars habitability. Intense exodus from Sol.' },
  15: { mtl: 15, ceTL: 10.5, ceYear: '2600 CE', heYear: '12,600 HE', eraName: 'Interstellar Colonisation',                      keyTechnologies: 'Interstellar colonisation well underway with 100 billion+ people outside Sol. Spiral Ships — CNT space elevators twisted into spiral O\'Neill cylinders — fit Jump Gates to carry communities to new stars. Generated primarily by Jupiter, which keeps growing.' },
  16: { mtl: 16, ceTL: 11.0, ceYear: '2700 CE', heYear: '12,700 HE', eraName: 'Self-Sufficient Megastructures & Swarms',        keyTechnologies: 'Serpents, Trees, and Celestials become self-directed — jumping and spreading outward. Humanity cannot help but be carried away by the momentum of its own creations.' },
  17: { mtl: 17, ceTL: 11.5, ceYear: '2800 CE', heYear: '12,800 HE', eraName: 'Post-Megastructure Expansion',                   keyTechnologies: 'Civilisation expands beyond any single direction. The megastructures carry it outward.' },
  18: { mtl: 18, ceTL: 12.0, ceYear: '2900+ CE', heYear: '12,900+ HE', eraName: 'Unknown Future',                               keyTechnologies: 'Beyond current modelling. Civilisational trajectory unknown.' },
};

