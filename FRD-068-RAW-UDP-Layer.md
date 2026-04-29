# FRD-068: RAW UDP Layer — CE RAW Mode Toggle

## Status
**Draft — Awaiting Approval**

## Overview

Add a **RAW UDP** (Universal World Profile) toggle to the Mneme World Generator. When enabled, the generator hides Mneme-specific economic assumptions and presents the Main World in classic **Cepheus Engine / Traveller RAW format**.

This is a **presentation/export layer** — it does not alter the underlying generation algorithm. Instead, it:
1. Hides economic assumptions (preset labels, GDP, trade volumes, PSS, weekly activity).
2. Maps Mneme's rich physical and social stats to their closest CE RAW equivalents.
3. Rolls a classic CE Government code (0–F) to replace Mneme's Power Structure + Source of Power + Governance DM triad.
4. Derives classic CE Trade Codes from the mapped stats.
5. Outputs the world in standard UWP string format for compatibility with CE tools and referees.

---

## 1. CE RAW UWP Reference

Standard Cepheus Engine UWP format (from CE_SRD_Chapte-12-Worlds.pdf):

```
Starport Size Atmosphere Hydrographics Population Government Law-Level Tech-Level
```

| Code | Range | Meaning |
|------|-------|---------|
| **Starport** | A, B, C, D, E, X | Already in Mneme — direct pass-through |
| **Size** | 0–F (hex) | 0 = 800km, A = 16,000km diameter |
| **Atmosphere** | 0–F (hex) | 0 = None, 1 = Trace, 5 = Thin, 6 = Standard, 8 = Dense, A+ = exotic |
| **Hydrographics** | 0–A (hex) | % of surface water / 10 |
| **Population** | 0–C (hex) | Exponent of 10 (0 = 0, 1 = 10, 6 = 10⁶, A = 10¹⁰) |
| **Government** | 0–F (hex) | 0 = None, 1 = Company, 6 = Captive, 7 = Balkanization, A = Charismatic Dictator, F = Totalitarian |
| **Law Level** | 0–J (hex) | 0 = No restrictions, J = Extreme oppression |
| **Tech Level** | 0–F (hex) | CE TL (0–F) |

**Extended codes:**
- **Bases:** Naval (N), Scout (S), Pirate (P), Military (M), Way Station (W)
- **Trade Codes:** Ag, Na, In, Ri, Po, De, Hi, Lo, etc.
- **Travel Zone:** Green, Amber, Red
- **Belt** / **Gas** presence flags

---

## 2. Proposed Architecture

### 2.1 New Module: `src/lib/rawUdp.ts`

A pure converter module. Zero UI, zero side effects. Takes a `StarSystem` and returns a `RawUdpProfile`.

```typescript
// src/types/index.ts — additions

export interface RawUdpProfile {
  uwp: string;                    // e.g. "A-786976-9"
  starport: StarportClass;        // A–X (direct from system)
  size: number;                   // 0–F
  atmosphere: number;             // 0–F
  hydrographics: number;          // 0–A
  population: number;             // 0–C (UWP pop code)
  government: number;             // 0–F (rolled from Mneme stats)
  lawLevel: number;               // 0–J (derived from governance + hazard)
  techLevel: number;              // CE TL (from TL_TABLE mapping)
  
  // Extended
  bases: string[];                // ['N', 'S'] etc.
  tradeCodes: string[];           // ['Ag', 'Hi', 'In'] etc.
  travelZone: TravelZone;         // Green/Amber/Red
  hasBelt: boolean;
  hasGas: boolean;
  
  // Mneme original values (for tooltip/debug)
  mnemeSource: {
    sizeKm: number;
    atmosphereType: AtmosphereType;
    populationExact: number;
    techLevelMneme: number;
    techLevelCe: number;
    governmentRoll: number;
  };
}
```

### 2.2 Mapping Functions (in `rawUdp.ts`)

#### Size → UWP Size Code
```typescript
function mapSizeToUwp(sizeKm: number): number {
  // CE Size = diameter in thousands of km, encoded 0-F
  // 0 = 800km (asteroid), 1 = 1600km, 2 = 3200km, ... 10(A) = 16000km
  const thousands = sizeKm / 1000;
  if (thousands < 1.2) return 0;   // S = asteroid/small body
  if (thousands < 2.4) return 1;
  if (thousands < 4.0) return 2;
  if (thousands < 5.6) return 3;
  if (thousands < 7.2) return 4;
  if (thousands < 8.8) return 5;
  if (thousands < 10.4) return 6;
  if (thousands < 12.0) return 7;
  if (thousands < 13.6) return 8;
  if (thousands < 15.2) return 9;
  return Math.min(15, Math.floor(thousands / 1.6)); // A-F for larger
}
```

