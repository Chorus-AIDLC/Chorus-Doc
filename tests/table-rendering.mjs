import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// Regression guard for GFM table rendering (idea 6f13a682).
//
// All docs content is .mdx. Astro's built-in GitHub-Flavored Markdown is not
// applied to the MDX pipeline unless a remark plugin is wired in explicitly, so
// a config regression can silently turn every table back into literal `| … |`
// text on all 197 pages at once. This test reads the built dist/ HTML (the
// repo's ground truth for rendering — the dev server and the .md mirrors are
// NOT reliable here) and fails the build if tables stop rendering.
//
// MAINTENANCE: SPOT_CHECK_PAGES and MIN_TABLE_PAGES are deliberately hardcoded.
// If you legitimately add or remove a table (or a whole page that has one),
// update them to match — a failure here after such an edit means "update this
// test", not "the site is broken". MIN_TABLE_PAGES is a floor (with slack below
// the current baseline), not an exact count, so adding tables never trips it.

const packageRoot = path.resolve(import.meta.dirname, '..');
const distFlag = process.argv.indexOf('--dist');
const dist =
  distFlag === -1 ? path.join(packageRoot, 'dist') : path.resolve(process.argv[distFlag + 1]);

// Representative pages that MUST render a real <table>:
// - the originally reported page (a table-scroll-wrapped table);
// - a bare (unwrapped) English Markdown table;
// - one localized page per non-English locale, to prove the fix covers the
//   whole MDX pipeline and not just the root locale.
const SPOT_CHECK_PAGES = [
  'zh/guides/deployment-overview',
  'reference/glossary',
  'ja/guides/deployment-overview',
  'ko/guides/deployment-overview',
];

// Floor for the number of content pages that render at least one <table>.
// Baseline at the time of the fix was 88; 80 leaves headroom for content churn
// while still catching the "tables vanished site-wide" regression (which drops
// this to 0). Raise it only if the real count grows well past this floor.
const MIN_TABLE_PAGES = 80;

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

// The rendered content region for a docs page. Restricting to <main> keeps the
// checks off nav/footer chrome, matching tests/generated-artifacts.mjs.
function mainBody(html) {
  const start = html.indexOf('<main data-pagefind-body');
  if (start === -1) return null;
  const end = html.indexOf('</main>', start);
  return end === -1 ? html.slice(start) : html.slice(start, end);
}

// Strip <pre>…</pre> and <code>…</code> before scanning for leaked table
// syntax: a page may legitimately DISPLAY Markdown table syntax inside a code
// fence or inline code (e.g. a guide teaching table authoring), and that must
// not be mistaken for a table that failed to render.
function stripCode(body) {
  return body
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, '')
    .replace(/<code\b[\s\S]*?<\/code>/gi, '');
}

// A GFM table's header-separator row (e.g. `| --- | :--: |`) leaking as literal
// text is the unambiguous fingerprint of a table that was not parsed.
const LEAKED_SEPARATOR = /\|[ :]*-{3,}[ :]*\|/;

const htmlFiles = (await collectFiles(dist)).filter(
  (file) => path.basename(file) === 'index.html',
);

let tablePages = 0;
const leaks = [];
for (const htmlPath of htmlFiles) {
  const html = await readFile(htmlPath, 'utf8');
  const body = mainBody(html);
  if (body === null) continue; // not a content page (no pagefind main)

  if (/<table[\s>]/.test(body)) tablePages += 1;

  if (LEAKED_SEPARATOR.test(stripCode(body))) {
    leaks.push(`/${path.relative(dist, path.dirname(htmlPath)).split(path.sep).join('/')}/`);
  }
}

// 1. No page may leak an unparsed table separator row in its prose.
assert.equal(
  leaks.length,
  0,
  `GFM tables are not rendering — literal separator rows leaked on: ${leaks.join(', ')}`,
);

// 2. Tables must render site-wide, not just on one page.
assert.ok(
  tablePages >= MIN_TABLE_PAGES,
  `only ${tablePages} page(s) render <table> (expected >= ${MIN_TABLE_PAGES}) — GFM table rendering likely regressed`,
);

// 3. Each representative page must render a real <table>. The reported page
//    must additionally keep its table inside the accessible table-scroll wrapper.
for (const route of SPOT_CHECK_PAGES) {
  const html = await readFile(path.join(dist, route, 'index.html'), 'utf8');
  const body = mainBody(html);
  assert.ok(body !== null, `${route}: not a content page (no <main data-pagefind-body>)`);
  assert.match(body, /<table[\s>]/, `${route}: expected a rendered <table>`);
}

const reportedPage = await readFile(
  path.join(dist, 'zh/guides/deployment-overview/index.html'),
  'utf8',
);
assert.match(
  reportedPage,
  /class="table-scroll"[\s\S]*?<table[\s>]/,
  'zh/guides/deployment-overview: <table> must stay inside the table-scroll wrapper',
);

console.log(`Table rendering verified: ${tablePages} page(s) render <table>, no leaked separators.`);
