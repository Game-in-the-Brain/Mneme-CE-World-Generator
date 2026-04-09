// ============================================================
//  REF-011: Hill Sphere Orbital Placement
//  Reference implementation for: 260409-v02 Mneme-CE-World-Generator-FRD.md
//  Section: 8.6 Orbital Placement — Hill Sphere Spacing
//  Last Updated: 2026-04-09
// ============================================================
//  PLANETARY ORBITAL PLACEMENT — Hill Sphere Spacing
//  Mneme World Generator
// ============================================================
//
//  Algorithm:
//  1. Place Main World at its rolled AU position
//  2. Sort remaining bodies by mass descending (largest first)
//  3. For each body:
//     a. Roll its initial AU position from its zone formula
//     b. Check clearance against every already-placed body
//        using the mutual Hill radius minimum separation
//     c. If too close: nudge outward (or inward if zone full)
//        staying within the zone where possible
//     d. If no room in zone: overflow to the next outer zone
//  4. Record final AU position
// ============================================================

// --- Types ---------------------------------------------------

type Zone =
  | "Infernal"
  | "Hot"
  | "Conservative Habitable"
  | "Optimistic Habitable"
  | "Outer Solar System";

type BodyType =
  | "MainWorld"
  | "GasWorld"
  | "IceWorld"
  | "TerrestrialWorld"
  | "DwarfPlanet"
  | "CircumstellarDisk";

interface PlacedBody {
  id: string;
  type: BodyType;
  massEM: number;       // mass in Earth Masses (all bodies normalised to EM)
  zone: Zone;
  au: number;
  hillRadiusAU: number; // computed after placement
}

// --- Constants -----------------------------------------------

// Mass conversions to Earth Masses
const LM_TO_EM   = 0.0123;   // 1 Lunar Mass = 0.0123 Earth Masses
const JM_TO_EM   = 317.8;    // 1 Jupiter Mass = 317.8 Earth Masses
const CM_TO_EM   = 1.577e-4; // 1 Ceres Mass = very small

// Hill sphere safety factor — minimum separation = HILL_FACTOR × r_H(larger body)
// Standard mutual Hill radius criterion uses ~3.5; we use 4.0 for stability margin
const HILL_FACTOR = 4.0;

// Zone boundaries as multiples of √L☉
// These are used for overflow detection
const ZONE_LIMITS = {
  Infernal:                 { min: 0,    max: 0.4  },  // × √L☉
  Hot:                      { min: 0.4,  max: 0.8  },
  "Conservative Habitable": { min: 0.8,  max: 1.2  },
  "Optimistic Habitable":   { min: 1.2,  max: 4.85 },
  "Outer Solar System":     { min: 4.85, max: Infinity },
};

const ZONE_ORDER: Zone[] = [
  "Infernal",
  "Hot",
  "Conservative Habitable",
  "Optimistic Habitable",
  "Outer Solar System",
];

// --- Dice Helpers --------------------------------------------

function roll1D6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function roll2D6(): number {
  return roll1D6() + roll1D6();
}

// --- Mass Normalisation --------------------------------------

function toEarthMasses(value: number, unit: "EM" | "LM" | "JM" | "CM"): number {
  switch (unit) {
    case "EM": return value;
    case "LM": return value * LM_TO_EM;
    case "JM": return value * JM_TO_EM;
    case "CM": return value * CM_TO_EM;
  }
}

// --- Zone Boundary Helpers -----------------------------------

function getZoneLimits(zone: Zone, sqrtL: number): { min: number; max: number } {
  const limits = ZONE_LIMITS[zone];
  return {
    min: limits.min * sqrtL,
    max: limits.max === Infinity ? Infinity : limits.max * sqrtL,
  };
}

function getZoneForAU(au: number, sqrtL: number): Zone {
  for (const zone of ZONE_ORDER) {
    const { min, max } = getZoneLimits(zone, sqrtL);
    if (au >= min && au < max) return zone;
  }
  return "Outer Solar System";
}

function getNextOuterZone(zone: Zone): Zone {
  const idx = ZONE_ORDER.indexOf(zone);
  return idx < ZONE_ORDER.length - 1 ? ZONE_ORDER[idx + 1] : "Outer Solar System";
}

