// =============================================================================
// Reference Data for Earth and Sol
// Used for comparison against generated worlds and stars.
// =============================================================================

export interface EarthReference {
  massEM: number;           // Earth Masses
  densityGcm3: number;      // g/cm³
  gravity: number;          // G
  radiusKm: number;         // km
  escapeVelocity: number;   // km/s
  sizeKm: number;           // diameter km
  atmosphere: string;
  temperature: string;
  hazard: string;
  hazardIntensity: string;
  biochemicalResources: string;
}

export interface SolReference {
  class: string;            // e.g. "G2V"
  mass: number;             // Solar masses
  luminosity: number;       // Solar luminosities
  color: string;
}

export const EARTH_REFERENCE: EarthReference = {
  massEM: 1.0,
  densityGcm3: 5.51,
  gravity: 1.0,
  radiusKm: 6371,
  escapeVelocity: 11.186,
  sizeKm: 12742,            // diameter
  atmosphere: 'Average',
  temperature: 'Temperate',
  hazard: 'None',
  hazardIntensity: 'None',
  biochemicalResources: 'Abundant',
};

export const SOL_REFERENCE: SolReference = {
  class: 'G2V',
  mass: 1.0,
  luminosity: 1.0,
  color: '#FDB813',         // Approximate Sun yellow
};

/**
 * Format a reference comparison string.
 * e.g. "1.0 EM (Earth: 1.0)"
 */
export function withEarthRef(value: number, unit: string, earthValue: number): string {
  const ratio = earthValue !== 0 ? (value / earthValue) : 0;
  const pct = Math.round(ratio * 100);
  return `${value} ${unit}  ·  Earth: ${earthValue} (${pct}%)`;
}
