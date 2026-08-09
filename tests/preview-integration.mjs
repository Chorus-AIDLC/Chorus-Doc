import { chromium } from '@playwright/test';
import process from 'node:process';

const baseUrl = new URL(process.env.DOCS_PREVIEW_URL ?? 'http://127.0.0.1:4322/');
const routes = [
  '/',
  '/zh/',
  '/ja/',
  '/ko/',
  '/guides/getting-started/',
  '/zh/guides/getting-started/',
  '/ja/guides/getting-started/',
  '/ko/guides/getting-started/',
  '/reference/workflow/',
  '/zh/reference/workflow/',
];
const resources = [
  ['/index.md', '## The reversed conversation'],
  ['/zh.md', '## 反向对话'],
  ['/ja.md', '## 反転した対話'],
  ['/ko.md', '## 뒤집힌 대화'],
  ['/guides/getting-started.md', '## Install and start Chorus'],
  ['/zh/guides/getting-started.md', '## 安装并启动 Chorus'],
  ['/ja/guides/getting-started.md', '## Chorus をインストールして起動する'],
  ['/ko/guides/getting-started.md', '## Chorus 설치하고 실행하기'],
  ['/reference/workflow.md', '## Task states'],
  ['/zh/reference/workflow.md', '## Task 状态'],
  ['/llms.txt', '# Chorus Docs'],
  ['/sitemap-index.xml', 'sitemapindex'],
  ['/sitemap-0.xml', 'urlset'],
];

for (const [route, expected] of resources) {
  const response = await fetch(new URL(route, baseUrl));
  const body = await response.text();
  if (!response.ok || !body.includes(expected)) {
    throw new Error(`${route} did not return the expected production artifact`);
  }
}

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    for (const route of routes) {
      const page = await context.newPage();
      await page.goto(new URL(route, baseUrl).href, { waitUntil: 'networkidle' });

      const layout = await page.evaluate(() => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width && rect.height;
        };
        const controls = [...document.querySelectorAll('header button, header select, header a')]
          .filter(visible)
          .map((element) => {
            const { left, right, top, bottom } = element.getBoundingClientRect();
            return { left, right, top, bottom };
          });
        const overlaps = controls.some((left, index) =>
          controls.slice(index + 1).some(
            (right) =>
              Math.min(left.right, right.right) - Math.max(left.left, right.left) > 2 &&
              Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top) > 2,
          ),
        );
        const wideContent = [...document.querySelectorAll('pre, table, img')].some((element) => {
          const rect = element.getBoundingClientRect();
          return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1;
        });
        return {
          hasMain: Boolean(document.querySelector('main')),
          hasNavigation:
            Boolean(document.querySelector('nav')) ||
            [...document.querySelectorAll('a')].some((link) =>
              /\/(?:zh\/)?(?:guides|reference)\//.test(link.getAttribute('href') ?? ''),
            ),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          overlaps,
          wideContent,
        };
      });
      if (
        !layout.hasMain ||
        !layout.hasNavigation ||
        layout.overflow ||
        layout.overlaps ||
        layout.wideContent
      ) {
        throw new Error(`${route} failed layout checks at ${viewport.width}px: ${JSON.stringify(layout)}`);
      }

      let foundVisibleFocus = false;
      for (let count = 0; count < 24; count += 1) {
        await page.keyboard.press('Tab');
        foundVisibleFocus ||= await page.evaluate(() => {
          const active = document.activeElement;
          if (!(active instanceof HTMLElement)) return false;
          const style = getComputedStyle(active);
          return style.outlineStyle !== 'none' || style.boxShadow !== 'none';
        });
      }
      if (!foundVisibleFocus) throw new Error(`${route} has no visible keyboard focus`);
      await page.close();
    }

    for (const test of [
      { route: '/guides/getting-started/', query: 'workflow', result: /Workflow reference/i },
      { route: '/zh/guides/getting-started/', query: '工作流', result: /工作流参考/ },
      // ja/ko reference pages are still English-fallback at this stage, so search a
      // distinctive term from the translated getting-started page and expect that page.
      { route: '/ja/guides/getting-started/', query: 'サインイン', result: /はじめに/ },
      { route: '/ko/guides/getting-started/', query: '로그인', result: /시작하기/ },
    ]) {
      const page = await context.newPage();
      await page.goto(new URL(test.route, baseUrl).href, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: /Search|搜索|検索|검색/ }).click();
      await page.locator('input[type="text"]:visible').fill(test.query);
      await page.getByRole('link', { name: test.result }).first().waitFor();
      await page.close();
    }

    for (const target of [
      '/zh/guides/getting-started/',
      '/ja/guides/getting-started/',
      '/ko/guides/getting-started/',
    ]) {
      const localePage = await context.newPage();
      await localePage.goto(new URL('/guides/getting-started/', baseUrl).href);
      const localeSelect = localePage.locator(
        `select:has(option[value="${target}"]):visible`,
      );
      if ((await localeSelect.count()) === 0) {
        await localePage.getByRole('button', { name: 'Menu' }).click();
      }
      await localeSelect.selectOption(target);
      await localePage.waitForURL(`**${target}`);
      await localePage.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.log('Production preview route, search, locale, focus, and layout matrix passed.');
