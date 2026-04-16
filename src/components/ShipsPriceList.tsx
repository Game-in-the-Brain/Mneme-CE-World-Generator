import { useMemo } from 'react';
import type { TLProductivityPreset } from '../types';
import { X } from 'lucide-react';
import shipReference from '../../mneme_ship_reference.json';
import { loadGeneratorOptions } from '../lib/optionsStorage';
import { getIncomeYears, MNEME_PRESET } from '../lib/economicPresets';

interface ShipsPriceListProps {
  preset?: TLProductivityPreset;
  onClose: () => void;
}

interface ShipRef {
  name: string;
  tl: number;
  dt: number;
  total_cost_cr: number;
  monthly_operating_cost_cr: number;
  category: string;
  traffic_pool: string;
}

export function ShipsPriceList({ preset: presetProp, onClose }: ShipsPriceListProps) {
  const preset = presetProp || loadGeneratorOptions().tlProductivityPreset || MNEME_PRESET;

  const ships = useMemo(() => {
    const list = (shipReference as unknown as { ships: ShipRef[] }).ships.slice().sort((a, b) => a.total_cost_cr - b.total_cost_cr);
    return list.map((s) => ({
      ...s,
      incomeYears: getIncomeYears(s.total_cost_cr, 9, preset),
    }));
  }, [preset]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-xl shadow-2xl flex flex-col"
        style={{ backgroundColor: 'var(--bg-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-xl font-bold">Ships Price List</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Economic model: <strong>{preset.name || preset.id}</strong> • Income-Years calculated at TL {preset.baseTL || 9}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 px-6 py-4">
          <table className="w-full text-sm">
            <thead className="sticky top-0" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th className="text-left py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Ship</th>
                <th className="text-right py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>DT</th>
                <th className="text-right py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Purchase Price (Cr)</th>
                <th className="text-right py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Income-Years</th>
                <th className="text-right py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Monthly Upkeep</th>
              </tr>
            </thead>
            <tbody>
              {ships.map((s) => (
                <tr key={s.name} className="even:bg-white/[0.02]">
                  <td className="py-2 pr-4">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.category}</div>
                  </td>
                  <td className="py-2 text-right font-mono">{s.dt.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono">{Math.round(s.total_cost_cr).toLocaleString()}</td>
                  <td className="py-2 text-right font-mono">
                    {Number.isFinite(s.incomeYears) ? Math.round(s.incomeYears).toLocaleString() : '—'}
                  </td>
                  <td className="py-2 text-right font-mono">{Math.round(s.monthly_operating_cost_cr).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 border-t text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
          <p>
            <strong>CE / Traveller:</strong> prices in raw Credits — incomes are low, so ships appear enormously expensive in human terms.
          </p>
          <p className="mt-1">
            <strong>Mneme:</strong> the SOC-income grid makes ships affordable relative to per-capita output. A 10DT Boat (~10 years at TL 9) is like buying a car.
          </p>
        </div>
      </div>
    </div>
  );
}
