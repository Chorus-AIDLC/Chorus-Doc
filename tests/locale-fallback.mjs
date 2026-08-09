import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const fixture = await readFile(
  new URL('../dist/guides/locale-fallback-fixture/index.html', import.meta.url),
  'utf8',
);
const translated = await readFile(
  new URL('../dist/guides/getting-started/index.html', import.meta.url),
  'utf8',
);

// Astro may HTML-encode the double quotes as either &#34; or &quot; depending on
// its compiler version; both are equivalent, so match either encoding.
const q = '(?:&#34;|&quot;)';
assert.match(
  fixture,
  new RegExp(
    `data-locale-fallbacks="\\{${q}zh${q}:${q}/zh/${q},${q}ja${q}:${q}/ja/${q},${q}ko${q}:${q}/ko/${q}\\}"`,
  ),
  'the English-only fixture must declare /zh/, /ja/, and /ko/ as its fallbacks',
);
assert.match(
  translated,
  /data-locale-fallbacks="\{\}"/,
  'a page translated into every locale must not declare a locale fallback',
);

console.log('Locale fallback contract verified.');
