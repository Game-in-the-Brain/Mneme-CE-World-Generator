import { v4 as uuidv4 } from 'uuid';
import type { StarSystem, PlanetaryBody, BodyType, GasWorldClass, Zone } from '../types';
import { generateBody } from './generator';
import { selectMainworld } from './habitabilityPipeline';

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
