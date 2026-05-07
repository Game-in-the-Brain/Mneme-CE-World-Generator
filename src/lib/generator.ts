import { v4 as uuidv4 } from 'uuid';
import type {
  GeneratorOptions, Inhabitants, MainWorld, PlanetaryBody, Star, StarSystem, ZoneBoundaries, ExtraterrestrialLifeAssumptions
} from '../types';
import { CE_PRESET, DEFAULT_DEVELOPMENT_WEIGHTS, DEFAULT_GOV_WEIGHTS, DEFAULT_POWER_WEIGHTS, MNEME_WEALTH_WEIGHTS } from './economicPresets';
import { generateInhabitants } from './generatorInhabitants';
import { generateCompanionStars, generatePrimaryStar } from './generatorStar';
import { generatePlanetarySystem } from './generatorSystem';
import { buildMainWorldFromV2Winner } from './generatorV2';
import { deriveEconomicClassification, getFloorFromClassification } from './economicClassification';
import { calculateStarport } from './worldData';
import { getGdpPerDayForWorld } from './economicPresets';
import { generateMainWorld } from './generatorWorld';
import { runHabitabilityWaterfall, selectMainworld } from './habitabilityPipeline';
import { BUILT_IN_LIFE_PRESETS, getLifePresetById } from './lifePresets';
import { generateLevel2Children } from './moons';
import { buildOrbitTree, buildBarycenterView } from './multiStar';
import { buildRawUdpProfile } from './rawUdp';
import { calculateV2Zones, calculateZoneBoundaries } from './stellarData';
import { computeHillSphere, EM_PER_SOLAR_MASS } from './positioning';


// =====================
// Star System Generator
// =====================

