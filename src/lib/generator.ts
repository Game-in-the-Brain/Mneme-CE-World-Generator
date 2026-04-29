import { v4 as uuidv4 } from 'uuid';
import type {
  GeneratorOptions, Inhabitants, MainWorld, PlanetaryBody, Star, StarSystem
} from '../types';
import { CE_PRESET, DEFAULT_DEVELOPMENT_WEIGHTS, DEFAULT_GOV_WEIGHTS, DEFAULT_POWER_WEIGHTS, MNEME_WEALTH_WEIGHTS } from './economicPresets';
import { generateInhabitants } from './generatorInhabitants';
import { generateCompanionStars, generatePrimaryStar } from './generatorStar';
import { generatePlanetarySystem } from './generatorSystem';
import { buildMainWorldFromV2Winner } from './generatorV2';
import { generateMainWorld } from './generatorWorld';
import { runHabitabilityWaterfall, selectMainworld } from './habitabilityPipeline';
import { BUILT_IN_LIFE_PRESETS, getLifePresetById } from './lifePresets';
import { generateLevel2Children } from './moons';
import { buildOrbitTree } from './multiStar';
import { buildRawUdpProfile } from './rawUdp';
import { calculateV2Zones, calculateZoneBoundaries } from './stellarData';


// =====================
// Star System Generator
// =====================

