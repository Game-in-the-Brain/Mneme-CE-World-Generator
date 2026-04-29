import { v4 as uuidv4 } from 'uuid';
import type {
  BodyType, GasWorldClass, LesserEarthType, PlanetaryBody, Star, Zone, ZoneBoundaries
} from '../types';
import { roll2D6, roll3D6, roll5D6, rollD6 } from './dice';
import { calculatePhysicalProperties, recalculatePhysicalProperties } from './physicalProperties';
import { placeBodiesV2 } from './positioning';
import { getBodyCount, getGasWorldClass, getLesserEarthType, rollComposition } from './worldData';


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
  if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV && violations.length > 0) {
    console.warn(`[QA-006] ${violationCount} Hill sphere spacing violations:`);
    violations.forEach(v => console.warn('  ' + v));
  }

  return { violations: violationCount, log: violations };
}

export function generatePlanetarySystem(primaryStar: Star, zones: ZoneBoundaries, useV2: boolean = false) {
  const stellarClass = primaryStar.class;
  const starMass = primaryStar.mass;

  const disks: PlanetaryBody[] = [];
  const dwarfs: PlanetaryBody[] = [];
  const terrestrials: PlanetaryBody[] = [];
  const ices: PlanetaryBody[] = [];
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

  // FR-042: v2 composition — roll for each Dwarf and Terrestrial body
  for (const body of dwarfs) {
    const comp = rollComposition('dwarf', roll3D6().value, roll2D6().value);
    body.composition = comp.composition;
    body.reactivityDM = comp.reactivityDM;
    const phys = recalculatePhysicalProperties(body.mass, comp.densityGcm3);
    body.densityGcm3 = phys.densityGcm3;
    body.radiusKm = phys.radiusKm;
    body.diameterKm = phys.diameterKm;
    body.surfaceGravityG = phys.surfaceGravityG;
    body.escapeVelocityMs = phys.escapeVelocityMs;
  }
  for (const body of terrestrials) {
    const comp = rollComposition('terrestrial', roll3D6().value, roll2D6().value);
    body.composition = comp.composition;
    body.reactivityDM = comp.reactivityDM;
    const phys = recalculatePhysicalProperties(body.mass, comp.densityGcm3);
    body.densityGcm3 = phys.densityGcm3;
    body.radiusKm = phys.radiusKm;
    body.diameterKm = phys.diameterKm;
    body.surfaceGravityG = phys.surfaceGravityG;
    body.escapeVelocityMs = phys.escapeVelocityMs;
  }

  let allBodies: PlanetaryBody[];
  let v2Ejected: PlanetaryBody[] = [];
  let v2Consumed: PlanetaryBody[] = [];

  if (useV2) {
    // FR-042: v2 positioning system
    const v2Result = placeBodiesV2(disks, dwarfs, terrestrials, ices, gases, primaryStar, zones);
    allBodies = v2Result.placedBodies;
    v2Ejected = v2Result.ejectedBodies;
    v2Consumed = v2Result.consumedBodies;

    if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) {
      console.log('[Planetary System V2] Generated:', {
        total: allBodies.length,
        disks: allBodies.filter(b => b.type === 'disk').length,
        dwarfs: allBodies.filter(b => b.type === 'dwarf').length,
        terrestrials: allBodies.filter(b => b.type === 'terrestrial').length,
        ices: allBodies.filter(b => b.type === 'ice').length,
        gases: allBodies.filter(b => b.type === 'gas').length,
        ejected: v2Ejected.length,
        consumed: v2Consumed.length,
      });
    }
  } else {
    // Legacy positioning
    allBodies = [
      ...disks, ...dwarfs, ...terrestrials, ...ices, ...gases,
    ];

    // Apply Hot Jupiter migration sweep BEFORE spacing enforcement (QA-011)
    const hjResult = applyHotJupiterMigration(allBodies);
    allBodies = hjResult.bodies;

    // Enforce Hill sphere spacing with minimum floor (QA-006)
    allBodies = resolveConflicts(allBodies, starMass);

    // Verify spacing and log violations
    const spacingCheck = verifySpacing(allBodies, starMass);

    if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) {
      console.log('[Planetary System] Generated:', {
        total: allBodies.length,
        disks: allBodies.filter(b => b.type === 'disk').length,
        dwarfs: allBodies.filter(b => b.type === 'dwarf').length,
        terrestrials: allBodies.filter(b => b.type === 'terrestrial').length,
        ices: allBodies.filter(b => b.type === 'ice').length,
        gases: allBodies.filter(b => b.type === 'gas').length,
        hotJupiterCleared: hjResult.clearedZones,
        hillViolations: spacingCheck.violations,
      });
    }
  }

  // Find largest body mass for Habitat sizing (excluding stars)
  const nonDiskBodies = allBodies.filter(b => b.type !== 'disk');
  const largestBodyMass = nonDiskBodies.length > 0
    ? Math.max(...nonDiskBodies.map(b => b.mass))
    : 1.0; // Default to 1 EM if only disks exist

  return {
    disks:        allBodies.filter(b => b.type === 'disk'),
    dwarfs:       allBodies.filter(b => b.type === 'dwarf'),
    terrestrials: allBodies.filter(b => b.type === 'terrestrial'),
    ices:         allBodies.filter(b => b.type === 'ice'),
    gases:        allBodies.filter(b => b.type === 'gas'),
    largestBodyMass,
    ejectedBodies: v2Ejected,
    consumedBodies: v2Consumed,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateBody(type: BodyType, primaryStar: Star, _zones: ZoneBoundaries): PlanetaryBody {
  const id = uuidv4();
  const sqrtL = Math.sqrt(primaryStar.luminosity);

  let zone: Zone = 'Outer';
  let distanceAU = 0;
  let mass = 0;
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

export function calculateDistanceForZone(zone: Zone, sqrtL: number): number {
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