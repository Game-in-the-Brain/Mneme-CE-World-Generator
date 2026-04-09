import type { StarSystem } from '../types';
import { Sparkles, ChevronRight, Clock } from 'lucide-react';
// @ts-ignore - lucide-react types

interface GeneratorDashboardProps {
  onGenerate: () => void;
  isGenerating: boolean;
  recentSystems: StarSystem[];
  onViewSystem: (system: StarSystem) => void;
}

export function GeneratorDashboard({ 
  onGenerate, 
  isGenerating, 
  recentSystems,
  onViewSystem 
}: GeneratorDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          MNEME <span className="text-[#e53935]">WORLD GENERATOR</span>
        </h1>
        <p className="text-[#9e9e9e] text-lg max-w-2xl mx-auto mb-8">
          Generate complete star systems for the Cepheus Engine RPG. 
          Stars, worlds, inhabitants, and planetary bodies — all procedurally generated.
        </p>
        
        <button
          onClick={onGenerate}
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
        <StatCard label="Stars Generated" value={recentSystems.length.toString()} />
        <StatCard label="Star Classes" value="O-M Spectral" />
        <StatCard label="World Types" value="Habitat/Dwarf/Terrestrial" />
        <StatCard label="Travel Zones" value="Green/Amber/Red" />
      </div>

      {/* Recent Systems */}
      {recentSystems.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock size={20} className="text-[#e53935]" />
              Recent Systems
            </h2>
            <span className="text-[#9e9e9e] text-sm">
              Last {recentSystems.length} generated
            </span>
          </div>
          
          <div className="space-y-2">
            {recentSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => onViewSystem(system)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold star-${system.primaryStar.class}`}>
                    {system.primaryStar.class}{system.primaryStar.grade}
                  </span>
                  <div>
                    <div className="font-medium">
                      {system.mainWorld.type} World
                    </div>
                    <div className="text-sm text-[#9e9e9e]">
                      Habitability: {system.mainWorld.habitability} | 
                      TL: {system.inhabitants.techLevel} | 
                      Pop: {formatPopulation(system.inhabitants.population)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#9e9e9e]">
                  <span className="text-sm">
                    {new Date(system.createdAt).toLocaleDateString()}
                  </span>
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard 
          title="Star Generation"
          description="Generate primary stars and companion stars with proper mass/luminosity constraints."
        />
        <FeatureCard 
          title="World Creation"
          description="Create diverse worlds with realistic gravity, atmosphere, and temperature."
        />
        <FeatureCard 
          title="Inhabitants"
          description="Populate worlds with cultures, governments, and starports."
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold text-[#e53935]">{value}</div>
      <div className="text-sm text-[#9e9e9e]">{label}</div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[#9e9e9e]">{description}</p>
    </div>
  );
}

function formatPopulation(pop: number): string {
  if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(1)}B`;
  if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
  if (pop >= 1000) return `${(pop / 1000).toFixed(1)}K`;
  return pop.toString();
}
