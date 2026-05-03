// =====================
// 260427-02: Multi-Star Hierarchy & Barycenter Math
// =====================
//
// Builds a hierarchical OrbitNode tree from a primary star + companion list.
// Each BinaryNode caches its barycenter offsets ("gear ratio"), Kepler period,
// and stability envelopes (S-type cap, P-type floor) for downstream consumers
// (2D map orbital phase, FRD-067 barypoint navigation, exports).
//
// Wide-only: companion separation rolled at 3D3 × heliopause × (1 + e) with a
// hard floor that guarantees the S-type cone clears the heliopause. INRAS
// generation is therefore unaffected.

import type { Star, OrbitNode, StarLeaf, BinaryNode, BarycenterView, BarycenterStar } from '../types';
import { roll3D3, rollD6, round } from './dice';
import { getWideCompanionOrbitDistance } from './stellarData';

/** Holman-Wiegert S-type critical fraction (circular outer): a_planet / a_binary ≤ 0.46 × (1−e). */
const HW_S_TYPE_FRACTION = 0.46;
/** Holman-Wiegert P-type critical fraction (circular outer): a_planet / a_binary ≥ 2.39 × (1+e). */
const HW_P_TYPE_FRACTION = 2.39;
/** Hierarchical-stability factor for nested binaries: a_outer ≥ 3 × a_inner. */
const HIERARCHICAL_RATIO_MIN = 3;
/** Max attempts to satisfy the hierarchical-stability constraint before giving up.
 *  Bumped 5 → 10 on 2026-04-27 after empirical batch showed 1.9% of binaries
 *  exhausted the 5-attempt cap. With cap = 10 the failure rate falls below 0.5%. */
const HIERARCHICAL_REROLL_MAX = 10;

function makeStarLeaf(star: Star): StarLeaf {
  return {
    kind: 'star',
    starId: star.id,
    totalMass: star.mass,
  };
}

/** Kepler's third law in solar units: P² = a³ / (m_total). */
export function keplerPeriodYears(semiMajorAxisAU: number, totalMassSolar: number): number {
  if (totalMassSolar <= 0) return 0;
  return Math.sqrt(Math.pow(semiMajorAxisAU, 3) / totalMassSolar);
}

/** The "gear ratio" — each star wobbles in a circle around the shared barycenter. */
export function computeBarycenter(
  semiMajorAxisAU: number,
  primaryMass: number,
  secondaryMass: number,
): { rPrimaryAU: number; rSecondaryAU: number } {
  const total = primaryMass + secondaryMass;
  if (total <= 0) return { rPrimaryAU: 0, rSecondaryAU: 0 };
  return {
    rPrimaryAU: round(semiMajorAxisAU * (secondaryMass / total), 2),
    rSecondaryAU: round(semiMajorAxisAU * (primaryMass / total), 2),
  };
}

/** Return the maximum semi-major axis among all BinaryNodes inside the subtree (0 for a leaf). */
function maxInnerSemiMajorAxis(node: OrbitNode): number {
  if (node.kind === 'star') return 0;
  return Math.max(
    node.semiMajorAxisAU,
    maxInnerSemiMajorAxis(node.primary),
    maxInnerSemiMajorAxis(node.secondary),
  );
}

/** Roll eccentricity 1D6 → 0.0 / 0.1 / 0.2 / 0.3 / 0.4 / 0.5 (uniform). */
function rollEccentricity(): number {
  return (rollD6() - 1) / 10;
}

