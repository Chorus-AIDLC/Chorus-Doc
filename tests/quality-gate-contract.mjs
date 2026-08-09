import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const packageRoot = path.resolve(import.meta.dirname, '..');
function run(command, args, env = {}) {
  return spawnSync(command, args, {
    cwd: packageRoot,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

const injected = run('node', ['scripts/run-quality-gate.mjs'], {
  DOCS_CHECK_TEST_FAIL_STAGE: 'content and route metadata',
});
assert.notEqual(injected.status, 0, 'an injected gate stage failure must fail docs:check');

const temporary = await mkdtemp(path.join(os.tmpdir(), 'chorus-docs-check-'));
try {
  await writeFile(
    path.join(temporary, 'index.html'),
    '<html><body><main data-pagefind-body><a href="/missing/">broken</a></main></body></html>',
  );
  const links = run('node', ['scripts/check-links.mjs', '--dist', temporary]);
  assert.notEqual(links.status, 0, 'a broken internal link must fail');

  const invalidContent = path.join(temporary, 'content');
  await cp(path.join(packageRoot, 'src/content/docs'), invalidContent, { recursive: true });
  await writeFile(path.join(invalidContent, 'broken.mdx'), '---\ntitle: Broken\n---\n');
  const metadata = run('node', ['scripts/validate-content.mjs', invalidContent]);
  assert.notEqual(metadata.status, 0, 'invalid content metadata must fail');

  const brokenDist = path.join(temporary, 'dist');
  await cp(path.join(packageRoot, 'dist'), brokenDist, { recursive: true });
  await rm(path.join(brokenDist, 'guides/getting-started.md'));
  const artifacts = run('node', ['tests/generated-artifacts.mjs', '--dist', brokenDist]);
  assert.notEqual(artifacts.status, 0, 'a missing Markdown mirror must fail');

  const brokenBuild = path.join(temporary, 'broken-build');
  await mkdir(brokenBuild);
  const build = spawnSync('pnpm', ['exec', 'astro', 'build'], {
    cwd: brokenBuild,
    encoding: 'utf8',
  });
  assert.notEqual(build.status, 0, 'an invalid Astro build must exit non-zero');
} finally {
  await rm(temporary, { recursive: true, force: true });
}

console.log('Quality-gate negative contracts verified.');
