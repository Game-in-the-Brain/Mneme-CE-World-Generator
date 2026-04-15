# Mneme CE World Generator — Version History

**Format:** `1.3.{commitCount}` (auto-generated from git commit count during build)

---

## v1.3.62 — Depression Penalty & After-Starport Recalculation (2026-04-15)

### Major Feature: QA-026 — Low Population Depression Penalty
- Added `calculateDepressionPenalty()` based on population thresholds and development level
- **After-starport timing** (chosen canonical method): starport calculated with founding TL, then recalculated with depressed `effectiveTL`
- Downgraded starports display founding class in parentheses: `Class E (founded Class B)`
- Parenthetical founding PSS also shown when downgraded
- Travel Zone auto-recalculates with `effectiveTL` (`< 10` → Amber, `< 9` → Red)
- Ships-in-the-Area budget auto-recalculates from depressed weekly activity
- New data model fields: `Inhabitants.foundingTL`, `Inhabitants.effectiveTL`, `Starport.foundingClass`, `Starport.foundingPSS`, `Starport.foundingRawClass`
- Generator option `depressionPenaltyTiming` persisted to `localStorage`

---

## v1.3.61 — README v1.4.0 Update (2026-04-15)

### Documentation
- Updated README with v1.4.0 highlights
- Added links to new documentation files

---

## v1.3.60 — QA-023 Marked Live (2026-04-15)

### Documentation
- Formally marked QA-023 (mass + density physics pipeline) as ✅ Implemented in `QA.md`
- Confirmed gravity is derived from mass + density, not rolled independently

---

## v1.3.59 — QA-024: In-System Ship Positions (2026-04-14)

### Fix / Feature
- Ships with location `"System"` now receive a `systemPosition` (body index 1–N)
- UI displays `In System — Body 3`
- Zero-body systems fall back to `In Orbit`
- Updated `.docx` export and `shipsInArea.ts`

---

## v1.3.58 — FR-030 Ships in the Area + QA-022 Physics (2026-04-14)

### Features
- **FR-030**: "Ships in the Area" generator wired to UI + `.docx` export
- **FR-029**: Weekly 3D6 roll button on Starport card, persists via `onUpdateSystem`
- **QA-022**: Main world gravity/size physics validation — impossible combinations eliminated

---

## v1.3.57 — Culture & Power Conflict Fixes (2026-04-14)

### Engine Fixes
- **QA-020**: Culture traits reroll opposing/duplicate results (max 20 attempts)
- **QA-021**: Source of Power excludes contradictory culture traits

---

## v1.3.56 — Generator Options Persistence (2026-04-14)

### Feature
- **FR-028 / QA-018**: Generator options (star class, grade, world type, populated) persist to `localStorage`
- Restored on navigation and app reload

---

## v1.3.55 — CI & Version Fixes (2026-04-13)

### Infrastructure
- GitHub Actions workflow for auto-deploy to `gh-pages`
- Fixed workflow permissions (`contents: write`)
- Switched to official GitHub Pages deployment actions
- Updated to Node 24
- Fixed `--legacy-peer-deps` for `vite-plugin-pwa` conflict
- Version now dynamic based on git commit count
- Fixed hardcoded version in batch export

---

## v1.3.54 — Batch Export + Habitat Sizing (2026-04-11)

### Features
- **QA-016**: Batch export enhanced with `byStarClass` statistics (median bodies, main world type %)
- **QA-017**: Habitats sized by largest body mass in system

---

## v1.3.53 — Half Dice v1.2 (2026-04-10)

### Engine Change
- **QA-015**: M-class stars use **Half Dice** (d3 + Dis+1)
- K-class stars use Dis+3 on standard d6
- Significantly reduced planet counts for K/M dwarfs

---

## v1.3.52 — README & Credits Update (2026-04-10)

### Documentation
- Added Credits section (GitHub, DeepSeek, Kimi)
- Added Contributors section
- Updated README with Recent Updates and Settings sections

---

## v1.3.51 — Version Badge & Physics Tests (2026-04-10)

### Features / Fixes
- Visible version badge in header
- Fixed escape velocity formula to pure metric units
- Added Python-based physics validation test suite
- Fixed radius calculation (`size × 0.5`)

---

## v1.3.50 — Debug Toggle & Glossary (2026-04-10)

### Features
- **QA-014**: Debug Mode Toggle in Settings (default ON)
- Updated glossary: World Serpents, Celestials, Great Trees, Divergent/Variant Humans, Spiral Ships, Terraforming Worms

---

## v1.3.49 — Documentation & FRD Links (2026-04-10)

### Documentation
- Added GitHub repo link, DriveThruRPG link, PWA installation instructions to FRD
- Updated `repoAnalysis.md` and `260410-Update.md`

---

## v1.3.48 — Hill Sphere & Hot Jupiter Fix (2026-04-10)

### Major Engine Fixes
- **QA-006**: Hill Sphere orbital spacing prevents disk collisions
- **QA-007**: Adv/Dis modifiers applied to planet count rolls
- **QA-009**: Body stats display (mass, radius, diameter, surface gravity, escape velocity)
- **QA-011**: Hot Jupiter migration clears inner zones

---

## v1.3.47 — Theme Toggles & Batch Export (2026-04-10)

### UI / Dev Tools
- **QA-012**: Debug Batch Export for statistical analysis
- **QA-013**: Compact theme toggle (Dark/Day share button space)

---

## v1.3.46 — TL Reference & Inhabitants UI (2026-04-09)

### Features
- **REF-013**: Tech Level expansion in Inhabitants tab (MTL 9-18)
- Wealth, Government, Development, Power Structure cards
- Population minimum 10 fix
- Governance DM footnote
- Starport output footnote

---

## v1.3.45 — DOCX Export & Annotations (2026-04-09)

### Features
- **DOCX export** with full system data
- **Body annotations** — persisted per system in `localStorage`
- Navigation phone layout fix

---

## v1.3.44 — Generator Controls (2026-04-09)

### Features
- Star class, star grade, main world type dropdowns
- Populated / Unpopulated toggle
- Hab ≤ 0 habitat fork (MVT/GVT table)

---

## v1.3.43 — Cultural Traits & Glossary (2026-04-09)

### Features
- Cultural trait descriptions
- Glossary page
- Stellar spectrum display
- CSV export spec

---

## v1.3.42 — QA Pass: Branding & Engine (2026-04-09)

### Fixes
- App title corrected to "Mneme CE World Generator"
- Logo added to header
- Scientific notation replaced with formatted numbers
- Phone theme toggle
- Single-page layout with tab anchors

---

## v1.3.41 — Initial PWA Implementation (2026-04-08)

### Launch
- First full implementation of MNEME World Generator PWA
- React 19 + TypeScript 5.8 + Vite
- GitHub Pages deployment workflow

---

## v1.3.1 — First Versioned Release (2026-04-10)

The first version to display a visible version badge (`v1.3.1`).

---

**For the full technical change history, see:** `git log --reverse --oneline`
