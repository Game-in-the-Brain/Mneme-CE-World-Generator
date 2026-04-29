// =====================
// Batch Runner — generates N systems and emits statistics + per-world detail
// =====================
//
// Usage (via npm run batch):
//   npm run batch -- --count 1000 --v2multistar --report multi-star
//   npm run batch -- --count 500 --report habitability
//   npm run batch -- --count 100 --report all --details out/details.jsonl
//
// Reports:
//   multi-star    — 260427-02 §7 validation targets (S-type cap clears heliopause, etc.)
//   habitability  — 260427-01 §6 + 260417-03 §9 targets (HZ mainworld share, hazard rates, etc.)
//   summary       — overall system stats: counts, distributions, means
//   all           — all of the above
//
// Flags:
//   --count <N>          number of systems to generate (default 100)
//   --v2multistar        enable v2MultiStar (default off)
//   --v2positioning      enable v2Positioning (default on; set --no-v2positioning to disable)
//   --report <name>      multi-star | habitability | summary | all  (default summary)
//   --details <file>     write per-world detail JSONL to file
//   --seed <N>            seed Math.random — note: project uses Math.random directly so this is a no-op for now (logged for future)

import type { StarSystem, BinaryNode, OrbitNode, PlanetaryBody, ZoneId } from '../src/types';
import { generateStarSystem } from '../src/lib/generator';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

interface Args {
  count: number;
  v2MultiStar: boolean;
  v2Positioning: boolean;
  report: 'multi-star' | 'habitability' | 'summary' | 'all';
  details?: string;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { count: 100, v2MultiStar: false, v2Positioning: true, report: 'summary' };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--count') a.count = parseInt(argv[++i], 10);
    else if (flag === '--v2multistar') a.v2MultiStar = true;
    else if (flag === '--no-v2multistar') a.v2MultiStar = false;
    else if (flag === '--v2positioning') a.v2Positioning = true;
    else if (flag === '--no-v2positioning') a.v2Positioning = false;
    else if (flag === '--report') a.report = argv[++i] as Args['report'];
    else if (flag === '--details') a.details = argv[++i];
  }
  return a;
}

// ---- statistics helpers ----

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length;
}
function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[m - 1] + sorted[m]) / 2 : sorted[m];
}
function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map(x => (x - m) ** 2)));
}
function fmt(n: number, dp = 2): string {
  return n.toFixed(dp);
}
function pct(n: number, total: number): string {
  return total === 0 ? '0.0%' : ((n / total) * 100).toFixed(1) + '%';
}

// ---- collectors ----

interface MultiStarStats {
  systemsWithCompanions: number;
  totalCompanions: number;
  separationsByPrimaryClass: Record<string, number[]>;
  eccentricities: number[];
  sTypeCapsAU: number[];
  heliopauseAUValues: number[];
  // validation
  cycleViolations_sTypeIntoHeliopause: number;
  cycleViolations_aOuterTooSmall: number;
}

interface HabitabilityStats {
  systems: number;
  mainworldZoneCounts: Record<string, number>;
  hazardCounts: Record<string, number>;
  infernalToxicPlus: number;
  infernalCount: number;
  hzWithBiosphereB2Plus: number;
  hzCount: number;
  baselineScores: number[];
  zoneHazardDMByZone: Record<string, number[]>;
  hzBiosphereBonusFires: number;
  hzBiosphereBonusEligible: number;
}

// ---- per-system extraction ----

function* walkBinaries(node: OrbitNode | undefined): Generator<BinaryNode> {
  if (!node || node.kind !== 'binary') return;
  yield node;
  yield* walkBinaries(node.primary);
  yield* walkBinaries(node.secondary);
}