export function generateStarSystem(options?: Partial<GeneratorOptions>): StarSystem {
  const opts: GeneratorOptions = {
    systemPreset:            options?.systemPreset            ?? 'random',
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
    forceHZRelocation:       options?.forceHZRelocation,
    attractiveInnerWorlds:   options?.attractiveInnerWorlds,
  };

  // FRD-Sol: When Sol preset is selected, force G2V star
  if (opts.systemPreset === 'sol') {
    opts.starClass = 'G';
    opts.starGrade = 2;
  }

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
  let barycenterView: StarSystem['barycenterView'];
  if (opts.v2MultiStar) {
    const heliopauseAU = Math.sqrt(primaryStar.luminosity) * 120;
    rootOrbitNode = buildOrbitTree(primaryStar, companionStars, heliopauseAU);
    // Mirror the tree separations back onto the flat companionStars[] so legacy
    // UI/exports show the new wide-only distances rather than stale REF-003 values.
    overlayTreeSeparationsOntoCompanions(companionStars, rootOrbitNode);
    multiStarVersion = 'v2-tree';
    // FRD-067: build the flat 2D barycenter view for TTRPG visualisation.
    if (rootOrbitNode && companionStars.length > 0) {
      barycenterView = buildBarycenterView(rootOrbitNode, [primaryStar, ...companionStars]);
    }
  }

  // Generate planetary system FIRST to determine largest body mass (for Habitat sizing)
  const planetaryResult = generatePlanetarySystem(
    primaryStar, zones, opts.v2Positioning ?? true, opts.attractiveInnerWorlds
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
  let fdrResult: { wasRelocated: boolean; ejectedIds: string[] } = { wasRelocated: false, ejectedIds: [] };

  if (opts.v2Positioning) {
    // FR-043: v2 pipeline — system-first generation + competitive mainworld selection
    const allBodies = [...disks, ...dwarfs, ...terrestrials, ...ices, ...gases, ...allMoons];

    // Select mainworld by highest Baseline Habitability (L1 + L2 candidates)
    const selection = selectMainworld(allBodies);

    // Build MainWorld from winner
    const winner = allBodies.find(b => b.id === selection.mainworldId);
    if (winner) {
      // FR-045: FDR — Forced Displacement to Habitable Zone (gated by toggle)
      if (opts.forceHZRelocation) {
        const starMassEM = primaryStar.mass * EM_PER_SOLAR_MASS;
        fdrResult = applyForcedDisplacementRule(
          winner,
          zones,
          starMassEM,
          planetaryResult,
          allMoons,
          lifePreset
        );
      }

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
        fdrApplied: fdrResult.wasRelocated,
        fdrEjectedIds: fdrResult.ejectedIds,
      },
    };
  } else {
    // Legacy v1 pipeline: mainworld-first generation
    mainWorld = generateMainWorld(primaryStar, zones, opts.mainWorldType, largestBodyMass, opts.allowMegaStructures);
    inhabitants = generateInhabitants(mainWorld, opts);
  }

  const system: StarSystem = {
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
    barycenterView,
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

  // FRD-070: derive economic classification from existing generator outputs
  system.inhabitants.economicClassification = deriveEconomicClassification(system);

  // Rebuild RAW UDP profile so trade codes reflect the new classification
  system.rawUdpProfile = buildRawUdpProfile(system);

  // FRD-070: apply semantic starport floor from economic classification
  const floorFromClass = getFloorFromClassification(
    system.inhabitants.economicClassification,
    system.inhabitants.effectivePopulation ?? system.inhabitants.population,
  );
  if (floorFromClass) {
    const classOrder: Record<string, number> = { X: 0, E: 1, D: 2, C: 3, B: 4, A: 5 };
    const currentOrder = classOrder[system.inhabitants.starport.class] ?? 0;
    const floorOrder = classOrder[floorFromClass] ?? 0;
    if (floorOrder > currentOrder) {
      const gdp = getGdpPerDayForWorld(
        system.inhabitants.techLevel,
        system.inhabitants.development,
        system.inhabitants.wealth,
        system.economicPreset!,
      );
      const weeklyRoll = system.inhabitants.starport.weeklyRoll ?? 10;
      const recalc = calculateStarport(
        system.inhabitants.effectivePopulation ?? system.inhabitants.population,
        system.inhabitants.techLevel,
        system.inhabitants.wealth,
        system.inhabitants.development,
        weeklyRoll,
        gdp,
        floorFromClass,
      );
      system.inhabitants.starport = {
        ...system.inhabitants.starport,
        class: recalc.class,
        pss: recalc.pss,
        rawClass: recalc.rawClass,
        tlCap: recalc.tlCap,
        annualTrade: recalc.annualTrade,
        weeklyBase: recalc.weeklyBase,
        weeklyActivity: recalc.weeklyActivity,
      };
    }
  }

  return system;
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

// =====================
// FR-045: FDR — Forced Displacement to Habitable Zone
// =====================

/**
 * If the highest-habitability body is not in the Conservative zone,
 * relocate it there and eject any L1 occupant whose Hill sphere blocks it.
 */
function applyForcedDisplacementRule(
  winner: PlanetaryBody,
  zones: ZoneBoundaries,
  starMassEM: number,
  planetaryResult: {
    disks: PlanetaryBody[];
    dwarfs: PlanetaryBody[];
    terrestrials: PlanetaryBody[];
    ices: PlanetaryBody[];
    gases: PlanetaryBody[];
    ejectedBodies: PlanetaryBody[];
  },
  moons: PlanetaryBody[],
  lifePreset: ExtraterrestrialLifeAssumptions
): { wasRelocated: boolean; ejectedIds: string[] } {
  if (winner.zone === 'Conservative') {
    return { wasRelocated: false, ejectedIds: [] };
  }

  // Pick a random AU inside the Conservative zone
  const minAU = zones.conservative.min;
  const maxAU = zones.conservative.max;
  const newAU = Math.round((minAU + Math.random() * (maxAU - minAU)) * 100) / 100;

  winner.zone = 'Conservative' as typeof winner.zone;
  winner.distanceAU = newAU;

  // Gather all L1 bodies (excluding the winner itself)
  const l1Bodies = [
    ...planetaryResult.disks,
    ...planetaryResult.dwarfs,
    ...planetaryResult.terrestrials,
    ...planetaryResult.ices,
    ...planetaryResult.gases,
  ];

  // Find any L1 body whose Hill sphere overlaps the winner's new position
  const winnerHill = computeHillSphere(winner.mass, winner.distanceAU, starMassEM);
  const conflicting: PlanetaryBody[] = [];

  for (const other of l1Bodies) {
    if (other.id === winner.id) continue;
    const otherHill = computeHillSphere(other.mass, other.distanceAU, starMassEM);
    const minSep = 4.0 * Math.max(winnerHill, otherHill);
    const sep = Math.abs(winner.distanceAU - other.distanceAU);
    if (sep < minSep) {
      conflicting.push(other);
    }
  }

  // Eject every conflicting occupant
  const ejectedIds: string[] = [];
  for (const body of conflicting) {
    body.wasEjected = true;
    body.ejectionReason = 'saturation';
    planetaryResult.ejectedBodies.push(body);
    ejectedIds.push(body.id);

    // Remove from its home array
    const targetArray =
      body.type === 'disk' ? planetaryResult.disks :
      body.type === 'dwarf' ? planetaryResult.dwarfs :
      body.type === 'terrestrial' ? planetaryResult.terrestrials :
      body.type === 'ice' ? planetaryResult.ices :
      body.type === 'gas' ? planetaryResult.gases : null;

    if (targetArray) {
      const idx = targetArray.findIndex(b => b.id === body.id);
      if (idx >= 0) targetArray.splice(idx, 1);
    }
  }

  // If the winner is a moon, promote it to an independent L1 body
  if (winner.level === 2 || winner.parentId) {
    const moonIdx = moons.findIndex(m => m.id === winner.id);
    if (moonIdx >= 0) moons.splice(moonIdx, 1);

    if (winner.type === 'dwarf') {
      planetaryResult.dwarfs.push(winner);
    } else if (winner.type === 'terrestrial') {
      planetaryResult.terrestrials.push(winner);
    }

    winner.parentId = undefined;
    winner.moonOrbitAU = undefined;
    winner.level = 1;
    winner.orbitLevel = 1;
    winner.wasPromotedFromMoon = true;
    winner.parentDistanceAU = undefined;
  }

  // Re-run habitability waterfall so the score reflects the new zone
  runHabitabilityWaterfall(winner, lifePreset);

  return { wasRelocated: true, ejectedIds };
}
