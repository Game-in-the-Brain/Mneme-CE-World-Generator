import { useRef, useState, useEffect, useCallback } from 'react';
import type { StarSystem, Star, MainWorld, Inhabitants, PlanetaryBody, StellarClass, BodyAnnotations, ShipsInAreaResult, ShipLocation } from '../types';
import { exportToDocx } from '../lib/exportDocx';
import { FileJson, FileSpreadsheet, FileText, Sun, Globe, Users, Building, Anchor, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
// @ts-ignore - lucide-react types
import { formatNumber, formatLuminosity, formatValue, formatCredits, formatAnnualTrade, formatPopulation } from '../lib/format';
import {
  CULTURE_TRAIT_DESCRIPTIONS,
  WEALTH_DESCRIPTIONS,
  POWER_STRUCTURE_DESCRIPTIONS,
  DEVELOPMENT_DESCRIPTIONS,
  SOURCE_OF_POWER_DESCRIPTIONS,
  TL_TABLE,
} from '../lib/worldData';
import { generateShipsInTheArea } from '../lib/shipsInArea';

interface SystemViewerProps {
  system: StarSystem;
  onUpdateSystem?: (system: StarSystem) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onGlossary?: () => void;
}

type TabId = 'overview' | 'star' | 'world' | 'inhabitants' | 'system';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: 'Overview',         icon: <Sparkles size={16} /> },
  { id: 'star',        label: 'Star',             icon: <Sun size={16} /> },
  { id: 'world',       label: 'World',            icon: <Globe size={16} /> },
  { id: 'inhabitants', label: 'Inhabitants',      icon: <Users size={16} /> },
  { id: 'system',      label: 'Planetary System', icon: <Building size={16} /> },
];

