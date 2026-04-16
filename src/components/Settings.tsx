import { useRef, useState, useEffect } from 'react';
import type { StarSystem, TLProductivityPreset } from '../types';
import {
  Upload, Download, Trash2, FileJson, Info, Search, Eye, ChevronLeft, ChevronRight,
  Database, Bug, DollarSign, Settings2, ChevronDown, ChevronUp
} from 'lucide-react';
import { APP_VERSION, APP_COMMIT, APP_DATE } from '../lib/version';
import { loadGeneratorOptions, saveGeneratorOptions } from '../lib/optionsStorage';
import {
  MNEME_PRESET,
  BUILT_IN_PRESETS,
  getSoc7MonthlyIncome,
  getIncomeForSoc,
  getGdpPerDayFromPreset,
  getBoatYears,
  exportPresetToJSON,
  importPresetFromJSON,
  BOAT_PRICE_CR,
  NATURAL_2D6_WEIGHTS,
  FLAT_WEIGHTS,
  DEFAULT_DEVELOPMENT_WEIGHTS,
  DEFAULT_POWER_WEIGHTS,
  DEFAULT_GOV_WEIGHTS,
  MNEME_WEALTH_WEIGHTS,
  DEMOCRATIC_POWER_WEIGHTS,
  STABLE_POWER_WEIGHTS,
} from '../lib/economicPresets';

interface SettingsProps {
  systems: StarSystem[];
  onViewSystem: (system: StarSystem) => void;
  onDeleteSystem: (id: string) => void;
  onImport: (file: File) => void;
  onExportAll: () => void;
  onClearAll: () => void;
  systemCount: number;
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
    generatorOptions.tlProductivityPreset || MNEME_PRESET
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

      {/* Table Weights (QA-029) */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings2 className="text-[#e53935]" size={20} />
          Table Weights
        </h3>
        <p className="text-sm text-[#9e9e9e]">
          Adjust the probability distributions used for 2D6 table lookups. These affect how common or rare each outcome is during world generation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Wealth</label>
            <select
              value={arraysEqual(wealthWeights.dice, NATURAL_2D6_WEIGHTS.dice) ? 'natural' : 'flat'}
              onChange={(e) => setWealthWeights(e.target.value === 'natural' ? NATURAL_2D6_WEIGHTS : FLAT_WEIGHTS)}
              className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
            >
              <option value="natural">Natural 2D6 — bell curve</option>
              <option value="flat">Flat — uniform</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Development</label>
            <select
              value={arraysEqual(devWeights.dice, NATURAL_2D6_WEIGHTS.dice) ? 'natural' : 'flat'}
              onChange={(e) => setDevWeights(e.target.value === 'natural' ? NATURAL_2D6_WEIGHTS : FLAT_WEIGHTS)}
              className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
            >
              <option value="natural">Natural 2D6 — bell curve</option>
              <option value="flat">Flat — uniform</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Power Structure</label>
            <select
              value={
                arraysEqual(powerWeights.dice, NATURAL_2D6_WEIGHTS.dice) ? 'natural' :
                arraysEqual(powerWeights.dice, DEMOCRATIC_POWER_WEIGHTS.dice) ? 'democratic' :
                arraysEqual(powerWeights.dice, STABLE_POWER_WEIGHTS.dice) ? 'stable' :
                'flat'
              }
              onChange={(e) => {
                const map: Record<string, import('../types').TableWeights> = {
                  natural: NATURAL_2D6_WEIGHTS,
                  flat: FLAT_WEIGHTS,
                  democratic: DEMOCRATIC_POWER_WEIGHTS,
                  stable: STABLE_POWER_WEIGHTS,
                };
                setPowerWeights(map[e.target.value]);
              }}
              className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
            >
              <option value="natural">Natural 2D6 — bell curve</option>
              <option value="flat">Flat — uniform</option>
              <option value="democratic">Democratic — less Anarchy</option>
              <option value="stable">Stable — more Unitary</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Source of Power</label>
            <select
              value={arraysEqual(govWeights.dice, NATURAL_2D6_WEIGHTS.dice) ? 'natural' : 'flat'}
              onChange={(e) => setGovWeights(e.target.value === 'natural' ? NATURAL_2D6_WEIGHTS : FLAT_WEIGHTS)}
              className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
            >
              <option value="natural">Natural 2D6 — bell curve</option>
              <option value="flat">Flat — uniform</option>
            </select>
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

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
