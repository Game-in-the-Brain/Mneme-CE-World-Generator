import { Clock, ChevronRight } from 'lucide-react';
import type { StarSystem } from '../types';
import { displayTL } from '../lib/economicPresets';
import { formatPopulation, getSystemCode } from '../lib/generatorDashboardUtils';

interface RecentSystemsListProps {
  systems: StarSystem[];
  onViewSystem: (system: StarSystem) => void;
}

export function RecentSystemsList({ systems, onViewSystem }: RecentSystemsListProps) {
  if (systems.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock size={20} style={{ color: 'var(--accent-red)' }} />
          Recent Systems
        </h2>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Last {systems.length} generated
        </span>
      </div>

      <div className="space-y-2">
        {systems.map((system) => (
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
                  {system.name || getSystemCode(system)}
                  {system.inhabitants.populated === false && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                      Unpopulated
                    </span>
                  )}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {system.mainWorld.type} World
                  {system.inhabitants.populated !== false && (
                    <> | Hab: {system.mainWorld.habitability} | {displayTL(system.inhabitants.techLevel, system.economicPresetLabel)} | Pop: {formatPopulation(system.inhabitants.population)}</>
                  )}
                  {' | '}{system.economicPresetLabel ?? 'Mneme'}
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
  );
}
