# FRD-063: Name-Place-Faction Generator Integration

**Project:** Mneme CE World Generator  
**Date:** 260424  
**Status:** In Progress — Upstream Core Build Underway  
**Upstream FRD:** [FRD-061: Name-Place-Faction Generator — Core Library Build](../FRD-061-Name-Place-Faction-Generator-Core.md)  
**Depends On:** `https://github.com/Game-in-the-Brain/name-place-faction-generator`  
**Priority:** P1  

---

## 1. Purpose

Integrate the **Name-Place-Faction Generator PWA/library** into MWG so that every generated star system receives culturally-appropriate place names, procedurally-generated factions, and a coherent naming layer that replaces or augments the current tag-weighted name pool (FRD-054). The generator is also a standalone PWA that works offline on phones, tablets, and desktops.

---

## 2. External Dependency

| Repository | Status | Local Path (when cloned) |
|---|---|---|
| `Game-in-the-Brain/name-place-faction-generator` | 🟡 Bootstrap implementation in progress | `~/opencode260220/name-place-faction-generator` |

**Blocking condition (soft):** This FRD is gated on the upstream core library / PWA producing a callable API. The bootstrap implementation is underway (see FRD-061). Both the library `dist/` artifacts and the PWA `dist-web/` bundle are now building successfully.

---

## 3. User Stories

> As a GM, I want star systems to have names that feel culturally coherent — Arabic-sounding desert worlds, Nordic ice worlds, East-Asian garden worlds — so my setting feels grounded rather than generic sci-fi.

> As a GM, I want factions to be generated automatically for every populated world, with power levels, goals, and rivalries, so I have immediate political scaffolding for adventures.

---

## 4. Requirements

### 4.1 Place Name Generation with Cultural Bias

When a world is generated, MWG calls the external generator with:

```typescript
interface NameRequest {
  type: 'star-system' | 'planet' | 'moon' | 'station' | 'outpost';
  seed: number;                    // derived from system PRNG seed
  culture: CultureBias;
  tags: string[];                  // world tags from FRD-054
  habitability?: number;
  population?: number;
}

type CultureBias =
  | 'western'        // European / North American
  | 'eastern'        // East Asian (Chinese, Japanese, Korean)
  | 'south-asian'    // Indian subcontinent, Southeast Asian
  | 'middle-eastern' // Arabic, Persian, Levantine
  | 'african'        // Sub-Saharan, North African
  | 'latin'          // Latin American, Iberian
  | 'slavic'         // Russian, Eastern European
  | 'pacific'        // Polynesian, Melanesian, Micronesian
  | 'mixed'          //殖民 melting-pot / frontier
  | 'random';        // uniform roll across all cultures
```

**Response:**

```typescript
interface NameResponse {
  primaryName: string;             // e.g. "Al-Khaliq Station"
  alternateNames: string[];        // 2–4 variants
  etymology?: string;              // brief flavour text
  culture: CultureBias;
}
```

**UI Integration:**
- New field **"Cultural Bias"** in the generation settings panel (dropdown, default `random`).
- Generated names appear in System Viewer header, Planetary System tab body rows, and DOCX export.
- User can click any name to re-roll or manually edit.

### 4.2 Faction Generation

After names are assigned, MWG requests factions for each populated body:

```typescript
interface FactionRequest {
  systemName: string;
  bodyName: string;
  population: number;
  techLevel: number;
  tags: string[];
  culture: CultureBias;
  existingFactions?: string[];     // names already used in this system
}

interface FactionResponse {
  factions: GeneratedFaction[];
}

interface GeneratedFaction {
  name: string;
  type: 'corporation' | 'political' | 'criminal' | 'religious' | 'military' | 'academic' | 'independent';
  power: number;                   // 1–10
  wealth: number;                  // 1–10
  influence: number;               // 1–10
  publicGoal: string;
  hiddenGoal: string;
  leaderName: string;
  rivalNames: string[];
  allyNames: string[];
  tags: string[];
}
```

**Scaling rules (MWG-side):**
- Pop < 1M: 1–2 factions
- Pop 1M–1B: 2–4 factions
- Pop > 1B: 3–6 factions
- TL ≤ 4: fewer corporations, more political/religious
- TL ≥ 12: more corporations, academic, AI-governance

