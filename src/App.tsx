import { useState, useEffect, useCallback } from 'react';
import type { StarSystem, ViewMode, GeneratorOptions } from './types';
import { generateStarSystem } from './lib/generator';
import {
  saveSystem, getAllSystems, deleteSystem, clearAllSystems,
  exportToJSON, exportAllToJSON, exportToCSV, downloadFile, importSystemsFromJSON
} from './lib/db';
import { GeneratorDashboard } from './components/GeneratorDashboard';
import { SystemViewer } from './components/SystemViewer';

import { Settings } from './components/Settings';
import { Glossary } from './components/Glossary';
import { Navigation, type Theme } from './components/Navigation';
import './App.css';

function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [currentSystem, setCurrentSystem] = useState<StarSystem | null>(null);
  const [savedSystems, setSavedSystems] = useState<StarSystem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Theme state — persisted to localStorage (QA-005)
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('mneme_theme') as Theme) || 'dark';
  });
  // Track desktop theme for phone toggle — when toggling off phone, restore this
  const [desktopTheme, setDesktopTheme] = useState<Exclude<Theme, 'phone'>>(() => {
    const saved = localStorage.getItem('mneme_theme') as Theme;
    return saved === 'day' ? 'day' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mneme_theme', theme);
    // When switching to a desktop theme, remember it
    if (theme !== 'phone') {
      setDesktopTheme(theme);
    }
  }, [theme]);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    // If clicking phone while on phone, go back to desktop
    if (newTheme === 'phone' && theme === 'phone') {
      setTheme(desktopTheme);
    } else {
      setTheme(newTheme);
    }
  }, [theme, desktopTheme]);

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

  const handleGenerate = useCallback(async (options: GeneratorOptions) => {
    setIsGenerating(true);
    try {
      // Simulate generation delay for effect so the spinner shows immediately
      await new Promise(resolve => setTimeout(resolve, 500));

      const hasGoals = options.goalStarportMin || options.goalMinPopulation || options.goalHabitable;
      const maxIterations = 2000;
      let system = generateStarSystem(options);
      let iterations = 1;

      if (hasGoals) {
        const starportRanks: Record<string, number> = { X: 0, E: 1, D: 2, C: 3, B: 4, A: 5 };
        const candidates: { system: StarSystem; score: number }[] = [];
        let exactMatch = false;

        for (let i = 0; i < maxIterations; i++) {
          const s = i === 0 ? system : generateStarSystem(options);
          let score = 0;

          if (options.goalStarportMin) {
            const actualRank = starportRanks[s.inhabitants.starport.class];
            const goalRank = starportRanks[options.goalStarportMin];
            score += Math.max(0, goalRank - actualRank) * 10;
          }

          if (options.goalMinPopulation) {
            if (s.inhabitants.population < options.goalMinPopulation) {
              score += Math.log10(options.goalMinPopulation / s.inhabitants.population);
            }
          }

          if (options.goalHabitable) {
            if (s.mainWorld.habitability <= 0) {
              score += Math.abs(s.mainWorld.habitability) + 1;
            }
          }

          candidates.push({ system: s, score });
          if (score === 0) {
            exactMatch = true;
            iterations = i + 1;
            break;
          }
        }

        candidates.sort((a, b) => a.score - b.score);
        system = candidates[0].system;
        if (!exactMatch) iterations = maxIterations;
      }

      setCurrentSystem(system);
      await saveSystem(system);
      await loadSavedSystems();
      setView('system');

      if (hasGoals && iterations >= maxIterations) {
        showNotification(`Best match found after ${maxIterations.toLocaleString()} generations (closest to goals)`);
      } else if (hasGoals) {
        showNotification(`Found matching world after ${iterations.toLocaleString()} generation${iterations === 1 ? '' : 's'}`);
      } else {
        showNotification('New system generated and saved!');
      }
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

  const handleUpdateSystem = useCallback(async (updated: StarSystem) => {
    setCurrentSystem(updated);
    await saveSystem(updated);
    await loadSavedSystems();
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
    <div className="min-h-screen phone-layout-root" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navigation currentView={view} onViewChange={setView} theme={theme} onThemeChange={handleThemeChange} />
      
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
            onUpdateSystem={handleUpdateSystem}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
            onGlossary={() => setView('glossary')}
          />
        )}

        {view === 'glossary' && <Glossary />}

        {view === 'settings' && (
          <Settings 
            systems={savedSystems}
            onViewSystem={handleViewSystem}
            onDeleteSystem={handleDeleteSystem}
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
