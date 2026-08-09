import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

// Verifies the env-gated GA4 wiring against real build output. It branches on the
// SAME variable the build read, because the deploy workflow runs `pnpm docs:check`
// (which builds) WITH the variable set and then ships that exact `dist` — so a
// blanket "dist never contains GA" assertion would break every production deploy.
//
//   set   => the shipped `dist` IS the analytics build: assert the four locale
//            homes load gtag for that id, and no other measurement id leaks.
//   unset => the shipped `dist` must be analytics-free, AND we still exercise the
//            positive wiring by building once into a throwaway outDir with a
//            placeholder id (removed after) so a broken spread can't pass CI
//            silently and only surface at deploy.

const packageRoot = path.resolve(import.meta.dirname, '..');
const dist = path.join(packageRoot, 'dist');
const HOME_ROUTES = ['index.html', 'zh/index.html', 'ja/index.html', 'ko/index.html'];
const LOADER = /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=([^"']+)/g;

const configured = (process.env.PUBLIC_GA_MEASUREMENT_ID ?? '').trim();

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory() ? collectFiles(target) : target;
      }),
    )
  ).flat();
}

// Every measurement id loaded anywhere under `root` (must all equal `expected`).
async function loadedIds(root) {
  const ids = new Set();
  for (const file of await collectFiles(root)) {
    if (!file.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    for (const [, id] of html.matchAll(LOADER)) ids.add(id);
  }
  return ids;
}

async function assertHomesLoad(root, expectedId) {
  for (const route of HOME_ROUTES) {
    const html = await readFile(path.join(root, route), 'utf8');
    assert.match(
      html,
      new RegExp(`<script async src="https://www\\.googletagmanager\\.com/gtag/js\\?id=${expectedId}"`),
      `${route} must load gtag.js for ${expectedId}`,
    );
    assert.match(
      html,
      new RegExp(`gtag\\('config', "${expectedId}"\\);`),
      `${route} must configure gtag with ${expectedId}`,
    );
  }
}

if (configured) {
  // The shipped dist is the analytics build (production-deploy path).
  await assertHomesLoad(dist, configured);
  const ids = await loadedIds(dist);
  assert.deepEqual(
    [...ids],
    [configured],
    `dist must load only the configured measurement id, found: ${[...ids].join(', ') || 'none'}`,
  );
  console.log(`GA build contract verified: dist loads ${configured} on all four locale homes.`);
} else {
  // Default / PR-CI path: the shipped dist must be analytics-free.
  const shippedIds = await loadedIds(dist);
  assert.equal(
    shippedIds.size,
    0,
    `dist must contain no Google Analytics when PUBLIC_GA_MEASUREMENT_ID is unset, found: ${[...shippedIds].join(', ')}`,
  );
  for (const file of await collectFiles(dist)) {
    if (!file.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    assert.doesNotMatch(
      html,
      /googletagmanager/,
      `${path.relative(dist, file)} must not reference googletagmanager`,
    );
  }

  // Exercise the positive wiring end-to-end into a throwaway outDir, then remove it
  // so the shipped dist stays analytics-free. A broken spread or wrong env-var name
  // fails here instead of silently at deploy.
  const placeholder = 'G-DOCSCHECK00';
  const probe = await mkdtemp(path.join(tmpdir(), 'docs-ga-probe-'));
  try {
    execFileSync('pnpm', ['exec', 'astro', 'build', '--outDir', probe], {
      cwd: packageRoot,
      stdio: 'inherit',
      env: { ...process.env, PUBLIC_GA_MEASUREMENT_ID: placeholder },
    });
    await assertHomesLoad(probe, placeholder);
    console.log(
      'GA build contract verified: shipped dist is analytics-free; a placeholder build injects gtag on all four locale homes.',
    );
  } finally {
    await rm(probe, { recursive: true, force: true });
  }
}
