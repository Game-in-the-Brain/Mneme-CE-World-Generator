
import { RotateCcw } from 'lucide-react';

import {
  POWER_STRUCTURE_DESCRIPTIONS,
  POWER_STRUCTURE_DESCRIPTIONS_LOW_POP,
  SOURCE_OF_POWER_DESCRIPTIONS,
  SOURCE_OF_POWER_DESCRIPTIONS_LOW_POP,
  POWER_STRUCTURE_LABELS_LOW_POP,
  SOURCE_OF_POWER_LABELS_LOW_POP,
} from '../../lib/worldData';
import { recalculateStarportFromDials } from '../../lib/economicsEngine';
import type {
  Inhabitants,
  StarSystem,
  ShipsInAreaResult,
  RawUdpProfile,
  WealthLevel,
  DevelopmentLevel,
  PowerStructure,
  PowerSource,
} from '../../types';
import { DataRow } from './tabHelpers';
import { CultureTraitList, DescriptionCard, FootnoteBlock } from './WorldTab';
import { InhabitantsShipsPanel } from './InhabitantsShipsPanel';
import { InhabitantsStarportPanel } from './InhabitantsStarportPanel';
import { InhabitantsDemographicsPanel } from './InhabitantsDemographicsPanel';
import { EconomicClassificationPanel } from './EconomicClassificationPanel';
import { useInhabitantsActions } from '../../hooks/useInhabitantsActions';

