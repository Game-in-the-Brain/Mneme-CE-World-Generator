import type { StellarClass, LesserEarthType, AtmosphereType, TemperatureType } from '../types';

// =====================
// World Type by Stellar Class
// =====================

export function getWorldTypeRoll(stellarClass: StellarClass): { dice: number; keep: number } {
  switch (stellarClass) {
    case 'F': return { dice: 4, keep: 2 };
    case 'G': return { dice: 3, keep: 2 };
    default: return { dice: 2, keep: 2 };
  }
}

// =====================
// Lesser Earth Type
// =====================

export function getLesserEarthType(roll: number): { type: LesserEarthType; modifier: number } {
  if (roll <= 7) return { type: 'Carbonaceous', modifier: 1 };
  if (roll <= 10) return { type: 'Silicaceous', modifier: 0 };
  if (roll === 11) return { type: 'Metallic', modifier: -1 };
  return { type: 'Other', modifier: 0 };
}

// =====================
// Gravity Table (DEPRECATED — QA-023)
// =====================

/*
export function getDwarfGravity(roll: number): { gravity: number; habitability: number } {
  const table: Record<number, { gravity: number; habitability: number }> = {
    2: { gravity: 0.001, habitability: -2.5 },
    3: { gravity: 0.02, habitability: -2 },
    4: { gravity: 0.04, habitability: -1.5 },
    5: { gravity: 0.06, habitability: -1 },
    6: { gravity: 0.08, habitability: -0.5 },
    7: { gravity: 0.10, habitability: -0.5 },
    8: { gravity: 0.12, habitability: -0.5 },
    9: { gravity: 0.14, habitability: -0.5 },
    10: { gravity: 0.16, habitability: 0 },
    11: { gravity: 0.18, habitability: 0 },
    12: { gravity: 0.2, habitability: 0 },
  };
  return table[roll] || table[7];
}

export function getTerrestrialGravity(roll: number): { gravity: number; habitability: number } {
  const table: Record<number, { gravity: number; habitability: number }> = {
    2: { gravity: 3.0, habitability: -2.5 },
    3: { gravity: 2.0, habitability: -2 },
    4: { gravity: 1.5, habitability: -1.5 },
    5: { gravity: 1.3, habitability: -1 },
    6: { gravity: 1.2, habitability: -0.5 },
    7: { gravity: 0.3, habitability: -0.5 },
    8: { gravity: 0.4, habitability: -0.5 },
    9: { gravity: 0.5, habitability: -0.5 },
    10: { gravity: 0.7, habitability: 0 },
    11: { gravity: 0.9, habitability: 0 },
    12: { gravity: 1.0, habitability: 0 },
  };
  return table[roll] || table[7];
}
*/

// =====================
// Mass Tables (REF-004) — QA-023
// =====================

export function getDwarfMass(roll: number): number {
  // Returns mass in Earth Masses (converted from Lunar Masses)
  const lmTable: Record<number, number> = {
    2: 0.1, 3: 0.2, 4: 0.3, 5: 0.5, 6: 0.7,
    7: 1.0, 8: 1.5, 9: 2.0, 10: 3.0, 11: 5.0, 12: 7.0,
  };
  const lm = lmTable[roll] || lmTable[7];
  return lm * 0.0123; // convert Lunar Masses to Earth Masses
}

export function getTerrestrialMass(roll: number): number {
  // Returns mass in Earth Masses
  const table: Record<number, number> = {
    2: 0.1, 3: 0.2, 4: 0.3, 5: 0.5, 6: 0.7,
    7: 1.0, 8: 1.5, 9: 2.0, 10: 3.0, 11: 5.0, 12: 7.0,
  };
  return table[roll] || table[7];
}

