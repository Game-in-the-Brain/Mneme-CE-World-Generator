import Dexie, { type Table } from 'dexie';
import type { StarSystem } from '../types';

export class MnemeDatabase extends Dexie {
  starSystems!: Table<StarSystem>;

  constructor() {
    super('MnemeWorldGenerator');
    this.version(1).stores({
      starSystems: '++id, createdAt, name, [primaryStar.class]'
    });
  }
}

export const db = new MnemeDatabase();

// =====================
// CRUD Operations
// =====================

export async function saveSystem(system: StarSystem): Promise<void> {
  try {
    await db.starSystems.put(system);
    console.log('✅ System saved:', system.id);
  } catch (error) {
    console.error('❌ Error saving system:', error);
    throw error;
  }
}

export async function loadSystem(id: string): Promise<StarSystem | undefined> {
  try {
    const system = await db.starSystems.get(id);
    return system;
  } catch (error) {
    console.error('❌ Error loading system:', error);
    throw error;
  }
}

export async function getAllSystems(): Promise<StarSystem[]> {
  try {
    const systems = await db.starSystems
      .orderBy('createdAt')
      .reverse()
      .toArray();
    return systems;
  } catch (error) {
    console.error('❌ Error loading systems:', error);
    throw error;
  }
}

export async function deleteSystem(id: string): Promise<void> {
  try {
    await db.starSystems.delete(id);
    console.log('🗑️ System deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting system:', error);
    throw error;
  }
}

export async function clearAllSystems(): Promise<void> {
  try {
    await db.starSystems.clear();
    console.log('🗑️ All systems cleared');
  } catch (error) {
    console.error('❌ Error clearing systems:', error);
    throw error;
  }
}

// =====================
// Export/Import
// =====================

export function exportToJSON(system: StarSystem): string {
  return JSON.stringify(system, null, 2);
}

export function exportAllToJSON(systems: StarSystem[]): string {
  return JSON.stringify(systems, null, 2);
}

export function exportToCSV(system: StarSystem): string {
  const headers = [
    'ID', 'Created At', 'Star Class', 'Star Grade', 'Star Mass', 'Star Luminosity',
    'World Type', 'World Size', 'Gravity', 'Atmosphere', 'Temperature',
    'Hazard', 'Hazard Intensity', 'Resources', 'Habitability',
    'Zone', 'Distance AU',
    'Tech Level', 'Population', 'Wealth', 'Power Structure',
    'Development', 'Source of Power', 'Governance',
    'Starport', 'Naval Base', 'Scout Base', 'Pirate Base',
    'Travel Zone'
  ];
  
  const row = [
    system.id,
    new Date(system.createdAt).toISOString(),
    system.primaryStar.class,
    system.primaryStar.grade,
    system.primaryStar.mass,
    system.primaryStar.luminosity,
    system.mainWorld.type,
    system.mainWorld.size,
    system.mainWorld.gravity,
    system.mainWorld.atmosphere,
    system.mainWorld.temperature,
    system.mainWorld.hazard,
    system.mainWorld.hazardIntensity,
    system.mainWorld.biochemicalResources,
    system.mainWorld.habitability,
    system.mainWorld.zone,
    system.mainWorld.distanceAU,
    system.inhabitants.techLevel,
    system.inhabitants.population,
    system.inhabitants.wealth,
    system.inhabitants.powerStructure,
    system.inhabitants.development,
    system.inhabitants.sourceOfPower,
    system.inhabitants.governance,
    system.inhabitants.starport.class,
    system.inhabitants.starport.hasNavalBase,
    system.inhabitants.starport.hasScoutBase,
    system.inhabitants.starport.hasPirateBase,
    system.inhabitants.travelZone
  ];
  
  return [headers.join(','), row.map(v => `"${v}"`).join(',')].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJSON(json: string): StarSystem | null {
  try {
    const system = JSON.parse(json) as StarSystem;
    // Validate required fields
    if (system.id && system.primaryStar && system.mainWorld) {
      return system;
    }
    throw new Error('Invalid system data');
  } catch (error) {
    console.error('❌ Error importing system:', error);
    return null;
  }
}

export async function importSystemsFromJSON(json: string): Promise<StarSystem[]> {
  try {
    const data = JSON.parse(json);
    const systems = Array.isArray(data) ? data : [data];
    
    const validSystems: StarSystem[] = [];
    for (const system of systems) {
      if (system.id && system.primaryStar && system.mainWorld) {
        // Assign new ID to avoid conflicts
        system.id = crypto.randomUUID();
        system.createdAt = Date.now();
        await saveSystem(system);
        validSystems.push(system);
      }
    }
    
    return validSystems;
  } catch (error) {
    console.error('❌ Error importing systems:', error);
    return [];
  }
}
