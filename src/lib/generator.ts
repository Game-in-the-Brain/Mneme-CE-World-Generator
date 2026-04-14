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
  getTechLevel, calculatePopulation, getPopTLMod, calculateTotalHabitability,
  getWealth, getPowerStructure, getDevelopment, getSourceOfPower,
  getGovernanceDM, calculateStarport, rollForBase, determineTravelZone,
  generateCultureTraits, POWER_CULTURE_CONFLICTS, getBodyCount, getGasWorldClass, calculateWorldPosition,
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

  // Generate planetary system FIRST to determine largest body mass (for Habitat sizing)
  const { disks, dwarfs, terrestrials, ices, gases, largestBodyMass } = generatePlanetarySystem(primaryStar, zones);

  // Generate main world (Habitats use largestBodyMass if applicable)
  const mainWorld = generateMainWorld(primaryStar, zones, opts.mainWorldType, largestBodyMass);

  // Generate inhabitants
  const inhabitants = generateInhabitants(mainWorld, opts.populated);

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
  forcedType: WorldType | 'random' = 'random',
  largestBodyMass: number = 1.0
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
      // Habitat: size based on largest body mass in system (radius = mass^0.33 × Earth radius)
      const earthRadius = 6371;
      const radiusFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 variation
      size = Math.round(Math.pow(largestBodyMass, 0.33) * earthRadius * radiusFactor);
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
      // Habitat: size based on largest body mass in system (radius = mass^0.33 × Earth radius)
      const earthRadius = 6371;
      const radiusFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 variation
      size = Math.round(Math.pow(largestBodyMass, 0.33) * earthRadius * radiusFactor);
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

  // Generate Tech Level early so it can affect habitability (QA-009 fix)
  const tlRoll = roll2D6().value;
  const techLevel = getTechLevel(tlRoll);

  // Calculate habitability WITH Tech Level modifier (QA-009 fix)
  const totalHabitability = calculateTotalHabitability(
    gravityHabitability,
    atmoResult.habitability,
    tempResult.habitability,
    hazardResult.habitability,
    intensityResult.habitability,
    bioResult.habitability,
    techLevel  // Now includes TL modifier
  );

  const position = calculateWorldPosition(atmoResult.type, tempResult.type, primaryStar.luminosity);

  // Component breakdown for debugging/analysis
  const tlModifier = Math.max(0, Math.min(9, techLevel - 7));
  const habitabilityComponents = {
    gravity: gravityHabitability,
    atmosphere: atmoResult.habitability,
    temperature: tempResult.habitability,
    hazard: hazardResult.habitability,
    hazardIntensity: intensityResult.habitability,
    biochem: bioResult.habitability,
    techLevel: tlModifier,
  };

  return {
    type: worldType,
    size,
    lesserEarthType,
    gravity,
    radius: Math.round(size * 0.5 * 100) / 100,  // radius = diameter / 2
    escapeVelocity: Math.round(Math.sqrt(0.0196 * gravity * size * 0.5) * 100) / 100,  // v = sqrt(2 * g * r) in km/s, where 0.0196 = 2*9.8/1000
    atmosphere: atmoResult.type,
    atmosphereTL: atmoResult.tl,
    temperature: tempResult.type,
    temperatureTL: tempResult.tl,
    hazard: hazardResult.type,
    hazardIntensity: intensityResult.intensity,
    hazardIntensityTL: intensityResult.tl,
    biochemicalResources: bioResult.level,
    techLevel,  // Store TL in mainWorld for use by inhabitants
    habitability: totalHabitability,
    habitabilityComponents,
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
      starport: { class: 'X', pss: 0, rawClass: 'X', tlCap: 'X', annualTrade: 0, weeklyBase: 0, weeklyActivity: 0, hasNavalBase: false, hasScoutBase: false, hasPirateBase: false },
      travelZone: 'Green',
      cultureTraits: [],
    };
  }

  // Use Tech Level from MainWorld (QA-009 fix) — TL affects habitability
  const techLevel = mainWorld.techLevel;

  // EnvHab = habitability without TL display modifier (needed for new population formula)
  const tlDisplayMod = mainWorld.habitabilityComponents?.techLevel ?? Math.max(0, Math.min(9, techLevel - 7));
  const envHab = mainWorld.habitability - tlDisplayMod;

  // Population fork: new formula uses envHab + TLmod lookup table
  // Fork fires when (envHab + TLmod) ≤ 0 — extremely hostile worlds use artificial habitats
  let population: number;
  let habitatType: string | undefined;

  const effectiveHab = envHab + getPopTLMod(techLevel);

  if (effectiveHab <= 0) {
    // Extremely hostile world: inhabitants live in an artificial habitat, not on the surface
    const habitatRoll = roll2D6().value;
    const habitatResult = getHabitatSize(habitatRoll);
    population = habitatResult.population;
    habitatType = habitatResult.type;
  } else {
    const popRoll = roll2D6().value;
    population = calculatePopulation(envHab, techLevel, popRoll);
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

  const weeklyRoll = roll3D6().value;
  const starportResult = calculateStarport(population, techLevel, wealth, devResult.level, weeklyRoll);
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
  };

  const zoneResult = determineTravelZone(mainWorld.hazard, mainWorld.hazardIntensity);

  const cultureExclude = POWER_CULTURE_CONFLICTS[sourceOfPower] ?? [];
  const cultureTraits = generateCultureTraits(2, cultureExclude);

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

