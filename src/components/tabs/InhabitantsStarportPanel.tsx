import { formatCredits, formatAnnualTrade } from '../../lib/format';
import { displayTL } from '../../lib/economicPresets';
import type { Inhabitants, StarSystem } from '../../types';
import { DataRow } from './tabHelpers';
import { FootnoteBlock } from './WorldTab';

interface InhabitantsStarportPanelProps {
  inhabitants: Inhabitants;
  system: StarSystem;
  starportChanged?: boolean;
  weeklyRoll?: number;
  onRollWeekly?: () => void;
}

export function InhabitantsStarportPanel({
  inhabitants, system, starportChanged, weeklyRoll, onRollWeekly,
}: InhabitantsStarportPanelProps) {
  return (
    <div
      className="card space-y-4"
      style={starportChanged ? { borderLeft: '3px solid var(--accent-amber, #f59e0b)' } : undefined}
    >
      <h3 className="text-lg font-semibold flex items-center gap-2">
        Starport
        {starportChanged && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pending
          </span>
        )}
      </h3>
      <div className="space-y-2">
        <DataRow
          label="Class"
          value={
            inhabitants.starport.foundingClass && inhabitants.starport.foundingClass !== inhabitants.starport.class
              ? `Class ${inhabitants.starport.class} (founded Class ${inhabitants.starport.foundingClass})`
              : `Class ${inhabitants.starport.class}`
          }
        />
        <DataRow
          label="PSS"
          value={
            inhabitants.starport.foundingPSS !== undefined && inhabitants.starport.foundingPSS !== inhabitants.starport.pss
              ? `${inhabitants.starport.pss} (founded ${inhabitants.starport.foundingPSS}) (raw ${inhabitants.starport.rawClass}, TL cap ${inhabitants.starport.tlCap})`
              : `${inhabitants.starport.pss} (raw ${inhabitants.starport.rawClass}, TL cap ${inhabitants.starport.tlCap})`
          }
        />
        <DataRow
          label="Bases"
          value={[
            inhabitants.starport.hasNavalBase  && 'Naval Base',
            inhabitants.starport.hasScoutBase  && 'Scout Base',
            inhabitants.starport.hasPirateBase && 'Pirate Base',
          ].filter(Boolean).join(', ') || 'None'}
        />
        <DataRow label="Annual Trade" value={formatAnnualTrade(inhabitants.starport.annualTrade)} />
        <DataRow label="Weekly Base"  value={formatCredits(inhabitants.starport.weeklyBase)} />
      </div>

      {/* Weekly activity with roll button (FR-029) */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>This Week</span>
          <span className="font-bold">{formatCredits(inhabitants.starport.weeklyActivity)}</span>
        </div>
        {weeklyRoll !== undefined && (
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            Rolled 3D6: <span className="font-mono">{weeklyRoll}</span>
          </div>
        )}
        <button
          onClick={onRollWeekly}
          disabled={!onRollWeekly}
          className="text-xs px-3 py-1.5 rounded border transition-colors"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          Roll 3D6
        </button>
        <FootnoteBlock>
          <strong>What this means:</strong> Port Activity is a snapshot, not a steady income: (Annual Port Trade ÷ 52) × 3D6. It varies each visit.
          Weekly Base = Annual Port Trade ÷ 52.
          Annual Port Trade = Population × GDP/person/day × 365 × Trade Fraction (varies by development level).
          PSS = floor(log₁₀(Annual Trade)) − 10. Final class = min(PSS class, TL capability cap).
          TL sets the capability ceiling — no amount of money lets a {displayTL(9, system.economicPresetLabel)} world build jump drives.
          Roll varies week to week; this figure reflects conditions when you arrived.
        </FootnoteBlock>
      </div>
    </div>
  );
}
