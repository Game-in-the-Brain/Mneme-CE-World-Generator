import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { formatCredits, formatAnnualTrade, formatPopulation } from '../lib/format';
import { displayTL, displayTLDescriptor } from '../lib/economicPresets';
import { generateShipsInTheArea } from '../lib/shipsInArea';
import {
  CULTURE_TRAIT_DESCRIPTIONS,
  CULTURE_TRAIT_DESCRIPTIONS_LOW_POP,
  WEALTH_DESCRIPTIONS,
  WEALTH_DESCRIPTIONS_LOW_POP,
  POWER_STRUCTURE_DESCRIPTIONS,
  POWER_STRUCTURE_DESCRIPTIONS_LOW_POP,
  SOURCE_OF_POWER_DESCRIPTIONS,
  SOURCE_OF_POWER_DESCRIPTIONS_LOW_POP,
  TL_TABLE,
} from '../lib/worldData';
import { recalculateStarportFromDials } from '../lib/economicsEngine';
import type {
  Inhabitants,
  StarSystem,
  ShipsInAreaResult,
  RawUdpProfile,
  ShipInArea,
  WealthLevel,
  DevelopmentLevel,
  PowerStructure,
  PowerSource,
} from '../types';
import { DataRow, PhysProp, HabitabilityBox, BodyCountCard, formatCompactNumber, getSystemCode } from './tabHelpers';
import { CultureTraitList, TechLevelCard, DescriptionCard, FootnoteBlock } from './WorldTab';

