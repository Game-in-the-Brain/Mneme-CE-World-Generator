import { useRef, useState, useEffect } from 'react';
import type { StarSystem, TLProductivityPreset, ExtraterrestrialLifeAssumptions } from '../types';
import {
  Upload, Download, Trash2, FileJson, Info, Search, Eye, ChevronLeft, ChevronRight,
  Database, Bug, DollarSign, Settings2, ChevronDown, ChevronUp, FlaskConical, Orbit, Building2
} from 'lucide-react';
import { APP_VERSION, APP_COMMIT, APP_DATE } from '../lib/version';
import { loadGeneratorOptions, saveGeneratorOptions } from '../lib/optionsStorage';
import {
  CE_PRESET,
  BUILT_IN_PRESETS,
  getSoc7MonthlyIncome,
  getIncomeForSoc,
  getGdpPerDayFromPreset,
  getBoatYears,
  exportPresetToJSON,
  importPresetFromJSON,
  BOAT_PRICE_CR,
  DEFAULT_DEVELOPMENT_WEIGHTS,
  DEFAULT_POWER_WEIGHTS,
  DEFAULT_GOV_WEIGHTS,
  MNEME_WEALTH_WEIGHTS,
} from '../lib/economicPresets';
import {
  BUILT_IN_LIFE_PRESETS,
  getLifePresetById,
  loadCustomLifePresets,
  saveCustomLifePresets,
  exportLifePresetToJSON,
  importLifePresetFromJSON,
} from '../lib/lifePresets';

interface SettingsProps {
  systems: StarSystem[];
  onViewSystem: (system: StarSystem) => void;
  onDeleteSystem: (id: string) => void;
  onImport: (file: File) => void;
  onExportAll: () => void;
  onClearAll: () => void;
  systemCount: number;
}

// =====================
// Table Weights Outcome Configs (QA-055)
// =====================

type WeightOutcome = { label: string; descriptor: string; span: number };

const WEALTH_OUTCOMES: WeightOutcome[] = [
  { label: 'Average', descriptor: 'SOC +0', span: 7 },      // rolls 2-8
  { label: 'Better-off', descriptor: 'SOC +1', span: 2 },  // rolls 9-10
  { label: 'Prosperous', descriptor: 'SOC +2', span: 1 },  // roll 11
  { label: 'Affluent', descriptor: 'SOC +3', span: 1 },    // roll 12
];

const DEV_OUTCOMES: WeightOutcome[] = [
  { label: 'UnderDeveloped', descriptor: 'HDI 0.0–0.59', span: 6 },    // rolls 2-7
  { label: 'Developing', descriptor: 'HDI 0.60–0.69', span: 1 },      // roll 8
  { label: 'Mature', descriptor: 'HDI 0.70–0.79', span: 1 },          // roll 9
  { label: 'Developed', descriptor: 'HDI 0.80–0.89', span: 1 },       // roll 10
  { label: 'Well Developed', descriptor: 'HDI 0.90–0.94', span: 1 },  // roll 11
  { label: 'Very Developed', descriptor: 'HDI >0.95', span: 1 },      // roll 12
];

const POWER_OUTCOMES: WeightOutcome[] = [
  { label: 'Anarchy', descriptor: '≤7', span: 6 },           // rolls 2-7
  { label: 'Confederation', descriptor: '8–9', span: 2 },    // rolls 8-9
  { label: 'Federation', descriptor: '10–11', span: 2 },     // rolls 10-11
  { label: 'Unitary State', descriptor: '12', span: 1 },     // roll 12
];

const GOV_OUTCOMES: WeightOutcome[] = [
  { label: 'Aristocracy', descriptor: '2–5', span: 4 },   // rolls 2-5
  { label: 'Ideocracy', descriptor: '6–7', span: 2 },     // rolls 6-7
  { label: 'Kratocracy', descriptor: '8–9', span: 2 },    // rolls 8-9
  { label: 'Democracy', descriptor: '10–11', span: 2 },   // rolls 10-11
  { label: 'Meritocracy', descriptor: '12', span: 1 },    // roll 12
];

function diceToOutcomeWeights(dice: number[], outcomes: WeightOutcome[]): number[] {
  const weights: number[] = [];
  let idx = 0;
  for (const outcome of outcomes) {
    let sum = 0;
    for (let i = 0; i < outcome.span; i++) {
      sum += dice[idx + i] ?? 0;
    }
    weights.push(sum);
    idx += outcome.span;
  }
  return weights;
}

