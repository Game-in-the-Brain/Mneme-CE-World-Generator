/**
 * System Validator — FR-2PS: 2 Parsecs from Sol import validation
 *
 * Validates a StarSystem against Mneme World Generator rules to ensure
 * imported or manually-created worlds are physically consistent.
 */

import type {
  StarSystem,
  PlanetaryBody,
  Star,
  ZoneBoundaries,
  MainWorld,
} from '../types';
import {
  ZONE_TEMPERATURE_DM,
  getGravityHabMod,
  lookupBiochem,
  getBiochemHabMod,
} from './worldData';

// =====================
// Validation Result Types
// =====================

export type ValidationSeverity = 'info' | 'warning' | 'error';

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  path: string; // dot-notation path, e.g. "terrestrialWorlds[3].distanceAU"
  suggestion?: string;
}

export interface ValidationReport {
  systemId: string;
  systemName: string;
  passed: boolean;
  score: number; // 0–100
  issues: ValidationIssue[];
  summary: {
    errorCount: number;
    warningCount: number;
    infoCount: number;
    bodyCount: number;
    mainworldHabitability: number | null;
    spacingViolations: number;
    zoneMismatches: number;
  };
}

// =====================
// Constants
// =====================

/** Minimum separation in AU for inner-system bodies (arbitrary floor) */
const MIN_FLOOR_AU_INNER = 0.01;
/** Minimum separation in AU for outer-system bodies */
const MIN_FLOOR_AU_OUTER = 0.05;

/** Rough stellar mass ranges by spectral class (solar masses) */
const STELLAR_MASS_RANGES: Record<string, { min: number; max: number }> = {
  O: { min: 16, max: 100 },
  B: { min: 2.1, max: 16 },
  A: { min: 1.4, max: 2.1 },
  F: { min: 1.04, max: 1.4 },
  G: { min: 0.8, max: 1.04 },
  K: { min: 0.45, max: 0.8 },
  M: { min: 0.08, max: 0.45 },
  L: { min: 0.01, max: 0.08 }, // brown dwarf
  T: { min: 0.001, max: 0.01 },
};

/** Rough stellar luminosity ranges by spectral class (solar luminosities) */
const STELLAR_LUM_RANGES: Record<string, { min: number; max: number }> = {
  O: { min: 30000, max: 1000000 },
  B: { min: 25, max: 30000 },
  A: { min: 5, max: 25 },
  F: { min: 1.5, max: 5 },
  G: { min: 0.6, max: 1.5 },
  K: { min: 0.08, max: 0.6 },
  M: { min: 0.001, max: 0.08 },
  L: { min: 0.00001, max: 0.001 },
  T: { min: 0.000001, max: 0.00001 },
};

// =====================
// Main Entry Point
// =====================

export function validateSystem(system: StarSystem): ValidationReport {
  const issues: ValidationIssue[] = [];

  // 1. Star validation
  validateStar(system.primaryStar, 'primaryStar', issues);
  system.companionStars.forEach((star, idx) =>
    validateStar(star, `companionStars[${idx}]`, issues)
  );

  // 2. Zone boundary validation
  validateZoneBoundaries(system.primaryStar, system.zones, issues);

  // 3. Collect all bodies
  const allBodies: Array<{ body: PlanetaryBody; path: string }> = [
    ...system.circumstellarDisks.map((b, i) => ({ body: b, path: `circumstellarDisks[${i}]` })),
    ...system.dwarfPlanets.map((b, i) => ({ body: b, path: `dwarfPlanets[${i}]` })),
    ...system.terrestrialWorlds.map((b, i) => ({ body: b, path: `terrestrialWorlds[${i}]` })),
    ...system.iceWorlds.map((b, i) => ({ body: b, path: `iceWorlds[${i}]` })),
    ...system.gasWorlds.map((b, i) => ({ body: b, path: `gasWorlds[${i}]` })),
    ...(system.ejectedBodies ?? []).map((b, i) => ({ body: b, path: `ejectedBodies[${i}]` })),
    ...(system.consumedBodies ?? []).map((b, i) => ({ body: b, path: `consumedBodies[${i}]` })),
    ...(system.moons ?? []).map((b, i) => ({ body: b, path: `moons[${i}]` })),
  ];

  // 4. Body spacing validation (Hill sphere)
  const spacingResult = validateBodySpacing(
    allBodies.map(b => b.body),
    system.primaryStar.mass
  );
  spacingResult.violations.forEach(v => {
    issues.push({
      severity: 'warning',
      code: 'SPACING_HILL',
      message: v,
      path: 'bodies',
      suggestion: 'Increase orbital separation or reduce body mass.',
    });
  });

  // 5. Per-body validation
  allBodies.forEach(({ body, path }) => {
    validateBody(body, path, system.zones, issues);
  });

  // 6. Mainworld validation
  if (system.mainWorld) {
    validateMainworld(system.mainWorld, 'mainWorld', system.zones, issues);
  }

  // 7. Summary stats
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  // Score: start at 100, subtract penalties
  let score = 100;
  score -= errorCount * 10;
  score -= warningCount * 3;
  score -= infoCount * 0.5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const report: ValidationReport = {
    systemId: system.id,
    systemName: system.name || 'Unnamed',
    passed: errorCount === 0,
    score,
    issues,
    summary: {
      errorCount,
      warningCount,
      infoCount,
      bodyCount: allBodies.length,
      mainworldHabitability: system.mainWorld?.habitability ?? null,
      spacingViolations: spacingResult.violations.length,
      zoneMismatches: issues.filter(i => i.code === 'ZONE_MISMATCH').length,
    },
  };

  return report;
}

