# FRD-071 — Downloadable Apps: Android, Linux, and Windows

**Status:** 📋 Ready for Implementation — **Priority: First Before All Other Work**  
**Depends on:** None — infrastructure only; no generator logic changes  
**Source:** Justin Aquino 2026-05-01  
**Related:** WRAPPER_BUILD.md (existing Tauri + Capacitor setup), BUILD-HYGIENE.md (CI guardrails)

---

## Executive Summary

Ship **installable desktop and mobile applications** for the Mneme CE World Generator alongside the existing GitHub Pages PWA. This FRD takes absolute precedence over all queued items (QA-079/080, v2 pipeline, QA-066, FRD-070) until the release pipeline is operational.

The app already has Tauri v2 (desktop) and Capacitor 6 (Android) wrappers configured. What is missing is an **automated CI pipeline** that builds signed/packaged artifacts and attaches them to GitHub Releases.

---

## Critical Assurance: This Will NOT Harm GitHub Pages

### The Fear
Adding desktop/Android build steps to CI might accidentally break the existing GitHub Pages deployment (`https://game-in-the-brain.github.io/Mneme-CE-World-Generator/`).

### The Confirmation: Zero Risk Strategy

| Concern | Reality | Mitigation |
|---------|---------|------------|
| Build command collision | Pages uses `npm run build` (base: `/Mneme-CE-World-Generator/`). Wrappers use `npm run build:wrapper` (base: `./`). | Separate commands, separate workflows. Never the same step. |
| Branch pollution | Pages deploys `dist/` from `main` on every push. | Release workflow triggers **only on version tags** (`v*.*.*`) or manual `workflow_dispatch`. It never pushes to `main`. |
| Artifact overwrite | Pages artifact is uploaded via `actions/upload-pages-artifact`. | Release artifacts use `actions/upload-artifact` and `softprops/action-gh-release`. Different namespaces, no collision. |
| File size bloat | Desktop builds add Rust toolchains and Android SDK. | Release runner is `ubuntu-latest` with cached dependencies. Pages runner is unchanged. |
| `base` path regression | Wrapper build sets `--base ./` for local file access. | The existing `deploy.yml` explicitly calls `npm run build`, not `build:wrapper`. No change. |

