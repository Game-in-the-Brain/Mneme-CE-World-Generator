import { v4 as uuidv4 } from 'uuid';
import type { StarSystem, PlanetaryBody, BodyType, GasWorldClass, Zone, StellarClass, StellarGrade } from '../types';
import { generateBody } from './generatorSystem';
import { selectMainworld, runHabitabilityWaterfall } from './habitabilityPipeline';
import {
  getStellarMass,
  getStellarLuminosity,
  STAR_COLORS,
  calculateZoneBoundaries,
  calculateV2Zones,
  getZoneForDistance,
} from './stellarData';
import { MNEME_DEFAULT_LIFE_PRESET } from './lifePresets';

const MAX_BODIES_PER_ZONE = 3;

const ZONE_ORDER: Zone[] = ['Infernal', 'Hot', 'Conservative', 'Cold', 'Outer'];

function getAllL1Bodies(system: StarSystem): PlanetaryBody[] {
  return [
    ...system.circumstellarDisks.filter(b => !b.parentId),
    ...system.dwarfPlanets.filter(b => !b.parentId),
    ...system.terrestrialWorlds.filter(b => !b.parentId),
    ...system.iceWorlds.filter(b => !b.parentId),
    ...system.gasWorlds.filter(b => !b.parentId),
  ];
}

function countBodiesInZone(system: StarSystem, zone: Zone): number {
  return getAllL1Bodies(system).filter(b => b.zone === zone).length;
}

function findAvailableZone(
  system: StarSystem,
  preferredZone: Zone,
): Zone | null {
  const startIndex = ZONE_ORDER.indexOf(preferredZone);
  for (let i = startIndex; i < ZONE_ORDER.length; i++) {
    const zone = ZONE_ORDER[i];
    if (countBodiesInZone(system, zone) < MAX_BODIES_PER_ZONE) {
      return zone;
    }
  }
  // If no zone found outward, try inward
  for (let i = startIndex - 1; i >= 0; i--) {
    const zone = ZONE_ORDER[i];
    if (countBodiesInZone(system, zone) < MAX_BODIES_PER_ZONE) {
      return zone;
    }
  }
  return null;
}

function getZoneMidpoint(system: StarSystem, zone: Zone): number {
  const boundaries = system.zones;
  switch (zone) {
    case 'Infernal':
      return boundaries.infernal.max / 2;
    case 'Hot':
      return (boundaries.hot.min + boundaries.hot.max) / 2;
    case 'Conservative':
      return (boundaries.conservative.min + boundaries.conservative.max) / 2;
    case 'Cold':
      return (boundaries.cold.min + boundaries.cold.max) / 2;
    case 'Outer':
      return boundaries.outer.min + 5; // arbitrary offset into outer zone
  }
}

function getPreferredZoneForType(type: BodyType, gasClass?: GasWorldClass): Zone {
  switch (type) {
    case 'disk':
    case 'ice':
      return 'Outer';
    case 'dwarf':
      return 'Conservative';
    case 'terrestrial':
      return 'Conservative';
    case 'gas':
      switch (gasClass) {
        case 'I':
          return 'Outer';
        case 'II':
          return 'Cold';
        case 'III':
          return 'Infernal';
        case 'IV':
        case 'V':
          return 'Hot';
        default:
          return 'Outer';
      }
    default:
      return 'Outer';
  }
}

function checkHSR(body: PlanetaryBody): string | undefined {
  // H: Body type vs zone appropriateness
  if (body.type === 'gas' && body.zone === 'Infernal' && body.gasClass !== 'III') {
    return 'Gas giant in Infernal zone without Class III (Hot Jupiter) configuration';
  }
  if (body.type === 'ice' && body.zone !== 'Outer' && body.zone !== 'Cold') {
    return 'Ice world placed unusually close to star';
  }

  // S: Very close to star (simplified Roche limit check)
  if (body.distanceAU < 0.05) {
    return 'Body orbit is extremely close to star — may be within Roche limit';
  }

  // R: High radiation zones
  if (body.zone === 'Infernal') {
    return 'Infernal zone — extreme radiation and stellar wind';
  }

  return undefined;
}

/**
 * Add a new planetary body to the system.
 * Returns updated system and optional HSR warning.
 */
