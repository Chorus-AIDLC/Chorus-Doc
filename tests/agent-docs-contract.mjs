import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  AGENT_DOC_ROUTES,
  AGENT_SUPPORT_MATRIX,
  SAFE_EXAMPLE_VALUES,
  SUPPORT_LEVELS,
} from '../src/lib/agent-docs-contract.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(repositoryRoot, 'src/content/docs');
const sourceLabel = (file) => path.relative(repositoryRoot, file);
const routeToSource = (route) =>
  path.join(contentRoot, `${route.replace(/^\/|\/$/g, '')}.mdx`);
const readRoute = (route) => readFile(routeToSource(route), 'utf8');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const proseOnly = (content) =>
  content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '')
    .replace(/<[^>]+>/g, '');
const assertMatch = (content, pattern, file, contract) =>
  assert.match(content, pattern, `${sourceLabel(file)}: ${contract}`);

const expectedIds = ['claude-code', 'codex', 'kiro', 'pi', 'openclaw', 'opencode', 'generic-mcp'];
assert.deepEqual(AGENT_SUPPORT_MATRIX.map(({ id }) => id), expectedIds);
assert.deepEqual(
  AGENT_SUPPORT_MATRIX.map(({ support }) => support),
  [
    SUPPORT_LEVELS.FIRST_PARTY,
    SUPPORT_LEVELS.FIRST_PARTY,
    SUPPORT_LEVELS.FIRST_PARTY,
    SUPPORT_LEVELS.FIRST_PARTY,
    SUPPORT_LEVELS.FIRST_PARTY,
    SUPPORT_LEVELS.COMMUNITY,
    SUPPORT_LEVELS.LIMITED,
  ],
);

for (const agent of AGENT_SUPPORT_MATRIX) {
  const routes = AGENT_DOC_ROUTES.platforms[agent.id];
  assert.equal(routes.zh, `/zh${routes.en}`);
  for (const capability of Object.values(agent.capabilities)) {
    assert.equal(typeof capability.supported, 'boolean');
    // Each capability cites evidence paths in the Chorus application repository
    // (its source of truth). Those files do not live in this standalone docs
    // repo, so assert only that the citation is present, not that it resolves here.
    assert.ok(capability.evidence.length > 0);
  }
}

const guideSlugs = [
  'getting-started',
  'administrator-setup',
  'operator-onboarding',
  'daemon-operations',
  'remote-control',
  'session-recovery',
  'troubleshooting',
];
const platformIds = ['index', ...expectedIds];
const documentationFiles = [
  ...guideSlugs.flatMap((slug) => [
    path.join(contentRoot, `guides/${slug}.mdx`),
    path.join(contentRoot, `zh/guides/${slug}.mdx`),
  ]),
  ...platformIds.flatMap((id) => [
    path.join(contentRoot, `reference/agents/${id}.mdx`),
    path.join(contentRoot, `zh/reference/agents/${id}.mdx`),
  ]),
];

const authorMeta =
  /captured|capture process|real browser|local Chorus|fictitious|synthetic|redact(?:ed|ion)?|not pressed|not invoked|来自.*浏览器|截图时|虚构|合成|脱敏|未点击|未执行/i;
for (const file of documentationFiles) {
  const content = await readFile(file, 'utf8');
  assert.doesNotMatch(content, /\/home\/ubuntu|amazon\.dev|cho_(?!REDACTED)[A-Za-z0-9_-]{8,}/i);
  for (const caption of content.matchAll(/caption="([^"]+)"/g)) {
    assert.doesNotMatch(caption[1], authorMeta, `${sourceLabel(file)}: captions describe product state, not how screenshots were made`);
  }
}

const quickStartEnPath = path.join(contentRoot, 'guides/getting-started.mdx');
const quickStartZhPath = path.join(contentRoot, 'zh/guides/getting-started.mdx');
const [quickStartEn, quickStartZh] = await Promise.all([
  readFile(quickStartEnPath, 'utf8'),
  readFile(quickStartZhPath, 'utf8'),
]);
for (const [content, file] of [
  [quickStartEn, quickStartEnPath],
  [quickStartZh, quickStartZhPath],
]) {
  assertMatch(
    content,
    /npm install --global (?:\\\n\s*)?@chorus-aidlc\/chorus/,
    file,
    'official npm installation',
  );
  assertMatch(content, /^chorus$/m, file, 'launch the installed package');
  assertMatch(content, /http:\/\/localhost:8637/, file, 'local browser address');
  assertMatch(content, /DEFAULT_USER=/, file, 'user-defined administrator account');
  assertMatch(content, /DEFAULT_PASSWORD=/, file, 'user-defined administrator password');
  assert.doesNotMatch(content, /admin@chorus\.local|Password:\s*`?chorus`?/i);
  assertMatch(content, /Setup Guide/, file, 'in-product setup guide');
  assert.doesNotMatch(content, /pnpm|dev:local|git clone|repository root/i);
}

const chineseMixedTerms =
  /\b(?:Idea|Proposal|Task|Project|Document|Session|Turn|Admin preset|Developer preset)\b/;
