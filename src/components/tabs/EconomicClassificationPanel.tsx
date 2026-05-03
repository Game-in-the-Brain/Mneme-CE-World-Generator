import type { Inhabitants, StarSystem, EconomicDriver } from '../../types';
import { reclassifyWithDriver } from '../../lib/economicClassification';

interface Props {
  inhabitants: Inhabitants;
  system: StarSystem;
  isEditing: boolean;
  onEditInhabitants?: (inhabitants: Inhabitants) => void;
}

export function EconomicClassificationPanel({ inhabitants, system, isEditing, onEditInhabitants }: Props) {
  const ec = inhabitants.economicClassification;
  if (!ec) return null;

  return (
    <div className="card space-y-4 md:col-span-2" style={{ borderColor: 'var(--accent-emerald, #10b981)' }}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-emerald-400">◈</span>
        Economic Classification
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-2 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
          <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Primary Driver</div>
          <div className="text-sm font-semibold">{ec.primaryDriver}</div>
        </div>
        <div className="p-2 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
          <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Tech Tier</div>
          <div className="text-sm font-semibold">{ec.techTier}</div>
        </div>
        <div className="p-2 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
          <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Population Scale</div>
          <div className="text-sm font-semibold">{ec.populationScale}</div>
        </div>
        <div className="p-2 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
          <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>CE Trade Codes</div>
          <div className="flex flex-wrap gap-1">
            {ec.ceTradeCodes.length > 0 ? (
              ec.ceTradeCodes.map(code => (
                <span key={code} className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {code}
                </span>
              ))
            ) : (
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>—</span>
            )}
          </div>
        </div>
      </div>

      {ec.modifiers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ec.modifiers.map(mod => (
            <span key={mod} className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">
              {mod}
            </span>
          ))}
        </div>
      )}

      <div className="p-3 rounded space-y-2" style={{ backgroundColor: 'var(--row-hover)' }}>
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Summary</div>
        <p className="text-sm leading-relaxed">{ec.summary}</p>
      </div>

      <div className="p-3 rounded space-y-2" style={{ backgroundColor: 'var(--row-hover)' }}>
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Why They&apos;re Here</div>
        <p className="text-sm leading-relaxed italic">{ec.reasonForExistence}</p>
      </div>

      {isEditing && onEditInhabitants && (
        <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
              Override Primary Driver
            </label>
          </div>
          <select
            value={ec.primaryDriver}
            onChange={(e) => {
              const driver = e.target.value as EconomicDriver;
              const reclassified = reclassifyWithDriver(system, driver);
              onEditInhabitants({
                ...inhabitants,
                economicClassification: reclassified,
              });
            }}
            className="w-full rounded px-2 py-2 text-sm border"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            {([
              'Extraction',
              'Agricultural Surplus',
              'Manufacturing',
              'Refining',
              'Services / Trade Hub',
              'High-Technology',
              'Subsistence / Closed',
              'Research Outpost',
            ] as const).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
