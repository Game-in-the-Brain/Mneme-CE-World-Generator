<div align="right">
  <a href="https://github.com/Game-in-the-Brain">
    <img src="./gitb_gi7b_logo_512.png" alt="Game in the Brain" width="72"/>
  </a>
</div>

<div align="center">

# 🌌 Mneme CE World Generator

**A Progressive Web App for generating complete star systems and worlds for the Cepheus Engine RPG**

[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-4caf50?style=flat-square&logo=pwa)](https://github.com/Game-in-the-Brain)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-e53935?style=flat-square)](LICENSE)

[**▶ Launch App**](https://github.com/Game-in-the-Brain) · [**📖 Book on DriveThruRPG**](https://www.drivethrurpg.com/en/product/403824/MNEME-World-Generator) · [**🎬 Video Tutorial**](https://youtu.be/661aEOMOwKM)

</div>

---

## What Is This?

The **Mneme CE World Generator** replaces the original Google Sheets world generator with a fully offline-capable web app that works on your phone, tablet, and desktop — no Google account required, no macros to approve, no spreadsheet to copy.

It is a digital companion to the [**Mneme World Generator book**](https://www.drivethrurpg.com/en/product/403824/MNEME-World-Generator) by Game in the Brain, which provides scientifically grounded rules for building detailed star systems for the Cepheus Engine RPG and compatible games. One tap generates an entire solar system — complete with stars, a habitable world, its inhabitants, and a full planetary system — all saved locally on your device.

> **Built for:** Referees, worldbuilders, game designers, and sci-fi writers who want plausible, detailed star systems fast.

---

## Why This Exists

The original tool was a Google Sheets spreadsheet with a Google Apps Script macro. It worked, but it had friction:

| Original Spreadsheet | This App |
|----------------------|----------|
| Requires a Google account | Works in any browser, no account needed |
| Must copy the sheet before use | Just open and generate |
| Macro approval prompt on every copy | No scripts to approve |
| Desktop-only comfortable | Designed for phone and desktop equally |
| No offline use | Fully offline after first load |
| Data lives in Google Drive | Data lives on your device |
| Export is manual copy-paste | One-click JSON and CSV export |

---

## Features

### ⭐ Star Generation

Generate your primary star using the Harvard spectral classification system — **OBAFGKM** — from blazing blue O-type giants to cool red M-type dwarfs. Each star is defined by its class and grade (0–9), which determines its mass, luminosity, and the size of its orbital zones.

- **Primary star** — class, grade, solar mass, luminosity
- **Up to 3 companion stars** — generated using a chain rule that prevents companions from being more massive than the star they orbit. No loops, no retries — a fractional scaling algorithm constrains each result in a single pass
- **Stellar zones** — Infernal, Hot, Conservative Habitable, Optimistic Habitable, and Outer Solar System, each calculated from the star's luminosity using the formula `√L☉ × zone multiplier`
- **Companion orbits** — 3D6 orbital distance table per stellar class, with cascading ×10 multiplier on a roll of 18

---

### 🌍 Main World Generation

Your solar system's main inhabited (or habitable) world, generated from its physical properties up.

#### World Type & Size
- **Habitat** — artificial megastructure habitats, sized in MegaVessel Tons (MVT) and GigaVessel Tons (GVT)
- **Dwarf World** — smaller bodies measured in Lunar Masses (LM), classified as Carbonaceous, Silicaceous, Metallic, or Other
- **Terrestrial World** — rocky planets from 0.1 to 7 Earth Masses (EM)

The roll is modified by stellar class: F-class stars favour larger worlds (Adv+2), G-class get a slight advantage (Adv+1), and other classes roll straight 2D6.

#### Physical Properties
Each world is calculated for:
- **Surface gravity** (in G) — derived from mass and radius
- **Radius and diameter** (in km) — calculated from mass and body-type density
- **Escape velocity / ΔV** (in m/s) — the delta-v needed to leave the surface

#### Atmosphere
Five types: **Crushing**, **Dense**, **Trace**, **Thin**, and **Average** — each with a tech level required to survive and a habitability modifier.

#### Temperature
Five ranges — **Inferno**, **Hot**, **Freezing**, **Cold**, and **Average** — modified by atmospheric density. Dense atmospheres trap heat; thin and trace atmospheres lose it.

#### Hazards
The world may have environmental hazards that reduce habitability and require technology to survive:
- Radioactive surface
- Toxic atmosphere
- Biohazard (contagious organisms)
- Corrosive atmosphere
- Polluted environment
- None

Each hazard also has an **intensity** (Very Mild → Intense) that further affects the habitability score.

#### Biochemical Resources
How abundant organic chemistry is on the world — from **Scarce** to **Inexhaustible** — affects wealth generation and population potential.

#### Habitability Score
A single numeric score combining gravity, atmosphere, temperature, hazard, intensity, biochemical resources, and tech level. Used to calculate maximum population and port quality.

#### Orbital Position
25 combinations of atmosphere + temperature map to allowed orbital zones. A built-in lookup table determines whether a world **must** be in a specific zone (e.g. Inferno worlds are always Infernal zone) or can roll across multiple zones. AU distance is then calculated from the zone formula using the star's luminosity.

---

### 👥 Inhabitants

Everything about who lives on the world and how their society is organised.

| Property | Description |
|----------|-------------|
| **Tech Level** | TL 7–16 (Early Space Age to Self-Sufficient Megastructures), mapped to real historical eras |
| **Population** | Derived from habitability score — ranges from hundreds to tens of billions |
| **Wealth** | Average, Better-off, Prosperous, or Affluent — modified by biochemical resources |
| **Power Structure** | Anarchy, Confederation, Federation, or Unitary State |
| **Development** | UnderDeveloped through Very Developed, with HDI and average SOC values |
| **Source of Power** | Aristocracy, Ideocracy, Kratocracy, Democracy, or Meritocracy |
| **Governance DM** | Combined modifier from Development × Wealth |

#### Starport
The Port Value Score (PVS) is calculated from habitability, tech level, wealth, and development. This determines the starport class (**X, E, D, C, B, A**) and what facilities are present — including rolls for Naval, Scout, and Pirate bases.

#### Travel Zone
- **Green** — safe
- **Amber** — dangerous; worlds with High+ Biohazard or any Radioactive hazard are automatically Amber. Others may roll Amber randomly. A reason table (2D6) explains the specific danger: war, insurgency, economic collapse, environmental disaster, and more.
- **Red** — procedurally generated using the world's Development level (as a Stability Mode that sets a target number) and its Source of Power (which modifies the roll). Aristocracies and Kratocracies are more likely to be Red Zones. The referee can always override manually.

#### 🎲 D66 × D6 Culture Table
One of the standout features of the Mneme book. Roll 3D6 — the first two dice give a row (11 through 66), the third gives a column (1–6) — to generate cultural traits for the world's civilisation.

With 36 rows and 6 columns, there are **216 possible trait results**, covering everything from food customs and clothing norms to attitudes toward technology, hierarchy, violence, spirituality, and social organisation. The book's own description:

> *"These are things that the culture finds very important with regards to their cultural identity. Note that even seemingly conflicting ideas might be held by a culture — with the contradiction easily ignored, justified, or accommodated."*

The app rolls 1 to 5 traits per world (determined by a separate 3D6 roll) and displays them alongside the other inhabitant data.

---

### 🪐 Planetary System

The full system of bodies beyond the main world.

#### Body Types Generated
- **Circumstellar Disks** — debris belts, asteroid fields, Kuiper belt equivalents
- **Dwarf Planets** — Moon-scale bodies in Lunar Masses
- **Terrestrial Worlds** — rocky planets in Earth Masses
- **Ice Worlds** — outer system icy bodies
- **Gas Worlds** — gas giants classified into five types by temperature and cloud composition

#### Gas World Classification (5D6)
| Class | Name | Zone | Real-world examples |
|-------|------|------|---------------------|
| I | Ammonia Clouds | Outer Solar System | Jupiter, Saturn |
| II | Water Clouds | Conservative/Optimistic Habitable | (hypothetical) |
| III | Cloudless | Infernal | (hot Jupiters) |
| IV | Alkali Metals | Hot | (hot Jupiters) |
| V | Silicate Clouds | Hot | (ultra-hot Jupiters) |

#### Hot Jupiter Migration Rule
Class III, IV, and V gas giants that land in the Infernal or Hot zone are **hot Jupiters** — they migrated inward early in the system's history and cleared the zone of all other bodies. The app enforces this before placing any other body: the zone is emptied, the gas giant sits alone, and a small chance exists for a captured rogue world.

#### Orbital Placement — Hill Sphere Spacing
Bodies are not placed randomly. The app:
1. Places the main world first at its fixed position
2. Sorts all remaining bodies by mass (largest first)
3. Places each body using its zone formula, then checks the **Hill sphere** minimum separation against every already-placed body
4. If a conflict exists, steps outward by one Hill radius at a time until clear
5. If the zone is full, overflows to the next outer zone

The Hill sphere formula `r_H = a × ∛(m_planet / (3 × M_star))` ensures each body has a gravitationally stable orbit that doesn't interfere with its neighbours.

Each body is displayed with its full physical stats: mass, radius, diameter, surface gravity (in g), and escape velocity (ΔV in m/s).

---

## Accessibility & Platform Support

| Feature | Details |
|---------|---------|
| **Offline** | Full offline support via service worker — generate systems with no internet connection |
| **Installable** | Add to home screen on Android, iOS, Windows, macOS, and Linux |
| **Phone layout** | Vertical single-column layout optimised for portrait screens, fixed bottom tab bar |
| **Desktop layout** | Multi-panel view with zone visualisation diagram |
| **Day theme** | Light colour scheme for bright environments |
| **Dark theme** | Default deep-space dark theme |

---

## Data & Export

All data is saved **locally on your device** using IndexedDB (via Dexie.js). Nothing is sent to a server.

Each saved system has a unique key in the format `YYMMDD-HHMMSS-[CLASS][GRADE]-[3-letter]` (e.g. `260409-143022-G2-XKR`).

### Export Formats

**JSON** — full structured export of a single system, useful for backups and transfers between devices.

**CSV (Wide-row format)** — the entire star system in a single row. Standard fields cover the star and main world, followed by open-ended prefixed columns for companion stars (`S1_`, `S2_`) and planetary bodies (`P01_`, `P02_`, `D01_`, etc.). Multiple systems form a flat-file database where each row is self-contained and identifiable by its system key. Compatible with Excel, Google Sheets, and any data tool.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Storage | IndexedDB via Dexie.js |
| PWA | vite-plugin-pwa |
| Icons | Lucide React |
| Fonts | Inter, IBM Plex Mono |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Game-in-the-Brain/Mneme-CE-World-Generator.git
cd Mneme-CE-World-Generator

# Install dependencies
npm install

# Start the development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [FRD](./260409-v02%20Mneme-CE-World-Generator-FRD.md) | Full Function Requirements Document |
| [QA.md](./QA.md) | Known issues and open bugs |
| [REF-001](./references/REF-001-stellar-tables.md) | Stellar class, mass, and luminosity tables |
| [REF-002](./references/REF-002-companion-star.md) | Companion star generation logic |
| [REF-003](./references/REF-003-orbit-table.md) | Companion star orbital distances |
| [REF-004](./references/REF-004-world-type-tables.md) | World type and size tables |
| [REF-005](./references/REF-005-world-position-table.md) | World position — 25 atmosphere/temperature combinations |
| [REF-006](./references/REF-006-culture-table.md) | D66 × D6 culture traits table |
| [REF-007](./references/REF-007-planetary-systems-table.md) | Planetary body mass generation |
| [REF-008](./references/REF-008-gas-world-classification.md) | Gas world Class I–V classification |
| [REF-009](./references/REF-009-disk-zone-table.md) | Circumstellar disk zone placement |
| [REF-010](./references/REF-010-travel-zone.md) | Travel zone — Amber and Red zone rules |
| [REF-011](./references/REF-011-hill-sphere-orbits.ts) | Hill sphere orbital spacing algorithm |

---

## Based On

**Mneme World Generator** by Justin Cesar Aquino / Game in the Brain  
Available on [DriveThruRPG](https://www.drivethrurpg.com/en/product/403824/MNEME-World-Generator)

Compatible with the **Cepheus Engine** SRD and Traveller-family games.

> *"With the system contained in this book, you can add considerably more detail to your star systems to help increase player immersion. You can generate stars and multi-star systems with worlds that are not limited to terrestrial planets."*

---

## Contributing

Issues and pull requests are welcome. Please check [QA.md](./QA.md) for known issues before opening a new one.

---

<div align="center">

Made by [Game in the Brain](https://github.com/Game-in-the-Brain) · Built with React + TypeScript · Powered by the Mneme CE ruleset

</div>
