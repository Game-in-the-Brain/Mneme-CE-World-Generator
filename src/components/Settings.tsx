import { useRef, useState, useEffect } from 'react';
import type { StarSystem } from '../types';
import { Upload, Download, Trash2, FileJson, Info, Search, Eye, ChevronLeft, ChevronRight, Database, Bug } from 'lucide-react';
import { APP_VERSION, APP_COMMIT, APP_DATE } from '../lib/version';
// @ts-ignore - lucide-react types

interface SettingsProps {
  systems: StarSystem[];
  onViewSystem: (system: StarSystem) => void;
  onDeleteSystem: (id: string) => void;
  onImport: (file: File) => void;
  onExportAll: () => void;
  onClearAll: () => void;
  systemCount: number;
}

export function Settings({ systems, onViewSystem, onDeleteSystem, onImport, onExportAll, onClearAll, systemCount }: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  
  // Database view state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debug mode toggle (QA-014)
  const [debugMode, setDebugMode] = useState(() => {
    const stored = localStorage.getItem('mneme_debug_mode');
    return stored !== null ? stored === 'true' : true; // Default ON
  });

  useEffect(() => {
    localStorage.setItem('mneme_debug_mode', debugMode.toString());
  }, [debugMode]);

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

  // Filter systems based on search
  const filteredSystems = systems.filter(system => {
    const searchLower = searchTerm.toLowerCase();
    return (
      system.primaryStar.class.toLowerCase().includes(searchLower) ||
      system.mainWorld.type.toLowerCase().includes(searchLower) ||
      system.inhabitants.travelZone.toLowerCase().includes(searchLower) ||
      system.mainWorld.hazard.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredSystems.length / itemsPerPage);
  const paginatedSystems = filteredSystems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Database Section */}
      <div className="card space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Database className="text-[#e53935]" size={20} />
          Database — {systemCount} Saved Systems
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" size={20} />
          <input
            type="text"
            placeholder="Search by star class, world type, zone, hazard..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-[#141419] border border-white/10 rounded-lg"
          />
        </div>

        {/* Table */}
        {paginatedSystems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[800px] w-full">
              <thead>
                <tr>
                  <th>Star</th>
                  <th>World</th>
                  <th>Habitability</th>
                  <th>TL</th>
                  <th>Population</th>
                  <th>Starport</th>
                  <th>Zone</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSystems.map((system) => (
                  <tr key={system.id} className="hover:bg-white/5">
                    <td>
                      <span className={`font-bold star-${system.primaryStar.class}`}>
                        {system.primaryStar.class}{system.primaryStar.grade}
                      </span>
                    </td>
                    <td>{system.mainWorld.type}</td>
                    <td>
                      <span className={
                        system.mainWorld.habitability > 5 ? 'habitability-excellent' :
                        system.mainWorld.habitability > 0 ? 'habitability-good' :
                        system.mainWorld.habitability > -5 ? 'habitability-marginal' :
                        'habitability-hostile'
                      }>
                        {system.mainWorld.habitability}
                      </span>
                    </td>
                    <td>{system.inhabitants.techLevel}</td>
                    <td>{formatPopulation(system.inhabitants.population)}</td>
                    <td>{system.inhabitants.starport.class}</td>
                    <td>
                      <span className={
                        system.inhabitants.travelZone === 'Green' ? 'habitability-excellent' :
                        system.inhabitants.travelZone === 'Amber' ? 'habitability-marginal' :
                        'habitability-hostile'
                      }>
                        {system.inhabitants.travelZone}
                      </span>
                    </td>
                    <td className="text-[#9e9e9e]">
                      {new Date(system.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onViewSystem(system)}
                          className="p-2 hover:bg-white/10 rounded"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteSystem(system.id)}
                          className="p-2 hover:bg-[#e53935]/20 text-[#e53935] rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-white/5 rounded-lg">
            <p className="text-[#9e9e9e]">
              {searchTerm ? 'No systems match your search.' : 'No saved systems yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-white/10 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[#9e9e9e]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-white/10 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Data Management */}
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

      {/* Debug Mode Toggle (QA-014) */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bug className="text-[#e53935]" size={20} />
          Debug Mode
        </h3>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Debug Batch Export</h4>
              <p className="text-sm text-[#9e9e9e]">
                Show statistical analysis tools on the Generator page
              </p>
              <p className="text-xs text-[#9e9e9e] mt-1">
                Note: Switch off to hide debug tools in production
              </p>
            </div>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                debugMode
                  ? 'bg-[#e53935] text-white'
                  : 'bg-white/10 text-[#9e9e9e] hover:bg-white/20'
              }`}
            >
              {debugMode ? 'ON' : 'OFF'}
            </button>
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
            <p>Version: {APP_VERSION} ({APP_DATE}) — {APP_COMMIT}</p>
            <p>Data stored locally in your browser</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPopulation(pop: number): string {
  if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(1)}B`;
  if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
  if (pop >= 1000) return `${(pop / 1000).toFixed(1)}K`;
  return pop.toString();
}
