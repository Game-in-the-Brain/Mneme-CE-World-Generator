import { useState } from 'react';
import type { StarSystem, Star, MainWorld, Inhabitants } from '../types';
import { FileJson, FileSpreadsheet, Sun, Globe, Users, Building, Anchor, Sparkles } from 'lucide-react';
// @ts-ignore - lucide-react types

interface SystemViewerProps {
  system: StarSystem;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export function SystemViewer({ system, onExportJSON, onExportCSV }: SystemViewerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'star' | 'world' | 'inhabitants' | 'system'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Sparkles size={16} /> },
    { id: 'star', label: 'Star', icon: <Sun size={16} /> },
    { id: 'world', label: 'World', icon: <Globe size={16} /> },
    { id: 'inhabitants', label: 'Inhabitants', icon: <Users size={16} /> },
    { id: 'system', label: 'Planetary System', icon: <Building size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-4xl font-bold star-${system.primaryStar.class}`}>
              {system.primaryStar.class}{system.primaryStar.grade}
            </span>
            <span className="text-[#9e9e9e]">Primary Star</span>
          </div>
          <p className="text-sm text-[#9e9e9e]">
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
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-[#e53935] text-white'
                : 'text-[#9e9e9e] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab system={system} />}
        {activeTab === 'star' && <StarTab system={system} />}
        {activeTab === 'world' && <WorldTab world={system.mainWorld} />}
        {activeTab === 'inhabitants' && <InhabitantsTab inhabitants={system.inhabitants} />}
        {activeTab === 'system' && <PlanetarySystemTab system={system} />}
      </div>
    </div>
  );
}

function OverviewTab({ system }: { system: StarSystem }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sun className="text-[#e53935]" size={20} />
          Star System
        </h3>
        <div className="space-y-2">
          <DataRow label="Primary Star" value={`${system.primaryStar.class}${system.primaryStar.grade}`} />
          <DataRow label="Mass" value={`${system.primaryStar.mass} M☉`} />
          <DataRow label="Luminosity" value={`${system.primaryStar.luminosity.toExponential(2)} L☉`} />
          <DataRow label="Companions" value={system.companionStars.length.toString()} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="text-[#e53935]" size={20} />
          Main World
        </h3>
        <div className="space-y-2">
          <DataRow label="Type" value={system.mainWorld.type} />
          <DataRow label="Size" value={`${system.mainWorld.size.toLocaleString()} km`} />
          <DataRow label="Gravity" value={`${system.mainWorld.gravity} G`} />
          <DataRow label="Habitability" value={system.mainWorld.habitability.toString()} className={
            system.mainWorld.habitability > 5 ? 'habitability-excellent' :
            system.mainWorld.habitability > 0 ? 'habitability-good' :
            system.mainWorld.habitability > -5 ? 'habitability-marginal' :
            'habitability-hostile'
          } />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="text-[#e53935]" size={20} />
          Inhabitants
        </h3>
        <div className="space-y-2">
          <DataRow label="Tech Level" value={`TL ${system.inhabitants.techLevel}`} />
          <DataRow label="Population" value={system.inhabitants.population.toLocaleString()} />
          <DataRow label="Wealth" value={system.inhabitants.wealth} />
          <DataRow label="Government" value={`${system.inhabitants.powerStructure} (${system.inhabitants.sourceOfPower})`} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Anchor className="text-[#e53935]" size={20} />
          Starport & Travel
        </h3>
        <div className="space-y-2">
          <DataRow label="Starport" value={`Class ${system.inhabitants.starport.class}`} />
          <DataRow label="Output" value={`${system.inhabitants.starport.output.toExponential(1)} Cr/week`} />
          <DataRow label="Bases" value={[
            system.inhabitants.starport.hasNavalBase && 'Naval',
            system.inhabitants.starport.hasScoutBase && 'Scout',
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
          <ZoneBox label="Infernal" range={`0-${system.zones.infernal.max.toFixed(2)}`} color="zone-infernal" />
          <ZoneBox label="Hot" range={`${system.zones.hot.min.toFixed(2)}-${system.zones.hot.max.toFixed(2)}`} color="zone-hot" />
          <ZoneBox label="Habitable" range={`${system.zones.conservative.min.toFixed(2)}-${system.zones.conservative.max.toFixed(2)}`} color="zone-conservative" />
          <ZoneBox label="Cold" range={`${system.zones.cold.min.toFixed(2)}-${system.zones.cold.max.toFixed(2)}`} color="zone-cold" />
          <ZoneBox label="Outer" range={`≥${system.zones.outer.min.toFixed(2)}`} color="zone-outer" />
        </div>
        <div className="mt-3 p-2 bg-white/5 rounded text-center">
          <span className="text-[#9e9e9e]">Main World Position: </span>
          <span className={`font-semibold zone-${system.mainWorld.zone.toLowerCase().replace(' ', '-')}`}>
            {system.mainWorld.zone} Zone at {system.mainWorld.distanceAU} AU
          </span>
        </div>
      </div>
    </div>
  );
}

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
              <div key={star.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Companion {index + 1}</span>
                  <span className="text-[#9e9e9e]">{star.orbitDistance} AU from {star.orbits}</span>
                </div>
                <StarDetails star={star} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StarDetails({ star }: { star: Star; isPrimary?: boolean }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-4 bg-white/5 rounded-lg">
        <div className={`text-4xl font-bold mb-2 star-${star.class}`}>
          {star.class}{star.grade}
        </div>
        <div className="text-sm text-[#9e9e9e]">Spectral Classification</div>
      </div>
      <div className="space-y-2">
        <DataRow label="Mass" value={`${star.mass} M☉`} />
        <DataRow label="Luminosity" value={`${star.luminosity.toExponential(2)} L☉`} />
        <DataRow label="Temperature" value={`${star.id ? '—' : '—'} K`} />
      </div>
      <div className="space-y-2">
        <DataRow label="Color" value={star.color} />
        <DataRow label="Description" value={star.id ? '—' : '—'} />
      </div>
    </div>
  );
}

function WorldTab({ world }: { world: MainWorld }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Physical Characteristics</h3>
        <div className="space-y-2">
          <DataRow label="Type" value={world.type} />
          <DataRow label="Size" value={`${world.size.toLocaleString()} km`} />
          <DataRow label="Gravity" value={`${world.gravity} G`} />
          <DataRow label="Radius" value={`${world.radius} km`} />
          <DataRow label="Escape Velocity" value={`${world.escapeVelocity} km/s`} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Environment</h3>
        <div className="space-y-2">
          <DataRow 
            label="Atmosphere" 
            value={`${world.atmosphere} (TL${world.atmosphereTL})`} 
          />
          <DataRow 
            label="Temperature" 
            value={`${world.temperature} (TL${world.temperatureTL})`} 
          />
          <DataRow 
            label="Hazard" 
            value={world.hazard !== 'None' 
              ? `${world.hazard} (${world.hazardIntensity}, TL${world.hazardIntensityTL})` 
              : 'None'
            } 
          />
          <DataRow label="Resources" value={world.biochemicalResources} />
        </div>
      </div>

      <div className="card md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Habitability Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HabitabilityBox label="Total" value={world.habitability} />
          <HabitabilityBox label="Atmosphere" value={getAtmosphereHabitability(world.atmosphere)} />
          <HabitabilityBox label="Temperature" value={getTemperatureHabitability(world.temperature)} />
          <HabitabilityBox label="Hazard" value={getHazardHabitability(world.hazard, world.hazardIntensity)} />
        </div>
      </div>
    </div>
  );
}

function InhabitantsTab({ inhabitants }: { inhabitants: Inhabitants }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Demographics</h3>
        <div className="space-y-2">
          <DataRow label="Tech Level" value={`TL ${inhabitants.techLevel}`} />
          <DataRow label="Population" value={inhabitants.population.toLocaleString()} />
          <DataRow label="Wealth" value={inhabitants.wealth} />
          <DataRow label="Development" value={inhabitants.development} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Government</h3>
        <div className="space-y-2">
          <DataRow label="Power Structure" value={inhabitants.powerStructure} />
          <DataRow label="Source of Power" value={inhabitants.sourceOfPower} />
          <DataRow label="Governance DM" value={inhabitants.governance > 0 ? `+${inhabitants.governance}` : inhabitants.governance.toString()} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Starport</h3>
        <div className="space-y-2">
          <DataRow label="Class" value={inhabitants.starport.class} />
          <DataRow label="Weekly Output" value={`${inhabitants.starport.output.toExponential(1)} Credits`} />
          <DataRow 
            label="Bases" 
            value={[
              inhabitants.starport.hasNavalBase && 'Naval Base',
              inhabitants.starport.hasScoutBase && 'Scout Base',
              inhabitants.starport.hasPirateBase && 'Pirate Base',
            ].filter(Boolean).join(', ') || 'None'} 
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Travel & Culture</h3>
        <div className="space-y-2">
          <DataRow 
            label="Travel Zone" 
            value={inhabitants.travelZone + (inhabitants.travelZoneReason ? ` (${inhabitants.travelZoneReason})` : '')} 
          />
          <DataRow 
            label="Culture Traits" 
            value={inhabitants.cultureTraits.join(', ') || 'None'} 
          />
        </div>
      </div>
    </div>
  );
}

function PlanetarySystemTab({ system }: { system: StarSystem }) {
  const totalBodies = 
    system.circumstellarDisks.length +
    system.dwarfPlanets.length +
    system.terrestrialWorlds.length +
    system.iceWorlds.length +
    system.gasWorlds.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <BodyCountCard label="Disks" count={system.circumstellarDisks.length} />
        <BodyCountCard label="Dwarfs" count={system.dwarfPlanets.length} />
        <BodyCountCard label="Terrestrial" count={system.terrestrialWorlds.length} />
        <BodyCountCard label="Ice Worlds" count={system.iceWorlds.length} />
        <BodyCountCard label="Gas Giants" count={system.gasWorlds.length} />
      </div>

      <div className="text-center text-[#9e9e9e]">
        Total Planetary Bodies: <span className="text-white font-semibold">{totalBodies}</span>
      </div>

      {/* List of all bodies sorted by distance */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">All Bodies by Distance</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {[
            ...system.circumstellarDisks.map(b => ({ ...b, typeLabel: 'Disk' })),
            ...system.dwarfPlanets.map(b => ({ ...b, typeLabel: 'Dwarf' })),
            ...system.terrestrialWorlds.map(b => ({ ...b, typeLabel: 'Terrestrial' })),
            ...system.iceWorlds.map(b => ({ ...b, typeLabel: 'Ice' })),
            ...system.gasWorlds.map(b => ({ ...b, typeLabel: `Gas ${b.gasClass}` })),
          ]
            .sort((a, b) => a.distanceAU - b.distanceAU)
            .map((body, index) => (
              <div 
                key={body.id} 
                className="flex items-center justify-between p-2 bg-white/5 rounded text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#9e9e9e] w-6">{index + 1}</span>
                  <span className="font-medium">{body.typeLabel}</span>
                  {body.gasClass && <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Class {body.gasClass}</span>}
                  {body.lesserEarthType && <span className="text-xs bg-white/10 px-2 py-0.5 rounded">{body.lesserEarthType}</span>}
                </div>
                <div className="flex items-center gap-4 text-[#9e9e9e]">
                  <span className={`zone-${body.zone.toLowerCase().replace(' ', '-')}`}>{body.zone}</span>
                  <span>{body.distanceAU} AU</span>
                  <span>{body.mass} M⊕</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Helper Components

function DataRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
      <span className="text-[#9e9e9e]">{label}</span>
      <span className={`font-medium ${className}`}>{value}</span>
    </div>
  );
}

function ZoneBox({ label, range, color }: { label: string; range: string; color: string }) {
  return (
    <div className="p-3 bg-white/5 rounded">
      <div className={`font-semibold ${color}`}>{label}</div>
      <div className="text-xs text-[#9e9e9e] mt-1">{range}</div>
    </div>
  );
}

function HabitabilityBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 bg-white/5 rounded text-center">
      <div className={`text-2xl font-bold ${
        value > 0 ? 'habitability-excellent' :
        value === 0 ? 'text-[#9e9e9e]' :
        'habitability-hostile'
      }`}>
        {value > 0 ? `+${value}` : value}
      </div>
      <div className="text-xs text-[#9e9e9e] mt-1">{label}</div>
    </div>
  );
}

function BodyCountCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="card text-center p-4">
      <div className="text-2xl font-bold text-[#e53935]">{count}</div>
      <div className="text-xs text-[#9e9e9e]">{label}</div>
    </div>
  );
}

// Helper functions for habitability values
function getAtmosphereHabitability(atmosphere: string): number {
  const values: Record<string, number> = {
    'Average': 0, 'Thin': -1, 'Trace': -1.5, 'Dense': -2, 'Crushing': -2.5
  };
  return values[atmosphere] || 0;
}

function getTemperatureHabitability(temperature: string): number {
  const values: Record<string, number> = {
    'Average': 0, 'Cold': -0.5, 'Freezing': -1, 'Hot': -1.5, 'Inferno': -2
  };
  return values[temperature] || 0;
}

function getHazardHabitability(hazard: string, intensity: string): number {
  if (hazard === 'None') return 0;
  const intensityMod: Record<string, number> = {
    'Very Mild': 0, 'Mild': -0.5, 'Serious': -1, 'High': -1.5, 'Intense': -2
  };
  const baseMod: Record<string, number> = {
    'Radioactive': -1.5, 'Toxic': -1.5, 'Biohazard': -1, 'Corrosive': -1, 'Polluted': -0.5
  };
  return (baseMod[hazard] || 0) + (intensityMod[intensity] || 0);
}
