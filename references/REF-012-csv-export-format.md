# REF-012: CSV Export Format

**Reference for:** 260409-v02 Mneme-CE-World-Generator-FRD.md — Section 11  
**Last Updated:** 2026-04-09  
**Status:** Spec — pending implementation (see QA-ADD-002)

---

## Format Summary

One complete star system = **one wide row**. Standard fields for the star and main world are followed by open-ended prefixed column blocks for companion stars and planetary bodies.

**Format type:** Wide (Denormalized) row  
**Delimiter:** Comma (`,`)  
**Encoding:** UTF-8  
**Line endings:** CRLF

---

## System Key Format

```
YYMMDD-HHMMSS-[CLASS][GRADE]-[3-char-random]
```

**Example:** `260409-143022-G2-XKR`

- `YYMMDD-HHMMSS` — timestamp of generation (local time, 24-hour)
- `[CLASS][GRADE]` — primary star class and grade (e.g. `G2`, `M5`, `K0`)
- `[3-char-random]` — 3 uppercase alphanumeric characters (collision avoidance)

### Sub-element Keys

Sub-elements use the system key as a prefix:

| Element | Key Format | Example |
|---------|-----------|---------|
| Main world | `[system_key]-MW` | `260409-143022-G2-XKR-MW` |
| Companion star 1 | `[system_key]-S1` | `260409-143022-G2-XKR-S1` |
| Companion star 2 | `[system_key]-S2` | `260409-143022-G2-XKR-S2` |
| Planet 1 | `[system_key]-P01` | `260409-143022-G2-XKR-P01` |
| Planet 2 | `[system_key]-P02` | `260409-143022-G2-XKR-P02` |
| Disk 1 | `[system_key]-D01` | `260409-143022-G2-XKR-D01` |
| Moon of P01 | `[system_key]-P01-M01` | *(future — not in current scope)* |

Bodies are numbered by distance (innermost first). Disks share the P-series with planets but use a `D` prefix.

---

## CSV Column Specification

### System Fields

| Column | Type | Description |
|--------|------|-------------|
| `key` | string | System key (see above) |
| `generated_at` | ISO 8601 | Full timestamp |
| `star_class` | string | Primary star class (O/B/A/F/G/K/M) |
| `star_grade` | integer | Primary star grade (0–9) |
| `star_mass` | float | Primary star mass in M☉ |
| `star_luminosity` | float | Primary star luminosity in L☉ |
| `zone_infernal_max_au` | float | Inner edge of Hot zone |
| `zone_hot_max_au` | float | Inner edge of Conservative zone |
| `zone_cons_hab_max_au` | float | Inner edge of Cold zone |
| `zone_opt_hab_max_au` | float | Inner edge of Outer zone |

### Main World Fields

| Column | Type | Description |
|--------|------|-------------|
| `mw_key` | string | Main world key |
| `mw_type` | string | Habitat / Dwarf / Terrestrial |
| `mw_size_km` | integer | Diameter in km |
| `mw_gravity_g` | float | Surface gravity in g |
| `mw_atmosphere` | string | Atmosphere type |
| `mw_temperature` | string | Temperature type |
| `mw_hazard` | string | Hazard type |
| `mw_hazard_intensity` | string | Hazard intensity |
| `mw_habitability` | float | Total habitability score |
| `mw_zone` | string | Zone (Infernal/Hot/Conservative/Cold/Outer) |
| `mw_au` | float | Orbital distance in AU |
| `mw_tl` | integer | Tech Level |
| `mw_population` | integer | Population count |
| `mw_wealth` | string | Wealth level |
| `mw_power_structure` | string | Power structure |
| `mw_development` | string | Development level |
| `mw_source_of_power` | string | Source of power |
| `mw_starport` | string | Starport class (X/E/D/C/B/A) |
| `mw_travel_zone` | string | Travel zone (Green/Amber/Red) |
| `mw_radius_km` | integer | Derived radius in km |
| `mw_diameter_km` | integer | Derived diameter in km |
| `mw_surface_g` | float | Surface gravity in g |
| `mw_escape_velocity_ms` | integer | Escape velocity in m/s |

### Companion Star Block (repeated per companion: S1_, S2_, S3_)

| Column | Type | Description |
|--------|------|-------------|
| `s1_key` | string | Companion key |
| `s1_class` | string | Star class |
| `s1_grade` | integer | Star grade |
| `s1_mass` | float | Mass in M☉ |
| `s1_luminosity` | float | Luminosity in L☉ |
| `s1_orbit_au` | float | Orbital distance from primary in AU |

### Planetary Body Block (repeated per body: P01_, P02_, etc.)

Bodies are numbered innermost-first. Disks prefixed with `D`.

| Column | Type | Description |
|--------|------|-------------|
| `p01_key` | string | Body key |
| `p01_type` | string | disk / dwarf / terrestrial / ice / gas |
| `p01_mass_em` | float | Mass in Earth Masses |
| `p01_zone` | string | Zone |
| `p01_au` | float | Orbital distance in AU |
| `p01_gas_class` | string | Gas class (I–V) or blank |
| `p01_lesser_earth_type` | string | Carbonaceous/Silicaceous/Metallic/Other or blank |
| `p01_radius_km` | integer | Derived radius in km |
| `p01_diameter_km` | integer | Derived diameter in km |
| `p01_density_gcm3` | float | Density in g/cm³ |
| `p01_surface_g` | float | Surface gravity in g |
| `p01_escape_velocity_ms` | integer | Escape velocity in m/s |

---

## Parser Notes

- Column count varies per row (ragged rows) — parsers must handle this
- Empty cells appear as `` (two consecutive commas) for missing optional fields
- All float values use `.` as the decimal separator (English locale)
- Population is an integer, not formatted with commas
- Boolean fields (naval base, scout base) use `true` / `false`

---

## Implementation

Target file: `src/data/exportCSV.ts`  
Target function: `exportToCSV(system: StarSystem): string`

The current stub in `src/lib/db.ts` should be replaced by a full implementation using this spec.

---

## See Also

- [QA-ADD-002](../QA.md#qa-add-002) — This format specification issue
- FRD Section 11.4 — CSV Export summary
- [REF-010-planet-densities.md](./REF-010-planet-densities.md) — Physical property formulas (for column derivation)
