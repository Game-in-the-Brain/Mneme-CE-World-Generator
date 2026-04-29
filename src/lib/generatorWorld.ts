import type {
  LesserEarthType, MainWorld, Star, WorldType, ZoneBoundaries
} from '../types';
import { roll2D6, rollKeep, rollTL } from './dice';
import { calculateTotalHabitability, calculateWorldPosition, dwarfGravityToHab, getAtmosphere, getBiochemicalResources, getDwarfDensity, getDwarfMass, getHabitatMass, getHazard, getHazardIntensity, getLesserEarthType, getTechLevel, getTemperature, getTemperatureModifier, getTerrestrialDensity, getTerrestrialMass, getWorldTypeRoll, terrestrialGravityToHab } from './worldData';


// =====================
// Main World Generation
// =====================



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateMainWorld(
  primaryStar: Star,
  _zones: ZoneBoundaries,
  forcedType: WorldType | 'random' = 'random',
  _largestBodyMass: number = 1.0,
  allowMegaStructures?: boolean,
): MainWorld {
  let worldType: WorldType;
  // eslint-disable-next-line prefer-const
  let size: number;
  let lesserEarthType: LesserEarthType | undefined;
  let massEM: number;
  let densityGcm3: number;
  // eslint-disable-next-line prefer-const
  let gravity: number;
  let gravityHabitability: number;

  // Constants for physics calculations
  const G = 6.674e-11;       // gravitational constant m³ kg⁻¹ s⁻²
  const EM_TO_KG = 5.972e24; // 1 Earth Mass in kg
  const PI = Math.PI;

  if (forcedType !== 'random') {
    worldType = forcedType;
  } else {
    const { dice, keep } = getWorldTypeRoll(primaryStar.class);
    const typeRoll = rollKeep(dice, 6, keep, 'highest', 0).value;
    if (typeRoll <= 7) {
      worldType = 'Dwarf';
    } else if (typeRoll <= 10) {
      worldType = 'Terrestrial';
    } else {
      worldType = 'Habitat';
    }
  }

  // QA-Mega+: gate Habitat generation
  if (worldType === 'Habitat' && !allowMegaStructures) {
    worldType = 'Terrestrial';
  }

  // Roll mass and density based on world type
  if (worldType === 'Dwarf') {
    massEM = getDwarfMass(roll2D6().value);
    densityGcm3 = getDwarfDensity(roll2D6().value);
    lesserEarthType = getLesserEarthType(roll2D6().value).type;
  } else if (worldType === 'Terrestrial') {
    massEM = getTerrestrialMass(roll2D6().value);
    densityGcm3 = getTerrestrialDensity(roll2D6().value);
  } else {
    // Habitat: use habitat mass table and assume low density (0.1 g/cm³ for artificial structures)
    massEM = getHabitatMass(roll2D6().value) / 5.972e12; // Convert Gt to EM (1 Gt = 1e12 kg, 1 EM = 5.972e24 kg)
    densityGcm3 = 0.1;
  }

  // Calculate physical properties from mass + density (all world types)
  const densityKgM3 = densityGcm3 * 1000;
  const massKg = massEM * EM_TO_KG;
  const volumeM3 = massKg / densityKgM3;
  const radiusM = Math.cbrt((3 * volumeM3) / (4 * PI));
  const radiusKm = radiusM / 1000;
  const diameterKm = 2 * radiusKm;
  const surfaceGravityMs2 = (G * massKg) / (radiusM * radiusM);
  const surfaceGravityG = surfaceGravityMs2 / 9.81;
  const escapeVelocityMs = Math.sqrt(2 * G * massKg / radiusM);
  const escapeVelocityKmS = escapeVelocityMs / 1000;
  
  size = Math.round(diameterKm);
  gravity = Math.round(surfaceGravityG * 1000) / 1000;
  // Store radius and escape velocity for return object
  const radius = radiusKm;
  const escapeVelocity = Math.round(escapeVelocityKmS * 100) / 100; // km/s, 2 decimal places

  // Calculate gravity habitability using threshold functions
  if (worldType === 'Dwarf') {
    gravityHabitability = dwarfGravityToHab(gravity);
  } else if (worldType === 'Terrestrial') {
    gravityHabitability = terrestrialGravityToHab(gravity);
  } else {
    // Habitat: negligible gravity penalty
    gravityHabitability = 0;
  }



  const atmoRoll = roll2D6().value;
  const atmoResult = getAtmosphere(atmoRoll);

  const tempModifier = getTemperatureModifier(atmoResult.type);
  const tempRoll = roll2D6().value + tempModifier;
  const tempResult = getTemperature(tempRoll);

  const hazardRoll = roll2D6().value;
  const hazardResult = getHazard(hazardRoll);

  const intensityRoll = roll2D6().value;
  const intensityResult = getHazardIntensity(intensityRoll);

  const bioRoll = roll2D6().value;
  const bioResult = getBiochemicalResources(bioRoll);

  // Generate Tech Level early so it can affect habitability (QA-009 fix)
  // QA-053: replaced 2D6 with 6D6 keep lowest 4 ÷ 2 for downward-biased TL distribution
  const tlRoll = rollTL();
  const techLevel = getTechLevel(tlRoll);

  // Calculate habitability WITH Tech Level modifier (QA-009 fix)
  const totalHabitability = calculateTotalHabitability(
    gravityHabitability,
    atmoResult.habitability,
    tempResult.habitability,
    hazardResult.habitability,
    intensityResult.habitability,
    bioResult.habitability,
    techLevel  // Now includes TL modifier
  );

  const position = calculateWorldPosition(atmoResult.type, tempResult.type, primaryStar.luminosity);

  // Component breakdown for debugging/analysis
  const tlModifier = Math.max(0, Math.min(9, techLevel - 7));
  const habitabilityComponents = {
    gravity: gravityHabitability,
    atmosphere: atmoResult.habitability,
    temperature: tempResult.habitability,
    hazard: hazardResult.habitability,
    hazardIntensity: intensityResult.habitability,
    biochem: bioResult.habitability,
    techLevel: tlModifier,
  };

  return {
    type: worldType,
    size,
    lesserEarthType,
    // QA-023: Mass + Density physics pipeline
    massEM,
    densityGcm3,
    gravity,
    radius,
    escapeVelocity,
    atmosphere: atmoResult.type,
    atmosphereTL: atmoResult.tl,
    temperature: tempResult.type,
    temperatureTL: tempResult.tl,
    hazard: hazardResult.type,
    hazardIntensity: intensityResult.intensity,
    hazardIntensityTL: intensityResult.tl,
    biochemicalResources: bioResult.level,
    techLevel,  // Store TL in mainWorld for use by inhabitants
    habitability: totalHabitability,
    habitabilityComponents,
    zone: position.zone,
    distanceAU: position.distanceAU,
  };
}
