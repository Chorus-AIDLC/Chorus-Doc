import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

// Locale registry — the non-root path-prefix locales that every English content
// page must be translated into. Keep in sync with `scripts/validate-content.mjs`
// and `astro.config.mjs`. `en` is the unprefixed root and is the source of truth
// for which pages must exist in each locale.
const PREFIX_LOCALES = ['zh', 'ja', 'ko'];

// Pages that are intentionally published in a single locale. Each entry is an
// English source path (relative to the content root). The entry must be listed
// explicitly so the exclusion stays visible rather than silently weakening the
// check. Starlight fallback-emits an untranslated page as English at its
// localized route, so `docs:check` can go green with whole sections missing —
// this coverage check is what makes a missing translation fail loudly.
const SINGLE_LOCALE_ALLOWLIST = new Set([
  // The missing-translation probe: it is deliberately English-only and exercises
  // the language-switch fallback, so it must be excluded or it defeats itself.
  'guides/locale-fallback-fixture.mdx',
]);

const contentRoot = path.resolve(
  new URL('../src/content/docs', import.meta.url).pathname,
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

const relativePaths = (await collectFiles(contentRoot)).map((file) =>
  path.relative(contentRoot, file).split(path.sep).join('/'),
);
const present = new Set(relativePaths);

// English content pages are those whose first path segment is not a prefix
// locale directory (zh/ja/ko).
const englishPages = relativePaths.filter(
  (relative) => !PREFIX_LOCALES.includes(relative.split('/')[0]),
);

const missing = [];
for (const englishPage of englishPages) {
  if (SINGLE_LOCALE_ALLOWLIST.has(englishPage)) continue;
  for (const locale of ['ja', 'ko']) {
    const counterpart = `${locale}/${englishPage}`;
    if (!present.has(counterpart)) {
      missing.push({ englishPage, locale, counterpart });
    }
  }
}

if (missing.length > 0) {
  const details = missing
    .map(
      ({ englishPage, locale, counterpart }) =>
        `  - ${englishPage} has no ${locale} counterpart (expected ${counterpart})`,
    )
    .join('\n');
  console.error(
    `Translation coverage failed — ${missing.length} missing counterpart(s):\n${details}\n` +
      'Every English content page must have a ja and a ko translation at the matching ' +
      'route stem. Add the missing file, or add the English page to ' +
      'SINGLE_LOCALE_ALLOWLIST in tests/locale-coverage.mjs if it is intentionally ' +
      'single-locale.',
  );
  process.exitCode = 1;
} else {
  assert.ok(englishPages.length > 0, 'expected to find English content pages');
  console.log(
    `Translation coverage verified — ${englishPages.length} English page(s) each have ja and ko counterparts ` +
      `(${SINGLE_LOCALE_ALLOWLIST.size} intentional single-locale exclusion(s)).`,
  );
}
