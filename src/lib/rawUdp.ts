import type {
  StarSystem,
  RawUdpProfile,
  AtmosphereType,
  TemperatureType,
  Zone,
  ZoneId,
  PowerStructure,
  PowerSource,
  DevelopmentLevel,
  HazardType,
  HazardIntensityType,
} from '../types';
import { TL_TABLE } from './worldData';

// =====================
// FRD-068: RAW UDP Layer
// CE UWP presentation / export mapping
// =====================

const HEX = '0123456789ABCDEF';

function toHex(n: number): string {
  return HEX[Math.max(0, Math.min(15, n))] ?? '0';
}

// -----------------
// Size → UWP Size Code
// -----------------
export function mapSizeToUwp(sizeKm: number): number {
  const thousands = sizeKm / 1000;
  if (thousands < 1.2) return 0;
  if (thousands < 2.4) return 1;
  if (thousands < 4.0) return 2;
  if (thousands < 5.6) return 3;
  if (thousands < 7.2) return 4;
  if (thousands < 8.8) return 5;
  if (thousands < 10.4) return 6;
  if (thousands < 12.0) return 7;
  if (thousands < 13.6) return 8;
  if (thousands < 15.2) return 9;
  return Math.min(15, Math.floor(thousands / 1.6));
}

// -----------------
// Atmosphere → UWP Atmosphere Code
// -----------------
export function mapAtmosphereToUwp(atmo: AtmosphereType): number {
  switch (atmo) {
    case 'Trace': return 1;
    case 'Thin': return 3;
    case 'Average': return 6;
    case 'Dense': return 8;
    case 'Crushing': return 11;
    default: return 0;
  }
}

// -----------------
// Hydrographics → UWP Hydro Code
// -----------------
export function mapHydrographicsToUwp(
  atmo: AtmosphereType,
  temp: TemperatureType,
  zone: Zone | ZoneId
): number {
  if (atmo === 'Trace') return 0;

  let base: number;
  switch (zone) {
    case 'Infernal': base = 0; break;
    case 'Hot': base = 2; break;
    case 'Conservative': base = 6; break;
    case 'Cool': base = 4; break;
    case 'Cold': base = 4; break;
    case 'FrostLine': base = 2; break;
    case 'Outer': base = 1; break;
    case 'O1': base = 1; break;
    case 'O2': base = 0; break;
    case 'O3': base = 0; break;
    case 'O4': base = 0; break;
    case 'O5': base = 0; break;
    default: base = 0;
  }

  if (temp === 'Inferno') base = Math.max(0, base - 4);
  if (temp === 'Hot') base = Math.max(0, base - 2);
  if (temp === 'Freezing') base = Math.max(0, base - 1);
  if (temp === 'Cold') base = Math.max(0, base - 2);

  if (atmo === 'Thin') base = Math.max(0, base - 1);
  if (atmo === 'Dense') base = Math.min(10, base + 1);
  if (atmo === 'Crushing') base = Math.min(10, base + 2);

  return Math.min(10, Math.max(0, base));
}

// -----------------
// Population → UWP Population Code
// -----------------
export function mapPopulationToUwp(pop: number): number {
  if (pop <= 0) return 0;
  const exponent = Math.floor(Math.log10(pop));
  return Math.min(12, Math.max(1, exponent));
}

// -----------------
// Government → UWP Government Code (rolled from Mneme stats)
// -----------------
export function rollGovernmentFromMneme(
  powerStructure: PowerStructure,
  sourceOfPower: PowerSource,
  governance: number,
  devLevel: DevelopmentLevel
): number {
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;

  let dm = 0;
  if (powerStructure === 'Anarchy') dm -= 1;
  if (powerStructure === 'Unitary State') dm += 1;
  if (sourceOfPower === 'Kratocracy') dm -= 1;
  if (sourceOfPower === 'Democracy') dm += 1;
  if (governance < -5) dm -= 1;
  if (governance > 5) dm += 1;
  if (devLevel === 'UnderDeveloped') dm -= 1;
  if (devLevel === 'Very Developed') dm += 1;

  const result = Math.max(2, Math.min(12, roll + dm));

  const govMap: Record<number, number> = {
    2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5,
    8: 6, 9: 7, 10: 8, 11: 9, 12: 10,
  };

  if (result > 12) return Math.min(15, 10 + (result - 12));
  return govMap[result] ?? 0;
}

// -----------------
// Law Level → UWP Law Code
// -----------------
export function mapLawLevelToUwp(
  governance: number,
  hazard: HazardType,
  hazardIntensity: HazardIntensityType,
  government: number
): number {
  let lawLevel = Math.floor(Math.abs(governance) / 2);

  if (hazard === 'Radioactive') lawLevel += 2;
  if (hazard === 'Biohazard' && hazardIntensity === 'High') lawLevel += 2;
  if (hazard === 'Toxic') lawLevel += 1;
  if (hazard === 'Corrosive') lawLevel += 1;

  if (government === 0) lawLevel = 0;
  if (government === 15) lawLevel = Math.min(18, lawLevel + 4);

  return Math.min(18, Math.max(0, lawLevel));
}

