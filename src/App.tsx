import { useState, useEffect, useCallback } from 'react';
import type { StarSystem, ViewMode } from './types';
import { generateStarSystem } from './lib/generator';
import { 
  saveSystem, getAllSystems, deleteSystem, clearAllSystems,
  exportToJSON, exportAllToJSON, exportToCSV, downloadFile, importSystemsFromJSON
} from './lib/db';
import { GeneratorDashboard } from './components/GeneratorDashboard';
import { SystemViewer } from './components/SystemViewer';
import { DataLog } from './components/DataLog';
import { Settings } from './components/Settings';
import { Navigation } from './components/Navigation';
import './App.css';

function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [currentSystem, setCurrentSystem] = useState<StarSystem | null>(null);
  const [savedSystems, setSavedSystems] = useState<StarSystem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Load saved systems on mount
  useEffect(() => {
    loadSavedSystems();
  }, []);

  const loadSavedSystems = async () => {
    try {
      const systems = await getAllSystems();
      setSavedSystems(systems);
    } catch (error) {
      console.error('Error loading systems:', error);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Simulate generation delay for effect
      await new Promise(resolve => setTimeout(resolve, 500));
      const system = generateStarSystem();
      setCurrentSystem(system);
      await saveSystem(system);
      await loadSavedSystems();
      setView('system');
      showNotification('New system generated and saved!');
    } catch (error) {
      console.error('Error generating system:', error);
      showNotification('Error generating system');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleViewSystem = useCallback((system: StarSystem) => {
    setCurrentSystem(system);
    setView('system');
  }, []);

  const handleDeleteSystem = useCallback(async (id: string) => {
    try {
      await deleteSystem(id);
      await loadSavedSystems();
      if (currentSystem?.id === id) {
        setCurrentSystem(null);
        setView('dashboard');
      }
      showNotification('System deleted');
    } catch (error) {
      console.error('Error deleting system:', error);
    }
  }, [currentSystem]);

  const handleExportJSON = useCallback(() => {
    if (!currentSystem) return;
    const json = exportToJSON(currentSystem);
    downloadFile(json, `mneme-system-${currentSystem.id.slice(0, 8)}.json`, 'application/json');
    showNotification('System exported as JSON');
  }, [currentSystem]);

  const handleExportCSV = useCallback(() => {
    if (!currentSystem) return;
    const csv = exportToCSV(currentSystem);
    downloadFile(csv, `mneme-system-${currentSystem.id.slice(0, 8)}.csv`, 'text/csv');
    showNotification('System exported as CSV');
  }, [currentSystem]);

  const handleExportAll = useCallback(async () => {
    const systems = await getAllSystems();
    const json = exportAllToJSON(systems);
    downloadFile(json, `mneme-systems-${Date.now()}.json`, 'application/json');
    showNotification(`Exported ${systems.length} systems`);
  }, []);

  const handleImport = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const imported = await importSystemsFromJSON(text);
      await loadSavedSystems();
      showNotification(`Imported ${imported.length} systems`);
    } catch (error) {
      console.error('Error importing:', error);
      showNotification('Error importing file');
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    if (confirm('Are you sure you want to delete all saved systems?')) {
      await clearAllSystems();
      await loadSavedSystems();
      setCurrentSystem(null);
      setView('dashboard');
      showNotification('All systems cleared');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0]">
      <Navigation currentView={view} onViewChange={setView} />
      
      <main className="container mx-auto px-4 py-6">
        {notification && (
          <div className="fixed top-4 right-4 bg-[#e53935] text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
            {notification}
          </div>
        )}

        {view === 'dashboard' && (
          <GeneratorDashboard 
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            recentSystems={savedSystems.slice(0, 5)}
            onViewSystem={handleViewSystem}
          />
        )}

        {view === 'system' && currentSystem && (
          <SystemViewer 
            system={currentSystem}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
          />
        )}

        {view === 'log' && (
          <DataLog 
            systems={savedSystems}
            onViewSystem={handleViewSystem}
            onDeleteSystem={handleDeleteSystem}
            onExportAll={handleExportAll}
          />
        )}

        {view === 'settings' && (
          <Settings 
            onImport={handleImport}
            onExportAll={handleExportAll}
            onClearAll={handleClearAll}
            systemCount={savedSystems.length}
          />
        )}
      </main>
    </div>
  );
}

export default App;
