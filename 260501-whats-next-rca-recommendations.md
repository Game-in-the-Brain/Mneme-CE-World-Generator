# What's Next — RCA & Recommendations

**Date:** 2026-05-01  
**Project:** Mneme CE World Generator  
**Current Version:** v1.3.192 (clean)  
**Last Session:** 260430-212003 — FRD-069 polish complete

---

## 1. Current State at a Glance

| Layer | Status |
|-------|--------|
| **v1 Runtime App** | Stable. Build passes. All P0 issues through QA-061 resolved. FRD-069 (edit mode) shipped. |
| **CI / Build Hygiene** | Recently stabilized. BUILD-HYGIENE.md documents the dirty-build chain. |
| **Open Queue** | 14 queued items (QA-066–080), 2 on-hold (QA-076–077), 3 planned FRDs (FR-041/042/043 v2 pipeline). |
| **v2 Pipeline** | Design specs complete (consolidated v1.md). Zero implementation. |

---

## 2. Root Cause Analysis: Why "What's Next" Is Hard

### RCA-1 — The Queue Is Wide, Not Deep

**Symptom:** 14 items are queued but none are explicitly prioritized. The QA.md index table mixes bug fixes, UX tweaks, lore additions, and major engine redesigns at the same priority level.

**Root Cause:** Items are appended as they arrive (mostly Neil Lucock feedback + design evolution) without a triage gate. "Queued" has become a catch-all for "not started yet" — it doesn't distinguish between "blocks a user" and "would be nice."

**Impact:** Context-switching between small UI fixes (QA-079 names), medium mechanical work (QA-066 cultural values), and massive architectural rewrites (FR-041 composition pipeline) destroys flow. The v2 pipeline redesign has been fully specced for 2+ weeks with zero code written because smaller items keep interrupting.

---

### RCA-2 — The v2 Pipeline Has a "Big Bang" Integration Risk

**Symptom:** FR-041/042/043 are designed as a sequential chain (Composition → Positioning → Habitability) but the implementation plan in QA.md labels Phase 5 as "Pipeline integration (big-bang) — Breaking? Yes."

**Root Cause:** The v2 pipeline reverses the core generation order (system-first vs mainworld-first). This touches `generator.ts` (1,130 lines), `types/index.ts`, every zone switch, and the habitability waterfall. There is no feature-flag or gradual-migration strategy documented.

**Impact:** Fear of the big-bang is rational. A wrong integration breaks the entire app. The natural response is to defer it — which is exactly what's happened.

---

### RCA-3 — Name Generation (QA-079/080) Should Have Been Caught Earlier

**Symptom:** Two separate name issues were filed *after* FRD-063a shipped: companion stars have no names, and mainworld/disk names are skipped by `generatePlaceNames()`.

**Root Cause:** FRD-063a's test plan (in 260430-010550.md) covered descriptor modes and edit-mode editing, but never verified the *completeness* of the name-generation target list. The place-name generator was assumed to cover "all bodies" when it explicitly skipped mainworld and disks.

**Impact:** A feature that *looks* complete (names are generated, editable, persisted) has a hidden gap that breaks narrative coherence (unnamed companion stars, blank disk labels).

---

### RCA-4 — Build Hygiene Was Reactive, Not Proactive

**Symptom:** Three consecutive dirty builds (v1.3.188 → v1.3.192) before BUILD-HYGIENE.md was written.

**Root Cause:** The version-string logic (`git status --porcelain` in `vite.config.ts`) is a good guardrail but a bad diagnostic. It tells you *that* the tree is dirty, not *why*. Each dirty build required a manual CI log dig. No pre-flight checklist existed.

**Impact:** ~2 hours of debugging across three sessions for problems that a 5-minute checklist would have prevented.

---

## 3. Recommendations

### 🔴 Recommendation 1: Ship QA-079 + QA-080 Immediately (1 Session)

**Why:** These are pure omissions from FRD-063a. The fix is bounded and well-understood.

**Scope:**
1. Add `companionNames: Record<string, string>` to `PlaceNames` type.
2. Generate companion star names in `placeNameGen.ts`.
3. Include mainworld and disks in the name generation loop (use synthetic IDs).
4. Display + edit in `StarTab.tsx` and `PlanetarySystemTab.tsx`.
5. Legacy migration: auto-populate defaults on first view.

