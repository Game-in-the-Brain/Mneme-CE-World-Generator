import type { HazardType, HazardIntensityType, ResourceLevel } from '../types';

// =====================
// Hazard Table
// =====================

export function getHazard(roll: number): { type: HazardType; habitability: number } {
  if (roll <= 2) return { type: 'Radioactive', habitability: -1.5 };
  if (roll <= 4) return { type: 'Toxic', habitability: -1.5 };
  if (roll <= 6) return { type: 'Biohazard', habitability: -1 };
  if (roll === 7) return { type: 'Corrosive', habitability: -1 };
  if (roll <= 9) return { type: 'Polluted', habitability: -0.5 };
  return { type: 'None', habitability: 0 };
}

// =====================
// Hazard Intensity Table
// =====================

export function getHazardIntensity(roll: number): { intensity: HazardIntensityType; tl: number; habitability: number } {
  if (roll <= 3) return { intensity: 'Intense', tl: 9, habitability: -2 };
  if (roll <= 6) return { intensity: 'High', tl: 8, habitability: -1.5 };
  if (roll <= 8) return { intensity: 'Serious', tl: 7, habitability: -1 };
  if (roll <= 10) return { intensity: 'Mild', tl: 6, habitability: -0.5 };
  return { intensity: 'Very Mild', tl: 11, habitability: 0 };
}

// =====================
// Biochemical Resources Table
// =====================

export function getBiochemicalResources(roll: number): { level: ResourceLevel; tl: number; habitability: number } {
  // Fixed: Abundant and Inexhaustible must provide POSITIVE habitability
  if (roll === 2) return { level: 'Scarce', tl: 8, habitability: -5 };
  if (roll <= 4) return { level: 'Rare', tl: 7, habitability: -4 };
  if (roll <= 7) return { level: 'Uncommon', tl: 4, habitability: -3 };
  if (roll <= 11) return { level: 'Abundant', tl: 0, habitability: 3 };  // Was 0, should be +3
  return { level: 'Inexhaustible', tl: 0, habitability: 5 };             // Correctly +5
}

// =====================
// Habitability Calculation with TL modifier
// =====================

/**
 * Calculate total habitability including Tech Level modifier.
 * 
 * TL Modifier = TL - 7, clamped to 0-9 (so TL 7 = 0, TL 8 = 1, ..., TL 16 = 9)
 * 
 * Expected component ranges:
 *   Gravity:           -2.5 to 0
 *   Atmosphere:        -2.5 to 0
 *   Temperature:       -2.0 to 0
 *   Hazard type:       -1.5 to 0
 *   Hazard intensity:  -2.0 to 0
 *   Biochem resources: -5 to +5
 *   Tech Level:         0 to +9
 */
export function calculateTotalHabitability(
  gravityHabitability: number,
  atmosphereHabitability: number,
  temperatureHabitability: number,
  hazardHabitability: number,
  hazardIntensityHabitability: number,
  biochemHabitability: number,
  techLevel: number
): number {
  // TL modifier: TL - 7, clamped 0-9
  const tlModifier = Math.max(0, Math.min(9, techLevel - 7));
  
  const total = 
    gravityHabitability +
    atmosphereHabitability +
    temperatureHabitability +
    hazardHabitability +
    hazardIntensityHabitability +
    biochemHabitability +
    tlModifier;
  
  // Debug logging in development
  if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) {
    console.log('Habitability breakdown:', {
      gravity: gravityHabitability,
      atmosphere: atmosphereHabitability,
      temperature: temperatureHabitability,
      hazard: hazardHabitability,
      hazardIntensity: hazardIntensityHabitability,
      biochem: biochemHabitability,
      techLevel,
      tlModifier,
      total: Math.round(total * 10) / 10,
    });
  }
  
  return Math.round(total * 10) / 10;
}

