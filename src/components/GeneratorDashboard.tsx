import { useState } from 'react';
import type { StarSystem, GeneratorOptions, StellarClass, StellarGrade, WorldType } from '../types';
import { Sparkles, ChevronRight, Clock } from 'lucide-react';
// @ts-ignore - lucide-react types

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
  const [starClass,     setStarClass]     = useState<StellarClass | 'random'>('random');
  const [starGrade,     setStarGrade]     = useState<StellarGrade | 'random'>('random');
  const [mainWorldType, setMainWorldType] = useState<WorldType | 'random'>('random');
  const [populated,     setPopulated]     = useState<boolean>(true);

  function handleGenerate() {
    onGenerate({ starClass, starGrade, mainWorldType, populated });
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

function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000)     return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000)         return `${(pop / 1_000).toFixed(1)}K`;
  return pop.toString();
}
