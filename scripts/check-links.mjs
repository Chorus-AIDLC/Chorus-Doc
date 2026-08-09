import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const dist = path.resolve(option('--dist', 'dist'));
const timeoutMs = Number(option('--timeout-ms', '5000'));
const allowlistPath = path.resolve(
  option('--allowlist', 'config/external-link-allowlist.json'),
);
const siteOrigin = 'https://docs.chorus-ai.dev';
const allowlist = JSON.parse(await readFile(allowlistPath, 'utf8'));

for (const [url, reason] of Object.entries(allowlist)) {
  if (!/^https?:\/\//.test(url) || typeof reason !== 'string' || reason.trim().length < 20) {
    throw new Error(`External-link allowlist entry needs an exact URL and rationale: ${url}`);
  }
}

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory() ? collectHtml(target) : /\.html$/.test(entry.name) ? [target] : [];
      }),
    )
  ).flat();
}

function attributes(html) {
  return [...html.matchAll(/\b(?:href|src)=["']([^"'<>]+)["']/gi)].map((match) => match[1]);
}

function outputPath(url) {
  const decoded = decodeURIComponent(url.pathname);
  if (decoded.endsWith('/')) return path.join(dist, decoded, 'index.html');
  const direct = path.join(dist, decoded);
  return path.extname(decoded) ? direct : path.join(direct, 'index.html');
}

async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

const htmlFiles = await collectHtml(dist);
const failures = [];
const external = new Set();
for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  if (!/<main data-pagefind-body\b/.test(html)) continue;
  const relativeFile = path.relative(dist, htmlFile).split(path.sep).join('/');
  const pagePath =
    relativeFile === 'index.html' ? '/' : `/${relativeFile.replace(/index\.html$/, '')}`;
  for (const raw of attributes(html)) {
    if (/^(?:mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
    const url = new URL(raw, new URL(pagePath, siteOrigin));
    if (url.origin !== siteOrigin) {
      external.add(url.href);
      continue;
    }
    const target = outputPath(url);
    if (!(await exists(target))) {
      failures.push(`${path.relative(dist, htmlFile)} -> missing ${url.pathname}`);
      continue;
    }
    if (url.hash && target.endsWith('.html')) {
      const targetHtml = await readFile(target, 'utf8');
      const id = decodeURIComponent(url.hash.slice(1)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`\\bid=["']${id}["']`).test(targetHtml)) {
        failures.push(`${path.relative(dist, htmlFile)} -> missing fragment ${url.pathname}${url.hash}`);
      }
    }
  }
}

for (const href of [...external].sort()) {
  const normalized = href.replace(/\/$/, '');
  const allowed = Object.entries(allowlist).find(
    ([entry]) => entry.replace(/\/$/, '') === normalized,
  );
  if (allowed) {
    console.log(`Allowed external link: ${href} (${allowed[1]})`);
    continue;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response = await fetch(href, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'ChorusDocsLinkCheck/1.0' },
    });
    if (response.status === 405) {
      response = await fetch(href, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'ChorusDocsLinkCheck/1.0' },
      });
    }
    if (!response.ok) failures.push(`${href} -> HTTP ${response.status}`);
  } catch (error) {
    failures.push(`${href} -> ${error.name === 'AbortError' ? `${timeoutMs}ms timeout` : error.message}`);
  } finally {
    clearTimeout(timer);
  }
}

if (failures.length) {
  console.error(`Link check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}
console.log(`Checked links in ${htmlFiles.length} HTML files.`);