// Hill sphere factor — bodies must be separated by at least this multiple of Hill radius
const HILL_FACTOR = 1.5;

// Minimum floor separation regardless of Hill sphere (QA-006)
const MIN_FLOOR_AU_INNER = 0.05;  // Infernal, Hot, Conservative, Cold zones
const MIN_FLOOR_AU_OUTER = 0.15;  // Outer zone

/**
 * Calculate Hill sphere radius in AU for a body.
 * @param a — semi-major axis (AU)
 * @param m — body mass (Earth masses)
 * @param M — star mass (Solar masses)
 */
function hillSphereAU(a: number, m: number, M: number): number {
  // Hill sphere ≈ a * (m / 3M)^(1/3)
  // m is in Earth masses, M is in Solar masses
  // 1 Solar mass = 333,000 Earth masses
  const mSolar = m / 333000; // Convert Earth masses to Solar masses
  const ratio = mSolar / (3 * M);
  if (ratio <= 0) return 0;
  return a * Math.cbrt(ratio);
}

/**
 * Calculate minimum required separation between two bodies.
 */
function minSeparationAU(a1: number, m1: number, a2: number, m2: number, M: number): number {
  const h1 = hillSphereAU(a1, m1, M);
  const h2 = hillSphereAU(a2, m2, M);
  return Math.max(h1, h2) * HILL_FACTOR;
}

/**
 * Apply Hot Jupiter migration: Class III in Infernal, or Class IV/V in Hot,
 * clears that zone of all other non-disk bodies (QA-011).
 */
function applyHotJupiterMigration(
  bodies: PlanetaryBody[]
): { bodies: PlanetaryBody[]; clearedZones: Zone[] } {
  const clearedZones: Zone[] = [];

  // Find hot jupiters: Gas III in Infernal, Gas IV/V in Hot
  const hotJupiters = bodies.filter(b => {
    if (b.type !== 'gas') return false;
    if (b.zone === 'Infernal' && b.gasClass === 'III') return true;
    if (b.zone === 'Hot' && (b.gasClass === 'IV' || b.gasClass === 'V')) return true;
    return false;
  });

  if (hotJupiters.length === 0) return { bodies, clearedZones };

  // Collect zones to clear
  hotJupiters.forEach(hj => {
    if (!clearedZones.includes(hj.zone)) clearedZones.push(hj.zone);
  });

  // Remove all non-disk, non-hot-jupiter bodies from cleared zones
  const filtered = bodies.filter(b => {
    if (b.type === 'disk') return true;
    if (hotJupiters.some(hj => hj.id === b.id)) return true;
    return !clearedZones.includes(b.zone);
  });

  // Roll for one captured rogue per cleared zone (2D6 >= 11)
  for (const zone of clearedZones) {
    const captureRoll = roll2D6().value;
    if (captureRoll >= 11) {
      // Add one small rogue world (0.1-0.5 EM)
      const rogue: PlanetaryBody = {
        id: uuidv4(),
        type: 'dwarf',
        mass: Math.round((0.1 + Math.random() * 0.4) * 10000) / 10000,
        zone,
        distanceAU: 0, // Will be placed by placement algorithm
        lesserEarthType: 'Carbonaceous',
      };
      filtered.push(rogue);
    }
  }

  return { bodies: filtered, clearedZones };
}

/**
 * Resolve spacing conflicts using Hill sphere calculations with minimum floor (QA-006).
 */