// =====================
// Star Validation
// =====================

function validateStar(star: Star, path: string, issues: ValidationIssue[]): void {
  const letter = star.class.charAt(0).toUpperCase();
  const massRange = STELLAR_MASS_RANGES[letter];
  const lumRange = STELLAR_LUM_RANGES[letter];

  if (massRange) {
    if (star.mass < massRange.min || star.mass > massRange.max) {
      issues.push({
        severity: 'warning',
        code: 'STAR_MASS_RANGE',
        message: `${star.class} star mass ${star.mass.toFixed(3)} M☉ is outside typical range [${massRange.min}–${massRange.max}].`,
        path: `${path}.mass`,
        suggestion: 'Verify mass against astrophysical tables.',
      });
    }
  }

  if (lumRange) {
    if (star.luminosity < lumRange.min || star.luminosity > lumRange.max) {
      issues.push({
        severity: 'warning',
        code: 'STAR_LUM_RANGE',
        message: `${star.class} star luminosity ${star.luminosity.toFixed(4)} L☉ is outside typical range [${lumRange.min}–${lumRange.max}].`,
        path: `${path}.luminosity`,
      });
    }
  }

  if (star.mass <= 0) {
    issues.push({
      severity: 'error',
      code: 'STAR_MASS_NONPOSITIVE',
      message: `Star mass must be positive, got ${star.mass}.`,
      path: `${path}.mass`,
    });
  }

  if (star.luminosity <= 0) {
    issues.push({
      severity: 'error',
      code: 'STAR_LUM_NONPOSITIVE',
      message: `Star luminosity must be positive, got ${star.luminosity}.`,
      path: `${path}.luminosity`,
    });
  }
}

// =====================
// Zone Boundary Validation
// =====================

function validateZoneBoundaries(
  star: Star,
  zones: ZoneBoundaries,
  issues: ValidationIssue[]
): void {
  // Check for overlapping or inverted zones
  const ordered = [
    { name: 'infernal', ...zones.infernal },
    { name: 'hot', ...zones.hot },
    { name: 'conservative', ...zones.conservative },
    { name: 'cold', ...zones.cold },
  ];

  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i];
    const b = ordered[i + 1];
    if (a.max !== b.min) {
      issues.push({
        severity: 'warning',
        code: 'ZONE_GAP_OVERLAP',
        message: `Zone boundary mismatch: ${a.name} ends at ${a.max} AU but ${b.name} starts at ${b.min} AU.`,
        path: `zones`,
      });
    }
  }

  // Verify zone bounds are physically plausible for the star's luminosity
  // Conservative zone inner edge ≈ sqrt(L) AU (Earth-like insolation ~1 AU for L=1)
  const expectedConservativeInner = Math.sqrt(star.luminosity);
  const tolerance = 0.5; // generous tolerance for game purposes

  if (Math.abs(zones.conservative.min - expectedConservativeInner) > tolerance) {
    issues.push({
      severity: 'info',
      code: 'ZONE_CONSERVATIVE_OFFSET',
      message: `Conservative zone inner edge is ${zones.conservative.min.toFixed(2)} AU, expected ~${expectedConservativeInner.toFixed(2)} AU for L=${star.luminosity.toFixed(3)}.`,
      path: `zones.conservative.min`,
      suggestion: 'For game worlds this is fine, but verify if intentionally offset.',
    });
  }
}

