import { useRef, useState, useEffect, useCallback } from 'react';
import type { StarSystem, BodyAnnotations, ShipsInAreaResult, PlaceNames } from '../types';
import { generatePlaceNames, getLcOptions } from '../lib/placeNameGen';
import { loadGeneratorOptions } from '../lib/optionsStorage';
import { exportToDocx } from '../lib/exportDocx';
import { buildRawUdpProfile } from '../lib/rawUdp';
import { FileJson, FileSpreadsheet, FileText, Sun, Globe, Users, Building, Sparkles, Copy, Check, ExternalLink, Orbit } from 'lucide-react';
import { ShipsPriceList } from './ShipsPriceList';
import { OverviewTab } from './tabs/OverviewTab';
import { StarTab } from './tabs/StarTab';
import { updatePrimaryStar } from '../lib/systemEditor';
import { useSystemEditMode } from '../hooks/useSystemEditMode';
import { generateSeed, getEconomicModelLabel } from '../lib/systemViewerUtils';
import { get2DMapBaseUrl, get2DMapUrl } from '../lib/environment';
import { WorldTab } from './tabs/WorldTab';
import { InhabitantsTab } from './tabs/InhabitantsTab';
import { PlanetarySystemTab } from './tabs/PlanetarySystemTab';
import { getSystemCode } from './tabs/tabHelpers';

interface SystemViewerProps {
  system: StarSystem;
  onUpdateSystem?: (system: StarSystem) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onGlossary?: () => void;
}

type TabId = 'overview' | 'star' | 'world' | 'inhabitants' | 'system' | 'orbit';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: 'Overview',         icon: <Sparkles size={16} /> },
  { id: 'star',        label: 'Star',             icon: <Sun size={16} /> },
  { id: 'world',       label: 'World',            icon: <Globe size={16} /> },
  { id: 'inhabitants', label: 'Inhabitants',      icon: <Users size={16} /> },
  { id: 'system',      label: 'Planetary System', icon: <Building size={16} /> },
  { id: 'orbit',       label: 'Orbit',            icon: <Orbit size={16} /> },
];