function resolveConflicts(
  bodies: PlanetaryBody[],
  starMass: number
): PlanetaryBody[] {
  if (bodies.length === 0) return bodies;
  
  const sorted = [...bodies].sort((a, b) => a.distanceAU - b.distanceAU);
  const resolved: PlanetaryBody[] = [];

  for (const body of sorted) {
    if (resolved.length === 0) {
      resolved.push(body);
      continue;
    }

    // Find the previous body that would create a conflict
    const prev = resolved[resolved.length - 1];
    
    // Calculate minimum required separation
    const isOuter = body.zone === 'Outer' || prev.zone === 'Outer';
    const minFloor = isOuter ? MIN_FLOOR_AU_OUTER : MIN_FLOOR_AU_INNER;
    
    // Hill sphere based separation
    const hillSep = minSeparationAU(
      prev.distanceAU, prev.mass,
      body.distanceAU, body.mass,
      starMass
    );
    
    // Use the larger of Hill separation or floor
    const requiredSep = Math.max(hillSep, minFloor);
    
    const actualSep = body.distanceAU - prev.distanceAU;
    
    if (actualSep < requiredSep) {
      // Push this body outward to meet the separation requirement
      const newAU = Math.round((prev.distanceAU + requiredSep) * 100) / 100;
      resolved.push({ ...body, distanceAU: newAU });
    } else {
      resolved.push(body);
    }
  }

  return resolved;
}

/**
 * Verify spacing and log any violations for debugging.
 */
function verifySpacing(
  bodies: PlanetaryBody[],
  starMass: number
): { violations: number; log: string[] } {
  const sorted = [...bodies].sort((a, b) => a.distanceAU - b.distanceAU);
  const violations: string[] = [];
  let violationCount = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const sep = Math.abs(b.distanceAU - a.distanceAU);
    const isOuter = a.zone === 'Outer' || b.zone === 'Outer';
    const minFloor = isOuter ? MIN_FLOOR_AU_OUTER : MIN_FLOOR_AU_INNER;
    const hillSep = minSeparationAU(a.distanceAU, a.mass, b.distanceAU, b.mass, starMass);
    const minSep = Math.max(hillSep, minFloor);
    
    if (sep < minSep - 0.001) { // Small epsilon for floating point
      violationCount++;
      violations.push(
        `HILL VIOLATION: ${a.type} @ ${a.distanceAU.toFixed(2)} AU and ${b.type} @ ${b.distanceAU.toFixed(2)} AU — sep=${sep.toFixed(4)}, min=${minSep.toFixed(4)} (Hill=${hillSep.toFixed(4)}, floor=${minFloor})`
      );
    }
  }

  // Log violations in dev mode
  if (import.meta.env.DEV && violations.length > 0) {
    console.warn(`[QA-006] ${violationCount} Hill sphere spacing violations:`);
    violations.forEach(v => console.warn('  ' + v));
  }

  return { violations: violationCount, log: violations };
}

function generatePlanetarySystem(primaryStar: Star, zones: ZoneBoundaries) {
  const stellarClass = primaryStar.class;
  const starMass = primaryStar.mass;

  let disks: PlanetaryBody[] = [];
  let dwarfs: PlanetaryBody[] = [];
  let terrestrials: PlanetaryBody[] = [];
  let ices: PlanetaryBody[] = [];
  let gases: PlanetaryBody[] = [];

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

  // Combine all bodies for Hot Jupiter processing
  let allBodies: PlanetaryBody[] = [
    ...disks, ...dwarfs, ...terrestrials, ...ices, ...gases,
  ];

  // Apply Hot Jupiter migration sweep BEFORE spacing enforcement (QA-011)
  const hjResult = applyHotJupiterMigration(allBodies);
  allBodies = hjResult.bodies;

  // Enforce Hill sphere spacing with minimum floor (QA-006)
  allBodies = resolveConflicts(allBodies, starMass);

  // Verify spacing and log violations
  const spacingCheck = verifySpacing(allBodies, starMass);

  // Find largest body mass for Habitat sizing (excluding stars)
  const nonDiskBodies = allBodies.filter(b => b.type !== 'disk');
  const largestBodyMass = nonDiskBodies.length > 0 
    ? Math.max(...nonDiskBodies.map(b => b.mass))
    : 1.0; // Default to 1 EM if only disks exist

  // Log summary in dev mode
  if (import.meta.env.DEV) {
    console.log('[Planetary System] Generated:', {
      total: allBodies.length,
      disks: allBodies.filter(b => b.type === 'disk').length,
      dwarfs: allBodies.filter(b => b.type === 'dwarf').length,
      terrestrials: allBodies.filter(b => b.type === 'terrestrial').length,
      ices: allBodies.filter(b => b.type === 'ice').length,
      gases: allBodies.filter(b => b.type === 'gas').length,
      largestBodyMass: largestBodyMass.toFixed(3) + ' EM',
      hotJupiterCleared: hjResult.clearedZones,
      hillViolations: spacingCheck.violations,
    });
  }

  return {
    disks:        allBodies.filter(b => b.type === 'disk'),
    dwarfs:       allBodies.filter(b => b.type === 'dwarf'),
    terrestrials: allBodies.filter(b => b.type === 'terrestrial'),
    ices:         allBodies.filter(b => b.type === 'ice'),
    gases:        allBodies.filter(b => b.type === 'gas'),
    largestBodyMass,
  };
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
