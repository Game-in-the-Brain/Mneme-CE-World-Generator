#!/usr/bin/env node
// Restores symlinks to the local name-place-faction-generator packages.
// Runs automatically via the postinstall npm hook (npm install overwrites them with copies).
import { rmSync, symlinkSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gi7bDir = resolve(root, 'node_modules/@gi7b');
const genRoot = resolve(root, '../name-place-faction-generator');

const links = [
  ['shared',     resolve(genRoot, 'shared')],
  ['namegen',    resolve(genRoot, 'packages/namegen')],
  ['placegen',   resolve(genRoot, 'packages/placegen')],
  ['factiongen', resolve(genRoot, 'packages/factiongen')],
];

if (!existsSync(gi7bDir)) mkdirSync(gi7bDir, { recursive: true });

for (const [name, target] of links) {
  const link = resolve(gi7bDir, name);
  if (!existsSync(target)) {
    console.warn(`[relink-gi7b] WARNING: target missing — ${target}`);
    continue;
  }
  if (existsSync(link)) rmSync(link, { recursive: true, force: true });
  symlinkSync(target, link);
  console.log(`[relink-gi7b] linked @gi7b/${name} → ${target}`);
}