// QA-010: Single-page anchor tabs — each section is always rendered;
// tab buttons scroll to the corresponding section.
export function SystemViewer({ system, onUpdateSystem, onExportJSON, onExportCSV, onGlossary }: SystemViewerProps) {
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const starRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const inhabitantsRef = useRef<HTMLDivElement | null>(null);
  const systemRef = useRef<HTMLDivElement | null>(null);
  const orbitRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const sectionRefs: Record<TabId, React.RefObject<HTMLDivElement | null>> = {
    overview: overviewRef,
    star: starRef,
    world: worldRef,
    inhabitants: inhabitantsRef,
    system: systemRef,
    orbit: orbitRef,
  };

  function scrollTo(id: TabId) {
    sectionRefs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Body annotations — persisted per system (localStorage)
  const [annotations, setAnnotations] = useState<BodyAnnotations>({});
  const [pendingAnnotations, setPendingAnnotations] = useState<BodyAnnotations>({});
  const [shipsResult, setShipsResult] = useState<ShipsInAreaResult | null>(null);
  const [showShipsPriceList, setShowShipsPriceList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rawUdpMode, setRawUdpMode] = useState(false);

  const {
    isEditing,
    originalSystem,
    pendingSystem,
    displaySystem,
    enterEditMode,
    discardEdits: baseDiscardEdits,
    saveEdits: baseSaveEdits,
    saveAsNew: baseSaveAsNew,
    setPendingSystem,
  } = useSystemEditMode(system, onUpdateSystem);

  useEffect(() => {
    const stored = localStorage.getItem(`mneme_annotations_${system.id}`);
    let merged: BodyAnnotations = stored ? JSON.parse(stored) : {};
    let needsSave = false;

    // Auto-populate from generated place names if no user edits exist
    if (system.placeNames?.bodyNames) {
      for (const [bodyId, name] of Object.entries(system.placeNames.bodyNames)) {
        if (!merged[bodyId]?.name) {
          merged[bodyId] = { name, notes: merged[bodyId]?.notes ?? '' };
          needsSave = true;
        }
      }
    }

    // QA-080 legacy migration: main world name
    const mainworldId = `${system.id}-mainworld`;
    if (!merged[mainworldId]?.name) {
      const fallbackName = system.placeNames?.bodyNames?.[mainworldId]
        ?? system.name
        ?? 'Main World';
      merged[mainworldId] = { name: fallbackName, notes: merged[mainworldId]?.notes ?? '' };
      needsSave = true;
    }

    // QA-080 legacy migration: disk names
    for (const [i, disk] of system.circumstellarDisks.entries()) {
      if (!merged[disk.id]?.name) {
        const fallbackName = system.placeNames?.bodyNames?.[disk.id]
          ?? `Disk ${i + 1}`;
        merged[disk.id] = { name: fallbackName, notes: merged[disk.id]?.notes ?? '' };
        needsSave = true;
      }
    }

    // QA-079 legacy migration: companion star names (stored in annotations for simplicity)
    for (const [i, star] of system.companionStars.entries()) {
      if (!merged[star.id]?.name) {
        const fallbackName = system.placeNames?.companionNames?.[star.id]
          ?? `Companion ${i + 1}`;
        merged[star.id] = { name: fallbackName, notes: '' };
        needsSave = true;
      }
    }

    if (needsSave) {
      localStorage.setItem(`mneme_annotations_${system.id}`, JSON.stringify(merged));
    }
    setAnnotations(merged);
  }, [system.id, system.placeNames, system.companionStars, system.circumstellarDisks, system.name]);

  // In edit mode, stage annotation changes in pendingAnnotations instead of saving immediately
  const displayAnnotations = isEditing ? pendingAnnotations : annotations;

  const handleAnnotation = useCallback(
    (id: string, field: 'name' | 'notes', value: string) => {
      if (isEditing) {
        setPendingAnnotations(prev => ({
          ...prev,
          [id]: { ...(prev[id] ?? { name: '', notes: '' }), [field]: value },
        }));
      } else {
        setAnnotations(prev => {
          const next = {
            ...prev,
            [id]: { ...(prev[id] ?? { name: '', notes: '' }), [field]: value },
          };
          localStorage.setItem(`mneme_annotations_${system.id}`, JSON.stringify(next));
          return next;
        });
      }
    },
    [system.id, isEditing],
  );

  const handleExportDocx = useCallback(async () => {
    await exportToDocx(system, annotations, shipsResult);
  }, [system, annotations, shipsResult]);

  // QA-079: edit companion star name
  const handleEditCompanionName = useCallback((starId: string, name: string) => {
    const defaultPlaceNames: PlaceNames = {
      baseLc: '', driftLc: '', driftLevel: 0, systemName: '', bodyNames: {},
    };
    if (isEditing) {
      setPendingSystem(prev => ({
        ...prev,
        placeNames: {
          ...(prev.placeNames ?? defaultPlaceNames),
          companionNames: {
            ...(prev.placeNames?.companionNames ?? {}),
            [starId]: name,
          },
        },
      }));
    } else if (onUpdateSystem) {
      onUpdateSystem({
        ...system,
        placeNames: {
          ...(system.placeNames ?? defaultPlaceNames),
          companionNames: {
            ...(system.placeNames?.companionNames ?? {}),
            [starId]: name,
          },
        },
      });
    }
  }, [isEditing, onUpdateSystem, system]);

  // Wrap save/discard to include annotation staging
  const saveEdits = useCallback(async () => {
    await baseSaveEdits();
    if (Object.keys(pendingAnnotations).length > 0) {
      localStorage.setItem(`mneme_annotations_${system.id}`, JSON.stringify(pendingAnnotations));
      setAnnotations(pendingAnnotations);
      setPendingAnnotations({});
    }
  }, [baseSaveEdits, pendingAnnotations, system.id]);

  const saveAsNew = useCallback(async () => {
    const copied = await baseSaveAsNew();
    if (copied && Object.keys(pendingAnnotations).length > 0) {
      localStorage.setItem(`mneme_annotations_${copied.id}`, JSON.stringify(pendingAnnotations));
      setAnnotations(pendingAnnotations);
      setPendingAnnotations({});
    }
  }, [baseSaveAsNew, pendingAnnotations]);

  const discardEdits = useCallback(() => {
    baseDiscardEdits();
    setPendingAnnotations({});
  }, [baseDiscardEdits]);

  const handleCopyFor2DMap = useCallback(async () => {
    const payload = {
      starSystem: system,
      starfieldSeed: generateSeed(),
      epoch: { year: 2300, month: 1, day: 1 },
    };
    const json = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = json;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [system]);

  const LC_OPTIONS = getLcOptions();
  const [baseLc, setBaseLc] = useState<string>('random');
  const [driftLc, setDriftLc] = useState<string>('random');

  const handleGenerateNames = useCallback(() => {
    const descriptorMode = loadGeneratorOptions().nameDescriptorMode;
    const names = generatePlaceNames(system, baseLc, driftLc, descriptorMode);
    const updatedSystem: StarSystem = {
      ...system,
      placeNames: names,
      name: system.name || names.systemName,
    };

    if (isEditing) {
      // In edit mode, stage changes in pendingSystem instead of saving immediately
      setPendingSystem(prev => ({
        ...prev,
        placeNames: names,
        name: prev.name || names.systemName,
      }));
      // Also stage body name annotations in pendingAnnotations
      setPendingAnnotations(prev => {
        const merged = { ...prev };
        for (const [bodyId, name] of Object.entries(names.bodyNames)) {
          if (!merged[bodyId]?.name) {
            merged[bodyId] = { name, notes: merged[bodyId]?.notes ?? '' };
          }
        }
        return merged;
      });
    } else {
      if (!onUpdateSystem) return;
      onUpdateSystem(updatedSystem);
      // Pre-fill body name annotations for any body without a user-set name
      const stored = localStorage.getItem(`mneme_annotations_${system.id}`);
      const existing: BodyAnnotations = stored ? JSON.parse(stored) : {};
      const merged = { ...existing };
      for (const [bodyId, name] of Object.entries(names.bodyNames)) {
        if (!merged[bodyId]?.name) {
          merged[bodyId] = { name, notes: merged[bodyId]?.notes ?? '' };
        }
      }
      localStorage.setItem(`mneme_annotations_${system.id}`, JSON.stringify(merged));
      setAnnotations(merged);
    }
  }, [system, baseLc, driftLc, onUpdateSystem, isEditing]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-4xl font-bold star-${system.primaryStar.class}`}>
              {system.primaryStar.class}{system.primaryStar.grade}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>Primary Star</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <input
              type="text"
              value={displaySystem.name || ''}
              onChange={(e) => {
                if (isEditing) {
                  setPendingSystem(prev => ({ ...prev, name: e.target.value }));
                } else if (onUpdateSystem) {
                  onUpdateSystem({ ...system, name: e.target.value });
                }
              }}
              placeholder={getSystemCode(displaySystem)}
              className="text-sm bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-[var(--accent-red)] outline-none px-1 py-0.5 transition-colors"
              style={{ color: 'var(--text-primary)', minWidth: '8rem' }}
            />
            <span className="text-xs text-[var(--text-secondary)]">
              {displaySystem.name ? 'System name' : `Code: ${getSystemCode(displaySystem)}`}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Generated {new Date(system.createdAt).toLocaleString()}
          </p>
          <p className="text-xs mt-1">
            <span className="px-2 py-0.5 rounded bg-white/10 text-[var(--text-secondary)]">
              Economic model: {getEconomicModelLabel(system)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && onUpdateSystem && (
            <button
              onClick={enterEditMode}
              className="btn-secondary flex items-center gap-2"
              title="Enter edit mode"
            >
              ✎ Edit
            </button>
          )}
          {isEditing && (
            <>
              <button onClick={saveEdits} className="btn-primary flex items-center gap-2">
                💾 Save
              </button>
              <button onClick={saveAsNew} className="btn-secondary flex items-center gap-2">
                💾 Save As…
              </button>
              <button onClick={discardEdits} className="btn-secondary flex items-center gap-2 text-red-400">
                ✕ Discard
              </button>
            </>
          )}
          <button
            onClick={() => setRawUdpMode(v => !v)}
            className={`btn-secondary flex items-center gap-2 ${rawUdpMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : ''}`}
            title="Toggle RAW UDP (CE UWP) display mode"
          >
            <span className="text-xs font-bold">{rawUdpMode ? 'CE' : 'Mneme'}</span>
            RAW
          </button>
          <button onClick={onExportJSON} className="btn-secondary flex items-center gap-2">
            <FileJson size={16} />
            JSON
          </button>
          <button onClick={onExportCSV} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={16} />
            CSV
          </button>
          <button onClick={handleExportDocx} className="btn-secondary flex items-center gap-2">
            <FileText size={16} />
            DOCX
          </button>
          <button
            onClick={handleCopyFor2DMap}
            className="btn-primary flex items-center gap-2"
            title="Copy system data for 2D map (paste into 2d-star-system-map)"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy for 2D Map'}
          </button>
          <a
            href={get2DMapBaseUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
            title="Open the 2D Star System Map viewer"
          >
            <ExternalLink size={16} />
            Open 2D Map
          </a>
          {system.sourceStarId && (
            <a
              href={`https://game-in-the-brain.github.io/3d-interstellar-map/?starId=${encodeURIComponent(system.sourceStarId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2"
              title="View this star in the 3D Interstellar Map"
            >
              <ExternalLink size={16} />
              View in 3D Map
            </a>
          )}
        </div>
      </div>

      {/* FRD-069: Edit mode banner */}
      {isEditing && (
        <div className="p-3 rounded border-l-4 border-amber-500 bg-amber-500/10 flex items-center justify-between">
          <span className="text-sm font-medium text-amber-400">
            ✎ Editing Mode — changes are previewed live. Click Save to commit, or Discard to rollback.
          </span>
          <span className="text-xs text-amber-400/70">
            {pendingSystem.editedAt ? `Last saved: ${new Date(pendingSystem.editedAt).toLocaleString()}` : 'Never edited'}
          </span>
        </div>
      )}

      {/* FRD-063: Place name generation */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Place names:</span>
        <select
          value={baseLc}
          onChange={(e) => setBaseLc(e.target.value)}
          className="rounded px-2 py-1 text-xs border"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          title="Base language culture"
        >
          <option value="random">Random (base)</option>
          {LC_OPTIONS.map(lc => <option key={lc.id} value={lc.id}>{lc.label}</option>)}
        </select>
        <select
          value={driftLc}
          onChange={(e) => setDriftLc(e.target.value)}
          className="rounded px-2 py-1 text-xs border"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          title="Drift language culture"
        >
          <option value="random">Random (drift)</option>
          {LC_OPTIONS.map(lc => <option key={lc.id} value={lc.id}>{lc.label}</option>)}
        </select>
        <button
          onClick={handleGenerateNames}
          disabled={!onUpdateSystem}
          className="btn-secondary text-xs px-3 py-1"
        >
          Generate Place Names
        </button>
        {system.placeNames && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-cyan, #06b6d4)20', color: 'var(--accent-cyan, #06b6d4)' }}>
            {system.placeNames.systemName} · {system.placeNames.baseLc}/{system.placeNames.driftLc}
          </span>
        )}
      </div>

      {/* Sticky tab bar — scrolls to each section (QA-010) */}
      <div className="sticky top-0 z-20 border-b pb-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollTo(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-[#9e9e9e] hover:text-white hover:bg-white/5"
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* All sections rendered inline — scrollable single page (QA-010) */}
      {/* eslint-disable-next-line react-hooks/refs */}
      <section ref={sectionRefs.overview} id="overview" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles style={{ color: 'var(--accent-red)' }} size={20} />
          Overview
        </h2>
        <OverviewTab system={displaySystem} originalSystem={originalSystem} rawUdpMode={rawUdpMode} rawProfile={displaySystem.rawUdpProfile ?? buildRawUdpProfile(displaySystem)} />
      </section>

      {/* eslint-disable-next-line react-hooks/refs */}
      <section ref={sectionRefs.star} id="star" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sun style={{ color: 'var(--accent-red)' }} size={20} />
          Star
        </h2>
        <StarTab
          system={displaySystem}
          isEditing={isEditing}
          originalSystem={originalSystem}
          onEditPrimaryStar={(stellarClass, grade) => {
            if (!originalSystem) return;
            const { system: updated, warnings } = updatePrimaryStar(displaySystem, stellarClass, grade);
            setPendingSystem(updated);
            if (warnings.length > 0) {
              console.warn('[StarEdit] Warnings:', warnings);
            }
          }}
          onEditCompanionName={handleEditCompanionName}
        />
      </section>

      {/* eslint-disable-next-line react-hooks/refs */}
      <section ref={sectionRefs.world} id="world" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Globe style={{ color: 'var(--accent-red)' }} size={20} />
          World
        </h2>
        <WorldTab world={displaySystem.mainWorld} originalWorld={originalSystem?.mainWorld} />
      </section>

      {/* eslint-disable-next-line react-hooks/refs */}
      <section ref={sectionRefs.inhabitants} id="inhabitants" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users style={{ color: 'var(--accent-red)' }} size={20} />
          Inhabitants
        </h2>
        <InhabitantsTab
          inhabitants={displaySystem.inhabitants}
          system={displaySystem}
          onUpdateSystem={onUpdateSystem}
          shipsResult={shipsResult}
          setShipsResult={setShipsResult}
          onOpenShipsPriceList={() => setShowShipsPriceList(true)}
          onGlossary={onGlossary}
          rawUdpMode={rawUdpMode}
          rawProfile={displaySystem.rawUdpProfile ?? buildRawUdpProfile(displaySystem)}
          isEditing={isEditing}
          originalInhabitants={originalSystem?.inhabitants}
          onEditInhabitants={(updatedInhabitants) => {
            setPendingSystem(prev => ({
              ...prev,
              inhabitants: updatedInhabitants,
              rawUdpProfile: undefined, // will be recomputed on demand
            }));
          }}
        />
      </section>

      {/* eslint-disable-next-line react-hooks/refs */}
      <section ref={sectionRefs.system} id="planetary-system" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Building style={{ color: 'var(--accent-red)' }} size={20} />
          Planetary System
        </h2>
        <PlanetarySystemTab
          system={displaySystem}
          annotations={displayAnnotations}
          onAnnotation={handleAnnotation}
          isEditing={isEditing}
          onEditBodies={(updatedSystem) => {
            setPendingSystem(_prev => ({
              ...updatedSystem,
              rawUdpProfile: undefined,
            }));
          }}
        />
      </section>

      {/* eslint-disable-next-line react-hooks/refs */}
      <section ref={sectionRefs.orbit} id="orbit" className="scroll-mt-20">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Orbit style={{ color: 'var(--accent-red)' }} size={20} />
          Orbital Map
        </h2>
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-color)', height: 'min(70vh, 600px)' }}>
          <iframe
            ref={iframeRef}
            src={get2DMapUrl({ embed: true, starId: system.id })}
            title="2D Star System Map"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => {
              const payload = {
                starSystem: system,
                starfieldSeed: generateSeed(),
                epoch: { year: 2300, month: 1, day: 1 },
              };
              iframeRef.current?.contentWindow?.postMessage(
                { type: 'mneme-load-system', payload },
                '*'
              );
            }}
          />
        </div>
        <div className="flex gap-2 mt-3">
          <a
            href={get2DMapUrl({ starId: system.id })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-white/10 hover:border-[var(--accent-red)]/50 transition-colors text-sm"
          >
            <ExternalLink size={14} />
            Open in Full 2D Map
          </a>
          <button
            onClick={handleCopyFor2DMap}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-white/10 hover:border-[var(--accent-red)]/50 transition-colors text-sm"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy for 2D Map'}
          </button>
        </div>
      </section>

      {onGlossary && (
        <div className="mt-8 pt-4 border-t text-center text-xs"
             style={{ borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)' }}>
          † All abbreviations and units explained in the{' '}
          <button
            onClick={onGlossary}
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent-red)' }}
          >
            Definitions &amp; Units Glossary
          </button>
        </div>
      )}

      {showShipsPriceList && (
        <ShipsPriceList
          preset={system.economicPreset}
          onClose={() => setShowShipsPriceList(false)}
        />
      )}
    </div>
  );
}


