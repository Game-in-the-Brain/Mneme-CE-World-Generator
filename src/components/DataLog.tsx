import { useState } from 'react';
import type { StarSystem } from '../types';
import { Search, Trash2, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
// @ts-ignore - lucide-react types

interface DataLogProps {
  systems: StarSystem[];
  onViewSystem: (system: StarSystem) => void;
  onDeleteSystem: (id: string) => void;
  onExportAll: () => void;
}

export function DataLog({ systems, onViewSystem, onDeleteSystem, onExportAll }: DataLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Data Log</h2>
          <p className="text-[#9e9e9e]">
            {systems.length} saved systems
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={onExportAll} className="btn-secondary flex items-center gap-2">
            <Download size={16} />
            Export All
          </button>
        </div>
      </div>

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
        <div className="card overflow-x-auto">
          <table className="data-table min-w-[800px]">
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
        <div className="card text-center py-12">
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
  );
}

function formatPopulation(pop: number): string {
  if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(1)}B`;
  if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
  if (pop >= 1000) return `${(pop / 1000).toFixed(1)}K`;
  return pop.toString();
}
