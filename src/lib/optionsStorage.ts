import type { GeneratorOptions, StellarClass, StellarGrade, WorldType, TLProductivityPreset, TableWeights } from '../types';
import { CE_PRESET, DEFAULT_DEVELOPMENT_WEIGHTS, DEFAULT_POWER_WEIGHTS, DEFAULT_GOV_WEIGHTS } from './economicPresets';

const VALID_CLASSES = new Set<string>(['random', 'O', 'B', 'A', 'F', 'G', 'K', 'M']);
const VALID_GRADES = new Set<string>(['random', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
const VALID_TYPES = new Set<string>(['random', 'Terrestrial', 'Dwarf', 'Habitat']);
const VALID_LIFE_PRESET_IDS = new Set<string>(['mneme-default', 'rare-earth', 'panspermia']);

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  starClass: 'random',
  starGrade: 'random',
  mainWorldType: 'random',
  populated: true,
  tlProductivityPreset: CE_PRESET,
  developmentWeights: DEFAULT_DEVELOPMENT_WEIGHTS,
  powerWeights: DEFAULT_POWER_WEIGHTS,
  govWeights: DEFAULT_GOV_WEIGHTS,
  allowShipsAtXPort: true,
  v2Positioning: true,
  activeLifeAssumptionsId: 'mneme-default',
  allowMegaStructures: false,
  rawUdpMode: false,
  includeNames: false,
};

function isValidPreset(value: unknown): value is TLProductivityPreset {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  const hasNewFields = typeof p.baseIncome === 'number' && typeof p.baseTL === 'number';
  const hasOldFields = typeof p.boatYears === 'number' && typeof p.referenceTL === 'number';
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    (hasNewFields || hasOldFields) &&
    typeof p.curve === 'string' &&
    ['mneme', 'flat', 'linear', 'custom'].includes(p.curve)
  );
}

function isValidWeights(value: unknown): value is TableWeights {
  if (!value || typeof value !== 'object') return false;
  const w = value as Record<string, unknown>;
  return Array.isArray(w.dice) && w.dice.length === 11 && w.dice.every(n => typeof n === 'number' && n >= 0);
}

/**
 * Safely load GeneratorOptions from localStorage.
 * Merges old/stored objects with current defaults and validates each field.
 * Prevents runtime errors when new fields are added over time.
 */
export function loadGeneratorOptions(): GeneratorOptions {
  let stored: Partial<GeneratorOptions> = {};
  try {
    const raw = localStorage.getItem('mneme_generator_options');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        stored = parsed;
      }
    }
  } catch {
    // Ignore parse errors and fall back to defaults
  }

  const starClass: StellarClass | 'random' =
    VALID_CLASSES.has(stored.starClass ?? '') ? (stored.starClass as StellarClass | 'random') : DEFAULT_GENERATOR_OPTIONS.starClass;

  const starGrade: StellarGrade | 'random' =
    VALID_GRADES.has(String(stored.starGrade)) ? (stored.starGrade === 'random' ? 'random' : Number(stored.starGrade) as StellarGrade) : DEFAULT_GENERATOR_OPTIONS.starGrade;

  const mainWorldType: WorldType | 'random' =
    VALID_TYPES.has(stored.mainWorldType ?? '') ? (stored.mainWorldType as WorldType | 'random') : DEFAULT_GENERATOR_OPTIONS.mainWorldType;

  const populated = typeof stored.populated === 'boolean' ? stored.populated : DEFAULT_GENERATOR_OPTIONS.populated;

  let tlProductivityPreset = DEFAULT_GENERATOR_OPTIONS.tlProductivityPreset!;
  if (isValidPreset(stored.tlProductivityPreset)) {
    tlProductivityPreset = stored.tlProductivityPreset;
    // Migrate old presets (boatYears + referenceTL) to new model (baseIncome + baseTL)
    const presetRecord = tlProductivityPreset as unknown as Record<string, unknown>;
    if (
      typeof presetRecord.boatYears === 'number' &&
      typeof presetRecord.referenceTL === 'number' &&
      (!('baseIncome' in presetRecord) || !('baseTL' in presetRecord))
    ) {
      const baseIncome = 5_320_400 / ((presetRecord.boatYears as number) * 12);
      tlProductivityPreset = {
        ...presetRecord,
        baseIncome,
        baseTL: presetRecord.referenceTL,
      } as unknown as TLProductivityPreset;
    }
  }

  const developmentWeights = isValidWeights(stored.developmentWeights)
    ? stored.developmentWeights
    : DEFAULT_GENERATOR_OPTIONS.developmentWeights!;

  const powerWeights = isValidWeights(stored.powerWeights)
    ? stored.powerWeights
    : DEFAULT_GENERATOR_OPTIONS.powerWeights!;

  const govWeights = isValidWeights(stored.govWeights)
    ? stored.govWeights
    : DEFAULT_GENERATOR_OPTIONS.govWeights!;

  const VALID_STARPORT_CLASSES = new Set<string>(['X', 'E', 'D', 'C', 'B', 'A']);
  const goalStarportMin =
    stored.goalStarportMin && VALID_STARPORT_CLASSES.has(stored.goalStarportMin)
      ? stored.goalStarportMin
      : undefined;
  const goalMinPopulation =
    typeof stored.goalMinPopulation === 'number' && stored.goalMinPopulation > 0
      ? stored.goalMinPopulation
      : undefined;
  const goalHabitable =
    typeof stored.goalHabitable === 'boolean' ? stored.goalHabitable : undefined;
  const allowShipsAtXPort =
    typeof stored.allowShipsAtXPort === 'boolean' ? stored.allowShipsAtXPort : undefined;

  const v2Positioning =
    typeof stored.v2Positioning === 'boolean' ? stored.v2Positioning : undefined;

  const activeLifeAssumptionsId =
    stored.activeLifeAssumptionsId && VALID_LIFE_PRESET_IDS.has(stored.activeLifeAssumptionsId)
      ? stored.activeLifeAssumptionsId
      : undefined;

  const allowMegaStructures =
    typeof stored.allowMegaStructures === 'boolean' ? stored.allowMegaStructures : DEFAULT_GENERATOR_OPTIONS.allowMegaStructures;

  const growthModel =
    stored.growthModel === 'compounding' || stored.growthModel === 'stable'
      ? stored.growthModel
      : DEFAULT_GENERATOR_OPTIONS.growthModel;

  const rawUdpMode =
    typeof stored.rawUdpMode === 'boolean' ? stored.rawUdpMode : DEFAULT_GENERATOR_OPTIONS.rawUdpMode;

  const includeNames =
    typeof stored.includeNames === 'boolean' ? stored.includeNames : DEFAULT_GENERATOR_OPTIONS.includeNames;

  return {
    starClass,
    starGrade,
    mainWorldType,
    populated,
    tlProductivityPreset,
    developmentWeights,
    powerWeights,
    govWeights,
    goalStarportMin,
    goalMinPopulation,
    goalHabitable,
    allowShipsAtXPort,
    v2Positioning,
    activeLifeAssumptionsId,
    allowMegaStructures,
    growthModel,
    rawUdpMode,
    includeNames,
  };
}

/**
 * Persist GeneratorOptions to localStorage.
 */
export function saveGeneratorOptions(options: GeneratorOptions): void {
  try {
    localStorage.setItem('mneme_generator_options', JSON.stringify(options));
  } catch {
    // Ignore storage errors (e.g. private mode quota exceeded)
  }
}
