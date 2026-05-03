// =====================
// FRD-070: Economic Classification Derivation Engine
// =====================
//
// Derives a world's economic identity from existing generator outputs.
// No new random rolls — pure function of StarSystem state.

import type {
  StarSystem,
  PlanetaryBody,
  EconomicClassification,
  EconomicDriver,
  EconomicModifier,
  TechTier,
  PopulationScale,
  Inhabitants,
  MainWorld,
  StarportClass,
} from '../types';

// ---- helpers ----

function getMainworldBody(system: StarSystem): PlanetaryBody | undefined {
  const all = [
    ...system.dwarfPlanets,
    ...system.terrestrialWorlds,
    ...(system.moons ?? []),
  ];
  return all.find(b => b.wasSelectedAsMainworld);
}

function computeEnvHab(mainWorld: MainWorld): number {
  const tlModifier = Math.max(0, Math.min(9, mainWorld.techLevel - 7));
  return mainWorld.habitability - tlModifier;
}

function biochemRank(
  mainWorld: MainWorld,
  body: PlanetaryBody | undefined,
): number {
  // Prefer v2 biochem granularity if available
  const v2 = body?.biochem;
  if (v2) {
    const ranks: Record<string, number> = {
      Scarce: 0, Rare: 1, Uncommon: 2, Poor: 2, Deficient: 2,
      Common: 3, Abundant: 4, Rich: 5, Bountiful: 6, Prolific: 7, Inexhaustible: 8,
    };
    return ranks[v2] ?? 3;
  }
  // Fall back to v1 ResourceLevel
  const ranks: Record<ResourceLevelFallback, number> = {
    Scarce: 0, Rare: 1, Uncommon: 2, Abundant: 4, Inexhaustible: 8,
  };
  return ranks[mainWorld.biochemicalResources as unknown as ResourceLevelFallback] ?? 3;
}

type ResourceLevelFallback = 'Scarce' | 'Rare' | 'Uncommon' | 'Abundant' | 'Inexhaustible';

function biosphereRank(body: PlanetaryBody | undefined): number {
  if (!body?.biosphereRating) return 0;
  const r = body.biosphereRating;
  return parseInt(r.slice(1), 10); // 'B0' → 0, 'B4' → 4
}

function getTechTier(tl: number): TechTier {
  if (tl < 9) return 'Primitive';
  if (tl <= 10) return 'Emergent';
  if (tl <= 12) return 'Industrial';
  if (tl <= 15) return 'Advanced';
  return 'Post-Scarcity';
}

function getPopulationScale(pop: number): PopulationScale {
  if (pop < 10_000) return 'Outpost';
  if (pop < 100_000) return 'Settlement';
  if (pop < 1_000_000) return 'Colony';
  if (pop < 100_000_000) return 'Province';
  return 'Homeworld';
}

// ---- primary driver priority logic ----

function derivePrimaryDriver(
  mainWorld: MainWorld,
  inhabitants: Inhabitants,
  body: PlanetaryBody | undefined,
  envHab: number,
): EconomicDriver {
  const tl = inhabitants.techLevel;
  const pop = inhabitants.population;
  const wealth = inhabitants.wealth;
  const dev = inhabitants.development;
  const portClass = inhabitants.starport.class;
  const biochem = biochemRank(mainWorld, body);

  // Priority 1: Subsistence / Closed
  if (pop < 10_000) return 'Subsistence / Closed';
  if (portClass === 'X' && (dev === 'UnderDeveloped' || dev === 'Developing')) {
    return 'Subsistence / Closed';
  }

  // Priority 2: Research Outpost
  if (pop < 100_000 && dev === 'Very Developed' && (portClass === 'X' || portClass === 'E')) {
    return 'Research Outpost';
  }

  // Priority 3: High-Technology
  if (tl >= 13 && dev === 'Very Developed') {
    return 'High-Technology';
  }

  // Priority 4: Services / Trade Hub
  if ((portClass === 'C' || portClass === 'B' || portClass === 'A') &&
      (dev === 'Developed' || dev === 'Well Developed' || dev === 'Very Developed') &&
      pop > 100_000) {
    return 'Services / Trade Hub';
  }

  // Priority 5: Refining (extraction world that can process locally)
  const wouldBeExtraction = (wealth === 'Prosperous' || wealth === 'Affluent') && biochem <= 3 && tl <= 11;
  if (wouldBeExtraction && tl >= 10) {
    return 'Refining';
  }

  // Priority 6: Manufacturing
  if (tl >= 10 && tl <= 12 && pop > 1_000_000 && (portClass === 'D' || portClass === 'C' || portClass === 'B' || portClass === 'A')) {
    return 'Manufacturing';
  }

  // Priority 7: Agricultural Surplus
  const bioRank = biosphereRank(body);
  if (biochem >= 5 && bioRank >= 3 && envHab > 0) {
    return 'Agricultural Surplus';
  }

  // Priority 8: Extraction (default for resource-rich worlds)
  if (wouldBeExtraction) {
    return 'Extraction';
  }

  // Fallback: classify by population scale + tech
  if (pop < 10_000) return 'Subsistence / Closed';
  if (tl >= 10 && tl <= 12 && pop > 100_000) return 'Manufacturing';
  if (tl >= 13) return 'High-Technology';
  if (portClass === 'C' || portClass === 'B' || portClass === 'A') return 'Services / Trade Hub';
  return 'Subsistence / Closed';
}

