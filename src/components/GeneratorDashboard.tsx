import { useState, useEffect } from 'react';
import type { StarSystem, GeneratorOptions, StellarClass, StellarGrade, WorldType } from '../types';

type DepressionPenaltyTiming = 'before-starport' | 'after-starport';

const DEPRESSION_TIMING_OPTIONS: { value: DepressionPenaltyTiming; label: string }[] = [
  { value: 'before-starport', label: 'Before Starport (default)' },
  { value: 'after-starport', label: 'After Starport (recalculate)' },
];
import { Sparkles, ChevronRight, Clock, Download } from 'lucide-react';
import { APP_VERSION } from '../lib/version';

// Import generator for batch export
import { generateStarSystem } from '../lib/generator';

interface GeneratorDashboardProps {
  onGenerate: (options: GeneratorOptions) => void;
  isGenerating: boolean;
  recentSystems: StarSystem[];
  onViewSystem: (system: StarSystem) => void;
}

const STAR_CLASS_OPTIONS: { value: StellarClass | 'random'; label: string }[] = [
  { value: 'random',  label: 'Random' },
  { value: 'O',       label: 'O — Blue-White Supergiant' },
  { value: 'B',       label: 'B — Hot Blue Giant' },
  { value: 'A',       label: 'A — White Main Sequence' },
  { value: 'F',       label: 'F — Yellow-White' },
  { value: 'G',       label: 'G — Sun-like Yellow' },
  { value: 'K',       label: 'K — Orange Dwarf' },
  { value: 'M',       label: 'M — Red Dwarf' },
];