// -----------------
// Tech Level → CE TL
// -----------------
export function mapTechLevelToCe(mnemeTL: number): number {
  const entry = TL_TABLE[mnemeTL];
  if (entry) return Math.round(entry.ceTL);
  if (mnemeTL < 9) return 7;
  return Math.min(15, 7 + Math.floor((mnemeTL - 9) / 2));
}

// -----------------
// Trade Codes Derivation
// -----------------
export function deriveTradeCodes(
  size: number,
  atmo: number,
  hydro: number,
  pop: number,
  gov: number,
  _law: number,
  tl: number
): string[] {
  const codes: string[] = [];

  if (atmo >= 4 && atmo <= 9 && hydro >= 4 && hydro <= 8 && pop >= 5 && pop <= 7)
    codes.push('Ag');
  if (atmo <= 3 && hydro <= 3 && pop >= 6)
    codes.push('Na');
  if (pop >= 9 && gov >= 0 && gov <= 6)
    codes.push('Hi');
  if (pop <= 3)
    codes.push('Lo');
  if (atmo >= 0 && atmo <= 1 && hydro >= 1)
    codes.push('Po');
  if (atmo >= 2 && atmo <= 5 && hydro <= 3)
    codes.push('De');
  if (atmo >= 6 && atmo <= 8 && pop >= 6 && pop <= 8 && gov >= 4 && gov <= 9)
    codes.push('Ri');
  if (tl >= 12)
    codes.push('Ht');
  if (tl <= 5)
    codes.push('Lt');
  if (atmo === 0 || atmo === 1)
    codes.push('Va');
  if (size === 0)
    codes.push('As');
  if (hydro === 10)
    codes.push('Wa');
  if (atmo >= 10 && hydro >= 1)
    codes.push('Fl');
  if (atmo >= 2 && atmo <= 5 && hydro <= 3 && pop >= 6)
    codes.push('Na');
  if (size >= 10 && atmo >= 1)
    codes.push('La');
  if (pop === 0)
    codes.push('Ba');

  return [...new Set(codes)];
}

// -----------------
// Build full RAW UDP profile from StarSystem
// -----------------
export function buildRawUdpProfile(system: StarSystem): RawUdpProfile {
  const { mainWorld, inhabitants } = system;

  // Unpopulated world shortcut
  if (inhabitants.populated === false) {
    const profile: RawUdpProfile = {
      uwp: 'X-000000-0',
      starport: 'X',
      size: 0,
      atmosphere: 0,
      hydrographics: 0,
      population: 0,
      government: 0,
      lawLevel: 0,
      techLevel: 0,
      bases: [],
      tradeCodes: ['Ba'],
      travelZone: inhabitants.travelZone,
      hasBelt: system.circumstellarDisks.length > 0 || system.dwarfPlanets.length > 0,
      hasGas: system.gasWorlds.length > 0,
      mnemeSource: {
        sizeKm: mainWorld.size,
        atmosphereType: mainWorld.atmosphere,
        populationExact: 0,
        techLevelMneme: 0,
        techLevelCe: 0,
        governmentRoll: 0,
      },
    };
    return profile;
  }

  const size = mapSizeToUwp(mainWorld.size);
  const atmosphere = mapAtmosphereToUwp(mainWorld.atmosphere);
  const hydrographics = mapHydrographicsToUwp(mainWorld.atmosphere, mainWorld.temperature, mainWorld.zone);
  const population = mapPopulationToUwp(inhabitants.population);
  const government = rollGovernmentFromMneme(
    inhabitants.powerStructure,
    inhabitants.sourceOfPower,
    inhabitants.governance,
    inhabitants.development
  );
  const lawLevel = mapLawLevelToUwp(
    inhabitants.governance,
    mainWorld.hazard,
    mainWorld.hazardIntensity,
    government
  );
  const techLevelCe = mapTechLevelToCe(inhabitants.techLevel);

  const bases: string[] = [];
  if (inhabitants.starport.hasNavalBase) bases.push('N');
  if (inhabitants.starport.hasScoutBase) bases.push('S');
  if (inhabitants.starport.hasPirateBase) bases.push('P');

  const tradeCodes = deriveTradeCodes(size, atmosphere, hydrographics, population, government, lawLevel, techLevelCe);

  const uwp = `${inhabitants.starport.class}-${toHex(size)}${toHex(atmosphere)}${toHex(hydrographics)}${toHex(population)}${toHex(government)}${toHex(lawLevel)}-${toHex(techLevelCe)}`;

  return {
    uwp,
    starport: inhabitants.starport.class,
    size,
    atmosphere,
    hydrographics,
    population,
    government,
    lawLevel,
    techLevel: techLevelCe,
    bases,
    tradeCodes,
    travelZone: inhabitants.travelZone,
    hasBelt: system.circumstellarDisks.length > 0 || system.dwarfPlanets.length > 0,
    hasGas: system.gasWorlds.length > 0,
    mnemeSource: {
      sizeKm: mainWorld.size,
      atmosphereType: mainWorld.atmosphere,
      populationExact: inhabitants.population,
      techLevelMneme: inhabitants.techLevel,
      techLevelCe,
      governmentRoll: government,
    },
  };
}