#### Atmosphere → UWP Atmosphere Code
```typescript
function mapAtmosphereToUwp(atmo: AtmosphereType): number {
  switch (atmo) {
    case 'Trace':     return 1;   // Trace
    case 'Thin':      return 3;   // Very thin (tainted) or 4 very thin — map to 3
    case 'Average':   return 6;   // Standard
    case 'Dense':     return 8;   // Dense
    case 'Crushing':  return 11;  // Corrosive / exotic (A = 10, B = 11)
    default:          return 0;   // None / vacuum
  }
}
```
*Note: Mneme's atmosphere system is coarser than CE's. We pick the closest match. A tooltip should show the original Mneme value.*

#### Hydrographics → UWP Hydro Code
```typescript
function mapHydrographicsToUwp(
  atmo: AtmosphereType,
  temp: TemperatureType,
  zone: Zone
): number {
  // CE hydro = % surface water / 10.
  // Mneme doesn't track % water directly; we derive from zone + temperature + atmosphere.
  
  if (atmo === 'Trace' || atmo === 'None') return 0;  // No atmosphere = no liquid surface
  
  // Zone-based baseline
  let base: number;
  switch (zone) {
    case 'Infernal':     base = 0; break;
    case 'Hot':          base = 2; break;
    case 'Conservative': base = 6; break;  // Habitable zone = likely water
    case 'Cold':         base = 4; break;  // Ice, not liquid
    case 'Outer':        base = 1; break;  // Frozen volatiles
    default:             base = 0;
  }
  
  // Temperature adjustment
  if (temp === 'Inferno') base = Math.max(0, base - 4);      // Boiled away
  if (temp === 'Hot')      base = Math.max(0, base - 2);
  if (temp === 'Freezing') base = Math.max(0, base - 1);     // Locked as ice
  if (temp === 'Cold')     base = Math.max(0, base - 2);
  
  // Atmosphere adjustment
  if (atmo === 'Thin')      base = Math.max(0, base - 1);    // Less retention
  if (atmo === 'Dense')     base = Math.min(10, base + 1);   // More greenhouse, more liquid
  if (atmo === 'Crushing')  base = Math.min(10, base + 2);   // Super-dense, likely wet
  
  return Math.min(10, Math.max(0, base));
}
```

#### Population → UWP Population Code
```typescript
function mapPopulationToUwp(pop: number): number {
  if (pop <= 0) return 0;
  const exponent = Math.floor(Math.log10(pop));
  return Math.min(12, Math.max(1, exponent));  // Cap at C (12)
}
```

#### Government → UWP Government Code (NEW ROLL)
This is the only place where RAW UDP introduces **new randomness**. Mneme's government model (Power Structure + Source of Power + Governance DM) is too rich for CE. We roll a classic 2D6 government code.

```typescript
function rollGovernmentFromMneme(
  powerStructure: PowerStructure,
  sourceOfPower: PowerSource,
  governance: number,
  devLevel: DevelopmentLevel
): number {
  // Base roll: 2D6
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  
  // Mneme-derived DM (±1 max to preserve some Mneme flavour)
  let dm = 0;
  if (powerStructure === 'Anarchy') dm -= 1;
  if (powerStructure === 'Unitary State') dm += 1;
  if (sourceOfPower === 'Kratocracy') dm -= 1;
  if (sourceOfPower === 'Democracy') dm += 1;
  if (governance < -5) dm -= 1;
  if (governance > 5) dm += 1;
  if (devLevel === 'UnderDeveloped') dm -= 1;
  if (devLevel === 'Very Developed') dm += 1;
  
  const result = Math.max(2, Math.min(12, roll + dm));
  
  // CE Government table (2D6 result → 0-F hex)
  const govMap: Record<number, number> = {
    2: 0,   // None
    3: 1,   // Company/Corporation
    4: 2,   // Participating Democracy
    5: 3,   // Self-Perpetuating Oligarchy
    6: 4,   // Representative Democracy
    7: 5,   // Feudal Technocracy
    8: 6,   // Captive Government
    9: 7,   // Balkanization
    10: 8,  // Civil Service Bureaucracy
    11: 9,  // Impersonal Bureaucracy
    12: 10, // Charismatic Dictator (A)
  };
  
  // For very high/low results with DM, cap at A (10) or extend to B-F
  if (result > 12) return Math.min(15, 10 + (result - 12)); // A-F
  return govMap[result] ?? 0;
}
```

*The Mneme government details are hidden in RAW mode but preserved in the system data. A tooltip or debug view can still show them.*

