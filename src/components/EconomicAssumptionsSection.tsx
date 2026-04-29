import { useRef, useState, useEffect } from 'react';
import type { TLProductivityPreset } from '../types';
import { DollarSign, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { loadGeneratorOptions, saveGeneratorOptions } from '../lib/optionsStorage';
import {
  CE_PRESET,
  BUILT_IN_PRESETS,
  getSoc7MonthlyIncome,
  getIncomeForSoc,
  getGdpPerDayFromPreset,
  getBoatYears,
  getGrowthModel,
  exportPresetToJSON,
  importPresetFromJSON,
  BOAT_PRICE_CR,
} from '../lib/economicPresets';
import { CURVE_LABELS } from '../lib/settingsConstants';
import { formatNumber, formatCreditCompact } from '../lib/settingsFormatters';

export function EconomicAssumptionsSection() {
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
  const presetFileInputRef = useRef<HTMLInputElement>(null);

  // QA-049: Growth Model toggle state
  const [growthModel, setGrowthModel] = useState<'compounding' | 'stable'>(
    () => {
      const opts = loadGeneratorOptions();
      return opts.growthModel ?? getGrowthModel(opts.tlProductivityPreset);
    }
  );

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({ ...current, tlProductivityPreset: activePreset });
    setGeneratorOptions({ ...current, tlProductivityPreset: activePreset });
  }, [activePreset]);

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({ ...current, growthModel });
    setGeneratorOptions({ ...current, growthModel });
  }, [growthModel]);

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

  function handleGrowthModelChange(model: 'compounding' | 'stable') {
    setGrowthModel(model);
    if (model === 'compounding') {
      switchToBuiltIn('mneme');
    } else {
      switchToBuiltIn('ce');
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
  const isBuiltIn = BUILT_IN_PRESETS.some((p) => p.id === activePreset.id);
  const soc7Monthly = getSoc7MonthlyIncome(selectedTl, activePreset);
  const soc7Annual = soc7Monthly * 12;
  const gdpPerDay = getGdpPerDayFromPreset(selectedTl, activePreset);
  const gridRows = Array.from({ length: 60 }, (_, i) => {
    const soc = i + 1;
    return { soc, income: getIncomeForSoc(soc, soc7Monthly) };
  });
  return (
    <div className="card space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <DollarSign className="text-[#e53935]" size={20} />
        Economic Assumptions
      </h3>
      {/* QA-049: Growth Model Toggle */}
      <div className="p-4 bg-white/5 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#9e9e9e]">Growth Model</span>
          <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-[#9e9e9e]">
            {getGrowthModel(activePreset) === 'compounding' ? 'Compounding' : 'Stable'}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleGrowthModelChange('compounding')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              getGrowthModel(activePreset) === 'compounding'
                ? 'bg-[#e53935]/20 border-[#e53935] text-white'
                : 'bg-white/5 border-white/10 text-[#9e9e9e] hover:bg-white/10'
            }`}
            type="button"
            title="Compounding — productivity grows exponentially with TL (Mneme default)"
          >
            <div className="font-medium">Compounding</div>
            <div className="text-xs opacity-70 mt-0.5">Income scales with TL (~3.3× per step)</div>
          </button>
          <button
            onClick={() => handleGrowthModelChange('stable')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              getGrowthModel(activePreset) === 'stable'
                ? 'bg-[#e53935]/20 border-[#e53935] text-white'
                : 'bg-white/5 border-white/10 text-[#9e9e9e] hover:bg-white/10'
            }`}
            type="button"
            title="Stable — flat income across all TLs (CE / Traveller default)"
          >
            <div className="font-medium">Stable</div>
            <div className="text-xs opacity-70 mt-0.5">Same income at every TL</div>
          </button>
        </div>
        <p className="text-xs text-[#9e9e9e]">
          Selecting a model loads its matching built-in preset (Mneme or CE). You can still customize
          Boat Years, income, and table weights afterward.
        </p>
      </div>

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
              and a small colony with high automation can sustain significant starport traffic because machines don&apos;t
              sleep or draw wages. Wealth concentrations are possible even on young worlds.
            </p>
            <p>
              <strong className="text-white">You can model either here.</strong> <em>CE / Traveller</em> suits slow,
              human-labour-dominant economies where stability is the baseline. <em>Mneme</em> suits high-compound,
              post-scarcity-adjacent growth where automation reshapes what &quot;development&quot; even means. The Boat-Years
              setting anchors the entire economy: a larger number makes ships prohibitively expensive and naturally
              reduces port traffic regardless of which model you choose.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
