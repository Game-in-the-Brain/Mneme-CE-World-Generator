import type { ReactNode } from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatNumber } from '../../lib/format';
import { displayTL, displayTLDescriptor } from '../../lib/economicPresets';
import { CULTURE_TRAIT_DESCRIPTIONS, CULTURE_TRAIT_DESCRIPTIONS_LOW_POP, TL_TABLE } from '../../lib/worldData';
import { EARTH_REFERENCE } from '../../lib/referenceData';
import type { MainWorld } from '../../types';
import { DataRow, HabitabilityBox, getAtmosphereHabitability, getTemperatureHabitability, getHazardHabitability } from './tabHelpers';

export function WorldTab({ world, originalWorld }: { world: MainWorld; originalWorld?: MainWorld }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Physical Characteristics</h3>
        <div className="space-y-2">
          <DataRow label="Type"            value={world.type} isChanged={!!originalWorld && world.type !== originalWorld.type} />
          <DataRow label="Size"            value={`${formatNumber(world.size)} km  ·  Earth: ${formatNumber(EARTH_REFERENCE.sizeKm)} km`} isChanged={!!originalWorld && world.size !== originalWorld.size} />
          <DataRow label="Mass"            value={`${formatNumber(world.massEM)} ${world.type === 'Dwarf' ? 'LM' : 'EM'}  ·  Earth: ${EARTH_REFERENCE.massEM}`} isChanged={!!originalWorld && world.massEM !== originalWorld.massEM} />
          <DataRow label="Density"         value={`${world.densityGcm3} g/cm³  ·  Earth: ${EARTH_REFERENCE.densityGcm3}`} isChanged={!!originalWorld && world.densityGcm3 !== originalWorld.densityGcm3} />
          <DataRow label="Gravity"         value={`${world.gravity} G  ·  Earth: ${EARTH_REFERENCE.gravity}`} isChanged={!!originalWorld && world.gravity !== originalWorld.gravity} />
          <DataRow label="Radius"          value={`${formatNumber(world.radius)} km  ·  Earth: ${EARTH_REFERENCE.radiusKm} km`} isChanged={!!originalWorld && world.radius !== originalWorld.radius} />
          <DataRow label="Escape Velocity" value={`${formatNumber(world.escapeVelocity)} km/s  ·  Earth: ${EARTH_REFERENCE.escapeVelocity} km/s`} isChanged={!!originalWorld && world.escapeVelocity !== originalWorld.escapeVelocity} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Environment</h3>
        <div className="space-y-2">
          <DataRow label="Atmosphere"  value={`${world.atmosphere} (TL${world.atmosphereTL})`} isChanged={!!originalWorld && world.atmosphere !== originalWorld.atmosphere} />
          <DataRow label="Temperature" value={`${world.temperature} (TL${world.temperatureTL})`} isChanged={!!originalWorld && world.temperature !== originalWorld.temperature} />
          <DataRow
            label="Hazard"
            value={world.hazard !== 'None'
              ? `${world.hazard} (${world.hazardIntensity}, TL${world.hazardIntensityTL})`
              : 'None'}
            isChanged={!!originalWorld && (world.hazard !== originalWorld.hazard || world.hazardIntensity !== originalWorld.hazardIntensity)}
          />
          <DataRow label="Resources" value={world.biochemicalResources} isChanged={!!originalWorld && world.biochemicalResources !== originalWorld.biochemicalResources} />
        </div>
      </div>

      <div className="card md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Habitability Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HabitabilityBox label="Total"       value={world.habitability} />
          <HabitabilityBox label="Atmosphere"  value={getAtmosphereHabitability(world.atmosphere)} />
          <HabitabilityBox label="Temperature" value={getTemperatureHabitability(world.temperature)} />
          <HabitabilityBox label="Hazard"      value={getHazardHabitability(world.hazard, world.hazardIntensity)} />
        </div>
      </div>
    </div>
  );
}

export function CultureTraitList({ traits, useLowPop }: { traits: string[]; useLowPop: boolean }) {
  if (traits.length === 0) return <span style={{ color: 'var(--text-secondary)' }}>None</span>;
  return (
    <div className="space-y-3 mt-1">
      {traits.map(trait => (
        <CultureTraitCard key={trait} trait={trait} useLowPop={useLowPop} />
      ))}
    </div>
  );
}

export function CultureTraitCard({ trait, useLowPop }: { trait: string; useLowPop: boolean }) {
  const description = useLowPop
    ? (CULTURE_TRAIT_DESCRIPTIONS_LOW_POP[trait] ?? CULTURE_TRAIT_DESCRIPTIONS[trait] ?? 'No description available.')
    : (CULTURE_TRAIT_DESCRIPTIONS[trait] ?? 'No description available.');
  return (
    <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)',
         borderLeft: '3px solid var(--accent-red)' }}>
      <div className="font-semibold text-sm mb-1">{trait}</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </div>
    </div>
  );
}

export function TechLevelCard({ tl, foundingTL, presetLabel }: { tl: number; foundingTL?: number; presetLabel?: string }) {
  const [expanded, setExpanded] = useState(false);
  const entry = TL_TABLE[tl];
  const isCE = presetLabel === 'CE / Traveller';
  const primaryLabel = displayTL(tl, presetLabel);
  const secondaryLabel = isCE ? `MTL ${tl}` : `CE TL ${entry?.ceTL ?? '—'}`;
  const descriptor = isCE ? displayTLDescriptor(tl, presetLabel) : (entry?.eraName ?? '—');

  if (!entry) {
    return (
      <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
        <span className="font-bold text-lg" style={{ color: 'var(--accent-red)' }}>{primaryLabel}</span>
        {foundingTL !== undefined && foundingTL !== tl && (
          <span className="ml-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            (depressed from founding {displayTL(foundingTL, presetLabel)})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
      {/* Collapsed header — always visible */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        style={{ backgroundColor: 'var(--row-hover)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg" style={{ color: 'var(--accent-red)' }}>
            {primaryLabel}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            {secondaryLabel}
          </span>
          <span className="text-sm font-semibold">{descriptor}</span>
          {foundingTL !== undefined && foundingTL !== tl && (
            <span className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--warning, #ff9800)', color: '#000' }}>
              Depressed from {displayTL(foundingTL, presetLabel)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <span className="text-xs">{entry.ceYear}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded key technologies */}
      {expanded && (
        <div className="p-3 border-t text-sm" style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-secondary)',
        }}>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-red)' }}>
            Key Technologies — {entry.heYear}
          </div>
          {entry.keyTechnologies}
        </div>
      )}
    </div>
  );
}

export function DescriptionCard({ title, subtitle, description, titleStyle }: {
  title: string;
  subtitle?: string;
  description: string;
  titleStyle?: React.CSSProperties;
}) {
  return (
    <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)',
         borderLeft: '3px solid var(--accent-red)' }}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-semibold text-sm" style={titleStyle}>{title}</span>
        {subtitle && (
          <span className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{subtitle}</span>
        )}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </div>
    </div>
  );
}

export function FootnoteBlock({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 p-2 rounded text-xs" style={{
      backgroundColor: 'var(--row-hover)',
      color: 'var(--text-secondary)',
      borderLeft: '2px solid var(--border-color)',
    }}>
      {children}
    </div>
  );
}
