import { useState, useEffect, useCallback, useRef } from 'react';
import type { StarSystem, StarSystemBatch } from '../types';
import {
  getAllBatches, createBatch, deleteBatch, updateBatch,
  getSystemsInBatch, setActiveBatch, getActiveBatch,
} from '../lib/db';
import { Database, Plus, Trash2, Edit3, Upload, Download, FolderOpen, Map, Orbit } from 'lucide-react';

interface SystemsViewProps {
  systems: StarSystem[];
  onViewSystem: (system: StarSystem) => void;
  onDeleteSystem: (id: string) => void;
  onImport: (file: File) => void;
  importProgress?: { current: number; total: number; message: string } | null;
}

export function SystemsView({ systems, onViewSystem, onDeleteSystem, onImport, importProgress }: SystemsViewProps) {
  const [batches, setBatches] = useState<StarSystemBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [batchSystems, setBatchSystems] = useState<StarSystem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [renamingBatchId, setRenamingBatchId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await getAllBatches();
      setBatches(all);
      const active = await getActiveBatch();
      if (active && !selectedBatchId) {
        setSelectedBatchId(active.id);
      } else if (all.length > 0 && !selectedBatchId) {
        setSelectedBatchId(all[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedBatchId]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    if (!selectedBatchId) {
      setBatchSystems([]);
      return;
    }
    getSystemsInBatch(selectedBatchId).then(setBatchSystems);
  }, [selectedBatchId, systems]);

  const handleCreateBatch = async () => {
    const name = newBatchName.trim() || 'New Batch';
    const batch = await createBatch(name);
    setNewBatchName('');
    await loadBatches();
    setSelectedBatchId(batch.id);
    setActiveBatch(batch.id);
  };

  const handleSelectBatch = (id: string) => {
    setSelectedBatchId(id);
    setActiveBatch(id);
  };

  const handleRenameBatch = async (id: string) => {
    const name = renameValue.trim();
    if (name) {
      await updateBatch(id, { name });
      await loadBatches();
    }
    setRenamingBatchId(null);
    setRenameValue('');
  };

  const handleDeleteBatch = async (id: string) => {
    const batch = batches.find(b => b.id === id);
    if (!batch) return;
    const confirmDelete = window.confirm(
      `Delete batch "${batch.name}"?\n\n` +
      `• ${batch.systemIds.length} systems will be unbatched (not deleted).\n` +
      `• Choose OK to unbatch, or Cancel to abort.`
    );
    if (confirmDelete) {
      await deleteBatch(id, false);
      if (selectedBatchId === id) {
        setSelectedBatchId(null);
        setActiveBatch(null);
      }
      await loadBatches();
    }
  };

  const handleExportBatch = () => {
    const batch = batches.find(b => b.id === selectedBatchId);
    if (!batch) return;
    const payload = {
      mnemeFormat: 'mwg-batch-v1',
      batch: {
        id: batch.id,
        name: batch.name,
        createdAt: batch.createdAt,
        source: batch.source,
        notes: batch.notes,
      },
      systems: batchSystems,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batch.name.replace(/\s+/g, '_').toLowerCase()}.mneme-batch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  const handleExportTo3DMap = () => {
    const batch = batches.find(b => b.id === selectedBatchId);
    if (!batch || batchSystems.length === 0) return;

    // Build minimal star objects compatible with 3D map .mneme-map import
    const stars = batchSystems.map((sys) => ({
      id: sys.sourceStarId || sys.id,
      name: sys.name || `${sys.primaryStar.class}${sys.primaryStar.grade} System`,
      x: sys.x ?? 0,
      y: sys.y ?? 0,
      z: sys.z ?? 0,
      spec: `${sys.primaryStar.class}${sys.primaryStar.grade}`,
      absMag: 0,
      // GeneratedStar fields (optional for rendering, required for type cast in 3D map)
      pass: 1,
      parentId: null,
      rolls: {
        classRoll: 0,
        gradeRoll: 0,
        xyRoll: [11, 11] as [number, number],
        zRoll: 11,
        distanceRoll: 0,
      },
      distanceFromParent: 0,
      hasMwgSystem: true,
    }));

    // Build mwgSystems map for enriched context in 3D map
    const mwgSystems: Record<string, Record<string, unknown>> = {};
    for (const sys of batchSystems) {
      const key = sys.sourceStarId || sys.id;
      mwgSystems[key] = sys as unknown as Record<string, unknown>;
    }

    const payload = {
      mnemeFormat: 'starmap-v1',
      name: batch.name,
      version: '1.4.0',
      exportedAt: new Date().toISOString(),
      parameters: {
        density: 'average',
        starCountDice: 1,
        distanceDice: 1,
        distanceMultiplier: 1.0,
        starCountMultiplier: 1.0,
        maxPasses: 1,
      },
      tables: {
        classTable: {} as Record<number, string>,
        gradeTable: {} as Record<number, number>,
      },
      stars,
      mwgSystems,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batch.name.replace(/\s+/g, '_').toLowerCase()}.mneme-map`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Import Progress Overlay */}
      {importProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="text-sm font-medium mb-3 text-center">{importProgress.message}</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#e53935] rounded-full transition-all duration-200"
                style={{ width: `${Math.round((importProgress.current / importProgress.total) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-[#9e9e9e] text-center">
              {importProgress.current} / {importProgress.total} ({Math.round((importProgress.current / importProgress.total) * 100)}%)
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database size={24} />
          Star Systems
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-white/10 hover:border-[#e53935]/50 transition-colors text-sm"
          >
            <Upload size={16} />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mneme-map,.mneme-batch,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImport(file);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New batch name..."
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBatch()}
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-white/10 text-sm focus:outline-none focus:border-[#e53935]/50"
            />
            <button
              onClick={handleCreateBatch}
              className="p-2 rounded-lg bg-[#e53935] text-white hover:bg-[#c62828] transition-colors"
              title="Create batch"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {batches.map(batch => {
              const isActive = batch.id === selectedBatchId;
              const isRenaming = renamingBatchId === batch.id;
              return (
                <div
                  key={batch.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#e53935]/10 border-[#e53935]/50'
                      : 'bg-[var(--bg-card)] border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => !isRenaming && handleSelectBatch(batch.id)}
                >
                  <FolderOpen size={16} className={isActive ? 'text-[#e53935]' : 'text-[#9e9e9e]'} />
                  <div className="flex-1 min-w-0">
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameBatch(batch.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameBatch(batch.id);
                          if (e.key === 'Escape') {
                            setRenamingBatchId(null);
                            setRenameValue('');
                          }
                        }}
                        className="w-full px-2 py-1 rounded bg-[var(--bg-primary)] border border-white/20 text-sm focus:outline-none focus:border-[#e53935]/50"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <div className="font-medium text-sm truncate">{batch.name}</div>
                        <div className="text-xs text-[#9e9e9e]">
                          {batch.systemIds.length} systems · {batch.source}
                        </div>
                      </>
                    )}
                  </div>
                  {!isRenaming && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingBatchId(batch.id);
                          setRenameValue(batch.name);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-[#9e9e9e]"
                        title="Rename"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBatch(batch.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-[#9e9e9e]"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {batches.length === 0 && !isLoading && (
              <div className="text-sm text-[#9e9e9e] italic p-4 text-center">
                No batches yet. Create one to get started.
              </div>
            )}
          </div>
        </div>

        {/* System List */}
        <div className="lg:col-span-2 space-y-4">
          {selectedBatch ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedBatch.name}</h2>
                  <p className="text-sm text-[#9e9e9e]">
                    {batchSystems.length} systems
                    {selectedBatch.source === '3dmap-import' && ' · Imported from 3D Map'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportTo3DMap}
                    disabled={batchSystems.length === 0}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-white/10 hover:border-[#e53935]/50 transition-colors text-sm disabled:opacity-40"
                    title="Export batch as .mneme-map for 3D Interstellar Map"
                  >
                    <Map size={16} />
                    Export to 3D Map
                  </button>
                  <button
                    onClick={handleExportBatch}
                    disabled={batchSystems.length === 0}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-white/10 hover:border-[#e53935]/50 transition-colors text-sm disabled:opacity-40"
                  >
                    <Download size={16} />
                    Export Batch
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                {batchSystems.map(sys => (
                  <div
                    key={sys.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-card)] border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onViewSystem(sys)}
                        className="text-left w-full"
                      >
                        <div className="font-medium text-sm truncate">
                          {sys.name || 'Unnamed System'}
                        </div>
                        <div className="text-xs text-[#9e9e9e]">
                          {sys.primaryStar.class}{sys.primaryStar.grade} ·
                          {' '}{sys.inhabitants.population.toLocaleString()} pop ·
                          {' '}Hab {sys.mainWorld.habitability}
                          {sys.sourceStarId && (
                            <span className="text-[#e53935] ml-1">· 3D Map: {sys.sourceStarId}</span>
                          )}
                        </div>
                      </button>
                    </div>
                    <a
                      href={`https://game-in-the-brain.github.io/2d-star-system-map/?starId=${encodeURIComponent(sys.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-white/10 text-[#9e9e9e]"
                      title="View orbit"
                      onClick={(e) => {
                        e.preventDefault();
                        // Push to localStorage for 2D map to pick up
                        const payload = {
                          starSystem: sys,
                          starfieldSeed: sys.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'SEED0000',
                          epoch: { year: 2300, month: 1, day: 1 },
                        };
                        const savedPage = {
                          starId: sys.id,
                          starName: sys.name || `${sys.primaryStar.class}${sys.primaryStar.grade}`,
                          savedAt: new Date().toISOString(),
                          payload,
                          mwgSystem: sys,
                          gmNotes: '',
                          version: '1.0',
                        };
                        localStorage.setItem(`mneme-2dmap-${sys.id}`, JSON.stringify(savedPage));
                        window.open(`https://game-in-the-brain.github.io/2d-star-system-map/?starId=${encodeURIComponent(sys.id)}`, '_blank');
                      }}
                    >
                      <Orbit size={14} />
                    </a>
                    <button
                      onClick={() => onDeleteSystem(sys.id)}
                      className="p-2 rounded-lg hover:bg-white/10 text-[#9e9e9e]"
                      title="Delete system"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {batchSystems.length === 0 && (
                  <div className="text-sm text-[#9e9e9e] italic p-8 text-center border border-dashed border-white/10 rounded-lg">
                    No systems in this batch yet.
                    <br />
                    Generate systems from the Dashboard, import a .mneme-map / .mneme-batch file, or drop a plain star list JSON.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-[#9e9e9e] italic p-8 text-center border border-dashed border-white/10 rounded-lg">
              Select a batch to view its systems.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
