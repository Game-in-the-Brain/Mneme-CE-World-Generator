import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { APP_VERSION } from '../lib/version';
import { generateStarSystem } from '../lib/generator';

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
  const [batchSize, setBatchSize] = useState(1000);
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
        tlRollMethod: '6d6-keep-low4-div2',
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

export { DebugBatchExportWrapper };