export function addBodyToSystem(
  system: StarSystem,
  bodyType: BodyType | 'random',
  gasClass?: GasWorldClass,
): { system: StarSystem; warning?: string } {
  const type: BodyType = bodyType === 'random'
    ? (['dwarf', 'terrestrial', 'ice', 'gas'] as BodyType[])[Math.floor(Math.random() * 4)]
    : bodyType;

  const preferredZone = getPreferredZoneForType(type, gasClass);
  const targetZone = findAvailableZone(system, preferredZone);

  if (!targetZone) {
    return { system, warning: 'All orbital zones occupied — delete a world to open a slot.' };
  }

  // Generate base body
  const newBody = generateBody(type, system.primaryStar, system.zones);

  // Override zone and distance
  newBody.zone = targetZone;
  newBody.distanceAU = Math.round(getZoneMidpoint(system, targetZone) * 100) / 100;
  newBody.id = uuidv4();

  // Override gas class if specified
  if (type === 'gas' && gasClass) {
    newBody.gasClass = gasClass;
  }

  // Add to appropriate array
  const updated: StarSystem = { ...system };
  switch (type) {
    case 'disk':
      updated.circumstellarDisks = [...updated.circumstellarDisks, newBody];
      break;
    case 'dwarf':
      updated.dwarfPlanets = [...updated.dwarfPlanets, newBody];
      break;
    case 'terrestrial':
      updated.terrestrialWorlds = [...updated.terrestrialWorlds, newBody];
      break;
    case 'ice':
      updated.iceWorlds = [...updated.iceWorlds, newBody];
      break;
    case 'gas':
      updated.gasWorlds = [...updated.gasWorlds, newBody];
      break;
  }

  const warning = checkHSR(newBody);

  // Re-evaluate mainworld if new body is a candidate type
  if (type === 'dwarf' || type === 'terrestrial') {
    const allL1 = getAllL1Bodies(updated);
    const candidates = allL1.filter(b => b.baselineHabitability !== undefined);
    if (candidates.length > 0) {
      const result = selectMainworld(allL1);
      if (result.mainworldId) {
        // Clear previous winner
        allL1.forEach(b => { b.wasSelectedAsMainworld = false; });
        const winner = allL1.find(b => b.id === result.mainworldId);
        if (winner) winner.wasSelectedAsMainworld = true;
      }
    }
  }

  return { system: updated, warning };
}

/**
 * Delete bodies from the system by ID.
 * Returns updated system and whether the mainworld was deleted.
 */
export function deleteBodiesFromSystem(
  system: StarSystem,
  bodyIdsToDelete: string[],
): { system: StarSystem; mainworldDeleted: boolean } {
  const ids = new Set(bodyIdsToDelete);
  const updated: StarSystem = { ...system };

  // Find mainworld body ID
  const mainworldBody = getAllL1Bodies(system).find(b => b.wasSelectedAsMainworld);
  const mainworldDeleted = mainworldBody ? ids.has(mainworldBody.id) : false;

  // Helper to filter out deleted bodies and their children
  function filterArray(bodies: PlanetaryBody[]): PlanetaryBody[] {
    return bodies.filter(b => {
      if (ids.has(b.id)) return false;
      if (b.parentId && ids.has(b.parentId)) return false;
      return true;
    });
  }

  updated.circumstellarDisks = filterArray(updated.circumstellarDisks);
  updated.dwarfPlanets = filterArray(updated.dwarfPlanets);
  updated.terrestrialWorlds = filterArray(updated.terrestrialWorlds);
  updated.iceWorlds = filterArray(updated.iceWorlds);
  updated.gasWorlds = filterArray(updated.gasWorlds);
  updated.moons = updated.moons ? filterArray(updated.moons) : undefined;
  updated.rings = updated.rings ? filterArray(updated.rings) : undefined;

  if (mainworldDeleted) {
    // Mark system as unpopulated; keep placeholder mainWorld data
    updated.inhabitants = {
      ...updated.inhabitants,
      populated: false,
      population: 0,
    };
  } else {
    // Re-evaluate mainworld from remaining candidates
    const allL1 = getAllL1Bodies(updated);
    const candidates = allL1.filter(b => b.baselineHabitability !== undefined);
    if (candidates.length > 0) {
      const result = selectMainworld(allL1);
      if (result.mainworldId) {
        allL1.forEach(b => { b.wasSelectedAsMainworld = false; });
        const winner = allL1.find(b => b.id === result.mainworldId);
        if (winner) winner.wasSelectedAsMainworld = true;
      }
    }
  }

  return { system: updated, mainworldDeleted };
}

