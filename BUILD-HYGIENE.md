# Build Hygiene — CI, Version Strings, and Dirty Builds

**Project:** Mneme CE World Generator
**Scope:** How the version string is generated, what `-dirty` means, common causes, and how to fix them.

---

## How the Version String Works

The version is auto-generated at build time by `vite.config.ts`:

```ts
function getGitVersion() {
  const commitCount = execSync('git rev-list --count HEAD').toString().trim()
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
  const commitDate = execSync('git log -1 --format=%cs').toString().trim()
  const dirty = execSync('git status --porcelain').toString().trim().length > 0
  const suffix = dirty ? '-dirty' : ''

  return {
    version: `1.3.${commitCount}${suffix}`,
    fullVersion: `1.3.${commitCount}-${commitHash}${suffix}`
  }
}
```

This is injected into the bundle as `__APP_VERSION__` and displayed in the app header.

**Format:** `v1.3.{commitCount}[-dirty]`

---

## What "-dirty" Means

`-dirty` means the build ran while the git working tree had uncommitted changes. The deployed bundle does **not** exactly match a clean commit.

This is a warning, not an error — but it means:
- You can't map a deployed version back to an exact git commit
- CI builds should ideally never show `-dirty`

---

## Common Causes of Dirty CI Builds

### 1. Generated files tracked in git

**Symptom:** A build script (e.g. `bundle-npf-data.mjs`) rewrites a file that is tracked in git. After the script runs, `git status` shows the file as modified.

**Example from this project:**
- `scripts/bundle-npf-data.mjs` writes `src/lib/npf-data.generated.ts`
- This file was tracked in git
- Every CI build regenerated it → working tree dirty

**Fix:**
```bash
# 1. Add to .gitignore
echo "src/lib/npf-data.generated.ts" >> .gitignore

# 2. Untrack from git (keep local copy)
git rm --cached src/lib/npf-data.generated.ts

# 3. Commit
git add .gitignore
git commit -m "build: untrack generated file to prevent -dirty suffix"
```

---

### 2. `npm install` rewriting `package-lock.json`

**Symptom:** `npm install` (even with `--legacy-peer-deps`) updates `package-lock.json` because the lockfile is out of sync with `package.json` or the CI npm version differs from the local one.

**Example from this project:**
- Workflow ran `npm install --legacy-peer-deps`
- CI rewrote `package-lock.json` → working tree dirty
- `npm ci` failed because local `file:` dependencies were missing from the lockfile

**Fix A — Restore lockfile after install:**
```yaml
- name: Install dependencies
  run: npm install --legacy-peer-deps

- name: Restore lockfile
  run: git checkout -- package-lock.json
```

**Fix B — Use `npm ci` (preferred, when possible):**
```yaml
- name: Install dependencies
  run: npm ci
```

> ⚠️ `npm ci` fails if `package-lock.json` is out of sync with `package.json`. If your project uses local `file:` dependencies or workspace packages that aren't in the lockfile, `npm ci` won't work.

---

### 3. Build scripts modifying tracked source files

Any script that writes to a tracked `.ts`, `.tsx`, `.css`, or `.json` file during build will dirty the tree.

**Fix:** Route generated output to `dist/`, `public/`, or an untracked file in `src/`.

---

### 4. Line-ending or file-mode differences

Windows/Unix line-ending mismatches (`CRLF` vs `LF`) or file permission changes can show up as modifications in CI even when content is identical.

**Fix:**
```bash
git config --global core.autocrlf input
```

---

## Diagnosis Pattern

When you see `-dirty` and don't know why, temporarily log the dirty files during build:

```ts
// vite.config.ts (or your build config)
const porcelain = execSync('git status --porcelain').toString().trim()
const dirty = porcelain.length > 0
if (dirty) {
  console.warn('[getGitVersion] Dirty working tree:')
  console.warn(porcelain.split('\n').map(l => '  ' + l).join('\n'))
}
```

This prints the exact filenames in the CI build logs.

**Remove the debug logging once the issue is identified.**

---

## CI Workflow Checklist

Before pushing, verify your workflow won't produce `-dirty`:

- [ ] All generated files are in `.gitignore` and untracked from git
- [ ] `npm install` steps are followed by `git checkout -- package-lock.json` (or use `npm ci`)
- [ ] No build script writes to tracked source files
- [ ] `.gitattributes` handles line endings if the team uses mixed OS

---

## Version Scheme Trade-offs

| Scheme | Example | Pros | Cons |
|--------|---------|------|------|
| `1.3.{commitCount}` | `v1.3.192` | Auto-increments, easy to trace | Resets on rebase/history rewrite |
| `semver+hash` | `v1.3.0-a1b2c3d` | Human-readable + exact commit | Manual semver bumps |
| `YYYY.MM.DD-build` | `2026.04.30-5` | Calendar-aligned | Harder to map to commits |

This project uses `1.3.{commitCount}` with `-dirty` guard.

---

## GitHub Actions Gotchas

- `actions/checkout@v4` with `fetch-depth: 0` does a full clone — commit count is accurate
- `cache: npm` in `setup-node` restores `node_modules` from `package-lock.json` hash — can mask install issues locally
- Shallow clones (`fetch-depth: 1`) break commit-count versioning — always use `fetch-depth: 0` if you derive version from git history

---

## Incident Log

| Date | Issue | Root Cause | Fix |
|------|-------|------------|-----|
| 2026-04-30 | `v1.3.192-dirty` deployed | `npm install` rewrote `package-lock.json` in CI | Added `git checkout -- package-lock.json` after install step |
| 2026-04-30 | `v1.3.191-dirty` deployed | `src/lib/npf-data.generated.ts` tracked in git, regenerated every build | Added to `.gitignore`, `git rm --cached` |
| 2026-04-29 | `v1.3.188-dirty` (version log) | Cached build artifact | Fresh build cleared it |

---

## Related Files

- `vite.config.ts` — version generation
- `.github/workflows/deploy.yml` — CI workflow
- `scripts/bundle-npf-data.mjs` — NPF data generation (was dirtying the tree)