// --- AU Roll by Zone -----------------------------------------

function rollAUForZone(zone: Zone, sqrtL: number): number {
  const d6 = roll1D6();
  switch (zone) {
    case "Infernal":
      return sqrtL * (0.067 * d6);
    case "Hot":
      return sqrtL * ((0.067 * d6) + 0.4);
    case "Conservative Habitable":
      return sqrtL * ((0.067 * d6) + 0.7);
    case "Optimistic Habitable":
      return sqrtL * ((0.61 * d6) + 1.2);
    case "Outer Solar System": {
      let multiplier = 1;
      let outerRoll = roll1D6();
      while (outerRoll === 6 && multiplier < 64) {
        multiplier *= 6;
        outerRoll = roll1D6();
      }
      return sqrtL * ((outerRoll * outerRoll) + 4.85) * multiplier;
    }
  }
}

// --- Hill Sphere Calculation ---------------------------------

/**
 * Hill sphere radius of a planet orbiting a star.
 *
 * r_H = a × ∛(m_planet / (3 × M_star))
 *
 * @param orbitalAU  — planet's orbital distance in AU
 * @param planetEM   — planet mass in Earth Masses
 * @param starEM     — star mass in Earth Masses (1 M☉ ≈ 333,000 EM)
 * @returns Hill sphere radius in AU
 */
function hillSphereAU(orbitalAU: number, planetEM: number, starEM: number): number {
  return orbitalAU * Math.cbrt(planetEM / (3 * starEM));
}

/**
 * Minimum safe orbital separation between two bodies.
 * Uses the larger body's Hill sphere × HILL_FACTOR.
 */
function minSeparationAU(
  au1: number, mass1EM: number,
  au2: number, mass2EM: number,
  starEM: number
): number {
  const hill1 = hillSphereAU(au1, mass1EM, starEM);
  const hill2 = hillSphereAU(au2, mass2EM, starEM);
  const largerHill = Math.max(hill1, hill2);
  return HILL_FACTOR * largerHill;
}

// --- Collision Detection & Resolution ------------------------

/**
 * Check if a candidate AU position is clear of all placed bodies.
 * Returns null if clear, or the closest conflicting body.
 */
function findConflict(
  candidateAU: number,
  candidateMassEM: number,
  placed: PlacedBody[],
  starEM: number
): PlacedBody | null {
  for (const body of placed) {
    const minSep = minSeparationAU(
      candidateAU, candidateMassEM,
      body.au, body.massEM,
      starEM
    );
    if (Math.abs(candidateAU - body.au) < minSep) {
      return body;
    }
  }
  return null;
}

/**
 * Given a conflict, find the first clear AU position by stepping
 * outward in small increments. If the zone is exhausted, overflow
 * to the next outer zone's minimum AU.
 *
 * @param startAU      — the conflicting AU we tried to place at
 * @param conflictBody — the body we conflicted with
 * @param candidateMassEM
 * @param zone         — current zone
 * @param sqrtL        — √L☉ for zone limit calculation
 * @param placed       — all already-placed bodies
 * @param starEM       — star mass in EM
 */
function resolveConflict(
  startAU: number,
  conflictBody: PlacedBody,
  candidateMassEM: number,
  zone: Zone,
  sqrtL: number,
  placed: PlacedBody[],
  starEM: number
): { au: number; zone: Zone } {
  const { max: zoneMax } = getZoneLimits(zone, sqrtL);

  // Step outward by one Hill radius of the conflict body at a time
  const stepSize = hillSphereAU(conflictBody.au, conflictBody.massEM, starEM) * HILL_FACTOR;
  let candidateAU = Math.max(startAU, conflictBody.au) + stepSize;

  // Keep stepping until clear or zone exhausted
  let attempts = 0;
  while (attempts < 50) {
    const conflict = findConflict(candidateAU, candidateMassEM, placed, starEM);

    if (!conflict) {
      // Check if still within zone
      if (candidateAU < zoneMax) {
        return { au: candidateAU, zone };
      } else {
        // Zone exhausted — overflow to next outer zone
        const nextZone = getNextOuterZone(zone);
        const { min: nextMin } = getZoneLimits(nextZone, sqrtL);
        const overflowAU = nextMin + stepSize;
        return { au: overflowAU, zone: nextZone };
      }
    }

    // Step past the new conflict
    candidateAU = Math.max(candidateAU, conflict.au) +
      hillSphereAU(conflict.au, conflict.massEM, starEM) * HILL_FACTOR;
    attempts++;
  }

  // Safety fallback: place at end of outer solar system
  const outerMin = getZoneLimits("Outer Solar System", sqrtL).min;
  return { au: outerMin + (attempts * stepSize), zone: "Outer Solar System" };
}