function collectMultiStar(sys: StarSystem, out: MultiStarStats): void {
  if (sys.companionStars.length > 0) out.systemsWithCompanions++;
  out.totalCompanions += sys.companionStars.length;
  const primaryClass = sys.primaryStar.class;
  if (sys.heliopauseAU !== undefined) out.heliopauseAUValues.push(sys.heliopauseAU);

  for (const c of sys.companionStars) {
    if (c.orbitDistance !== undefined) {
      (out.separationsByPrimaryClass[primaryClass] ??= []).push(c.orbitDistance);
    }
  }

  // v2 tree validation
  for (const bin of walkBinaries(sys.rootOrbitNode)) {
    out.eccentricities.push(bin.eccentricity);
    out.sTypeCapsAU.push(bin.sTypeCapAU);
    if (sys.heliopauseAU !== undefined && bin.sTypeCapAU < sys.heliopauseAU) {
      out.cycleViolations_sTypeIntoHeliopause++;
    }
    // Hierarchical: a_outer ≥ 3 × max(a_inner). Walk inner subtree.
    let maxInner = 0;
    for (const innerBin of walkBinaries(bin.primary)) {
      if (innerBin.semiMajorAxisAU > maxInner) maxInner = innerBin.semiMajorAxisAU;
    }
    if (maxInner > 0 && bin.semiMajorAxisAU < 3 * maxInner) {
      out.cycleViolations_aOuterTooSmall++;
    }
  }
}

function collectHabitability(sys: StarSystem, out: HabitabilityStats): void {
  out.systems++;
  // mainworld zone
  const zone = sys.mainWorld?.zone ?? 'Unknown';
  out.mainworldZoneCounts[zone] = (out.mainworldZoneCounts[zone] ?? 0) + 1;

  // walk all habitability candidates (dwarfs + terrestrials + moons)
  const candidates: PlanetaryBody[] = [
    ...sys.dwarfPlanets,
    ...sys.terrestrialWorlds,
    ...(sys.moons ?? []),
  ].filter(b => b.type === 'dwarf' || b.type === 'terrestrial');

  for (const b of candidates) {
    if (b.baselineHabitability !== undefined) out.baselineScores.push(b.baselineHabitability);
    if (b.hazardV2) out.hazardCounts[b.hazardV2] = (out.hazardCounts[b.hazardV2] ?? 0) + 1;
    const z = (b.zone as string) ?? 'Unknown';
    if (b.zoneHazardDM !== undefined) {
      (out.zoneHazardDMByZone[z] ??= []).push(b.zoneHazardDM);
    }
    if (z === 'Infernal') {
      out.infernalCount++;
      if (b.hazardV2 === 'Toxic' || b.hazardV2 === 'Radioactive') out.infernalToxicPlus++;
    }
    if (z === 'Conservative') {
      out.hzCount++;
      const r = b.biosphereRating;
      if (r === 'B2' || r === 'B3' || r === 'B4' || r === 'B5' || r === 'B6') out.hzWithBiosphereB2Plus++;
      // HZ bonus tracking — note: bonus eligibility was biochem ≥ Common; we approximate
      if (b.hzBiosphereBonusApplied) out.hzBiosphereBonusFires++;
      // count eligible: any HZ candidate is "eligible to be checked"
      out.hzBiosphereBonusEligible++;
    }
  }
}

// ---- detail emitter ----

function emitDetail(sys: StarSystem): object {
  const candidates: PlanetaryBody[] = [
    ...sys.dwarfPlanets,
    ...sys.terrestrialWorlds,
    ...(sys.moons ?? []),
  ].filter(b => b.type === 'dwarf' || b.type === 'terrestrial');

  return {
    id: sys.id,
    primary: { class: sys.primaryStar.class, grade: sys.primaryStar.grade, mass: sys.primaryStar.mass, lum: sys.primaryStar.luminosity },
    heliopauseAU: sys.heliopauseAU,
    multiStarVersion: sys.multiStarVersion,
    companions: sys.companionStars.map(c => ({
      class: c.class, grade: c.grade, mass: c.mass, orbitDistanceAU: c.orbitDistance,
    })),
    binaries: [...walkBinaries(sys.rootOrbitNode)].map(b => ({
      a: b.semiMajorAxisAU, e: b.eccentricity, period: b.periodYears,
      rPrim: b.rPrimaryAU, rSec: b.rSecondaryAU,
      sTypeCap: b.sTypeCapAU, pTypeFloor: b.pTypeFloorAU,
    })),
    mainworld: sys.mainWorld ? {
      type: sys.mainWorld.type, zone: sys.mainWorld.zone,
      baseline: candidates.find(c => c.wasSelectedAsMainworld)?.baselineHabitability,
    } : null,
    candidateCount: candidates.length,
    candidates: candidates.map(c => ({
      type: c.type, zone: c.zone, distanceAU: c.distanceAU,
      baseline: c.baselineHabitability,
      breakdown: c.habitabilityBreakdown,
      hazard: c.hazardV2, hazardIntensity: c.hazardIntensityV2, biochem: c.biochem,
      biosphere: c.biosphereRating,
      zoneHazardDM: c.zoneHazardDM,
      hzBonus: c.hzBiosphereBonusApplied,
    })),
  };
}