#### Law Level → UWP Law Code
```typescript
function mapLawLevelToUwp(
  governance: number,
  hazard: HazardType,
  hazardIntensity: HazardIntensityType,
  government: number
): number {
  // Base from governance magnitude
  let law = Math.floor(Math.abs(governance) / 2);
  
  // Hazard-based restrictions
  if (hazard === 'Radioactive') law += 2;
  if (hazard === 'Biohazard' && hazardIntensity === 'High') law += 2;
  if (hazard === 'Toxic') law += 1;
  if (hazard === 'Corrosive') law += 1;
  
  // Government type adjustment
  if (government === 0) law = 0;           // Anarchy
  if (government === 15) law = Math.min(18, law + 4); // Totalitarian
  
  return Math.min(18, Math.max(0, law));   // 0–J (18)
}
```

#### Tech Level → CE TL
```typescript
function mapTechLevelToCe(mnemeTL: number): number {
  // Use existing TL_TABLE.ceTL, round to nearest integer
  const entry = TL_TABLE[mnemeTL];
  if (entry) return Math.round(entry.ceTL);
  
  // Fallback for edge cases
  if (mnemeTL < 9) return 7;
  return Math.min(15, 7 + Math.floor((mnemeTL - 9) / 2));
}
```

#### Trade Codes Derivation
```typescript
function deriveTradeCodes(
  size: number,
  atmo: number,
  hydro: number,
  pop: number,
  gov: number,
  law: number,
  tl: number
): string[] {
  const codes: string[] = [];
  
  if (atmo >= 4 && atmo <= 9 && hydro >= 4 && hydro <= 8 && pop >= 5 && pop <= 7)
    codes.push('Ag');    // Agricultural
  if (atmo <= 3 && hydro <= 3 && pop >= 6)
    codes.push('Na');    // Non-Agricultural
  if (pop >= 9 && gov >= 0 && gov <= 6)
    codes.push('Hi');    // High Population
  if (pop <= 3)
    codes.push('Lo');    // Low Population
  if (atmo >= 0 && atmo <= 1 && hydro >= 1)
    codes.push('Po');    // Poor
  if (atmo >= 2 && atmo <= 5 && hydro <= 3)
    codes.push('De');    // Desert
  if (atmo >= 6 && atmo <= 8 && pop >= 6 && pop <= 8 && gov >= 4 && gov <= 9)
    codes.push('Ri');    // Rich
  if (tl >= 12)
    codes.push('Ht');    // High Tech
  if (tl <= 5)
    codes.push('Lt');    // Low Tech
  if (atmo === 0 || atmo === 1)
    codes.push('Va');    // Vacuum
  if (size === 0)
    codes.push('As');    // Asteroid
  if (hydro === 10)
    codes.push('Wa');    // Water World
  if (atmo >= 10 && hydro >= 1)
    codes.push('Fl');    // Fluid Hydrographics (exotic)
  if (atmo >= 2 && atmo <= 5 && hydro <= 3 && pop >= 6)
    codes.push('Na');    // Non-agricultural
  if (size >= 10 && atmo >= 1)
    codes.push('La');    // Large
  if (pop === 0)
    codes.push('Ba');    // Barren
  if (pop === 0 && gov === 0 && law === 0)
    codes.push('Di');    // Dieback (optional)
  if (tl >= 8 && atmo >= 0 && atmo <= 9 && hydro >= 0 && hydro <= 9)
    codes.push('In');    // Industrial (loose criteria)
  
  return codes;
}
```

---

## 3. UI Integration Plan

### 3.1 Toggle Location

Add the RAW UDP toggle in **two places**:

1. **Generator Dashboard** (`GeneratorDashboard.tsx`) — next to the Economic Preset selector. This sets the default for newly generated systems.
2. **System Viewer** (`SystemViewer.tsx` header) — per-system override. Allows viewing a generated world in either Mneme or RAW mode without regenerating.

### 3.2 State Management

```typescript
// GeneratorOptions (types/index.ts)
export interface GeneratorOptions {
  // ... existing fields ...
  /** FRD-068: RAW UDP mode — display worlds in CE UWP format */
  rawUdpMode?: boolean;
}

// StarSystem (types/index.ts) — optional cached profile
export interface StarSystem {
  // ... existing fields ...
  /** FRD-068: cached RAW UDP profile (computed on demand) */
  rawUdpProfile?: RawUdpProfile;
}
```

**Persistence:**
- `rawUdpMode` stored in `localStorage` via `optionsStorage.ts` (same pattern as `v2Positioning`, `allowMegaStructures`).
- Per-system override stored in component state (not persisted to StarSystem to avoid bloat).

### 3.3 SystemViewer Changes

When `rawUdpMode` is active:

**Overview Tab:**
- Replace "Economic Assumptions" badge with "RAW UDP Mode" badge.
- Hide GDP, trade volume, PSS, weekly activity.
- Show UWP string prominently: `A-786976-9`
- Show Trade Codes as tags.
- Keep Starport class (direct pass-through).

