import { v4 as uuidv4 } from 'uuid';
import type {
  StarSystem, Star, MainWorld, Inhabitants, PlanetaryBody,
  StellarClass, StellarGrade, Zone, BodyType, GasWorldClass, LesserEarthType, ZoneBoundaries,
  WorldType, GeneratorOptions
} from '../types';
import { roll5D6, roll2D6, roll3D6, rollKeep, rollD6 } from './dice';
import {
  getClassFromRoll, getGradeFromRoll, getStellarMass, getStellarLuminosity,
  calculateZoneBoundaries, getCompanionTarget,
  constrainCompanionClass, constrainCompanionGrade, getCompanionOrbitDistance,
  STAR_COLORS
} from './stellarData';
import {
  getLesserEarthType, getDwarfGravity, getTerrestrialGravity,
  getAtmosphere, getTemperatureModifier, getTemperature,
  getHazard, getHazardIntensity, getBiochemicalResources,
  getTechLevel, calculatePopulation,
  getWealth, getPowerStructure, getDevelopment, getSourceOfPower,
  getGovernanceDM, calculateStarport, rollForBase, determineTravelZone,
  generateCultureTraits, getBodyCount, getGasWorldClass, calculateWorldPosition,
  getWorldTypeRoll, getHabitatSize
} from './worldData';
import { calculatePhysicalProperties } from './physicalProperties';

// =====================
// Star System Generator
// =====================

export function generateStarSystem(options?: Partial<GeneratorOptions>): StarSystem {
  const opts: GeneratorOptions = {
    starClass:     options?.starClass     ?? 'random',
    starGrade:     options?.starGrade     ?? 'random',
    mainWorldType: options?.mainWorldType ?? 'random',
    populated:     options?.populated     ?? true,
  };

  const id = uuidv4();
  const createdAt = Date.now();

  // Generate primary star
  const primaryStar = generatePrimaryStar(opts);

  // Calculate zones based on primary star luminosity
  const zones = calculateZoneBoundaries(primaryStar.luminosity);

  // Generate companion stars
  const companionStars = generateCompanionStars(primaryStar);

  // Generate main world
  const mainWorld = generateMainWorld(primaryStar, zones, opts.mainWorldType);

  // Generate inhabitants
  const inhabitants = generateInhabitants(mainWorld, opts.populated);

  // Generate planetary system (passes stellar class for Adv/Dis — QA-007)
  const { disks, dwarfs, terrestrials, ices, gases } = generatePlanetarySystem(primaryStar, zones);

  return {
    id,
    createdAt,
    primaryStar,
    companionStars,
    zones,
    mainWorld,
    inhabitants,
    circumstellarDisks: disks,
    dwarfPlanets: dwarfs,
    terrestrialWorlds: terrestrials,
    iceWorlds: ices,
    gasWorlds: gases,
  };
}

// =====================
// Star Generation
// =====================

function generatePrimaryStar(opts: GeneratorOptions): Star {
  const stellarClass: StellarClass = opts.starClass === 'random'
    ? getClassFromRoll(roll5D6().value)
    : (opts.starClass as StellarClass);

  const grade: StellarGrade = opts.starGrade === 'random'
    ? getGradeFromRoll(roll5D6().value)
    : (opts.starGrade as StellarGrade);

  return createStar(stellarClass, grade, true);
}

function createStar(
  stellarClass: StellarClass,
  grade: StellarGrade,
  isPrimary: boolean,
  orbitDistance?: number,
  orbits?: 'primary' | 'companion'
): Star {
  return {
    id: uuidv4(),
    class: stellarClass,
    grade,
    mass: getStellarMass(stellarClass, grade),
    luminosity: getStellarLuminosity(stellarClass, grade),
    color: STAR_COLORS[stellarClass],
    isPrimary,
    orbitDistance,
    orbits,
  };
}

