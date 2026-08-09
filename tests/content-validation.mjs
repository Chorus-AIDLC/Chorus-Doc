import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = await mkdtemp(path.join(tmpdir(), 'chorus-docs-content-'));
const guideDirectory = path.join(root, 'guides');
await mkdir(guideDirectory, { recursive: true });

const invalidFile = path.join(guideDirectory, 'invalid-fixture.mdx');
await writeFile(
  invalidFile,
  `---
title: Invalid fixture
docsLocale: fr
route: /wrong-route/
---
`,
);

const result = spawnSync(
  process.execPath,
  [new URL('../scripts/validate-content.mjs', import.meta.url).pathname, root],
  { encoding: 'utf8' },
);

assert.notEqual(result.status, 0, 'invalid metadata must fail validation');
assert.match(result.stderr, new RegExp(invalidFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(result.stderr, /missing required metadata "description"/);
assert.match(result.stderr, /invalid docsLocale "fr"/);
assert.match(result.stderr, /route must be "\/guides\/invalid-fixture\/"/);

const collisionRoot = await mkdtemp(path.join(tmpdir(), 'chorus-docs-collision-'));
const collisionDirectory = path.join(collisionRoot, 'guides');
await mkdir(collisionDirectory, { recursive: true });
const collisionSource = `---
title: Collision fixture
description: Two sources must not resolve to one output route.
docsLocale: en
route: /guides/collision/
---

Collision fixture.
`;
await Promise.all(
  ['collision.md', 'collision.mdx'].map((file) =>
    writeFile(path.join(collisionDirectory, file), collisionSource),
  ),
);
const collisionResult = spawnSync(
  process.execPath,
  [new URL('../scripts/validate-content.mjs', import.meta.url).pathname, collisionRoot],
  { encoding: 'utf8' },
);
assert.notEqual(collisionResult.status, 0, 'output route collisions must fail validation');
assert.match(collisionResult.stderr, /output route "\/guides\/collision\/" collides/);
assert.match(collisionResult.stderr, /output route "\/guides\/collision\.md" collides/);

console.log('Invalid metadata and output route collisions are rejected.');
