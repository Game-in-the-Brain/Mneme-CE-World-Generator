import { formatNumber, formatLuminosity } from '../../lib/format';
import { STAR_COLOR_NAMES } from '../../lib/stellarData';
import type { StarSystem, Star, StellarClass, StellarGrade } from '../../types';
import { DataRow } from './tabHelpers';

export function StarTab({
  system,
  isEditing,
  originalSystem,
  onEditPrimaryStar,
}: {
  system: StarSystem;
  isEditing?: boolean;
  originalSystem?: StarSystem | null;
  onEditPrimaryStar?: (stellarClass: StellarClass, grade: StellarGrade) => void;
}) {
  const starChanged = originalSystem && (
    system.primaryStar.class !== originalSystem.primaryStar.class ||
    system.primaryStar.grade !== originalSystem.primaryStar.grade
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          Primary Star
          {starChanged && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-amber, #f59e0b)', color: '#000' }}>
              Changed
            </span>
          )}
        </h3>
        <StarDetails
          star={system.primaryStar}
          isPrimary
          isEditing={isEditing}
          onEdit={onEditPrimaryStar}
          starChanged={!!starChanged}
        />
      </div>

      {system.companionStars.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Companion Stars ({system.companionStars.length})
          </h3>
          <div className="space-y-4">
            {system.companionStars.map((star, index) => (
              <div key={star.id} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--row-hover)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Companion {index + 1}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{star.orbitDistance} AU from {star.orbits}</span>
                </div>
                <StarDetails star={star} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stellar spectrum strip (QA-003 upgraded) */}
      <StellarSpectrum starClass={system.primaryStar.class} />
    </div>
  );
}

function StarDetails({
  star,
  isEditing,
  onEdit,
  starChanged,
}: {
  star: Star;
  isPrimary?: boolean;
  isEditing?: boolean;
  onEdit?: (stellarClass: StellarClass, grade: StellarGrade) => void;
  starChanged?: boolean;
}) {
  const colorName = STAR_COLOR_NAMES[star.class];
  const SPECTRAL_CLASSES: StellarClass[] = ['O', 'B', 'A', 'F', 'G', 'K', 'M'];
  const GRADES: StellarGrade[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* QA-031: Big colour circle with name and hex */}
      <div className="p-4 rounded-lg flex flex-col items-center justify-center gap-3" style={{ backgroundColor: 'var(--row-hover)' }}>
        <div
          className="w-24 h-24 rounded-full border-4 shadow-lg"
          style={{ backgroundColor: star.color, borderColor: 'var(--border-color)' }}
          title={`${colorName} — ${star.color}`}
        />
        <div className="text-center">
          <div className="text-lg font-semibold">{colorName}</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>{star.color}</div>
        </div>
      </div>
      <div className="space-y-2">
        <DataRow label="Mass"       value={`${formatNumber(star.mass)} M☉`} />
        <DataRow label="Luminosity" value={`${formatLuminosity(star.luminosity)} L☉`} />
        <DataRow label="Temperature" value={`${formatNumber(Math.round(star.class === 'O' ? 50000 : star.class === 'B' ? 25000 : star.class === 'A' ? 10000 : star.class === 'F' ? 7000 : star.class === 'G' ? 5800 : star.class === 'K' ? 4500 : 3000))} K`} />
      </div>
      <div className="space-y-2">
        {isEditing && onEdit ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Class</span>
              <select
                value={star.class}
                onChange={(e) => onEdit(e.target.value as StellarClass, star.grade)}
                className="text-xs rounded px-2 py-1"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
              >
                {SPECTRAL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Grade</span>
              <select
                value={star.grade}
                onChange={(e) => onEdit(star.class, parseInt(e.target.value, 10) as StellarGrade)}
                className="text-xs rounded px-2 py-1"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
              >
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <DataRow label="Spectral" value={`${star.class}${star.grade}`} isChanged={starChanged} />
          </>
        ) : (
          <>
            <DataRow label="Class"  value={star.class} isChanged={starChanged} />
            <DataRow label="Grade"  value={star.grade.toString()} isChanged={starChanged} />
            <DataRow label="Spectral" value={`${star.class}${star.grade}`} isChanged={starChanged} />
          </>
        )}
      </div>
    </div>
  );
}

// Stellar spectrum strip — all 7 classes with primary highlighted (QA-003 upgraded)
const STAR_DESCRIPTIONS: Record<string, string> = {
  O: 'Rare blue-white supergiant — disks only, intense UV, no stable habitable zone',
  B: 'Hot blue giant — disks only, short stellar lifetime',
  A: 'White main sequence — disks only, borderline habitable',
  F: 'Yellow-white — habitable zone possible (Adv+2 planet count)',
  G: 'Sun-like yellow — baseline star for planet count (no modifier)',
  K: 'Orange dwarf — tidally locked worlds possible (Dis+2 planet count)',
  M: 'Red dwarf — narrow habitable zone, sparse system (Dis+4 planet count)',
};

const SPECTRAL_CLASSES: StellarClass[] = ['O', 'B', 'A', 'F', 'G', 'K', 'M'];

function StellarSpectrum({ starClass }: { starClass: StellarClass }) {
  const base = import.meta.env.BASE_URL;
  const description = STAR_DESCRIPTIONS[starClass];

  return (
    <div className="card">
      {/* Heading */}
      <div className="mb-4">
        <h3 className="font-semibold text-sm">Stellar Classification Spectrum</h3>
        <p className={`text-sm mt-1 star-${starClass}`}>{description}</p>
      </div>

      {/* Horizontal strip */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {SPECTRAL_CLASSES.map((cls) => {
          const isActive = cls === starClass;
          const imgSrc = `${base}references/Class-${cls}-star.png`;
          return (
            <div
              key={cls}
              className="flex flex-col items-center justify-center p-2 min-w-[64px]"
              style={isActive
                ? { opacity: 1, transform: 'scale(1.15)', outline: '2px solid currentColor', borderRadius: '6px' }
                : { opacity: 0.35 }
              }
            >
              <img
                src={imgSrc}
                alt={`Class ${cls}`}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className={`star-${cls} font-bold text-sm mt-1`}>{cls}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