// ---- report formatters ----

function reportMultiStar(stats: MultiStarStats, totalSystems: number): void {
  console.log('\n=== Multi-Star Report (260427-02 §7 targets) ===');
  console.log(`Systems with companions: ${stats.systemsWithCompanions}/${totalSystems} (${pct(stats.systemsWithCompanions, totalSystems)})`);
  console.log(`Total companions across all systems: ${stats.totalCompanions}`);

  console.log('\nSeparation (AU) by primary class — mean / median / min / max / count:');
  for (const cls of Object.keys(stats.separationsByPrimaryClass).sort()) {
    const xs = stats.separationsByPrimaryClass[cls];
    if (xs.length === 0) continue;
    console.log(`  ${cls}: mean=${fmt(mean(xs))}  median=${fmt(median(xs))}  min=${fmt(Math.min(...xs))}  max=${fmt(Math.max(...xs))}  n=${xs.length}`);
  }

  if (stats.eccentricities.length > 0) {
    console.log(`\nEccentricity (BinaryNodes only): mean=${fmt(mean(stats.eccentricities), 3)}  median=${fmt(median(stats.eccentricities), 3)}  n=${stats.eccentricities.length}`);
    console.log(`  Target mean ~0.25, ±0.05`);
  }

  console.log('\n--- Validation ---');
  const totalBinaries = stats.eccentricities.length;
  console.log(`S-type cap clears heliopause: ${pct(totalBinaries - stats.cycleViolations_sTypeIntoHeliopause, totalBinaries)} (target: 100% strict; violations=${stats.cycleViolations_sTypeIntoHeliopause})`);
  console.log(`a_outer ≥ 3 × a_inner (hierarchical):  violations=${stats.cycleViolations_aOuterTooSmall} of ${totalBinaries} binaries`);
}

function reportHabitability(stats: HabitabilityStats): void {
  console.log('\n=== Habitability Report (260427-01 + 260417-03 §9 targets) ===');
  const total = Object.values(stats.mainworldZoneCounts).reduce((s, n) => s + n, 0);
  console.log(`\nMainworld zone distribution (n=${total}):`);
  for (const z of Object.keys(stats.mainworldZoneCounts).sort()) {
    console.log(`  ${z}: ${stats.mainworldZoneCounts[z]} (${pct(stats.mainworldZoneCounts[z], total)})`);
  }
  const conservative = stats.mainworldZoneCounts['Conservative'] ?? 0;
  const innerHot = (stats.mainworldZoneCounts['Infernal'] ?? 0) + (stats.mainworldZoneCounts['Hot'] ?? 0);
  const outer = ['O1', 'O2', 'O3', 'O4', 'O5', 'Outer'].reduce((s, z) => s + (stats.mainworldZoneCounts[z] ?? 0), 0);
  console.log(`\n  Conservative share: ${pct(conservative, total)} (target 60–75%)`);
  console.log(`  Infernal+Hot share: ${pct(innerHot, total)} (target ≤ 5%)`);
  console.log(`  Outer (O1–O5) share: ${pct(outer, total)} (target ≤ 15%)`);

  console.log('\nHazard distribution (across all candidates):');
  for (const h of Object.keys(stats.hazardCounts).sort()) {
    console.log(`  ${h}: ${stats.hazardCounts[h]}`);
  }
  console.log(`\n  Infernal-zone Toxic+ rate: ${pct(stats.infernalToxicPlus, stats.infernalCount)} (target 25–35%; n=${stats.infernalCount} Infernal worlds)`);
  console.log(`  HZ biosphere ≥ B2 rate:    ${pct(stats.hzWithBiosphereB2Plus, stats.hzCount)} (n=${stats.hzCount} HZ worlds)`);
  console.log(`  HZ biosphere bonus fired:  ${stats.hzBiosphereBonusFires}/${stats.hzBiosphereBonusEligible} HZ candidates`);

  if (stats.baselineScores.length > 0) {
    console.log(`\nBaseline habitability across ${stats.baselineScores.length} candidates:`);
    console.log(`  mean=${fmt(mean(stats.baselineScores))}  median=${fmt(median(stats.baselineScores))}  stdev=${fmt(stdev(stats.baselineScores))}`);
    console.log(`  min=${fmt(Math.min(...stats.baselineScores))}  max=${fmt(Math.max(...stats.baselineScores))}`);
  }

  console.log('\nZone Hazard DM applied (by zone):');
  for (const z of Object.keys(stats.zoneHazardDMByZone).sort()) {
    const xs = stats.zoneHazardDMByZone[z];
    console.log(`  ${z}: applied to ${xs.length} candidates, mean DM = ${fmt(mean(xs), 2)}`);
  }
}