// QA-010: Single-page anchor tabs — each section is always rendered;
// tab buttons scroll to the corresponding section.
export function SystemViewer({ system, onUpdateSystem, onExportJSON, onExportCSV, onGlossary }: SystemViewerProps) {
  const sectionRefs: Record<TabId, React.RefObject<HTMLDivElement | null>> = {
    overview:    useRef<HTMLDivElement | null>(null),
    star:        useRef<HTMLDivElement | null>(null),
    world:       useRef<HTMLDivElement | null>(null),
    inhabitants: useRef<HTMLDivElement | null>(null),
    system:      useRef<HTMLDivElement | null>(null),
  };

  function scrollTo(id: TabId) {
    sectionRefs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Body annotations — persisted per system (localStorage)
  const [annotations, setAnnotations] = useState<BodyAnnotations>({});
  const [shipsResult, setShipsResult] = useState<ShipsInAreaResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`mneme_annotations_${system.id}`);
    if (stored) {
      try { setAnnotations(JSON.parse(stored) as BodyAnnotations); } catch { setAnnotations({}); }
    } else {
      setAnnotations({});
    }
  }, [system.id]);

  const handleAnnotation = useCallback(
    (id: string, field: 'name' | 'notes', value: string) => {
      setAnnotations(prev => {
        const next = {
          ...prev,
          [id]: { ...(prev[id] ?? { name: '', notes: '' }), [field]: value },
        };
        localStorage.setItem(`mneme_annotations_${system.id}`, JSON.stringify(next));
        return next;
      });
    },
    [system.id],
  );

  const handleExportDocx = useCallback(async () => {
    await exportToDocx(system, annotations, shipsResult);
  }, [system, annotations, shipsResult]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-4xl font-bold star-${system.primaryStar.class}`}>
              {system.primaryStar.class}{system.primaryStar.grade}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>Primary Star</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Generated {new Date(system.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onExportJSON} className="btn-secondary flex items-center gap-2">
            <FileJson size={16} />
            JSON
          </button>
          <button onClick={onExportCSV} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={16} />
            CSV
          </button>
          <button onClick={handleExportDocx} className="btn-secondary flex items-center gap-2">
            <FileText size={16} />
            DOCX
          </button>
        </div>
      </div>

      {/* Sticky tab bar — scrolls to each section (QA-010) */}
      <div className="sticky top-0 z-20 border-b pb-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollTo(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-[#9e9e9e] hover:text-white hover:bg-white/5"
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* All sections rendered inline — scrollable single page (QA-010) */}
      <section ref={sectionRefs.overview} id="overview" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles style={{ color: 'var(--accent-red)' }} size={20} />
          Overview
        </h2>
        <OverviewTab system={system} />
      </section>

      <section ref={sectionRefs.star} id="star" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sun style={{ color: 'var(--accent-red)' }} size={20} />
          Star
        </h2>
        <StarTab system={system} />
      </section>

      <section ref={sectionRefs.world} id="world" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Globe style={{ color: 'var(--accent-red)' }} size={20} />
          World
        </h2>
        <WorldTab world={system.mainWorld} />
      </section>

      <section ref={sectionRefs.inhabitants} id="inhabitants" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users style={{ color: 'var(--accent-red)' }} size={20} />
          Inhabitants
        </h2>
        <InhabitantsTab inhabitants={system.inhabitants} system={system} onUpdateSystem={onUpdateSystem} shipsResult={shipsResult} setShipsResult={setShipsResult} />
      </section>

      <section ref={sectionRefs.system} id="planetary-system" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Building style={{ color: 'var(--accent-red)' }} size={20} />
          Planetary System
        </h2>
        <PlanetarySystemTab system={system} annotations={annotations} onAnnotation={handleAnnotation} />
      </section>

      {onGlossary && (
        <div className="mt-8 pt-4 border-t text-center text-xs"
             style={{ borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)' }}>
          † All abbreviations and units explained in the{' '}
          <button
            onClick={onGlossary}
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent-red)' }}
          >
            Definitions &amp; Units Glossary
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Overview Tab
// ============================================================

function OverviewTab({ system }: { system: StarSystem }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sun style={{ color: 'var(--accent-red)' }} size={20} />
          Star System
        </h3>
        <div className="space-y-2">
          <DataRow label="Primary Star"  value={`${system.primaryStar.class}${system.primaryStar.grade}`} />
          <DataRow label="Mass"          value={`${formatNumber(system.primaryStar.mass)} M☉`} />
          <DataRow label="Luminosity"    value={`${formatLuminosity(system.primaryStar.luminosity)} L☉`} />
          <DataRow label="Companions"    value={system.companionStars.length.toString()} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe style={{ color: 'var(--accent-red)' }} size={20} />
          Main World
        </h3>
        <div className="space-y-2">
          <DataRow label="Type"         value={system.mainWorld.type} />
          <DataRow label="Size"         value={`${formatNumber(system.mainWorld.size)} km`} />
          <DataRow label="Gravity"      value={`${system.mainWorld.gravity} G`} />
          <DataRow label="Habitability" value={system.mainWorld.habitability.toString()} className={
            system.mainWorld.habitability > 5  ? 'habitability-excellent' :
            system.mainWorld.habitability > 0  ? 'habitability-good' :
            system.mainWorld.habitability > -5 ? 'habitability-marginal' :
            'habitability-hostile'
          } />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users style={{ color: 'var(--accent-red)' }} size={20} />
          Inhabitants
        </h3>
        <div className="space-y-2">
          <DataRow label="Tech Level"  value={`TL ${system.inhabitants.techLevel}`} />
          <DataRow label="Population"  value={formatPopulation(system.inhabitants.population)} />
          <DataRow label="Wealth"      value={system.inhabitants.wealth} />
          <DataRow label="Government"  value={`${system.inhabitants.powerStructure} (${system.inhabitants.sourceOfPower})`} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Anchor style={{ color: 'var(--accent-red)' }} size={20} />
          Starport & Travel
        </h3>
        <div className="space-y-2">
          <DataRow label="Starport"    value={`Class ${system.inhabitants.starport.class}`} />
          <DataRow label="This week"   value={formatCredits(system.inhabitants.starport.weeklyActivity)} />
          <DataRow label="Bases"       value={[
            system.inhabitants.starport.hasNavalBase  && 'Naval',
            system.inhabitants.starport.hasScoutBase  && 'Scout',
            system.inhabitants.starport.hasPirateBase && 'Pirate',
          ].filter(Boolean).join(', ') || 'None'} />
          <DataRow label="Travel Zone" value={system.inhabitants.travelZone} className={
            system.inhabitants.travelZone === 'Green' ? 'habitability-excellent' :
            system.inhabitants.travelZone === 'Amber' ? 'habitability-marginal' :
            'habitability-hostile'
          } />
        </div>
      </div>

      <div className="card md:col-span-2">
        <h3 className="text-lg font-semibold mb-3">Zone Boundaries (AU)</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-sm">
          <ZoneBox label="Infernal" range={`0–${system.zones.infernal.max.toFixed(2)}`}            color="zone-infernal" />
          <ZoneBox label="Hot"      range={`${system.zones.hot.min.toFixed(2)}–${system.zones.hot.max.toFixed(2)}`} color="zone-hot" />
          <ZoneBox label="Habitable" range={`${system.zones.conservative.min.toFixed(2)}–${system.zones.conservative.max.toFixed(2)}`} color="zone-conservative" />
          <ZoneBox label="Cold"     range={`${system.zones.cold.min.toFixed(2)}–${system.zones.cold.max.toFixed(2)}`} color="zone-cold" />
          <ZoneBox label="Outer"    range={`≥${system.zones.outer.min.toFixed(2)}`}               color="zone-outer" />
        </div>
        <div className="mt-3 p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Main World Position: </span>
          <span className={`font-semibold zone-${system.mainWorld.zone.toLowerCase().replace(' ', '-')}`}>
            {system.mainWorld.zone} Zone at {system.mainWorld.distanceAU} AU
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Star Tab — includes stellar classification reference (QA-003)
// ============================================================

function StarTab({ system }: { system: StarSystem }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Primary Star</h3>
        <StarDetails star={system.primaryStar} isPrimary />
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

function StarDetails({ star }: { star: Star; isPrimary?: boolean }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--row-hover)' }}>
        <div className={`text-4xl font-bold mb-2 star-${star.class}`}>
          {star.class}{star.grade}
        </div>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Spectral Classification</div>
      </div>
      <div className="space-y-2">
        <DataRow label="Mass"       value={`${formatNumber(star.mass)} M☉`} />
        <DataRow label="Luminosity" value={`${formatLuminosity(star.luminosity)} L☉`} />
        <DataRow label="Color"      value={star.color} />
      </div>
      <div className="space-y-2">
        <DataRow label="Class"  value={star.class} />
        <DataRow label="Grade"  value={star.grade.toString()} />
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

// ============================================================
// World Tab
// ============================================================

function WorldTab({ world }: { world: MainWorld }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Physical Characteristics</h3>
        <div className="space-y-2">
          <DataRow label="Type"            value={world.type} />
          <DataRow label="Size"            value={`${formatNumber(world.size)} km`} />
          <DataRow label="Gravity"         value={`${world.gravity} G`} />
          <DataRow label="Radius"          value={`${formatNumber(world.radius)} km`} />
          <DataRow label="Escape Velocity" value={`${formatNumber(world.escapeVelocity)} km/s`} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Environment</h3>
        <div className="space-y-2">
          <DataRow label="Atmosphere"  value={`${world.atmosphere} (TL${world.atmosphereTL})`} />
          <DataRow label="Temperature" value={`${world.temperature} (TL${world.temperatureTL})`} />
          <DataRow
            label="Hazard"
            value={world.hazard !== 'None'
              ? `${world.hazard} (${world.hazardIntensity}, TL${world.hazardIntensityTL})`
              : 'None'}
          />
          <DataRow label="Resources" value={world.biochemicalResources} />
        </div>
      </div>

      <div className="card md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Habitability Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HabitabilityBox label="Total"       value={world.habitability} />
          <HabitabilityBox label="Atmosphere"  value={getAtmosphereHabitability(world.atmosphere)} />
          <HabitabilityBox label="Temperature" value={getTemperatureHabitability(world.temperature)} />
          <HabitabilityBox label="Hazard"      value={getHazardHabitability(world.hazard, world.hazardIntensity)} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Inhabitants Tab
// ============================================================

function CultureTraitList({ traits }: { traits: string[] }) {
  if (traits.length === 0) return <span style={{ color: 'var(--text-secondary)' }}>None</span>;
  return (
    <div className="space-y-3 mt-1">
      {traits.map(trait => (
        <CultureTraitCard key={trait} trait={trait} />
      ))}
    </div>
  );
}

function CultureTraitCard({ trait }: { trait: string }) {
  const description = CULTURE_TRAIT_DESCRIPTIONS[trait] ?? 'No description available.';
  return (
    <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)',
         borderLeft: '3px solid var(--accent-red)' }}>
      <div className="font-semibold text-sm mb-1">{trait}</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </div>
    </div>
  );
}

function TechLevelCard({ tl }: { tl: number }) {
  const [expanded, setExpanded] = useState(false);
  const entry = TL_TABLE[tl];

  if (!entry) {
    return (
      <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
        <span className="font-bold text-lg" style={{ color: 'var(--accent-red)' }}>MTL {tl}</span>
      </div>
    );
  }

  return (
    <div className="rounded overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
      {/* Collapsed header — always visible */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        style={{ backgroundColor: 'var(--row-hover)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg" style={{ color: 'var(--accent-red)' }}>
            MTL {entry.mtl}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            CE TL {entry.ceTL}
          </span>
          <span className="text-sm font-semibold">{entry.eraName}</span>
        </div>
        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <span className="text-xs">{entry.ceYear}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded key technologies */}
      {expanded && (
        <div className="p-3 border-t text-sm" style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-secondary)',
        }}>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-red)' }}>
            Key Technologies — {entry.heYear}
          </div>
          {entry.keyTechnologies}
        </div>
      )}
    </div>
  );
}

function DescriptionCard({ title, subtitle, description }: {
  title: string;
  subtitle?: string;
  description: string;
}) {
  return (
    <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)',
         borderLeft: '3px solid var(--accent-red)' }}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-semibold text-sm">{title}</span>
        {subtitle && (
          <span className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{subtitle}</span>
        )}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </div>
    </div>
  );
}

function FootnoteBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 p-2 rounded text-xs" style={{
      backgroundColor: 'var(--row-hover)',
      color: 'var(--text-secondary)',
      borderLeft: '2px solid var(--border-color)',
    }}>
      {children}
    </div>
  );
}

function InhabitantsTab({ inhabitants, system, onUpdateSystem, shipsResult, setShipsResult }: { inhabitants: Inhabitants; system: StarSystem; onUpdateSystem?: (system: StarSystem) => void; shipsResult: ShipsInAreaResult | null; setShipsResult: (r: ShipsInAreaResult | null) => void }) {
  const isPopulated = inhabitants.populated !== false;

  if (!isPopulated) {
    return (
      <div className="card text-center py-12">
        <div className="text-2xl font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>—</div>
        <h3 className="text-xl font-semibold mb-2">Unpopulated World</h3>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          No permanent inhabitants. No starport, government, or cultural institutions exist on this world.
        </p>
      </div>
    );
  }

  const wealthDesc = WEALTH_DESCRIPTIONS[inhabitants.wealth];
  const govDesc    = POWER_STRUCTURE_DESCRIPTIONS[inhabitants.powerStructure];
  const devDesc    = DEVELOPMENT_DESCRIPTIONS[inhabitants.development];
  const powerDesc  = SOURCE_OF_POWER_DESCRIPTIONS[inhabitants.sourceOfPower];
  const govSign    = inhabitants.governance >= 0 ? `+${inhabitants.governance}` : `${inhabitants.governance}`;

  function handleRollWeekly() {
    if (!onUpdateSystem) return;
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + d3;
    const weeklyActivity = inhabitants.starport.weeklyBase * total;
    const updated: StarSystem = {
      ...system,
      inhabitants: {
        ...system.inhabitants,
        starport: {
          ...system.inhabitants.starport,
          weeklyRoll: total,
          weeklyActivity,
        },
      },
    };
    onUpdateSystem(updated);
  }

  function handleGenerateShips() {
    // QA-024: pass total body count so "In System" ships get a position index 1–N
    const totalBodies =
      (system.circumstellarDisks?.length ?? 0) +
      (system.dwarfPlanets?.length ?? 0) +
      (system.terrestrialWorlds?.length ?? 0) +
      (system.iceWorlds?.length ?? 0) +
      (system.gasWorlds?.length ?? 0);
    const result = generateShipsInTheArea(inhabitants.starport.weeklyActivity, totalBodies);
    setShipsResult(result);
  }

  const weeklyRoll = inhabitants.starport.weeklyRoll;

  return (
    <div className="grid md:grid-cols-2 gap-6">

      {/* Demographics */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Demographics</h3>

        <TechLevelCard tl={inhabitants.techLevel} />

        {/* Population — prominent */}
        <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
          <div className="text-3xl font-bold" style={{ color: 'var(--accent-red)' }}>
            {formatPopulation(inhabitants.population)}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Population</div>
          {inhabitants.habitatType && (
            <div className="mt-2 text-xs font-semibold px-2 py-1 rounded inline-block"
                 style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
              {inhabitants.habitatType} — Artificial Habitat
            </div>
          )}
          {inhabitants.habitatType && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Habitability ≤ 0: surface is inhospitable. Inhabitants live and work inside an enclosed artificial structure.
            </p>
          )}
        </div>

        {/* Wealth */}
        <div>
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Wealth</div>
          <DescriptionCard
            title={inhabitants.wealth}
            description={wealthDesc.description}
          />
        </div>

        {/* Development */}
        <div>
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>World Development</div>
          <DescriptionCard
            title={inhabitants.development}
            subtitle={`HDI ${devDesc.hdi}`}
            description={devDesc.description}
          />
        </div>
      </div>

      {/* Government */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Government</h3>

        {/* Power Structure */}
        <div>
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Power Structure</div>
          <DescriptionCard
            title={inhabitants.powerStructure}
            description={govDesc.description}
          />
        </div>

        {/* Source of Power */}
        <div>
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Source of Power</div>
          <DescriptionCard
            title={inhabitants.sourceOfPower}
            description={powerDesc.description}
          />
        </div>

        {/* Governance DM */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Governance DM</span>
            <span className="font-bold text-lg">{govSign}</span>
          </div>
          <FootnoteBlock>
            <strong>What this means:</strong> The Governance DM is a cross-table modifier derived from
            Development Level × Wealth Level. It ranges from −9 (UnderDeveloped / Average) to +14
            (Very Developed / Affluent). A high positive DM reflects a world whose wealth and
            development create stable, effective institutions. A large negative DM indicates a
            fragile or predatory state where governance is contested, corrupt, or absent. The DM
            is applied to social and political encounter rolls throughout the game.
          </FootnoteBlock>
        </div>
      </div>

      {/* Starport */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Starport</h3>
        <div className="space-y-2">
          <DataRow label="Class"      value={`Class ${inhabitants.starport.class}`} />
          <DataRow label="PSS"        value={`${inhabitants.starport.pss} (raw ${inhabitants.starport.rawClass}, TL cap ${inhabitants.starport.tlCap})`} />
          <DataRow
            label="Bases"
            value={[
              inhabitants.starport.hasNavalBase  && 'Naval Base',
              inhabitants.starport.hasScoutBase  && 'Scout Base',
              inhabitants.starport.hasPirateBase && 'Pirate Base',
            ].filter(Boolean).join(', ') || 'None'}
          />
          <DataRow label="Annual Trade" value={formatAnnualTrade(inhabitants.starport.annualTrade)} />
          <DataRow label="Weekly Base"  value={formatCredits(inhabitants.starport.weeklyBase)} />
        </div>

        {/* Weekly activity with roll button (FR-029) */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>This Week</span>
            <span className="font-bold">{formatCredits(inhabitants.starport.weeklyActivity)}</span>
          </div>
          {weeklyRoll !== undefined && (
            <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Rolled 3D6: <span className="font-mono">{weeklyRoll}</span>
            </div>
          )}
          <button
            onClick={handleRollWeekly}
            disabled={!onUpdateSystem}
            className="text-xs px-3 py-1.5 rounded border transition-colors"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            Roll 3D6
          </button>
          <FootnoteBlock>
            <strong>What this means:</strong> Weekly throughput = (Annual Port Trade ÷ 364) × 3D6.
            Annual Port Trade = Population × GDP/person/day × 365 × Trade Fraction × Wealth Multiplier.
            PSS = floor(log₁₀(Annual Trade)) − 10. Final class = min(PSS class, TL capability cap).
            TL sets the capability ceiling — no amount of money lets a TL 9 world build jump drives.
            Roll varies week to week; this figure reflects conditions when you arrived.
          </FootnoteBlock>
        </div>
      </div>

      {/* Ships in the Area (FR-030) */}
      <div className="card space-y-4 md:col-span-2">
        <h3 className="text-lg font-semibold">Ships in the Area</h3>
        <button
          onClick={handleGenerateShips}
          className="text-xs px-3 py-1.5 rounded border transition-colors"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          Generate Ships in the Area
        </button>

        {shipsResult && (
          <div className="space-y-4">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Budget: {formatCredits(shipsResult.budget)} ({shipsResult.distributionRoll} on distribution table)
            </div>
            <div className="space-y-3">
              <ShipLocationGroup
                label="In Orbit"
                ships={shipsResult.ships.filter(s => s.location === 'Orbit')}
              />
              {/* QA-024: "In System" ships shown per body position */}
              {(() => {
                const systemShips = shipsResult.ships.filter(s => s.location === 'System');
                if (systemShips.length === 0) return (
                  <ShipLocationGroup label="In System" ships={[]} />
                );
                const byBody = new Map<number, typeof systemShips>();
                for (const ship of systemShips) {
                  const pos = ship.systemPosition ?? 1;
                  if (!byBody.has(pos)) byBody.set(pos, []);
                  byBody.get(pos)!.push(ship);
                }
                return Array.from(byBody.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([pos, ships]) => (
                    <ShipLocationGroup
                      key={`system-${pos}`}
                      label={`In System — Body ${pos}`}
                      ships={ships}
                    />
                  ));
              })()}
              <ShipLocationGroup
                label="Docked at Starport"
                ships={shipsResult.ships.filter(s => s.location === 'Docked')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Travel & Culture */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Travel &amp; Culture</h3>
        <div className="space-y-2">
          <DataRow
            label="Travel Zone"
            value={inhabitants.travelZone + (inhabitants.travelZoneReason ? ` — ${inhabitants.travelZoneReason}` : '')}
          />
        </div>
        <div>
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Culture Traits
          </div>
          <CultureTraitList traits={inhabitants.cultureTraits} />
        </div>
      </div>

    </div>
  );
}

function ShipLocationGroup({ label, ships }: { label: string; ships: { name: string; dt: number; monthlyOperatingCost: number; location: ShipLocation; systemPosition?: number; trafficPool: 'small' | 'civilian' | 'warship' }[] }) {
  if (ships.length === 0) {
    return (
      <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
        <div className="font-medium text-sm mb-1">{label}</div>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>None</div>
      </div>
    );
  }

  const counts = new Map<string, { count: number; dt: number; cost: number }>();
  for (const s of ships) {
    const existing = counts.get(s.name);
    if (existing) {
      existing.count++;
      existing.cost += s.monthlyOperatingCost;
    } else {
      counts.set(s.name, { count: 1, dt: s.dt, cost: s.monthlyOperatingCost });
    }
  }

  const totalCost = ships.reduce((sum, s) => sum + s.monthlyOperatingCost, 0);

  return (
    <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
      <div className="font-medium text-sm mb-2 flex items-baseline justify-between">
        <span>{label}</span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ships.length} ship{ships.length === 1 ? '' : 's'}</span>
      </div>
      <div className="space-y-1">
        {Array.from(counts.entries()).map(([name, info]) => (
          <div key={name} className="flex items-baseline justify-between text-sm">
            <span>{info.count > 1 ? `${info.count}× ` : ''}{name} ({info.dt} DT)</span>
          </div>
        ))}
      </div>
      <div className="text-xs mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
        Total operating cost: {formatCredits(totalCost)}
      </div>
    </div>
  );
}

// ============================================================
// Planetary System Tab — with physical properties (QA-009)
// ============================================================

function PlanetarySystemTab({
  system, annotations, onAnnotation,
}: {
  system: StarSystem;
  annotations: BodyAnnotations;
  onAnnotation: (id: string, field: 'name' | 'notes', value: string) => void;
}) {
  const totalBodies =
    system.circumstellarDisks.length +
    system.dwarfPlanets.length +
    system.terrestrialWorlds.length +
    system.iceWorlds.length +
    system.gasWorlds.length;

  // QA-008: Ice Worlds label (typeLabel uses "Ice Worlds" not "Ice")
  type BodyWithExtras = PlanetaryBody & { 
    typeLabel: string; 
    isMainWorld: boolean;
    atmosphere?: string; 
    temperature?: string; 
    habitability?: number;
  };

  const mainWorldBody: BodyWithExtras = {
    id:          `${system.id}-mainworld`,
    type:        'terrestrial' as const,  // Main world is always terrestrial type for body purposes
    typeLabel:   system.mainWorld.type,
    isMainWorld: true,
    mass:        system.mainWorld.size,   // size (km) used as stand-in — shown separately
    zone:        system.mainWorld.zone,
    distanceAU:  system.mainWorld.distanceAU,
    // physics from main world
    radiusKm:    system.mainWorld.radius,
    diameterKm:  system.mainWorld.radius * 2,
    surfaceGravityG: system.mainWorld.gravity,
    escapeVelocityMs: system.mainWorld.escapeVelocity * 1000, // km/s → m/s
    densityGcm3: undefined,
    gasClass:    undefined,
    lesserEarthType: system.mainWorld.lesserEarthType,
    // extras
    atmosphere:  system.mainWorld.atmosphere,
    temperature: system.mainWorld.temperature,
    habitability: system.mainWorld.habitability,
  };

  const allBodies: BodyWithExtras[] = [
    ...system.circumstellarDisks.map(b => ({ ...b, typeLabel: 'Disk',        isMainWorld: false as const })),
    ...system.dwarfPlanets.map(b =>       ({ ...b, typeLabel: 'Dwarf',       isMainWorld: false as const })),
    ...system.terrestrialWorlds.map(b =>  ({ ...b, typeLabel: 'Terrestrial', isMainWorld: false as const })),
    ...system.iceWorlds.map(b =>          ({ ...b, typeLabel: 'Ice Worlds',  isMainWorld: false as const })),
    ...system.gasWorlds.map(b =>          ({ ...b, typeLabel: `Gas ${b.gasClass}`, isMainWorld: false as const })),
    mainWorldBody,
  ].sort((a, b) => a.distanceAU - b.distanceAU);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <BodyCountCard label="Disks"       count={system.circumstellarDisks.length} />
        <BodyCountCard label="Dwarfs"      count={system.dwarfPlanets.length} />
        <BodyCountCard label="Terrestrial" count={system.terrestrialWorlds.length} />
        <BodyCountCard label="Ice Worlds"  count={system.iceWorlds.length} />
        <BodyCountCard label="Gas Giants"  count={system.gasWorlds.length} />
      </div>

      <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
        Total Planetary Bodies: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{totalBodies}</span>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">All Bodies by Distance</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {allBodies.map((body, index) => (
            <BodyRow key={body.id} body={body} index={index} annotations={annotations} onAnnotation={onAnnotation} isMainWorld={body.isMainWorld} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Individual body row — always expandable; inline Name + Notes annotation fields + physical properties (QA-009)
function BodyRow({
  body, index, annotations, onAnnotation, isMainWorld,
}: {
  body: PlanetaryBody & { typeLabel: string; atmosphere?: string; temperature?: string; habitability?: number };
  index: number;
  annotations: BodyAnnotations;
  onAnnotation: (id: string, field: 'name' | 'notes', value: string) => void;
  isMainWorld?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasPhysics = body.radiusKm != null;
  const ann = annotations[body.id] ?? { name: '', notes: '' };

  return (
    <div className="rounded text-sm" style={{ backgroundColor: 'var(--row-hover)' }}>
      <div
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <span className="w-5 shrink-0 text-xs" style={{ color: 'var(--text-secondary)' }}>{index + 1}</span>
          <span className="font-medium shrink-0 text-xs">{body.typeLabel}</span>
          {body.gasClass && (
            <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'var(--border-color)' }}>
              {body.gasClass}
            </span>
          )}
          {body.lesserEarthType && (
            <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'var(--border-color)' }}>
              {body.lesserEarthType}
            </span>
          )}
          {/* Inline name input — always visible, auto-saved */}
          <input
            type="text"
            value={ann.name}
            onChange={e => onAnnotation(body.id, 'name', e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            placeholder="Name…"
            className="text-xs flex-1 min-w-0"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.1rem 0.2rem',
              outline: 'none',
              maxWidth: '11rem',
            }}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {isMainWorld && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-red)', color: 'white' }}>
              MAIN WORLD
            </span>
          )}
          <span className={`text-xs zone-${body.zone.toLowerCase().replace(' ', '-')}`}>{body.zone}</span>
          <span className="text-xs">{body.distanceAU} AU</span>
          {!isMainWorld && <span className="text-xs">{formatValue(body.mass, 'M⊕')}</span>}
          {isMainWorld && body.habitability !== undefined && (
            <span className="text-xs">Hab {body.habitability >= 0 ? '+' : ''}{body.habitability}</span>
          )}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t space-y-3 pt-3" style={{ borderColor: 'var(--border-color)' }}>
          {/* Notes annotation field */}
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
            <input
              type="text"
              value={ann.notes}
              onChange={e => onAnnotation(body.id, 'notes', e.target.value)}
              onClick={e => e.stopPropagation()}
              placeholder="e.g. Mining colony, rich in iron"
              className="w-full text-xs"
              style={{
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-primary)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* Physical properties (QA-009) */}
          {hasPhysics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {body.densityGcm3 != null && <PhysProp label="Density" value={`${body.densityGcm3} g/cm³`} />}
              <PhysProp label="Radius"          value={`${formatNumber(body.radiusKm!)} km`} />
              <PhysProp label="Diameter"        value={`${formatNumber(body.diameterKm!)} km`} />
              <PhysProp label="Surface Gravity" value={`${body.surfaceGravityG} G`} />
              <PhysProp label="Escape Velocity" value={`${formatNumber(body.escapeVelocityMs!)} m/s`} />
            </div>
          )}
          {/* Main World — environment details */}
          {isMainWorld && body.atmosphere && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <PhysProp label="Atmosphere"   value={body.atmosphere} />
              <PhysProp label="Temperature"  value={body.temperature ?? '—'} />
              <PhysProp label="Habitability" value={body.habitability !== undefined ? `${body.habitability >= 0 ? '+' : ''}${body.habitability}` : '—'} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PhysProp({ label, value }: { label: string; value: string }) {
  return (
    <div className="pt-2">
      <div style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

// ============================================================
// Shared Helper Components
// ============================================================

function DataRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className={`font-medium ${className}`}>{value}</span>
    </div>
  );
}

function ZoneBox({ label, range, color }: { label: string; range: string; color: string }) {
  return (
    <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
      <div className={`font-semibold ${color}`}>{label}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{range}</div>
    </div>
  );
}

function HabitabilityBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
      <div className={`text-2xl font-bold ${
        value > 0  ? 'habitability-excellent' :
        value === 0 ? '' :
        'habitability-hostile'
      }`} style={value === 0 ? { color: 'var(--text-secondary)' } : {}}>
        {value > 0 ? `+${value}` : value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

function BodyCountCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="card text-center p-4">
      <div className="text-2xl font-bold" style={{ color: 'var(--accent-red)' }}>{count}</div>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

// ============================================================
// Habitability helper functions
// ============================================================

function getAtmosphereHabitability(atmosphere: string): number {
  const values: Record<string, number> = {
    'Average': 0, 'Thin': -1, 'Trace': -1.5, 'Dense': -2, 'Crushing': -2.5,
  };
  return values[atmosphere] || 0;
}

function getTemperatureHabitability(temperature: string): number {
  const values: Record<string, number> = {
    'Average': 0, 'Cold': -0.5, 'Freezing': -1, 'Hot': -1.5, 'Inferno': -2,
  };
  return values[temperature] || 0;
}

function getHazardHabitability(hazard: string, intensity: string): number {
  if (hazard === 'None') return 0;
  const intensityMod: Record<string, number> = {
    'Very Mild': 0, 'Mild': -0.5, 'Serious': -1, 'High': -1.5, 'Intense': -2,
  };
  const baseMod: Record<string, number> = {
    'Radioactive': -1.5, 'Toxic': -1.5, 'Biohazard': -1, 'Corrosive': -1, 'Polluted': -0.5,
  };
  return (baseMod[hazard] || 0) + (intensityMod[intensity] || 0);
}