function generateCompanionStars(primaryStar: Star): Star[] {
  const companions: Star[] = [];
  let previousStar = primaryStar;

  let shouldContinue = true;
  let safetyCounter = 0;

  while (shouldContinue && safetyCounter < 10) {
    safetyCounter++;

    const existenceRoll = roll2D6().value;
    const target = getCompanionTarget(previousStar.class === 'O' ? 7 :
      previousStar.class === 'B' ? 6 :
      previousStar.class === 'A' ? 5 :
      previousStar.class === 'F' ? 4 :
      previousStar.class === 'G' ? 3 :
      previousStar.class === 'K' ? 2 : 1);

    if (existenceRoll >= target) {
      const classRoll = roll5D6().value;
      const gradeRoll = roll5D6().value;

      let stellarClass = getClassFromRoll(classRoll);
      let grade = getGradeFromRoll(gradeRoll);

      stellarClass = constrainCompanionClass(stellarClass, previousStar.class);
      grade = constrainCompanionGrade(grade, previousStar.grade);

      const orbitRoll = roll3D6().value;
      const orbitDistance = getCompanionOrbitDistance(previousStar.class, orbitRoll);

      const companion = createStar(
        stellarClass,
        grade,
        false,
        orbitDistance,
        previousStar.isPrimary ? 'primary' : 'companion'
      );

      companions.push(companion);
      previousStar = companion;

      shouldContinue = existenceRoll === 12;
    } else {
      shouldContinue = false;
    }
  }

  return companions;
}

// =====================
// Main World Generation
// =====================

function generateMainWorld(
  primaryStar: Star,
  _zones: ZoneBoundaries,
  forcedType: WorldType | 'random' = 'random'
): MainWorld {
  let worldType: WorldType;
  let size: number;
  let lesserEarthType: LesserEarthType | undefined;

  if (forcedType !== 'random') {
    worldType = forcedType;
    if (worldType === 'Dwarf') {
      size = Math.floor(Math.random() * 500) + 100;
      lesserEarthType = getLesserEarthType(roll2D6().value).type;
    } else if (worldType === 'Terrestrial') {
      size = Math.floor(Math.random() * 3000) + 2000;
    } else {
      size = Math.floor(Math.random() * 2000) + 6000;
    }
  } else {
    const { dice, keep } = getWorldTypeRoll(primaryStar.class);
    const typeRoll = rollKeep(dice, 6, keep, 'highest', 0).value;
    if (typeRoll <= 7) {
      worldType = 'Dwarf';
      size = Math.floor(Math.random() * 500) + 100;
      lesserEarthType = getLesserEarthType(roll2D6().value).type;
    } else if (typeRoll <= 10) {
      worldType = 'Terrestrial';
      size = Math.floor(Math.random() * 3000) + 2000;
    } else {
      worldType = 'Habitat';
      size = Math.floor(Math.random() * 2000) + 6000;
    }
  }

  const gravityRoll = roll2D6().value;
  let gravity: number;
  let gravityHabitability: number;

  if (worldType === 'Dwarf') {
    const result = getDwarfGravity(gravityRoll);
    gravity = result.gravity;
    gravityHabitability = result.habitability;
  } else {
    const result = getTerrestrialGravity(gravityRoll);
    gravity = result.gravity;
    gravityHabitability = result.habitability;
  }

  const atmoRoll = roll2D6().value;
  const atmoResult = getAtmosphere(atmoRoll);

  const tempModifier = getTemperatureModifier(atmoResult.type);
  const tempRoll = roll2D6().value + tempModifier;
  const tempResult = getTemperature(tempRoll);

  const hazardRoll = roll2D6().value;
  const hazardResult = getHazard(hazardRoll);

  const intensityRoll = roll2D6().value;
  const intensityResult = getHazardIntensity(intensityRoll);

  const bioRoll = roll2D6().value;
  const bioResult = getBiochemicalResources(bioRoll);

  const totalHabitability = gravityHabitability +
    atmoResult.habitability +
    tempResult.habitability +
    hazardResult.habitability +
    intensityResult.habitability +
    bioResult.habitability;

  const position = calculateWorldPosition(atmoResult.type, tempResult.type, primaryStar.luminosity);

  return {
    type: worldType,
    size,
    lesserEarthType,
    gravity,
    radius: Math.round(size * 0.8 * 100) / 100,
    escapeVelocity: Math.round(Math.sqrt(2 * gravity * size * 0.1) * 100) / 100,
    atmosphere: atmoResult.type,
    atmosphereTL: atmoResult.tl,
    temperature: tempResult.type,
    temperatureTL: tempResult.tl,
    hazard: hazardResult.type,
    hazardIntensity: intensityResult.intensity,
    hazardIntensityTL: intensityResult.tl,
    biochemicalResources: bioResult.level,
    habitability: Math.round(totalHabitability * 10) / 10,
    zone: position.zone,
    distanceAU: position.distanceAU,
  };
}