**UI Integration:**
- New **"Factions"** tab in System Viewer (or expander in Overview).
- Faction cards show name, type badge, power/wealth/influence bars, public goal, and expandable hidden goal.
- Relationship web: simple force-directed graph or matrix showing allies/rivals.

### 4.3 Integration Architecture

**Option A — Git Submodule / npm Package / PWA (Recommended)**

```
Mneme-CE-World-Generator/
├── src/
│   └── lib/
│       └── namePlaceFactionGenerator/   ← git submodule
├── package.json
│   └── "name-place-faction-generator": "file:./src/lib/namePlaceFactionGenerator"
```

- Generator ships as an ES module with a single entry point `generate()`.
- MWG imports it directly; no network latency, works offline.

**Option B — REST API**
- MWG calls a hosted endpoint.
- Requires internet, adds latency, needs auth.
- Fallback to cached name tables if unreachable.

**Option C — Copy-Paste Source**
- Copy generator source into MWG repo (as done with 2D map renderer in early days).
- Fastest to implement, highest maintenance burden.

---

## 5. Data Model Extensions

### 5.1 `StarSystem`

```typescript
interface StarSystem {
  // ... existing fields ...

  /** Cultural bias used for naming this system */
  cultureBias?: CultureBias;

  /** Generated factions for this system */
  factions?: GeneratedFaction[];

  /** Name overrides set by user */
  nameOverrides?: Record<string, string>; // key = bodyId, value = custom name
}
```

### 5.2 `PlanetaryBody`

```typescript
interface PlanetaryBody {
  // ... existing fields ...

  /** Culturally-generated name */
  generatedName?: string;

  /** User-edited name (takes precedence over generatedName) */
  customName?: string;
}
```

---

## 6. UI Specifications

### 6.1 Generation Settings — New Section

```
┌─ Name & Culture ─────────────────┐
│                                  │
│ Cultural Bias: [Random ▼]        │
│   Western | Eastern | Middle     │
│   Eastern | African | Latin ...  │
│                                  │
│ [☑] Generate factions            │
│ [☑] Generate businesses          │
│                                  │
│ Name Seed: [______] [↻]          │
└──────────────────────────────────┘
```

### 6.2 System Viewer — Factions Tab

```
┌─ Factions ───────────────────────┐
│                                  │
│ ┌─ Al-Khaliq Trade Guild ──────┐ │
│ │ Type: Corporation   Power ████████░░ │
│ │ Wealth ██████░░░░░  Influence █████░░░░░ │
│ │ Public: Monopolise jump-drive parts    │
│ │ Hidden: [🔒 Reveal] Embezzling funds   │
│ │ Leader: Safiya Al-Rashid               │
│ │ Rivals: Independent Miners Union       │
│ └────────────────────────────────────────┘ │
│                                  │
│ [View Relationship Web]          │
└──────────────────────────────────┘
```

---

## 7. Export & Persistence

- Generated names and factions are persisted in IndexedDB inside the `StarSystem` record.
- `.mneme-batch` export includes full `factions[]` and `cultureBias`.
- DOCX export gains a **"Factions"** section and **"Named Bodies"** table.

---

## 8. QA Acceptance

### QA-NPF-01 — Cultural bias affects names
**Test:** Generate 10 systems with `cultureBias: 'middle-eastern'`. Verify >70% of names contain Arabic or Persian phonemes.

### QA-NPF-02 — Faction count scales with population
**Test:** Generate a Pop 0 world → 0 factions. Pop 1M world → 1–2 factions. Pop 5B world → 3–6 factions.

### QA-NPF-03 — Name persistence
**Test:** Generate system, edit a body name, save, reload. Custom name is preserved; generated name is still available as fallback.

### QA-NPF-04 — Offline operation (Option A)
**Test:** Disconnect network, generate system. Name and faction generation still completes without errors.

---

## 9. Open Questions

1. **Upstream API contract:** What exact function signature will `name-place-faction-generator` expose?
2. **Seed stability:** Will upstream guarantee deterministic output for the same seed across versions?
3. **Culture detection:** Should MWG auto-detect a likely culture from world tags (e.g. `arid` → Middle Eastern, `frozen` → Slavic/Nordic) or always default to `random`?

---

## 10. Related FRDs

- FRD-054 (World Tagging & Naming System) — names will be superseded or enriched by this integration
- FRD-057 (Adventure & Faction Generator) — factions generated here feed into adventure templates
- FRD-064 (Procedural Business Generation) — businesses are children of factions
