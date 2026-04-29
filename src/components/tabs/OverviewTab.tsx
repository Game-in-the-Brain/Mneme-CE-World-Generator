import { Sun, Globe, Users, Anchor } from 'lucide-react';
import { formatNumber, formatLuminosity, formatPopulation, formatCredits } from '../lib/format';
import { displayTL, getGrowthModel } from '../lib/economicPresets';
import { POWER_STRUCTURE_LABELS_LOW_POP, SOURCE_OF_POWER_LABELS_LOW_POP } from '../lib/worldData';
import type { StarSystem, RawUdpProfile } from '../types';
import { DataRow, ZoneBox } from './tabHelpers';

export function OverviewTab({ system, rawUdpMode, rawProfile }: { system: StarSystem; rawUdpMode: boolean; rawProfile: RawUdpProfile }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* FRD-068: RAW UDP UWP Card */}
      {rawUdpMode && (
        <div className="card space-y-4 md:col-span-2" style={{ borderColor: 'var(--accent-amber, #f59e0b)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-amber-400 font-bold">CE</span>
              RAW UWP
            </h3>
            <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {rawProfile.tradeCodes.join(' ') || '—'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-mono font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
              {rawProfile.uwp}
            </div>
            <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <div>Starport {rawProfile.starport} | Size {rawProfile.size.toString(16).toUpperCase()} | Atmo {rawProfile.atmosphere.toString(16).toUpperCase()} | Hydro {rawProfile.hydrographics.toString(16).toUpperCase()}</div>
              <div>Pop {rawProfile.population.toString(16).toUpperCase()} | Gov {rawProfile.government.toString(16).toUpperCase()} | Law {rawProfile.lawLevel.toString(16).toUpperCase()} | TL {rawProfile.techLevel.toString(16).toUpperCase()}</div>
            </div>
          </div>
          {rawProfile.bases.length > 0 && (
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Bases: {rawProfile.bases.join(', ')}
            </div>
          )}
        </div>
      )}

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sun style={{ color: 'var(--accent-red)' }} size={20} />
          Star System
        </h3>
        <div className="space-y-2">
          <DataRow label="Primary Star"  value={`${system.primaryStar.class}${system.primaryStar.grade}`} />
          <DataRow label="Mass"          value={`${formatNumber(system.primaryStar.mass)} M☉`} />
          <DataRow label="Luminosity"    value={`${formatLuminosity(system.primaryStar.luminosity)} L☉`} />
          <DataRow label="Companions"    value={system.companionStars.length.toString()} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe style={{ color: 'var(--accent-red)' }} size={20} />
          Main World
        </h3>
        <div className="space-y-2">
          <DataRow label="Type"         value={system.mainWorld.type} />
          <DataRow label="Size"         value={`${formatNumber(system.mainWorld.size)} km`} />
          <DataRow label="Gravity"      value={`${system.mainWorld.gravity} G`} />
          <DataRow label="Habitability" value={system.mainWorld.habitability.toString()} className={
            system.mainWorld.habitability > 5  ? 'habitability-excellent' :
            system.mainWorld.habitability > 0  ? 'habitability-good' :
            system.mainWorld.habitability > -5 ? 'habitability-marginal' :
            'habitability-hostile'
          } />
          <DataRow
            label="Economic Assumptions"
            value={
              <span className="flex items-center gap-2">
                {system.economicPresetLabel ?? 'Mneme'}
                <span
                  className="text-xs px-1.5 py-0.5 rounded border"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                  title={
                    getGrowthModel(system.economicPreset) === 'compounding'
                      ? 'Compounding — productivity grows with TL'
                      : 'Stable — flat income across all TLs'
                  }
                >
                  {getGrowthModel(system.economicPreset) === 'compounding' ? 'Compounding' : 'Stable'}
                </span>
              </span>
            }
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users style={{ color: 'var(--accent-red)' }} size={20} />
          Inhabitants
        </h3>
        <div className="space-y-2">
          <DataRow
            label="Tech Level"
            value={
              system.inhabitants.effectiveTL !== undefined && system.inhabitants.effectiveTL !== system.inhabitants.techLevel
                ? `${displayTL(system.inhabitants.effectiveTL, system.economicPresetLabel)} (founded at ${displayTL(system.inhabitants.foundingTL ?? system.inhabitants.techLevel, system.economicPresetLabel)})`
                : `${displayTL(system.inhabitants.techLevel, system.economicPresetLabel)}`
            }
          />
          <DataRow label="Population"  value={formatPopulation(system.inhabitants.population)} />
          <DataRow label="Material Wealth" value={system.inhabitants.wealth} />
          <DataRow label="Government"  value={(() => {
            const useLowPop = system.inhabitants.populated !== false && system.inhabitants.population < 1_000_000;
            const govLabel = useLowPop ? POWER_STRUCTURE_LABELS_LOW_POP[system.inhabitants.powerStructure] : system.inhabitants.powerStructure;
            const powerLabel = useLowPop ? SOURCE_OF_POWER_LABELS_LOW_POP[system.inhabitants.sourceOfPower] : system.inhabitants.sourceOfPower;
            return `${govLabel} (${powerLabel})`;
          })()} />
          {rawUdpMode && rawProfile.tradeCodes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {rawProfile.tradeCodes.map(code => (
                <span key={code} className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {code}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Anchor style={{ color: 'var(--accent-red)' }} size={20} />
          Primary Starport & Travel
        </h3>
        <div className="space-y-2">
          <DataRow
            label="Primary Starport"
            value={
              system.inhabitants.starport.foundingClass && system.inhabitants.starport.foundingClass !== system.inhabitants.starport.class
                ? `Class ${system.inhabitants.starport.class} (founded Class ${system.inhabitants.starport.foundingClass})`
                : `Class ${system.inhabitants.starport.class}`
            }
          />
          <DataRow label="Port Activity" value={formatCredits(system.inhabitants.starport.weeklyActivity)} />
          <DataRow label="Bases"       value={[
            system.inhabitants.starport.hasNavalBase  && 'Naval',
            system.inhabitants.starport.hasScoutBase  && 'Scout',
            system.inhabitants.starport.hasPirateBase && 'Pirate',
          ].filter(Boolean).join(', ') || 'None'} />
          <DataRow label="Travel Zone" value={system.inhabitants.travelZone} className={
            system.inhabitants.travelZone === 'Green' ? 'habitability-excellent' :
            system.inhabitants.travelZone === 'Amber' ? 'habitability-marginal' :
            'habitability-hostile'
          } />

          {/* Port Network note (QA-055) */}
          {(() => {
            const cls = system.inhabitants.starport.class;
            if (cls === 'X') {
              return (
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  No prepared interstellar facilities. Informal landing only.
                </p>
              );
            }
            if (cls === 'E') {
              return (
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Minimal prepared infrastructure. No repair or fuel services beyond unrefined.
                  Regional fuel depots and basic orbital points may exist at lower tiers.
                </p>
              );
            }
            const secondaryMap: Record<string, string> = {
              D: 'Regional pads, orbital stations, and fuel depots exist at lower service tiers.',
              C: 'Multiple D-class regional ports and orbital facilities support the primary port.',
              B: 'Full port network with multiple C/D regional facilities and orbital yards.',
              A: 'Extensive port network: multiple B/C hubs, orbital shipyards, and cargo terminals.',
            };
            return (
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Secondary facilities (regional ports, orbital depots, landing pads) exist
                across the world at lower service tiers. This class reflects the primary
                interstellar facility only. {secondaryMap[cls] ?? ''}
              </p>
            );
          })()}
        </div>
      </div>

      <div className="card md:col-span-2">
        <h3 className="text-lg font-semibold mb-3">Zone Boundaries (AU)</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-sm">
          <ZoneBox label="Infernal" range={`0–${system.zones.infernal.max.toFixed(2)}`}            color="zone-infernal" />
          <ZoneBox label="Hot"      range={`${system.zones.hot.min.toFixed(2)}–${system.zones.hot.max.toFixed(2)}`} color="zone-hot" />
          <ZoneBox label="Habitable" range={`${system.zones.conservative.min.toFixed(2)}–${system.zones.conservative.max.toFixed(2)}`} color="zone-conservative" />
          <ZoneBox label="Cold"     range={`${system.zones.cold.min.toFixed(2)}–${system.zones.cold.max.toFixed(2)}`} color="zone-cold" />
          <ZoneBox label="Outer"    range={`≥${system.zones.outer.min.toFixed(2)}`}               color="zone-outer" />
        </div>
        <div className="mt-3 p-2 rounded text-center" style={{ backgroundColor: 'var(--row-hover)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Main World Position: </span>
          <span className={`font-semibold zone-${system.mainWorld.zone.toLowerCase().replace(' ', '-')}`}>
            {system.mainWorld.zone} Zone at {system.mainWorld.distanceAU} AU
          </span>
        </div>
      </div>
    </div>
  );
}
