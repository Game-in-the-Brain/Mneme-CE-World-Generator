# FRD-047: Batch Management + Star Systems Tab

**Project:** Mneme CE World Generator  
**Version Target:** 1.4.0  
**Priority:** P1  
**Depends On:** FRD-044 (MWG Bidirectional Integration) — ✅ COMPLETE

---

## 1. Overview

MWG's "saved systems" flat list is replaced with a **Star Systems** hierarchy. Systems are grouped into **batches** (e.g., "Alpha Centauri Sector", "Campaign Sector 3"). Users can create, rename, delete, and switch between batches. Every newly generated star automatically joins the **active batch**.

MWG also gains explicit **3D Map import** and **batch generation** workflows.

---

## 2. User Story

> As a GM, I want to organize my generated worlds into sectors/campaigns so I can manage a whole setting instead of a flat list of unrelated systems.

---

## 3. Data Model: Batch (Star System Group)

```typescript
interface StarSystemBatch {
  id: string;                    // UUID
  name: string;                  // "Alpha Centauri Sector"
  createdAt: number;
  updatedAt: number;
  
  /** Source: 'manual', '3dmap-import', 'generated' */
  source: string;
  
  /** If imported from 3D map, store the original map metadata */
  sourceMapId?: string;
  
  /** Systems in this batch */
  systemIds: string[];
  
  /** Batch-level notes */
  notes?: string;
}
```

### 3.1 StarSystem Extension

```typescript
interface StarSystem {
  // ... existing fields ...
  
  /** Which batch this system belongs to */
  batchId?: string;
  
  /** Order within batch (for display) */
  batchOrder?: number;
}
```

---

## 4. UI: Star Systems Tab

### 4.1 Navigation Change

```
┌─ Navigation ─────────────────────┐
│ [Dashboard] [Systems] [Glossary] [Settings] │
└──────────────────────────────────┘
```

The **Systems** view replaces the current "Settings + saved systems list" approach.

### 4.2 Systems View Layout

```
┌─ Star Systems ───────────────────┐
│                                  │
│ Active Batch: [Sector 3 ▼]  [+] │
│                                  │
│ ┌─ Batch: Sector 3 ────────────┐│
│ │ 5 systems | 3D Map import    ││
│ │ [Rename] [Delete] [Export]   ││
│ │                              ││
│ │ ☐ Alpha (G2)  Hab+3  Pop1M  ││
│ │ ☐ Beta  (M5)  Hab-1  Pop0   ││
│ │ ☐ Gamma (K1)  Hab+2  Pop50M ││
│ │    ...                       ││
│ │ [Generate More] [Import]     ││
│ └──────────────────────────────┘│
│                                  │
│ [📤 Export All Batches]          │
│ [📂 Import Batch]                │
└──────────────────────────────────┘
```

### 4.3 Batch Actions

| Action | Behavior |
|---|---|
| **Create Batch** | Prompt for name, create empty batch, set as active |
| **Rename Batch** | Inline edit of batch name |
| **Delete Batch** | Confirm, delete batch + optionally delete contained systems |
| **Export Batch** | Download `.mneme-batch` JSON with all systems + metadata |
| **Import Batch** | Upload `.mneme-batch` or `.mneme-map` (from 3D map) |
| **Generate More** | Generate N new systems, auto-add to active batch |

---

## 5. Generation Flow

### 5.1 Single System Generation

1. User clicks "Generate System" on Dashboard
2. System generates
3. **Automatically added to active batch** (or "Uncategorized" if none active)
4. View switches to SystemViewer

### 5.2 Batch Generation from 3D Map

New button on Dashboard: **"Import from 3D Map"**

```
┌─ Import from 3D Map ─────────────┐
│                                  │
│ 📂 Drop .mneme-map file here     │
│    or click to browse            │
│                                  │
│ Options:                         │
│   [☑] Generate systems for all stars │
│   [☑] Use spectral types for class/grade │
│   [☐] Apply goal mode filters    │
│                                  │
│ [Generate Batch]                 │
└──────────────────────────────────┘
```

Flow:
1. Parse `.mneme-map` file
2. Create new batch named after the map (or user input)
3. For each star in the map:
   - Parse spectral type → class/grade
   - `generateStarSystem({ starClass, starGrade, ... })`
   - Attach `sourceStarId`, `x`, `y`, `z`
   - Save to DB, add to batch
4. Show progress: "Generating 3/20..."
5. Switch to Systems view with new batch active

---

## 6. Recent Systems → Batch-Aware

The Dashboard's "Recent Systems" section now shows **Recent Batches** instead:

```
┌─ Recent Batches ─────────────────┐
│ Sector 3 (5 systems)      [View] │
│ Alpha Centauri (3 systems)[View] │
│ Campaign Core (12 systems)[View] │
└──────────────────────────────────┘
```

Clicking [View] switches to Systems tab with that batch active.

---

## 7. Export / Import Format: `.mneme-batch`

```json
{
  "mnemeFormat": "mwg-batch-v1",
  "batch": {
    "id": "uuid",
    "name": "Sector 3",
    "createdAt": 1234567890,
    "source": "3dmap-import",
    "notes": "Core campaign sector"
  },
  "systems": [
    { /* full StarSystem object */ },
    { /* full StarSystem object */ }
  ]
}
```

---

## 8. 3D Map Integration Points

### 8.1 Export to 3D Map

In the Systems view, each batch gets an **"Export to 3D Map"** button:

1. Collects all systems in batch with coordinates
2. Builds `MnemeSystemExport` JSON
3. Downloads as `.mneme-map` file
4. User imports this into 3D map

### 8.2 Import from 3D Map

Already implemented in FRD-044. Enhanced here with:
- Automatic batch creation
- Batch named after the map file
- Systems grouped together

---

## 9. Database Migration

Existing systems without `batchId` are automatically placed into a **"Legacy Systems"** batch on first load.

```typescript
// Migration pseudo-code
async function migrateToBatches() {
  const allSystems = await getAllSystems();
  const legacyBatch = await createBatch('Legacy Systems');
  for (const system of allSystems) {
    if (!system.batchId) {
      system.batchId = legacyBatch.id;
      await saveSystem(system);
    }
  }
}
```

---

## 10. Acceptance Criteria

- [x] Systems view shows batches, not flat list
- [x] Can create, rename, delete batches
- [x] Can set active batch
- [x] New systems auto-join active batch
- [x] Can import 3D map as a batch
- [x] Batch generation shows progress
- [x] Can export batch as `.mneme-batch`
- [x] Can import `.mneme-batch` files
- [x] Legacy systems migrated to "Legacy Systems" batch
- [x] Dashboard shows recent batches
- [x] Can export batch to 3D Map format
- [x] Build passes zero TypeScript errors

---

## 11. Implementation Status

| Milestone | Status | Commit |
|---|---|---|
| M1: Data Model + Migration | ✅ Complete | `3322ca71` |
| M2: Systems View UI | ✅ Complete | `2d2eeeef` |
| M3: Import/Export + 3D Map Flow | ✅ Complete | `65756dea` |

---

## 12. Related FRDs

- FRD-044 (MWG Bidirectional Integration) — ✅ DONE
- FRD-045 (3D Starmap Star Generation) — ✅ DONE
- FRD-046 (2D Map Star Page Save) — QUEUED