function reportSummary(systems: StarSystem[]): void {
  console.log('\n=== Summary Report ===');
  console.log(`Systems generated: ${systems.length}`);
  const classCounts: Record<string, number> = {};
  let totalPlanets = 0;
  let totalMoons = 0;
  let totalCompanions = 0;
  let totalEjected = 0;
  for (const s of systems) {
    classCounts[s.primaryStar.class] = (classCounts[s.primaryStar.class] ?? 0) + 1;
    totalPlanets += s.dwarfPlanets.length + s.terrestrialWorlds.length + s.iceWorlds.length + s.gasWorlds.length;
    totalMoons += s.moons?.length ?? 0;
    totalCompanions += s.companionStars.length;
    totalEjected += s.ejectedBodies?.length ?? 0;
  }
  console.log('\nPrimary class distribution:');
  for (const c of Object.keys(classCounts).sort()) {
    console.log(`  ${c}: ${classCounts[c]} (${pct(classCounts[c], systems.length)})`);
  }
  console.log(`\nMean L1 bodies per system:        ${fmt(totalPlanets / systems.length)}`);
  console.log(`Mean L2 moons per system:           ${fmt(totalMoons / systems.length)}`);
  console.log(`Mean companions per system:         ${fmt(totalCompanions / systems.length)}`);
  console.log(`Mean ejected bodies per system:     ${fmt(totalEjected / systems.length)}`);
}

// ---- main ----

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  console.log(`Batch Runner — count=${args.count}, v2MultiStar=${args.v2MultiStar}, v2Positioning=${args.v2Positioning}, report=${args.report}`);

  const ms = { systemsWithCompanions: 0, totalCompanions: 0, separationsByPrimaryClass: {}, eccentricities: [], sTypeCapsAU: [], heliopauseAUValues: [], cycleViolations_sTypeIntoHeliopause: 0, cycleViolations_aOuterTooSmall: 0 } as MultiStarStats;
  const hb = { systems: 0, mainworldZoneCounts: {}, hazardCounts: {}, infernalToxicPlus: 0, infernalCount: 0, hzWithBiosphereB2Plus: 0, hzCount: 0, baselineScores: [], zoneHazardDMByZone: {}, hzBiosphereBonusFires: 0, hzBiosphereBonusEligible: 0 } as HabitabilityStats;
  const systems: StarSystem[] = [];

  let detailHandle: { write(line: string): void; close(): void } | null = null;
  if (args.details) {
    mkdirSync(dirname(args.details), { recursive: true });
    const lines: string[] = [];
    detailHandle = {
      write(line: string) { lines.push(line); },
      close() { writeFileSync(args.details!, lines.join('\n')); },
    };
  }

  const start = Date.now();
  for (let i = 0; i < args.count; i++) {
    const sys = generateStarSystem({
      v2MultiStar: args.v2MultiStar,
      v2Positioning: args.v2Positioning,
    });
    systems.push(sys);
    collectMultiStar(sys, ms);
    collectHabitability(sys, hb);
    if (detailHandle) detailHandle.write(JSON.stringify(emitDetail(sys)));
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Generation complete: ${systems.length} systems in ${elapsed}s`);
  if (detailHandle) {
    detailHandle.close();
    console.log(`Per-system detail written to: ${args.details}`);
  }

  if (args.report === 'summary' || args.report === 'all') reportSummary(systems);
  if (args.report === 'habitability' || args.report === 'all') reportHabitability(hb);
  if (args.report === 'multi-star' || args.report === 'all') reportMultiStar(ms, systems.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
