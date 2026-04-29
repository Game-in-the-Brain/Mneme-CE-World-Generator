import { useRef, useState } from 'react';
import { Upload, Download, Trash2, FileJson } from 'lucide-react';

interface DataManagementSectionProps {
  onImport: (file: File) => Promise<void>;
  onExportAll: () => void;
  onClearAll: () => void;
  systemCount: number;
}

export function DataManagementSection({ onImport, onExportAll, onClearAll, systemCount }: DataManagementSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setImportStatus('Please select a JSON file');
      return;
    }

    try {
      await onImport(file);
      setImportStatus('Import successful!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (_error) {
      setImportStatus('Import failed. Please check the file format.');
    }

    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <div className="card space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileJson className="text-[#e53935]" size={20} />
        Import / Export
      </h3>

      <div className="grid gap-4">
        {/* Import */}
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium">Import Systems</h4>
              <p className="text-sm text-[#9e9e9e]">Import previously exported systems from JSON</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload size={16} />
              Import
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          {importStatus && (
            <p className={`text-sm mt-2 ${importStatus.includes('failed') ? 'text-[#e53935]' : 'text-green-500'}`}>
              {importStatus}
            </p>
          )}
        </div>

        {/* Export */}
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Export All Systems</h4>
              <p className="text-sm text-[#9e9e9e]">Download all {systemCount} saved systems as JSON</p>
            </div>
            <button
              onClick={onExportAll}
              disabled={systemCount === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Clear All */}
        <div className="p-4 bg-white/5 rounded-lg border border-[#e53935]/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#e53935]">Clear All Data</h4>
              <p className="text-sm text-[#9e9e9e]">Permanently delete all {systemCount} saved systems</p>
            </div>
            <button
              onClick={onClearAll}
              disabled={systemCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e53935]/20 text-[#e53935] hover:bg-[#e53935]/30 disabled:opacity-50 transition-colors"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
