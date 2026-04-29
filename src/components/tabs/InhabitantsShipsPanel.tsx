import { formatCredits } from '../../lib/format';
import type { ShipsInAreaResult, ShipInArea } from '../../types';

interface InhabitantsShipsPanelProps {
  shipsResult: ShipsInAreaResult | null;
  onGenerateShips: () => void;
  onOpenShipsPriceList?: () => void;
}

export function InhabitantsShipsPanel({
  shipsResult, onGenerateShips, onOpenShipsPriceList,
}: InhabitantsShipsPanelProps) {
  return (
    <div className="card space-y-4 md:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ships in the Area</h3>
        <button
          onClick={onOpenShipsPriceList}
          disabled={!onOpenShipsPriceList}
          className="text-xs px-3 py-1.5 rounded border transition-colors hover:bg-white/5 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          Open Price List
        </button>
      </div>
      <button
        onClick={onGenerateShips}
        className="text-xs px-3 py-1.5 rounded border transition-colors"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        Generate Ships in the Area
      </button>

      {shipsResult && (
        <div className="space-y-4">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Budget: {formatCredits(shipsResult.budget)} ({shipsResult.distributionRoll} on distribution table)
          </div>
          <div className="space-y-3">
            <ShipLocationGroup
              label="In Orbit"
              ships={shipsResult.ships.filter(s => s.location === 'Orbit')}
            />
            {(() => {
              const systemShips = shipsResult.ships.filter(s => s.location === 'System');
              if (systemShips.length === 0) return (
                <ShipLocationGroup label="In System" ships={[]} />
              );
              const byBody = new Map<number, typeof systemShips>();
              for (const ship of systemShips) {
                const pos = ship.systemPosition ?? 1;
                if (!byBody.has(pos)) byBody.set(pos, []);
                byBody.get(pos)!.push(ship);
              }
              return Array.from(byBody.entries())
                .sort(([a], [b]) => a - b)
                .map(([pos, ships]) => (
                  <ShipLocationGroup
                    key={`system-${pos}`}
                    label={`In System — Body ${pos}`}
                    ships={ships}
                  />
                ));
            })()}
            <ShipLocationGroup
              label="Docked at Starport"
              ships={shipsResult.ships.filter(s => s.location === 'Docked')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ShipLocationGroup({ label, ships }: { label: string; ships: ShipInArea[] }) {
  if (ships.length === 0) {
    return (
      <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
        <div className="font-medium text-sm mb-1">{label}</div>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>None</div>
      </div>
    );
  }

  const counts = new Map<string, { count: number; dt: number; monthlyOperatingCost: number; purchasePrice: number; visitingCost: number }>();
  for (const s of ships) {
    const existing = counts.get(s.name);
    if (existing) {
      existing.count++;
    } else {
      counts.set(s.name, {
        count: 1,
        dt: s.dt,
        monthlyOperatingCost: s.monthlyOperatingCost,
        purchasePrice: s.purchasePrice,
        visitingCost: s.visitingCost,
      });
    }
  }

  const totalCost = ships.reduce((sum, s) => sum + s.monthlyOperatingCost, 0);

  return (
    <div className="p-3 rounded" style={{ backgroundColor: 'var(--row-hover)' }}>
      <div className="font-medium text-sm mb-2 flex items-baseline justify-between">
        <span>{label}</span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ships.length} ship{ships.length === 1 ? '' : 's'}</span>
      </div>
      <div className="space-y-1">
        {Array.from(counts.entries()).map(([name, info]) => (
          <div key={name} className="flex items-baseline justify-between text-sm">
            <span>{info.count > 1 ? `${info.count}× ` : ''}{name} ({info.dt} DT)</span>
            <span className="text-xs text-[#9e9e9e]">
              {formatCredits(info.visitingCost)} / {formatCredits(info.monthlyOperatingCost)}/mo
            </span>
          </div>
        ))}
      </div>
      <div className="text-xs mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
        Total operating cost: {formatCredits(totalCost)}
      </div>
    </div>
  );
}
