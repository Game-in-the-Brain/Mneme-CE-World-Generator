import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { formatPopulation } from '../../lib/format';
import {
  WEALTH_DESCRIPTIONS, WEALTH_DESCRIPTIONS_LOW_POP,
  DEVELOPMENT_DESCRIPTIONS, DEVELOPMENT_DESCRIPTIONS_LOW_POP,
} from '../../lib/worldData';
import { getWealthDevelopmentContext } from '../../lib/inhabitantsHelpers';
import type { Inhabitants, StarSystem } from '../../types';
import { TechLevelCard, DescriptionCard } from './WorldTab';

interface InhabitantsDemographicsPanelProps {
  inhabitants: Inhabitants;
  system: StarSystem;
  onGlossary?: () => void;
}

export function InhabitantsDemographicsPanel({ inhabitants, system, onGlossary }: InhabitantsDemographicsPanelProps) {
  const [hideEconomicFraming, setHideEconomicFraming] = useState(
    localStorage.getItem('mneme_hide_economic_framing') === 'true'
  );

  function toggleEconomicFraming() {
    const next = !hideEconomicFraming;
    setHideEconomicFraming(next);
    localStorage.setItem('mneme_hide_economic_framing', String(next));
  }

  const useLowPop = inhabitants.populated !== false && inhabitants.population < 1_000_000;
  const wealthDesc = useLowPop ? WEALTH_DESCRIPTIONS_LOW_POP[inhabitants.wealth] : WEALTH_DESCRIPTIONS[inhabitants.wealth];
  const devDesc    = useLowPop ? DEVELOPMENT_DESCRIPTIONS_LOW_POP[inhabitants.development] : DEVELOPMENT_DESCRIPTIONS[inhabitants.development];

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Demographics</h3>
        {onGlossary && (
          <button
            onClick={onGlossary}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded border"
            style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
            title="Open Glossary — Wealth &amp; Development explained"
            type="button"
          >
            <ExternalLink size={12} /> Glossary
          </button>
        )}
      </div>

      <TechLevelCard tl={inhabitants.effectiveTL ?? inhabitants.techLevel} foundingTL={inhabitants.foundingTL} presetLabel={system.economicPresetLabel} />

      {/* Population — prominent */}
      <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
        <div className="text-3xl font-bold" style={{ color: 'var(--accent-red)' }}>
          {formatPopulation(inhabitants.population)}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Population</div>
        {inhabitants.habitatType && (
          <div className="mt-2 text-xs font-semibold px-2 py-1 rounded inline-block"
               style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            {inhabitants.habitatType} — Artificial Habitat
          </div>
        )}
        {inhabitants.habitatType && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            Habitability ≤ 0: surface is inhospitable. Inhabitants live and work inside an enclosed artificial structure.
          </p>
        )}
      </div>

      {/* Material Wealth & Equity/Development — with hide toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Economic Indicators
        </span>
        <button
          onClick={toggleEconomicFraming}
          className="text-xs px-2 py-0.5 rounded border"
          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
          type="button"
          title={hideEconomicFraming ? 'Show economic indicators' : 'Hide economic indicators'}
        >
          {hideEconomicFraming ? 'Show' : 'Hide'}
        </button>
      </div>

      {!hideEconomicFraming && (
        <>
          {/* Material Wealth */}
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Material Wealth</div>
            <DescriptionCard
              title={inhabitants.wealth}
              description={wealthDesc.description}
            />
          </div>

          {/* Contextual tension note (QA-028) */}
          {(() => {
            const note = getWealthDevelopmentContext(inhabitants.wealth, inhabitants.development);
            if (!note) return null;
            return (
              <div className="text-xs p-2 rounded border-l-2" style={{ backgroundColor: 'var(--row-hover)', borderColor: 'var(--accent-red)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Narrative context:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{note}</span>
              </div>
            );
          })()}

          {/* Equity & Development */}
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Equity &amp; Development</div>
            <DescriptionCard
              title={inhabitants.development}
              subtitle={`HDI ${devDesc.hdi}`}
              description={devDesc.description}
            />
          </div>
        </>
      )}
      {hideEconomicFraming && (
        <div className="text-xs p-2 rounded" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--row-hover)' }}>
          Economic indicators hidden. Wealth: <strong style={{ color: 'var(--text-primary)' }}>{inhabitants.wealth}</strong> · Development: <strong style={{ color: 'var(--text-primary)' }}>{inhabitants.development}</strong>
        </div>
      )}
    </div>
  );
}
