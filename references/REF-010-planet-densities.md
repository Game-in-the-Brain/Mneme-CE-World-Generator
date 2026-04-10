# REF-010: Planet Type Densities

**Reference for:** 260409-v02 Mneme-CE-World-Generator-FRD.md — Sections 6.3, 9.1  
**Last Updated:** 2026-04-09  
**Status:** Active — used by `src/lib/physicalProperties.ts`

---

## Purpose

Density values are required to derive the following physical properties for each planetary body:
- Volume
- Radius
- Diameter
- Surface Gravity (in g, Earth = 1.0)
- Escape Velocity (ΔV in m/s)

These are derived from mass (in Earth Masses) and a density drawn from the range for the body type.

---

## Density Table

| Body Type | Typical Density (g/cm³) | Range | Notes |
|-----------|------------------------|-------|-------|
| Circumstellar Disk | 0.5–1.0 | Very diffuse | Not meaningful as a solid sphere; physical props not calculated for disks |
| Dwarf Planet (Carbonaceous) | 1.5–2.5 | 1.5–2.5 | Volatile-rich, icy, carbonaceous |
| Dwarf Planet (Silicaceous) | 3.0–4.5 | 2.5–4.5 | Rocky/silicate |
| Dwarf Planet (Metallic) | 6.0–8.0 | 5.5–8.5 | Iron/nickel-rich |
| Dwarf Planet (Other/Mixed) | 1.5–3.5 | 1.5–3.5 | Variable |
| Dwarf Planet (unified range) | 1.5–3.5 | — | Used when type is `dwarf` without sub-type |
| Terrestrial (< 1 EM) | 4.0–5.5 | — | Earth-like rocky |
| Terrestrial (1–7 EM, Super Earth) | 5.0–6.5 | — | Compressed silicate/iron core |
| Terrestrial (unified range) | 4.0–6.5 | — | Used for all `terrestrial` bodies |
| Ice World | 1.0–2.0 | — | Water/ice/rock mix |
| Gas World Class I–II | 0.5–1.3 | — | Cold gas giants (H₂/He-dominated) |
| Gas World Class III–V | 0.3–1.0 | — | Hot gas giants (lower density at high temperature) |
| Gas World (unified range) | 0.3–1.3 | — | Used for all `gas` bodies |

---

## Formulas

All calculations use SI units internally; results are converted for display.

```
// Constants
G       = 6.674 × 10⁻¹¹  m³ kg⁻¹ s⁻²   (gravitational constant)
EM_TO_KG = 5.972 × 10²⁴  kg             (1 Earth Mass)
g_Earth  = 9.81           m/s²           (for surface gravity conversion)

// Step 1 — Convert mass to kg
mass_kg = massEM × EM_TO_KG

// Step 2 — Convert density to kg/m³
density_kg_m3 = density_g_cm3 × 1000

// Step 3 — Volume
Volume (m³) = mass_kg / density_kg_m3

// Step 4 — Radius
Radius (m) = ∛( 3 × Volume / (4 × π) )

// Step 5 — Diameter
Diameter (m) = 2 × Radius

// Step 6 — Surface Gravity
Surface Gravity (m/s²) = G × mass_kg / Radius²
Surface Gravity (g)    = Surface Gravity (m/s²) / 9.81

// Step 7 — Escape Velocity (ΔV to escape surface)
Escape Velocity (m/s) = √( 2 × G × mass_kg / Radius )
```

---

## Implementation

Source: `src/lib/physicalProperties.ts`  
Function: `calculatePhysicalProperties(massEM: number, bodyType: BodyType): PhysicalProperties`

The density value is drawn randomly from within the body type's range on each generation call. This simulates the natural variation within a body class.

Disks are excluded from physical property calculation (they are extended flat structures, not spherical bodies).

---

## See Also

- [QA-009](../QA.md#qa-009) — Body stats missing from display
- [QA-ADD-001](../QA.md#qa-add-001) — This reference document
- FRD Section 9.1 — `PlanetaryBody` interface
