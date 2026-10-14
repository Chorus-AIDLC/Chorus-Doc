import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const dist = path.resolve('dist');
const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = path.join(dist, pathname);
    if ((await stat(file).catch(() => null))?.isDirectory()) file = path.join(file, 'index.html');
    await stat(file);
    response.writeHead(200, {
      'content-type': contentTypes[path.extname(file)] ?? 'application/octet-stream',
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    for (const route of [
      '/guides/getting-started/',
      '/zh/guides/getting-started/',
      '/ja/guides/getting-started/',
      '/ko/guides/getting-started/',
      '/guides/openspec-mode/',
      '/zh/guides/openspec-mode/',
      '/ja/guides/openspec-mode/',
      '/ko/guides/openspec-mode/',
      '/guides/spec-lite-mode/',
      '/zh/guides/spec-lite-mode/',
      '/ja/guides/spec-lite-mode/',
      '/ko/guides/spec-lite-mode/',
      '/reference/agents/hermes/',
      '/zh/reference/agents/hermes/',
      '/ja/reference/agents/hermes/',
      '/ko/reference/agents/hermes/',
      '/reference/agents/trae/',
      '/zh/reference/agents/trae/',
      '/ja/reference/agents/trae/',
      '/ko/reference/agents/trae/',
      '/guides/deploy-local/',
      '/zh/guides/deploy-local/',
      '/ja/guides/deploy-local/',
      '/ko/guides/deploy-local/',
    ]) {
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${address.port}${route}`, {
        waitUntil: 'networkidle',
      });

      // Wait for web fonts and Expressive Code's overflow observer to settle.
      // Expressive Code adds `tabindex="0"` to a code block only once its
      // ResizeObserver sees the block overflow; with CJK fonts loading after
      // `networkidle`, layout can shift and briefly leave an overflowing
      // `<pre>` without the attribute. Running axe before that settles produces
      // an intermittent `scrollable-region-focusable` violation. Wait until no
      // overflowing code block is missing its focus affordance.
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      await page.locator('main details').evaluateAll((details) => {
        for (const disclosure of details) disclosure.open = true;
      });
      await page
        .waitForFunction(
          () =>
            [...document.querySelectorAll('.expressive-code figure > pre')].every(
              (pre) =>
                pre.scrollWidth <= pre.clientWidth ||
                pre.hasAttribute('tabindex'),
            ),
          undefined,
          { timeout: 5000 },
        )
        .catch(() => {});

      const structure = await page.evaluate(() => {
        const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(
          (heading) => Number(heading.tagName.slice(1)),
        );
        return {
          hasMain: Boolean(document.querySelector('main')),
          hasNav: Boolean(document.querySelector('nav')),
          imagesWithoutAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
          headingSkip: headings.some(
            (level, index) => index > 0 && level > headings[index - 1] + 1,
          ),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });
      if (!structure.hasMain || !structure.hasNav || structure.imagesWithoutAlt || structure.headingSkip) {
        throw new Error(`${route} has invalid landmarks, headings, or image alternatives`);
      }
      if (structure.overflow) throw new Error(`${route} overflows at ${viewport.width}px`);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const severe = results.violations.filter(({ impact }) =>
        ['critical', 'serious'].includes(impact),
      );
      if (severe.length) {
        throw new Error(
          `${route} accessibility violations: ${severe.map(({ id }) => id).join(', ')}`,
        );
      }

      const reachable = [];
      let visibleFocus = false;
      let navigationReachable = false;
      let localeReachable = false;
      for (let count = 0; count < 40; count += 1) {
        await page.keyboard.press('Tab');
        const state = await page.evaluate(() => {
          const active = document.activeElement;
          if (!(active instanceof HTMLElement)) return { label: '', visible: false };
          const style = getComputedStyle(active);
          return {
            label:
              active.getAttribute('aria-label') ||
              active.getAttribute('title') ||
              active.textContent?.trim() ||
              active.tagName,
            navigation:
              active.matches('a[href]') &&
              (Boolean(active.closest('nav')) ||
                /^\/(?:zh\/|ja\/|ko\/)?(?:guides|reference)\//.test(active.getAttribute('href') ?? '')),
            locale: active.matches('starlight-lang-select select'),
            visible:
              style.outlineStyle !== 'none' ||
              (style.boxShadow !== 'none' && style.boxShadow !== ''),
          };
        });
        reachable.push(state.label);
        visibleFocus ||= state.visible;
        navigationReachable ||= state.navigation;
        localeReachable ||= state.locale;
      }
      if (!reachable.some((label) => /search|搜索|検索|검색/i.test(label))) {
        throw new Error(`${route} search is not keyboard reachable`);
      }
      const menuButton = page.locator('starlight-menu-button button');
      if (!localeReachable && await menuButton.isVisible()) {
        await menuButton.focus();
        await page.keyboard.press('Enter');
        const tabBudget = await page.locator('a[href], button, select, input, summary, [tabindex]').count();
        for (let count = 0; count < tabBudget && !localeReachable; count += 1) {
          await page.keyboard.press('Tab');
          localeReachable = await page.evaluate(() =>
            document.activeElement?.matches('starlight-lang-select select'),
          );
        }
        await menuButton.focus();
        await page.keyboard.press('Enter');
      }
      if (!localeReachable) {
        throw new Error(`${route} locale control is not keyboard reachable`);
      }
      if (!navigationReachable) {
        throw new Error(`${route} navigation is not keyboard reachable`);
      }
      if (!visibleFocus) throw new Error(`${route} has no visible keyboard focus treatment`);
      for (const summary of await page.locator('main details > summary').all()) {
        await summary.focus();
        await page.keyboard.press('Enter');
        if (await summary.evaluate((element) => element.parentElement.open)) {
          throw new Error(`${route} disclosure did not close from the keyboard`);
        }
        await page.keyboard.press('Enter');
        if (!await summary.evaluate((element) => element.parentElement.open)) {
          throw new Error(`${route} disclosure did not open from the keyboard`);
        }
      }
      await page.close();
    }
    await context.close();
  }
  console.log('Representative four-locale responsive, keyboard, and accessibility checks passed.');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