// --- Main Placement Function ---------------------------------

interface BodyInput {
  id: string;
  type: BodyType;
  massEM: number;
  zone: Zone;            // rolled zone from position table
  rolledAU?: number;     // pre-rolled AU (used for main world); if absent, roll here
}

/**
 * Place all bodies with Hill sphere spacing enforcement.
 *
 * @param mainWorld   — the main world (placed first, position fixed)
 * @param others      — all other bodies (will be sorted by mass desc)
 * @param starMassSun — primary star mass in Solar Masses (1 M☉)
 * @param luminosity  — primary star luminosity in L☉
 */
function placePlanetaryBodies(
  mainWorld: BodyInput,
  others: BodyInput[],
  starMassSun: number,
  luminosity: number
): PlacedBody[] {
  const sqrtL  = Math.sqrt(luminosity);
  const starEM = starMassSun * 333_000; // 1 M☉ = 333,000 Earth Masses

  const placed: PlacedBody[] = [];

  // --- Step 1: Place Main World first (its position is fixed) ---
  const mwAU = mainWorld.rolledAU ?? rollAUForZone(mainWorld.zone, sqrtL);
  const mwHill = hillSphereAU(mwAU, mainWorld.massEM, starEM);

  placed.push({
    id:           mainWorld.id,
    type:         mainWorld.type,
    massEM:       mainWorld.massEM,
    zone:         mainWorld.zone,
    au:           mwAU,
    hillRadiusAU: mwHill,
  });

  console.log(
    `  PLACED   ${mainWorld.id.padEnd(22)} ` +
    `zone=${mainWorld.zone.padEnd(25)} ` +
    `AU=${mwAU.toFixed(4).padStart(9)}  ` +
    `Hill=${mwHill.toFixed(6)} AU`
  );

  // --- Step 2: Sort remaining bodies by mass descending ---
  const sortedOthers = [...others].sort((a, b) => b.massEM - a.massEM);

  // --- Step 3: Place each body ---
  for (const body of sortedOthers) {
    let candidateAU   = body.rolledAU ?? rollAUForZone(body.zone, sqrtL);
    let candidateZone = body.zone;

    // Ensure candidate AU is actually inside its declared zone
    // (rolled formula can sometimes land just outside due to rounding)
    const { min: zMin, max: zMax } = getZoneLimits(candidateZone, sqrtL);
    if (candidateAU < zMin) candidateAU = zMin + 0.001 * sqrtL;
    if (candidateAU >= zMax && zMax !== Infinity) candidateAU = zMax - 0.001 * sqrtL;

    const conflict = findConflict(candidateAU, body.massEM, placed, starEM);

    if (conflict) {
      const resolved = resolveConflict(
        candidateAU,
        conflict,
        body.massEM,
        candidateZone,
        sqrtL,
        placed,
        starEM
      );
      candidateAU   = resolved.au;
      candidateZone = resolved.zone;
    }

    const hillRadius = hillSphereAU(candidateAU, body.massEM, starEM);

    placed.push({
      id:           body.id,
      type:         body.type,
      massEM:       body.massEM,
      zone:         candidateZone,
      au:           candidateAU,
      hillRadiusAU: hillRadius,
    });

    const displaced = candidateZone !== body.zone
      ? ` ⚠ DISPLACED from ${body.zone}`
      : "";

    console.log(
      `  PLACED   ${body.id.padEnd(22)} ` +
      `zone=${candidateZone.padEnd(25)} ` +
      `AU=${candidateAU.toFixed(4).padStart(9)}  ` +
      `Hill=${hillRadius.toFixed(6)} AU` +
      displaced
    );
  }

  // --- Step 4: Sort final output by AU ascending ---
  return placed.sort((a, b) => a.au - b.au);
}