### The Architectural Separation

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   Push to main  │────▶│  deploy.yml (existing)│────▶│  GitHub Pages   │
│                 │     │  npm run build        │     │  (UNCHANGED)    │
└─────────────────┘     └─────────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  Tag v*.*.*     │────▶│  release.yml (NEW)   │────▶│  GitHub Release │
│  or manual run  │     │  build:wrapper +      │     │  .apk / .msi /  │
│                 │     │  tauri build +        │     │  .AppImage      │
│                 │     │  capacitor build      │     │                 │
└─────────────────┘     └─────────────────────┘     └─────────────────┘
```

**Golden rule:** The `deploy.yml` file is left completely untouched. The release workflow lives in a new file `.github/workflows/release.yml`. The two pipelines share zero steps, zero artifacts, and zero deployment targets.

---

## What Already Works (Do Not Rebuild)

### Desktop Wrapper — Tauri v2
- Config: `src-tauri/tauri.conf.json`
- Build: `npm run wrapper:build:desktop`
- Outputs: `src-tauri/target/release/bundle/` (`.msi`, `.AppImage`, `.deb`, `.dmg`)
- Already supports Windows, Linux, macOS

### Android Wrapper — Capacitor 6
- Config: `capacitor.config.ts`
- Build: `npm run wrapper:build:android`
- Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- Already configured with `appId: 'com.gi7b.mneme_world_generator'`

### Wrapper-Safe Build
- `vite.config.ts` has two modes:
  - `npm run build` → `base: '/Mneme-CE-World-Generator/'` (Pages)
  - `npm run build:wrapper` → `base: './'` (Tauri / Capacitor local files)
- This is already implemented and tested.

---

## What Must Be Built

### 1. GitHub Actions Release Workflow (`release.yml`)

A new workflow that:
1. Checks out the repo + `name-place-faction-generator` sibling
2. Builds NPF packages
3. Installs Node + Rust + Android SDK
4. Builds wrapper (`build:wrapper`)
5. Builds Tauri bundles for Windows, Linux, macOS
6. Builds Android APK
7. Uploads all artifacts to the GitHub Release that triggered the tag

**Trigger:**
```yaml
on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
```

**Platform Matrix:**

| Platform | Runner | Tauri Target | Capacitor Target |
|----------|--------|-------------|------------------|
| Linux | `ubuntu-latest` | `.AppImage`, `.deb` | — |
| Windows | `windows-latest` | `.msi` | — |
| macOS | `macos-latest` | `.app`, `.dmg` | — |
| Android | `ubuntu-latest` | — | `.apk` (unsigned) |

> **Note:** Android APK will be unsigned. Play Store signing is out of scope for this FRD. Users sideload via "Install from unknown sources." A future FRD can address keystore signing.

### 2. Version Synchronization

The Tauri `src-tauri/tauri.conf.json` currently hardcodes `"version": "0.1.0"`. This should be dynamically synced with the app's actual version (`1.3.x`) at release time.

**Options:**
- **Option A (recommended):** Derive version in CI from git tag (`${GITHUB_REF#refs/tags/v}`) and patch `tauri.conf.json` before build.
- **Option B:** Use a `scripts/sync-version.mjs` that reads `vite.config.ts`'s `__APP_VERSION__` and writes it to `tauri.conf.json`.

### 3. Release Notes Template

Auto-generated release notes should include:
- App version and commit hash
- Links to GitHub Pages (always-latest) and the specific release artifacts
- Checksums (SHA-256) for each artifact
- "How to Install" section per platform

---

## Implementation Steps

### Phase 1 — CI Workflow (Session 1)

1. Create `.github/workflows/release.yml`
2. Test with `workflow_dispatch` (manual trigger) on a test branch
3. Verify artifacts build without error
4. Confirm `deploy.yml` is untouched and Pages still deploys on `main` push

### Phase 2 — Version Sync + Polish (Session 2)

1. Implement version sync from git tag to `tauri.conf.json`
2. Add artifact checksum generation to release step
3. Write release notes template
4. Tag `v1.3.193` (or next clean version) and trigger first real release

### Phase 3 — Documentation Update (Session 2, parallel)

1. Update `README.md` with "Download" section linking to Releases page
2. Update `VERSIONS.md` with installable app availability
3. Update `ROADMAP.md` to mark wrapper builds as complete

---

## 2D Map Pause/Play Verification

The 2D Star System Map (accessible from the main app and as a standalone view) **already implements play/pause controls** (`btn-play` / `btn-pause` in `solar-system-2d/index.html` and `uiControls.ts`). This FRD explicitly confirms that:

1. The 2D map entry point (`solar-system-2d/index.html`) is built by Vite alongside the main app via `rollupOptions.input` in `vite.config.ts`.
2. The play/pause buttons must remain visible and functional in all wrapped builds (Tauri desktop, Capacitor Android).
3. The animation loop in `renderer.ts` respects `state.isPlaying`; no logic changes are required — only build verification.

### Why This Is Listed Here

The user explicitly requested that the 2D map pause/play button **not be forgotten** in the downloadable app rollout. Because the feature already exists in source, this is a **regression guard**, not new development.

## Acceptance Criteria

- [ ] A tag push `v*.*.*` triggers the release workflow automatically
- [ ] The release workflow produces four artifacts minimum: `.apk`, `.msi`, `.AppImage`, `.deb`
- [ ] Artifacts are attached to the GitHub Release with checksums
- [ ] `deploy.yml` is unchanged; Pages deployment from `main` continues normally
- [ ] A manual run of `workflow_dispatch` on `release.yml` also succeeds
- [ ] README links to the latest release download page
- [ ] **2D Map play/pause controls are verified working in Tauri and Capacitor builds**

---

## Out of Scope

- **iOS builds** — Requires macOS + Xcode + Apple Developer account ($99/year). Deferred until requested.
- **Signed Android APK / AAB** — Requires keystore and Play Console. Unsigned APK is sufficient for sideloading.
- **Auto-update mechanism** — Tauri has updater plugins; this is a future FRD.
- **Forgejo Pages deployment** — This FRD is about downloadable apps, not web deployment.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tauri Windows build fails on `windows-latest` runner | Medium | High | Pin Rust version; test manual dispatch first |
| Android SDK not available on GitHub runner | Low | High | Use `setup-android` action or `ubuntu-latest` preinstalled SDK |
| Release workflow accidentally triggers on `main` push | Low | Critical | Explicit `tags:` filter; never `branches:` |
| Artifact sizes exceed GitHub storage limits | Low | Medium | Tauri bundles are ~3-5MB; Android APK ~10MB. Well within limits. |
| Dirty build in release workflow | Medium | Medium | Apply same `git checkout -- package-lock.json` fix from BUILD-HYGIENE.md |

---

## Why This Before Everything Else

The v2 pipeline, QA fixes, and FRD-070 are all **app-logic** work. They change how worlds are generated. This FRD is **infrastructure** work. It changes nothing about generation, adds no new features, and carries zero risk to the existing user-facing app.

Shipping downloadable apps:
1. Expands the user base (not everyone wants a browser PWA)
2. Validates the wrapper build chain in CI (catches Tauri/Capacitor rot early)
3. Unblocks future wrapper-dependent features (file system access, native menus, auto-update)
4. Takes 2 sessions maximum — it does not delay the v2 pipeline meaningfully

---

*This FRD supersedes any implicit ordering in 260501-whats-next-rca-recommendations.md. Infrastructure ships first.*
