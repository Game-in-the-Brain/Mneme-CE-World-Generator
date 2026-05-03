#!/usr/bin/env node
/**
 * Sync version from git tag (or git commit count) into all wrapper configs.
 *
 * Usage:
 *   node scripts/sync-version.mjs [version]
 *
 * Priority:
 *   1. Command-line argument (strips leading 'v')
 *   2. Latest git tag matching 'v*' (strips leading 'v')
 *   3. Git commit count → "1.3.{count}" (matches vite.config.ts logic)
 *   4. Hardcoded fallback "1.3.0"
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

const ROOT = resolve(process.cwd());

function getVersionFromArgs() {
  const arg = process.argv[2];
  if (!arg) return null;
  return arg.replace(/^v/, '');
}

function getVersionFromGitTag() {
  try {
    const tag = execSync('git describe --tags --match "v*" --abbrev=0', { cwd: ROOT, encoding: 'utf8' }).trim();
    return tag.replace(/^v/, '');
  } catch {
    return null;
  }
}

function getVersionFromGitCommits() {
  try {
    const count = execSync('git rev-list --count HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
    return `1.3.${count}`;
  } catch {
    return null;
  }
}

function resolveVersion() {
  return getVersionFromArgs() || getVersionFromGitTag() || getVersionFromGitCommits() || '1.3.0';
}

function semverToVersionCode(semver) {
  // Convert "1.3.193" → 1003193 (major*1000000 + minor*1000 + patch)
  const [major, minor, patch] = semver.split('.').map(Number);
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) return 1;
  return major * 1000000 + minor * 1000 + patch;
}

function updateTauriConf(version) {
  const path = resolve(ROOT, 'src-tauri/tauri.conf.json');
  const content = readFileSync(path, 'utf8');
  const json = JSON.parse(content);
  json.version = version;
  json.productName = 'Mneme CE World Generator';
  writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
  console.log(`✓ src-tauri/tauri.conf.json → ${version}`);
}

function updateCargoToml(version) {
  const path = resolve(ROOT, 'src-tauri/Cargo.toml');
  let content = readFileSync(path, 'utf8');
  content = content.replace(/^version = "[^"]+"/m, `version = "${version}"`);
  writeFileSync(path, content);
  console.log(`✓ src-tauri/Cargo.toml → ${version}`);
}

function updateAndroidBuildGradle(version) {
  const path = resolve(ROOT, 'android/app/build.gradle');
  let content = readFileSync(path, 'utf8');
  const versionCode = semverToVersionCode(version);
  content = content.replace(/versionCode \d+/, `versionCode ${versionCode}`);
  content = content.replace(/versionName "[^"]+"/, `versionName "${version}"`);
  writeFileSync(path, content);
  console.log(`✓ android/app/build.gradle → versionCode ${versionCode}, versionName "${version}"`);
}

function updatePackageJson(version) {
  const path = resolve(ROOT, 'package.json');
  const content = readFileSync(path, 'utf8');
  const json = JSON.parse(content);
  json.version = version;
  writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
  console.log(`✓ package.json → ${version}`);
}

function main() {
  const version = resolveVersion();
  console.log(`Syncing version: ${version}\n`);
  updateTauriConf(version);
  updateCargoToml(version);
  updateAndroidBuildGradle(version);
  updatePackageJson(version);
  console.log('\nAll configs synced.');
}

main();
