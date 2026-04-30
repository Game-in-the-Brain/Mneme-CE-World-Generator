import { useState, useEffect } from 'react';
import type { StarSystem } from '../types';

export interface SystemEditState {
  isEditing: boolean;
  originalSystem: StarSystem | null;
  pendingSystem: StarSystem;
  displaySystem: StarSystem;
  enterEditMode: () => void;
  discardEdits: () => void;
  saveEdits: () => Promise<void>;
  saveAsNew: () => Promise<StarSystem | undefined>;
  setPendingSystem: React.Dispatch<React.SetStateAction<StarSystem>>;
}

export function useSystemEditMode(
  system: StarSystem,
  onUpdateSystem?: (system: StarSystem) => void,
): SystemEditState {
  const [isEditing, setIsEditing] = useState(false);
  const [originalSystem, setOriginalSystem] = useState<StarSystem | null>(null);
  const [pendingSystem, setPendingSystem] = useState<StarSystem>(system);

  useEffect(() => {
    if (!isEditing) {
      setPendingSystem(system);
    }
  }, [system, isEditing]);

  const displaySystem = isEditing ? pendingSystem : system;

  function enterEditMode() {
    setOriginalSystem(JSON.parse(JSON.stringify(system)));
    setPendingSystem(JSON.parse(JSON.stringify(system)));
    setIsEditing(true);
  }

  function discardEdits() {
    if (originalSystem) {
      setPendingSystem(originalSystem);
    }
    setIsEditing(false);
    setOriginalSystem(null);
  }

  async function saveEdits() {
    if (!onUpdateSystem) return;
    const saved: StarSystem = {
      ...pendingSystem,
      editedAt: Date.now(),
    };
    await onUpdateSystem(saved);
    setIsEditing(false);
    setOriginalSystem(null);
  }

  async function saveAsNew() {
    if (!onUpdateSystem) return undefined;
    const newName = window.prompt('Save as new system name:', `${pendingSystem.name || 'Unnamed'} (copy)`);
    if (newName === null) return undefined;
    const copied: StarSystem = {
      ...JSON.parse(JSON.stringify(pendingSystem)),
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      name: newName || `${pendingSystem.name || 'Unnamed'} (copy)`,
      editedAt: undefined,
      batchId: undefined,
      diceLocks: undefined,
    };
    await onUpdateSystem(copied);
    setIsEditing(false);
    setOriginalSystem(null);
    return copied;
  }

  return {
    isEditing,
    originalSystem,
    pendingSystem,
    displaySystem,
    enterEditMode,
    discardEdits,
    saveEdits,
    saveAsNew,
    setPendingSystem,
  };
}
