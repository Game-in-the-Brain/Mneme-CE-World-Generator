// =====================
// Name Generation Test — generates N systems and reports name failures
// =====================
//
// Usage:
//   npx esbuild scripts/name-test.ts --bundle --platform=node --format=cjs --outfile=scripts/.dist/name-test.cjs --define:import.meta.env.DEV=false --define:import.meta.env.PROD=true --log-level=warning && node scripts/.dist/name-test.cjs

import { generateStarSystem } from '../src/lib/generator';
import { generatePlaceNames, getLcOptions } from '../src/lib/placeNameGen';
import { preloadNpfData } from '../src/lib/npf-loader';
import type { StarSystem, PlaceNames } from '../src/types';

const COUNT = 500;

interface NameFailure {
  systemId: string;
  kind: 'empty-system-name' | 'empty-body-name' | 'missing-body-name' | 'empty-companion-name' | 'exception';
  detail: string;
}

function testSystem(system: StarSystem, baseLc: string, driftLc: string): { names: PlaceNames | null; failures: NameFailure[] } {
  const failures: NameFailure[] = [];
  let names: PlaceNames | null = null;

  try {
    names = generatePlaceNames(system, baseLc, driftLc, 'descriptive');
  } catch (err) {
    failures.push({
      systemId: system.id,
      kind: 'exception',
      detail: `generatePlaceNames threw: ${err instanceof Error ? err.message : String(err)}`,
    });
    return { names: null, failures };
  }

  if (!names.systemName || names.systemName.trim() === '') {
    failures.push({ systemId: system.id, kind: 'empty-system-name', detail: `base=${names.baseLc} drift=${names.driftLc}` });
  } else if (names.systemName.trim().length < 2) {
    failures.push({ systemId: system.id, kind: 'empty-system-name', detail: `Too-short systemName="${names.systemName}" base=${names.baseLc} drift=${names.driftLc}` });
  }

  const allBodies = [
    ...system.terrestrialWorlds,
    ...system.dwarfPlanets,
    ...system.iceWorlds,
    ...system.gasWorlds,
    ...(system.moons ?? []),
    ...system.circumstellarDisks,
  ];
  const mainworldId = `${system.id}-mainworld`;
  const expectedIds = [...allBodies.map(b => b.id), mainworldId];

  for (const id of expectedIds) {
    if (!(id in names.bodyNames)) {
      failures.push({ systemId: system.id, kind: 'missing-body-name', detail: `Missing bodyId=${id}` });
    } else if (!names.bodyNames[id] || names.bodyNames[id].trim() === '') {
      failures.push({ systemId: system.id, kind: 'empty-body-name', detail: `Empty bodyId=${id}` });
    }
  }

  for (const star of system.companionStars) {
    if (!names.companionNames?.[star.id] || names.companionNames[star.id].trim() === '') {
      failures.push({ systemId: system.id, kind: 'empty-companion-name', detail: `Empty companion starId=${star.id}` });
    }
  }

  return { names, failures };
}

function runTest(label: string, count: number, baseLc: string, driftLc: string): void {
  console.log(`\n=== ${label} (n=${count}, base=${baseLc}, drift=${driftLc}) ===`);
  const failures: NameFailure[] = [];
  let totalBodies = 0;
  let totalCompanions = 0;
  let totalMoons = 0;

  for (let i = 0; i < count; i++) {
    const sys = generateStarSystem({ populated: true, v2Positioning: true });
    totalBodies += sys.terrestrialWorlds.length + sys.dwarfPlanets.length + sys.iceWorlds.length + sys.gasWorlds.length + sys.circumstellarDisks.length;
    totalMoons += sys.moons?.length ?? 0;
    totalCompanions += sys.companionStars.length;

    const result = testSystem(sys, baseLc, driftLc);
    failures.push(...result.failures);
  }

  const totalExpectedNames = count + totalBodies + totalMoons + totalCompanions + count; // count = mainworlds
  const failByKind: Record<string, number> = {};
  for (const f of failures) {
    failByKind[f.kind] = (failByKind[f.kind] ?? 0) + 1;
  }

  console.log(`Total systems: ${count}`);
  console.log(`Total bodies (L1+L2+disk): ${totalBodies + totalMoons}`);
  console.log(`Total companions: ${totalCompanions}`);
  console.log(`Total expected names: ${totalExpectedNames}`);
  console.log(`Total failures: ${failures.length} (${((failures.length / totalExpectedNames) * 100).toFixed(3)}%)`);

  for (const kind of Object.keys(failByKind).sort()) {
    console.log(`  ${kind}: ${failByKind[kind]}`);
  }

  if (failures.length > 0) {
    console.log('\nSample failures:');
    for (const f of failures.slice(0, 10)) {
      console.log(`  [${f.kind}] ${f.detail}`);
    }
    if (failures.length > 10) console.log(`  ... and ${failures.length - 10} more`);
  }
}

function runSampleTest(count: number, baseLc: string, driftLc: string): void {
  console.log(`\n=== Sample names (${count} systems, base=${baseLc}, drift=${driftLc}) ===`);
  for (let i = 0; i < count; i++) {
    const sys = generateStarSystem({ populated: true, v2Positioning: true });
    const names = generatePlaceNames(sys, baseLc, driftLc, 'descriptive');
    const bodyIds = Object.keys(names.bodyNames);
    const sampleBodies = bodyIds.slice(0, 3).map(id => names.bodyNames[id]);
    console.log(`  System: ${names.systemName}  |  Bodies: ${sampleBodies.join(', ')}  |  LC: ${names.baseLc}→${names.driftLc} (L${names.driftLevel})`);
  }
}

async function main(): Promise<void> {
  await preloadNpfData();
  const lcOptions = getLcOptions();
  const lcIds = lcOptions.map(l => l.id);

  // Test 1: Random / Random
  runTest('Random base + Random drift', COUNT, 'random', 'random');

  // Test 2: Specific culture pairs
  const testPairs: Array<[string, string]> = [
    ['en-us', 'en-gb'],
    ['ja-jp', 'zh-cn'],
    ['ar-sa', 'en-us'],
    ['de-de', 'fr-fr'],
    ['tl-ph', 'en-us'],
  ];

  for (const [base, drift] of testPairs) {
    if (lcIds.includes(base) && lcIds.includes(drift)) {
      runTest(`${base} + ${drift}`, 50, base, drift);
    }
  }

  // Test 3: Same culture (no drift)
  runTest('Same culture (en-us)', 50, 'en-us', 'en-us');

  // Sample output for visual inspection
  runSampleTest(5, 'random', 'random');
  runSampleTest(5, 'ja-jp', 'en-us');
  runSampleTest(5, 'ar-sa', 'de-de');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