// =====================
// Inhabitant Generation
// =====================

function generateInhabitants(mainWorld: MainWorld, populated: boolean): Inhabitants {
  if (!populated) {
    return {
      populated: false,
      techLevel: 0,
      population: 0,
      wealth: 'Average',
      powerStructure: 'Anarchy',
      development: 'UnderDeveloped',
      sourceOfPower: 'Kratocracy',
      governance: -9,
      starport: { class: 'X', output: 0, hasNavalBase: false, hasScoutBase: false, hasPirateBase: false },
      travelZone: 'Green',
      cultureTraits: [],
    };
  }

  const tlRoll = roll2D6().value;
  const techLevel = getTechLevel(tlRoll);

  // Population fork: natural surface population vs artificial habitat (QA — Hab ≤ 0)
  let population: number;
  let habitatType: string | undefined;

  if (mainWorld.habitability <= 0) {
    // Hab ≤ 0: inhabitants live in an artificial habitat, not on the surface
    const habitatRoll = roll2D6().value;
    const habitatResult = getHabitatSize(habitatRoll);
    population = habitatResult.population;
    habitatType = habitatResult.type;
  } else {
    const popRoll = roll2D6().value;
    population = calculatePopulation(mainWorld.habitability, popRoll);
  }

  const wealthRoll = roll2D6().value;
  const wealth = getWealth(wealthRoll, mainWorld.biochemicalResources);

  const powerRoll = roll2D6().value;
  const powerStructure = getPowerStructure(powerRoll);

  const devRoll = roll2D6().value;
  const devResult = getDevelopment(devRoll);

  const sourceRoll = roll2D6().value;
  const sourceOfPower = getSourceOfPower(sourceRoll);

  const governance = getGovernanceDM(devResult.level, wealth);

  const starportResult = calculateStarport(mainWorld.habitability, techLevel, wealth, devResult.level);
  const starport = {
    class: starportResult.class,
    output: starportResult.output,
    hasNavalBase: rollForBase(starportResult.class, 'naval'),
    hasScoutBase: rollForBase(starportResult.class, 'scout'),
    hasPirateBase: rollForBase(starportResult.class, 'pirate'),
  };

  const zoneResult = determineTravelZone(mainWorld.hazard, mainWorld.hazardIntensity);

  const cultureTraits = generateCultureTraits(2);

  return {
    populated: true,
    habitatType,
    techLevel,
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

// =====================
// Planetary System Generation
// =====================

function generatePlanetarySystem(primaryStar: Star, zones: ZoneBoundaries) {
  const stellarClass = primaryStar.class;

  const disks: PlanetaryBody[] = [];
  let dwarfs: PlanetaryBody[] = [];
  let terrestrials: PlanetaryBody[] = [];
  let ices: PlanetaryBody[] = [];
  const gases: PlanetaryBody[] = [];

  // Generate bodies, passing stellarClass for Adv/Dis modifiers (QA-007)
  const diskCount = getBodyCount('disk', stellarClass);
  for (let i = 0; i < diskCount; i++) {
    disks.push(generateBody('disk', primaryStar, zones));
  }

  const dwarfCount = getBodyCount('dwarf', stellarClass);
  for (let i = 0; i < dwarfCount; i++) {
    dwarfs.push(generateBody('dwarf', primaryStar, zones));
  }

  const terrestrialCount = getBodyCount('terrestrial', stellarClass);
  for (let i = 0; i < terrestrialCount; i++) {
    terrestrials.push(generateBody('terrestrial', primaryStar, zones));
  }

  const iceCount = getBodyCount('ice', stellarClass);
  for (let i = 0; i < iceCount; i++) {
    ices.push(generateBody('ice', primaryStar, zones));
  }

  const gasCount = getBodyCount('gas', stellarClass);
  for (let i = 0; i < gasCount; i++) {
    gases.push(generateBody('gas', primaryStar, zones));
  }

  // Hot Jupiter migration sweep (QA-011):
  // Class III gas in Infernal zone, or Class IV/V gas in Hot zone,
  // clears that zone of all other non-disk bodies.
  const hotJupiterZones = new Set<Zone>();
  for (const gas of gases) {
    if (gas.gasClass === 'III' && gas.zone === 'Infernal') hotJupiterZones.add('Infernal');
    if ((gas.gasClass === 'IV' || gas.gasClass === 'V') && gas.zone === 'Hot') hotJupiterZones.add('Hot');
  }
  if (hotJupiterZones.size > 0) {
    dwarfs = dwarfs.filter(b => !hotJupiterZones.has(b.zone));
    terrestrials = terrestrials.filter(b => !hotJupiterZones.has(b.zone));
    ices = ices.filter(b => !hotJupiterZones.has(b.zone));
    // Optional: roll for one captured rogue per cleared zone (2D6 >= 11)
    for (const zone of hotJupiterZones) {
      if (roll2D6().value >= 11) {
        const rogue = generateBody('dwarf', primaryStar, zones);
        dwarfs.push({ ...rogue, zone });
      }
    }
  }

  // Enforce minimum orbital separation across all bodies (QA-006)
  const allBodies = enforceMinimumSeparation([
    ...disks, ...dwarfs, ...terrestrials, ...ices, ...gases,
  ]);

  return {
    disks:        allBodies.filter(b => b.type === 'disk'),
    dwarfs:       allBodies.filter(b => b.type === 'dwarf'),
    terrestrials: allBodies.filter(b => b.type === 'terrestrial'),
    ices:         allBodies.filter(b => b.type === 'ice'),
    gases:        allBodies.filter(b => b.type === 'gas'),
  };
}

/**
 * After generation, sort all bodies by AU and push any that are too close
 * outward by the minimum separation floor (QA-006).
 * Minimum separations:
 *   - Inner zones (Infernal/Hot/Conservative/Cold): 0.05 AU
 *   - Outer zone: 0.2 AU
 */
function enforceMinimumSeparation(bodies: PlanetaryBody[]): PlanetaryBody[] {
  if (bodies.length === 0) return bodies;
  const sorted = [...bodies].sort((a, b) => a.distanceAU - b.distanceAU);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const isOuter = curr.zone === 'Outer' || prev.zone === 'Outer';
    const minSep = isOuter ? 0.2 : 0.05;
    if (curr.distanceAU - prev.distanceAU < minSep) {
      sorted[i] = {
        ...sorted[i],
        distanceAU: Math.round((prev.distanceAU + minSep) * 100) / 100,
      };
    }
  }
  return sorted;
}

function generateBody(type: BodyType, primaryStar: Star, _zones: ZoneBoundaries): PlanetaryBody {
  const id = uuidv4();
  const sqrtL = Math.sqrt(primaryStar.luminosity);

  let zone: Zone;
  let distanceAU: number;
  let mass: number;
  let gasClass: GasWorldClass | undefined;
  let lesserEarthType: LesserEarthType | undefined;

  switch (type) {
    case 'disk':
      // QA-006: vary disk AU so disks don't all land on the same position
      zone = 'Outer';
      distanceAU = sqrtL * (5 + Math.random() * 15);
      mass = Math.random() * 0.001;
      break;

    case 'dwarf': {
      let dwarfRoll = rollD6();
      while (dwarfRoll === 6) dwarfRoll = rollD6();
      const dwarfZones: Zone[] = ['Infernal', 'Hot', 'Conservative', 'Cold', 'Outer'];
      zone = dwarfZones[dwarfRoll - 1];
      distanceAU = calculateDistanceForZone(zone, sqrtL);
      mass = 0.0001 + Math.random() * 0.001;
      const lesserResult = getLesserEarthType(roll2D6().value);
      lesserEarthType = lesserResult.type;
      break;
    }

    case 'terrestrial': {
      const terrestrialRoll = Math.random();
      if (terrestrialRoll < 0.1) zone = 'Infernal';
      else if (terrestrialRoll < 0.2) zone = 'Hot';
      else if (terrestrialRoll < 0.5) zone = 'Conservative';
      else if (terrestrialRoll < 0.7) zone = 'Cold';
      else zone = 'Outer';
      distanceAU = calculateDistanceForZone(zone, sqrtL);
      mass = 0.5 + Math.random() * 4;
      break;
    }

    case 'ice':
      zone = 'Outer';
      distanceAU = sqrtL * (4.85 + Math.random() * 10);
      mass = 0.1 + Math.random() * 2;
      break;

    case 'gas': {
      const classRoll = roll5D6().value;
      const gasClassResult = getGasWorldClass(classRoll);
      gasClass = gasClassResult as GasWorldClass;

      switch (gasClass) {
        case 'I':
          zone = 'Outer';
          distanceAU = sqrtL * (10 + Math.random() * 20);
          break;
        case 'II': {
          const iiRoll = rollD6();
          zone = iiRoll >= 4 ? 'Conservative' : 'Cold';
          distanceAU = calculateDistanceForZone(zone, sqrtL);
          break;
        }
        case 'III':
          zone = 'Infernal';
          distanceAU = sqrtL * 0.2;
          break;
        case 'IV':
        case 'V':
          zone = 'Hot';
          distanceAU = sqrtL * (0.4 + Math.random() * 0.4);
          break;
        default:
          zone = 'Outer';
          distanceAU = sqrtL * 10;
      }
      mass = 10 + Math.random() * 300;
      break;
    }
  }

  const body: PlanetaryBody = {
    id,
    type,
    mass: Math.round(mass * 10000) / 10000,
    zone,
    distanceAU: Math.round(distanceAU * 100) / 100,
    gasClass,
    lesserEarthType,
  };

  // Calculate physical properties for non-disk bodies (QA-009)
  if (type !== 'disk') {
    const physProps = calculatePhysicalProperties(body.mass, type);
    body.densityGcm3 = physProps.densityGcm3;
    body.radiusKm = physProps.radiusKm;
    body.diameterKm = physProps.diameterKm;
    body.surfaceGravityG = physProps.surfaceGravityG;
    body.escapeVelocityMs = physProps.escapeVelocityMs;
  }

  return body;
}

function calculateDistanceForZone(zone: Zone, sqrtL: number): number {
  switch (zone) {
    case 'Infernal':
      return sqrtL * (0.1 + Math.random() * 0.3);
    case 'Hot':
      return sqrtL * (0.4 + Math.random() * 0.4);
    case 'Conservative':
      return sqrtL * (0.8 + Math.random() * 0.4);
    case 'Cold':
      return sqrtL * (1.2 + Math.random() * 2);
    case 'Outer':
      return sqrtL * (4.85 + Math.random() * 10);
  }
}