export function getHabitatMass(roll: number): number {
  // Returns mass in Giga‑Tons (GVT) for physics consistency
  const table: Record<number, number> = {
    2: 0.001,   // 1 MVT = 1 Mt = 0.001 Gt
    3: 0.003,
    4: 0.01,
    5: 0.03,
    6: 0.1,
    7: 0.3,
    8: 1.0,     // 1 GVT
    9: 3.0,
    10: 10.0,
    11: 30.0,
    12: 100.0,
  };
  return table[roll] || table[7];
}

// =====================
// Density Tables — QA-023 (Option B)
// =====================

export function getDwarfDensity(roll: number): number {
  const table: Record<number, number> = {
    2: 1.5,   // Carbonaceous/icy — lowest density
    3: 1.8,
    4: 2.1,
    5: 2.4,
    6: 2.7,
    7: 3.0,   // Silicaceous baseline (most common)
    8: 3.2,
    9: 3.4,
    10: 3.5,  // Metallic-rich
    11: 3.5,
    12: 3.5,
  };
  return table[roll] || table[7];
}

export function getTerrestrialDensity(roll: number): number {
  const table: Record<number, number> = {
    2: 6.5,   // Iron-core super-dense (high gravity)
    3: 6.0,
    4: 5.7,
    5: 5.4,
    6: 5.1,
    7: 5.0,   // Earth-like density (5.0 g/cm³)
    8: 4.8,
    9: 4.6,
    10: 4.4,  // Low-density silicate
    11: 4.2,
    12: 4.0,  // Lowest density (lower gravity)
  };
  return table[roll] || table[7];
}

// =====================
// Gravity-to-Habitability Threshold Functions — QA-023 (Option B)
// =====================

export function dwarfGravityToHab(gravityG: number): number {
  if (gravityG < 0.06) return -2.5;   // Extremely low gravity
  if (gravityG < 0.08) return -2.0;   // Very low gravity
  if (gravityG < 0.10) return -1.5;   // Low gravity
  if (gravityG < 0.12) return -1.0;   // Moderately low gravity
  if (gravityG < 0.16) return -0.5;   // Slightly low gravity
  return 0;                           // Adequate gravity (≥0.16G)
}

export function terrestrialGravityToHab(gravityG: number): number {
  if (gravityG > 1.8) return -2.5;    // Crushing gravity
  if (gravityG > 1.4) return -2.0;    // Very high gravity
  if (gravityG > 1.2) return -1.5;    // High gravity
  if (gravityG > 1.0) return -1.0;    // Moderately high gravity
  if (gravityG < 0.5) return -0.5;    // Too low gravity
  if (gravityG < 0.7) return -0.5;    // Low gravity
  return 0;                           // Optimal (0.7–1.0G)
}

// =====================
// Atmosphere Table
// =====================

export function getAtmosphere(roll: number): { type: AtmosphereType; tl: number; habitability: number } {
  if (roll <= 1) return { type: 'Crushing', tl: 9, habitability: -2.5 };
  if (roll <= 5) return { type: 'Dense', tl: 8, habitability: -2 };
  if (roll <= 8) return { type: 'Trace', tl: 8, habitability: -1.5 };
  if (roll <= 11) return { type: 'Thin', tl: 7, habitability: -1 };
  return { type: 'Average', tl: 0, habitability: 0 };
}

// =====================
// Temperature Table
// =====================

export function getTemperatureModifier(atmosphere: AtmosphereType): number {
  switch (atmosphere) {
    case 'Crushing': return 2;
    case 'Dense': return 1;
    case 'Thin': return -1;
    case 'Trace': return -2;
    default: return 0;
  }
}

export function getTemperature(roll: number): { type: TemperatureType; tl: number; habitability: number } {
  if (roll <= 2) return { type: 'Inferno', tl: 8, habitability: -2 };
  if (roll <= 6) return { type: 'Hot', tl: 7, habitability: -1.5 };
  if (roll <= 10) return { type: 'Freezing', tl: 7, habitability: -1 };
  if (roll === 11) return { type: 'Cold', tl: 6, habitability: -0.5 };
  return { type: 'Average', tl: 0, habitability: 0 };
}

