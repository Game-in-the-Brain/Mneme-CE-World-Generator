import type { ReactNode } from 'react';
import type { StarSystem } from '../../types';

export function DataRow({ label, value, className = '' }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className={`font-medium ${className}`}>{value}</span>
    </div>
  );
}

export function ZoneBox({ label, range, color }: { label: string; range: string; color: string }) {
  return (
    <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
      <div className={`font-semibold ${color}`}>{label}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{range}</div>
    </div>
  );
}

export function PhysProp({ label, value }: { label: string; value: string }) {
  return (
    <div className="pt-2">
      <div style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

export function HabitabilityBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
      <div className={`text-2xl font-bold ${
        value > 0  ? 'habitability-excellent' :
        value === 0 ? '' :
        'habitability-hostile'
      }`} style={value === 0 ? { color: 'var(--text-secondary)' } : {}}>
        {value > 0 ? `+${value}` : value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

export function BodyCountCard({ label, count, sub }: { label: string; count: number; sub?: string }) {
  return (
    <div className="card text-center p-4">
      <div className="text-2xl font-bold" style={{ color: 'var(--accent-red)' }}>{count}</div>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      {sub && <div className="text-[10px] mt-1 leading-tight" style={{ color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  );
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getSystemCode(system: StarSystem): string {
  const typeInitial = system.mainWorld.type.charAt(0);
  const hab = system.mainWorld.habitability >= 0 ? `+${system.mainWorld.habitability}` : `${system.mainWorld.habitability}`;
  const pop = system.inhabitants.populated !== false
    ? formatCompactNumber(system.inhabitants.population)
    : '0';
  return `${system.inhabitants.starport.class}${typeInitial}${hab}-TL${system.mainWorld.techLevel}-Pop${pop}`;
}

export function getAtmosphereHabitability(atmosphere: string): number {
  const values: Record<string, number> = {
    'Average': 0, 'Thin': -1, 'Trace': -1.5, 'Dense': -2, 'Crushing': -2.5,
  };
  return values[atmosphere] || 0;
}

export function getTemperatureHabitability(temperature: string): number {
  const values: Record<string, number> = {
    'Average': 0, 'Cold': -0.5, 'Freezing': -1, 'Hot': -1.5, 'Inferno': -2,
  };
  return values[temperature] || 0;
}

export function getHazardHabitability(hazard: string, intensity: string): number {
  if (hazard === 'None') return 0;
  const intensityMod: Record<string, number> = {
    'Very Mild': 0, 'Mild': -0.5, 'Serious': -1, 'High': -1.5, 'Intense': -2,
  };
  const baseMod: Record<string, number> = {
    'Radioactive': -1.5, 'Toxic': -1.5, 'Biohazard': -1, 'Corrosive': -1, 'Polluted': -0.5,
  };
  return (baseMod[hazard] || 0) + (intensityMod[intensity] || 0);
}