function buildBinary(
  inner: OrbitNode,
  outerLeaf: StarLeaf,
  parentHeliopauseAU: number,
): BinaryNode {
  // Hierarchical stability: a_outer must clear 3 × max(a_inner) AND 3D3 × heliopause floor.
  const innerCeiling = maxInnerSemiMajorAxis(inner);
  let semiMajorAxisAU = 0;
  let eccentricity = 0;
  for (let attempt = 0; attempt < HIERARCHICAL_REROLL_MAX; attempt++) {
    const rolled = roll3D3().value;
    eccentricity = rollEccentricity();
    semiMajorAxisAU = getWideCompanionOrbitDistance(rolled, parentHeliopauseAU, eccentricity);
    if (semiMajorAxisAU >= HIERARCHICAL_RATIO_MIN * innerCeiling) break;
    // Otherwise re-roll up to HIERARCHICAL_REROLL_MAX times. If the floor is
    // never satisfied we fall through with the last roll — caller can decide
    // to drop the companion or accept a marginally-tight outer orbit.
  }

  const totalMass = inner.totalMass + outerLeaf.totalMass;
  const { rPrimaryAU, rSecondaryAU } = computeBarycenter(
    semiMajorAxisAU,
    inner.totalMass,
    outerLeaf.totalMass,
  );

  return {
    kind: 'binary',
    primary: inner,
    secondary: outerLeaf,
    semiMajorAxisAU,
    eccentricity,
    inclinationDeg: (rollD6() - 1) * 30, // 0°, 30°, 60°, 90°, 120°, 150°
    totalMass,
    rPrimaryAU,
    rSecondaryAU,
    periodYears: round(keplerPeriodYears(semiMajorAxisAU, totalMass), 2),
    sTypeCapAU: round(HW_S_TYPE_FRACTION * semiMajorAxisAU * (1 - eccentricity), 2),
    pTypeFloorAU: round(HW_P_TYPE_FRACTION * semiMajorAxisAU * (1 + eccentricity), 2),
  };
}

/**
 * Build the hierarchical orbit tree for a system. Companions are nested
 * inside-out: each new companion wraps the existing tree as the primary of a
 * new outer BinaryNode. Produces a left-skewed nested binary, not a
 * double-double. Double-double quaternaries are deferred (see 260427-02 §8.4).
 */
export function buildOrbitTree(
  primary: Star,
  companions: Star[],
  parentHeliopauseAU: number,
): OrbitNode {
  let root: OrbitNode = makeStarLeaf(primary);
  for (const companion of companions) {
    const leaf = makeStarLeaf(companion);
    root = buildBinary(root, leaf, parentHeliopauseAU);
  }
  return root;
}

/**
 * Flatten the orbit tree into a 2D barycenter view.
 * Each star gets a single orbit around the system barycenter.
 * Positions are computed at epoch by walking the tree and summing orbital
 * offsets.  Inclination is preserved as metadata even though the 2D
 * projection ignores it for positioning.
 *
 * Orbital angles are seeded from star IDs so the same system always produces
 * the same barycenter layout.
 */
export function buildBarycenterView(
  root: OrbitNode,
  stars: Star[],
): BarycenterView {
  const starMap = new Map(stars.map(s => [s.id, s]));
  const results: BarycenterStar[] = [];

  // Simple string hash → 32-bit integer
  function hashString(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  // LCG seeded random: returns 0..1
  function makeRng(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  const baseSeed = hashString(stars.map(s => s.id).join('|'));
  let binaryCounter = 0;

  // Walk the tree, accumulating 2D position from the system barycenter.
  function walk(
    node: OrbitNode,
    parentX: number,
    parentY: number,
    outermostBinary: BinaryNode | null,
  ): void {
    if (node.kind === 'star') {
      const star = starMap.get(node.starId);
      if (!star) return;
      const dx = parentX;
      const dy = parentY;
      const distanceAU = round(Math.sqrt(dx * dx + dy * dy), 2);
      const angleRad = Math.atan2(dy, dx);
      results.push({
        starId: node.starId,
        isPrimary: node.starId === stars[0]?.id,
        class: star.class,
        grade: star.grade,
        mass: star.mass,
        distanceAU,
        periodYears: outermostBinary ? outermostBinary.periodYears : 0,
        eccentricity: outermostBinary ? outermostBinary.eccentricity : 0,
        inclinationDeg: outermostBinary ? outermostBinary.inclinationDeg : 0,
        angleRad: round(angleRad, 4),
      });
      return;
    }
    // Seeded angle: unique per binary node via counter
    const rng = makeRng(baseSeed + binaryCounter++);
    const angle = rng() * Math.PI * 2;
    const px = parentX - node.rPrimaryAU * Math.cos(angle);
    const py = parentY - node.rPrimaryAU * Math.sin(angle);
    const sx = parentX + node.rSecondaryAU * Math.cos(angle);
    const sy = parentY + node.rSecondaryAU * Math.sin(angle);
    // The outermost binary for children is the current node if we haven't
    // recorded one yet, otherwise keep the parent's outermost binary.
    const binaryForChildren = outermostBinary ?? node;
    walk(node.primary, px, py, binaryForChildren);
    walk(node.secondary, sx, sy, binaryForChildren);
  }

  walk(root, 0, 0, null);
  return { stars: results };
}