// ---- modifiers ----

function deriveModifiers(
  mainWorld: MainWorld,
  inhabitants: Inhabitants,
  body: PlanetaryBody | undefined,
  envHab: number,
  driver: EconomicDriver,
): EconomicModifier[] {
  const mods: EconomicModifier[] = [];

  // Garden: pristine ecology
  const bioRank = biosphereRank(body);
  const biochem = biochemRank(mainWorld, body);
  const baseline = body?.baselineHabitability ?? mainWorld.habitability;
  if (bioRank >= 4 && biochem >= 5 && baseline > 4) {
    mods.push('Garden');
  }

  // Fluid Ocean: subsurface or surface liquid
  const comp = body?.composition ?? '';
  const isHydrous = comp.includes('Hydrous') || comp.includes('Volatile-Rich') || comp.includes('Water');
  const hasSubsurfaceOcean = body?.hasSubsurfaceOceanOverride ?? false;
  const atmoWater = body?.atmosphereComposition === 'Water-Steam' || body?.atmosphereCompositionAbiotic === 'Water-Steam';
  if (isHydrous || hasSubsurfaceOcean || atmoWater) {
    mods.push('Fluid Ocean');
  }

  // Water World: high hydrographic coverage
  // Approximate: significant atmosphere + temperate zone + high biochem
  const hasAtmosphere = mainWorld.atmosphere !== 'Trace';
  const temperateZone = mainWorld.zone === 'Conservative' || mainWorld.zone === 'Cold';
  const notTooHot = mainWorld.temperature !== 'Hot' && mainWorld.temperature !== 'Inferno';
  if (hasAtmosphere && temperateZone && notTooHot && biochem >= 5 && bioRank >= 3) {
    mods.push('Water World');
  }

  // Marginal: inhabited only due to economic necessity
  const hab = baseline;
  if (hab >= 1 && hab <= 3 && envHab <= 0 && driver !== 'Subsistence / Closed') {
    mods.push('Marginal');
  }

  // Contested: hostile/militarist culture
  if (inhabitants.cultureTraits.some(t =>
    t.includes('Hostile') || t.includes('Militarist') || t.includes('Xenophobic')
  )) {
    mods.push('Contested');
  }

  return mods;
}

// ---- narrative text ----

const DRIVER_SUMMARIES: Record<EconomicDriver, string> = {
  'Extraction': 'Raw-material export economy. Mines or pumps valuable resources for off-world trade. Imports almost all finished goods.',
  'Agricultural Surplus': 'Food and biomass export economy. Fertile soils support more than local needs; surplus is traded.',
  'Manufacturing': 'Mid-tech assembly and production for export. Workers and infrastructure focused on industrial output.',
  'Refining': 'Value-add processing economy. Raw materials are refined or processed before export, capturing more margin.',
  'Services / Trade Hub': 'Commerce and logistics hub. Income comes from port fees, warehousing, banking, and transit services.',
  'High-Technology': 'Knowledge and advanced-manufacturing export. Designs, patents, and high-value components dominate trade.',
  'Subsistence / Closed': 'Local-production-only economy. Little to no interstellar trade; population is self-sufficient or dependent.',
  'Research Outpost': 'Science and observation economy. Exists to study local phenomena; supply chain dependent, not export-oriented.',
};

const DRIVER_REASONS: Record<EconomicDriver, string> = {
  'Extraction': 'The rock, gas, or ore is here — someone is paid to pull it out.',
  'Agricultural Surplus': 'The soil, chemistry, and sun are right — settlers came to farm.',
  'Manufacturing': 'Labour costs and port access made this a viable production site.',
  'Refining': 'Raw materials plus local technical capacity meant refining here beats shipping raw.',
  'Services / Trade Hub': 'The jump point or trade lane is here — ships must stop.',
  'High-Technology': 'Skilled population and advanced infrastructure attracted knowledge industries.',
  'Subsistence / Closed': 'They came for a reason now lost to time; they stay because leaving costs too much.',
  'Research Outpost': 'There is something here worth studying that cannot be studied elsewhere.',
};

const MODIFIER_SUMMARY_FRAGMENTS: Record<EconomicModifier, string> = {
  'Garden': 'Pristine ecology draws scientific and tourist interest.',
  'Fluid Ocean': 'Subsurface or surface liquid ocean may harbour unique chemistry or life.',
  'Water World': 'Planet-wide hydrosphere dominates surface conditions and transport.',
  'Marginal': 'Conditions are harsh; habitation persists only because the economic case demands it.',
  'Contested': 'Local culture is hostile or militarised; sovereignty or resources are disputed.',
};

