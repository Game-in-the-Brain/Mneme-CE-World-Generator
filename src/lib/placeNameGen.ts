import { PlaceGen } from '@gi7b/placegen';
import { loadLcIndex, getLcDistance, distanceToDriftLevel } from '@gi7b/namegen';
import type { StarSystem, PlaceNames } from '../types';

function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  }
  return h;
}

export function getLcOptions(): Array<{ id: string; label: string }> {
  try {
    return loadLcIndex().map(e => ({ id: e.lc_id, label: e.label }));
  } catch {
    return [];
  }
}

export function generatePlaceNames(
  system: StarSystem,
  baseLc: string,
  driftLc: string,
  descriptorMode?: 'clean' | 'descriptive' | 'verbose',
): PlaceNames {
  const allLcs = loadLcIndex();
  const allIds = allLcs.map(e => e.lc_id);

  const resolvedBase = baseLc === 'random'
    ? allIds[hashSeed(system.id) % allIds.length]
    : baseLc;

  const resolvedDrift = driftLc === 'random'
    ? allIds[hashSeed(system.id + 'drift') % allIds.length]
    : driftLc;

  const distance = getLcDistance(resolvedBase, resolvedDrift);
  const driftLevel = distanceToDriftLevel(distance);

  const seed = hashSeed(system.id);

  // FRD-063a: descriptor mode controls how many adjectives are prepended
  const descriptors = descriptorMode === 'clean'
    ? undefined
    : descriptorMode === 'descriptive'
      ? { maxDescriptors: 1 }
      : {}; // verbose — library default (0–2)

  const gen = new PlaceGen({
    forceBaseLc: resolvedBase,
    forceDriftLc: resolvedDrift,
    seed,
    descriptors,
  });

  const systemResult = gen.generateStarSystemName();
  const systemName = systemResult.displayName ?? systemResult.name;

  const bodyNames: Record<string, string> = {};
  const bodies = [
    ...system.terrestrialWorlds,
    ...system.dwarfPlanets,
    ...system.iceWorlds,
    ...system.gasWorlds,
    ...(system.moons ?? []),
  ];

  for (const body of bodies) {
    const result = gen.generateWorldName({ baseLc: resolvedBase, driftLc: resolvedDrift, driftLevel });
    bodyNames[body.id] = result.displayName ?? result.name;
  }

  return { baseLc: resolvedBase, driftLc: resolvedDrift, driftLevel, systemName, bodyNames };
}
