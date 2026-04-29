#!/usr/bin/env node
/**
 * Maintenance guardrail: warn if any source file exceeds the soft line limit.
 * Run with: node scripts/check-file-sizes.mjs
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';

const SOFT_LIMIT = 500;
const SRC_DIR = join(process.cwd(), 'src');
const EXTENSIONS = new Set(['.ts', '.tsx']);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (entry.isFile() && EXTENSIONS.has(extname(entry.name))) {
      yield path;
    }
  }
}

async function main() {
  const offenders = [];
  for await (const path of walk(SRC_DIR)) {
    const content = await readFile(path, 'utf-8');
    const lines = content.split('\n').length;
    if (lines > SOFT_LIMIT) {
      offenders.push({ path: path.replace(process.cwd() + '/', ''), lines });
    }
  }

  if (offenders.length === 0) {
    console.log(`✅ All source files are within the ${SOFT_LIMIT}-line soft limit.`);
    process.exit(0);
  }

  console.warn(`⚠️  ${offenders.length} file(s) exceed the ${SOFT_LIMIT}-line soft limit:\n`);
  for (const { path, lines } of offenders.sort((a, b) => b.lines - a.lines)) {
    console.warn(`  ${String(lines).padStart(4)}  ${path}`);
  }
  console.warn(`\nConsider extracting components, utilities, or types into smaller modules.`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
