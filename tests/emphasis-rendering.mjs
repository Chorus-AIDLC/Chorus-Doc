import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// CommonMark flanking rules can leave ** literal next to CJK text/punctuation,
// including around inline code. Validate rendered prose, not source Markdown.
// Intentional Markdown examples belong in code spans or fenced code blocks.
const packageRoot = path.resolve(import.meta.dirname, '..');
const distFlag = process.argv.indexOf('--dist');
const dist = distFlag === -1
  ? path.join(packageRoot, 'dist')
  : path.resolve(process.argv[distFlag + 1]);

function hasLeakedEmphasis(body) {
  const prose = body
    .replace(/<(pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(?:42|x2a);/gi, '*');
  return prose.includes('**');
}

// Negative and exclusion contracts, including the Korean Docker regression.
assert.ok(hasLeakedEmphasis('<p>**<code>image</code>**을 제공합니다.</p>'));
assert.ok(hasLeakedEmphasis('<p>**文本。**后续文字</p>'));
assert.ok(hasLeakedEmphasis('<p>&#42;&#42;broken&#42;&#42;</p>'));
assert.ok(!hasLeakedEmphasis('<p><strong>文本</strong>。后续文字</p>'));
assert.ok(!hasLeakedEmphasis('<p><strong><code>image</code></strong>을 제공합니다.</p>'));
assert.ok(!hasLeakedEmphasis('<pre><code>**example**</code></pre><p><code>**</code></p>'));
assert.ok(!hasLeakedEmphasis('<script>/** comment */</script><!-- ** -->'));

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? collectHtml(target) : entry.name === 'index.html' ? [target] : [];
  }));
  return files.flat();
}

const leaks = [];
let pages = 0;
for (const file of await collectHtml(dist)) {
  const html = await readFile(file, 'utf8');
  const start = html.indexOf('<main data-pagefind-body');
  if (start === -1) continue;
  const end = html.indexOf('</main>', start);
  assert.notEqual(end, -1, `${file}: missing closing main element`);
  pages += 1;
  if (hasLeakedEmphasis(html.slice(start, end))) {
    leaks.push(path.relative(dist, file).split(path.sep).join('/'));
  }
}
assert.ok(pages > 0, 'No built documentation pages found; run astro build first.');
assert.deepEqual(leaks, [], `Literal ** leaked into rendered prose: ${leaks.join(', ')}`);
console.log(`Emphasis rendering verified: ${pages} pages, no literal ** outside code.`);
