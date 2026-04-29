import { FolderOpen, ChevronRight } from 'lucide-react';
import type { StarSystemBatch } from '../types';
import { setActiveBatch } from '../lib/db';

interface RecentBatchesListProps {
  batches: StarSystemBatch[];
}

export function RecentBatchesList({ batches }: RecentBatchesListProps) {
  if (batches.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FolderOpen size={20} style={{ color: 'var(--accent-red)' }} />
          Recent Batches
        </h2>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {batches.length} batch{batches.length !== 1 ? 'es' : ''}
        </span>
      </div>
      <div className="space-y-2">
        {batches.slice(0, 5).map((batch) => (
          <button
            key={batch.id}
            onClick={() => {
              setActiveBatch(batch.id);
              // Dispatch a custom event so App.tsx can switch to systems view
              window.dispatchEvent(new CustomEvent('mwg:switchView', { detail: 'systems' }));
            }}
            className="w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left"
            style={{ backgroundColor: 'var(--row-hover)' }}
          >
            <div className="flex items-center gap-3">
              <FolderOpen size={18} style={{ color: 'var(--text-secondary)' }} />
              <div>
                <div className="font-medium">{batch.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {batch.systemIds.length} systems · {batch.source}
                  {batch.source === '3dmap-import' && ' · from 3D Map'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span className="text-sm">{new Date(batch.createdAt).toLocaleDateString()}</span>
              <ChevronRight size={16} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