function outcomeWeightsToDice(weights: number[], outcomes: WeightOutcome[]): number[] {
  const dice: number[] = [];
  for (let i = 0; i < weights.length; i++) {
    const span = outcomes[i].span;
    const perIndex = span > 0 ? weights[i] / span : 0;
    for (let j = 0; j < span; j++) {
      dice.push(perIndex);
    }
  }
  return dice;
}

const CURVE_LABELS: Record<string, string> = {
  mneme: 'Mneme — compounding growth',
  flat: 'Flat — same income at every TL',
  linear: 'Linear — fixed % per TL step',
  custom: 'Custom — user-defined values',
};

export function Settings({ systems, onViewSystem, onDeleteSystem, onImport, onExportAll, onClearAll, systemCount }: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const presetFileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Database view state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debug mode toggle (QA-014)
  const [debugMode, setDebugMode] = useState(() => {
    const stored = localStorage.getItem('mneme_debug_mode');
    return stored !== null ? stored === 'true' : true; // Default ON
  });

  useEffect(() => {
    localStorage.setItem('mneme_debug_mode', debugMode.toString());
  }, [debugMode]);

  // =====================
  // Economic Assumptions State (FR-032 Phase 2)
  // =====================
  const [generatorOptions, setGeneratorOptions] = useState(loadGeneratorOptions);
  const [activePreset, setActivePreset] = useState<TLProductivityPreset>(
    generatorOptions.tlProductivityPreset || CE_PRESET
  );
  const [customPresets, setCustomPresets] = useState<TLProductivityPreset[]>(() => {
    try {
      const raw = localStorage.getItem('mneme_custom_presets');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedTl, setSelectedTl] = useState(7);
  const [showGrid, setShowGrid] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [presetImportStatus, setPresetImportStatus] = useState<string | null>(null);

  // =====================
  // Life Assumptions State (FR-041)
  // =====================
  const [activeLifePreset, setActiveLifePreset] = useState<ExtraterrestrialLifeAssumptions>(
    () => getLifePresetById(generatorOptions.activeLifeAssumptionsId || 'mneme-default') ?? BUILT_IN_LIFE_PRESETS[0]
  );
  const [lifeCustomPresets, setLifeCustomPresets] = useState<ExtraterrestrialLifeAssumptions[]>(loadCustomLifePresets);
  const [lifePresetImportStatus, setLifePresetImportStatus] = useState<string | null>(null);
  const lifePresetFileInputRef = useRef<HTMLInputElement>(null);

  // V2 Positioning toggle
  const [v2Positioning, setV2Positioning] = useState(() => {
    try {
      return loadGeneratorOptions().v2Positioning ?? true;
    } catch {
      return false;
    }
  });

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
    saveGeneratorOptions({ ...current, activeLifeAssumptionsId: activeLifePreset.id });
    setGeneratorOptions({ ...current, activeLifeAssumptionsId: activeLifePreset.id });
  }, [activeLifePreset]);

  useEffect(() => {
    saveCustomLifePresets(lifeCustomPresets);
  }, [lifeCustomPresets]);

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({ ...current, v2Positioning });
    setGeneratorOptions({ ...current, v2Positioning });
  }, [v2Positioning]);

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({ ...current, allowMegaStructures });
    setGeneratorOptions({ ...current, allowMegaStructures });
  }, [allowMegaStructures]);

  // =====================
  // Table Weights State (QA-029)
  // =====================
  const [devWeights, setDevWeights] = useState(generatorOptions.developmentWeights || DEFAULT_DEVELOPMENT_WEIGHTS);
  const [powerWeights, setPowerWeights] = useState(generatorOptions.powerWeights || DEFAULT_POWER_WEIGHTS);
  const [govWeights, setGovWeights] = useState(generatorOptions.govWeights || DEFAULT_GOV_WEIGHTS);
  const [wealthWeights, setWealthWeights] = useState(generatorOptions.wealthWeights || MNEME_WEALTH_WEIGHTS);

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({ ...current, developmentWeights: devWeights, powerWeights, govWeights, wealthWeights });
  }, [devWeights, powerWeights, govWeights, wealthWeights]);

  // Persist active preset to generator options whenever it changes
  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({ ...current, tlProductivityPreset: activePreset });
    setGeneratorOptions({ ...current, tlProductivityPreset: activePreset });
  }, [activePreset]);

  // Sync table weights to active preset when a named preset is selected (QA-055)
  useEffect(() => {
    if (activePreset.id !== 'custom' && activePreset.id !== 'custom-default') {
      setWealthWeights(activePreset.wealthWeights ?? MNEME_WEALTH_WEIGHTS);
      setDevWeights(activePreset.developmentWeights ?? DEFAULT_DEVELOPMENT_WEIGHTS);
      setPowerWeights(activePreset.powerWeights ?? DEFAULT_POWER_WEIGHTS);
      setGovWeights(activePreset.govWeights ?? DEFAULT_GOV_WEIGHTS);
    }
  }, [activePreset.id, activePreset.wealthWeights, activePreset.developmentWeights, activePreset.powerWeights, activePreset.govWeights]);

  // Persist custom presets array to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mneme_custom_presets', JSON.stringify(customPresets));
    } catch {
      // ignore
    }
  }, [customPresets]);

  function switchToBuiltIn(id: string) {
    const builtIn = BUILT_IN_PRESETS.find((p) => p.id === id);
    if (builtIn) {
      setActivePreset(builtIn);
    }
  }

  function handleBoatYearsChange(val: number) {
    const boatYears = Math.max(0.01, Math.min(10000, val));
    setActivePreset((prev) => ({
      ...prev,
      id: 'custom',
      name: 'Custom',
      boatYears,
    }));
  }

  function handleBaseIncomeChange(val: number) {
    const baseIncome = Math.max(1, Math.min(1_000_000_000, val));
    setActivePreset((prev) => ({
      ...prev,
      id: 'custom',
      name: 'Custom',
      baseIncome,
    }));
  }

  function handleBaseTLChange(val: number) {
    const baseTL = Math.max(7, Math.min(16, val));
    setActivePreset((prev) => ({
      ...prev,
      id: 'custom',
      name: 'Custom',
      baseTL,
    }));
  }

  function handleCurveChange(curve: string) {
    setActivePreset((prev) => ({
      ...prev,
      id: 'custom',
      name: 'Custom',
      curve: curve as TLProductivityPreset['curve'],
    }));
  }

  function handleSavePreset() {
    if (activePreset.id === 'custom') {
      // Save current custom as the default custom slot
      const toSave = { ...activePreset, id: 'custom-default', name: activePreset.name || 'Custom' };
      setCustomPresets((prev) => {
        const filtered = prev.filter((p) => p.id !== 'custom-default');
        return [...filtered, toSave];
      });
      setActivePreset(toSave);
      setPresetImportStatus('Preset saved');
      setTimeout(() => setPresetImportStatus(null), 2000);
    }
  }

  function handleSaveAsPreset() {
    const name = window.prompt('Name for new preset:');
    if (!name) return;
    const id = `custom-${Date.now()}`;
    const newPreset = { ...activePreset, id, name };
    setCustomPresets((prev) => [...prev, newPreset]);
    setActivePreset(newPreset);
    setPresetImportStatus('Preset saved as new');
    setTimeout(() => setPresetImportStatus(null), 2000);
  }

  function handleLoadPreset(id: string) {
    const found = customPresets.find((p) => p.id === id);
    if (found) {
      setActivePreset(found);
    }
  }

  function handleExportPreset() {
    const json = exportPresetToJSON(activePreset);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mneme-preset-${activePreset.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePresetFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = importPresetFromJSON(String(reader.result));
      if (imported) {
        const id = `imported-${Date.now()}`;
        const withId = { ...imported, id };
        setCustomPresets((prev) => [...prev, withId]);
        setActivePreset(withId);
        setPresetImportStatus('Preset imported');
      } else {
        setPresetImportStatus('Import failed — invalid preset file');
      }
      if (presetFileInputRef.current) presetFileInputRef.current.value = '';
      setTimeout(() => setPresetImportStatus(null), 3000);
    };
    reader.readAsText(file);
  }

  // Derived display values
  const soc7Monthly = getSoc7MonthlyIncome(selectedTl, activePreset);
  const soc7Annual = soc7Monthly * 12;
  const gdpPerDay = getGdpPerDayFromPreset(selectedTl, activePreset);

  const gridRows = Array.from({ length: 60 }, (_, i) => {
    const soc = i + 1;
    return { soc, income: getIncomeForSoc(soc, soc7Monthly) };
  });

  const isBuiltIn = BUILT_IN_PRESETS.some((p) => p.id === activePreset.id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setImportStatus('Please select a JSON file');
      return;
    }

    try {
      await onImport(file);
      setImportStatus('Import successful!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (_error) {
      setImportStatus('Import failed. Please check the file format.');
    }

    setTimeout(() => setImportStatus(null), 3000);
  };

  // Filter systems based on search
  const filteredSystems = systems.filter((system) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      system.primaryStar.class.toLowerCase().includes(searchLower) ||
      system.mainWorld.type.toLowerCase().includes(searchLower) ||
      system.inhabitants.travelZone.toLowerCase().includes(searchLower) ||
      system.mainWorld.hazard.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredSystems.length / itemsPerPage);
  const paginatedSystems = filteredSystems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Database Section */}
      <div className="card space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Database className="text-[#e53935]" size={20} />
          Database — {systemCount} Saved Systems
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" size={20} />
          <input
            type="text"
            placeholder="Search by star class, world type, zone, hazard..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-[#141419] border border-white/10 rounded-lg"
          />
        </div>

        {/* Table */}
        {paginatedSystems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[800px] w-full">
              <thead>
                <tr>
                  <th>Star</th>
                  <th>World</th>
                  <th>Habitability</th>
                  <th>TL</th>
                  <th>Population</th>
                  <th>Starport</th>
                  <th>Zone</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSystems.map((system) => (
                  <tr key={system.id} className="hover:bg-white/5">
                    <td>
                      <span className={`font-bold star-${system.primaryStar.class}`}>
                        {system.primaryStar.class}
                        {system.primaryStar.grade}
                      </span>
                    </td>
                    <td>{system.mainWorld.type}</td>
                    <td>
                      <span
                        className={
                          system.mainWorld.habitability > 5
                            ? 'habitability-excellent'
                            : system.mainWorld.habitability > 0
                              ? 'habitability-good'
                              : system.mainWorld.habitability > -5
                                ? 'habitability-marginal'
                                : 'habitability-hostile'
                        }
                      >
                        {system.mainWorld.habitability}
                      </span>
                    </td>
                    <td>{system.inhabitants.techLevel}</td>
                    <td>{formatPopulation(system.inhabitants.population)}</td>
                    <td>{system.inhabitants.starport.class}</td>
                    <td>
                      <span
                        className={
                          system.inhabitants.travelZone === 'Green'
                            ? 'habitability-excellent'
                            : system.inhabitants.travelZone === 'Amber'
                              ? 'habitability-marginal'
                              : 'habitability-hostile'
                        }
                      >
                        {system.inhabitants.travelZone}
                      </span>
                    </td>
                    <td className="text-[#9e9e9e]">
                      {new Date(system.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onViewSystem(system)}
                          className="p-2 hover:bg-white/10 rounded"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteSystem(system.id)}
                          className="p-2 hover:bg-[#e53935]/20 text-[#e53935] rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-white/5 rounded-lg">
            <p className="text-[#9e9e9e]">
              {searchTerm ? 'No systems match your search.' : 'No saved systems yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-white/10 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[#9e9e9e]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-white/10 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="card space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileJson className="text-[#e53935]" size={20} />
          Import / Export
        </h3>

        <div className="grid gap-4">
          {/* Import */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">Import Systems</h4>
                <p className="text-sm text-[#9e9e9e]">Import previously exported systems from JSON</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary flex items-center gap-2"
              >
                <Upload size={16} />
                Import
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            {importStatus && (
              <p className={`text-sm mt-2 ${importStatus.includes('failed') ? 'text-[#e53935]' : 'text-green-500'}`}>
                {importStatus}
              </p>
            )}
          </div>

          {/* Export */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Export All Systems</h4>
                <p className="text-sm text-[#9e9e9e]">Download all {systemCount} saved systems as JSON</p>
              </div>
              <button
                onClick={onExportAll}
                disabled={systemCount === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Clear All */}
          <div className="p-4 bg-white/5 rounded-lg border border-[#e53935]/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-[#e53935]">Clear All Data</h4>
                <p className="text-sm text-[#9e9e9e]">Permanently delete all {systemCount} saved systems</p>
              </div>
              <button
                onClick={onClearAll}
                disabled={systemCount === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e53935]/20 text-[#e53935] hover:bg-[#e53935]/30 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Economic Assumptions (FR-032 Phase 2) */}
      <div className="card space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="text-[#e53935]" size={20} />
          Economic Assumptions
        </h3>

        {/* Preset Selector */}
        <div className="p-4 bg-white/5 rounded-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="text-sm font-medium text-[#9e9e9e]">Preset</label>
            <select
              value={isBuiltIn ? activePreset.id : ''}
              onChange={(e) => switchToBuiltIn(e.target.value)}
              className="flex-1 rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
            >
              <option value="" disabled={isBuiltIn}>
                {isBuiltIn ? 'Select preset...' : activePreset.name}
              </option>
              {BUILT_IN_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSavePreset}
                disabled={isBuiltIn}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleSaveAsPreset}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
              >
                Save As
              </button>
              <button
                onClick={handleExportPreset}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => presetFileInputRef.current?.click()}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
              >
                Import
              </button>
            </div>
          </div>

          {customPresets.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <label className="text-sm font-medium text-[#9e9e9e]">Load custom preset</label>
              <select
                value={customPresets.some((p) => p.id === activePreset.id) ? activePreset.id : ''}
                onChange={(e) => handleLoadPreset(e.target.value)}
                className="flex-1 rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              >
                <option value="">Select saved preset...</option>
                {customPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            ref={presetFileInputRef}
            type="file"
            accept=".json"
            onChange={handlePresetFileChange}
            className="hidden"
          />
          {presetImportStatus && (
            <p className={`text-sm ${presetImportStatus.includes('failed') ? 'text-[#e53935]' : 'text-green-500'}`}>
              {presetImportStatus}
            </p>
          )}
        </div>

        {/* Calibration Inputs */}
        <div className="p-4 bg-white/5 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">
                Boat Years at TL {activePreset.baseTL}
              </label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={Number((activePreset.boatYears ?? getBoatYears(activePreset.baseIncome)).toFixed(2))}
                onChange={(e) => handleBoatYearsChange(Number(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              />
              <p className="text-xs text-[#9e9e9e] mt-1">
                Boat price: {formatNumber(BOAT_PRICE_CR)} Cr
              </p>
            </div>

            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">
                TL {activePreset.baseTL} SOC 7 Income
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={Math.round(activePreset.baseIncome)}
                onChange={(e) => handleBaseIncomeChange(Number(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              />
              <p className="text-xs text-[#9e9e9e] mt-1">Cr/month</p>
            </div>

            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Base TL</label>
              <input
                type="number"
                min={7}
                max={16}
                value={activePreset.baseTL}
                onChange={(e) => handleBaseTLChange(Number(e.target.value))}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Growth Curve</label>
              <select
                value={activePreset.curve}
                onChange={(e) => handleCurveChange(e.target.value)}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              >
                {Object.entries(CURVE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded bg-white/5">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Preset calibration:{' '}
              <strong className="text-white">
                {formatNumber(Math.round(activePreset.baseIncome))} Cr/mo
              </strong>{' '}
              income ·{' '}
              <strong className="text-white">
                {Math.round((activePreset.boatYears ?? getBoatYears(activePreset.baseIncome)) * 100) / 100}
              </strong>{' '}
              boat-years
            </div>
            <div className="text-xs text-[#9e9e9e] mt-1">
              Boat Years and SOC 7 Income are now independently editable (QA-048).
              Income drives GDP and port budgets; Boat Years scales ship scarcity and affordability.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded bg-white/5">
              <div className="text-[#9e9e9e] text-xs">SOC 7 annual income (TL {selectedTl})</div>
              <div className="font-medium">{formatNumber(Math.round(soc7Annual))} Cr/year</div>
            </div>
            <div className="p-3 rounded bg-white/5">
              <div className="text-[#9e9e9e] text-xs">SOC 7 monthly income (TL {selectedTl})</div>
              <div className="font-medium">{formatNumber(Math.round(soc7Monthly))} Cr/mo</div>
            </div>
            <div className="p-3 rounded bg-white/5">
              <div className="text-[#9e9e9e] text-xs">GDP per capita/day (TL {selectedTl})</div>
              <div className="font-medium">{formatNumber(Math.round(gdpPerDay))} Cr/day</div>
            </div>
          </div>
        </div>

        {/* SOC-Income Grid */}
        <div className="p-4 bg-white/5 rounded-lg space-y-3">
          <button
            onClick={() => setShowGrid((s) => !s)}
            className="flex items-center gap-2 text-sm font-medium hover:text-[#e53935] transition-colors"
          >
            {showGrid ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            SOC-Income Grid
          </button>

          {showGrid && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-[#9e9e9e]">Display TL:</label>
                <select
                  value={selectedTl}
                  onChange={(e) => setSelectedTl(Number(e.target.value))}
                  className="rounded px-3 py-1 text-sm border bg-[#141419] border-white/10"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 7).map((tl) => (
                    <option key={tl} value={tl}>
                      TL {tl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-h-80 overflow-y-auto border border-white/10 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#1a1a20]">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-[#9e9e9e]">SOC</th>
                      <th className="text-right px-3 py-2 font-medium text-[#9e9e9e]">Monthly Income (Cr)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridRows.map((row) => (
                      <tr
                        key={row.soc}
                        className={row.soc === 7 ? 'bg-[#e53935]/10' : 'even:bg-white/[0.02]'}
                      >
                        <td className="px-3 py-1.5">{row.soc}</td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          {formatCreditCompact(row.income)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Explanatory Note */}
        <div className="p-4 bg-white/5 rounded-lg space-y-3">
          <button
            onClick={() => setShowInfo((s) => !s)}
            className="flex items-center gap-2 text-sm font-medium hover:text-[#e53935] transition-colors"
          >
            <Info size={18} />
            Why do these numbers matter?
          </button>

          {showInfo && (
            <div className="text-sm text-[#9e9e9e] space-y-3 leading-relaxed">
              <p>
                <strong className="text-white">Classic CE/Traveller</strong> models a stable, human-labour economy.
                Tech Level governs jump capability; income and productivity are relatively constant across the setting.
                Worlds are mostly developed, workforce-dependent, and gentrified by design — the frontier has already been won.
              </p>
              <p>
                <strong className="text-white">Mneme assumes compounding growth.</strong> Agents and robots move
                gigatons and terratons. Terraforming and interstellar infrastructure require enormous economic output,
                and a small colony with high automation can sustain significant starport traffic because machines don't
                sleep or draw wages. Wealth concentrations are possible even on young worlds.
              </p>
              <p>
                <strong className="text-white">You can model either here.</strong> <em>CE / Traveller</em> suits slow,
                human-labour-dominant economies where stability is the baseline. <em>Mneme</em> suits high-compound,
                post-scarcity-adjacent growth where automation reshapes what "development" even means. The Boat-Years
                setting anchors the entire economy: a larger number makes ships prohibitively expensive and naturally
                reduces port traffic regardless of which model you choose.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Life Assumptions (FR-041) */}
      <div className="card space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FlaskConical className="text-[#e53935]" size={20} />
          Extraterrestrial Life Assumptions
        </h3>

        <div className="p-4 bg-white/5 rounded-lg space-y-4">
          {/* Preset selector */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="text-sm font-medium text-[#9e9e9e]">Preset</label>
            <select
              value={BUILT_IN_LIFE_PRESETS.some((p) => p.id === activeLifePreset.id) ? activeLifePreset.id : ''}
              onChange={(e) => {
                const found = getLifePresetById(e.target.value, lifeCustomPresets);
                if (found) setActiveLifePreset(found);
              }}
              className="flex-1 rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
            >
              <option value="" disabled={!BUILT_IN_LIFE_PRESETS.some((p) => p.id === activeLifePreset.id)}>
                {BUILT_IN_LIFE_PRESETS.some((p) => p.id === activeLifePreset.id) ? 'Select preset...' : activeLifePreset.name}
              </option>
              {BUILT_IN_LIFE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (activeLifePreset.id.startsWith('custom') || activeLifePreset.id.startsWith('imported')) {
                    setLifeCustomPresets((prev) => {
                      const filtered = prev.filter((p) => p.id !== activeLifePreset.id);
                      return [...filtered, activeLifePreset];
                    });
                    setLifePresetImportStatus('Preset saved');
                    setTimeout(() => setLifePresetImportStatus(null), 2000);
                  }
                }}
                disabled={BUILT_IN_LIFE_PRESETS.some((p) => p.id === activeLifePreset.id)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  const name = window.prompt('Name for new preset:');
                  if (!name) return;
                  const id = `custom-${Date.now()}`;
                  const newPreset = { ...activeLifePreset, id, name };
                  setLifeCustomPresets((prev) => [...prev, newPreset]);
                  setActiveLifePreset(newPreset);
                  setLifePresetImportStatus('Preset saved as new');
                  setTimeout(() => setLifePresetImportStatus(null), 2000);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
              >
                Save As
              </button>
              <button
                onClick={() => {
                  const json = exportLifePresetToJSON(activeLifePreset);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `mneme-life-preset-${activeLifePreset.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => lifePresetFileInputRef.current?.click()}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
              >
                Import
              </button>
            </div>
          </div>

          {/* Custom presets loader + delete */}
          {lifeCustomPresets.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <label className="text-sm font-medium text-[#9e9e9e]">Load custom preset</label>
              <select
                value={lifeCustomPresets.some((p) => p.id === activeLifePreset.id) ? activeLifePreset.id : ''}
                onChange={(e) => {
                  const found = lifeCustomPresets.find((p) => p.id === e.target.value);
                  if (found) setActiveLifePreset(found);
                }}
                className="flex-1 rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              >
                <option value="">Select saved preset...</option>
                {lifeCustomPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (window.confirm('Delete this custom preset?')) {
                    setLifeCustomPresets((prev) => prev.filter((p) => p.id !== activeLifePreset.id));
                    setActiveLifePreset(BUILT_IN_LIFE_PRESETS[0]);
                    setLifePresetImportStatus('Preset deleted');
                    setTimeout(() => setLifePresetImportStatus(null), 2000);
                  }
                }}
                disabled={!lifeCustomPresets.some((p) => p.id === activeLifePreset.id)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
            </div>
          )}

          <input
            ref={lifePresetFileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const imported = importLifePresetFromJSON(String(reader.result));
                if (imported) {
                  const id = `imported-${Date.now()}`;
                  const withId = { ...imported, id };
                  setLifeCustomPresets((prev) => [...prev, withId]);
                  setActiveLifePreset(withId);
                  setLifePresetImportStatus('Preset imported');
                } else {
                  setLifePresetImportStatus('Import failed — invalid preset file');
                }
                if (lifePresetFileInputRef.current) lifePresetFileInputRef.current.value = '';
                setTimeout(() => setLifePresetImportStatus(null), 3000);
              };
              reader.readAsText(file);
            }}
            className="hidden"
          />
          {lifePresetImportStatus && (
            <p className={`text-sm ${lifePresetImportStatus.includes('failed') || lifePresetImportStatus.includes('deleted') ? 'text-[#e53935]' : 'text-green-500'}`}>
              {lifePresetImportStatus}
            </p>
          )}

          {/* Editable parameters */}
          <div className="p-4 bg-white/5 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Biosphere TN</label>
                <input
                  type="number"
                  min={5}
                  max={40}
                  step={1}
                  value={activeLifePreset.biosphereTN}
                  onChange={(e) => {
                    const val = Math.max(5, Math.min(40, Number(e.target.value)));
                    setActiveLifePreset((prev) => ({
                      ...prev,
                      id: 'custom',
                      name: 'Custom',
                      biosphereTN: val,
                    }));
                  }}
                  className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Disadvantage</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={1}
                  value={activeLifePreset.biosphereDisadvantage}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(5, Number(e.target.value)));
                    setActiveLifePreset((prev) => ({
                      ...prev,
                      id: 'custom',
                      name: 'Custom',
                      biosphereDisadvantage: val,
                    }));
                  }}
                  className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Min Biochem</label>
                <select
                  value={activeLifePreset.minBiochemForBiosphereRoll}
                  onChange={(e) => {
                    setActiveLifePreset((prev) => ({
                      ...prev,
                      id: 'custom',
                      name: 'Custom',
                      minBiochemForBiosphereRoll: e.target.value as ExtraterrestrialLifeAssumptions['minBiochemForBiosphereRoll'],
                    }));
                  }}
                  className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
                >
                  <option value="Common">Common</option>
                  <option value="Abundant">Abundant</option>
                  <option value="Rich">Rich</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Transitional Atmospheres</label>
                <select
                  value={activeLifePreset.enableTransitionalAtmospheres ? 'true' : 'false'}
                  onChange={(e) => {
                    setActiveLifePreset((prev) => ({
                      ...prev,
                      id: 'custom',
                      name: 'Custom',
                      enableTransitionalAtmospheres: e.target.value === 'true',
                    }));
                  }}
                  className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Biochem Offset Rule</label>
                <select
                  value={activeLifePreset.biochemOffsetRule}
                  onChange={(e) => {
                    setActiveLifePreset((prev) => ({
                      ...prev,
                      id: 'custom',
                      name: 'Custom',
                      biochemOffsetRule: e.target.value as ExtraterrestrialLifeAssumptions['biochemOffsetRule'],
                    }));
                  }}
                  className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
                >
                  <option value="standard">Standard</option>
                  <option value="halved">Halved</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Description</label>
              <input
                type="text"
                value={activeLifePreset.description}
                onChange={(e) => {
                  setActiveLifePreset((prev) => ({
                    ...prev,
                    id: 'custom',
                    name: 'Custom',
                    description: e.target.value,
                  }));
                }}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Weights (QA-055) */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings2 className="text-[#e53935]" size={20} />
          Table Weights
        </h3>
        <p className="text-sm text-[#9e9e9e]">
          Adjust the probability distributions used for 2D6 table lookups. Each outcome gets a relative weight; the generator converts these into percentages automatically.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeightCard
            title="Wealth"
            outcomes={WEALTH_OUTCOMES}
            weights={wealthWeights}
            onChange={(w) => {
              setWealthWeights(w);
              if (activePreset.id !== 'custom' && activePreset.id !== 'custom-default') {
                setActivePreset((prev) => ({ ...prev, id: 'custom', name: 'Custom' }));
              }
            }}
          />
          <WeightCard
            title="Development"
            outcomes={DEV_OUTCOMES}
            weights={devWeights}
            onChange={(w) => {
              setDevWeights(w);
              if (activePreset.id !== 'custom' && activePreset.id !== 'custom-default') {
                setActivePreset((prev) => ({ ...prev, id: 'custom', name: 'Custom' }));
              }
            }}
          />
          <WeightCard
            title="Power Structure"
            outcomes={POWER_OUTCOMES}
            weights={powerWeights}
            onChange={(w) => {
              setPowerWeights(w);
              if (activePreset.id !== 'custom' && activePreset.id !== 'custom-default') {
                setActivePreset((prev) => ({ ...prev, id: 'custom', name: 'Custom' }));
              }
            }}
          />
          <WeightCard
            title="Source of Power"
            outcomes={GOV_OUTCOMES}
            weights={govWeights}
            onChange={(w) => {
              setGovWeights(w);
              if (activePreset.id !== 'custom' && activePreset.id !== 'custom-default') {
                setActivePreset((prev) => ({ ...prev, id: 'custom', name: 'Custom' }));
              }
            }}
          />
        </div>
      </div>

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
                When ON, the generator can produce Habitat-type main worlds (O'Neill cylinders,
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

function WeightCard({
  title,
  outcomes,
  weights,
  onChange,
}: {
  title: string;
  outcomes: WeightOutcome[];
  weights: import('../types').TableWeights;
  onChange: (weights: import('../types').TableWeights) => void;
}) {
  const outcomeWeights = diceToOutcomeWeights(weights.dice, outcomes);
  const total = outcomeWeights.reduce((a, b) => a + b, 0);

  function updateOutcomeWeight(index: number, value: number) {
    const next = [...outcomeWeights];
    next[index] = Math.max(0, value);
    onChange({ dice: outcomeWeightsToDice(next, outcomes) });
  }

  return (
    <div className="p-3 rounded border bg-[#141419] border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-white">{title}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium ${
            total > 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
          }`}
        >
          {'\u2211'} {Math.round(total * 10) / 10}
        </span>
      </div>
      <div className="space-y-2">
        {outcomes.map((outcome, i) => {
          const weight = outcomeWeights[i];
          const pct = total > 0 ? Math.round((weight / total) * 100) : 0;
          return (
            <div key={outcome.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-white truncate">{outcome.label}</span>
                  <span className="text-[#9e9e9e] shrink-0">{outcome.descriptor}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#9e9e9e] w-8 text-right">{pct}%</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={Math.round(weight)}
                    onChange={(e) => updateOutcomeWeight(i, Number(e.target.value))}
                    className="w-14 text-right text-sm rounded px-1 py-0.5 bg-[#0f0f14] border border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#e53935]/60 rounded-full transition-all"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatPopulation(pop: number): string {
  if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(1)}B`;
  if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
  if (pop >= 1000) return `${(pop / 1000).toFixed(1)}K`;
  return pop.toString();
}

function formatNumber(value: number): string {
  if (!isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function formatCreditCompact(value: number): string {
  if (!isFinite(value) || value === 0) return '0 Cr';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(2)} T Cr`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)} B Cr`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(2)} M Cr`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(2)} K Cr`;
  return `${formatNumber(value)} Cr`;
}