export function InhabitantsTab({ inhabitants, system, onUpdateSystem, shipsResult, setShipsResult, onOpenShipsPriceList, onGlossary, rawUdpMode, rawProfile, isEditing, onEditInhabitants, originalInhabitants }: { inhabitants: Inhabitants; system: StarSystem; onUpdateSystem?: (system: StarSystem) => void; shipsResult: ShipsInAreaResult | null; setShipsResult: (r: ShipsInAreaResult | null) => void; onOpenShipsPriceList?: () => void; onGlossary?: () => void; rawUdpMode: boolean; rawProfile: RawUdpProfile; isEditing: boolean; onEditInhabitants?: (inhabitants: Inhabitants) => void; originalInhabitants?: Inhabitants }) {
  const isPopulated = inhabitants.populated !== false;

  // FR-069c: track which fields differ from originally rolled values
  const hasOriginal = !!originalInhabitants;
  function isChanged<K extends keyof Inhabitants>(field: K): boolean {
    return hasOriginal && inhabitants[field] !== originalInhabitants[field];
  }
  const starportChanged = hasOriginal && (
    inhabitants.starport.class !== originalInhabitants.starport.class ||
    inhabitants.starport.pss !== originalInhabitants.starport.pss ||
    inhabitants.starport.annualTrade !== originalInhabitants.starport.annualTrade ||
    inhabitants.starport.weeklyBase !== originalInhabitants.starport.weeklyBase ||
    inhabitants.starport.weeklyActivity !== originalInhabitants.starport.weeklyActivity
  );
  const amberText = { color: 'var(--accent-amber, #f59e0b)' };

  function handleReset<K extends keyof Inhabitants>(field: K, needsRecalc = false) {
    if (!originalInhabitants || !onEditInhabitants) return;
    const restored = { ...inhabitants, [field]: originalInhabitants[field] } as Inhabitants;
    if (needsRecalc) {
      onEditInhabitants(recalculateStarportFromDials(restored, system.economicPreset));
    } else {
      onEditInhabitants(restored);
    }
  }

  if (!isPopulated) {
    return (
      <div className="card text-center py-12">
        <div className="text-2xl font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>—</div>
        <h3 className="text-xl font-semibold mb-2">Unpopulated World</h3>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          No permanent inhabitants. No starport, government, or cultural institutions exist on this world.
        </p>
      </div>
    );
  }

  const useLowPop = inhabitants.populated !== false && inhabitants.population < 1_000_000;
  const govDesc    = useLowPop ? POWER_STRUCTURE_DESCRIPTIONS_LOW_POP[inhabitants.powerStructure] : POWER_STRUCTURE_DESCRIPTIONS[inhabitants.powerStructure];
  const powerDesc  = useLowPop ? SOURCE_OF_POWER_DESCRIPTIONS_LOW_POP[inhabitants.sourceOfPower] : SOURCE_OF_POWER_DESCRIPTIONS[inhabitants.sourceOfPower];
  const govSign    = inhabitants.governance >= 0 ? `+${inhabitants.governance}` : `${inhabitants.governance}`;
  const govLabel   = useLowPop ? POWER_STRUCTURE_LABELS_LOW_POP[inhabitants.powerStructure] : inhabitants.powerStructure;
  const powerLabel = useLowPop ? SOURCE_OF_POWER_LABELS_LOW_POP[inhabitants.sourceOfPower] : inhabitants.sourceOfPower;



  const { handleRollWeekly, handleGenerateShips } = useInhabitantsActions(system, onUpdateSystem, setShipsResult);
  const weeklyRoll = inhabitants.starport.weeklyRoll;

  return (
    <div className="grid md:grid-cols-2 gap-6">

      {/* FRD-068: RAW UDP Details Card */}
      {rawUdpMode && (
        <div className="card space-y-4 md:col-span-2" style={{ borderColor: 'var(--accent-amber, #f59e0b)' }}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-amber-400 font-bold">CE</span>
            RAW UWP Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
              <div className="text-xl font-mono font-bold">{rawProfile.starport}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Starport</div>
            </div>
            <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
              <div className="text-xl font-mono font-bold">{rawProfile.size.toString(16).toUpperCase()}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Size</div>
              <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{rawProfile.mnemeSource.sizeKm.toLocaleString()} km</div>
            </div>
            <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
              <div className="text-xl font-mono font-bold">{rawProfile.atmosphere.toString(16).toUpperCase()}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Atmosphere</div>
              <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{rawProfile.mnemeSource.atmosphereType}</div>
            </div>
            <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
              <div className="text-xl font-mono font-bold">{rawProfile.hydrographics.toString(16).toUpperCase()}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Hydro</div>
            </div>
            <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
              <div className="text-xl font-mono font-bold">{rawProfile.population.toString(16).toUpperCase()}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Population</div>
              <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{rawProfile.mnemeSource.populationExact.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
              <div className="text-xl font-mono font-bold">{rawProfile.government.toString(16).toUpperCase()}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Government</div>
            </div>
            <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
              <div className="text-xl font-mono font-bold">{rawProfile.lawLevel.toString(16).toUpperCase()}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Law Level</div>
            </div>
            <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
              <div className="text-xl font-mono font-bold">{rawProfile.techLevel.toString(16).toUpperCase()}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Tech Level</div>
              <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Mneme TL {rawProfile.mnemeSource.techLevelMneme}</div>
            </div>
          </div>
          {rawProfile.tradeCodes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {rawProfile.tradeCodes.map(code => (
                <span key={code} className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  {code}
                </span>
              ))}
            </div>
          )}
          {rawProfile.bases.length > 0 && (
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Bases: {rawProfile.bases.join(', ')}
            </div>
          )}
        </div>
      )}

      <EconomicClassificationPanel
        inhabitants={inhabitants}
        system={system}
        isEditing={isEditing}
        onEditInhabitants={onEditInhabitants}
      />

      <InhabitantsDemographicsPanel inhabitants={inhabitants} system={system} onGlossary={onGlossary} />

      {/* FRD-069: Economics Dials (edit mode only) */}
      {isEditing && onEditInhabitants && (
        <div className="card space-y-4 md:col-span-2" style={{ borderColor: 'var(--accent-cyan, #06b6d4)' }}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-cyan-400">✎</span>
            Economics Dials
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Override rolled values. Starport and trade values recalculate automatically.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase tracking-wide text-[var(--text-secondary)]" style={isChanged('wealth') ? amberText : undefined}>
                  Wealth {isChanged('wealth') && '•'}
                </label>
                {isChanged('wealth') && (
                  <button
                    onClick={() => handleReset('wealth', true)}
                    className="text-[10px] px-1 py-0.5 rounded hover:bg-white/10 transition-colors"
                    style={amberText}
                    title="Reset to rolled value"
                  >
                    <RotateCcw size={10} className="inline mr-0.5" />Roll
                  </button>
                )}
              </div>
              <select
                value={inhabitants.wealth}
                onChange={(e) => {
                  const w = e.target.value as WealthLevel;
                  const updated = recalculateStarportFromDials({ ...inhabitants, wealth: w }, system.economicPreset);
                  onEditInhabitants(updated);
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: isChanged('wealth') ? 'var(--accent-amber, #f59e0b)' : 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {(['Average', 'Better-off', 'Prosperous', 'Affluent'] as const).map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase tracking-wide text-[var(--text-secondary)]" style={isChanged('development') ? amberText : undefined}>
                  Development {isChanged('development') && '•'}
                </label>
                {isChanged('development') && (
                  <button
                    onClick={() => handleReset('development', true)}
                    className="text-[10px] px-1 py-0.5 rounded hover:bg-white/10 transition-colors"
                    style={amberText}
                    title="Reset to rolled value"
                  >
                    <RotateCcw size={10} className="inline mr-0.5" />Roll
                  </button>
                )}
              </div>
              <select
                value={inhabitants.development}
                onChange={(e) => {
                  const d = e.target.value as DevelopmentLevel;
                  const updated = recalculateStarportFromDials({ ...inhabitants, development: d }, system.economicPreset);
                  onEditInhabitants(updated);
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: isChanged('development') ? 'var(--accent-amber, #f59e0b)' : 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {(['UnderDeveloped', 'Developing', 'Mature', 'Developed', 'Well Developed', 'Very Developed'] as const).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase tracking-wide text-[var(--text-secondary)]" style={isChanged('techLevel') ? amberText : undefined}>
                  Tech Level (MTL) {isChanged('techLevel') && '•'}
                </label>
                {isChanged('techLevel') && (
                  <button
                    onClick={() => handleReset('techLevel', true)}
                    className="text-[10px] px-1 py-0.5 rounded hover:bg-white/10 transition-colors"
                    style={amberText}
                    title="Reset to rolled value"
                  >
                    <RotateCcw size={10} className="inline mr-0.5" />Roll
                  </button>
                )}
              </div>
              <input
                type="number"
                min={0}
                max={18}
                value={inhabitants.techLevel}
                onChange={(e) => {
                  const tl = Math.max(0, Math.min(18, Number(e.target.value)));
                  const updated = recalculateStarportFromDials({ ...inhabitants, techLevel: tl }, system.economicPreset);
                  onEditInhabitants(updated);
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: isChanged('techLevel') ? 'var(--accent-amber, #f59e0b)' : 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase tracking-wide text-[var(--text-secondary)]" style={isChanged('population') ? amberText : undefined}>
                  Population {isChanged('population') && '•'}
                </label>
                {isChanged('population') && (
                  <button
                    onClick={() => handleReset('population', true)}
                    className="text-[10px] px-1 py-0.5 rounded hover:bg-white/10 transition-colors"
                    style={amberText}
                    title="Reset to rolled value"
                  >
                    <RotateCcw size={10} className="inline mr-0.5" />Roll
                  </button>
                )}
              </div>
              <input
                type="number"
                min={0}
                value={inhabitants.population}
                onChange={(e) => {
                  const pop = Math.max(0, Number(e.target.value));
                  const updated = recalculateStarportFromDials({ ...inhabitants, population: pop }, system.economicPreset);
                  onEditInhabitants(updated);
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: isChanged('population') ? 'var(--accent-amber, #f59e0b)' : 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase tracking-wide text-[var(--text-secondary)]" style={isChanged('powerStructure') ? amberText : undefined}>
                  Power Structure {isChanged('powerStructure') && '•'}
                </label>
                {isChanged('powerStructure') && (
                  <button
                    onClick={() => handleReset('powerStructure', false)}
                    className="text-[10px] px-1 py-0.5 rounded hover:bg-white/10 transition-colors"
                    style={amberText}
                    title="Reset to rolled value"
                  >
                    <RotateCcw size={10} className="inline mr-0.5" />Roll
                  </button>
                )}
              </div>
              <select
                value={inhabitants.powerStructure}
                onChange={(e) => {
                  const p = e.target.value as PowerStructure;
                  onEditInhabitants({ ...inhabitants, powerStructure: p });
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: isChanged('powerStructure') ? 'var(--accent-amber, #f59e0b)' : 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {(['Anarchy', 'Confederation', 'Federation', 'Unitary State'] as const).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase tracking-wide text-[var(--text-secondary)]" style={isChanged('sourceOfPower') ? amberText : undefined}>
                  Source of Power {isChanged('sourceOfPower') && '•'}
                </label>
                {isChanged('sourceOfPower') && (
                  <button
                    onClick={() => handleReset('sourceOfPower', false)}
                    className="text-[10px] px-1 py-0.5 rounded hover:bg-white/10 transition-colors"
                    style={amberText}
                    title="Reset to rolled value"
                  >
                    <RotateCcw size={10} className="inline mr-0.5" />Roll
                  </button>
                )}
              </div>
              <select
                value={inhabitants.sourceOfPower}
                onChange={(e) => {
                  const p = e.target.value as PowerSource;
                  onEditInhabitants({ ...inhabitants, sourceOfPower: p });
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: isChanged('sourceOfPower') ? 'var(--accent-amber, #f59e0b)' : 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {(['Aristocracy', 'Ideocracy', 'Kratocracy', 'Democracy', 'Meritocracy'] as const).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Starport auto-recalculates on dial change via recalculateStarportFromDials */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Starport and trade values update automatically when dials change.
            </span>
          </div>
        </div>
      )}

      {/* Government */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Government</h3>

        {/* Power Structure */}
        <div>
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Power Structure</div>
          <DescriptionCard
            title={govLabel}
            description={govDesc.description}
            titleStyle={isChanged('powerStructure') ? { color: 'var(--text-secondary)' } : undefined}
          />
        </div>

        {/* Source of Power */}
        <div>
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Source of Power</div>
          <DescriptionCard
            title={powerLabel}
            description={powerDesc.description}
            titleStyle={isChanged('sourceOfPower') ? { color: 'var(--text-secondary)' } : undefined}
          />
        </div>

        {/* Governance DM */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Governance DM</span>
            <span className="font-bold text-lg" style={isChanged('governance') ? { color: 'var(--text-secondary)' } : undefined}>{govSign}</span>
          </div>
          <FootnoteBlock>
            <strong>What this means:</strong> The Governance DM is a cross-table modifier derived from
            Development Level × Wealth Level. It ranges from −9 (UnderDeveloped / Average) to +14
            (Very Developed / Affluent). A high positive DM reflects a world whose wealth and
            development create stable, effective institutions. A large negative DM indicates a
            fragile or predatory state where governance is contested, corrupt, or absent. The DM
            is applied to social and political encounter rolls throughout the game.
          </FootnoteBlock>
        </div>
      </div>

      <InhabitantsStarportPanel
        inhabitants={inhabitants}
        system={system}
        starportChanged={starportChanged}
        weeklyRoll={weeklyRoll}
        onRollWeekly={handleRollWeekly}
      />

      <InhabitantsShipsPanel
        shipsResult={shipsResult}
        onGenerateShips={handleGenerateShips}
        onOpenShipsPriceList={onOpenShipsPriceList}
      />

      {/* Travel & Culture */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Travel &amp; Culture</h3>
        <div className="space-y-2">
          <DataRow
            label="Travel Zone"
            value={inhabitants.travelZone + (inhabitants.travelZoneReason ? ` — ${inhabitants.travelZoneReason}` : '')}
            isChanged={isChanged('travelZone')}
          />
        </div>
        {/* QA-066: Cultural mechanical effects */}
        {inhabitants.culturalEffectsBreakdown && inhabitants.culturalEffectsBreakdown.length > 0 && (
          <div className="p-3 rounded space-y-2" style={{ backgroundColor: 'var(--row-hover)' }}>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-cyan, #06b6d4)' }}>
              Cultural Economic Effects
            </div>
            {inhabitants.effectivePopulation !== undefined && inhabitants.effectivePopulation !== inhabitants.population && (
              <DataRow
                label="Effective Population"
                value={`${inhabitants.effectivePopulation.toLocaleString()} (from ${inhabitants.population.toLocaleString()})`}
              />
            )}
            {inhabitants.tradeMultiplier !== undefined && inhabitants.tradeMultiplier !== 1.0 && (
              <DataRow
                label="Trade Multiplier"
                value={`×${inhabitants.tradeMultiplier.toFixed(2)}`}
              />
            )}
            <div className="space-y-1">
              {inhabitants.culturalEffectsBreakdown.map((line, i) => (
                <div key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {line}</div>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Culture Traits
          </div>
          <CultureTraitList traits={inhabitants.cultureTraits} useLowPop={useLowPop} />
        </div>
      </div>
    </div>
  );
}