export interface BodyDiceLocks {
  worldType?: boolean;
  zone?: boolean;
  mass?: boolean;
}

/**
 * Re-roll a body's unlocked fields.
 * Locked fields preserve their current values.
 */
/**
 * Reposition a body to the next inner or outer zone.
 * Returns updated system and optional warning/error.
 */
export function repositionBody(
  system: StarSystem,
  bodyId: string,
  direction: 'in' | 'out',
): { system: StarSystem; warning?: string; error?: string } {
  const updated: StarSystem = { ...system };

  // Find body in all arrays
  let body: PlanetaryBody | undefined;
  let arrayKey: keyof Pick<StarSystem, 'circumstellarDisks' | 'dwarfPlanets' | 'terrestrialWorlds' | 'iceWorlds' | 'gasWorlds'> | undefined;

  for (const key of ['circumstellarDisks', 'dwarfPlanets', 'terrestrialWorlds', 'iceWorlds', 'gasWorlds'] as const) {
    const found = updated[key].find(b => b.id === bodyId);
    if (found) {
      body = found;
      arrayKey = key;
      break;
    }
  }

  if (!body || !arrayKey) {
    return { system: updated, error: 'Body not found' };
  }

  const currentIndex = ZONE_ORDER.indexOf(body.zone);
  if (currentIndex < 0) {
    return { system: updated, error: 'Invalid zone' };
  }

  const targetIndex = direction === 'in' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= ZONE_ORDER.length) {
    return { system: updated, error: `Cannot move ${direction === 'in' ? 'inward' : 'outward'} — already at ${direction === 'in' ? 'innermost' : 'outermost'} zone` };
  }

  const targetZone = ZONE_ORDER[targetIndex];

  // Check zone capacity (exclude the body itself from count)
  const bodiesInTarget = getAllL1Bodies(updated).filter(b => b.id !== bodyId && b.zone === targetZone).length;
  if (bodiesInTarget >= MAX_BODIES_PER_ZONE) {
    return { system: updated, error: `${targetZone} zone is full (max ${MAX_BODIES_PER_ZONE} bodies)` };
  }

  body.zone = targetZone;
  body.distanceAU = Math.round(getZoneMidpoint(updated, targetZone) * 100) / 100;

  const warning = checkHSR(body);

  // Re-evaluate mainworld if body is a candidate type
  if (body.type === 'dwarf' || body.type === 'terrestrial') {
    const allL1 = getAllL1Bodies(updated);
    const candidates = allL1.filter(b => b.baselineHabitability !== undefined);
    if (candidates.length > 0) {
      const result = selectMainworld(allL1);
      if (result.mainworldId) {
        allL1.forEach(b => { b.wasSelectedAsMainworld = false; });
        const winner = allL1.find(b => b.id === result.mainworldId);
        if (winner) winner.wasSelectedAsMainworld = true;
      }
    }
  }

  return { system: updated, warning };
}

