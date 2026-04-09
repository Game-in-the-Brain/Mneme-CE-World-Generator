import { v4 as uuidv4 } from 'uuid';
import type { 
  StarSystem, Star, MainWorld, Inhabitants, PlanetaryBody,
  StellarClass, StellarGrade, Zone, BodyType, GasWorldClass, LesserEarthType, ZoneBoundaries
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
  getWorldTypeRoll
} from './worldData';

// =====================
// Star System Generator
// =====================

export function generateStarSystem(): StarSystem {
  const id = uuidv4();
  const createdAt = Date.now();
  
  // Generate primary star
  const primaryStar = generatePrimaryStar();
  
  // Calculate zones based on primary star luminosity
  const zones = calculateZoneBoundaries(primaryStar.luminosity);
  
  // Generate companion stars
  const companionStars = generateCompanionStars(primaryStar);
  
  // Generate main world
  const mainWorld = generateMainWorld(primaryStar, zones);
  
  // Generate inhabitants
  const inhabitants = generateInhabitants(mainWorld);
  
  // Generate planetary system
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

function generatePrimaryStar(): Star {
  const classRoll = roll5D6().value;
  const gradeRoll = roll5D6().value;
  
  const stellarClass = getClassFromRoll(classRoll);
  const grade = getGradeFromRoll(gradeRoll);
  
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
  
  // Keep generating companions while we roll 12 or meet target
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
      // Generate companion
      const classRoll = roll5D6().value;
      const gradeRoll = roll5D6().value;
      
      let stellarClass = getClassFromRoll(classRoll);
      let grade = getGradeFromRoll(gradeRoll);
      
      // Apply constraints
      stellarClass = constrainCompanionClass(stellarClass, previousStar.class);
      grade = constrainCompanionGrade(grade, previousStar.grade);
      
      // Calculate orbit
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
      
      // Continue if we rolled 12
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

function generateMainWorld(primaryStar: Star, _zones: ZoneBoundaries): MainWorld {
  // Determine world type based on stellar class
  const { dice, keep } = getWorldTypeRoll(primaryStar.class);
  const typeRoll = rollKeep(dice, 6, keep, 'highest', 0).value;
  
  // For simplicity, we'll generate based on roll
  let worldType: 'Habitat' | 'Dwarf' | 'Terrestrial';
  let size: number;
  let lesserEarthType: LesserEarthType | undefined;
  
  if (typeRoll <= 7) {
    worldType = 'Dwarf';
    size = Math.floor(Math.random() * 500) + 100;
    const lesserResult = getLesserEarthType(roll2D6().value);
    lesserEarthType = lesserResult.type;
  } else if (typeRoll <= 10) {
    worldType = 'Terrestrial';
    size = Math.floor(Math.random() * 3000) + 2000;
  } else {
    worldType = 'Habitat';
    size = Math.floor(Math.random() * 2000) + 6000;
  }
  
  // Generate gravity
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
  
  // Generate atmosphere
  const atmoRoll = roll2D6().value;
  const atmoResult = getAtmosphere(atmoRoll);
  
  // Generate temperature
  const tempModifier = getTemperatureModifier(atmoResult.type);
  const tempRoll = roll2D6().value + tempModifier;
  const tempResult = getTemperature(tempRoll);
  
  // Generate hazard
  const hazardRoll = roll2D6().value;
  const hazardResult = getHazard(hazardRoll);
  
  // Generate hazard intensity
  const intensityRoll = roll2D6().value;
  const intensityResult = getHazardIntensity(intensityRoll);
  
  // Generate biochemical resources
  const bioRoll = roll2D6().value;
  const bioResult = getBiochemicalResources(bioRoll);
  
  // Calculate total habitability
  const totalHabitability = gravityHabitability + 
    atmoResult.habitability + 
    tempResult.habitability + 
    hazardResult.habitability + 
    intensityResult.habitability + 
    bioResult.habitability;
  
  // Calculate position
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

function generateInhabitants(mainWorld: MainWorld): Inhabitants {
  // Tech Level
  const tlRoll = roll2D6().value;
  const techLevel = getTechLevel(tlRoll);
  
  // Population
  const popRoll = roll2D6().value;
  const population = calculatePopulation(mainWorld.habitability, popRoll);
  
  // Wealth
  const wealthRoll = roll2D6().value;
  const wealth = getWealth(wealthRoll, mainWorld.biochemicalResources);
  
  // Power Structure
  const powerRoll = roll2D6().value;
  const powerStructure = getPowerStructure(powerRoll);
  
  // Development
  const devRoll = roll2D6().value;
  const devResult = getDevelopment(devRoll);
  
  // Source of Power
  const sourceRoll = roll2D6().value;
  const sourceOfPower = getSourceOfPower(sourceRoll);
  
  // Governance
  const governance = getGovernanceDM(devResult.level, wealth);
  
  // Starport
  const starportResult = calculateStarport(mainWorld.habitability, techLevel, wealth, devResult.level);
  const starport = {
    class: starportResult.class,
    output: starportResult.output,
    hasNavalBase: rollForBase(starportResult.class, 'naval'),
    hasScoutBase: rollForBase(starportResult.class, 'scout'),
    hasPirateBase: rollForBase(starportResult.class, 'pirate'),
  };
  
  // Travel Zone
  const zoneResult = determineTravelZone(mainWorld.hazard, mainWorld.hazardIntensity);
  
  // Culture Traits
  const cultureTraits = generateCultureTraits(2);
  
  return {
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
  const disks: PlanetaryBody[] = [];
  const dwarfs: PlanetaryBody[] = [];
  const terrestrials: PlanetaryBody[] = [];
  const ices: PlanetaryBody[] = [];
  const gases: PlanetaryBody[] = [];
  
  // Generate circumstellar disks
  const diskCount = getBodyCount('disk');
  for (let i = 0; i < diskCount; i++) {
    disks.push(generateBody('disk', primaryStar, zones));
  }
  
  // Generate dwarf planets
  const dwarfCount = getBodyCount('dwarf');
  for (let i = 0; i < dwarfCount; i++) {
    dwarfs.push(generateBody('dwarf', primaryStar, zones));
  }
  
  // Generate terrestrial worlds
  const terrestrialCount = getBodyCount('terrestrial');
  for (let i = 0; i < terrestrialCount; i++) {
    terrestrials.push(generateBody('terrestrial', primaryStar, zones));
  }
  
  // Generate ice worlds
  const iceCount = getBodyCount('ice');
  for (let i = 0; i < iceCount; i++) {
    ices.push(generateBody('ice', primaryStar, zones));
  }
  
  // Generate gas worlds
  const gasCount = getBodyCount('gas');
  for (let i = 0; i < gasCount; i++) {
    gases.push(generateBody('gas', primaryStar, zones));
  }
  
  return { disks, dwarfs, terrestrials, ices, gases };
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
      zone = 'Outer';
      distanceAU = sqrtL * 5;
      mass = Math.random() * 0.001;
      break;
      
    case 'dwarf':
      // Roll 1D6 (reroll 6): 1=Infernal, 2=Hot, 3=Conservative, 4=Cold, 5=Outer
      let dwarfRoll = rollD6();
      while (dwarfRoll === 6) {
        dwarfRoll = rollD6();
      }
      const dwarfZones: Zone[] = ['Infernal', 'Hot', 'Conservative', 'Cold', 'Outer'];
      zone = dwarfZones[dwarfRoll - 1];
      distanceAU = calculateDistanceForZone(zone, sqrtL);
      mass = 0.0001 + Math.random() * 0.001;
      const lesserResult = getLesserEarthType(roll2D6().value);
      lesserEarthType = lesserResult.type;
      break;
      
    case 'terrestrial':
      // Random zone weighted toward habitable
      const terrestrialRoll = Math.random();
      if (terrestrialRoll < 0.1) zone = 'Infernal';
      else if (terrestrialRoll < 0.2) zone = 'Hot';
      else if (terrestrialRoll < 0.5) zone = 'Conservative';
      else if (terrestrialRoll < 0.7) zone = 'Cold';
      else zone = 'Outer';
      distanceAU = calculateDistanceForZone(zone, sqrtL);
      mass = 0.5 + Math.random() * 4;
      break;
      
    case 'ice':
      zone = 'Outer';
      distanceAU = sqrtL * (4.85 + Math.random() * 10);
      mass = 0.1 + Math.random() * 2;
      break;
      
    case 'gas':
      // Classify gas world
      const classRoll = roll5D6().value;
      const gasClassResult = getGasWorldClass(classRoll);
      gasClass = gasClassResult as GasWorldClass;
      
      // Determine zone based on class
      switch (gasClass) {
        case 'I':
          zone = 'Outer';
          distanceAU = sqrtL * (10 + Math.random() * 20);
          break;
        case 'II':
          const iiRoll = rollD6();
          zone = iiRoll >= 4 ? 'Conservative' : 'Cold';
          distanceAU = calculateDistanceForZone(zone, sqrtL);
          break;
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
  
  return {
    id,
    type,
    mass: Math.round(mass * 1000) / 1000,
    zone,
    distanceAU: Math.round(distanceAU * 100) / 100,
    gasClass,
    lesserEarthType,
  };
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
