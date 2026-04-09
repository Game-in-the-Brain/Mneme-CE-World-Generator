# REF-010: Travel Zone

**Reference Document for:** [260409-v02 Mneme-CE-World-Generator-FRD.md](../260409-v02%20Mneme-CE-World-Generator-FRD.md)  
**Section:** 7.9 Travel Zone  
**Last Updated:** 2026-04-09

---

### 7.9 Travel Zone

| Function | Inputs | Output |
|----------|--------|--------|
| `determineTravelZone(hazard, hazardIntensity, development, sourceOfPower, stabilityMode)` | Hazard, Intensity, Development, Source of Power, Stability toggle | Zone (`Green` / `Amber` / `Red`) + Reason |

---

#### Amber Zone

Amber worlds are dangerous or undergoing upheaval. Travelers are warned to be on guard.

**Automatic Amber Zone** — triggered if either condition is true:
- Hazard = **Radioactive** (any intensity)
- Hazard = **Biohazard** AND Intensity ≥ **High**

**Random Amber Zone** — if no automatic trigger, roll 2D6. On a result of **2**, the world is an Amber Zone. Roll on the Amber Zone Reason Table for the cause.

---

#### Red Zone

A Red Zone world is one where the combination of **inequality** and the **need for violence to create change** makes it actively dangerous to outsiders. It is procedurally generated but the likelihood is shaped by the world's political situation.

**Core principle:** High inequality (low development, extractive power structures) + violent political systems = Red Zone risk.

---

##### Step 1 — Roll the Red Zone Target Number (TN)

Roll **2D6 with the Stability Mode modifier** (user-configurable) and take the **highest single die result** as the TN.

> Taking the highest die (not the sum) weights the result toward higher values — a prosperous, stable world has a high TN that is hard to beat, making Red Zones rare. A collapsing empire has a low TN, making them common.

| Stability Mode | Roll | Notes |
|----------------|------|-------|
| **Very Stable / Prosperous** | 2D6 Adv+2 (4D6 keep highest 1) | Red Zones very rare |
| **Normal** (default) | 2D6 Adv+1 (3D6 keep highest 1) | Balanced |
| **Troubled** | 2D6 (keep highest 1 of 2) | Elevated risk |
| **Imperial Collapse / Terrible Times** | 2D6 Dis+1 (3D6 keep lowest 1) | Red Zones common |

This is a **user-configurable toggle** in the UI. Default is **Normal (Adv+1)**.

---

##### Step 2 — Roll the Red Zone Check

Roll **2D6** and apply the **Source of Power modifier**:

| Source of Power | Modifier |
|-----------------|----------|
| Aristocracy | −2 |
| Kratocracy | −2 |
| Ideocracy | −1 |
| Federation | +0 |
| Confederation | +0 |
| Democracy | +0 |
| Meritocracy | +0 |
| Anarchy | −1 |

> Aristocracy and Kratocracy represent power maintained by force or birth — high inequality, low legitimacy. Ideocracy applies ideological pressure that suppresses dissent. These reduce the check roll, making Red Zone more likely.

---

##### Step 3 — Determine Result

- If **modified check roll ≥ TN** → **Green Zone** (no Red Zone)
- If **modified check roll < TN** → **Red Zone**

> The Development level is reflected in the TN itself (higher development → higher Stability Mode choice by the referee/user). Source of Power directly modifies the check roll.

---

##### Red Zone Override

Regardless of the roll, the **referee (end user) can always manually toggle** Red Zone on or off. The procedural roll is the default, but it is not binding.

---

#### UI Implementation Notes

```typescript
type StabilityMode = "very_stable" | "normal" | "troubled" | "collapse";
type SourceOfPower = "Aristocracy" | "Kratocracy" | "Ideocracy" | "Federation" |
                     "Confederation" | "Democracy" | "Meritocracy" | "Anarchy";

interface TravelZoneResult {
  zone: "Green" | "Amber" | "Red";
  isAutomatic: boolean;       // true if Amber was auto-triggered by hazard
  redZoneTN?: number;         // the target number rolled
  redZoneCheck?: number;      // the modified check roll
  reason?: string;            // from Amber Zone Reason table if Amber
  manualOverride: boolean;    // true if referee toggled manually
}

function determineTravelZone(
  hazard: HazardType,
  hazardIntensity: HazardIntensity,
  sourceOfPower: SourceOfPower,
  stabilityMode: StabilityMode = "normal",
  manualOverride?: "Green" | "Amber" | "Red"
): TravelZoneResult
```

---

#### Amber Zone Reason Table (2D6)

| 2D6 | Reason |
|-----|--------|
| 2 | War |
| 3 | Small War |
| 4 | Major Insurgency and Terrorism |
| 5 | Heightened Security |
| 6 | Political Purging |
| 7 | Economic Crisis |
| 8 | Major Political Issue |
| 9 | Environmental Disaster |
| 10 | Major Social Issue |
| 11 | Engineering Disaster |
| 12 | Major Economic Collapse |

---

> **Footnote — Correction from v1.2:** Previous versions documented Red Zone as "manual override only." This was a placeholder. The correct mechanic is procedurally generated using Development-based Stability Mode (user-configurable TN via highest-die-of-2D6) and Source of Power modifier on the check roll. Manual override remains available. The core design principle is: *inequality + need for violence to create change = Red Zone*.

---

#### Document History Entry

| Version | Date | Change |
|---------|------|--------|
| 1.3 | 2026-04-09 | Section 7.9 rewritten — Red Zone now procedurally generated using Stability Mode TN + Source of Power modifier. Amber Zone automatic triggers clarified. Manual override retained. Footnote added correcting v1.2 Red Zone placeholder. |
