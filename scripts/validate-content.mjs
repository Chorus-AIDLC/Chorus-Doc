import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const manifestFlag = args.indexOf('--manifest');
const manifestPath =
  manifestFlag === -1 ? null : path.resolve(args.splice(manifestFlag, 2)[1] ?? '');
const contentRoot = path.resolve(args[0] ?? 'src/content/docs');

// Locale registry — single source of truth for the Node tooling. `en` is the
// unprefixed root; every other locale is a URL path prefix. Keep this in sync
// with `astro.config.mjs` `locales` and `generate-artifacts.mjs`.
const PREFIX_LOCALES = ['zh', 'ja', 'ko'];
const allowedLocales = new Set(['en', ...PREFIX_LOCALES]);
const routePattern = new RegExp(
  `^\\/(?:(?:${PREFIX_LOCALES.join('|')})\\/)?(?:[a-z0-9-]+\\/)*$`,
);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(target) : target;
    }),
  );
  return files.flat().filter((file) => /\.mdx?$/.test(file)).sort();
}

function readScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, 'm'));
  return match?.[1]?.replace(/^['"]|['"]$/g, '') ?? '';
}

function expectedMetadata(file) {
  const relative = path.relative(contentRoot, file).split(path.sep).join('/');
  const withoutExtension = relative.replace(/\.mdx?$/, '');
  const segments = withoutExtension.split('/');
  const docsLocale = PREFIX_LOCALES.includes(segments[0]) ? segments[0] : 'en';
  const routeSegments = docsLocale === 'en' ? [''].concat(segments) : segments;
  const normalized = routeSegments.at(-1) === 'index' ? routeSegments.slice(0, -1) : routeSegments;
  const route = `/${normalized.filter(Boolean).join('/')}${normalized.some(Boolean) ? '/' : ''}`;
  return { docsLocale, route };
}

function validateFile(file, source) {
  const frontmatterMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return ['missing frontmatter'];

  const frontmatter = frontmatterMatch[1];
  const values = Object.fromEntries(
    ['title', 'description', 'docsLocale', 'route'].map((key) => [key, readScalar(frontmatter, key)]),
  );
  const errors = [];

  for (const field of ['title', 'description', 'docsLocale', 'route']) {
    if (!values[field]) errors.push(`missing required metadata "${field}"`);
  }

  if (values.docsLocale && !allowedLocales.has(values.docsLocale)) {
    errors.push(`invalid docsLocale "${values.docsLocale}"`);
  }
  if (values.route && !routePattern.test(values.route)) {
    errors.push(`invalid route "${values.route}"`);
  }

  const expected = expectedMetadata(file);
  if (values.docsLocale && values.docsLocale !== expected.docsLocale) {
    errors.push(`docsLocale must be "${expected.docsLocale}" for this source path`);
  }
  if (values.route && values.route !== expected.route) {
    errors.push(`route must be "${expected.route}" for this source path`);
  }

  return errors;
}

let failed = false;
const manifest = [];
const outputRoutes = new Map();
for (const file of await collectFiles(contentRoot)) {
  const source = await readFile(file, 'utf8');
  const errors = validateFile(file, source);
  for (const error of errors) {
    failed = true;
    console.error(`${file}: ${error}`);
  }

  if (errors.length === 0) {
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const htmlRoute = readScalar(frontmatter, 'route');
    const entry = {
      locale: readScalar(frontmatter, 'docsLocale'),
      sourcePath: path.relative(contentRoot, file).split(path.sep).join('/'),
      htmlRoute,
      markdownRoute: htmlRoute === '/' ? '/index.md' : `${htmlRoute.slice(0, -1)}.md`,
      title: readScalar(frontmatter, 'title'),
      description: readScalar(frontmatter, 'description'),
    };
    for (const route of [entry.htmlRoute, entry.markdownRoute]) {
      const previous = outputRoutes.get(route);
      if (previous) {
        failed = true;
        console.error(`${file}: output route "${route}" collides with ${previous}`);
      } else {
        outputRoutes.set(route, file);
      }
    }
    manifest.push(entry);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  if (manifestPath) {
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  console.log(`Validated content metadata and routes in ${contentRoot}.`);
}
