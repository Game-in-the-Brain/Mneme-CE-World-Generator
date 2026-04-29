import { useState } from 'react';
import { Plus } from 'lucide-react';
import { addBodyToSystem, deleteBodiesFromSystem, rerollBody, repositionBody } from '../../lib/systemEditor';

import type { StarSystem, PlanetaryBody, BodyAnnotations, GasWorldClass } from '../../types';
import { BodyCountCard } from './tabHelpers';
import { ParentBodyList, compositionBreakdown } from './PlanetarySystemBodies';

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

  // FRD-069b: per-body dice locks
  const [bodyLocks, setBodyLocks] = useState<Record<string, { worldType?: boolean; zone?: boolean; mass?: boolean }>>({});

  function getLock(bodyId: string, field: 'worldType' | 'zone' | 'mass'): boolean {
    return bodyLocks[bodyId]?.[field] ?? false;
  }

  function toggleLock(bodyId: string, field: 'worldType' | 'zone' | 'mass') {
    setBodyLocks(prev => ({
      ...prev,
      [bodyId]: {
        ...prev[bodyId],
        [field]: !getLock(bodyId, field),
      },
    }));
  }

  function handleReroll(bodyId: string) {
    if (!onEditBodies) return;
    const locks = bodyLocks[bodyId] ?? {};
    const updated = rerollBody(system, bodyId, locks);
    onEditBodies(updated);
  }

  function handleReposition(bodyId: string, direction: 'in' | 'out') {
    if (!onEditBodies) return;
    const { system: updated, warning, error } = repositionBody(system, bodyId, direction);
    onEditBodies(updated);
    if (error) setHsrWarning(error);
    else if (warning) setHsrWarning(warning);
    else setHsrWarning(null);
  }

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
          bodyLocks={bodyLocks}
          onToggleLock={toggleLock}
          onReroll={handleReroll}
          onReposition={handleReposition}
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
