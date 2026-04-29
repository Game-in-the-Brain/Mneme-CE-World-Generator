import type {
  GeneratorOptions, Inhabitants, MainWorld
} from '../types';
import { roll2D6, roll3D6, rollExploding } from './dice';
import { getGdpPerDayForWorld, getSoc7MonthlyIncome } from './economicPresets';
import { getStarportFloorClass } from './generatorHelpers';
import { POWER_CULTURE_CONFLICTS, calculateDepressionPenalty, calculateStarport, determineTravelZone, generateCultureTraits, getDevelopment, getGovernanceDM, getHabitatSize, getPowerStructure, getSourceOfPower, getWealth, rollForBase } from './worldData';


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

  const wealth = getWealth(undefined, mainWorld.biochemicalResources, opts.wealthWeights);

  const powerStructure = getPowerStructure(undefined, opts.powerWeights);

  const devResult = getDevelopment(undefined, opts.developmentWeights);

  const sourceOfPower = getSourceOfPower(undefined, opts.govWeights);

  const governance = getGovernanceDM(devResult.level, wealth);

  const penalty = calculateDepressionPenalty(population, devResult.level);
  const effectiveTL = Math.max(0, techLevel - penalty);

  const weeklyRoll = roll3D6().value;

  const gdpPerDay = getGdpPerDayForWorld(techLevel, devResult.level, wealth, opts.tlProductivityPreset!);

  // R4 / QA-070: determine starport floor based on world function
  const floorClass = getStarportFloorClass(population, envHab, habitatType, mainWorld.biochemicalResources);

  // QA-034: depression penalty is always applied after starport calculation
  let foundingStarportResult = calculateStarport(population, techLevel, wealth, devResult.level, weeklyRoll, gdpPerDay, floorClass);
  let starportResult = foundingStarportResult;

  if (effectiveTL !== techLevel) {
    const effectiveGdpPerDay = getGdpPerDayForWorld(effectiveTL, devResult.level, wealth, opts.tlProductivityPreset!);
    starportResult = calculateStarport(population, effectiveTL, wealth, devResult.level, weeklyRoll, effectiveGdpPerDay, floorClass);
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

  const zoneResult = determineTravelZone(mainWorld.hazard, mainWorld.hazardIntensity, effectiveTL);

  const cultureExclude = POWER_CULTURE_CONFLICTS[sourceOfPower] ?? [];
  const cultureTraits = generateCultureTraits(2, cultureExclude);

  return {
    populated: true,
    habitatType,
    techLevel,
    foundingTL: techLevel,
    effectiveTL,
    population,
    wealth,
    powerStructure,
    development: devResult.level,
    sourceOfPower,
    governance,
    starport,
    travelZone: zoneResult.zone,
    travelZoneReason: zoneResult.reason,
    cultureTraits,
  };
}
