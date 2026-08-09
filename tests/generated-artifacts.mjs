import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { AGENT_DOC_ROUTES } from '../src/lib/agent-docs-contract.mjs';

const packageRoot = path.resolve(import.meta.dirname, '..');
const distFlag = process.argv.indexOf('--dist');
const dist =
  distFlag === -1 ? path.join(packageRoot, 'dist') : path.resolve(process.argv[distFlag + 1]);
const emittedManifest = JSON.parse(
  await readFile(path.join(packageRoot, '.astro/emitted-docs-route-manifest.json'), 'utf8'),
);

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

const llms = await readFile(path.join(dist, 'llms.txt'), 'utf8');
assert.match(llms, /^# Chorus Docs/m);
const moduleRoutes = [
  ...Object.values(AGENT_DOC_ROUTES.roleEntrypoints),
  ...Object.values(AGENT_DOC_ROUTES.sharedGuides),
  ...Object.values(AGENT_DOC_ROUTES.platforms),
].flatMap(({ en, zh }) => [en, zh]);

const emittedHtmlRoutes = [];
for (const htmlPath of (await collectFiles(dist)).filter(
  (file) => path.basename(file) === 'index.html',
)) {
  const html = await readFile(htmlPath, 'utf8');
  if (!/<main data-pagefind-body\b/.test(html)) continue;
  const relativeDirectory = path.relative(dist, path.dirname(htmlPath));
  emittedHtmlRoutes.push(
    relativeDirectory ? `/${relativeDirectory.split(path.sep).join('/')}/` : '/',
  );
}

assert.deepEqual(
  emittedManifest.map(({ htmlRoute }) => htmlRoute).toSorted(),
  emittedHtmlRoutes.toSorted(),
  'emitted manifest must cover every built documentation HTML route',
);

for (const entry of emittedManifest) {
  const markdown = await readFile(path.join(dist, entry.markdownRoute.slice(1)), 'utf8');
  assert.ok(markdown.length > 0, `empty Markdown mirror: ${entry.markdownRoute}`);
  assert.doesNotMatch(markdown, /^---$/m, `frontmatter leaked into ${entry.markdownRoute}`);
  assert.match(llms, new RegExp(entry.markdownRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const html = await readFile(path.join(dist, entry.htmlRoute.slice(1), 'index.html'), 'utf8');
  assert.match(html, /<main data-pagefind-body\b/);
}

for (const htmlRoute of moduleRoutes) {
  const markdownRoute = `${htmlRoute.slice(0, -1)}.md`;
  const entry = emittedManifest.find((candidate) => candidate.htmlRoute === htmlRoute);
  assert.ok(entry, `${htmlRoute}: module HTML route missing from emitted manifest`);
  assert.equal(entry.markdownRoute, markdownRoute, `${htmlRoute}: unstable Markdown route`);
  const markdown = await readFile(path.join(dist, markdownRoute.slice(1)), 'utf8');
  assert.ok(markdown.trim(), `${markdownRoute}: generated Markdown is empty`);
  assert.match(
    llms,
    new RegExp(markdownRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    `${markdownRoute}: missing from llms.txt`,
  );
}

for (const locale of ['zh', 'ja', 'ko']) {
  assert.ok(
    emittedManifest.some(
      ({ htmlRoute, markdownRoute }) =>
        htmlRoute === `/${locale}/guides/locale-fallback-fixture/` &&
        markdownRoute === `/${locale}/guides/locale-fallback-fixture.md`,
    ),
    `the ${locale} fallback of the English-only fixture must be represented in the emitted manifest`,
  );
}

const fallbackHtml = await readFile(
  path.join(dist, 'guides/locale-fallback-fixture/index.html'),
  'utf8',
);
// The English-only fixture has no counterpart in any other locale, so every
// non-English alternate must be stripped (this is what exercises the hreflang
// reverse map for ko-KR / ja as well as zh-CN).
assert.doesNotMatch(fallbackHtml, /hreflang="zh-CN"/);
assert.doesNotMatch(fallbackHtml, /hreflang="ja"/);
assert.doesNotMatch(fallbackHtml, /hreflang="ko-KR"/);

// A page present in all four locales must keep every locale alternate — none of
// the ja / ko / zh reverse-map branches may drop its own hreflang.
const fullyTranslatedHtml = await readFile(
  path.join(dist, 'guides/getting-started/index.html'),
  'utf8',
);
for (const hreflang of ['x-default', 'en', 'zh-CN', 'ja', 'ko-KR']) {
  assert.match(
    fullyTranslatedHtml,
    new RegExp(`hreflang="${hreflang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
    `getting-started must keep its ${hreflang} alternate`,
  );
}

const sitemap = await readFile(path.join(dist, 'sitemap-0.xml'), 'utf8');
assert.doesNotMatch(sitemap, /\.md<\/loc>/);
assert.doesNotMatch(sitemap, /pagefind/);
assert.doesNotMatch(sitemap, /(?:zh|ja|ko)\/guides\/locale-fallback-fixture/);

console.log('Generated Markdown, llms.txt, SEO, and Pagefind scope verified.');
