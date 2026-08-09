import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(
  await readFile(new URL('../.astro/docs-route-manifest.json', import.meta.url), 'utf8'),
);

assert.ok(manifest.length >= 7, 'the manifest must include every representative page');
assert.deepEqual(
  manifest.map(({ sourcePath }) => sourcePath),
  manifest.map(({ sourcePath }) => sourcePath).toSorted(),
  'manifest entries must be deterministic by source path',
);

for (const entry of manifest) {
  assert.ok(['en', 'zh', 'ja', 'ko'].includes(entry.locale));
  assert.match(entry.sourcePath, /\.mdx?$/);
  assert.match(entry.htmlRoute, /^(?:\/|\/.*\/)$/);
  assert.match(entry.markdownRoute, /^\/.*\.md$/);
  assert.ok(entry.title);
  assert.ok(entry.description);
}

assert.deepEqual(
  manifest.find(({ sourcePath }) => sourcePath === 'guides/getting-started.mdx'),
  {
    locale: 'en',
    sourcePath: 'guides/getting-started.mdx',
    htmlRoute: '/guides/getting-started/',
    markdownRoute: '/guides/getting-started.md',
    title: 'Get started',
    description: 'Install Chorus, sign in, and connect your first AI agent.',
  },
);

console.log('Deterministic documentation route manifest verified.');
