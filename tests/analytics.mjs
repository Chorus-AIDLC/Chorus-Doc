import assert from 'node:assert/strict';
import { gaHeadTags } from '../src/lib/analytics.mjs';

// Blank / missing ids produce no analytics anywhere.
for (const empty of [undefined, null, '', '   ', '\t\n']) {
  assert.deepEqual(
    gaHeadTags(empty),
    [],
    `a blank measurement id (${JSON.stringify(empty)}) must yield no head tags`,
  );
}

// A real id yields exactly the loader + initializer, both carrying the id.
const id = 'G-ABC123XYZ';
const tags = gaHeadTags(id);
assert.equal(tags.length, 2, 'a measurement id must yield exactly two head entries');

const [loader, initializer] = tags;
assert.equal(loader.tag, 'script');
assert.equal(loader.attrs.async, true, 'the gtag.js loader must be async');
assert.equal(
  loader.attrs.src,
  `https://www.googletagmanager.com/gtag/js?id=${id}`,
  'the loader src must request gtag.js for the configured id',
);
assert.ok(!('content' in loader), 'the loader is a src-only script with no inline content');

assert.equal(initializer.tag, 'script');
assert.ok(!('src' in (initializer.attrs ?? {})), 'the initializer is inline, not a remote script');
assert.match(
  initializer.content,
  /window\.dataLayer = window\.dataLayer \|\| \[\];/,
  'the initializer must set up the dataLayer',
);
assert.match(
  initializer.content,
  /gtag\('js', new Date\(\)\);/,
  'the initializer must record the load time',
);
assert.match(
  initializer.content,
  new RegExp(`gtag\\('config', "${id}"\\);`),
  'the initializer must configure gtag with the exact quoted id',
);

// Surrounding whitespace on an otherwise valid id is trimmed, not treated as blank.
assert.equal(
  gaHeadTags(`  ${id}  `)[0].attrs.src,
  `https://www.googletagmanager.com/gtag/js?id=${id}`,
  'a padded id must be trimmed before use',
);

console.log('GA head-tag builder contract verified.');
