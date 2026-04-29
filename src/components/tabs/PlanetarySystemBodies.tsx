import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Lock, Unlock, Dices, ArrowUp, ArrowDown } from 'lucide-react';
import { formatNumber, formatValue } from '../../lib/format';
import { hillSphereAU } from '../../lib/physicalProperties';
import type { PlanetaryBody, BodyAnnotations } from '../../types';
import { PhysProp } from './tabHelpers';

export function ParentBodyList({
  bodies,
  parentChildren,
  annotations,
  onAnnotation,
  starMassSolar,
  isEditing,
  pendingDeleteIds,
  onToggleDelete,
  bodyLocks,
  onToggleLock,
  onReroll,
  onReposition,
}: {
  bodies: (PlanetaryBody & { typeLabel: string; isMainWorld: boolean; atmosphere?: string; temperature?: string; habitability?: number })[];
  parentChildren: Map<string, PlanetaryBody[]>;
  annotations: BodyAnnotations;
  onAnnotation: (id: string, field: 'name' | 'notes', value: string) => void;
  starMassSolar: number;
  isEditing?: boolean;
  pendingDeleteIds?: Set<string>;
  onToggleDelete?: (id: string) => void;
  bodyLocks?: Record<string, { worldType?: boolean; zone?: boolean; mass?: boolean }>;
  onToggleLock?: (id: string, field: 'worldType' | 'zone' | 'mass') => void;
  onReroll?: (id: string) => void;
  onReposition?: (id: string, direction: 'in' | 'out') => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {bodies.map((body, index) => {
        const children = parentChildren.get(body.id) ?? [];
        const hasChildren = children.length > 0;
        const isCollapsed = collapsed.has(body.id);

        return (
          <div key={body.id}>
            <BodyRow
              body={body}
              index={index}
              annotations={annotations}
              onAnnotation={onAnnotation}
              isMainWorld={body.isMainWorld}
              hasChildren={hasChildren}
              isCollapsed={isCollapsed}
              onToggleCollapse={hasChildren ? () => toggle(body.id) : undefined}
              starMassSolar={starMassSolar}
              isEditing={isEditing}
              isPendingDelete={pendingDeleteIds?.has(body.id) ?? false}
              onToggleDelete={onToggleDelete}
              bodyLocks={bodyLocks}
              onToggleLock={onToggleLock}
              onReroll={onReroll}
              onReposition={onReposition}
            />
            {hasChildren && !isCollapsed && (
              <div className="ml-4 md:ml-6 border-l-2 pl-3 md:pl-4 space-y-1 mt-1" style={{ borderColor: 'var(--border-color)' }}>
                {children.map((child, cidx) => (
                  <BodyRow
                    key={child.id}
                    body={{ ...child, typeLabel: getChildTypeLabel(child) }}
                    index={cidx}
                    annotations={annotations}
                    onAnnotation={onAnnotation}
                    isMainWorld={false}
                    indentLevel={1}
                    starMassSolar={starMassSolar}
                    isEditing={isEditing}
                    isPendingDelete={pendingDeleteIds?.has(child.id) ?? false}
                    onToggleDelete={onToggleDelete}
                    bodyLocks={bodyLocks}
                    onToggleLock={onToggleLock}
                    onReroll={onReroll}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function getChildTypeLabel(child: PlanetaryBody): string {
  if (child.type === 'ring') {
    const rc = child.ringClass;
    if (rc === 'faint') return 'Ring (Faint)';
    if (rc === 'visible') return 'Ring (Visible)';
    if (rc === 'showpiece') return 'Ring (Showpiece)';
    if (rc === 'great') return 'Ring (Great)';
    return 'Ring';
  }
  if (child.type === 'dwarf') return 'Dwarf Moon';
  if (child.type === 'terrestrial') return 'Terrestrial Moon';
  return child.type;
}

// Individual body row — always expandable; inline Name + Notes annotation fields + physical properties (QA-009)
export function BodyRow({
  body, index, annotations, onAnnotation, isMainWorld,
  indentLevel = 0, hasChildren, isCollapsed, onToggleCollapse,
  starMassSolar,
  isEditing,
  isPendingDelete,
  onToggleDelete,
  bodyLocks,
  onToggleLock,
  onReroll,
  onReposition,
}: {
  body: PlanetaryBody & { typeLabel: string; atmosphere?: string; temperature?: string; habitability?: number };
  index: number;
  annotations: BodyAnnotations;
  onAnnotation: (id: string, field: 'name' | 'notes', value: string) => void;
  isMainWorld?: boolean;
  indentLevel?: number;
  hasChildren?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  starMassSolar: number;
  isEditing?: boolean;
  isPendingDelete?: boolean;
  onToggleDelete?: (id: string) => void;
  bodyLocks?: Record<string, { worldType?: boolean; zone?: boolean; mass?: boolean }>;
  onToggleLock?: (id: string, field: 'worldType' | 'zone' | 'mass') => void;
  onReroll?: (id: string) => void;
  onReposition?: (id: string, direction: 'in' | 'out') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasPhysics = body.radiusKm != null;
  const ann = annotations[body.id] ?? { name: '', notes: '' };
  const isRing = body.type === 'ring';

  return (
    <div className="rounded text-sm" style={{ backgroundColor: indentLevel > 0 ? 'transparent' : 'var(--row-hover)' }}>
      <div
        className="flex items-center justify-between p-2 cursor-pointer"
        style={isPendingDelete ? { textDecoration: 'line-through', opacity: 0.6, borderLeft: '3px solid var(--accent-red, #e53935)' } : undefined}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          {indentLevel > 0 && (
            <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>└─</span>
          )}
          <span className="w-5 shrink-0 text-xs" style={{ color: 'var(--text-secondary)' }}>{index + 1}</span>
          {hasChildren && onToggleCollapse && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
              className="shrink-0"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          )}
          <span className="font-medium shrink-0 text-xs">{body.typeLabel}</span>
          {isEditing && onToggleLock && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLock(body.id, 'worldType'); }}
              className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
              style={{ color: bodyLocks?.[body.id]?.worldType ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary)' }}
              title={bodyLocks?.[body.id]?.worldType ? 'World type locked' : 'World type unlocked'}
            >
              {bodyLocks?.[body.id]?.worldType ? <Lock size={10} /> : <Unlock size={10} />}
            </button>
          )}
          {body.gasClass && (
            <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'var(--border-color)' }}>
              {body.gasClass}
            </span>
          )}
          {body.lesserEarthType && (
            <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'var(--border-color)' }}>
              {body.lesserEarthType}
            </span>
          )}
          {body.wasCapturedTerrestrial && (
            <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'var(--accent-red)', color: 'white' }}>
              Captured
            </span>
          )}
          {/* Inline name input — always visible, auto-saved */}
          <input
            type="text"
            value={ann.name}
            onChange={e => onAnnotation(body.id, 'name', e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            placeholder="Name…"
            className="text-xs flex-1 min-w-0"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.1rem 0.2rem',
              outline: 'none',
              maxWidth: '11rem',
            }}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {isMainWorld && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-red)', color: 'white' }}>
              MAIN WORLD
            </span>
          )}
          {!isRing && (
            <span className={`text-xs zone-${body.zone.toLowerCase().replace(' ', '-')}`}>{body.zone}</span>
          )}
          {isEditing && onReposition && !isRing && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onReposition(body.id, 'in'); }}
                className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                title="Move inward"
              >
                <ArrowUp size={10} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReposition(body.id, 'out'); }}
                className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                title="Move outward"
              >
                <ArrowDown size={10} />
              </button>
            </>
          )}
          {isEditing && onToggleLock && !isRing && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLock(body.id, 'zone'); }}
              className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
              style={{ color: bodyLocks?.[body.id]?.zone ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary)' }}
              title={bodyLocks?.[body.id]?.zone ? 'Zone locked' : 'Zone unlocked'}
            >
              {bodyLocks?.[body.id]?.zone ? <Lock size={10} /> : <Unlock size={10} />}
            </button>
          )}
          {!isRing && (
            <span className="text-xs">
              {indentLevel > 0 && (body as PlanetaryBody).moonOrbitAU != null
                ? `${(body as PlanetaryBody).moonOrbitAU} AU orbit`
                : `${body.distanceAU} AU`}
            </span>
          )}
          {!isMainWorld && !isRing && <span className="text-xs">{formatValue(body.mass, 'M⊕')}</span>}
          {isEditing && onToggleLock && !isMainWorld && !isRing && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLock(body.id, 'mass'); }}
              className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
              style={{ color: bodyLocks?.[body.id]?.mass ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary)' }}
              title={bodyLocks?.[body.id]?.mass ? 'Mass locked' : 'Mass unlocked'}
            >
              {bodyLocks?.[body.id]?.mass ? <Lock size={10} /> : <Unlock size={10} />}
            </button>
          )}
          {/* Habitability badge — main world uses v1 habitability; v2 bodies use baselineHabitability */}
          {!isRing && (() => {
            const v2Body = body as PlanetaryBody;
            const hab = v2Body.baselineHabitability ?? body.habitability;
            if (hab === undefined) return null;
            const cls =
              hab > 5  ? 'habitability-excellent' :
              hab > 0  ? 'habitability-good' :
              hab > -5 ? 'habitability-marginal' :
              'habitability-hostile';
            return (
              <span className={`text-xs px-1.5 py-0.5 rounded ${cls}`}>
                Hab {hab >= 0 ? '+' : ''}{hab}
              </span>
            );
          })()}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isEditing && onToggleDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleDelete(body.id); }}
              className={`shrink-0 p-1 rounded transition-colors ${isPendingDelete ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-[var(--text-secondary)]'}`}
              title={isPendingDelete ? 'Undo delete' : 'Mark for deletion'}
            >
              <Trash2 size={14} />
            </button>
          )}
          {isEditing && onReroll && !isPendingDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onReroll(body.id); }}
              className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
              style={{ color: 'var(--accent-cyan, #06b6d4)' }}
              title="Re-roll unlocked fields"
            >
              <Dices size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t space-y-3 pt-3" style={{ borderColor: 'var(--border-color)' }}>
          {/* Notes annotation field */}
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
            <input
              type="text"
              value={ann.notes}
              onChange={e => onAnnotation(body.id, 'notes', e.target.value)}
              onClick={e => e.stopPropagation()}
              placeholder="e.g. Mining colony, rich in iron"
              className="w-full text-xs"
              style={{
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-primary)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* Physical properties (QA-009) + Hill Sphere */}
          {hasPhysics && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              {body.densityGcm3 != null && <PhysProp label="Density" value={`${body.densityGcm3} g/cm³`} />}
              <PhysProp label="Radius"          value={`${formatNumber(body.radiusKm!)} km`} />
              <PhysProp label="Diameter"        value={`${formatNumber(body.diameterKm!)} km`} />
              <PhysProp label="Surface Gravity" value={`${body.surfaceGravityG} G`} />
              <PhysProp label="Escape Velocity" value={`${formatNumber(body.escapeVelocityMs!)} m/s`} />
              {(() => {
                const hs = hillSphereAU(body.mass, starMassSolar, body.distanceAU, body.type);
                if (hs <= 0) return null;
                return <PhysProp label="Hill Sphere" value={`${hs.toExponential(3)} AU`} />;
              })()}
            </div>
          )}
          {/* Environment details — main world (v1) or any body with v2 atmosphere data */}
          {(isMainWorld && body.atmosphere) || (body as PlanetaryBody).atmosphereCompositionAbiotic ? (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <PhysProp
                label="Atmosphere"
                value={
                  isMainWorld && body.atmosphere
                    ? body.atmosphere
                    : ((body as PlanetaryBody).atmosphereComposition ?? (body as PlanetaryBody).atmosphereCompositionAbiotic ?? '—')
                }
              />
              <PhysProp
                label="Temperature"
                value={
                  isMainWorld && body.temperature
                    ? body.temperature
                    : ((body as PlanetaryBody).temperatureV2 ?? '—')
                }
              />
              <PhysProp
                label="Habitability"
                value={(() => {
                  const hab = isMainWorld && body.habitability !== undefined
                    ? body.habitability
                    : (body as PlanetaryBody).baselineHabitability;
                  return hab !== undefined ? `${hab >= 0 ? '+' : ''}${hab}` : '—';
                })()}
              />
            </div>
          ) : null}

          {/* V2 Fields — Composition, Biosphere, Atmosphere Composition */}
          {((body as PlanetaryBody).composition || (body as PlanetaryBody).atmosphereCompositionAbiotic || (body as PlanetaryBody).biosphereRating) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold" style={{ color: 'var(--accent-red)' }}>Composition & Biosphere</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <PhysProp label="Composition" value={(body as PlanetaryBody).composition ?? '—'} />
                <PhysProp label="Reactivity" value={`${((body as PlanetaryBody).reactivityDM ?? 0) > 0 ? '+' : ''}${(body as PlanetaryBody).reactivityDM ?? 0}`} />
                <PhysProp label="Abiotic Atmosphere" value={(body as PlanetaryBody).atmosphereCompositionAbiotic ?? '—'} />
                <PhysProp label="Atmosphere (post-bio)" value={(body as PlanetaryBody).atmosphereComposition ?? '—'} />
                <PhysProp label="Atmosphere Density" value={(body as PlanetaryBody).atmosphereDensityV2 ?? '—'} />
                <PhysProp label="Biochem" value={(body as PlanetaryBody).biochem ?? '—'} />
                <PhysProp label="Biosphere" value={(body as PlanetaryBody).biosphereRating ?? '—'} />
                <PhysProp label="Baseline Hab" value={(body as PlanetaryBody).baselineHabitability !== undefined ? `${(body as PlanetaryBody).baselineHabitability! >= 0 ? '+' : ''}${(body as PlanetaryBody).baselineHabitability}` : '—'} />
              </div>
              {(body as PlanetaryBody).wasEjected && (
                <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                  ⚠️ Ejected — {((body as PlanetaryBody).ejectionReason === 'saturation' ? 'System saturation' : 'Gravitational ejection')}
                </div>
              )}
              {(body as PlanetaryBody).wasShepherded && (
                <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                  🔄 Shepherded inward by Hot Jupiter migration
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Build a comma-separated composition breakdown string for a body array. */
export function compositionBreakdown(bodies: PlanetaryBody[]): string | undefined {
  const comps = bodies
    .map((b) => b.composition)
    .filter((c): c is string => !!c);
  if (comps.length === 0) return undefined;
  const counts: Record<string, number> = {};
  for (const c of comps) {
    counts[c] = (counts[c] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, n]) => `${n} ${name.split(' ')[0]}`)
    .join(', ');
}