// =====================
// Body Spacing Validation
// =====================

function validateBodySpacing(
  bodies: PlanetaryBody[],
  starMass: number
): { violations: string[] } {
  const sorted = [...bodies].sort((a, b) => a.distanceAU - b.distanceAU);
  const violations: string[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const sep = Math.abs(b.distanceAU - a.distanceAU);
    const isOuter = a.zone === 'Outer' || b.zone === 'Outer';
    const minFloor = isOuter ? MIN_FLOOR_AU_OUTER : MIN_FLOOR_AU_INNER;
    const hillSep = minSeparationAU(a.distanceAU, a.mass, b.distanceAU, b.mass, starMass);
    const minSep = Math.max(hillSep, minFloor);

    if (sep < minSep - 0.001) {
      violations.push(
        `${a.type} "${a.id}" @ ${a.distanceAU.toFixed(3)} AU and ${b.type} "${b.id}" @ ${b.distanceAU.toFixed(3)} AU — separation ${sep.toFixed(4)} < min ${minSep.toFixed(4)} AU`
      );
    }
  }

  return { violations };
}

/** Hill-sphere based minimum separation between two bodies (simplified) */
function minSeparationAU(
  d1: number,
  m1: number,
  d2: number,
  m2: number,
  mStar: number
): number {
  const rH1 = d1 * Math.pow(m1 / (3 * mStar), 1 / 3);
  const rH2 = d2 * Math.pow(m2 / (3 * mStar), 1 / 3);
  return Math.max(rH1, rH2) * 5; // 5× Hill radius as safe margin
}

// =====================
// Per-Body Validation
// =====================

function validateBody(
  body: PlanetaryBody,
  path: string,
  zones: ZoneBoundaries,
  issues: ValidationIssue[]
): void {
  // Check zone consistency
  const expectedZone = getZoneForDistance(body.distanceAU, zones);
  if (body.zone && expectedZone && body.zone !== expectedZone) {
    issues.push({
      severity: 'warning',
      code: 'ZONE_MISMATCH',
      message: `Body "${body.id}" is at ${body.distanceAU.toFixed(3)} AU (${expectedZone} zone) but tagged as ${body.zone}.`,
      path: `${path}.zone`,
      suggestion: `Expected zone: ${expectedZone}`,
    });
  }

  // Check negative distance
  if (body.distanceAU < 0) {
    issues.push({
      severity: 'error',
      code: 'BODY_NEGATIVE_DISTANCE',
      message: `Body "${body.id}" has negative orbital distance ${body.distanceAU}.`,
      path: `${path}.distanceAU`,
    });
  }

  // Check mass reasonableness
  if (body.mass <= 0) {
    issues.push({
      severity: 'error',
      code: 'BODY_NONPOSITIVE_MASS',
      message: `Body "${body.id}" has non-positive mass ${body.mass}.`,
      path: `${path}.mass`,
    });
  }

  // For terrestrial worlds with gravity data, cross-check
  if (body.type === 'terrestrial' && body.gravity !== undefined && body.gravity !== null) {
    if (body.gravity <= 0) {
      issues.push({
        severity: 'warning',
        code: 'BODY_NONPOSITIVE_GRAVITY',
        message: `Terrestrial world "${body.id}" has non-positive surface gravity ${body.gravity} G.`,
        path: `${path}.gravity`,
      });
    } else if (body.gravity > 3) {
      issues.push({
        severity: 'info',
        code: 'BODY_HIGH_GRAVITY',
        message: `Terrestrial world "${body.id}" has high surface gravity ${body.gravity.toFixed(2)} G.`,
        path: `${path}.gravity`,
        suggestion: 'Verify mass/radius consistency.',
      });
    }
  }
}

function getZoneForDistance(au: number, zones: ZoneBoundaries): string | null {
  if (au < zones.infernal.max) return 'Infernal';
  if (au < zones.hot.max) return 'Hot';
  if (au < zones.conservative.max) return 'Conservative';
  if (au < zones.cold.max) return 'Cold';
  return 'Outer';
}

