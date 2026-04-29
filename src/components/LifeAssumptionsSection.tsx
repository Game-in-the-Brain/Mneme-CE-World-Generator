import { useRef, useState, useEffect } from 'react';
import type { ExtraterrestrialLifeAssumptions } from '../types';
import { FlaskConical } from 'lucide-react';
import { loadGeneratorOptions, saveGeneratorOptions } from '../lib/optionsStorage';
import {
  BUILT_IN_LIFE_PRESETS,
  getLifePresetById,
  loadCustomLifePresets,
  saveCustomLifePresets,
  exportLifePresetToJSON,
  importLifePresetFromJSON,
} from '../lib/lifePresets';

export function LifeAssumptionsSection() {
  const generatorOptions = loadGeneratorOptions();
  const [activeLifePreset, setActiveLifePreset] = useState<ExtraterrestrialLifeAssumptions>(
    () => getLifePresetById(generatorOptions.activeLifeAssumptionsId || 'mneme-default') ?? BUILT_IN_LIFE_PRESETS[0]
  );
  const [lifeCustomPresets, setLifeCustomPresets] = useState<ExtraterrestrialLifeAssumptions[]>(loadCustomLifePresets);
  const [lifePresetImportStatus, setLifePresetImportStatus] = useState<string | null>(null);
  const lifePresetFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = loadGeneratorOptions();
    saveGeneratorOptions({ ...current, activeLifeAssumptionsId: activeLifePreset.id });
  }, [activeLifePreset]);

  useEffect(() => {
    saveCustomLifePresets(lifeCustomPresets);
  }, [lifeCustomPresets]);

  return (
    <div className="card space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FlaskConical className="text-[#e53935]" size={20} />
        Extraterrestrial Life Assumptions
      </h3>

      <div className="p-4 bg-white/5 rounded-lg space-y-4">
        {/* Preset selector */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="text-sm font-medium text-[#9e9e9e]">Preset</label>
          <select
            value={BUILT_IN_LIFE_PRESETS.some((p) => p.id === activeLifePreset.id) ? activeLifePreset.id : ''}
            onChange={(e) => {
              const found = getLifePresetById(e.target.value, lifeCustomPresets);
              if (found) setActiveLifePreset(found);
            }}
            className="flex-1 rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
          >
            <option value="" disabled={!BUILT_IN_LIFE_PRESETS.some((p) => p.id === activeLifePreset.id)}>
              {BUILT_IN_LIFE_PRESETS.some((p) => p.id === activeLifePreset.id) ? 'Select preset...' : activeLifePreset.name}
            </option>
            {BUILT_IN_LIFE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (activeLifePreset.id.startsWith('custom') || activeLifePreset.id.startsWith('imported')) {
                  setLifeCustomPresets((prev) => {
                    const filtered = prev.filter((p) => p.id !== activeLifePreset.id);
                    return [...filtered, activeLifePreset];
                  });
                  setLifePresetImportStatus('Preset saved');
                  setTimeout(() => setLifePresetImportStatus(null), 2000);
                }
              }}
              disabled={BUILT_IN_LIFE_PRESETS.some((p) => p.id === activeLifePreset.id)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                const name = window.prompt('Name for new preset:');
                if (!name) return;
                const id = `custom-${Date.now()}`;
                const newPreset = { ...activeLifePreset, id, name };
                setLifeCustomPresets((prev) => [...prev, newPreset]);
                setActiveLifePreset(newPreset);
                setLifePresetImportStatus('Preset saved as new');
                setTimeout(() => setLifePresetImportStatus(null), 2000);
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
            >
              Save As
            </button>
            <button
              onClick={() => {
                const json = exportLifePresetToJSON(activeLifePreset);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mneme-life-preset-${activeLifePreset.id}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => lifePresetFileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
            >
              Import
            </button>
          </div>
        </div>

        {/* Custom presets loader + delete */}
        {lifeCustomPresets.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="text-sm font-medium text-[#9e9e9e]">Load custom preset</label>
            <select
              value={lifeCustomPresets.some((p) => p.id === activeLifePreset.id) ? activeLifePreset.id : ''}
              onChange={(e) => {
                const found = lifeCustomPresets.find((p) => p.id === e.target.value);
                if (found) setActiveLifePreset(found);
              }}
              className="flex-1 rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
            >
              <option value="">Select saved preset...</option>
              {lifeCustomPresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (window.confirm('Delete this custom preset?')) {
                  setLifeCustomPresets((prev) => prev.filter((p) => p.id !== activeLifePreset.id));
                  setActiveLifePreset(BUILT_IN_LIFE_PRESETS[0]);
                  setLifePresetImportStatus('Preset deleted');
                  setTimeout(() => setLifePresetImportStatus(null), 2000);
                }
              }}
              disabled={!lifeCustomPresets.some((p) => p.id === activeLifePreset.id)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        <input
          ref={lifePresetFileInputRef}
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const imported = importLifePresetFromJSON(String(reader.result));
              if (imported) {
                const id = `imported-${Date.now()}`;
                const withId = { ...imported, id };
                setLifeCustomPresets((prev) => [...prev, withId]);
                setActiveLifePreset(withId);
                setLifePresetImportStatus('Preset imported');
              } else {
                setLifePresetImportStatus('Import failed — invalid preset file');
              }
              if (lifePresetFileInputRef.current) lifePresetFileInputRef.current.value = '';
              setTimeout(() => setLifePresetImportStatus(null), 3000);
            };
            reader.readAsText(file);
          }}
          className="hidden"
        />
        {lifePresetImportStatus && (
          <p className={`text-sm ${lifePresetImportStatus.includes('failed') || lifePresetImportStatus.includes('deleted') ? 'text-[#e53935]' : 'text-green-500'}`}>
            {lifePresetImportStatus}
          </p>
        )}

        {/* Editable parameters */}
        <div className="p-4 bg-white/5 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Biosphere TN</label>
              <input
                type="number"
                min={5}
                max={40}
                step={1}
                value={activeLifePreset.biosphereTN}
                onChange={(e) => {
                  const val = Math.max(5, Math.min(40, Number(e.target.value)));
                  setActiveLifePreset((prev) => ({
                    ...prev,
                    id: 'custom',
                    name: 'Custom',
                    biosphereTN: val,
                  }));
                }}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Disadvantage</label>
              <input
                type="number"
                min={0}
                max={5}
                step={1}
                value={activeLifePreset.biosphereDisadvantage}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(5, Number(e.target.value)));
                  setActiveLifePreset((prev) => ({
                    ...prev,
                    id: 'custom',
                    name: 'Custom',
                    biosphereDisadvantage: val,
                  }));
                }}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Min Biochem</label>
              <select
                value={activeLifePreset.minBiochemForBiosphereRoll}
                onChange={(e) => {
                  setActiveLifePreset((prev) => ({
                    ...prev,
                    id: 'custom',
                    name: 'Custom',
                    minBiochemForBiosphereRoll: e.target.value as ExtraterrestrialLifeAssumptions['minBiochemForBiosphereRoll'],
                  }));
                }}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              >
                <option value="Common">Common</option>
                <option value="Abundant">Abundant</option>
                <option value="Rich">Rich</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Transitional Atmospheres</label>
              <select
                value={activeLifePreset.enableTransitionalAtmospheres ? 'true' : 'false'}
                onChange={(e) => {
                  setActiveLifePreset((prev) => ({
                    ...prev,
                    id: 'custom',
                    name: 'Custom',
                    enableTransitionalAtmospheres: e.target.value === 'true',
                  }));
                }}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Biochem Offset Rule</label>
              <select
                value={activeLifePreset.biochemOffsetRule}
                onChange={(e) => {
                  setActiveLifePreset((prev) => ({
                    ...prev,
                    id: 'custom',
                    name: 'Custom',
                    biochemOffsetRule: e.target.value as ExtraterrestrialLifeAssumptions['biochemOffsetRule'],
                  }));
                }}
                className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
              >
                <option value="standard">Standard</option>
                <option value="halved">Halved</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1 font-medium text-[#9e9e9e]">Description</label>
            <input
              type="text"
              value={activeLifePreset.description}
              onChange={(e) => {
                setActiveLifePreset((prev) => ({
                  ...prev,
                  id: 'custom',
                  name: 'Custom',
                  description: e.target.value,
                }));
              }}
              className="w-full rounded px-3 py-2 text-sm border bg-[#141419] border-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
