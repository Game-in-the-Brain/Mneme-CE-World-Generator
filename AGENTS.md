# Agent Guidelines — Mneme CE World Generator

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/components/` | React components. Each major view gets its own file. |
| `src/components/tabs/` | Tab sub-components for `SystemViewer`. Extract new tabs here. |
| `src/lib/` | Pure TypeScript utilities — generators, data tables, formatters, export logic. |
| `src/types/` | Shared TypeScript interfaces and type aliases. |
| `src-tauri/` | Tauri desktop wrapper (Rust + config). |
| `android/` | Capacitor Android wrapper. |
| `scripts/` | Build / maintenance scripts. |

## Code Standards

### File Size Soft Limit
- **500 lines** per `.ts` / `.tsx` file under `src/`.
- Run `node scripts/check-file-sizes.mjs` before committing large refactors.
- If a file exceeds the limit, extract logic into smaller modules rather than appending.

### Component Boundaries
- **Tabs** → `src/components/tabs/<TabName>.tsx`
- **Shared tab helpers** → `src/components/tabs/tabHelpers.tsx`
- **Data / lookup tables** → `src/lib/worldData.ts` or a dedicated module
- **Type definitions** → `src/types/index.ts` (or split when it exceeds 500 lines)

### Type Safety
- When extending enums or union types (e.g., `Zone` → `ZoneId`), grep for **all `switch` statements** on that type and audit for missing cases.
- Prefer explicit cases over `default:` fallbacks for known union values.
- Avoid `as unknown as` casts when possible; update the canonical type instead.

### Git Workflow
- Commit after each significant feature group.
- Keep `git status` clean — stage docs, config, and source code in separate logical commits.

## Build & Verify

```bash
# Type-check only (fast)
npx tsc --noEmit

# Full production build
npm run build

# File-size guardrail
node scripts/check-file-sizes.mjs
```

## Key Dependencies
- React 19 + TypeScript
- Vite (build tool)
- Dexie (IndexedDB wrapper)
- Tauri v2 + Capacitor (desktop / mobile wrappers)