// =====================
// Mainworld Validation
// =====================

function validateMainworld(
  mw: MainWorld,
  path: string,
  zones: ZoneBoundaries,
  issues: ValidationIssue[]
): void {
  // Habitability range check
  if (mw.habitability < -10 || mw.habitability > 10) {
    issues.push({
      severity: 'warning',
      code: 'MW_HABITABILITY_RANGE',
      message: `Mainworld habitability ${mw.habitability} is outside typical range [-10, 10].`,
      path: `${path}.habitability`,
    });
  }

  // Tech level range
  if (mw.techLevel < 0 || mw.techLevel > 18) {
    issues.push({
      severity: 'warning',
      code: 'MW_TECHLEVEL_RANGE',
      message: `Mainworld tech level ${mw.techLevel} is outside standard Cepheus range [0, 18].`,
      path: `${path}.techLevel`,
    });
  }

  // Zone check
  const expectedZone = getZoneForDistance(mw.distanceAU, zones);
  if (expectedZone && mw.zone !== expectedZone) {
    issues.push({
      severity: 'warning',
      code: 'MW_ZONE_MISMATCH',
      message: `Mainworld is at ${mw.distanceAU.toFixed(3)} AU (${expectedZone}) but zone field says ${mw.zone}.`,
      path: `${path}.zone`,
    });
  }

  // Gravity consistency: g ≈ M / r², and r ∝ M^(1/3) for constant density
  // So g ∝ M^(1/3) for same density. Very rough check:
  if (mw.massEM > 0 && mw.gravity > 0) {
    const expectedGravity = Math.pow(mw.massEM, 1 / 3); // Earth-density assumption
    const ratio = mw.gravity / expectedGravity;
    if (ratio < 0.3 || ratio > 3) {
      issues.push({
        severity: 'info',
        code: 'MW_GRAVITY_MASS_RATIO',
        message: `Mainworld gravity (${mw.gravity.toFixed(2)} G) and mass (${mw.massEM.toFixed(2)} EM) ratio is unusual (expected ~${expectedGravity.toFixed(2)} G for Earth-like density).`,
        path: `${path}.gravity`,
        suggestion: 'May indicate unusual composition; verify if intentional.',
      });
    }
  }
}

// =====================
// Batch Validation Helper
// =====================

export function validateMultiple(systems: StarSystem[]): ValidationReport[] {
  return systems.map(validateSystem);
}

export function printReport(report: ValidationReport): string {
  const lines: string[] = [];
  lines.push(`╔════════════════════════════════════════════════════════════╗`);
  lines.push(`║  System Validation Report                                  ║`);
  lines.push(`╠════════════════════════════════════════════════════════════╣`);
  lines.push(`║  Name:  ${report.systemName.padEnd(46)}║`);
  lines.push(`║  ID:    ${report.systemId.padEnd(46)}║`);
  lines.push(`║  Score: ${String(report.score).padStart(3)} / 100${' '.repeat(35)}║`);
  lines.push(`║  Pass:  ${(report.passed ? '✅ YES' : '❌ NO').padEnd(46)}║`);
  lines.push(`╠════════════════════════════════════════════════════════════╣`);
  lines.push(`║  Bodies: ${String(report.summary.bodyCount).padStart(3)}  │  Errors: ${String(report.summary.errorCount).padStart(3)}  │  Warnings: ${String(report.summary.warningCount).padStart(3)}      ║`);
  lines.push(`║  Spacing violations: ${String(report.summary.spacingViolations).padStart(3)}  │  Zone mismatches: ${String(report.summary.zoneMismatches).padStart(3)}           ║`);
  lines.push(`╠════════════════════════════════════════════════════════════╣`);

  if (report.issues.length === 0) {
    lines.push(`║  ✅ No issues found!                                       ║`);
  } else {
    for (const issue of report.issues.slice(0, 20)) {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      const text = `${icon} [${issue.code}] ${issue.message}`.slice(0, 56);
      lines.push(`║  ${text.padEnd(56)}║`);
    }
    if (report.issues.length > 20) {
      lines.push(`║  ... and ${String(report.issues.length - 20).padStart(3)} more issues.                          ║`);
    }
  }

  lines.push(`╚════════════════════════════════════════════════════════════╝`);
  return lines.join('\n');
}
