# RCA — Wrapper Build Failures (2026-05-01 Session)

**Date:** 2026-05-01  
**Project:** Mneme CE World Generator  
**Scope:** Local Tauri desktop build (`npm run wrapper:build:desktop`)  
**Outcome:** ✅ Resolved — all Linux artifacts built and renamed

---

## Failure 1 — Invalid Semver in `tauri.conf.json`

### Symptom
```
Error failed to parse config: `tauri.conf.json > version` must be a semver string
```

### Root Cause Chain
1. `scripts/sync-version.mjs` tries to read version from git tag (`git describe --tags --match "v*"`)
2. Repo has **no `v*` tags**, so git describe fails with `fatal: No names found, cannot describe anything.`
3. Script falls back to parsing `vite.config.ts` with regex `/version:\s*`([^`]+)`/`
4. Regex matches the **template literal** `` `1.3.${commitCount}${suffix}` `` (raw source code, not computed value)
5. Script writes `1.3.${commitCount}${suffix}` into `tauri.conf.json`, `Cargo.toml`, `build.gradle`, and `package.json`
6. Tauri config parser rejects `${commitCount}${suffix}` as invalid semver

### The Fix
- Changed `getVersionFromViteConfig()` fallback to `getVersionFromGitCommits()`
- New fallback: `git rev-list --count HEAD` → `1.3.200`
- Script now strips `v` prefix from command-line args too (`arg.replace(/^v/, '')`)
- Also added validation: if the parsed version contains `${`, reject it

### Prevention
- Never parse source code with regex for values that are template literals
- Always validate semver before writing to config files
- Use `semver` npm package or a simple `/^\d+\.\d+\.\d+$/` check

---

## Failure 2 — Missing `pkg-config`

### Symptom
```
error: failed to run custom build command for `glib-sys v0.18.1`

Caused by:
  The pkg-config command could not be found.
```

### Root Cause Chain
1. Tauri v2 on Linux depends on GTK3/WebKit2GTK system libraries
2. The Rust `gtk-sys` and `glib-sys` crates use `pkg-config` to locate these libraries at compile time
3. The agent container (`agent260411`) had **never had Rust/Tauri installed before**
4. `pkg-config` was not present in the base Ubuntu image

### The Fix
```bash
sudo apt-get install -y pkg-config
```

### Prevention
- Document all system prerequisites in `WRAPPER_BUILD.md` (already partially done, but `pkg-config` was implicit)
- CI runners (`ubuntu-latest`) have these preinstalled; local builds on fresh machines will always hit this

---

## Failure 3 — Missing GTK/WebKit Development Libraries

### Symptom
```
warning: glib-sys@0.18.1: Could not run `pkg-config --libs --cflags glib-2.0`
error: failed to run custom build command for `glib-sys v0.18.1`
```

### Root Cause Chain
1. `pkg-config` was now installed, but the `.pc` files for GTK/WebKit were missing
2. The dev headers (`-dev` packages) were not installed — only runtime libraries were present
3. Each `*-sys` Rust crate needs both the library and its `pkg-config` metadata

### The Fix
```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  libglib2.0-dev \
  libgtk-3-dev
```

### Prevention
- Same as Failure 2 — these are standard Tauri Linux prerequisites
- Consider a `scripts/install-tauri-deps.sh` helper for fresh environments

---

## Failure 4 — AppImage Bundling: Missing `file` Command

### Symptom
```
[appimage/stderr] appimagetool, continuous build (git version 8c8c91f), build 295
[appimage/stderr] file command is missing but required, please install it
ERROR: Failed to run plugin: appimage (exit code: 1)
```

### Root Cause Chain
1. Tauri bundles AppImage using `linuxdeploy` (an AppImage itself)
2. `linuxdeploy` extracts itself to `/tmp/` and runs `appimagetool` internally
3. `appimagetool` uses the `file` command (from `file` package) to determine ELF/Mach-O formats
4. The `file` package was **not installed** in the container
5. Without it, `appimagetool` aborts before creating the final `.AppImage`

### The Fix
```bash
sudo apt-get install -y file
```

### Why It Took Two Attempts
- First build failed with generic `failed to run linuxdeploy`
- Had to manually run linuxdeploy with `--appimage-extract-and-run` to see the real error from `appimagetool`
- The error was hidden inside the plugin's stderr, not surfaced by Tauri's bundler

### Prevention
- `file` is so universally present that no one thinks to list it as a dependency
- Add `file` to the Tauri prerequisites list explicitly

---

## Failure 5 — Background Task Heartbeat Timeout

### Symptom
Background task status: `lost`  
Terminal reason: `Background worker heartbeat expired`

### Root Cause Chain
1. Tauri build compiles ~300 Rust crates from source on first run
2. AppImage bundling then copies ~150 system libraries into the AppDir
3. Total time exceeded the background worker's heartbeat interval (~5 minutes)
4. The task was marked `lost` even though the actual `cargo`/`linuxdeploy` processes continued running on the host

### The Fix
- No code fix needed — just awareness that the build was still running
- Verified completion by checking `ps aux` and then `find` for `.AppImage`

### Prevention
- For long builds, use `run_in_background=true` with high timeout, then poll with `ps` rather than blocking on `TaskOutput`
- Or run directly in the interactive shell with `nohup`/`tmux`

---

## Summary Table

| # | Failure | Missing Dependency | Install Command |
|---|---------|-------------------|-----------------|
| 1 | Invalid semver in configs | Robust version sync script | `node scripts/sync-version.mjs` (fixed) |
| 2 | `pkg-config` not found | `pkg-config` | `apt install pkg-config` |
| 3 | GTK headers missing | `lib*-dev` packages | `apt install libwebkit2gtk-4.1-dev libgtk-3-dev libglib2.0-dev` |
| 4 | AppImage plugin failed | `file` | `apt install file` |
| 5 | Task heartbeat timeout | Patience | Poll `ps aux` instead of blocking |

---

## Updated Build Prerequisites

For fresh Ubuntu/Debian machines building Tauri wrappers locally:

```bash
# 1. System deps (all of them — order matters)
sudo apt-get update
sudo apt-get install -y \
  pkg-config \
  file \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  libglib2.0-dev \
  libgtk-3-dev

# 2. Rust + Tauri CLI
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install tauri-cli

# 3. Sync version and build
npm run version:sync
npm run wrapper:build:desktop
```

---

*This RCA follows the format established in BUILD-HYGIENE.md. Add new incidents to the Incident Log there if this pattern recurs.*