export function rerollBody(
  system: StarSystem,
  bodyId: string,
  locks: BodyDiceLocks,
): StarSystem {
  const updated: StarSystem = { ...system };

  // Find body in all arrays
  let oldBody: PlanetaryBody | undefined;
  let arrayKey: keyof Pick<StarSystem, 'circumstellarDisks' | 'dwarfPlanets' | 'terrestrialWorlds' | 'iceWorlds' | 'gasWorlds'> | undefined;

  for (const key of ['circumstellarDisks', 'dwarfPlanets', 'terrestrialWorlds', 'iceWorlds', 'gasWorlds'] as const) {
    const found = updated[key].find(b => b.id === bodyId);
    if (found) {
      oldBody = found;
      arrayKey = key;
      break;
    }
  }

  if (!oldBody || !arrayKey) return updated;

  // Generate fresh body
  const newBody = generateBody(oldBody.type, updated.primaryStar, updated.zones);
  newBody.id = oldBody.id;

  // Apply locks
  if (locks.worldType) {
    newBody.type = oldBody.type;
  }
  if (locks.zone) {
    newBody.zone = oldBody.zone;
    newBody.distanceAU = oldBody.distanceAU;
  }
  if (locks.mass) {
    newBody.mass = oldBody.mass;
    newBody.densityGcm3 = oldBody.densityGcm3;
    newBody.radiusKm = oldBody.radiusKm;
    newBody.diameterKm = oldBody.diameterKm;
    newBody.surfaceGravityG = oldBody.surfaceGravityG;
    newBody.escapeVelocityMs = oldBody.escapeVelocityMs;
  }

  // Copy annotation-related fields
  if (oldBody.parentId) newBody.parentId = oldBody.parentId;
  if (oldBody.moonOrbitAU) newBody.moonOrbitAU = oldBody.moonOrbitAU;

  // Replace in array
  updated[arrayKey] = updated[arrayKey].map(b => b.id === bodyId ? newBody : b);

  return updated;
}

/**
 * Update the primary star's class and grade, recalculating all derived properties.
 * Reassigns body zones based on current distances and new zone boundaries.
 * Re-runs habitability waterfall and re-selects mainworld.
 */
export function updatePrimaryStar(
  system: StarSystem,
  stellarClass: StellarClass,
  grade: StellarGrade,
): { system: StarSystem; warnings: string[] } {
  const updated: StarSystem = { ...system };
  const warnings: string[] = [];

  // Update star properties
  updated.primaryStar = {
    ...updated.primaryStar,
    class: stellarClass,
    grade,
    mass: getStellarMass(stellarClass, grade),
    luminosity: getStellarLuminosity(stellarClass, grade),
    color: STAR_COLORS[stellarClass],
  };

  // Recalculate zone boundaries
  updated.zones = calculateZoneBoundaries(updated.primaryStar.luminosity);

  // Recalculate V2 zones
  const v2Zones = calculateV2Zones(updated.primaryStar.luminosity);
  updated.heliopauseAU = v2Zones.heliopauseAU;
  updated.frostLineAU = v2Zones.frostLineAU;
  updated.outerSystemZones = v2Zones.outerSystemZones;

  // Reassign zones for all L1 bodies based on current distances
  const allL1 = getAllL1Bodies(updated);
  const zoneCounts: Record<Zone, number> = { Infernal: 0, Hot: 0, Conservative: 0, Cold: 0, Outer: 0 };

  for (const body of allL1) {
    const newZone = getZoneForDistance(body.distanceAU, updated.zones);
    if (body.zone !== newZone) {
      warnings.push(`${body.type} moved from ${body.zone} to ${newZone}`);
      body.zone = newZone;
    }
    zoneCounts[newZone]++;
  }

  // Check zone capacity
  for (const [zone, count] of Object.entries(zoneCounts)) {
    if (count > MAX_BODIES_PER_ZONE) {
      warnings.push(`${zone} zone exceeds capacity (${count}/${MAX_BODIES_PER_ZONE})`);
    }
  }

  // Re-run habitability waterfall for all dwarf/terrestrial bodies
  for (const body of allL1) {
    if (body.type === 'dwarf' || body.type === 'terrestrial') {
      const parent = body.parentId
        ? allL1.find(b => b.id === body.parentId)
        : undefined;
      runHabitabilityWaterfall(body, MNEME_DEFAULT_LIFE_PRESET, parent);
    }
  }

  // Re-evaluate mainworld
  const candidates = allL1.filter(b => b.baselineHabitability !== undefined);
  if (candidates.length > 0) {
    const result = selectMainworld(allL1);
    if (result.mainworldId) {
      allL1.forEach(b => { b.wasSelectedAsMainworld = false; });
      const winner = allL1.find(b => b.id === result.mainworldId);
      if (winner) winner.wasSelectedAsMainworld = true;
    }
  }

  // Clear raw UDP profile so it recomputes on demand
  updated.rawUdpProfile = undefined;

  return { system: updated, warnings };
}