for (const file of documentationFiles.filter((file) => file.includes('/zh/'))) {
  const content = proseOnly(await readFile(file, 'utf8'));
  assert.doesNotMatch(content, chineseMixedTerms, `${sourceLabel(file)}: translate workflow terms in Chinese prose`);
}

const daemonPlatforms = ['claude-code', 'codex', 'kiro'];
for (const id of daemonPlatforms) {
  for (const locale of ['', 'zh/']) {
    const file = path.join(contentRoot, `${locale}reference/agents/${id}.mdx`);
    const content = await readFile(file, 'utf8');
    assertMatch(
      content,
      new RegExp(`operator-onboarding/[\\s\\S]*${id}|${id}[\\s\\S]*operator-onboarding/`),
      file,
      'delegate shared runtime setup to the operator guide',
    );
  }
}

for (const route of ['/guides/operator-onboarding/', '/zh/guides/operator-onboarding/']) {
  const file = routeToSource(route);
  const content = await readFile(file, 'utf8');
  assertMatch(content, /npm install --global @chorus-aidlc\/chorus/, file, 'centralized Chorus CLI installation');
  assertMatch(content, /chorus agents add/, file, 'primary one-command agent configuration');
  assertMatch(content, /chorus login/, file, 'credential-only daemon authentication alternative');
  assertMatch(content, /chorus daemon --agent claude-code/, file, 'foreground verification before service installation');
}

for (const id of ['pi', 'opencode', 'generic-mcp']) {
  for (const locale of ['', 'zh/']) {
    const file = path.join(contentRoot, `${locale}reference/agents/${id}.mdx`);
    const content = await readFile(file, 'utf8');
    assert.doesNotMatch(content, /chorus daemon (?:install|start|restart)/, `${sourceLabel(file)}: unsupported daemon instructions`);
  }
}

const [matrixEnglish, matrixChinese] = await Promise.all([
  readFile(path.join(contentRoot, 'reference/agents/index.mdx'), 'utf8'),
  readFile(path.join(contentRoot, 'zh/reference/agents/index.mdx'), 'utf8'),
]);
for (const agent of AGENT_SUPPORT_MATRIX) {
  assert.match(matrixEnglish, new RegExp(escapeRegExp(agent.name)));
}
for (const heading of ['Best for', 'Remote start', 'Persistent runtime']) {
  assert.match(matrixEnglish, new RegExp(heading, 'i'));
}
for (const heading of ['适合', '远程启动', '持续运行']) {
  assert.match(matrixChinese, new RegExp(heading));
}

const screenshotContracts = [
  ['guides/administrator-setup.mdx', 'credential-permissions.webp', /Developer preset|credential permissions/i],
  ['guides/operator-onboarding.mdx', 'connection-online.webp', /online|working directory/i],
  ['guides/remote-control.mdx', 'remote-wake.webp', /conversation|working directory|start/i],
  ['guides/session-recovery.mdx', 'session-control.webp', /running|turn|elapsed|Interrupt/i],
];
for (const [sourcePath, assetName, statePattern] of screenshotContracts) {
  const file = path.join(contentRoot, sourcePath);
  const content = await readFile(file, 'utf8');
  assertMatch(content, new RegExp(`src="/images/agent-operations/${escapeRegExp(assetName)}"`), file, 'screenshot asset');
  assertMatch(content, /width=\{1440\}/, file, 'stable screenshot width');
  assertMatch(content, /height=\{900\}/, file, 'stable screenshot height');
  const caption = content.match(/caption="([^"]+)"/)?.[1] ?? '';
  assert.ok(caption.length >= 24, `${sourceLabel(file)}: caption must explain the visible state`);
  assert.match(caption, statePattern, `${sourceLabel(file)}: caption must identify the user-visible state`);

  const asset = path.join(repositoryRoot, 'public/images/agent-operations', assetName);
  const metadata = await sharp(asset).metadata();
  assert.deepEqual(
    { format: metadata.format, width: metadata.width, height: metadata.height },
    { format: 'webp', width: 1440, height: 900 },
  );
}

assert.equal(SAFE_EXAMPLE_VALUES.chorusUrl, 'https://chorus.example.com');
assert.equal(SAFE_EXAMPLE_VALUES.apiKey, 'cho_REDACTED');
assert.equal(SAFE_EXAMPLE_VALUES.cwd, '/home/demo/workspace');

for (const routes of [
  ...Object.values(AGENT_DOC_ROUTES.roleEntrypoints),
  ...Object.values(AGENT_DOC_ROUTES.sharedGuides),
  ...Object.values(AGENT_DOC_ROUTES.platforms),
]) {
  assert.equal(routes.zh, `/zh${routes.en}`);
  for (const route of [routes.en, routes.zh]) {
    const file = routeToSource(route);
    const content = await readRoute(route);
    assertMatch(content, new RegExp(`route: ${escapeRegExp(route)}`), file, 'stable frontmatter route');
  }
}

console.log('Agent documentation user journey, platform support, localization, routes, and screenshots verified.');
