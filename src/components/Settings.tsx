import { useRef, useState } from 'react';
import { Upload, Download, Trash2, FileJson, Info } from 'lucide-react';
// @ts-ignore - lucide-react types

interface SettingsProps {
  onImport: (file: File) => void;
  onExportAll: () => void;
  onClearAll: () => void;
  systemCount: number;
}

export function Settings({ onImport, onExportAll, onClearAll, systemCount }: SettingsProps) {
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
    } catch (error) {
      setImportStatus('Import failed. Please check the file format.');
    }

    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Data Management */}
      <div className="card space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileJson className="text-[#e53935]" size={20} />
          Data Management
        </h3>

        <div className="grid gap-4">
          {/* Import */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">Import Systems</h4>
                <p className="text-sm text-[#9e9e9e]">
                  Import previously exported systems from JSON
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary flex items-center gap-2"
              >
                <Upload size={16} />
                Import
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
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
                <p className="text-sm text-[#9e9e9e]">
                  Download all {systemCount} saved systems as JSON
                </p>
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
                <p className="text-sm text-[#9e9e9e]">
                  Permanently delete all {systemCount} saved systems
                </p>
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

      {/* About */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Info className="text-[#e53935]" size={20} />
          About
        </h3>
        <div className="space-y-2 text-sm text-[#9e9e9e]">
          <p>
            <strong className="text-white">MNEME World Generator</strong> is a Progressive Web App 
            for generating star systems, worlds, and inhabitants for the Cepheus Engine RPG.
          </p>
          <p>
            Based on the Mneme variant rules, this generator creates scientifically-grounded 
            star systems with procedural generation using dice-based mechanics.
          </p>
          <div className="pt-2 border-t border-white/10">
            <p>Version: 1.2.0</p>
            <p>Data stored locally in your browser</p>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Storage Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-white/5 rounded">
            <div className="text-[#9e9e9e]">Saved Systems</div>
            <div className="text-2xl font-bold text-[#e53935]">{systemCount}</div>
          </div>
          <div className="p-3 bg-white/5 rounded">
            <div className="text-[#9e9e9e]">Storage Type</div>
            <div className="text-lg font-medium">IndexedDB (Local)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