function buildSummary(driver: EconomicDriver, modifiers: EconomicModifier[]): string {
  let text = DRIVER_SUMMARIES[driver];
  for (const m of modifiers) {
    text += ' ' + MODIFIER_SUMMARY_FRAGMENTS[m];
  }
  return text;
}

function buildReason(driver: EconomicDriver, modifiers: EconomicModifier[]): string {
  let text = DRIVER_REASONS[driver];
  for (const m of modifiers) {
    if (m === 'Marginal') {
      text += ' Workers rotate on short contracts; no one stays willingly.';
    }
    if (m === 'Contested') {
      text += ' Armed presence is a cost of doing business here.';
    }
  }
  return text;
}

// ---- CE trade code mapping ----

function deriveCeTradeCodes(
  driver: EconomicDriver,
  modifiers: EconomicModifier[],
  techTier: TechTier,
  populationScale: PopulationScale,
): string[] {
  const codes: string[] = [];

  // Driver-based codes
  switch (driver) {
    case 'Extraction':
      codes.push('Na');
      if (modifiers.includes('Marginal')) codes.push('Po');
      break;
    case 'Agricultural Surplus':
      codes.push('Ag');
      break;
    case 'Manufacturing':
      if (techTier === 'Industrial') codes.push('In');
      break;
    case 'Refining':
      codes.push('In');
      break;
    case 'Services / Trade Hub':
      codes.push('Ri');
      break;
    case 'High-Technology':
      codes.push('Ht');
      if (techTier === 'Advanced' || techTier === 'Post-Scarcity') codes.push('In');
      break;
    case 'Research Outpost':
      // No specific CE code
      break;
    case 'Subsistence / Closed':
      // No specific CE code
      break;
  }

  // Modifier-based codes
  if (modifiers.includes('Garden')) codes.push('Ga');
  if (modifiers.includes('Water World')) codes.push('Wa');
  if (modifiers.includes('Fluid Ocean')) codes.push('Fl');

  // Population scale
  if (populationScale === 'Outpost') codes.push('Lo');
  if (populationScale === 'Homeworld') codes.push('Hi');

  // Tech tier
  if (techTier === 'Primitive') codes.push('Lt');
  if (techTier === 'Advanced' || techTier === 'Post-Scarcity') {
    if (!codes.includes('Ht')) codes.push('Ht');
  }

  return [...new Set(codes)]; // dedupe
}

// ---- public API ----

export function deriveEconomicClassification(system: StarSystem): EconomicClassification {
  const mainWorld = system.mainWorld;
  const inhabitants = system.inhabitants;
  const body = getMainworldBody(system);
  const envHab = computeEnvHab(mainWorld);

  const primaryDriver = derivePrimaryDriver(mainWorld, inhabitants, body, envHab);
  const modifiers = deriveModifiers(mainWorld, inhabitants, body, envHab, primaryDriver);
  const techTier = getTechTier(inhabitants.techLevel);
  const populationScale = getPopulationScale(inhabitants.population);
  const summary = buildSummary(primaryDriver, modifiers);
  const reasonForExistence = buildReason(primaryDriver, modifiers);
  const ceTradeCodes = deriveCeTradeCodes(primaryDriver, modifiers, techTier, populationScale);

  return {
    primaryDriver,
    modifiers,
    techTier,
    populationScale,
    summary,
    reasonForExistence,
    ceTradeCodes,
  };
}

// ---- starport floor helper ----

export function getFloorFromClassification(
  classification: EconomicClassification | undefined,
  population: number,
): StarportClass | undefined {
  if (!classification) return undefined;
  const popUnder500k = population < 500_000;

  switch (classification.primaryDriver) {
    case 'Extraction':
      return popUnder500k ? 'D' : undefined;
    case 'Agricultural Surplus':
      return popUnder500k ? 'E' : undefined;
    case 'Services / Trade Hub':
      return 'C';
    case 'Research Outpost':
      return 'E';
    case 'Subsistence / Closed':
      return undefined;
    default:
      return undefined;
  }
}

// ---- override helper (for edit mode) ----

export function reclassifyWithDriver(
  system: StarSystem,
  overriddenDriver: EconomicDriver,
): EconomicClassification {
  const base = deriveEconomicClassification(system);
  const mainWorld = system.mainWorld;
  const inhabitants = system.inhabitants;
  const body = getMainworldBody(system);
  const envHab = computeEnvHab(mainWorld);

  // Keep modifiers but re-derive them with the new driver context
  const modifiers = deriveModifiers(mainWorld, inhabitants, body, envHab, overriddenDriver);
  const summary = buildSummary(overriddenDriver, modifiers);
  const reasonForExistence = buildReason(overriddenDriver, modifiers);
  const ceTradeCodes = deriveCeTradeCodes(overriddenDriver, modifiers, base.techTier, base.populationScale);

  return {
    ...base,
    primaryDriver: overriddenDriver,
    modifiers,
    summary,
    reasonForExistence,
    ceTradeCodes,
  };
}
