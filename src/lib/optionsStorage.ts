import type { GeneratorOptions, StellarClass, StellarGrade, WorldType } from '../types';

const VALID_CLASSES = new Set<string>(['random', 'O', 'B', 'A', 'F', 'G', 'K', 'M']);
const VALID_GRADES = new Set<string>(['random', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
const VALID_TYPES = new Set<string>(['random', 'Terrestrial', 'Dwarf', 'Habitat']);

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  starClass: 'random',
  starGrade: 'random',
  mainWorldType: 'random',
  populated: true,
};

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

  return {
    starClass,
    starGrade,
    mainWorldType,
    populated,
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
