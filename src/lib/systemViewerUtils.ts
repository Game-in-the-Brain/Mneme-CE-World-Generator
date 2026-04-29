import type { StarSystem } from '../types';

export function generateSeed(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getEconomicModelLabel(system: StarSystem): string {
  if (system.economicPresetLabel) return system.economicPresetLabel;
  const preset = system.economicPreset;
  if (!preset) return 'Legacy / Unknown';
  if (preset.label) return preset.label;
  if (preset.name) return preset.name;
  if (preset.id === 'mneme') return 'Mneme';
  if (preset.id === 'ce') return 'CE / Traveller';
  return preset.id;
}