// --- Example Execution ---------------------------------------

function runExample() {
  console.log("\n=== PLANETARY PLACEMENT WITH HILL SPHERE SPACING ===");
  console.log("Star: G2 (Sol-equivalent) | Mass = 1.0 M☉ | Luminosity = 1.0 L☉\n");

  // Main World — Earth-like, 1.0 EM in Conservative Habitable, pre-rolled at 1.0 AU
  const mainWorld: BodyInput = {
    id:       "Main World",
    type:     "MainWorld",
    massEM:   1.0,
    zone:     "Conservative Habitable",
    rolledAU: 1.0,
  };

  // Other bodies — a realistic inner solar system spread
  const others: BodyInput[] = [
    // Gas giants (massive — placed first in loop due to sort)
    { id: "Gas I  (Jupiter-like)", type: "GasWorld",       massEM: toEarthMasses(1.0, "JM"),  zone: "Outer Solar System" },
    { id: "Gas II (Saturn-like)",  type: "GasWorld",       massEM: toEarthMasses(0.3, "JM"),  zone: "Outer Solar System" },
    { id: "Gas III (Neptune-like)",type: "GasWorld",       massEM: toEarthMasses(0.05, "JM"), zone: "Outer Solar System" },

    // Ice worlds
    { id: "Ice World A",           type: "IceWorld",       massEM: toEarthMasses(0.1, "JM"),  zone: "Optimistic Habitable" },

    // Terrestrial worlds
    { id: "Terrestrial B",         type: "TerrestrialWorld", massEM: 0.7,                     zone: "Hot" },
    { id: "Terrestrial C",         type: "TerrestrialWorld", massEM: 0.3,                     zone: "Hot" },

    // Dwarf planets
    { id: "Dwarf A",               type: "DwarfPlanet",    massEM: toEarthMasses(2.0, "LM"),  zone: "Conservative Habitable" },
    { id: "Dwarf B",               type: "DwarfPlanet",    massEM: toEarthMasses(0.5, "LM"),  zone: "Optimistic Habitable" },
    { id: "Dwarf C (Mars-like)",   type: "DwarfPlanet",    massEM: toEarthMasses(1.0, "LM"),  zone: "Conservative Habitable" },
  ];

  const placed = placePlanetaryBodies(mainWorld, others, 1.0, 1.0);

  console.log("\n--- FINAL ORBITAL ORDER (innermost → outermost) ---");
  console.log(
    "Position".padEnd(5) +
    " Body".padEnd(26) +
    " Zone".padEnd(27) +
    " AU".padStart(10) +
    "  Mass (EM)".padStart(12) +
    "  Hill (AU)"
  );
  console.log("─".repeat(90));

  placed.forEach((b, i) => {
    console.log(
      `  ${String(i + 1).padEnd(3)}` +
      b.id.padEnd(26) +
      b.zone.padEnd(27) +
      b.au.toFixed(4).padStart(10) +
      b.massEM.toFixed(4).padStart(12) +
      `  ${b.hillRadiusAU.toFixed(6)}`
    );
  });

  // Verify spacing
  console.log("\n--- SPACING VERIFICATION ---");
  for (let i = 0; i < placed.length - 1; i++) {
    const a = placed[i];
    const b = placed[i + 1];
    const sep = b.au - a.au;
    const minSep = minSeparationAU(a.au, a.massEM, b.au, b.massEM, 333_000);
    const ok = sep >= minSep;
    console.log(
      `  ${a.id.slice(0, 18).padEnd(18)} → ${b.id.slice(0, 18).padEnd(18)}` +
      `  sep=${sep.toFixed(4)} AU  min=${minSep.toFixed(4)} AU  ${ok ? "✅" : "❌ VIOLATION"}`
    );
  }

  console.log("\n====================================================\n");
}

runExample();