export function InhabitantsTab({ inhabitants, system, onUpdateSystem, shipsResult, setShipsResult, onOpenShipsPriceList, onGlossary, rawUdpMode, rawProfile, isEditing, onEditInhabitants }: { inhabitants: Inhabitants; system: StarSystem; onUpdateSystem?: (system: StarSystem) => void; shipsResult: ShipsInAreaResult | null; setShipsResult: (r: ShipsInAreaResult | null) => void; onOpenShipsPriceList?: () => void; onGlossary?: () => void; rawUdpMode: boolean; rawProfile: RawUdpProfile; isEditing: boolean; onEditInhabitants?: (inhabitants: Inhabitants) => void }) {
  const isPopulated = inhabitants.populated !== false;

  const [hideEconomicFraming, setHideEconomicFraming] = useState(
    () => localStorage.getItem('mneme_hide_economic_framing') === 'true'
  );
  function toggleEconomicFraming() {
    const next = !hideEconomicFraming;
    setHideEconomicFraming(next);
    localStorage.setItem('mneme_hide_economic_framing', String(next));
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
  const wealthDesc = useLowPop ? WEALTH_DESCRIPTIONS_LOW_POP[inhabitants.wealth] : WEALTH_DESCRIPTIONS[inhabitants.wealth];
  const govDesc    = useLowPop ? POWER_STRUCTURE_DESCRIPTIONS_LOW_POP[inhabitants.powerStructure] : POWER_STRUCTURE_DESCRIPTIONS[inhabitants.powerStructure];
  const devDesc    = useLowPop ? DEVELOPMENT_DESCRIPTIONS_LOW_POP[inhabitants.development] : DEVELOPMENT_DESCRIPTIONS[inhabitants.development];
  const powerDesc  = useLowPop ? SOURCE_OF_POWER_DESCRIPTIONS_LOW_POP[inhabitants.sourceOfPower] : SOURCE_OF_POWER_DESCRIPTIONS[inhabitants.sourceOfPower];
  const govSign    = inhabitants.governance >= 0 ? `+${inhabitants.governance}` : `${inhabitants.governance}`;
  const govLabel   = useLowPop ? POWER_STRUCTURE_LABELS_LOW_POP[inhabitants.powerStructure] : inhabitants.powerStructure;
  const powerLabel = useLowPop ? SOURCE_OF_POWER_LABELS_LOW_POP[inhabitants.sourceOfPower] : inhabitants.sourceOfPower;

  function handleRollWeekly() {
    if (!onUpdateSystem) return;
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + d3;
    const weeklyActivity = inhabitants.starport.weeklyBase * total;
    const updated: StarSystem = {
      ...system,
      inhabitants: {
        ...system.inhabitants,
        starport: {
          ...system.inhabitants.starport,
          weeklyRoll: total,
          weeklyActivity,
        },
      },
    };
    onUpdateSystem(updated);
  }

  function handleGenerateShips() {
    // QA-058: X-class hard gate unless explicitly allowed
    if (inhabitants.starport.class === 'X' && !system.allowShipsAtXPort) {
      setShipsResult({
        budget: 0,
        distributionRoll: 0,
        smallCraftBudget: 0,
        civilianBudget: 0,
        warshipBudget: 0,
        ships: [],
      });
      return;
    }
    // QA-024: pass total body count so "In System" ships get a position index 1–N
    const totalBodies =
      (system.circumstellarDisks?.length ?? 0) +
      (system.dwarfPlanets?.length ?? 0) +
      (system.terrestrialWorlds?.length ?? 0) +
      (system.iceWorlds?.length ?? 0) +
      (system.gasWorlds?.length ?? 0) +
      (system.mainWorld ? 1 : 0); // QA-036: main world is independent, must be counted
    const result = generateShipsInTheArea(inhabitants.starport.weeklyActivity, totalBodies, inhabitants.techLevel, system.economicPreset);
    setShipsResult(result);
  }

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

      {/* Demographics */}
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
              <label className="block text-[10px] uppercase tracking-wide mb-1 text-[var(--text-secondary)]">
                Wealth
              </label>
              <select
                value={inhabitants.wealth}
                onChange={(e) => {
                  const w = e.target.value as WealthLevel;
                  const updated = recalculateStarportFromDials({ ...inhabitants, wealth: w }, system.economicPreset);
                  onEditInhabitants(updated);
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {(['Average', 'Better-off', 'Prosperous', 'Affluent'] as const).map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide mb-1 text-[var(--text-secondary)]">
                Development
              </label>
              <select
                value={inhabitants.development}
                onChange={(e) => {
                  const d = e.target.value as DevelopmentLevel;
                  const updated = recalculateStarportFromDials({ ...inhabitants, development: d }, system.economicPreset);
                  onEditInhabitants(updated);
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {(['UnderDeveloped', 'Developing', 'Mature', 'Developed', 'Well Developed', 'Very Developed'] as const).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide mb-1 text-[var(--text-secondary)]">
                Tech Level (MTL)
              </label>
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
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide mb-1 text-[var(--text-secondary)]">
                Population
              </label>
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
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide mb-1 text-[var(--text-secondary)]">
                Power Structure
              </label>
              <select
                value={inhabitants.powerStructure}
                onChange={(e) => {
                  const p = e.target.value as PowerStructure;
                  onEditInhabitants({ ...inhabitants, powerStructure: p });
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {(['Anarchy', 'Confederation', 'Federation', 'Unitary State'] as const).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide mb-1 text-[var(--text-secondary)]">
                Source of Power
              </label>
              <select
                value={inhabitants.sourceOfPower}
                onChange={(e) => {
                  const p = e.target.value as PowerSource;
                  onEditInhabitants({ ...inhabitants, sourceOfPower: p });
                }}
                className="w-full rounded px-2 py-2 text-sm border"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
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
          />
        </div>

        {/* Source of Power */}
        <div>
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Source of Power</div>
          <DescriptionCard
            title={powerLabel}
            description={powerDesc.description}
/>
        </div>

        {/* Governance DM */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Governance DM</span>
            <span className="font-bold text-lg">{govSign}</span>
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

      {/* Starport */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Starport</h3>
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
            onClick={handleRollWeekly}
            disabled={!onUpdateSystem}
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

      {/* Ships in the Area (FR-030) */}
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
          onClick={handleGenerateShips}
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
              {/* QA-024: "In System" ships shown per body position */}
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

      {/* Travel & Culture */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Travel &amp; Culture</h3>
        <div className="space-y-2">
          <DataRow
            label="Travel Zone"
            value={inhabitants.travelZone + (inhabitants.travelZoneReason ? ` — ${inhabitants.travelZoneReason}` : '')}
          />
        </div>
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

function getWealthDevelopmentContext(wealth: WealthLevel, development: DevelopmentLevel): string | null {
  const wealthRanks: Record<WealthLevel, number> = {
    'Average': 0, 'Better-off': 1, 'Prosperous': 2, 'Affluent': 3,
  };
  const devRanks: Record<DevelopmentLevel, number> = {
    'UnderDeveloped': 0, 'Developing': 1, 'Mature': 2, 'Developed': 3, 'Well Developed': 4, 'Very Developed': 5,
  };
  const w = wealthRanks[wealth];
  const d = devRanks[development];
  const gap = d - w;

  if (gap >= 2) {
    return 'This world has the infrastructure and education of a much richer society, but the returns are captured elsewhere. High-output resource extraction, corporate enclaves, or off-world tithes keep local wealth low despite advanced capabilities.';
  }
  if (gap <= -2) {
    return 'Prosperity without institutional depth. Money flows in from resource extraction, foreign investment, or remittances, but local governance and infrastructure lag behind. The economy is rich but brittle.';
  }
  return null;
}
