import { v4 as uuidv4 } from 'uuid';
import type {
  GeneratorOptions, Star, StellarClass, StellarGrade
} from '../types';
import { roll2D6, roll3D6, roll5D6 } from './dice';
import { STAR_COLORS, constrainCompanionClass, constrainCompanionGrade, getClassFromRoll, getCompanionOrbitDistance, getCompanionTarget, getGradeFromRoll, getStellarLuminosity, getStellarMass } from './stellarData';


// =====================
// Star Generation
// =====================

export function generatePrimaryStar(opts: GeneratorOptions): Star {
  const stellarClass: StellarClass = opts.starClass === 'random'
    ? getClassFromRoll(roll5D6().value)
    : (opts.starClass as StellarClass);

  const grade: StellarGrade = opts.starGrade === 'random'
    ? getGradeFromRoll(roll5D6().value)
    : (opts.starGrade as StellarGrade);

  return createStar(stellarClass, grade, true);
}

export function createStar(
  stellarClass: StellarClass,
  grade: StellarGrade,
  isPrimary: boolean,
  orbitDistance?: number,
  orbits?: 'primary' | 'companion'
): Star {
  return {
    id: uuidv4(),
    class: stellarClass,
    grade,
    mass: getStellarMass(stellarClass, grade),
    luminosity: getStellarLuminosity(stellarClass, grade),
    color: STAR_COLORS[stellarClass],
    isPrimary,
    orbitDistance,
    orbits,
  };
}

export function generateCompanionStars(primaryStar: Star): Star[] {
  const companions: Star[] = [];
  let previousStar = primaryStar;

  let shouldContinue = true;
  let safetyCounter = 0;

  while (shouldContinue && safetyCounter < 10) {
    safetyCounter++;

    const existenceRoll = roll2D6().value;
    const target = getCompanionTarget(previousStar.class === 'O' ? 7 :
      previousStar.class === 'B' ? 6 :
      previousStar.class === 'A' ? 5 :
      previousStar.class === 'F' ? 4 :
      previousStar.class === 'G' ? 3 :
      previousStar.class === 'K' ? 2 : 1);

    if (existenceRoll >= target) {
      const classRoll = roll5D6().value;
      const gradeRoll = roll5D6().value;

      let stellarClass = getClassFromRoll(classRoll);
      let grade = getGradeFromRoll(gradeRoll);

      stellarClass = constrainCompanionClass(stellarClass, previousStar.class);
      grade = constrainCompanionGrade(grade, previousStar.grade);

      const orbitRoll = roll3D6().value;
      const orbitDistance = getCompanionOrbitDistance(previousStar.class, orbitRoll);

      const companion = createStar(
        stellarClass,
        grade,
        false,
        orbitDistance,
        previousStar.isPrimary ? 'primary' : 'companion'
      );

      companions.push(companion);
      previousStar = companion;

      shouldContinue = existenceRoll === 12;
    } else {
      shouldContinue = false;
    }
  }

  return companions;
}
