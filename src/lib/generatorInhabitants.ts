import type {
  GeneratorOptions, Inhabitants, MainWorld
} from '../types';
import { roll2D6, roll3D6, rollExploding } from './dice';
import { getGdpPerDayForWorld, getSoc7MonthlyIncome } from './economicPresets';
import { getStarportFloorClass } from './generatorHelpers';
import { POWER_CULTURE_CONFLICTS, calculateDepressionPenalty, calculateStarport, determineTravelZone, generateCultureTraits, getDevelopment, getGovernanceDM, getHabitatSize, getPowerStructure, getSourceOfPower, getWealth, rollForBase } from './worldData';
import { applyCulturalEffects } from './worldDataCulture';


// =====================
// Inhabitant Generation
// =====================

export function generateInhabitants(
  mainWorld: MainWorld,
  opts: GeneratorOptions
): Inhabitants {
  if (!opts.populated) {
    return {
      populated: false,
      techLevel: 0,
      population: 0,
      wealth: 'Average',
      powerStructure: 'Anarchy',
      development: 'UnderDeveloped',
      sourceOfPower: 'Kratocracy',
      governance: -9,
      starport: { class: 'X', pss: 0, rawClass: 'X', tlCap: 'X', annualTrade: 0, weeklyBase: 0, weeklyActivity: 0, hasNavalBase: false, hasScoutBase: false, hasPirateBase: false },
      travelZone: 'Green',
      cultureTraits: [],
    };
  }

  // Use Tech Level from MainWorld (QA-009 fix) — TL affects habitability
  const techLevel = mainWorld.techLevel;

  // EnvHab = natural habitability without TL display modifier
  const tlDisplayMod = mainWorld.habitabilityComponents?.techLevel ?? Math.max(0, Math.min(9, techLevel - 7));
  const envHab = mainWorld.habitability - tlDisplayMod;

  // Productivity multiplier = income improvement at this TL vs base TL
  const preset = opts.tlProductivityPreset!;
  const productivityMultiplier = getSoc7MonthlyIncome(techLevel, preset) / getSoc7MonthlyIncome(preset.baseTL, preset);

  let population: number;
  let habitatType: string | undefined;

  if (envHab <= 0) {
    // Hostile world: artificial habitats scaled by productivity
    const habitatRoll = roll2D6().value;
    const habitatResult = getHabitatSize(habitatRoll);
    population = Math.max(10, Math.floor(habitatResult.population * productivityMultiplier));
    habitatType = habitatResult.type;
  } else {
    // Natural world: carrying capacity scaled by productivity and exploding 2d6
    const carryingCapacityRoll = rollExploding(2, 6).value;
    const maxPopulation = Math.pow(10, envHab + 1) * productivityMultiplier * carryingCapacityRoll;
    const popRoll = roll3D6().value;
    population = Math.max(10, Math.floor(popRoll * maxPopulation * 0.05));
  }

  const powerStructure = getPowerStructure(undefined, opts.powerWeights);

  const sourceOfPower = getSourceOfPower(undefined, opts.govWeights);

  // QA-066: generate culture traits BEFORE wealth/development so mechanical effects can modify rolls
  const cultureExclude = POWER_CULTURE_CONFLICTS[sourceOfPower] ?? [];
  const cultureTraits = generateCultureTraits(2, cultureExclude);
  const culturalEffects = applyCulturalEffects(cultureTraits);

  // Roll wealth and development, applying cultural deltas
  const wealthRollRaw = opts.wealthWeights
    ? (() => { const r = roll2D6(); return r.value; })()
    : Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  const wealthRoll = Math.max(2, Math.min(12, wealthRollRaw + culturalEffects.wealthDelta));
  const wealth = getWealth(wealthRoll, mainWorld.biochemicalResources);

  const devRollRaw = opts.developmentWeights
    ? (() => { const r = roll2D6(); return r.value; })()
    : Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  const devRoll = Math.max(2, Math.min(12, devRollRaw + culturalEffects.developmentDelta));
  const devResult = getDevelopment(devRoll);

  const governance = getGovernanceDM(devResult.level, wealth);

  const effectivePopulation = Math.max(10, Math.floor(population * culturalEffects.workforceMultiplier));

  const penalty = calculateDepressionPenalty(effectivePopulation, devResult.level);
  const effectiveTL = Math.max(0, techLevel - penalty);

  const weeklyRoll = roll3D6().value;

  const gdpPerDay = getGdpPerDayForWorld(techLevel, devResult.level, wealth, opts.tlProductivityPreset!);

  // R4 / QA-070: determine starport floor based on world function
  const floorClass = getStarportFloorClass(effectivePopulation, envHab, habitatType, mainWorld.biochemicalResources);

  // QA-034: depression penalty is always applied after starport calculation
  let foundingStarportResult = calculateStarport(effectivePopulation, techLevel, wealth, devResult.level, weeklyRoll, gdpPerDay, floorClass);
  let starportResult = foundingStarportResult;

  if (effectiveTL !== techLevel) {
    const effectiveGdpPerDay = getGdpPerDayForWorld(effectiveTL, devResult.level, wealth, opts.tlProductivityPreset!);
    starportResult = calculateStarport(effectivePopulation, effectiveTL, wealth, devResult.level, weeklyRoll, effectiveGdpPerDay, floorClass);
  }

  const starport = {
    class: starportResult.class,
    pss: starportResult.pss,
    rawClass: starportResult.rawClass,
    tlCap: starportResult.tlCap,
    annualTrade: starportResult.annualTrade,
    weeklyBase: starportResult.weeklyBase,
    weeklyActivity: starportResult.weeklyActivity,
    hasNavalBase: rollForBase(starportResult.class, 'naval'),
    hasScoutBase: rollForBase(starportResult.class, 'scout'),
    hasPirateBase: rollForBase(starportResult.class, 'pirate'),
    foundingClass: foundingStarportResult.class,
    foundingPSS: foundingStarportResult.pss,
    foundingRawClass: foundingStarportResult.rawClass,
  };

  // QA-066: apply travel zone delta from cultural effects
  const zoneResult = determineTravelZone(mainWorld.hazard, mainWorld.hazardIntensity, effectiveTL);
  let travelZone = zoneResult.zone;
  let travelZoneReason = zoneResult.reason;
  if (culturalEffects.travelZoneDelta !== 0) {
    // Shift zone: positive delta → more dangerous (Green→Amber→Red)
    const zoneOrder: import('../types').TravelZone[] = ['Green', 'Amber', 'Red'];
    const currentIdx = zoneOrder.indexOf(travelZone);
    const newIdx = Math.max(0, Math.min(zoneOrder.length - 1, currentIdx + culturalEffects.travelZoneDelta));
    const newZone = zoneOrder[newIdx];
    if (newZone !== travelZone) {
      travelZone = newZone;
      travelZoneReason = (travelZoneReason ?? '') + (travelZoneReason ? '; ' : '') + 'Modified by cultural attitudes';
    }
  }

  return {
    populated: true,
    habitatType,
    techLevel,
    foundingTL: techLevel,
    effectiveTL,
    population,
    effectivePopulation,
    wealth,
    powerStructure,
    development: devResult.level,
    sourceOfPower,
    governance,
    starport,
    travelZone,
    travelZoneReason,
    cultureTraits,
    tradeMultiplier: culturalEffects.tradeMultiplier,
    culturalEffectsBreakdown: culturalEffects.breakdown,
  };
}
