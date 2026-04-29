import { useState, useEffect } from 'react';
import type { StarSystem } from '../types';
import { Bug, Orbit, Building2, Settings2 } from 'lucide-react';
import { APP_VERSION, APP_COMMIT, APP_DATE } from '../lib/version';
import { loadGeneratorOptions, saveGeneratorOptions } from '../lib/optionsStorage';
import { DatabaseSection } from './DatabaseSection';
import { DataManagementSection } from './DataManagementSection';
import { EconomicAssumptionsSection } from './EconomicAssumptionsSection';
import { LifeAssumptionsSection } from './LifeAssumptionsSection';
import { TableWeightsSection } from './TableWeightsSection';

interface SettingsProps {
  systems: StarSystem[];
  onViewSystem: (system: StarSystem) => void;
  onDeleteSystem: (id: string) => void;
  onImport: (file: File) => Promise<void>;
  onExportAll: () => void;
  onClearAll: () => void;
  systemCount: number;
}

export function Settings({
  systems,
  onViewSystem,
  onDeleteSystem,
  onImport,
  onExportAll,
  onClearAll,
  systemCount,
}: SettingsProps) {
  // Debug mode toggle (QA-014)
  const [debugMode, setDebugMode] = useState(() => {
    const stored = localStorage.getItem('mneme_debug_mode');
    return stored !== null ? stored === 'true' : true; // Default ON
  });

  useEffect(() => {
    localStorage.setItem('mneme_debug_mode', debugMode.toString());
  }, [debugMode]);

  // V2 Positioning toggle
  const [v2Positioning, setV2Positioning] = useState(() => {
    try {
      return loadGeneratorOptions().v2Positioning ?? true;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({ ...current, v2Positioning });
  }, [v2Positioning]);

  // QA-Mega+: Mega+ Structures toggle
  const [allowMegaStructures, setAllowMegaStructures] = useState(() => {
    try {
      return loadGeneratorOptions().allowMegaStructures ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({ ...current, allowMegaStructures });
  }, [allowMegaStructures]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <DatabaseSection
        systems={systems}
        onViewSystem={onViewSystem}
        onDeleteSystem={onDeleteSystem}
        systemCount={systemCount}
      />

      <DataManagementSection
        onImport={onImport}
        onExportAll={onExportAll}
        onClearAll={onClearAll}
        systemCount={systemCount}
      />

      <EconomicAssumptionsSection />

      <LifeAssumptionsSection />

      <TableWeightsSection />

      {/* V2 Positioning Toggle (FR-042) */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Orbit className="text-[#e53935]" size={20} />
          V2 Positioning System
        </h3>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable V2 System-First Generation</h4>
              <p className="text-sm text-[#9e9e9e]">
                Generates the full system first, then selects the mainworld by competitive habitability scoring.
                Includes: composition-driven atmospheres, biosphere tests, ejected/consumed bodies, and shepherding.
              </p>
              <p className="text-xs text-[#9e9e9e] mt-1">Warning: Experimental — legacy saves may not display v2 fields</p>
            </div>
            <button
              onClick={() => setV2Positioning(!v2Positioning)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                v2Positioning ? 'bg-[#e53935] text-white' : 'bg-white/10 text-[#9e9e9e] hover:bg-white/20'
              }`}
            >
              {v2Positioning ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* QA-Mega+: Mega+ Structures Toggle */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="text-[#e53935]" size={20} />
          Mega+ Structures
        </h3>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Allow Mega+ Structure Habitats</h4>
              <p className="text-sm text-[#9e9e9e]">
                When ON, the generator can produce Habitat-type main worlds (O&apos;Neill cylinders,
                orbital habs, etc.). When OFF, random Habitat rolls become Terrestrial worlds.
              </p>
              <p className="text-xs text-[#9e9e9e] mt-1">
                Default OFF — CE / Traveller economic assumptions cannot support megastructures
              </p>
            </div>
            <button
              onClick={() => setAllowMegaStructures(!allowMegaStructures)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                allowMegaStructures ? 'bg-[#e53935] text-white' : 'bg-white/10 text-[#9e9e9e] hover:bg-white/20'
              }`}
            >
              {allowMegaStructures ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Debug Mode Toggle (QA-014) */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bug className="text-[#e53935]" size={20} />
          Debug Mode
        </h3>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Debug Batch Export</h4>
              <p className="text-sm text-[#9e9e9e]">Show statistical analysis tools on the Generator page</p>
              <p className="text-xs text-[#9e9e9e] mt-1">Note: Switch off to hide debug tools in production</p>
            </div>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                debugMode ? 'bg-[#e53935] text-white' : 'bg-white/10 text-[#9e9e9e] hover:bg-white/20'
              }`}
            >
              {debugMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings2 className="text-[#e53935]" size={20} />
          About
        </h3>
        <div className="space-y-2 text-sm text-[#9e9e9e]">
          <p>
            <strong className="text-white">MNEME World Generator</strong> is a Progressive Web App for generating
            star systems, worlds, and inhabitants for the Cepheus Engine RPG.
          </p>
          <p>
            Based on the Mneme variant rules, this generator creates scientifically-grounded star systems with
            procedural generation using dice-based mechanics.
          </p>
          <div className="pt-2 border-t border-white/10">
            <p>
              Version: {APP_VERSION} ({APP_DATE}) — {APP_COMMIT}
            </p>
            <p>Data stored locally in your browser</p>
          </div>
        </div>
      </div>
    </div>
  );
}