const STAR_GRADE_OPTIONS: { value: StellarGrade | 'random'; label: string }[] = [
  { value: 'random', label: 'Random' },
  ...([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as StellarGrade[]).map(g => ({ value: g, label: g.toString() })),
];

const WORLD_TYPE_OPTIONS: { value: WorldType | 'random'; label: string }[] = [
  { value: 'random',      label: 'Random' },
  { value: 'Terrestrial', label: 'Terrestrial' },
  { value: 'Dwarf',       label: 'Dwarf' },
  { value: 'Habitat',     label: 'Habitat (Large)' },
];

export function GeneratorDashboard({
  onGenerate,
  isGenerating,
  recentSystems,
  onViewSystem,
}: GeneratorDashboardProps) {
  const VALID_CLASSES  = new Set(['random','O','B','A','F','G','K','M']);
  const VALID_GRADES   = new Set(['random','0','1','2','3','4','5','6','7','8','9']);
  const VALID_TYPES    = new Set(['random','Terrestrial','Dwarf','Habitat']);
  const VALID_TIMINGS  = new Set(['before-starport','after-starport']);

  const [starClass, setStarClass] = useState<StellarClass | 'random'>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('mneme_generator_options') ?? '{}');
      return VALID_CLASSES.has(s.starClass) ? s.starClass : 'random';
    } catch { return 'random'; }
  });
  const [starGrade, setStarGrade] = useState<StellarGrade | 'random'>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('mneme_generator_options') ?? '{}');
      const v = String(s.starGrade);
      return VALID_GRADES.has(v) ? (s.starGrade === 'random' ? 'random' : Number(s.starGrade) as StellarGrade) : 'random';
    } catch { return 'random'; }
  });
  const [mainWorldType, setMainWorldType] = useState<WorldType | 'random'>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('mneme_generator_options') ?? '{}');
      return VALID_TYPES.has(s.mainWorldType) ? s.mainWorldType : 'random';
    } catch { return 'random'; }
  });
  const [populated, setPopulated] = useState<boolean>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('mneme_generator_options') ?? '{}');
      return typeof s.populated === 'boolean' ? s.populated : true;
    } catch { return true; }
  });
  const [depressionPenaltyTiming, setDepressionPenaltyTiming] = useState<DepressionPenaltyTiming>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('mneme_generator_options') ?? '{}');
      return VALID_TIMINGS.has(s.depressionPenaltyTiming) ? s.depressionPenaltyTiming : 'before-starport';
    } catch { return 'before-starport'; }
  });

  useEffect(() => {
    localStorage.setItem('mneme_generator_options', JSON.stringify({
      starClass,
      starGrade,
      mainWorldType,
      populated,
      depressionPenaltyTiming,
    }));
  }, [starClass, starGrade, mainWorldType, populated, depressionPenaltyTiming]);

  function handleGenerate() {
    onGenerate({ starClass, starGrade, mainWorldType, populated, depressionPenaltyTiming });
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          MNEME <span className="text-[#e53935]">WORLD GENERATOR</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
          Generate complete star systems for the Cepheus Engine RPG.
          Stars, worlds, inhabitants, and planetary bodies — all procedurally generated.
        </p>

        {/* Generation Controls */}
        <div className="card max-w-2xl mx-auto mb-6 text-left">
          <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            GENERATION OPTIONS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Star Class */}
            <div>
              <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Star Class
              </label>
              <select
                value={starClass}
                onChange={e => setStarClass(e.target.value as StellarClass | 'random')}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                {STAR_CLASS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Star Grade */}
            <div>
              <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Star Grade
              </label>
              <select
                value={starGrade === 'random' ? 'random' : starGrade.toString()}
                onChange={e => setStarGrade(e.target.value === 'random' ? 'random' : parseInt(e.target.value) as StellarGrade)}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                {STAR_GRADE_OPTIONS.map(o => (
                  <option key={o.value.toString()} value={o.value.toString()}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Main World */}
            <div>
              <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Main World Type
              </label>
              <select
                value={mainWorldType}
                onChange={e => setMainWorldType(e.target.value as WorldType | 'random')}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                {WORLD_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Populated toggle */}
          <div>
            <label className="block text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
              Inhabitants
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPopulated(true)}
                className="flex-1 py-2 rounded text-sm font-medium transition-all border"
                style={populated ? {
                  backgroundColor: 'var(--accent-red)',
                  borderColor: 'var(--accent-red)',
                  color: '#ffffff',
                } : {
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                Populated
              </button>
              <button
                type="button"
                onClick={() => setPopulated(false)}
                className="flex-1 py-2 rounded text-sm font-medium transition-all border"
                style={!populated ? {
                  backgroundColor: 'var(--accent-red)',
                  borderColor: 'var(--accent-red)',
                  color: '#ffffff',
                } : {
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                Unpopulated
              </button>
            </div>
            {populated && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                If Hab &gt; 0: natural population via 10<sup>Hab</sup> × 2D6.
                If Hab ≤ 0: inhabitants live in an artificial habitat (MVT/GVT table).
              </p>
            )}
          </div>

          {/* Depression Penalty Timing (QA-026) */}
          {populated && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <label className="block text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Population Depression Penalty Timing
              </label>
              <select
                value={depressionPenaltyTiming}
                onChange={e => setDepressionPenaltyTiming(e.target.value as DepressionPenaltyTiming)}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                {DEPRESSION_TIMING_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Low-population worlds can suffer a TL depression that reduces starport class.
                “Before Starport” applies the penalty during generation; “After Starport” treats the port as degraded from a higher founding TL.
              </p>
            </div>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={24} />
              Generate System
            </>
          )}
        </button>

        {/* Debug Batch Export — toggleable in Settings (QA-012, QA-014) */}
        <DebugBatchExportWrapper />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Systems Saved"  value={recentSystems.length.toString()} />
        <StatCard label="Star Classes"   value="O–M Spectral" />
        <StatCard label="World Types"    value="Habitat / Dwarf / Terrestrial" />
        <StatCard label="Travel Zones"   value="Green / Amber / Red" />
      </div>

      {/* Recent Systems */}
      {recentSystems.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock size={20} style={{ color: 'var(--accent-red)' }} />
              Recent Systems
            </h2>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Last {recentSystems.length} generated
            </span>
          </div>

          <div className="space-y-2">
            {recentSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => onViewSystem(system)}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left"
                style={{ backgroundColor: 'var(--row-hover)' }}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold star-${system.primaryStar.class}`}>
                    {system.primaryStar.class}{system.primaryStar.grade}
                  </span>
                  <div>
                    <div className="font-medium">
                      {system.mainWorld.type} World
                      {system.inhabitants.populated === false && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                          Unpopulated
                        </span>
                      )}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Hab: {system.mainWorld.habitability}
                      {system.inhabitants.populated !== false && (
                        <> | TL: {system.inhabitants.techLevel} | Pop: {formatPopulation(system.inhabitants.population)}</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span className="text-sm">{new Date(system.createdAt).toLocaleDateString()}</span>
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard title="Star Generation"  description="Primary and companion stars with proper mass/luminosity constraints across all 7 spectral classes." />
        <FeatureCard title="World Creation"   description="Diverse worlds with realistic gravity, atmosphere, temperature, hazards, and habitability scoring." />
        <FeatureCard title="Inhabitants"      description="Natural or habitat-based populations, governments, cultures, and starport infrastructure." />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold" style={{ color: 'var(--accent-red)' }}>{value}</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </div>
  );
}

// =====================
// Debug Batch Export Component (QA-012, QA-014)
// =====================

function DebugBatchExportWrapper() {
  const [debugMode, setDebugMode] = useState(() => {
    const stored = localStorage.getItem('mneme_debug_mode');
    return stored !== null ? stored === 'true' : true; // Default ON
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('mneme_debug_mode');
      setDebugMode(stored !== null ? stored === 'true' : true);
    };

    // Listen for storage changes (when Settings toggles the value)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically since storage events don't fire in same tab
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!debugMode) return null;
  return <DebugBatchExport />;
}

function DebugBatchExport() {
  const [batchSize, setBatchSize] = useState(40);
  const [isExporting, setIsExporting] = useState(false);
  const [lastStats, setLastStats] = useState<string | null>(null);

  async function handleBatchExport() {
    setIsExporting(true);
    setLastStats(null);

    const systems = [];
    let totalHabitability = 0;
    let hotJupiterCount = 0;

    for (let i = 0; i < batchSize; i++) {
      const system = generateStarSystem();
      
      // Accumulate statistics
      totalHabitability += system.mainWorld.habitability;
      
      // Check for hot jupiter migration (look for cleared zones indicator in logs)
      const hasHotJupiter = system.gasWorlds.some(g => 
        (g.gasClass === 'III' && g.zone === 'Infernal') ||
        ((g.gasClass === 'IV' || g.gasClass === 'V') && g.zone === 'Hot')
      );
      if (hasHotJupiter) hotJupiterCount++;

      // Create simplified system record for batch export
      const record = {
        id: system.id,
        generatedAt: new Date(system.createdAt).toISOString(),
        
        star: {
          class: system.primaryStar.class,
          grade: system.primaryStar.grade,
          massSOL: system.primaryStar.mass,
          luminosity: system.primaryStar.luminosity,
          companionCount: system.companionStars.length,
        },
        
        mainWorld: {
          type: system.mainWorld.type,
          sizeKM: system.mainWorld.size,
          atmosphere: system.mainWorld.atmosphere,
          atmosphereTL: system.mainWorld.atmosphereTL,
          temperature: system.mainWorld.temperature,
          temperatureTL: system.mainWorld.temperatureTL,
          gravityG: system.mainWorld.gravity,
          hazard: system.mainWorld.hazard,
          hazardIntensity: system.mainWorld.hazardIntensity,
          biochemResources: system.mainWorld.biochemicalResources,
          techLevel: system.mainWorld.techLevel,
          habitability: system.mainWorld.habitability,
          // Component breakdown for analysis
          habitabilityComponents: system.mainWorld.habitabilityComponents,
          population: system.inhabitants.population,
          zone: system.mainWorld.zone,
          au: system.mainWorld.distanceAU,
        },
        
        inhabitants: {
          populated: system.inhabitants.populated,
          techLevel: system.inhabitants.techLevel,
          foundingTL: system.inhabitants.foundingTL,
          effectiveTL: system.inhabitants.effectiveTL,
          wealth: system.inhabitants.wealth,
          powerStructure: system.inhabitants.powerStructure,
          development: system.inhabitants.development,
          sourceOfPower: system.inhabitants.sourceOfPower,
          governanceDM: system.inhabitants.governance,
          starportClass: system.inhabitants.starport.class,
          starportFoundingClass: system.inhabitants.starport.foundingClass,
          starportFoundingPSS: system.inhabitants.starport.foundingPSS,
          starportFoundingRawClass: system.inhabitants.starport.foundingRawClass,
          travelZone: system.inhabitants.travelZone,
        },
        
        planetarySystem: {
          totalBodies: 
            system.circumstellarDisks.length +
            system.dwarfPlanets.length +
            system.terrestrialWorlds.length +
            system.iceWorlds.length +
            system.gasWorlds.length,
          disks: system.circumstellarDisks.length,
          dwarfs: system.dwarfPlanets.length,
          terrestrials: system.terrestrialWorlds.length,
          ices: system.iceWorlds.length,
          gases: system.gasWorlds.length,
          hotJupiterPresent: hasHotJupiter,
          bodies: [
            ...system.circumstellarDisks.map(b => ({ type: 'disk', zone: b.zone, au: b.distanceAU, massEM: b.mass })),
            ...system.dwarfPlanets.map(b => ({ type: 'dwarf', zone: b.zone, au: b.distanceAU, massEM: b.mass })),
            ...system.terrestrialWorlds.map(b => ({ type: 'terrestrial', zone: b.zone, au: b.distanceAU, massEM: b.mass })),
            ...system.iceWorlds.map(b => ({ type: 'ice', zone: b.zone, au: b.distanceAU, massEM: b.mass })),
            ...system.gasWorlds.map(b => ({ type: 'gas', zone: b.zone, au: b.distanceAU, massEM: b.mass, gasClass: b.gasClass })),
          ].sort((a, b) => a.au - b.au),
        },
      };
      
      systems.push(record);
    }

    // Calculate statistics by star class
    const classStats: Record<string, {
      count: number;
      totalBodies: number[];
      terrestrials: number[];
      dwarfs: number[];
      ices: number[];
      gases: number[];
      disks: number[];
      mainWorldTypes: { terrestrial: number; dwarf: number; habitat: number };
    }> = {};
    
    for (const sys of systems) {
      const cls = sys.star.class;
      if (!classStats[cls]) {
        classStats[cls] = {
          count: 0,
          totalBodies: [],
          terrestrials: [],
          dwarfs: [],
          ices: [],
          gases: [],
          disks: [],
          mainWorldTypes: { terrestrial: 0, dwarf: 0, habitat: 0 },
        };
      }
      
      classStats[cls].count++;
      classStats[cls].totalBodies.push(sys.planetarySystem.totalBodies);
      classStats[cls].terrestrials.push(sys.planetarySystem.terrestrials);
      classStats[cls].dwarfs.push(sys.planetarySystem.dwarfs);
      classStats[cls].ices.push(sys.planetarySystem.ices);
      classStats[cls].gases.push(sys.planetarySystem.gases);
      classStats[cls].disks.push(sys.planetarySystem.disks);
      
      // Track main world types
      if (sys.mainWorld.type === 'Terrestrial') classStats[cls].mainWorldTypes.terrestrial++;
      else if (sys.mainWorld.type === 'Dwarf') classStats[cls].mainWorldTypes.dwarf++;
      else if (sys.mainWorld.type === 'Habitat') classStats[cls].mainWorldTypes.habitat++;
    }
    
    // Calculate medians for each class
    const median = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };
    
    const classBreakdown: Record<string, {
      count: number;
      medianTotalBodies: number;
      medianTerrestrials: number;
      medianDwarfs: number;
      medianIces: number;
      medianGases: number;
      medianDisks: number;
      mainWorldPercent: { terrestrial: number; dwarf: number; habitat: number };
    }> = {};
    
    for (const [cls, stats] of Object.entries(classStats)) {
      classBreakdown[cls] = {
        count: stats.count,
        medianTotalBodies: median(stats.totalBodies),
        medianTerrestrials: median(stats.terrestrials),
        medianDwarfs: median(stats.dwarfs),
        medianIces: median(stats.ices),
        medianGases: median(stats.gases),
        medianDisks: median(stats.disks),
        mainWorldPercent: {
          terrestrial: Math.round((stats.mainWorldTypes.terrestrial / stats.count) * 100),
          dwarf: Math.round((stats.mainWorldTypes.dwarf / stats.count) * 100),
          habitat: Math.round((stats.mainWorldTypes.habitat / stats.count) * 100),
        },
      };
    }

    const exportData = {
      meta: {
        generatedAt: new Date().toISOString(),
        count: batchSize,
        version: APP_VERSION,
        description: 'Mneme CE World Generator — batch statistical export (QA-012)',
        statistics: {
          meanHabitability: Math.round((totalHabitability / batchSize) * 100) / 100,
          hotJupiterSystems: hotJupiterCount,
          hotJupiterPercent: Math.round((hotJupiterCount / batchSize) * 100),
          byStarClass: classBreakdown,
        },
      },
      systems,
    };

    // Trigger download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mneme-batch-${batchSize}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setLastStats(`Mean Hab: ${(totalHabitability / batchSize).toFixed(2)} | Hot Jupiters: ${hotJupiterCount} (${Math.round((hotJupiterCount / batchSize) * 100)}%)`);
    setIsExporting(false);
  }

  return (
    <div 
      className="mt-6 p-4 rounded-lg border border-dashed max-w-2xl mx-auto"
      style={{ borderColor: 'var(--warning, #ff9800)', backgroundColor: 'rgba(255, 152, 0, 0.05)' }}
    >
      <p className="text-xs mb-3 font-medium" style={{ color: 'var(--warning, #ff9800)' }}>
        DEV ONLY — Batch Statistical Export (QA-012)
      </p>
      <div className="flex gap-3 items-center flex-wrap">
        <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Batch size:
        </label>
        <input
          type="number"
          min={1}
          max={1000}
          value={batchSize}
          onChange={(e) => setBatchSize(Math.max(1, Math.min(1000, Number(e.target.value))))}
          className="w-20 text-center text-sm rounded px-2 py-1"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
          disabled={isExporting}
        />
        <button
          onClick={handleBatchExport}
          disabled={isExporting}
          className="text-sm px-4 py-2 rounded flex items-center gap-2 transition-opacity"
          style={{
            backgroundColor: 'var(--warning, #ff9800)',
            color: '#000',
            opacity: isExporting ? 0.5 : 1,
          }}
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download size={16} />
              Export Batch JSON
            </>
          )}
        </button>
        {lastStats && (
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {lastStats}
          </span>
        )}
      </div>
    </div>
  );
}

function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000)     return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000)         return `${(pop / 1_000).toFixed(1)}K`;
  return pop.toString();
}
