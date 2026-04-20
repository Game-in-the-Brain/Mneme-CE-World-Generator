import Dexie, { type Table } from 'dexie';
import type { StarSystem, StarSystemBatch } from '../types';

export class MnemeDatabase extends Dexie {
  starSystems!: Table<StarSystem>;
  batches!: Table<StarSystemBatch>;

  constructor() {
    super('MnemeWorldGenerator');

    // Version 1 — original schema
    this.version(1).stores({
      starSystems: '++id, createdAt, name, [primaryStar.class]'
    });

    // Version 2 — FRD-047: batch management + legacy migration
    this.version(2).stores({
      starSystems: '++id, createdAt, name, [primaryStar.class], batchId',
      batches: '++id, createdAt, name, source'
    }).upgrade(async (tx) => {
      // Migrate existing systems without batchId into a "Legacy Systems" batch
      const legacyBatchId = crypto.randomUUID();
      const allSystems = await tx.table('starSystems').toArray() as StarSystem[];
      const systemIds = allSystems.map(s => s.id);

      await tx.table('batches').add({
        id: legacyBatchId,
        name: 'Legacy Systems',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        source: 'manual',
        systemIds,
      } as StarSystemBatch);

      await tx.table('starSystems').toCollection().modify((system: StarSystem) => {
        system.batchId = legacyBatchId;
      });
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
// Batch Management (FRD-047)
// =====================

export async function createBatch(
  name: string,
  source: string = 'manual',
  notes?: string
): Promise<StarSystemBatch> {
  const batch: StarSystemBatch = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    source,
    systemIds: [],
    notes,
  };
  await db.batches.add(batch);
  console.log('✅ Batch created:', batch.id, batch.name);
  return batch;
}

export async function getBatch(id: string): Promise<StarSystemBatch | undefined> {
  return db.batches.get(id);
}

export async function getAllBatches(): Promise<StarSystemBatch[]> {
  return db.batches.orderBy('createdAt').reverse().toArray();
}

export async function updateBatch(
  id: string,
  updates: Partial<Pick<StarSystemBatch, 'name' | 'notes' | 'systemIds'>>
): Promise<void> {
  await db.batches.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteBatch(id: string, deleteContainedSystems: boolean = false): Promise<void> {
  const batch = await getBatch(id);
  if (!batch) return;

  if (deleteContainedSystems && batch.systemIds.length > 0) {
    await db.starSystems.bulkDelete(batch.systemIds);
  } else {
    // Clear batchId from systems that were in this batch
    await db.starSystems.where('batchId').equals(id).modify((system: StarSystem) => {
      delete system.batchId;
      delete system.batchOrder;
    });
  }

  await db.batches.delete(id);
  console.log('🗑️ Batch deleted:', id);
}

export async function addSystemToBatch(systemId: string, batchId: string): Promise<void> {
  const batch = await getBatch(batchId);
  if (!batch) throw new Error(`Batch ${batchId} not found`);

  await db.starSystems.update(systemId, { batchId });

  if (!batch.systemIds.includes(systemId)) {
    batch.systemIds.push(systemId);
    await db.batches.update(batchId, { systemIds: batch.systemIds, updatedAt: Date.now() });
  }
}

export async function removeSystemFromBatch(systemId: string, batchId: string): Promise<void> {
  const batch = await getBatch(batchId);
  if (!batch) return;

  await db.starSystems.update(systemId, { batchId: undefined });

  const idx = batch.systemIds.indexOf(systemId);
  if (idx !== -1) {
    batch.systemIds.splice(idx, 1);
    await db.batches.update(batchId, { systemIds: batch.systemIds, updatedAt: Date.now() });
  }
}

export async function getSystemsInBatch(batchId: string): Promise<StarSystem[]> {
  return db.starSystems.where('batchId').equals(batchId).toArray();
}

export async function getActiveBatch(): Promise<StarSystemBatch | undefined> {
  const id = localStorage.getItem('mneme_active_batch_id');
  if (!id) return undefined;
  return getBatch(id);
}

export function setActiveBatch(batchId: string | null): void {
  if (batchId) {
    localStorage.setItem('mneme_active_batch_id', batchId);
  } else {
    localStorage.removeItem('mneme_active_batch_id');
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

function generateSystemKey(system: StarSystem): string {
  const date = new Date(system.createdAt);
  const yy = date.getFullYear().toString().slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  
  const starClass = system.primaryStar.class;
  const starGrade = system.primaryStar.grade;
  
  // Generate 3-char random suffix (uppercase alphanumeric)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomSuffix = '';
  for (let i = 0; i < 3; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${yy}${mm}${dd}-${hh}${min}${ss}-${starClass}${starGrade}-${randomSuffix}`;
}

function escapeCSV(value: string | number | boolean | undefined): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  // Escape values containing commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(system: StarSystem): string {
  const systemKey = generateSystemKey(system);
  
  // Build headers
  const headers: string[] = [
    // System Fields
    'key',
    'generated_at',
    'star_class',
    'star_grade',
    'star_mass',
    'star_luminosity',
    'zone_infernal_max_au',
    'zone_hot_max_au',
    'zone_cons_hab_max_au',
    'zone_opt_hab_max_au',
    // Main World Fields
    'mw_key',
    'mw_type',
    'mw_size_km',
    'mw_gravity_g',
    'mw_atmosphere',
    'mw_temperature',
    'mw_hazard',
    'mw_hazard_intensity',
    'mw_habitability',
    'mw_zone',
    'mw_au',
    'mw_tl',
    'mw_population',
    'mw_wealth',
    'mw_power_structure',
    'mw_development',
    'mw_source_of_power',
    'mw_starport',
    'mw_travel_zone',
    'mw_radius_km',
    'mw_diameter_km',
    'mw_surface_g',
    'mw_escape_velocity_ms'
  ];
  
  // Build base values array
  const values: (string | number | boolean)[] = [
    // System Fields
    systemKey,
    new Date(system.createdAt).toISOString(),
    system.primaryStar.class,
    system.primaryStar.grade,
    system.primaryStar.mass,
    system.primaryStar.luminosity,
    system.zones.infernal.max,
    system.zones.hot.max,
    system.zones.conservative.max,
    system.zones.cold.max,
    // Main World Fields
    `${systemKey}-MW`,
    system.mainWorld.type,
    Math.round(system.mainWorld.size),
    system.mainWorld.gravity,
    system.mainWorld.atmosphere,
    system.mainWorld.temperature,
    system.mainWorld.hazard,
    system.mainWorld.hazardIntensity,
    system.mainWorld.habitability,
    system.mainWorld.zone,
    system.mainWorld.distanceAU,
    system.inhabitants.techLevel,
    system.inhabitants.population,
    system.inhabitants.wealth,
    system.inhabitants.powerStructure,
    system.inhabitants.development,
    system.inhabitants.sourceOfPower,
    system.inhabitants.starport.class,
    system.inhabitants.travelZone,
    Math.round(system.mainWorld.radius),
    Math.round(system.mainWorld.size), // diameter = size for main world
    system.mainWorld.gravity,
    Math.round(system.mainWorld.escapeVelocity)
  ];
  
  // Add companion star blocks (S1_, S2_, S3_) — max 3 companions
  const maxCompanions = 3;
  for (let i = 0; i < maxCompanions; i++) {
    const companion = system.companionStars[i];
    const prefix = `s${i + 1}_`;
    
    headers.push(
      `${prefix}key`,
      `${prefix}class`,
      `${prefix}grade`,
      `${prefix}mass`,
      `${prefix}luminosity`,
      `${prefix}orbit_au`
    );
    
    if (companion) {
      values.push(
        `${systemKey}-S${i + 1}`,
        companion.class,
        companion.grade,
        companion.mass,
        companion.luminosity,
        companion.orbitDistance ?? ''
      );
    } else {
      values.push('', '', '', '', '', '');
    }
  }
  
  // Collect and sort all planetary bodies by AU (innermost first)
  const allBodies: import('../types').PlanetaryBody[] = [
    ...system.circumstellarDisks,
    ...system.dwarfPlanets,
    ...system.terrestrialWorlds,
    ...system.iceWorlds,
    ...system.gasWorlds
  ].sort((a, b) => a.distanceAU - b.distanceAU);
  
  // Add planetary body blocks (P01_, P02_, etc.) — all bodies use P prefix
  let bodyIndex = 0;
  
  for (const body of allBodies) {
    bodyIndex++;
    const prefix = `p${String(bodyIndex).padStart(2, '0')}_`;
    
    headers.push(
      `${prefix}key`,
      `${prefix}type`,
      `${prefix}mass_em`,
      `${prefix}zone`,
      `${prefix}au`,
      `${prefix}gas_class`,
      `${prefix}lesser_earth_type`,
      `${prefix}radius_km`,
      `${prefix}diameter_km`,
      `${prefix}density_gcm3`,
      `${prefix}surface_g`,
      `${prefix}escape_velocity_ms`
    );
    
    values.push(
      `${systemKey}-P${String(bodyIndex).padStart(2, '0')}`,
      body.type,
      body.mass,
      body.zone,
      body.distanceAU,
      body.gasClass ?? '',
      body.lesserEarthType ?? '',
      body.radiusKm !== undefined ? Math.round(body.radiusKm) : '',
      body.diameterKm !== undefined ? Math.round(body.diameterKm) : '',
      body.densityGcm3 !== undefined ? body.densityGcm3 : '',
      body.surfaceGravityG !== undefined ? body.surfaceGravityG : '',
      body.escapeVelocityMs !== undefined ? Math.round(body.escapeVelocityMs) : ''
    );
  }
  
  // Format CSV with CRLF line endings per REF-012
  const headerLine = headers.map(escapeCSV).join(',');
  const valueLine = values.map(escapeCSV).join(',');
  
  return `${headerLine}\r\n${valueLine}`;
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