**Acceptance Criteria:**
- Generate a system → every companion star has a name.
- Generate a system → mainworld and every disk have names.
- Edit mode → all names editable, staged, savable.
- Legacy system → names appear on first open (no blank fields).

**Risk:** Low. No logic changes. Pure data plumbing.

---

### 🟠 Recommendation 2: Implement a v2 Feature Flag Before Any v2 Code (1 Session)

**Why:** The v2 pipeline is blocked by fear of the big-bang. A feature flag removes that fear.

**Scope:**
1. Add `useV2Pipeline: boolean` to `GeneratorOptions` (default `false`).
2. In `generator.ts`, wrap v2 calls in `if (options.useV2Pipeline)` — v1 path remains untouched.
3. Add a toggle in Settings (dev-only or behind a "Experimental" section).
4. Build verification: `npm run build` passes with flag on and off.

**Acceptance Criteria:**
- Default generation is unchanged.
- Flag can be toggled without breaking existing saved systems.
- v2 code can be merged incrementally without risk to the main path.

**Risk:** Near-zero. This is scaffolding.

---

### 🟡 Recommendation 3: Start v2 Phase 1 + 2 (Type System + Composition Tables)

**Why:** These are the least risky v2 phases. They add optional fields and new lookup tables without changing the pipeline order.

**Order:**
1. **Phase 1:** Add optional v2 fields to types (`composition`, `reactivityDM`, `biosphereRating`, etc.).
2. **Phase 2:** Implement composition tables in a NEW file (`src/lib/compositionTables.ts`). No integration yet — just the tables and unit tests.

**Do NOT do Phase 3 (positioning) or Phase 5 (integration) yet.**

**Acceptance Criteria:**
- New types compile with `strict: true`.
- Composition tables produce expected 3D6 distributions (unit test or batch script).
- `npm run build` passes.

---

### 🟢 Recommendation 4: Defer QA-066 (Cultural Values) Until QA-079/080 + v2 Phases 1–2 Land

**Why:** QA-066 is the largest queued item. It touches `worldData.ts`, `generator.ts`, `InhabitantsTab.tsx`, and the economic engine. Starting it now means abandoning the v2 pipeline for another 2–3 sessions.

**Trade-off:** Neil Lucock has been waiting for cultural-values mechanical effects. But the v2 pipeline (FR-041 biosphere → FR-043 habitability) is a *structural* improvement that affects every generated world. Cultural values is a *flavour* layer that applies after the structure is sound.

**Exception:** If Neil provides a specific urgent scenario that requires cultural values, bump this to 🔴.

---

### 🔵 Recommendation 5: Adopt a Pre-Commit Build Hygiene Checklist

**Why:** Prevent dirty-build regressions.

**Scope:**
1. Add a `scripts/pre-commit-check.sh` that runs:
   ```bash
   npx tsc --noEmit
   npm run build
   node scripts/check-file-sizes.mjs
   git status --porcelain
   ```
2. If porcelain is non-empty, fail loudly.
3. Optionally: add as a git pre-commit hook (but keep it optional — hooks can be annoying).

**Acceptance Criteria:**
- A developer cannot accidentally commit a dirty build.

---

## 4. Proposed Next 4 Sessions

| Session | Focus | Deliverable |
|---------|-------|-------------|
| **1** | QA-079 + QA-080 | All bodies have names; edit mode works end-to-end |
| **2** | v2 Feature Flag + Phase 1 (Types) | `useV2Pipeline` toggle; optional v2 fields on types |
| **3** | v2 Phase 2 (Composition Tables) | `compositionTables.ts` with tests; no integration |
| **4** | QA-066 Cultural Values (or QA-067/068 if Neil blocks) | Mechanical effects wired; 1,000-system batch validation |

---

## 5. Open Questions for Justin

1. **v2 Priority:** Do you want the v2 pipeline (FR-041/042/043) before cultural values (QA-066)? The pipeline changes every world's physics; cultural values changes every world's society.
2. **QA-067/068:** ✅ Resolved via 1,000-system batch validation (2026-05-01). QA-067 hypothesis NOT supported (8.8% <100k overall, 7.1% in Conservative zone). QA-068 passes all targets (Conservative 48.3%, fallback 0.6%).
3. **FRD-070:** Economic classification redesign is now unblocked by QA-067. Still blocked by FR-041 (v2 pipeline) which is already implemented. Ready to proceed when prioritized.

---

*This document replaces the implicit "what's next" with explicit RCA, bounded recommendations, and a 4-session execution plan.*
