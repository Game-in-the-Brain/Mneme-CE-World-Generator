import { useState, useEffect } from 'react';
import type { TableWeights } from '../types';
import { Settings2 } from 'lucide-react';
import {
  WEALTH_OUTCOMES, DEV_OUTCOMES, POWER_OUTCOMES, GOV_OUTCOMES,
  diceToOutcomeWeights, outcomeWeightsToDice,
} from '../lib/settingsConstants';
import { loadGeneratorOptions, saveGeneratorOptions } from '../lib/optionsStorage';
import {
  DEFAULT_DEVELOPMENT_WEIGHTS,
  DEFAULT_POWER_WEIGHTS,
  DEFAULT_GOV_WEIGHTS,
  MNEME_WEALTH_WEIGHTS,
} from '../lib/economicPresets';

function WeightCard({
  title,
  outcomes,
  weights,
  onChange,
}: {
  title: string;
  outcomes: import('../lib/settingsConstants').WeightOutcome[];
  weights: TableWeights;
  onChange: (weights: TableWeights) => void;
}) {
  const outcomeWeights = diceToOutcomeWeights(weights.dice, outcomes);
  const total = outcomeWeights.reduce((a, b) => a + b, 0);

  function updateOutcomeWeight(index: number, value: number) {
    const next = [...outcomeWeights];
    next[index] = Math.max(0, value);
    onChange({ dice: outcomeWeightsToDice(next, outcomes) });
  }

  return (
    <div className="p-3 rounded border bg-[#141419] border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-white">{title}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium ${
            total > 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
          }`}
        >
          {'\u2211'} {Math.round(total * 10) / 10}
        </span>
      </div>
      <div className="space-y-2">
        {outcomes.map((outcome, i) => {
          const weight = outcomeWeights[i];
          const pct = total > 0 ? Math.round((weight / total) * 100) : 0;
          return (
            <div key={outcome.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-white truncate">{outcome.label}</span>
                  <span className="text-[#9e9e9e] shrink-0">{outcome.descriptor}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#9e9e9e] w-8 text-right">{pct}%</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={Math.round(weight)}
                    onChange={(e) => updateOutcomeWeight(i, Number(e.target.value))}
                    className="w-14 text-right text-sm rounded px-1 py-0.5 bg-[#0f0f14] border border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#e53935]/60 rounded-full transition-all"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TableWeightsSection() {
  const [devWeights, setDevWeights] = useState(
    loadGeneratorOptions().developmentWeights || DEFAULT_DEVELOPMENT_WEIGHTS
  );
  const [powerWeights, setPowerWeights] = useState(
    loadGeneratorOptions().powerWeights || DEFAULT_POWER_WEIGHTS
  );
  const [govWeights, setGovWeights] = useState(
    loadGeneratorOptions().govWeights || DEFAULT_GOV_WEIGHTS
  );
  const [wealthWeights, setWealthWeights] = useState(
    loadGeneratorOptions().wealthWeights || MNEME_WEALTH_WEIGHTS
  );

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({
      ...current,
      developmentWeights: devWeights,
      powerWeights,
      govWeights,
      wealthWeights,
    });
  }, [devWeights, powerWeights, govWeights, wealthWeights]);

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Settings2 className="text-[#e53935]" size={20} />
        Table Weights
      </h3>
      <p className="text-sm text-[#9e9e9e]">
        Adjust the probability distributions used for 2D6 table lookups. Each outcome gets a relative weight; the generator converts these into percentages automatically.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeightCard title="Wealth" outcomes={WEALTH_OUTCOMES} weights={wealthWeights} onChange={setWealthWeights} />
        <WeightCard title="Development" outcomes={DEV_OUTCOMES} weights={devWeights} onChange={setDevWeights} />
        <WeightCard title="Power Structure" outcomes={POWER_OUTCOMES} weights={powerWeights} onChange={setPowerWeights} />
        <WeightCard title="Source of Power" outcomes={GOV_OUTCOMES} weights={govWeights} onChange={setGovWeights} />
      </div>
    </div>
  );
}
