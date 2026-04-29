import type { StarSystem } from '../types';

export function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000)     return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000)         return `${(pop / 1_000).toFixed(1)}K`;
  return pop.toString();
}

export function formatCredits(value: number): string {
  if (!isFinite(value)) return '— Cr';
  return `${new Intl.NumberFormat('en-US').format(Math.round(value))} Cr`;
}

export function getSystemCode(system: StarSystem): string {
  const typeInitial = system.mainWorld.type.charAt(0);
  const hab = system.mainWorld.habitability >= 0 ? `+${system.mainWorld.habitability}` : `${system.mainWorld.habitability}`;
  const pop = system.inhabitants.populated !== false
    ? formatPopulation(system.inhabitants.population)
    : '0';
  return `${system.inhabitants.starport.class}${typeInitial}${hab}-TL${system.mainWorld.techLevel}-Pop${pop}`;
}
