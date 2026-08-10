import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const packageRoot = path.resolve(import.meta.dirname, '..');
const contentRoot = path.join(packageRoot, 'src/content/docs');
const outputRoot = path.join(packageRoot, 'dist');
const manifestPath = path.join(packageRoot, '.astro/docs-route-manifest.json');
const emittedManifestPath = path.join(packageRoot, '.astro/emitted-docs-route-manifest.json');
const site = new URL(process.env.DOCS_SITE_URL ?? 'https://doc.chorus-ai.dev');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

// Locale registry — single source of truth for the Node tooling. `en` is the
// unprefixed root; every other locale is a URL path prefix. Keep this in sync
// with `astro.config.mjs` `locales` and `validate-content.mjs`.
const PREFIX_LOCALES = ['zh', 'ja', 'ko'];
// locale -> HTML lang / hreflang (forward). `en` is the default.
const LANG_BY_LOCALE = { zh: 'zh-CN', ja: 'ja', ko: 'ko-KR' };
// hreflang -> locale key (reverse). Inverse of LANG_BY_LOCALE.
const LOCALE_BY_LANG = Object.fromEntries(
  Object.entries(LANG_BY_LOCALE).map(([locale, lang]) => [lang, locale]),
);
const localeStemPattern = new RegExp(`^\\/(?:${PREFIX_LOCALES.join('|')})(?=\\/|$)`);
const localeFromRoute = (route) => {
  const first = route.split('/')[1];
  return PREFIX_LOCALES.includes(first) ? first : 'en';
};

function outputPath(route, kind) {
  if (kind === 'html') return path.join(outputRoot, route.slice(1), 'index.html');
  return path.join(outputRoot, route.slice(1));
}

function stripAuthoringMetadata(source) {
  return source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    .replace(/^import\s+.+?;\s*$/gm, '')
    .replace(/<Screenshot\s+([\s\S]*?)\/>/g, (_, attributes) => {
      const value = (name) =>
        attributes.match(new RegExp(`${name}=["']([^"']+)["']`))?.[1] ?? '';
      const src = value('src');
      const alt = value('alt');
      return src && alt ? `![${alt}](${src})` : '';
    })
    .replace(/^\s+$/gm, '')
    .trimStart();
}

function localeStem(entry) {
  return entry.htmlRoute.replace(localeStemPattern, '') || '/';
}

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

const counterparts = new Map();
for (const entry of manifest) {
  const key = localeStem(entry);
  const locales = counterparts.get(key) ?? new Map();
  locales.set(entry.locale, entry);
  counterparts.set(key, locales);
}

const sourceByRoute = new Map(manifest.map((entry) => [entry.htmlRoute, entry]));
const emittedEntries = [];
const htmlFiles = (await collectFiles(outputRoot))
  .filter((file) => path.basename(file) === 'index.html')
  .toSorted();

for (const htmlPath of htmlFiles) {
  let html = await readFile(htmlPath, 'utf8');
  if (!/<main data-pagefind-body\b/.test(html)) continue;

  const relativeDirectory = path.relative(outputRoot, path.dirname(htmlPath));
  const htmlRoute = relativeDirectory ? `/${relativeDirectory.split(path.sep).join('/')}/` : '/';
  const sourceEntry =
    sourceByRoute.get(htmlRoute) ??
    manifest.find((entry) => entry.htmlRoute === localeStem({ htmlRoute }));
  if (!sourceEntry) {
    throw new Error(`Emitted documentation route has no source mapping: ${htmlRoute}`);
  }

  const entry = {
    ...sourceEntry,
    locale: localeFromRoute(htmlRoute),
    htmlRoute,
    markdownRoute: htmlRoute === '/' ? '/index.md' : `${htmlRoute.slice(0, -1)}.md`,
  };
  emittedEntries.push(entry);

  const expectedCanonical = new URL(entry.htmlRoute, site).href;
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"/>`)) {
    throw new Error(`Missing canonical URL for ${entry.htmlRoute}: ${expectedCanonical}`);
  }

  const available = counterparts.get(localeStem(entry));
  html = html.replace(
    /<link rel="alternate" hreflang="([^"]+)" href="[^"]+"\/>/g,
    (tag, hreflang) => {
      if (hreflang === 'x-default') return available.has('en') ? tag : '';
      const locale = LOCALE_BY_LANG[hreflang] ?? hreflang;
      return available.has(locale) ? tag : '';
    },
  );
  await writeFile(htmlPath, html);

  const source = await readFile(path.join(contentRoot, entry.sourcePath), 'utf8');
  const markdownPath = outputPath(entry.markdownRoute, 'markdown');
  await mkdir(path.dirname(markdownPath), { recursive: true });
  await writeFile(markdownPath, stripAuthoringMetadata(source), 'utf8');
}

await writeFile(emittedManifestPath, `${JSON.stringify(emittedEntries, null, 2)}\n`);

for (const entry of emittedEntries) {
  try {
    await readFile(outputPath(entry.markdownRoute, 'markdown'), 'utf8');
  } catch {
    throw new Error(`Missing Markdown mirror for emitted route ${entry.htmlRoute}`);
  }
}

const markdownLinks = emittedEntries
  .map(
    (entry) =>
      `- [${entry.title}](${new URL(entry.markdownRoute, site).href}): ${entry.description}`,
  )
  .join('\n');
await writeFile(
  path.join(outputRoot, 'llms.txt'),
  `# Chorus Docs\n\n> Guides and reference for building with Chorus.\n\n${markdownLinks}\n`,
  'utf8',
);

const sitemapEntries = manifest.map((entry) => {
  const alternates = counterparts.get(localeStem(entry));
  const links = [...alternates.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([locale, counterpart]) => {
      const hreflang = LANG_BY_LOCALE[locale] ?? 'en';
      return `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${new URL(counterpart.htmlRoute, site).href}"/>`;
    })
    .join('');
  return `<url><loc>${new URL(entry.htmlRoute, site).href}</loc>${links}</url>`;
});
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
  'xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
  sitemapEntries.join('') +
  '</urlset>\n';
await writeFile(path.join(outputRoot, 'sitemap-0.xml'), sitemap, 'utf8');

console.log(`Generated and verified ${emittedEntries.length} emitted documentation artifact sets.`);
