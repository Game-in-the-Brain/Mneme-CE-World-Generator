import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import { addBodyToSystem, deleteBodiesFromSystem } from '../../lib/systemEditor';
import { formatNumber, formatValue } from '../../lib/format';
import { hillSphereAU } from '../../lib/physicalProperties';
import type { StarSystem, PlanetaryBody, BodyAnnotations, GasWorldClass } from '../../types';
import { PhysProp, BodyCountCard } from './tabHelpers';

export function PlanetarySystemTab({
  system, annotations, onAnnotation, isEditing, onEditBodies,
}: {
  system: StarSystem;
  annotations: BodyAnnotations;
  onAnnotation: (id: string, field: 'name' | 'notes', value: string) => void;
  isEditing?: boolean;
  onEditBodies?: (system: StarSystem) => void;
}) {
  // FR-044: count only L1 bodies (no parentId) in the type cards
  const l1Dwarfs = system.dwarfPlanets.filter(b => !b.parentId);
  const l1Terrestrials = system.terrestrialWorlds.filter(b => !b.parentId);
  const l1Ice = system.iceWorlds.filter(b => !b.parentId);
  const l1Gas = system.gasWorlds.filter(b => !b.parentId);

  const totalBodies =
    system.circumstellarDisks.length +
    l1Dwarfs.length +
    l1Terrestrials.length +
    l1Ice.length +
    l1Gas.length +
    (system.mainWorld ? 1 : 0) +
    (system.moons?.length ?? 0) +
    (system.rings?.length ?? 0);

  // QA-008: Ice Worlds label (typeLabel uses "Ice Worlds" not "Ice")
  type BodyWithExtras = PlanetaryBody & { 
    typeLabel: string; 
    isMainWorld: boolean;
    atmosphere?: string; 
    temperature?: string; 
    habitability?: number;
  };

  const mainWorldBody: BodyWithExtras = {
    id:          `${system.id}-mainworld`,
    type:        'terrestrial' as const,
    typeLabel:   system.mainWorld.type,
    isMainWorld: true,
    mass:        system.mainWorld.massEM,
    zone:        system.mainWorld.zone,
    distanceAU:  system.mainWorld.distanceAU,
    radiusKm:    system.mainWorld.radius,
    diameterKm:  system.mainWorld.radius * 2,
    surfaceGravityG: system.mainWorld.gravity,
    escapeVelocityMs: system.mainWorld.escapeVelocity * 1000,
    densityGcm3: system.mainWorld.densityGcm3,
    gasClass:    undefined,
    lesserEarthType: system.mainWorld.lesserEarthType,
    atmosphere:  system.mainWorld.atmosphere,
    temperature: system.mainWorld.temperature,
    habitability: system.mainWorld.habitability,
  };

  // FR-044: Build parent→children map from moons and rings
  const parentChildren = new Map<string, PlanetaryBody[]>();
  for (const moon of (system.moons ?? [])) {
    if (moon.parentId) {
      const arr = parentChildren.get(moon.parentId) ?? [];
      arr.push(moon);
      parentChildren.set(moon.parentId, arr);
    }
  }
  for (const ring of (system.rings ?? [])) {
    if (ring.parentId) {
      const arr = parentChildren.get(ring.parentId) ?? [];
      arr.push(ring);
      parentChildren.set(ring.parentId, arr);
    }
  }
  // Sort children by mass descending within each parent
  for (const [, arr] of parentChildren) {
    arr.sort((a, b) => b.mass - a.mass);
  }

  const allL1Bodies: BodyWithExtras[] = [
    ...system.circumstellarDisks.map(b => ({ ...b, typeLabel: 'Disk',        isMainWorld: false as const })),
    ...l1Dwarfs.map(b =>                       ({ ...b, typeLabel: 'Dwarf',       isMainWorld: false as const })),
    ...l1Terrestrials.map(b =>                ({ ...b, typeLabel: 'Terrestrial', isMainWorld: false as const })),
    ...l1Ice.map(b =>                         ({ ...b, typeLabel: 'Ice Worlds',  isMainWorld: false as const })),
    ...l1Gas.map(b =>                         ({ ...b, typeLabel: `Gas ${b.gasClass}`, isMainWorld: false as const })),
    mainWorldBody,
  ].sort((a, b) => a.distanceAU - b.distanceAU);

  // FRD-069d/e: Edit mode state for add/delete
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [hsrWarning, setHsrWarning] = useState<string | null>(null);

  function handleToggleDelete(bodyId: string) {
    setPendingDeleteIds(prev => {
      const next = new Set(prev);
      if (next.has(bodyId)) next.delete(bodyId);
      else next.add(bodyId);
      return next;
    });
  }

  function handleConfirmDeletes() {
    if (!onEditBodies || pendingDeleteIds.size === 0) return;

    // Check if mainworld is being deleted
    const mainworldId = allL1Bodies.find(b => b.isMainWorld)?.id;
    const isDeletingMainworld = mainworldId ? pendingDeleteIds.has(mainworldId) : false;

    if (isDeletingMainworld) {
      const confirmed = window.confirm(
        'This is the mainworld. Deleting it will remove all Inhabitants data. Confirm?'
      );
      if (!confirmed) return;
    }

    const result = deleteBodiesFromSystem(system, Array.from(pendingDeleteIds));
    onEditBodies(result.system);
    setPendingDeleteIds(new Set());
  }

  function handleAddBody(type: 'random' | 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas', gasClass?: string) {
    if (!onEditBodies) return;
    const gc = gasClass as GasWorldClass | undefined;
    const { system: updated, warning } = addBodyToSystem(system, type, gc);
    onEditBodies(updated);
    setShowAddDropdown(false);
    if (warning) setHsrWarning(warning);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 md:grid-cols-7 gap-4">
        <BodyCountCard label="Disks"       count={system.circumstellarDisks.length} />
        <BodyCountCard label="Dwarfs"      count={l1Dwarfs.length} sub={compositionBreakdown(l1Dwarfs)} />
        <BodyCountCard label="Terrestrial" count={l1Terrestrials.length} sub={compositionBreakdown(l1Terrestrials)} />
        <BodyCountCard label="Ice Worlds"  count={l1Ice.length} />
        <BodyCountCard label="Gas Giants"  count={l1Gas.length} />
        <BodyCountCard label="Moons"       count={system.moons?.length ?? 0} />
        <BodyCountCard label="Rings"       count={system.rings?.length ?? 0} />
      </div>

      <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
        Total Planetary Bodies + Moons: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{totalBodies}</span>
      </div>

      {/* Ejected Bodies (V2) */}
      {system.ejectedBodies && system.ejectedBodies.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>☄️</span> Rogue Worlds ({system.ejectedBodies.length})
          </h3>
          <div className="space-y-2">
            {system.ejectedBodies.map((body) => (
              <div key={body.id} className="flex items-center justify-between p-2 rounded text-sm" style={{ backgroundColor: 'var(--row-hover)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{body.type}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{body.composition ?? ''}</span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>{body.mass.toFixed(4)} M⊕</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--border-color)' }}>
                    {body.ejectionReason === 'saturation' ? 'Saturation eject' : 'Gravitational'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consumed Bodies (V2) */}
      {system.consumedBodies && system.consumedBodies.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>💥</span> Absorbed Worlds ({system.consumedBodies.length})
          </h3>
          <div className="space-y-2">
            {system.consumedBodies.map((body) => (
              <div key={body.id} className="flex items-center justify-between p-2 rounded text-sm" style={{ backgroundColor: 'var(--row-hover)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{body.type}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{body.composition ?? ''}</span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {body.mass.toFixed(4)} M⊕ — absorbed by Hot Jupiter
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">All Bodies by Distance</h3>
        <ParentBodyList
          bodies={allL1Bodies}
          parentChildren={parentChildren}
          annotations={annotations}
          onAnnotation={onAnnotation}
          starMassSolar={system.primaryStar.mass}
          isEditing={isEditing}
          pendingDeleteIds={pendingDeleteIds}
          onToggleDelete={handleToggleDelete}
        />
      </div>

      {/* FRD-069d/e: Add/Delete controls in edit mode */}
      {isEditing && onEditBodies && (
        <div className="space-y-3">
          {/* HSR Warning */}
          {hsrWarning && (
            <div className="p-3 rounded text-sm border border-amber-500/30 bg-amber-500/10 text-amber-400">
              ⚠️ {hsrWarning}
            </div>
          )}

          {/* Confirm Deletes */}
          {pendingDeleteIds.size > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirmDeletes}
                className="px-4 py-2 rounded text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Confirm Delete ({pendingDeleteIds.size})
              </button>
              <button
                onClick={() => setPendingDeleteIds(new Set())}
                className="px-3 py-2 rounded text-sm border transition-colors"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Add World */}
          <div className="relative">
            <button
              onClick={() => setShowAddDropdown(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium border transition-colors"
              style={{ borderColor: 'var(--accent-cyan, #06b6d4)', color: 'var(--accent-cyan, #06b6d4)' }}
            >
              <Plus size={16} />
              Add World
            </button>
            {showAddDropdown && (
              <div className="absolute mt-2 w-56 rounded-lg border shadow-lg z-10" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <div className="py-1">
                  <button onClick={() => handleAddBody('random')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors">🎲 Random body</button>
                  <button onClick={() => handleAddBody('terrestrial')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors">🌍 Terrestrial world</button>
                  <button onClick={() => handleAddBody('dwarf')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors">🌑 Dwarf planet</button>
                  <button onClick={() => handleAddBody('ice')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors">❄️ Ice world</button>
                  <div className="px-3 py-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Gas Giants</div>
                  <button onClick={() => handleAddBody('gas', 'I')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors pl-6">Gas I (Small)</button>
                  <button onClick={() => handleAddBody('gas', 'II')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors pl-6">Gas II (Medium)</button>
                  <button onClick={() => handleAddBody('gas', 'III')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors pl-6">Gas III (Large)</button>
                  <button onClick={() => handleAddBody('gas', 'IV')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors pl-6">Gas IV</button>
                  <button onClick={() => handleAddBody('gas', 'V')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors pl-6">Gas V (Super)</button>
                  <button onClick={() => handleAddBody('disk')} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors">💿 Circumstellar disk</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Render L1 bodies with indented L2 children. */
function ParentBodyList({
  bodies,
  parentChildren,
  annotations,
  onAnnotation,
  starMassSolar,
  isEditing,
  pendingDeleteIds,
  onToggleDelete,
}: {
  bodies: (PlanetaryBody & { typeLabel: string; isMainWorld: boolean; atmosphere?: string; temperature?: string; habitability?: number })[];
  parentChildren: Map<string, PlanetaryBody[]>;
  annotations: BodyAnnotations;
  onAnnotation: (id: string, field: 'name' | 'notes', value: string) => void;
  starMassSolar: number;
  isEditing?: boolean;
  pendingDeleteIds?: Set<string>;
  onToggleDelete?: (id: string) => void;
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

function getChildTypeLabel(child: PlanetaryBody): string {
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
function BodyRow({
  body, index, annotations, onAnnotation, isMainWorld,
  indentLevel = 0, hasChildren, isCollapsed, onToggleCollapse,
  starMassSolar,
  isEditing,
  isPendingDelete,
  onToggleDelete,
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
          {!isRing && (
            <span className="text-xs">
              {indentLevel > 0 && (body as PlanetaryBody).moonOrbitAU != null
                ? `${(body as PlanetaryBody).moonOrbitAU} AU orbit`
                : `${body.distanceAU} AU`}
            </span>
          )}
          {!isMainWorld && !isRing && <span className="text-xs">{formatValue(body.mass, 'M⊕')}</span>}
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
function compositionBreakdown(bodies: PlanetaryBody[]): string | undefined {
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
