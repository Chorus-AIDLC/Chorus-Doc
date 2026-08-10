import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const pagefindRoot = path.resolve(import.meta.dirname, '../dist/pagefind');
const server = createServer(async (request, response) => {
  try {
    const file = path.join(pagefindRoot, new URL(request.url, 'http://localhost').pathname);
    const content = await readFile(file);
    if (file.endsWith('.pagefind')) response.setHeader('content-type', 'application/wasm');
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const basePath = `http://127.0.0.1:${address.port}/`;

const pagefind = await import(
  pathToFileURL(path.join(pagefindRoot, 'pagefind.js')).href
);

try {
  for (const fixture of [
    {
      language: 'en',
      term: 'Setup Guide',
      title: 'Get started',
      url: '/guides/getting-started/',
      excerpt: 'Setup Guide',
    },
    {
      language: 'zh-cn',
      term: '解除阻塞',
      title: '工作流参考',
      url: '/zh/reference/workflow/',
      excerpt: '解除阻塞',
    },
    {
      language: 'ja',
      term: 'サインイン',
      title: 'はじめに',
      url: '/ja/guides/getting-started/',
      excerpt: 'サインイン',
    },
    {
      language: 'ko-kr',
      term: '로그인',
      title: '시작하기',
      url: '/ko/guides/getting-started/',
      excerpt: '로그인',
    },
  ]) {
    globalThis.document = {
      querySelector: () => ({ getAttribute: () => fixture.language }),
    };
    const index = pagefind.createInstance({ basePath });
    await index.init();
    const search = await index.search(fixture.term);
    const results = await Promise.all(search.results.map((result) => result.data()));
    const match = results.find(
      (result) => new URL(result.url, 'https://doc.chorus-ai.dev').pathname === fixture.url,
    );
    assert.ok(
      match,
      `Pagefind did not return ${fixture.url} for "${fixture.term}" (got ${results.map(({ url }) => url).join(', ')})`,
    );
    assert.equal(match.meta.title, fixture.title);
    assert.match(match.excerpt.replace(/<[^>]+>/g, ''), new RegExp(fixture.excerpt, 'i'));
    await index.destroy();
  }
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

console.log('Representative English, Chinese, Japanese, and Korean Pagefind searches verified.');