**World Tab:**
- Replace Mneme stats with UWP codes.
- Show Size (hex), Atmosphere (hex), Hydrographics (hex).
- Add tooltip/hover showing original Mneme value (e.g., "Size 5 — original: 7,200 km diameter").

**Inhabitants Tab:**
- Hide: Wealth, Development, Power Structure, Source of Power, Governance DM, Culture Traits.
- Show: Population (hex), Government (hex), Law Level (hex), Tech Level (CE).
- Keep: Starport, Bases, Travel Zone.
- Add a subtle "CE Government" card showing the rolled code with a reroll button (since this is the only new random element).

**Export (DOCX, JSON, CSV):**
- `exportDocx.ts`: Add a "CE RAW Profile" section when `rawUdpMode` is active.
- JSON export: Include `rawUdpProfile` object.
- CSV export: Add UWP column.

### 3.4 Visual Design

When RAW UDP is active:
- Use a distinct accent colour (e.g., amber/gold instead of red) for the UWP string to signal "classic mode".
- Add a small "CE" badge next to the UWP.
- Mneme-only fields fade out (opacity 0.4) rather than disappearing entirely, so users can still see them if needed.

---

## 4. Generator Dashboard Toggle

Add a checkbox in the Generation Options card:

```tsx
<div className="flex items-center gap-2 mt-4">
  <input
    type="checkbox"
    id="raw-udp-toggle"
    checked={rawUdpMode}
    onChange={e => setRawUdpMode(e.target.checked)}
    className="rounded"
  />
  <label htmlFor="raw-udp-toggle" className="text-sm font-medium">
    RAW UDP Mode
  </label>
  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
    Display worlds in classic Cepheus Engine UWP format
  </span>
</div>
```

---

## 5. Files to Touch

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `RawUdpProfile` interface; add `rawUdpMode` to `GeneratorOptions` and `rawUdpProfile` to `StarSystem` |
| `src/lib/rawUdp.ts` | **New file** — all mapping/conversion functions |
| `src/lib/optionsStorage.ts` | Persist `rawUdpMode` in localStorage |
| `src/lib/exportDocx.ts` | Add RAW UDP section to DOCX export |
| `src/components/GeneratorDashboard.tsx` | Add RAW UDP toggle to generation options |
| `src/components/SystemViewer.tsx` | Conditional rendering: RAW UDP vs Mneme mode |
| `src/components/Settings.tsx` | Add global default toggle for RAW UDP |

---

## 6. Edge Cases & Decisions

| Issue | Decision |
|-------|----------|
| **Mneme TL 7–8** (pre-interstellar) | Map to CE TL 7. These are pre-jump societies. |
| **Habitat worlds** (artificial structures) | Size = 0 (As — Asteroid) if < 1000km, otherwise map by actual diameter. Atmosphere = roll-based or 6 (standard artificial). |
| **Unpopulated worlds** | Pop = 0, Gov = 0, Law = 0, TL = 0. Starport = X. Trade code = Ba (Barren). |
| **Government reroll** | Provide a "Reroll Gov" button in RAW mode. Store the rolled value in `StarSystem.rawUdpProfile` so it's stable across views. |
| **Belt / Gas flags** | `hasBelt` = true if `circumstellarDisks.length > 0` or any dwarf planets exist. `hasGas` = true if `gasWorlds.length > 0`. |
| **Bases** | Direct pass-through from existing `starport.hasNavalBase / hasScoutBase / hasPirateBase`. |
| **Travel Zone** | Direct pass-through. |

---

## 7. Testing Checklist

- [ ] Toggle on/off switches display without regeneration.
- [ ] UWP string format is valid (Starport-Size-Atmo-Hydro-Pop-Gov-Law-TL).
- [ ] All hex codes are in valid ranges.
- [ ] Economic assumptions are hidden in RAW mode.
- [ ] Mneme government details are hidden; CE government is rolled and stable.
- [ ] Trade codes make sense for the mapped stats.
- [ ] DOCX export includes RAW UDP section.
- [ ] JSON export includes `rawUdpProfile`.
- [ ] CSV export includes UWP column.
- [ ] Unpopulated worlds produce `X-000000-0` or `Ba` appropriately.
- [ ] Hydrographics derivation produces reasonable values across all zones.

---

## 8. Future Extensions (Out of Scope for v1)

- **Pirate/Privateer base codes** (expand beyond N/S/P).
- **Trade code refinements** (add `Cp`, `Cs`, `Cy`, `Pz`, `Da`, `Fo`, `Hx`, `Re`, `Rs`, `Tu` from CE SRD).
- **Subsector-compliant UWP export** (full sector format with hex coordinates).
- **Import from CE UWP** (reverse: take a UWP string and generate a Mneme world from it).

---

*Document Status: v0.1 Draft — 2026-04-27*
