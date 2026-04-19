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
import { parseSpectralType } from './lib/spectralParser';
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

  // Load saved systems on mount + handle URL params from 3D map
  useEffect(() => {
    loadSavedSystems();
    handleUrlParams();
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

  /**
   * Handle URL parameters from 3D Interstellar Map.
   * When user clicks "Open in MWG", the URL contains star data.
   */
  const handleUrlParams = async () => {
    const params = new URLSearchParams(window.location.search);
    const starId = params.get('starId');
    const name = params.get('name');
    const spec = params.get('spec');

    if (starId && spec) {
      // Parse spectral type to get class/grade
      const parsed = parseSpectralType(spec);
      if (parsed) {
        const options: GeneratorOptions = {
          starClass: parsed.stellarClass,
          starGrade: parsed.grade,
          mainWorldType: 'random',
          populated: true,
        };
        setIsGenerating(true);
        try {
          const system = generateStarSystem(options);
          // Attach 3D map metadata
          system.name = name || `${parsed.stellarClass}${parsed.grade} System`;
          system.sourceStarId = starId;
          system.x = parseFloat(params.get('x') || '0');
          system.y = parseFloat(params.get('y') || '0');
          system.z = parseFloat(params.get('z') || '0');
          setCurrentSystem(system);
          await saveSystem(system);
          await loadSavedSystems();
          setView('system');
          showNotification(`Generated system for ${name || starId}`);
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error generating from URL params:', error);
          showNotification('Error generating system from star data');
        } finally {
          setIsGenerating(false);
        }
      }
    }
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
    // If system has 3D map coordinates, export in MnemeSystemExport format
    if (currentSystem.sourceStarId !== undefined) {
      const exportData = {
        mnemeFormat: 'star-system-batch',
        version: '1.0',
        source: 'mwg',
        exportedAt: new Date().toISOString(),
        systems: [{
          starId: currentSystem.sourceStarId,
          name: currentSystem.name || currentSystem.sourceStarId,
          x: currentSystem.x ?? 0,
          y: currentSystem.y ?? 0,
          z: currentSystem.z ?? 0,
          spec: `${currentSystem.primaryStar.class}${currentSystem.primaryStar.grade}`,
          absMag: 0,
          mwgSystem: currentSystem,
        }],
      };
      downloadFile(JSON.stringify(exportData, null, 2), `mneme-system-${currentSystem.id.slice(0, 8)}.json`, 'application/json');
    } else {
      const json = exportToJSON(currentSystem);
      downloadFile(json, `mneme-system-${currentSystem.id.slice(0, 8)}.json`, 'application/json');
    }
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
      const parsed = JSON.parse(text);

      // Check for MnemeSystemExport format (from 3D map)
      if (parsed.mnemeFormat === 'star-system-batch' && Array.isArray(parsed.systems)) {
        const generated: StarSystem[] = [];
        for (const entry of parsed.systems) {
          const spec = entry.spec as string;
          const parsedSpec = parseSpectralType(spec);
          if (parsedSpec) {
            const system = generateStarSystem({
              starClass: parsedSpec.stellarClass,
              starGrade: parsedSpec.grade,
              mainWorldType: 'random',
              populated: true,
            });
            system.name = entry.name || `${parsedSpec.stellarClass}${parsedSpec.grade} System`;
            system.sourceStarId = String(entry.starId);
            system.x = Number(entry.x ?? 0);
            system.y = Number(entry.y ?? 0);
            system.z = Number(entry.z ?? 0);
            // If entry already has mwgSystem data, merge key fields (optional enrichment)
            if (entry.mwgSystem && typeof entry.mwgSystem === 'object') {
              // Keep our generated data but mark as enriched
              (system as unknown as Record<string, unknown>).importedMwgData = true;
            }
            await saveSystem(system);
            generated.push(system);
          }
        }
        await loadSavedSystems();
        showNotification(`Imported ${parsed.systems.length} stars, generated ${generated.length} systems`);
        return;
      }

      // Standard MWG import
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
