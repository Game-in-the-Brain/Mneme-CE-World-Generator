import { useState, useEffect } from 'react';
import type { StarSystem, GeneratorOptions, StellarClass, StellarGrade, WorldType, TLProductivityPreset } from '../types';
import { Sparkles } from 'lucide-react';
import { loadGeneratorOptions, saveGeneratorOptions } from '../lib/optionsStorage';
import { BUILT_IN_PRESETS, CE_PRESET, getBoatYears, BOAT_PRICE_CR } from '../lib/economicPresets';
import { ShipsPriceList } from './ShipsPriceList';
import { getAllBatches } from '../lib/db';
import type { StarSystemBatch } from '../types';
import { DebugBatchExportWrapper } from './DebugBatchExport';
import { StatCard, FeatureCard } from './generatorDashboardComponents';
import { RecentSystemsList } from './RecentSystemsList';
import { RecentBatchesList } from './RecentBatchesList';
import { formatCredits } from '../lib/generatorDashboardUtils';

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

const CURVE_LABELS: Record<string, string> = {
  mneme: 'Mneme — compounding',
  flat: 'Flat — stagnant',
  linear: 'Linear — fixed %',
  custom: 'Custom — per-TL',
};

export function GeneratorDashboard({
  onGenerate,
  isGenerating,
  recentSystems,
  onViewSystem,
}: GeneratorDashboardProps) {
  const defaults = loadGeneratorOptions();

  const [starClass, setStarClass] = useState<StellarClass | 'random'>(defaults.starClass);
  const [starGrade, setStarGrade] = useState<StellarGrade | 'random'>(defaults.starGrade);
  const [mainWorldType, setMainWorldType] = useState<WorldType | 'random'>(defaults.mainWorldType);
  const [populated, setPopulated] = useState<boolean>(defaults.populated);
  const [activePreset, setActivePreset] = useState<TLProductivityPreset>(defaults.tlProductivityPreset || CE_PRESET);
  const [customPresets] = useState<TLProductivityPreset[]>(() => {
    try {
      const raw = localStorage.getItem('mneme_custom_presets');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showShipsPriceList, setShowShipsPriceList] = useState(false);
  const [recentBatches, setRecentBatches] = useState<StarSystemBatch[]>([]);
  const [goalStarportMin, setGoalStarportMin] = useState<import('../types').StarportClass | ''>(defaults.goalStarportMin || '');
  const [goalMinPopulation, setGoalMinPopulation] = useState<string>(defaults.goalMinPopulation?.toString() || '');
  const [goalHabitable, setGoalHabitable] = useState<boolean>(defaults.goalHabitable || false);
  const [allowShipsAtXPort, setAllowShipsAtXPort] = useState<boolean>(defaults.allowShipsAtXPort ?? true);
  const [rawUdpMode, setRawUdpMode] = useState<boolean>(defaults.rawUdpMode ?? false);
  const [includeNames, setIncludeNames] = useState<boolean>(defaults.includeNames ?? false);
  const [goalModeOpen, setGoalModeOpen] = useState(true);

  const allPresets = [...BUILT_IN_PRESETS, ...customPresets];
  const isKnownPreset = allPresets.some((p) => p.id === activePreset.id);

  useEffect(() => {
    getAllBatches().then(setRecentBatches).catch(console.error);
  }, [recentSystems]);

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({
      ...current,
      starClass,
      starGrade,
      mainWorldType,
      populated,
      tlProductivityPreset: activePreset,
      goalStarportMin: goalStarportMin || undefined,
      goalMinPopulation: goalMinPopulation ? Number(goalMinPopulation) : undefined,
      goalHabitable: goalHabitable || undefined,
      allowShipsAtXPort: allowShipsAtXPort || undefined,
      rawUdpMode,
      includeNames,
    });
  }, [starClass, starGrade, mainWorldType, populated, activePreset, goalStarportMin, goalMinPopulation, goalHabitable, allowShipsAtXPort, rawUdpMode, includeNames]);

  function handlePresetChange(id: string) {
    const builtIn = BUILT_IN_PRESETS.find((p) => p.id === id);
    if (builtIn) {
      setActivePreset(builtIn);
      return;
    }
    const custom = customPresets.find((p) => p.id === id);
    if (custom) setActivePreset(custom);
  }

  function handleGenerate() {
    const current = loadGeneratorOptions();
    onGenerate({
      ...current,
      starClass,
      starGrade,
      mainWorldType,
      populated,
      tlProductivityPreset: activePreset,
      goalStarportMin: goalStarportMin || undefined,
      goalMinPopulation: goalMinPopulation ? Number(goalMinPopulation) : undefined,
      goalHabitable: goalHabitable || undefined,
      allowShipsAtXPort: allowShipsAtXPort || undefined,
      rawUdpMode,
      includeNames,
    });
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

          {/* System Targets (FR-033) — populated toggle + goal loop options */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setGoalModeOpen((v) => !v)}
              className="flex items-center gap-1 mb-2 text-sm font-semibold w-full text-left"
              style={{ color: 'var(--text-primary)' }}
              type="button"
            >
              {goalModeOpen ? '▾' : '▸'} System Targets
            </button>

            {goalModeOpen && (
              <div className="text-left space-y-3">
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Set targets for the kind of world you need. The generator will loop up to 2,000 times to find the closest match — useful when building a subsector and you need a specific kind of world.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="populated-toggle"
                      type="checkbox"
                      checked={populated}
                      onChange={(e) => setPopulated(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="populated-toggle" className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      Inhabited world
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide mb-1 text-[var(--text-secondary)]">
                      Min Starport
                    </label>
                    <select
                      value={goalStarportMin}
                      onChange={(e) => setGoalStarportMin(e.target.value as import('../types').StarportClass | '')}
                      className="w-full rounded px-2 py-2 text-sm border"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <option value="">Any</option>
                      {['X', 'E', 'D', 'C', 'B', 'A'].map((c) => (
                        <option key={c} value={c}>Class {c} or better</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide mb-1 text-[var(--text-secondary)]">
                      Min Population
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 1000000"
                      value={goalMinPopulation}
                      onChange={(e) => setGoalMinPopulation(e.target.value)}
                      className="w-full rounded px-2 py-2 text-sm border"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="habitable-toggle"
                      type="checkbox"
                      checked={goalHabitable}
                      onChange={(e) => setGoalHabitable(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="habitable-toggle" className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      Habitable world (Hab &gt; 0)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="ships-x-toggle"
                      type="checkbox"
                      checked={allowShipsAtXPort}
                      onChange={(e) => setAllowShipsAtXPort(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="ships-x-toggle" className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      Allow ships at X-class ports
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="include-names-toggle"
                      type="checkbox"
                      checked={includeNames}
                      onChange={(e) => setIncludeNames(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="include-names-toggle" className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      Generate place names
                    </label>
                  </div>
                </div>
                {populated && (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    If Hab &gt; 0: natural population via 10<sup>Hab</sup> × 2D6.
                    If Hab ≤ 0: inhabitants live in an artificial habitat (MVT/GVT table).
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Economic Assumptions (FR-032) — QA-042: read-only in Generator */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <label className="block text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
              Economic Assumptions
            </label>

            <div className="mb-3">
              <label className="block text-[10px] uppercase tracking-wide mb-1 text-[var(--text-secondary)]">
                Preset
              </label>
              <select
                value={isKnownPreset ? activePreset.id : ''}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full md:w-1/2 rounded px-2 py-2 text-sm border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="" disabled={isKnownPreset}>
                  Select preset...
                </option>
                <optgroup label="Built-in">
                  {BUILT_IN_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
                {customPresets.length > 0 && (
                  <optgroup label="Custom">
                    {customPresets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="p-3 rounded text-sm space-y-1 bg-white/5">
              <div className="flex flex-wrap gap-x-6 gap-y-1" style={{ color: 'var(--text-secondary)' }}>
                <span>
                  TL {activePreset.baseTL} SOC 7 Income:{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {formatCredits(Math.round(activePreset.baseIncome))}/mo
                  </strong>
                </span>
                <span>
                  Growth curve:{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {CURVE_LABELS[activePreset.curve] || activePreset.curve}
                  </strong>
                </span>
                <span>
                  Boat unit ({formatCredits(BOAT_PRICE_CR)}):{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {Math.round((activePreset.boatYears ?? getBoatYears(activePreset.baseIncome)) * 100) / 100} years
                  </strong>{' '}
                  at TL {activePreset.baseTL}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs mt-2">
                <span style={{ color: 'var(--text-secondary)' }}>
                  Editing presets is available in <strong>Settings</strong>.
                </span>
                <button
                  onClick={() => setShowShipsPriceList(true)}
                  className="underline hover:text-[var(--accent-red)] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  View Ships Price List
                </button>
              </div>
            </div>

            {/* FRD-068: RAW UDP mode toggle */}
            <div className="mt-3 flex items-center gap-2">
              <input
                id="raw-udp-toggle"
                type="checkbox"
                checked={rawUdpMode}
                onChange={(e) => setRawUdpMode(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="raw-udp-toggle" className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                RAW UDP Mode
              </label>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                — Display worlds in classic Cepheus Engine UWP format
              </span>
            </div>
          </div>
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
      <RecentSystemsList systems={recentSystems} onViewSystem={onViewSystem} />

      {/* Recent Batches */}
      <RecentBatchesList batches={recentBatches} />

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard title="Star Generation"  description="Primary and companion stars with proper mass/luminosity constraints across all 7 spectral classes." />
        <FeatureCard title="World Creation"   description="Diverse worlds with realistic gravity, atmosphere, temperature, hazards, and habitability scoring." />
        <FeatureCard title="Inhabitants"      description="Natural or habitat-based populations, governments, cultures, and starport infrastructure." />
      </div>

      {showShipsPriceList && (
        <ShipsPriceList
          preset={activePreset}
          onClose={() => setShowShipsPriceList(false)}
        />
      )}
    </div>
  );
}