export function generateStarSystem(options?: Partial<GeneratorOptions>): StarSystem {
  const opts: GeneratorOptions = {
    starClass:               options?.starClass               ?? 'random',
    starGrade:               options?.starGrade               ?? 'random',
    mainWorldType:           options?.mainWorldType           ?? 'random',
    populated:               options?.populated               ?? true,
    tlProductivityPreset:    options?.tlProductivityPreset    ?? CE_PRESET,
    developmentWeights:      options?.developmentWeights      ?? options?.tlProductivityPreset?.developmentWeights ?? DEFAULT_DEVELOPMENT_WEIGHTS,
    powerWeights:            options?.powerWeights            ?? options?.tlProductivityPreset?.powerWeights ?? DEFAULT_POWER_WEIGHTS,
    govWeights:              options?.govWeights              ?? options?.tlProductivityPreset?.govWeights ?? DEFAULT_GOV_WEIGHTS,
    wealthWeights:           options?.wealthWeights           ?? options?.tlProductivityPreset?.wealthWeights ?? MNEME_WEALTH_WEIGHTS,
    v2Positioning:           options?.v2Positioning,
    v2MultiStar:             options?.v2MultiStar,
    activeLifeAssumptionsId: options?.activeLifeAssumptionsId,
    allowMegaStructures:     options?.allowMegaStructures,
    allowShipsAtXPort:       options?.allowShipsAtXPort,
    goalStarportMin:         options?.goalStarportMin,
    goalMinPopulation:       options?.goalMinPopulation,
    goalHabitable:           options?.goalHabitable,
  };

  const id = uuidv4();
  const createdAt = Date.now();

  // Generate primary star
  const primaryStar = generatePrimaryStar(opts);

  // Calculate zones based on primary star luminosity
  const zones = calculateZoneBoundaries(primaryStar.luminosity);

  // Generate companion stars
  const companionStars = generateCompanionStars(primaryStar);

  // 260427-02: build hierarchical orbit tree when v2MultiStar is enabled.
  // Wide-only by design; companion separation = 3D3 × heliopause × (1 + e).
  // INRAS untouched — planet generation continues to receive primaryStar only.
  let rootOrbitNode: StarSystem['rootOrbitNode'];
  let multiStarVersion: StarSystem['multiStarVersion'] = 'v1-flat';
  if (opts.v2MultiStar) {
    const heliopauseAU = Math.sqrt(primaryStar.luminosity) * 120;
    rootOrbitNode = buildOrbitTree(primaryStar, companionStars, heliopauseAU);
    // Mirror the tree separations back onto the flat companionStars[] so legacy
    // UI/exports show the new wide-only distances rather than stale REF-003 values.
    overlayTreeSeparationsOntoCompanions(companionStars, rootOrbitNode);
    multiStarVersion = 'v2-tree';
  }

  // Generate planetary system FIRST to determine largest body mass (for Habitat sizing)
  const planetaryResult = generatePlanetarySystem(
    primaryStar, zones, opts.v2Positioning ?? true
  );
  const { disks, dwarfs, terrestrials, ices, gases, largestBodyMass } = planetaryResult;

  // Load active life preset (used in both v1 and v2 paths)
  const lifePreset = getLifePresetById(opts.activeLifeAssumptionsId ?? 'mneme-default')
    ?? BUILT_IN_LIFE_PRESETS[0];

  // Run habitability waterfall on EVERY Dwarf and Terrestrial body
  // regardless of v1/v2 path so all worlds have habitability scores (QA-063)
  const allBodiesForHab = [...disks, ...dwarfs, ...terrestrials, ...ices, ...gases];
  for (const body of allBodiesForHab) {
    if (body.type === 'dwarf' || body.type === 'terrestrial') {
      runHabitabilityWaterfall(body, lifePreset);
    }
  }

  // FR-044: Generate Level 2 children (moons + rings) for all L1 parents
  const allMoons: PlanetaryBody[] = [];
  const allRings: PlanetaryBody[] = [];
  const l1Parents = [...terrestrials, ...ices, ...gases];
  for (const parent of l1Parents) {
    const l2 = generateLevel2Children(parent, primaryStar, lifePreset);
    allMoons.push(...l2.moons);
    allRings.push(...l2.rings);
  }

  let mainWorld: MainWorld;
  let inhabitants: Inhabitants;
  let v2SystemFields: Partial<StarSystem> = {};

  if (opts.v2Positioning) {
    // FR-043: v2 pipeline — system-first generation + competitive mainworld selection
    const allBodies = [...disks, ...dwarfs, ...terrestrials, ...ices, ...gases, ...allMoons];

    // Select mainworld by highest Baseline Habitability (L1 + L2 candidates)
    const selection = selectMainworld(allBodies);

    // Build MainWorld from winner
    const winner = allBodies.find(b => b.id === selection.mainworldId);
    if (winner) {
      mainWorld = buildMainWorldFromV2Winner(winner);
    } else {
      // Absolute fallback: generate a v1-style mainworld
      mainWorld = generateMainWorld(primaryStar, zones, opts.mainWorldType, largestBodyMass, opts.allowMegaStructures);
    }

    // Generate inhabitants (TL applied post-selection)
    inhabitants = generateInhabitants(mainWorld, opts);

    // Populate v2 fields on StarSystem
    const v2Zones = calculateV2Zones(primaryStar.luminosity);
    v2SystemFields = {
      heliopauseAU: v2Zones.heliopauseAU,
      frostLineAU: v2Zones.frostLineAU,
      outerSystemZones: v2Zones.outerSystemZones,
      ejectedBodies: planetaryResult.ejectedBodies,
      consumedBodies: planetaryResult.consumedBodies,
      mainworldId: selection.mainworldId,
      mainworldSelectionLog: {
        candidates: selection.candidates,
        tiebreakerApplied: selection.tiebreakerApplied,
        fallbackTriggered: selection.fallbackTriggered,
        fallbackReason: selection.fallbackReason,
      },
    };
  } else {
    // Legacy v1 pipeline: mainworld-first generation
    mainWorld = generateMainWorld(primaryStar, zones, opts.mainWorldType, largestBodyMass, opts.allowMegaStructures);
    inhabitants = generateInhabitants(mainWorld, opts);
  }

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
    economicPreset: opts.tlProductivityPreset,
    economicPresetLabel: opts.tlProductivityPreset?.label ?? opts.tlProductivityPreset?.name ?? 'Mneme',
    economicPresetSnapshot: opts.tlProductivityPreset ? { ...opts.tlProductivityPreset } : undefined,
    allowShipsAtXPort: opts.allowShipsAtXPort,
    moons: allMoons,
    rings: allRings,
    rootOrbitNode,
    multiStarVersion,
    rawUdpProfile: buildRawUdpProfile({
      id, createdAt, primaryStar, companionStars, zones,
      mainWorld, inhabitants,
      circumstellarDisks: disks,
      dwarfPlanets: dwarfs,
      terrestrialWorlds: terrestrials,
      iceWorlds: ices,
      gasWorlds: gases,
    } as StarSystem),
    ...v2SystemFields,
  };
}

// 260427-02: when v2MultiStar is on, copy the tree's BinaryNode separations back
// onto the flat companionStars[] array so legacy callers (UI, DOCX, CSV) reflect
// the wide-only distances. Walk the left-skewed tree: each BinaryNode's
// secondary leaf corresponds to companions[i] in build order.
function overlayTreeSeparationsOntoCompanions(
  companions: Star[],
  root: StarSystem['rootOrbitNode'],
): void {
  if (!root || root.kind !== 'binary') return;
  // Walk down the primary chain — each step yields one secondary leaf.
  const separations: number[] = [];
  let cursor: typeof root = root;
  while (cursor && cursor.kind === 'binary') {
    separations.unshift(cursor.semiMajorAxisAU);
    if (cursor.primary.kind !== 'binary') break;
    cursor = cursor.primary;
  }
  for (let i = 0; i < companions.length && i < separations.length; i++) {
    companions[i].orbitDistance = separations[i];
  }
}
